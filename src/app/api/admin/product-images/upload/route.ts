import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { isBlobReadWriteTokenConfigured } from "@/lib/blob-upload";
import {
  browserSafeProductImageAccept,
  getUnsafeProductImageMessage,
  isUnsafeImagePath,
} from "@/lib/image-safety";

const MAX_PRODUCT_IMAGE_SIZE_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || !user.emailVerifiedAt || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nincs jogosultság a feltöltéshez." }, { status: 401 });
  }

  if (!isBlobReadWriteTokenConfigured()) {
    return NextResponse.json(
      {
        error:
          "A Vercel Blob nincs beállítva. Állítsd be a BLOB_READ_WRITE_TOKEN változót a termékképek feltöltéséhez.",
      },
      { status: 500 },
    );
  }

  let body: HandleUploadBody;

  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Érvénytelen feltöltési kérés." }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        const ALLOWED_PREFIXES = ["products/", "special-edition/", "homepage/", "specialties/"];
        if (!ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
          throw new Error("Érvénytelen feltöltési útvonal.");
        }

        if (isUnsafeImagePath(pathname)) {
          throw new Error(getUnsafeProductImageMessage(pathname));
        }

        return {
          allowedContentTypes: browserSafeProductImageAccept.split(","),
          maximumSizeInBytes: MAX_PRODUCT_IMAGE_SIZE_BYTES,
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "A képfeltöltés nem sikerült.",
      },
      { status: 400 },
    );
  }
}
