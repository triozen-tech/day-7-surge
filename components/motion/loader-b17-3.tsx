"use client";

// Loader motions, batch 17 · group 3 (MOTION-MENU I38–I46). Small focused demos for /lab/motion.
// Every loader is contained inside its demo frame (never fixed to the viewport) and loops its whole sequence:
// cover in → loading move → hold (≤ 0.3 s) → reveal the little page underneath → short hold → restart.
// It plays only while on screen, a CSS-only glow loop never stops (a second one sits ON TOP of the cover), and
// ?static=1 / reduced motion shows the revealed page (every loader cover starts hidden in the markup).
// I42 builds its WebGL context only near the viewport (dpr 0.7, per-pixel noise) and releases it on unmount.
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { createShader, type GLHandle } from "@/lib/gl";
import { scene } from "@/components/fx/shared";
import type { MotionDef } from "./types";

const F = { sg: "Space Grotesk Variable", fr: "Fraunces Variable", is: "Instrument Serif", sy: "Syne Variable", mr: "Manrope Variable" };

/* I38 radar: sweep turns once per 2.4 s; each dot lights when the sweep reaches its angle (negative delay = angle). */
const I38_T = 2.4;

const CSS = `
.b17g3-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(122,162,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,140,105,.22)),transparent 70%);animation:b17g3-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b17g3-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b17g3-hide{visibility:hidden}
.i38-sweep{animation:i38-spin ${I38_T}s linear infinite}
@keyframes i38-spin{to{transform:rotate(360deg)}}
.i38-blip{animation:i38-blip ${I38_T}s linear infinite}
@keyframes i38-blip{0%{opacity:1;transform:scale(1.5)}30%{opacity:.18;transform:scale(1)}100%{opacity:.18;transform:scale(1)}}
.i40-l,.i40-r{animation:i40-sq 1.1s cubic-bezier(.6,0,.4,1) infinite}
.i40-l{transform-origin:0% 50%}
.i40-r{transform-origin:100% 50%;animation-delay:-.55s}
@keyframes i40-sq{0%,100%{transform:scale(1,1)}50%{transform:scale(2.6,.45)}}
.i41-dot{animation:i41-dot .9s infinite}
@keyframes i41-dot{0%{transform:translateY(0);animation-timing-function:cubic-bezier(.2,.6,.35,1)}50%{transform:translateY(-1.15em);animation-timing-function:cubic-bezier(.65,0,.8,.4)}90%{transform:translateY(0)}95%{transform:translateY(.04em) scale(1.25,.7)}100%{transform:translateY(0)}}
.i41-stem{display:inline-block;transform-origin:50% 100%;animation:i41-stem .9s infinite}
@keyframes i41-stem{0%,86%{transform:scale(1,1)}93%{transform:scale(1.12,.78)}100%{transform:scale(1,1)}}
.i43-spin{animation:i38-spin .8s linear infinite}
.i44-d{animation:i44-w 1s ease-in-out infinite}
.i44-d:nth-child(2){animation-delay:.14s}
.i44-d:nth-child(3){animation-delay:.28s}
@keyframes i44-w{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-120%)}}
.i45-bar{animation:i45-tilt 2s ease-in-out infinite}
@keyframes i45-tilt{0%,100%{transform:rotate(-11deg)}50%{transform:rotate(11deg)}}
.i45-ball{animation:i45-roll 2s ease-in-out infinite}
@keyframes i45-roll{0%,100%{left:0%;transform:rotate(-420deg)}8%{left:0%;transform:rotate(-420deg)}50%{left:calc(100% - 44px);transform:rotate(0deg)}58%{left:calc(100% - 44px);transform:rotate(0deg)}}
.i46-blk{animation:i46-bounce 1.3s cubic-bezier(.6,0,.4,1) infinite alternate}
@keyframes i46-bounce{0%{left:0%;transform:scaleX(1)}50%{transform:scaleX(1.5)}100%{left:75%;transform:scaleX(1)}}
html.is-static .b17g3-glow,html.is-static .i38-sweep,html.is-static .i38-blip,html.is-static .i40-l,html.is-static .i40-r,html.is-static .i41-dot,html.is-static .i41-stem,html.is-static .i43-spin,html.is-static .i44-d,html.is-static .i45-bar,html.is-static .i45-ball,html.is-static .i46-blk{animation:none}
html.is-static {.b17g3-glow,.i38-sweep,.i38-blip,.i40-l,.i40-r,.i41-dot,.i41-stem,.i43-spin,.i44-d,.i45-bar,.i45-ball,.i46-blk{animation:none}}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop + a second glow ON TOP (the loader covers hide the first). */
function Stage({ r, children, g1, g2, top = 0.5 }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string; top?: number }) {
  return (
    <div ref={r} className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0c14] text-[#eef1fb]">
      <style href="b17g3-css" precedence="default">
        {CSS}
      </style>
      <div className="b17g3-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      <div className="b17g3-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: top, zIndex: 60 } as CSSProperties} aria-hidden />
    </div>
  );
}

/** "play" helper: waits for fonts, builds the looping timeline in a gsap.context, plays it only while on screen. */
function usePlay(ref: RefObject<HTMLElement | null>, build: (root: HTMLElement) => gsap.core.Animation | void) {
  const b = useRef(build);
  b.current = build;
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    let dead = false;
    let on = false;
    let anim: gsap.core.Animation | void;
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
        anim = b.current(root);
      });
      sync();
    });
    return () => {
      dead = true;
      io.disconnect();
      ctx.revert();
    };
  }, [ref]);
}

const all = (root: Element, sel: string) => [...root.querySelectorAll<HTMLElement>(sel)];
const one = (root: Element, sel: string) => root.querySelector<HTMLElement>(sel)!;
const hold = (tl: gsap.core.Timeline, d = 0.2) => tl.to({}, { duration: d });

/** Adds a counter (from → to) to the timeline, written into every `els`. */
function count(tl: gsap.core.Timeline, els: Element[], duration: number, at?: gsap.Position, from = 0, to = 100, pad = 3) {
  const o = { v: from };
  tl.fromTo(
    o,
    { v: from },
    {
      v: to,
      duration,
      ease: "power1.inOut",
      onUpdate: () => {
        const s = String(Math.round(o.v)).padStart(pad, "0");
        els.forEach((e) => (e.textContent = s));
      },
    },
    at,
  );
}

/** Runs `fn` once the element is within ~1 screen of the viewport (no textures / GL contexts at page load). */
function whenNear(el: Element, fn: () => void) {
  const io = new IntersectionObserver(
    (es) => {
      if (es.some((e) => e.isIntersecting)) {
        io.disconnect();
        fn();
      }
    },
    { rootMargin: "900px 0px" },
  );
  io.observe(el);
  return () => io.disconnect();
}

// eslint-disable-next-line @next/next/no-img-element
const Img = ({ i, className = "", w = 900, h = 760 }: { i: number; className?: string; w?: number; h?: number }) => (
  <img src={scene(i, w, h)} alt="" className={`block h-full w-full object-cover ${className}`} draggable={false} />
);

type PageP = { brand: string; links: string[]; kicker: string; title: [string, string]; price: string; i: number; acc: string; font: string; weight?: number };

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
              Shop the drop
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

const Cap = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={`text-[13px] uppercase tracking-[0.3em] text-white/55 ${className}`} style={{ fontFamily: F.mr }}>
    {children}
  </p>
);

/* ───────────────────────── I38 · Radar sweep ───────────────────────── */
const I38_P: PageP = { brand: "Northwind Optics", links: ["Lenses", "Frames", "Labs"], kicker: "Field binocular · 10×42", title: ["See the far", "ridge clearly"], price: "₹ 24,500", i: 0, acc: "#8fffc8", font: F.sg, weight: 600 };
const I38_DOTS = [
  { a: 28, r: 0.62 },
  { a: 74, r: 0.34 },
  { a: 121, r: 0.8 },
  { a: 168, r: 0.5 },
  { a: 205, r: 0.72 },
  { a: 247, r: 0.28 },
  { a: 292, r: 0.58 },
  { a: 334, r: 0.86 },
];
function I38() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const cover = one(el, ".i38-cover");
    const radar = one(el, ".i38-radar");
    const page = one(el, ".i38-page");
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(cover, { autoAlpha: 0 });
    tl.set(radar, { scale: 0.7, opacity: 0 });
    tl.to(cover, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
    tl.to(radar, { scale: 1, opacity: 1, duration: 0.45, ease: "power2.out" }, "<0.05");
    count(tl, all(el, ".i38-n"), 2.4, ">-0.2");
    hold(tl, 0.12);
    tl.to(radar, { scale: 1.6, opacity: 0, duration: 0.6, ease: "power2.in" });
    tl.to(cover, { autoAlpha: 0, duration: 0.5, ease: "power1.inOut" }, "<0.15");
    tl.fromTo(page, { scale: 1.04, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" }, "<");
    hold(tl, 0.25);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(110,255,190,.5)" g2="rgba(120,160,255,.2)">
      <Page p={I38_P} c="i38-page" />
      <div className="i38-cover b17g3-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#05100c]">
        <div className="i38-radar relative h-[min(52vh,360px)] w-[min(52vh,360px)] rounded-full border border-[#8fffc8]/40" style={{ background: "radial-gradient(circle,#0b2a1f 0%,#061510 70%)" }}>
          {[0.33, 0.66].map((s) => (
            <div key={s} className="absolute rounded-full border border-[#8fffc8]/25" style={{ inset: `${(1 - s) * 50}%` }} />
          ))}
          <div className="absolute left-1/2 top-0 h-full w-px bg-[#8fffc8]/20" />
          <div className="absolute left-0 top-1/2 h-px w-full bg-[#8fffc8]/20" />
          <div className="i38-sweep absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(143,255,200,0) 0deg, rgba(143,255,200,0) 290deg, rgba(143,255,200,.45) 358deg, rgba(200,255,228,.95) 360deg)" }} />
          {I38_DOTS.map((d, k) => {
            const rad = (d.a * Math.PI) / 180;
            return (
              <span
                key={k}
                className="i38-blip absolute h-[12px] w-[12px] rounded-full bg-[#c8ffe4]"
                style={{
                  left: `calc(${50 + Math.sin(rad) * d.r * 50}% - 6px)`,
                  top: `calc(${50 - Math.cos(rad) * d.r * 50}% - 6px)`,
                  boxShadow: "0 0 14px 3px rgba(143,255,200,.7)",
                  animationDelay: `${-(1 - d.a / 360) * I38_T}s`,
                }}
              />
            );
          })}
          <span className="absolute left-1/2 top-1/2 -ml-[5px] -mt-[5px] h-[10px] w-[10px] rounded-full bg-white" />
        </div>
        <p className="mt-9 text-[22px] font-[600] tracking-[-0.01em]" style={{ fontFamily: F.sg }}>
          Northwind Optics
        </p>
        <Cap className="mt-3">
          Scanning the horizon · <span className="i38-n tabular-nums text-white">100</span>
        </Cap>
      </div>
    </Stage>
  );
}

/* ───────────────────────── I39 · Signal arc over logos ───────────────────────── */
const I39_P: PageP = { brand: "Relay Commons", links: ["Platform", "Partners", "Pricing"], kicker: "Works with your stack", title: ["Every tool,", "one signal"], price: "from ₹ 1,200 / mo", i: 2, acc: "#a9c4ff", font: F.sg, weight: 600 };
const I39_LOGOS = ["Orbitly", "Quillo", "Stackfern", "Nimbo", "Parcelo"];
function I39Mark({ k }: { k: number }) {
  const shapes = [
    <circle key="a" cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="4" />,
    <path key="b" d="M6 26 L16 5 L26 26 Z" fill="currentColor" />,
    <g key="c" fill="currentColor">
      <rect x="5" y="5" width="9" height="9" rx="2" />
      <rect x="18" y="5" width="9" height="9" rx="2" />
      <rect x="5" y="18" width="9" height="9" rx="2" />
      <rect x="18" y="18" width="9" height="9" rx="5" />
    </g>,
    <path key="d" d="M5 20 Q11 6 16 16 T27 12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />,
    <rect key="e" x="6" y="6" width="20" height="20" rx="6" fill="none" stroke="currentColor" strokeWidth="4" transform="rotate(45 16 16)" />,
  ];
  return (
    <svg viewBox="0 0 32 32" className="h-[34px] w-[34px]" aria-hidden>
      {shapes[k % shapes.length]}
    </svg>
  );
}
function I39() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const cover = one(el, ".i39-cover");
    const arc = one(el, ".i39-arc");
    const row = one(el, ".i39-row");
    const logos = all(el, ".i39-logo");
    const bar = one(el, ".i39-bar");
    const page = one(el, ".i39-page");
    const rw = row.clientWidth;
    const aw = arc.clientWidth;
    const rr = row.getBoundingClientRect();
    // logo centres relative to the row, used to time each lift with the arc's pass
    const cx = logos.map((l) => {
      const b = l.getBoundingClientRect();
      return b.left - rr.left + b.width / 2;
    });
    const start = -aw / 2;
    const end = rw - aw / 2;
    const D = 1.15;
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(cover, { autoAlpha: 0, yPercent: 0 });
    tl.set(arc, { x: start, opacity: 0 });
    tl.set(logos, { y: 0, opacity: 0.45 });
    tl.set(bar, { scaleX: 0 });
    tl.to(cover, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
    tl.to(arc, { opacity: 1, duration: 0.2 }, ">-0.05");
    const pass = (dir: 1 | -1) => {
      const t0 = tl.duration();
      const [a, b] = dir === 1 ? [start, end] : [end, start];
      tl.fromTo(arc, { x: a }, { x: b, duration: D, ease: "none" }, t0);
      cx.forEach((c, k) => {
        const f = (c - aw / 2 - a) / (b - a);
        const at = t0 + f * D - 0.12;
        tl.to(logos[k], { y: -22, opacity: 1, duration: 0.22, ease: "power2.out" }, at);
        tl.to(logos[k], { y: 0, opacity: 0.6, duration: 0.4, ease: "power2.inOut" }, at + 0.22);
      });
    };
    const b0 = tl.duration();
    pass(1);
    pass(-1);
    tl.to(bar, { scaleX: 1, duration: tl.duration() - b0, ease: "power1.inOut" }, b0);
    count(tl, all(el, ".i39-n"), tl.duration() - b0, b0);
    hold(tl, 0.1);
    tl.to(cover, { yPercent: -100, duration: 0.7, ease: "power3.inOut" });
    tl.fromTo(page, { y: 40, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" }, "<0.15");
    hold(tl, 0.25);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(150,180,255,.55)" g2="rgba(255,150,210,.2)">
      <Page p={I39_P} c="i39-page" />
      <div className="i39-cover b17g3-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0d1a]">
        <p className="text-[clamp(34px,3.6vw,56px)] font-[600] tracking-[-0.02em]" style={{ fontFamily: F.sg }}>
          Relay Commons
        </p>
        <Cap className="mt-3">Connecting your tools</Cap>
        <div className="i39-row relative mt-16 flex w-[min(70%,820px)] justify-between pt-[70px]">
          <svg className="i39-arc pointer-events-none absolute left-0 top-0 h-[110px] w-[220px]" viewBox="0 0 220 110" aria-hidden style={{ opacity: 0 }}>
            <defs>
              <linearGradient id="i39g" x1="0" x2="1">
                <stop offset="0" stopColor="#a9c4ff" stopOpacity="0" />
                <stop offset=".5" stopColor="#e6edff" />
                <stop offset="1" stopColor="#ff9ad5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M10 100 Q110 -20 210 100" fill="none" stroke="url(#i39g)" strokeWidth="14" strokeOpacity=".22" strokeLinecap="round" />
            <path d="M10 100 Q110 -20 210 100" fill="none" stroke="url(#i39g)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="110" cy="40" r="5" fill="#fff" />
          </svg>
          {I39_LOGOS.map((n, k) => (
            <div key={n} className="i39-logo flex flex-col items-center gap-2 text-[#dfe6ff]" style={{ opacity: 0.6 }}>
              <I39Mark k={k} />
              <span className="text-[14px] font-[600]" style={{ fontFamily: F.mr }}>
                {n}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-12 h-[3px] w-[min(40%,420px)] overflow-hidden rounded-full bg-white/10">
          <div className="i39-bar h-full w-full origin-left rounded-full bg-[#a9c4ff]" style={{ transform: "scaleX(0)" }} />
        </div>
        <Cap className="mt-4">
          <span className="i39-n tabular-nums text-white">100</span> %
        </Cap>
      </div>
    </Stage>
  );
}

/* ───────────────────────── I40 · Bracket squeeze ───────────────────────── */
const I40_P: PageP = { brand: "Kestrel", links: ["Type", "Specimens", "Licences"], kicker: "Display family · 9 weights", title: ["Letters with", "sharp edges"], price: "Desktop · ₹ 6,800", i: 1, acc: "#ffb36b", font: F.sy, weight: 700 };
function I40() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const cover = one(el, ".i40-cover");
    const word = one(el, ".i40-word");
    const page = one(el, ".i40-page");
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(cover, { autoAlpha: 0, clipPath: "inset(0% 0% 0% 0%)" });
    tl.set(word, { letterSpacing: "0.2em", opacity: 0 });
    tl.to(cover, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
    tl.to(word, { letterSpacing: "-0.02em", opacity: 1, duration: 0.8, ease: "power3.out" }, "<0.05");
    count(tl, all(el, ".i40-n"), 2.2, "<");
    hold(tl, 0.1);
    // the brackets close: the cover pinches shut from both sides toward the word
    tl.to(cover, { clipPath: "inset(0% 50% 0% 50%)", duration: 0.7, ease: "power3.inOut" });
    tl.fromTo(page, { scale: 0.97, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.7, ease: "power2.out" }, "<0.1");
    hold(tl, 0.25);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,179,107,.55)" g2="rgba(140,120,255,.2)">
      <Page p={I40_P} c="i40-page" />
      <div className="i40-cover b17g3-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#120c08]">
        <div className="flex items-center gap-[clamp(28px,3vw,48px)]">
          <div className="flex w-[110px] justify-start">
            <span className="i40-l block h-[clamp(70px,9vw,120px)] w-[34px] rounded-[6px] bg-[#ffb36b]" />
          </div>
          <p className="i40-word text-[clamp(64px,8vw,132px)] font-[800] uppercase leading-none" style={{ fontFamily: F.sy, letterSpacing: "-0.02em" }}>
            Kestrel
          </p>
          <div className="flex w-[110px] justify-end">
            <span className="i40-r block h-[clamp(70px,9vw,120px)] w-[34px] rounded-[6px] bg-[#ffb36b]" />
          </div>
        </div>
        <Cap className="mt-10">
          Setting type · <span className="i40-n tabular-nums text-white">100</span>
        </Cap>
      </div>
    </Stage>
  );
}

/* ───────────────────────── I41 · Dropping i-dot ───────────────────────── */
const I41_P: PageP = { brand: "halvi", links: ["Teas", "Rituals", "Journal"], kicker: "Loose leaf · 100 g tin", title: ["Steep it", "slower"], price: "₹ 840", i: 2, acc: "#c8ff8a", font: F.fr };
function I41() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const cover = one(el, ".i41-cover");
    const word = one(el, ".i41-word");
    const page = one(el, ".i41-page");
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(cover, { autoAlpha: 0, yPercent: 0 });
    tl.set(word, { y: 30, opacity: 0 });
    tl.to(cover, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
    tl.to(word, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "<0.05");
    count(tl, all(el, ".i41-n"), 2.3, "<");
    hold(tl, 0.1);
    tl.to(cover, { yPercent: 100, duration: 0.7, ease: "power3.inOut" });
    tl.fromTo(page, { y: -40, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" }, "<0.15");
    hold(tl, 0.25);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(200,255,138,.5)" g2="rgba(255,213,154,.2)">
      <Page p={I41_P} c="i41-page" />
      <div className="i41-cover b17g3-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0b120a]">
        <p className="i41-word text-[clamp(110px,13vw,200px)] leading-none" style={{ fontFamily: F.fr, fontWeight: 600, letterSpacing: "-0.03em" }}>
          halv
          <span className="relative inline-block">
            <span className="i41-stem">ı</span>
            <span className="absolute left-1/2 top-[0.04em] -ml-[0.075em] block h-[0.15em] w-[0.15em]">
              <span className="i41-dot block h-full w-full rounded-full bg-[#c8ff8a]" />
            </span>
          </span>
        </p>
        <Cap className="mt-8">
          Brewing · <span className="i41-n tabular-nums text-white">100</span>
        </Cap>
      </div>
    </Stage>
  );
}

/* ───────────────────────── I42 · Ice melt gate (OGL) ───────────────────────── */
const I42_P: PageP = { brand: "Glacier & Co", links: ["Water", "Sparkling", "Stores"], kicker: "Spring water · 750 ml", title: ["Cold from", "the source"], price: "₹ 180 a bottle", i: 0, acc: "#9fd8ff", font: F.fr };
const I42_R = 0.26; // trace ring radius, fraction of stage height
const I42_FRAG = /* glsl */ `
uniform float uWipe, uMelt, uTrace;
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float nz(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int k = 0; k < 4; k++){ v += a * nz(p); p *= 2.03; a *= 0.5; } return v; }
void main(){
  float asp = uRes.x / uRes.y;
  vec2 p = (vUv - 0.5) * vec2(asp, 1.0);
  // ice sheet wipes down from the top, with a frosty ragged front
  float front = 1.0 - uWipe * 1.06 + (fbm(vec2(vUv.x * 7.0, uTime * 0.4)) - 0.5) * 0.07;
  float sheet = smoothstep(front - 0.006, front + 0.006, vUv.y) * step(0.001, uWipe);
  // melt hole from the centre with a noisy, wet edge
  float r = length(p);
  float n = fbm(p * 3.2 + uTime * 0.12);
  float hole = uMelt * 1.15 + (n - 0.5) * 0.2 * min(uMelt * 5.0, 1.0);
  float keep = smoothstep(hole - 0.015, hole + 0.015, r);
  // ice colour: frosted noise, fine grain and a few cracks
  float f = fbm(p * 3.5 + vec2(0.0, uTime * 0.03));
  float g = nz(p * 40.0);
  float crack = smoothstep(0.018, 0.0, abs(fbm(p * 4.5 + 3.0) - 0.5));
  vec3 col = mix(vec3(0.42, 0.62, 0.8), vec3(0.88, 0.96, 1.0), f) + g * 0.06 + crack * 0.35;
  col += smoothstep(0.03, 0.0, abs(vUv.y - front)) * 0.5 * step(0.001, uWipe) * (1.0 - step(0.999, uWipe));
  float rim = smoothstep(0.06, 0.0, abs(r - hole)) * step(0.001, uMelt);
  col += rim * vec3(0.5, 0.8, 1.0);
  // the traced ring (a pointer draws it clockwise from the top)
  float a01 = fract(atan(p.x, p.y) / 6.2831853 + 1.0);
  float ring = smoothstep(0.012, 0.0, abs(r - ${I42_R.toFixed(3)})) * step(a01, uTrace) * step(0.001, uTrace);
  float halo = smoothstep(0.05, 0.0, abs(r - ${I42_R.toFixed(3)})) * step(a01, uTrace) * step(0.001, uTrace) * 0.35;
  col += (ring + halo) * vec3(0.85, 0.97, 1.0);
  float alpha = sheet * keep * 0.9;
  alpha = max(alpha, (ring + rim * 0.6) * sheet * keep);
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}`;

function I42() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const fb = useRef<HTMLDivElement>(null);
  const st = useRef({ wipe: 0, melt: 0, trace: 0 });
  const gl = useRef(false);

  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let dead = false;
    let h: GLHandle | null = null;
    const stop = whenNear(c, async () => {
      h = await createShader(c, I42_FRAG, {
        dpr: 0.7,
        uniforms: { uWipe: { value: 0 }, uMelt: { value: 0 }, uTrace: { value: 0 } },
        onFrame: (u) => {
          u.uWipe.value = st.current.wipe;
          u.uMelt.value = st.current.melt;
          u.uTrace.value = st.current.trace;
          if (!gl.current) {
            gl.current = true;
            window.setTimeout(() => fb.current && (fb.current.style.visibility = "hidden"), 600);
          }
        },
      });
      if (dead) h?.destroy();
    });
    return () => {
      dead = true;
      stop();
      h?.destroy();
    };
  }, []);

  usePlay(root, (el) => {
    const ui = one(el, ".i42-ui");
    const dot = one(el, ".i42-dot");
    const page = one(el, ".i42-page");
    const f = fb.current;
    const W = el.clientWidth;
    const H = el.clientHeight;
    const R = H * I42_R;
    const s = st.current;
    // CSS fallback (before / without WebGL): same wipe + clean circular hole
    const paint = () => {
      if (!f) return;
      f.style.clipPath = `inset(0 0 ${((1 - s.wipe) * 100).toFixed(2)}% 0)`;
      const rr = s.melt * 1.15 * H;
      const m = rr > 0 ? `radial-gradient(circle at 50% 50%, transparent ${rr.toFixed(1)}px, #000 ${(rr + 2).toFixed(1)}px)` : "none";
      f.style.maskImage = m;
      f.style.setProperty("-webkit-mask-image", m);
      const a = s.trace * Math.PI * 2;
      gsap.set(dot, { x: W / 2 + Math.sin(a) * R, y: H / 2 - Math.cos(a) * R });
    };
    const tl = gsap.timeline({ repeat: -1, onUpdate: paint });
    tl.set(s, { wipe: 0, melt: 0, trace: 0 });
    tl.set(ui, { autoAlpha: 0 });
    tl.set(dot, { opacity: 0, scale: 1 });
    tl.set(page, { scale: 1, opacity: 1 });
    // ice wipes down over the page while the counter runs 10 → 0
    tl.to(ui, { autoAlpha: 1, duration: 0.25, ease: "power1.out" });
    tl.to(s, { wipe: 1, duration: 1.7, ease: "power1.inOut" }, "<");
    tl.to(page, { scale: 0.97, opacity: 0.7, duration: 1.7, ease: "power1.inOut" }, "<");
    count(tl, all(el, ".i42-n"), 1.7, "<", 10, 0, 2);
    hold(tl, 0.08);
    // a pointer traces a circle on the ice (auto, so record mode needs no hand)
    tl.to(dot, { opacity: 1, duration: 0.15 });
    tl.to(s, { trace: 1, duration: 0.9, ease: "power1.inOut" }, "<");
    tl.to(ui, { autoAlpha: 0, duration: 0.3 }, "<0.3");
    // …and it melts a way in
    tl.to(dot, { opacity: 0, scale: 1.8, duration: 0.3, ease: "power1.out" });
    tl.to(s, { melt: 1, duration: 1.1, ease: "power2.in" }, "<");
    tl.to(page, { scale: 1, opacity: 1, duration: 1.1, ease: "power2.out" }, "<0.1");
    tl.set(s, { wipe: 0, trace: 0 });
    hold(tl, 0.22);
    return tl;
  });

  return (
    <Stage r={root} g1="rgba(159,216,255,.55)" g2="rgba(200,180,255,.2)">
      <Page p={I42_P} c="i42-page" />
      <div className="absolute inset-0 z-10">
        <div
          ref={fb}
          className="absolute inset-0"
          style={{ clipPath: "inset(0 0 100% 0)", background: "linear-gradient(170deg,#e4f4ff 0%,#a9d2ee 38%,#6f9fc6 70%,#cfe9ff 100%)", opacity: 0.92 }}
        />
        <canvas ref={cv} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500" aria-hidden />
      </div>
      <div className="i42-ui b17g3-hide absolute inset-0 z-20 flex flex-col items-center justify-start pt-[6%] text-[#06243a]">
        <p className="i42-n tabular-nums text-[clamp(56px,6vw,96px)] font-[600] leading-none" style={{ fontFamily: F.sg }}>
          00
        </p>
        <p className="mt-2 text-[13px] font-[700] uppercase tracking-[0.3em]" style={{ fontFamily: F.mr }}>
          Glacier &amp; Co · chilling
        </p>
      </div>
      <div className="i42-dot pointer-events-none absolute left-0 top-0 z-30 -ml-[11px] -mt-[11px] h-[22px] w-[22px] rounded-full border-2 border-white bg-white/30" style={{ opacity: 0, boxShadow: "0 0 18px 4px rgba(200,235,255,.8)" }} aria-hidden />
    </Stage>
  );
}

