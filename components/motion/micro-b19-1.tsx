"use client";

// Micro-interactions, batch 19 · group 1 (MOTION-MENU U226–U237). Small focused demos for /lab/motion.
// Hover / click demos also play by themselves: a visible fake pointer (ring) walks or sweeps over the targets, resting ≤ 0.5 s
// per target, and fake "clicks" fire on a timer. The real mouse takes over for 2.5 s whenever it moves inside the stage.
// A CSS-only glow loop never stops (and sits on top again, screen-blended) so covered stages never freeze.
// ?static=1 / reduced motion: no JS, the markup shows a sensible final state.
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import type { Flip as FlipT } from "gsap/Flip";
import { gsap, loadPlugin, prefersReducedMotion } from "@/lib/gsap";
import { scene, useTicker } from "@/components/fx/shared";
import type { MotionDef } from "./types";

const F = {
  sg: "Space Grotesk Variable",
  fr: "Fraunces Variable",
  is: "Instrument Serif",
  sy: "Syne Variable",
  mr: "Manrope Variable",
};

const EZ = "cubic-bezier(.2,.7,.2,1)";

/* ---------- generated art (module level, pure strings) ---------- */

const svgUri = (s: string) => `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}")`;

// U231: displacement map — red ramps along x, green along y, neutral (128,128) soft centre, so only the edges refract.
const U231_W = 420;
const U231_H = 270;
const U231_MAP = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${U231_W}" height="${U231_H}"><defs><linearGradient id="r" x1="0" x2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0f0"/></linearGradient><filter id="b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="9"/></filter></defs><rect width="100%" height="100%" fill="url(#r)"/><rect width="100%" height="100%" fill="url(#g)" style="mix-blend-mode:screen"/><rect x="36" y="36" width="${U231_W - 72}" height="${U231_H - 72}" rx="28" fill="#808000" filter="url(#b)"/></svg>`,
)}`;

// U232: ordered-dither (4×4 Bayer) sweep frames, 24×8 chunky pixels; frame 0 empty, frame K full.
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const U232_K = 12;
const U232_FRAMES = Array.from({ length: U232_K + 1 }, (_, k) => {
  const cols = 24;
  const rows = 8;
  let r = "";
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const thr = (BAYER[y % 4][x % 4] + 0.5) / 16;
      const v = (k / U232_K) * 1.6 - (x / (cols - 1)) * 0.6;
      if (thr < v) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`;
    }
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${cols}" height="${rows}" viewBox="0 0 ${cols} ${rows}" preserveAspectRatio="none" shape-rendering="crispEdges"><g fill="#000">${r}</g></svg>`);
});

// U234: brush-stroke sprite sheet (12 frames side by side); each frame adds one painted stroke, the last is full.
const U234_N = 12;
const U234_SPRITE = (() => {
  let g = "";
  for (let k = 0; k < U234_N; k++) {
    let s = "";
    for (let j = 0; j < Math.min(k, U234_N - 1); j++) {
      const x = j * 10 - 4;
      s += `<path d="M${x} 32 C ${x + 4} 22, ${x + 1} 14, ${x + 7} 6 S ${x + 12} -2, ${x + 14} -6" stroke="#000" stroke-width="13" stroke-linecap="round" fill="none"/>`;
      s += `<circle cx="${x + 13}" cy="${(j * 7) % 22 + 2}" r="1.6"/>`;
    }
    if (k === U234_N - 1) s += `<rect width="100" height="26"/>`;
    g += `<g transform="translate(${k * 100} 0)"><g clip-path="url(#c)">${s}</g></g>`;
  }
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${U234_N * 100}" height="26" viewBox="0 0 ${U234_N * 100} 26" preserveAspectRatio="none"><defs><clipPath id="c"><rect width="100" height="26"/></clipPath></defs><g fill="#000">${g}</g></svg>`,
  );
})();

// U235: coin-spin sprite sheet (16 frames of 200×200) + its strip.
const U235_N = 16;
const U235_SHEET = (() => {
  let g = "";
  for (let k = 0; k < U235_N; k++) {
    const a = (k / U235_N) * Math.PI * 2;
    const c = Math.cos(a);
    const w = Math.max(5, Math.abs(c) * 70);
    const front = c >= 0;
    const edge = Math.sin(a) * 9;
    const sx = (w / 70).toFixed(3);
    g += `<g transform="translate(${k * 200 + 100} 100)">`;
    g += `<ellipse cx="${edge.toFixed(1)}" cy="0" rx="${w.toFixed(1)}" ry="70" fill="#7a4d12"/>`;
    g += `<ellipse cx="0" cy="0" rx="${w.toFixed(1)}" ry="70" fill="url(#${front ? "f" : "b"})"/>`;
    g += `<ellipse cx="0" cy="0" rx="${(w * 0.8).toFixed(1)}" ry="56" fill="none" stroke="#fff3c4" stroke-opacity=".55" stroke-width="3"/>`;
    g += `<text x="0" y="22" transform="scale(${sx} 1)" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="62" fill="#6b3f0a" fill-opacity=".85">${front ? "₹" : "10"}</text>`;
    g += `</g>`;
  }
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${U235_N * 200}" height="200" viewBox="0 0 ${U235_N * 200} 200"><defs><linearGradient id="f" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".45" stop-color="#f3c14b"/><stop offset="1" stop-color="#b47a1c"/></linearGradient><linearGradient id="b" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ffe69a"/><stop offset=".5" stop-color="#d9a238"/><stop offset="1" stop-color="#8c5a14"/></linearGradient></defs>${g}</svg>`,
  );
})();

// U236: small geometric marks for the fake logo wall (no real brands).
const U236_GLYPHS = [
  `<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="3" fill="currentColor"/>`,
  `<path d="M12 3l9 16H3z" fill="currentColor"/>`,
  `<path d="M3 9c3-3 6 3 9 0s6 3 9 0M3 15c3-3 6 3 9 0s6 3 9 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  `<rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="9" y="9" width="6" height="6" fill="currentColor"/>`,
  `<path d="M12 2l2.6 6.8L22 9.6l-5.6 4.7L18 22l-6-3.8L6 22l1.6-7.7L2 9.6l7.4-.8z" fill="currentColor"/>`,
  `<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z" fill="currentColor"/>`,
  `<path d="M12 2l8.7 5v10L12 22l-8.7-5V7z" fill="none" stroke="currentColor" stroke-width="2.4"/>`,
  `<circle cx="8" cy="12" r="5" fill="currentColor"/><circle cx="16" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.4"/>`,
  `<path d="M4 20V4h6a5 5 0 010 10H4" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="18" cy="18" r="2.6" fill="currentColor"/>`,
  `<path d="M3 12h18M12 3v18" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2.4"/>`,
  `<path d="M4 18l5-12 3 7 3-5 5 10z" fill="currentColor"/>`,
  `<path d="M12 4a8 8 0 100 16 6 6 0 010-16z" fill="currentColor"/>`,
];
const U236_NAMES = ["Halvor", "Quilla", "Norrin", "Tessel", "Ombrel", "Vireo", "Kalto", "Pemble", "Zurro", "Lumet", "Brivo", "Castrel", "Fenna", "Grael", "Ixel", "Morrow", "Ostra", "Pellin", "Rivka", "Sabel", "Tovra", "Wenlo", "Yarrow", "Elvet"];
const U236_TINT = ["#ffd166", "#7ce0c3", "#9f8cff", "#ff7a59", "#7fb4ff", "#f2f4ff"];
const u236Html = (i: number) =>
  `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" style="color:${U236_TINT[i % U236_TINT.length]}">${U236_GLYPHS[i % U236_GLYPHS.length]}</svg><span>${U236_NAMES[i % U236_NAMES.length]}</span>`;

