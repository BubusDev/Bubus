import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  getSpecialtyHref,
  getVisibleSpecialties,
} from "@/lib/specialty-navigation";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: `Különlegességek | ${siteName}`,
  description:
    "Fedezd fel a Chicks Jewelry különleges válogatásait: napfogók, álomfogók, bokaláncok és további kézzel kezelt kollekciók.",
  alternates: {
    canonical: "/kulonlegessegek",
  },
};

export default async function SpecialtiesLandingPage() {
  const specialties = await getVisibleSpecialties();

  if (specialties[0]) {
    redirect(getSpecialtyHref(specialties[0]));
  }

  return (
    <main className="mx-auto max-w-[1450px] px-6 pb-24 pt-10 sm:px-8">
      <div className="border-y border-[#eadce4] py-8 text-sm text-[#6f666b]">
        Jelenleg nincs látható különlegesség.
      </div>
    </main>
  );
}
