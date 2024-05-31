import { UserModel } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { registerSchema } from "../schemas/registerSchema.js";
import { loginSchema } from "../schemas/loginSchema.js";

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
  const existingUser = await UserModel.findOne({ username, email });
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

  res
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

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshAccessToken", cookieOptions)
    .json(new ApiResponse(200, "Logged out successfully !"));
});

// export controllers
export { registerUser, loginUser, logoutUser };
