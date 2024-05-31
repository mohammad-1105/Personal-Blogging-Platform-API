import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { UserModel } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    // get cookie from browser
    const token =
      req.cookies.accessToken ||
      req.headers["Authorization"]?.replace("Bearer ");

    if (!token) {
      throw new ApiError(403, "No Token Found !");
    }

    // decrypt token
    const dcryptedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!dcryptedToken || !dcryptedToken._id) {
      throw new ApiError(403, "Invalid Token, may be expired !");
    }

    // find user
    const user = await UserModel.findById(dcryptedToken._id).select(
      "-password -refreshAccessToken"
    );

    // add user to request
    req.user = user;

    next(); // next flag to run next middleware after this
  } catch (error) {
    console.error("Failed to verifyJWT :: ", error);
  }
};
