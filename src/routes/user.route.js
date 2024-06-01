import { Router } from "express";
import {
  changePassword,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  updateBio,
  updateAvatar,
  getCurrentUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

export const router = Router();

// create routes
router.route("/auth/register").post(registerUser);
router.route("/auth/login").post(loginUser);
router.route("/auth/refresh-tokens").post(refreshToken);

// secure routes
router.route("/auth/logout").post(verifyJWT, logoutUser);
router.route("/change-password").patch(verifyJWT, changePassword);
router
  .route("/update-avatar")
  .post(upload.single("avatar"), verifyJWT, updateAvatar);
router.route("/update-bio").post(verifyJWT, updateBio);
router.route("/get-current-user").get(verifyJWT, getCurrentUser)
