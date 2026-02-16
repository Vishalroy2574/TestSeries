import Test from "../models/Test.js";

/* ================= GET ALL ================= */
export const getTests = async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET BY ID ================= */
export const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET BY CATEGORY ================= */
export const getTestsByCategory = async (req, res) => {
  try {
    const categoryKey = req.params.key.toUpperCase().trim();

    const tests = await Test.find({ category: categoryKey })
      .sort({ createdAt: -1 });

    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= CREATE ================= */
export const createTest = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      title,
      description,
      category,
      duration,
      questions,
      pdfUrl,
      pdfPublicId,
      type,
      price,
    } = req.body;

    if (!title || !category || !duration || !pdfUrl) {
      return res.status(400).json({
        message: "Title, Category, Duration and PDF are required",
      });
    }

    // Validate price for PAID tests - allow 0 as valid price
    if (type === "PAID") {
      if (price === null || price === undefined || price === "") {
        return res.status(400).json({
          message: "Price is required for PAID tests",
        });
      }

      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({
          message: "Price must be a valid number >= 0",
        });
      }
    }

    const newTest = new Test({
      title: title.trim(),
      description: description?.trim(),
      category: category.toUpperCase().trim(),
      duration,
      questions: questions || [],
      pdfUrl,
      pdfPublicId,
      type: type || "FREE",
      price: type === "PAID" ? Number(price) : undefined,
      createdBy: req.user._id,
    });

    const savedTest = await newTest.save();

    res.status(201).json(savedTest);
  } catch (error) {
    console.error("Create test error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE ================= */
export const updateTest = async (req, res) => {
  try {
    const allowedUpdates = [
      'title', 'category', 'duration', 'description',
      'pdfUrl', 'pdfPublicId', 'type', 'price'
    ];

    // Filter updates
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (updates.category) {
      updates.category = updates.category.toUpperCase().trim();
    }

    const updated = await Test.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE ================= */
export const deleteTest = async (req, res) => {
  try {
    const deleted = await Test.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json({ message: "Test deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
