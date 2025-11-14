"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/lib/api/auth";

export type User = {
  id?: string;
  name?: string;
  email?: string;
  roles?: string[];
  [k: string]: any;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchUser() {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.getCurrentUser();
      const resolvedUser = (data && (data.user ?? data)) || null;
      setUser(resolvedUser);
    } catch (err: any) {
      setUser(null);
      if (err?.message) setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      await authApi.login(email, password);
      await fetchUser();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    setError(null);
    try {
      await authApi.logout();
      setUser(null);
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "Logout failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    await fetchUser();
  }

  const value: AuthContextValue = {
    user,
    loading,
    error,
    login,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider />");
  }
  return ctx;
}