/* ───────────────────────── I43 · Checklist loader ───────────────────────── */
const I43_P: PageP = { brand: "Kiln Street", links: ["Cups", "Plates", "Studio"], kicker: "Small-batch stoneware", title: ["Made slowly,", "shipped fast"], price: "Cup set · ₹ 2,200", i: 3, acc: "#ffd59a", font: F.fr };
const I43_STEPS = ["Warming the kiln", "Glazing 24 cups", "Packing in straw", "Printing the labels", "Opening the shop"];
const I43_ROW = 76;
function I43() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const cover = one(el, ".i43-cover");
    const list = one(el, ".i43-list");
    const rows = all(el, ".i43-row");
    const spins = all(el, ".i43-spin");
    const checks = all(el, ".i43-check");
    const ticks = all(el, ".i43-tick");
    const page = one(el, ".i43-page");
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(cover, { autoAlpha: 0, clipPath: "inset(0% 0% 0% 0%)" });
    tl.set(list, { y: 0 });
    tl.set(rows, { opacity: 0.3 });
    tl.set(rows[0], { opacity: 1 });
    tl.set(spins, { autoAlpha: 0 });
    tl.set(spins[0], { autoAlpha: 1 });
    tl.set(checks, { autoAlpha: 0, scale: 0.6 });
    tl.set(ticks, { strokeDashoffset: 24 });
    tl.to(cover, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
    I43_STEPS.forEach((_, k) => {
      // the step works (spinner), then gets its check, then the list scrolls up one step
      tl.to({}, { duration: 0.55 });
      tl.set(spins[k], { autoAlpha: 0 });
      tl.to(checks[k], { autoAlpha: 1, scale: 1, duration: 0.2, ease: "back.out(2)" });
      tl.to(ticks[k], { strokeDashoffset: 0, duration: 0.25, ease: "power2.out" }, "<0.05");
      if (k < I43_STEPS.length - 1) {
        tl.to(list, { y: -(k + 1) * I43_ROW, duration: 0.45, ease: "power3.inOut" }, ">-0.05");
        tl.to(rows[k], { opacity: 0.3, duration: 0.45 }, "<");
        tl.to(rows[k + 1], { opacity: 1, duration: 0.45 }, "<");
        tl.set(spins[k + 1], { autoAlpha: 1 }, "<");
      }
    });
    hold(tl, 0.12);
    tl.to(cover, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "power3.inOut" });
    tl.fromTo(page, { y: 30, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" }, "<0.1");
    hold(tl, 0.25);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,213,154,.55)" g2="rgba(255,140,105,.2)">
      <Page p={I43_P} c="i43-page" />
      <div className="i43-cover b17g3-hide absolute inset-0 z-10 flex items-center justify-center bg-[#100d09]">
        <Cap className="absolute left-[5%] top-[8%]">Kiln Street · getting ready</Cap>
        <div className="relative overflow-hidden" style={{ height: I43_ROW * 5 }}>
          <div className="i43-list" style={{ paddingTop: I43_ROW * 2 }}>
            {I43_STEPS.map((s, k) => (
              <div key={s} className="i43-row flex items-center gap-6" style={{ height: I43_ROW, opacity: k === 0 ? 1 : 0.3 }}>
                <span className="relative grid h-[34px] w-[34px] place-items-center">
                  <span className="i43-spin absolute inset-0 rounded-full border-[3px] border-white/15 border-t-[#ffd59a]" style={{ visibility: k === 0 ? "visible" : "hidden" }} />
                  <span className="i43-check absolute inset-0 grid place-items-center rounded-full bg-[#ffd59a]" style={{ visibility: "hidden", opacity: 0 }}>
                    <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" aria-hidden>
                      <path className="i43-tick" d="M4 10.5 L8.5 15 L16 6" fill="none" stroke="#1a1209" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" strokeDashoffset="24" />
                    </svg>
                  </span>
                </span>
                <span className="text-[clamp(30px,3.2vw,48px)] leading-none tracking-[-0.01em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
                  {s}
                </span>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-[#100d09] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-[#100d09] to-transparent" />
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── I44 · Dot wave ───────────────────────── */
const I44_P: PageP = { brand: "Paloma Bakehouse", links: ["Breads", "Cakes", "Order"], kicker: "Sourdough · baked at 5 am", title: ["Warm bread,", "every morning"], price: "Loaf · ₹ 320", i: 1, acc: "#ff9f8a", font: F.is, weight: 400 };
function I44() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const cover = one(el, ".i44-cover");
    const inner = one(el, ".i44-inner");
    const page = one(el, ".i44-page");
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(cover, { autoAlpha: 0, scale: 1 });
    tl.set(inner, { y: 24, opacity: 0 });
    tl.to(cover, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
    tl.to(inner, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "<0.05");
    count(tl, all(el, ".i44-n"), 2.2, "<");
    hold(tl, 0.1);
    tl.to(inner, { y: -24, opacity: 0, duration: 0.35, ease: "power2.in" });
    tl.to(cover, { autoAlpha: 0, scale: 1.06, duration: 0.55, ease: "power2.inOut" }, "<0.15");
    tl.fromTo(page, { scale: 0.96, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" }, "<");
    hold(tl, 0.25);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,159,138,.55)" g2="rgba(255,213,154,.22)">
      <Page p={I44_P} c="i44-page" />
      <div className="i44-cover b17g3-hide absolute inset-0 z-10 flex items-center justify-center bg-[#140b09]">
        <div className="i44-inner flex flex-col items-center">
          <p className="text-[clamp(56px,6.4vw,104px)] leading-none" style={{ fontFamily: F.is }}>
            Paloma Bakehouse
          </p>
          <div className="mt-10 flex h-[60px] items-end gap-4">
            {[0, 1, 2].map((k) => (
              <span key={k} className="i44-d block h-[22px] w-[22px] rounded-full bg-[#ff9f8a]" />
            ))}
          </div>
          <Cap className="mt-6">
            Proofing the dough · <span className="i44-n tabular-nums text-white">100</span>
          </Cap>
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── I45 · Balancing ball ───────────────────────── */
const I45_P: PageP = { brand: "Equilibre Yoga", links: ["Classes", "Teachers", "Retreats"], kicker: "Morning flow · 60 min", title: ["Find your", "centre again"], price: "10 classes · ₹ 4,500", i: 2, acc: "#b8f0d0", font: F.fr };
function I45() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const cover = one(el, ".i45-cover");
    const rig = one(el, ".i45-rig");
    const page = one(el, ".i45-page");
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(cover, { autoAlpha: 0, xPercent: 0 });
    tl.set(rig, { scale: 0.8, opacity: 0 });
    tl.to(cover, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
    tl.to(rig, { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }, "<0.05");
    count(tl, all(el, ".i45-n"), 2.4, "<");
    hold(tl, 0.1);
    tl.to(cover, { xPercent: -100, duration: 0.75, ease: "power3.inOut" });
    tl.fromTo(page, { x: 60, opacity: 0.4 }, { x: 0, opacity: 1, duration: 0.75, ease: "power2.out" }, "<0.1");
    hold(tl, 0.25);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(184,240,208,.55)" g2="rgba(160,170,255,.22)">
      <Page p={I45_P} c="i45-page" />
      <div className="i45-cover b17g3-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#08120e]">
        <p className="text-[clamp(44px,5vw,80px)] leading-none tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Equilibre Yoga
        </p>
        <div className="i45-rig relative mt-14 flex w-[min(46%,520px)] flex-col items-center">
          <div className="i45-bar relative h-[60px] w-full">
            <span className="i45-ball absolute top-0 block h-[44px] w-[44px] rounded-full" style={{ background: "radial-gradient(circle at 35% 30%,#ffffff,#b8f0d0 45%,#3f8a68)" }}>
              <span className="absolute left-1/2 top-[6px] h-[10px] w-[3px] -ml-[1.5px] rounded-full bg-[#1d4a37]/60" />
            </span>
            <span className="absolute bottom-[4px] left-0 right-0 block h-[12px] rounded-full bg-[#e9f7ef]" />
          </div>
          <span className="mt-[-4px] block h-0 w-0 border-x-[22px] border-b-[34px] border-x-transparent border-b-[#b8f0d0]/70" />
        </div>
        <Cap className="mt-10">
          Finding balance · <span className="i45-n tabular-nums text-white">100</span>
        </Cap>
      </div>
    </Stage>
  );
}

/* ───────────────────────── I46 · Bouncing block in track ───────────────────────── */
const I46_P: PageP = { brand: "Fieldnote Audio", links: ["Speakers", "Headphones", "Support"], kicker: "Wireless headphones", title: ["Quiet, until", "you press play"], price: "₹ 18,900", i: 0, acc: "#ffd36b", font: F.sg, weight: 600 };
function I46() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const cover = one(el, ".i46-cover");
    const track = one(el, ".i46-track");
    const page = one(el, ".i46-page");
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(cover, { autoAlpha: 0, scaleY: 1, transformOrigin: "50% 0%" });
    tl.set(track, { scaleX: 0.3, opacity: 0 });
    tl.to(cover, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
    tl.to(track, { scaleX: 1, opacity: 1, duration: 0.5, ease: "power3.out" }, "<0.05");
    tl.to({}, { duration: 2.2 });
    hold(tl, 0.1);
    tl.to(track, { scaleX: 0.3, opacity: 0, duration: 0.3, ease: "power2.in" });
    tl.to(cover, { scaleY: 0, duration: 0.65, ease: "power3.inOut" }, "<0.1");
    tl.fromTo(page, { y: 30, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.65, ease: "power2.out" }, "<0.1");
    hold(tl, 0.25);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,211,107,.55)" g2="rgba(130,170,255,.22)">
      <Page p={I46_P} c="i46-page" />
      <div className="i46-cover b17g3-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0e0d0a]">
        <p className="text-[clamp(44px,5vw,80px)] font-[600] leading-none tracking-[-0.03em]" style={{ fontFamily: F.sg }}>
          Fieldnote Audio
        </p>
        <div className="i46-track relative mt-12 h-[14px] w-[min(44%,480px)] overflow-hidden rounded-full border border-white/15 bg-white/[0.06]">
          <span className="i46-blk absolute top-[2px] block h-[8px] w-[25%] rounded-full bg-[#ffd36b]" style={{ boxShadow: "0 0 16px rgba(255,211,107,.7)" }} />
        </div>
        <Cap className="mt-6">Tuning the drivers</Cap>
      </div>
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "I38", name: "Radar sweep", how: "A sweep line turns over a radar circle, briefly lighting each dot it passes, while a counter runs; then the radar zooms away and the page shows.", kind: "play", C: I38 },
  { code: "I39", name: "Signal arc over logos", how: "A glowing signal arc travels back and forth over a row of partner marks, lifting each mark as it passes, while a bar fills; then the cover lifts.", kind: "play", C: I39 },
  { code: "I40", name: "Bracket squeeze", how: "Two blocks either side of the brand word squeeze and stretch toward it in turn like animated brackets; then the cover pinches shut onto the page.", kind: "play", C: I40 },
  { code: "I41", name: "Dropping i-dot", how: "The dot of the i in the brand word bounces above its stem, which squashes on every landing; then the cover drops away.", kind: "play", C: I41 },
  { code: "I42", name: "Ice melt gate", how: "A sheet of ice wipes down as a counter hits zero, a pointer traces a circle on it and the circle melts a way in to the page (WebGL).", kind: "play", C: I42 },
  { code: "I43", name: "Checklist loader", how: "A list of loading steps scrolls up one step at a time; each step spins, then gets a drawn check; after the last one the site reveals.", kind: "play", C: I43 },
  { code: "I44", name: "Dot wave", how: "Three dots rise and fall in a staggered wave under the brand name; then the cover fades and the page settles in.", kind: "play", C: I44 },
  { code: "I45", name: "Balancing ball", how: "A ball rolls along a bar that tilts back and forth like a see-saw on its pivot; then the cover slides off to the side.", kind: "play", C: I45 },
  { code: "I46", name: "Bouncing block in track", how: "A short block bounces back and forth inside a progress track (indeterminate, stretching mid-run); then the cover folds up.", kind: "play", C: I46 },
];
