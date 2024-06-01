import mongoose, { Schema } from "mongoose";

const blogPostSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required !"],
    },

    content: {
      type: String,
      required: [true, "content is required !"],
    },

    image: {
      type: String, // URL to the image stored on Cloudinary
    },

    tags: {
      type: [String], // Array of strings for tags
      default: [], // Default to an empty array
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const BlogPostModel = mongoose.model("BlogPost", blogPostSchema);
