import { Router } from "express";
import { createBlogPost } from "../controllers/blogPost.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

export const router = Router();

// secured routes
router
  .route("/create-post")
  .post(verifyJWT, upload.single("image"), createBlogPost);
