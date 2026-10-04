"use client";

// Ambient motions, batch 16 · group 5 (MOTION-MENU M764–M775): generative backgrounds and slow kinetic objects —
// a growing tree, a fading life grid, reaction-diffusion, a Truchet weave, a triangle lattice, a Mondrian splitter,
// Chladni sand, a pendulum wave, pointer moire, an engraved sphere, an SDF cross-section and a wireframe solid.
// Small focused demos for /lab/motion. Every demo is "play": it starts when it is on screen, loops, and pauses off
// screen. Each stage has a CSS-only glow loop that never stops (a second one sits ON TOP of full-bleed canvases and
// block walls). Pointer demos drive a visible fake pointer ring by themselves; the real mouse takes over while it moves.
// Canvases size themselves only near the viewport; the WebGL demo builds within ~1 screen, runs at dpr 0.7 and releases
// its context on unmount. ?static=1 / reduced motion: no JS motion, CSS loops stop, the markup shows a final state.
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
.b16g5-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.5)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b16g5-drift 5.6s linear infinite alternate;will-change:transform}
@keyframes b16g5-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b16g5-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);pointer-events:none;z-index:45;opacity:0;transition:opacity .25s}
.b16g5-run{animation-play-state:paused !important}
.b16g5-on .b16g5-run{animation-play-state:running !important}

/* M765 life grid lines */
.m765-grid{background-image:linear-gradient(rgba(5,8,15,.85) 1px,transparent 1px),linear-gradient(90deg,rgba(5,8,15,.85) 1px,transparent 1px);background-size:11px 11px}

