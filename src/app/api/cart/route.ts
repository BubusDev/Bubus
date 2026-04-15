import { NextResponse } from "next/server";

import { getRequestCart } from "@/lib/account";

export async function GET() {
  try {
    const { cart } = await getRequestCart();
    return NextResponse.json(cart);
  } catch {
    return NextResponse.json({
      id: "",
      items: [],
      subtotal: 0,
      shipping: 0,
      discount: 0,
      appliedPromo: null,
      total: 0,
    });
  }
}
