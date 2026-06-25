"use client";

import { useActionState, useState } from "react";
import { Send, CheckCircle } from "lucide-react";

import { initialContactFormState, submitContactAction } from "@/app/(storefront)/contact/actions";
import { useCountryLanguage } from "@/components/international/CountryLanguageProvider";

const subjects = [
  { hu: "Rendelés", en: "Order" },
  { hu: "Egyedi darab", en: "Custom piece" },
  { hu: "Egyéb", en: "Other" },
] as const;

export function ContactForm() {
  const [active, setActive] = useState<string>("Egyéb");
  const [successDismissed, setSuccessDismissed] = useState(false);
  const { language } = useCountryLanguage();
  const [state, formAction, pending] = useActionState(
    submitContactAction,
    initialContactFormState,
  );

  const showSuccess = state.status === "success" && !successDismissed;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,241,247,0.84))] p-7 shadow-[0_24px_60px_rgba(108,60,86,0.12)] backdrop-blur-xl sm:p-9">
      {/* Success overlay */}
      {showSuccess && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-[2.5rem] bg-white/90 backdrop-blur-sm">
          <CheckCircle className="h-12 w-12 text-[#3f6f4f]" strokeWidth={1.4} />
          <h3 className="font-[family:var(--font-display)] text-[1.5rem] text-[#4d2741]">
            {language === "en" ? "Message sent" : "Üzenet elküldve!"}
          </h3>
          <p className="max-w-[28ch] text-center text-sm leading-7 text-[#7a5a6c]">
            {language === "en" ? "We will reply soon, usually within 1-2 business days." : "Hamarosan válaszolunk, általában 1-2 munkanapon belül."}
          </p>
          <button
            onClick={() => setSuccessDismissed(true)}
            className="mt-1 rounded-full border border-[#edd8e6] bg-white px-5 py-2 text-sm text-[#7a5a6c] transition hover:bg-[#fff0f7]"
          >
            {language === "en" ? "New message" : "Új üzenet"}
          </button>
        </div>
      )}

      <p className="text-[10px] uppercase tracking-[0.32em] text-[#af7795]">
        {language === "en" ? "Send a message" : "Üzenet küldése"}
      </p>

      <form
        action={formAction}
        onChangeCapture={() => setSuccessDismissed(false)}
        className="mt-5 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={language === "en" ? "Name" : "Név"} name="name" required placeholder={language === "en" ? "Anna Smith" : "Kovács Anna"} />
          <Field label="E-mail" name="email" type="email" required placeholder="anna@example.com" />
        </div>

        {/* Subject chips */}
        <div>
          <label className="mb-2 block text-sm text-[#5b344c]">{language === "en" ? "Subject" : "Tárgy"}</label>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <button
                key={s.hu}
                type="button"
                onClick={() => setActive(s.hu)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                  active === s.hu
                    ? "border-[#e9b6d0] bg-[linear-gradient(135deg,#ec7cb2,#d95f92)] text-white shadow-[0_4px_14px_rgba(217,95,146,0.25)]"
                    : "border-[#edd8e6] bg-white/80 text-[#7a5a6c] hover:border-[#e9b6d0] hover:bg-white"
                }`}
              >
                {language === "en" ? s.en : s.hu}
              </button>
            ))}
          </div>
          <input type="hidden" name="subject" value={active} />
        </div>

        {state.status === "error" && state.message ? (
          <p className="rounded-[1rem] border border-[#f3d3db] bg-[#fff5f7] px-4 py-3 text-sm text-[#9f4564]">
            {state.message}
          </p>
        ) : null}

        <div>
          <label className="mb-1.5 block text-sm text-[#5b344c]">{language === "en" ? "Message" : "Üzenet"}</label>
          <textarea
            name="message"
            required
            rows={5}
            placeholder={language === "en" ? "Write your message..." : "Írj nekünk bármit..."}
            className="w-full resize-none rounded-[1rem] border border-[rgba(224,191,208,0.8)] bg-white/82 px-4 py-3 text-sm text-[#31192d] outline-none transition placeholder:text-[#b188a4] focus:border-[#d95f92] focus:bg-white/96 focus:shadow-[0_0_0_4px_rgba(236,124,178,0.14)]"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#c45a85,#e07a70)] py-3.5 text-sm font-medium text-white shadow-[0_12px_30px_rgba(196,90,133,0.28)] transition hover:-translate-y-[1px] hover:shadow-[0_16px_36px_rgba(196,90,133,0.34)] disabled:opacity-70"
        >
          {pending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {pending
            ? language === "en" ? "Sending..." : "Küldés..."
            : language === "en" ? "Send message" : "Üzenet küldése"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label, name, type = "text", required = false, placeholder = "",
}: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-[#5b344c]">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-[1rem] border border-[rgba(224,191,208,0.8)] bg-white/82 px-4 py-3 text-sm text-[#31192d] outline-none transition placeholder:text-[#b188a4] focus:border-[#d95f92] focus:bg-white/96 focus:shadow-[0_0_0_4px_rgba(236,124,178,0.14)]"
      />
    </div>
  );
}
