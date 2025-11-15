import React, { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import api from "./api/apiClient";
import { useAuthStore } from "./stores/authStore";

export default function App() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try restoring session using cookie
    async function checkAuth() {
      try {
        const { data } = await api.get("/auth/me"); // backend validates cookie
        setAuth(null, data.user); // no token needed, stored in httpOnly cookie
      } catch (err) {
        console.log("Check auth error:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) {
    return <div style={{ padding: 40 }}>Checking session...</div>;
  }

  return user ? <Dashboard /> : <AuthPage />;
}
