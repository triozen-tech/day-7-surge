"use client";

// Ambient motions, batch 16 · group 2 (MOTION-MENU M728–M739): halftone nebula, riso scanlines, CRT warp, VHS look,
// volumetric glitch, falling beams, converging threads, warp tunnel, moire field, constellation, scatter dust, vortex.
// Small focused demos for /lab/motion. All are "play": they start on screen, loop, and pause off screen. Every stage has
// a CSS-only glow loop that never stops (covered stages also get an on-top glow). Pointer demos drive a visible fake
// pointer ring by themselves; the real mouse takes over while it moves. WebGL is built only near the viewport (dpr 1,
// 0.7 for the per-pixel riso shader) and released on unmount. ?static=1 / reduced motion: no JS motion, CSS loops stop,
// the markup shows a sensible still state (CSS fallbacks under every canvas).
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { createShader, type GLHandle } from "@/lib/gl";
import { scene, toCanvas, useTicker } from "@/components/fx/shared";
import type { MotionDef } from "./types";

const F = {
  sg: "'Space Grotesk Variable', system-ui, sans-serif",
  fr: "'Fraunces Variable', Georgia, serif",
  is: "'Instrument Serif', Georgia, serif",
  sy: "'Syne Variable', 'Space Grotesk Variable', system-ui, sans-serif",
  mr: "'Manrope Variable', system-ui, sans-serif",
};

const CSS = `
.b16g2-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(140,120,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(80,200,255,.24)),transparent 70%);animation:b16g2-drift 5.6s linear infinite alternate;will-change:transform}
.b16g2-top{position:absolute;inset:-20%;pointer-events:none;z-index:30;mix-blend-mode:screen;opacity:.45;background:radial-gradient(30% 34% at 40% 42%,var(--g1,rgba(140,120,255,.55)),transparent 70%);animation:b16g2-drift2 4.8s linear infinite alternate;will-change:transform}
@keyframes b16g2-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
@keyframes b16g2-drift2{0%{transform:translate3d(9%,6%,0) scale(1.1)}100%{transform:translate3d(-9%,-4%,0) scale(.95)}}
.b16g2-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);pointer-events:none;z-index:40;opacity:0;transition:opacity .25s}

/* M729 riso fallback */
.m729-fb{filter:grayscale(1) contrast(1.2) sepia(.5) hue-rotate(-30deg);mix-blend-mode:multiply;opacity:.85}

/* M731 VHS */
.m731-wob{animation:m731-wob 2.3s steps(23) infinite}
@keyframes m731-wob{0%,100%{transform:translate3d(0,0,0)}9%{transform:translate3d(-3px,0,0)}17%{transform:translate3d(2px,1px,0)}31%{transform:translate3d(-1px,0,0)}44%{transform:translate3d(4px,0,0)}52%{transform:translate3d(0,-1px,0)}63%{transform:translate3d(-4px,0,0)}78%{transform:translate3d(2px,0,0)}88%{transform:translate3d(-2px,1px,0)}}
.m731-r{mix-blend-mode:screen;opacity:.55;animation:m731-cr 1.7s ease-in-out infinite alternate}
.m731-c{mix-blend-mode:screen;opacity:.5;animation:m731-cc 1.3s ease-in-out infinite alternate}
@keyframes m731-cr{0%{transform:translate3d(-5px,0,0)}100%{transform:translate3d(-11px,1px,0)}}
@keyframes m731-cc{0%{transform:translate3d(5px,0,0)}100%{transform:translate3d(10px,-1px,0)}}
.m731-band{position:absolute;left:0;right:0;top:0;height:14%;overflow:hidden;animation:m731-band 3.2s linear infinite;z-index:5}
.m731-band-in{position:absolute;left:0;right:0;top:0;height:714.29%;animation:m731-bandin 3.2s linear infinite}
@keyframes m731-band{0%{transform:translate3d(0,-100%,0)}100%{transform:translate3d(0,714.29%,0)}}
@keyframes m731-bandin{0%{transform:translate3d(16px,14%,0)}100%{transform:translate3d(16px,-100%,0)}}
.m731-noise{background:repeating-linear-gradient(0deg,rgba(255,255,255,.22) 0 1px,transparent 1px 3px),linear-gradient(90deg,transparent,rgba(255,255,255,.25) 30%,rgba(255,255,255,.1) 60%,transparent);mix-blend-mode:screen}
.m731-lines{background:repeating-linear-gradient(0deg,rgba(0,0,0,.28) 0 2px,transparent 2px 4px);animation:m731-roll 1.2s linear infinite}
@keyframes m731-roll{0%{background-position:0 0}100%{background-position:0 8px}}
.m731-rec{animation:m731-blink 1s steps(2) infinite}
@keyframes m731-blink{0%{opacity:1}100%{opacity:.15}}

/* M732 grid */
.m732-flare{transform-box:fill-box;transform-origin:center}

/* M735 warp tunnel */
.m735-room{position:absolute;inset:0;perspective:520px;perspective-origin:50% 50%;overflow:hidden}
.m735-w{position:absolute;transform-style:preserve-3d;background-color:rgba(10,8,24,.6);background-image:linear-gradient(rgba(170,140,255,.32) 1px,transparent 1px),linear-gradient(90deg,rgba(170,140,255,.32) 1px,transparent 1px);background-size:80px 80px}
.m735-fl{left:0;bottom:0;width:100%;height:1600px;transform-origin:50% 100%;transform:rotateX(90deg);animation:m735-gy 2.4s linear infinite}
.m735-ce{left:0;top:0;width:100%;height:1600px;transform-origin:50% 0;transform:rotateX(-90deg);animation:m735-gy 2.4s linear infinite reverse}
.m735-le{left:0;top:0;width:1600px;height:100%;transform-origin:0 50%;transform:rotateY(90deg);animation:m735-gx 2.4s linear infinite reverse}
.m735-ri{right:0;top:0;width:1600px;height:100%;transform-origin:100% 50%;transform:rotateY(-90deg);animation:m735-gx 2.4s linear infinite}
@keyframes m735-gy{0%{background-position:0 0}100%{background-position:0 80px}}
@keyframes m735-gx{0%{background-position:0 0}100%{background-position:80px 0}}
.m735-b{position:absolute;border-radius:2px;animation-timing-function:linear;animation-iteration-count:infinite}
.m735-by{width:3px;height:120px;top:0;animation-name:m735-by}
.m735-bx{height:3px;width:120px;left:0;animation-name:m735-bx}
@keyframes m735-by{0%{transform:translate3d(0,var(--a),0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translate3d(0,var(--b),0);opacity:0}}
@keyframes m735-bx{0%{transform:translate3d(var(--a),0,0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translate3d(var(--b),0,0);opacity:0}}
.m735-off .m735-b,.m735-off .m735-w{animation-play-state:paused}

/* M736 moire */
.m736-spin{transform-box:view-box;transform-origin:50% 50%;animation:m736-spin 18s linear infinite}
@keyframes m736-spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}

html.is-static .b16g2-glow,html.is-static .b16g2-top,html.is-static .m731-wob,html.is-static .m731-r,html.is-static .m731-c,html.is-static .m731-band,html.is-static .m731-band-in,html.is-static .m731-lines,html.is-static .m731-rec,html.is-static .m735-w,html.is-static .m735-b,html.is-static .m736-spin{animation:none}
html.is-static .b16g2-dot,html.is-static .m731-band,html.is-static .m735-b{display:none}
html.is-static {
  .b16g2-glow,.b16g2-top,.m731-wob,.m731-r,.m731-c,.m731-band,.m731-band-in,.m731-lines,.m731-rec,.m735-w,.m735-b,.m736-spin{animation:none}
  .b16g2-dot,.m731-band,.m735-b{display:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop (never frozen); `top` adds the on-top glow for covered stages. */
function Stage({ r, children, className = "", g1, g2, top, style }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; className?: string; g1?: string; g2?: string; top?: boolean; style?: CSSProperties }) {
  const vars = { "--g1": g1, "--g2": g2 } as CSSProperties;
  return (
    <div ref={r} className={`relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#07060d] text-[#f3f0ff] ${className}`} style={style}>
      <style href="b16g2-css" precedence="default">
        {CSS}
      </style>
      <div className="b16g2-glow" style={vars} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      {top && <div className="b16g2-top" style={vars} aria-hidden />}
    </div>
  );
}

