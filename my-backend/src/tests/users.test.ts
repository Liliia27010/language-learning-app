import request from "supertest";
import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { type Collection } from "mongodb";
import app from "../index.js"; 
import auth, { db } from "../lib/auth.js";

const mockCollection = {
  find: jest.fn<any>().mockReturnThis(),
  project: jest.fn<any>().mockReturnThis(),
  toArray: jest.fn<any>(),
};

describe("Users API", () => {
  let currentUserType = "teacher";

  beforeEach(() => {
    jest.spyOn(auth.api, "getSession").mockImplementation(async () => {
      return {
        session: { id: "session-123", userId: "user-123", expiresAt: new Date() },
        user: {
          id: "user-123",
          email: "teacher@test.com",
          userType: currentUserType,
        },
      } as any;
    });

    jest.spyOn(db, "collection").mockReturnValue(mockCollection as unknown as Collection);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    currentUserType = "teacher"; 
  });

  it("GET /api/users - should return users for a teacher", async () => {
    currentUserType = "teacher";
    const mockUsers = [
      { email: "student1@test.com", name: "Student One" },
      { email: "student2@test.com", name: "Student Two" }
    ];
    
    mockCollection.toArray.mockResolvedValue(mockUsers);

    const response = await request(app).get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.users).toHaveLength(2);
    
    expect(mockCollection.project).toHaveBeenCalledWith({ password: 0 });
  });

  it("GET /api/users - should filter users by email query", async () => {
    currentUserType = "teacher";
    mockCollection.toArray.mockResolvedValue([]);

    const emailToSearch = "alice";
    await request(app).get(`/api/users?email=${emailToSearch}`);

    expect(mockCollection.find).toHaveBeenCalledWith({
      email: { $regex: emailToSearch, $options: "i" }
    });
  });

  it("GET /api/users - should block access for students", async () => {
    currentUserType = "student";

    const response = await request(app).get("/api/users");

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Access denied");
    
    expect(mockCollection.find).not.toHaveBeenCalled();
  });

  it("GET /api/users - should return 500 if database fails", async () => {
    currentUserType = "teacher";
    mockCollection.toArray.mockRejectedValue(new Error("Database Error"));

    const response = await request(app).get("/api/users");

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Failed to fetch users");
  });
});