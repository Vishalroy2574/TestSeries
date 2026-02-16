import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from './models/Test.js';

dotenv.config();

async function checkDb() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const tests = await Test.find({});
        console.log('Total tests found:', tests.length);

        tests.forEach(test => {
            console.log(`Title: ${test.title} | Category: ${test.category} | Type: ${test.type}`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkDb();