/** "play" helper: builds the looping animation in a gsap.context, plays it only while on screen, reverts on unmount. */
function usePlay(ref: RefObject<HTMLElement | null>, build: (root: HTMLElement) => gsap.core.Animation | void) {
  const b = useRef(build);
  b.current = build;
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    let on = false;
    let anim: gsap.core.Animation | void;
    const ctx = gsap.context(() => {
      anim = b.current(root);
    }, root);
    const sync = () => {
      if (!anim) return;
      if (on) anim.play();
      else anim.pause();
    };
    sync();
    const io = new IntersectionObserver(
      ([e]) => {
        on = e.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [ref]);
}

/** The visible fake pointer ring. */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => <div ref={r} className="b16g2-dot" aria-hidden />;

/**
 * Pointer for "pointer" demos: every frame (on screen) it reports a position in root px. The real mouse wins for 2 s after
 * it last moved; otherwise `script(t, w, h)` drives the visible fake ring along a set path.
 */
function usePointer(root: RefObject<HTMLDivElement | null>, dot: RefObject<HTMLDivElement | null> | null, script: (t: number, w: number, h: number) => [number, number], frame: (x: number, y: number, dt: number, t: number) => void) {
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
    if (dot?.current) {
      dot.current.style.opacity = live ? "0" : "1";
      dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
    }
    fr.current(x, y, Math.min(dt, 0.05), t);
  });
}

/** Sizes a 2D canvas to its box at dpr 1; returns the context and size. */
function fit(c: HTMLCanvasElement) {
  const w = Math.max(1, Math.round(c.clientWidth));
  const h = Math.max(1, Math.round(c.clientHeight));
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
  return { g: c.getContext("2d"), w, h };
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

/** Full-bleed fragment shader (OGL via lib/gl). Built only near the viewport; draws only while on screen; released on unmount. */
function Shader({ frag, fallback, dpr = 1, image, children }: { frag: string; fallback: ReactNode; dpr?: number; image?: () => string; children?: ReactNode }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const im = useRef(image);
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let dead = false;
    let h: GLHandle | null = null;
    const stop = whenNear(c, async () => {
      const textures = im.current ? [await toCanvas(im.current(), 960, 600)] : [];
      if (dead) return;
      h = await createShader(c, frag, { dpr, textures });
      if (dead) h?.destroy();
    });
    return () => {
      dead = true;
      stop();
      h?.destroy();
    };
  }, [frag, dpr]);
  return (
    <div className="absolute inset-0">
      {fallback}
      <canvas ref={cv} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500" aria-hidden />
      {children}
    </div>
  );
}

