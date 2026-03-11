import { Router } from "express";
import { db, userAuth } from "./auth.js";
import { ObjectId } from "mongodb";

const router = Router();
router.use(userAuth);

/**
 * This route handles get all folders
 */

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    
    const myFolders = await db.collection("folders").aggregate([
      { $match: { userId: { $in: [userId] } } },
      {
        $lookup: {
          from: "setcards",     
          localField: "sets",    
          foreignField: "_id",   
          as: "sets"            
        }
      },
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

    res.status(200).json(myFolders);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

/**
 * This route handles create folder
 */

router.post("/", async (req, res) => {
  try {
    const { name, description, sets} = req.body;
    const userId = req.user.id;
    //Check that name exist
    if (!name) {
      throw new Error("folder name is required!!!!");
    }
    const collection = db.collection("folders");
    const result = await collection.insertOne({
      name,
      description,
      sets: sets ? sets.map((id: string) => new ObjectId(id)) : [],
      userId: [userId],
      ownerId: [userId],
      createdAt: new Date(),
    });
    res.status(201).json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create folder" });
  }
});

/*
* Share with friend 
*/

router.post("/:folderId/share", async (req,res) => {
  try{
    const {folderId} = req.params;
    const {email} = req.body;
    const userToShare = await db.collection("user").findOne({
      email: email.trim().toLowerCase()
    });

    if (!userToShare) {
      return res.status(404).json({ success: false, message: "User not found"});
    }
    const shareUserId = userToShare.id || userToShare._id.toString();

    const result = await db.collection("folders").updateOne(
      { _id: new ObjectId(folderId) },
      { $addToSet: { userId: shareUserId } } 
    );

    res.status(200).json({ success: true, message: `Shared with ${userToShare.name}` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Sharing failed" });
  }
})

router.patch("/:folderId/add-set", async (req, res) => {
  try {
    const { folderId } = req.params;
    const { setId } = req.body;

    const result = await db.collection("folders").updateOne(
      { _id: new ObjectId(folderId) },
      { $addToSet: { sets: new ObjectId(setId) } } 
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ success: false, message: "Set already in folder or folder not found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

/**
 * This route gets a specific folder
 */

router.get("/:folderId", async (req, res) => {
  try {
    const { folderId } = req.params;
    const userId = req.user.id;

    const folderData = await db.collection("folders").aggregate([
      { 
        $match: { 
          _id: new ObjectId(folderId), 
          userId: { $in: [userId] }
        } 
      },
      {
        $lookup: {
          from: "setcards",
          localField: "sets",
          foreignField: "_id",
          as: "sets"
        }
      }
    ]).toArray();

    if (!folderData.length) {
      return res.status(404).json({ success: false, message: "Folder not found" });
    }

    res.status(200).json(folderData[0]); 
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
  }
});

/**
 * This route update folder
 */

router.put("/:folderId", async (req, res) => {
  try {
    const { folderId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;
    const updateFolder = await db.collection("folders").updateOne(
      {
        _id: new ObjectId(folderId),
        userId: { $in: [userId] },
      },
      {
        $set: {
          name: name,
          description: description,
          updatedAt: new Date(),
        },
      },
    );
    if (updateFolder.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Folder not found" });
    }

    res.status(200).json({ success: true, message: "Folder updated!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

/*
 *This route deletes a folder 
 */

router.delete("/:folderId", async (req, res) => {
  try {
    const { folderId } = req.params;
    const userId = req.user.id;

    const deleteFolder = await db.collection("folders").deleteOne({
      _id: new ObjectId(folderId),
      userId: { $in: [userId] },
    });
    if (deleteFolder.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Folder not found" });
    }

    res.status(200).json({ success: true, message: "Folder deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});



export default router;