/* M769 Mondrian cells */
.m769-cell{position:absolute;box-sizing:border-box;border:5px solid #0d0d10}

/* M771 pendulum wave */
.m771-p{position:absolute;top:0;width:2px;margin-left:-1px;transform-origin:50% 0;animation:m771-sw var(--d) ease-in-out infinite alternate}
@keyframes m771-sw{0%{transform:rotate(24deg)}100%{transform:rotate(-24deg)}}
.m771-bar{animation:m771-bar 4.8s linear infinite alternate}
@keyframes m771-bar{0%{opacity:.55}100%{opacity:1}}

/* M772 moire */
.m772-a{position:absolute;inset:-12%;background:repeating-radial-gradient(circle at 50% 50%,rgba(240,244,255,.92) 0 2px,transparent 2px 9px);animation:m772-breathe 6s ease-in-out infinite alternate}
@keyframes m772-breathe{0%{transform:scale(1) rotate(0deg)}100%{transform:scale(1.07) rotate(2deg)}}
.m772-b{position:absolute;inset:0;mix-blend-mode:difference;background:repeating-radial-gradient(circle at var(--mx,62%) var(--my,46%),rgba(255,138,92,.95) 0 2px,transparent 2px 9px)}

html.is-static .b16g5-glow,html.is-static .b16g5-run,html.is-static .m771-p,html.is-static .m771-bar,html.is-static .m772-a{animation:none}
@media (prefers-reduced-motion: reduce){
  .b16g5-glow,.b16g5-run,.m771-p,.m771-bar,.m772-a{animation:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop (never frozen). */
function Stage({ r, children, className = "", g1, g2, style }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; className?: string; g1?: string; g2?: string; style?: CSSProperties }) {
  return (
    <div ref={r} className={`relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff] ${className}`} style={style}>
      <style href="b16g5-css" precedence="default">
        {CSS}
      </style>
      <div className="b16g5-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

/** The CSS glow loop again, ON TOP of full-bleed canvases / block walls (screen blend), so those demos never freeze. */
const Sheen = ({ g1, opacity = 0.45 }: { g1?: string; opacity?: number }) => (
  <div className="b16g5-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity, zIndex: 35 } as CSSProperties} aria-hidden />
);

/** The visible fake pointer ring. */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => <div ref={r} className="b16g5-dot" aria-hidden />;

/** CSS-driven demos: toggles `b16g5-on` on the root while it is on screen (the paused keyframes run only then). */
function useOn(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("b16g5-on", e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("b16g5-on");
    };
  }, [ref]);
}

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

/** Runs `fn` once the element is within ~1 screen of the viewport (no canvases / GL contexts at page load). */
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

/** Full-bleed fragment shader (OGL via lib/gl). Built only near the viewport; draws only while on screen. */
function Shader({ frag, fallback, dpr = 1, onFrame }: { frag: string; fallback: string; dpr?: number; onFrame?: (u: U, t: number) => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const of = useRef(onFrame);
  of.current = onFrame;
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let dead = false;
    let h: GLHandle | null = null;
    const stop = whenNear(c, async () => {
      h = await createShader(c, frag, { dpr, onFrame: (u, t) => of.current?.(u, t) });
      if (dead) h?.destroy();
    });
    return () => {
      dead = true;
      stop();
      h?.destroy();
    };
  }, [frag, dpr]);
  return (
    <div className="absolute inset-0" style={{ background: fallback }}>
      <canvas ref={cv} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500" aria-hidden />
    </div>
  );
}

/**
 * Canvas 2D sized to its parent (dpr ≤ 1.5). `draw` runs every frame while the root is on screen (useTicker);
 * sizing starts only near the viewport. The CSS fallback under the canvas is what ?static=1 shows.
 */
function Canvas2D({ root, draw, fallback, className = "" }: { root: RefObject<HTMLDivElement | null>; draw: (x: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => void; fallback: string; className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const size = useRef({ w: 0, h: 0, k: 1 });
  const dr = useRef(draw);
  dr.current = draw;
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let ro: ResizeObserver | null = null;
    const stop = whenNear(c, () => {
      const fit = () => {
        const k = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = c.parentElement!.clientWidth;
        const h = c.parentElement!.clientHeight;
        c.width = Math.max(1, Math.round(w * k));
        c.height = Math.max(1, Math.round(h * k));
        size.current = { w, h, k };
      };
      fit();
      ro = new ResizeObserver(fit);
      ro.observe(c.parentElement!);
    });
    return () => {
      stop();
      ro?.disconnect();
      c.width = 1;
      c.height = 1;
    };
  }, []);
  useTicker(root, (t, dt) => {
    const c = cv.current;
    const { w, h, k } = size.current;
    if (!c || !w) return;
    const x = c.getContext("2d");
    if (!x) return;
    x.setTransform(k, 0, 0, k, 0, 0);
    dr.current(x, w, h, t, Math.min(dt, 0.05));
    if (c.style.opacity !== "1") c.style.opacity = "1";
  });
  return (
    <div className={`absolute inset-0 ${className}`} style={{ background: fallback }}>
      <canvas ref={cv} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500" aria-hidden />
    </div>
  );
}

/** Deterministic random (same values on the server and the client). */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

/** Brand line + headline block used by most demos. */
function Copy({ eyebrow, title, sub, font = F.sg, className = "", dark = false }: { eyebrow: string; title: ReactNode; sub?: string; font?: string; className?: string; dark?: boolean }) {
  return (
    <div className={`pointer-events-none absolute z-40 ${className}`}>
      <p className={`text-[13px] uppercase tracking-[0.3em] ${dark ? "text-[#3a2a1e]/70" : "text-white/65"}`} style={{ fontFamily: F.mr }}>
        {eyebrow}
      </p>
      <h3 className="mt-3 text-[clamp(40px,4.4vw,72px)] font-[600] leading-[0.94] tracking-[-0.035em]" style={{ fontFamily: font }}>
        {title}
      </h3>
      {sub && (
        <p className={`mt-4 text-[15px] ${dark ? "text-[#3a2a1e]/75" : "text-white/70"}`} style={{ fontFamily: F.mr }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ---------- M764 · Growing tree (variant of M8: a branching tree grows and blossoms; scripted clicks sprout new branches) ---------- */
type Seg764 = { x0: number; y0: number; x1: number; y1: number; d: number; t0: number; t1: number };
type Bloom764 = { x: number; y: number; d: number; t: number; r: number; c: number };
type Petal764 = { x: number; y: number; vx: number; vy: number; life: number; ph: number };
type T764 = {
  w: number;
  h: number;
  seed: number;
  lt: number;
  rnd: () => number;
  segs: Seg764[][];
  blooms: Bloom764[];
  end: number;
  petals: Petal764[];
  ptr: { x: number; y: number; fx: number; fy: number; tx: number; ty: number; t0: number; click: boolean; bloom: number };
  rings: { x: number; y: number; t: number }[];
};
const MAXD764 = 8;
const BLOOM764 = ["#ffc4dd", "#fff1f6", "#ff8fb8"];
function branch764(s: T764, x: number, y: number, a: number, l: number, d: number, t: number, maxD: number) {
  const x1 = x + Math.cos(a) * l;
  const y1 = y + Math.sin(a) * l;
  const t1 = t + 0.1 + l * 0.0021;
  (s.segs[d] ||= []).push({ x0: x, y0: y, x1, y1, d, t0: t, t1 });
  if (d >= maxD || l < 7) {
    s.blooms.push({ x: x1, y: y1, d: d + 1, t: t1, r: 3.5 + s.rnd() * 5, c: Math.floor(s.rnd() * 3) });
    s.end = Math.max(s.end, t1 + 0.4);
    return;
  }
  const three = d > 1 && s.rnd() < 0.22;
  const kids = three ? [-0.52, 0, 0.52] : [-1, 1].map((k) => k * (0.3 + s.rnd() * 0.26));
  kids.forEach((da, i) => {
    if (d >= 5 && s.rnd() < 0.14 && i > 0) return;
    branch764(s, x1, y1, a + da + (s.rnd() - 0.5) * 0.22, l * (0.7 + s.rnd() * 0.1), d + 1, t1, maxD);
  });
}
function plant764(w: number, h: number, seed: number): T764 {
  const s: T764 = {
    w,
    h,
    seed,
    lt: 0,
    rnd: rng(seed * 7919 + 13),
    segs: [],
    blooms: [],
    end: 0,
    petals: [],
    ptr: { x: w * 0.6, y: h * 0.4, fx: w * 0.6, fy: h * 0.4, tx: w * 0.6, ty: h * 0.4, t0: 0, click: false, bloom: -1 },
    rings: [],
  };
  branch764(s, w * 0.64, h + 4, -Math.PI / 2 + (s.rnd() - 0.5) * 0.12, h * 0.22, 0, 0, MAXD764);
  return s;
}
const sway764 = (x: number, y: number, d: number, t: number): [number, number] => [x + Math.sin(t * 1.1 + y * 0.006 + d * 0.35) * d * d * 0.11, y];
function M764() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const S = useRef<T764 | null>(null);
  const real = useRef(-1e9);
  const queued = useRef<[number, number][]>([]);
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const mv = () => (real.current = performance.now());
    const dn = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      queued.current.push([e.clientX - r.left, e.clientY - r.top]);
    };
    el.addEventListener("pointermove", mv);
    el.addEventListener("pointerdown", dn);
    return () => {
      el.removeEventListener("pointermove", mv);
      el.removeEventListener("pointerdown", dn);
    };
  }, []);
  const sprout = (s: T764, cx: number, cy: number) => {
    let best = -1;
    let bd = 1e9;
    s.blooms.forEach((b, i) => {
      if (b.t > s.lt) return;
      const dd = (b.x - cx) ** 2 + (b.y - cy) ** 2;
      if (dd < bd) {
        bd = dd;
        best = i;
      }
    });
    if (best < 0) return;
    const b = s.blooms[best];
    const dist = Math.sqrt(bd);
    const a = Math.atan2(cy - b.y, cx - b.x);
    branch764(s, b.x, b.y, a, Math.max(28, Math.min(110, dist)) * 0.75, b.d, s.lt, b.d + 3);
    s.rings.push({ x: cx, y: cy, t: s.lt });
  };
  const draw = (x: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
    let s = S.current;
    if (!s || s.w !== w || s.h !== h) s = S.current = plant764(w, h, s ? s.seed : 1);
    s.lt += dt;
    const cycle = s.end + 6.4;
    if (s.lt > cycle) {
      s = S.current = plant764(w, h, s.seed + 1);
    }
    const lt = s.lt;
    const grown = lt > s.end;
    const fading = lt > cycle - 0.7;
    // scripted pointer: walk to a spot beside a blossom, rest, click (only once the tree is grown)
    const p = s.ptr;
    const k = clamp01((lt - p.t0) / 0.8);
    p.x = p.fx + (p.tx - p.fx) * ease(k);
    p.y = p.fy + (p.ty - p.fy) * ease(k);
    if (k >= 1 && !p.click) {
      p.click = true;
      if (grown && !fading && performance.now() - real.current > 2000) sprout(s, p.tx, p.ty);
    }
    if (k >= 1 && lt - p.t0 > 1.15) {
      const open = s.blooms.filter((b) => b.t < lt);
      p.fx = p.x;
      p.fy = p.y;
      if (open.length) {
        const b = open[Math.floor(s.rnd() * open.length)];
        const a = Math.atan2(b.y - h * 0.45, b.x - w * 0.64) + (s.rnd() - 0.5) * 0.8;
        p.tx = Math.max(30, Math.min(w - 30, b.x + Math.cos(a) * (50 + s.rnd() * 50)));
        p.ty = Math.max(30, Math.min(h - 60, b.y + Math.sin(a) * (50 + s.rnd() * 40)));
      } else {
        p.tx = w * (0.5 + s.rnd() * 0.3);
        p.ty = h * (0.2 + s.rnd() * 0.35);
      }
      p.t0 = lt;
      p.click = false;
    }
    while (queued.current.length) {
      const [qx, qy] = queued.current.shift()!;
      if (grown && !fading) sprout(s, qx, qy);
    }
    if (dot.current) {
      dot.current.style.opacity = performance.now() - real.current < 2000 ? "0" : "1";
      dot.current.style.transform = `translate3d(${p.x}px,${p.y}px,0) scale(${p.click && lt - p.t0 < 1.0 ? 0.8 : 1})`;
    }
    x.clearRect(0, 0, w, h);
    x.globalAlpha = fading ? clamp01((cycle - lt) / 0.7) : 1;
    // branches, one stroke per depth
    x.lineCap = "round";
    s.segs.forEach((list, d) => {
      if (!list) return;
      x.beginPath();
      for (const g of list) {
        if (lt < g.t0) continue;
        const f = clamp01((lt - g.t0) / (g.t1 - g.t0));
        const [ax, ay] = sway764(g.x0, g.y0, g.d, lt);
        const [bx, by] = sway764(g.x1, g.y1, g.d + 1, lt);
        x.moveTo(ax, ay);
        x.lineTo(ax + (bx - ax) * f, ay + (by - ay) * f);
      }
      x.lineWidth = Math.max(0.8, 13 * Math.pow(0.68, d));
      x.strokeStyle = d < 3 ? "#5b3a2c" : d < 6 ? "#7c4d3a" : "#a7685a";
      x.stroke();
    });
    // blossoms, one fill per colour
    for (let c = 0; c < 3; c++) {
      x.beginPath();
      for (const b of s.blooms) {
        if (b.c !== c || lt < b.t) continue;
        const q = clamp01((lt - b.t) / 0.45);
        const r = b.r * (q < 1 ? 1 + 0.35 * Math.sin(q * Math.PI) : 1) * q;
        const [bx, by] = sway764(b.x, b.y, b.d, lt);
        x.moveTo(bx + r, by);
        x.arc(bx, by, r, 0, Math.PI * 2);
      }
      x.fillStyle = BLOOM764[c];
      x.fill();
    }
    // drifting petals
    const open = s.blooms.filter((b) => b.t < lt);
    if (open.length && s.petals.length < 110 && s.rnd() < dt * 26) {
      const b = open[Math.floor(s.rnd() * open.length)];
      s.petals.push({ x: b.x, y: b.y, vx: (s.rnd() - 0.3) * 20, vy: 10 + s.rnd() * 18, life: 0, ph: s.rnd() * 6 });
    }
    x.beginPath();
    s.petals = s.petals.filter((q) => {
      q.life += dt;
      q.x += (q.vx + Math.sin(lt * 1.6 + q.ph) * 26) * dt;
      q.y += q.vy * dt;
      if (q.y > h + 10 || q.life > 9) return false;
      x.moveTo(q.x + 3.2, q.y);
      x.ellipse(q.x, q.y, 3.2, 1.8, lt * 2 + q.ph, 0, Math.PI * 2);
      return true;
    });
    x.fillStyle = "rgba(255,196,221,.85)";
    x.fill();
    // click pulses
    s.rings = s.rings.filter((r) => lt - r.t < 0.7);
    for (const r of s.rings) {
      const q = (lt - r.t) / 0.7;
      x.beginPath();
      x.arc(r.x, r.y, 8 + q * 34, 0, Math.PI * 2);
      x.strokeStyle = `rgba(255,220,235,${(1 - q) * 0.8})`;
      x.lineWidth = 2;
      x.stroke();
    }
    x.globalAlpha = 1;
  };
  return (
    <Stage r={root} className="bg-[#120a10]" g1="rgba(255,120,170,.5)" g2="rgba(255,190,120,.24)">
      <Canvas2D root={root} draw={draw} fallback="radial-gradient(40% 55% at 64% 45%,rgba(255,150,190,.28),transparent 70%)" />
      <Copy eyebrow="Hanami Atelier · Spring scent" title={<>Grown, not made.</>} sub="Cherry bark eau de parfum · ₹ 6,400" font={F.fr} className="bottom-10 left-10 max-w-[460px]" />
      <Dot r={dot} />
    </Stage>
  );
}

/* ---------- M765 · Game of Life (a fading Conway life grid runs behind a content card) ---------- */
const CELL765 = 11;
type L765 = { cols: number; rows: number; a: Uint8Array; b: Uint8Array; glow: Float32Array; acc: number; inj: number; img: ImageData; off: HTMLCanvasElement; ox: CanvasRenderingContext2D; rnd: () => number };
function M765() {
  const root = useRef<HTMLDivElement>(null);
  const S = useRef<L765 | null>(null);
  const draw = (x: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
    const cols = Math.ceil(w / CELL765);
    const rows = Math.ceil(h / CELL765);
    let s = S.current;
    if (!s || s.cols !== cols || s.rows !== rows) {
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const ox = off.getContext("2d")!;
      const rnd = rng(765);
      const a = new Uint8Array(cols * rows);
      for (let i = 0; i < a.length; i++) a[i] = rnd() < 0.22 ? 1 : 0;
      s = S.current = { cols, rows, a, b: new Uint8Array(cols * rows), glow: new Float32Array(cols * rows), acc: 0, inj: 0, img: ox.createImageData(cols, rows), off, ox, rnd };
    }
    s.acc = Math.min(s.acc + dt, 0.25);
    s.inj += dt;
    while (s.acc > 0.1) {
      s.acc -= 0.1;
      const a = s.a;
      const b = s.b;
      let pop = 0;
      for (let y = 0; y < rows; y++) {
        const ym = ((y - 1 + rows) % rows) * cols;
        const y0 = y * cols;
        const yp = ((y + 1) % rows) * cols;
        for (let xx = 0; xx < cols; xx++) {
          const xm = (xx - 1 + cols) % cols;
          const xp = (xx + 1) % cols;
          const n = a[ym + xm] + a[ym + xx] + a[ym + xp] + a[y0 + xm] + a[y0 + xp] + a[yp + xm] + a[yp + xx] + a[yp + xp];
          const v = n === 3 || (n === 2 && a[y0 + xx]) ? 1 : 0;
          b[y0 + xx] = v;
          pop += v;
        }
      }
      s.b = a;
      s.a = b;
      if (pop < cols * rows * 0.05) {
        const rx = Math.floor(s.rnd() * cols * 0.6);
        const ry = Math.floor(s.rnd() * rows * 0.5);
        for (let y = ry; y < ry + rows * 0.5; y++) for (let xx = rx; xx < rx + cols * 0.4; xx++) b[y * cols + xx] = s.rnd() < 0.3 ? 1 : 0;
      }
    }
    draw2(s, x, dt);
  };
  const draw2 = (s: L765, x: CanvasRenderingContext2D, dt: number) => {
    const { cols, rows, glow } = s;
    const a = s.a;
    if (s.inj > 0.9) {
      s.inj = 0;
      // drop a glider somewhere, random heading
      const gx = Math.floor(s.rnd() * (cols - 4));
      const gy = Math.floor(s.rnd() * (rows - 4));
      const G = [
        [1, 0],
        [2, 1],
        [0, 2],
        [1, 2],
        [2, 2],
      ];
      const fx = s.rnd() < 0.5;
      const fy = s.rnd() < 0.5;
      G.forEach(([u, v]) => (a[(gy + (fy ? 2 - v : v)) * cols + gx + (fx ? 2 - u : u)] = 1));
    }
    const decay = Math.exp(-dt * 2.4);
    const d = s.img.data;
    for (let i = 0; i < a.length; i++) {
      const g = a[i] ? 1 : glow[i] * decay;
      glow[i] = g;
      const o = i * 4;
      if (a[i]) {
        d[o] = 190;
        d[o + 1] = 255;
        d[o + 2] = 222;
      } else {
        d[o] = 8 + 40 * g;
        d[o + 1] = 12 + 170 * g;
        d[o + 2] = 22 + 150 * g;
      }
      d[o + 3] = 255;
    }
    s.ox.putImageData(s.img, 0, 0);
    x.imageSmoothingEnabled = false;
    x.drawImage(s.off, 0, 0, cols * CELL765, rows * CELL765);
  };
  return (
    <Stage r={root} className="bg-[#080c16]" g1="rgba(90,255,200,.5)" g2="rgba(80,140,255,.24)">
      <Canvas2D root={root} draw={draw} fallback="radial-gradient(50% 60% at 50% 50%,rgba(60,200,160,.22),transparent 70%),#080c16" />
      <div className="m765-grid pointer-events-none absolute inset-0 z-10" aria-hidden />
      <Sheen g1="rgba(90,255,200,.5)" opacity={0.4} />
      <div className="pointer-events-none absolute inset-0 z-40 grid place-items-center">
        <div className="rounded-[26px] border border-white/12 bg-[#070b14]/85 px-12 py-10 text-center shadow-[0_30px_80px_rgba(0,0,0,.6)]">
          <p className="text-[13px] uppercase tracking-[0.3em] text-[#9effd6]/80" style={{ fontFamily: F.mr }}>
            Cellwise Labs · Simulation suite
          </p>
          <h3 className="mt-3 text-[clamp(40px,4.2vw,68px)] font-[600] leading-[0.95] tracking-[-0.035em]" style={{ fontFamily: F.sg }}>
            Patterns that live.
          </h3>
          <p className="mt-4 text-[15px] text-white/70" style={{ fontFamily: F.mr }}>
            Studio licence from ₹ 2,900 / month
          </p>
        </div>
      </div>
    </Stage>
  );
}

/* ---------- M766 · Reaction-diffusion (Gray-Scott worms crawl and regrow behind a wiping brush) ---------- */
const RW = 200;
const RH = 120;
type R766 = { A: Float32Array; B: Float32Array; A2: Float32Array; B2: Float32Array; img: ImageData; off: HTMLCanvasElement; ox: CanvasRenderingContext2D; lt: number; seedT: number; rnd: () => number };
const LUT766 = (() => {
  const stops = [
    [6, 9, 20],
    [16, 70, 110],
    [60, 200, 190],
    [255, 236, 200],
  ];
  const out = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const p = (i / 255) * (stops.length - 1);
    const s = Math.min(stops.length - 2, Math.floor(p));
    const f = p - s;
    for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(stops[s][c] + (stops[s + 1][c] - stops[s][c]) * f);
  }
  return out;
})();
function spot766(s: R766, cx: number, cy: number, r: number, v: number) {
  for (let y = -r; y <= r; y++)
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y > r * r) continue;
      const i = ((cy + y + RH) % RH) * RW + ((cx + x + RW) % RW);
      s.B[i] = v;
      if (v > 0) s.A[i] = 0.5;
    }
}
function M766() {
  const root = useRef<HTMLDivElement>(null);
  const S = useRef<R766 | null>(null);
  const draw = (x: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
    let s = S.current;
    if (!s) {
      const off = document.createElement("canvas");
      off.width = RW;
      off.height = RH;
      const ox = off.getContext("2d")!;
      const n = RW * RH;
      s = S.current = { A: new Float32Array(n).fill(1), B: new Float32Array(n), A2: new Float32Array(n), B2: new Float32Array(n), img: ox.createImageData(RW, RH), off, ox, lt: 0, seedT: 0, rnd: rng(766) };
      for (let k = 0; k < 26; k++) spot766(s, Math.floor(s.rnd() * RW), Math.floor(s.rnd() * RH), 3, 1);
    }
    s.lt += dt;
    s.seedT += dt;
    if (s.seedT > 0.7) {
      s.seedT = 0;
      spot766(s, Math.floor(s.rnd() * RW), Math.floor(s.rnd() * RH), 2, 1);
    }
    // a slow brush wipes a trail so worms keep crawling back in
    const bx = Math.floor(RW / 2 + Math.sin(s.lt * 0.37) * RW * 0.42);
    const by = Math.floor(RH / 2 + Math.sin(s.lt * 0.53 + 1) * RH * 0.4);
    spot766(s, bx, by, 6, 0);
    const f = 0.0545 + 0.005 * Math.sin(s.lt * 0.15);
    const kk = 0.062;
    for (let it = 0; it < 9; it++) {
      const { A, B, A2, B2 } = s;
      for (let y = 0; y < RH; y++) {
        const ym = ((y - 1 + RH) % RH) * RW;
        const y0 = y * RW;
        const yp = ((y + 1) % RH) * RW;
        for (let xx = 0; xx < RW; xx++) {
          const xm = xx === 0 ? RW - 1 : xx - 1;
          const xp = xx === RW - 1 ? 0 : xx + 1;
          const i = y0 + xx;
          const a = A[i];
          const b = B[i];
          const la = 0.2 * (A[ym + xx] + A[yp + xx] + A[y0 + xm] + A[y0 + xp]) + 0.05 * (A[ym + xm] + A[ym + xp] + A[yp + xm] + A[yp + xp]) - a;
          const lb = 0.2 * (B[ym + xx] + B[yp + xx] + B[y0 + xm] + B[y0 + xp]) + 0.05 * (B[ym + xm] + B[ym + xp] + B[yp + xm] + B[yp + xp]) - b;
          const abb = a * b * b;
          A2[i] = a + (la - abb + f * (1 - a));
          B2[i] = b + (0.5 * lb + abb - (kk + f) * b);
        }
      }
      s.A = A2;
      s.B = B2;
      s.A2 = A;
      s.B2 = B;
    }
    const d = s.img.data;
    const B = s.B;
    for (let i = 0; i < B.length; i++) {
      const v = Math.max(0, Math.min(255, Math.round(B[i] * 3.4 * 255)));
      const o = i * 4;
      d[o] = LUT766[v * 3];
      d[o + 1] = LUT766[v * 3 + 1];
      d[o + 2] = LUT766[v * 3 + 2];
      d[o + 3] = 255;
    }
    s.ox.putImageData(s.img, 0, 0);
    const sc = Math.max(w / RW, h / RH);
    x.imageSmoothingEnabled = true;
    x.imageSmoothingQuality = "high";
    x.drawImage(s.off, (w - RW * sc) / 2, (h - RH * sc) / 2, RW * sc, RH * sc);
  };
  return (
    <Stage r={root} className="bg-[#060914]" g1="rgba(70,220,200,.5)" g2="rgba(255,220,170,.22)">
      <Canvas2D root={root} draw={draw} fallback="radial-gradient(circle at 30% 40%,rgba(60,200,190,.35) 0 6px,transparent 7px) 0 0/46px 46px,#060914" />
      <Sheen g1="rgba(70,220,200,.5)" opacity={0.35} />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-[46%] bg-[linear-gradient(90deg,rgba(6,9,20,.92),rgba(6,9,20,.6)_70%,transparent)]" aria-hidden />
      <Copy eyebrow="Morphe Skin · Cell serum" title={<>Renewal, on repeat.</>} sub="Peptide night serum, 30 ml · ₹ 3,250" className="bottom-10 left-10 max-w-[480px]" />
    </Stage>
  );
}

