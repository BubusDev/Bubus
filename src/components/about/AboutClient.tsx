"use client";

import { useEffect } from "react";
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

function revealStyle(delay = 0): React.CSSProperties {
  return {
    opacity: 0,
    transform: "translateY(22px)",
    transition: `opacity 700ms ease-out ${delay}ms, transform 700ms ease-out ${delay}ms`,
  };
}

export function AboutClient() {
  useScrollReveal();

  return (
    <main className="bg-[#fcf7f9] text-[#4f2740]">
      <HeroSection />
      <FounderSection />
      <ProcessSection />
      <ValuesSection />
      <CtaSection />
    </main>
  );
}

/* ─── 1. Hero ────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,202,220,0.35),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(252,220,233,0.5),transparent_20%),linear-gradient(to_bottom,#fcf7f9_0%,#f8eff4_60%,#f7edf1_100%)]" />
        <div className="absolute left-[-7rem] top-[5rem] h-[18rem] w-[18rem] rounded-full bg-[#f4dbe5]/45 blur-3xl" />
        <div className="absolute right-[-8rem] top-[2rem] h-[20rem] w-[20rem] rounded-full bg-[#f5d7e7]/40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[84vh] max-w-[1320px] items-center gap-14 px-6 py-16 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-24">
        <div className="max-w-[560px]">
          <div
            className="scroll-reveal inline-flex items-center rounded-full border border-[#ead4de] bg-white/75 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#b57695] backdrop-blur"
            style={revealStyle(0)}
          >
            Chicks Jewelry
          </div>

          <p
            className="scroll-reveal mt-8 text-[11px] uppercase tracking-[0.34em] text-[#b8879f]"
            style={revealStyle(80)}
          >
            A márkáról
          </p>

          <h1
            className="scroll-reveal mt-4 font-[family:var(--font-display)] leading-[0.92] tracking-[-0.05em] text-[#4f2740]"
            style={{ ...revealStyle(140), fontSize: "clamp(3rem, 6.5vw, 6.2rem)" }}
          >
            Finom,
            <br />
            nőies ékszerek
            <br />
            valódi karakterrel.
          </h1>

          <p
            className="scroll-reveal mt-7 max-w-[34rem] text-[15px] leading-[1.95] text-[#765d6a] sm:text-[16px]"
            style={revealStyle(220)}
          >
            A Chicks Jewelry darabjai azoknak készülnek, akik a látványos helyett
            inkább a kifinomultat választják. Válogatott kövek, puha tónusok,
            letisztult formák — könnyed, modern ékszerek a hétköznapokra és a
            különleges pillanatokra.
          </p>
        </div>

        <div
          className="scroll-reveal relative mx-auto w-full max-w-[600px]"
          style={revealStyle(160)}
        >
          <div className="overflow-hidden rounded-[2.25rem] bg-white p-3 shadow-[0_28px_80px_rgba(96,49,74,0.12)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem]">
              <img
                src="/images/about-hero.jpg"
                alt="Chicks Jewelry"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3a1f2f]/45 via-[#3a1f2f]/8 to-transparent p-6">
                <div className="max-w-[18rem] rounded-[1.25rem] bg-white/80 p-4 backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#b37d96]">
                    Modern butik világ
                  </p>
                  <p className="mt-2 font-[family:var(--font-display)] text-[1.6rem] leading-none text-[#4f2740]">
                    Chicks Jewelry
                  </p>
                  <p className="mt-2 text-[13px] leading-[1.7] text-[#775f6c]">
                    Letisztult szépség, puha ragyogással.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -left-6 bottom-8 hidden rounded-[1.4rem] border border-[#ead4de] bg-white/88 px-5 py-4 shadow-[0_14px_34px_rgba(96,49,74,0.08)] md:block">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#b37d96]">
              Kézzel alkotva
            </p>
            <p className="mt-1 text-sm text-[#5e3a4d]">Kis szériás, igényes darabok</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 2. Founder / brand story ───────────────────────────────── */