const CSS = `
.b19g1-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b19g1-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b19g1-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b19g1-hide{visibility:hidden}
.b19g1-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;pointer-events:none;z-index:40;opacity:0;transition:opacity .25s}
.b19g1-dot>span{display:block;width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4)}

/* U226 cubes */
.u226-p,.u226-c{transform-style:preserve-3d}
.u226-f{position:absolute;inset:0;backface-visibility:hidden;border:1px solid rgba(255,255,255,.14);border-radius:10px}

/* U228 ken burns on the open image */
.u228-kb{animation:u228-kb 6s linear infinite alternate}
@keyframes u228-kb{to{transform:scale(1.12) translate3d(-2%,-1%,0)}}

/* U229 3D pin */
.u229-card{transition:transform .7s ${EZ},box-shadow .7s}
.u229-hit.on .u229-card{transform:rotateX(50deg) scale(.86);box-shadow:0 60px 80px rgba(0,0,0,.55)}
.u229-line{transform:scaleY(0);transform-origin:50% 100%;transition:transform .55s ${EZ}}
.u229-hit.on .u229-line{transform:scaleY(1);transition-delay:.12s}
.u229-lab{opacity:0;transform:translate(-50%,12px);transition:opacity .4s,transform .5s ${EZ}}
.u229-hit.on .u229-lab{opacity:1;transform:translate(-50%,0);transition-delay:.3s}
.u229-rings{opacity:0;transition:opacity .4s}
.u229-hit.on .u229-rings{opacity:1}
.u229-ring{position:absolute;left:-100px;top:-34px;width:200px;height:68px;border-radius:50%;border:2px solid #7fe7ff;animation:u229-ring 1.8s linear infinite}
@keyframes u229-ring{0%{transform:scale(.15);opacity:.95}100%{transform:scale(1.35);opacity:0}}

/* U232 dither nav */
.u232-fill{position:absolute;inset:0;mask-size:100% 100%;-webkit-mask-size:100% 100%;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat}

/* U233 focus brackets */
.u233-b{position:absolute;width:34px;height:34px;border:0 solid rgba(255,255,255,.75);filter:drop-shadow(0 0 6px rgba(127,231,255,.55));animation:u233-p .9s ease-in-out infinite alternate;transition:border-color .2s}
.u233-b.tl{left:-16px;top:-16px;border-left-width:3px;border-top-width:3px;--sx:-1;--sy:-1}
.u233-b.tr{right:-16px;top:-16px;border-right-width:3px;border-top-width:3px;--sx:1;--sy:-1}
.u233-b.bl{left:-16px;bottom:-16px;border-left-width:3px;border-bottom-width:3px;--sx:-1;--sy:1}
.u233-b.br{right:-16px;bottom:-16px;border-right-width:3px;border-bottom-width:3px;--sx:1;--sy:1}
@keyframes u233-p{0%{transform:translate(calc(var(--sx)*6px),calc(var(--sy)*6px))}100%{transform:translate(calc(var(--sx)*-1px),calc(var(--sy)*-1px))}}
.u233-k{transition:transform .3s ${EZ}}
.u233-k.on{transform:scale(1.03)}
.u233-k.on .u233-b{animation:none;transform:translate(calc(var(--sx)*-11px),calc(var(--sy)*-11px));border-color:#7fe7ff;transition:transform .16s ease-out,border-color .16s}
.u233-tag{opacity:0;transform:translateY(6px);transition:opacity .2s,transform .25s ${EZ}}
.u233-k.on .u233-tag{opacity:1;transform:none}

/* U234 sprite-mask wipe */
.u234-top{position:absolute;inset:0;mask-size:${U234_N * 100}% 100%;-webkit-mask-size:${U234_N * 100}% 100%;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;mask-position:0% 0;-webkit-mask-position:0% 0}
.u234-b.on .u234-top{animation:u234-in .6s steps(${U234_N},jump-none) forwards}
.u234-b.out .u234-top{animation:u234-out .55s steps(${U234_N},jump-none) forwards}
@keyframes u234-in{from{mask-position:0% 0;-webkit-mask-position:0% 0}to{mask-position:100% 0;-webkit-mask-position:100% 0}}
@keyframes u234-out{from{mask-position:100% 0;-webkit-mask-position:100% 0}to{mask-position:0% 0;-webkit-mask-position:0% 0}}

/* U235 sprite-sheet coin */
.u235-coin{width:200px;height:200px;background-size:${U235_N * 200}px 200px;background-repeat:no-repeat;background-position:0 0}
.u235-run .u235-coin{animation:u235-spin 1.12s steps(${U235_N}) infinite}
@keyframes u235-spin{to{background-position:-${U235_N * 200}px 0}}
.u235-strip{width:${U235_N * 48}px;height:48px;background-size:${U235_N * 48}px 48px;background-repeat:no-repeat}
.u235-mark{width:48px;height:48px}
.u235-run .u235-mark{animation:u235-mark 1.12s steps(${U235_N}) infinite}
@keyframes u235-mark{to{transform:translateX(${U235_N * 48}px)}}
.u235-run .u235-shadow{animation:u235-sh .56s ease-in-out infinite alternate}
@keyframes u235-sh{to{transform:scaleX(.55);opacity:.35}}

/* U236 tiles */
.u236-t{transform-style:preserve-3d}
.u236-i{display:flex;align-items:center;justify-content:center;gap:10px;height:100%;backface-visibility:hidden}
.u236-i span{font-family:"${F.sg}";font-weight:600;font-size:18px;letter-spacing:-.01em;color:rgba(242,244,255,.88)}

/* U237 glitch */
.u237-scan{background:repeating-linear-gradient(0deg,rgba(0,0,0,.45) 0 2px,transparent 2px 4px)}

html.is-static .b19g1-glow,html.is-static .u228-kb,html.is-static .u229-ring,html.is-static .u233-b,html.is-static .u235-coin,html.is-static .u235-mark,html.is-static .u235-shadow{animation:none}
@media (prefers-reduced-motion: reduce){
  .b19g1-glow,.u228-kb,.u229-ring,.u233-b,.u235-coin,.u235-mark,.u235-shadow,.u234-top{animation:none!important}
  .u229-card,.u229-line,.u229-lab,.u229-rings,.u233-k,.u233-b,.u233-tag{transition:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop, again on top (screen blend) so covered stages never freeze. */
function Stage({ r, children, g1, g2, onClick }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string; onClick?: () => void }) {
  return (
    <div ref={r} onClick={onClick} className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff]">
      <style href="b19g1-css" precedence="default">
        {CSS}
      </style>
      <div className="b19g1-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      <div className="b19g1-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: 0.45, zIndex: 35 } as CSSProperties} aria-hidden />
    </div>
  );
}

/** The visible fake pointer (a ring). */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => (
  <div ref={r} className="b19g1-dot" aria-hidden>
    <span />
  </div>
);

type Pt = { x: number; y: number; inside: boolean };
type Box = { l: number; t: number; w: number; h: number };

function rel(node: Element, root: Element): Box {
  const a = node.getBoundingClientRect();
  const r = root.getBoundingClientRect();
  return { l: a.left - r.left, t: a.top - r.top, w: a.width, h: a.height };
}
const inBox = (b: Box, x: number, y: number, pad = 0) => x >= b.l - pad && x <= b.l + b.w + pad && y >= b.t - pad && y <= b.t + b.h + pad;
const mid = (b: Box): [number, number] => [b.l + b.w / 2, b.t + b.h / 2];
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const all = (root: Element, sel: string) => [...root.querySelectorAll<HTMLElement>(sel)];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (a: number, b: number, v: number) => Math.min(b, Math.max(a, v));

/** Pointer driver: the real mouse wins for 2.5 s after it last moved; otherwise `script` moves a visible fake ring. */
function usePointer(
  root: RefObject<HTMLDivElement | null>,
  dot: RefObject<HTMLDivElement | null>,
  script: (t: number, el: HTMLDivElement) => Pt,
  frame: (p: Pt, el: HTMLDivElement, fake: boolean, dt: number) => void,
) {
  const real = useRef({ x: 0, y: 0, inside: false, at: -1e9 });
  const sc = useRef(script);
  sc.current = script;
  const fr = useRef(frame);
  fr.current = frame;
  const t0 = useRef(-1);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      real.current = { x: e.clientX - r.left, y: e.clientY - r.top, inside: true, at: performance.now() };
    };
    const leave = () => (real.current = { ...real.current, inside: false, at: performance.now() });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [root]);
  useTicker(root, (t, dt) => {
    const el = root.current;
    if (!el) return;
    if (t0.current < 0) t0.current = t;
    const R = real.current;
    const useReal = performance.now() - R.at < 2500;
    const p = useReal ? { x: R.x, y: R.y, inside: R.inside } : sc.current(t - t0.current, el);
    const dn = dot.current;
    if (dn) {
      dn.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0)`;
      dn.style.opacity = useReal ? "0" : "1";
    }
    fr.current(p, el, !useReal, Math.min(dt, 0.05));
  });
}

