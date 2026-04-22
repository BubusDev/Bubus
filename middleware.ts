import { neon } from "@neondatabase/serverless";
import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const EARLY_ACCESS_MODE = process.env.EARLY_ACCESS_MODE === "true";
const DB_URL = process.env.Bubus_DATABASE_URL;
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
]);

const EXCLUDED_PREFIXES = ["/admin", "/api", "/auth", "/_next"];

const sql = DB_URL ? neon(DB_URL) : null;

function isStaticAsset(pathname: string) {
  return pathname.includes(".") || pathname === "/favicon.ico" || pathname === "/robots.txt";
}

function isProtectedStorefrontPath(pathname: string) {
  if (PUBLIC_STORE_PATHS.has(pathname)) {
    return false;
  }

  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  if (isStaticAsset(pathname)) {
    return false;
  }

  return true;
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
  if (!EARLY_ACCESS_MODE || !isProtectedStorefrontPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: AUTH_SECRET });
  const userId = typeof token?.sub === "string" ? token.sub : null;

  if (!userId) {
    return redirectWithNext(request, "/coming-soon");
  }

  if (!sql) {
    console.error("[middleware] Bubus_DATABASE_URL is not configured; early access check skipped.");
    return NextResponse.next();
  }

  const users = (await sql`
    SELECT "role", "earlyAccess"
    FROM "User"
    WHERE "id" = ${userId}
    LIMIT 1
  `) as Array<{ role: "USER" | "ADMIN"; earlyAccess: boolean }>;
  const user = users[0];

  if (!user) {
    return redirectWithNext(request, "/coming-soon");
  }

  if (user.role === "ADMIN" || user.earlyAccess) {
    return NextResponse.next();
  }

  return redirectWithNext(request, "/early-access-pending");
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)"],
};
