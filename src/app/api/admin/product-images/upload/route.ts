import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { isBlobReadWriteTokenConfigured } from "@/lib/blob-upload";

const MAX_PRODUCT_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || !user.emailVerifiedAt || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isBlobReadWriteTokenConfigured()) {
    return NextResponse.json(
      {
        error:
          "Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN before uploading product images.",
      },
      { status: 500 },
    );
  }

  let body: HandleUploadBody;

  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("products/")) {
          throw new Error("Invalid upload pathname.");
        }

        return {
          allowedContentTypes: ["image/*"],
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
        error: error instanceof Error ? error.message : "Image upload failed.",
      },
      { status: 400 },
    );
  }
}
