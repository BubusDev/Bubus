"use client";

import { useTransition, type ReactNode } from "react";

import { addToCartAction } from "@/app/account/actions";

type AddToCartFormProps = {
  children: ReactNode;
  productId: string;
  quantity?: number;
  redirectTo?: string;
};

function animateCartCheckmark(target: HTMLElement | null) {
  if (typeof window === "undefined" || !target) {
    return;
  }

  const cartTarget = document.querySelector<HTMLElement>('[data-cart-icon-target="cart"]');

  if (!cartTarget) {
    return;
  }

  const sourceRect = target.getBoundingClientRect();
  const cartRect = cartTarget.getBoundingClientRect();
  const startX = sourceRect.left + sourceRect.width / 2;
  const startY = sourceRect.top + sourceRect.height / 2;
  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;
  const flyer = document.createElement("span");

  flyer.setAttribute("aria-hidden", "true");
  flyer.textContent = "✓";
  Object.assign(flyer.style, {
    position: "fixed",
    left: `${startX}px`,
    top: `${startY}px`,
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.96)",
    color: "#4d2741",
    boxShadow: "0 12px 28px rgba(191,117,162,0.22)",
    border: "1px solid rgba(241, 183, 209, 0.9)",
    pointerEvents: "none",
    zIndex: "80",
    opacity: "0",
    transform: "translate(-50%, -50%) translate3d(0, 8px, 0) scale(0.82)",
    transition:
      "transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out",
  });

  document.body.appendChild(flyer);

  requestAnimationFrame(() => {
    flyer.style.opacity = "1";
    flyer.style.transform = `translate(-50%, -50%) translate3d(${endX - startX}px, ${endY - startY - 12}px, 0) scale(1)`;
  });

  flyer.addEventListener(
    "transitionend",
    () => {
      flyer.remove();
      cartTarget.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.08)" },
          { transform: "scale(1)" },
        ],
        { duration: 260, easing: "ease-out" },
      );
    },
    { once: true },
  );
}

export function AddToCartForm({
  children,
  productId,
  quantity = 1,
  redirectTo = "/",
}: AddToCartFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        const submitter =
          typeof document !== "undefined"
            ? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
            : null;

        startTransition(async () => {
          await addToCartAction(formData);
          animateCartCheckmark(submitter);
        });
      }}
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={String(quantity)} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <fieldset disabled={isPending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
