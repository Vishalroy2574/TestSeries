import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v.length >= 2;
        },
        message: "At least 2 options required",
      },
    },
    correctAnswer: { type: String, required: true },
  },
  { _id: false }
);

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    description: { type: String, trim: true },

    category: {
      type: String,
      enum: ["CA", "INTER", "FINAL"],
      required: true,
      uppercase: true,
      trim: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    pdfUrl: {
      type: String,
      required: true,
    },

    pdfPublicId: { type: String },

    type: {
      type: String,
      enum: ["FREE", "PAID"],
      default: "FREE",
      required: true,
      uppercase: true,
    },

    price: {
      type: Number,
      min: 0,
      validate: {
        validator: function (v) {
          // Price is required only when type is PAID
          if (this.type === "PAID") {
            return v != null && v >= 0;
          }
          return true;
        },
        message: "Price is required for PAID tests",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Test = mongoose.model("Test", testSchema);

export default Test;
