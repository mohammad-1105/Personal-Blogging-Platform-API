import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { UserModel } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // get cookie from browser
    const token =
      req.cookies.accessToken ||
      req.headers["Authorization"]?.replace("Bearer ");

    if (!token) {
      throw new ApiError(401, "No Token Found !");
    }

    // decrypt token
    const dcryptedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!dcryptedToken) {
      throw new ApiError(401, "Invalid Token, may be expired !");
    }

    // find user
    const user = await UserModel.findById(dcryptedToken._id).select(
      "-password -refreshAccessToken"
    );

    // add user to request
    req.user = user;

    next(); // next flag to run next middleware after this
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to verify Token");
  }
});
