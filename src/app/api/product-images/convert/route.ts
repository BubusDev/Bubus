import convertHeic from "heic-convert";
import { NextResponse } from "next/server";

import { isUnsafeImagePath } from "@/lib/image-safety";

export const runtime = "nodejs";

const MAX_SOURCE_IMAGE_BYTES = 12 * 1024 * 1024;

function isAllowedBlobProductImageUrl(url: URL) {
  return (
    url.protocol === "https:" &&
    url.hostname.endsWith(".public.blob.vercel-storage.com") &&
    url.pathname.startsWith("/products/") &&
    isUnsafeImagePath(url.pathname)
  );
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const src = requestUrl.searchParams.get("src");

  if (!src) {
    return NextResponse.json({ error: "Hiányzik a kép URL." }, { status: 400 });
  }

  let imageUrl: URL;

  try {
    imageUrl = new URL(src);
  } catch {
    return NextResponse.json({ error: "Érvénytelen kép URL." }, { status: 400 });
  }

  if (!isAllowedBlobProductImageUrl(imageUrl)) {
    return NextResponse.json({ error: "Nem engedélyezett kép URL." }, { status: 400 });
  }

  const imageResponse = await fetch(imageUrl, {
    headers: { accept: "image/heic,image/heif,image/*" },
  });

  if (!imageResponse.ok) {
    return NextResponse.json({ error: "A forráskép nem érhető el." }, { status: 404 });
  }

  const contentLength = Number(imageResponse.headers.get("content-length") ?? 0);

  if (contentLength > MAX_SOURCE_IMAGE_BYTES) {
    return NextResponse.json({ error: "A kép túl nagy." }, { status: 413 });
  }

  const sourceBuffer = Buffer.from(await imageResponse.arrayBuffer());

  if (sourceBuffer.byteLength > MAX_SOURCE_IMAGE_BYTES) {
    return NextResponse.json({ error: "A kép túl nagy." }, { status: 413 });
  }

  try {
    const convertedImage = await convertHeic({
      buffer: sourceBuffer,
      format: "JPEG",
      quality: 0.86,
    });

    return new Response(new Uint8Array(convertedImage), {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
        "content-type": "image/jpeg",
      },
    });
  } catch {
    return NextResponse.json({ error: "A kép konvertálása nem sikerült." }, { status: 422 });
  }
}
