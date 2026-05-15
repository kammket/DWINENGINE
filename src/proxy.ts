import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production"
);

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/reflections",
  "/checkin",
  "/journal",
  "/intention",
  "/virtues",
  "/analytics",
  "/simulate",
  "/settings",
  "/admin",
];

const AUTH_ROUTES = ["/login", "/register"];

async function isValidToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("constavita_session")?.value;
  const authenticated = token ? await isValidToken(token) : false;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Redirect unauthenticated users away from protected pages
  if (isProtected && !authenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/register
  if (AUTH_ROUTES.includes(pathname) && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Clear stale invalid cookie
  if (token && !authenticated) {
    const res = NextResponse.next();
    res.cookies.set("constavita_session", "", { maxAge: 0, path: "/" });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
