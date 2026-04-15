import { TicketPercent } from "lucide-react";

import { AccountCouponsSection } from "@/components/account/AccountCouponsSection";
import { AccountShell } from "@/components/account/AccountShell";
import { EmptyStateCard } from "@/components/account/EmptyStateCard";
import { getCouponsForUser } from "@/lib/account";
import { requireAccountUser } from "@/lib/auth";

export default async function CouponsPage() {
  const currentUser = await requireAccountUser("/coupons");
  const coupons = await getCouponsForUser(currentUser.id);

  return (
    <AccountShell title="Kuponjaim">
      {coupons.length === 0 ? (
        <EmptyStateCard
          icon={TicketPercent}
          eyebrow="Nincs aktív kupon"
          title="Még nincs elérhető kedvezményed"
          description="Iratkozz fel a hírlevelünkre vagy vásárolj rendszeresen, és személyre szóló kedvezményeket kapsz."
          actionHref="/settings"
          actionLabel="Hírlevél beállítása"
        />
      ) : (
        <AccountCouponsSection coupons={coupons} />
      )}
    </AccountShell>
  );
}
