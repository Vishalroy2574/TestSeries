import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

import testRoutes from "./routes/testRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import viewRoutes from "./routes/viewRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";

import { authenticateSession, noCache } from "./middleware/sessionAuth.js";
import { connectDB } from "./config/db.js";

/* ================= PATH CONFIG + ENV ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load .env from the server directory, regardless of where Node is started
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Prefer IPv4 first (helps avoid SRV DNS issues on some networks)
dns.setDefaultResultOrder("ipv4first");

// Trust first proxy (Render, Heroku, etc.)
app.set("trust proxy", 1);

/* ================= SECURITY MIDDLEWARE ================= */
// Use Helmet to set secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP if it interferes with your EJS/scripts (can be tuned later)
}));

// Global Rate Limiting: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again in 15 minutes."
});

// Auth-specific Rate Limiting: 20 attempts per hour
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many login/registration attempts. Please try again in an hour."
});

// Prevent NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

/* ================= BASIC MIDDLEWARE ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  // Persist sessions in MongoDB so they survive server restarts & work
  // correctly across multiple processes. connect-mongo was already installed.
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/examportal",
    collectionName: "sessions",
    ttl: 24 * 60 * 60,          // session TTL: 24 hours
    autoRemove: "native",       // let MongoDB TTL index clean up expired sessions
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Enable secure cookies in production
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }
}));

/* 🚫 Disable browser caching — prevents Back-button showing stale auth pages */
app.use(noCache);

/* 🔥 IMPORTANT: attach user to req BEFORE routes */
app.use(authenticateSession);

/* ================= VIEW ENGINE ================= */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



/* ================= STATIC FILES ================= */
app.use(express.static(path.join(__dirname, "public")));

/* ================= ROUTES ================= */

// Apply Rate Limiting
app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

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

(async () => {
  // Start DB connection, but don't crash server if it fails (e.g. SRV DNS blocked).
  connectDB({ retry: true }).catch(() => { });

  const startListening = (port) => {
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

    server.on("error", (err) => {
      if (err?.code === "EADDRINUSE") {
        console.error(`Port ${port} is in use. Trying ${Number(port) + 1}...`);
        setTimeout(() => startListening(Number(port) + 1), 250);
        return;
      }
      console.error("Server listen error:", err);
      process.exit(1);
    });
  };

  startListening(Number(PORT));
})();
