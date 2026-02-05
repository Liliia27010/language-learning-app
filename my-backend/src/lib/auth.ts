import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { fromNodeHeaders } from "better-auth/node";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        emailVerified: boolean;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        image?: string | null;
      };
    }
  }
}

export const userAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({ success: false, message: "You must be logged in!" });
    }

    req.user = session.user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ success: false, message: "Server Error during authentication" });
  }
};

// check if process.env... doesn't exists
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI missing!!!!");
  //throw an error, server will crash with error message
}

const client = new MongoClient(process.env.MONGODB_URI);
export const db = client.db("Finlearn");

const auth = betterAuth({
  database: mongodbAdapter(db),
  baseURL: "http://localhost:3000",
  basePath: "/api/auth",
  trustedOrigins: ["http://localhost:5173"],
  emailAndPassword: {
    enabled: true,
  },
});

export default auth;
