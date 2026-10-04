"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { ScrubRoot } from "@/components/fx/shared";
import type { MotionDef } from "@/components/motion/types";
import { MGROUPS } from "@/components/motion/catalog";

// The page frame of one /lab/motion/<group> (or /b<N> batch) page: intro, every motion as a labelled small demo, end card.
function Demo({ d }: { d: MotionDef }) {
  const root = useRef<HTMLElement>(null);
  const label = (
    <header className="pointer-events-none absolute left-[clamp(16px,4vw,56px)] top-[clamp(40px,7vh,72px)] z-20 max-w-[min(560px,80vw)]">
      <p className="text-[clamp(26px,3vw,44px)] font-[800] leading-none text-[#4f8dff]" style={{ fontFamily: "Space Grotesk Variable" }}>
        {d.code}
      </p>
      <p className="mt-1 text-[clamp(16px,1.4vw,20px)] font-[650]">{d.name}</p>
      <p className="mt-1 text-[13px] text-white/55">{d.how}</p>
    </header>
  );
  if (d.kind === "scrub")
    return (
      <section ref={root} id={d.code.toLowerCase()} className="relative h-[220vh] border-t border-white/10" data-record-time="1.2" data-record-label={d.code}>
        <ScrubRoot.Provider value={root}>
          <div className="sticky top-0 h-[100svh] overflow-hidden">
            {/* keeps the frame alive while a finished scrub holds still (never-frozen rule) */}
            {label}
            <div className="absolute inset-x-[clamp(16px,4vw,56px)] bottom-[6vh] top-[clamp(150px,22vh,210px)]">
              <d.C />
            </div>
            <div className="fx-pan pointer-events-none absolute inset-[-6%] z-10 opacity-60 mix-blend-screen" aria-hidden>
              <div className="lab-glow absolute inset-0" />
            </div>
          </div>
        </ScrubRoot.Provider>
        <div className="absolute bottom-0 left-0 h-px w-px" data-record-time="2.4" data-record-align="bottom" data-record-label={`${d.code} end`} aria-hidden />
      </section>
    );
  return (
    <section id={d.code.toLowerCase()} className="relative h-[100svh] overflow-hidden border-t border-white/10" data-record-time="2.4" data-record-align="center" data-record-label={d.code}>
      {label}
      <div className="absolute inset-x-[clamp(16px,4vw,56px)] bottom-[6vh] top-[clamp(150px,22vh,210px)]">
        <d.C />
      </div>
    </section>
  );
}

export default function MotionShell({ slug, defs }: { slug: string; defs: MotionDef[] }) {
  const batch = slug.match(/^b(\d+)$/)?.[1];
  const g = batch ? { name: `Batch ${batch}` } : MGROUPS.find((x) => x.slug === slug);
  useEffect(() => {
    if (prefersReducedMotion()) document.documentElement.classList.add("is-static");
  }, []);
  return (
    <main className="bg-[#05080f] text-[#eaf5ff]">
      <section className="relative grid h-[100svh] place-items-center overflow-hidden px-6 text-center" data-record-time="0.6" data-record-label="Motion">
        <div className="fx-pan pointer-events-none absolute inset-[-6%]" aria-hidden>
          <div className="lab-glow absolute inset-0" />
        </div>
        <div className="relative">
          <p className="text-[13px] uppercase tracking-[0.2em] text-white/50">Motion lab · hidden (noindex)</p>
          <h1 className="mt-4 text-[clamp(52px,8vw,128px)] font-[800] leading-[0.9] tracking-[-0.03em]" style={{ fontFamily: "Space Grotesk Variable" }}>
            {g?.name ?? "Motion"}
          </h1>
          <p className="mx-auto mt-4 max-w-[52ch] text-white/65">{defs.length} motions from docs/MOTION-MENU.md, each a small live demo built with GSAP.</p>
        </div>
      </section>
      {defs.map((d) => (
        <Demo key={d.code} d={d} />
      ))}
      <section className="relative grid h-[50svh] place-items-center overflow-hidden" data-record-time="1.2" data-record-align="bottom" data-record-label="End">
        <div className="fx-pan pointer-events-none absolute inset-[-6%]" aria-hidden>
          <div className="lab-glow absolute inset-0" />
        </div>
        <p className="fx-drift relative text-[clamp(32px,5vw,72px)] font-[800]">End of {g?.name ?? "motion"} lab</p>
      </section>
    </main>
  );
}
