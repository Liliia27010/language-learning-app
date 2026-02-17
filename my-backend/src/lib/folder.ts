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
      { $match: { userId: new ObjectId(userId) } },
      {
        $lookup: {
          from: "setcards",     
          localField: "sets",    
          foreignField: "_id",   
          as: "sets"            
        }
      }
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
      userId: new ObjectId(userId),
      createdAt: new Date(),
    });
    res.status(201).json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create folder" });
  }
});

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
          userId: new ObjectId(userId) 
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
        userId: new ObjectId(userId),
      },
      {
        $set: {
          name: name,
          description: description,
          updatedAt: new Date(),
        },
      },
    );
    if (!updateFolder) {
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
      userId: new ObjectId(userId),
    });
    if (!deleteFolder) {
      return res.status(404).json({ success: false, message: "Folder not found" });
    }

    res.status(200).json({ success: true, message: "Folder deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});



export default router;
