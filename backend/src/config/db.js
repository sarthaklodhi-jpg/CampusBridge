import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is required. Add your MongoDB Atlas connection string.");
  }

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== "production"
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
};
