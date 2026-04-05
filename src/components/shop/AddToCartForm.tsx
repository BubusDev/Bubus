"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Check, ShoppingBag } from "lucide-react";

import { addToCartAction } from "@/app/account/actions";

type AddToCartRenderState = {
  isPending: boolean;
  justAdded: boolean;
};

type AddToCartFormProps = {
  children: ReactNode | ((state: AddToCartRenderState) => ReactNode);
  productId: string;
  quantity?: number;
  redirectTo?: string;
  disabled?: boolean;
};

export function AddToCartIcon({
  justAdded,
  className = "h-5 w-5",
}: {
  justAdded: boolean;
  className?: string;
}) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      <ShoppingBagIcon
        className={`absolute inset-0 h-full w-full transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          justAdded ? "scale-[0.82] opacity-0" : "scale-100 opacity-100"
        }`}
      />
      <Check
        strokeWidth={2.4}
        className={`absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          justAdded ? "scale-100 opacity-100" : "scale-[0.82] opacity-0"
        }`}
      />
    </span>
  );
}

function ShoppingBagIcon({ className }: { className: string }) {
  return (
    <ShoppingBag
      className={className}
      aria-hidden="true"
    />
  );
}

export function AddToCartForm({
  children,
  productId,
  quantity = 1,
  redirectTo = "/",
  disabled = false,
}: AddToCartFormProps) {
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await addToCartAction(formData);
          if (!result?.added) {
            return;
          }

          setJustAdded(true);
          if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
          }
          resetTimerRef.current = setTimeout(() => {
            setJustAdded(false);
          }, 1600);
        });
      }}
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={String(quantity)} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <fieldset disabled={disabled || isPending} className="contents">
        {typeof children === "function" ? children({ isPending, justAdded }) : children}
      </fieldset>
    </form>
  );
}
