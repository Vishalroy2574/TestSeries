
import mongoose from 'mongoose';
import Test from './models/Test.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/examportal';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Connected!');
    const tests = await Test.find({});
    console.log('Tests found:', tests.length);
    console.log(JSON.stringify(tests, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
