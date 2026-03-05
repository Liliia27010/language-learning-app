import "dotenv/config";

import app from "./app.js";

const run = () => {
  try {
    console.log("starting server");

    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(` Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

run();
