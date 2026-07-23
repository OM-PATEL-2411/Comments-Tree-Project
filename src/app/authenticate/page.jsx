"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { registerUser, loginUser } from "@/lib/authApi";

export default function AuthenticatePage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* App Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Nested Comments
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to join the conversation.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tab Toggle */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors duration-200 ${
                activeTab === "login"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors duration-200 ${
                activeTab === "register"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form Area */}
          <div className="p-6">
            {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Login Form ──────────────────────────────────────────────

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {

      console.log("THIS IS A SUCCESS MESSAGE" , data)
      setEmail("");
      setPassword("");
      setErrors({});
      // Redirect immediately to /comments upon successful login
      window.location.href = "/comments";
    },
    onError: (err) => {
      console.log("ERROR", err);
    },
  });

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required.";
    if (!password.trim()) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({ email: email.trim(), password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* API error */}
      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {mutation.error?.message || "Something went wrong."}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className={`w-full text-white text-sm font-semibold py-2.5 rounded-lg transition-colors duration-200 ${
          mutation.isPending
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {mutation.isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

// ─── Register Form ───────────────────────────────────────────

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      setUsername("");
      setEmail("");
      setPassword("");
      setErrors({});
      // Redirect immediately to /comments upon successful registration
      window.location.href = "/comments";
    },
  });

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    if (!password.trim()) newErrors.password = "Password is required.";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({ username: username.trim(), email: email.trim(), password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* API error */}
      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {mutation.error?.message || "Something went wrong."}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
        <input
          type="text"
          placeholder="johndoe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
        {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <input
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className={`w-full text-white text-sm font-semibold py-2.5 rounded-lg transition-colors duration-200 ${
          mutation.isPending
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {mutation.isPending ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
