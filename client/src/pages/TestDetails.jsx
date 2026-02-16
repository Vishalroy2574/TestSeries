import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api.js";

const TestDetails = () => {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/tests/${id}`);
        setTest(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  if (loading) {
    return <p className="text-sm text-slate-300">Loading test...</p>;
  }

  if (!test) {
    return <p className="text-sm text-slate-400">Test not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-semibold text-white">{test.title}</h1>
        <p className="mt-2 text-sm text-slate-300">{test.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
          <span>Category: {test.category}</span>
          <span>Duration: {test.duration} min</span>
          <span>Questions: {test.questions?.length}</span>
        </div>
        <Link
          to={`/tests/${test._id}/take`}
          className="btn-primary mt-4 inline-flex"
        >
          Start Test
        </Link>
      </div>
      <div className="card">
        <h2 className="mb-2 text-lg font-semibold text-white">Questions</h2>
        <ol className="space-y-3 text-sm text-slate-300">
          {test.questions.map((q, idx) => (
            <li key={idx}>
              <div className="font-medium text-slate-100">
                Q{idx + 1}. {q.question}
              </div>
              <ul className="ml-4 mt-1 list-disc space-y-1 text-slate-400">
                {q.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default TestDetails;

