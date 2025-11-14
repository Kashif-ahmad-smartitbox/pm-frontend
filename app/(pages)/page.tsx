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
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      icon: Users,
      text: "Team collaboration tools",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      icon: Headphones,
      text: "24/7 dedicated support",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
  ];

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* LEFT SIDE - ENHANCED HERO SECTION */}
      <section className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>

        {/* Header Content */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white/10 rounded-xl backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <span className="text-sm font-medium text-white/60 tracking-wider">
              DASHBOARD
            </span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            Welcome Back
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Innovator
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md leading-relaxed font-light">
            Access your personalized workspace where productivity meets
            innovation. Continue your journey with seamless collaboration and
            intelligent tools.
          </p>
        </div>

        {/* Enhanced Feature List */}
        <div className="relative z-10 space-y-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] group"
            >
              <div
                className={`p-2 rounded-xl ${feature.bgColor} transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <span className="text-slate-200 font-medium group-hover:text-white transition-colors">
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="relative z-10 pt-8 border-t border-white/10">
          <p className="text-sm text-slate-400 flex items-center space-x-2">
            <Fingerprint className="w-4 h-4" />
            <span>Your data is encrypted and secure</span>
          </p>
        </div>
      </section>

      {/* RIGHT SIDE - ENHANCED FORM */}
      <main className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <LayoutDashboard className="w-7 h-7 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-600 font-medium">
              Sign in to continue your work
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-left mb-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
            </div>
            <p className="text-slate-600 font-medium pl-5">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-8 shadow-xl shadow-slate-200/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start space-x-3 animate-in fade-in slide-in-from-top-1 duration-300">
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
                <div className="relative group">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3.5 pl-12 border border-slate-300 rounded-2xl 
                      placeholder-slate-400 shadow-sm transition-all duration-300
                      focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                      hover:border-slate-400 bg-white/50 text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed
                      group-hover:shadow-md"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                    <Mail className="w-4 h-4 text-cyan-600" />
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
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPwd ? "text" : "password"}
                    required
                    className="w-full px-4 py-3.5 pl-12 pr-12 border border-slate-300 rounded-2xl
                      placeholder-slate-400 shadow-sm transition-all duration-300
                      focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400
                      hover:border-slate-400 bg-white/50 text-slate-900
                      disabled:bg-slate-50 disabled:cursor-not-allowed
                      group-hover:shadow-md"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-50 rounded-lg group-focus-within:bg-cyan-100 transition-colors">
                    <Lock className="w-4 h-4 text-cyan-600" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 
                      text-slate-500 hover:text-slate-700 transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-xl hover:bg-slate-100"
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
                className="w-full py-4 px-4 rounded-2xl font-semibold shadow-lg shadow-cyan-500/25
                  bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700
                  transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                  disabled:transform-none disabled:opacity-70 disabled:cursor-not-allowed
                  flex items-center justify-center space-x-3 group text-white relative overflow-hidden"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-semibold">Signing in...</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">Sign In</span>
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            {/* Simple Divider */}
            <div className="my-8">
              <div className="border-t border-slate-200"></div>
            </div>

            {/* Support Text */}
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Need help accessing your account?{" "}
                <a
                  href="/support"
                  className="text-cyan-600 hover:text-cyan-800 font-semibold transition-all duration-200 hover:underline inline-flex items-center space-x-1"
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
                className="text-cyan-600 hover:text-cyan-800 font-semibold transition-all duration-200 hover:underline inline-flex items-center space-x-1"
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
