import Result from "../models/Result.js";
import Test from "../models/Test.js";

export const submitResult = async (req, res, next) => {
  try {
    const { testId, answers } = req.body;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Answers are required" });
    }

    let score = 0;
    const evaluatedAnswers = answers.map((ans) => {
      const question = test.questions[ans.questionId];
      const isCorrect = question && question.correctAnswer === ans.selectedOption;
      if (isCorrect) score += 1;
      return {
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        isCorrect,
      };
    });

    const result = await Result.create({
      userId: req.user._id,
      testId,
      score,
      answers: evaluatedAnswers,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyResults = async (req, res, next) => {
  try {
    const results = await Result.find({ userId: req.user._id })
      .populate("testId", "title category")
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    next(error);
  }
};

