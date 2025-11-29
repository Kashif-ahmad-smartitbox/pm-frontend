"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Debug: Log the token to see if it's being read correctly
    console.log("Reset password page loaded. Token:", token ? "Present" : "Missing");
    console.log("Full URL:", window.location.href);
    
    if (!token) {
      setError("Invalid reset token. Please request a new password reset link.");
    }
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid reset token. Please request a new password reset link.");
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, formData.password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again or request a new reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gray-200">
      <div className="w-full max-w-md">
        <div className="bg-gray-100 rounded-2xl p-6 lg:p-8 border border-[#D9F3EE]">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img className="w-16 h-16" src="/logo.png" alt="site logo" />
            </div>
            <h2 className="text-2xl font-bold text-[#0E3554] mb-2">
              Reset Password
            </h2>
            <p className="text-slate-600 text-sm">
              Enter your new password below
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
                <div className="p-1 bg-green-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-green-700 text-sm font-medium">
                    Password has been reset successfully!
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    Redirecting to login page...
                  </p>
                </div>
              </div>
            </div>
          ) : (
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

              {/* NEW PASSWORD */}
              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-800"
                >
                  New Password
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
                    placeholder="Enter your new password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading || !token}
                    minLength={6}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    disabled={loading || !token}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPwd ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-3">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPwd ? "text" : "password"}
                    required
                    className="w-full px-4 py-3 pl-12 pr-12 border border-slate-300 rounded-xl
                    placeholder-slate-400 transition-all
                    focus:ring-2 focus:ring-[#1CC2B1] focus:border-[#1CC2B1]
                    hover:border-[#0E3554]"
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading || !token}
                    minLength={6}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd((s) => !s)}
                    disabled={loading || !token}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showConfirmPwd ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3.5 rounded-xl font-semibold
                bg-[#0E3554] hover:bg-[#0A2A42]
                text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-[#0E3554] hover:underline font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gray-200">
        <div className="w-full max-w-md">
          <div className="bg-gray-100 rounded-2xl p-6 lg:p-8 border border-[#D9F3EE]">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <img className="w-16 h-16" src="/logo.png" alt="site logo" />
              </div>
              <h2 className="text-2xl font-bold text-[#0E3554] mb-2">
                Loading...
              </h2>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

