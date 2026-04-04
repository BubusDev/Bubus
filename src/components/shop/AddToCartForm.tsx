"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Check } from "lucide-react";

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
        className={`absolute inset-0 h-full w-full transition-all duration-300 ease-out ${
          justAdded ? "scale-75 opacity-0" : "scale-100 opacity-100"
        }`}
      />
      <Check
        className={`absolute inset-0 h-full w-full transition-all duration-300 ease-out ${
          justAdded ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      />
    </span>
  );
}

function ShoppingBagIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.5 8.5h11l-.9 10.2a2 2 0 0 1-2 1.8H9.4a2 2 0 0 1-2-1.8z" />
      <path d="M9 9V7a3 3 0 0 1 6 0v2" />
    </svg>
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
