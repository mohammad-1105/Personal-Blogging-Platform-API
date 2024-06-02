import { UserModel } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { registerSchema } from "../schemas/registerSchema.js";
import { loginSchema } from "../schemas/loginSchema.js";
import { changePasswordSchema } from "../schemas/changePasswordSchema.js";
import { updateBioSchema } from "../schemas/updateBioSchema.js";
import jwt from "jsonwebtoken";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import crypto from "node:crypto";

// function to generate tokens
const generateAccessAndRefreshAccessToken = async (userId) => {
  const user = await UserModel.findById(userId);

  const accessToken = await user.generateAccessToken();
  const refreshAccessToken = await user.generateRefreshAccessToken();

  user.refreshAccessToken = refreshAccessToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshAccessToken };
};

// cookies options
const cookieOptions = {
  secure: true,
  httpOnly: true,
};

// generate random publicId for fileUpload func
const generateRandomId = (length = 10) => {
  return crypto.randomBytes(length).toString("hex");
};
const registerUser = asyncHandler(async (req, res) => {
  // get data from req.body
  const { username, fullName, email, password } = req.body;

  // validation with zod
  const { error } = registerSchema.safeParse({
    username,
    fullName,
    email,
    password,
  });
  if (error) {
    throw new ApiError(400, error.issues[0].message);
  }

  // check if the user already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "user already exists with this email");
  }

  // create new user and save
  const newUser = await UserModel.create({
    username,
    fullName,
    email,
    password,
  });

  await newUser.save();

  const user = await UserModel.findById(newUser._id).select(
    "-password -refreshAccessToken"
  );
  if (!user) {
    throw new ApiError(500, "Failed to register the user !");
  }
  // send response
  return res
    .status(201)
    .json(new ApiResponse(201, "user registered successfully", user));
});

const loginUser = asyncHandler(async (req, res) => {
  // get data from req.body
  const { email, password } = req.body;

  // validation with zod
  const { error } = loginSchema.safeParse({ email, password });
  if (error) {
    throw new ApiError(400, error.issues[0].message);
  }

  // check if the user doesn't exists
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError(400, "user doesn't exists with this email !");
  }

  // check password

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid password !");
  }

  // generate tokens
  const { accessToken, refreshAccessToken } =
    await generateAccessAndRefreshAccessToken(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshAccessToken", refreshAccessToken, cookieOptions)
    .json(new ApiResponse(200, "Logged in successfully !"));
});

const logoutUser = asyncHandler(async (req, res) => {
  // find user to delete refreshAccessToken from db
  await UserModel.findByIdAndUpdate(
    req.user?._id, // req.user is available because of added verifyJWT middleware
    {
      $unset: {
        refreshAccessToken: 1,
      },
    },
    {
      new: true,
    }
  );

  // remove cookies from browser

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshAccessToken", cookieOptions)
    .json(new ApiResponse(200, "Logged out successfully !"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // validation with zod
  const { error } = changePasswordSchema.safeParse({
    oldPassword,
    newPassword,
  });
  if (error) {
    throw new ApiError(400, error.issues[0].message);
  }
  // find user
  const user = await UserModel.findById(req.user._id); // req.user is available because of added verifyJWT middleware

  if (!user) {
    throw new ApiError(400, "User not found, may be token expired !");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(201, "Incorrect Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(new ApiResponse(201, "password changed successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  // get refreshAccessToken from browser
  const incomingRefreshAccessToken =
    req.cookies.refreshAccessToken || req.body.refreshAccessToken;

  if (!incomingRefreshAccessToken) {
    throw new ApiError(400, "No refresh Access token found !");
  }

  // dcrypt token
  const dcryptedToken = jwt.verify(
    incomingRefreshAccessToken,
    process.env.REFRESH_ACCESS_TOKEN_SECRET
  );
  if (!dcryptedToken) {
    throw new ApiError(401, "Failed to verify token, May be expired !");
  }

  // find user with dcryptedToken
  const user = await UserModel.findById(dcryptedToken._id);
  if (!user) {
    throw new ApiError(400, "Invalid refresh token");
  }

  // compare the tokens
  if (incomingRefreshAccessToken !== user.refreshAccessToken) {
    throw new ApiError("Refresh Access token is expired or may be used !");
  }

  // generate tokens and set cookies
  const { accessToken, refreshAccessToken } =
    await generateAccessAndRefreshAccessToken(user._id);

  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshAccessToken", refreshAccessToken, cookieOptions)
    .json(new ApiResponse(201, "Tokens refreshed successfully !"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  // get avatar from req.file
  const avatarLocalPath = req.file?.path; // multer middleware added here

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is missing !");
  }

  // Generate a publicId for Cloudinary upload
  const publicId = generateRandomId(16);

  // upload on cloudinary
  const response = await uploadOnCloudinary(avatarLocalPath, publicId);

  if (!response.url) {
    throw new ApiError(500, "Failed to upload profile please try again");
  }

  // find user and update profile pic
  const user = await UserModel.findById(req.user._id); // added verfifyJWT here

  if (!user) {
    throw new ApiError(400, "User not found !");
  }

  // Save the old avatar public ID for deletion after successful update
  const oldAvatarPublicId = user.profile.avatarPublicId;

  // update user avatar details
  user.profile.avatar = response.url || "";
  user.profile.avatarPublicId = publicId;

  // save user
  await user.save();

  // Delete the old avatar from Cloudinary
  if (oldAvatarPublicId) {
    await deleteFromCloudinary(oldAvatarPublicId);
  }

  // Return the updated user without sensitive fields
  const updatedUser = await UserModel.findById(req.user._id).select(
    "-password -refreshAccessToken"
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Profile avatar updated successfully!", updatedUser)
    );
});

const updateBio = asyncHandler(async (req, res) => {
  const { bio } = req.body;

  // validation with zod
  const { error } = updateBioSchema.safeParse({ bio });
  if (error) {
    throw new ApiError(400, error.issues[0].message);
  }

  // find user and update bio
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        "profile.bio": bio,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshAccessToken");

  if (!user) {
    throw new ApiError(500, "Failed to update bio!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Bio updated successfully!", user));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id).select("-password -refreshAccessToken");

  if (!user) {
    throw new ApiError(404, "User not found may be token expired !");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", user));
});

// export controllers
export {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  refreshToken,
  updateAvatar,
  updateBio,
  getCurrentUser,
};
