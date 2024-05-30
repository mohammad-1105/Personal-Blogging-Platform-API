import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import { dbConnect } from "./db/index.js";
import { app } from "./app.js";

dbConnect()
  .then(() => {
    app.listen(process.env.PORT || 800, () => {
      console.log("server is running on port 8000");
    });
  })
  .catch((error) => {
    console.error("Failed to run the server 😭");
  });
