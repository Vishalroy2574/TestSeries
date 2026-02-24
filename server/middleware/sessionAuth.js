import jwt from "jsonwebtoken";

/* =====================================================
   Prevent browser from caching any server responses.
   This stops the Back-button from showing a cached
   authenticated page after the user has logged out.
===================================================== */
export const noCache = (_req, res, next) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store",
  });
  next();
};

/* =====================================================
   Attach user to request if session or JWT exists
===================================================== */
export const authenticateSession = (req, res, next) => {
  try {
    // 1️⃣ Check express-session first
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }

    // 2️⃣ Check JWT token from cookies (optional fallback)
    const token = req.cookies?.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
      } catch (err) {
        console.error("Invalid JWT token");
      }
    }

    // 3️⃣ No auth found
    req.user = null;
    next();

  } catch (error) {
    console.error("Authentication middleware error:", error);
    req.user = null;
    next();
  }
};

/* =====================================================
   Require user to be logged in
===================================================== */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    if (req.path.startsWith("/api")) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const returnTo = encodeURIComponent(req.originalUrl || req.url);
    return res.redirect(`/login?returnTo=${returnTo}`);
  }
  next();
};

/* =====================================================
   Require user to be admin
===================================================== */
export const requireAdmin = (req, res, next) => {
  // ✅ Check both role and isAdmin for backward compatibility
  const isAdmin = req.user?.isAdmin || req.user?.role === "admin";

  if (!req.user || !isAdmin) {
    if (req.path.startsWith("/api")) {
      return res.status(403).json({ message: "Admin access required" });
    }
    return res.redirect("/");
  }
  next();
};

/* =====================================================
   Set user session after login
===================================================== */
export const setUserSession = (req, user, token) => {
  req.session.user = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    isAdmin: user.isAdmin || user.role === "admin", // ✅ Support both fields
  };

  // Optional: store token if using JWT fallback
  if (token) {
    req.session.token = token;
  }
};

/* =====================================================
   Destroy session (logout)
===================================================== */
export const destroyUserSession = (req) => {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
