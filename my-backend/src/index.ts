import "dotenv/config";

import express from "express";
import cors from "cors";
// import { MongoClient, ServerApiVersion } from 'mongodb';
import auth from "./lib/auth.js";
import folderRouter from "./lib/folder.js";
import setcardsRouter from "./lib/setcards.js";
import { toNodeHandler } from "better-auth/node";

const run = () => {
  try {
    console.log("starting server");
    const app = express();

    app.use(
      cors({
        origin: "http://localhost:5173", // Replace with your frontend's origin
        methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
        credentials: true, // Allow credentials (cookies, authorization headers, etc.)
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    );
    app.use(express.json());

    app.all("/api/auth/*splat", toNodeHandler(auth));
    app.use("/api/folder", folderRouter);
    app.use("/api/setcards", setcardsRouter);

    app.get("/", (req, res) => {
      res.json({ message: "Hello from the backend hello!" });
    });

    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(` Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

run();
