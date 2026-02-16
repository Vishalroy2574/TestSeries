import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import TestDetails from "./pages/TestDetails.jsx";
import TakeTest from "./pages/TakeTest.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Layout from "./layouts/MainLayout.jsx";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="category/:category" element={<CategoryPage />} />
        <Route path="tests/:id" element={<TestDetails />} />
        <Route path="tests/:id/take" element={<TakeTest />} />
        <Route path="results" element={<ResultsPage />} />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

