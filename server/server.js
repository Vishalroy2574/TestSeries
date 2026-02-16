import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import testRoutes from "./routes/testRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import viewRoutes from "./routes/viewRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";

import { authenticateSession, requireAuth, requireAdmin } from "./middleware/sessionAuth.js";
import Test from "./models/Test.js";

dotenv.config();

const app = express();

/* ================= PATH CONFIG ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= DATABASE ================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Mongo Error:", err));

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,   // change to true in production (HTTPS)
  }
}));

/* 🔥 IMPORTANT: attach user to req BEFORE routes */
app.use(authenticateSession);

/* ================= VIEW ENGINE ================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



/* ================= STATIC FILES ================= */
app.use(express.static(path.join(__dirname, "public")));

/* ================= ROUTES ================= */

// API Routes
app.use("/api/tests", testRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/purchases", purchaseRoutes);

// PDF Proxy Routes
app.use("/pdf", pdfRoutes);

// View Routes (pages)
app.use("/", viewRoutes);

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
