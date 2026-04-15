"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, User } from "lucide-react";

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
        className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-transparent text-[#5a4651] transition duration-200 hover:border-[#e8d6dd] hover:bg-white/80 hover:text-[#2f2230] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1b7d1] ${
          isOpen ? "border-[#e8d6dd] bg-white/88 text-[#2f2230]" : ""
        }`}
      >
        <User className="h-[1.1rem] w-[1.1rem]" />
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label="Profil menü"
          className="dropdown-reveal absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[18rem] overflow-hidden rounded-lg border border-[#e8e5e0] bg-white/96 p-2 shadow-[0_18px_42px_rgba(49,25,45,0.14)] backdrop-blur-xl"
        >
          <div className="rounded-md border border-[#eee7ea] bg-[#fffdfb] px-4 py-3.5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7f4f5] text-[#8e5f79]">
                <User className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#2d1f28]">
                  {user.name}
                </p>
                <p className="truncate text-xs text-[#907585]">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="my-2 h-px bg-[#eee7ea]" />

          <div className="space-y-0.5">
            {menuItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                role="menuitem"
                className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition duration-200 hover:bg-[#fff8fb] focus-visible:bg-[#fff8fb] focus-visible:outline-none"
                onClick={() => setIsOpen(false)}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#eee7ea] bg-white text-[#8e687b] transition duration-200 group-hover:border-[#d8c7cf] group-hover:text-[#4d2741]">
                  <Icon className="h-[0.9rem] w-[0.9rem]" />
                </span>
                <span className="font-medium text-[#5d3350] transition-colors duration-200 group-hover:text-[#2d1f28]">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          <div className="my-2 h-px bg-[#eee7ea]" />

          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition duration-200 hover:bg-[#fff8fb] focus-visible:bg-[#fff8fb] focus-visible:outline-none"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#eee7ea] bg-white text-[#8e687b] transition duration-200 group-hover:border-[#d8c7cf] group-hover:text-[#4d2741]">
                <LogOut className="h-[0.9rem] w-[0.9rem]" />
              </span>
              <span className="font-medium text-[#5d3350] transition-colors duration-200 group-hover:text-[#2d1f28]">
                Kijelentkezés
              </span>
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
