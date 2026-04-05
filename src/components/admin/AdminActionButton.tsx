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
  md: "h-12 px-5 text-sm",
  sm: "h-10 px-4 text-sm",
};

const variantClassNames: Record<AdminActionButtonVariant, string> = {
  primary:
    "border border-[#8f6078]/45 bg-[linear-gradient(135deg,#653049_0%,#8a506b_52%,#b77497_100%)] text-white shadow-[0_18px_40px_rgba(101,48,73,0.24),inset_0_1px_0_rgba(255,255,255,0.18)] before:absolute before:inset-x-[1px] before:top-[1px] before:h-[48%] before:rounded-full before:bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0.12)_58%,transparent)] before:content-[''] after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_-12px_18px_rgba(76,30,49,0.22)] after:content-[''] hover:-translate-y-[1px] hover:shadow-[0_24px_52px_rgba(101,48,73,0.28),inset_0_1px_0_rgba(255,255,255,0.22)]",
  secondary:
    "border border-[#e8d7e1] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,251,0.92))] text-[#654458] shadow-[0_12px_28px_rgba(124,76,99,0.08),inset_0_1px_0_rgba(255,255,255,0.7)] before:absolute before:inset-x-[1px] before:top-[1px] before:h-[44%] before:rounded-full before:bg-[linear-gradient(180deg,rgba(255,255,255,0.75),rgba(255,255,255,0.18)_70%,transparent)] before:content-[''] hover:-translate-y-[1px] hover:border-[#dcb8cb] hover:shadow-[0_18px_34px_rgba(124,76,99,0.12),inset_0_1px_0_rgba(255,255,255,0.78)]",
  danger:
    "border border-[#efd0de] bg-[linear-gradient(180deg,rgba(255,245,249,0.98),rgba(255,237,244,0.96))] text-[#975273] shadow-[0_12px_26px_rgba(164,91,130,0.08),inset_0_1px_0_rgba(255,255,255,0.72)] before:absolute before:inset-x-[1px] before:top-[1px] before:h-[44%] before:rounded-full before:bg-[linear-gradient(180deg,rgba(255,255,255,0.68),rgba(255,255,255,0.14)_72%,transparent)] before:content-[''] hover:-translate-y-[1px] hover:border-[#e5b8cd] hover:bg-[linear-gradient(180deg,rgba(255,248,251,1),rgba(255,239,246,0.98))] hover:shadow-[0_18px_32px_rgba(164,91,130,0.12),inset_0_1px_0_rgba(255,255,255,0.76)]",
};

function getClassName({
  variant = "secondary",
  size = "md",
  className,
}: Omit<SharedProps, "children">) {
  const classes = [
    "relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9adc3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8fb] disabled:pointer-events-none disabled:opacity-60",
    sizeClassNames[size],
    variantClassNames[variant],
    className,
  ];

  return classes.filter(Boolean).join(" ");
}

function Label({ children }: { children: ReactNode }) {
  return <span className="relative z-10">{children}</span>;
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
      <Label>{children}</Label>
    </button>
  );
}
