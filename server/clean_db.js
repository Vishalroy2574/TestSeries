
import mongoose from 'mongoose';
import Test from './models/Test.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/examportal';

console.log('Connecting to:', MONGO_URI);

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Connected!');

    const result = await Test.deleteMany({
        $or: [
            { pdfUrl: "undefined" },
            { pdfUrl: { $exists: false } },
            { pdfUrl: null },
            { pdfUrl: "" }
        ]
    });

    console.log(`Deleted ${result.deletedCount} malformed tests.`);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
