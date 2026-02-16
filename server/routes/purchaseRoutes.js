import express from "express";
import {
    purchaseTest,
    getUserPurchases,
    checkPurchaseStatus,
} from "../controllers/purchaseController.js";
import { requireAuth } from "../middleware/sessionAuth.js";

const router = express.Router();

// All purchase routes require authentication
router.use(requireAuth);

// Purchase a test
router.post("/:testId", purchaseTest);

// Get all purchases for the logged-in user
router.get("/", getUserPurchases);

// Check if user has purchased a specific test
router.get("/check/:testId", checkPurchaseStatus);

export default router;
