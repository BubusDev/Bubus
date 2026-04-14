"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, LoaderCircle, X } from "lucide-react";

import {
  applyPromoCodeAction,
  removePromoCodeAction,
  type PromoCodeActionState,
} from "@/app/(storefront)/account/actions";
import type { AppliedPromo } from "@/lib/promo-codes";
import { formatPrice } from "@/lib/catalog";

const initialState: PromoCodeActionState = {
  status: "idle",
  message: "",
};

function ApplyButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-[#4d2741] px-4 text-xs font-medium text-white transition hover:bg-[#6d3a5d] disabled:cursor-not-allowed disabled:bg-[#c7b3bf]"
    >
      {pending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : "Alkalmaz"}
    </button>
  );
}

export function PromoCodeForm({ appliedPromo }: { appliedPromo: AppliedPromo | null }) {
  const [state, formAction] = useActionState(applyPromoCodeAction, initialState);

  if (appliedPromo) {
    return (
      <div className="rounded-lg border border-[#e5cfda] bg-[#fff8fb] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-medium text-[#4d2741]">
              <Check className="h-4 w-4 text-[#8f5f77]" />
              {appliedPromo.code} alkalmazva
            </p>
            <p className="mt-1 text-xs leading-5 text-[#7a6070]">
              {appliedPromo.discountPercent}% kedvezmény, megtakarítás:{" "}
              <span className="font-medium text-[#4d2741]">
                {formatPrice(appliedPromo.discountAmount)}
              </span>
            </p>
          </div>
          <form action={removePromoCodeAction}>
            <button
              type="submit"
              className="inline-flex h-8 items-center gap-1 rounded-md border border-[#dfc9d5] px-2.5 text-xs font-medium text-[#7a6070] transition hover:bg-white hover:text-[#4d2741]"
            >
              <X className="h-3.5 w-3.5" />
              Törlés
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-lg border border-[#eadce3] bg-[#fffafd] p-3">
      <label htmlFor="promoCode" className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#b06b8e]">
        Promóciós kód
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="promoCode"
          name="promoCode"
          type="text"
          autoComplete="off"
          placeholder="KÓD"
          className="min-w-0 flex-1 rounded-md border border-[#d8bfce] bg-white px-3 text-sm font-medium uppercase tracking-[0.08em] text-[#4d2741] outline-none transition placeholder:text-[#c6aaba] focus:border-[#b06b8e]"
        />
        <ApplyButton />
      </div>
      {state.message ? (
        <p
          className={`mt-2 text-xs leading-5 ${
            state.status === "success" ? "text-[#6c8452]" : "text-[#9b476f]"
          }`}
        >
          {state.message}
        </p>
      ) : (
        <p className="mt-2 text-xs leading-5 text-[#8b7080]">
          Írd be a kódot, a kedvezményt azonnal újraszámoljuk.
        </p>
      )}
    </form>
  );
}
