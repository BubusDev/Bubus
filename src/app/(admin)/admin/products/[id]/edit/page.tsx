import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditAdminProductPage({ params }: Props) {
  const { id } = await params;
  redirect(`/admin/products?edit=${id}`);
}
