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

    const allTests = await db
      .collection("tests")
      .find({ 
        teacherId: userId 
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, tests: allTests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch tests" });
  }
});

/**
 * Create a test
 */
router.post("/", async (req, res) => {
  try {
    const { title, setId, timeLimit } = req.body;
    const userId = req.user.id;
    const userType = req.user.userType;

    if (userType !== "teacher") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Only teachers can create tests." 
      });
    }

    if (!title || !setId) {
      return res.status(400).json({ 
        success: false, 
        message: "Title and Set ID are required" 
      });
    }

    const result = await db.collection("tests").insertOne({
      title,
      setId: new ObjectId(setId),
      teacherId: userId,
      timeLimit: parseInt(timeLimit) || 10,
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create test" });
  }
});

/**
 * Get a test with ID
 */

router.get("/:testId", async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await db.collection("tests").findOne({ 
      _id: new ObjectId(testId) 
    });

    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    res.status(200).json({ success: true, test });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
  }
});

/**
 * Delete test
 */
router.delete("/:testId", async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;

    const result = await db.collection("tests").deleteOne({
      _id: new ObjectId(testId),
      teacherId: userId 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Test not found or unauthorized" });
    }

    res.status(200).json({ success: true, message: "Test deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

export default router;