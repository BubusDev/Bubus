import { NextResponse } from "next/server";

import { getFavouriteProducts } from "@/lib/account";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.emailVerifiedAt) {
      return NextResponse.json([]);
    }
    const favourites = await getFavouriteProducts(user.id);
    return NextResponse.json(favourites);
  } catch {
    return NextResponse.json([]);
  }
}