/* ---------- M767 · Truchet weave (quarter-arc tiles flip with a slow field; seams ripple outward) ---------- */
type T767 = { cols: number; rows: number; s: number; ang: Float32Array };
function M767() {
  const root = useRef<HTMLDivElement>(null);
  const S = useRef<T767 | null>(null);
  const draw = (x: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => {
    const sz = 68;
    const cols = Math.ceil(w / sz) + 1;
    const rows = Math.ceil(h / sz) + 1;
    let st = S.current;
    if (!st || st.cols !== cols || st.rows !== rows) {
      const r = rng(767);
      st = S.current = { cols, rows, s: sz, ang: Float32Array.from({ length: cols * rows }, () => (r() < 0.5 ? 0 : Math.PI / 2)) };
    }
    x.clearRect(0, 0, w, h);
    const ox = (w - (cols - 1) * sz) / 2;
    const oy = (h - (rows - 1) * sz) / 2;
    const L = 4;
    const paths: Path2D[] = Array.from({ length: L }, () => new Path2D());
    const r = sz / 2;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        const field = Math.sin(i * 0.33 + t * 0.55) + Math.sin(j * 0.47 - t * 0.38) + Math.sin((i + j) * 0.19 + t * 0.27);
        const target = field > 0 ? Math.PI / 2 : 0;
        st.ang[k] += (target - st.ang[k]) * Math.min(1, dt * 4.5);
        const a = st.ang[k];
        const cx = ox + i * sz;
        const cy = oy + j * sz;
        const dd = Math.hypot(cx - w / 2, cy - h / 2);
        const lvl = Math.min(L - 1, Math.floor((0.5 + 0.5 * Math.sin(dd * 0.018 - t * 2.2)) * L));
        const p = paths[lvl];
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        // two quarter arcs centred on opposite tile corners, rotated by a
        const c1x = cx + (-r * ca + r * sa);
        const c1y = cy + (-r * sa - r * ca);
        const c2x = cx + (r * ca - r * sa);
        const c2y = cy + (r * sa + r * ca);
        p.moveTo(c1x + r * Math.cos(a), c1y + r * Math.sin(a));
        p.arc(c1x, c1y, r, a, a + Math.PI / 2);
        p.moveTo(c2x + r * Math.cos(a + Math.PI), c2y + r * Math.sin(a + Math.PI));
        p.arc(c2x, c2y, r, a + Math.PI, a + Math.PI * 1.5);
      }
    x.lineCap = "round";
    paths.forEach((p, l) => {
      x.strokeStyle = `rgba(255,170,90,${0.08 + l * 0.05})`;
      x.lineWidth = 14 + l * 3;
      x.stroke(p);
    });
    paths.forEach((p, l) => {
      x.strokeStyle = l === L - 1 ? "#ffe2b8" : `rgba(255,${150 + l * 25},${80 + l * 30},${0.55 + l * 0.15})`;
      x.lineWidth = 2.5 + l * 1.4;
      x.stroke(p);
    });
  };
  return (
    <Stage r={root} className="bg-[#140b07]" g1="rgba(255,150,80,.5)" g2="rgba(255,90,60,.24)">
      <Canvas2D root={root} draw={draw} fallback="radial-gradient(circle at 0 0,transparent 32px,rgba(255,170,90,.6) 33px 35px,transparent 36px) 0 0/68px 68px,#140b07" />
      <Sheen g1="rgba(255,150,80,.5)" opacity={0.35} />
      <div className="pointer-events-none absolute inset-0 z-40 grid place-items-center">
        <div className="rounded-[22px] bg-[#140b07]/90 px-12 py-9 text-center ring-1 ring-[#ffb070]/25">
          <p className="text-[13px] uppercase tracking-[0.3em] text-[#ffc89a]/80" style={{ fontFamily: F.mr }}>
            Loomhouse Rugs · Hand-knotted
          </p>
          <h3 className="mt-3 text-[clamp(40px,4.2vw,68px)] leading-[0.95] tracking-[-0.02em]" style={{ fontFamily: F.is }}>
            One thread, endless paths.
          </h3>
          <p className="mt-3 text-[15px] text-white/70" style={{ fontFamily: F.mr }}>
            Weave runner, 8 × 3 ft · ₹ 18,500
          </p>
        </div>
      </div>
    </Stage>
  );
}

