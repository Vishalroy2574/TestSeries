import Purchase from "../models/Purchase.js";
import Test from "../models/Test.js";

/**
 * Middleware to check if user has access to a test
 * - FREE tests: always accessible
 * - PAID tests: require purchase
 */
export const checkTestAccess = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const testId = req.params.id || req.params.testId;

        if (!testId) {
            return res.status(400).json({ message: "Test ID is required" });
        }

        // Get the test
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }

        // If test is FREE, allow access
        const testType = (test.type || "FREE").toUpperCase();
        if (testType === "FREE") {
            req.hasPurchased = true;
            req.test = test;
            return next();
        }

        // If test is PAID, check if user has purchased it and payment is successful
        const purchase = await Purchase.findOne({
            userId: req.user._id,
            testId: testId,
            paymentStatus: "paid",
        });

        if (!purchase) {
            return res.status(403).json({
                message: "Access denied. Please purchase this test to view it.",
                requiresPurchase: true,
            });
        }

        req.hasPurchased = true;
        req.test = test;
        next();
    } catch (error) {
        console.error("Access check error:", error);
        res.status(500).json({ message: error.message });
    }
};
