import { Router } from 'express';
import upload from '../middleware/uploadMiddleware';

import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  updateAvatar,
  uploadAvatar,
} from "../controllers/authController";

import protect from '../middleware/authMiddleware';

console.log("AUTH ROUTES LOADED");

const router = Router();

router.post(
  '/register',
  registerUser
);

router.post(
  '/login',
  loginUser
);

router.post(
  "/forgot-password",
  forgotPassword
);
router.post(
  "/reset-password/:token",
  resetPassword
);

router.get(
  '/me',
  protect,
  getMe
);

router.put(
  '/avatar',
  protect,
  updateAvatar
);

router.post(
  '/upload-avatar',
  protect,
  upload.single('avatar'),
  uploadAvatar
);

export default router;