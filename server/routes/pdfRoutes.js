import express from "express";
import { authenticateSession } from "../middleware/sessionAuth.js";
import { checkTestAccess } from "../middleware/checkTestAccess.js";
import jwt from "jsonwebtoken";
import Test from "../models/Test.js";
import Purchase from "../models/Purchase.js";

const router = express.Router();

// Proxy endpoint to serve PDFs inline (handles both session and token-based access)
router.get("/view/:testId", async (req, res, next) => {
    try {
        const { testId } = req.params;
        const { token } = req.query;

        // 1. Check for token-based access (Magic Link from email)
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.testId === testId && decoded.type === 'pdf_access') {
                    const test = await Test.findById(testId);
                    if (!test) return res.status(404).send("Test not found");

                    const purchase = await Purchase.findOne({
                        userId: decoded.userId,
                        testId: testId,
                        paymentStatus: "paid"
                    });

                    if (purchase) {
                        req.test = test;
                        return next();
                    }
                }
            } catch (err) {
                console.error("PDF Magic Link Verification failed:", err.message);
            }
        }

        // 2. Fallback: Session-based access
        authenticateSession(req, res, () => {
            if (!req.user) {
                const returnTo = encodeURIComponent(req.originalUrl || req.url);
                return res.redirect(`/login?returnTo=${returnTo}`);
            }
            // Use the standard access check middleware
            checkTestAccess(req, res, next);
        });

    } catch (error) {
        console.error("PDF access validation error:", error);
        res.status(500).send("Error validating access");
    }
}, async (req, res) => {
    try {
        const test = req.test;
        if (!test?.pdfUrl) return res.status(404).send("PDF URL not found");

        console.log(`[PDF Proxy] Fetching from Cloudinary: ${test.pdfUrl}`);

        const response = await fetch(test.pdfUrl);
        if (!response.ok) {
            console.error(`[PDF Proxy] Cloudinary returned ${response.status}: ${response.statusText}`);
            return res.status(500).send("Failed to fetch PDF from storage");
        }

        const buffer = await response.arrayBuffer();

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline",
            "Cache-Control": "public, max-age=86400"
        });

        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error("PDF Fetching Error:", error);
        res.status(500).send("Error loading PDF: Connection timeout or network error.");
    }
});

export default router;
