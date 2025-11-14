import { getCookie } from "../cookies";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export async function request<T = any>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  const authToken = getCookie("authToken");

  const {
    method = "GET",
    body,
    headers = { Authorization: `Bearer ${authToken}` },
  } = options;

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": body ? "application/json" : "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return res.json();
}
