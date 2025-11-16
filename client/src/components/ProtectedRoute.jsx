// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function ProtectedRoute({ children }) {
  // auth state and a flag to indicate initial session check done
  const user = useAuthStore((s) => s.user);
  const authChecked = useAuthStore((s) => s.authChecked); // see authStore change below

  // if we haven't finished initial auth-check, render nothing (or loader)
  if (!authChecked) {
    return <div style={{ padding: 40 }}>Checking session...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
