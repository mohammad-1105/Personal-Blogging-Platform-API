import { Router } from "express";
import {
  createBlogPost,
  deletePost,
  getAllPosts,
  getPost,
  getPostAuthorDetails,
  getPostByTag,
  updatePost,
} from "../controllers/blogPost.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

export const router = Router();

// secured routes
router
  .route("/create-post")
  .post(verifyJWT, upload.single("image"), createBlogPost);

router.route("/get-posts").get(verifyJWT, getAllPosts);
router.route("/get-posts/:postId").get(verifyJWT, getPost);
router.route("/update-posts/:postId").patch(verifyJWT, updatePost);
router.route("/delete-posts/:postId").delete(verifyJWT, deletePost);
router.route("/get-posts-by-tag/:tag").get(verifyJWT, getPostByTag);
router
  .route("/get-posts-author-details/:postId")
  .get(verifyJWT, getPostAuthorDetails);
