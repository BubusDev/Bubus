"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import { saveMerchandisingOrder } from "@/lib/products-server";

export async function saveMerchandisingOrderAction(input: {
  listingKey: string;
  orderedProductIds: string[];
}) {
  await requireAdminUser("/admin/merchandising");

  const context = await saveMerchandisingOrder(input);

  revalidatePath("/admin/merchandising");
  revalidatePath(context.href);

  if (context.type === "category" || context.type === "editorial") {
    revalidatePath(`/${context.href.replace(/^\//, "")}`);
  }

  return {
    ok: true,
    savedAt: new Date().toISOString(),
  };
}
