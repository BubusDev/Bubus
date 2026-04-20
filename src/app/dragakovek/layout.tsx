import type { ReactNode } from "react";

import { CustomNavbar } from "./components/CustomNavbar";

export default function DragakovekLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dragakovek-page min-h-screen bg-[#f3bdc8] text-[#fdfaf7]">
      <style>{`
        html, body {
          background: #f3bdc8 !important;
        }

        .dragakovek-page article,
        .dragakovek-page button[aria-expanded] {
          overflow-anchor: none;
        }

        @media (prefers-reduced-motion: reduce) {
          html:has(.dragakovek-page) {
            scroll-behavior: auto;
          }
        }
      `}</style>
      <CustomNavbar />
      {children}
    </div>
  );
}
