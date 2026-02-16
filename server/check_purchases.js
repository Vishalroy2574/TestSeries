import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Purchase from './models/Purchase.js';
import User from './models/User.js';
import Test from './models/Test.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/examportal';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            const purchases = await Purchase.find().populate('userId').populate('testId');
            console.log(`Found ${purchases.length} total purchases:`);
            purchases.forEach(p => {
                console.log(`- User: ${p.userId?.name} (${p.userId?.email}), Test: ${p.testId?.title}, Date: ${p.purchaseDate}`);
            });

            const users = await User.find({}, { name: 1, email: 1 });
            console.log('\nUsers in DB:');
            users.forEach(u => console.log(`- ${u.name} (${u.email}) ID: ${u._id}`));

        } catch (err) {
            console.error('Error:', err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
