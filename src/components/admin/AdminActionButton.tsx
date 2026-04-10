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
  sm: "h-8 px-3 text-xs tracking-[0.01em]",
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
    "inline-flex items-center justify-center overflow-hidden rounded-md font-medium disabled:pointer-events-none",
    sizeClassNames[size],
    variantClassNames[variant],
    className,
  ];

  return classes.filter(Boolean).join(" ");
}

function Label({ children }: { children: ReactNode }) {
  return <span>{children}</span>;
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