/** A path that holds at each point and glides to the next during the last `move` part of every `seg` seconds. */
function stepPath(t: number, pts: [number, number][], seg: number, move = 0.5): [number, number] {
  const n = pts.length;
  const k = Math.floor(t / seg);
  const f = t / seg - k;
  const a = pts[k % n];
  const b = pts[(k + 1) % n];
  const m = f < 1 - move ? 0 : easeIO((f - (1 - move)) / move);
  return [a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m];
}

/** "play" helper: waits for fonts, builds a looping animation in a gsap.context, plays it only on screen. */
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
      gsap.killTweensOf(root.querySelectorAll("*"));
    };
  }, [ref]);
}

/** Real-mouse tracker for scripted demos: idle() is false for 2.5 s after the real pointer moved in the stage. */
function useIdle(root: RefObject<HTMLElement | null>) {
  const at = useRef(-1e9);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mv = () => (at.current = performance.now());
    el.addEventListener("pointermove", mv);
    el.addEventListener("pointerdown", mv);
    return () => {
      el.removeEventListener("pointermove", mv);
      el.removeEventListener("pointerdown", mv);
    };
  }, [root]);
  return () => performance.now() - at.current > 2500;
}

/** Glide the fake ring (gsap x/y) to the centre of `target` (or a point), measured now. */
function goDot(dot: HTMLElement | null, root: HTMLElement, target: Element | [number, number] | null, dur = 0.45, idle = true) {
  if (!dot || !target) return;
  dot.style.opacity = idle ? "1" : "0";
  const [x, y] = Array.isArray(target) ? target : mid(rel(target, root));
  gsap.to(dot, { x, y, duration: dur, ease: "power2.inOut", overwrite: "auto" });
}

/** A short press pulse on the fake ring (a visible "click"). */
function press(dot: HTMLElement | null) {
  const s = dot?.firstElementChild;
  if (s) gsap.fromTo(s, { scale: 0.55 }, { scale: 1, duration: 0.35, ease: "power2.out", overwrite: true });
}

// eslint-disable-next-line @next/next/no-img-element
const Img = ({ i, className = "", w = 700, h = 900 }: { i: number; className?: string; w?: number; h?: number }) => (
  <img src={scene(i, w, h)} alt="" className={`block h-full w-full object-cover ${className}`} draggable={false} />
);

const Eyebrow = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={`text-[13px] uppercase tracking-[0.22em] text-white/55 ${className}`} style={{ fontFamily: F.sg }}>
    {children}
  </p>
);

