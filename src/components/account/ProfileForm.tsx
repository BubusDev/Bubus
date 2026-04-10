// ProfileForm.tsx
"use client";

import { useRef, useState } from "react";
import { Camera, Link2, MapPin, User2 } from "lucide-react";

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
  "h-12 w-full border border-[#ebe3e7] bg-white px-4 text-sm text-[#3f2735] outline-none transition placeholder:text-[#b9a8b1] focus:border-[#e6bfd1]";

const textareaClassName =
  "w-full border border-[#ebe3e7] bg-white px-4 py-3 text-sm leading-7 text-[#3f2735] outline-none transition placeholder:text-[#b9a8b1] focus:border-[#e6bfd1]";

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
      <section className="w-full bg-white">
        <div className="grid w-full lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="border-b border-[#f0e8eb] bg-[#fffefe] lg:min-h-[880px] lg:border-b-0 lg:border-r">
            <div className="px-10 py-10">
              <h2 className="text-[2rem] font-[family:var(--font-display)] leading-none text-[#3f2735]">
                Beállítások
              </h2>
            </div>

            <nav aria-label="Profil beállítások" className="space-y-1 px-6 pb-10">
              <div className="flex min-h-12 w-full items-center gap-3 rounded-2xl bg-[#fbf1f6] px-4 text-[15px] font-medium text-[#d0609c]">
                <User2 className="h-4 w-4" />
                <span>Profil</span>
              </div>

              <div className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-[15px] text-[#7b6773]">
                <Link2 className="h-4 w-4" />
                <span>Kép és alapadatok</span>
              </div>

              <div className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-[15px] text-[#7b6773]">
                <MapPin className="h-4 w-4" />
                <span>Szállítási cím</span>
              </div>
            </nav>
          </aside>

          <div className="min-w-0 bg-white">
            <div className="border-b border-[#f0e8eb] px-8 py-7 sm:px-10">
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#b691a4]">
                Profil
              </p>
              <h3 className="mt-3 text-[1.35rem] font-semibold text-[#3f2735]">
                Profil adatok szerkesztése
              </h3>
            </div>

            <div className="px-8 py-8 sm:px-10">
              <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative shrink-0">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#f7f4f5] text-xl font-semibold text-[#d56ea5]">
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
                      className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center rounded-full bg-[#f183bc] text-white transition hover:bg-[#ea6fb0]"
                      aria-label="Profilkép módosítása"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="max-w-[42ch]">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-[#b691a4]">
                      Személyes adatok
                    </p>

                    <h2 className="mt-3 font-[family:var(--font-display)] text-[2.2rem] leading-none text-[#3f2735] sm:text-[2.6rem]">
                      Profil részletek
                    </h2>

                    <p className="mt-4 text-[15px] leading-8 text-[#7b6773]">
                      Tartsd naprakészen az alapadataidat és az alapértelmezett
                      szállítási címedet.
                    </p>
                  </div>
                </div>

                <div className="max-w-[22rem] rounded-[2rem] border border-[#f0dfe7] bg-[#fffefe] px-5 py-5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#b691a4]">
                    Tipp
                  </p>
                  <p className="mt-3 text-[15px] leading-8 text-[#7b6773]">
                    A profilképet feltöltheted fájlból, vagy megadhatsz közvetlen
                    kép URL-t is.
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

              <div className="mt-10 border-t border-[#f0e8eb] pt-10">
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#b691a4]">
                    Alapadatok
                  </p>
                  <h3 className="mt-3 text-[1.15rem] font-semibold text-[#3f2735]">
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

                  <InputLabel label="Profilkép URL">
                    <input
                      type="url"
                      value={imageValue}
                      onChange={(event) => setImageValue(event.target.value)}
                      placeholder="https://..."
                      className={inputClassName}
                    />
                  </InputLabel>
                </div>
              </div>

              <div className="mt-10 border-t border-[#f0e8eb] pt-10">
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#b691a4]">
                    Szállítás
                  </p>
                  <h3 className="mt-3 text-[1.15rem] font-semibold text-[#3f2735]">
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

            <div className="border-t border-[#f0e8eb] bg-white px-8 py-5 sm:px-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#7b6773]">
                  A módosítások mentése után a profilod frissül.
                </p>

                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#f183bc] px-6 text-sm font-medium text-white transition hover:bg-[#ea6fb0]"
                >
                  Változások mentése
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </form>
  );
}
