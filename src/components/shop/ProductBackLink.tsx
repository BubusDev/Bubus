"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type ProductBackLinkProps = {
  fallbackHref: string;
};

export function ProductBackLink({ fallbackHref }: ProductBackLinkProps) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const href =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : fallbackHref;
  const label =
    href === "/favourites"
      ? "Vissza a kedvencekhez"
      : href === "/cart"
        ? "Vissza a kosárhoz"
        : "Vissza a kategóriához";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6b425a] transition hover:text-[#d45c9c]"
    >
      ← {label}
    </Link>
  );
}
