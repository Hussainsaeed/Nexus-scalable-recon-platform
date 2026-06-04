import mongoose, { Schema, Document } from "mongoose";

// ======================================
// USER INTERFACE
// ======================================

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;

  createdAt: Date;
  updatedAt: Date;
  passwordResetToken?: string;
passwordResetExpires?: Date;
}

// ======================================
// USER SCHEMA
// ======================================

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
        type: String,
      
        enum: [
          "admin",
          "analyst",
          "user",
        ],
      
        default: "user",
      },
      passwordResetToken: {
        type: String,
      },
      
      passwordResetExpires: {
        type: Date,
      },
  },

  {
    timestamps: true,
  }
);

// ======================================
// USER MODEL
// ======================================

const User = mongoose.model<IUser>(
  "User",
  userSchema
);

export default User;