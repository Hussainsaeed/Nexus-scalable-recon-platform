import mongoose from "mongoose";

const scanResultSchema = new mongoose.Schema({

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
      "pending",
      "running",
      "completed",
      "failed",
    ],
    default: "pending",
  },

  ports: [Number],

  openServices: [String],

  technologies: [
  {
    name: String,
    category: String,
  },
],

  vulnerabilities: {
    type: Array,
    default: [],
  },

  riskScore: {
    type: Number,
    default: 0,
  },

  scanDuration: Number,

  startedAt: Date,

  finishedAt: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

export default mongoose.model(
  "ScanResult",
  scanResultSchema
);