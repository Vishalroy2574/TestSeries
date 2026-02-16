import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api.js";

const CategoryPage = () => {
  const { category } = useParams();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/tests", { params: { category } });
        setTests(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [category]);

  const titleMap = {
    CA: "CA Test Series",
    INTER: "INTER Test Series",
    FINAL: "FINAL Test Series",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          {titleMap[category] || "Tests"}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Browse available tests in this category.
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-slate-300">Loading tests...</p>
      ) : tests.length === 0 ? (
        <p className="text-sm text-slate-400">No tests found for this category.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <div key={test._id} className="card flex flex-col">
              <h2 className="mb-1 text-lg font-semibold text-white">
                {test.title}
              </h2>
              <p className="mb-2 text-xs text-slate-400">{test.description}</p>
              <div className="mt-auto flex items-center justify-between text-xs text-slate-400">
                <span>Duration: {test.duration} min</span>
                <span>Questions: {test.questions?.length}</span>
              </div>
              <Link
                to={`/tests/${test._id}`}
                className="mt-3 inline-flex items-center text-sm font-medium text-primary-400 hover:text-primary-300"
              >
                View details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;

