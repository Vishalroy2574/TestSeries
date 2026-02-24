import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { sendOTPEmail, sendWelcomeEmail } from "../utils/emailService.js";

/* ══════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════ */
const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const hashOTP = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/** Block known disposable/temporary email providers */
const DISPOSABLE_DOMAINS = new Set([
  "yopmail.com", "tempmail.com", "guerrillamail.com", "sharklasers.com",
  "mailinator.com", "trashmail.com", "throwaway.email", "maildrop.cc",
  "getairmail.com", "dispostable.com", "fakeinbox.com", "spamgourmet.com",
  "10minutemail.com", "temp-mail.org", "disposablemail.com", "getnada.com",
  "mohmal.com", "tempr.email", "discard.email", "mailnull.com",
  "spamgourmet.net", "spamgourmet.org", "mintemail.com", "trashmail.net",
  "trashmail.at", "trashmail.io", "trashmail.me", "trashmail.xyz",
]);

const isDisposableEmail = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain);
};

/** Redirect (HTML) or JSON error */
const handleError = (req, res, status, message, redirectPath) => {
  if (req.headers.accept?.includes("text/html")) {
    return res.redirect(`${redirectPath}?error=${encodeURIComponent(message)}`);
  }
  return res.status(status).json({ message });
};

/* ══════════════════════════════════════════════════════
   REGISTER  —  POST /api/auth/register
   Amazon-like flow:
     1. Validate email (format + disposable check)
     2. Send OTP to the real inbox
     3. User must verify OTP before account is active
══════════════════════════════════════════════════════ */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = (email || "").toLowerCase().trim();

    /* ── 1. Presence check ── */
    if (!name || !normalizedEmail || !password) {
      return handleError(req, res, 400, "Please provide all fields.", "/register");
    }

    /* ── 2. Email format ── */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return handleError(req, res, 400, "Invalid email format. Example: you@gmail.com", "/register");
    }

    /* ── 3. Block disposable / temporary emails ── */
    if (isDisposableEmail(normalizedEmail)) {
      return handleError(
        req, res, 400,
        "Disposable or temporary email addresses are not allowed. Please use your real email.",
        "/register"
      );
    }

    /* ── 4. Password strength ── */
    if (password.length < 6) {
      return handleError(req, res, 400, "Password must be at least 6 characters.", "/register");
    }

    /* ── 5. Check for existing verified account ── */
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (existingUser.isVerified) {
        // Already registered & verified → send to login
        return handleError(req, res, 400, "This email is already registered. Please sign in.", "/register");
      }

      /* Unverified account exists — resend OTP (with cooldown) */
      const now = new Date();
      const canResend =
        !existingUser.otpLastResend ||
        now - existingUser.otpLastResend > RESEND_COOLDOWN_SECONDS * 1000;

      if (!canResend) {
        const remaining = Math.ceil(
          (RESEND_COOLDOWN_SECONDS * 1000 - (now - existingUser.otpLastResend)) / 1000
        );
        return handleError(
          req, res, 429,
          `An OTP was already sent. Please wait ${remaining}s before trying again.`,
          "/register"
        );
      }

      // Update password in case they changed it, regenerate OTP
      existingUser.password = password;           // re-hash happens via pre-save hook
      existingUser.name = name.trim();
      existingUser.phone = phone || existingUser.phone; // Update phone if provided
      const otp = generateOTP();
      existingUser.otp = hashOTP(otp);
      existingUser.otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
      existingUser.otpLastResend = now;
      existingUser.otpAttempts = 0;
      await existingUser.save();

      await sendOTPEmail(existingUser.email, otp, existingUser.name);
      req.session.pendingVerificationEmail = existingUser.email;

      if (req.headers.accept?.includes("text/html")) {
        return req.session.save((err) => {
          if (err) return next(err);
          const returnTo = req.body.returnTo || req.query.returnTo || "";
          let url = "/verify-otp?email=" + encodeURIComponent(existingUser.email) +
            "&success=" + encodeURIComponent("A new OTP has been sent to your email.");
          if (returnTo) url += "&returnTo=" + encodeURIComponent(returnTo);
          res.redirect(url);
        });
      }
      return res.status(200).json({ message: "OTP resent. Please verify your email." });
    }

    /* ── 6. New user: create (unverified) + send OTP ── */
    const otp = generateOTP();
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone || "",
      role: "student",
      isVerified: false,
      otp: hashOTP(otp),
      otpExpires: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      otpAttempts: 0,
    });

    // Send real OTP email via nodemailer (Gmail SMTP)
    await sendOTPEmail(user.email, otp, user.name);

    req.session.pendingVerificationEmail = user.email;

    if (req.headers.accept?.includes("text/html")) {
      return req.session.save((err) => {
        if (err) return next(err);
        const returnTo = req.body.returnTo || req.query.returnTo || "";
        let url = "/verify-otp?email=" + encodeURIComponent(user.email);
        if (returnTo) url += "&returnTo=" + encodeURIComponent(returnTo);
        res.redirect(url);
      });
    }

    return res.status(201).json({
      message: "OTP sent to your email. Please verify to complete registration.",
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

/* ══════════════════════════════════════════════════════
   VERIFY OTP  —  POST /api/auth/verify-otp
══════════════════════════════════════════════════════ */
export const verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;

    // Accept email from session OR query param (fallback for session loss)
    const email =
      req.session.pendingVerificationEmail ||
      req.body.email ||
      req.query.email;

    if (!email) {
      return handleError(req, res, 400, "Session expired. Please register again.", "/register");
    }

    if (!otp || otp.trim() === "") {
      return handleError(req, res, 400, "Please enter the OTP.", "/verify-otp");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return handleError(req, res, 404, "User not found. Please register again.", "/register");
    }

    if (user.isVerified) {
      return handleError(req, res, 400, "Account already verified. Please sign in.", "/login");
    }

    /* Brute-force protection */
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return handleError(
        req, res, 429,
        "Too many failed attempts. Please request a new OTP.",
        "/verify-otp"
      );
    }

    /* Expiry check */
    if (!user.otpExpires || user.otpExpires < Date.now()) {
      return handleError(req, res, 400, "OTP has expired. Please request a new one.", "/verify-otp");
    }

    /* OTP match */
    if (user.otp !== hashOTP(otp.trim())) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();

      const attemptsLeft = MAX_OTP_ATTEMPTS - user.otpAttempts;
      if (attemptsLeft <= 0) {
        return handleError(req, res, 429, "Too many failed attempts. Please request a new OTP.", "/verify-otp");
      }
      return handleError(
        req, res, 400,
        `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`,
        "/verify-otp"
      );
    }

    /* ── Success: activate account ── */
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpLastResend = undefined;
    await user.save();

    /* Send welcome email (non-critical) */
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailErr) {
      console.error("Welcome email failed (non-critical):", emailErr.message);
    }

    /* Create session */
    const token = generateToken(user._id, user.role);
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      isAdmin: user.role === "admin",
    };
    req.session.token = token;
    delete req.session.pendingVerificationEmail;

    if (req.headers.accept?.includes("text/html")) {
      return req.session.save((err) => {
        if (err) return next(err);
        const returnTo = req.body.returnTo || req.query.returnTo || "/";
        res.redirect(returnTo);
      });
    }

    return res.json({
      message: "Email verified. Your account is now active.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

/* ══════════════════════════════════════════════════════
   RESEND OTP  —  POST /api/auth/resend-otp
══════════════════════════════════════════════════════ */
export const resendOTP = async (req, res, next) => {
  try {
    const email =
      req.session.pendingVerificationEmail ||
      req.body.email;

    if (!email) {
      return res.status(400).json({ message: "Session expired. Please register again." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please register again." });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "This account is already verified." });
    }

    /* Rate limit */
    const now = new Date();
    if (user.otpLastResend && now - user.otpLastResend < RESEND_COOLDOWN_SECONDS * 1000) {
      const remaining = Math.ceil(
        (RESEND_COOLDOWN_SECONDS * 1000 - (now - user.otpLastResend)) / 1000
      );
      return res.status(429).json({
        message: `Please wait ${remaining}s before resending.`,
      });
    }

    const otp = generateOTP();
    user.otp = hashOTP(otp);
    user.otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.otpLastResend = now;
    user.otpAttempts = 0;
    await user.save();

    await sendOTPEmail(email, otp, user.name);

    return res.json({ message: "OTP resent. Please check your inbox." });
  } catch (error) {
    next(error);
  }
};

/* ══════════════════════════════════════════════════════
   LOGIN  —  POST /api/auth/login
   • Admin (vishalroy2574@gmail.com): direct login, no OTP
   • Everyone else: must be registered + verified first
══════════════════════════════════════════════════════ */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || "").toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return handleError(req, res, 400, "Please provide email and password.", "/login");
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return handleError(req, res, 401, "Invalid email or password.", "/login");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return handleError(req, res, 401, "Invalid email or password.", "/login");
    }

    /* Unverified account → redirect to OTP page (skip for admin) */
    if (!user.isVerified && user.role !== "admin") {
      // Re-send OTP so they can verify
      const now = new Date();
      if (!user.otpLastResend || now - user.otpLastResend > RESEND_COOLDOWN_SECONDS * 1000) {
        const otp = generateOTP();
        user.otp = hashOTP(otp);
        user.otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        user.otpLastResend = now;
        user.otpAttempts = 0;
        await user.save();
        try { await sendOTPEmail(user.email, otp, user.name); } catch (_) { /* non-critical */ }
      }

      req.session.pendingVerificationEmail = user.email;

      if (req.headers.accept?.includes("text/html")) {
        return req.session.save((err) => {
          if (err) return next(err);
          const returnTo = req.body.returnTo || req.query.returnTo || "";
          let url = "/verify-otp?email=" + encodeURIComponent(user.email) +
            "&error=" + encodeURIComponent("Please verify your email first. A new OTP has been sent to your inbox.");
          if (returnTo) url += "&returnTo=" + encodeURIComponent(returnTo);
          res.redirect(url);
        });
      }
      return res.status(403).json({
        message: "Email not verified. Check your inbox for the OTP.",
        requiresVerification: true,
      });
    }

    /* ── Create session and log in ── */
    const token = generateToken(user._id, user.role);
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      isAdmin: user.role === "admin",
    };
    req.session.token = token;

    if (req.headers.accept?.includes("text/html")) {
      return req.session.save((err) => {
        if (err) return next(err);
        const returnTo = req.body.returnTo || req.query.returnTo || "/";
        res.redirect(returnTo);
      });
    }

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};
