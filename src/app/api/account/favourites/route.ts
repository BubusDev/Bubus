import { NextResponse } from "next/server";

import { auth } from "../../../../../auth";
import { db } from "@/lib/db";

function readProductId(body: unknown) {
  if (!body || typeof body !== "object") {
    return "";
  }

  const value = "productId" in body ? body.productId : "";
  return typeof value === "string" ? value.trim() : "";
}

function readRedirectTo(body: unknown) {
  if (!body || typeof body !== "object") {
    return "/";
  }

  const value = "redirectTo" in body ? body.redirectTo : "/";
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/";
  }

  return value;
}

async function requireApiUser(body: unknown) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      {
        authenticated: false,
        redirectTo: `/sign-in?next=${encodeURIComponent(readRedirectTo(body))}`,
      },
      { status: 401 },
    );
  }

  return userId;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const userId = await requireApiUser(body);

  if (userId instanceof NextResponse) {
    return userId;
  }

  const productId = readProductId(body);

  if (!productId) {
    return NextResponse.json({ favourited: false }, { status: 400 });
  }

  await db.favourite.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    update: {},
    create: {
      userId,
      productId,
    },
  });

  return NextResponse.json({ favourited: true });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const userId = await requireApiUser(body);

  if (userId instanceof NextResponse) {
    return userId;
  }

  const productId = readProductId(body);

  if (!productId) {
    return NextResponse.json({ favourited: false }, { status: 400 });
  }

  await db.favourite.deleteMany({
    where: {
      userId,
      productId,
    },
  });

  return NextResponse.json({ favourited: false });
}
