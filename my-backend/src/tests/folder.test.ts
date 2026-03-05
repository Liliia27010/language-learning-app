import request from "supertest";
import { jest, describe, it, expect } from "@jest/globals";
import { ObjectId, type Collection } from "mongodb";
import app from "../app.js";
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

describe("Folder API", () => {
  // 2. Intercept Better Auth's getSession method before each test
  beforeEach(() => {
    jest.spyOn(auth.api, "getSession").mockResolvedValue({
      session: {
        id: "fake-session-id",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: TEST_USER_ID.toString(),
        expiresAt: new Date(Date.now() + 100000),
        token: "fake-token",
      },
      user: {
        id: TEST_USER_ID.toString(),
        email: "test@example.com",
        name: "Test User",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // 3. Intercept all MongoDB database calls!
    jest
      .spyOn(db, "collection")
      .mockReturnValue(mockCollection as unknown as Collection);
  });

  afterEach(() => {
    // 4. Clear the mock after tests to prevent memory leaks
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // Code for test Get all folders

  it("GET /api/folder/:folderId - should return folder data with sets", async () => {
    const fakeFolderId = new ObjectId();
    const fakeFolderData = {
      _id: fakeFolderId,
      name: "Mocked Folder",
      description: "A mocked folder for testing",
      userId: TEST_USER_ID,
      sets: [
        {
          _id: new ObjectId(),
          name: "Mocked Set 1",
        },
      ],
    };

    mockCollection.toArray.mockResolvedValue([fakeFolderData]);

    const response = await request(app).get(
      `/api/folder/${fakeFolderId.toString()}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name", "Mocked Folder");
    expect(Array.isArray(response.body.sets)).toBe(true);
  });

  it("GET /api/folders - should return all folders", async () => {
    mockCollection.toArray.mockResolvedValue([]);
    const response = await request(app).get("/api/folder");
    expect(response.status).toBe(200);
  });

  it("GET /api/folder - should return 500 if database fails", async () => {
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn<any>().mockRejectedValue(new Error("Database Error")),
    } as any);

    const response = await request(app).get("/api/folder");

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  it("GET /api/folder - should return 500 if database fails to fetch all folders", async () => {
    mockCollection.toArray.mockRejectedValueOnce(new Error("Fatal DB Error"));

    const response = await request(app).get("/api/folder");

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  // Code for test Create a new folder

  it("POST /api/folder - should create a new folder", async () => {
    const mockInsertedId = new ObjectId();
    const setId1 = new ObjectId();
    const setId2 = new ObjectId();

    const newFolderData = {
      name: "New Test Folder",
      description: "A folder created during testing",
      setIds: [setId1.toString(), setId2.toString()],
    };

    mockCollection.insertOne.mockResolvedValue({
      acknowledged: true,
      insertedId: mockInsertedId,
    });

    const response = await request(app).post("/api/folder").send(newFolderData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.id).toBe(mockInsertedId.toString());
    expect(mockCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: new ObjectId(TEST_USER_ID.toString()),
      }),
    );
  });

  it("POST /api/folder - should correctly map sets to ObjectIds (Line 50)", async () => {
    const setId1 = new ObjectId().toString();
    const setId2 = new ObjectId().toString();

    mockCollection.insertOne.mockResolvedValue({
      acknowledged: true,
      insertedId: new ObjectId(),
    });

    const response = await request(app)
      .post("/api/folder")
      .send({
        name: "Folder with Sets",
        sets: [setId1, setId2],
      });

    expect(response.status).toBe(201);
    expect(mockCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        sets: [new ObjectId(setId1), new ObjectId(setId2)],
      }),
    );
  });

  it("POST /api/folder - should return 500 if name is missing (Validation Error)", async () => {
    const response = await request(app)
      .post("/api/folder")
      .send({ description: "No name here" });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Failed to create folder");
  });

  // Code for test Add a set to folder

  it("PATCH /api/folder/:folderId/add-set - should add a set to the folder", async () => {
    const fakeFolderId = new ObjectId();
    const fakeSetId = new ObjectId();

    mockCollection.updateOne.mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
    });

    const response = await request(app)
      .patch(`/api/folder/${fakeFolderId.toString()}/add-set`)
      .send({ setId: fakeSetId.toString() });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { _id: new ObjectId(fakeFolderId.toString()) },
      { $addToSet: { sets: new ObjectId(fakeSetId.toString()) } },
    );
  });

  it("PATCH /api/folder/:folderId/add-set - should return 400 if set already in folder", async () => {
    const fakeFolderId = new ObjectId();
    const fakeSetId = new ObjectId();

    mockCollection.updateOne.mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 0,
      upsertedCount: 0,
      upsertedId: null,
    });

    const response = await request(app)
      .patch(`/api/folder/${fakeFolderId.toString()}/add-set`)
      .send({ setId: fakeSetId.toString() });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Set already in folder or folder not found",
    );
  });

  it("PATCH /api/folder/:folderId/add-set - should return 500 if database fails to add set", async () => {
    const fakeFolderId = new ObjectId();
    const fakeSetId = new ObjectId();
    mockCollection.updateOne.mockRejectedValueOnce(new Error("Database error"));

    const response = await request(app)
      .patch(`/api/folder/${fakeFolderId.toString()}/add-set`)
      .send({ setId: fakeSetId.toString() });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  // Code for test Get a specific folder

  it("GET /api/folder/:folderId - should return a specific folder by ID", async () => {
    const fakeFolderId = new ObjectId();
    const fakeFolderData = [
      {
        _id: fakeFolderId,
        name: "One Folder",
        userId: TEST_USER_ID,
        sets: [],
      },
    ];
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn<any>().mockResolvedValue(fakeFolderData),
    } as any);

    const response = await request(app).get(
      `/api/folder/${fakeFolderId.toString()}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("One Folder");
  });

  it("GET /api/folder/:folderId - should return 404 if folder not found", async () => {
    const fakeFolderId = new ObjectId();

    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn<any>().mockResolvedValue([]),
    } as any);

    const response = await request(app).get(
      `/api/folder/${fakeFolderId.toString()}`,
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Folder not found");
  });

  it("GET /api/folder/:folderId - should return 400 for invalid ID format", async () => {
    const response = await request(app).get(`/api/folder/invalid-id`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid ID format");
  });

  // Code for test Update a folder

  it("PUT /api/folder/:folderId - should update a folder", async () => {
    const fakeFolderId = new ObjectId();
    const updateData = {
      name: "Updated Folder Name",
      description: "Updated Description",
    };

    mockCollection.updateOne.mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
    });

    const response = await request(app)
      .put(`/api/folder/${fakeFolderId.toString()}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Folder updated!");

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      {
        _id: new ObjectId(fakeFolderId.toString()),
        userId: new ObjectId(TEST_USER_ID.toString()),
      },
      {
        $set: {
          name: updateData.name,
          description: updateData.description,
          updatedAt: expect.any(Date),
        },
      },
    );
  });

  it("PUT /api/folder/:folderId - should return 404 if folder not found", async () => {
    const fakeFolderId = new ObjectId();
    const updateData = {
      name: "Updated Folder Name",
      description: "Updated Description",
    };

    mockCollection.updateOne.mockResolvedValue({
      acknowledged: true,
      matchedCount: 0,
      modifiedCount: 0,
      upsertedCount: 0,
      upsertedId: null,
    });

    const response = await request(app)
      .put(`/api/folder/${fakeFolderId}`)
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Folder not found");
  });

  it("PUT /api/folder/:folderId - should return 500 if database fails to update folder", async () => {
    const fakeFolderId = new ObjectId();
    const updateData = {
      name: "Updated Folder Name",
      description: "Updated Description",
    };

    mockCollection.updateOne.mockRejectedValueOnce(new Error("Database error"));

    const response = await request(app)
      .put(`/api/folder/${fakeFolderId}`)
      .send(updateData);

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Update failed");
  });

  // Code for test Delete a folder

  it("DELETE /api/folder/:folderId - should delete a folder", async () => {
    const fakeFolderId = new ObjectId();

    mockCollection.deleteOne.mockResolvedValue({
      acknowledged: true,
      deletedCount: 1,
    });

    const response = await request(app).delete(
      `/api/folder/${fakeFolderId.toString()}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Folder deleted!");
  });

  it("DELETE /api/folder/:folderId - should return 404 if folder was not deleted", async () => {
    const fakeFolderId = new ObjectId().toString();

    mockCollection.deleteOne.mockResolvedValue({
      acknowledged: true,
      deletedCount: 0,
    });

    const response = await request(app).delete(`/api/folder/${fakeFolderId}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Folder not found");
  });

  it("should return 500 if database fails", async () => {
    const fakeFolderId = new ObjectId();
    mockCollection.deleteOne.mockRejectedValue(new Error("DB Error"));

    const response = await request(app).delete(`/api/folder/${fakeFolderId}`);

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Delete failed");
  });
});
