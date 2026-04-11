"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, Sparkles, User } from "lucide-react";

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
  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Profil menü megnyitása"
        onClick={() => setIsOpen((open) => !open)}
        className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-transparent text-[#5a4651] transition duration-300 hover:border-[#e8d6dd] hover:bg-[#fff8fb]/88 hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] ${
          isOpen ? "border-[#e8d6dd] bg-[#fff8fb]/92 text-[#2f2230]" : ""
        }`}
      >
        <User className="h-[1.1rem] w-[1.1rem]" />
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label="Profil menü"
          className="dropdown-reveal absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[18rem] overflow-hidden rounded-[1.5rem] border border-[#ecd0de] bg-[linear-gradient(160deg,rgba(255,252,254,0.96)_0%,rgba(255,244,250,0.98)_100%)] p-2 shadow-[0_24px_64px_rgba(108,60,86,0.22),0_4px_16px_rgba(180,100,140,0.10)] backdrop-blur-2xl"
        >
          {/* user info card */}
          <div className="rounded-[1.1rem] border border-[#f0d8e6] bg-gradient-to-br from-white to-[#fff7fb] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#fde8f3] to-[#fbd0e8] text-[#d96a9c] shadow-[0_2px_8px_rgba(217,106,156,0.18)]">
                <User className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#4d2741]">
                  {user.name}
                </p>
                <p className="truncate text-xs text-[#907585]">{user.email}</p>

                <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#efd4e2] bg-[#fff7fb] px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-[#8e5f79]">
                  <Sparkles className="h-3 w-3 text-[#e16aa8]" />
                  {user.role}
                </div>
              </div>
            </div>
          </div>

          <div className="my-2 h-px bg-gradient-to-r from-transparent via-[#ecd0de] to-transparent" />

          <div className="space-y-0.5">
            {menuItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                role="menuitem"
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 hover:bg-[#fce8f3] focus-visible:bg-[#fce8f3] focus-visible:outline-none"
                onClick={() => setIsOpen(false)}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#efd4e2] bg-white text-[#9e6882] shadow-sm transition-all duration-200 group-hover:border-[#e0b0cc] group-hover:bg-[#fde8f3] group-hover:text-[#c4447a] group-hover:shadow-[0_2px_8px_rgba(196,68,122,0.15)]">
                  <Icon className="h-[0.9rem] w-[0.9rem]" />
                </span>
                <span className="font-medium text-[#5d3350] transition-colors duration-200 group-hover:text-[#4d2741]">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          <div className="my-2 h-px bg-gradient-to-r from-transparent via-[#ecd0de] to-transparent" />

          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 hover:bg-[#fce8f3] focus-visible:bg-[#fce8f3] focus-visible:outline-none"
            onClick={() => {
              window.location.href = "/auth/logout";
            }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#efd4e2] bg-white text-[#9e6882] shadow-sm transition-all duration-200 group-hover:border-[#e0b0cc] group-hover:bg-[#fde8f3] group-hover:text-[#c4447a] group-hover:shadow-[0_2px_8px_rgba(196,68,122,0.15)]">
              <LogOut className="h-[0.9rem] w-[0.9rem]" />
            </span>
            <span className="font-medium text-[#5d3350] transition-colors duration-200 group-hover:text-[#4d2741]">
              Kijelentkezés
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
