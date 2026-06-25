import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getLocalizedPath } from "@/lib/locale-routing";
import { getRequestLocale } from "@/lib/request-locale";

export async function BackToHome() {
  const language = await getRequestLocale();

  return (
    <div className="mb-8">
      <Link
        href={getLocalizedPath("/", language)}
        className="inline-flex items-center gap-2 text-sm text-[#b08898] transition hover:text-[#4d2741]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {language === "en" ? "Back to home" : "Vissza a főoldalra"}
      </Link>
    </div>
  );
}
