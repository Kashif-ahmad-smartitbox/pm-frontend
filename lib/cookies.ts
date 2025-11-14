export function setCookie(
  name: string,
  value: string,
  days = 7,
  path = "/",
  sameSite: "Lax" | "Strict" | "None" = "Lax"
) {
  const maxAge = days * 24 * 60 * 60;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const cookie = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAge}`,
    `Path=${path}`,
    `SameSite=${sameSite}`,
    secure ? `Secure` : "",
  ]
    .filter(Boolean)
    .join("; ");

  document.cookie = cookie;
}

export function removeCookie(name: string, path = "/") {
  const cookieBase = `${encodeURIComponent(
    name
  )}=; Max-Age=0; Path=${path}; SameSite=Lax`;
  document.cookie = cookieBase;
  document.cookie = `${cookieBase}; Secure`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const target = encodeURIComponent(name) + "=";

  for (const cookie of cookies) {
    if (cookie.startsWith(target)) {
      return decodeURIComponent(cookie.substring(target.length));
    }
  }

  return null;
}
