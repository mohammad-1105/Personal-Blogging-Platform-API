import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath, publicId) => {
  if (!localFilePath) return;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      public_id: publicId,
    });
    console.log("File uploaded on cloudinary successfully");
    fs.unlinkSync(localFilePath);
    console.log("File deleted successfully after uploaded");
    return  response ;
  } catch (error) {
    console.error("Failed to upload file on cloudinary :: ", error);
    fs.unlinkSync(localFilePath);
    console.log("File deleted successfully after failed upload");
  }
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    console.log("No public id provided");
    return;
  }

  try {
    const deletionResponse = await cloudinary.uploader.destroy(publicId);
    console.log(
      "File deleted successfully from cloudinary :: ",
      deletionResponse
    );
  } catch (error) {
    console.error("Failed to delete file from cloudinary :: ", error);
  }
};
