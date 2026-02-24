import express from "express";
import {
    createOrder,
    verifyPayment,
    getUserPurchases,
    checkPurchaseStatus,
    purchaseTest,
} from "../controllers/purchaseController.js";
import { requireAuth } from "../middleware/sessionAuth.js";

const router = express.Router();

// All purchase routes require authentication
router.use(requireAuth);

// Create a Razorpay order (called before opening modal)
router.post("/create-order/:testId", createOrder);

// Verify payment after Razorpay callback
router.post("/verify/:testId", verifyPayment);

// Get all purchases for the logged-in user
router.get("/", getUserPurchases);

// Check if user has purchased a specific test
router.get("/check/:testId", checkPurchaseStatus);

// Legacy stub
router.post("/:testId", purchaseTest);

export default router;
