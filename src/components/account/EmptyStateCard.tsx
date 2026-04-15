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
    <section className="rounded-lg border border-[#e8e5e0] bg-white/82 px-4 py-10 text-center sm:px-10 sm:py-14">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-[#eee4e8] bg-[#fff8fb] text-[#9f7489]">
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
        className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-[#1a1a1a] px-5 text-sm font-medium text-white transition hover:bg-[#333]"
      >
        {actionLabel}
      </Link>
    </section>
  );
}
