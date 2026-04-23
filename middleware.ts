import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const EARLY_ACCESS_MODE = process.env.EARLY_ACCESS_MODE === "true";
const AUTH_SECRET =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV === "development" ? "bubus-dev-auth-secret-change-me" : undefined);

const PUBLIC_STORE_PATHS = new Set([
  "/coming-soon",
  "/early-access-pending",
  "/sign-in",
  "/sign-up",
  "/login",
  "/verify-email",
  "/terms",
  "/privacy",
  "/cookies",
  "/faq",
  "/contact",
]);

const EXCLUDED_PREFIXES = ["/admin", "/api", "/auth", "/_next"];

function isStaticAsset(pathname: string) {
  return pathname.includes(".") || pathname === "/favicon.ico" || pathname === "/robots.txt";
}

function isPublicPath(pathname: string) {
  return PUBLIC_STORE_PATHS.has(pathname);
}

function isExcludedPath(pathname: string) {
  return EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function redirectWithNext(request: NextRequest, pathname: string) {
  const url = new URL(pathname, request.url);
  const originalPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (originalPath && originalPath !== "/") {
    url.searchParams.set("next", originalPath);
  }

  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || isExcludedPath(pathname) || isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (!EARLY_ACCESS_MODE) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: AUTH_SECRET,
    secureCookie: request.nextUrl.protocol === "https:",
  });

  if (typeof token?.sub !== "string") {
    return redirectWithNext(request, "/coming-soon");
  }

  const isAdmin = token.role === "ADMIN";
  const isApproved = token.earlyAccess === true;

  if (isAdmin || isApproved) {
    return NextResponse.next();
  }

  return redirectWithNext(request, "/early-access-pending");
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)"],
};
