"use client";

// Ambient motions, batch 16 · group 4 (MOTION-MENU M752–M763): glyph fields, horizons, tunnels, a sphere of items, a radar,
// an eye, floating lines, a loom and a field of turning marks. Small focused demos for /lab/motion. All are "play": they
// start on screen, loop, and pause off screen. Every stage has a CSS-only glow loop that never stops (plus an on-top glow
// where a canvas covers the stage). Pointer demos drive a visible fake pointer ring by themselves; the real mouse takes over
// while it moves. Canvas / WebGL work is built only near the viewport, runs at dpr 1 (0.7 for per-pixel-heavy shaders),
// draws only on screen and is released on unmount. ?static=1 / reduced motion: no JS motion, CSS loops stop, and each
// stage shows a CSS fallback under its canvas (canvas demos also paint one still frame when JS runs with reduced motion).
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { createShader, type GLHandle } from "@/lib/gl";
import { useTicker } from "@/components/fx/shared";
import type { MotionDef } from "./types";

const F = {
  sg: "'Space Grotesk Variable', system-ui, sans-serif",
  fr: "'Fraunces Variable', Georgia, serif",
  is: "'Instrument Serif', Georgia, serif",
  sy: "'Syne Variable', 'Space Grotesk Variable', system-ui, sans-serif",
  mr: "'Manrope Variable', system-ui, sans-serif",
};

const CSS = `
.b16g4-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(120,170,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,130,100,.24)),transparent 70%);animation:b16g4-drift 5.6s linear infinite alternate;will-change:transform}
.b16g4-top{position:absolute;inset:-20%;pointer-events:none;z-index:30;mix-blend-mode:screen;opacity:.45;background:radial-gradient(34% 40% at 30% 36%,var(--g1,rgba(120,170,255,.55)),transparent 70%),radial-gradient(30% 34% at 72% 68%,var(--g2,rgba(255,130,100,.24)),transparent 70%);animation:b16g4-drift 6.4s linear infinite alternate-reverse;will-change:transform}
@keyframes b16g4-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b16g4-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);pointer-events:none;z-index:45;opacity:0;transition:opacity .25s}

/* M752 / M753 fallbacks */
.m752-fb{background:repeating-linear-gradient(90deg,rgba(120,255,214,.07) 0 12px,transparent 12px 20px),repeating-linear-gradient(0deg,rgba(120,255,214,.06) 0 14px,transparent 14px 20px),#070a12}
.m753-fb{background:repeating-linear-gradient(90deg,rgba(255,190,120,.10) 0 2px,transparent 2px 18px),linear-gradient(#0a0805,#120c06)}
.m75x-fade{background:linear-gradient(180deg,transparent 52%,rgba(5,7,12,.92) 92%)}
/* M754 */
.m754-fb{background:radial-gradient(22% 30% at 50% 44%,rgba(255,150,110,.55),transparent 70%),repeating-linear-gradient(0deg,rgba(190,120,255,.22) 0 2px,transparent 2px 22px) 0 45%/100% 60% no-repeat,linear-gradient(#0b0716 0 44%,#120a22 44%)}
/* M755 / M756 / M760 / M761 shader fallbacks */
.m755-fb{background:repeating-conic-gradient(from 45deg at 50% 62%,rgba(110,150,255,.18) 0 6deg,transparent 6deg 12deg),radial-gradient(60% 50% at 50% 62%,rgba(255,180,120,.25),transparent 70%),#05070f}
.m756-fb{background:radial-gradient(circle at 50% 50%,#000 0 6%,transparent 22%),repeating-radial-gradient(circle at 50% 50%,rgba(90,220,255,.18) 0 3px,transparent 3px 34px),radial-gradient(circle,#0b1a2a,#04060c 70%)}
.m760-fb{background:radial-gradient(circle at 50% 50%,#000 0 3%,#7a2a0c 3.5% 12%,#ffb347 13%,rgba(255,90,30,.55) 17%,transparent 32%),#07050a}
.m761-fb{background:repeating-linear-gradient(176deg,transparent 0 30px,rgba(120,200,255,.28) 30px 32px,transparent 32px 46px),#05070f}
/* M757 / M758 / M762 */
.m757-fb{background:repeating-conic-gradient(from 0deg at 50% 50%,rgba(255,120,160,.16) 0 8deg,transparent 8deg 22deg),radial-gradient(circle,#140a1c,#06040c 70%)}
.m758-fb{background:radial-gradient(circle at 64% 50%,rgba(150,180,255,.22) 0 22%,transparent 23%)}
.m762-fb{background:repeating-linear-gradient(90deg,rgba(240,230,210,.35) 0 3px,transparent 3px 22px),repeating-linear-gradient(0deg,rgba(220,120,80,.5) 0 8px,rgba(70,90,160,.5) 8px 12px)}

/* M759 radar */
.m759-beam{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,transparent 0deg,transparent 290deg,rgba(120,255,190,.08) 300deg,rgba(120,255,190,.55) 360deg);animation:m759-spin 4s linear infinite}
.m759-beam::after{content:"";position:absolute;left:50%;top:0;width:2px;height:50%;margin-left:-1px;background:linear-gradient(rgba(170,255,215,1),rgba(170,255,215,.2))}
@keyframes m759-spin{to{transform:rotate(360deg)}}
.m759-blip{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#9dffd0;opacity:.22;animation:m759-blip 4s linear infinite}
.m759-blip::after{content:"";position:absolute;inset:-2px;border-radius:50%;border:2px solid #9dffd0;opacity:0;animation:inherit;animation-name:m759-ping}
@keyframes m759-blip{0%{opacity:1;transform:scale(1.5);box-shadow:0 0 22px 6px rgba(140,255,200,.7)}35%{opacity:.4;transform:scale(1);box-shadow:0 0 0 0 rgba(140,255,200,0)}100%{opacity:.22;transform:scale(1)}}
@keyframes m759-ping{0%{opacity:.9;transform:scale(1)}40%{opacity:0;transform:scale(4.5)}100%{opacity:0;transform:scale(4.5)}}
.m759-tag{animation:m759-tag 4s linear infinite;opacity:.35}
@keyframes m759-tag{0%{opacity:1}45%{opacity:.35}100%{opacity:.35}}
.m759-off *,.m759-off *::after{animation-play-state:paused!important}

html.is-static .b16g4-glow,html.is-static .b16g4-top,html.is-static .m759-beam,html.is-static .m759-blip,html.is-static .m759-blip::after,html.is-static .m759-tag{animation:none}
html.is-static .b16g4-dot{display:none}
@media (prefers-reduced-motion: reduce){
  .b16g4-glow,.b16g4-top,.m759-beam,.m759-blip,.m759-blip::after,.m759-tag{animation:none}
  .b16g4-dot{display:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop (never frozen); `top` adds the on-top screen glow. */
function Stage({ r, children, className = "", g1, g2, top, style }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; className?: string; g1?: string; g2?: string; top?: boolean; style?: CSSProperties }) {
  const vars = { "--g1": g1, "--g2": g2 } as CSSProperties;
  return (
    <div ref={r} className={`relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#070910] text-[#eef2ff] ${className}`} style={style}>
      <style href="b16g4-css" precedence="default">
        {CSS}
      </style>
      <div className="b16g4-glow" style={vars} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      {top && <div className="b16g4-top" style={vars} aria-hidden />}
    </div>
  );
}

/** The visible fake pointer ring. */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => <div ref={r} className="b16g4-dot" aria-hidden />;

/**
 * Pointer for "pointer" demos: every frame (on screen) it reports a position in root px. The real mouse wins for 2 s after
 * it last moved; otherwise `script(t, w, h)` drives the visible fake ring along a set path.
 */
