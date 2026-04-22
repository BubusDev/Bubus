"use client";

import { AddToCartForm, AddToCartIcon } from "@/components/shop/AddToCartForm";

type SharedAddToCartButtonProps = {
  productId: string;
  redirectTo?: string;
  quantity?: number;
  disabled?: boolean;
  baseClassName: string;
  idleClassName: string;
  addedClassName: string;
  disabledClassName: string;
  iconClassName?: string;
};

type AddToCartTextButtonProps = SharedAddToCartButtonProps & {
  idleLabel: string;
  addedLabel: string;
  soldOutLabel: string;
};

type AddToCartIconButtonProps = SharedAddToCartButtonProps & {
  ariaLabel: string;
  soldOutAriaLabel: string;
};

export function AddToCartTextButton({
  productId,
  redirectTo = "/",
  quantity = 1,
  disabled = false,
  idleLabel,
  addedLabel,
  soldOutLabel,
  baseClassName,
  idleClassName,
  addedClassName,
  disabledClassName,
  iconClassName = "h-4 w-4",
}: AddToCartTextButtonProps) {
  return (
    <AddToCartForm
      productId={productId}
      quantity={quantity}
      redirectTo={redirectTo}
      disabled={disabled}
    >
      {({ isPending, justAdded }) => (
        <button
          type="submit"
          disabled={disabled}
          className={`${baseClassName} ${
            disabled
              ? disabledClassName
              : justAdded
                ? addedClassName
                : idleClassName
          } ${isPending ? "scale-[0.99]" : ""}`}
        >
          <AddToCartIcon
            justAdded={justAdded}
            className={iconClassName}
          />
          {disabled ? soldOutLabel : justAdded ? addedLabel : idleLabel}
        </button>
      )}
    </AddToCartForm>
  );
}

export function AddToCartIconButton({
  productId,
  redirectTo = "/",
  quantity = 1,
  disabled = false,
  ariaLabel,
  soldOutAriaLabel,
  baseClassName,
  idleClassName,
  addedClassName,
  disabledClassName,
  iconClassName = "h-4 w-4 translate-y-[1px]",
}: AddToCartIconButtonProps) {
  return (
    <AddToCartForm
      productId={productId}
      quantity={quantity}
      redirectTo={redirectTo}
      disabled={disabled}
    >
      {({ isPending, justAdded }) => (
        <button
          type="submit"
          aria-label={disabled ? soldOutAriaLabel : ariaLabel}
          disabled={disabled}
          className={`${baseClassName} ${
            disabled
              ? disabledClassName
              : justAdded
                ? addedClassName
                : idleClassName
          } ${isPending ? "scale-[0.96]" : ""}`}
        >
          <AddToCartIcon
            justAdded={justAdded}
            className={iconClassName}
          />
        </button>
      )}
    </AddToCartForm>
  );
}
