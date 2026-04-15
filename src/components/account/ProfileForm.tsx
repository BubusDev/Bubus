// ProfileForm.tsx
"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";

import { saveProfileAction } from "@/app/(storefront)/account/actions";

type ProfileFormProps = {
  user: {
    name: string;
    phone: string | null;
    birthDate: string;
    profileImageUrl: string | null;
    defaultShippingAddress: string | null;
  };
};

function InputLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2.5">
      <span className="text-sm font-medium text-[#4e3944]">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-12 w-full rounded-md border border-[#e8e5e0] bg-white px-4 text-sm text-[#2d1f28] outline-none transition placeholder:text-[#b7abb2] focus:border-[#4d2741]";

const textareaClassName =
  "w-full rounded-md border border-[#e8e5e0] bg-white px-4 py-3 text-sm leading-7 text-[#2d1f28] outline-none transition placeholder:text-[#b7abb2] focus:border-[#4d2741]";

function SettingsGroup({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[#eee9e5] px-5 py-7 sm:px-7 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#8c7f86]">
            {eyebrow}
          </p>
          <h3 className="mt-3 text-[1.05rem] font-semibold text-[#2d1f28]">
            {title}
          </h3>
          {description ? (
            <p className="mt-3 text-sm leading-6 text-[#756771]">
              {description}
            </p>
          ) : null}
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [imageValue, setImageValue] = useState(user.profileImageUrl ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <form action={saveProfileAction} className="w-full">
      <div className="overflow-hidden rounded-lg border border-[#e8e5e0] bg-white">
        <div className="px-5 py-6 sm:px-7">
          <h2 className="text-[1.2rem] font-semibold text-[#2d1f28]">
            Profilbeállítások
          </h2>
          <p className="mt-2 max-w-[62ch] text-sm leading-7 text-[#655b54]">
            Frissítsd azokat az adatokat, amelyeket a rendeléseidnél és a fiókodban használunk.
          </p>
        </div>

        <SettingsGroup
          eyebrow="Profilkép"
          title="Megjelenés"
          description="Opcionális kép a fiókodhoz. Ha üresen hagyod, a monogramod jelenik meg."
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[#eee7ea] bg-[#faf9f8] text-xl font-semibold text-[#6f3f59]">
                  {imageValue ? (
                    <img
                      src={imageValue}
                      alt="Profilkép"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a] text-white transition hover:bg-[#333]"
                  aria-label="Profilkép módosítása"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="max-w-[46ch]">
                <p className="text-sm leading-7 text-[#655b54]">
                  Használhatsz feltöltött képet vagy közvetlen képlinket is.
                </p>
              </div>
            </div>
          </div>

          <input type="hidden" name="profileImageUrl" value={imageValue} />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") {
                  setImageValue(reader.result);
                }
              };
              reader.readAsDataURL(file);
            }}
          />

          <details className="mt-5 rounded-md border border-[#eee7ea] bg-white px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-[#5f5059]">
              Profilkép link megadása
            </summary>
            <div className="mt-4">
              <InputLabel label="Kép URL">
                <input
                  type="url"
                  value={imageValue}
                  onChange={(event) => setImageValue(event.target.value)}
                  placeholder="https://..."
                  className={inputClassName}
                />
              </InputLabel>
              <p className="mt-2 text-xs leading-6 text-[#7b6773]">
                Csak akkor használd, ha közvetlen képlinket szeretnél megadni.
              </p>
            </div>
          </details>
        </SettingsGroup>

        <SettingsGroup
          eyebrow="Alapadatok"
          title="Személyes információk"
          description="Ezek az adatok segítenek személyesebbé tenni a fiókod kezelését."
        >
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <InputLabel label="Teljes név">
              <input
                type="text"
                name="name"
                required
                minLength={2}
                defaultValue={user.name}
                placeholder="Pl. Borbolya Kiss"
                className={inputClassName}
              />
            </InputLabel>

            <InputLabel label="Születési dátum">
              <input
                type="date"
                name="birthDate"
                defaultValue={user.birthDate}
                className={inputClassName}
              />
            </InputLabel>
          </div>
        </SettingsGroup>

        <SettingsGroup
          eyebrow="Kapcsolat"
          title="Kapcsolati adatok"
          description="A rendelésekkel kapcsolatos egyeztetéshez használjuk."
        >
          <InputLabel label="Telefonszám">
            <input
              type="tel"
              name="phone"
              defaultValue={user.phone ?? ""}
              placeholder="Pl. +36 30 123 4567"
              className={inputClassName}
            />
          </InputLabel>
        </SettingsGroup>

        <SettingsGroup
          eyebrow="Szállítás"
          title="Alapértelmezett cím"
          description="A checkoutnál ezt ajánljuk fel elsőként, de rendelésenként módosítható."
        >
          <InputLabel label="Szállítási cím">
            <textarea
              name="defaultShippingAddress"
              rows={5}
              defaultValue={user.defaultShippingAddress ?? ""}
              placeholder="Pl. 1111 Budapest, Minta utca 12. 3/5"
              className={textareaClassName}
            />
          </InputLabel>
        </SettingsGroup>

        <div className="border-t border-[#eee9e5] bg-white px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#7b6773]">
              A módosítások mentés után azonnal frissülnek.
            </p>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#1a1a1a] px-5 text-sm font-medium text-white transition hover:bg-[#333]"
            >
              Változások mentése
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
