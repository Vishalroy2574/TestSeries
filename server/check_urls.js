
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

    // Find tests where pdfUrl is "undefined" string or null or empty
    const malformedTests = await Test.find({
        $or: [
            { pdfUrl: "undefined" },
            { pdfUrl: { $exists: false } },
            { pdfUrl: null }
        ]
    });

    console.log(`Found ${malformedTests.length} potentially malformed tests.`);

    malformedTests.forEach(t => {
        console.log(`ID: ${t._id} | Title: "${t.title}" | pdfUrl: "${t.pdfUrl}"`);
    });

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
