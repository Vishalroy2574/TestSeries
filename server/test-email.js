import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing email configuration...\n');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('\n');

const testEmail = async () => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Verify connection
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!\n');

        // Send test email
        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: 'Test Email - OTP System',
            text: 'This is a test email from your OTP verification system. If you received this, your email configuration is working correctly!',
            html: '<h1>Test Email</h1><p>This is a test email from your OTP verification system. If you received this, your email configuration is working correctly!</p>',
        });

        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('\nCheck your inbox at:', process.env.EMAIL_USER);
    } catch (error) {
        console.error('❌ Email test failed:');
        console.error('Error:', error.message);
        console.error('\nTroubleshooting steps:');
        console.error('1. Make sure you have 2-Step Verification enabled on your Gmail account');
        console.error('2. Generate an App Password at: https://myaccount.google.com/apppasswords');
        console.error('3. Use the App Password (16 characters) in EMAIL_PASSWORD, not your regular Gmail password');
        console.error('4. Make sure EMAIL_USER is your full Gmail address (e.g., yourname@gmail.com)');
    }
};

testEmail();
