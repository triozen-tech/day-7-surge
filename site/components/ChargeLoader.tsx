"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { loading } from "@/lib/loading";
import { atFromUrl, waitForClock } from "@/lib/atTime";
import { loader } from "../content";

// Loader "Charge" (Motion map M8 SVG line draw-on). The engine loader is off (meta.loader = false).
// Three flat ring ellipses (the can's rings in perspective) draw themselves one after another like a charge bar, a
// % counter beside them. At 100% the rings flash and the overlay clears onto the hero (X5: the flash hands over to the
// hero's ring lines). Always LOADER_SECONDS once every hero frame is loaded; on a slow connection it waits (at most
// HOLD_MAX more) with the rings pulsing, never frozen. &at=HH:MM:SS: holds its first frame and plays at that time.

const DRAW = 1.9;
const OUT = 0.6;
const HOLD_MAX = 12;
export const LOADER_SECONDS = DRAW + OUT; // 2.5

let revealed = false;

/** Runs when the loader starts its flash (immediately if it already has, or with ?static=1). */
export function onReveal(fn: () => void) {
  if (revealed) {
    fn();
    return () => {};
  }
  const h = () => fn();
  window.addEventListener("surge:reveal", h, { once: true });
  return () => window.removeEventListener("surge:reveal", h);
}

function reveal() {
  if (revealed) return;
  revealed = true;
  window.dispatchEvent(new Event("surge:reveal"));
}

export default function ChargeLoader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const finish = () => {
      setGone(true);
      reveal();
      loading.markFinished();
    };
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    window.scrollTo(0, 0);

    const target = atFromUrl();
    let framesReady = false;
    const unsub = loading.subscribe((_, done) => {
      if (done) framesReady = true;
    });
    let cancelClock = () => {};

    const el = root.current!;
    const ctx = gsap.context(() => {
      const rings = gsap.utils.toArray<SVGEllipseElement>(".ld-ring");
      const pct = el.querySelector<HTMLElement>(".ld-pct")!;
      const count = { v: 0 };
      gsap.fromTo(".ld-stage", { scale: 0.94 }, { scale: 1.04, duration: LOADER_SECONDS, ease: "none" });
      const tl = gsap.timeline({ paused: !!target });
      gsap.set(rings, { strokeDashoffset: 1 });
      rings.forEach((r, i) => {
        const at = (i * DRAW) / 3;
        tl.to(r, { strokeDashoffset: 0, duration: DRAW / 3, ease: "power1.inOut" }, at)
          // each ring flashes bright as it closes (a cell charged)
          .fromTo(r, { strokeWidth: 3 }, { strokeWidth: 5, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }, at + DRAW / 3 - 0.06);
      });
      tl.to(count, { v: 100, duration: DRAW, ease: "none", onUpdate: () => (pct.textContent = String(Math.round(count.v))) }, 0)
        .fromTo(".ld-brand", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.05)
        // wait here until every hero frame is in (the rings keep pulsing)
        .add(() => {
          const t0 = performance.now();
          const ok = () => framesReady || performance.now() - t0 > HOLD_MAX * 1000;
          if (ok()) return;
          tl.pause();
          const pulse = gsap.to(rings, { opacity: 0.5, duration: 0.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
          const wait = () => {
            if (ok()) {
              pulse.kill();
              gsap.set(rings, { opacity: 1 });
              tl.play();
            } else requestAnimationFrame(wait);
          };
          wait();
        }, DRAW - 0.02)
        .add(reveal, DRAW)
        // the flash: rings go white-blue and glow, then everything clears onto the hero
        .to(rings, { stroke: "#eaf5ff", duration: 0.08, ease: "none" }, DRAW)
        .fromTo(".ld-flash", { opacity: 0 }, { opacity: 0.55, duration: 0.08, ease: "none" }, DRAW)
        .to(".ld-flash", { opacity: 0, duration: 0.45, ease: "power2.out" }, DRAW + 0.08)
        .to([".ld-brand", ".ld-count"], { opacity: 0, duration: 0.25 }, DRAW)
        .to(".ld-rings", { scaleX: 3.2, opacity: 0, duration: OUT, ease: "power3.in" }, DRAW + 0.05)
        .to(el, { opacity: 0, duration: OUT * 0.6, ease: "power1.inOut" }, DRAW + OUT * 0.4)
        .add(() => {
          loading.markFinished();
          setGone(true);
        }, LOADER_SECONDS + 0.02);

      if (target) {
        if (Date.now() < target.getTime()) console.log(`[record] loader frozen until ${target.toLocaleTimeString()}`);
        cancelClock = waitForClock(target, () => tl.play(0));
      }
    }, el);

    return () => {
      unsub();
      cancelClock();
      ctx.revert();
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} data-loader aria-hidden className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#05080f] text-[#eaf5ff]">
      <div className="ld-flash pointer-events-none absolute inset-0 opacity-0 [background:radial-gradient(ellipse_60%_30%_at_50%_52%,rgba(92,200,255,0.55),transparent_70%)]" />
      {/* pulses with CSS, so it moves from the very first paint (before the page's JavaScript runs) */}
      <div className="ld-glow pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[110vmin] -translate-x-1/2 -translate-y-1/2 [background:radial-gradient(ellipse_50%_32%_at_50%_55%,rgba(47,140,255,0.42),rgba(47,140,255,0.12)_45%,transparent_72%)]" />
      <div className="ld-stage relative flex flex-col items-center">
        <p className="ld-brand font-display text-[clamp(40px,5vw,72px)] font-[850] tracking-[0.08em]">{loader.brand}</p>
        <svg className="ld-rings mt-8 h-[90px] w-[min(340px,70vw)] overflow-visible" viewBox="0 0 340 90">
          {[18, 45, 72].map((cy) => (
            <ellipse
              key={cy}
              className="ld-ring"
              cx="170"
              cy={cy}
              rx="160"
              ry="9"
              fill="none"
              stroke="#5cc8ff"
              strokeWidth="3"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1}
              style={{ filter: "drop-shadow(0 0 8px rgba(92,200,255,1))" }}
            />
          ))}
          {/* charge sparks: a bright dash running round each ring, the whole time (CSS animation) */}
          {[18, 45, 72].map((cy, i) => (
            <ellipse
              key={`s${cy}`}
              className="ld-spark"
              cx="170"
              cy={cy}
              rx="160"
              ry="9"
              fill="none"
              stroke="#eaf5ff"
              strokeWidth="3"
              pathLength={1}
              strokeDasharray="0.07 0.93"
              style={{ animationDelay: `${-i * 0.33}s`, filter: "drop-shadow(0 0 6px rgba(160,225,255,1))" }}
            />
          ))}
        </svg>
        <p className="ld-count label mt-8 flex items-center text-[color:var(--muted)]">
          {loader.note}
          <span className="font-display ml-3 inline-block min-w-[3.2ch] text-left text-[34px] font-[800] leading-none tracking-[0.02em] text-[color:var(--fg)]">
            <span className="ld-pct tabular-nums">0</span>%
          </span>
        </p>
      </div>
    </div>
  );
}
