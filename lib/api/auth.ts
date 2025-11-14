import { removeCookie } from "../cookies";
import { request } from "./client";

export function login(email: string, password: string) {
  return request("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function logout() {
  removeCookie("authToken");
  return request("/api/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser() {
  return request("/api/auth/me", {
    method: "GET",
  });
}
