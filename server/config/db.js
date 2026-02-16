import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is undefined. Check your .env file.");
    }

    // Mask URI for logging (hide password)
    const maskedUri = uri.replace(/:([^@]+)@/, ":****@");
    console.log(`Attempting to connect to MongoDB at: ${maskedUri}`);

    const conn = await mongoose.connect(uri, {
      family: 4, // Force IPv4 to resolve querySrv ECONNREFUSED
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

