import type { ReactNode } from "react";

import { CustomNavbar } from "./components/CustomNavbar";

export default function GemstonesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="gemstones-page min-h-screen bg-[#f3bdc8] text-[#fdfaf7]">
      <style>{`
        html, body {
          background: #f3bdc8 !important;
        }

        .gemstones-page article,
        .gemstones-page button[aria-expanded] {
          overflow-anchor: none;
        }

        @media (prefers-reduced-motion: reduce) {
          html:has(.gemstones-page) {
            scroll-behavior: auto;
          }
        }
      `}</style>
      <CustomNavbar />
      {children}
    </div>
  );
}
