import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      // Check if request is from form or API
      if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.redirect("/register?error=" + encodeURIComponent("Please provide all fields"));
      }
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.redirect("/register?error=" + encodeURIComponent("Please provide a valid email address"));
      }
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.redirect("/register?error=" + encodeURIComponent("User already exists"));
      }
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === "admin" ? "admin" : "student",
    });

    const token = generateToken(user._id, user.role);

    // Set session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.role === "admin",
    };
    req.session.token = token;

    // Check if this is a form submission or API request
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect("/");
    }

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.redirect("/login?error=" + encodeURIComponent("Invalid credentials"));
      }
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.redirect("/login?error=" + encodeURIComponent("Invalid credentials"));
      }
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

    // Set session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.role === "admin",
    };
    req.session.token = token;

    // Check if this is a form submission or API request
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect("/");
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