/* ───────────────────────── U226 · Cube grid hover + explode ───────────────────────── */
const U226_N = 15;
const U226_S = 92;
const U226_FACES: [string, string][] = [
  ["front", `translateZ(${U226_S / 2}px)`],
  ["back", `rotateY(180deg) translateZ(${U226_S / 2}px)`],
  ["right", `rotateY(90deg) translateZ(${U226_S / 2}px)`],
  ["left", `rotateY(-90deg) translateZ(${U226_S / 2}px)`],
  ["top", `rotateX(90deg) translateZ(${U226_S / 2}px)`],
  ["bottom", `rotateX(-90deg) translateZ(${U226_S / 2}px)`],
];
const U226_TONES = ["#2a1f4a", "#1d2c4f", "#3a1f2e", "#1f3a33"];
function U226() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const rot = useRef(Array.from({ length: U226_N }, () => ({ x: 0, y: 0 })));
  const isOpen = useRef(false);
  const idle = useIdle(root);
  const explode = () => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    isOpen.current = true;
    all(el, ".u226-p").forEach((p) =>
      gsap.to(p, { x: rnd(-1100, 1100), y: rnd(-700, 700), z: rnd(-1400, 300), rotationZ: rnd(-160, 160), duration: rnd(0.7, 1), ease: "power2.in", overwrite: true }),
    );
    gsap.fromTo(el.querySelector(".u226-lv"), { autoAlpha: 0, scale: 0.86, y: 24 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, delay: 0.35, ease: "power3.out", overwrite: true });
  };
  const gather = () => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    isOpen.current = false;
    all(el, ".u226-p").forEach((p) => gsap.to(p, { x: 0, y: 0, z: 0, rotationZ: 0, duration: rnd(0.6, 0.9), delay: rnd(0, 0.15), ease: "power3.out", overwrite: true }));
    gsap.to(el.querySelector(".u226-lv"), { autoAlpha: 0, scale: 0.92, duration: 0.35, ease: "power2.in", overwrite: true });
  };
  usePointer(
    root,
    dot,
    (t, el) => ({ x: el.clientWidth * (0.5 + 0.34 * Math.sin(t * 0.8)), y: el.clientHeight * (0.52 + 0.3 * Math.sin(t * 1.6)), inside: true }),
    (p, el) => {
      const ps = all(el, ".u226-p");
      const cs = all(el, ".u226-c");
      const boxes = ps.map((n) => mid(rel(n, el)));
      const R = Math.hypot(el.clientWidth, el.clientHeight) * 0.42;
      cs.forEach((c, i) => {
        const r = rot.current[i];
        const [cx, cy] = boxes[i];
        const ty = p.inside ? clamp(-1, 1, (p.x - cx) / R) * 58 : 0;
        const tx = p.inside ? clamp(-1, 1, (p.y - cy) / R) * -48 : 0;
        r.x += (tx - r.x) * 0.1;
        r.y += (ty - r.y) * 0.1;
        c.style.transform = `rotateX(${r.x.toFixed(2)}deg) rotateY(${r.y.toFixed(2)}deg)`;
      });
    },
  );
  usePlay(root, (el) => {
    const tl = gsap.timeline({ repeat: -1 });
    tl.to({}, { duration: 1.5 });
    tl.call(() => {
      if (!root.current || !idle()) return;
      press(dot.current);
      explode();
    });
    tl.to({}, { duration: 1.4 });
    tl.call(() => {
      if (!root.current || !idle()) return;
      press(dot.current);
      gather();
    });
    tl.to({}, { duration: 1 });
    void el;
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(159,140,255,.55)" g2="rgba(255,122,89,.24)" onClick={() => (isOpen.current ? gather() : explode())}>
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Winter calendar · 15 doors</Eyebrow>
        <div className="mt-8 grid grid-cols-5 gap-[26px]" style={{ perspective: "1000px" }}>
          {Array.from({ length: U226_N }, (_, i) => (
            <div key={i} className="u226-p relative" style={{ width: U226_S, height: U226_S }}>
              <div className="u226-c absolute inset-0">
                {U226_FACES.map(([n, tf], k) => (
                  <div
                    key={n}
                    className="u226-f flex items-center justify-center"
                    style={{
                      transform: tf,
                      background: k === 0 ? `linear-gradient(145deg,#f2f4ff,#c9c3ff)` : `linear-gradient(145deg,${U226_TONES[(i + k) % 4]},#0d1020)`,
                    }}
                  >
                    {k === 0 && (
                      <span className="text-[30px] font-[700] text-[#1a1430]" style={{ fontFamily: F.sy }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="u226-lv b19g1-hide pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[min(460px,80%)] rounded-[26px] border border-white/15 bg-[#121628]/90 px-10 py-9 text-center shadow-[0_40px_80px_rgba(0,0,0,.5)]">
          <Eyebrow>Door 07 opened</Eyebrow>
          <h3 className="mt-3 text-[clamp(32px,3.2vw,50px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Saffron gift box
          </h3>
          <p className="mt-4 text-[20px] text-[#c9c3ff]" style={{ fontFamily: F.sg }}>
            ₹1,450 · today only
          </p>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U227 · Make-way grid expand ───────────────────────── */
const U227_T = [
  ["Linen shirt", "₹2,190"],
  ["Rope sandal", "₹1,690"],
  ["Clay mug", "₹640"],
  ["Cane tray", "₹1,250"],
  ["Silk scarf", "₹2,800"],
  ["Brass lamp", "₹4,900"],
  ["Wool throw", "₹3,450"],
  ["Tea tin", "₹520"],
  ["Jute bag", "₹990"],
  ["Stone bowl", "₹1,120"],
  ["Cotton robe", "₹3,200"],
  ["Ink journal", "₹780"],
];
const U227_SEQ = [5, 0, 10, 7, 2, 9];
function U227() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cur = useRef(-1);
  const idle = useIdle(root);
  const centre = (t: HTMLElement): [number, number] => [t.offsetLeft + t.offsetWidth / 2, t.offsetTop + t.offsetHeight / 2];
  const open = (i: number) => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    cur.current = i;
    const tiles = all(el, ".u227-t");
    const [ax, ay] = centre(tiles[i]);
    tiles.forEach((t, j) => {
      const cap = t.querySelector(".u227-cap");
      if (j === i) {
        gsap.set(t, { zIndex: 5 });
        gsap.to(t, { scale: 1.75, duration: 0.7, ease: "power3.out", overwrite: "auto" });
        gsap.fromTo(t, { skewX: 9 }, { skewX: 0, duration: 0.7, ease: "back.out(2)" });
        gsap.to(cap, { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.25, ease: "power2.out", overwrite: true });
        return;
      }
      const [bx, by] = centre(t);
      const dx = bx - ax;
      const dy = by - ay;
      const d = Math.hypot(dx, dy) || 1;
      const push = 150 * clamp(0.35, 1, 1 - d / 900);
      gsap.set(t, { zIndex: 1 });
      gsap.to(t, { x: (dx / d) * push, y: (dy / d) * push * 0.72, rotation: rnd(-7, 7), scale: 0.94, skewX: 0, duration: 0.7, ease: "power3.out", overwrite: "auto" });
      gsap.to(cap, { autoAlpha: 0, duration: 0.2, overwrite: true });
    });
  };
  const close = () => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    cur.current = -1;
    all(el, ".u227-t").forEach((t) => {
      gsap.to(t, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        skewX: 0,
        duration: 0.6,
        ease: "power3.inOut",
        overwrite: "auto",
        onComplete: () => {
          if (!root.current) return;
          gsap.set(t, { zIndex: 1 });
        },
      });
      gsap.to(t.querySelector(".u227-cap"), { autoAlpha: 0, y: 8, duration: 0.25, overwrite: true });
    });
  };
  usePlay(root, (el) => {
    const d = dot.current;
    const tl = gsap.timeline({ repeat: -1 });
    U227_SEQ.forEach((i) => {
      tl.call(() => {
        if (!root.current) return;
        goDot(d, el, all(el, ".u227-t")[i], 0.4, idle());
      });
      tl.to({}, { duration: 0.4 });
      tl.call(() => {
        if (!root.current || !idle()) return;
        press(d);
        open(i);
      });
      tl.to({}, { duration: 0.75 });
      tl.call(() => {
        if (!root.current) return;
        const [x, y] = centre(all(el, ".u227-t")[i]);
        const g = el.querySelector<HTMLElement>(".u227-g")!;
        goDot(d, el, [g.offsetLeft + x + 90, g.offsetTop + y + 60], 0.4, idle());
      });
      tl.to({}, { duration: 0.25 });
      tl.call(() => {
        if (!root.current || !idle()) return;
        press(d);
        close();
      });
      tl.to({}, { duration: 0.65 });
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,209,102,.52)" g2="rgba(127,180,255,.24)">
      <div className="flex h-full w-full items-center justify-center">
        <div className="u227-g relative grid grid-cols-4 gap-[20px]">
          {U227_T.map(([n, p], i) => (
            <button
              key={n}
              type="button"
              onClick={() => (cur.current === i ? close() : open(i))}
              className="u227-t relative h-[130px] w-[190px] overflow-hidden rounded-[16px] border border-white/12 bg-[#121725] text-left shadow-[0_18px_40px_rgba(0,0,0,.4)]"
            >
              <Img i={i} w={380} h={260} />
              <span className="u227-cap b19g1-hide absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-6">
                <span className="text-[13px] font-[600]" style={{ fontFamily: F.sg }}>
                  {n}
                </span>
                <span className="text-[12px] text-white/75" style={{ fontFamily: F.mr }}>
                  {p}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U228 · Grid rows skew with mouse ───────────────────────── */
const U228_ROWS = 3;
const U228_COLS = 5;
function U228() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const flip = useRef<typeof FlipT | null>(null);
  const st = useRef(Array.from({ length: U228_ROWS }, () => ({ sk: 0, sc: 1, x: 0, sh: 0.5 })));
  const pos = useRef({ x: -1, y: -1 });
  const aim = useRef(false);
  const full = useRef(false);
  const idle = useIdle(root);
  useEffect(() => {
    let dead = false;
    loadPlugin("Flip").then((f) => {
      if (!dead) flip.current = f as typeof FlipT;
    });
    return () => {
      dead = true;
    };
  }, []);
  const openFull = () => {
    const el = root.current;
    const Fl = flip.current;
    if (!el || !Fl || full.current || prefersReducedMotion()) return;
    const m = el.querySelector<HTMLElement>(".u228-mid")!;
    const fu = el.querySelector<HTMLElement>(".u228-full")!;
    full.current = true;
    Fl.fit(fu, m, { scale: true });
    gsap.set(fu, { autoAlpha: 1 });
    gsap.set(m, { opacity: 0 });
    gsap.to(fu, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, skewX: 0, skewY: 0, duration: 0.8, ease: "power3.inOut", overwrite: true });
    gsap.fromTo(fu.querySelector(".u228-txt"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.45, ease: "power2.out", overwrite: true });
  };
  const closeFull = () => {
    const el = root.current;
    const Fl = flip.current;
    if (!el || !Fl || !full.current) return;
    const m = el.querySelector<HTMLElement>(".u228-mid")!;
    const fu = el.querySelector<HTMLElement>(".u228-full")!;
    gsap.to(fu.querySelector(".u228-txt"), { autoAlpha: 0, duration: 0.2, overwrite: true });
    Fl.fit(fu, m, {
      scale: true,
      duration: 0.7,
      ease: "power3.inOut",
      onComplete: () => {
        if (!root.current) return;
        gsap.set(fu, { autoAlpha: 0 });
        gsap.set(m, { opacity: 1 });
        full.current = false;
      },
    });
  };
  usePointer(
    root,
    dot,
    (t, el) => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      let tx = W * (0.5 + 0.38 * Math.sin(t * 0.9));
      let ty = H * (0.5 + 0.32 * Math.sin(t * 1.8));
      if (aim.current) [tx, ty] = mid(rel(el.querySelector(".u228-mid")!, el));
      const P = pos.current;
      if (P.x < 0) Object.assign(P, { x: tx, y: ty });
      P.x += (tx - P.x) * 0.08;
      P.y += (ty - P.y) * 0.08;
      return { x: P.x, y: P.y, inside: true };
    },
    (p, el) => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const rows = all(el, ".u228-r");
      const flat = full.current || aim.current;
      rows.forEach((r, i) => {
        const s = st.current[i];
        const cy = r.offsetTop + r.offsetHeight / 2 + (r.offsetParent as HTMLElement).offsetTop;
        const d = clamp(0, 1, Math.abs(p.y - cy) / (H * 0.55));
        const f = p.inside && !flat ? 1 - d * d : 0;
        const nx = p.x / W - 0.5;
        s.sk += (-nx * 22 * f - s.sk) * 0.1;
        s.sc += (1 + 0.08 * f - s.sc) * 0.1;
        s.x += (nx * 60 * f - s.x) * 0.1;
        s.sh += ((flat ? 0 : 0.55 * (1 - f)) - s.sh) * 0.1;
        r.style.transform = `translate3d(${s.x.toFixed(1)}px,0,0) skewX(${s.sk.toFixed(2)}deg) scale(${s.sc.toFixed(3)})`;
        const sh = r.querySelector<HTMLElement>(".u228-sh");
        if (sh) sh.style.opacity = s.sh.toFixed(3);
      });
    },
  );
  usePlay(root, () => {
    const tl = gsap.timeline({ repeat: -1 });
    tl.to({}, { duration: 1.8 });
    tl.call(() => {
      if (!root.current || !idle()) return;
      aim.current = true;
    });
    tl.to({}, { duration: 0.6 });
    tl.call(() => {
      if (!root.current || !idle()) return;
      press(dot.current);
      openFull();
    });
    tl.to({}, { duration: 1.1 });
    tl.call(() => {
      if (!root.current) return;
      press(dot.current);
      closeFull();
    });
    tl.to({}, { duration: 0.75 });
    tl.call(() => {
      if (!root.current) return;
      aim.current = false;
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(127,180,255,.55)" g2="rgba(255,122,89,.22)">
      <div className="flex h-full w-full items-center justify-center">
        <div className="relative flex flex-col gap-[16px]">
          {Array.from({ length: U228_ROWS }, (_, r) => (
            <div key={r} className="u228-r relative flex gap-[16px] will-change-transform">
              {Array.from({ length: U228_COLS }, (_, c) => {
                const m = r === 1 && c === 2;
                return (
                  <div
                    key={c}
                    onClick={m ? openFull : undefined}
                    className={`${m ? "u228-mid cursor-pointer" : ""} relative h-[128px] w-[206px] overflow-hidden rounded-[14px] border border-white/10`}
                  >
                    <Img i={r * U228_COLS + c} w={412} h={256} />
                  </div>
                );
              })}
              <div className="u228-sh pointer-events-none absolute inset-0 bg-[#05070d]" style={{ opacity: 0.25 }} />
            </div>
          ))}
        </div>
      </div>
      <div className="u228-full b19g1-hide absolute inset-0 z-20 cursor-pointer overflow-hidden" onClick={closeFull}>
        <div className="u228-kb absolute inset-0">
          <Img i={U228_COLS + 2} w={1400} h={800} />
        </div>
        <div className="u228-txt absolute bottom-10 left-12">
          <Eyebrow className="text-white/75">Lookbook · chapter 03</Eyebrow>
          <h3 className="mt-2 text-[clamp(44px,5vw,84px)] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            The winter edit
          </h3>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U229 · 3D pin with radar rings ───────────────────────── */
function U229() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  usePointer(
    root,
    dot,
    (t, el) => {
      const c = el.querySelector(".u229-card");
      const [x, y] = c ? mid(rel(c, el)) : [el.clientWidth / 2, el.clientHeight / 2];
      const W = el.clientWidth;
      const H = el.clientHeight;
      const [px, py] = stepPath(
        t,
        [
          [x - 40, y + 10],
          [x + 70, y - 20],
          [W * 0.82, H * 0.78],
          [x + 20, y + 30],
          [W * 0.18, H * 0.28],
        ],
        1.0,
        0.5,
      );
      return { x: px, y: py, inside: true };
    },
    (p, el) => {
      const hit = el.querySelector<HTMLElement>(".u229-hit");
      const card = el.querySelector(".u229-base");
      if (hit && card) hit.classList.toggle("on", p.inside && inBox(rel(card, el), p.x, p.y, 10));
    },
  );
  return (
    <Stage r={root} g1="rgba(127,231,255,.52)" g2="rgba(159,140,255,.24)">
      <div className="flex h-full w-full items-center justify-center pt-16">
        <div className="u229-hit relative" style={{ perspective: "1100px" }}>
          <div className="u229-base h-[260px] w-[400px]">
            <div className="u229-card relative h-full w-full overflow-hidden rounded-[24px] border border-white/15 bg-[#10162a] shadow-[0_30px_60px_rgba(0,0,0,.45)]">
              <div className="absolute inset-0 opacity-80">
                <Img i={0} w={800} h={520} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d16] via-[#0a0d16]/40 to-transparent" />
              <div className="absolute bottom-6 left-7">
                <Eyebrow>Flagship studio</Eyebrow>
                <p className="mt-2 text-[30px] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
                  Visit the listening room
                </p>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
            <div className="u229-rings absolute left-0 top-0">
              {[0, 0.6, 1.2].map((d) => (
                <span key={d} className="u229-ring" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
            <div className="u229-line absolute bottom-0 left-[-1px] h-[190px] w-[2px] bg-gradient-to-t from-[#7fe7ff] via-[#9f8cff] to-transparent" />
            <div className="u229-lab absolute bottom-[196px] left-0 whitespace-nowrap rounded-full border border-white/20 bg-[#0d1224]/90 px-4 py-2 text-[14px] font-[600]" style={{ fontFamily: F.sg }}>
              Studio 07 · open till 9 pm
            </div>
          </div>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U230 · LED board text ───────────────────────── */
const U230_MSG = "   COLD BREW ₹199  ·  OAT LATTE ₹240  ·  OPEN TILL 2 AM  ·";
const U230_P = 11;
const U230_R = 21;
function U230() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const s = useRef({ h: 0, off: 0, grid: null as Uint8Array | null, gw: 1 });
  const draw = useRef<(now: number) => void>(() => {});
  draw.current = (now: number) => {
    const c = cv.current;
    const S = s.current;
    if (!c || !S.grid) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const cols = Math.floor(c.width / U230_P);
    const ox = (c.width - cols * U230_P) / 2 + U230_P / 2;
    const oy = (c.height - U230_R * U230_P) / 2 + U230_P / 2;
    const off = Math.floor(S.off);
    const tick = Math.floor(now / 90);
    ctx.clearRect(0, 0, c.width, c.height);
    const dim = new Path2D();
    const lit = new Path2D();
    const halo = new Path2D();
    for (let r = 0; r < U230_R; r++)
      for (let k = 0; k < cols; k++) {
        const x = ox + k * U230_P;
        const y = oy + r * U230_P;
        const g = (((k + off) % S.gw) + S.gw) % S.gw;
        let on = S.grid[r * S.gw + g] === 1;
        if (on && S.h > 0.05) {
          const hsh = Math.abs(Math.sin(k * 12.9898 + r * 78.233 + tick * 37.719) * 43758.5453) % 1;
          if (hsh > 1 - 0.3 * S.h) on = false;
        }
        const P = on ? lit : dim;
        P.moveTo(x + 3.6, y);
        P.arc(x, y, 3.6, 0, Math.PI * 2);
        if (on) {
          halo.moveTo(x + 5.6, y);
          halo.arc(x, y, 5.6, 0, Math.PI * 2);
        }
      }
    ctx.fillStyle = "rgba(255,255,255,.07)";
    ctx.fill(dim);
    ctx.fillStyle = "rgba(255,170,64,.16)";
    ctx.fill(halo);
    ctx.fillStyle = "#ffb347";
    ctx.fill(lit);
  };
  useEffect(() => {
    const b = board.current;
    const c = cv.current;
    if (!b || !c) return;
    let dead = false;
    const fit = () => {
      c.width = Math.round(b.clientWidth);
      c.height = Math.round(b.clientHeight);
      draw.current(performance.now());
    };
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    Promise.resolve(document.fonts?.ready).then(() => {
      if (dead) return;
      const m = document.createElement("canvas");
      const mx = m.getContext("2d", { willReadFrequently: true });
      if (!mx) return;
      const font = `700 18px "${F.sg}", sans-serif`;
      mx.font = font;
      const gw = Math.ceil(mx.measureText(U230_MSG).width) + 4;
      m.width = gw;
      m.height = U230_R;
      mx.font = font;
      mx.fillStyle = "#fff";
      mx.textBaseline = "middle";
      mx.fillText(U230_MSG, 0, U230_R / 2 + 1);
      const data = mx.getImageData(0, 0, gw, U230_R).data;
      const grid = new Uint8Array(gw * U230_R);
      for (let i = 0; i < grid.length; i++) grid[i] = data[i * 4 + 3] > 110 ? 1 : 0;
      s.current.grid = grid;
      s.current.gw = gw;
      s.current.off = 6;
      fit();
    });
    return () => {
      dead = true;
      ro.disconnect();
    };
  }, []);
  usePointer(
    root,
    dot,
    (t, el) => {
      const b = board.current;
      const W = el.clientWidth;
      const H = el.clientHeight;
      const bx = b ? rel(b, el) : { l: W * 0.1, t: H * 0.3, w: W * 0.8, h: H * 0.4 };
      const [x, y] = stepPath(
        t,
        [
          [bx.l + bx.w * 0.2, bx.t + bx.h * 0.45],
          [bx.l + bx.w * 0.5, bx.t + bx.h * 0.6],
          [bx.l + bx.w * 0.8, bx.t + bx.h * 0.4],
          [W * 0.84, H * 0.88],
        ],
        0.9,
        0.45,
      );
      return { x, y, inside: true };
    },
    (p, el, _fake, dt) => {
      const S = s.current;
      const b = board.current;
      const on = !!b && p.inside && inBox(rel(b, el), p.x, p.y);
      S.h += ((on ? 1 : 0) - S.h) * 0.12;
      S.off += dt * 22 * S.h;
      if (S.off > S.gw * 1000) S.off -= S.gw * 1000;
      draw.current(performance.now());
    },
  );
  return (
    <Stage r={root} g1="rgba(255,179,71,.52)" g2="rgba(127,180,255,.22)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Night café · hover the board</Eyebrow>
        <div ref={board} className="relative mt-7 h-[264px] w-[min(1100px,86%)] overflow-hidden rounded-[22px] border border-white/10 bg-[#07080d] shadow-[inset_0_0_60px_rgba(0,0,0,.8)]">
          <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-label="Cold brew ₹199, oat latte ₹240, open till 2 am" />
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U231 · Liquid glass refraction ───────────────────────── */
function U231Back() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ width: "100cqw", height: "100cqh" }}>
      <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(115deg,#151a33 0 3cqw,#1b2142 3cqw 6cqw)" }} />
      <div className="absolute left-[8cqw] top-[14cqh] h-[22cqw] w-[22cqw] rounded-full" style={{ background: "radial-gradient(circle at 35% 35%,#ffd166,#ff7a59 55%,transparent 72%)" }} />
      <div className="absolute right-[9cqw] top-[48cqh] h-[18cqw] w-[18cqw] rounded-full" style={{ background: "radial-gradient(circle at 40% 40%,#7fe7ff,#4f8dff 55%,transparent 72%)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[1.1cqw] uppercase tracking-[0.3em] text-white/70" style={{ fontFamily: F.sg }}>
          New season · rainwear
        </p>
        <p className="mt-[1cqh] text-[10.5cqw] leading-[0.9] tracking-[-0.03em] text-[#f2f4ff]" style={{ fontFamily: F.fr, fontWeight: 600 }}>
          Monsoon edit
        </p>
        <div className="mt-[3cqh] flex gap-[1.4cqw]">
          {["Shells ₹2,400", "Boots ₹3,100", "Totes ₹1,650"].map((x) => (
            <span key={x} className="rounded-full border border-white/40 px-[1.4cqw] py-[0.8cqh] text-[1.1cqw] text-white/85" style={{ fontFamily: F.mr }}>
              {x}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
function U231() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -1, y: -1 });
  usePointer(
    root,
    dot,
    (t, el) => ({ x: el.clientWidth * (0.5 + 0.3 * Math.sin(t * 0.7)), y: el.clientHeight * (0.5 + 0.2 * Math.sin(t * 1.15)), inside: true }),
    (p, el) => {
      const card = el.querySelector<HTMLElement>(".u231-card");
      const copy = el.querySelector<HTMLElement>(".u231-copy");
      const map = el.querySelector(".u231-dm");
      if (!card || !copy) return;
      const P = pos.current;
      const tx = clamp(0, el.clientWidth - U231_W, p.x - U231_W / 2);
      const ty = clamp(0, el.clientHeight - U231_H, p.y - U231_H / 2);
      if (P.x < 0) Object.assign(P, { x: tx, y: ty });
      P.x += (tx - P.x) * 0.12;
      P.y += (ty - P.y) * 0.12;
      card.style.left = `${P.x.toFixed(1)}px`;
      card.style.top = `${P.y.toFixed(1)}px`;
      copy.style.left = `${(-P.x).toFixed(1)}px`;
      copy.style.top = `${(-P.y).toFixed(1)}px`;
      if (map) map.setAttribute("scale", (64 + 18 * Math.sin(performance.now() / 700)).toFixed(1));
    },
  );
  return (
    <Stage r={root} g1="rgba(127,231,255,.5)" g2="rgba(255,209,102,.24)">
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden>
        <filter id="u231-glass" x="0" y="0" width={U231_W} height={U231_H} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feImage href={U231_MAP} x="0" y="0" width={U231_W} height={U231_H} preserveAspectRatio="none" result="m" />
          <feDisplacementMap className="u231-dm" in="SourceGraphic" in2="m" scale="64" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="absolute inset-0" style={{ containerType: "size" }}>
        <U231Back />
        <div
          className="u231-card absolute overflow-hidden rounded-[30px] shadow-[0_30px_70px_rgba(0,0,0,.45)]"
          style={{ width: U231_W, height: U231_H, left: `calc(50cqw - ${U231_W / 2}px)`, top: `calc(50cqh - ${U231_H / 2}px)` }}
        >
          <div className="absolute inset-0 overflow-hidden" style={{ filter: "url(#u231-glass)" }}>
            <div className="u231-copy absolute" style={{ width: "100cqw", height: "100cqh", left: `calc(${U231_W / 2}px - 50cqw)`, top: `calc(${U231_H / 2}px - 50cqh)` }}>
              <U231Back />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-[30px] border border-white/45 bg-gradient-to-br from-white/25 via-white/5 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,.6),inset_0_-18px_40px_rgba(0,0,0,.18)]" />
          <div className="pointer-events-none absolute bottom-5 left-6 right-6 flex items-end justify-between">
            <p className="text-[20px] font-[600] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.5)]" style={{ fontFamily: F.sg }}>
              Rain shell
            </p>
            <p className="text-[16px] text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,.5)]" style={{ fontFamily: F.mr }}>
              ₹2,400
            </p>
          </div>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U232 · Dither sweep nav hover ───────────────────────── */
const U232_NAV = ["Shop", "Drops", "Journal", "Stores", "Bag (2)"];
function U232() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const state = useRef(U232_NAV.map(() => ({ on: false, p: 0 })));
  const setFrame = (f: HTMLElement, p: number) => {
    const v = U232_FRAMES[Math.round(clamp(0, 1, p) * U232_K)];
    f.style.setProperty("mask-image", v);
    f.style.setProperty("-webkit-mask-image", v);
  };
  usePointer(
    root,
    dot,
    (t, el) => {
      const cells = all(el, ".u232-c");
      const pts = cells.map((c) => mid(rel(c, el)));
      const seq = pts.length ? [...pts, [el.clientWidth * 0.62, el.clientHeight * 0.8] as [number, number], ...pts.slice(1, -1).reverse()] : [[0, 0] as [number, number]];
      const [x, y] = stepPath(t, seq, 0.82, 0.45);
      return { x, y, inside: true };
    },
    (p, el) => {
      all(el, ".u232-c").forEach((c, i) => {
        const S = state.current[i];
        const on = p.inside && inBox(rel(c, el), p.x, p.y, 2);
        if (on === S.on) return;
        S.on = on;
        const f = c.querySelector<HTMLElement>(".u232-fill");
        if (!f) return;
        gsap.to(S, {
          p: on ? 1 : 0,
          duration: on ? 0.42 : 0.5,
          ease: "none",
          overwrite: true,
          onUpdate: () => {
            if (!root.current) return;
            setFrame(f, S.p);
          },
        });
      });
    },
  );
  useEffect(
    () => () => {
      gsap.killTweensOf(state.current);
    },
    [],
  );
  return (
    <Stage r={root} g1="rgba(124,224,195,.52)" g2="rgba(159,140,255,.22)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <nav className="flex overflow-hidden rounded-[14px] border border-white/15 bg-[#0e1220]">
          {U232_NAV.map((n, i) => (
            <a key={n} href="#" onClick={(e) => e.preventDefault()} className={`u232-c relative flex h-[66px] w-[176px] items-center justify-center ${i ? "border-l border-white/10" : ""}`}>
              <span className="text-[17px] font-[600] tracking-[0.02em] text-white/85" style={{ fontFamily: F.sg }}>
                {n}
              </span>
              <span className="u232-fill flex items-center justify-center bg-[#7ce0c3]" style={{ maskImage: U232_FRAMES[0], WebkitMaskImage: U232_FRAMES[0] }} aria-hidden>
                <span className="text-[17px] font-[700] tracking-[0.02em] text-[#04150f]" style={{ fontFamily: F.sg }}>
                  {n}
                </span>
              </span>
            </a>
          ))}
        </nav>
        <h3 className="mt-14 text-[clamp(44px,5.2vw,86px)] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.sy, fontWeight: 800 }}>
          Pixel-cut sneakers
        </h3>
        <p className="mt-4 text-[18px] text-white/60" style={{ fontFamily: F.mr }}>
          Drop 04 · from ₹7,490
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U233 · Focus-lock corner brackets ───────────────────────── */
const U233_K = [
  { n: "Field camera", p: "₹38,900", i: 2 },
  { n: "Prime lens", p: "₹21,500", i: 0 },
  { n: "Travel tripod", p: "₹6,200", i: 3 },
];
function U233() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  usePointer(
    root,
    dot,
    (t, el) => {
      const pts = all(el, ".u233-k").map((c) => mid(rel(c, el)));
      const seq: [number, number][] = pts.length ? [...pts, [el.clientWidth * 0.5, el.clientHeight * 0.9]] : [[0, 0]];
      const [x, y] = stepPath(t, seq, 0.86, 0.45);
      return { x, y, inside: true };
    },
    (p, el) => {
      all(el, ".u233-k").forEach((c) => c.classList.toggle("on", p.inside && inBox(rel(c, el), p.x, p.y, 4)));
    },
  );
  return (
    <Stage r={root} g1="rgba(127,231,255,.52)" g2="rgba(255,209,102,.2)">
      <div className="flex h-full w-full items-center justify-center gap-[60px]">
        {U233_K.map((k) => (
          <div key={k.n} className="u233-k relative h-[340px] w-[260px]">
            <div className="h-full w-full overflow-hidden rounded-[18px] border border-white/10 bg-[#121725]">
              <div className="h-[76%]">
                <Img i={k.i} w={520} h={520} />
              </div>
              <div className="flex h-[24%] items-center justify-between px-5">
                <p className="text-[17px] font-[600]" style={{ fontFamily: F.sg }}>
                  {k.n}
                </p>
                <p className="text-[15px] text-white/65" style={{ fontFamily: F.mr }}>
                  {k.p}
                </p>
              </div>
            </div>
            <span className="u233-tag absolute left-4 top-4 rounded-full bg-[#7fe7ff] px-3 py-1 text-[12px] font-[700] uppercase tracking-[0.16em] text-[#03141a]" style={{ fontFamily: F.sg }}>
              Locked
            </span>
            {["tl", "tr", "bl", "br"].map((c) => (
              <span key={c} className={`u233-b ${c}`} aria-hidden />
            ))}
          </div>
        ))}
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U234 · Sprite-mask wipe button ───────────────────────── */
const U234_B = ["Add to bag · ₹2,990", "Book a fitting", "Send as a gift"];
function U234() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  usePointer(
    root,
    dot,
    (t, el) => {
      const pts = all(el, ".u234-b").map((c) => mid(rel(c, el)));
      const seq: [number, number][] = pts.length ? [...pts, [el.clientWidth * 0.5, el.clientHeight * 0.86]] : [[0, 0]];
      const [x, y] = stepPath(t, seq, 0.9, 0.45);
      return { x, y, inside: true };
    },
    (p, el) => {
      all(el, ".u234-b").forEach((b) => {
        const on = p.inside && inBox(rel(b, el), p.x, p.y, 2);
        const was = b.classList.contains("on");
        if (on === was) return;
        b.classList.toggle("on", on);
        b.classList.toggle("out", !on);
      });
    },
  );
  return (
    <Stage r={root} g1="rgba(255,122,89,.52)" g2="rgba(255,209,102,.22)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Hand-dyed indigo jacket</Eyebrow>
        <h3 className="mt-3 text-[clamp(40px,4.4vw,70px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Painted by hand
        </h3>
        <div className="mt-12 flex gap-[28px]">
          {U234_B.map((b) => (
            <button key={b} type="button" className="u234-b relative h-[76px] w-[290px] overflow-hidden rounded-[14px] border-2 border-[#ff7a59] text-[18px] font-[600]" style={{ fontFamily: F.sg }}>
              <span className="absolute inset-0 flex items-center justify-center text-[#ffd8cc]">{b}</span>
              <span className="u234-top flex items-center justify-center bg-[#ff7a59] text-[#1a0905]" style={{ maskImage: U234_SPRITE, WebkitMaskImage: U234_SPRITE }} aria-hidden>
                {b}
              </span>
            </button>
          ))}
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U235 · Sprite-sheet stepped loop ───────────────────────── */
function U235() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("u235-run", e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Stage r={root} g1="rgba(255,209,102,.55)" g2="rgba(255,122,89,.22)">
      <div className="flex h-full w-full items-center justify-center gap-[80px]">
        <div className="flex flex-col items-center">
          <div className="u235-coin" style={{ backgroundImage: U235_SHEET }} role="img" aria-label="Spinning reward coin" />
          <div className="u235-shadow mt-4 h-[14px] w-[150px] rounded-[50%] bg-black/55" />
        </div>
        <div className="max-w-[780px] text-left">
          <Eyebrow>Rewards wallet</Eyebrow>
          <h3 className="mt-3 text-[clamp(38px,4vw,64px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            ₹250 back, every order
          </h3>
          <p className="mt-6 text-[13px] uppercase tracking-[0.22em] text-white/50" style={{ fontFamily: F.mr }}>
            16-frame sheet · stepped
          </p>
          <div className="relative mt-3 overflow-hidden rounded-[10px] border border-white/10 bg-black/30" style={{ width: U235_N * 48 }}>
            <div className="u235-strip opacity-70" style={{ backgroundImage: U235_SHEET }} />
            <div className="u235-mark absolute left-0 top-0 rounded-[8px] border-2 border-[#ffd166] shadow-[0_0_14px_rgba(255,209,102,.6)]" />
          </div>
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── U236 · Tile tool swap mesh ───────────────────────── */
const U236_C = 6;
const U236_R = 3;
function U236() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const tiles = all(el, ".u236-t");
    const shown = tiles.map((_, i) => i);
    const spare = U236_NAMES.map((_, i) => i).filter((i) => i >= tiles.length);
    let last: number[] = [];
    const tl = gsap.timeline({ repeat: -1 });
    tl.call(() => {
      if (!root.current) return;
      let k = Math.floor(Math.random() * tiles.length);
      for (let g = 0; g < 6 && last.includes(k); g++) k = Math.floor(Math.random() * tiles.length);
      last = [k, ...last].slice(0, 5);
      const t = tiles[k];
      const inner = t.querySelector<HTMLElement>(".u236-i");
      if (!inner) return;
      const next = spare.shift()!;
      spare.push(shown[k]);
      shown[k] = next;
      gsap
        .timeline()
        .to(t, { rotationX: 90, duration: 0.22, ease: "power2.in" })
        .call(() => {
          if (!root.current) return;
          inner.innerHTML = u236Html(next);
        })
        .fromTo(t, { rotationX: -90 }, { rotationX: 0, duration: 0.42, ease: "back.out(1.6)" });
    });
    tl.to({}, { duration: 0.3 });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(159,140,255,.55)" g2="rgba(124,224,195,.22)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Works with the tools you already use</Eyebrow>
        <div className="mt-8 grid gap-[14px]" style={{ gridTemplateColumns: `repeat(${U236_C}, 170px)`, perspective: "800px" }}>
          {Array.from({ length: U236_C * U236_R }, (_, i) => (
            <div key={i} className="u236-t h-[104px] rounded-[16px] border border-white/10 bg-[#121628]">
              <div className="u236-i" dangerouslySetInnerHTML={{ __html: u236Html(i) }} />
            </div>
          ))}
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── U237 · Glitch button ───────────────────────── */
const U237_B = [
  { t: "Enter the drop", bg: "#f2f4ff", fg: "#0b0d16" },
  { t: "Shop now · ₹1,999", bg: "#ff3d6e", fg: "#ffffff" },
];
const U237_SL = 6;
function U237() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const glitch = (b: HTMLElement | null | undefined) => {
    if (!b || !root.current || prefersReducedMotion() || b.dataset.g === "1") return;
    b.dataset.g = "1";
    const slices = all(b, ".u237-s");
    const red = b.querySelector(".u237-r");
    const cy = b.querySelector(".u237-cy");
    const scan = b.querySelector(".u237-scan");
    const base = b.querySelector(".u237-base");
    const tl = gsap.timeline({
      onComplete: () => {
        if (!root.current) return;
        b.dataset.g = "0";
      },
    });
    for (let s = 0; s < 6; s++) {
      tl.call(
        () => {
          if (!root.current) return;
          slices.forEach((sl) => gsap.set(sl, { x: Math.random() < 0.6 ? rnd(-22, 22) : 0, opacity: 1 }));
          gsap.set(red, { x: rnd(-8, -3), y: rnd(-2, 2), opacity: 0.9 });
          gsap.set(cy, { x: rnd(3, 8), y: rnd(-2, 2), opacity: 0.9 });
          gsap.set(scan, { opacity: rnd(0.35, 0.7), y: rnd(-2, 2) });
          gsap.set(base, { x: rnd(-4, 4) });
        },
        undefined,
        s * 0.07,
      );
    }
    tl.to(slices, { x: 0, opacity: 0, duration: 0.08 }, 0.42)
      .to([red, cy], { x: 0, y: 0, opacity: 0, duration: 0.08 }, 0.42)
      .to(scan, { opacity: 0, duration: 0.08 }, 0.42)
      .to(base, { x: 0, duration: 0.08 }, 0.42);
  };
  usePlay(root, (el) => {
    const d = dot.current;
    const tl = gsap.timeline({ repeat: -1 });
    [0, 1].forEach((i) => {
      tl.call(() => {
        if (!root.current) return;
        goDot(d, el, all(el, ".u237-b")[i], 0.45, idle());
      });
      tl.to({}, { duration: 0.45 });
      tl.call(() => {
        if (!root.current || !idle()) return;
        glitch(all(el, ".u237-b")[i]);
      });
      tl.to({}, { duration: 0.5 });
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,61,110,.52)" g2="rgba(127,231,255,.24)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Midnight release · 00:00</Eyebrow>
        <h3 className="mt-3 text-[clamp(44px,5.2vw,86px)] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.sy, fontWeight: 800 }}>
          Signal lost
        </h3>
        <div className="mt-12 flex gap-[36px]">
          {U237_B.map((b) => {
            const face = (cls: string, style?: CSSProperties, k?: number) => (
              <span key={k ?? cls} className={`absolute inset-0 flex items-center justify-center rounded-[12px] ${cls}`} style={{ background: b.bg, color: b.fg, ...style }}>
                {b.t}
              </span>
            );
            return (
              <button
                key={b.t}
                type="button"
                onPointerEnter={(e) => glitch(e.currentTarget)}
                className="u237-b relative h-[78px] w-[300px] text-[19px] font-[700] tracking-[0.01em]"
                style={{ fontFamily: F.sg }}
              >
                {face("u237-base")}
                {Array.from({ length: U237_SL }, (_, s) =>
                  face("u237-s", { opacity: 0, clipPath: `inset(${((s * 100) / U237_SL).toFixed(2)}% 0 ${(100 - ((s + 1) * 100) / U237_SL).toFixed(2)}% 0)` }, s),
                )}
                <span className="u237-r pointer-events-none absolute inset-0 flex items-center justify-center text-[#ff2a55] opacity-0 mix-blend-screen" aria-hidden>
                  {b.t}
                </span>
                <span className="u237-cy pointer-events-none absolute inset-0 flex items-center justify-center text-[#2ae8ff] opacity-0 mix-blend-screen" aria-hidden>
                  {b.t}
                </span>
                <span className="u237-scan pointer-events-none absolute inset-0 rounded-[12px] opacity-0" aria-hidden />
              </button>
            );
          })}
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "U226", name: "Cube grid hover + explode", how: "A grid of 3D cubes turns toward the pointer; a click flies every cube far away and opens a gift card, then they gather back. A fake pointer sweeps a figure-eight and clicks.", kind: "play", C: U226 },
  { code: "U227", name: "Make-way grid expand", how: "A clicked tile grows with a skew that settles while its neighbours are pushed away radially with a slight tilt, then all return. A fake pointer clicks tiles in turn.", kind: "play", C: U227 },
  { code: "U228", name: "Grid rows skew with mouse", how: "Rows of images skew, shift and brighten by how close the pointer is (quadratic falloff); a click Flips the middle image to full screen and back. A fake pointer sweeps.", kind: "play", C: U228 },
  { code: "U229", name: "3D pin with radar rings", how: "On hover the card tips back flat in perspective, a gradient pin line rises with a label and radar rings pulse from its base. A fake pointer moves on and off.", kind: "play", C: U229 },
  { code: "U230", name: "LED board text", how: "A price message sits on a dot-matrix board; on hover the lit dots blink and scroll like an LED sign. A fake pointer hovers the board, then leaves.", kind: "play", C: U230 },
  { code: "U231", name: "Liquid glass refraction", how: "A glass card glides over a poster; its edges bend the backdrop through an SVG displacement map that shifts as the card moves.", kind: "play", C: U231 },
  { code: "U232", name: "Dither sweep nav hover", how: "Hovered nav cells fill left to right through stepped ordered-dither pixel frames and dissolve back on leave. A fake pointer walks the nav.", kind: "play", C: U232 },
  { code: "U233", name: "Focus-lock corner brackets", how: "Corner brackets breathe in and out with a glow around each card, then snap tight with a LOCKED tag on hover. A fake pointer visits the cards.", kind: "play", C: U233 },
  { code: "U234", name: "Sprite-mask wipe button", how: "On hover a stepped brush-stroke sprite mask paints the fill over the button in 12 frames and wipes it back on leave. A fake pointer visits each button.", kind: "play", C: U234 },
  { code: "U235", name: "Sprite-sheet stepped loop", how: "A coin spins from a 16-frame sprite sheet stepped with steps() on background-position, with the sheet shown below and a marker stepping in sync.", kind: "play", C: U235 },
  { code: "U236", name: "Tile tool swap mesh", how: "A wall of logo tiles keeps changing piece by piece: one random tile at a time flips over to a new mark.", kind: "play", C: U236 },
  { code: "U237", name: "Glitch button", how: "On hover the button splits into offset slices with red/cyan channel shifts and scan lines for about 0.4 s. A fake pointer hovers each button in turn.", kind: "play", C: U237 },
];
