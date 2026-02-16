import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from './models/Test.js';

dotenv.config();

async function verifyFix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const category = 'INTER';
        console.log(`Searching for tests with category: ${category}`);

        // Logic from viewRoutes.js
        const tests = await Test.find({
            category: category.toUpperCase().trim()
        }).sort({ createdAt: -1 });

        console.log(`Verification Result: Found ${tests.length} tests for category ${category}`);

        if (tests.length > 0) {
            console.log('Tests found:');
            tests.forEach(t => console.group(`- Title: ${t.title} | Category: ${t.category}`));
        } else {
            console.log('No tests found. Checking if any tests exist in other categories...');
            const allTests = await Test.distinct('category');
            console.log('Categories currently in DB:', allTests);
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error during verification:', error);
    }
}

verifyFix();
