import mongoose from "mongoose";

// Mongoose uses the new URL parser and unified topology behavior by default.
export async function connectDB(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}
