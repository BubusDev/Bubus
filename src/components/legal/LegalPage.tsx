import Link from "next/link";
import type { ReactNode } from "react";

import { AmbientBlobs } from "@/components/AmbientBlobs";

type Section = { id: string; title: string };

type LegalPageProps = {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  sections: Section[];
  children: ReactNode;
};

export function LegalPage({ eyebrow, title, lastUpdated, sections, children }: LegalPageProps) {
  return (
    <>
      <AmbientBlobs opacity={0.3} />

      <main className="relative mx-auto max-w-[860px] px-6 py-16 sm:py-20">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-[#b08898]">
          <Link href="/" className="hover:text-[#c45a85] transition">Főoldal</Link>
          <span>›</span>
          <span className="text-[#7a5a6c]">{title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[200px_1fr] lg:items-start">
          {/* Sticky TOC (desktop) */}
          <aside className="hidden lg:block lg:sticky lg:top-28">
            <p className="mb-3 text-[9px] uppercase tracking-[0.3em] text-[#b08898]">Tartalom</p>
            <nav className="space-y-1">
              {sections.map(({ id, title: sTitle }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block rounded-lg py-1.5 pl-3 text-xs leading-snug text-[#7a5a6c] transition hover:border-l-2 hover:border-[#c45a85] hover:pl-2.5 hover:text-[#4d2741]"
                >
                  {sTitle}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content card */}
          <div>
            {/* Header */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#af7795]">{eyebrow}</p>
              <h1 className="mt-2 font-[family:var(--font-display)] text-[2.2rem] leading-tight tracking-[-0.04em] text-[#4d2741] sm:text-[2.8rem]">
                {title}
              </h1>
              <p className="mt-2 text-[11px] text-[#b08898]">Utolsó módosítás: {lastUpdated}</p>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_20px_50px_rgba(198,129,167,0.1)] backdrop-blur-xl sm:p-8">
              <div className="legal-content">{children}</div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .legal-content h2 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          color: #2f1a27;
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.2;
        }
        .legal-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #4d2741;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .legal-content p {
          font-size: 14px;
          color: #5a3a4a;
          line-height: 1.9;
          margin-bottom: 0.75rem;
        }
        .legal-content strong {
          color: #c45a85;
          font-weight: 600;
        }
        .legal-content ul {
          margin: 0.75rem 0;
          padding-left: 0;
          list-style: none;
        }
        .legal-content ul li {
          font-size: 14px;
          color: #5a3a4a;
          line-height: 1.9;
          padding-left: 1.25rem;
          position: relative;
        }
        .legal-content ul li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #c45a85;
          font-size: 0.7rem;
          top: 0.35em;
        }
        .legal-content a {
          color: #c45a85;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
      `}</style>
    </>
  );
}
