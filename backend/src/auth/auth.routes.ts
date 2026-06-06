import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import upload from '../middleware/uploadMiddleware';

import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  updateAvatar,
  uploadAvatar,
  updateAccount,
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

router.put(
  '/account',
  protect,
  updateAccount
);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:3000/login',
  }),
  async (req: any, res) => {

    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '7d',
      }
    );
  
    res.redirect(
      `http://localhost:3000/auth/success?token=${token}`
    );
  }
);

export default router;