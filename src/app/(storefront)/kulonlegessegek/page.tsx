import { redirect } from "next/navigation";

import { SPECIALTIES_BASE_PATH } from "@/lib/specialty-links";
import { getVisibleSpecialties } from "@/lib/specialty-navigation";

export default async function SpecialtiesIndexPage() {
  const [firstSpecialty] = await getVisibleSpecialties();

  if (firstSpecialty) {
    redirect(`${SPECIALTIES_BASE_PATH}/${firstSpecialty.slug}`);
  }

  redirect("/");
}
