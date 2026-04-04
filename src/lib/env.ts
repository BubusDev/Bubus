const LOCAL_DEV_URL = "http://127.0.0.1:3000";

function normalizeUrl(url: string) {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://${url}`;
}

export function getAuthBaseUrl() {
  const rawUrl =
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.APP_URL ??
    process.env.VERCEL_URL ??
    LOCAL_DEV_URL;

  return normalizeUrl(rawUrl);
}

export function getAuthSecret() {
  return (
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "bubus-dev-auth-secret-change-me"
      : undefined)
  );
}

export function getTrustHost() {
  const rawValue = process.env.AUTH_TRUST_HOST ?? process.env.NEXTAUTH_TRUST_HOST;

  if (rawValue != null) {
    return rawValue === "true";
  }

  if (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.APP_URL ??
    process.env.VERCEL ??
    process.env.VERCEL_URL
  ) {
    return true;
  }

  return process.env.NODE_ENV !== "production";
}
