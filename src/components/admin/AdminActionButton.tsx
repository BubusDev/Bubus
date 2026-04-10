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
  primary: "admin-button-primary",
  secondary: "admin-button-secondary",
  danger: "admin-button-danger",
};

function getClassName({
  variant = "secondary",
  size = "md",
  className,
}: Omit<SharedProps, "children">) {
  const classes = [
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium disabled:pointer-events-none",
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
      <span className="pointer-events-none absolute inset-x-[8%] top-[1px] h-[42%] rounded-full bg-white/14 blur-[6px]" />
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
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
