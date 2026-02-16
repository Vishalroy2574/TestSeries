import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from './models/Test.js';

dotenv.config();

async function normalizeData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const tests = await Test.find({});
        console.log(`Found ${tests.length} tests. Starting normalization...`);

        for (const test of tests) {
            let updated = false;

            // Normalize Category
            const oldCategory = test.category;
            // Handle variations like "CA Inter", "CA INTER", "inter" -> "INTER"
            let newCategory = test.category;
            if (test.category.toUpperCase().includes('INTER')) newCategory = 'INTER';
            else if (test.category.toUpperCase().includes('FINAL')) newCategory = 'FINAL';
            else if (test.category.toUpperCase().includes('CA')) newCategory = 'CA';
            else newCategory = test.category.toUpperCase().trim();

            if (oldCategory !== newCategory) {
                test.category = newCategory;
                updated = true;
            }

            // Normalize Type
            const oldType = test.type;
            const newType = (test.type || 'FREE').toUpperCase().trim();
            if (oldType !== newType) {
                test.type = newType;
                updated = true;
            }

            if (updated) {
                await test.save();
                console.log(`Updated test: "${test.title}" | Category: ${oldCategory} -> ${newCategory} | Type: ${oldType} -> ${newType}`);
            }
        }

        console.log('Normalization complete.');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error during normalization:', error);
    }
}

normalizeData();
