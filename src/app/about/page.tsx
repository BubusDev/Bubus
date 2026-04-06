import type { Metadata } from "next";
import { AmbientBlobs } from "@/components/AmbientBlobs";
import { AboutClient } from "@/components/about/AboutClient";

export const metadata: Metadata = {
  title: "Rólunk — Bubus",
  description:
    "A Bubus egy szenvedélyből született ékszermárka. Kézzel alkotott féldrágaköves ékszerek, minden darab egy történet.",
};

export default function AboutPage() {
  return (
    <>
      <AmbientBlobs opacity={0.35} />
      <AboutClient />
    </>
  );
}
