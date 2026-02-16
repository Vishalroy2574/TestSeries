import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from './models/Test.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/examportal';

console.log('Connecting to MongoDB at:', MONGO_URI);

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            const tests = await Test.find({}, { title: 1, category: 1, createdAt: 1 });
            console.log(`Found ${tests.length} tests in the database:`);
            tests.forEach(t => {
                console.log(`- ID: ${t._id}, Title: "${t.title}", Category: "${t.category}", Created: ${t.createdAt}`);
            });

            if (tests.length === 0) {
                console.log('No tests found. This might explain why nothing is showing up.');
            }
        } catch (err) {
            console.error('Error querying tests:', err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
