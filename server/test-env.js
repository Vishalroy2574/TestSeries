import dotenv from 'dotenv';
dotenv.config();
console.log('DEBUG: MONGO_URI =', process.env.MONGO_URI);
console.log('DEBUG: CWD =', process.cwd());
