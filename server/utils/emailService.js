import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const createTransporter = async () => {
  // Check if using real email service or test service
  const useTestEmail = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com';

  if (useTestEmail) {
    // Use Ethereal for testing (no real emails sent)
    console.log('⚠️  Using Ethereal test email service (emails won\'t be delivered)');
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Use Gmail for production
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Generate OTP email HTML template
const generateOTPEmailHTML = (otp, userName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #f43f5e;
          margin: 0;
          font-size: 28px;
        }
        .otp-box {
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
          color: white;
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          text-align: center;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .content {
          color: #555;
          font-size: 16px;
        }
        .content p {
          margin: 15px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #999;
          font-size: 14px;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Test Series Hub</h1>
          <p style="color: #666; margin-top: 10px;">Email Verification</p>
        </div>
        
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Thank you for registering with Test Series Hub! To complete your registration, please verify your email address using the OTP below:</p>
          
          <div class="otp-box">
            ${otp}
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This OTP will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
          </div>
          
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
        
        <div class="footer">
          <p>© 2026 Test Series Hub. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send OTP email
export const sendOTPEmail = async (email, otp, userName) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Test Series Hub" <${process.env.EMAIL_USER || 'noreply@testserieshub.com'}>`,
      to: email,
      subject: 'Verify Your Email - Test Series Hub',
      html: generateOTPEmailHTML(otp, userName),
      text: `Hello ${userName},\n\nYour OTP for email verification is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nThank you,\nTest Series Hub`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', info.messageId);

    // If using test email, log preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('📧 Preview email at:', previewUrl);
      console.log('⚠️  Note: This is a test email. Copy the OTP from the preview URL above.');
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send verification email. Please try again later.');
  }
};

// Send welcome email after successful verification (optional)
export const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Test Series Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Test Series Hub!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f43f5e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Test Series Hub!</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Your email has been successfully verified! You're now ready to explore our test series and start your learning journey.</p>
              <p style="text-align: center;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}" class="button">Get Started</a>
              </p>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy learning!<br>The Test Series Hub Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
  }
};
