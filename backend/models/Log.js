const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      required: true,
      enum: ['debug', 'info', 'warn', 'error'],
      default: 'info'
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    meta: {
      type: Object,
      default: {}
    }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

LogSchema.index({ createdAt: -1 });
LogSchema.index({ level: 1 });

module.exports = mongoose.model('Log', LogSchema);

