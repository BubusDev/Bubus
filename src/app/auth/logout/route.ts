import { signOut } from "../../../../auth";

export async function GET(request: Request) {
  return signOut({ redirectTo: new URL("/", request.url).toString() });
}
