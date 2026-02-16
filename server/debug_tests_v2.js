
import mongoose from 'mongoose';
import Test from './models/Test.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/examportal';

console.log('Connecting to:', MONGO_URI);

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Connected!');
    const tests = await Test.find({});
    console.log(`Total Tests Found: ${tests.length}`);
    tests.forEach(t => {
        console.log(`ID: ${t._id} | Title: ${t.title} | Category: '${t.category}' | PDF: ${t.pdfUrl ? 'Yes' : 'No'}`);
    });

    // Check specifically for FINAL
    const finalTests = await Test.find({ category: 'FINAL' });
    console.log(`Tests with category 'FINAL': ${finalTests.length}`);

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
