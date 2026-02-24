import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/* ══════════════════════════════════════════════════════════
   TRANSPORTER
   Always uses real Gmail SMTP — no Ethereal fallback.
   Requires EMAIL_USER + EMAIL_PASSWORD in .env
════════════════════════════════════════════════════════════ */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      '❌ Email credentials missing. Set EMAIL_USER and EMAIL_PASSWORD in .env\n' +
      '   Use a Gmail App Password (16 chars) — NOT your regular Gmail password.\n' +
      '   Guide: https://support.google.com/accounts/answer/185833'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

/* ══════════════════════════════════════════════════════════
   OTP EMAIL TEMPLATE
════════════════════════════════════════════════════════════ */
const otpEmailHTML = (otp, userName) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Email Verification – Test Series Hub</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      background: #f1f5f9;
      padding: 32px 16px;
      color: #334155;
    }
    .wrapper { max-width: 560px; margin: 0 auto; }
    .card {
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%);
      padding: 36px 40px 32px;
      text-align: center;
    }
    .header-logo { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .header-sub  { color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 6px; }
    .body        { padding: 36px 40px; }
    .greeting    { font-size: 17px; font-weight: 600; margin-bottom: 12px; }
    .intro       { color: #64748b; font-size: 14px; line-height: 1.7; margin-bottom: 28px; }
    .otp-label   {
      text-align: center; font-size: 11px; font-weight: 700; color: #94a3b8;
      letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px;
    }
    .otp-code {
      background: #fef2f4;
      border: 2px dashed #fda4af;
      border-radius: 12px;
      padding: 20px 16px;
      text-align: center;
      font-size: 42px;
      font-weight: 900;
      letter-spacing: 14px;
      color: #f43f5e;
      font-family: 'Courier New', Courier, monospace;
    }
    .warning {
      display: flex; align-items: flex-start; gap: 10px;
      background: #fffbeb;
      border-left: 4px solid #fbbf24;
      border-radius: 8px;
      padding: 14px 16px;
      margin: 24px 0;
      font-size: 13px;
      color: #92400e;
      line-height: 1.5;
    }
    .warning-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
    .divider { border: none; border-top: 1px solid #f1f5f9; margin: 28px 0; }
    .footer  { text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.8; }
    .footer a { color: #f43f5e; text-decoration: none; }
    .meta { padding: 20px 40px; background: #f8fafc; text-align: center; }
    .meta-text { font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="header-logo">📚 Test Series Hub</div>
        <div class="header-sub">Email Verification</div>
      </div>
      <div class="body">
        <p class="greeting">Hello, ${userName}! 👋</p>
        <p class="intro">
          Thanks for signing up with <strong>Test Series Hub</strong>. To activate your account,
          please use the One-Time Password below. It is <strong>valid for 10 minutes</strong>
          and can only be used once.
        </p>

        <p class="otp-label">Your Verification Code</p>
        <div class="otp-code">${otp}</div>

        <div class="warning">
          <span class="warning-icon">⚠️</span>
          <div>
            <strong>Never share this code.</strong> Test Series Hub will never ask for
            your OTP via phone, email, or chat. If you did not request this, ignore this email —
            your account remains safe.
          </div>
        </div>

        <hr class="divider">
        <div class="footer">
          <p>© ${new Date().getFullYear()} Test Series Hub. All rights reserved.</p>
          <p>This is an automated email — please do not reply.</p>
        </div>
      </div>
      <div class="meta">
        <p class="meta-text">
          Sent to the email address used during registration.
          <br>Questions? <a href="mailto:${process.env.EMAIL_USER}">Contact Support</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/* ══════════════════════════════════════════════════════════
   WELCOME EMAIL TEMPLATE
════════════════════════════════════════════════════════════ */
const welcomeEmailHTML = (userName) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Welcome – Test Series Hub</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      background: #f1f5f9; padding: 32px 16px; color: #334155;
    }
    .wrapper { max-width: 560px; margin: 0 auto; }
    .card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%); padding: 40px; text-align: center; }
    .check-circle {
      width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 30px; margin-bottom: 16px;
    }
    .header h1 { color: #fff; font-size: 24px; font-weight: 800; }
    .header p  { color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 6px; }
    .body { padding: 36px 40px; }
    .body p { font-size: 14px; color: #64748b; line-height: 1.8; margin-bottom: 16px; }
    .highlight { color: #f43f5e; font-weight: 700; }
    .cta-wrap { text-align: center; margin: 28px 0; }
    .cta {
      display: inline-block;
      background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%);
      color: #fff !important; text-decoration: none;
      padding: 14px 36px; border-radius: 50px; font-weight: 700; font-size: 14px;
      box-shadow: 0 4px 14px rgba(244,63,94,0.4);
    }
    .divider { border: none; border-top: 1px solid #f1f5f9; margin: 24px 0; }
    .footer { text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.8; padding-bottom: 8px; }
    .footer a { color: #f43f5e; text-decoration: none; }
    .meta { padding: 20px 40px; background: #f8fafc; text-align: center; }
    .meta-text { font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="check-circle">✅</div>
        <h1>Account Verified!</h1>
        <p>Your account has been successfully registered.</p>
      </div>
      <div class="body">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>
          Great news — your email has been verified and your
          <span class="highlight">Test Series Hub</span> account is now fully active!
          You can explore our complete CA exam test series library.
        </p>
        <p>
          Whether you're preparing for <strong>CA Foundation</strong>,
          <strong>CA Inter</strong>, or <strong>CA Final</strong>, we're here to help you succeed!
        </p>
        <div class="cta-wrap">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}" class="cta">
            🚀 &nbsp;Explore Test Series
          </a>
        </div>
        <hr class="divider">
        <div class="footer">
          <p>© ${new Date().getFullYear()} Test Series Hub. All rights reserved.</p>
        </div>
      </div>
      <div class="meta">
        <p class="meta-text">You're receiving this because you registered at Test Series Hub.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/* ══════════════════════════════════════════════════════════
   EXPORTED FUNCTIONS
════════════════════════════════════════════════════════════ */

/**
 * Send OTP verification email via real Gmail SMTP.
 */
export const sendOTPEmail = async (email, otp, userName) => {
  const transporter = createTransporter();

  const from =
    process.env.EMAIL_FROM ||
    `"Test Series Hub" <${process.env.EMAIL_USER}>`;

  const info = await transporter.sendMail({
    from,
    to: email,
    subject: '🔐 Your OTP – Verify Your Test Series Hub Account',
    html: otpEmailHTML(otp, userName),
    text: `Hello ${userName},\n\nYour OTP for Test Series Hub is: ${otp}\n\nValid for 10 minutes. Do not share it with anyone.\n\n— Test Series Hub`,
  });

  console.log(`✅ OTP email sent to ${email} [${info.messageId}]`);
  return { success: true, messageId: info.messageId };
};

/**
 * Send welcome email after successful OTP verification (non-critical).
 */
export const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();
    const from =
      process.env.EMAIL_FROM ||
      `"Test Series Hub" <${process.env.EMAIL_USER}>`;

    await transporter.sendMail({
      from,
      to: email,
      subject: '🎉 Welcome to Test Series Hub – Registration Successful!',
      html: welcomeEmailHTML(userName),
      text: `Hello ${userName},\n\nYour account is now active. Log in and start your CA exam preparation!\n\n— Test Series Hub`,
    });

    console.log(`✅ Welcome email sent to ${email}`);
  } catch (err) {
    console.error(`❌ Welcome email failed (non-critical):`, err.message);
  }
};

/* ══════════════════════════════════════════════════════════
   PURCHASE CONFIRMATION + PDF LINK EMAIL
════════════════════════════════════════════════════════════ */
export const sendPurchaseConfirmationEmail = async ({
  email,
  userName,
  testTitle,
  testCategory,
  amountPaid,
  pdfViewUrl,
  razorpayPaymentId,
}) => {
  try {
    const transporter = createTransporter();
    const from =
      process.env.EMAIL_FROM ||
      `"Test Series Hub" <${process.env.EMAIL_USER}>`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Purchase Confirmed – Test Series Hub</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f1f5f9; padding: 32px 16px; color: #334155; }
    .wrapper { max-width: 560px; margin: 0 auto; }
    .card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 36px 40px; text-align: center; }
    .check { width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px; }
    .header h1 { color: #fff; font-size: 22px; font-weight: 800; }
    .header p { color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 6px; }
    .body { padding: 32px 40px; }
    .body p { font-size: 14px; color: #64748b; line-height: 1.8; margin-bottom: 14px; }
    .receipt { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .receipt-row:last-child { border-bottom: none; }
    .receipt-row .lbl { color: #94a3b8; }
    .receipt-row .val { font-weight: 700; color: #1e293b; }
    .cta-wrap { text-align: center; margin: 28px 0 8px; }
    .cta { display: inline-block; background: linear-gradient(135deg,#7c3aed,#5b21b6); color: #fff !important; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 14px rgba(124,58,237,0.4); }
    .note { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 10px; }
    .divider { border: none; border-top: 1px solid #f1f5f9; margin: 24px 0; }
    .footer { text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.8; padding-bottom: 8px; }
    .meta { padding: 18px 40px; background: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="check">✅</div>
        <h1>Payment Successful!</h1>
        <p>Your purchase has been confirmed.</p>
      </div>
      <div class="body">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Thank you for your purchase! Your access to <strong>${testTitle}</strong> has been unlocked. You can view your test PDF anytime using the button below.</p>

        <div class="receipt">
          <div class="receipt-row"><span class="lbl">Product</span><span class="val">${testTitle}</span></div>
          <div class="receipt-row"><span class="lbl">Category</span><span class="val">${testCategory}</span></div>
          <div class="receipt-row"><span class="lbl">Amount Paid</span><span class="val">₹${amountPaid}</span></div>
          <div class="receipt-row"><span class="lbl">Payment ID</span><span class="val" style="font-size:11px;">${razorpayPaymentId}</span></div>
          <div class="receipt-row"><span class="lbl">Access</span><span class="val" style="color:#7c3aed;">Lifetime ♾️</span></div>
        </div>

        <div class="cta-wrap">
          <a href="${pdfViewUrl}" class="cta">📄 &nbsp; View Your Test PDF</a>
        </div>
        <p class="note">Link opens directly in your browser. No additional login required if you are already signed in.</p>

        <hr class="divider">
        <div class="footer">
          <p>© ${new Date().getFullYear()} Test Series Hub. All rights reserved.</p>
          <p>Keep this email as your payment receipt.</p>
        </div>
      </div>
      <div class="meta">Questions? Reply to this email and we'll help you.</div>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from,
      to: email,
      subject: `✅ Payment Confirmed – You now have access to ${testTitle}`,
      html,
      text: `Hi ${userName},\n\nYour payment of ₹${amountPaid} for "${testTitle}" was successful.\n\nPayment ID: ${razorpayPaymentId}\n\nView your test PDF: ${pdfViewUrl}\n\n— Test Series Hub`,
    });

    console.log(`✅ Purchase confirmation email sent to ${email}`);
    return true;
  } catch (err) {
    console.error('❌ Purchase confirmation email failed:', err.message);
    return false;
  }
};
