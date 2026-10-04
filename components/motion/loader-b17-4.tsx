"use client";

// Loader motions, batch 17 · group 4 (MOTION-MENU I47–I58). Small focused demos for /lab/motion.
// Every loader lives inside its demo frame (never fixed to the viewport) and loops its whole sequence by itself:
// cover in → the loading move + count → short hold (≤ 0.3 s) → reveal the little page underneath → short hold → restart.
// It plays only while on screen, a CSS-only glow loop never stops (a second one sits ON TOP of the cover), and
// ?static=1 / reduced motion shows the revealed page (every loader cover starts hidden in the markup).
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { scene } from "@/components/fx/shared";
import type { MotionDef } from "./types";

const F = { sg: "Space Grotesk Variable", fr: "Fraunces Variable", is: "Instrument Serif", sy: "Syne Variable", mr: "Manrope Variable" };

const CSS = `
.b17g4-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(122,162,255,.5)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,140,105,.22)),transparent 70%);animation:b17g4-drift 5.2s linear infinite alternate;will-change:transform}
@keyframes b17g4-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b17g4-hide{visibility:hidden}

.i47-spin{animation:i47-spin 1.7s linear infinite;transform-origin:50% 50%}
.i47-arc{animation:i47-dash 1.4s ease-in-out infinite}
@keyframes i47-spin{to{transform:rotate(360deg)}}
@keyframes i47-dash{0%{stroke-dasharray:2 400;stroke-dashoffset:0}50%{stroke-dasharray:250 400;stroke-dashoffset:-50}100%{stroke-dasharray:250 400;stroke-dashoffset:-375}}

.i49-l{animation:i49-l 1.3s ease-in-out infinite;transform-origin:50% 0}
.i49-r{animation:i49-r 1.3s ease-in-out infinite;transform-origin:50% 0}
.i49-mid{animation:i49-nudge 0.65s ease-in-out infinite}
@keyframes i49-l{0%{transform:rotate(0)}25%{transform:rotate(48deg)}50%,100%{transform:rotate(0)}}
@keyframes i49-r{0%,50%{transform:rotate(0)}75%{transform:rotate(-48deg)}100%{transform:rotate(0)}}
@keyframes i49-nudge{0%,100%{transform:translateX(0)}48%{transform:translateX(0)}50%{transform:translateX(1px)}54%{transform:translateX(0)}}

.i50-core{animation:i50-pulse 1.1s ease-in-out infinite alternate}
.i50-o1{animation:i50-orb 1.5s linear infinite}
.i50-o2{animation:i50-orb 2.3s linear infinite reverse}
@keyframes i50-pulse{from{transform:scale(.7);box-shadow:0 0 0 0 rgba(158,255,214,.55)}to{transform:scale(1.15);box-shadow:0 0 0 22px rgba(158,255,214,0)}}
@keyframes i50-orb{to{transform:rotate(360deg)}}

.i53-bob{animation:i53-bob .32s ease-in-out infinite alternate}
.i53-wheel{animation:i53-spin .45s linear infinite;transform-box:fill-box;transform-origin:50% 50%}
.i53-road{background:repeating-linear-gradient(90deg,rgba(255,255,255,.55) 0 46px,transparent 46px 92px);animation:i53-road .42s linear infinite}
.i53-far{background:repeating-linear-gradient(90deg,rgba(255,255,255,.08) 0 60px,transparent 60px 150px,rgba(255,255,255,.14) 150px 170px,transparent 170px 260px);animation:i53-far 2.4s linear infinite}
.i53-wind{animation:i53-wind .6s linear infinite}
@keyframes i53-bob{from{transform:translateY(0)}to{transform:translateY(-4px)}}
@keyframes i53-spin{to{transform:rotate(360deg)}}
@keyframes i53-road{to{background-position:-92px 0}}
@keyframes i53-far{to{background-position:-260px 0}}
@keyframes i53-wind{0%{transform:translateX(30px);opacity:0}30%{opacity:.8}100%{transform:translateX(-90px);opacity:0}}

.i54-tw{animation:i54-tw 1.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 50%}
@keyframes i54-tw{from{opacity:.25;transform:scale(.6)}to{opacity:.9;transform:scale(1.2)}}

.i55-light{animation:i55-light 1s linear infinite}
@keyframes i55-light{0%,60%,100%{opacity:.2}20%{opacity:1}}

.i56-scan{background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 2px,transparent 2px 5px);animation:i56-scan .9s linear infinite}
.i56-flick{animation:i56-flick 2.3s steps(1,end) infinite}
.i56-sweep{animation:i56-sweep 2.6s ease-in-out infinite alternate}
@keyframes i56-scan{to{background-position:0 25px}}
@keyframes i56-flick{0%,100%{opacity:1}31%{opacity:.82}33%{opacity:1}62%{opacity:.9}64%{opacity:.7}66%{opacity:1}88%{opacity:.86}}
@keyframes i56-sweep{from{transform:translateX(-38%) rotate(-8deg)}to{transform:translateX(38%) rotate(8deg)}}

.i57-d{animation:i57-y 1.5s ease-in-out infinite alternate,i57-z 1.5s ease-in-out infinite alternate}
.i57-r{animation:i57-r 1.5s ease-in-out infinite alternate}
@keyframes i57-y{from{translate:0 -54px}to{translate:0 54px}}
@keyframes i57-z{from{scale:.45;opacity:.35}to{scale:1.15;opacity:1}}
@keyframes i57-r{from{scale:1 1}to{scale:1 -1}}

html.is-static .b17g4-root *,html.is-static .b17g4-glow{animation:none!important}
@media (prefers-reduced-motion: reduce){.b17g4-root *,.b17g4-glow{animation:none!important}}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop + a second glow ON TOP (the loader covers hide the first). */
function Stage({ r, children, g1, g2, top = 0.5 }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string; top?: number }) {
  return (
    <div ref={r} className="b17g4-root relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0c14] text-[#eef1fb]">
      <style href="b17g4-css" precedence="default">
        {CSS}
      </style>
      <div className="b17g4-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      <div className="b17g4-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: top, zIndex: 60 } as CSSProperties} aria-hidden />
    </div>
  );
}

/**
 * "play" helper: waits for fonts, builds the looping timeline in a gsap.context, plays it only while on screen,
 * reverts on unmount (plus any extra cleanup registered with `dispose`). Nothing runs with prefersReducedMotion().
 */
function usePlay(ref: RefObject<HTMLElement | null>, build: (root: HTMLElement, dispose: (fn: () => void) => void) => gsap.core.Animation | void) {
  const b = useRef(build);
  b.current = build;
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    let dead = false;
    let on = false;
    let anim: gsap.core.Animation | void;
    const extra: (() => void)[] = [];
    const ctx = gsap.context(() => {}, root);
    const sync = () => {
      if (!anim) return;
      if (on) anim.play();
      else anim.pause();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        on = e.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    io.observe(root);
    Promise.resolve(document.fonts?.ready).then(() => {
      if (dead) return;
      ctx.add(() => {
        anim = b.current(root, (fn) => extra.push(fn));
      });
      sync();
    });
    return () => {
      dead = true;
      io.disconnect();
      extra.forEach((fn) => fn());
      ctx.revert();
    };
  }, [ref]);
}

const all = (root: Element, sel: string) => [...root.querySelectorAll<HTMLElement>(sel)];
const one = (root: Element, sel: string) => root.querySelector<HTMLElement>(sel)!;
const hold = (tl: gsap.core.Timeline, d = 0.18) => tl.to({}, { duration: d });

/** Adds a 0→100 counter to the timeline, written into every `els` (onTick gets the raw value). */
function count(tl: gsap.core.Timeline, els: Element[], duration: number, at?: gsap.Position, ease = "power1.inOut", onTick?: (v: number) => void) {
  const o = { v: 0 };
  tl.fromTo(
    o,
    { v: 0 },
    {
      v: 100,
      duration,
      ease,
      onUpdate: () => {
        const s = String(Math.round(o.v)).padStart(3, "0");
        els.forEach((e) => (e.textContent = s));
        onTick?.(o.v);
      },
    },
    at,
  );
}

type Reveal = "up" | "down" | "left" | "fade";

/**
 * The shared loader loop: cover fades in, `load` adds the loading move from time `t0` (it returns nothing; the count
 * runs for `dur` seconds from t0), short hold, the cover leaves in `dir` while the page settles, short hold, restart.
 */
function loaderLoop(el: HTMLElement, code: string, dur: number, load: (tl: gsap.core.Timeline, t0: number) => void, dir: Reveal = "up", ease = "power1.inOut") {
  const cover = one(el, `.${code}-cover`);
  const page = one(el, `.${code}-page`);
  const tl = gsap.timeline({ repeat: -1 });
  tl.set(cover, { autoAlpha: 0, xPercent: 0, yPercent: 0, scale: 1 });
  tl.to(cover, { autoAlpha: 1, duration: 0.25, ease: "power1.out" });
  const t0 = tl.duration();
  load(tl, t0);
  count(tl, all(el, `.${code}-n`), dur, t0, ease);
  hold(tl, 0.16);
  const out: gsap.TweenVars =
    dir === "up" ? { yPercent: -100 } : dir === "down" ? { yPercent: 100 } : dir === "left" ? { xPercent: -100 } : { autoAlpha: 0, scale: 1.06 };
  tl.to(cover, { ...out, duration: 0.65, ease: "power2.inOut" });
  tl.fromTo(page, { y: dir === "down" ? -40 : 40, scale: 0.98 }, { y: 0, scale: 1, duration: 0.65, ease: "power2.out" }, "<0.1");
  hold(tl, 0.2);
  return tl;
}

// eslint-disable-next-line @next/next/no-img-element
const Img = ({ i, className = "", w = 900, h = 760 }: { i: number; className?: string; w?: number; h?: number }) => (
  <img src={scene(i, w, h)} alt="" className={`block h-full w-full object-cover ${className}`} draggable={false} />
);

type PageP = { brand: string; links: string[]; kicker: string; title: [string, string]; price: string; cta: string; i: number; acc: string; font: string; weight?: number };

/** The little page every loader reveals: nav, kicker, two-line title, CTA + price, one image card. */
function Page({ p, c }: { p: PageP; c: string }) {
  return (
    <div className={`${c} absolute inset-0 px-[4%] py-[3.5%]`}>
      <div className="flex items-center justify-between text-[13px] text-white/75">
        <span className="text-[16px] font-[700] tracking-[-0.01em] text-white" style={{ fontFamily: F.sg }}>
          {p.brand}
        </span>
        <span className="flex gap-6">
          {p.links.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </span>
      </div>
      <div className="mt-[4%] grid h-[78%] grid-cols-[1.1fr_1fr] gap-[5%]">
        <div className="flex flex-col justify-center">
          <p className="text-[13px] font-[600] uppercase tracking-[0.22em]" style={{ fontFamily: F.mr, color: p.acc }}>
            {p.kicker}
          </p>
          <h3 className="mt-4 text-[clamp(40px,4.6vw,74px)] leading-[0.98] tracking-[-0.02em]" style={{ fontFamily: p.font, fontWeight: p.weight ?? 500 }}>
            {p.title[0]}
            <br />
            {p.title[1]}
          </h3>
          <div className="mt-7 flex items-center gap-5">
            <span className="rounded-full px-6 py-3 text-[14px] font-[600] text-[#0b0d14]" style={{ background: p.acc, fontFamily: F.mr }}>
              {p.cta}
            </span>
            <span className="text-[15px] text-white/70" style={{ fontFamily: F.sg }}>
              {p.price}
            </span>
          </div>
        </div>
        <div className="overflow-hidden rounded-[18px] border border-white/10">
          <Img i={p.i} />
        </div>
      </div>
    </div>
  );
}

/** Small caption under a loader: label + live count. */
function Cap({ code, label, brand, color = "#fff" }: { code: string; label: string; brand?: string; color?: string }) {
  return (
    <div className="mt-9 flex flex-col items-center gap-3">
      {brand && (
        <p className="text-[clamp(26px,2.6vw,40px)] font-[600] tracking-[-0.01em]" style={{ fontFamily: F.sg, color }}>
          {brand}
        </p>
      )}
      <p className="text-[13px] uppercase tracking-[0.3em] text-white/55" style={{ fontFamily: F.mr }}>
        {label} · <span className={`${code}-n tabular-nums text-white`}>100</span>
      </p>
    </div>
  );
}

/* ───────────────────────── I47 · Dash ring ───────────────────────── */
const I47_P: PageP = { brand: "Verso Audio", links: ["Speakers", "Studio", "Journal"], kicker: "Bookshelf pair · walnut", title: ["Sound that", "fills the room"], price: "₹ 24,900", cta: "Listen now", i: 0, acc: "#9fd8ff", font: F.sg, weight: 600 };
function I47() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => loaderLoop(el, "i47", 2.1, () => {}, "up"));
  return (
    <Stage r={root} g1="rgba(159,216,255,.52)" g2="rgba(140,120,255,.22)">
      <Page p={I47_P} c="i47-page" />
      <div className="i47-cover b17g4-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070a11]">
        <svg viewBox="0 0 160 160" className="i47-spin h-[170px] w-[170px]" aria-hidden>
          <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
          <circle className="i47-arc" cx="80" cy="80" r="60" fill="none" stroke="#9fd8ff" strokeWidth="8" strokeLinecap="round" strokeDasharray="120 400" />
        </svg>
        <Cap code="i47" label="Tuning" brand="Verso Audio" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── I48 · Fill-and-flip box ───────────────────────── */
const I48_P: PageP = { brand: "Grainhouse", links: ["Pantry", "Recipes", "Mill"], kicker: "Stone-milled · 1 kg", title: ["Flour with", "a slow hand"], price: "₹ 340", cta: "Fill the bag", i: 3, acc: "#ffd59a", font: F.fr };
function I48() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) =>
    loaderLoop(
      el,
      "i48",
      2.9,
      (tl, t0) => {
        const box = one(el, ".i48-box");
        const fill = one(el, ".i48-fill");
        tl.set(box, { rotation: 0 }, 0);
        tl.set(fill, { scaleY: 0, transformOrigin: "50% 100%" }, 0);
        let t = t0;
        for (let k = 0; k < 2; k++) {
          tl.to(fill, { scaleY: 1, duration: 0.45, ease: "power1.inOut" }, t);
          tl.to(box, { rotation: `+=360`, duration: 0.55, ease: "power2.inOut" }, t + 0.45);
          tl.to(fill, { scaleY: 0, duration: 0.45, ease: "power1.inOut" }, t + 1.0);
          t += 1.45;
        }
      },
      "down",
    ),
  );
  return (
    <Stage r={root} g1="rgba(255,213,154,.52)" g2="rgba(255,140,105,.2)">
      <Page p={I48_P} c="i48-page" />
      <div className="i48-cover b17g4-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d0b08]">
        <div className="i48-box relative h-[96px] w-[96px] overflow-hidden rounded-[6px] border-[5px] border-[#ffd59a]">
          <div className="i48-fill absolute inset-0 bg-[#ffd59a]" style={{ transform: "scaleY(0)" }} />
        </div>
        <Cap code="i48" label="Milling" brand="Grainhouse" color="#ffe9c6" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── I49 · Newton's cradle ───────────────────────── */
const I49_P: PageP = { brand: "Plumb & Line", links: ["Desk", "Objects", "About"], kicker: "Desk object · brass", title: ["Small things,", "well balanced"], price: "₹ 3,450", cta: "Shop objects", i: 2, acc: "#c8ff8a", font: F.is, weight: 400 };
function I49() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => loaderLoop(el, "i49", 2.6, () => {}, "left"));
  const ball = "h-[34px] w-[34px] rounded-full shadow-[inset_-6px_-6px_10px_rgba(0,0,0,.35)]";
  const grad = { background: "radial-gradient(circle at 35% 30%, #f6ffe6, #b5e57a 45%, #4f7a22)" };
  return (
    <Stage r={root} g1="rgba(200,255,138,.5)" g2="rgba(110,200,255,.2)">
      <Page p={I49_P} c="i49-page" />
      <div className="i49-cover b17g4-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#080c08]">
        <div className="relative">
          <div className="h-[4px] w-[230px] rounded-full bg-white/40" />
          <div className="flex justify-center">
            {[0, 1, 2, 3, 4].map((k) => (
              <div key={k} className={`flex flex-col items-center ${k === 0 ? "i49-l" : k === 4 ? "i49-r" : k === 1 || k === 3 ? "i49-mid" : ""}`}>
                <div className="h-[110px] w-px bg-white/45" />
                <div className={ball} style={grad} />
              </div>
            ))}
          </div>
        </div>
        <Cap code="i49" label="Settling" brand="Plumb & Line" color="#effde0" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── I50 · Orbit with pulsing core ───────────────────────── */
const I50_P: PageP = { brand: "Kinetic Bay", links: ["Fitness", "Coaching", "Gyms"], kicker: "Membership · monthly", title: ["Keep your", "orbit tight"], price: "₹ 1,999 / mo", cta: "Start today", i: 2, acc: "#9effd6", font: F.sy, weight: 700 };
function I50() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => loaderLoop(el, "i50", 2.2, () => {}, "fade"));
  return (
    <Stage r={root} g1="rgba(158,255,214,.5)" g2="rgba(120,140,255,.22)">
      <Page p={I50_P} c="i50-page" />
      <div className="i50-cover b17g4-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#060b0a]">
        <div className="relative h-[170px] w-[170px]">
          <div className="absolute inset-[18px] rounded-full border border-white/10" />
          <div className="absolute inset-[48px] rounded-full border border-white/10" />
          <div className="i50-core absolute left-[71px] top-[71px] h-[28px] w-[28px] rounded-full bg-[#9effd6]" />
          <div className="i50-o1 absolute inset-[18px]">
            <div className="absolute left-1/2 top-[-7px] ml-[-7px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,.7)]" />
          </div>
          <div className="i50-o2 absolute inset-[48px]">
            <div className="absolute bottom-[-6px] left-1/2 ml-[-6px] h-[12px] w-[12px] rounded-full bg-[#9effd6] shadow-[0_0_16px_rgba(158,255,214,.8)]" />
          </div>
        </div>
        <Cap code="i50" label="Warming up" brand="Kinetic Bay" color="#e4fff4" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── I51 · Day-night scene loader ───────────────────────── */
const I51_P: PageP = { brand: "Halcyon Stays", links: ["Retreats", "Journeys", "Offers"], kicker: "Coastal villa · 3 nights", title: ["Sunrise to", "starlight"], price: "from ₹ 38,000", cta: "Book a stay", i: 1, acc: "#ffb36b", font: F.fr };
function I51() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) =>
    loaderLoop(
      el,
      "i51",
      2.7,
      (tl, t0) => {
        const night = one(el, ".i51-night");
        const sun = one(el, ".i51-sun");
        const moon = one(el, ".i51-moon");
        const earth = one(el, ".i51-earth");
        const stars = all(el, ".i51-star");
        tl.set(night, { opacity: 0 }, 0);
        tl.set(sun, { rotation: -72 }, 0);
        tl.set(moon, { rotation: -72 }, 0);
        tl.set(earth, { rotation: 0 }, 0);
        tl.set(stars, { opacity: 0 }, 0);
        tl.to(earth, { rotation: 200, duration: 2.7, ease: "none" }, t0);
        tl.to(sun, { rotation: 72, duration: 1.55, ease: "sine.inOut" }, t0);
        tl.to(night, { opacity: 1, duration: 0.7, ease: "sine.inOut" }, t0 + 1.0);
        tl.to(stars, { opacity: 1, duration: 0.3, stagger: 0.05, ease: "power1.out" }, t0 + 1.25);
        tl.to(moon, { rotation: 70, duration: 1.5, ease: "sine.inOut" }, t0 + 1.2);
      },
      "up",
    ),
  );
  const stars = [
    [12, 18],
    [24, 34],
    [38, 12],
    [55, 26],
    [68, 10],
    [80, 30],
    [90, 16],
    [46, 40],
  ];
  return (
    <Stage r={root} g1="rgba(255,179,107,.52)" g2="rgba(110,140,255,.24)">
      <Page p={I51_P} c="i51-page" />
      <div className="i51-cover b17g4-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0b0a10]">
        <div className="relative h-[280px] w-[440px] overflow-hidden rounded-[22px] border border-white/10" style={{ background: "linear-gradient(#7cc6ff, #ffd9a8)" }}>
          <div className="i51-night absolute inset-0" style={{ background: "linear-gradient(#070b24, #27245a)", opacity: 0 }} />
          {stars.map(([x, y], k) => (
            <div key={k} className="i51-star absolute h-[4px] w-[4px] rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%`, opacity: 0 }} />
          ))}
          {/* sun and moon ride rotating arms pinned on the earth's centre */}
          <div className="i51-sun absolute left-1/2 top-[150%] h-0 w-0" style={{ transform: "rotate(-72deg)" }}>
            <div className="absolute h-[54px] w-[54px] rounded-full bg-[#ffe27a] shadow-[0_0_40px_rgba(255,215,110,.9)]" style={{ left: -27, top: -330 }} />
          </div>
          <div className="i51-moon absolute left-1/2 top-[150%] h-0 w-0" style={{ transform: "rotate(-72deg)" }}>
            <div className="absolute h-[38px] w-[38px] rounded-full bg-[#eef0ff] shadow-[inset_-9px_-4px_0_#b9bfe0,0_0_24px_rgba(220,225,255,.6)]" style={{ left: -19, top: -310 }} />
          </div>
          <div className="i51-earth absolute left-1/2 top-[66%] ml-[-260px] h-[520px] w-[520px] overflow-hidden rounded-full" style={{ background: "radial-gradient(circle at 50% 30%, #3e8be0, #1b4d93)" }}>
            <div className="absolute left-[18%] top-[6%] h-[70px] w-[120px] rounded-[45%] bg-[#4fae6a]" />
            <div className="absolute left-[62%] top-[10%] h-[50px] w-[90px] rounded-[50%] bg-[#4fae6a]" />
            <div className="absolute left-[8%] top-[40%] h-[80px] w-[70px] rounded-[50%] bg-[#4fae6a]" />
            <div className="absolute left-[70%] top-[42%] h-[90px] w-[110px] rounded-[45%] bg-[#4fae6a]" />
            <div className="absolute left-[38%] top-[70%] h-[60px] w-[100px] rounded-[50%] bg-[#4fae6a]" />
          </div>
        </div>
        <Cap code="i51" label="Packing the sky" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── I52 · Falling dominoes ───────────────────────── */