/* ---------- M768 · Delaunay lattice (triangulated mesh, pulsing vertices pushed and lit by the pointer) ---------- */
type P2 = [number, number];
/** Bowyer–Watson triangulation (our own, run once per size). */
function delaunay(pts: P2[]): [number, number, number][] {
  const n = pts.length;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  pts.forEach(([px, py]) => {
    minX = Math.min(minX, px);
    minY = Math.min(minY, py);
    maxX = Math.max(maxX, px);
    maxY = Math.max(maxY, py);
  });
  const dm = Math.max(maxX - minX, maxY - minY) * 20;
  const mx = (minX + maxX) / 2;
  const my = (minY + maxY) / 2;
  const P: P2[] = [...pts, [mx - dm, my - dm], [mx, my + dm], [mx + dm, my - dm]];
  type Tri = { a: number; b: number; c: number; x: number; y: number; r2: number };
  const make = (a: number, b: number, c: number): Tri => {
    const [ax, ay] = P[a];
    const [bx, by] = P[b];
    const [cx, cy] = P[c];
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) || 1e-9;
    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
    return { a, b, c, x: ux, y: uy, r2: (ax - ux) ** 2 + (ay - uy) ** 2 };
  };
  let tris: Tri[] = [make(n, n + 1, n + 2)];
  for (let i = 0; i < n; i++) {
    const [px, py] = P[i];
    const bad: Tri[] = [];
    const keep: Tri[] = [];
    tris.forEach((t) => ((px - t.x) ** 2 + (py - t.y) ** 2 < t.r2 ? bad : keep).push(t));
    const edges = new Map<string, [number, number]>();
    bad.forEach((t) =>
      [
        [t.a, t.b],
        [t.b, t.c],
        [t.c, t.a],
      ].forEach(([u, v]) => {
        const key = u < v ? `${u}-${v}` : `${v}-${u}`;
        if (edges.has(key)) edges.delete(key);
        else edges.set(key, [u, v]);
      }),
    );
    edges.forEach(([u, v]) => keep.push(make(u, v, i)));
    tris = keep;
  }
  return tris.filter((t) => t.a < n && t.b < n && t.c < n).map((t) => [t.a, t.b, t.c]);
}
function M768() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const S = useRef<{ w: number; h: number; k: number; base: P2[]; tris: [number, number, number][]; cur: Float32Array; ph: Float32Array } | null>(null);
  const ready = useRef(false);
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let ro: ResizeObserver | null = null;
    const stop = whenNear(c, () => {
      const fit = () => {
        const k = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = c.parentElement!.clientWidth;
        const h = c.parentElement!.clientHeight;
        c.width = Math.max(1, Math.round(w * k));
        c.height = Math.max(1, Math.round(h * k));
        const r = rng(768);
        const base: P2[] = [];
        const step = 92;
        for (let y = -step / 2; y < h + step; y += step * 0.86)
          for (let x = -step / 2; x < w + step; x += step) base.push([x + (r() - 0.5) * step * 0.8, y + (r() - 0.5) * step * 0.7]);
        const tris = delaunay(base);
        S.current = { w, h, k, base, tris, cur: new Float32Array(base.length * 2), ph: Float32Array.from(base, () => r() * Math.PI * 2) };
        ready.current = true;
      };
      fit();
      ro = new ResizeObserver(fit);
      ro.observe(c.parentElement!);
    });
    return () => {
      stop();
      ro?.disconnect();
      c.width = 1;
      c.height = 1;
    };
  }, []);
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.36 * Math.sin(t * 0.55)), h * (0.5 + 0.3 * Math.sin(t * 0.9 + 0.6))],
    (px, py, _dt, t) => {
      const s = S.current;
      const c = cv.current;
      if (!s || !c || !ready.current) return;
      const x = c.getContext("2d");
      if (!x) return;
      x.setTransform(s.k, 0, 0, s.k, 0, 0);
      x.clearRect(0, 0, s.w, s.h);
      const R = 200;
      const cur = s.cur;
      const near = new Float32Array(s.base.length);
      s.base.forEach(([bx, by], i) => {
        let vx = bx + Math.sin(t * 0.7 + s.ph[i]) * 5;
        let vy = by + Math.cos(t * 0.6 + s.ph[i] * 1.3) * 5;
        const dx = vx - px;
        const dy = vy - py;
        const d = Math.hypot(dx, dy) || 1;
        if (d < R) {
          const f = (1 - d / R) ** 2 * 46;
          vx += (dx / d) * f;
          vy += (dy / d) * f;
        }
        near[i] = Math.max(0, 1 - d / (R * 1.4));
        cur[i * 2] = vx;
        cur[i * 2 + 1] = vy;
      });
      for (const [a, b, cc] of s.tris) {
        const cx = (cur[a * 2] + cur[b * 2] + cur[cc * 2]) / 3;
        const cy = (cur[a * 2 + 1] + cur[b * 2 + 1] + cur[cc * 2 + 1]) / 3;
        const L = Math.exp(-((cx - px) ** 2 + (cy - py) ** 2) / (2 * 150 * 150));
        const hsh = ((a * 73 + b * 31 + cc * 17) % 13) / 13;
        x.beginPath();
        x.moveTo(cur[a * 2], cur[a * 2 + 1]);
        x.lineTo(cur[b * 2], cur[b * 2 + 1]);
        x.lineTo(cur[cc * 2], cur[cc * 2 + 1]);
        x.closePath();
        x.fillStyle = `rgba(${Math.round(40 + 120 * L)},${Math.round(60 + 110 * L + hsh * 20)},${Math.round(140 + 100 * L)},${0.1 + hsh * 0.12 + L * 0.5})`;
        x.fill();
      }
      x.beginPath();
      for (const [a, b, cc] of s.tris) {
        x.moveTo(cur[a * 2], cur[a * 2 + 1]);
        x.lineTo(cur[b * 2], cur[b * 2 + 1]);
        x.lineTo(cur[cc * 2], cur[cc * 2 + 1]);
        x.closePath();
      }
      x.strokeStyle = "rgba(170,195,255,.32)";
      x.lineWidth = 1;
      x.stroke();
      x.beginPath();
      for (let i = 0; i < s.base.length; i++) {
        const r = 1.3 + 1.3 * (0.5 + 0.5 * Math.sin(t * 2.6 + s.ph[i] * 2)) + near[i] * 3.2;
        x.moveTo(cur[i * 2] + r, cur[i * 2 + 1]);
        x.arc(cur[i * 2], cur[i * 2 + 1], r, 0, Math.PI * 2);
      }
      x.fillStyle = "#dfe8ff";
      x.fill();
      if (c.style.opacity !== "1") c.style.opacity = "1";
    },
  );
  return (
    <Stage r={root} className="bg-[#070a18]" g1="rgba(110,140,255,.5)" g2="rgba(190,120,255,.22)">
      <div className="absolute inset-0" style={{ background: "linear-gradient(60deg,transparent 49.6%,rgba(160,185,255,.18) 50%,transparent 50.4%) 0 0/92px 80px,linear-gradient(-60deg,transparent 49.6%,rgba(160,185,255,.18) 50%,transparent 50.4%) 0 0/92px 80px" }}>
        <canvas ref={cv} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500" aria-hidden />
      </div>
      <Sheen g1="rgba(110,140,255,.5)" opacity={0.35} />
      <Copy eyebrow="Vertex Audio · Spatial series" title={<>Sound, in every angle.</>} sub="Planar headphones · ₹ 24,900" className="left-10 top-10 max-w-[460px]" />
      <Dot r={dot} />
    </Stage>
  );
}

