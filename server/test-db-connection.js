
import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        console.log(`URI: ${uri}`);
        await mongoose.connect(uri);
        console.log("MongoDB Connected Successfully");
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
