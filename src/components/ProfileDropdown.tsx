"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Sparkles } from "lucide-react";

import { type HeaderUser, profileMenuByRole } from "@/lib/header-data";

type ProfileDropdownProps = {
  user: HeaderUser;
};

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const menuItems = profileMenuByRole[user.role];
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Profil menü megnyitása"
        onClick={() => setIsOpen((open) => !open)}
        className="group flex h-11 items-center gap-2 rounded-full border border-white/70 bg-white/80 px-2.5 text-[#6d5260] backdrop-blur-md transition duration-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff5fa] text-xs font-semibold tracking-[0.18em] text-[#e16aa8] shadow-sm">
          {initials}
        </span>

        <span className="hidden text-left sm:block">
          <span className="block text-xs uppercase tracking-[0.24em] text-[#b18aa1]">
            Fiók
          </span>
          <span className="block text-sm font-medium leading-none text-[#4d2741]">
            {user.role === "admin" ? "Admin" : "Profil"}
          </span>
        </span>

        <ChevronDown
          className={`h-4 w-4 text-[#b18aa1] transition duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label="Profil menü"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[18rem] overflow-hidden rounded-[1.5rem] border border-white/70 bg-[rgba(255,244,249,0.92)] p-2 shadow-[0_24px_60px_rgba(140,89,120,0.18)] backdrop-blur-2xl"
        >
          <div className="rounded-[1.1rem] border border-white/70 bg-white/72 px-4 py-3.5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff5fa] text-sm font-semibold tracking-[0.16em] text-[#e16aa8] shadow-sm">
                {initials}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#4d2741]">
                  {user.name}
                </p>
                <p className="truncate text-xs text-[#907585]">{user.email}</p>

                <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#efd4e2] bg-white/80 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-[#8e5f79]">
                  <Sparkles className="h-3 w-3 text-[#e16aa8]" />
                  {user.role}
                </div>
              </div>
            </div>
          </div>

          <div className="my-2 h-px bg-[#f1dce7]" />

          <div className="space-y-1">
            {menuItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                role="menuitem"
                className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm text-[#6b425a] transition duration-200 hover:bg-white/80 focus-visible:bg-white/80 focus-visible:outline-none"
                onClick={() => setIsOpen(false)}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#efd4e2] bg-white/80 text-[#8e5f79]">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-medium text-[#4d2741]">{label}</span>
              </Link>
            ))}
          </div>

          <div className="my-2 h-px bg-[#f1dce7]" />

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm text-[#6b425a] transition duration-200 hover:bg-white/80 focus-visible:bg-white/80 focus-visible:outline-none"
            onClick={() => {
              window.location.href = "/auth/logout";
            }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#efd4e2] bg-white/80 text-[#8e5f79]">
              <LogOut className="h-4 w-4" />
            </span>
            <span className="font-medium text-[#4d2741]">Kijelentkezés</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