/* ---------- M769 · Mondrian generator (variant of M34: blocks keep splitting, merging and recolouring) ---------- */
type N769 = { x: number; y: number; w: number; h: number; c: string; el?: HTMLDivElement; kids?: [N769, N769]; parent?: N769 };
const PAL769 = ["#f3efe6", "#f3efe6", "#f3efe6", "#ece6d8", "#d7261e", "#1d4fb3", "#f2c230", "#141416"];
function split769(n: N769, vert: boolean, r: number, c: string): [N769, N769] {
  const a: N769 = vert ? { x: n.x, y: n.y, w: n.w * r, h: n.h, c: n.c, parent: n } : { x: n.x, y: n.y, w: n.w, h: n.h * r, c: n.c, parent: n };
  const b: N769 = vert ? { x: n.x + n.w * r, y: n.y, w: n.w * (1 - r), h: n.h, c, parent: n } : { x: n.x, y: n.y + n.h * r, w: n.w, h: n.h * (1 - r), c, parent: n };
  n.kids = [a, b];
  return n.kids;
}
function seed769(): N769 {
  const root: N769 = { x: 0, y: 0, w: 100, h: 100, c: "#f3efe6" };
  const [l, r] = split769(root, true, 0.62, "#f3efe6");
  const [lt, lb] = split769(l, false, 0.58, "#1d4fb3");
  const [rt, rb] = split769(r, false, 0.34, "#f2c230");
  split769(lt, true, 0.38, "#d7261e");
  split769(rb, false, 0.55, "#f3efe6");
  split769(lb, true, 0.72, "#f3efe6");
  rt.c = "#f3efe6";
  return root;
}
const leaves769 = (n: N769, out: N769[] = []): N769[] => {
  if (n.kids) n.kids.forEach((k) => leaves769(k, out));
  else out.push(n);
  return out;
};
const rect769 = (n: { x: number; y: number; w: number; h: number }) => ({ left: `${n.x}%`, top: `${n.y}%`, width: `${n.w}%`, height: `${n.h}%` });
const STATIC769 = leaves769(seed769());
function M769() {
  const root = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const live = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    const host = live.current;
    const st = box.current;
    if (!el || !host || !st || prefersReducedMotion()) return;
    const tree = seed769();
    const mk = (n: N769) => {
      const d = document.createElement("div");
      d.className = "m769-cell";
      Object.assign(d.style, rect769(n), { background: n.c });
      host.appendChild(d);
      n.el = d;
      return d;
    };
    leaves769(tree).forEach(mk);
    st.style.visibility = "hidden";
    const rnd = rng(769);
    const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
    const D = 0.62;
    const E = "power2.inOut";
    let on = false;
    let dc: gsap.core.Tween | null = null;
    const ctx = gsap.context(() => {}, el);
    const step = () => {
      if (!on) return;
      ctx.add(() => {
        const ls = leaves769(tree);
        const pairs: N769[] = [];
        const walk = (n: N769) => {
          if (!n.kids) return;
          if (!n.kids[0].kids && !n.kids[1].kids) pairs.push(n);
          n.kids.forEach(walk);
        };
        walk(tree);
        const roll = rnd();
        const doSplit = ls.length < 9 || (ls.length < 17 && roll < 0.5);
        const doMerge = !doSplit && pairs.length > 0 && (ls.length > 16 || roll < 0.8);
        if (doSplit) {
          const big = ls.filter((n) => n.w > 10 || n.h > 14).sort((a, b) => b.w * b.h - a.w * a.h).slice(0, 4);
          const n = big.length ? pick(big) : pick(ls);
          const vert = n.w * 2.1 > n.h;
          const r = 0.3 + Math.round(rnd() * 8) * 0.05;
          const [a, b] = split769(n, vert, r, pick(PAL769));
          a.el = n.el;
          n.el = undefined;
          const be = mk({ ...b, ...(vert ? { x: n.x + n.w, w: 0 } : { y: n.y + n.h, h: 0 }) });
          b.el = be;
          gsap.to(a.el!, { ...rect769(a), duration: D, ease: E });
          gsap.to(be, { ...rect769(b), duration: D, ease: E });
        } else if (doMerge) {
          const n = pick(pairs);
          const [a, b] = n.kids!;
          const vert = a.y === b.y;
          gsap.to(a.el!, { ...rect769(n), duration: D, ease: E });
          const gone = b.el!;
          gsap.to(gone, { ...rect769(vert ? { x: n.x + n.w, y: b.y, w: 0, h: b.h } : { x: b.x, y: n.y + n.h, w: b.w, h: 0 }), duration: D, ease: E, onComplete: () => gone.remove() });
          n.el = a.el;
          n.c = a.c;
          n.kids = undefined;
        }
        // recolour one more block every step
        const q = pick(leaves769(tree));
        if (q.el) {
          q.c = pick(PAL769);
          gsap.to(q.el, { backgroundColor: q.c, duration: 0.5, ease: "sine.inOut" });
        }
      });
      dc = gsap.delayedCall(0.5, step);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        const was = on;
        on = e.isIntersecting;
        if (on && !was) step();
        if (!on) {
          dc?.kill();
          dc = null;
        }
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      dc?.kill();
      ctx.revert();
      host.innerHTML = "";
      st.style.visibility = "";
    };
  }, []);
  return (
    <Stage r={root} className="bg-[#0d0d10]" g1="rgba(255,90,70,.5)" g2="rgba(70,120,255,.3)">
      <div className="absolute inset-[18px] overflow-hidden rounded-[14px] bg-[#0d0d10]">
        <div ref={box} className="absolute inset-0">
          {STATIC769.map((n, i) => (
            <div key={i} className="m769-cell" style={{ ...rect769(n), background: n.c }} />
          ))}
        </div>
        <div ref={live} className="absolute inset-0" />
      </div>
      <Sheen g1="rgba(255,90,70,.5)" opacity={0.3} />
      <div className="pointer-events-none absolute bottom-10 left-10 z-40 rounded-[6px] bg-[#0d0d10] px-6 py-5 text-[#f3efe6]">
        <p className="text-[12px] uppercase tracking-[0.3em] text-white/65" style={{ fontFamily: F.mr }}>
          Planar Print Co. · No. 12
        </p>
        <h3 className="mt-2 text-[clamp(32px,3.2vw,52px)] font-[700] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.sy }}>
          Never the same grid.
        </h3>
        <p className="mt-2 text-[14px] text-white/70" style={{ fontFamily: F.mr }}>
          Generative giclée, A1 · ₹ 4,800
        </p>
      </div>
    </Stage>
  );
}

