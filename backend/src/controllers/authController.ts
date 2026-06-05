import { Request, Response } from "express";
import dotenv from 'dotenv';

dotenv.config();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.model";
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// ======================================
// MAIL TRANSPORTER
// ======================================

const transporter =
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,

    port: Number(
      process.env.SMTP_PORT
    ),

    secure: false,

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log(
    "SMTP_HOST =",
    process.env.SMTP_HOST
  );
  
  console.log(
    "SMTP_PORT =",
    process.env.SMTP_PORT
  );
  
  console.log(
    "SMTP_USER =",
    process.env.SMTP_USER
  );

// ======================================
// REGISTER USER
// ======================================

export const registerUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, password } = req.body;

    // ======================================
    // Validation
    // ======================================

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    // ======================================
    // Email Validation
    // ======================================

    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // ======================================
    // Password Validation
    // ======================================

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
    }

    // ======================================
    // Check Existing User
    // ======================================

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists",
      });
    }

    // ======================================
    // Hash Password
    // ======================================

    const saltRounds = Number(
      process.env.BCRYPT_SALT_ROUNDS
    );

    const hashedPassword = await bcrypt.hash(
      password,
      saltRounds
    );

    // ======================================
    // Create User
    // ======================================

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // ======================================
    // Generate JWT Token
    // ======================================

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },

      process.env.JWT_SECRET as string,

      {
        expiresIn:
          (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
      }
    );

    console.log("JWT TOKEN:");
    console.log(token);

    // ======================================
    // Response
    // ======================================

    return res.status(201).json({
      success: true,
      message: "User registered successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Registration failed",
    });
  }
};

// ======================================
// LOGIN USER
// ======================================

export const loginUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    // ======================================
    // Validation
    // ======================================

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // ======================================
    // Find User
    // ======================================

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // ======================================
    // Compare Password
    // ======================================

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // ======================================
    // Generate JWT Token
    // ======================================

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },

      process.env.JWT_SECRET as string,

      {
        expiresIn:
          (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
      }
    );

    console.log("JWT TOKEN:");
    console.log(token);

    // ======================================
    // Response
    // ======================================

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
};
export const forgotPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const resetToken =
      crypto.randomBytes(32)
        .toString("hex");

    user.passwordResetToken =
      resetToken;

    user.passwordResetExpires =
      new Date(
        Date.now() +
        1000 * 60 * 60
      );

    await user.save();

    const resetUrl =
  `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

  console.log(
    'RESET URL:',
    resetUrl
  );

  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
  
    to: user.email,
  
    subject: 'Reset Password',
  
    html: `
  <h1>Nexus Recon Platform</h1>

  <h2>Password Reset</h2>

  <p>Click the button below:</p>

  <a href="${resetUrl}">
    Reset Password
  </a>
`,
  });
  
  console.log('EMAIL SENT:', info);

return res.status(200).json({
  success: true,
  message:
    "Password reset email sent",
});

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error:
        "Forgot password failed",
    });

  }
};

export const resetPassword = async (
  req: Request,
  res: Response
) => {
  try {

    const { token } = req.params;

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Password is required",
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    const saltRounds = Number(
      process.env.BCRYPT_SALT_ROUNDS
    );

    const hashedPassword =
      await bcrypt.hash(
        password,
        saltRounds
      );

    user.password =
      hashedPassword;

    user.passwordResetToken =
      undefined;

    user.passwordResetExpires =
      undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password updated successfully",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error:
        "Password reset failed",
    });

  }
};
export const getMe = async (
  req: any,
  res: Response
) => {
  try {

    const user = await User.findById(
      req.user.id
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.json({
      success: true,
      user,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: 'Server error',
    });

  }
};
export const updateAvatar = async (
  req: any,
  res: Response
) => {
  try {

    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        error: "Avatar is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatar,
      },
      {
        new: true,
      }
    ).select("-password");

    return res.json({
      success: true,
      user,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Avatar update failed",
    });

  }
};

export const uploadAvatar = async (
  req: any,
  res: Response
) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const avatar =
      `http://localhost:5000/uploads/${req.file.filename}`;

    const user =
      await User.findByIdAndUpdate(
        req.user.id,
        { avatar },
        { new: true }
      ).select('-password');

    return res.json({
      success: true,
      user,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: 'Upload failed',
    });

  }
};