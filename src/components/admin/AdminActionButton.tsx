import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type AdminActionButtonVariant = "primary" | "secondary" | "danger";
type AdminActionButtonSize = "md" | "sm";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: AdminActionButtonVariant;
  size?: AdminActionButtonSize;
};

type AdminActionLinkProps = SharedProps & {
  href: string;
};

type AdminActionButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement>;

const sizeClassNames: Record<AdminActionButtonSize, string> = {
  md: "h-11 px-5 text-sm tracking-[-0.01em]",
  sm: "h-10 px-4 text-sm",
};

const variantClassNames: Record<AdminActionButtonVariant, string> = {
  primary:
    "border border-[#cfa9bb] bg-gradient-to-b from-[#c78daa] via-[#b56b8f] to-[#a2557d] text-[#fff8fc] shadow-[0_10px_24px_rgba(162,85,125,0.18)] hover:-translate-y-[1px] hover:shadow-[0_14px_30px_rgba(162,85,125,0.22)]",
  secondary:
    "border border-[#e8d9e1] bg-white text-[#5f3d50] hover:border-[#d9b7c8] hover:bg-[#fff7fa]",
  danger:
    "border border-[#efd0de] bg-[linear-gradient(180deg,rgba(255,245,249,0.98),rgba(255,237,244,0.96))] text-[#975273] shadow-[0_12px_26px_rgba(164,91,130,0.08),inset_0_1px_0_rgba(255,255,255,0.72)] before:absolute before:inset-x-[1px] before:top-[1px] before:h-[44%] before:rounded-full before:bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(255,255,255,0.14)_72%,transparent)] before:content-[''] hover:-translate-y-[1px] hover:border-[#e5b8cd] hover:bg-[linear-gradient(180deg,rgba(255,248,251,1),rgba(255,239,246,0.98))] hover:shadow-[0_18px_32px_rgba(164,91,130,0.12),inset_0_1px_0_rgba(255,255,255,0.76)]",
};

function getClassName({
  variant = "secondary",
  size = "md",
  className,
}: Omit<SharedProps, "children">) {
  const classes = [
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9adc3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8fb] disabled:pointer-events-none disabled:opacity-60",
    sizeClassNames[size],
    variantClassNames[variant],
    className,
  ];

  return classes.filter(Boolean).join(" ");
}

function Label({ children }: { children: ReactNode }) {
  return <span className="relative z-10">{children}</span>;
}

function PrimaryChrome() {
  return (
    <>
      <span className="pointer-events-none absolute inset-x-[8%] top-[1px] h-[42%] rounded-full bg-white/18 blur-[6px]" />
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/12" />
    </>
  );
}

export function AdminActionLink({
  href,
  children,
  className,
  variant = "secondary",
  size = "md",
}: AdminActionLinkProps) {
  return (
    <Link href={href} className={getClassName({ className, variant, size })}>
      {variant === "primary" ? <PrimaryChrome /> : null}
      <Label>{children}</Label>
    </Link>
  );
}

export function AdminActionButton({
  children,
  className,
  variant = "secondary",
  size = "md",
  type = "button",
  ...props
}: AdminActionButtonProps) {
  return (
    <button
      type={type}
      className={getClassName({ className, variant, size })}
      {...props}
    >
      {variant === "primary" ? <PrimaryChrome /> : null}
      <Label>{children}</Label>
    </button>
  );
}
