import type { ReactNode } from "react";

import { CustomNavbar } from "./components/CustomNavbar";

export default function DragakovekLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3bdc8] text-[#fdfaf7]">
      <style>{`
        html, body {
          background: #f3bdc8 !important;
        }
      `}</style>
      <CustomNavbar />
      {children}
    </div>
  );
}
