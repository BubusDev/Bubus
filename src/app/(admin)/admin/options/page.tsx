import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Opciókészletek átirányítása — Chicks Jewelry Admin",
  robots: { index: false, follow: false },
};

export default async function AdminOptionsPage() {
  redirect("/admin/products/new");
}
