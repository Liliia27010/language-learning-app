import {Router} from "express";
import {db, userAuth} from "./auth.js";
import {ObjectId} from "mongodb";

const router = Router();

router.use(userAuth);

router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    const currentUserType = req.user.userType;

    if (currentUserType !== "teacher") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    let query: any = {};
    if (email) {
      query.email = { $regex: email, $options: "i" };
    }

    const users = await db
      .collection("users")
      .find(query)
      .project({ password: 0 }) 
      .toArray();

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});
export default router;
