import type { Metadata } from "next";

import { EarlyAccessGatePage } from "@/components/early-access/EarlyAccessGatePage";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Hozzáférés folyamatban — Chicks Jewelry",
  description: "Korai hozzáférés jóváhagyására váró Chicks Jewelry fiók.",
  robots: { index: false, follow: false },
};

export default async function EarlyAccessPendingPage() {
  const user = await getCurrentUser();

  return (
    <EarlyAccessGatePage
      eyebrow="Korai hozzáférés"
      title="Köszönjük a regisztrációt!"
      description="Fiókod létrejött, hamarosan jóváhagyjuk a hozzáférésed. Értesítünk e-mailben."
      email={user?.email ?? null}
      primaryAction={
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#3d1a2e]/30 px-6 py-2.5 text-sm font-medium text-[#3d1a2e] transition hover:border-[#3d1a2e]/50 hover:bg-white/20"
          >
            Kijelentkezés
          </button>
        </form>
      }
    />
  );
}
