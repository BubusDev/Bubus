import { CheckCircle2 } from "lucide-react";

import { AccountCouponsSection } from "@/components/account/AccountCouponsSection";
import { AccountShell } from "@/components/account/AccountShell";
import { ProfileForm } from "@/components/account/ProfileForm";
import { getCouponsForUser } from "@/lib/account";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

type ProfilePageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const currentUser = await requireUser("/profile");
  const user = await db.user.findUniqueOrThrow({
    where: { id: currentUser.id },
  });
  const coupons = await getCouponsForUser(currentUser.id);
  const resolvedSearchParams = await searchParams;

  return (
    <AccountShell
      title="Profil"
      description="A személyes adataid és alapértelmezett szállítási címed."
      currentPath="/profile"
    >
      {resolvedSearchParams.status === "saved" ? (
        <div className="flex items-center gap-3 rounded-md border border-[#d8ebdf] bg-[#f5fbf7] px-4 py-3 text-sm text-[#35624b]">
          <CheckCircle2 className="h-4 w-4" />
          A profiladataid elmentettük.
        </div>
      ) : null}

      <ProfileForm
        user={{
          name: user.name,
          phone: user.phone,
          birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : "",
          profileImageUrl: user.profileImageUrl,
          defaultShippingAddress: user.defaultShippingAddress,
        }}
      />
      <AccountCouponsSection coupons={coupons} />
    </AccountShell>
  );
}
