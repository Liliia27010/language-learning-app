import { Router } from "express";
import { db, userAuth } from "./auth.js";
import { ObjectId } from "mongodb";

const router = Router();
router.use(userAuth);

/**
 * Get all test
 */
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    let query;
    if (userType === "teacher") {
      query = { teacherIds: { $in: [userId] } };
    } else {
      query = { studentIds: { $in: [userId] } };
    }
    const allTests = await db.collection("tests").aggregate([
      { $match: query },
      { $addFields: { firstId: { $toObjectId: { $arrayElemAt: ["$userId", 0] } } } },
          {
            $lookup: {
              from: "user",
              localField: "firstId",
              foreignField: "_id",
              as: "creator"
            }
          },
          {
            $addFields: { sharedBy: { $arrayElemAt: ["$creator.name", 0] } }
          },
          { $sort: { createdAt: -1 } },
          { $project: { creator: 0, firstId: 0 } }
    ]).toArray();


    res.status(200).json({ success: true, tests: allTests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch tests" });
  }
});

/**
 * Create test
 */
router.post("/", async (req, res) => {
  try {
    const { title, setId, timeLimit } = req.body;
    const userId = req.user.id;

    if (req.user.userType !== "teacher") {
      return res.status(403).json({ success: false, message: "Only teachers can create tests." });
    }

    const result = await db.collection("tests").insertOne({
      title,
      setId: new ObjectId(setId),
      teacherIds: [userId], 
      timeLimit: parseInt(timeLimit) || 10,
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create test" });
  }
});

/**
 * Get students
 */
router.post("/:testId/assign", async (req, res) => {
  try {
    const { testId } = req.params;
    const { email } = req.body;

    const searchEmail = email.trim().toLowerCase();

    const student = await db.collection("user").findOne({ 
      email: searchEmail 
    });

    if (!student) {
      console.log("No student found in 'user' collection");
      return res.status(404).json({ success: false, message: "Student not found in database" });
    }

    const studentIdStr = student.id || student._id.toString();

    const result = await db.collection("tests").updateOne(
      { _id: new ObjectId(testId) },
      { $addToSet: { studentIds: studentIdStr } } 
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: `Test shared with ${student.name || email}` 
    });

  } catch (error) {
    console.error("Assign Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/**
 * GEt test with ID
 */
router.get("/:testId", async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await db.collection("tests").findOne({ _id: new ObjectId(testId) });

    if (!test) return res.status(404).json({ success: false, message: "Test not found" });
    res.status(200).json({ success: true, test });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID" });
  }
});

/**
 * Get results for test
 */
router.post("/results", async (req, res) => {
  try {
    const { testId, score, timeTaken } = req.body;
    const studentId = req.user.id; 

    const result = await db.collection("results").insertOne({
      testId: new ObjectId(testId),
      studentId: studentId, 
      score: parseInt(score),
      timeTaken: parseInt(timeTaken),
      completedAt: new Date(),
    });

    res.status(201).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Save Result Error:", error);
    res.status(500).json({ success: false, message: "Failed to save results" });
  }
});

/**
 * GET All results from tests for teacher
 */
router.get("/:testId/results", async (req, res) => {
  try {
    const { testId } = req.params;

    const results = await db.collection("results").aggregate([
      { $match: { testId: new ObjectId(testId) } },

      {
        $addFields: {
          studentObjId: { $toObjectId: "$studentId" }
        }
      },
      {
        $lookup: {
          from: "user",
          localField: "studentObjId",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: "$studentInfo" },

      {
        $project: {
          studentName: "$studentInfo.name",
          score: 1,
          timeTaken: 1,
          completedAt: 1
        }
      }
    ]).toArray();

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Aggregation Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
/**
 * Delete test
 */
router.delete("/:testId", async (req, res) => {
  try {
    const { testId } = req.params;

    const result = await db.collection("tests").deleteOne({
      _id: new ObjectId(testId),
      teacherIds: req.user.id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Unauthorized or not found" });
    }
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

export default router;