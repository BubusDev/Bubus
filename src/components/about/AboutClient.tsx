"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/* ─── Scroll reveal hook ─────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".scroll-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─── Stagger helper ─────────────────────────────────────────── */
function revealStyle(delay = 0): React.CSSProperties {
  return {
    opacity: 0,
    transform: "translateY(24px)",
    transition: `opacity 600ms ease-out ${delay}ms, transform 600ms ease-out ${delay}ms`,
  };
}

/* ─── Main component ─────────────────────────────────────────── */
export function AboutClient() {
  useScrollReveal();

  return (
    <main>
      <HeroSection />
      <FounderSection />
      <ProcessSection />
      <GallerySection />
      <ValuesSection />
      <CtaSection />
    </main>
  );
}

/* ─── 1. Hero ────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24">
      <div className="text-center">
        <div
          className="scroll-reveal inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#b06b8e] backdrop-blur-md"
          style={revealStyle(0)}
        >
          ✦ Kézzel alkotva · Féldrágakövekből
        </div>

        <h1
          className="scroll-reveal mt-6 font-[family:var(--font-display)] leading-[0.92] tracking-[-0.04em] text-[#4d2741]"
          style={{ ...revealStyle(80), fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
        >
          Mi vagyunk a Bubus.
        </h1>

        <p
          className="scroll-reveal mx-auto mt-6 text-[#7a5a6c]"
          style={{ ...revealStyle(160), maxWidth: "48ch", lineHeight: "1.9" }}
        >
          Minden kő más. Minden darab egyedi. Minden Bubus ékszer egy apró
          történet, amelyet te viselsz.
        </p>
      </div>

      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-[500px] w-[500px] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(228,168,200,0.22) 0%, transparent 70%)" }}
      />
    </section>
  );
}

/* ─── 2. Founder story ───────────────────────────────────────── */
function FounderSection() {
  return (
    <section className="mx-auto max-w-[1160px] px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Image placeholder */}
        <div
          className="scroll-reveal overflow-hidden rounded-[2.5rem]"
          style={revealStyle(0)}
        >
          <div
            className="aspect-[4/5] w-full"
            style={{
              background:
                "linear-gradient(145deg, #f5dcea 0%, #e8c4d8 40%, #d4a8c4 100%)",
            }}
          >
            <div className="flex h-full items-center justify-center">
              <span
                className="font-[family:var(--font-display)] text-[#c45a85]/30"
                style={{ fontSize: "clamp(4rem, 8vw, 7rem)" }}
              >
                ✦
              </span>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-6">
          <div
            className="scroll-reveal inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#b06b8e] backdrop-blur-md"
            style={revealStyle(0)}
          >
            ✦ Az alapítói történet
          </div>

          <h2
            className="scroll-reveal font-[family:var(--font-display)] leading-[1.05] tracking-[-0.04em] text-[#4d2741]"
            style={{ ...revealStyle(80), fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Egy rózsakvarc karkötő,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #c45a85 0%, #e07a70 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              amely mindent megváltoztatott.
            </span>
          </h2>

          <div
            className="scroll-reveal space-y-4 text-[#5a3a4a]"
            style={{ ...revealStyle(160), fontSize: "15px", lineHeight: "1.9" }}
          >
            <p>
              A Bubus egy reggelen született, amikor Sára — az alapító —
              megtalálta a nagyanyja régi rózsakvarc karkötőjét egy dobozban.
              Abban a pillanatban értette meg: az ékszer nem csupán díszítés.
              Emlékeztet. Összeköt. Mesél.
            </p>
            <p>
              Azóta minden egyes darabot kézzel alkotunk, válogatott
              féldrágakövekből, amelyek nemcsak szépek — hanem érzéseket
              hordoznak. Minden kő más energiát hordoz, minden darab más
              történetet mesél el.
            </p>
            <p>
              A kézműves alkotás folyamata lassú és tudatos. Nem gyártunk
              tömegesen. Nem sietünk. Minden Bubus ékszer annyi figyelmet kap,
              amennyit egy valódi kincs megérdemel.
            </p>
          </div>

          {/* Pull quote */}
          <blockquote
            className="scroll-reveal border-l-[3px] border-[#c45a85] pl-5 italic text-[#7a5a6c]"
            style={{ ...revealStyle(240), fontSize: "15px", lineHeight: "1.9" }}
          >
            „Az ékszer nem csupán díszítés. Emlékeztet. Összeköt. Mesél.”
          </blockquote>
        </div>
      </div>
    </section>
  );
}

/* ─── 3. Process ─────────────────────────────────────────────── */
const processSteps = [
  {
    num: "01",
    title: "Alapanyag-válogatás",
    desc: "Csak olyan köveket használunk, amelyek eredetét ismerjük. Szezonálisan változó, gondosan válogatott féldrágakövek.",
  },
  {
    num: "02",
    title: "Kézzel alkotás",
    desc: "Minden egyes darabot kézzel készítünk. Nincs tömeggyártás, nincs sablonos forma — csak figyelmes, tudatos munka.",
  },
  {
    num: "03",
    title: "Minőségellenőrzés",
    desc: "Minden ékszer alapos ellenőrzésen esik át: kötések, zárók, kövek stabilitása — semmi nem kerül ki kezünkből tökéletlenül.",
  },
  {
    num: "04",
    title: "Csomagolás",
    desc: "Minden darab egyedi Bubus dobozban érkezik — ajándékba is tökéletes, ahogy van.",
  },
];

function ProcessSection() {
  return (
    <section className="bg-[#fdf2f5]/60 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1160px]">
        <div className="mb-14 text-center">
          <p
            className="scroll-reveal text-[10px] uppercase tracking-[0.34em] text-[#af7795]"
            style={revealStyle(0)}
          >
            Így dolgozunk
          </p>
          <h2
            className="scroll-reveal mt-3 font-[family:var(--font-display)] leading-tight tracking-[-0.04em] text-[#4d2741]"
            style={{ ...revealStyle(80), fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
          >
            Ahogyan alkotunk
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, i) => (
            <div
              key={step.num}
              className="scroll-reveal overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_12px_32px_rgba(198,129,167,0.1)] backdrop-blur-xl"
              style={revealStyle(i * 80)}
            >
              <p
                className="font-[family:var(--font-display)] leading-none tracking-[-0.04em] text-[#e8c4d8]"
                style={{ fontSize: "4rem" }}
              >
                {step.num}
              </p>
              <h3 className="mt-3 font-semibold text-[#4d2741]">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-[1.85] text-[#7a5a6c]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 4. Gallery ─────────────────────────────────────────────── */
const galleryItems = [
  { label: "Rózsakvarc karkötő", stone: "Rose Quartz", bg: "linear-gradient(145deg, #fff0f7, #fcdeed)", aspect: "aspect-[3/4]" },
  { label: "Holdkő nyaklánc", stone: "Moonstone", bg: "linear-gradient(145deg, #f8f4ff, #eadff5)", aspect: "aspect-square" },
  { label: "Ametiszt gyűrű", stone: "Amethyst", bg: "linear-gradient(145deg, #f4f0ff, #ddd4f5)", aspect: "aspect-[3/4]" },
  { label: "Labradorit karkötő", stone: "Labradorite", bg: "linear-gradient(145deg, #f0f5ff, #d8e4f5)", aspect: "aspect-square" },
  { label: "Citrin nyaklánc", stone: "Citrine", bg: "linear-gradient(145deg, #fffbf0, #fdefd4)", aspect: "aspect-[4/3]" },
  { label: "Türkiz karkötő", stone: "Turquoise", bg: "linear-gradient(145deg, #f0fff8, #d4f0e8)", aspect: "aspect-[3/4]" },
];

function GallerySection() {
  return (
    <section className="mx-auto max-w-[1160px] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-14 text-center">
        <p
          className="scroll-reveal text-[10px] uppercase tracking-[0.34em] text-[#af7795]"
          style={revealStyle(0)}
        >
          A kollekciókból
        </p>
        <h2
          className="scroll-reveal mt-3 font-[family:var(--font-display)] leading-tight tracking-[-0.04em] text-[#4d2741]"
          style={{ ...revealStyle(80), fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
        >
          Ékszereink közelről
        </h2>
      </div>

      <div className="columns-2 gap-4 sm:columns-3 lg:gap-5">
        {galleryItems.map((item, i) => (
          <div
            key={item.label}
            className="scroll-reveal group mb-4 break-inside-avoid overflow-hidden rounded-[1.8rem] lg:mb-5"
            style={revealStyle(i * 60)}
          >
            <div className={`relative ${item.aspect} w-full`} style={{ background: item.bg }}>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "rgba(196,90,133,0.18)" }}
              >
                <span className="font-[family:var(--font-display)] text-2xl text-white drop-shadow">✦</span>
              </div>
            </div>
            <div className="border-x border-b border-white/60 bg-white/70 px-4 py-3 backdrop-blur-sm rounded-b-[1.8rem]">
              <p className="text-sm font-medium text-[#4d2741]">{item.label}</p>
              <p className="text-[11px] text-[#b08898]">{item.stone}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── 5. Values ──────────────────────────────────────────────── */
const values = [
  {
    icon: "♡",
    title: "Kézműves minőség",
    desc: "Nincsenek tömeggyártott darabok. Minden ékszert kézzel alkotunk, egyenként, figyelemmel és szeretettel.",
  },
  {
    icon: "✦",
    title: "Etikus kövek",
    desc: "Csak olyan alapanyagokkal dolgozunk, amelyek eredetét ismerjük. A szépségnek felelőssége is van.",
  },
  {
    icon: "◎",
    title: "Egyedi darabok",
    desc: "Ha valami olyasmit keresel, ami csak a tiéd — szólj. Az egyedi rendelések a szívünkhöz a legközelebb állók.",
  },
];

function ValuesSection() {
  return (
    <section className="bg-[#fdf2f5]/60 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1160px]">
        <div className="mb-14 text-center">
          <p
            className="scroll-reveal text-[10px] uppercase tracking-[0.34em] text-[#af7795]"
            style={revealStyle(0)}
          >
            Amit képviselünk
          </p>
          <h2
            className="scroll-reveal mt-3 font-[family:var(--font-display)] leading-tight tracking-[-0.04em] text-[#4d2741]"
            style={{ ...revealStyle(80), fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
          >
            Értékeink
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {values.map((v, i) => (
            <div
              key={v.title}
              className="scroll-reveal overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,241,247,0.84))] p-8 shadow-[0_16px_40px_rgba(198,129,167,0.1)] backdrop-blur-xl"
              style={revealStyle(i * 100)}
            >
              <p
                className="font-[family:var(--font-display)] text-[#c45a85]"
                style={{ fontSize: "2.5rem" }}
              >
                {v.icon}
              </p>
              <h3 className="mt-4 font-[family:var(--font-display)] text-[1.2rem] text-[#4d2741]">
                {v.title}
              </h3>
              <p className="mt-2 text-[13px] leading-[1.85] text-[#7a5a6c]">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 6. CTA ─────────────────────────────────────────────────── */
function CtaSection() {
  return (
    <section
      className="px-4 py-28 text-center"
      style={{ background: "linear-gradient(135deg, #c45a85 0%, #e07a70 100%)" }}
    >
      <h2
        className="scroll-reveal font-[family:var(--font-display)] leading-[1.05] tracking-[-0.04em] text-white"
        style={{ ...revealStyle(0), fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
      >
        Találd meg a saját darabodat.
      </h2>
      <p
        className="scroll-reveal mx-auto mt-4 text-white/80"
        style={{ ...revealStyle(80), maxWidth: "40ch", lineHeight: "1.9" }}
      >
        Minden kő más energiát hordoz. Melyik a tiéd?
      </p>
      <Link
        href="/new-in"
        className="scroll-reveal mt-8 inline-flex items-center rounded-full border-2 border-white/80 bg-white px-8 py-3.5 text-sm font-semibold text-[#c45a85] shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] hover:bg-white/95 hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)]"
        style={revealStyle(160)}
      >
        Kollekciók böngészése
      </Link>
    </section>
  );
}
