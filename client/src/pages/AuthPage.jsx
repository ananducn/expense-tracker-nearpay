import React, { useState } from "react";
import { useAuthStore } from "../stores/authStore";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);

  const reset = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // basic validation
    if (!email || !password || (mode === "signup" && !fullName)) {
      setErrorMsg("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        // send name as part of signup body
        await signup({ email, password, fullName });
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center mb-4 shadow-sm">
              {/* simple wallet icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 9h10M7 13h6"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-slate-900">
              Budget Tracker
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your expenses with ease
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <div className="bg-slate-100 rounded-full p-1 flex items-center justify-between">
              <button
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-white shadow text-slate-900"
                    : "text-slate-500"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-white shadow text-slate-900"
                    : "text-slate-500"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                type="email"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
            </div>

            {errorMsg && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 inline-flex items-center justify-center rounded-lg px-4 py-3 text-white font-medium transition ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              {loading
                ? mode === "login"
                  ? "Logging in..."
                  : "Signing up..."
                : mode === "login"
                ? "Login"
                : "Create account"}
            </button>
          </form>

          {/* bottom */}
          <div className="mt-5 text-center text-sm text-slate-500">
            By continuing you agree to our{" "}
            <span className="text-slate-700 underline">Terms</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
