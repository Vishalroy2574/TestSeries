import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";

const TakeTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/tests/${id}`);
        setTest(data);
        setTimeLeft(data.duration * 60);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  useEffect(() => {
    if (!timeLeft) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleOptionChange = (qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = async () => {
    if (!test || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        testId: test._id,
        answers: Object.entries(answers).map(([qIndex, selectedOption]) => ({
          questionId: Number(qIndex),
          selectedOption,
        })),
      };
      const { data } = await api.post("/results/submit", payload);
      navigate("/results", { state: { recentResultId: data._id } });
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const formattedTime = useMemo(() => {
    if (timeLeft == null) return "";
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  if (loading) {
    return <p className="text-sm text-slate-300">Loading test...</p>;
  }

  if (!test) {
    return <p className="text-sm text-slate-400">Test not found.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-white">{test.title}</h1>
          <p className="mt-1 text-xs text-slate-400">
            Duration: {test.duration} min • Questions: {test.questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Time left: <span className="font-mono text-sm text-red-300">{formattedTime}</span>
        </div>
      </div>
      <div className="card space-y-4">
        {test.questions.map((q, idx) => (
          <div key={idx} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <div className="mb-2 text-sm font-medium text-slate-100">
              Q{idx + 1}. {q.question}
            </div>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <label
                  key={i}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs ${
                    answers[idx] === opt
                      ? "border-primary-500 bg-primary-500/10 text-primary-100"
                      : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-primary-500/60"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    className="h-3 w-3 accent-primary-500"
                    checked={answers[idx] === opt}
                    onChange={() => handleOptionChange(idx, opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          className="btn-primary mt-2 w-full sm:w-auto"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Test"}
        </button>
      </div>
    </div>
  );
};

export default TakeTest;