function usePointer(root: RefObject<HTMLDivElement | null>, dot: RefObject<HTMLDivElement | null>, script: (t: number, w: number, h: number) => [number, number], frame: (x: number, y: number, dt: number, t: number) => void) {
  const real = useRef({ x: 0, y: 0, at: -1e9 });
  const sc = useRef(script);
  sc.current = script;
  const fr = useRef(frame);
  fr.current = frame;
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      real.current = { x: e.clientX - r.left, y: e.clientY - r.top, at: performance.now() };
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, [root]);
  useTicker(root, (t, dt) => {
    const el = root.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const live = performance.now() - real.current.at < 2000;
    const [x, y] = live ? [real.current.x, real.current.y] : sc.current(t, w, h);
    if (dot.current) {
      dot.current.style.opacity = live ? "0" : "1";
      dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
    }
    fr.current(x, y, Math.min(dt, 0.05), t);
  });
}

/** Sizes a canvas to its box at dpr 1; returns the 2D context (fresh = the size just changed). */
function fit(c: HTMLCanvasElement | null) {
  if (!c) return null;
  const w = Math.max(1, Math.round(c.clientWidth));
  const h = Math.max(1, Math.round(c.clientHeight));
  let fresh = false;
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
    fresh = true;
  }
  const g = c.getContext("2d");
  return g ? { g, w, h, fresh } : null;
}

type Draw = (g: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number, fresh: boolean) => void;

/** Canvas 2D loop: draws every frame while on screen (useTicker); with reduced motion paints one still frame at `still` s. */
function useCanvas(root: RefObject<HTMLDivElement | null>, cv: RefObject<HTMLCanvasElement | null>, draw: Draw, still = 2) {
  const d = useRef(draw);
  d.current = draw;
  useTicker(root, (t, dt) => {
    const f = fit(cv.current);
    if (f) d.current(f.g, f.w, f.h, t, Math.min(dt, 0.05), f.fresh);
  });
  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const f = fit(cv.current);
    if (f) d.current(f.g, f.w, f.h, still, 0, true);
  }, [cv, still]);
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

type U = Record<string, { value: unknown }>;

/**
 * Full-bleed fragment shader (OGL via lib/gl). Built only near the viewport; draws only while on screen (lib/gl); the context
 * is lost on unmount. The CSS fallback class is always underneath; the canvas fades in after its first frame.
 */
function Shader({ frag, fb, dpr = 1, uniforms, onFrame }: { frag: string; fb: string; dpr?: number; uniforms?: () => U; onFrame?: (u: U, t: number) => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const of = useRef(onFrame);
  of.current = onFrame;
  const un = useRef(uniforms);
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let dead = false;
    let h: GLHandle | null = null;
    const stop = whenNear(c, async () => {
      if (dead) return;
      h = await createShader(c, frag, { dpr, uniforms: un.current?.(), onFrame: (u, t) => of.current?.(u, t) });
      if (dead) h?.destroy();
    });
    return () => {
      dead = true;
      stop();
      h?.destroy();
    };
  }, [frag, dpr]);
  return (
    <div className={`absolute inset-0 ${fb}`}>
      <canvas ref={cv} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500" aria-hidden />
    </div>
  );
}

/* Our own small GLSL kit: hash → value noise → fbm. */
const NOISE = /* glsl */ `
float hsh(vec2 p) { p = fract(p * vec2(127.13, 311.71)); p += dot(p, p + 41.37); return fract(p.x * p.y); }
float vno(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hsh(i), hsh(i + vec2(1.0, 0.0)), f.x), mix(hsh(i + vec2(0.0, 1.0)), hsh(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  mat2 m = mat2(0.82, -0.57, 0.57, 0.82);
  for (int i = 0; i < 4; i++) { s += a * vno(p); p = m * p * 2.02 + 0.31; a *= 0.5; }
  return s;
}
`;

/** Seeded random (stable layouts on every mount). */
function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Small left-column copy block used by several stages. */
function Copy({ eyebrow, title, line, price, accent, className = "" }: { eyebrow: string; title: ReactNode; line: string; price: string; accent: string; className?: string }) {
  return (
    <div className={`pointer-events-none relative z-20 ${className}`}>
      <p className="text-[13px] uppercase tracking-[0.28em]" style={{ fontFamily: F.mr, color: accent }}>
        {eyebrow}
      </p>
      <h3 className="mt-4 text-[clamp(40px,4.4vw,72px)] font-[600] leading-[0.98] tracking-[-0.02em]" style={{ fontFamily: F.sg }}>
        {title}
      </h3>
      <p className="mt-5 max-w-[34ch] text-[16px] leading-[1.5] text-white/65" style={{ fontFamily: F.mr }}>
        {line}
      </p>
      <p className="mt-6 text-[15px] tabular-nums text-white/80" style={{ fontFamily: F.sg }}>
        {price}
      </p>
    </div>
  );
}

