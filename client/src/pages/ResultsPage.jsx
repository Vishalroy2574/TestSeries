import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api.js";

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const recentResultId = location.state?.recentResultId;

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/results/my");
        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-300">Loading results...</p>;
  }

  if (!results.length) {
    return <p className="text-sm text-slate-400">No results yet.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">My Results</h1>
        <p className="mt-1 text-sm text-slate-400">
          Review your performance across past tests.
        </p>
      </div>
      <div className="space-y-3">
        {results.map((res) => {
          const totalQuestions = res.answers?.length || 0;
          const percentage =
            totalQuestions > 0 ? Math.round((res.score / totalQuestions) * 100) : 0;
          const isRecent = res._id === recentResultId;

          return (
            <div
              key={res._id}
              className={`card flex flex-col justify-between gap-2 border-slate-800 sm:flex-row sm:items-center ${
                isRecent ? "border-primary-500/60 bg-primary-500/10" : ""
              }`}
            >
              <div>
                <div className="text-sm font-semibold text-white">
                  {res.testId?.title || "Test"}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Category: {res.testId?.category || "N/A"}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Taken on {new Date(res.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs sm:text-sm">
                <div className="text-slate-300">
                  Score:{" "}
                  <span className="font-semibold text-primary-300">
                    {res.score} / {totalQuestions}
                  </span>
                </div>
                <div className="text-slate-300">
                  Percent:{" "}
                  <span className="font-semibold text-primary-300">
                    {isNaN(percentage) ? "-" : `${percentage}%`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsPage;

