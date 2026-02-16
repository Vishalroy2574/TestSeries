import express from "express";
import { uploadPdf } from "../controllers/uploadController.js";
import { requireAuth, requireAdmin } from "../middleware/sessionAuth.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/pdf",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  uploadPdf
);

export default router;

