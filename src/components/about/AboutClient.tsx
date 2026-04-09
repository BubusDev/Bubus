"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { BackToHome } from "@/components/BackToHome";

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
      <div className="mx-auto max-w-[1200px] px-6 pt-8">
        <BackToHome />
      </div>
      <HeroSection />
      <FounderSection />
      <ProcessSection />
      <GallerySection />
      <ValuesSection />
      <CtaSection />
      <InstagramSection />
    </main>
  );
}

/* ─── Section nav links ──────────────────────────────────────── */
const sectionLinks = [
  { href: "#alapitank", label: "Az alapítónk" },
  { href: "#folyamatunk", label: "Hogyan alkotunk" },
  { href: "#ekszereink", label: "Ékszereink" },
  { href: "#ertekeink", label: "Értékeink" },
];

/* ─── 1. Hero ────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      className="relative flex min-h-screen w-full overflow-hidden bg-[#fffbfd]"
    >
      {/* ── Background decoration ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* large soft glow, left */}
        <div
          className="absolute -left-32 top-1/4 h-[600px] w-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(196,90,133,0.18) 0%, transparent 65%)" }}
        />
        {/* smaller glow, right */}
        <div
          className="absolute -right-16 bottom-1/4 h-[400px] w-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(224,122,112,0.12) 0%, transparent 65%)" }}
        />
        {/* subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        {/* sparkles */}
        <span className="absolute top-[12%] left-[38%] select-none text-2xl text-rose-300/20">✦</span>
        <span className="absolute top-[55%] right-[12%] select-none text-4xl text-white/8">✦</span>
        <span className="absolute bottom-[18%] left-[55%] select-none text-lg text-rose-400/15">✦</span>
        {/* outline circle */}
        <div className="absolute top-[8%] right-[10%] h-[220px] w-[220px] rounded-full border border-white/8" />
        <div className="absolute bottom-[10%] left-[42%] h-[120px] w-[120px] rounded-full border border-white/6" />
      </div>

      {/* ── Main grid ── */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col px-6 py-24 lg:flex-row lg:items-center lg:gap-20 lg:px-12">

        {/* ── LEFT: hero content + section nav ── */}
        <div className="flex flex-1 flex-col">
          {/* Eyebrow */}
          <div
            className="scroll-reveal mb-8 inline-flex w-fit items-center gap-2.5 rounded-full border border-rose-400/30 bg-white/8 px-5 py-2.5 backdrop-blur-md"
            style={revealStyle(0)}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span className="text-[10px] uppercase tracking-[0.36em] text-rose-300/90">
              Kézzel alkotva · Féldrágakövekből
            </span>
          </div>

          {/* Headline */}
          <h1
            className="scroll-reveal font-[family:var(--font-display)] leading-[0.9] tracking-[-0.04em] text-white"
            style={{ ...revealStyle(80), fontSize: "clamp(3.2rem, 7.5vw, 6.5rem)" }}
          >
            Mi vagyunk
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #f4a0c0 0%, #e07a70 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              a Chicks Jewelry.
            </span>
          </h1>

          {/* Divider line */}
          <div
            className="scroll-reveal my-8 h-px w-16"
            style={{ ...revealStyle(140), background: "linear-gradient(90deg, rgba(244,160,192,0.7), transparent)" }}
          />

          {/* Subtext */}
          <p
            className="scroll-reveal text-white/55"
            style={{ ...revealStyle(180), maxWidth: "40ch", lineHeight: "1.95", fontSize: "15px" }}
          >
            Minden kő más. Minden darab egyedi.
            Minden Chicks Jewelry ékszer egy apró történet,
            amelyet te viselsz.
          </p>

          {/* ── Section navigation ── */}
          <nav
            className="scroll-reveal mt-12 flex flex-col gap-1"
            aria-label="Oldal szekciói"
            style={revealStyle(240)}
          >
            <p className="mb-3 text-[9px] uppercase tracking-[0.42em] text-white/30">
              Fedezd fel
            </p>
            {sectionLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className="group flex items-center gap-4 rounded-xl px-0 py-2 transition-all duration-200 hover:pl-2"
              >
                <span
                  className="h-px flex-none transition-all duration-300 group-hover:w-8"
                  style={{
                    width: "20px",
                    background: "linear-gradient(90deg, rgba(244,160,192,0.7), rgba(224,122,112,0.5))",
                  }}
                />
                <span className="text-[13px] text-white/45 transition-colors duration-200 group-hover:text-white/90">
                  {String(i + 1).padStart(2, "0")} {link.label}
                </span>
              </a>
            ))}
          </nav>
        </div>

        {/* ── RIGHT: decorative jewel card stack ── */}
        <div
          className="scroll-reveal relative mt-16 flex-1 lg:mt-0"
          style={revealStyle(100)}
        >
          {/* Main card */}
          <div
            className="relative overflow-hidden rounded-[2.5rem]"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="aspect-[4/5] w-full flex items-center justify-center"
              style={{ background: "linear-gradient(145deg, rgba(196,90,133,0.15) 0%, rgba(224,122,112,0.08) 100%)" }}
            >
              {/* Inner glow orb */}
              <div
                className="h-48 w-48 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(196,90,133,0.35) 0%, rgba(224,122,112,0.1) 50%, transparent 70%)",
                  filter: "blur(2px)",
                }}
              />
              <span
                className="absolute font-[family:var(--font-display)] text-white/10"
                style={{ fontSize: "clamp(5rem, 10vw, 9rem)" }}
              >
                ✦
              </span>
            </div>

            {/* Overlay label */}
            <div className="absolute bottom-6 left-6 right-6">
              <div
                className="rounded-2xl px-5 py-4"
                style={{
                  background: "rgba(30,13,24,0.65)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-rose-300/70">Kézműves ékszer</p>
                <p className="mt-1 font-[family:var(--font-display)] text-lg text-white/90">
                  Féldrágakövekből alkotva
                </p>
              </div>
            </div>
          </div>

          {/* Floating accent card — top-right */}
          <div
            className="absolute -right-4 -top-4 rounded-[1.5rem] px-5 py-4 lg:-right-8 lg:-top-6"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">Anyag</p>
            <p className="mt-0.5 text-sm font-medium text-white/80">Rózsakvarc</p>
          </div>

          {/* Floating accent card — bottom-left */}
          <div
            className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-[1.5rem] px-5 py-4 lg:-bottom-6 lg:-left-8"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: "linear-gradient(135deg, #c45a85, #e07a70)" }}
            />
            <p className="text-sm text-white/70">Kézzel alkotva</p>
          </div>
        </div>
      </div>

      {/* ── Bottom fade into next section ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(253,242,245,0.08))" }}
      />
    </section>
  );
}

/* ─── 2. Founder story ───────────────────────────────────────── */
function FounderSection() {
  return (
    <section id="alapitank" className="mx-auto max-w-[1160px] px-4 py-24 sm:px-6 lg:px-8">
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
              A Chicks Jewelry egy reggelen született, amikor Sára — az alapító —
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
              tömegesen. Nem sietünk. Minden Chicks Jewelry ékszer annyi figyelmet kap,
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
    desc: "Minden darab egyedi Chicks Jewelry dobozban érkezik — ajándékba is tökéletes, ahogy van.",
  },
];

function ProcessSection() {
  return (
    <section id="folyamatunk" className="bg-[#fdf2f5]/60 px-4 py-24 sm:px-6 lg:px-8">
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
    <section id="ekszereink" className="mx-auto max-w-[1160px] px-4 py-24 sm:px-6 lg:px-8">
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
    <section id="ertekeink" className="bg-[#fdf2f5]/60 px-4 py-24 sm:px-6 lg:px-8">
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

/* ─── 6. Instagram ───────────────────────────────────────────── */
function InstagramSection() {
  return (
    <section
      className="w-full px-6 py-20 text-center"
      style={{ background: "#1f1e1c" }}
    >
      {/* Eyebrow */}
      <p
        className="scroll-reveal text-[10px] uppercase tracking-[0.42em] text-white/30"
        style={revealStyle(0)}
      >
        Kövess minket
      </p>

      {/* Handle */}
      <a
        href="https://instagram.com/chicksjewelry"
        target="_blank"
        rel="noopener noreferrer"
        className="scroll-reveal group mt-4 inline-flex items-center gap-3 transition"
        style={revealStyle(80)}
      >
        {/* Instagram icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7 text-[#c45a85] transition group-hover:text-[#e07a70]"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
        <span
          className="font-[family:var(--font-display)] tracking-[-0.03em] text-white transition group-hover:text-white/80"
          style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)" }}
        >
          @chicksjewelry
        </span>
      </a>

      {/* Description */}
      <p
        className="scroll-reveal mx-auto mt-5 text-white/45"
        style={{ ...revealStyle(160), maxWidth: "48ch", lineHeight: "1.95", fontSize: "14px" }}
      >
        Párosítási ötletek karkötőkhöz, előzetes betekintés az új kollekciókba
        és exkluzív kampányok — elsőként értesülj mindenről.
      </p>
    </section>
  );
}

/* ─── 7. CTA ─────────────────────────────────────────────────── */
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
