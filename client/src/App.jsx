// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import AuthPage from "./pages/AuthPage";
import api from "./api/apiClient";
import { useAuthStore } from "./stores/authStore";
import Budgets from "./pages/Budgets";
import Expenses from "./pages/Expenses";

export default function App() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const authChecked = useAuthStore((s) => s.authChecked);
  const markAuthChecked = useAuthStore((s) => s.markAuthChecked);

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        const { data } = await api.get("/auth/me");
        if (mounted) setAuth(data?.user ?? null);
      } catch {
        if (mounted) setAuth(null);
      } finally {
        if (mounted) markAuthChecked(true);
      }
    }

    checkAuth();
    return () => (mounted = false);
  }, []);

  if (!authChecked)
    return <div style={{ padding: 40 }}>Checking session...</div>;

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/auth"
        element={user ? <Navigate to="/dashboard" /> : <AuthPage />}
      />

      {/* Private */}
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/auth" />}
      />

      <Route
        path="/reports"
        element={user ? <Reports /> : <Navigate to="/auth" />}
      />

      <Route
        path="/categories"
        element={user ? <Categories /> : <Navigate to="/auth" />}
      />
      <Route
        path="/budgets"
        element={user ? <Budgets /> : <Navigate to="/auth" />}
      />

      <Route
        path="/expenses"
        element={user ? <Expenses /> : <Navigate to="/auth" />}
      />
      {/* Default route */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/auth"} />}
      />
    </Routes>
  );
}
