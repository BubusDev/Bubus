import { redirect } from "next/navigation";

import { getLocalizedPath } from "@/lib/locale-routing";
import { getRequestLocale } from "@/lib/request-locale";
import { SPECIALTIES_BASE_PATH } from "@/lib/specialty-links";
import { getVisibleSpecialties } from "@/lib/specialty-navigation";

export default async function SpecialtiesIndexPage() {
  const [firstSpecialty] = await getVisibleSpecialties();
  const language = await getRequestLocale();

  if (firstSpecialty) {
    redirect(getLocalizedPath(`${SPECIALTIES_BASE_PATH}/${firstSpecialty.slug}`, language));
  }

  redirect(getLocalizedPath("/", language));
}
