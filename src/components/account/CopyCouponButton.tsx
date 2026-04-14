"use client";

import { useState, useTransition } from "react";
import { Check, Copy } from "lucide-react";

export function CopyCouponButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCopy() {
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        setCopied(false);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isPending}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#e6cdda] bg-white/80 px-3 text-xs font-medium text-[#6d465c] transition hover:border-[#d7a1bd] hover:bg-white disabled:opacity-60"
      aria-label={`${code} kuponkód másolása`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? "Másolva" : "Másolás"}</span>
    </button>
  );
}
