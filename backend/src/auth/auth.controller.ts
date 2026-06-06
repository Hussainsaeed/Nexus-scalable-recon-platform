import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/User.model';
import { sendEmail }
  from '../utils/sendEmail';

// ======================================
// REGISTER
// ======================================

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          'User already exists',
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name,
        email,
        password:
          hashedPassword,
      });

    return res.status(201).json({
      success: true,
      message:
        'User registered successfully',
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
      message:
        'Server error',
    });
  }
};

// ======================================
// LOGIN
// ======================================

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid credentials',
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid credentials',
      });
    }

    const token =
      jwt.sign(
        {
          userId: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: '7d',
        }
      );

    return res.json({
      success: true,
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
      message:
        'Server error',
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
        message: 'Email is required',
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const resetToken =
      crypto.randomBytes(32)
        .toString('hex');

    user.passwordResetToken =
      resetToken;

    user.passwordResetExpires =
      new Date(
        Date.now() +
        1000 * 60 * 60
      );

    await user.save();

    const resetUrl =
`${process.env.FRONTEND_URL}
/auth/reset-password/${resetToken}`;

await sendEmail(
  user.email,
  'Reset Password',
  `
    <h2>Password Reset</h2>

    <p>
      Click the link below
      to reset your password
    </p>

    <a href="${resetUrl}">
      Reset Password
    </a>

    <p>
      This link expires
      in 1 hour.
    </p>
  `
);

return res.json({
  success: true,
  message:
    'Password reset email sent',
});

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Server error',
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
        message: 'Password is required',
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
        message: 'Invalid or expired token',
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.json({
      success: true,
      message:
        'Password updated successfully',
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });

  }
};

export const updateAccount = async (
  req: any,
  res: Response
) => {
  try {

    const {
      name,
      currentPassword,
      newPassword,
    } = req.body;

    const user =
      await User.findById(
        req.user.Id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) {
      user.name = name;
    }

    if (
      currentPassword &&
      newPassword
    ) {

      const isMatch =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message:
            'Current password is incorrect',
        });
      }

      user.password =
        await bcrypt.hash(
          newPassword,
          10
        );
    }

    await user.save();

    return res.json({
      success: true,
      message:
        'Account updated successfully',
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Server error',
    });

  }
};