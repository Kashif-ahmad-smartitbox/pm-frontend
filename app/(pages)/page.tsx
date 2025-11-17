"use client";

import React, { useState } from "react";
import { login } from "@/lib/api/auth";
import { setCookie } from "@/lib/cookies";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await login(formData.email, formData.password);
      setCookie("authToken", res.token);
      location.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed — please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#EFFFFA]">
      {/* LEFT SIDE - Desktop Only */}
      <section className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden bg-gradient-to-br from-[#0E3554] to-[#1CC2B1]">
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-20 -right-20 w-80 h-80 bg-black/10 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <img className="w-24" src="/logo.png" alt="site logo" />
            <div>
              <h1 className="text-2xl font-bold">SKC Project Management</h1>
              <p className="text-teal-100 mt-1">Enterprise Management System</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold leading-tight mb-6">
            Welcome Back
            <span className="block text-teal-100 mt-2">Continue your work</span>
          </h2>
          <p className="text-teal-100/90 text-lg max-w-md leading-relaxed">
            Access your personalized workspace where productivity meets
            innovation.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-[#E1F3F0] flex items-center justify-center">
              <svg
                className="w-4 h-4 text-[#0E3554]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <span className="text-white font-medium">
              Enterprise-grade security
            </span>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-[#E0FFFA] flex items-center justify-center">
              <svg
                className="w-4 h-4 text-[#1CC2B1]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <span className="text-white font-medium">
              Team collaboration tools
            </span>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-[#FFF4DD] flex items-center justify-center">
              <svg
                className="w-4 h-4 text-[#E6A93A]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-white font-medium">
              24/7 dedicated support
            </span>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/20">
          <p className="text-sm text-teal-100 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[#1CC2B1]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
              />
            </svg>
            <span>Your data is encrypted and secure</span>
          </p>
        </div>
      </section>

      {/* RIGHT SIDE */}
      <main className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo Only */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex justify-center mb-6">
              <img className="w-16 h-16" src="/logo.png" alt="site logo" />
            </div>
            <h2 className="text-2xl font-bold text-[#0E3554] mb-2">Sign In</h2>
            <p className="text-slate-600 text-sm">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-left mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-[#0E3554] rounded-full" />
              <h2 className="text-3xl font-bold text-[#0E3554]">Sign In</h2>
            </div>
            <p className="text-slate-600 pl-5">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-[#D9F3EE]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <div className="p-1 bg-red-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-red-700 text-sm flex-1 font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* EMAIL */}
              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl 
                    placeholder-slate-400 transition-all
                    focus:ring-2 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                    hover:border-[#0E3554]"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPwd ? "text" : "password"}
                    required
                    className="w-full px-4 py-3 pl-12 pr-12 border border-slate-300 rounded-xl
                    placeholder-slate-400 transition-all
                    focus:ring-2 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                    hover:border-[#0E3554]"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPwd ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold
                bg-[#0E3554] hover:bg-[#0A2A42]
                text-white transition-all"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="my-8 border-t border-[#D9F3EE]" />

            <p className="text-center text-sm text-slate-600">
              Need help accessing your account?{" "}
              <a
                href="/support"
                className="text-[#0E3554] font-semibold hover:underline"
              >
                Contact support
              </a>
            </p>
          </div>

          <footer className="mt-8 text-center space-y-3">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <a
                href="/"
                className="text-[#0E3554] font-semibold hover:underline"
              >
                Get started
              </a>
            </p>
            <p className="text-xs text-slate-500">
              Secure access to your workspace
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
