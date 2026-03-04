import request from 'supertest';
import { jest, describe, it, expect } from '@jest/globals';
import { ObjectId } from 'mongodb';
import app from '../app.js'; 
import auth, {db} from '../lib/auth.js';
const TEST_USER_ID = new ObjectId().toString(); // Replace with a valid user ID from your database

const mockCollection = {
  find: jest.fn().mockReturnThis(), // .find() chains into .toArray()
  toArray: jest.fn(),
  insertOne: jest.fn(),
  findOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
};

describe('SetCards API', () => {

  beforeEach(() => {
    // 2. Intercept Better Auth's getSession method before each test
    jest.spyOn(auth.api, "getSession").mockResolvedValue({
      session: { 
        id: "fake-session-id",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: TEST_USER_ID,
        expiresAt: new Date(Date.now() + 100000),
        token: "fake-token",
      },
      user: { 
        id: TEST_USER_ID, 
        email: "test@example.com",
        name: "Test User",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
   // 3. Intercept all MongoDB database calls!
    jest.spyOn(db, "collection").mockReturnValue(mockCollection);
  });

  afterEach(() => {
    // 4. Clear the mock after tests to prevent memory leaks
    jest.restoreAllMocks();
  });

// Code for test Get All Sets

  it('GET /api/setcards - should return all sets', async () => {
    // 5. Set up the mock response for fetching all sets
   const fakeData = [
      { _id: "1", name: "Mocked Set 1" },
      { _id: "2", name: "Mocked Set 2" }
    ];
    mockCollection.toArray.mockResolvedValue(fakeData);
    //mock the .array to return an error to test error handling
    const response = await request(app)
    .get('/api/setcards')

   //check the database call was made with correct userId filter
    expect(db.collection).toHaveBeenCalledWith("setcards");
    expect(mockCollection.find).toHaveBeenCalledWith({ userId: new ObjectId(TEST_USER_ID) });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('name', fakeData[0].name);    
  });


  it('GET /api/setcards - should return 400 when database fails', async () => {
    mockCollection.toArray.mockRejectedValueOnce(new Error("Failed to fetch sets"));

    const response = await request(app).get('/api/setcards');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Failed to fetch sets");
  });



// Code for test Create a new set

   it('POST /api/setcards - should create a new set', async () => {
     const newSet = {
       name: "New Language Set",
       description: "Learn fast",
       cards: [{ term: "Dog", definition: "Koira" }]
     };

     const mockInsertedId = new ObjectId()
     mockCollection.insertOne.mockResolvedValue({ insertedId: mockInsertedId });


    const response = await request(app)
       .post('/api/setcards')
       .send(newSet);

       //test that we call insertOne with correct data
    
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('id', mockInsertedId.toString());

      expect(mockCollection.insertOne).toHaveBeenCalledWith( expect.objectContaining({ userId: new ObjectId(TEST_USER_ID) }) );

    
  });
    //create others tests for error handling, missing fields, invalid data, etc
  it('POST /api/setcards - should return 500 when insert fails', async () => {
    mockCollection.insertOne.mockRejectedValueOnce(new Error("Database error"));

    const response = await request(app)
      .post('/api/setcards')
      .send({ name: "Test", cards: [] });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Failed to create set");
  });

  it('POST /api/setcards - should return 400 when name or description are missing', async () => {
    const responce = await request(app)
      .post('/api/setcards')
      .send({ 
        description: "Missing name", 
        cards: [] 
      });

    expect(responce.status).toBe(400);
    expect(responce.body.success).toBe(false);
    expect(responce.body.message).toBe("Name and cards array are required");
  });

// Code for test Get a specific set by ID

  it('GET /api/setcards/:setId -should return a specific set by ID', async () => {
    const fakeSetId = new ObjectId();
    const fakeSet = { 
      _id: fakeSetId, 
      name: "One Set", 
      userId: new ObjectId(TEST_USER_ID) };

    mockCollection.findOne.mockResolvedValueOnce(fakeSet);

    const response = await request(app).get(`/api/setcards/${fakeSetId.toString()}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("One Set");
    expect(mockCollection.findOne).toHaveBeenCalledWith({ 
      _id: fakeSetId, 
      userId: new ObjectId(TEST_USER_ID) 
    });
  });

  it('GET /api/setcards/:setId - should return 200 with success false if set not found', async () => {
    const fakeSetId = new ObjectId();
    mockCollection.findOne.mockResolvedValueOnce(null);

    const response = await request(app).get(`/api/setcards/${fakeSetId.toString()}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Set not found");
  });

  it('GET /api/setcards/:setId - should return 400 for invalid ID format', async () => {

    const response = await request(app).get(`/api/setcards/false-id`);
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid ID format");    
  });

// Code for test Update 

  it('PUT /api/setcards/:setId - should update a set', async () => {
    const fakeSetId = new ObjectId();
    const updateData = { 
      name: "Updated Set Name", 
      description: "Updated Description", 
      cards: [{ term: "Updated Term", definition: "Updated Definition" }] };


    mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 1 });

    const response = await request(app)
      .put(`/api/setcards/${fakeSetId.toString()}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Set updated!");
  });

  it('PUT /api/setcards/:setId - should return 200 with success false if set not found', async () => {
    const fakeSetId = new ObjectId();
    const updateData = { 
      name: "Updated Set Name", 
      description: "Updated Description", 
      cards: [{ term: "Updated Term", definition: "Updated Definition" }] };

    mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 0 });

    const response = await request(app)
      .put(`/api/setcards/${fakeSetId.toString()}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Set not found");
  });

  it('PUT /api/setcards/:setId - should return 500 if the database operation fails', async () => {
    const fakeSetId = new ObjectId();
    mockCollection.updateOne.mockRejectedValueOnce(new Error("Database error"));
    
    const response = await request(app) 
      .put(`/api/setcards/${fakeSetId.toString()}`)
      .send({ name: "Updated Set Name", 
      description: "Updated Description", 
      cards: [{ term: "Updated Term", definition: "Updated Definition" }] });


    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Update failed");
  });
      
// Code for test Delete a set

  it('DELETE /api/setcards/:setId - should delete a set', async () => {
    const fakeSetId = new ObjectId();
    mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

    const response = await request(app).delete(`/api/setcards/${fakeSetId.toString()}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Set deleted!");
  });

  it('DELETE /api/setcards/:setId - should return 200 with success false if set not found', async () => {
    const fakeSetId = new ObjectId();
    mockCollection.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });

    const response = await request(app).delete(`/api/setcards/${fakeSetId.toString()}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Set not found");
  });

  it('DELETE /api/setcards/:setId - should return 500 if the database operation fails', async () => {
    const fakeSetId = new ObjectId();
    mockCollection.deleteOne.mockRejectedValueOnce(new Error("Database error"));

    const response = await request(app).delete(`/api/setcards/${fakeSetId.toString()}`);
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Delete failed");
  });
});
