import express from "express";
import Test from "../models/Test.js";
import Result from "../models/Result.js";
import Purchase from "../models/Purchase.js";
import { requireAuth, requireAdmin } from "../middleware/sessionAuth.js";

const router = express.Router();

// Login Page (public)
router.get("/login", (req, res) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("pages/login", {
        error: req.query.error || null,
        title: "Login - Test Series Hub",
    });
});

// Register Page (public)
router.get("/register", (req, res) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("pages/register", {
        error: req.query.error || null,
        title: "Register - Test Series Hub",
    });
});


// Logout
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Session destruction error:", err);
        }
        res.clearCookie("connect.sid");
        res.redirect("/login");
    });
});

// Root Route: Show Categories for everyone
router.get("/", (req, res) => {
    const categories = [
        {
            key: "FINAL",
            title: "CA Final",
            subtitle: "Chartered Accountancy Final Level",
        },
        {
            key: "INTER",
            title: "CA Inter",
            subtitle: "Chartered Accountancy Intermediate Level",
        },
        {
            key: "CA",
            title: "CA Foundation",
            subtitle: "Chartered Accountancy Foundation Level",
        },
    ];

    res.render("pages/dashboard", {
        user: req.user || null,
        categories,
        title: "Test Series Hub",
    });
});

// Dashboard (protected) - Redirect to root to keep URL clean
router.get("/dashboard", requireAuth, (req, res) => {
    res.redirect("/");
});

// Listings (public)
router.get("/listings", async (req, res, next) => {
    try {
        const tests = await Test.find().sort({ createdAt: -1 }).limit(12);
        res.render("pages/listings", {
            user: req.user,
            tests,
            title: "All Listings - Test Series Hub",
        });
    } catch (error) {
        next(error);
    }
});

// Category Page (Public)
router.get("/category/:category", async (req, res, next) => {
    try {
        const { category } = req.params;
        console.log(`Fetching tests for category: ${category}`);

        const tests = await Test.find({
            category: category.toUpperCase().trim()
        }).sort({ createdAt: -1 });

        const categoryTitles = {
            FINAL: "CA Final",
            INTER: "CA Inter",
            CA: "CA Foundation",
        };

        // Fetch purchased test IDs if user is logged in
        let purchasedTestIds = [];
        if (req.user) {
            const purchases = await Purchase.find({ userId: req.user._id });
            purchasedTestIds = purchases.map(p => p.testId.toString());
        }

        res.render("pages/category", {
            user: req.user || null,
            category,
            categoryTitle: categoryTitles[category] || category,
            tests,
            purchasedTestIds,
            title: `${categoryTitles[category] || category} - Test Series Hub`,
        });
    } catch (error) {
        next(error);
    }
});

// Test Details (Public)
router.get("/tests/:id", async (req, res, next) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) {
            return res.status(404).render("pages/error", {
                user: req.user || null,
                message: "Test not found",
                title: "Error - Test Series Hub",
            });
        }

        // Check if user has purchased this test (for PAID tests)
        let hasPurchased = false;
        const testType = (test.type || "FREE").toUpperCase();

        if (req.user && testType === "PAID") {
            const purchase = await Purchase.findOne({
                userId: req.user._id,
                testId: test._id,
            });
            hasPurchased = !!purchase;
        } else if (testType === "FREE") {
            hasPurchased = true; // FREE tests are always "purchased"
        }

        res.render("pages/test-details", {
            user: req.user || null,
            test,
            hasPurchased,
            title: `${test.title} - Test Series Hub`,
        });
    } catch (error) {
        next(error);
    }
});

// TODO: Re-enable in future - Test taking functionality
// Take Test (protected)
// router.get("/tests/:id/take", requireAuth, async (req, res, next) => {
//     try {
//         const test = await Test.findById(req.params.id);
//         if (!test) {
//             return res.status(404).render("pages/error", {
//                 user: req.user,
//                 message: "Test not found",
//                 title: "Error - Test Series Hub",
//             });
//         }
//
//         res.render("pages/take-test", {
//             user: req.user,
//             test,
//             title: `Take Test: ${test.title} - Test Series Hub`,
//         });
//     } catch (error) {
//         next(error);
//     }
// });

// TODO: Re-enable in future - Results viewing functionality
// Results Page (protected)
// router.get("/results", requireAuth, async (req, res, next) => {
//     try {
//         const results = await Result.find({ userId: req.user._id })
//             .populate("testId")
//             .sort({ completedAt: -1 });
//
//         res.render("pages/results", {
//             user: req.user,
//             results,
//             title: "My Results - Test Series Hub",
//         });
//     } catch (error) {
//         next(error);
//     }
// });

// Admin Panel (protected, admin only)
router.get("/admin", requireAuth, requireAdmin, async (req, res, next) => {
    try {
        const tests = await Test.find().sort({ createdAt: -1 });

        res.render("pages/admin", {
            user: req.user,
            tests,
            title: "Admin Panel - Test Series Hub",
        });
    } catch (error) {
        next(error);
    }
});

// Privacy Policy (public)
router.get("/privacy", (req, res) => {
    res.render("pages/privacy", {
        user: req.user,
        title: "Privacy Policy - Test Series Hub",
    });
});

// Terms of Service (public)
router.get("/terms", (req, res) => {
    res.render("pages/terms", {
        user: req.user,
        title: "Terms of Service - Test Series Hub",
    });
});

export default router;
