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
      <section className="rounded-lg border border-[#e8e5e0] bg-white/84">
        <div className="border-b border-[#e8e5e0] px-5 py-5 sm:px-7">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8c7f86]">
            Profil
          </p>
          <h2 className="mt-2 font-[family:var(--font-display)] text-[1.8rem] leading-none text-[#2d1f28]">
            Személyes adatok
          </h2>
        </div>

        <div className="px-5 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#f7f4f5] text-xl font-semibold text-[#9b476f]">
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
                  Tartsd naprakészen az elérhetőségeidet és az alapértelmezett
                  szállítási címedet. Ezeket az adatokat a rendeléseidnél tudjuk használni.
                </p>
              </div>
            </div>

            <p className="max-w-[24rem] rounded-md border border-[#eee7ea] bg-[#fffdfb] px-4 py-3 text-sm leading-7 text-[#756771]">
              A profilkép opcionális. Ha nem töltesz fel képet, a monogramod jelenik meg.
            </p>
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

          <div className="mt-9 border-t border-[#e8e5e0] pt-8">
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8c7f86]">
                Alapadatok
              </p>
              <h3 className="mt-3 text-[1.15rem] font-semibold text-[#2d1f28]">
                Személyes információk
              </h3>
            </div>

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

              <InputLabel label="Telefonszám">
                <input
                  type="tel"
                  name="phone"
                  defaultValue={user.phone ?? ""}
                  placeholder="Pl. +36 30 123 4567"
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

            <details className="mt-5 rounded-md border border-[#eee7ea] bg-[#fffdfb] px-4 py-3">
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
          </div>

          <div className="mt-9 border-t border-[#e8e5e0] pt-8">
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8c7f86]">
                Szállítás
              </p>
              <h3 className="mt-3 text-[1.15rem] font-semibold text-[#2d1f28]">
                Alapértelmezett szállítási cím
              </h3>
            </div>

            <InputLabel label="Szállítási cím">
              <textarea
                name="defaultShippingAddress"
                rows={5}
                defaultValue={user.defaultShippingAddress ?? ""}
                placeholder="Pl. 1111 Budapest, Minta utca 12. 3/5"
                className={textareaClassName}
              />
            </InputLabel>
          </div>
        </div>

        <div className="border-t border-[#e8e5e0] bg-[#fffdfb] px-5 py-5 sm:px-7">
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
      </section>
    </form>
  );
}