function FounderSection() {
  return (
    <section className="mx-auto max-w-[1240px] px-6 py-24 sm:px-8 lg:px-12">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div
          className="scroll-reveal overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_22px_60px_rgba(96,49,74,0.08)]"
          style={revealStyle(0)}
        >
          <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(145deg,#f7eaf0_0%,#efd6e2_100%)]">
            <img
              src="/images/founder-story.jpg"
              alt="Chicks Jewelry részlet"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="max-w-[650px]">
          <p
            className="scroll-reveal text-[10px] uppercase tracking-[0.34em] text-[#b8879f]"
            style={revealStyle(80)}
          >
            A márka szemlélete
          </p>

          <h2
            className="scroll-reveal mt-4 font-[family:var(--font-display)] leading-[1.02] tracking-[-0.04em] text-[#4f2740]"
            style={{ ...revealStyle(140), fontSize: "clamp(2rem, 4vw, 3.4rem)" }}
          >
            Nem harsány ékszerek.
            <br />
            Hanem szépen
            <span className="text-[#d976a8]"> megtervezett darabok.</span>
          </h2>

          <div
            className="scroll-reveal mt-8 space-y-5 text-[15px] leading-[1.95] text-[#6e5563]"
            style={revealStyle(220)}
          >
            <p>
              A Chicks Jewelry mögött az az elképzelés áll, hogy a nőies ékszer
              nem kell, hogy túlzó vagy nehéz legyen. Sokkal erősebb tud lenni
              egy finoman kidolgozott forma, egy szép tónus vagy egy gondosan
              kiválasztott kő.
            </p>
            <p>
              Ezért olyan darabokat készítünk és válogatunk, amelyek könnyen
              viselhetők, modernek, puhák és elegánsak. Olyan ékszereket, amelyek
              nem elnyomják a megjelenést, hanem finoman kiemelik.
            </p>
            <p>
              A cél nem a tömegtermék-hatás, hanem az igényes részletesség:
              kiegyensúlyozott arányok, szebb anyagérzet, letisztult összhatás.
            </p>
          </div>

          <blockquote
            className="scroll-reveal mt-8 border-l-[3px] border-[#d87ca8] pl-5 text-[15px] italic leading-[1.9] text-[#836472]"
            style={revealStyle(300)}
          >
            „A nőies nem egyenlő a túl sokkal. A legszebb darabok sokszor a
            legfinomabbak.”
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
    title: "Válogatás",
    desc: "Minden kollekció alapja a színvilág, az arány és az összhatás. Nem véletlenszerűen kerülnek egymás mellé a kövek és formák.",
  },
  {
    num: "02",
    title: "Tervezés",
    desc: "A cél mindig a puha, modern, nőies karakter. Letisztult vonalak, hordható formák, kifinomult részletek.",
  },
  {
    num: "03",
    title: "Kivitelezés",
    desc: "A darabok kis szériában készülnek, gondos összeállítással és részletfigyelemmel.",
  },
  {
    num: "04",
    title: "Végső összehangolás",
    desc: "Minden ékszert az összkép alapján nézünk: kényelmes legyen, szép legyen, és valóban prémium érzetet adjon.",
  },
];

function ProcessSection() {
  return (
    <section className="bg-[#f7eef2] px-6 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-14 max-w-[640px]">
          <p
            className="scroll-reveal text-[10px] uppercase tracking-[0.34em] text-[#b8879f]"
            style={revealStyle(0)}
          >
            Így épül fel egy kollekció
          </p>
          <h2
            className="scroll-reveal mt-4 font-[family:var(--font-display)] leading-[1.02] tracking-[-0.04em] text-[#4f2740]"
            style={{ ...revealStyle(80), fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Tudatosabb, letisztultabb folyamat.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {processSteps.map((step, i) => (
            <div
              key={step.num}
              className="scroll-reveal rounded-[1.8rem] border border-white/70 bg-white/78 p-7 shadow-[0_16px_40px_rgba(96,49,74,0.06)] backdrop-blur"
              style={revealStyle(i * 90)}
            >
              <p
                className="font-[family:var(--font-display)] text-[#ebd3de]"
                style={{ fontSize: "3.6rem", lineHeight: 1 }}
              >
                {step.num}
              </p>
              <h3 className="mt-4 text-[1rem] font-semibold text-[#4f2740]">
                {step.title}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.9] text-[#755d69]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 4. Values ──────────────────────────────────────────────── */
const values = [
  {
    icon: "✦",
    title: "Kifinomult nőiesség",
    desc: "A darabok nem túlzsúfoltak, hanem szépen arányoltak és könnyen viselhetők.",
  },
  {
    icon: "♡",
    title: "Minőségérzet",
    desc: "Fontos az anyaghatás, az összkép és az, hogy a darab viselés közben is szép maradjon.",
  },
  {
    icon: "◌",
    title: "Kis szériás hangulat",
    desc: "Nem futószalagos világot építünk, hanem válogatott, karakteres kollekciókat.",
  },
];

function ValuesSection() {
  return (
    <section className="mx-auto max-w-[1240px] px-6 py-24 sm:px-8 lg:px-12">
      <div className="mb-14 max-w-[620px]">
        <p
          className="scroll-reveal text-[10px] uppercase tracking-[0.34em] text-[#b8879f]"
          style={revealStyle(0)}
        >
          Amit képviselünk
        </p>
        <h2
          className="scroll-reveal mt-4 font-[family:var(--font-display)] leading-[1.02] tracking-[-0.04em] text-[#4f2740]"
          style={{ ...revealStyle(80), fontSize: "clamp(2rem, 4vw, 3rem)" }}
        >
          Finomabb irány. Erősebb összhatás.
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {values.map((v, i) => (
          <div
            key={v.title}
            className="scroll-reveal rounded-[1.8rem] border border-[#eddde4] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(250,242,246,0.95))] p-8 shadow-[0_18px_45px_rgba(96,49,74,0.06)]"
            style={revealStyle(i * 100)}
          >
            <p className="font-[family:var(--font-display)] text-[2.4rem] text-[#d779a9]">
              {v.icon}
            </p>
            <h3 className="mt-4 font-[family:var(--font-display)] text-[1.35rem] text-[#4f2740]">
              {v.title}
            </h3>
            <p className="mt-3 text-[14px] leading-[1.9] text-[#765d6a]">
              {v.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── 5. CTA ─────────────────────────────────────────────────── */
function CtaSection() {
  return (
    <section className="px-6 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1240px] overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,#f3d9e5_0%,#efc7da_45%,#f6e7ee_100%)] px-8 py-16 text-center shadow-[0_24px_70px_rgba(96,49,74,0.08)] sm:px-12">
        <p className="scroll-reveal text-[10px] uppercase tracking-[0.34em] text-[#b57695]" style={revealStyle(0)}>
          Chicks Jewelry
        </p>

        <h2
          className="scroll-reveal mt-4 font-[family:var(--font-display)] leading-[1.02] tracking-[-0.04em] text-[#4f2740]"
          style={{ ...revealStyle(80), fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
        >
          Találd meg azt a darabot,
          <br />
          ami tényleg illik hozzád.
        </h2>

        <p
          className="scroll-reveal mx-auto mt-5 max-w-[36rem] text-[15px] leading-[1.9] text-[#705865]"
          style={revealStyle(160)}
        >
          Modern, finom, nőies kollekciók — könnyen viselhető ékszerekkel,
          amelyek szépen működnek a saját stílusoddal.
        </p>

        <div
          className="scroll-reveal mt-8 flex flex-wrap justify-center gap-3"
          style={revealStyle(220)}
        >
          <Link
            href="/new-in"
            className="inline-flex items-center rounded-full bg-[#4f2740] px-7 py-3.5 text-sm font-medium text-white transition hover:translate-y-[-1px] hover:bg-[#432036]"
          >
            Kollekciók böngészése
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center rounded-full border border-[#dcb7c8] bg-white/80 px-7 py-3.5 text-sm font-medium text-[#6e4658] transition hover:bg-white"
          >
            Tovább a márkához
          </Link>
        </div>
      </div>
    </section>
  );
}