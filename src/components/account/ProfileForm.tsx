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
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`space-y-2 ${className ?? ""}`}>
      <span className="text-sm font-medium text-[#4e3944]">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-11 w-full rounded-md border border-[#e4ded9] bg-white px-3.5 text-sm text-[#2d1f28] outline-none transition placeholder:text-[#b7abb2] focus:border-[#4d2741]";

const textareaClassName =
  "w-full resize-none rounded-md border border-[#e4ded9] bg-white px-3.5 py-3 text-sm leading-6 text-[#2d1f28] outline-none transition placeholder:text-[#b7abb2] focus:border-[#4d2741]";

function ProfileBlock({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-lg border border-[#e8e2dd] bg-white p-4 shadow-[0_12px_28px_rgba(45,31,40,0.04)] sm:p-5 ${className ?? ""}`}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[#2d1f28]">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-[48rem] text-xs leading-5 text-[#8a7a83]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
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
      <div className="grid gap-4 lg:grid-cols-12">
        <ProfileBlock
          title="Profilkép / megjelenés"
          description="Opcionális kép a fiókodhoz. Üresen hagyva a monogramod jelenik meg."
          className="lg:col-span-4"
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#eee7ea] bg-[#faf9f8] text-base font-semibold text-[#6f3f59]">
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
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-white transition hover:bg-[#333]"
                aria-label="Profilkép módosítása"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-[#2d1f28]">{user.name}</p>
              <p className="mt-1 text-sm leading-6 text-[#756771]">
                Feltölthetsz képet, vagy megadhatsz közvetlen képlinket.
              </p>
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

          <details className="mt-5 rounded-md border border-[#eee7ea] bg-[#fbfaf9] px-4 py-3">
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
                Haladó opció, ha nem feltöltött képet használsz.
              </p>
            </div>
          </details>
        </ProfileBlock>

        <ProfileBlock
          title="Személyes információk"
          description="A rendeléseknél és a fiókodban használt alapadatok."
          className="lg:col-span-8"
        >
          <div className="grid max-w-[46rem] gap-x-4 gap-y-4 md:grid-cols-2">
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
        </ProfileBlock>

        <ProfileBlock
          title="Kapcsolati adatok"
          description="A rendelésekkel kapcsolatos egyeztetéshez használjuk."
          className="lg:col-span-4"
        >
          <InputLabel label="Telefonszám" className="block max-w-[22rem]">
            <input
              type="tel"
              name="phone"
              defaultValue={user.phone ?? ""}
              placeholder="Pl. +36 30 123 4567"
              className={inputClassName}
            />
          </InputLabel>
        </ProfileBlock>

        <ProfileBlock
          title="Alapértelmezett szállítási cím"
          description="A checkoutnál ezt ajánljuk fel elsőként, de rendelésenként módosítható."
          className="lg:col-span-8"
        >
          <InputLabel label="Szállítási cím" className="block max-w-[52rem]">
            <textarea
              name="defaultShippingAddress"
              rows={4}
              defaultValue={user.defaultShippingAddress ?? ""}
              placeholder="Pl. 1111 Budapest, Minta utca 12. 3/5"
              className={textareaClassName}
            />
          </InputLabel>
        </ProfileBlock>

        <div className="rounded-lg border border-[#e8e2dd] bg-white px-4 py-3 shadow-[0_12px_28px_rgba(45,31,40,0.04)] sm:px-5 lg:col-span-12">
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
