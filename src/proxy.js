import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, internal Next.js requests, and auth APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get token from cookies or Authorization header
  const tokenCookie = request.cookies.get("token")?.value;
  const authHeader = request.headers.get("authorization");
  const token =
    tokenCookie ||
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null);
      
  // Authentication is based only on cookie/token presence
  const isAuthenticated = !!token;

  // Root route /
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = isAuthenticated ? "/comments" : "/authenticate";
    return NextResponse.redirect(url);
  }

  // Protected route /comments
  if (pathname.startsWith("/comments")) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/authenticate";
      return NextResponse.redirect(url);
    }
  }

  // Auth route /authenticate
  if (pathname.startsWith("/authenticate")) {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/comments";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export default proxy;
