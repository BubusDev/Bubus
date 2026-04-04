import { NextResponse } from "next/server";

import { auth } from "../../../../../auth";
import { getFavouriteProductIds } from "@/lib/account";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ productIds: [] });
  }

  const favouriteIds = await getFavouriteProductIds(userId);

  return NextResponse.json({
    productIds: Array.from(favouriteIds),
  });
}
