import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const router = Router();

// create routes
router.route("/auth/register").post(registerUser);
router.route("/auth/login").post(loginUser);

// secure routes
router.route("/auth/logout").post(verifyJWT, logoutUser);
