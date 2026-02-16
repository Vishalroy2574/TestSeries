import express from "express";
import { submitResult, getMyResults } from "../controllers/resultController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/submit", authMiddleware, submitResult);
router.get("/my", authMiddleware, getMyResults);

export default router;

