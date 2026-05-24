const mongoose = require('mongoose');

const PreferencesSchema = new mongoose.Schema(
  {
    theme: { type: String, default: 'dark' },
    notificationsEnabled: { type: Boolean, default: true },
    language: { type: String, default: 'en' }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      unique: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: /.+@.+\..+/
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin'],
      default: 'user'
    },
    preferences: {
      type: PreferencesSchema,
      default: () => ({})
    }
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

module.exports = mongoose.model('User', UserSchema);

