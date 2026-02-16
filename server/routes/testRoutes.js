import express from "express";

import {
  getTests,
  getTestById,
  getTestsByCategory,
  createTest,
  updateTest,
  deleteTest,
} from "../controllers/testController.js";

import { requireAuth, requireAdmin } from "../middleware/sessionAuth.js";

const router = express.Router();

/* ================= GET ROUTES ================= */

// Get all tests
router.get("/", requireAuth, getTests);

// IMPORTANT: Category route BEFORE :id
router.get("/category/:key", requireAuth, getTestsByCategory);

// Get single test
router.get("/:id", requireAuth, getTestById);

/* ================= ADMIN ROUTES ================= */

router.post("/", requireAuth, requireAdmin, createTest);
router.put("/:id", requireAuth, requireAdmin, updateTest);
router.delete("/:id", requireAuth, requireAdmin, deleteTest);

export default router;