const I52_P: PageP = { brand: "Tile & Tally", links: ["Games", "Gifts", "Club"], kicker: "Hand-cut set · 28 pcs", title: ["One push,", "game night"], price: "₹ 2,250", cta: "Get the set", i: 1, acc: "#ff8fa3", font: F.sy, weight: 700 };
const I52_N = 8;
const I52_GAP = 82;
function I52() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) =>
    loaderLoop(
      el,
      "i52",
      1.95,
      (tl, t0) => {
        const ds = all(el, ".i52-d");
        // lean angle where a domino rests on its neighbour: h·sin(a) = gap − width
        const lean = (Math.asin((I52_GAP - 22) / 110) * 180) / Math.PI;
        tl.set(ds, { rotation: 0, transformOrigin: "100% 100%" }, 0);
        ds.forEach((d, k) => tl.to(d, { rotation: k === ds.length - 1 ? 90 : lean, duration: 0.28, ease: "power2.in" }, t0 + k * 0.13));
        const up = t0 + (ds.length - 1) * 0.13 + 0.32;
        tl.to([...ds].reverse(), { rotation: 0, duration: 0.3, ease: "power2.out", stagger: 0.05 }, up);
      },
      "left",
    ),
  );
  return (
    <Stage r={root} g1="rgba(255,143,163,.5)" g2="rgba(255,200,120,.2)">
      <Page p={I52_P} c="i52-page" />
      <div className="i52-cover b17g4-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0e080a]">
        <div className="relative flex items-end" style={{ gap: I52_GAP - 22 }}>
          {Array.from({ length: I52_N }, (_, k) => (
            <div key={k} className="i52-d flex h-[110px] w-[22px] flex-col items-center justify-around rounded-[5px] bg-[#fbe9ec] py-3 shadow-[0_4px_14px_rgba(0,0,0,.5)]">
              <span className="h-[6px] w-[6px] rounded-full bg-[#2a1016]" />
              <span className="h-px w-[14px] bg-[#2a1016]/40" />
              <span className="h-[6px] w-[6px] rounded-full bg-[#2a1016]" />
            </div>
          ))}
        </div>
        <div className="mt-[2px] h-[2px] w-[700px] bg-white/20" />
        <Cap code="i52" label="Setting the table" brand="Tile & Tally" color="#ffe3e8" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── I53 · Delivery truck ───────────────────────── */
const I53_P: PageP = { brand: "Parcel Lane", links: ["Send", "Track", "Business"], kicker: "Same-day across the city", title: ["Out the door", "by noon"], price: "from ₹ 79", cta: "Book a pickup", i: 0, acc: "#ffcf5a", font: F.sg, weight: 700 };
function I53() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) =>
    loaderLoop(
      el,
      "i53",
      2.4,
      (tl, t0) => {
        const bar = one(el, ".i53-bar");
        tl.set(bar, { scaleX: 0 }, 0);
        tl.to(bar, { scaleX: 1, duration: 2.4, ease: "power1.inOut" }, t0);
      },
      "up",
    ),
  );
  return (
    <Stage r={root} g1="rgba(255,207,90,.5)" g2="rgba(120,170,255,.2)">
      <Page p={I53_P} c="i53-page" />
      <div className="i53-cover b17g4-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0b0a07]">
        <div className="relative h-[200px] w-[560px] overflow-hidden">
          <div className="i53-far absolute inset-x-0 top-[38px] h-[60px]" />
          {[0, 1, 2].map((k) => (
            <div key={k} className="i53-wind absolute h-[2px] w-[60px] rounded-full bg-white/50" style={{ left: "26%", top: 78 + k * 22, animationDelay: `${-k * 0.2}s` }} />
          ))}
          <div className="i53-bob absolute bottom-[22px] left-[36%]">
            <svg viewBox="0 0 190 100" className="h-[100px] w-[190px]" aria-hidden>
              <rect x="2" y="8" width="118" height="66" rx="6" fill="#ffcf5a" />
              <rect x="14" y="22" width="60" height="8" rx="4" fill="#2a2108" opacity=".75" />
              <rect x="14" y="36" width="38" height="6" rx="3" fill="#2a2108" opacity=".45" />
              <path d="M124 26h34l24 26v22h-58z" fill="#f2f2ec" />
              <path d="M132 32h22l16 18h-38z" fill="#1d2738" />
              <rect x="124" y="60" width="62" height="6" fill="#d9d9d0" />
              <g className="i53-wheel">
                <circle cx="38" cy="80" r="15" fill="#1a1a1a" />
                <circle cx="38" cy="80" r="6" fill="#bbb" />
                <rect x="36.5" y="67" width="3" height="26" fill="#555" />
              </g>
              <g className="i53-wheel">
                <circle cx="154" cy="80" r="15" fill="#1a1a1a" />
                <circle cx="154" cy="80" r="6" fill="#bbb" />
                <rect x="152.5" y="67" width="3" height="26" fill="#555" />
              </g>
            </svg>
          </div>
          <div className="absolute inset-x-0 bottom-[16px] h-[3px] bg-white/15" />
          <div className="i53-road absolute inset-x-0 bottom-[4px] h-[4px]" />
        </div>
        <div className="mt-6 h-[4px] w-[320px] overflow-hidden rounded-full bg-white/10">
          <div className="i53-bar h-full w-full origin-left bg-[#ffcf5a]" style={{ transform: "scaleX(0)" }} />
        </div>
        <Cap code="i53" label="Out for delivery" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── I54 · Constellation blink ───────────────────────── */
const I54_P: PageP = { brand: "Lyra Atelier", links: ["Fine jewellery", "Bridal", "Atelier"], kicker: "Star pendant · 18k gold", title: ["Written in", "the stars"], price: "₹ 46,500", cta: "Find yours", i: 0, acc: "#d9c4ff", font: F.is, weight: 400 };
const I54_S: [number, number][] = [
  [70, 210],
  [150, 120],
  [250, 150],
  [320, 70],
  [410, 110],
  [470, 200],
  [550, 150],
];
function I54() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) =>
    loaderLoop(
      el,
      "i54",
      2.3,
      (tl, t0) => {
        const stars = all(el, ".i54-s");
        const halos = all(el, ".i54-h");
        const lines = all(el, ".i54-l");
        const glows = all(el, ".i54-lg");
        const lens = I54_S.slice(1).map((p, k) => Math.hypot(p[0] - I54_S[k][0], p[1] - I54_S[k][1]));
        lines.forEach((l, k) => tl.set([l, glows[k]], { strokeDasharray: lens[k], strokeDashoffset: lens[k] }, 0));
        tl.set(stars, { scale: 0.4, opacity: 0.3, transformOrigin: "50% 50%" }, 0);
        tl.set(halos, { scale: 0, opacity: 0, transformOrigin: "50% 50%" }, 0);
        stars.forEach((s, k) => {
          const at = t0 + k * 0.3;
          tl.to(s, { scale: 1.4, opacity: 1, duration: 0.14, ease: "power2.out" }, at);
          tl.to(s, { scale: 1, duration: 0.2, ease: "power1.inOut" }, at + 0.14);
          tl.fromTo(halos[k], { scale: 0.3, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 0.45, ease: "power1.out" }, at);
          if (k < lines.length) tl.to([lines[k], glows[k]], { strokeDashoffset: 0, duration: 0.3, ease: "none" }, at + 0.06);
        });
        tl.to(stars, { scale: 1.3, duration: 0.12, ease: "power1.out", yoyo: true, repeat: 1, stagger: 0.02 }, t0 + 2.0);
      },
      "fade",
    ),
  );
  return (
    <Stage r={root} g1="rgba(217,196,255,.52)" g2="rgba(120,170,255,.22)">
      <Page p={I54_P} c="i54-page" />
      <div className="i54-cover b17g4-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070610]">
        <svg viewBox="0 0 620 280" className="h-[280px] w-[620px]" aria-hidden>
          {Array.from({ length: 18 }, (_, k) => (
            <circle key={k} className="i54-tw" cx={(k * 97) % 600 + 10} cy={(k * 61) % 260 + 10} r="1.4" fill="#fff" style={{ animationDelay: `${-k * 0.27}s` }} />
          ))}
          {I54_S.slice(1).map((p, k) => (
            <line key={`g${k}`} className="i54-lg" x1={I54_S[k][0]} y1={I54_S[k][1]} x2={p[0]} y2={p[1]} stroke="#d9c4ff" strokeOpacity=".18" strokeWidth="9" strokeLinecap="round" />
          ))}
          {I54_S.slice(1).map((p, k) => (
            <line key={`l${k}`} className="i54-l" x1={I54_S[k][0]} y1={I54_S[k][1]} x2={p[0]} y2={p[1]} stroke="#efe6ff" strokeWidth="1.6" strokeLinecap="round" />
          ))}
          {I54_S.map(([x, y], k) => (
            <g key={k}>
              <circle className="i54-h" cx={x} cy={y} r="12" fill="none" stroke="#d9c4ff" strokeWidth="1.5" opacity="0" />
              <circle className="i54-s" cx={x} cy={y} r="6" fill="#fff" />
            </g>
          ))}
        </svg>
        <Cap code="i54" label="Charting" brand="Lyra Atelier" color="#f1eaff" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── I55 · Runway takeoff progress ───────────────────────── */
const I55_P: PageP = { brand: "Northbound Air", links: ["Fares", "Lounges", "Miles"], kicker: "Weekend fares · return", title: ["Wheels up", "this Friday"], price: "from ₹ 5,499", cta: "Search flights", i: 0, acc: "#8fd4ff", font: F.sg, weight: 600 };
function I55() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) =>
    loaderLoop(
      el,
      "i55",
      2.3,
      (tl, t0) => {
        const car = one(el, ".i55-car");
        const plane = one(el, ".i55-plane");
        const fill = one(el, ".i55-fill");
        tl.set(car, { left: "0%" }, 0);
        tl.set(plane, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 }, 0);
        tl.set(fill, { scaleX: 0 }, 0);
        tl.to(car, { left: "100%", duration: 2.3, ease: "power1.inOut" }, t0);
        tl.to(fill, { scaleX: 1, duration: 2.3, ease: "power1.inOut" }, t0);
        // at 100 the plane rotates up and climbs away
        tl.to(plane, { rotation: -16, duration: 0.25, ease: "power1.out" }, t0 + 2.05);
        tl.to(plane, { x: 160, y: -130, scale: 0.7, opacity: 0, duration: 0.5, ease: "power1.in" }, t0 + 2.2);
      },
      "up",
    ),
  );
  return (
    <Stage r={root} g1="rgba(143,212,255,.52)" g2="rgba(255,190,120,.2)">
      <Page p={I55_P} c="i55-page" />
      <div className="i55-cover b17g4-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#060a10]">
        <div className="relative h-[150px] w-[min(62%,760px)]">
          <div className="absolute inset-x-0 bottom-[22px] h-[30px] rounded-[6px] bg-[#1a2230]">
            <div className="absolute inset-x-[2%] top-1/2 h-[2px] -mt-px" style={{ background: "repeating-linear-gradient(90deg,rgba(255,255,255,.5) 0 22px,transparent 22px 44px)" }} />
            <div className="i55-fill absolute bottom-0 left-0 h-[3px] w-full origin-left bg-[#8fd4ff]" style={{ transform: "scaleX(0)" }} />
          </div>
          <div className="absolute inset-x-0 bottom-[8px] flex justify-between px-[1%]">
            {Array.from({ length: 16 }, (_, k) => (
              <span key={k} className="i55-light h-[5px] w-[5px] rounded-full bg-[#ffd27a]" style={{ animationDelay: `${(k / 16) * 1}s` }} />
            ))}
          </div>
          <div className="i55-car absolute bottom-[34px] left-0 h-0 w-0">
            <div className="i55-plane absolute bottom-0 left-[-70px]">
              <svg viewBox="0 0 120 44" className="h-[44px] w-[120px]" aria-hidden>
                <path d="M6 26 Q4 18 14 18 H92 Q114 18 118 26 Q114 32 96 32 H18 Q8 32 6 26Z" fill="#eef3fa" />
                <path d="M12 18 L4 4 H14 L30 18Z" fill="#8fd4ff" />
                <path d="M48 24 L72 24 L54 42 H44Z" fill="#c9d6e6" />
                <path d="M50 20 L66 20 L56 10 H50Z" fill="#c9d6e6" />
                {[0, 1, 2, 3, 4, 5].map((k) => (
                  <circle key={k} cx={40 + k * 9} cy="23" r="1.8" fill="#1d2738" />
                ))}
                <path d="M100 21 Q110 21 113 25 H100Z" fill="#1d2738" />
              </svg>
            </div>
          </div>
        </div>
        <Cap code="i55" label="Taxiing" brand="Northbound Air" color="#e9f6ff" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── I56 · Surveillance eye ───────────────────────── */
const I56_P: PageP = { brand: "Nightwatch Optics", links: ["Cameras", "Plans", "Support"], kicker: "Home camera · 2K night", title: ["Eyes on", "every corner"], price: "₹ 6,990", cta: "See the range", i: 1, acc: "#ff6b6b", font: F.sy, weight: 700 };
function I56() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) =>
    loaderLoop(
      el,
      "i56",
      2.5,
      (tl, t0) => {
        const iris = one(el, ".i56-iris");
        const lid = one(el, ".i56-lid");
        tl.set(iris, { x: 0, y: 0 }, 0);
        tl.set(lid, { scaleY: 1, transformOrigin: "50% 50%" }, 0);
        const looks: [number, number, number][] = [
          [-46, -6, 0.3],
          [44, -12, 0.36],
          [30, 14, 0.24],
          [-36, 16, 0.32],
          [0, 0, 0.26],
        ];
        let t = t0;
        looks.forEach(([x, y, d], k) => {
          tl.to(iris, { x, y, duration: d, ease: "power2.inOut" }, t);
          t += d + 0.12;
          if (k === 1 || k === 4) {
            tl.to(lid, { scaleY: 0.06, duration: 0.09, ease: "power1.in", yoyo: true, repeat: 1 }, t - 0.1);
            t += 0.12;
          }
        });
      },
      "fade",
    ),
  );
  return (
    <Stage r={root} g1="rgba(255,107,107,.5)" g2="rgba(120,200,255,.2)">
      <Page p={I56_P} c="i56-page" />
      <div className="i56-cover b17g4-hide absolute inset-0 z-10 overflow-hidden bg-[#08070a]">
        <div className="i56-sweep pointer-events-none absolute inset-[-10%]" style={{ background: "radial-gradient(22% 60% at 50% 40%, rgba(255,240,220,.16), transparent 70%)" }} />
        <div className="i56-flick relative flex h-full flex-col items-center justify-center">
          <svg viewBox="0 0 260 140" className="h-[150px] w-[280px]" aria-hidden>
            <defs>
              <clipPath id="i56-clip">
                <path d="M10 70 Q130 -20 250 70 Q130 160 10 70Z" />
              </clipPath>
              <radialGradient id="i56-ir" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#ff9a7a" />
                <stop offset=".6" stopColor="#c8342f" />
                <stop offset="1" stopColor="#4a0c10" />
              </radialGradient>
            </defs>
            <g className="i56-lid">
              <g clipPath="url(#i56-clip)">
                <rect width="260" height="140" fill="#efe9e4" />
                <g className="i56-iris">
                  <circle cx="130" cy="70" r="40" fill="url(#i56-ir)" />
                  <circle cx="130" cy="70" r="16" fill="#0b0607" />
                  <circle cx="141" cy="58" r="6" fill="#fff" opacity=".85" />
                </g>
              </g>
              <path d="M10 70 Q130 -20 250 70 Q130 160 10 70Z" fill="none" stroke="#ff6b6b" strokeWidth="4" />
            </g>
          </svg>
          <div className="mt-8 flex items-center gap-2 text-[13px] uppercase tracking-[0.3em] text-[#ff6b6b]" style={{ fontFamily: F.mr }}>
            <span className="h-[8px] w-[8px] rounded-full bg-[#ff4b4b] shadow-[0_0_10px_#ff4b4b]" /> Rec
          </div>
          <Cap code="i56" label="Scanning" brand="Nightwatch Optics" color="#ffe8e6" />
        </div>
        <div className="i56-scan pointer-events-none absolute inset-0" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── I57 · DNA helix dots ───────────────────────── */
const I57_P: PageP = { brand: "Helix Labs", links: ["Skincare", "Science", "Quiz"], kicker: "Serum · 30 ml", title: ["Made for", "your skin code"], price: "₹ 1,850", cta: "Take the quiz", i: 2, acc: "#7ff0e0", font: F.mr, weight: 600 };
const I57_N = 16;
function I57() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => loaderLoop(el, "i57", 2.3, () => {}, "left"));
  return (
    <Stage r={root} g1="rgba(127,240,224,.5)" g2="rgba(190,140,255,.24)">
      <Page p={I57_P} c="i57-page" />
      <div className="i57-cover b17g4-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050b0c]">
        <div className="flex h-[150px] items-center gap-[18px]">
          {Array.from({ length: I57_N }, (_, k) => {
            const d = -k * 0.19;
            return (
              <div key={k} className="relative flex h-full w-[16px] items-center justify-center">
                <div className="i57-r absolute h-[108px] w-px bg-white/20" style={{ animationDelay: `${d}s` }} />
                <div className="i57-d absolute h-[16px] w-[16px] rounded-full bg-[#7ff0e0]" style={{ animationDelay: `${d}s, ${d - 0.75}s` }} />
                <div className="i57-d absolute h-[16px] w-[16px] rounded-full bg-[#c9a6ff]" style={{ animationDelay: `${d - 1.5}s, ${d - 2.25}s` }} />
              </div>
            );
          })}
        </div>
        <Cap code="i57" label="Sequencing" brand="Helix Labs" color="#e6fffb" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── I58 · Snake on dot grid ───────────────────────── */
const I58_P: PageP = { brand: "Pixel Parlour", links: ["Arcade", "Events", "Cafe"], kicker: "Retro arcade · open late", title: ["Insert coin,", "stay a while"], price: "₹ 499 / hour", cta: "Book a booth", i: 2, acc: "#b6ff5a", font: F.sy, weight: 700 };
const I58_G = 13;
function I58() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el, dispose) => {
    const cv = one(el, ".i58-cv") as unknown as HTMLCanvasElement;
    const x = cv.getContext("2d")!;
    let size = 1;
    const resize = () => {
      const r = cv.getBoundingClientRect();
      size = cv.width = cv.height = Math.max(1, Math.round(r.width));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    type P = { x: number; y: number };
    let snake: P[] = [];
    let food: P = { x: 0, y: 0 };
    let dir: P = { x: 1, y: 0 };
    let last = 0;
    const STEP = 0.075;
    const free = (p: P, body: P[]) => p.x >= 0 && p.y >= 0 && p.x < I58_G && p.y < I58_G && !body.some((b) => b.x === p.x && b.y === p.y);
    const spawn = () => {
      for (let n = 0; n < 200; n++) {
        const p = { x: Math.floor(Math.random() * I58_G), y: Math.floor(Math.random() * I58_G) };
        if (free(p, snake) && Math.abs(p.x - snake[0].x) + Math.abs(p.y - snake[0].y) > 3) return p;
      }
      return { x: 0, y: 0 };
    };
    const reset = () => {
      snake = [
        { x: 4, y: 6 },
        { x: 3, y: 6 },
        { x: 2, y: 6 },
      ];
      dir = { x: 1, y: 0 };
      food = spawn();
    };
    reset();
    const step = () => {
      const h = snake[0];
      const dirs: P[] = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ];
      const body = snake.slice(0, -1);
      // greedy hunt: the free move that gets closest to the food (keep heading on ties)
      let best: P | null = null;
      let bd = Infinity;
      for (const d of dirs) {
        const p = { x: h.x + d.x, y: h.y + d.y };
        if (!free(p, body)) continue;
        const dist = Math.abs(p.x - food.x) + Math.abs(p.y - food.y) + (d.x === dir.x && d.y === dir.y ? -0.1 : 0);
        if (dist < bd) {
          bd = dist;
          best = d;
        }
      }
      if (!best) {
        reset();
        return;
      }
      dir = best;
      const nh = { x: h.x + dir.x, y: h.y + dir.y };
      snake.unshift(nh);
      if (nh.x === food.x && nh.y === food.y) {
        if (snake.length > 22) reset();
        else food = spawn();
      } else snake.pop();
    };
    let on = true;
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    const tick = (time: number) => {
      if (!on) return;
      if (time - last > STEP) {
        last = time;
        step();
      }
      const c = size / I58_G;
      x.clearRect(0, 0, size, size);
      x.fillStyle = "rgba(255,255,255,.16)";
      for (let i = 0; i < I58_G; i++) for (let j = 0; j < I58_G; j++) {
        x.beginPath();
        x.arc((i + 0.5) * c, (j + 0.5) * c, 1.6, 0, Math.PI * 2);
        x.fill();
      }
      const pulse = 0.75 + 0.25 * Math.sin(time * 9);
      x.fillStyle = "rgba(255,120,170,.25)";
      x.beginPath();
      x.arc((food.x + 0.5) * c, (food.y + 0.5) * c, c * 0.55 * pulse, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = "#ff78aa";
      x.beginPath();
      x.arc((food.x + 0.5) * c, (food.y + 0.5) * c, c * 0.26, 0, Math.PI * 2);
      x.fill();
      snake.forEach((s, k) => {
        const a = 1 - (k / Math.max(1, snake.length)) * 0.7;
        x.fillStyle = k === 0 ? "#eaffc8" : `rgba(182,255,90,${a.toFixed(3)})`;
        const pad = c * 0.12;
        x.beginPath();
        x.roundRect(s.x * c + pad, s.y * c + pad, c - pad * 2, c - pad * 2, c * 0.22);
        x.fill();
      });
    };
    gsap.ticker.add(tick);
    dispose(() => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
    });
    const tl = loaderLoop(
      el,
      "i58",
      2.6,
      (t) => {
        t.call(reset, [], 0);
      },
      "down",
    );
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(182,255,90,.5)" g2="rgba(255,120,170,.24)">
      <Page p={I58_P} c="i58-page" />
      <div className="i58-cover b17g4-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#07090a]">
        <div className="rounded-[18px] border border-white/10 bg-black/40 p-3">
          <canvas className="i58-cv block aspect-square w-[min(40vh,360px)]" />
        </div>
        <Cap code="i58" label="Loading level" />
      </div>
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "I47", name: "Dash ring", how: "Loop: a circular stroke spins while its dash length grows and shrinks as the count climbs, then the cover lifts off the page.", kind: "play", C: I47 },
  { code: "I48", name: "Fill-and-flip box", how: "Loop: a square outline fills from the bottom, turns a full 360° and drains like an hourglass (twice), then the cover drops away.", kind: "play", C: I48 },
  { code: "I49", name: "Newton's cradle", how: "Loop: the outer balls of a five-ball cradle swing out in turn while the count climbs, then the cover slides off to the left.", kind: "play", C: I49 },
  { code: "I50", name: "Orbit with pulsing core", how: "Loop: two small dots orbit a pulsing centre dot in opposite directions, then the cover fades up into the page.", kind: "play", C: I50 },
  { code: "I51", name: "Day-night scene loader", how: "Loop: a sun arcs over a turning earth, the sky fades from day to night, stars come out and a moon follows, then the cover lifts.", kind: "play", C: I51 },
  { code: "I52", name: "Falling dominoes", how: "Loop: a row of dominoes topples one after another (the last falls flat), they stand back up in reverse, then the cover slides off.", kind: "play", C: I52 },
  { code: "I53", name: "Delivery truck", how: "Loop: a little truck bobs with spinning wheels while road dashes, skyline and wind lines stream past and the progress bar fills.", kind: "play", C: I53 },
  { code: "I54", name: "Constellation blink", how: "Loop: the stars of a constellation blink on one by one with a halo ping while the connecting lines draw between them.", kind: "play", C: I54 },
  { code: "I55", name: "Runway takeoff progress", how: "Loop: a small plane taxis along the runway as the progress line fills, then pitches up and climbs away at 100.", kind: "play", C: I55 },
  { code: "I56", name: "Surveillance eye", how: "Loop: an eye looks around and blinks while a spotlight sweeps, scanlines roll and the screen flickers like an old monitor.", kind: "play", C: I56 },
  { code: "I57", name: "DNA helix dots", how: "Loop: two strands of dots travel on interleaved sine waves (scaling with depth) with rungs between them, like a turning helix.", kind: "play", C: I57 },
  { code: "I58", name: "Snake on dot grid", how: "Loop: a snake hunts dots across a dot grid on a canvas, growing as it eats while the count climbs, then the cover drops away.", kind: "play", C: I58 },
];
