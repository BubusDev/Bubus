import convertHeic from "heic-convert";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";

export const runtime = "nodejs";

const MAX_HEIC_SIZE_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !user.emailVerifiedAt || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Érvénytelen kérés." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Hiányzik a fájl." }, { status: 400 });
  }

  if (file.size > MAX_HEIC_SIZE_BYTES) {
    return NextResponse.json({ error: "A fájl túl nagy." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const convertedImage = await convertHeic({
      buffer,
      format: "JPEG",
      quality: 0.86,
    });

    return new Response(new Uint8Array(convertedImage), {
      headers: { "content-type": "image/jpeg" },
    });
  } catch {
    return NextResponse.json({ error: "A HEIC konvertálása nem sikerült." }, { status: 422 });
  }
}
