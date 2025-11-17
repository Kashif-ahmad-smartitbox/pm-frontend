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
      color: "text-[#0E3554]",
      bgColor: "bg-[#E1F3F0]",
    },
    {
      icon: Users,
      text: "Team collaboration tools",
      color: "text-[#1CC2B1]",
      bgColor: "bg-[#E0FFFA]",
    },
    {
      icon: Headphones,
      text: "24/7 dedicated support",
      color: "text-[#E6A93A]",
      bgColor: "bg-[#FFF4DD]",
    },
  ];

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#EFFFFA]">
      {/* LEFT SIDE */}
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
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center`}
              >
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
              </div>
              <span className="text-white font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="relative z-10 pt-8 border-t border-white/20">
          <p className="text-sm text-teal-100 flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-[#1CC2B1]" />
            <span>Your data is encrypted and secure</span>
          </p>
        </div>
      </section>

      {/* RIGHT SIDE */}
      <main className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="hidden lg:block text-left mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-[#0E3554] rounded-full" />
              <h2 className="text-3xl font-bold text-[#0E3554]">Sign In</h2>
            </div>
            <p className="text-slate-600 pl-5">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-[#D9F3EE]">
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
