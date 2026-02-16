import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from './models/Test.js';
import User from './models/User.js';
import Purchase from './models/Purchase.js';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/examportal';

async function run() {
    await mongoose.connect(MONGO_URI);
    try {
        const testId = '6991ff08d5807a6de4ccb999';
        const test = await Test.findById(testId);
        console.log('TEST DATA:', JSON.stringify(test, null, 2));

        const user = await User.findOne({ email: 'admin@gmail.com' }); // Assuming admin for now
        if (user) {
            console.log('USER DATA:', JSON.stringify(user, null, 2));
            const p = await Purchase.findOne({ userId: user._id, testId: test._id });
            console.log('PURCHASE RECORD:', JSON.stringify(p, null, 2));
        }

    } finally {
        await mongoose.disconnect();
    }
}
run();
