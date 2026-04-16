import { AdminShell } from "@/components/admin/AdminShell";
import { StoneForm } from "../StoneForm";

export default function AdminNewStonePage() {
  return (
    <AdminShell title="Új kő hozzáadása">
      <div className="max-w-2xl">
        <StoneForm />
      </div>
    </AdminShell>
  );
}
