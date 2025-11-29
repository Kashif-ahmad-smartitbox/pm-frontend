import { request } from "./client";

export function login(email: string, password: string) {
  return request("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function logout() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser() {
  return request("/api/auth/me", {
    method: "GET",
  });
}

export function forgotPassword(email: string) {
  return request("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function resetPassword(token: string, password: string) {
  return request("/api/auth/reset-password", {
    method: "POST",
    body: { token, password },
  });
}