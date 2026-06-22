"use client";

import { useState } from "react";

export type ShippingData =
  | { mode: "foxpost"; name: string; phone: string; pointCode: string }
  | { mode: "home"; name: string; phone: string; address: string; zip: string; city: string };

type ShippingStepProps = {
  initialName: string;
  initialPhone: string;
  initialAddress: string;
  onNext: (data: ShippingData) => void;
  onBack: () => void;
};

export function ShippingStep({
  initialName,
  initialPhone,
  initialAddress,
  onNext,
  onBack,
}: ShippingStepProps) {
  const [mode, setMode] = useState<"foxpost" | "home">("foxpost");
  const [foxpostPointCode, setFoxpostPointCode] = useState("");
  const [foxpostPointLabel, setFoxpostPointLabel] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    if (mode === "foxpost") {
      onNext({
        mode: "foxpost",
        name: (data.get("name") as string).trim(),
        phone: (data.get("phone") as string).trim(),
        pointCode: foxpostPointCode,
      });
    } else {
      onNext({
        mode: "home",
        name: (data.get("name") as string).trim(),
        phone: (data.get("phone") as string).trim(),
        address: (data.get("address") as string).trim(),
        zip: (data.get("zip") as string).trim(),
        city: (data.get("city") as string).trim(),
      });
    }
  }

  return (
    <div className="mx-auto max-w-[540px]">
      <h2 className="mb-1 text-lg font-semibold text-[#1a1a1a]">Szállítás</h2>
      <p className="mb-6 text-sm leading-6 text-[#666]">
        Válaszd ki, hogyan szeretnéd átvenni a rendelést. A pontos adatokat a fizetés előtt még
        ellenőrizheted.
      </p>

      {/* Shipping mode toggle */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(["foxpost", "home"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md border py-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2 ${
              mode === m
                ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                : "border-[#d0ccc8] text-[#555] hover:border-[#1a1a1a]"
            }`}
          >
            {m === "foxpost" ? "Foxpost automata" : "Házhozszállítás"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Common: name + phone */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            name="name"
            defaultValue={initialName}
            required
            placeholder="Teljes név *"
            className="w-full rounded-md border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#8b8580] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#c45a85]/20"
          />
          <input
            name="phone"
            type="tel"
            defaultValue={initialPhone}
            required
            placeholder="Telefonszám *"
            className="w-full rounded-md border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#8b8580] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#c45a85]/20"
          />
        </div>

        {mode === "foxpost" ? (
          <div>
            {/*
              Foxpost widget integráció:
              1. Regisztráció: https://www.foxpost.hu/uzleti-megoldasok/
              2. API dok: https://cdn.foxpost.hu/apidoc/
              3. Widget: <script src="https://cdn.foxpost.hu/apt-finder/v1/app/">
                 → window.foxpost.open({ onSelect: (point) => setFoxpostPoint(point) })
              4. Csomag létrehozás: POST https://api.foxpost.hu/v1/parcel
                 → visszaad: tracking_code, label_url (PDF)
            */}
            <div className="rounded-md border border-dashed border-[#d0ccc8] p-5 text-center text-sm text-[#888] sm:p-6">
              {foxpostPointLabel ? (
                <p className="font-medium text-[#1a1a1a]">
                  Kiválasztott pont: <span className="font-semibold">{foxpostPointLabel}</span>
                  <button
                    type="button"
                    onClick={() => { setFoxpostPointCode(""); setFoxpostPointLabel(""); }}
                    className="ml-3 text-xs text-[#888] underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
                  >
                    Csere
                  </button>
                </p>
              ) : (
                <>
                  <p className="mb-3 text-[#666]">
                    Válaszd ki a Foxpost automatát, ahová a rendelést kéred.
                  </p>
                  {/* TODO: Foxpost widget aktiválása API key után */}
                  {/* useEffect(() => { window.foxpost?.open({ onSelect: (p) => { setFoxpostPointCode(p.code); setFoxpostPointLabel(p.name); } }) }, []) */}
                  <button
                    type="button"
                    onClick={() => {
                      // Placeholder — valódi integrációnál Foxpost widget nyílik
                      const mockCode = "BUD001";
                      const mockLabel = "Budapest, Teszt automata (demo)";
                      setFoxpostPointCode(mockCode);
                      setFoxpostPointLabel(mockLabel);
                    }}
                    className="rounded-md border border-[#1a1a1a] px-4 py-2 text-xs font-medium text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
                  >
                    Csomagpont választása
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <input
              name="address"
              defaultValue={initialAddress}
              required
              placeholder="Utca, házszám *"
              className="w-full rounded-md border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#8b8580] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#c45a85]/20"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr]">
              <input
                name="zip"
                required
                placeholder="Irsz. *"
                className="w-full rounded-md border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#8b8580] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#c45a85]/20"
              />
              <input
                name="city"
                required
                placeholder="Város *"
                className="w-full rounded-md border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#8b8580] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#c45a85]/20"
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-md border border-[#d0ccc8] py-3.5 text-sm font-medium text-[#555] transition hover:border-[#1a1a1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
          >
            Vissza
          </button>
          <button
            type="submit"
            disabled={mode === "foxpost" && !foxpostPointCode}
            className="flex-1 rounded-md bg-[#1a1a1a] py-3.5 text-sm font-medium text-white transition hover:bg-[#333] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#ccc]"
          >
            Folytatás a fizetéshez
          </button>
        </div>
      </form>
    </div>
  );
}