/** Seeded random (stable layouts). */
function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/* ───────────────────────── M728 · Halftone nebula parallax (variant of M598) ───────────────────────── */
type Star = { x: number; y: number; r: number; ph: number; sp: number };
const BLOBS728 = [
  { x: 0.3, y: 0.42, r: 0.2, ax: 0.06, ay: 0.05, s: 0.21, w: 0.95 },
  { x: 0.62, y: 0.55, r: 0.24, ax: 0.07, ay: 0.06, s: 0.17, w: 0.85 },
  { x: 0.48, y: 0.3, r: 0.15, ax: 0.05, ay: 0.04, s: 0.29, w: 0.7 },
  { x: 0.78, y: 0.32, r: 0.13, ax: 0.04, ay: 0.06, s: 0.23, w: 0.6 },
  { x: 0.2, y: 0.72, r: 0.14, ax: 0.05, ay: 0.03, s: 0.26, w: 0.55 },
];
const INK728 = ["#7b5cff", "#ff5fb8", "#38e0d0", "#fff1d6"];
function M728() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const st = useRef({ w: 0, h: 0, far: [] as Star[], near: [] as Star[], lx: 0, ly: 0, px: 0, py: 0 });
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.32 * Math.sin(t * 0.55)), h * (0.5 + 0.24 * Math.sin(t * 1.1 + 0.8))],
    (px, py, dt, t) => {
      const c = cv.current;
      if (!c) return;
      const { g, w, h } = fit(c);
      if (!g) return;
      const s = st.current;
      if (w !== s.w || h !== s.h) {
        s.w = w;
        s.h = h;
        const r = rng(11);
        s.far = Array.from({ length: 160 }, () => ({ x: r() * w, y: r() * h, r: 0.6 + r() * 0.8, ph: r() * 6.28, sp: 1 + r() * 2 }));
        s.near = Array.from({ length: 36 }, () => ({ x: r() * w, y: r() * h, r: 1.2 + r() * 1.4, ph: r() * 6.28, sp: 1.5 + r() * 2.5 }));
        s.px = px;
        s.py = py;
      }
      const e = Math.min(1, dt * 3);
      s.px += (px - s.px) * e;
      s.py += (py - s.py) * e;
      s.lx = (s.px - w / 2) / w;
      s.ly = (s.py - h / 2) / h;
      g.fillStyle = "#06050c";
      g.fillRect(0, 0, w, h);
      // depth 1: far stars (small parallax)
      g.fillStyle = "#cfd6ff";
      for (const p of s.far) {
        g.globalAlpha = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * p.sp + p.ph));
        g.fillRect(((p.x - s.lx * 14 + w) % w) | 0, (p.y - s.ly * 10) | 0, p.r, p.r);
      }
      g.globalAlpha = 1;
      // depth 2: halftone gas (mid parallax); pointer adds light to the cells near it
      const cell = 12;
      const ox = -s.lx * 36;
      const oy = -s.ly * 24;
      const cols = Math.ceil(w / cell) + 1;
      const rows = Math.ceil(h / cell) + 1;
      const paths = INK728.map(() => new Path2D());
      const bl = BLOBS728.map((b) => ({ x: (b.x + b.ax * Math.sin(t * b.s + b.r * 9)) * w, y: (b.y + b.ay * Math.cos(t * b.s * 1.3 + b.x * 7)) * h, k: 1 / (2 * (b.r * w) ** 2), w: b.w }));
      const lr = 1 / (2 * 150 * 150);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * cell + ox;
          const y = j * cell + oy;
          let b = 0;
          for (const q of bl) {
            const dx = x - q.x;
            const dy = y - q.y;
            b += q.w * Math.exp(-(dx * dx + dy * dy) * q.k);
          }
          b += 0.16 * Math.sin(x * 0.012 + t * 0.4) * Math.sin(y * 0.018 - t * 0.3);
          const dpx = x - s.px;
          const dpy = y - s.py;
          const lit = Math.exp(-(dpx * dpx + dpy * dpy) * lr);
          b = Math.min(1, b + lit * 0.8);
          if (b < 0.07) continue;
          const sz = cell * 0.92 * Math.sqrt(b);
          const hue = 0.5 + 0.5 * Math.sin(x * 0.0042 + y * 0.003 + t * 0.12);
          const k = lit > 0.55 ? 3 : hue < 0.33 ? 0 : hue < 0.66 ? 1 : 2;
          paths[k].rect(x - sz / 2, y - sz / 2, sz, sz);
        }
      }
      paths.forEach((p, k) => {
        g.fillStyle = INK728[k];
        g.globalAlpha = k === 3 ? 0.95 : 0.8;
        g.fill(p);
      });
      // depth 3: near stars (big parallax, cross glints)
      g.globalAlpha = 1;
      g.fillStyle = "#ffffff";
      for (const p of s.near) {
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * p.sp + p.ph));
        const x = (((p.x - s.lx * 70) % w) + w) % w;
        const y = p.y - s.ly * 46;
        g.globalAlpha = a;
        g.fillRect(x - p.r, y - p.r, p.r * 2, p.r * 2);
        g.globalAlpha = a * 0.5;
        g.fillRect(x - p.r * 4, y - 0.5, p.r * 8, 1);
        g.fillRect(x - 0.5, y - p.r * 4, 1, p.r * 8);
      }
      g.globalAlpha = 1;
    },
  );
  return (
    <Stage r={root} g1="rgba(140,100,255,.55)" g2="rgba(255,95,184,.25)" top>
      <div className="absolute inset-0" style={{ background: "radial-gradient(40% 50% at 35% 45%,rgba(123,92,255,.55),transparent 70%),radial-gradient(35% 45% at 65% 55%,rgba(255,95,184,.4),transparent 70%),#06050c" }} aria-hidden />
      <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute bottom-[9%] left-[7%] z-20">
        <p className="text-[13px] uppercase tracking-[0.3em] text-[#9fefe5]" style={{ fontFamily: F.mr }}>
          Orbitry Planetarium · Night show
        </p>
        <h3 className="mt-3 text-[clamp(44px,5vw,80px)] font-[600] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.sg }}>
          Deep field, live.
        </h3>
        <p className="mt-3 text-[16px] text-white/70" style={{ fontFamily: F.mr }}>
          Dome seats from ₹ 450
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── M729 · Riso scanline print (variant of M70) ───────────────────────── */
const FRAG729 = /* glsl */ `
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float lum(vec2 uv){ vec3 c = texture2D(uTex0, cover(uv, uTexRes0)).rgb; return dot(c, vec3(.3, .59, .11)); }
void main(){
  vec2 uv = vUv;
  vec2 px = uv * uRes;
  float t = uTime;
  // two inks, slightly mis-registered, drifting against each other
  vec2 o1 = vec2(sin(t * .5) * 4., cos(t * .37) * 2.) / uRes;
  vec2 o2 = vec2(cos(t * .41) * -4., sin(t * .29) * 3.) / uRes;
  float d1 = 1. - lum(uv + o1);
  float d2 = 1. - lum(uv + o2);
  // ink 1: horizontal scanlines, thickness by darkness, scrolling down slowly
  float p1 = 6.;
  float y1 = fract((px.y + t * 7.) / p1);
  float line1 = smoothstep(.06, 0., abs(y1 - .5) - d1 * .48);
  // ink 2: finer scanlines scrolling up
  float p2 = 4.5;
  float y2 = fract((px.y - t * 5. + px.x * .02) / p2);
  float line2 = smoothstep(.08, 0., abs(y2 - .5) - pow(d2, 1.4) * .5);
  // stipple dither in the light areas (coarse grain, reseeded slowly)
  vec2 cell = floor(px / 1.6);
  float seed = floor(t * 3.);
  float st1 = step(hash(cell + seed), pow(d1, 2.) * .55);
  float st2 = step(hash(cell * 1.7 + seed + 9.), d2 * .25);
  float ink1 = clamp(max(line1 * (.55 + .45 * d1), st1 * .7), 0., 1.);
  float ink2 = clamp(max(line2 * .85, st2 * .6), 0., 1.);
  vec3 paper = vec3(.96, .93, .86) * (.96 + .04 * hash(floor(px / 3.)));
  vec3 pink = vec3(1., .33, .55);
  vec3 blue = vec3(.15, .35, .85);
  vec3 col = paper;
  col *= mix(vec3(1.), pink, ink1);
  col *= mix(vec3(1.), blue, ink2 * .9);
  gl_FragColor = vec4(col, 1.);
}`;
function M729() {
  return (
    <Stage g1="rgba(255,90,150,.55)" g2="rgba(60,110,255,.3)" top>
      <div className="flex h-full w-full items-center gap-[5%] px-[6%]">
        <div className="relative h-[82%] flex-1 overflow-hidden rounded-[18px] bg-[#f5eedc] shadow-[0_30px_90px_rgba(0,0,0,.5)]">
          <Shader
            frag={FRAG729}
            dpr={0.7}
            image={() => scene(1, 960, 600)}
            fallback={
              // eslint-disable-next-line @next/next/no-img-element
              <img src={scene(1, 960, 600)} alt="" className="m729-fb absolute inset-0 h-full w-full object-cover" />
            }
          />
        </div>
        <div className="w-[30%]">
          <p className="text-[13px] uppercase tracking-[0.28em] text-[#ff8fb1]" style={{ fontFamily: F.mr }}>
            Two-ink press · Edition 12
          </p>
          <h3 className="mt-4 text-[clamp(40px,4.2vw,68px)] leading-[0.98]" style={{ fontFamily: F.fr }}>
            Printed in pink and blue.
          </h3>
          <p className="mt-4 text-[16px] leading-relaxed text-white/65" style={{ fontFamily: F.mr }}>
            A3 riso poster, hand pulled at Marrowline Press.
          </p>
          <p className="mt-6 text-[22px] tabular-nums" style={{ fontFamily: F.sg }}>
            ₹ 1,800
          </p>
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── M730 · CRT warp (variant of M70) ───────────────────────── */
const FRAG730 = /* glsl */ `
vec2 barrel(vec2 uv, float k){ vec2 c = uv * 2. - 1.; float r2 = dot(c, c); c *= 1. + k * r2 + k * .4 * r2 * r2; return c * .5 + .5; }
void main(){
  float t = uTime;
  float k = .13 + .05 * sin(t * .7);
  vec2 q = barrel(vUv, k);
  if (q.x < 0. || q.x > 1. || q.y < 0. || q.y > 1.) { gl_FragColor = vec4(.02, .02, .03, 1.); return; }
  vec2 p = (q - .5) * vec2(uRes.x / uRes.y, 1.) * 6.;
  float v = sin(p.x + t) + sin((p.y + t) * .7) + sin((p.x + p.y + t * 1.3) * .6);
  vec2 cc = p + vec2(sin(t * .4) * 3., cos(t * .3) * 2.);
  v += sin(length(cc) * 1.4 - t * 1.2);
  vec3 col = .5 + .5 * cos(3.14159 * v * .5 + vec3(0., 2.1, 4.2) + t * .2);
  col = mix(col, col * vec3(.4, 1., .75), .35);
  // bloom-ish lift of the brights
  col += pow(col, vec3(3.)) * .55;
  // scanlines + aperture grille
  float sl = .72 + .28 * sin(q.y * uRes.y * 1.5);
  col *= sl;
  float m = mod(gl_FragCoord.x, 3.);
  col *= vec3(m < 1. ? 1.1 : .82, m >= 1. && m < 2. ? 1.1 : .82, m >= 2. ? 1.1 : .82);
  // rolling bright bar + flicker
  col += .07 * smoothstep(.12, 0., abs(fract(q.y - t * .18) - .5));
  col *= .96 + .04 * sin(t * 47.);
  // curved-glass vignette
  vec2 e = q * (1. - q);
  col *= pow(e.x * e.y * 16., .25);
  gl_FragColor = vec4(col, 1.);
}`;
function M730() {
  return (
    <Stage g1="rgba(90,255,190,.5)" g2="rgba(255,120,220,.25)" top>
      <div className="flex h-full w-full items-center justify-center">
        <div className="relative aspect-[4/3] h-[84%] rounded-[46px] bg-[#1a1714] p-[2.4%] shadow-[0_40px_120px_rgba(0,0,0,.6),inset_0_2px_0_rgba(255,255,255,.08)]">
          <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-black">
            <Shader
              frag={FRAG730}
              fallback={<div className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 40% 45%,rgba(90,255,190,.55),transparent 70%),radial-gradient(50% 50% at 65% 60%,rgba(255,120,220,.45),transparent 70%),#050608" }} />}
            >
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-[13px] uppercase tracking-[0.36em] text-white/80" style={{ fontFamily: F.mr }}>
                  CH 07 · Late signal
                </p>
                <h3 className="mt-3 text-[clamp(40px,4.4vw,72px)] font-[800] uppercase leading-none tracking-[-0.02em] text-white mix-blend-overlay" style={{ fontFamily: F.sy }}>
                  Tune in
                </h3>
              </div>
            </Shader>
          </div>
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── M731 · VHS look (variant of M70) ───────────────────────── */
function M731() {
  const root = useRef<HTMLDivElement>(null);
  const tc = useRef<HTMLSpanElement>(null);
  useTicker(root, (t) => {
    if (!tc.current) return;
    const s = 14 * 60 + 32 + t;
    const f = Math.floor((t * 30) % 30);
    const p = (n: number) => String(Math.floor(n)).padStart(2, "0");
    tc.current.textContent = `00:${p((s / 60) % 60)}:${p(s % 60)}:${p(f)}`;
  });
  const img = scene(3, 1400, 800);
  return (
    <Stage r={root} g1="rgba(255,140,90,.5)" g2="rgba(80,200,255,.25)" top>
      <div className="m731-wob absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover saturate-[1.3]" />
        {/* chroma bleed: red and cyan copies slide apart */}
        <div className="m731-r absolute inset-0" style={{ background: "rgba(255,40,40,1)", WebkitMaskImage: `url("${img}")`, maskImage: `url("${img}")`, WebkitMaskSize: "cover", maskSize: "cover", opacity: 0.35 }} aria-hidden />
        <div className="m731-c absolute inset-0" style={{ background: "rgba(40,220,255,1)", WebkitMaskImage: `url("${img}")`, maskImage: `url("${img}")`, WebkitMaskSize: "cover", maskSize: "cover", opacity: 0.3 }} aria-hidden />
        {/* tracking band: a shifted copy of the picture rolls down through a noisy strip */}
        <div className="m731-band" aria-hidden>
          <div className="m731-band-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" className="h-full w-full object-cover saturate-[1.6] hue-rotate-[18deg]" />
          </div>
          <div className="m731-noise absolute inset-0" />
        </div>
        <div className="m731-lines pointer-events-none absolute inset-0" aria-hidden />
      </div>
      <div className="pointer-events-none absolute inset-0 z-10 p-[4%] text-white" style={{ fontFamily: F.sg, textShadow: "2px 0 rgba(255,40,60,.7),-2px 0 rgba(40,220,255,.7)" }}>
        <div className="flex items-center justify-between text-[22px] uppercase tracking-[0.12em]">
          <span>
            <span className="m731-rec mr-2 inline-block h-3.5 w-3.5 rounded-full bg-[#ff3040] align-middle" />
            Play ▶
          </span>
          <span className="tabular-nums" ref={tc}>
            00:14:32:00
          </span>
        </div>
        <div className="absolute bottom-[9%] left-[4%]">
          <p className="text-[14px] uppercase tracking-[0.3em] text-white/80">Tapehouse Records · Summer 98</p>
          <h3 className="mt-2 text-[clamp(48px,5.2vw,86px)] font-[700] uppercase leading-[0.92] tracking-[-0.02em]">Rewind the summer</h3>
          <p className="mt-3 text-[18px]">Cassette box set · ₹ 2,499</p>
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── M732 · Volumetric glitch (variant of X9) ───────────────────────── */
const VW = 1400;
const VH = 700;
const HZ = 300; // horizon y
const H732 = 16;
function M732() {
  const root = useRef<HTMLDivElement>(null);
  const hl = useRef<SVGGElement>(null);
  // the floor grid pans toward the viewer: horizontal lines move on a perspective curve
  useTicker(root, (t) => {
    const g = hl.current;
    if (!g) return;
    const ls = g.children;
    for (let i = 0; i < ls.length; i++) {
      const u = ((i / H732 + t * 0.12) % 1 + 1) % 1;
      const y = HZ + (VH - HZ) * u * u;
      ls[i].setAttribute("y1", String(y));
      ls[i].setAttribute("y2", String(y));
      ls[i].setAttribute("stroke-opacity", String(0.15 + 0.6 * u));
    }
  });
  usePlay(root, (el) => {
    const disp = el.querySelector("[data-disp]");
    const r = el.querySelector("[data-r]");
    const c = el.querySelector("[data-c]");
    const slice = el.querySelector("[data-slice]");
    const flares = el.querySelectorAll("[data-flare]");
    const tl = gsap.timeline({ repeat: -1, repeatRefresh: true });
    // calm drift (RGB copies breathe) → glitch burst (displacement, slice shift, jitter, flares) → settle
    tl.to(r, { x: -4, duration: 0.5, ease: "sine.inOut" })
      .to(c, { x: 4, duration: 0.5, ease: "sine.inOut" }, "<")
      .to(disp, { attr: { scale: () => gsap.utils.random(30, 60) }, duration: 0.06, ease: "none" })
      .to(r, { x: () => gsap.utils.random(-24, -10), y: () => gsap.utils.random(-4, 4), duration: 0.06, ease: "none" }, "<")
      .to(c, { x: () => gsap.utils.random(10, 24), y: () => gsap.utils.random(-4, 4), duration: 0.06, ease: "none" }, "<")
      .to(slice, { x: () => gsap.utils.random(-60, 60), opacity: 1, duration: 0.05, ease: "none" }, "<")
      .to(flares, { opacity: () => gsap.utils.random(0.5, 1), scale: () => gsap.utils.random(0.8, 1.5), duration: 0.12, ease: "power2.out", stagger: 0.04 }, "<")
      .to(disp, { attr: { scale: () => gsap.utils.random(-40, -10) }, duration: 0.07, ease: "none" })
      .to(slice, { x: () => gsap.utils.random(-30, 30), duration: 0.06, ease: "none" }, "<")
      .to(disp, { attr: { scale: 0 }, duration: 0.12, ease: "power2.out" })
      .to(slice, { x: 0, opacity: 0, duration: 0.1, ease: "power2.out" }, "<")
      .to(r, { x: -2, y: 0, duration: 0.25, ease: "power2.out" }, "<")
      .to(c, { x: 2, y: 0, duration: 0.25, ease: "power2.out" }, "<")
      .to(flares, { opacity: 0, scale: 0.6, duration: 0.45, ease: "sine.out", stagger: 0.05 }, "<");
    return tl;
  });
  const vx = Array.from({ length: 23 }, (_, i) => (i - 11) * 120);
  const word = (fill: string, attrs: Record<string, string> = {}) => (
    <text x={VW / 2} y={HZ - 10} textAnchor="middle" fontFamily={F.sy} fontWeight={800} fontSize={150} letterSpacing={-4} fill={fill} {...attrs}>
      SIGNAL
    </text>
  );
  return (
    <Stage r={root} g1="rgba(120,90,255,.55)" g2="rgba(0,220,255,.3)" top>
      <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <filter id="m732-f" x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.002 0.09" numOctaves={1} seed={4} result="n" />
            <feDisplacementMap data-disp in="SourceGraphic" in2="n" scale={0} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <radialGradient id="m732-fl">
            <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
            <stop offset=".25" stopColor="#8fd9ff" stopOpacity=".55" />
            <stop offset="1" stopColor="#6a4bff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="m732-hz" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#6a4bff" stopOpacity="0" />
            <stop offset=".5" stopColor="#6a4bff" stopOpacity=".5" />
            <stop offset="1" stopColor="#00dcff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="m732-cl">
            <rect x="0" y={HZ - 110} width={VW} height="38" />
          </clipPath>
        </defs>
        <rect x="0" y={HZ - 60} width={VW} height="120" fill="url(#m732-hz)" />
        <g stroke="#8f7bff" strokeWidth="1.4">
          {vx.map((x) => (
            <line key={x} x1={VW / 2 + x * 0.12} y1={HZ} x2={VW / 2 + x * 1.6} y2={VH} strokeOpacity=".45" />
          ))}
        </g>
        <g ref={hl} stroke="#9fe8ff" strokeWidth="1.4">
          {Array.from({ length: H732 }, (_, i) => {
            const u = i / H732;
            const y = HZ + (VH - HZ) * u * u;
            return <line key={i} x1="0" x2={VW} y1={y} y2={y} strokeOpacity={0.15 + 0.6 * u} />;
          })}
        </g>
        <g filter="url(#m732-f)" style={{ mixBlendMode: "screen" }}>
          <g data-r style={{ mixBlendMode: "screen" }}>{word("#ff2f6d")}</g>
          <g data-c style={{ mixBlendMode: "screen" }}>{word("#00e5ff")}</g>
          {word("#f4f1ff")}
        </g>
        <g data-slice opacity="0" clipPath="url(#m732-cl)">
          {word("#f4f1ff")}
        </g>
        {[
          [330, 210, 110],
          [1040, 160, 90],
          [760, 300, 150],
          [520, 120, 70],
        ].map(([x, y, r], i) => (
          <circle key={i} data-flare className="m732-flare" cx={x} cy={y} r={r} fill="url(#m732-fl)" opacity="0" style={{ mixBlendMode: "screen" }} />
        ))}
      </svg>
      <div className="pointer-events-none absolute bottom-[8%] left-0 right-0 text-center">
        <p className="text-[13px] uppercase tracking-[0.34em] text-[#9fe8ff]" style={{ fontFamily: F.mr }}>
          Voidline Festival · 3 nights
        </p>
        <p className="mt-2 text-[18px] text-white/75" style={{ fontFamily: F.sg }}>
          Weekend pass ₹ 5,900
        </p>
      </div>
    </Stage>
  );
}

/* ───────────────────────── M733 · Falling beams that burst ───────────────────────── */
const LANES733 = 9;
const PARTS733 = 12;
function M733() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const lanes = Array.from(el.querySelectorAll<HTMLElement>("[data-lane]"));
    const floor = el.clientHeight * 0.8;
    const master = gsap.timeline();
    lanes.forEach((lane, i) => {
      const beam = lane.querySelector("[data-beam]") as HTMLElement;
      const parts = lane.querySelectorAll("[data-part]");
      const flash = lane.querySelector("[data-flash]");
      const bh = beam.offsetHeight;
      const tl = gsap.timeline({ repeat: -1, repeatRefresh: true, repeatDelay: 0.05 + (i % 3) * 0.08 });
      tl.set(lane, { left: () => `${gsap.utils.random(4, 96)}%` })
        .fromTo(beam, { y: -bh - 20, opacity: 1 }, { y: floor - bh, duration: () => gsap.utils.random(1.1, 2.1), ease: "power1.in" })
        .set(beam, { opacity: 0 })
        .fromTo(flash, { scale: 0.2, opacity: 1 }, { scale: 1.4, opacity: 0, duration: 0.7, ease: "power2.out" }, "<")
        .fromTo(
          parts,
          { x: 0, y: 0, opacity: 1, scale: 1 },
          {
            x: () => gsap.utils.random(-90, 90),
            y: () => gsap.utils.random(-110, -20),
            opacity: 0,
            scale: 0.3,
            duration: () => gsap.utils.random(0.5, 0.8),
            ease: "power2.out",
          },
          "<",
        );
      master.add(tl, i * 0.23);
    });
    return master;
  });
  return (
    <Stage r={root} g1="rgba(110,140,255,.55)" g2="rgba(255,110,200,.25)" top>
      <div className="absolute inset-x-0 top-[80%] h-px bg-gradient-to-r from-transparent via-[#9fb4ff]/70 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 top-[80%] bottom-0 bg-gradient-to-b from-[#6f7dff]/15 to-transparent" aria-hidden />
      {Array.from({ length: LANES733 }, (_, i) => (
        <div key={i} data-lane className="absolute top-0 h-[80%] w-0" style={{ left: `${8 + i * 10.5}%` }} aria-hidden>
          <div data-beam className="absolute left-[-1px] top-0 h-[130px] w-[2px] rounded-full" style={{ background: "linear-gradient(transparent, rgba(140,160,255,.75) 70%, #ffffff)", boxShadow: "0 0 10px rgba(150,170,255,.8)", transform: `translateY(${120 + ((i * 97) % 260)}px)` }} />
          <div data-flash className="absolute bottom-[-30px] left-[-60px] h-[60px] w-[120px] rounded-[50%] opacity-0" style={{ background: "radial-gradient(closest-side, rgba(220,230,255,.95), rgba(130,150,255,.4) 50%, transparent)" }} />
          {Array.from({ length: PARTS733 }, (_, k) => (
            <span key={k} data-part className="absolute bottom-0 left-[-2px] h-[4px] w-[4px] rounded-full opacity-0" style={{ background: k % 3 ? "#cfd8ff" : "#ff9ad5", boxShadow: "0 0 6px rgba(200,210,255,.9)" }} />
          ))}
        </div>
      ))}
      <div className="pointer-events-none absolute left-[7%] top-[14%] z-10">
        <p className="text-[13px] uppercase tracking-[0.3em] text-[#a9b8ff]" style={{ fontFamily: F.mr }}>
          Lumenfall Studio · Lighting
        </p>
        <h3 className="mt-3 text-[clamp(46px,5.2vw,84px)] leading-[0.95]" style={{ fontFamily: F.is }}>
          Light that lands.
        </h3>
        <p className="mt-3 text-[16px] text-white/65" style={{ fontFamily: F.mr }}>
          Pendant rail kit · ₹ 18,400
        </p>
      </div>
    </Stage>
  );
}

/* ───────────────────────── M734 · Converging web threads ───────────────────────── */
const FRAG734 = /* glsl */ `
void main(){
  float t = uTime;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * asp, vUv.y);
  vec2 c = vec2((.5 + .16 * sin(t * .33)) * asp, .5 + .1 * sin(t * .51));
  float spread = .25 + .75 * (.5 + .5 * sin(t * .6));
  vec3 col = vec3(0.);
  float dx = p.x - c.x;
  for (int i = 0; i < 22; i++) {
    float fi = float(i) / 21.;
    float slope = (fi - .5) * 1.5 * spread * (.75 + .25 * sin(t * .4 + fi * 6.));
    float wave = sin(p.x * (4. + fi * 5.) + t * (.8 + fi) + fi * 9.) * .07 * abs(dx);
    float y = c.y + dx * slope + wave;
    float d = abs(p.y - y) * uRes.y;
    vec3 tint = mix(vec3(.35, .45, 1.), vec3(1., .4, .75), fi);
    col += tint * (.9 / (d + 1.2)) * (.55 + .45 * sin(t * 1.3 + fi * 11.));
  }
  // the meeting point glows
  float r = length(p - c);
  col += vec3(.9, .85, 1.) * .018 / (r + .02);
  col = 1. - exp(-col * 1.4);
  gl_FragColor = vec4(col, 1.);
}`;
function M734() {
  return (
    <Stage g1="rgba(120,110,255,.55)" g2="rgba(255,100,190,.25)" top>
      <Shader
        frag={FRAG734}
        fallback={
          <svg viewBox="0 0 1400 700" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            {Array.from({ length: 22 }, (_, i) => {
              const s = (i / 21 - 0.5) * 1.1;
              return <line key={i} x1="0" y1={350 - 700 * s} x2="1400" y2={350 + 700 * s} stroke={i % 2 ? "#ff74c0" : "#6f86ff"} strokeOpacity=".45" strokeWidth="1.2" />;
            })}
          </svg>
        }
      >
        <div className="pointer-events-none absolute left-[7%] top-[12%]">
          <p className="text-[13px] uppercase tracking-[0.3em] text-[#c0c8ff]" style={{ fontFamily: F.mr }}>
            Meridian Network · Summit
          </p>
          <h3 className="mt-3 text-[clamp(44px,5vw,80px)] font-[600] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.sg }}>
            Where it all meets.
          </h3>
        </div>
        <div className="pointer-events-none absolute bottom-[10%] right-[7%] text-right" style={{ fontFamily: F.sg }}>
          <p className="text-[14px] text-white/65">Delegate pass</p>
          <p className="text-[26px] tabular-nums">₹ 12,000</p>
        </div>
      </Shader>
    </Stage>
  );
}

/* ───────────────────────── M735 · Warp tunnel beams (variant of M611) ───────────────────────── */
type Beam = { wall: "fl" | "ce" | "le" | "ri"; at: number; dur: number; delay: number; away: boolean; col: string };
const COLS735 = ["#ff5fb8", "#7b8cff", "#38e0d0", "#ffd36b"];
const BEAMS735: Beam[] = (() => {
  const r = rng(29);
  const walls: Beam["wall"][] = ["fl", "ce", "le", "ri"];
  return Array.from({ length: 28 }, (_, i) => ({
    wall: walls[i % 4],
    at: Math.floor(r() * 16),
    dur: 1.4 + r() * 1.4,
    delay: -r() * 3,
    away: r() < 0.3,
    col: COLS735[Math.floor(r() * 4)],
  }));
})();
function M735() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const room = el.querySelector(".m735-room");
    const io = new IntersectionObserver(([e]) => room?.classList.toggle("m735-off", !e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const D = 1600;
  // far → near along each wall's own depth axis (see the CSS: floor far = top, ceiling far = bottom, left far = right end, right far = left end)
  const path = (b: Beam): [string, string] => {
    const near = b.wall === "fl" || b.wall === "ri" ? `${D}px` : "-120px";
    const far = b.wall === "fl" || b.wall === "ri" ? "-120px" : `${D}px`;
    return b.away ? [near, far] : [far, near];
  };
  return (
    <Stage r={root} g1="rgba(150,110,255,.55)" g2="rgba(56,224,208,.25)" top>
      <div className="m735-room">
        {(["fl", "ce", "le", "ri"] as const).map((w) => (
          <div key={w} className={`m735-w m735-${w}`}>
            {BEAMS735.filter((b) => b.wall === w).map((b, i) => {
              const [a, z] = path(b);
              const vert = w === "fl" || w === "ce";
              const lane = vert ? { left: `${(b.at * 80) % 1400}px`, marginLeft: "-1px" } : { top: `${(b.at % 9) * 80}px`, marginTop: "-1px" };
              return (
                <span
                  key={i}
                  className={`m735-b ${vert ? "m735-by" : "m735-bx"}`}
                  style={{ ...lane, background: vert ? `linear-gradient(${b.away ? "180deg" : "0deg"}, transparent, ${b.col})` : `linear-gradient(${(w === "ri") !== b.away ? "90deg" : "270deg"}, transparent, ${b.col})`, boxShadow: `0 0 12px ${b.col}`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`, "--a": a, "--b": z } as unknown as CSSProperties}
                />
              );
            })}
          </div>
        ))}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(14% 18% at 50% 50%, #07060d 30%, transparent 100%)" }} />
      </div>
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
        <p className="text-[13px] uppercase tracking-[0.34em] text-[#c9bfff]" style={{ fontFamily: F.mr }}>
          Hyperlane Mobility · Launch
        </p>
        <h3 className="mt-3 text-[clamp(46px,5.4vw,88px)] font-[800] uppercase leading-[0.92] tracking-[-0.02em]" style={{ fontFamily: F.sy }}>
          Faster than now
        </h3>
        <p className="mt-4 text-[17px] text-white/70" style={{ fontFamily: F.sg }}>
          Reserve the e-scooter · ₹ 2,000 deposit
        </p>
      </div>
    </Stage>
  );
}

/* ───────────────────────── M736 · Moire line field (variant of M612) ───────────────────────── */
function M736() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const lines = el.querySelectorAll("[data-ln]");
    const rings = el.querySelectorAll("[data-ring]");
    const drift = el.querySelector("[data-drift]");
    const tl = gsap.timeline();
    // lines draw in from their middles and out again, staggered from the centre: the draw ranges keep sliding
    tl.fromTo(lines, { drawSVG: "50% 50%" }, { drawSVG: "0% 100%", duration: 1.6, ease: "sine.inOut", stagger: { each: 0.025, from: "center", repeat: -1, yoyo: true } }, 0);
    // rings draw a moving arc window, staggered outward
    tl.fromTo(rings, { drawSVG: "0% 8%" }, { drawSVG: "45% 100%", duration: 2.2, ease: "sine.inOut", stagger: { each: 0.05, repeat: -1, yoyo: true } }, 0);
    // the ring set drifts across the lines so the interference keeps moving
    tl.fromTo(drift, { x: -90, y: -30 }, { x: 90, y: 30, duration: 3.4, ease: "sine.inOut", repeat: -1, yoyo: true }, 0);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,190,110,.55)" g2="rgba(120,140,255,.25)">
      <svg viewBox="0 0 1400 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <g transform="rotate(-18 700 350)" stroke="#f5e6cf" strokeWidth="1.3" strokeOpacity=".75">
          {Array.from({ length: 100 }, (_, i) => {
            const x = -300 + i * 20;
            return <line key={i} data-ln x1={x} y1="-400" x2={x} y2="1100" />;
          })}
        </g>
        <g data-drift>
          <g className="m736-spin" fill="none" stroke="#ffb46b" strokeWidth="1.5" strokeOpacity=".8">
            {Array.from({ length: 50 }, (_, i) => (
              <circle key={i} data-ring cx="700" cy="350" r={10 + i * 11} transform={`rotate(${i * 23} 700 350)`} />
            ))}
          </g>
        </g>
      </svg>
      <div className="pointer-events-none absolute bottom-[8%] left-[6%] z-10 rounded-[18px] bg-[#07060d]/80 px-7 py-5">
        <p className="text-[13px] uppercase tracking-[0.3em] text-[#ffc98f]" style={{ fontFamily: F.mr }}>
          Interference · Gallery 4
        </p>
        <h3 className="mt-2 text-[clamp(32px,3.2vw,52px)] leading-none" style={{ fontFamily: F.fr }}>
          Patterns in passing
        </h3>
        <p className="mt-2 text-[15px] text-white/65" style={{ fontFamily: F.mr }}>
          Entry ₹ 300 · till Sunday
        </p>
      </div>
    </Stage>
  );
}

/* ───────────────────────── M737 · Constellation network (variant of M15) ───────────────────────── */
type Nd = { x: number; y: number; vx: number; vy: number; r: number; ph: number; sp: number };
function M737() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const st = useRef({ w: 0, h: 0, n: [] as Nd[] });
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.34 * Math.sin(t * 0.6)), h * (0.5 + 0.28 * Math.cos(t * 0.85))],
    (px, py, dt, t) => {
      const c = cv.current;
      if (!c) return;
      const { g, w, h } = fit(c);
      if (!g) return;
      const s = st.current;
      if (w !== s.w || h !== s.h) {
        s.w = w;
        s.h = h;
        const r = rng(5);
        s.n = Array.from({ length: 95 }, () => ({ x: r() * w, y: r() * h, vx: (r() - 0.5) * 18, vy: (r() - 0.5) * 18, r: 0.8 + r() * 1.6, ph: r() * 6.28, sp: 1 + r() * 2.5 }));
      }
      const R = 170;
      for (const p of s.n) {
        const dx = px - p.x;
        const dy = py - p.y;
        const d = Math.hypot(dx, dy) + 0.01;
        if (d < R * 1.6) {
          // swirl: tangential push plus a gentle pull, stronger near the pointer
          const f = (1 - d / (R * 1.6)) * 90;
          p.vx += (-dy / d * f * 1.2 + (dx / d) * f * 0.5) * dt;
          p.vy += ((dx / d) * f * 1.2 + (dy / d) * f * 0.5) * dt;
        }
        p.vx *= 1 - 0.9 * dt;
        p.vy *= 1 - 0.9 * dt;
        p.vx += Math.sin(t * 0.3 + p.ph) * 3 * dt;
        p.vy += Math.cos(t * 0.27 + p.ph) * 3 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -20) p.x += w + 40;
        if (p.x > w + 20) p.x -= w + 40;
        if (p.y < -20) p.y += h + 40;
        if (p.y > h + 20) p.y -= h + 40;
      }
      g.clearRect(0, 0, w, h);
      // links bucketed by strength (4 strokes total)
      const L = 125;
      const buckets = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      for (let i = 0; i < s.n.length; i++) {
        const a = s.n[i];
        for (let j = i + 1; j < s.n.length; j++) {
          const b = s.n[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > L * L) continue;
          const k = Math.min(3, Math.floor((1 - Math.sqrt(d2) / L) * 4));
          buckets[k].moveTo(a.x, a.y);
          buckets[k].lineTo(b.x, b.y);
        }
        const pd = Math.hypot(a.x - px, a.y - py);
        if (pd < R) {
          const k = Math.min(3, Math.floor((1 - pd / R) * 4));
          buckets[k].moveTo(a.x, a.y);
          buckets[k].lineTo(px, py);
        }
      }
      g.lineWidth = 1;
      buckets.forEach((p, k) => {
        g.strokeStyle = `rgba(170,190,255,${0.08 + k * 0.12})`;
        g.stroke(p);
      });
      for (const p of s.n) {
        g.globalAlpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * p.sp + p.ph));
        g.fillStyle = "#eef2ff";
        g.beginPath();
        g.arc(p.x, p.y, p.r, 0, 6.283);
        g.fill();
      }
      g.globalAlpha = 1;
    },
  );
  return (
    <Stage r={root} g1="rgba(110,130,255,.55)" g2="rgba(190,120,255,.25)" top>
      <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute right-[7%] top-[14%] z-20 text-right">
        <p className="text-[13px] uppercase tracking-[0.3em] text-[#b6c2ff]" style={{ fontFamily: F.mr }}>
          Kindred Circle · Members
        </p>
        <h3 className="mt-3 text-[clamp(44px,5vw,80px)] leading-[0.95]" style={{ fontFamily: F.is }}>
          Everyone, connected.
        </h3>
        <p className="mt-3 text-[16px] text-white/65" style={{ fontFamily: F.mr }}>
          Annual membership · ₹ 3,600
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── M738 · Particles scatter where hovered (variant of M620) ───────────────────────── */
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; c: number };
const COL738 = ["#ffcf7a", "#ff7fa8", "#ffffff"];
function M738() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const st = useRef({ p: [] as Spark[], lx: -1, ly: -1, acc: 0 });
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.38 * Math.sin(t * 0.8)), h * (0.5 + 0.3 * Math.sin(t * 1.6 + 1.2))],
    (px, py, dt) => {
      const c = cv.current;
      if (!c) return;
      const { g, w, h } = fit(c);
      if (!g) return;
      const s = st.current;
      if (s.lx < 0) {
        s.lx = px;
        s.ly = py;
      }
      // spawn along the pointer's path, more when it moves faster
      const mv = Math.hypot(px - s.lx, py - s.ly);
      s.acc += 3 + mv * 0.35;
      while (s.acc >= 1 && s.p.length < 600) {
        s.acc -= 1;
        const u = Math.random();
        const a = Math.random() * 6.283;
        const v = 40 + Math.random() * 170;
        s.p.push({ x: s.lx + (px - s.lx) * u, y: s.ly + (py - s.ly) * u, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 0.7 + Math.random() * 0.9, s: 1.5 + Math.random() * 2.5, c: Math.floor(Math.random() * 3) });
      }
      s.acc = Math.min(s.acc, 4);
      s.lx = px;
      s.ly = py;
      g.clearRect(0, 0, w, h);
      g.globalCompositeOperation = "lighter";
      let n = 0;
      for (const p of s.p) {
        p.life += dt;
        if (p.life >= p.max) continue;
        p.vx *= 1 - 1.6 * dt;
        p.vy *= 1 - 1.6 * dt;
        p.vy += 20 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const k = 1 - p.life / p.max;
        g.globalAlpha = k;
        g.fillStyle = COL738[p.c];
        const z = p.s * (0.4 + 0.6 * k);
        g.fillRect(p.x - z / 2, p.y - z / 2, z, z);
        s.p[n++] = p;
      }
      s.p.length = n;
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
    },
  );
  return (
    <Stage r={root} g1="rgba(255,170,110,.55)" g2="rgba(255,110,170,.25)" top>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[13px] uppercase tracking-[0.34em] text-[#ffc996]" style={{ fontFamily: F.mr }}>
          Emberleaf Candles · Festive drop
        </p>
        <h3 className="mt-4 text-[clamp(56px,7vw,112px)] leading-[0.9] tracking-[-0.02em]" style={{ fontFamily: F.fr }}>
          Leave a little spark
        </h3>
        <p className="mt-5 text-[18px] text-white/70" style={{ fontFamily: F.sg }}>
          Saffron &amp; oud trio · ₹ 1,450
        </p>
      </div>
      <canvas ref={cv} className="absolute inset-0 z-10 h-full w-full" aria-hidden />
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── M739 · Particle vortex funnel (variant of M15) ───────────────────────── */
type VP = { a: number; y: number; sp: number; j: number };
function M739() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const st = useRef({ p: [] as VP[], tx: 0, ty: 0 });
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.3 * Math.sin(t * 0.7)), h * (0.5 + 0.25 * Math.sin(t * 1.05 + 0.5))],
    (px, py, dt, t) => {
      const c = cv.current;
      if (!c) return;
      const { g, w, h } = fit(c);
      if (!g) return;
      const s = st.current;
      if (!s.p.length) {
        const r = rng(17);
        s.p = Array.from({ length: 1400 }, () => ({ a: r() * 6.283, y: r(), sp: 0.6 + r() * 0.8, j: (r() - 0.5) * 0.08 }));
      }
      // pointer parallax tilts the funnel
      const e = Math.min(1, dt * 2.5);
      s.tx += (((py - h / 2) / h) * 0.9 - s.tx) * e;
      s.ty += (((px - w / 2) / w) * 0.9 - s.ty) * e;
      const cx = Math.cos(0.42 + s.tx);
      const sx = Math.sin(0.42 + s.tx);
      const cy = Math.cos(s.ty);
      const sy = Math.sin(s.ty);
      const S = Math.min(w, h) * 0.95;
      const ox = w / 2;
      const oy = h * 0.5;
      g.clearRect(0, 0, w, h);
      g.globalCompositeOperation = "lighter";
      const core = [new Path2D(), new Path2D(), new Path2D()];
      const halo = [new Path2D(), new Path2D(), new Path2D()];
      for (const p of s.p) {
        // particles spiral down the funnel and re-enter at the rim
        p.y -= dt * 0.09 * p.sp;
        if (p.y < 0) p.y += 1;
        const rad = 0.06 + 0.62 * p.y * p.y + p.j;
        p.a += (dt * 0.9 * p.sp) / (rad + 0.08);
        let x = Math.cos(p.a) * rad;
        let z = Math.sin(p.a) * rad;
        let y = (p.y - 0.5) * 0.9;
        // rotate around Y (pointer x) then X (tilt + pointer y)
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y1 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        x = x1;
        y = y1;
        z = z2;
        const per = 1.8 / (2.4 + z);
        const X = ox + x * S * per;
        const Y = oy - y * S * per;
        const band = z < -0.2 ? 0 : z < 0.25 ? 1 : 2;
        const sz = (0.9 + per * 1.1) * (1 - p.y * 0.3);
        core[band].rect(X - sz / 2, Y - sz / 2, sz, sz);
        if ((p.a * 7) % 6.283 < 1.1) halo[band].rect(X - sz * 2, Y - sz * 2, sz * 4, sz * 4);
      }
      const tones = ["rgba(90,120,255,", "rgba(150,140,255,", "rgba(255,200,255,"];
      halo.forEach((p, k) => {
        g.fillStyle = `${tones[k]}${0.06 + k * 0.03})`;
        g.fill(p);
      });
      core.forEach((p, k) => {
        g.fillStyle = `${tones[k]}${0.45 + k * 0.22})`;
        g.fill(p);
      });
      // bright eye at the funnel throat, breathing
      const eye = g.createRadialGradient(ox, oy + 0.36 * S * 0.5, 0, ox, oy + 0.36 * S * 0.5, S * 0.18);
      eye.addColorStop(0, `rgba(230,220,255,${0.35 + 0.15 * Math.sin(t * 2)})`);
      eye.addColorStop(1, "rgba(120,100,255,0)");
      g.fillStyle = eye;
      g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = "source-over";
    },
  );
  return (
    <Stage r={root} g1="rgba(120,100,255,.55)" g2="rgba(255,120,230,.25)" top>
      <div className="absolute inset-0" style={{ background: "radial-gradient(22% 40% at 50% 50%, rgba(140,120,255,.35), transparent 70%)" }} aria-hidden />
      <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute left-[6%] top-1/2 z-20 w-[min(30%,380px)]" style={{ transform: "translateY(-50%)" }}>
        <p className="text-[13px] uppercase tracking-[0.3em] text-[#c4b8ff]" style={{ fontFamily: F.mr }}>
          Spiral Audio · Studio monitors
        </p>
        <h3 className="mt-3 text-[clamp(40px,4.4vw,70px)] font-[600] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.sg }}>
          Pulled into sound.
        </h3>
      </div>
      <div className="pointer-events-none absolute right-[6%] top-1/2 z-20 text-right" style={{ transform: "translateY(-50%)", fontFamily: F.sg }}>
        <p className="text-[14px] text-white/65">Pair, walnut</p>
        <p className="text-[28px] tabular-nums">₹ 64,900</p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "M728", name: "Halftone nebula parallax", how: "A square-dot halftone nebula and stars drift in three parallax depths; the pointer lights the gas (canvas, scripted pointer)", kind: "play", C: M728 },
  { code: "M729", name: "Riso scanline print", how: "A picture prints as two mis-registered riso inks: scanlines by darkness, stipple dither and a slow drift (WebGL)", kind: "play", C: M729 },
  { code: "M730", name: "CRT warp", how: "Plasma on a curved CRT: breathing barrel warp, scanlines, aperture grille, bloom and a rolling bar (WebGL)", kind: "play", C: M730 },
  { code: "M731", name: "VHS look", how: "Tracking band rolls down, red and cyan bleed apart and the picture wobbles, with a running timecode (CSS)", kind: "play", C: M731 },
  { code: "M732", name: "Volumetric glitch", how: "A perspective grid pans forever while the headline glitches in bursts: displacement, RGB split, slice shift, flares (SVG + GSAP)", kind: "play", C: M732 },
  { code: "M733", name: "Falling beams that burst", how: "Thin beams fall at random x and speed and burst into a spray and glow when they hit the floor (GSAP loop)", kind: "play", C: M733 },
  { code: "M734", name: "Converging web threads", how: "Glowing sine threads pass through one drifting point, bunching and fanning out again (WebGL)", kind: "play", C: M734 },
  { code: "M735", name: "Warp tunnel beams", how: "Four grid walls form a perspective tunnel; colour beams race along the lines toward or away from the centre (CSS 3D)", kind: "play", C: M735 },
  { code: "M736", name: "Moire line field", how: "100 parallel lines and 50 rings draw in and out with staggered ranges while the rings drift: moving moire (SVG DrawSVG)", kind: "play", C: M736 },
  { code: "M737", name: "Constellation network", how: "Stars drift, twinkle and link when close; they swirl toward the pointer and link to it (canvas, scripted pointer)", kind: "play", C: M737 },
  { code: "M738", name: "Particles scatter where hovered", how: "Sparks spawn along the pointer's path and scatter outward, fading (canvas, scripted pointer)", kind: "play", C: M738 },
  { code: "M739", name: "Particle vortex funnel", how: "1,400 particles spiral down a 3D funnel with additive bloom; the pointer tilts it (canvas, scripted pointer)", kind: "play", C: M739 },
];
