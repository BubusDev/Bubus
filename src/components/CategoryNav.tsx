import Link from "next/link";

import { getNavigationCategories } from "@/lib/products";

export async function CategoryNav() {
  const navigationCategories = await getNavigationCategories();

  return (
    <nav
      aria-label="Category navigation"
      className="border-b border-white/50 bg-white/20 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-center gap-8 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
        {navigationCategories.map((item) => {
          return (
            <Link
              key={item.slug}
              href={item.href}
              className="whitespace-nowrap text-sm tracking-[0.02em] text-[#121313] transition duration-200 hover:opacity-60 active:opacity-80"
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}