import express from "express";
import { requireAuth } from "../middleware/sessionAuth.js";
import { checkTestAccess } from "../middleware/checkTestAccess.js";

const router = express.Router();

// Proxy endpoint to serve PDFs inline (with access control)
router.get("/view/:testId", requireAuth, checkTestAccess, async (req, res) => {
    try {
        // Test is already loaded by checkTestAccess middleware
        const test = req.test;

        if (!test || !test.pdfUrl) {
            return res.status(404).send("PDF not found");
        }

        // Fetch PDF from Cloudinary
        const response = await fetch(test.pdfUrl);

        if (!response.ok) {
            return res.status(500).send("Failed to fetch PDF");
        }

        // Get the PDF buffer
        const buffer = await response.arrayBuffer();

        // Set headers for inline viewing
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
        res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day

        // Send the PDF
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error("PDF proxy error:", error);
        res.status(500).send("Error loading PDF");
    }
});

export default router;
