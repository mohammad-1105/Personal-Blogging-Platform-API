import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const dbConnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `MongoDB connected Successfully ❤️ , DB_HOST :: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("Failed to connect MongoDB 😭");
    process.exit(1);
  }
};
