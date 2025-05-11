import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware";

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req });
  const isAdmin = token?.role === "ADMIN";
  const isAuthenticated = !!token;

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // Protect user routes
  if (req.nextUrl.pathname.startsWith("/user") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
