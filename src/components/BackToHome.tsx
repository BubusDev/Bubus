import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackToHome() {
  return (
    <div className="mb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-[#b08898] transition hover:text-[#4d2741]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Vissza a főoldalra
      </Link>
    </div>
  );
}
