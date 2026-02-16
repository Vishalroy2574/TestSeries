import Purchase from "../models/Purchase.js";
import Test from "../models/Test.js";

/* ================= PURCHASE TEST ================= */
export const purchaseTest = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { testId } = req.params;

        // Check if test exists and is PAID
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }

        if (test.type !== "PAID") {
            return res.status(400).json({ message: "This test is free and doesn't require purchase" });
        }

        // Check if already purchased
        const existingPurchase = await Purchase.findOne({
            userId: req.user._id,
            testId: testId,
        });

        if (existingPurchase) {
            return res.status(400).json({ message: "You have already purchased this test" });
        }

        // Create purchase record
        const purchase = new Purchase({
            userId: req.user._id,
            testId: testId,
            amountPaid: test.price,
        });

        await purchase.save();

        res.status(201).json({
            message: "Test purchased successfully",
            purchase,
        });
    } catch (error) {
        console.error("Purchase error:", error);
        res.status(500).json({ message: error.message });
    }
};

/* ================= GET USER PURCHASES ================= */
export const getUserPurchases = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const purchases = await Purchase.find({ userId: req.user._id })
            .populate("testId")
            .sort({ purchaseDate: -1 });

        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ================= CHECK PURCHASE STATUS ================= */
export const checkPurchaseStatus = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { testId } = req.params;

        const purchase = await Purchase.findOne({
            userId: req.user._id,
            testId: testId,
        });

        res.json({
            hasPurchased: !!purchase,
            purchase: purchase || null,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
