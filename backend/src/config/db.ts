import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI as string
    );

    console.log("====================================");
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log("====================================");

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);

    process.exit(1);
  }
};

export default connectDB;