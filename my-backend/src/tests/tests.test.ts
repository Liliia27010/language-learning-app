import request from "supertest";
import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { ObjectId, type Collection } from "mongodb";
import app from "../index.js"; 
import auth, { db } from "../lib/auth.js";

const TEST_USER_ID = new ObjectId();

const mockCollection = {
  aggregate: jest.fn<any>().mockReturnThis(),
  toArray: jest.fn<any>(),
  insertOne: jest.fn<any>(),
  findOne: jest.fn<any>(),
  updateOne: jest.fn<any>(),
  deleteOne: jest.fn<any>(),
};

describe("Test API", () => {
  let currentUserType = "teacher";

  beforeEach(() => {
    jest.spyOn(auth.api, "getSession").mockImplementation(async () => {
        return{
      session: {
        id: "fake-session-id",
        userId: TEST_USER_ID.toString(),
        token: "fake-token",
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      user: {
        id: TEST_USER_ID.toString(),
        email: "test@example.com",
        name: "Test User",
        userType: currentUserType, 
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };    
    });

    jest.spyOn(db, "collection").mockReturnValue(mockCollection as unknown as Collection);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    currentUserType = "teacher"; 
  });

  // GET ALL TESTS
  describe("GET /api/tests", () => {
    it("should return tests for a teacher", async () => {
      currentUserType = "teacher";
      mockCollection.toArray.mockResolvedValue([{ title: "Teacher's Test", sharedBy: "Admin" }]);

      const response = await request(app).get("/api/tests");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.tests)).toBe(true);
    });

    it("should return tests for a student", async () => {
      currentUserType = "student";
      mockCollection.toArray.mockResolvedValue([{ title: "Student's Assigned Test" }]);

      const response = await request(app).get("/api/tests");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 500 if database aggregation fails", async () => {
      mockCollection.aggregate.mockReturnValue({
        toArray: jest.fn<any>().mockRejectedValue(new Error("DB Error")),
      } as any);

      const response = await request(app).get("/api/tests");
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // CREATE TEST
  describe("POST /api/tests", () => {
    it("should allow a teacher to create a test", async () => {
      currentUserType = "teacher";
      const setId = new ObjectId();
      mockCollection.insertOne.mockResolvedValue({ insertedId: new ObjectId() });

      const response = await request(app)
        .post("/api/tests")
        .send({ title: "Math Quiz", setId: setId.toString(), timeLimit: 20 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Math Quiz" })
      );
    });

    it("should block a student from creating a test", async () => {
      currentUserType = "student";
      const response = await request(app)
        .post("/api/tests")
        .send({ title: "Hacker Quiz" });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain("Only teachers");
    });
  });

  // ASSIGN TEST TO STUDENT 
  describe("POST /api/tests/:testId/assign", () => {
    it("should assign a test to a student by email", async () => {
      const testId = new ObjectId();
      const studentId = new ObjectId();

      mockCollection.findOne.mockResolvedValue({ _id: studentId, name: "Student Name" });
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });

      const response = await request(app)
        .post(`/api/tests/${testId}/assign`)
        .send({ email: "student@school.com" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(testId.toString()) },
        { $addToSet: { studentIds: studentId.toString() } }
      );
    });

    it("should return 404 if student email is not found", async () => {
      mockCollection.findOne.mockResolvedValue(null);
      const response = await request(app)
        .post(`/api/tests/${new ObjectId()}/assign`)
        .send({ email: "missing@school.com" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Student not found in database");
    });
  });

  // GET TEST BY ID 
  describe("GET /api/tests/:testId", () => {
    it("should return a test if ID is valid", async () => {
      const testId = new ObjectId();
      mockCollection.findOne.mockResolvedValue({ _id: testId, title: "Find Me" });

      const response = await request(app).get(`/api/tests/${testId}`);

      expect(response.status).toBe(200);
      expect(response.body.test.title).toBe("Find Me");
    });

    it("should return 400 for invalid ObjectId format", async () => {
      const response = await request(app).get("/api/tests/not-a-valid-id");
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid ID");
    });
  });

  // SAVE RESULTS
  describe("POST /api/tests/results", () => {
    it("should save student results", async () => {
      const testId = new ObjectId();
      mockCollection.insertOne.mockResolvedValue({ insertedId: new ObjectId() });

      const response = await request(app)
        .post("/api/tests/results")
        .send({ testId: testId.toString(), score: 85, timeTaken: 120 });

      expect(response.status).toBe(201);
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: TEST_USER_ID.toString(),
          score: 85
        })
      );
    });
  });

  // DELETE TEST
  describe("DELETE /api/tests/:testId", () => {
    it("should delete a test owned by the teacher", async () => {
      const testId = new ObjectId();
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const response = await request(app).delete(`/api/tests/${testId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Deleted");
    });

    it("should return 404 if test not found or unauthorized", async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });
      const response = await request(app).delete(`/api/tests/${new ObjectId()}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});