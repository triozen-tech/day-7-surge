"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import type { SectionDef } from "@/components/sections/types";
import { HERO } from "@/components/sections/hero";
import { FEATURES } from "@/components/sections/features";
import { BENTO } from "@/components/sections/bento";
import { PRODUCT } from "@/components/sections/product";
import { STATS } from "@/components/sections/stats";
import { STORY } from "@/components/sections/story";
import { GALLERY } from "@/components/sections/gallery";
import { PROOF } from "@/components/sections/proof";
import { PRICING } from "@/components/sections/pricing";
import { FAQ } from "@/components/sections/faq";
import { CTA } from "@/components/sections/cta";
import { NEWSLETTER } from "@/components/sections/newsletter";
import { FOOTER } from "@/components/sections/footer";

const ALL: SectionDef[] = [...HERO, ...FEATURES, ...BENTO, ...PRODUCT, ...STATS, ...STORY, ...GALLERY, ...PROOF, ...PRICING, ...FAQ, ...CTA, ...NEWSLETTER, ...FOOTER];

export default function SectionsLab() {
  useEffect(() => {
    if (prefersReducedMotion()) document.documentElement.classList.add("is-static");
  }, []);
  return (
    <main className="bg-[#05070c] text-white">
      <section className="lab-intro relative grid h-[100svh] place-items-center overflow-hidden px-6 text-center" data-record-time="0.6" data-record-label="Sections">
        <div className="lab-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative">
          <p className="text-[13px] uppercase tracking-[0.2em] text-white/50">Showreel kit · hidden lab (noindex)</p>
          <h1 className="mt-4 font-[800] text-[clamp(52px,8vw,128px)] leading-[0.9] tracking-[-0.03em]" style={{ fontFamily: "Space Grotesk Variable" }}>
            Section lab
          </h1>
          <p className="mx-auto mt-4 max-w-[52ch] text-white/65">{ALL.length} section layouts from docs/SECTION-MENU.md, each a real designed section with its motion code.</p>
        </div>
      </section>
      {ALL.map(({ code, name, motion, C }) => (
        <section key={code} id={code.toLowerCase()} data-record-time="2.2" data-record-align="center" data-record-label={code}>
          <div className="flex items-center gap-3 border-t border-white/10 bg-[#05070c] px-[clamp(20px,5vw,96px)] py-2.5 text-[12px] text-white/60">
            <b className="text-[#4f8dff]">{code}</b>
            <span>{name}</span>
            <span className="ml-auto">motion {motion}</span>
          </div>
          <C />
        </section>
      ))}
      <section className="relative grid h-[50svh] place-items-center overflow-hidden" data-record-time="1.2" data-record-align="bottom" data-record-label="End">
        <div className="lab-glow pointer-events-none absolute inset-0" aria-hidden />
        <p className="relative text-[clamp(32px,5vw,72px)] font-[800]">End of section lab</p>
      </section>
    </main>
  );
}
