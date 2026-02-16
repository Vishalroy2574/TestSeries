import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: Number, required: true },
    selectedOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    score: { type: Number, required: true },
    answers: { type: [answerSchema], required: true },
  },
  { timestamps: true }
);

const Result = mongoose.model("Result", resultSchema);

export default Result;

