import { redirect } from "next/navigation";

export default function NewAdminProductPage() {
  redirect("/admin/products?new=1");
}