/* ---------- M770 · Chladni patterns (sand particles settle on nodal lines; the mode changes every few seconds) ---------- */
const MODES770: [number, number][] = [
  [1, 4],
  [2, 5],
  [3, 4],
  [1, 6],
  [3, 7],
  [2, 3],
  [4, 5],
];
function M770() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const S = useRef<{ u: Float32Array; v: Float32Array; lt: number; mode: number; burst: number; rnd: () => number } | null>(null);
  const draw = (x: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
    const N = 2600;
    let s = S.current;
    if (!s) {
      const rnd = rng(770);
      s = S.current = { u: Float32Array.from({ length: N }, rnd), v: Float32Array.from({ length: N }, rnd), lt: 0, mode: 0, burst: 1, rnd };
    }
    s.lt += dt;
    if (s.lt > 3.4) {
      s.lt = 0;
      s.mode = (s.mode + 1) % MODES770.length;
      s.burst = 1;
      if (label.current) label.current.textContent = `${MODES770[s.mode][0]} · ${MODES770[s.mode][1]}  —  ${(MODES770[s.mode][0] * MODES770[s.mode][1] * 37 + 110).toFixed(0)} Hz`;
    }
    s.burst = Math.max(0, s.burst - dt * 1.6);
    const [n, m] = MODES770[s.mode];
    const PI = Math.PI;
    const S0 = Math.min(h * 0.84, w * 0.44);
    const px0 = w * 0.7 - S0 / 2;
    const py0 = h / 2 - S0 / 2;
    x.clearRect(0, 0, w, h);
    x.fillStyle = "rgba(20,22,30,.9)";
    x.strokeStyle = "rgba(255,230,190,.28)";
    x.lineWidth = 1.5;
    x.beginPath();
    x.roundRect(px0 - 8, py0 - 8, S0 + 16, S0 + 16, 14);
    x.fill();
    x.stroke();
    x.beginPath();
    const k = Math.min(2, dt * 60);
    for (let i = 0; i < N; i++) {
      let u = s.u[i];
      let v = s.v[i];
      const cnu = Math.cos(n * PI * u);
      const cmv = Math.cos(m * PI * v);
      const cmu = Math.cos(m * PI * u);
      const cnv = Math.cos(n * PI * v);
      const f = cnu * cmv - cmu * cnv;
      const fu = -n * PI * Math.sin(n * PI * u) * cmv + m * PI * Math.sin(m * PI * u) * cnv;
      const fv = -m * PI * cnu * Math.sin(m * PI * v) + n * PI * cmu * Math.sin(n * PI * v);
      let du = -f * fu * 0.0009 * k;
      let dv = -f * fv * 0.0009 * k;
      const mag = Math.hypot(du, dv);
      if (mag > 0.008) {
        du *= 0.008 / mag;
        dv *= 0.008 / mag;
      }
      const j = (Math.abs(f) * 0.012 + 0.0007 + s.burst * 0.02) * k;
      u += du + (s.rnd() - 0.5) * j;
      v += dv + (s.rnd() - 0.5) * j;
      u = u < 0 ? -u : u > 1 ? 2 - u : u;
      v = v < 0 ? -v : v > 1 ? 2 - v : v;
      s.u[i] = u;
      s.v[i] = v;
      x.rect(px0 + u * S0 - 0.9, py0 + v * S0 - 0.9, 1.8, 1.8);
    }
    x.fillStyle = "#ffe6c4";
    x.fill();
  };
  return (
    <Stage r={root} className="bg-[#0b0c12]" g1="rgba(255,190,120,.5)" g2="rgba(120,160,255,.22)">
      <Canvas2D root={root} draw={draw} fallback="radial-gradient(40% 60% at 70% 50%,rgba(255,200,140,.18),transparent 70%)" />
      <Sheen g1="rgba(255,190,120,.5)" opacity={0.35} />
      <div className="pointer-events-none absolute bottom-10 left-10 z-40 max-w-[440px]">
        <p className="text-[13px] uppercase tracking-[0.3em] text-white/65" style={{ fontFamily: F.mr }}>
          Resona Hi-Fi · Cymatics
        </p>
        <h3 className="mt-3 text-[clamp(40px,4.2vw,68px)] font-[600] leading-[0.94] tracking-[-0.035em]" style={{ fontFamily: F.sg }}>
          See the sound.
        </h3>
        <p className="mt-4 text-[15px] text-white/70" style={{ fontFamily: F.mr }}>
          Bookshelf monitors, pair · ₹ 54,000
        </p>
        <p className="mt-6 text-[13px] uppercase tracking-[0.24em] text-[#ffd9a8]" style={{ fontFamily: F.mr }}>
          Mode <span ref={label}>1 · 4 — 258 Hz</span>
        </p>
      </div>
    </Stage>
  );
}

/* ---------- M771 · Pendulum wave (a row of pendulums swing at stepped periods: waves, splits and re-syncs) ---------- */
const N771 = 16;
const PEND771 = Array.from({ length: N771 }, (_, i) => {
  const half = 10 / (12 + i); // half period (s): pendulum i does 12+i swings per 20 s cycle
  const len = 74 * (half / (10 / 12)) ** 2; // % of stage height (length ∝ period²)
  return { half, len, hue: 18 + i * 13 };
});
function M771() {
  const root = useRef<HTMLDivElement>(null);
  useOn(root);
  return (
    <Stage r={root} className="bg-[#0b0a12]" g1="rgba(255,140,90,.5)" g2="rgba(140,110,255,.26)">
      <div className="absolute inset-x-[10%] top-[9%] bottom-[6%]">
        <div className="m771-bar b16g5-run absolute inset-x-0 top-0 h-[6px] -translate-y-1/2 rounded-full bg-gradient-to-r from-[#ff9d6b] via-[#ffd9b8] to-[#a58bff]" />
        {PEND771.map((p, i) => (
          <div key={i} className="m771-p b16g5-run" style={{ left: `${((i + 0.5) / N771) * 100}%`, height: `${p.len}%`, "--d": `${p.half.toFixed(4)}s` } as CSSProperties}>
            <div className="absolute inset-0 bg-white/35" />
            <div
              className="absolute bottom-0 left-1/2 h-[30px] w-[30px] -translate-x-1/2 translate-y-1/2 rounded-full"
              style={{ background: `radial-gradient(circle at 35% 30%,#fff 0 10%,hsl(${p.hue} 90% 66%) 40%,hsl(${p.hue} 70% 30%) 100%)`, boxShadow: `0 0 26px hsl(${p.hue} 90% 60% / .55)` }}
            />
          </div>
        ))}
      </div>
      <Copy eyebrow="Tempo Watch Atelier" title={<>In time, out of step.</>} sub="Kinetic desk clock · ₹ 12,800" className="bottom-10 left-10 max-w-[420px]" />
    </Stage>
  );
}

/* ---------- M772 · Pointer moire (two ring rulings, one centred on the pointer, beat into moving moire) ---------- */
function M772() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  useOn(root);
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.3 * Math.sin(t * 0.62)), h * (0.5 + 0.28 * Math.sin(t * 1.04 + 1))],
    (x, y) => {
      const l = layer.current;
      if (!l) return;
      l.style.setProperty("--mx", `${x}px`);
      l.style.setProperty("--my", `${y}px`);
    },
  );
  return (
    <Stage r={root} className="bg-[#05060b]" g1="rgba(255,140,100,.5)" g2="rgba(120,160,255,.3)">
      <div className="absolute inset-0 overflow-hidden">
        <div className="m772-a b16g5-run" />
        <div ref={layer} className="m772-b" />
      </div>
      <Sheen g1="rgba(255,140,100,.5)" opacity={0.3} />
      <div className="pointer-events-none absolute bottom-10 left-10 z-40 rounded-[22px] bg-[#05060b]/88 px-8 py-7">
        <p className="text-[13px] uppercase tracking-[0.3em] text-white/65" style={{ fontFamily: F.mr }}>
          Interfere Optics · Lens lab
        </p>
        <h3 className="mt-3 text-[clamp(36px,3.8vw,62px)] font-[600] leading-[0.95] tracking-[-0.035em]" style={{ fontFamily: F.sg }}>
          Look closer.
        </h3>
        <p className="mt-3 text-[15px] text-white/70" style={{ fontFamily: F.mr }}>
          Prime lens 50 mm f/1.4 · ₹ 46,500
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ---------- M773 · Engraving hatch sphere (copperplate hatch lines swell with shadow as the light circles) ---------- */
function M773() {
  const root = useRef<HTMLDivElement>(null);
  const S = useRef({ lt: 0 });
  const draw = (x: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
    const s = S.current;
    s.lt += dt;
    const lt = s.lt;
    const R = Math.min(h * 0.37, w * 0.24);
    const cx = w * 0.66;
    const cy = h * 0.46;
    let lx = Math.cos(lt * 0.7) * 0.85;
    let ly = 0.35 + 0.25 * Math.sin(lt * 0.47);
    let lz = 0.45 + 0.35 * Math.sin(lt * 0.7 + 1.2);
    const ll = Math.hypot(lx, ly, lz);
    lx /= ll;
    ly /= ll;
    lz /= ll;
    const tilt = 0.42;
    const ct = Math.cos(tilt);
    const sn = Math.sin(tilt);
    const LAT = 54;
    const MER = 44;
    const sp = (2 * R) / LAT;
    const maxW = sp * 0.86;
    x.clearRect(0, 0, w, h);
    const path = new Path2D();
    // one hatch curve (latitude or meridian): a polygon whose thickness follows the shade
    const curve = (pts: [number, number, number][]) => {
      if (pts.length < 2) return;
      const up: [number, number][] = [];
      const dn: [number, number][] = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[Math.max(0, i - 1)];
        const b = pts[Math.min(pts.length - 1, i + 1)];
        let tx = b[0] - a[0];
        let ty = b[1] - a[1];
        const tl = Math.hypot(tx, ty) || 1;
        tx /= tl;
        ty /= tl;
        const hw = pts[i][2] / 2;
        up.push([pts[i][0] - ty * hw, pts[i][1] + tx * hw]);
        dn.push([pts[i][0] + ty * hw, pts[i][1] - tx * hw]);
      }
      path.moveTo(up[0][0], up[0][1]);
      for (let i = 1; i < up.length; i++) path.lineTo(up[i][0], up[i][1]);
      for (let i = dn.length - 1; i >= 0; i--) path.lineTo(dn[i][0], dn[i][1]);
      path.closePath();
    };
    const project = (phi: number, th: number, cross: boolean): [number, number, number] | null => {
      const px = Math.cos(phi) * Math.sin(th);
      const py = Math.sin(phi);
      const pz = Math.cos(phi) * Math.cos(th);
      const y2 = py * ct - pz * sn;
      const z2 = py * sn + pz * ct;
      if (z2 < 0.02) return null;
      const dark = 1 - Math.max(0, px * lx + y2 * ly + z2 * lz);
      const wdt = cross ? Math.max(0, (dark - 0.5) * 2) ** 1.2 * maxW * 0.8 : 0.35 + dark ** 1.25 * maxW;
      return [cx + px * R, cy - y2 * R, wdt];
    };
    const run = (fn: (k: number) => [number, number, number] | null, steps: number) => {
      let seg: [number, number, number][] = [];
      for (let k = 0; k <= steps; k++) {
        const p = fn(k);
        if (p) seg.push(p);
        else if (seg.length) {
          curve(seg);
          seg = [];
        }
      }
      curve(seg);
    };
    for (let j = 0; j < LAT; j++) {
      const phi = -Math.PI / 2 + ((j + 0.5) / LAT) * Math.PI;
      run((k) => project(phi, -Math.PI + (k / 72) * Math.PI * 2, false), 72);
    }
    const spin = lt * 0.12;
    for (let j = 0; j < MER; j++) {
      const th = spin + (j / MER) * Math.PI * 2;
      run((k) => project(-Math.PI / 2 + (k / 40) * Math.PI, th, true), 40);
    }
    // cast shadow on the table: horizontal hatches tapering out, sliding opposite the light
    const sx = cx - lx * R * 0.7;
    const sy = cy + R * 1.12;
    const rx = R * (0.95 + 0.15 * Math.abs(lx));
    const ry = R * 0.17;
    for (let i = -6; i <= 6; i++) {
      const yy = (i / 7) * ry;
      const half = rx * Math.sqrt(1 - (i / 7) ** 2);
      const seg: [number, number, number][] = [];
      for (let k = 0; k <= 16; k++) {
        const u = -1 + (k / 16) * 2;
        seg.push([sx + u * half, sy + yy, maxW * 0.75 * (1 - Math.abs(u) ** 2) * (1 - Math.abs(i / 7))]);
      }
      curve(seg);
    }
    x.fillStyle = "#2b1c12";
    x.fill(path);
    x.beginPath();
    x.arc(cx, cy, R, 0, Math.PI * 2);
    x.strokeStyle = "rgba(43,28,18,.75)";
    x.lineWidth = 1.2;
    x.stroke();
  };
  return (
    <Stage r={root} className="bg-[#efe5d3] !text-[#2b1c12]" g1="rgba(214,140,80,.5)" g2="rgba(160,90,50,.25)">
      <Canvas2D root={root} draw={draw} fallback="radial-gradient(circle at 60% 40%,#efe5d3 0 10%,transparent 11%),radial-gradient(circle at 66% 46%,rgba(43,28,18,.5) 0 25%,transparent 25.3%)" />
      <Copy eyebrow="Burin & Plate · Print room" title={<>Cut by hand, lit by time.</>} sub="Copperplate engraving, signed · ₹ 3,600" font={F.fr} className="bottom-10 left-10 max-w-[440px]" dark />
    </Stage>
  );
}

