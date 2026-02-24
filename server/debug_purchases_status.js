import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Purchase from './models/Purchase.js';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/examportal';

async function check() {
    await mongoose.connect(MONGO_URI);
    try {
        const purchases = await Purchase.find();
        console.log('Total Purchases:', purchases.length);
        purchases.forEach(p => {
            console.log(`ID: ${p._id}, User: ${p.userId}, Test: ${p.testId}, Status: ${p.paymentStatus}, OrderID: ${p.razorpayOrderId}`);
        });
    } finally {
        await mongoose.disconnect();
    }
}
check();
