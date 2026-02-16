import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Test from "./models/Test.js";

dotenv.config();

async function verifySetup() {
    try {
        console.log("🔍 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected\n");

        // Check for admin user
        console.log("🔍 Checking for admin users...");
        const admins = await User.find({ role: "admin" });
        console.log(`Found ${admins.length} admin user(s):`);
        admins.forEach(admin => {
            console.log(`  - ${admin.name} (${admin.email})`);
        });

        if (admins.length === 0) {
            console.log("\n⚠️  No admin users found!");
            console.log("Creating default admin...");

            const defaultAdmin = await User.create({
                name: "Admin",
                email: "admin@test.com",
                password: "admin123",
                role: "admin"
            });

            console.log(`✅ Created admin: ${defaultAdmin.email}`);
            console.log("   Password: admin123");
        }

        // Check for tests
        console.log("\n🔍 Checking for tests...");
        const tests = await Test.find().sort({ createdAt: -1 });
        console.log(`Found ${tests.length} test(s):`);
        tests.slice(0, 5).forEach(test => {
            console.log(`  - ${test.title} (${test.category})`);
        });

        console.log("\n✅ Verification complete!");
        console.log("\n📝 Next steps:");
        console.log("1. Navigate to http://localhost:5000/login");
        console.log("2. Login with admin credentials");
        console.log("3. Go to http://localhost:5000/admin");
        console.log("4. Test PDF upload and test creation");

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

verifySetup();