/* ---------- M774 · SDF slice cross-section (a rotating solid is cut by a sliding plane; a disc shows the live section) ---------- */
const F774 = /* glsl */ `
mat2 r2(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float sdBox(vec3 p, vec3 b){ vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
vec3 toObj(vec3 p){ p.xz = r2(uTime * 0.35) * p.xz; p.xy = r2(uTime * 0.21) * p.xy; return p; }
float solid(vec3 q){
  float b = sdBox(q, vec3(0.56)) - 0.07;
  float d = max(b, -(length(q) - 0.8));
  return min(d, length(q) - 0.36);
}
float cutX(){ return sin(uTime * 0.55) * 0.7; }
float map(vec3 p){ return max(solid(toObj(p)), p.x - cutX()); }
vec3 nrm(vec3 p){
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx)));
}
vec3 sectionCol(float sd){
  vec3 acc = vec3(1.0, 0.48, 0.2);
  float bands = smoothstep(0.35, 0.5, abs(fract(sd * 16.0) - 0.5));
  vec3 c = sd < 0.0 ? acc * (0.55 + 0.45 * bands) : vec3(0.05, 0.06, 0.1) + vec3(0.08, 0.1, 0.16) * bands * 0.5;
  c += vec3(1.0, 0.85, 0.6) * smoothstep(0.018, 0.0, abs(sd));
  return c;
}
void main(){
  vec2 px = vUv * uRes;
  vec2 p = (px - vec2(0.58 * uRes.x, 0.5 * uRes.y)) / uRes.y;
  vec3 col = vec3(0.02, 0.025, 0.05) + vec3(0.03, 0.04, 0.08) * (1.0 - length(p));
  vec3 ro = vec3(2.3, 1.05, 2.35);
  vec3 ww = normalize(-ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  vec3 rd = normalize(p.x * uu + p.y * vv + 1.75 * ww);
  float cut = cutX();
  // bounding sphere
  float bb = dot(ro, rd);
  float cc = dot(ro, ro) - 1.3 * 1.3;
  float disc = bb * bb - cc;
  float t = 1e9;
  if (disc > 0.0) {
    float tt = max(0.0, -bb - sqrt(disc));
    float tf = -bb + sqrt(disc);
    for (int i = 0; i < 80; i++) {
      float d = map(ro + rd * tt);
      if (d < 0.0012) { t = tt; break; }
      tt += d;
      if (tt > tf) break;
    }
  }
  if (t < 1e8) {
    vec3 pos = ro + rd * t;
    float sd = solid(toObj(pos));
    if (pos.x - cut >= sd - 0.0015) {
      col = sectionCol(sd) * 0.95;
    } else {
      vec3 n = nrm(pos);
      vec3 L = normalize(vec3(0.6, 0.9, 0.4));
      float dif = max(dot(n, L), 0.0);
      float spe = pow(max(dot(reflect(-L, n), -rd), 0.0), 24.0);
      float fre = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
      col = vec3(0.14, 0.17, 0.26) + vec3(0.5, 0.58, 0.75) * dif + vec3(0.9) * spe * 0.6 + vec3(0.4, 0.55, 1.0) * fre * 0.5;
    }
  }
  // the cut plane as a faint glass pane (only where it is in front of the solid)
  if (abs(rd.x) > 1e-4) {
    float tp = (cut - ro.x) / rd.x;
    if (tp > 0.0 && tp < t - 0.01) {
      vec3 hp = ro + rd * tp;
      vec2 g = hp.zy;
      if (abs(g.x) < 1.15 && abs(g.y) < 1.15) {
        float edge = smoothstep(0.02, 0.0, min(1.15 - abs(g.x), 1.15 - abs(g.y)));
        vec2 gl = abs(fract(g * 5.0) - 0.5);
        float grid = smoothstep(0.03, 0.0, min(gl.x, gl.y));
        col += vec3(1.0, 0.6, 0.35) * (0.05 + grid * 0.08 + edge * 0.6);
      }
    }
  }
  // inset disc: the 2D section itself
  vec2 c0 = vec2(uRes.x - 0.2 * uRes.y, 0.22 * uRes.y);
  float rad = 0.15 * uRes.y;
  float dd = length(px - c0);
  if (dd < rad + 3.0) {
    vec2 q2 = (px - c0) / rad * 1.2;
    float sd2 = solid(toObj(vec3(cut, q2.y, -q2.x)));
    vec3 ic = sectionCol(sd2);
    float a = smoothstep(rad + 1.0, rad - 1.0, dd);
    col = mix(col, ic, a);
    col += vec3(1.0, 0.75, 0.5) * smoothstep(2.0, 0.0, abs(dd - rad)) * 0.8;
  }
  gl_FragColor = vec4(col, 1.0);
}`;
function M774() {
  const root = useRef<HTMLDivElement>(null);
  const val = useRef<HTMLSpanElement>(null);
  return (
    <Stage r={root} className="bg-[#05070d]" g1="rgba(255,130,70,.5)" g2="rgba(90,130,255,.25)">
      <div className="absolute inset-0" style={{ containerType: "size" }}>
        <Shader
          frag={F774}
          dpr={0.7}
          fallback="radial-gradient(circle at 58% 50%,rgba(140,160,210,.5) 0 14%,transparent 14.4%),radial-gradient(circle at calc(100% - 20cqh) 78%,rgba(255,122,51,.6) 0 9%,transparent 9.4%),#05070d"
          onFrame={(_u, t) => {
            if (val.current) val.current.textContent = (Math.sin(t * 0.55) * 0.7).toFixed(2);
          }}
        />
        <Sheen g1="rgba(255,130,70,.5)" opacity={0.3} />
        <div className="pointer-events-none absolute z-40 w-[160px] text-center text-[12px] uppercase tracking-[0.24em] text-[#ffc9a0]" style={{ right: "calc(20cqh - 80px)", bottom: "calc(37cqh + 10px)", fontFamily: F.mr }}>
          Live section
        </div>
        <Copy eyebrow="Kern Industrial · Precision parts" title={<>Know what&rsquo;s inside.</>} sub="CNC housing, 6061 aluminium · ₹ 8,900" className="left-10 top-10 max-w-[440px]" />
        <p className="pointer-events-none absolute bottom-10 left-10 z-40 text-[13px] uppercase tracking-[0.24em] text-white/60" style={{ fontFamily: F.mr }}>
          Cut plane x = <span ref={val}>0.00</span>
        </p>
      </div>
    </Stage>
  );
}

