import express from 'express';
import cors from "cors";
// import { MongoClient, ServerApiVersion } from 'mongodb';
import auth from "./lib/auth.js";
import folderRouter from "./lib/folder.js";
import setcardsRouter from "./lib/setcards.js";
import { toNodeHandler } from "better-auth/node";


const app = express();
console.log('FRONTEND : ',process.env.FRONTEND_URL)
app.use(
    cors({
   origin: process.env.FRONTEND_URL, // Replace with your frontend's origin
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

export default app; 