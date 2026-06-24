"use client";

import { useState } from "react";
import { useCountryLanguage } from "@/components/international/CountryLanguageProvider";
import { getCountryConfig, supportedCountries, validateSupportedCountry, type SupportedCountry } from "@/lib/international";

export type ShippingData =
  | { mode: "foxpost"; countryCode: SupportedCountry; name: string; phone: string; addressLine1: string; addressLine2: string; postalCode: string; city: string; pointCode: string }
  | { mode: "home" | "international"; countryCode: SupportedCountry; name: string; phone: string; addressLine1: string; addressLine2: string; postalCode: string; city: string };

type ShippingStepProps = {
  initialName: string;
  initialPhone: string;
  initialAddressLine1: string;
  initialAddressLine2: string;
  initialPostalCode: string;
  initialCity: string;
  initialCountryCode: SupportedCountry;
  onNext: (data: ShippingData) => void;
  onBack: () => void;
};

export function ShippingStep({
  initialName,
  initialPhone,
  initialAddressLine1,
  initialAddressLine2,
  initialPostalCode,
  initialCity,
  initialCountryCode,
  onNext,
  onBack,
}: ShippingStepProps) {
  const { language, saveSelection } = useCountryLanguage();
  const [countryCode, setCountryCode] = useState<SupportedCountry>(initialCountryCode);
  const [mode, setMode] = useState<"foxpost" | "home" | "international">(
    initialCountryCode === "HU" ? "foxpost" : "international",
  );
  const [foxpostPointCode, setFoxpostPointCode] = useState("");
  const [foxpostPointLabel, setFoxpostPointLabel] = useState("");
  const isHu = countryCode === "HU";
  const copy = language === "en"
    ? {
        shipping: "Shipping",
        intro: "Choose where you would like your order delivered. Prices already include free shipping.",
        country: "Country",
        foxpost: "Foxpost locker",
        home: "Home delivery",
        international: "EU home delivery",
        fullName: "Full name *",
        phone: "Phone *",
        addressLine1: "Address line 1 *",
        addressLine2: "Address line 2",
        postalCode: "Postal code *",
        city: "City *",
        back: "Back",
        continue: "Continue to payment",
        choosePoint: "Choose a Foxpost locker for your order.",
        chooseLocker: "Choose pickup point",
      }
    : {
        shipping: "Szállítás",
        intro: "Válaszd ki, hova szeretnéd kérni a rendelést. Az árak már tartalmazzák az ingyenes szállítást.",
        country: "Ország",
        foxpost: "Foxpost automata",
        home: "Házhozszállítás",
        international: "EU házhozszállítás",
        fullName: "Teljes név *",
        phone: "Telefonszám *",
        addressLine1: "Utca, házszám *",
        addressLine2: "Cím második sora",
        postalCode: "Irsz. *",
        city: "Város *",
        back: "Vissza",
        continue: "Folytatás a fizetéshez",
        choosePoint: "Válaszd ki a Foxpost automatát, ahová a rendelést kéred.",
        chooseLocker: "Csomagpont választása",
      };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const common = {
      countryCode,
      name: (data.get("name") as string).trim(),
      phone: (data.get("phone") as string).trim(),
      addressLine1: (data.get("addressLine1") as string).trim(),
      addressLine2: (data.get("addressLine2") as string).trim(),
      postalCode: (data.get("postalCode") as string).trim(),
      city: (data.get("city") as string).trim(),
    };

    if (mode === "foxpost") {
      onNext({
        mode: "foxpost",
        ...common,
        pointCode: foxpostPointCode,
      });
    } else {
      onNext({
        mode,
        ...common,
      });
    }
  }

  return (
    <div className="mx-auto max-w-[540px]">
      <h2 className="mb-1 text-lg font-semibold text-[#1a1a1a]">{copy.shipping}</h2>
      <p className="mb-6 text-sm leading-6 text-[#666]">
        {copy.intro}
      </p>
      <label className="mb-4 block">
        <span className="mb-1 block text-[11px] uppercase tracking-[.18em] text-[#888]">{copy.country}</span>
        <select
          value={countryCode}
          onChange={(event) => {
            const nextCountry = validateSupportedCountry(event.target.value);
            setCountryCode(nextCountry);
            setMode(nextCountry === "HU" ? "foxpost" : "international");
            setFoxpostPointCode("");
            setFoxpostPointLabel("");
            saveSelection(nextCountry);
          }}
          className="w-full rounded-md border border-[#d0ccc8] bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#c45a85]/20"
        >
          {supportedCountries.map((code) => (
            <option key={code} value={code}>{getCountryConfig(code).labelEn}</option>
          ))}
        </select>
      </label>

      {/* Shipping mode toggle */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(isHu ? (["foxpost", "home"] as const) : (["international"] as const)).map((m) => (
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
            {m === "foxpost" ? copy.foxpost : m === "home" ? copy.home : copy.international}
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
            placeholder={copy.fullName}
            className="w-full rounded-md border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#8b8580] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#c45a85]/20"
          />
          <input
            name="phone"
            type="tel"
            defaultValue={initialPhone}
            required
            placeholder={copy.phone}
            className="w-full rounded-md border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#8b8580] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#c45a85]/20"
          />
        </div>

        <>
          <input
            name="addressLine1"
            defaultValue={initialAddressLine1}
            required
            placeholder={copy.addressLine1}
            className="w-full rounded-md border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#8b8580] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#c45a85]/20"
          />
          <input
            name="addressLine2"
            defaultValue={initialAddressLine2}
            placeholder={copy.addressLine2}
            className="w-full rounded-md border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#8b8580] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#c45a85]/20"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr]">
            <input
              name="postalCode"
              defaultValue={initialPostalCode}
              required
              placeholder={copy.postalCode}
              className="w-full rounded-md border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#8b8580] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#c45a85]/20"
            />
            <input
              name="city"
              defaultValue={initialCity}
              required
              placeholder={copy.city}
              className="w-full rounded-md border border-[#d0ccc8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition placeholder:text-[#8b8580] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#c45a85]/20"
            />
          </div>
        </>

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
                    {copy.choosePoint}
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
                    {copy.chooseLocker}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-md border border-[#d0ccc8] py-3.5 text-sm font-medium text-[#555] transition hover:border-[#1a1a1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2"
          >
            {copy.back}
          </button>
          <button
            type="submit"
            disabled={mode === "foxpost" && !foxpostPointCode}
            className="flex-1 rounded-md bg-[#1a1a1a] py-3.5 text-sm font-medium text-white transition hover:bg-[#333] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c45a85] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#ccc]"
          >
            {copy.continue}
          </button>
        </div>
      </form>
    </div>
  );
}
