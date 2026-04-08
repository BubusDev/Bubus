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
    <div className="max-w-[540px] mx-auto">
      <h2 className="text-lg font-semibold text-[#1a1a1a] mb-1">Szállítás</h2>
      <p className="text-sm text-[#666] mb-6">Válassza ki a kézbesítés módját.</p>

      {/* Shipping mode toggle */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {(["foxpost", "home"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`border py-3 text-sm font-medium transition ${
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
        <div className="grid grid-cols-2 gap-3">
          <input
            name="name"
            defaultValue={initialName}
            required
            placeholder="Teljes név *"
            className="w-full border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition"
          />
          <input
            name="phone"
            type="tel"
            defaultValue={initialPhone}
            required
            placeholder="Telefonszám *"
            className="w-full border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition"
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
            <div className="border border-dashed border-[#d0ccc8] p-6 text-center text-sm text-[#888]">
              {foxpostPointLabel ? (
                <p className="font-medium text-[#1a1a1a]">
                  Kiválasztott pont: <span className="font-semibold">{foxpostPointLabel}</span>
                  <button
                    type="button"
                    onClick={() => { setFoxpostPointCode(""); setFoxpostPointLabel(""); }}
                    className="ml-3 text-xs text-[#888] underline"
                  >
                    Csere
                  </button>
                </p>
              ) : (
                <>
                  <p className="mb-3 text-[#666]">Foxpost csomagautomata választó</p>
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
                    className="border border-[#1a1a1a] px-4 py-2 text-xs font-medium text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition"
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
              className="w-full border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition"
            />
            <div className="grid grid-cols-[120px_1fr] gap-3">
              <input
                name="zip"
                required
                placeholder="Irsz. *"
                className="w-full border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition"
              />
              <input
                name="city"
                required
                placeholder="Város *"
                className="w-full border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#1a1a1a] transition"
              />
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border border-[#d0ccc8] py-3.5 text-sm font-medium text-[#555] hover:border-[#1a1a1a] transition"
          >
            Vissza
          </button>
          <button
            type="submit"
            disabled={mode === "foxpost" && !foxpostPointCode}
            className="flex-1 bg-[#1a1a1a] text-white py-3.5 text-sm font-medium hover:bg-[#333] transition disabled:bg-[#ccc] disabled:cursor-not-allowed"
          >
            Folytatás
          </button>
        </div>
      </form>
    </div>
  );
}
