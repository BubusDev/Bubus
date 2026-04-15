import { signOut } from "../../../../auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return Response.redirect(new URL("/", request.url), 303);
}

export async function POST(request: Request) {
  return signOut({ redirectTo: new URL("/", request.url).toString() });
}
