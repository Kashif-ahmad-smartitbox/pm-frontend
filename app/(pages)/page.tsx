"use client";

import React, { useState } from "react";
import { login } from "@/lib/api/auth";
import { setCookie } from "@/lib/cookies";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Users,
  Headphones,
  LayoutDashboard,
  AlertCircle,
  Fingerprint,
} from "lucide-react";

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

  const features = [
    {
      icon: Shield,
      text: "Enterprise-grade security",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Users,
      text: "Team collaboration tools",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Headphones,
      text: "24/7 dedicated support",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-50">
      {/* LEFT SIDE - MODERN HERO SECTION */}
      <section className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-20 w-64 h-64 bg-slate-800 rounded-full opacity-50"></div>
          <div className="absolute bottom-20 -right-20 w-80 h-80 bg-slate-800 rounded-full opacity-30"></div>
        </div>

        {/* Header Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Project Dashboard</h1>
              <p className="text-slate-400 mt-1">
                Enterprise Management System
              </p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Welcome Back
              <span className="block text-slate-300 mt-2">
                Continue your work
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Access your personalized workspace where productivity meets
              innovation. Manage projects, collaborate with teams, and drive
              results.
            </p>
          </div>
        </div>

        {/* Feature List */}
        <div className="relative z-10 space-y-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center`}
              >
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <span className="text-slate-200 font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="relative z-10 pt-8 border-t border-slate-700">
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <Fingerprint className="w-4 h-4" />
            <span>Your data is encrypted and secure</span>
          </p>
        </div>
      </section>

      {/* RIGHT SIDE - CLEAN FORM */}
      <main className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-600">Sign in to continue your work</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-left mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-slate-900 rounded-full"></div>
              <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
            </div>
            <p className="text-slate-600 pl-5">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
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

              {/* Email Field */}
              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700"
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
                      placeholder-slate-400 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                      hover:border-slate-400 bg-white text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
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
                      placeholder-slate-400 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900
                      hover:border-slate-400 bg-white text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 
                      text-slate-400 hover:text-slate-600 transition-colors duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed p-1"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-semibold
                  bg-slate-900 hover:bg-slate-800
                  transition-all duration-200
                  disabled:opacity-70 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 text-white"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8">
              <div className="border-t border-slate-200"></div>
            </div>

            {/* Support Text */}
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Need help accessing your account?{" "}
                <a
                  href="/support"
                  className="text-slate-900 hover:text-slate-700 font-semibold transition-colors duration-200 hover:underline inline-flex items-center gap-1"
                >
                  <span>Contact support</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center space-y-3">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <a
                href="/"
                className="text-slate-900 hover:text-slate-700 font-semibold transition-colors duration-200 hover:underline inline-flex items-center gap-1"
              >
                <span>Get started</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Secure access to your workspace
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
