import { Router } from "express";
import { db, userAuth } from "./auth.js";
import { ObjectId } from "mongodb";

const router = Router();
router.use(userAuth);


/**
 * Get all Cards set
 */

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const allSets = await db.collection("setcards").aggregate([
      { $match: { userId: { $in: [userId] } } },
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
          { $project: { creator: 0, firstId: 0 } }
    ]).toArray();

    res.status(200).json(allSets);
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
  }
});

/**
 * Create a new Cards set
 */

router.post("/", async (req, res) => {
  try {
    const { name, description, cards } = req.body;
    const userId = req.user.id;

    if (!name || !cards || !Array.isArray(cards)) {
      return res.status(400).json({ 
        success: false, 
        message: "Name and cards array are required" 
      });
    }

    const result = await db.collection("setcards").insertOne({
      name,
      description,
      userId: [userId],
      ownerId: [userId],
      cards: cards.map((card: any) => ({
        term: card.term,
        definition: card.definition,
        color: card.color || "#ffffff",
        id: new ObjectId()
      })),
      createdAt: new Date(), 
    });

    return res.status(201).json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create set" });
  }
});

/**
 * Share with you friends
 */

router.post("/:setId/share", async (req, res) => {
  try {
    const { setId } = req.params;
    const { email } = req.body;

    const userToShare = await db.collection("user").findOne({ 
      email: email.trim().toLowerCase() 
    });

    if (!userToShare) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const shareUserId = userToShare.id || userToShare._id.toString();
    const result = await db.collection("setcards").updateOne(
      { _id: new ObjectId(setId) },
      { $addToSet: { userId: shareUserId } }
    );

    res.status(200).json({ success: true, message: `Shared with ${userToShare.name}` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Sharing failed" });
  }
});

/**
 * 1. Get a specific set by ID
 */
router.get("/:setId", async (req, res) => {
  try {
    const { setId } = req.params;
    const userId = req.user.id;

    const set = await db.collection("setcards").findOne({ 
      _id: new ObjectId(setId),
      userId: { $in: [userId] }
    });

    if (!set) {
      return res.status(200).json({ success: false, message: "Set not found" });
    }

    res.status(200).json(set);
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
  }
});

/**
 * Update a specific card
 */

router.put("/:setId", async (req, res) => {
  try {
    const { setId } = req.params;
    const {name, description, cards } = req.body;
    const userId = req.user.id;

    const result = await db.collection("setcards").updateOne(
      {
        _id: new ObjectId(setId),
        userId: { $in: [userId] },
      },
      {
        $set: {
          name,
          description,
          cards: cards.map((card: any) => ({
            term: card.term,
            definition: card.definition,
            color: card.color || "#ffffff",
            _id: card._id ? new ObjectId(card._id) : new ObjectId()
          })),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(200).json({ success: false, message: "Set not found" });
    }

    res.status(200).json({ success: true, message: "Set updated!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

/**
 * Delete a card
 */

router.delete("/:setId", async (req, res) => {
  try {
    const { setId } = req.params;
    const userId = req.user.id;

    const result = await db.collection("setcards").deleteOne({
      _id: new ObjectId(setId),
      userId: { $in: [userId] },
    });

    if (result.deletedCount === 0) {
      return res.status(200).json({ success: false, message: "Set not found" });
    }

    res.status(200).json({ success: true, message: "Set deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

export default router;