import mongoose from "mongoose";

// ======================================
// SCAN JOB SCHEMA
// ======================================

const scanJobSchema =
  new mongoose.Schema(
    {
      target: {
        type: String,
        required: true,
      },

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },

      status: {
        type: String,
      
        enum: [
          "queued",
          "running",
          "completed",
          "failed",
        ],
      
        default: "queued",
      },

      progress: {
        type: Number,
        default: 0,
      },

      results: {
        type: Object,
        default: {},
      },

      startedAt: {
        type: Date,
      },

      completedAt: {
        type: Date,
      },
    },

    {
      timestamps: true,
    }
  );

// ======================================
// EXPORT MODEL
// ======================================

const ScanJob =
  mongoose.model(
    "ScanJob",
    scanJobSchema
  );

export default ScanJob;