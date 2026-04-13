// EmptyStateCard.tsx
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type EmptyStateCardProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
};

export function EmptyStateCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateCardProps) {
  return (
    <section className="bg-white px-4 py-10 text-center sm:px-10 sm:py-14">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#eee4e8] bg-[#fcfafb] text-[#9f7489]">
        <Icon className="h-7 w-7" />
      </div>

      <p className="mt-5 text-[10px] uppercase tracking-[0.32em] text-[#b691a4]">
        {eyebrow}
      </p>

      <h2 className="mt-3 font-[family:var(--font-display)] text-[1.7rem] leading-tight text-[#3f2735] sm:text-[2.2rem]">
        {title}
      </h2>

      <p className="mx-auto mt-4 max-w-[42ch] text-sm leading-7 text-[#7a6872]">
        {description}
      </p>

      <Link
        href={actionHref}
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#f183bc] px-6 text-sm font-medium text-white transition hover:bg-[#ea6fb0]"
      >
        {actionLabel}
      </Link>
    </section>
  );
}
