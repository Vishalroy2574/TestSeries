let Razorpay;
try {
    const module = await import("razorpay");
    Razorpay = module.default;
} catch (err) {
    console.error("CRITICAL: razorpay module not found. Run 'npm install razorpay' to fix this.");
}

import jwt from "jsonwebtoken";
import crypto from "crypto";
import Purchase from "../models/Purchase.js";
import Test from "../models/Test.js";
import User from "../models/User.js";
import { sendPurchaseConfirmationEmail } from "../utils/emailService.js";

/* ══════════════════════════════════════════════════════
   RAZORPAY INSTANCE
══════════════════════════════════════════════════════ */
const getRazorpay = () => {
    if (!Razorpay) {
        throw new Error("Razorpay module is not installed. Please contact support or run 'npm install razorpay'.");
    }
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
        throw new Error("Razorpay credentials missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
    }
    return new Razorpay({ key_id, key_secret });
};

/* ══════════════════════════════════════════════════════
   1. CREATE RAZORPAY ORDER  —  POST /api/purchases/create-order/:testId
   Called by the purchase page before opening the Razorpay modal.
══════════════════════════════════════════════════════ */
export const createOrder = async (req, res) => {
    try {
        const { testId } = req.params;

        const test = await Test.findById(testId);
        if (!test) return res.status(404).json({ message: "Test not found" });
        if ((test.type || "FREE").toUpperCase() !== "PAID") {
            return res.status(400).json({ message: "This test is free and doesn't require purchase" });
        }

        // Already paid or Admin → just grant access
        const isAdmin = req.user.role === 'admin' || req.user.isAdmin;
        const existing = await Purchase.findOne({
            userId: req.user._id,
            testId,
            paymentStatus: "paid",
        });

        if (existing || isAdmin) {
            return res.status(400).json({
                message: isAdmin ? "Admin has full access." : "You have already purchased this test",
                alreadyPurchased: true
            });
        }

        const razorpay = getRazorpay();
        const amountPaise = Math.round((test.price || 0) * 100); // Razorpay uses paise

        const order = await razorpay.orders.create({
            amount: amountPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${testId.toString().slice(-6)}`,
            notes: {
                testId: testId.toString(),
                userId: req.user._id.toString(),
                testTitle: test.title,
            },
        });

        // Create a pending purchase record
        await Purchase.findOneAndUpdate(
            { userId: req.user._id, testId, paymentStatus: "pending" },
            {
                userId: req.user._id,
                testId,
                amountPaid: test.price,
                razorpayOrderId: order.id,
                paymentStatus: "pending",
                buyerName: req.body.buyerName || req.user.name,
                buyerEmail: req.body.buyerEmail || req.user.email,
                buyerPhone: req.body.buyerPhone || "",
            },
            { upsert: true, new: true }
        );

        return res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            testTitle: test.title,
            userName: req.user.name,
            userEmail: req.user.email,
        });
    } catch (error) {
    // Always return a useful error message, even if a non-Error is thrown
    let safeMessage =
      (error && error.message) ||
      (typeof error === "string" ? error : "") ||
      "";

    // If we still don't have a message, fall back to JSON stringification
    if (!safeMessage) {
      try {
        safeMessage = "Raw error: " + JSON.stringify(error);
      } catch {
        safeMessage = "Unknown error while creating order.";
      }
    }

        console.error("createOrder error:", error);
        res.status(500).json({
            message: safeMessage,
            name: error?.name || undefined,
        });
    }
};

/* ══════════════════════════════════════════════════════
   2. VERIFY PAYMENT  —  POST /api/purchases/verify/:testId
   Called after Razorpay payment success callback.
   Verifies signature, marks purchase as paid, sends email.
══════════════════════════════════════════════════════ */
export const verifyPayment = async (req, res) => {
    try {
        const { testId } = req.params;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            buyerName,
            buyerEmail,
            buyerPhone,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing payment verification fields" });
        }

        // ── Verify HMAC-SHA256 signature ──
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
        }

        // ── Mark purchase as paid ──
        const test = await Test.findById(testId);
        const purchase = await Purchase.findOneAndUpdate(
            { userId: req.user._id, testId, razorpayOrderId: razorpay_order_id },
            {
                paymentStatus: "paid",
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                buyerName: buyerName || req.user.name,
                buyerEmail: buyerEmail || req.user.email,
                buyerPhone: buyerPhone || "",
            },
            { new: true }
        );

        if (!purchase) {
            return res.status(404).json({ message: "Purchase record not found" });
        }

        // ── Send confirmation + PDF link email ──
        const baseUrl = process.env.CLIENT_URL || "http://localhost:5000";

        // Generate a secure access token for this specific test (valid for 30 days)
        // This allows one-click access from email without requiring session login.
        const accessToken = jwt.sign(
            { testId, userId: req.user._id, type: 'pdf_access' },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        const pdfViewUrl = `${baseUrl}/pdf/view/${testId}?token=${accessToken}`;
        const emailSent = await sendPurchaseConfirmationEmail({
            email: buyerEmail || req.user.email,
            userName: buyerName || req.user.name,
            testTitle: test?.title || "Test Series",
            testCategory: test?.category || "",
            amountPaid: purchase.amountPaid,
            pdfViewUrl,
            razorpayPaymentId: razorpay_payment_id,
        });

        if (emailSent) {
            purchase.pdfEmailSent = true;
            await purchase.save();
        }

        return res.json({
            message: "Payment verified successfully!",
            purchase,
            pdfViewUrl,
            emailSent,
        });
    } catch (error) {
    let safeMessage =
      (error && error.message) ||
      (typeof error === "string" ? error : "") ||
      "";

    if (!safeMessage) {
      try {
        safeMessage = "Raw error: " + JSON.stringify(error);
      } catch {
        safeMessage = "Unknown error while verifying payment.";
      }
    }

        console.error("verifyPayment error:", error);
        res.status(500).json({
            message: safeMessage,
            name: error?.name || undefined,
        });
    }
};

/* ══════════════════════════════════════════════════════
   3. GET USER PURCHASES  —  GET /api/purchases/
══════════════════════════════════════════════════════ */
export const getUserPurchases = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const purchases = await Purchase.find({ userId: req.user._id, paymentStatus: "paid" })
            .populate("testId")
            .sort({ purchaseDate: -1 });

        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ══════════════════════════════════════════════════════
   4. CHECK PURCHASE STATUS  —  GET /api/purchases/check/:testId
══════════════════════════════════════════════════════ */
export const checkPurchaseStatus = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { testId } = req.params;

        const purchase = await Purchase.findOne({
            userId: req.user._id,
            testId,
            paymentStatus: "paid",
        });

        res.json({
            hasPurchased: !!purchase,
            purchase: purchase || null,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ══════════════════════════════════════════════════════
   LEGACY — kept for backward compatibility
   POST /api/purchases/:testId  (old direct purchase, no payment)
   Now redirected to create-order flow gracefully
══════════════════════════════════════════════════════ */
export const purchaseTest = async (req, res) => {
    return res.status(400).json({
        message: "Please use the proper checkout page to purchase this test.",
        redirectTo: `/tests/${req.params.testId}/purchase`,
    });
};