/* ───────────────────────── M752 · Glyph matrix ───────────────────────── */
const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネ0123456789<>/{}[]=+*#%&ΣΔΩ";
const M752_COL = ["#7dffd6", "#5fd3ff", "#c9a7ff", "#f4f7ff"];
function M752() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ cols: 0, rows: 0, ch: new Uint8Array(0), co: new Uint8Array(0), heat: new Float32Array(0), acc: 0, rnd: rng(11) });
  useCanvas(root, cv, (g, w, h, _t, dt, fresh) => {
    const s = st.current;
    const cell = 22;
    if (fresh || s.cols === 0) {
      s.cols = Math.ceil(w / cell);
      s.rows = Math.ceil(h / cell);
      const n = s.cols * s.rows;
      s.ch = new Uint8Array(n);
      s.co = new Uint8Array(n);
      s.heat = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        s.ch[i] = Math.floor(s.rnd() * GLYPHS.length);
        s.co[i] = s.rnd() < 0.82 ? 0 : 1 + Math.floor(s.rnd() * 3);
        s.heat[i] = s.rnd() * 0.6;
      }
    }
    const n = s.cols * s.rows;
    // every ~90 ms about 4% of the cells swap to a random glyph (and maybe colour) and flash bright
    s.acc += dt;
    while (s.acc > 0.09) {
      s.acc -= 0.09;
      const k = Math.ceil(n * 0.04);
      for (let j = 0; j < k; j++) {
        const i = Math.floor(s.rnd() * n);
        s.ch[i] = Math.floor(s.rnd() * GLYPHS.length);
        s.co[i] = s.rnd() < 0.8 ? 0 : 1 + Math.floor(s.rnd() * 3);
        s.heat[i] = 1;
      }
    }
    g.globalAlpha = 1;
    g.fillStyle = "#070a12";
    g.fillRect(0, 0, w, h);
    g.font = `15px ui-monospace, "SF Mono", Menlo, monospace`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (let r = 0; r < s.rows; r++) {
      const y = r * cell + cell / 2;
      const fade = Math.min(1, Math.max(0, (h - y) / (h * 0.5))); // bottom fades out
      if (fade <= 0) continue;
      for (let c = 0; c < s.cols; c++) {
        const i = r * s.cols + c;
        const ht = s.heat[i];
        if (ht > 0) s.heat[i] = Math.max(0, ht - dt * 1.6);
        g.globalAlpha = (0.16 + 0.84 * ht) * fade;
        g.fillStyle = ht > 0.85 ? "#ffffff" : M752_COL[s.co[i]];
        g.fillText(GLYPHS[s.ch[i]], c * cell + cell / 2, y);
      }
    }
    g.globalAlpha = 1;
  });
  return (
    <Stage r={root} g1="rgba(90,255,200,.55)" g2="rgba(140,120,255,.28)" top>
      <div className="m752-fb absolute inset-0" aria-hidden />
      <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="m75x-fade pointer-events-none absolute inset-0" aria-hidden />
      <div className="absolute inset-0 flex items-center px-[7%]">
        <div className="rounded-[22px] bg-[#070a12]/80 px-10 py-9 shadow-[0_0_80px_40px_rgba(7,10,18,.8)]">
          <Copy eyebrow="Northwire Labs · Drop 07" title={<>Signal in<br />the noise</>} line="A field of glyphs that never sits still. Ambient texture for a tech launch or a data product." price="Studio licence · ₹ 18,500" accent="#7dffd6" />
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── M753 · Character rain ───────────────────────── */
type Drop = { y: number; sp: number; last: number };
function M753() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ drops: [] as Drop[], rnd: rng(23), prev: [] as number[] });
  useCanvas(
    root,
    cv,
    (g, w, h, _t, dt, fresh) => {
      const s = st.current;
      const cell = 18;
      const rows = Math.ceil(h / cell);
      if (fresh || s.drops.length === 0) {
        const n = Math.ceil(w / cell);
        s.drops = Array.from({ length: n }, () => ({ y: -s.rnd() * rows, sp: 9 + s.rnd() * 16, last: -1 }));
        s.prev = Array.from({ length: n }, () => -1);
        g.fillStyle = "#0a0805";
        g.fillRect(0, 0, w, h);
      }
      // the trail fade: a translucent wash every frame, so tails fade behind the bright heads
      g.globalAlpha = 1 - Math.exp(-dt * 3.2);
      g.fillStyle = "#0a0805";
      g.fillRect(0, 0, w, h);
      g.globalAlpha = 1;
      g.font = `bold 15px ui-monospace, "SF Mono", Menlo, monospace`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      s.drops.forEach((d, i) => {
        d.y += d.sp * dt;
        const row = Math.floor(d.y);
        if (row !== d.last) {
          const x = i * cell + cell / 2;
          // the old head becomes tail (amber), the new head is drawn near-white
          if (d.last >= 0) {
            g.fillStyle = "#0a0805";
            g.fillRect(x - cell / 2, d.last * cell, cell, cell);
            g.fillStyle = "#ffb35c";
            g.fillText(GLYPHS[Math.floor(s.rnd() * GLYPHS.length)], x, d.last * cell + cell / 2);
          }
          if (row >= 0) {
            g.fillStyle = "#fff4e2";
            g.fillText(GLYPHS[Math.floor(s.rnd() * GLYPHS.length)], x, row * cell + cell / 2);
          }
          d.last = row;
        }
        if (row > rows + 4 + d.sp) {
          d.y = -s.rnd() * rows * 0.6;
          d.sp = 9 + s.rnd() * 16;
          d.last = -1;
        }
      });
    },
    4,
  );
  return (
    <Stage r={root} g1="rgba(255,170,90,.55)" g2="rgba(255,110,80,.26)" top>
      <div className="m753-fb absolute inset-0" aria-hidden />
      <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="m75x-fade pointer-events-none absolute inset-0" aria-hidden />
      <div className="absolute inset-0 flex items-center justify-end px-[7%]">
        <div className="rounded-[22px] bg-[#0a0805]/80 px-10 py-9 shadow-[0_0_80px_40px_rgba(10,8,5,.8)]">
          <Copy eyebrow="Ember Code · Night shift" title={<>Falling<br />characters</>} line="Columns of glyphs pour down the page, bright heads and amber tails that fade as they fall." price="Dev hoodie · ₹ 3,490" accent="#ffb35c" />
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── M754 · Sine terrain horizon ───────────────────────── */
function M754() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const draw = (g: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    const tl = tilt.current;
    const hor = h * 0.46 + tl.y * 34; // horizon moves with the tilt
    const sky = g.createLinearGradient(0, 0, 0, hor);
    sky.addColorStop(0, "#07040f");
    sky.addColorStop(1, "#2a0f3a");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, hor + 1);
    g.fillStyle = "#0b0614";
    g.fillRect(0, hor, w, h - hor);
    // a low sun behind the horizon, sliced by bands
    const sx = w * 0.5 - tl.x * 60;
    const sr = h * 0.2;
    const sun = g.createLinearGradient(0, hor - sr, 0, hor);
    sun.addColorStop(0, "#ffd29a");
    sun.addColorStop(1, "#ff5f8a");
    g.save();
    g.beginPath();
    g.rect(0, 0, w, hor);
    g.clip();
    g.fillStyle = sun;
    g.beginPath();
    g.arc(sx, hor, sr, Math.PI, 0);
    g.fill();
    g.fillStyle = "#1c0b2c";
    for (let k = 0; k < 6; k++) {
      const yy = hor - sr * 0.08 - k * sr * 0.14 - ((t * 10) % (sr * 0.14));
      g.fillRect(sx - sr, yy, sr * 2, 2 + (6 - k) * 0.8);
    }
    g.restore();
    // terrain rows: far to near, gliding toward the viewer, height from layered sines
    const f = h * 0.9;
    const cam = 2.4 + tl.y * 0.5;
    const camX = tl.x * 2.2;
    const dz = 0.85;
    const off = (t * 1.6) % dz;
    const ROWS = 40;
    const SAMPLES = 80;
    g.lineWidth = 1.6;
    for (let r = ROWS - 1; r >= 0; r--) {
      const z = 1.2 + r * dz - off;
      if (z < 1) continue;
      const near = 1 - r / ROWS;
      const a = Math.min(1, near * 1.25) * (z < 1.6 ? (z - 1) / 0.6 : 1);
      g.strokeStyle = `rgba(${Math.round(150 + near * 105)},${Math.round(100 + near * 40)},${Math.round(255 - near * 80)},${a.toFixed(3)})`;
      g.beginPath();
      const half = ((w * 0.62) / f) * z;
      for (let i = 0; i <= SAMPLES; i++) {
        const x = camX - half + (2 * half * i) / SAMPLES;
        const ht = 0.7 * Math.sin(x * 0.42 + t * 0.9) + 0.9 * Math.sin(z * 0.5 - t * 1.3 + x * 0.13) + 0.4 * Math.sin((x - z) * 0.9 + t * 0.6);
        const amp = Math.min(1, Math.abs(x - camX) / 3 + 0.25); // a calmer valley in the middle
        const sxp = w / 2 + ((x - camX) * f) / z;
        const syp = hor + ((cam - ht * amp) * f) / z;
        if (i === 0) g.moveTo(sxp, syp);
        else g.lineTo(sxp, syp);
      }
      g.stroke();
    }
  };
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.32 * Math.sin(t * 0.7)), h * (0.5 + 0.22 * Math.sin(t * 1.1 + 1))],
    (px, py, dt, t) => {
      const el = root.current;
      if (!el) return;
      const tx = (px / el.clientWidth - 0.5) * 2;
      const ty = (py / el.clientHeight - 0.5) * 2;
      const e = Math.min(1, dt * 3);
      tilt.current.x += (tx - tilt.current.x) * e;
      tilt.current.y += (ty - tilt.current.y) * e;
      const fr = fit(cv.current);
      if (fr) draw(fr.g, fr.w, fr.h, t);
    },
  );
  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const fr = fit(cv.current);
    if (fr) draw(fr.g, fr.w, fr.h, 2);
  });
  return (
    <Stage r={root} g1="rgba(255,120,170,.55)" g2="rgba(150,110,255,.3)" top>
      <div className="m754-fb absolute inset-0" aria-hidden />
      <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-[9%] z-20 text-center">
        <p className="text-[13px] uppercase tracking-[0.32em] text-[#ffc2a8]" style={{ fontFamily: F.mr }}>
          Dusk Audio · Tour 2026
        </p>
        <h3 className="mt-3 text-[clamp(44px,5vw,84px)] leading-[0.95]" style={{ fontFamily: F.is }}>
          Ride the long horizon
        </h3>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── M755 · Cube grid wave (WebGL, grid-walk ray cast) ───────────────────────── */
const M755_FRAG = /* glsl */ `
vec3 pal(float k) {
  vec3 a = mix(vec3(0.10, 0.14, 0.40), vec3(0.32, 0.55, 1.0), smoothstep(0.0, 0.55, k));
  return mix(a, vec3(1.0, 0.70, 0.46), smoothstep(0.55, 1.0, k));
}
float hgt(vec2 c, float t) { float d = length(c); return 0.3 + 0.95 * (0.5 + 0.5 * sin(d * 0.8 - t * 2.1)); }
bool hitBox(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax, out float tn, out vec3 n) {
  vec3 inv = 1.0 / rd;
  vec3 t0 = (bmin - ro) * inv, t1 = (bmax - ro) * inv;
  vec3 tmin = min(t0, t1), tmax = max(t0, t1);
  tn = max(max(tmin.x, tmin.y), tmin.z);
  float tf = min(min(tmax.x, tmax.y), tmax.z);
  n = vec3(0.0);
  if (tf < max(tn, 0.0)) return false;
  if (tn == tmin.x) n = vec3(-sign(rd.x), 0.0, 0.0);
  else if (tn == tmin.y) n = vec3(0.0, -sign(rd.y), 0.0);
  else n = vec3(0.0, 0.0, -sign(rd.z));
  return true;
}
void main() {
  vec2 p = (vUv * uRes - 0.5 * uRes) / uRes.y;
  float t = uTime;
  float a = t * 0.12 + 0.6;
  vec3 ro = vec3(sin(a) * 14.0, 10.5, cos(a) * 14.0);
  vec3 ww = normalize(vec3(0.0, 0.2, 0.0) - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  vec3 rd = normalize(p.x * uu + p.y * vv + 1.9 * ww);
  if (abs(rd.x) < 1e-4) rd.x = 1e-4;
  if (abs(rd.z) < 1e-4) rd.z = 1e-4;
  vec3 col = mix(vec3(0.02, 0.025, 0.06), vec3(0.07, 0.08, 0.2), vUv.y);
  float N = 6.0;
  float tn; vec3 n;
  if (hitBox(ro, rd, vec3(-N, 0.0, -N), vec3(N, 1.3, N), tn, n)) {
    float tt = max(tn, 0.0) + 1e-3;
    vec3 pp = ro + rd * tt;
    vec2 cell = floor(pp.xz);
    vec2 st = sign(rd.xz);
    vec2 tDelta = abs(1.0 / rd.xz);
    vec2 tMax = tt + ((cell + max(st, 0.0)) - pp.xz) / rd.xz;
    bool hit = false;
    for (int i = 0; i < 40; i++) {
      if (cell.x < -N || cell.x >= N || cell.y < -N || cell.y >= N) break;
      float h = hgt(cell + 0.5, t);
      float tb; vec3 nb;
      if (hitBox(ro, rd, vec3(cell.x + 0.1, 0.0, cell.y + 0.1), vec3(cell.x + 0.9, h, cell.y + 0.9), tb, nb)) {
        vec3 hp = ro + rd * tb;
        float k = (h - 0.3) / 0.95;
        vec3 base = pal(k);
        vec3 L = normalize(vec3(0.5, 0.9, 0.35));
        float dif = 0.3 + 0.7 * max(dot(nb, L), 0.0);
        vec3 c = base * dif;
        if (nb.y > 0.5) {
          vec2 lc = fract(hp.xz) - 0.5;
          float edge = smoothstep(0.36, 0.4, max(abs(lc.x), abs(lc.y)));
          c = mix(c * 1.15, vec3(1.0, 0.9, 0.8), edge * 0.55 * k + 0.05);
        } else {
          c *= 0.55 + 0.45 * clamp(hp.y / max(h, 0.01), 0.0, 1.0);
        }
        float fog = smoothstep(10.0, 26.0, tb);
        col = mix(c, col, fog);
        hit = true;
        break;
      }
      if (tMax.x < tMax.y) { cell.x += st.x; tMax.x += tDelta.x; }
      else { cell.y += st.y; tMax.y += tDelta.y; }
    }
    if (!hit && rd.y < 0.0) {
      vec3 fp = ro + rd * (-ro.y / rd.y);
      if (abs(fp.x) < N && abs(fp.z) < N) {
        float g = 0.5 + 0.5 * sin(length(fp.xz) * 0.8 - t * 2.1);
        col = mix(col, vec3(0.05, 0.08, 0.2) + vec3(0.12, 0.18, 0.5) * g * 0.35, 0.85);
      }
    }
  }
  gl_FragColor = vec4(col, 1.0);
}`;
function M755() {
  return (
    <Stage g1="rgba(110,150,255,.55)" g2="rgba(255,170,110,.3)" top>
      <Shader frag={M755_FRAG} fb="m755-fb" dpr={0.7} />
      <div className="pointer-events-none absolute left-[6%] top-[9%] z-20">
        <p className="text-[13px] uppercase tracking-[0.3em] text-[#ffc89a]" style={{ fontFamily: F.mr }}>
          Block Theory · Modular shelving
        </p>
        <h3 className="mt-3 text-[clamp(40px,4.4vw,72px)] font-[700] leading-[0.95] tracking-[-0.02em]" style={{ fontFamily: F.sy }}>
          Built in waves
        </h3>
        <p className="mt-4 text-[15px] tabular-nums text-white/75" style={{ fontFamily: F.sg }}>
          Grid unit · from ₹ 2,200
        </p>
      </div>
    </Stage>
  );
}

/* ───────────────────────── M756 · Infinite tube tunnel (WebGL, scripted pointer) ───────────────────────── */
const M756_FRAG = /* glsl */ `
uniform vec2 uMouse;
uniform float uZ, uBoost;
${NOISE}
void main() {
  vec2 p = (vUv * uRes - 0.5 * uRes) / uRes.y;
  float t = uTime;
  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 0.55;
  float r0 = length(p);
  // the far end of the tube (small radius) is pulled toward the pointer: the path bends
  vec2 q = p - m * exp(-r0 * 3.2);
  float r = max(length(q), 1e-3);
  float ang = atan(q.y, q.x);
  float u = ang / 6.2831853 + 0.5;
  float z = 0.42 / r + uZ;
  vec2 g = vec2(u * 18.0, z * 1.6);
  vec2 cid = floor(g);
  vec2 gf = fract(g);
  float seam = max(smoothstep(0.07, 0.0, min(gf.x, 1.0 - gf.x)), smoothstep(0.09, 0.0, min(gf.y, 1.0 - gf.y)));
  float panel = 0.35 + 0.65 * hsh(vec2(mod(cid.x, 18.0), cid.y));
  vec3 base = mix(vec3(0.05, 0.12, 0.22), vec3(0.18, 0.1, 0.32), panel);
  float bands = pow(0.5 + 0.5 * sin(z * 1.3), 8.0);
  vec3 col = base * (0.45 + 0.55 * panel);
  col += vec3(0.25, 0.85, 1.0) * seam * (0.35 + 0.9 * bands);
  col += vec3(1.0, 0.55, 0.3) * bands * 0.25;
  // particle lights riding the walls
  vec2 pg = vec2(u * 46.0, z * 5.0);
  vec2 pc = floor(pg);
  float h = hsh(vec2(mod(pc.x, 46.0), pc.y));
  vec2 pf = fract(pg) - vec2(0.5 + 0.3 * (h - 0.5), 0.5);
  float spark = step(0.9, h) * smoothstep(0.18, 0.0, length(pf * vec2(1.0, 0.6 - 0.45 * uBoost)));
  col += vec3(1.0, 0.85, 0.6) * spark * 1.6;
  // speed burst: streaks along the tube
  col += vec3(0.5, 0.9, 1.0) * uBoost * 0.35 * smoothstep(0.6, 1.0, vno(vec2(u * 60.0, z * 0.3)));
  float depth = smoothstep(0.02, 0.5, r);
  col *= depth;
  col += vec3(0.6, 0.85, 1.0) * 0.18 * exp(-r * 14.0);
  gl_FragColor = vec4(col, 1.0);
}`;
function M756() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ms = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, z: 0, last: -1 });
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.3 * Math.sin(t * 0.8)), h * (0.5 + 0.25 * Math.sin(t * 1.3 + 0.7))],
    (px, py) => {
      const el = root.current;
      if (!el) return;
      ms.current.tx = px / el.clientWidth;
      ms.current.ty = 1 - py / el.clientHeight;
    },
  );
  return (
    <Stage r={root} g1="rgba(80,210,255,.55)" g2="rgba(170,110,255,.3)" top>
      <Shader
        frag={M756_FRAG}
        fb="m756-fb"
        uniforms={() => ({ uMouse: { value: [0.5, 0.5] }, uZ: { value: 0 }, uBoost: { value: 0 } })}
        onFrame={(u, t) => {
          const s = ms.current;
          const dt = s.last < 0 ? 0 : Math.min(0.05, t - s.last);
          s.last = t;
          s.x += (s.tx - s.x) * Math.min(1, dt * 2.5);
          s.y += (s.ty - s.y) * Math.min(1, dt * 2.5);
          const boost = Math.pow(0.5 + 0.5 * Math.sin(t * 0.9), 6);
          s.z += dt * (1.1 + 3.2 * boost);
          u.uMouse.value = [s.x, s.y];
          u.uZ.value = s.z;
          u.uBoost.value = boost;
        }}
      />
      <div className="pointer-events-none absolute bottom-[8%] left-[6%] z-20">
        <p className="text-[13px] uppercase tracking-[0.3em] text-[#8fe6ff]" style={{ fontFamily: F.mr }}>
          Hyperline Transit · Pass
        </p>
        <h3 className="mt-3 text-[clamp(40px,4.4vw,72px)] font-[600] leading-[0.95] tracking-[-0.02em]" style={{ fontFamily: F.sg }}>
          Never stop moving
        </h3>
        <p className="mt-3 text-[15px] tabular-nums text-white/75" style={{ fontFamily: F.sg }}>
          Monthly pass · ₹ 1,450
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── M757 · Shape tunnel burst ───────────────────────── */
type Shape = { a: number; z: number; spin: number; kind: number; col: string; rot: number; vr: number };
const M757_COL = ["#ff5d8f", "#ffb547", "#5fd0ff", "#9a7bff", "#5dffb0", "#ffffff"];
function M757() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ sh: [] as Shape[], rnd: rng(5) });
  const spawn = (s: { rnd: () => number }, z: number): Shape => ({
    a: s.rnd() * Math.PI * 2,
    z,
    spin: 0.35 + s.rnd() * 0.5,
    kind: Math.floor(s.rnd() * 4),
    col: M757_COL[Math.floor(s.rnd() * M757_COL.length)],
    rot: s.rnd() * 6.28,
    vr: (s.rnd() - 0.5) * 3,
  });
  useCanvas(
    root,
    cv,
    (g, w, h, _t, dt, fresh) => {
      const s = st.current;
      if (s.sh.length === 0) s.sh = Array.from({ length: 150 }, (_, i) => spawn(s, 0.05 + (i / 150) * 0.95));
      if (fresh) {
        g.fillStyle = "#08050e";
        g.fillRect(0, 0, w, h);
      }
      // short trails
      g.globalAlpha = 1 - Math.exp(-dt * 14);
      g.fillStyle = "#08050e";
      g.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const md = Math.min(w, h);
      // far first, so near shapes paint on top
      s.sh.sort((p, q) => q.z - p.z);
      for (let i = 0; i < s.sh.length; i++) {
        const p = s.sh[i];
        p.z -= dt * 0.24;
        p.a += dt * p.spin * (0.4 + 0.6 / (p.z * 4 + 0.3)); // spiral tightens into a swirl as they come close
        p.rot += dt * p.vr;
        if (p.z < 0.035) {
          s.sh[i] = spawn(s, 1);
          continue;
        }
        const rr = (md * 0.035) / p.z;
        const x = cx + Math.cos(p.a) * rr * (w / md);
        const y = cy + Math.sin(p.a) * rr;
        const size = (md * 0.0055) / p.z;
        g.globalAlpha = Math.min(1, (1 - p.z) * 3);
        g.fillStyle = p.col;
        g.strokeStyle = p.col;
        g.save();
        g.translate(x, y);
        g.rotate(p.rot);
        g.beginPath();
        if (p.kind === 0) {
          g.arc(0, 0, size, 0, 6.283);
          g.fill();
        } else if (p.kind === 1) {
          g.fillRect(-size, -size, size * 2, size * 2);
        } else if (p.kind === 2) {
          g.moveTo(0, -size * 1.2);
          g.lineTo(size * 1.05, size * 0.7);
          g.lineTo(-size * 1.05, size * 0.7);
          g.closePath();
          g.fill();
        } else {
          g.lineWidth = Math.max(1.5, size * 0.35);
          g.arc(0, 0, size, 0, 6.283);
          g.stroke();
        }
        g.restore();
      }
      g.globalAlpha = 1;
    },
    3,
  );
  return (
    <Stage r={root} g1="rgba(255,100,160,.55)" g2="rgba(100,200,255,.3)" top>
      <div className="m757-fb absolute inset-0" aria-hidden />
      <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-[#08050e]/75 px-12 py-8 shadow-[0_0_90px_50px_rgba(8,5,14,.75)]">
          <p className="text-[13px] uppercase tracking-[0.32em] text-[#ffb547]" style={{ fontFamily: F.mr }}>
            Confetti Club · Summer fest
          </p>
          <h3 className="mt-3 text-[clamp(44px,5vw,84px)] font-[800] uppercase leading-[0.92]" style={{ fontFamily: F.sy }}>
            Into the drop
          </h3>
          <p className="mt-3 text-[15px] tabular-nums text-white/75" style={{ fontFamily: F.sg }}>
            Day pass · ₹ 2,999
          </p>
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── M758 · Rotating sphere of items ───────────────────────── */
const M758_ITEMS = ["Tee", "Cap", "Mug", "Bag", "Ink", "Pen", "Lamp", "Rug", "Vase", "Sock", "Soap", "Tea", "Oil", "Map", "Kit", "Jar", "Box", "Hat", "Cup", "Fig", "Tin", "Bowl", "Bell", "Card", "Kite", "Comb", "Dice", "Leaf", "Wax", "Silk", "Clay", "Reed", "Bead", "Knit", "Salt", "Rope", "Wool", "Jute", "Cork", "Opal"];
const M758_COL = ["#8fb4ff", "#ffb38a", "#9dffcf", "#d7a8ff", "#fff1d0"];
function M758() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const st = useRef({ pts: [] as { x: number; y: number; z: number; i: number }[], vx: 0.2, vy: 0.3, drag: false, lx: 0, ly: 0, dvx: 0, dvy: 0 });
  if (st.current.pts.length === 0) {
    const n = M758_ITEMS.length;
    st.current.pts = M758_ITEMS.map((_, i) => {
      const y = 1 - ((i + 0.5) / n) * 2;
      const rr = Math.sqrt(1 - y * y);
      const th = i * 2.39996;
      return { x: Math.cos(th) * rr, y, z: Math.sin(th) * rr, i };
    });
  }
  const rotate = (ax: number, ay: number) => {
    const ca = Math.cos(ay), sa = Math.sin(ay), cb = Math.cos(ax), sb = Math.sin(ax);
    for (const p of st.current.pts) {
      const x = p.x * ca + p.z * sa;
      const z0 = -p.x * sa + p.z * ca;
      const y = p.y * cb - z0 * sb;
      const z = p.y * sb + z0 * cb;
      p.x = x;
      p.y = y;
      p.z = z;
    }
  };
  const draw = (g: CanvasRenderingContext2D, w: number, h: number) => {
    g.clearRect(0, 0, w, h);
    const cx = w * 0.64;
    const cy = h * 0.5;
    const R = Math.min(h * 0.4, w * 0.27);
    const halo = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.2);
    halo.addColorStop(0, "rgba(120,150,255,.16)");
    halo.addColorStop(1, "rgba(120,150,255,0)");
    g.fillStyle = halo;
    g.fillRect(cx - R * 1.3, cy - R * 1.3, R * 2.6, R * 2.6);
    const order = [...st.current.pts].sort((a, b) => a.z - b.z);
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (const p of order) {
      const k = (p.z + 1) / 2; // 0 back .. 1 front
      const sc = 0.55 + 0.6 * k;
      const x = cx + p.x * R;
      const y = cy + p.y * R;
      const rr = 26 * sc;
      g.globalAlpha = 0.18 + 0.82 * k;
      g.fillStyle = "#11152a";
      g.strokeStyle = M758_COL[p.i % M758_COL.length];
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, y, rr, 0, 6.283);
      g.fill();
      g.stroke();
      g.fillStyle = M758_COL[p.i % M758_COL.length];
      g.font = `600 ${Math.round(13 * sc + 2)}px "Space Grotesk Variable", system-ui, sans-serif`;
      g.fillText(M758_ITEMS[p.i], x, y + 1);
    }
    g.globalAlpha = 1;
  };
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const down = (e: PointerEvent) => {
      st.current.drag = true;
      st.current.lx = e.clientX;
      st.current.ly = e.clientY;
    };
    const move = (e: PointerEvent) => {
      const s = st.current;
      if (!s.drag) return;
      s.dvy = (e.clientX - s.lx) * 0.006;
      s.dvx = (e.clientY - s.ly) * 0.006;
      rotate(s.dvx, s.dvy);
      s.lx = e.clientX;
      s.ly = e.clientY;
    };
    const up = () => (st.current.drag = false);
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.64 + 0.22 * Math.sin(t * 0.75)), h * (0.5 + 0.28 * Math.sin(t * 1.15 + 0.4))],
    (px, py, dt) => {
      const el = root.current;
      const s = st.current;
      if (!el) return;
      // the pointer steers the spin (offset from the sphere centre); a drag adds a fling that decays
      const tvy = 0.25 + ((px - el.clientWidth * 0.64) / el.clientWidth) * 2.4;
      const tvx = ((py - el.clientHeight * 0.5) / el.clientHeight) * 1.6;
      const e = Math.min(1, dt * 2);
      s.vx += (tvx - s.vx) * e;
      s.vy += (tvy - s.vy) * e;
      if (!s.drag) {
        rotate((s.vx + s.dvx * 30) * dt, (s.vy + s.dvy * 30) * dt);
        s.dvx *= 0.94;
        s.dvy *= 0.94;
      }
      const fr = fit(cv.current);
      if (fr) draw(fr.g, fr.w, fr.h);
    },
  );
  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const fr = fit(cv.current);
    if (fr) draw(fr.g, fr.w, fr.h);
  });
  return (
    <Stage r={root} g1="rgba(130,160,255,.55)" g2="rgba(255,170,130,.26)" className="cursor-grab">
      <div className="m758-fb absolute inset-0" aria-hidden />
      <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="absolute inset-y-0 left-[6%] flex items-center">
        <Copy eyebrow="Common Goods · General store" title={<>Forty things<br />in one orbit</>} line="Every category on a slowly turning sphere. Drag to spin it; items at the back shrink and dim." price="Curated box · ₹ 2,650" accent="#9dbaff" className="w-[min(38vw,520px)]" />
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── M759 · Radar sweep (CSS) ───────────────────────── */
const M759_PINS = [
  { a: 38, r: 30, name: "Kiosk 04", d: "1.2 km" },
  { a: 102, r: 40, name: "Studio East", d: "2.8 km" },
  { a: 165, r: 22, name: "Pop-up 11", d: "0.8 km" },
  { a: 228, r: 36, name: "Depot West", d: "3.4 km" },
  { a: 300, r: 18, name: "Corner shop", d: "0.5 km" },
  { a: 335, r: 42, name: "Market hall", d: "4.1 km" },
];
function M759() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.classList.add("m759-off");
    const io = new IntersectionObserver(([e]) => el.classList.toggle("m759-off", !e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Stage r={root} g1="rgba(110,255,190,.55)" g2="rgba(90,150,255,.24)">
      <div className="flex h-full w-full items-center justify-between gap-[5%] px-[6%]">
        <Copy eyebrow="Fieldnote Coffee · Stores" title={<>Find us<br />near you</>} line="A sweep beam circles the map; each store lights up the moment the beam passes over it." price="Six stores open now" accent="#9dffd0" className="w-[min(36vw,480px)]" />
        <div className="relative aspect-square h-[84%] shrink-0">
          <div className="absolute inset-0 rounded-full border border-[#9dffd0]/30 bg-[radial-gradient(circle,rgba(20,60,45,.55),rgba(5,14,12,.9)_70%)]" />
          {[0.25, 0.5, 0.75].map((k) => (
            <div key={k} className="absolute rounded-full border border-[#9dffd0]/20" style={{ inset: `${(k * 50).toFixed(1)}%` }} />
          ))}
          <div className="absolute left-1/2 top-0 h-full w-px bg-[#9dffd0]/15" />
          <div className="absolute left-0 top-1/2 h-px w-full bg-[#9dffd0]/15" />
          <div className="m759-beam" aria-hidden />
          {M759_PINS.map((p) => {
            const rad = (p.a * Math.PI) / 180;
            const left = 50 + p.r * Math.sin(rad);
            const top = 50 - p.r * Math.cos(rad);
            const delay = `${((p.a / 360) * 4).toFixed(2)}s`;
            return (
              <div key={p.name}>
                <span className="m759-blip" style={{ left: `${left}%`, top: `${top}%`, animationDelay: delay }} />
                <span className="m759-tag absolute whitespace-nowrap text-[12px] text-[#c8ffe4]" style={{ left: `calc(${left}% + 14px)`, top: `calc(${top}% - 9px)`, animationDelay: delay, fontFamily: F.mr }}>
                  {p.name} · {p.d}
                </span>
              </div>
            );
          })}
          <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_4px_rgba(160,255,215,.7)]" />
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── M760 · Evil eye (WebGL, scripted pointer) ───────────────────────── */
const M760_FRAG = /* glsl */ `
uniform vec2 uLook;
${NOISE}
void main() {
  vec2 p = (vUv * uRes - 0.5 * uRes) / uRes.y;
  float t = uTime;
  float R = 0.2;
  float r0 = length(p);
  vec2 d0 = p / max(r0, 1e-3);
  // fiery corona: noise sampled along rays that stream outward over time (seam-free: uses the direction, not the angle)
  float fl = fbm(d0 * 2.4 + d0 * (t * 1.1 - r0 * 5.0) * 0.6 + vec2(t * 0.15, -t * 0.1));
  float reach = 0.06 + 0.3 * fl * fl * 1.8;
  float fire = clamp(1.0 - (r0 - R) / reach, 0.0, 1.0) * step(R - 0.01, r0);
  vec3 col = vec3(0.02, 0.01, 0.03);
  col += mix(vec3(0.5, 0.04, 0.02), mix(vec3(1.0, 0.45, 0.08), vec3(1.0, 0.9, 0.6), fire * fire), fire) * fire * 1.15;
  col += vec3(1.0, 0.3, 0.05) * 0.12 * exp(-(r0 - R) * 6.0) * step(R, r0);
  // the iris (and pupil) follow the look direction inside the eye
  vec2 c = uLook * vec2(0.06, 0.045);
  vec2 q = p - c;
  float r = length(q);
  vec2 dq = q / max(r, 1e-3);
  float fib = fbm(dq * 7.0 + vec2(r * 1.2, 0.0) + t * 0.05);
  float fib2 = vno(dq * 22.0 + r * 2.0);
  vec3 iris = mix(vec3(0.35, 0.06, 0.02), vec3(1.0, 0.62, 0.12), fib * 0.9 + 0.1 * fib2);
  iris = mix(iris, vec3(1.0, 0.85, 0.4), smoothstep(0.12, 0.05, r) * 0.6);
  iris *= 1.0 - smoothstep(0.13, 0.2, r) * 0.65; // dark limbal ring
  float inEye = smoothstep(R, R - 0.008, r0);
  col = mix(col, iris, inEye);
  float slit = length(q * vec2(3.4, 1.0));
  float pr = 0.15 * (0.85 + 0.15 * sin(t * 1.4));
  col = mix(col, vec3(0.0), smoothstep(pr, pr - 0.01, slit) * inEye);
  col += vec3(1.0, 0.95, 0.9) * smoothstep(0.022, 0.0, length(q - vec2(-0.05, 0.06))) * inEye;
  gl_FragColor = vec4(col, 1.0);
}`;
function M760() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const lk = useRef({ x: 0, y: 0, tx: 0, ty: 0, last: -1 });
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.34 * Math.sin(t * 0.85)), h * (0.5 + 0.3 * Math.sin(t * 1.7 + 0.5))],
    (px, py) => {
      const el = root.current;
      if (!el) return;
      lk.current.tx = gsap.utils.clamp(-1, 1, (px / el.clientWidth - 0.5) * 2.4);
      lk.current.ty = gsap.utils.clamp(-1, 1, -(py / el.clientHeight - 0.5) * 2.4);
    },
  );
  return (
    <Stage r={root} g1="rgba(255,120,50,.55)" g2="rgba(255,60,40,.26)" top>
      <Shader
        frag={M760_FRAG}
        fb="m760-fb"
        dpr={0.7}
        uniforms={() => ({ uLook: { value: [0, 0] } })}
        onFrame={(u, t) => {
          const s = lk.current;
          const dt = s.last < 0 ? 0 : Math.min(0.05, t - s.last);
          s.last = t;
          s.x += (s.tx - s.x) * Math.min(1, dt * 5);
          s.y += (s.ty - s.y) * Math.min(1, dt * 5);
          u.uLook.value = [s.x, s.y];
        }}
      />
      <div className="pointer-events-none absolute left-[6%] top-[9%] z-20">
        <p className="text-[13px] uppercase tracking-[0.3em] text-[#ffb070]" style={{ fontFamily: F.mr }}>
          Talisman House · Jewellery
        </p>
        <h3 className="mt-3 text-[clamp(40px,4.4vw,72px)] leading-[0.95]" style={{ fontFamily: F.is }}>
          It sees you
        </h3>
        <p className="mt-3 text-[15px] tabular-nums text-white/75" style={{ fontFamily: F.sg }}>
          Ember eye pendant · ₹ 5,800
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── M761 · Floating 3D lines (WebGL, scripted pointer) ───────────────────────── */
const M761_FRAG = /* glsl */ `
uniform vec2 uMouse;
void main() {
  vec2 uv = vUv;
  float t = uTime;
  float asp = uRes.x / uRes.y;
  vec3 col = vec3(0.0);
  for (int i = 0; i < 16; i++) {
    float fi = float(i);
    float d = fract(fi * 0.618 + 0.13); // depth: 0 far .. 1 near
    float x = uv.x + (uMouse.x - 0.5) * 0.06 * (d - 0.5); // depth parallax
    float y = 0.5 + (fi / 15.0 - 0.5) * 0.78;
    y += (x - 0.5) * (d - 0.5) * 0.35; // lines tilt in depth
    y += 0.055 * sin(x * (2.5 + 2.0 * d) + t * (0.5 + 0.5 * d) + fi * 1.7);
    y += 0.022 * sin(x * 7.0 - t * 0.9 + fi * 2.3);
    // bend away from the pointer
    float dx = (x - uMouse.x) * asp;
    float dy = y - uMouse.y;
    float fall = exp(-dx * dx / 0.035) * exp(-dy * dy / 0.03);
    y += sign(dy + 1e-4) * 0.11 * fall * (0.6 + 0.6 * d);
    float dist = abs(uv.y - y);
    float wdt = 0.0012 + 0.0022 * d;
    float core = smoothstep(wdt, 0.0, dist);
    float glow = 0.0016 / (dist + 0.006);
    vec3 c = mix(vec3(0.35, 0.75, 1.0), mix(vec3(0.62, 0.45, 1.0), vec3(1.0, 0.5, 0.7), smoothstep(0.5, 1.0, fi / 15.0)), smoothstep(0.0, 0.6, fi / 15.0));
    float edge = smoothstep(0.0, 0.12, uv.x) * smoothstep(1.0, 0.88, uv.x);
    col += c * (core * 0.9 + glow * 0.35) * (0.3 + 0.7 * d) * edge;
  }
  col += vec3(0.02, 0.025, 0.06);
  gl_FragColor = vec4(col, 1.0);
}`;
function M761() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ms = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, last: -1 });
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.36 * Math.sin(t * 0.7)), h * (0.5 + 0.3 * Math.sin(t * 1.4 + 1.2))],
    (px, py) => {
      const el = root.current;
      if (!el) return;
      ms.current.tx = px / el.clientWidth;
      ms.current.ty = 1 - py / el.clientHeight;
    },
  );
  return (
    <Stage r={root} g1="rgba(120,170,255,.55)" g2="rgba(255,110,170,.26)" top>
      <Shader
        frag={M761_FRAG}
        fb="m761-fb"
        uniforms={() => ({ uMouse: { value: [0.5, 0.5] } })}
        onFrame={(u, t) => {
          const s = ms.current;
          const dt = s.last < 0 ? 0 : Math.min(0.05, t - s.last);
          s.last = t;
          s.x += (s.tx - s.x) * Math.min(1, dt * 4);
          s.y += (s.ty - s.y) * Math.min(1, dt * 4);
          u.uMouse.value = [s.x, s.y];
        }}
      />
      <div className="pointer-events-none absolute bottom-[8%] right-[6%] z-20 text-right">
        <p className="text-[13px] uppercase tracking-[0.3em] text-[#a9c8ff]" style={{ fontFamily: F.mr }}>
          Linea Audio · Studio monitors
        </p>
        <h3 className="mt-3 text-[clamp(40px,4.4vw,72px)] font-[600] leading-[0.95] tracking-[-0.02em]" style={{ fontFamily: F.sg }}>
          Sound, in lines
        </h3>
        <p className="mt-3 text-[15px] tabular-nums text-white/75" style={{ fontFamily: F.sg }}>
          Pair · ₹ 42,900
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── M762 · Digital loom ───────────────────────── */
const M762_WEFT = ["#d9734e", "#e7b562", "#4f63a8", "#efe3cf", "#a8463c", "#6f86c9"];
function M762() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  useCanvas(
    root,
    cv,
    (g, w, h, t) => {
      g.clearRect(0, 0, w, h);
      const x0 = w * 0.47;
      const W = w * 0.47;
      const y0 = h * 0.06;
      const H = h * 0.88;
      const NW = 30;
      const sw = W / NW;
      const rh = 12;
      const rowT = 0.5;
      const fell = y0 + H * 0.74;
      const k = Math.floor(t / rowT);
      const prog = t / rowT - k;
      // loom frame
      g.fillStyle = "rgba(20,16,12,.65)";
      g.fillRect(x0 - 18, y0 - 8, W + 36, H + 16);
      g.strokeStyle = "rgba(240,225,200,.18)";
      g.lineWidth = 1;
      g.strokeRect(x0 - 18, y0 - 8, W + 36, H + 16);
      // warp threads: straight in the cloth, splitting into two sheds below the fell (the shed flips every row)
      g.lineWidth = 3;
      g.strokeStyle = "rgba(240,230,210,.55)";
      g.beginPath();
      for (let i = 0; i < NW; i++) {
        const x = x0 + (i + 0.5) * sw;
        const up = (i + k) % 2 === 0 ? -1 : 1;
        g.moveTo(x, y0);
        g.lineTo(x, fell + rh / 2);
        g.lineTo(x + up * 4 * Math.min(1, prog * 4), y0 + H);
      }
      g.stroke();
      // woven rows: older rows ride up with the cloth; the newest row is the shuttle's partial pass
      const visible = Math.ceil((fell - y0) / rh) + 1;
      for (let j = 0; j < visible; j++) {
        const row = k - j;
        if (row < 0) break;
        const y = fell - (j + prog) * rh;
        if (y < y0 - rh) break;
        const ltr = row % 2 === 0;
        const span = j === 0 ? prog : 1;
        const xa = ltr ? x0 : x0 + W - W * span;
        const xb = ltr ? x0 + W * span : x0 + W;
        g.strokeStyle = M762_WEFT[Math.floor(row / 3) % M762_WEFT.length];
        g.lineWidth = rh * 0.72;
        g.lineCap = "round";
        g.beginPath();
        g.moveTo(xa, y);
        g.lineTo(xb, y);
        g.stroke();
        g.lineCap = "butt";
        // warp passes over the weft on alternate threads (over / under)
        g.strokeStyle = "rgba(244,236,220,.92)";
        g.lineWidth = 3;
        g.beginPath();
        for (let i = (row + 1) % 2; i < NW; i += 2) {
          const x = x0 + (i + 0.5) * sw;
          if (x < xa || x > xb) continue;
          g.moveTo(x, y - rh * 0.48);
          g.lineTo(x, y + rh * 0.48);
        }
        g.stroke();
        if (j === 0) {
          // the shuttle
          const sx = ltr ? xb : xa;
          g.fillStyle = "#f6d9a8";
          g.beginPath();
          g.ellipse(sx, y, 16, 6, 0, 0, 6.283);
          g.fill();
        }
      }
      // the cloth fades out at the top of the frame
      const fade = g.createLinearGradient(0, y0 - 8, 0, y0 + H * 0.25);
      fade.addColorStop(0, "rgba(7,9,16,1)");
      fade.addColorStop(1, "rgba(7,9,16,0)");
      g.fillStyle = fade;
      g.fillRect(x0 - 20, y0 - 10, W + 40, H * 0.25 + 10);
    },
    6.2,
  );
  return (
    <Stage r={root} g1="rgba(230,150,90,.55)" g2="rgba(90,110,200,.28)">
      <div className="absolute inset-y-[6%] left-[47%] right-[6%] m762-fb opacity-30" aria-hidden />
      <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="absolute inset-y-0 left-[6%] flex items-center">
        <Copy eyebrow="Warp & Weft · Handloom" title={<>Woven,<br />row by row</>} line="The shuttle passes, the shed flips, and the cloth climbs the loom one thread at a time." price="Indigo runner · ₹ 4,800" accent="#e7b562" className="w-[min(36vw,480px)]" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── M763 · Field of marks turning to a target ───────────────────────── */
const M763_C = 22;
const M763_R = 12;
function M763() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const st = useRef({ a: new Float32Array(M763_C * M763_R).fill(45), v: new Float32Array(M763_C * M763_R), s: new Float32Array(M763_C * M763_R).fill(1) });
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.38 * Math.sin(t * 0.62)), h * (0.5 + 0.34 * Math.sin(t * 1.24 + 0.8))],
    (px, py, dt) => {
      const f = field.current;
      if (!f) return;
      const s = st.current;
      const marks = f.children;
      const fw = f.clientWidth;
      const fh = f.clientHeight;
      for (let i = 0; i < marks.length; i++) {
        const c = i % M763_C;
        const r = Math.floor(i / M763_C);
        const mx = ((c + 0.5) / M763_C) * fw;
        const my = ((r + 0.5) / M763_R) * fh;
        const dx = px - mx;
        const dy = py - my;
        const dist = Math.hypot(dx, dy);
        const pull = Math.exp(-dist / 380);
        // aim at the pointer when close, relax back to the resting 45° when far (a soft spring, unwrapped angles)
        const toward = (Math.atan2(dy, dx) * 180) / Math.PI;
        let diffT = toward - s.a[i];
        diffT = ((((diffT + 180) % 360) + 360) % 360) - 180;
        let diffR = 45 - s.a[i];
        diffR = ((((diffR + 180) % 360) + 360) % 360) - 180;
        const target = s.a[i] + diffT * pull + diffR * (1 - pull);
        s.v[i] += (target - s.a[i]) * 60 * dt;
        s.v[i] *= Math.exp(-dt * 11);
        s.a[i] += s.v[i] * dt;
        const sc = 1 + 1.4 * Math.exp(-dist / 160);
        s.s[i] += (sc - s.s[i]) * Math.min(1, dt * 8);
        const el = marks[i] as HTMLElement;
        el.style.transform = `rotate(${s.a[i].toFixed(2)}deg) scaleX(${s.s[i].toFixed(3)})`;
        el.style.opacity = (0.35 + 0.65 * pull).toFixed(3);
      }
    },
  );
  const cells = Array.from({ length: M763_C * M763_R }, (_, i) => i);
  return (
    <Stage r={root} g1="rgba(255,200,120,.55)" g2="rgba(110,160,255,.26)">
      <div ref={field} className="absolute inset-[4%]" aria-hidden>
        {cells.map((i) => (
          <span
            key={i}
            className="absolute h-[3px] w-[22px] rounded-full bg-[linear-gradient(90deg,rgba(255,214,150,.25),#ffd696)]"
            style={{ left: `calc(${(((i % M763_C) + 0.5) / M763_C) * 100}% - 11px)`, top: `calc(${((Math.floor(i / M763_C) + 0.5) / M763_R) * 100}% - 1.5px)`, transform: "rotate(45deg)", opacity: 0.5 }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-[8%] left-[6%] z-20 rounded-[20px] bg-[#070910]/85 px-8 py-6 shadow-[0_0_60px_30px_rgba(7,9,16,.85)]">
        <p className="text-[13px] uppercase tracking-[0.3em] text-[#ffd696]" style={{ fontFamily: F.mr }}>
          True North · Field compass
        </p>
        <h3 className="mt-2 text-[clamp(36px,3.8vw,60px)] leading-[0.98]" style={{ fontFamily: F.fr }}>
          Everything points your way
        </h3>
        <p className="mt-2 text-[15px] tabular-nums text-white/75" style={{ fontFamily: F.sg }}>
          Brass compass · ₹ 2,950
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "M752", name: "Glyph matrix", how: "A canvas grid of glyphs: every ~90 ms about 4% of the cells swap glyph and colour with a bright flash; the bottom fades out", kind: "play", C: M752 },
  { code: "M753", name: "Character rain", how: "Columns of random glyphs fall down the canvas, bright heads and amber tails fading behind them", kind: "play", C: M753 },
  { code: "M754", name: "Sine terrain horizon", how: "A perspective terrain of wave lines glides to a banded sun on the horizon; the pointer tilts the view (scripted pointer)", kind: "play", C: M754 },
  { code: "M755", name: "Cube grid wave", how: "A WebGL grid of cubes rises and falls in a radial wave from the centre, tinted by height, while the lattice slowly orbits", kind: "play", C: M755 },
  { code: "M756", name: "Infinite tube tunnel", how: "A WebGL panelled tube streams toward the camera with riding lights and speed bursts; the pointer bends its path (scripted)", kind: "play", C: M756 },
  { code: "M757", name: "Shape tunnel burst", how: "Colourful flat shapes spawn at the centre and spiral outward, scaling up toward the edges like flying through a tunnel", kind: "play", C: M757 },
  { code: "M758", name: "Rotating sphere of items", how: "Item badges sit on a turning sphere; the pointer steers the spin, drag flings it, back items shrink and dim (scripted pointer)", kind: "play", C: M758 },
  { code: "M759", name: "Radar sweep", how: "A CSS sweep beam circles concentric rings; each store pin blips and pings as the beam passes over it", kind: "play", C: M759 },
  { code: "M760", name: "Evil eye", how: "A WebGL iris with a slit pupil follows the pointer inside a streaming fiery corona (scripted pointer)", kind: "play", C: M760 },
  { code: "M761", name: "Floating 3D lines", how: "WebGL lines float at different depths and bend away from the pointer as it passes (scripted pointer)", kind: "play", C: M761 },
  { code: "M762", name: "Digital loom", how: "A shuttle weaves coloured weft over and under the warp row by row while the cloth climbs the loom", kind: "play", C: M762 },
  { code: "M763", name: "Field of marks turning to a target", how: "A grid of small marks swings toward the pointer and grows near it, springing back to rest as it leaves (scripted pointer)", kind: "play", C: M763 },
];
