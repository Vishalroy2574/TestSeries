import mongoose from "mongoose";
import { createDefaultAdmin } from "../utils/createDefaultAdmin.js";

export const connectDB = async (opts = {}) => {
  const { retry = true, retryDelayMs = 10000 } = opts;

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is undefined. Check your .env file.");
    }

    // Mask URI for logging (hide password)
    const maskedUri = uri.replace(/:([^@]+)@/, ":****@");
    console.log(`Attempting to connect to MongoDB at: ${maskedUri}`);

    const conn = await mongoose.connect(uri, {
      family: 4, // Force IPv4 (often fixes querySrv ECONNREFUSED on Windows)
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Seed the admin account if it doesn't exist yet
    await createDefaultAdmin();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (
      String(error?.code) === "ECONNREFUSED" &&
      String(error?.syscall || "").toLowerCase().includes("querysrv")
    ) {
      console.error(
        "Tip: This usually means SRV DNS lookups are blocked on your network. Try using a non-SRV connection string (mongodb://...) or switch DNS (e.g. Google DNS 8.8.8.8) / network."
      );
    }
    if (retry) {
      console.error(`Retrying MongoDB connection in ${Math.round(retryDelayMs / 1000)}s...`);
      setTimeout(() => {
        // Fire-and-forget retry; keep server process alive
        connectDB({ retry: true, retryDelayMs }).catch(() => { });
      }, retryDelayMs);
      return null;
    }

    throw error;
  }
};

