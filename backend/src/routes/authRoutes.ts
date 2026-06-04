import express from "express";

import {
  registerUser,
  loginUser,
  forgotPassword,
} from "../controllers/authController";

const router = express.Router();

// ======================================
// AUTH ROUTES
// ======================================

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post(
  "/forgot-password",
  forgotPassword
);

export default router;