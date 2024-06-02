import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { BlogPostModel } from "../models/blogPost.model.js";
import { blogPostSchema } from "../schemas/blogPostSchema.js";
import { updatePostSchema } from "../schemas/updatePostSchema.js";
import crypto from "node:crypto";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { UserModel } from "../models/user.model.js";

const generateRandomId = (length = 10) => {
  return crypto.randomBytes(length).toString("hex");
};
const createBlogPost = asyncHandler(async (req, res) => {
  // get data from req.body
  const { title, content, tags } = req.body;

  // get file from req.file
  const imageLocalPath = req.file?.path; // added multer middleware

  // zod validation
  const { error } = blogPostSchema.safeParse({ title, content, tags });
  if (error) {
    throw new ApiError(400, error.issues[0].message);
  }

  if (!imageLocalPath) {
    throw new ApiError(400, "missing image local path");
  }

  const imagePublicId = generateRandomId(10);

  // upload image on cloudinary
  const response = await uploadOnCloudinary(imageLocalPath, imagePublicId);

  if (!response.url) {
    throw new ApiError(500, "Failed to upload Image");
  }

  // store imagePublicId
  const oldImagePublicId = response.public_id;

  // Obtain author information from the authenticated user's session or token
  const author = req.user._id; // Assuming req.user contains the user object with _id field

  // create blog post
  const newPost = await BlogPostModel.create({
    title,
    content,
    image: response?.url || "",
    author,
    tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
  });

  await newPost.save();

  //  delete previous uploaded cloudinary image
  if (oldImagePublicId) {
    await deleteFromCloudinary(oldImagePublicId);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Blog Post created successfully !", newPost));
});

const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await BlogPostModel.find({});

  if (!posts) {
    throw new ApiError(404, "No posts found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "All posts fetched successfully", posts));
});

const getPost = asyncHandler(async (req, res) => {
  // get id from params
  const postId = req.params.postId;

  if (!postId) {
    throw new ApiError(400, "Missing post id");
  }

  const post = await BlogPostModel.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Post fetched successfully", post));
});

const updatePost = asyncHandler(async (req, res) => {
  // get postId from req params
  const postId = req.params.postId;

  // get data from req body
  const { title, content } = req.body;

  const { error } = updatePostSchema.safeParse({ title, content });
  if (error) {
    throw new ApiError(400, error.issues[0].message);
  }

  if (!postId) {
    throw new ApiError(404, "Missing post Id");
  }

  // find post and update
  const updatedPost = await BlogPostModel.findByIdAndUpdate(
    postId,
    {
      $set: {
        title,
        content,
      },
    },
    {
      new: true,
    }
  );

  if (!updatePost) {
    throw new ApiError(500, "Failed to update post !");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "post updated successfully", updatedPost));
});

const deletePost = asyncHandler(async (req, res) => {
  // get postId from req.params
  const postId = req.params.postId;

  if (!postId) {
    throw new ApiError(400, "Missing Post id !");
  }

  // find post and delete
  const deletedPost = await BlogPostModel.findByIdAndDelete(postId, {
    new: true,
  });

  if (!deletedPost) {
    throw new ApiError(500, "Failed to delete post");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Post deleted successfully !"));
});

const getPostAuthorDetails = asyncHandler(async (req, res) => {
  // get postId from req.params
  const postId = req.params.postId;

  if (!postId) {
    throw new ApiError(400, "Missing Post Id !");
  }

  // find post
  const post = await BlogPostModel.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found !");
  }

  // find user from post
  const postAuthor = await UserModel.findById(post.author).select(
    "fullName email profile.avatar"
  );
  if (!postAuthor) {
    throw new ApiError(404, "Author not found with this author Id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "post author fethed successfully", postAuthor));
});

const getPostByTag = asyncHandler(async (req, res) => {
  const tag = req.params.tag;

  const posts = await BlogPostModel.find({ tags: tag });

  if (!posts) {
    throw new ApiError(404, "No posts found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Posts fetched successfully", posts));
});

// exports controllers
export {
  createBlogPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
  getPostAuthorDetails,
  getPostByTag,
};
