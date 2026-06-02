import { Request, Response } from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.model";

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
          process.env.JWT_EXPIRES_IN || "7d",
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
          process.env.JWT_EXPIRES_IN || "7d",
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