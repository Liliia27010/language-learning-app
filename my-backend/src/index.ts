import "dotenv/config";

import express from "express";


const run = () => {
  try {
    console.log("starting server");
    const app = express();
  
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(` Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

run();
