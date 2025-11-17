import { NextResponse } from "next/server"; 
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const authToken = req.cookies.get("authToken")?.value || null;

  const currentPath = req.nextUrl.pathname;

  if (
    currentPath.startsWith("/_next") ||
    currentPath.startsWith("/api") ||
    currentPath.startsWith("/favicon") ||
    currentPath.includes(".")
  ) {
    return NextResponse.next();
  }

  if (authToken && currentPath === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!authToken && currentPath !== "/") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
