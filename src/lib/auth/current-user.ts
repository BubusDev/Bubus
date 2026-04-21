import "server-only";

import { cache } from "react";
import { AuthError } from "next-auth";

import { auth } from "../../../auth";
import { db } from "@/lib/db";

export const getCurrentUser = cache(async () => {
  let session = null;

  try {
    session = await auth();
  } catch (error) {
    if (error instanceof AuthError) {
      return null;
    }

    throw error;
  }

  if (!session?.user?.id) {
    return null;
  }

  return db.user.findUnique({
    where: { id: session.user.id },
  });
});
