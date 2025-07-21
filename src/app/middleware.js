import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const PROTECTED_PATHS = ["/editor"]

export function middleware(req) {
  const { pathname } = req.nextUrl

  // ✅ Skip if it's not a protected route
  if (!PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // ✅ Get token from cookies
  const token = req.cookies.get("token")?.value

  // ✅ If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // ✅ Verify the token using the same secret as backend
    jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET)

    // ✅ If valid, allow access
    return NextResponse.next()
  } catch (err) {
    console.error("Invalid or expired token:", err)

    // ✅ Redirect to login if invalid
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }
}

// ✅ Tell Next.js which routes this middleware applies to
export const config = {
  matcher: ["/editor/:path*", "/editor"], // Protect /editor and all subroutes
}
