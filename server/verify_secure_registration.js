import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import crypto from 'crypto';

dotenv.config();

const hashOTP = (otp) => {
    return crypto.createHash("sha256").update(otp).digest("hex");
};

async function testFlow() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const testEmail = 'test_verification_' + Date.now() + '@example.com';
        const testPassword = 'Password123';
        const testName = 'Test User';

        // 1. Create a user (simulate registration)
        console.log('\n--- Step 1: Simulating Registration ---');
        const otp = '123456';
        const otpHash = hashOTP(otp);
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const user = await User.create({
            name: testName,
            email: testEmail,
            password: testPassword,
            isVerified: false,
            otp: otpHash,
            otpExpires,
        });
        console.log('User created:', user.email, 'isVerified:', user.isVerified);

        // 2. Try to find user and check OTP
        console.log('\n--- Step 2: Checking OTP in DB ---');
        const foundUser = await User.findOne({ email: testEmail });
        console.log('OTP Match:', foundUser.otp === hashOTP(otp) ? 'YES' : 'NO');
        console.log('Is Verified (should be false):', foundUser.isVerified);

        // 3. Verify OTP (simulate verification)
        console.log('\n--- Step 3: Simulating Verification ---');
        foundUser.isVerified = true;
        foundUser.otp = undefined;
        foundUser.otpExpires = undefined;
        await foundUser.save();
        console.log('Verification simulation complete');

        // 4. Final check
        console.log('\n--- Step 4: Final DB Check ---');
        const finalUser = await User.findOne({ email: testEmail });
        console.log('isVerified (should be true):', finalUser.isVerified);
        console.log('OTP (should be undefined):', finalUser.otp === undefined ? 'YES' : 'NO');

        // Cleanup
        await User.deleteOne({ email: testEmail });
        console.log('\nTest cleanup successful');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testFlow();
