import { getCookie } from "../cookies";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export async function request<T = any>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: any;
    headers?: Record<string, string>;
    isFormData?: boolean;
  } = {}
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  const authToken = getCookie("authToken");

  const { method = "GET", body, headers = {}, isFormData = false } = options;

  // Build headers safely
  const effectiveHeaders: Record<string, string> = {
    ...headers, // user supplied headers first
  };

  // Add Authorization ONLY if token exists
  if (authToken) {
    effectiveHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  // Set Content-Type ONLY for JSON bodies
  if (!isFormData && body !== undefined && !(body instanceof FormData)) {
    effectiveHeaders["Content-Type"] = "application/json";
  }

  const fetchOptions: RequestInit = {
    method,
    credentials: "include",
    headers: effectiveHeaders,
  };

  // Apply body
  if (body !== undefined) {
    if (isFormData || body instanceof FormData) {
      // Remove Content-Type because browser will set correct boundary
      delete effectiveHeaders["Content-Type"];
      fetchOptions.body = body as BodyInit;
    } else {
      fetchOptions.body = JSON.stringify(body);
    }
  }

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    let errorMessage = `API Error ${res.status}`;
    
    if (contentType.includes("application/json")) {
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        const text = await res.text().catch(() => "");
        errorMessage = text || errorMessage;
      }
    } else {
      const text = await res.text().catch(() => "");
      errorMessage = text || errorMessage;
    }
    
    const error = new Error(errorMessage);
    (error as any).status = res.status;
    (error as any).response = errorMessage;
    throw error;
  }

  // Handle no-content responses
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  const txt = await res.text().catch(() => "");
  return txt as unknown as T;
}