/* ---------- M775 · Rotating wireframe solid (cube → cylinder → icosphere, edges shaded by depth) ---------- */
type V3 = [number, number, number];
type Shape775 = { name: string; v: V3[]; e: [number, number][] };
const SHAPES775: Shape775[] = (() => {
  const s = 1 / Math.sqrt(3);
  const cubeV: V3[] = [];
  for (let i = 0; i < 8; i++) cubeV.push([i & 1 ? s : -s, i & 2 ? s : -s, i & 4 ? s : -s]);
  const cubeE: [number, number][] = [];
  for (let i = 0; i < 8; i++) for (let b = 1; b < 8; b <<= 1) if (!(i & b)) cubeE.push([i, i | b]);
  const cylV: V3[] = [];
  const cylE: [number, number][] = [];
  const SEG = 24;
  for (let k = 0; k < 2; k++) for (let i = 0; i < SEG; i++) cylV.push([Math.cos((i / SEG) * Math.PI * 2) * 0.72, k ? 0.7 : -0.7, Math.sin((i / SEG) * Math.PI * 2) * 0.72]);
  for (let i = 0; i < SEG; i++) {
    cylE.push([i, (i + 1) % SEG], [SEG + i, SEG + ((i + 1) % SEG)]);
    if (i % 3 === 0) cylE.push([i, SEG + i]);
  }
  for (let r = 1; r < 4; r++) {
    const y = -0.7 + (r / 4) * 1.4;
    for (let j = 0; j < SEG; j++) cylV.push([Math.cos((j / SEG) * Math.PI * 2) * 0.72, y, Math.sin((j / SEG) * Math.PI * 2) * 0.72]);
  }
  for (let r = 0; r < 3; r++) for (let i = 0; i < SEG; i++) cylE.push([SEG * 2 + r * SEG + i, SEG * 2 + r * SEG + ((i + 1) % SEG)]);
  // icosphere (one subdivision)
  const g = (1 + Math.sqrt(5)) / 2;
  let iv: V3[] = [
    [-1, g, 0],
    [1, g, 0],
    [-1, -g, 0],
    [1, -g, 0],
    [0, -1, g],
    [0, 1, g],
    [0, -1, -g],
    [0, 1, -g],
    [g, 0, -1],
    [g, 0, 1],
    [-g, 0, -1],
    [-g, 0, 1],
  ];
  const faces: V3[] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const norm = (p: V3): V3 => {
    const l = Math.hypot(p[0], p[1], p[2]);
    return [p[0] / l, p[1] / l, p[2] / l];
  };
  iv = iv.map(norm);
  const mid = new Map<string, number>();
  const half = (a: number, b: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!mid.has(key)) {
      iv.push(norm([(iv[a][0] + iv[b][0]) / 2, (iv[a][1] + iv[b][1]) / 2, (iv[a][2] + iv[b][2]) / 2]));
      mid.set(key, iv.length - 1);
    }
    return mid.get(key)!;
  };
  const icoE = new Map<string, [number, number]>();
  const addE = (a: number, b: number) => icoE.set(a < b ? `${a}-${b}` : `${b}-${a}`, [a, b]);
  faces.forEach(([a, b, c]) => {
    const ab = half(a, b);
    const bc = half(b, c);
    const ca = half(c, a);
    [
      [a, ab, ca],
      [b, bc, ab],
      [c, ca, bc],
      [ab, bc, ca],
    ].forEach(([p, q, r]) => {
      addE(p, q);
      addE(q, r);
      addE(r, p);
    });
  });
  return [
    { name: "Cube", v: cubeV, e: cubeE },
    { name: "Cylinder", v: cylV, e: cylE },
    { name: "Icosphere", v: iv, e: [...icoE.values()] },
  ];
})();
function M775() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const S = useRef({ lt: 0, idx: 2 });
  const draw = (x: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
    const s = S.current;
    s.lt += dt;
    const HOLD = 4;
    if (s.lt > HOLD) {
      s.lt -= HOLD;
      s.idx = (s.idx + 1) % SHAPES775.length;
      if (label.current) label.current.textContent = SHAPES775[s.idx].name;
    }
    const T = performance.now() / 1000;
    const ry = T * 0.45;
    const rx = 0.45 + Math.sin(T * 0.3) * 0.22;
    const cyR = Math.cos(ry);
    const syR = Math.sin(ry);
    const cxR = Math.cos(rx);
    const sxR = Math.sin(rx);
    const R = Math.min(h * 0.36, w * 0.24);
    const cx = w * 0.66;
    const cy = h * 0.5;
    x.clearRect(0, 0, w, h);
    x.lineCap = "round";
    const fadeIn = clamp01(s.lt / 0.7);
    const layers: [Shape775, number, number][] = [[SHAPES775[s.idx], Math.min(fadeIn, 1), 0.85 + 0.15 * ease(fadeIn)]];
    if (s.lt < 0.7) layers.push([SHAPES775[(s.idx + SHAPES775.length - 1) % SHAPES775.length], 1 - fadeIn, 1 + 0.12 * fadeIn]);
    for (const [shape, alpha, scale] of layers) {
      const P = shape.v.map(([vx, vy, vz]) => {
        const x1 = vx * cyR + vz * syR;
        const z1 = -vx * syR + vz * cyR;
        const y2 = vy * cxR - z1 * sxR;
        const z2 = vy * sxR + z1 * cxR;
        const f = 3.2 / (3.2 - z2);
        return [cx + x1 * R * f * scale, cy - y2 * R * f * scale, z2] as V3;
      });
      for (const [a, b] of shape.e) {
        const z = (P[a][2] + P[b][2]) / 2;
        const k = (z + 1) / 2;
        x.beginPath();
        x.moveTo(P[a][0], P[a][1]);
        x.lineTo(P[b][0], P[b][1]);
        x.strokeStyle = `rgba(${Math.round(110 + 145 * k)},${Math.round(150 + 90 * k)},255,${(0.12 + 0.85 * k) * alpha})`;
        x.lineWidth = 0.7 + 1.9 * k;
        x.stroke();
      }
      x.beginPath();
      for (const p of P) {
        if (p[2] < -0.2) continue;
        const r = 1.2 + (p[2] + 1) * 1.4;
        x.moveTo(p[0] + r, p[1]);
        x.arc(p[0], p[1], r, 0, Math.PI * 2);
      }
      x.fillStyle = `rgba(235,242,255,${0.9 * alpha})`;
      x.fill();
    }
  };
  return (
    <Stage r={root} className="bg-[#060812]" g1="rgba(110,150,255,.5)" g2="rgba(160,120,255,.24)">
      <Canvas2D root={root} draw={draw} fallback="radial-gradient(circle at 66% 50%,transparent 0 27%,rgba(150,180,255,.5) 27.2% 27.5%,transparent 27.8%)" />
      <div className="pointer-events-none absolute bottom-10 left-10 z-40 max-w-[440px]">
        <p className="text-[13px] uppercase tracking-[0.3em] text-white/65" style={{ fontFamily: F.mr }}>
          Formwork 3D · Modelling course
        </p>
        <h3 className="mt-3 text-[clamp(40px,4.2vw,68px)] font-[600] leading-[0.94] tracking-[-0.035em]" style={{ fontFamily: F.sg }}>
          Start with the bones.
        </h3>
        <p className="mt-4 text-[15px] text-white/70" style={{ fontFamily: F.mr }}>
          12-week cohort · ₹ 18,000
        </p>
        <p className="mt-6 text-[13px] uppercase tracking-[0.24em] text-[#b9c8ff]" style={{ fontFamily: F.mr }}>
          Form · <span ref={label}>Icosphere</span>
        </p>
      </div>
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "M764", name: "Growing tree", how: "A branching tree grows limb by limb and blossoms while petals drift; scripted clicks sprout new branches (canvas)", kind: "play", C: M764 },
  { code: "M765", name: "Game of Life", how: "A fading Conway life grid evolves behind a content card, gliders dropping in to keep it alive (canvas)", kind: "play", C: M765 },
  { code: "M766", name: "Reaction-diffusion", how: "Gray-Scott worms crawl across the stage and regrow behind a slow wiping brush (canvas)", kind: "play", C: M766 },
  { code: "M767", name: "Truchet weave", how: "Quarter-arc tiles flip orientation with a slow field while bright seams ripple outward (canvas)", kind: "play", C: M767 },
  { code: "M768", name: "Delaunay lattice", how: "A triangulated mesh with pulsing vertices is pushed and lit by a scripted pointer (canvas)", kind: "play", C: M768 },
  { code: "M769", name: "Mondrian generator", how: "Primary-colour blocks keep splitting, merging and recolouring in an endless loop (gsap)", kind: "play", C: M769 },
  { code: "M770", name: "Chladni patterns", how: "Sand particles settle on Chladni nodal lines, scattering and re-forming as the mode changes (canvas)", kind: "play", C: M770 },
  { code: "M771", name: "Pendulum wave", how: "Sixteen pendulums of stepped length swing into travelling waves, splits and re-syncs (CSS)", kind: "play", C: M771 },
  { code: "M772", name: "Pointer moire", how: "A ring ruling centred on a scripted pointer beats against a fixed one into moving moire (CSS)", kind: "play", C: M772 },
  { code: "M773", name: "Engraving hatch sphere", how: "Copperplate hatch lines on a sphere swell and cross-hatch with shadow as the light circles (canvas)", kind: "play", C: M773 },
  { code: "M774", name: "SDF slice cross-section", how: "A rotating solid is cut by a sliding plane; a disc shows the live cross-section (WebGL)", kind: "play", C: M774 },
  { code: "M775", name: "Rotating wireframe solid", how: "A wireframe cube, cylinder and icosphere take turns rotating, edges shaded by depth (canvas)", kind: "play", C: M775 },
];
