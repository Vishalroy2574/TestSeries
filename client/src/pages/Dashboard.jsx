import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Dashboard = () => {
  const { user } = useAuth();

  const categories = [
    {
      key: "FINAL",
      title: "CA Final",
      subtitle: "Chartered Accountancy Final Level",
      primaryCta: "View",
      secondaryCta: "View Test Series",
    },
    {
      key: "INTER",
      title: "CA Inter",
      subtitle: "Chartered Accountancy Intermediate Level",
      primaryCta: "View",
      secondaryCta: "View Test Series",
    },
    {
      key: "CA",
      title: "CA Foundation",
      subtitle: "Chartered Accountancy Foundation Level",
      primaryCta: "View",
      secondaryCta: "View Test Series",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-500">
            ExamPortal
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Test Series Hub
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {user?.name}. Choose your course and start practicing with
            curated test series.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className="card flex flex-col items-center border-rose-100 bg-gradient-to-b from-white to-rose-50/40 text-center shadow-sm"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-2xl">
              <span className="text-rose-500">🏆</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{cat.title}</h2>
            <p className="mt-1 text-xs text-slate-500">{cat.subtitle}</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                to={`/category/${cat.key}`}
                className="pill-danger justify-center"
              >
                {cat.primaryCta}
              </Link>
              <Link
                to={`/category/${cat.key}`}
                className="pill-outline justify-center"
              >
                {cat.secondaryCta}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

