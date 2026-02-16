import dotenv from "dotenv";
import mongoose from "mongoose";
import Test from "./models/Test.js";

dotenv.config();

async function fixPdfUrls() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Find all tests with PDF URLs containing /image/upload/
        const testsWithBrokenUrls = await Test.find({
            pdfUrl: { $regex: "/image/upload/" }
        });

        console.log(`\n📋 Found ${testsWithBrokenUrls.length} tests with broken PDF URLs\n`);

        if (testsWithBrokenUrls.length === 0) {
            console.log("✅ No broken URLs to fix!");
            process.exit(0);
        }

        // Fix each URL
        for (const test of testsWithBrokenUrls) {
            const oldUrl = test.pdfUrl;
            const newUrl = oldUrl.replace("/image/upload/", "/raw/upload/");

            console.log(`📝 Fixing: ${test.title}`);
            console.log(`   Old: ${oldUrl}`);
            console.log(`   New: ${newUrl}\n`);

            test.pdfUrl = newUrl;
            await test.save();
        }

        console.log(`✅ Successfully fixed ${testsWithBrokenUrls.length} PDF URLs!`);

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 Database connection closed");
        process.exit(0);
    }
}

fixPdfUrls();
