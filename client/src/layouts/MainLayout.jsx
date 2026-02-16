import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `block rounded-full px-4 py-2 text-sm font-medium ${
      isActive
        ? "bg-rose-500 text-white shadow-sm"
        : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
    }`;

  return (
    <div className="flex min-h-screen bg-rose-50/40 text-slate-900">
      <aside className="hidden w-72 flex-col border-r border-rose-100 bg-white/90 p-6 md:flex">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-xl font-bold tracking-tight text-rose-500"
          >
            Test Series Hub
          </button>
        </div>
        <nav className="space-y-2">
          <NavLink to="/" className={navLinkClass} end>
            Dashboard
          </NavLink>
          <NavLink to="/category/CA" className={navLinkClass}>
            CA Tests
          </NavLink>
          <NavLink to="/category/INTER" className={navLinkClass}>
            INTER Tests
          </NavLink>
          <NavLink to="/category/FINAL" className={navLinkClass}>
            FINAL Tests
          </NavLink>
          <NavLink to="/results" className={navLinkClass}>
            My Results
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin Panel
            </NavLink>
          )}
        </nav>
        <div className="mt-auto pt-4">
          <div className="mb-3 text-xs text-slate-500">
            Logged in as <span className="font-semibold">{user?.name}</span> (
            {user?.role})
          </div>
          <button
            onClick={logout}
            className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-rose-100 bg-white/90 px-4 py-3 md:hidden">
          <button
            onClick={() => navigate("/")}
            className="text-base font-bold tracking-tight text-rose-500"
          >
            Test Series Hub
          </button>
          <button
            onClick={logout}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 bg-gradient-to-br from-rose-50 via-white to-rose-50 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

