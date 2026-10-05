"use client";

// Micro-interactions, batch 19 · group 3 (MOTION-MENU U250–U261). Small focused demos for /lab/motion.
// Every hover / drag / click demo also plays by itself: a visible fake pointer (ring) walks a path or runs a scripted
// drag / tap, resting ≤ 0.5 s per target. The real mouse takes over for 2.5 s whenever it moves inside the stage.
// A CSS-only glow loop never stops (and sits on top again, screen-blended) so covered stages never freeze.
// Canvas demos draw at dpr 1 and only while on screen; WebGL demos (U253, U261) build only within ~1 screen of the
// viewport, run at dpr 1 and release the context on unmount.
// ?static=1 / reduced motion: no JS, the markup shows a sensible final state. Motion ideas only, rebuilt from scratch.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { createShader, type GLHandle } from "@/lib/gl";
import { useScrub, useTicker } from "@/components/fx/shared";
import type { MotionDef } from "./types";

const F = {
  sg: "'Space Grotesk Variable', system-ui, sans-serif",
  fr: "'Fraunces Variable', Georgia, serif",
  is: "'Instrument Serif', Georgia, serif",
  sy: "'Syne Variable', 'Space Grotesk Variable', system-ui, sans-serif",
  mr: "'Manrope Variable', system-ui, sans-serif",
};

const EZ = "cubic-bezier(.2,.7,.2,1)";

const CSS = `
.b19g3-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b19g3-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b19g3-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b19g3-hide{visibility:hidden}
.b19g3-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;pointer-events:none;z-index:40;opacity:0;transition:opacity .25s}
.b19g3-dot>span{display:block;width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);transition:transform .2s,background-color .2s}
.b19g3-dot.tap>span{animation:b19g3-tap .32s ease-out}
.b19g3-dot.press>span{transform:scale(.62);background:rgba(255,255,255,.55)}
@keyframes b19g3-tap{40%{transform:scale(.55);background:rgba(255,255,255,.6)}100%{transform:scale(1)}}
.b19g3-cv{position:absolute;inset:0;width:100%;height:100%;display:block}

/* U250 slider */
.u250-col{display:block;transition:transform .45s ${EZ}}
.u250-col>span{display:block;height:1em;line-height:1em}
.u250-thumb{position:absolute;top:50%;width:8px;height:118px;margin:-59px 0 0 -4px;border-radius:6px;background:#f4fff9;box-shadow:0 0 0 5px rgba(124,242,200,.18),0 0 26px rgba(124,242,200,.75)}

/* U252 fire button */
.u252-cv{image-rendering:pixelated}
.u252-b{transition:box-shadow .4s ${EZ},border-color .4s}
.u252-b.on{box-shadow:0 0 60px rgba(255,120,40,.35);border-color:rgba(255,180,90,.6)}

/* U254 morph cursor */
.u254-cur{position:absolute;left:0;top:0;background:#fff;mix-blend-mode:difference;pointer-events:none;z-index:30}

/* U256 lamp */
.u256-grid{background-image:linear-gradient(rgba(255,255,255,var(--a)) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,var(--a)) 1px,transparent 1px);background-size:56px 56px;background-position:center top}
.u256-lit{-webkit-mask-image:radial-gradient(260px 120px at var(--lx,50%) var(--ly,45%),#000 0%,rgba(0,0,0,.6) 40%,transparent 72%);mask-image:radial-gradient(260px 120px at var(--lx,50%) var(--ly,45%),#000 0%,rgba(0,0,0,.6) 40%,transparent 72%)}
.u256-bulb{animation:u256-hum 1.6s ease-in-out infinite alternate}
@keyframes u256-hum{to{opacity:.78}}

/* U258 cover */
.u258-box{transition:border-color .35s,box-shadow .35s}
.u258-box.on{border-color:rgba(160,200,255,.7);box-shadow:0 0 50px rgba(110,160,255,.35)}
.u258-w{display:inline-block;transition:color .35s}
.u258-box.on .u258-w{color:#cfe1ff}

/* U260 rail */
.u260-t{position:absolute;inset:0;opacity:0;transition:opacity .45s ${EZ},transform .45s ${EZ};transform:translateY(14px)}
.u260-t.on{opacity:1;transform:none}

html.is-static .b19g3-glow,html.is-static .u256-bulb{animation:none}
html.is-static {
  .b19g3-glow,.u256-bulb{animation:none}
  .u250-col,.u252-b,.u258-box,.u258-w,.u260-t{transition:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop, again on top (screen blend) so covered stages never freeze. */
function Stage({ r, children, g1, g2 }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string }) {
  return (
    <div ref={r} className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff]">
      <style href="b19g3-css" precedence="default">
        {CSS}
      </style>
      <div className="b19g3-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      <div className="b19g3-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: 0.45, zIndex: 35 } as CSSProperties} aria-hidden />
    </div>
  );
}

/** The visible fake pointer (a ring). */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => (
  <div ref={r} className="b19g3-dot" aria-hidden>
    <span />
  </div>
);

type Pt = { x: number; y: number; inside: boolean };
type Box = { l: number; t: number; w: number; h: number };
type V2 = [number, number];

function rel(node: Element, root: Element): Box {
  const a = node.getBoundingClientRect();
  const r = root.getBoundingClientRect();
  return { l: a.left - r.left, t: a.top - r.top, w: a.width, h: a.height };
}
const inBox = (b: Box, x: number, y: number, pad = 0) => x >= b.l - pad && x <= b.l + b.w + pad && y >= b.t - pad && y <= b.t + b.h + pad;
const mid = (b: Box): V2 => [b.l + b.w / 2, b.t + b.h / 2];
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const now = () => performance.now() / 1000;
const tapDot = (d: HTMLElement | null) => {
  if (!d) return;
  d.classList.remove("tap");
  void d.offsetWidth;
  d.classList.add("tap");
};

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
    el.addEventListener("pointerdown", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", move);
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
    fr.current(p, el, !useReal, Math.min(0.05, Math.max(0.001, dt)));
  });
}

/** Looping glide through key points (fractions of w/h); each key = [x, y, seconds to reach the next]. Equal keys = a rest. */
function glide(t: number, keys: [number, number, number][], w: number, h: number): V2 {
  const total = keys.reduce((s, k) => s + k[2], 0);
  let tt = ((t % total) + total) % total;
  let i = 0;
  while (tt > keys[i][2] && i < keys.length - 1) {
    tt -= keys[i][2];
    i++;
  }
  const a = keys[i];
  const b = keys[(i + 1) % keys.length];
  const m = easeIO(clamp(tt / a[2], 0, 1));
  return [(a[0] + (b[0] - a[0]) * m) * w, (a[1] + (b[1] - a[1]) * m) * h];
}

/** Sizes a canvas's bitmap to its CSS box at dpr 1. */
function fit(c: HTMLCanvasElement): V2 {
  const w = Math.max(1, Math.round(c.clientWidth));
  const h = Math.max(1, Math.round(c.clientHeight));
  if (c.width !== w) c.width = w;
  if (c.height !== h) c.height = h;
  return [w, h];
}

/** True once the stage is within ~1 screen of the viewport (WebGL builds only then). */
function useNear(ref: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "900px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return near;
}

const Eyebrow = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={`text-[13px] uppercase tracking-[0.22em] text-white/55 ${className}`} style={{ fontFamily: F.sg }}>
    {children}
  </p>
);

function rr(x: CanvasRenderingContext2D, l: number, t: number, w: number, h: number, r: number) {
  x.beginPath();
  x.moveTo(l + r, t);
  x.arcTo(l + w, t, l + w, t + h, r);
  x.arcTo(l + w, t + h, l, t + h, r);
  x.arcTo(l, t + h, l, t, r);
  x.arcTo(l, t, l + w, t, r);
  x.closePath();
}

/* ───────────────────────── U250 · Shimmering grid slider ───────────────────────── */
const U250_COLS = 44;
const U250_ROWS = 5;
const U250_T = [0.18, 0.74, 0.4, 0.92, 0.28, 0.62];
const u250Amt = (v: number) => 10000 + Math.round(clamp(v, 0, 1) * 899) * 100;
const U250_INIT = 0.47;
function U250() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const digits = useRef<HTMLSpanElement>(null);
  const st = useRef({ v: U250_INIT, vd: U250_INIT, drag: false, sv: U250_INIT, press: false, amt: -1 });
  const setFrom = (clientX: number) => {
    const tr = track.current;
    if (!tr) return;
    const b = tr.getBoundingClientRect();
    st.current.v = clamp((clientX - b.left) / Math.max(1, b.width), 0, 1);
  };
  usePointer(
    root,
    dot,
    (t, el) => {
      const seg = 1.05;
      const move = 0.72;
      const k = Math.floor(t / seg);
      const f = t / seg - k;
      const a = U250_T[k % U250_T.length];
      const b = U250_T[(k + 1) % U250_T.length];
      const moving = f >= 1 - move;
      const m = moving ? easeIO((f - (1 - move)) / move) : 0;
      st.current.sv = a + (b - a) * m;
      st.current.press = moving;
      const tr = track.current;
      if (!tr) return { x: 0, y: 0, inside: false };
      const bx = rel(tr, el);
      return { x: bx.l + st.current.vd * bx.w, y: bx.t + bx.h / 2, inside: true };
    },
    (_p, el, fake, dt) => {
      const S = st.current;
      const target = fake ? S.sv : S.v;
      if (fake) S.v = S.sv;
      S.vd += (target - S.vd) * Math.min(1, dt * 14);
      dot.current?.classList.toggle("press", fake && S.press);
      if (thumb.current) thumb.current.style.left = `${(S.vd * 100).toFixed(2)}%`;
      const amt = u250Amt(S.vd);
      if (amt !== S.amt && digits.current) {
        S.amt = amt;
        const ds = String(amt).padStart(5, "0").split("").map(Number);
        el.querySelectorAll<HTMLElement>(".u250-col").forEach((c, i) => (c.style.transform = `translateY(${-ds[i]}em)`));
      }
      const c = cv.current;
      if (!c) return;
      const fbg = el.querySelector<HTMLElement>(".u250-fb");
      if (fbg) fbg.style.opacity = "0";
      const [w, h] = fit(c);
      const x = c.getContext("2d");
      if (!x) return;
      x.clearRect(0, 0, w, h);
      const cw = w / U250_COLS;
      const ch = h / U250_ROWS;
      const T = now();
      for (let col = 0; col < U250_COLS; col++) {
        const cx = (col + 0.5) / U250_COLS;
        const on = cx <= S.vd;
        const near = Math.exp(-Math.pow((cx - S.vd) * 18, 2));
        for (let r = 0; r < U250_ROWS; r++) {
          const hs = Math.sin(col * 12.9898 + r * 78.233) * 43758.5453;
          const ph = hs - Math.floor(hs);
          const sh = 0.5 + 0.5 * Math.sin(T * 3.2 + ph * 6.283 - col * 0.32);
          if (on) {
            const a = 0.35 + 0.55 * sh + 0.3 * near;
            x.fillStyle = `rgba(${Math.round(124 + 110 * near)},242,${Math.round(200 + 40 * near)},${Math.min(1, a).toFixed(3)})`;
          } else x.fillStyle = `rgba(255,255,255,${(0.05 + 0.06 * sh + 0.25 * near).toFixed(3)})`;
          x.fillRect(col * cw + 1.5, r * ch + 1.5, cw - 3, ch - 3);
        }
      }
    },
  );
  const init = String(u250Amt(U250_INIT)).padStart(5, "0").split("").map(Number);
  return (
    <Stage r={root} g1="rgba(124,242,200,.52)" g2="rgba(79,141,255,.22)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Gift card amount</Eyebrow>
        <p className="mt-4 flex items-baseline text-[clamp(64px,7vw,112px)] leading-none tracking-[-0.02em]" style={{ fontFamily: F.sg, fontWeight: 600 }} aria-label="Amount">
          <span className="mr-[0.12em] text-white/60">₹</span>
          <span ref={digits} className="flex">
            {init.map((d, i) => (
              <span key={i} className="flex">
                <span className="relative inline-block h-[1em] w-[0.64em] overflow-hidden text-center">
                  <span className="u250-col" style={{ transform: `translateY(${-d}em)` }}>
                    {Array.from({ length: 10 }, (_, k) => (
                      <span key={k}>{k}</span>
                    ))}
                  </span>
                </span>
                {i === 1 && <span className="w-[0.28em] text-white/60">,</span>}
              </span>
            ))}
          </span>
        </p>
        <div
          ref={track}
          className="relative mt-12 h-[86px] w-[min(78%,880px)] cursor-ew-resize touch-none"
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            st.current.drag = true;
            setFrom(e.clientX);
          }}
          onPointerMove={(e) => st.current.drag && setFrom(e.clientX)}
          onPointerUp={() => (st.current.drag = false)}
        >
          <div className="u250-fb absolute inset-0 grid grid-cols-[repeat(22,1fr)] gap-[3px] opacity-60" aria-hidden>
            {Array.from({ length: 22 }, (_, i) => (
              <span key={i} className={i < 10 ? "bg-[#7cf2c8]/70" : "bg-white/10"} />
            ))}
          </div>
          <canvas ref={cv} className="b19g3-cv" aria-hidden />
          <div ref={thumb} className="u250-thumb" style={{ left: `${U250_INIT * 100}%` }} />
        </div>
        <div className="mt-5 flex w-[min(78%,880px)] justify-between text-[13px] text-white/45" style={{ fontFamily: F.mr }}>
          <span>₹10,000</span>
          <span>Drag to choose</span>
          <span>₹99,900</span>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U251 · Shatter glass card ───────────────────────── */
const U251_W = 460;
const U251_H = 290;
type Shard = { poly: V2[]; cx: number; cy: number; vx: number; vy: number; va: number; x: number; y: number; a: number; sx: number; sy: number; sa: number };
function clipHalf(poly: V2[], s: V2, o: V2): V2[] {
  const nx = o[0] - s[0];
  const ny = o[1] - s[1];
  const mx = (s[0] + o[0]) / 2;
  const my = (s[1] + o[1]) / 2;
  const side = (p: V2) => (p[0] - mx) * nx + (p[1] - my) * ny;
  const out: V2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const da = side(a);
    const db = side(b);
    if (da <= 0) out.push(a);
    if ((da <= 0) !== (db <= 0)) {
      const k = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    }
  }
  return out;
}
function u251Shards(ix: number, iy: number): Shard[] {
  const seeds: V2[] = [];
  for (let i = 0; i < 15; i++) {
    const r = Math.pow(Math.random(), 1.6) * 120;
    const a = Math.random() * Math.PI * 2;
    seeds.push([clamp(ix + Math.cos(a) * r, 2, U251_W - 2), clamp(iy + Math.sin(a) * r, 2, U251_H - 2)]);
  }
  for (let i = 0; i < 13; i++) seeds.push([rnd(0, U251_W), rnd(0, U251_H)]);
  const rect: V2[] = [
    [0, 0],
    [U251_W, 0],
    [U251_W, U251_H],
    [0, U251_H],
  ];
  const out: Shard[] = [];
  seeds.forEach((s, i) => {
    let poly = rect;
    seeds.forEach((o, j) => {
      if (i !== j && poly.length) poly = clipHalf(poly, s, o);
    });
    if (poly.length < 3) return;
    const cx = poly.reduce((q, p) => q + p[0], 0) / poly.length;
    const cy = poly.reduce((q, p) => q + p[1], 0) / poly.length;
    const dx = cx - ix;
    const dy = cy - iy;
    const d = Math.max(1, Math.hypot(dx, dy));
    const sp = rnd(160, 420) * (1.2 - Math.min(1, d / 400));
    out.push({ poly, cx, cy, vx: (dx / d) * sp, vy: (dy / d) * sp - rnd(80, 220), va: rnd(-5, 5), x: 0, y: 0, a: 0, sx: 0, sy: 0, sa: 0 });
  });
  return out;
}
function u251Face(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = U251_W;
  c.height = U251_H;
  const x = c.getContext("2d")!;
  rr(x, 1, 1, U251_W - 2, U251_H - 2, 26);
  const g = x.createLinearGradient(0, 0, U251_W, U251_H);
  g.addColorStop(0, "rgba(180,205,255,.34)");
  g.addColorStop(0.55, "rgba(120,140,220,.16)");
  g.addColorStop(1, "rgba(255,255,255,.1)");
  x.fillStyle = "#121a30";
  x.fill();
  x.fillStyle = g;
  x.fill();
  x.save();
  x.clip();
  const sh = x.createLinearGradient(0, 0, U251_W, 0);
  sh.addColorStop(0.2, "rgba(255,255,255,0)");
  sh.addColorStop(0.42, "rgba(255,255,255,.16)");
  sh.addColorStop(0.5, "rgba(255,255,255,0)");
  x.fillStyle = sh;
  x.fillRect(0, 0, U251_W, U251_H);
  x.restore();
  x.lineWidth = 1.5;
  x.strokeStyle = "rgba(255,255,255,.42)";
  x.stroke();
  x.fillStyle = "rgba(255,255,255,.62)";
  x.font = "600 13px 'Space Grotesk Variable', system-ui, sans-serif";
  x.fillText("M E M B E R   P A S S", 32, 46);
  rr(x, U251_W - 92, 28, 58, 42, 9);
  x.fillStyle = "rgba(255,214,140,.75)";
  x.fill();
  x.fillStyle = "#f3f6ff";
  x.font = "500 50px 'Fraunces Variable', Georgia, serif";
  x.fillText("Aurora Club", 32, 168);
  x.fillStyle = "rgba(255,255,255,.7)";
  x.font = "500 18px 'Manrope Variable', system-ui, sans-serif";
  x.fillText("₹2,400 / year · all lounges", 32, 210);
  x.fillStyle = "rgba(255,255,255,.45)";
  x.font = "500 15px 'Space Grotesk Variable', system-ui, sans-serif";
  x.fillText("0428  ·  1197  ·  5530", 32, 256);
  return c;
}
function U251() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const fb = useRef<HTMLDivElement>(null);
  const st = useRef<{ mode: "intact" | "crack" | "fly" | "reform"; t0: number; shards: Shard[]; face: HTMLCanvasElement | null; imp: V2; lastPh: number; hit: V2 }>({
    mode: "intact",
    t0: 0,
    shards: [],
    face: null,
    imp: [0, 0],
    lastPh: 0,
    hit: [0.55, 0.45],
  });
  const origin = (el: HTMLElement): V2 => [el.clientWidth / 2 - U251_W / 2, el.clientHeight / 2 - U251_H / 2 + 10];
  const fire = (el: HTMLElement, x: number, y: number) => {
    const S = st.current;
    if (S.mode !== "intact") return;
    const [ox, oy] = origin(el);
    const ix = x - ox;
    const iy = y - oy;
    if (ix < 0 || iy < 0 || ix > U251_W || iy > U251_H) return;
    S.imp = [ix, iy];
    S.shards = u251Shards(ix, iy);
    S.mode = "crack";
    S.t0 = now();
  };
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const down = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      fire(el, e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("pointerdown", down);
    const reset = () => (st.current.face = null);
    document.fonts?.ready.then(reset);
    return () => el.removeEventListener("pointerdown", down);
  }, []);
  const PER = 2.7;
  usePointer(
    root,
    dot,
    (t, el) => {
      const [ox, oy] = origin(el);
      const ph = t % PER;
      const S = st.current;
      if (ph < S.lastPh) S.hit = [rnd(0.25, 0.75), rnd(0.3, 0.7)];
      const rest: V2 = [ox + U251_W + 70, oy + U251_H + 40];
      const hit: V2 = [ox + S.hit[0] * U251_W, oy + S.hit[1] * U251_H];
      let p: V2;
      if (ph < 0.45) {
        const m = easeIO(ph / 0.45);
        p = [rest[0] + (hit[0] - rest[0]) * m, rest[1] + (hit[1] - rest[1]) * m];
      } else if (ph < 0.75) p = hit;
      else {
        const m = easeIO((ph - 0.75) / (PER - 0.75));
        p = [hit[0] + (rest[0] - hit[0]) * m, hit[1] + (rest[1] - hit[1]) * m];
      }
      if (S.lastPh < 0.45 && ph >= 0.45) {
        tapDot(dot.current);
        fire(el, hit[0], hit[1]);
      }
      S.lastPh = ph;
      return { x: p[0], y: p[1], inside: true };
    },
    (_p, el, _fake, dt) => {
      const c = cv.current;
      if (!c) return;
      const [w, h] = fit(c);
      const x = c.getContext("2d");
      if (!x) return;
      const S = st.current;
      if (!S.face) S.face = u251Face();
      if (fb.current) fb.current.style.opacity = "0";
      x.clearRect(0, 0, w, h);
      const [ox, oy] = origin(el);
      const age = now() - S.t0;
      if (S.mode === "crack" && age > 0.14) {
        S.mode = "fly";
        S.t0 = now();
      } else if (S.mode === "fly" && age > 0.95) {
        S.mode = "reform";
        S.t0 = now();
        S.shards.forEach((s) => {
          s.sx = s.x;
          s.sy = s.y;
          s.sa = s.a;
        });
      } else if (S.mode === "reform" && age > 0.62) S.mode = "intact";
      if (S.mode === "intact" || S.mode === "crack") {
        x.drawImage(S.face, ox, oy);
        if (S.mode === "crack") {
          x.strokeStyle = "rgba(255,255,255,.75)";
          x.lineWidth = 1;
          S.shards.forEach((s) => {
            x.beginPath();
            s.poly.forEach((q, i) => (i ? x.lineTo(ox + q[0], oy + q[1]) : x.moveTo(ox + q[0], oy + q[1])));
            x.closePath();
            x.stroke();
          });
          const g = x.createRadialGradient(ox + S.imp[0], oy + S.imp[1], 0, ox + S.imp[0], oy + S.imp[1], 120);
          g.addColorStop(0, "rgba(255,255,255,.7)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          x.fillStyle = g;
          x.fillRect(ox + S.imp[0] - 120, oy + S.imp[1] - 120, 240, 240);
        }
        return;
      }
      const m = S.mode === "reform" ? easeIO(clamp(age / 0.62, 0, 1)) : 0;
      S.shards.forEach((s) => {
        if (S.mode === "fly") {
          s.vy += 1500 * dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.a += s.va * dt;
        } else {
          s.x = s.sx * (1 - m);
          s.y = s.sy * (1 - m);
          s.a = s.sa * (1 - m);
        }
        x.save();
        x.translate(ox + s.cx + s.x, oy + s.cy + s.y);
        x.rotate(s.a);
        x.beginPath();
        s.poly.forEach((q, i) => (i ? x.lineTo(q[0] - s.cx, q[1] - s.cy) : x.moveTo(q[0] - s.cx, q[1] - s.cy)));
        x.closePath();
        x.save();
        x.clip();
        x.drawImage(S.face!, -s.cx, -s.cy);
        x.restore();
        x.strokeStyle = `rgba(220,235,255,${(0.65 * (1 - m)).toFixed(3)})`;
        x.lineWidth = 1.2;
        x.stroke();
        x.restore();
      });
    },
  );
  return (
    <Stage r={root} g1="rgba(120,160,255,.55)" g2="rgba(255,214,140,.22)">
      <div className="absolute inset-x-0 top-[7%] text-center">
        <Eyebrow>Tap the pass</Eyebrow>
      </div>
      <div ref={fb} className="absolute left-1/2 top-1/2 ml-[-230px] mt-[-135px] h-[290px] w-[460px] rounded-[26px] border border-white/40 bg-[linear-gradient(135deg,rgba(180,205,255,.34),rgba(120,140,220,.16)_55%,rgba(255,255,255,.1)),#121a30] p-8">
        <p className="text-[13px] tracking-[0.4em] text-white/60" style={{ fontFamily: F.sg }}>
          MEMBER PASS
        </p>
        <p className="mt-14 text-[50px] leading-none" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Aurora Club
        </p>
        <p className="mt-4 text-[18px] text-white/70" style={{ fontFamily: F.mr }}>
          ₹2,400 / year · all lounges
        </p>
      </div>
      <canvas ref={cv} className="b19g3-cv" aria-hidden />
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U252 · Pixel fire fill button ───────────────────────── */
const U252_FW = 112;
const U252_FH = 30;
const U252_PAL: [number, number, number][] = (() => {
  const stops: [number, [number, number, number]][] = [
    [0, [20, 6, 4]],
    [0.25, [120, 20, 8]],
    [0.5, [220, 70, 16]],
    [0.72, [255, 150, 40]],
    [0.88, [255, 215, 110]],
    [1, [255, 250, 230]],
  ];
  return Array.from({ length: 37 }, (_, i) => {
    const t = i / 36;
    let k = 0;
    while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
    const [ta, ca] = stops[k];
    const [tb, cb] = stops[k + 1];
    const f = clamp((t - ta) / (tb - ta), 0, 1);
    return [0, 1, 2].map((j) => Math.round(ca[j] + (cb[j] - ca[j]) * f)) as [number, number, number];
  });
})();
function U252() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ heat: new Uint8Array(U252_FW * U252_FH), img: null as ImageData | null, hv: 0 });
  usePointer(
    root,
    dot,
    (t, el) => {
      const b = btn.current ? rel(btn.current, el) : { l: 0, t: 0, w: 1, h: 1 };
      const [cx, cy] = mid(b);
      return { x: cx + b.w * 0.72 * Math.sin(t * 0.95), y: cy + b.h * 1.25 * Math.sin(t * 1.9), inside: true };
    },
    (p, el, _fake, dt) => {
      const B = btn.current;
      const c = cv.current;
      if (!B || !c) return;
      const b = rel(B, el);
      const over = p.inside && inBox(b, p.x, p.y);
      B.classList.toggle("on", over);
      const S = st.current;
      S.hv += ((over ? 1 : 0) - S.hv) * Math.min(1, dt * (over ? 3.2 : 1.6));
      const lx = ((p.x - b.l) / Math.max(1, b.w)) * U252_FW;
      const H = S.heat;
      const src = Math.round(36 * S.hv);
      for (let x = 0; x < U252_FW; x++) H[(U252_FH - 1) * U252_FW + x] = Math.max(0, Math.min(36, src - (Math.random() < 0.3 ? 4 : 0)));
      for (let y = 0; y < U252_FH - 1; y++) {
        for (let x = 0; x < U252_FW; x++) {
          const from = H[(y + 1) * U252_FW + x];
          const r = (Math.random() * 3) | 0;
          const lean = Math.random() < 0.38 ? Math.sign(lx - x) : 0;
          const dx = clamp(x + r - 1 + lean, 0, U252_FW - 1);
          H[y * U252_FW + dx] = Math.max(0, from - (r & 1));
        }
      }
      if (c.width !== U252_FW) c.width = U252_FW;
      if (c.height !== U252_FH) c.height = U252_FH;
      const x = c.getContext("2d");
      if (!x) return;
      if (!S.img) S.img = x.createImageData(U252_FW, U252_FH);
      const d = S.img.data;
      for (let i = 0; i < H.length; i++) {
        const v = H[i];
        const col = U252_PAL[v];
        d[i * 4] = col[0];
        d[i * 4 + 1] = col[1];
        d[i * 4 + 2] = col[2];
        d[i * 4 + 3] = v < 2 ? 0 : Math.min(255, v * 12);
      }
      x.putImageData(S.img, 0, 0);
    },
  );
  return (
    <Stage r={root} g1="rgba(255,120,50,.52)" g2="rgba(255,209,102,.22)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Chilli oil · small batch · ₹549</Eyebrow>
        <button
          ref={btn}
          type="button"
          className="u252-b relative mt-8 h-[150px] w-[560px] overflow-hidden rounded-[30px] border border-white/18 bg-[#16100d]"
          onPointerEnter={(e) => e.currentTarget.classList.add("on")}
        >
          <canvas ref={cv} className="b19g3-cv u252-cv" aria-hidden />
          <span className="relative text-[44px] tracking-[-0.01em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,.55)]" style={{ fontFamily: F.sy, fontWeight: 800 }}>
            Add the heat
          </span>
        </button>
        <p className="mt-6 text-[15px] text-white/55" style={{ fontFamily: F.mr }}>
          Hover and the flames lean toward you.
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U253 · 3D tube cursor (WebGL) ───────────────────────── */
const U253_N = 16;
const U253_FRAG = /* glsl */ `
uniform vec2 uP[48];
uniform vec2 uL;
uniform vec3 uLC;
uniform float uBoost;
vec3 tubeCol(int i){
  if (i == 0) return vec3(1.0, 0.36, 0.54);
  if (i == 1) return vec3(0.36, 0.86, 1.0);
  return vec3(1.0, 0.82, 0.38);
}
void main(){
  vec2 p = vUv * uRes;
  float bestZ = -1.0;
  vec3 bestN = vec3(0.0, 0.0, 1.0);
  vec3 base = vec3(0.0);
  float along = 0.0;
  for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 15; j++) {
      vec2 a = uP[i * 16 + j];
      vec2 b = uP[i * 16 + j + 1];
      vec2 pa = p - a;
      vec2 ba = b - a;
      float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.001), 0.0, 1.0);
      vec2 q = pa - ba * h;
      float d = length(q);
      float s = (float(j) + h) / 15.0;
      float r = mix(22.0, 3.0, s);
      if (d < r) {
        float k = d / r;
        float zz = sqrt(1.0 - k * k) * r + (1.0 - s) * 30.0 + float(i) * 0.5;
        if (zz > bestZ) {
          bestZ = zz;
          vec2 dir = q / max(d, 0.001);
          bestN = normalize(vec3(dir * k, sqrt(max(1.0 - k * k, 0.0))));
          base = tubeCol(i);
          along = s;
        }
      }
    }
  }
  float gd = length(p - uL);
  vec3 bg = uLC * (0.2 / (1.0 + pow(gd / 260.0, 2.0))) * uBoost;
  if (bestZ < 0.0) {
    gl_FragColor = vec4(bg, clamp(max(bg.r, max(bg.g, bg.b)) * 1.4, 0.0, 1.0));
    return;
  }
  vec3 L = normalize(vec3(uL - p, 160.0));
  float dif = max(dot(bestN, L), 0.0);
  vec3 R = reflect(-L, bestN);
  float sp = pow(max(R.z, 0.0), 28.0);
  float rim = pow(1.0 - bestN.z, 2.0);
  vec3 c = base * (0.14 + 0.95 * dif) + uLC * sp * 0.9 * uBoost + base * rim * 0.35;
  c *= mix(1.0, 0.5, along);
  gl_FragColor = vec4(c, 1.0);
}`;
function U253() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const fb = useRef<HTMLDivElement>(null);
  const near = useNear(root);
  const st = useRef({
    pts: [0, 1, 2].map(() => Array.from({ length: U253_N }, () => [0, 0] as V2)),
    arr: new Array<number>(96).fill(0),
    L: [0, 0] as V2,
    LC: [1, 1, 1],
    boost: 1,
    last: [0, 0] as V2,
    init: false,
  });
  useEffect(() => {
    const c = cv.current;
    if (!near || !c) return;
    let dead = false;
    let h: GLHandle | null = null;
    let first = true;
    (async () => {
      h = await createShader(c, U253_FRAG, {
        dpr: 1,
        uniforms: { uP: { value: st.current.arr }, uL: { value: [0, 0] }, uLC: { value: [1, 1, 1] }, uBoost: { value: 1 } },
        onFrame: (u) => {
          const S = st.current;
          (u.uL as { value: number[] }).value = S.L;
          (u.uLC as { value: number[] }).value = S.LC;
          u.uBoost.value = S.boost;
          if (first) {
            first = false;
            if (fb.current) fb.current.style.opacity = "0";
          }
        },
      });
      if (dead) h?.destroy();
    })();
    return () => {
      dead = true;
      h?.destroy();
    };
  }, [near]);
  usePointer(
    root,
    dot,
    (t, el) => ({ x: el.clientWidth * (0.5 + 0.36 * Math.sin(t * 0.85)), y: el.clientHeight * (0.5 + 0.28 * Math.sin(t * 1.7)), inside: true }),
    (p, el, _fake, dt) => {
      const S = st.current;
      const H = el.clientHeight;
      const T = now();
      if (!S.init) {
        S.init = true;
        S.pts.forEach((tube) => tube.forEach((q) => ((q[0] = p.x), (q[1] = p.y))));
        S.last = [p.x, p.y];
      }
      const sp = Math.hypot(p.x - S.last[0], p.y - S.last[1]) / dt;
      S.last = [p.x, p.y];
      S.boost += (1 + Math.min(1.2, sp / 900) - S.boost) * Math.min(1, dt * 4);
      const fa = 1 - Math.pow(1 - 0.5, dt * 60);
      const fb2 = 1 - Math.pow(1 - 0.4, dt * 60);
      S.pts.forEach((tube, i) => {
        const ang = T * 3 + (i * Math.PI * 2) / 3;
        const hx = p.x + Math.cos(ang) * 24;
        const hy = p.y + Math.sin(ang) * 24;
        tube[0][0] += (hx - tube[0][0]) * fa;
        tube[0][1] += (hy - tube[0][1]) * fa;
        for (let k = 1; k < U253_N; k++) {
          const tw = Math.sin(T * 2.4 + k * 0.6 + i * 2.1) * 1.4;
          tube[k][0] += (tube[k - 1][0] - tube[k][0]) * fb2 + tw;
          tube[k][1] += (tube[k - 1][1] - tube[k][1]) * fb2 - tw * 0.6;
        }
        tube.forEach((q, k) => {
          S.arr[(i * U253_N + k) * 2] = q[0];
          S.arr[(i * U253_N + k) * 2 + 1] = H - q[1];
        });
      });
      S.L = [p.x, H - p.y];
      S.LC = [0.65 + 0.35 * Math.sin(T * 0.7), 0.65 + 0.35 * Math.sin(T * 0.7 + 2.1), 0.65 + 0.35 * Math.sin(T * 0.7 + 4.2)];
    },
  );
  return (
    <Stage r={root} g1="rgba(92,225,255,.5)" g2="rgba(255,92,138,.24)">
      <div ref={fb} className="absolute inset-0 transition-opacity duration-500" aria-hidden>
        <svg viewBox="0 0 1200 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <path d="M260 420 C420 180 620 520 820 300 S1020 200 1060 260" fill="none" stroke="#ff5c8a" strokeWidth="26" strokeLinecap="round" opacity=".85" />
          <path d="M240 380 C440 220 600 470 800 260 S1010 240 1050 300" fill="none" stroke="#5ce1ff" strokeWidth="20" strokeLinecap="round" opacity=".85" />
          <path d="M280 450 C400 260 640 540 840 330 S1000 230 1070 230" fill="none" stroke="#ffd166" strokeWidth="14" strokeLinecap="round" opacity=".85" />
        </svg>
      </div>
      <canvas ref={cv} className="b19g3-cv opacity-0 transition-opacity duration-500" aria-hidden />
      <div className="pointer-events-none absolute bottom-[8%] left-[6%]">
        <Eyebrow>Studio night · light lab</Eyebrow>
        <p className="mt-3 text-[clamp(36px,3.6vw,56px)] leading-none tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Neon follows you
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U254 · Morphing magnetic cursor ───────────────────────── */
function U254() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cur = useRef<HTMLDivElement>(null);
  const st = useRef({ x: 0, y: 0, w: 24, h: 24, r: 12, s: 1, init: false });
  usePointer(
    root,
    dot,
    (t, el) => {
      const ts = [...el.querySelectorAll<HTMLElement>(".u254-t")];
      const pts: V2[] = ts.map((n) => mid(rel(n, el)));
      pts.splice(2, 0, [el.clientWidth * 0.5, el.clientHeight * 0.52]);
      pts.push([el.clientWidth * 0.22, el.clientHeight * 0.66]);
      const seg = 0.95;
      const move = 0.5;
      const k = Math.floor(t / seg);
      const f = t / seg - k;
      const a = pts[k % pts.length];
      const b = pts[(k + 1) % pts.length];
      const m = f < 1 - move ? 0 : easeIO((f - (1 - move)) / move);
      const jig = f < 1 - move ? Math.sin((f / (1 - move)) * Math.PI) : 0;
      return { x: a[0] + (b[0] - a[0]) * m + jig * 14, y: a[1] + (b[1] - a[1]) * m - jig * 6, inside: true };
    },
    (p, el, _fake, dt) => {
      const S = st.current;
      if (!S.init) {
        S.init = true;
        S.x = p.x;
        S.y = p.y;
      }
      let tw = 24;
      let th = 24;
      let tr = 12;
      let tx = p.x;
      let ty = p.y;
      let hit = false;
      el.querySelectorAll<HTMLElement>(".u254-t").forEach((n) => {
        n.style.transform = "";
        const b = rel(n, el);
        const over = p.inside && !hit && inBox(b, p.x, p.y, 6);
        if (over) {
          hit = true;
          const [cx, cy] = mid(b);
          tw = b.w + 14;
          th = b.h + 14;
          tr = Number(n.dataset.r ?? 12) + 7;
          tx = cx + (p.x - cx) * 0.2;
          ty = cy + (p.y - cy) * 0.2;
          n.style.transform = `translate3d(${((p.x - cx) * 0.12).toFixed(1)}px,${((p.y - cy) * 0.12).toFixed(1)}px,0)`;
        }
      });
      const k = Math.min(1, dt * 16);
      S.x += (tx - S.x) * k;
      S.y += (ty - S.y) * k;
      S.w += (tw - S.w) * k;
      S.h += (th - S.h) * k;
      S.r += (tr - S.r) * k;
      const c = cur.current;
      if (c) {
        c.style.width = `${S.w.toFixed(1)}px`;
        c.style.height = `${S.h.toFixed(1)}px`;
        c.style.borderRadius = `${S.r.toFixed(1)}px`;
        c.style.transform = `translate3d(${(S.x - S.w / 2).toFixed(1)}px,${(S.y - S.h / 2).toFixed(1)}px,0)`;
      }
    },
  );
  return (
    <Stage r={root} g1="rgba(255,255,255,.5)" g2="rgba(159,140,255,.24)">
      <div className="flex h-full w-full flex-col items-center justify-center gap-14">
        <nav className="flex items-center gap-4 rounded-full border border-white/12 bg-white/[0.04] px-4 py-3" style={{ fontFamily: F.sg }}>
          <span className="px-4 text-[22px] font-[700] tracking-[-0.02em]">Kelso</span>
          {["Shop", "Journal", "Stockists"].map((s) => (
            <a key={s} className="u254-t rounded-full px-5 py-2 text-[17px] text-white/85" data-r="20">
              {s}
            </a>
          ))}
          <span className="u254-t grid h-12 w-12 place-items-center rounded-full border border-white/20 text-[18px]" data-r="24" aria-label="Bag">
            ◎
          </span>
        </nav>
        <div className="text-center">
          <h3 className="text-[clamp(48px,5.4vw,84px)] leading-[0.98] tracking-[-0.03em]" style={{ fontFamily: F.is }}>
            Tailored, by appointment
          </h3>
          <a className="u254-t mt-8 inline-block rounded-[14px] bg-[#eef2ff] px-9 py-4 text-[18px] font-[600] text-[#0a0d16]" data-r="14" style={{ fontFamily: F.sg }}>
            Book a fitting · ₹1,500
          </a>
        </div>
      </div>
      <div ref={cur} className="u254-cur" style={{ width: 24, height: 24, borderRadius: 12, transform: "translate3d(-40px,-40px,0)" }} aria-hidden />
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U255 · Magnetic logo swarm ───────────────────────── */
const U255_NAMES = ["Halden", "Northloom", "Orvane", "Pellar", "Quintra", "Sablewick", "Tavrin", "Ostrel", "Veyla", "Wrenfold", "Arcwell", "Brisanne", "Corvane", "Dunmere", "Elsvik", "Fenmoor"];
const U255_BASE: V2[] = U255_NAMES.map((_, i) => {
  const c = i % 4;
  const r = Math.floor(i / 4);
  const j1 = Math.sin(i * 7.31) * 3;
  const j2 = Math.cos(i * 4.17) * 2.5;
  return [14 + c * 24 + j1 + (r % 2 ? 4 : -4), 28 + r * 18 + j2];
});
function Glyph({ i }: { i: number }) {
  const k = i % 5;
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      {k === 0 && <circle cx="12" cy="12" r="9" fill="currentColor" />}
      {k === 1 && <path d="M12 3 21 20H3z" fill="currentColor" />}
      {k === 2 && <rect x="5" y="5" width="14" height="14" rx="2" transform="rotate(45 12 12)" fill="currentColor" />}
      {k === 3 && <path d="M4 5h5v14H4zM15 5h5v14h-5z" fill="currentColor" />}
      {k === 4 && <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="4" />}
    </svg>
  );
}
function U255() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const st = useRef({ t0: -1, m: U255_NAMES.map(() => [0, 0, 0] as [number, number, number]) });
  usePointer(
    root,
    dot,
    (t, el) => ({ x: el.clientWidth * (0.5 + 0.38 * Math.sin(t * 0.7)), y: el.clientHeight * (0.56 + 0.26 * Math.sin(t * 1.4)), inside: true }),
    (p, el, _fake, dt) => {
      const S = st.current;
      const T = now();
      if (S.t0 < 0) S.t0 = T;
      const age = T - S.t0;
      const W = el.clientWidth;
      const H = el.clientHeight;
      el.querySelectorAll<HTMLElement>(".u255-l").forEach((n, i) => {
        const bx = (U255_BASE[i][0] / 100) * W;
        const by = (U255_BASE[i][1] / 100) * H;
        const dx0 = bx - W / 2;
        const dy0 = by - H / 2;
        const dl = Math.max(1, Math.hypot(dx0, dy0));
        const fp = clamp((age - i * 0.05) / 0.9, 0, 1);
        const e = 1 - Math.pow(1 - fp, 3);
        const sx = (dx0 / dl) * 760 * (1 - e);
        const sy = (dy0 / dl) * 520 * (1 - e);
        const ph = i * 1.7;
        const drx = Math.sin(T * 0.45 + ph) * 14;
        const dry = Math.cos(T * 0.37 + ph * 1.3) * 10;
        const x = bx + sx + drx;
        const y = by + sy + dry;
        const d = Math.hypot(p.x - x, p.y - y);
        const R = 230;
        const f = p.inside && d < R ? 1 - d / R : 0;
        const M = S.m[i];
        const k = Math.min(1, dt * 6);
        M[0] += ((p.x - x) * f * 0.42 - M[0]) * k;
        M[1] += ((p.y - y) * f * 0.42 - M[1]) * k;
        M[2] += (f - M[2]) * k;
        n.style.transform = `translate(-50%,-50%) translate3d(${(sx + drx + M[0]).toFixed(1)}px,${(sy + dry + M[1]).toFixed(1)}px,0) rotate(${(M[0] * 0.06).toFixed(2)}deg) scale(${(0.6 + 0.4 * e + M[2] * 0.14).toFixed(3)})`;
        n.style.opacity = (e * (0.62 + 0.38 * M[2])).toFixed(3);
      });
    },
  );
  return (
    <Stage r={root} g1="rgba(159,140,255,.52)" g2="rgba(124,224,195,.22)">
      <div className="absolute inset-x-0 top-[7%] text-center">
        <Eyebrow>Trusted by 2,000+ studios</Eyebrow>
      </div>
      {U255_NAMES.map((n, i) => (
        <div
          key={n}
          className="u255-l absolute flex items-center gap-3 whitespace-nowrap rounded-full border border-white/12 bg-white/[0.05] px-5 py-3 text-white/90"
          style={{ left: `${U255_BASE[i][0]}%`, top: `${U255_BASE[i][1]}%`, transform: "translate(-50%,-50%)", opacity: 0.75, fontFamily: F.sg }}
        >
          <Glyph i={i} />
          <span className="text-[19px] font-[600] tracking-[-0.01em]">{n}</span>
        </div>
      ))}
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U256 · Hanging lamp follows cursor ───────────────────────── */
function U256() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const arm = useRef<HTMLDivElement>(null);
  const floor = useRef<HTMLDivElement>(null);
  const st = useRef({ a: 0, w: 0 });
  usePointer(
    root,
    dot,
    (t, el) => ({ x: el.clientWidth * (0.5 + 0.38 * Math.sin(t * 0.9)), y: el.clientHeight * (0.6 + 0.2 * Math.sin(t * 1.8)), inside: true }),
    (p, el, _fake, dt) => {
      const S = st.current;
      const px = el.clientWidth / 2;
      const target = p.inside ? clamp(Math.atan2(p.x - px, Math.max(60, p.y)), -0.75, 0.75) : 0;
      S.w += (22 * (target - S.a) - 3.4 * S.w) * dt;
      S.a += S.w * dt;
      if (arm.current) arm.current.style.transform = `rotate(${(-S.a).toFixed(4)}rad)`;
      const fl = floor.current;
      if (fl) {
        const b = rel(fl, el);
        const fy = b.t + b.h * 0.45;
        const hx = px + Math.tan(S.a) * fy - b.l;
        fl.style.setProperty("--lx", `${hx.toFixed(1)}px`);
      }
    },
  );
  return (
    <Stage r={root} g1="rgba(255,206,130,.5)" g2="rgba(79,141,255,.2)">
      <div ref={floor} className="absolute inset-x-0 bottom-0 h-[42%]" style={{ "--lx": "50%", "--ly": "45%" } as CSSProperties}>
        <div className="u256-grid absolute inset-0" style={{ "--a": ".06" } as CSSProperties} />
        <div className="u256-grid u256-lit absolute inset-0 bg-[radial-gradient(closest-side,rgba(255,214,150,.22),transparent)]" style={{ "--a": ".7", backgroundColor: "rgba(255,200,120,.08)" } as CSSProperties} />
        <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(#0a0d16,transparent)]" />
      </div>
      <div ref={arm} className="absolute left-1/2 top-0 h-full w-0" style={{ transformOrigin: "0 0" }}>
        <div className="absolute left-[-1px] top-0 h-[30%] w-[2px] bg-white/35" />
        <div className="absolute left-[-350px] top-[calc(30%+58px)] h-[64%] w-[700px] bg-[linear-gradient(rgba(255,214,150,.34),rgba(255,214,150,0)_88%)]" style={{ clipPath: "polygon(45% 0,55% 0,100% 100%,0 100%)" }} />
        <svg viewBox="0 0 140 70" className="absolute left-[-70px] top-[30%] w-[140px]" aria-hidden>
          <path d="M60 0h20v10H60z" fill="#3a3f4c" />
          <path d="M60 10h20l50 52H10z" fill="#d9a35b" />
          <path d="M10 62h120" stroke="#f2c47e" strokeWidth="3" />
        </svg>
        <div className="u256-bulb absolute left-[-16px] top-[calc(30%+50px)] h-8 w-8 rounded-full bg-[#fff3d6] shadow-[0_0_40px_14px_rgba(255,214,150,.55)]" />
      </div>
      <div className="pointer-events-none absolute left-[6%] top-[10%] max-w-[320px]">
        <Eyebrow>Pendant No. 4</Eyebrow>
        <h3 className="mt-3 text-[clamp(36px,3.6vw,56px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Light that leans in
        </h3>
        <p className="mt-4 text-[20px] text-white/75" style={{ fontFamily: F.sg }}>
          ₹8,900
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U257 · Glitch block field ───────────────────────── */
type Blk = { x: number; y: number; w: number; h: number; vx: number; life: number; age: number; c: string };
const U257_COLS = ["62,240,255", "255,62,165", "240,244,255", "190,255,90"];
function U257() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const head = useRef<HTMLHeadingElement>(null);
  const st = useRef({ blocks: [] as Blk[], last: [-999, -999] as V2, flash: -10, lastPh: 0 });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const down = () => (st.current.flash = now());
    el.addEventListener("pointerdown", down);
    return () => el.removeEventListener("pointerdown", down);
  }, []);
  usePointer(
    root,
    dot,
    (t, el) => {
      const S = st.current;
      const ph = t % 2.3;
      if (S.lastPh < 1.6 && ph >= 1.6) {
        S.flash = now();
        tapDot(dot.current);
      }
      S.lastPh = ph;
      return { x: el.clientWidth * (0.5 + 0.4 * Math.sin(t * 1.1)), y: el.clientHeight * (0.5 + 0.3 * Math.sin(t * 2.2)), inside: true };
    },
    (p, el, _fake, dt) => {
      const c = cv.current;
      if (!c) return;
      const [w, h] = fit(c);
      const x = c.getContext("2d");
      if (!x) return;
      const S = st.current;
      if (p.inside && Math.hypot(p.x - S.last[0], p.y - S.last[1]) > 14) {
        S.last = [p.x, p.y];
        const n = 1 + ((Math.random() * 3) | 0);
        for (let i = 0; i < n && S.blocks.length < 220; i++)
          S.blocks.push({ x: p.x + rnd(-40, 40), y: p.y + rnd(-30, 30), w: rnd(20, 160), h: rnd(5, 38), vx: rnd(40, 220) * (Math.random() < 0.5 ? -1 : 1), life: rnd(0.6, 1.2), age: 0, c: U257_COLS[(Math.random() * 4) | 0] });
      }
      x.clearRect(0, 0, w, h);
      x.globalCompositeOperation = "lighter";
      S.blocks = S.blocks.filter((b) => {
        b.age += dt;
        b.x += b.vx * dt;
        if (b.age > b.life) return false;
        if (Math.random() < 0.15) return true;
        const a = (1 - b.age / b.life) * 0.75;
        x.fillStyle = `rgba(62,240,255,${(a * 0.6).toFixed(3)})`;
        x.fillRect(b.x - b.w / 2 - 4, b.y - b.h / 2, b.w, b.h);
        x.fillStyle = `rgba(255,62,165,${(a * 0.6).toFixed(3)})`;
        x.fillRect(b.x - b.w / 2 + 4, b.y - b.h / 2, b.w, b.h);
        x.fillStyle = `rgba(${b.c},${(a * 0.5).toFixed(3)})`;
        x.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
        return true;
      });
      const fa = now() - S.flash;
      const H1 = head.current;
      if (fa < 0.34) {
        const k = 1 - fa / 0.34;
        for (let i = 0; i < 22; i++) {
          const y = Math.random() * h;
          x.fillStyle = `rgba(${U257_COLS[i % 4]},${(0.35 * k).toFixed(3)})`;
          x.fillRect(rnd(-w * 0.2, w * 0.2), y, w, rnd(4, 46));
        }
        x.fillStyle = `rgba(255,255,255,${(0.18 * k * (Math.random() < 0.5 ? 1 : 0.3)).toFixed(3)})`;
        x.fillRect(0, 0, w, h);
        if (H1) {
          H1.style.transform = `translate3d(${rnd(-18, 18).toFixed(1)}px,${rnd(-4, 4).toFixed(1)}px,0) skewX(${rnd(-8, 8).toFixed(1)}deg)`;
          H1.style.textShadow = `${rnd(-10, -3).toFixed(1)}px 0 rgba(62,240,255,.85),${rnd(3, 10).toFixed(1)}px 0 rgba(255,62,165,.85)`;
        }
      } else if (H1 && H1.style.transform) {
        H1.style.transform = "";
        H1.style.textShadow = "";
      }
      x.globalCompositeOperation = "source-over";
    },
  );
  return (
    <Stage r={root} g1="rgba(62,240,255,.5)" g2="rgba(255,62,165,.26)">
      <canvas ref={cv} className="b19g3-cv" aria-hidden />
      <div className="pointer-events-none relative flex h-full w-full flex-col items-center justify-center text-center">
        <Eyebrow>Drop 07 · midnight</Eyebrow>
        <h3 ref={head} className="mt-4 text-[clamp(60px,7vw,116px)] uppercase leading-[0.92] tracking-[-0.02em]" style={{ fontFamily: F.sy, fontWeight: 800 }}>
          Signal lost
        </h3>
        <p className="mt-6 text-[18px] text-white/65" style={{ fontFamily: F.mr }}>
          Oversized tee · ₹1,899 · move to break it
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U258 · Cover beams speed-up ───────────────────────── */
function U258() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({
    s: 1,
    beams: Array.from({ length: 16 }, () => ({ x: Math.random(), y: Math.random(), l: rnd(0.12, 0.34), v: rnd(0.25, 0.6) })),
    stars: Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), v: rnd(0.05, 0.22), r: rnd(0.6, 1.8) })),
  });
  usePointer(
    root,
    dot,
    (t, el) => {
      const b = box.current ? rel(box.current, el) : { l: 0, t: 0, w: 1, h: 1 };
      const W = el.clientWidth;
      const H = el.clientHeight;
      const l = (b.l + b.w * 0.14) / W;
      const r = (b.l + b.w * 0.86) / W;
      const y = (b.t + b.h * 0.5) / H;
      const [x, yy] = glide(
        t,
        [
          [0.18, 0.8, 0.5],
          [l, y, 1.3],
          [r, y + 0.02, 0.5],
          [0.84, 0.82, 0.9],
        ],
        W,
        H,
      );
      return { x, y: yy, inside: true };
    },
    (p, el, _fake, dt) => {
      const B = box.current;
      const c = cv.current;
      if (!B || !c) return;
      const b = rel(B, el);
      const over = p.inside && inBox(b, p.x, p.y);
      B.classList.toggle("on", over);
      const S = st.current;
      S.s += ((over ? 7 : 1) - S.s) * Math.min(1, dt * (over ? 3 : 2));
      const k = (S.s - 1) / 6;
      if (word.current) word.current.style.transform = k > 0.05 ? `translate3d(${(rnd(-1.6, 1.6) * k).toFixed(2)}px,${(rnd(-1.2, 1.2) * k).toFixed(2)}px,0)` : "";
      const [w, h] = fit(c);
      const x = c.getContext("2d");
      if (!x) return;
      x.clearRect(0, 0, w, h);
      S.beams.forEach((m) => {
        m.x += m.v * S.s * dt * 0.6;
        if (m.x - m.l > 1) {
          m.x = -0.05;
          m.y = Math.random();
        }
        const L = m.l * (1 + k * 1.6) * w;
        const x1 = m.x * w;
        const g = x.createLinearGradient(x1 - L, 0, x1, 0);
        g.addColorStop(0, "rgba(120,170,255,0)");
        g.addColorStop(1, `rgba(190,220,255,${(0.35 + 0.5 * k).toFixed(3)})`);
        x.fillStyle = g;
        x.fillRect(x1 - L, m.y * h, L, 1.6);
      });
      S.stars.forEach((s) => {
        s.x += s.v * S.s * dt * 0.5;
        if (s.x > 1.02) {
          s.x = -0.02;
          s.y = Math.random();
        }
        const L = 1 + k * 26 * s.v * 4;
        x.fillStyle = `rgba(255,255,255,${(0.5 + 0.4 * s.v * 3).toFixed(3)})`;
        x.fillRect(s.x * w - L, s.y * h, L + s.r, s.r);
      });
    },
  );
  return (
    <Stage r={root} g1="rgba(110,160,255,.52)" g2="rgba(255,122,89,.2)">
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <Eyebrow>Same-day delivery · ₹99</Eyebrow>
        <h3 className="mt-5 text-[clamp(52px,6vw,96px)] leading-[1.05] tracking-[-0.03em]" style={{ fontFamily: F.sg, fontWeight: 600 }}>
          Delivered at
          <br />
          <span ref={box} className="u258-box relative mt-3 inline-block overflow-hidden rounded-[18px] border border-white/15 bg-[#0d1424] px-8 py-2">
            <canvas ref={cv} className="b19g3-cv" aria-hidden />
            <span ref={word} className="u258-w relative">
              warp speed
            </span>
          </span>
        </h3>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U259 · Ash burst physics ───────────────────────── */
const U259_W = 380;
const U259_H = 104;
const U259_C = 4;
type Ash = { x: number; y: number; vx: number; vy: number; age: number; s: number; g: number };
function u259Face(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = U259_W;
  c.height = U259_H;
  const x = c.getContext("2d")!;
  rr(x, 0, 0, U259_W, U259_H, 52);
  const g = x.createLinearGradient(0, 0, 0, U259_H);
  g.addColorStop(0, "#f5efe6");
  g.addColorStop(1, "#d9cfc0");
  x.fillStyle = g;
  x.fill();
  x.fillStyle = "#1a120c";
  x.font = "700 30px 'Space Grotesk Variable', system-ui, sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText("Burn old prices", U259_W / 2, U259_H / 2 + 1);
  return c;
}
function U259() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const fb = useRef<HTMLDivElement>(null);
  const st = useRef({
    mode: "idle" as "idle" | "burn" | "reform",
    t0: 0,
    imp: [0, 0] as V2,
    burnAt: new Float32Array((U259_W / U259_C) * (U259_H / U259_C)),
    spawned: new Uint8Array((U259_W / U259_C) * (U259_H / U259_C)),
    ash: [] as Ash[],
    pile: new Float32Array(0),
    face: null as HTMLCanvasElement | null,
    layer: null as HTMLCanvasElement | null,
    lastPh: 0,
    hit: [0.4, 0.5] as V2,
  });
  const origin = (el: HTMLElement): V2 => [el.clientWidth / 2 - U259_W / 2, el.clientHeight * 0.4 - U259_H / 2];
  const fire = (el: HTMLElement, x: number, y: number) => {
    const S = st.current;
    if (S.mode !== "idle") return;
    const [ox, oy] = origin(el);
    const ix = x - ox;
    const iy = y - oy;
    if (ix < 0 || iy < 0 || ix > U259_W || iy > U259_H) return;
    S.imp = [ix, iy];
    const cols = U259_W / U259_C;
    for (let i = 0; i < S.burnAt.length; i++) {
      const cx = (i % cols) * U259_C + 2;
      const cy = Math.floor(i / cols) * U259_C + 2;
      S.burnAt[i] = (Math.hypot(cx - ix, cy - iy) / 420) * 0.9 + Math.random() * 0.12;
    }
    S.spawned.fill(0);
    S.mode = "burn";
    S.t0 = now();
  };
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const down = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      fire(el, e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("pointerdown", down);
    document.fonts?.ready.then(() => (st.current.face = null));
    return () => el.removeEventListener("pointerdown", down);
  }, []);
  const PER = 3;
  usePointer(
    root,
    dot,
    (t, el) => {
      const S = st.current;
      const [ox, oy] = origin(el);
      const ph = t % PER;
      if (ph < S.lastPh) S.hit = [rnd(0.2, 0.8), rnd(0.35, 0.65)];
      const rest: V2 = [ox + U259_W + 90, oy + U259_H + 60];
      const hit: V2 = [ox + S.hit[0] * U259_W, oy + S.hit[1] * U259_H];
      let p: V2;
      if (ph < 0.45) {
        const m = easeIO(ph / 0.45);
        p = [rest[0] + (hit[0] - rest[0]) * m, rest[1] + (hit[1] - rest[1]) * m];
      } else if (ph < 0.7) p = hit;
      else {
        const m = easeIO((ph - 0.7) / (PER - 0.7));
        p = [hit[0] + (rest[0] - hit[0]) * m, hit[1] + (rest[1] - hit[1]) * m];
      }
      if (S.lastPh < 0.45 && ph >= 0.45) {
        tapDot(dot.current);
        fire(el, hit[0], hit[1]);
      }
      S.lastPh = ph;
      return { x: p[0], y: p[1], inside: true };
    },
    (_p, el, _fake, dt) => {
      const c = cv.current;
      if (!c) return;
      const [w, h] = fit(c);
      const x = c.getContext("2d");
      if (!x) return;
      const S = st.current;
      if (!S.face) S.face = u259Face();
      if (!S.layer) {
        S.layer = document.createElement("canvas");
        S.layer.width = U259_W;
        S.layer.height = U259_H;
      }
      const PC = 3;
      const nc = Math.ceil(w / PC);
      if (S.pile.length !== nc) S.pile = new Float32Array(nc);
      if (fb.current) fb.current.style.opacity = "0";
      const [ox, oy] = origin(el);
      const floorY = oy + U259_H + 190;
      const age = now() - S.t0;
      if (S.mode === "burn" && age > 2.1) {
        S.mode = "reform";
        S.t0 = now();
      } else if (S.mode === "reform" && age > 0.5) {
        S.mode = "idle";
        S.pile.fill(0);
      }
      x.clearRect(0, 0, w, h);
      // ledge
      x.fillStyle = "rgba(255,255,255,.14)";
      x.fillRect(w * 0.18, floorY, w * 0.64, 1.5);
      const L = S.layer.getContext("2d")!;
      L.clearRect(0, 0, U259_W, U259_H);
      L.globalCompositeOperation = "source-over";
      L.globalAlpha = 1;
      const cols = U259_W / U259_C;
      if (S.mode === "idle") {
        x.drawImage(S.face, ox, oy);
      } else if (S.mode === "reform") {
        const m = easeIO(clamp(age / 0.5, 0, 1));
        x.save();
        x.globalAlpha = m;
        x.translate(ox + U259_W / 2, oy + U259_H / 2);
        x.scale(0.94 + 0.06 * m, 0.94 + 0.06 * m);
        x.drawImage(S.face, -U259_W / 2, -U259_H / 2);
        x.restore();
      } else {
        L.drawImage(S.face, 0, 0);
        L.globalCompositeOperation = "destination-out";
        for (let i = 0; i < S.burnAt.length; i++) {
          if (age >= S.burnAt[i]) {
            const cx = (i % cols) * U259_C;
            const cy = Math.floor(i / cols) * U259_C;
            L.fillRect(cx, cy, U259_C, U259_C);
            if (!S.spawned[i]) {
              S.spawned[i] = 1;
              if (Math.random() < 0.55 && S.ash.length < 1400)
                S.ash.push({ x: ox + cx + 2, y: oy + cy + 2, vx: (cx - S.imp[0]) * 0.5 + rnd(-50, 50), vy: rnd(-260, -70), age: 0, s: rnd(1.6, 3), g: rnd(120, 190) });
            }
          }
        }
        L.globalCompositeOperation = "source-over";
        L.fillStyle = "rgba(255,120,40,.9)";
        for (let i = 0; i < S.burnAt.length; i++) {
          const d = age - S.burnAt[i];
          if (d < 0 && d > -0.09) L.fillRect((i % cols) * U259_C - 1, Math.floor(i / cols) * U259_C - 1, U259_C + 2, U259_C + 2);
        }
        x.drawImage(S.layer, ox, oy);
      }
      // ash physics + pile
      const pa = S.mode === "reform" ? 1 - clamp(age / 0.5, 0, 1) : 1;
      S.ash = S.ash.filter((a) => {
        a.age += dt;
        a.vy += 640 * dt;
        a.vx *= 1 - 1.4 * dt;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        if (a.x < 0 || a.x >= w || a.y > h) return false;
        const col = Math.floor(a.x / PC);
        if (a.vy > 0 && a.y >= floorY - S.pile[col] && a.x > w * 0.18 && a.x < w * 0.82) {
          S.pile[col] += a.s * 0.9;
          return false;
        }
        const ember = a.age < 0.28;
        x.fillStyle = ember ? `rgba(255,${Math.round(110 + 120 * (1 - a.age / 0.28))},50,${pa.toFixed(3)})` : `rgba(${a.g},${a.g - 6},${a.g - 14},${(0.9 * pa).toFixed(3)})`;
        x.fillRect(a.x, a.y, a.s, a.s);
        return true;
      });
      for (let i = 1; i < nc - 1; i++) {
        const P = S.pile;
        if (P[i] - P[i - 1] > 2.4) {
          P[i] -= 0.6;
          P[i - 1] += 0.6;
        }
        if (P[i] - P[i + 1] > 2.4) {
          P[i] -= 0.6;
          P[i + 1] += 0.6;
        }
      }
      x.fillStyle = `rgba(150,144,136,${(0.95 * pa).toFixed(3)})`;
      for (let i = 0; i < nc; i++) if (S.pile[i] > 0.2) x.fillRect(i * PC, floorY - S.pile[i], PC, S.pile[i]);
      // the settled pile keeps smouldering: a slow travelling glow along its crest, so it never sits still
      const tt = now();
      for (let i = 0; i < nc; i++) {
        if (S.pile[i] <= 0.8) continue;
        const g = 0.5 + 0.5 * Math.sin(tt * 5 + i * 0.35) * Math.sin(tt * 1.7 - i * 0.11);
        if (g < 0.35) continue;
        x.fillStyle = `rgba(255,${Math.round(90 + 90 * g)},40,${(0.75 * g * pa).toFixed(3)})`;
        x.fillRect(i * PC, floorY - S.pile[i], PC, 2);
      }
    },
  );
  return (
    <Stage r={root} g1="rgba(255,140,60,.5)" g2="rgba(160,150,140,.22)">
      <div className="absolute inset-x-0 top-[9%] text-center">
        <Eyebrow>End of season · up to 60% off</Eyebrow>
      </div>
      <div ref={fb} className="absolute left-1/2 top-[40%] ml-[-190px] mt-[-52px] grid h-[104px] w-[380px] place-items-center rounded-full bg-[linear-gradient(#f5efe6,#d9cfc0)] text-[30px] font-[700] text-[#1a120c]" style={{ fontFamily: F.sg }}>
        Burn old prices
      </div>
      <canvas ref={cv} className="b19g3-cv" aria-hidden />
      <p className="pointer-events-none absolute inset-x-0 bottom-[8%] text-center text-[15px] text-white/50" style={{ fontFamily: F.mr }}>
        Click and the old tag turns to ash.
      </p>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U260 · Gooey progress rail (scrub) ───────────────────────── */
const U260_SEC = [
  ["Intro", "A kitchen built slowly"],
  ["Craft", "Hand-forged carbon steel"],
  ["Range", "Nine pans, one family"],
  ["Story", "Three generations of smiths"],
  ["Visit", "The foundry, open Saturdays"],
];
const U260_MY = (k: number) => 560 - k * 130;
function U260() {
  const root = useRef<HTMLDivElement>(null);
  const st = useRef({ p: 0, v: 0, drop: 560, act: 0 });
  const apply = (el: HTMLElement) => {
    const S = st.current;
    const by = 560 - S.p * 520;
    const T = now();
    const wob = Math.sin(T * 3.1) * 1.2;
    const blob = el.querySelector<SVGEllipseElement>(".u260-blob");
    const col = el.querySelector<SVGRectElement>(".u260-col");
    const drop = el.querySelector<SVGCircleElement>(".u260-drop");
    const sq = Math.min(0.4, Math.abs(S.v) * 0.4);
    blob?.setAttribute("cy", by.toFixed(1));
    blob?.setAttribute("rx", (19 * (1 - sq * 0.35) + wob).toFixed(2));
    blob?.setAttribute("ry", (19 * (1 + sq) - wob).toFixed(2));
    col?.setAttribute("y", by.toFixed(1));
    col?.setAttribute("height", Math.max(0, 580 - by).toFixed(1));
    drop?.setAttribute("cy", S.drop.toFixed(1));
    el.querySelectorAll<SVGCircleElement>(".u260-m").forEach((m, k) => {
      const my = U260_MY(k);
      const pr = Math.exp(-Math.pow((by - my) / 46, 2));
      const passed = by <= my + 2;
      m.setAttribute("r", (9 + 6 * pr + (passed ? 2 : 0)).toFixed(2));
    });
    let act = 0;
    U260_SEC.forEach((_, k) => {
      if (by <= U260_MY(k) + 65) act = k;
    });
    el.querySelectorAll<SVGTextElement>(".u260-lb").forEach((t, k) => t.setAttribute("fill-opacity", k === act ? "1" : k < act ? ".6" : ".32"));
    if (act !== S.act) {
      S.act = act;
      el.querySelectorAll<HTMLElement>(".u260-t").forEach((t, k) => t.classList.toggle("on", k === act));
      const n = el.querySelector<HTMLElement>(".u260-n");
      if (n) n.textContent = `0${act + 1} / 05`;
    }
    const pc = el.querySelector<HTMLElement>(".u260-pc");
    if (pc) pc.textContent = `${Math.round(S.p * 100)}%`;
  };
  useScrub(root, (p, v) => {
    const el = root.current;
    if (!el) return;
    st.current.p = p;
    st.current.v = v;
    apply(el);
  });
  useTicker(root, (_t, dt) => {
    const el = root.current;
    if (!el) return;
    const S = st.current;
    const by = 560 - S.p * 520;
    S.drop += (by + 26 - S.drop) * Math.min(1, dt * 5);
    S.v *= 1 - Math.min(1, dt * 3);
    apply(el);
  });
  return (
    <Stage r={root} g1="rgba(124,224,195,.5)" g2="rgba(159,140,255,.22)">
      <div className="flex h-full w-full items-center justify-center gap-[8%] px-[8%]">
        <svg viewBox="0 0 260 600" className="h-[86%] w-auto shrink-0" aria-hidden>
          <defs>
            <filter id="u260-goo" filterUnits="userSpaceOnUse" x="20" y="0" width="80" height="600" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
              <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g" />
              <feComposite in="SourceGraphic" in2="g" operator="atop" />
            </filter>
            <linearGradient id="u260-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c8ffe9" />
              <stop offset="1" stopColor="#3fd6a8" />
            </linearGradient>
          </defs>
          <rect x="50" y="20" width="20" height="560" rx="10" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.12)" />
          <g filter="url(#u260-goo)" fill="url(#u260-fill)">
            <rect className="u260-col" x="55" y="560" width="10" height="20" />
            {U260_SEC.map((_, k) => (
              <circle key={k} className="u260-m" cx="60" cy={U260_MY(k)} r={k === 0 ? 11 : 9} />
            ))}
            <circle className="u260-drop" cx="60" cy="586" r="9" />
            <ellipse className="u260-blob" cx="60" cy="560" rx="19" ry="19" />
          </g>
          {U260_SEC.map(([n], k) => (
            <text key={n} className="u260-lb" x="98" y={U260_MY(k) + 6} fill="#eef2ff" fillOpacity={k === 0 ? 1 : 0.32} fontSize="19" style={{ fontFamily: F.sg, fontWeight: 600 }}>
              {n}
            </text>
          ))}
        </svg>
        <div className="w-[min(560px,55%)]">
          <div className="flex items-center justify-between">
            <Eyebrow>
              Chapter <span className="u260-n">01 / 05</span>
            </Eyebrow>
            <span className="u260-pc text-[15px] text-white/55" style={{ fontFamily: F.sg }}>
              0%
            </span>
          </div>
          <div className="relative mt-6 h-[220px]">
            {U260_SEC.map(([n, d], k) => (
              <div key={n} className={`u260-t ${k === 0 ? "on" : ""}`}>
                <p className="text-[clamp(52px,5.4vw,84px)] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
                  {n}
                </p>
                <p className="mt-5 text-[20px] text-white/65" style={{ fontFamily: F.mr }}>
                  {d}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[15px] text-white/45" style={{ fontFamily: F.mr }}>
            Skillet No. 9 · ₹7,800
          </p>
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── U261 · Backlit panel grid (WebGL) ───────────────────────── */
const U261_FRAG = /* glsl */ `
uniform vec2 uL;
uniform vec3 uLC;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec2 p = vUv * uRes;
  vec2 cs = vec2(uRes.x / 8.0, uRes.y / 4.0);
  vec2 g = p / cs;
  vec2 id = floor(g);
  vec2 f = fract(g) * cs;
  float e = min(min(f.x, cs.x - f.x), min(f.y, cs.y - f.y));
  float seam = 1.0 - smoothstep(2.0, 4.0, e);
  float d = length(p - uL);
  float I = 1.0 / (1.0 + pow(d / 170.0, 2.0));
  float I2 = 1.0 / (1.0 + pow(d / 520.0, 2.0));
  float h = hash(id);
  vec3 panel = vec3(0.045, 0.05, 0.066) + h * 0.014;
  panel += vec3(0.02) * (1.0 - f.y / cs.y);
  float own = step(0.5, 1.0 - length(floor(uL / cs) - id));
  vec3 col = panel * (1.0 - seam);
  col += uLC * (seam * (I * 1.9 + I2 * 0.18));
  col += uLC * (1.0 - seam) * (exp(-e / 8.0) * I * 0.6 + I2 * 0.045 + own * 0.03);
  col += vec3(1.0) * seam * pow(I, 3.0) * 0.7;
  col = 1.0 - exp(-col * 1.3);
  gl_FragColor = vec4(col, 1.0);
}`;
function U261() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const fb = useRef<HTMLDivElement>(null);
  const near = useNear(root);
  const st = useRef({ L: [0, 0] as V2, LC: [1, 0.3, 0.8], s: [0, 0] as V2, init: false });
  useEffect(() => {
    const c = cv.current;
    if (!near || !c) return;
    let dead = false;
    let h: GLHandle | null = null;
    let first = true;
    (async () => {
      h = await createShader(c, U261_FRAG, {
        dpr: 1,
        uniforms: { uL: { value: [0, 0] }, uLC: { value: [1, 0.3, 0.8] } },
        onFrame: (u) => {
          (u.uL as { value: number[] }).value = st.current.L;
          (u.uLC as { value: number[] }).value = st.current.LC;
          if (first) {
            first = false;
            if (fb.current) fb.current.style.opacity = "0";
          }
        },
      });
      if (dead) h?.destroy();
    })();
    return () => {
      dead = true;
      h?.destroy();
    };
  }, [near]);
  usePointer(
    root,
    dot,
    (t, el) => ({ x: el.clientWidth * (0.5 + 0.4 * Math.sin(t * 0.8)), y: el.clientHeight * (0.5 + 0.32 * Math.sin(t * 1.6)), inside: true }),
    (p, el, _fake, dt) => {
      const S = st.current;
      if (!S.init) {
        S.init = true;
        S.s = [p.x, p.y];
      }
      const k = Math.min(1, dt * 9);
      S.s = [S.s[0] + (p.x - S.s[0]) * k, S.s[1] + (p.y - S.s[1]) * k];
      S.L = [S.s[0], el.clientHeight - S.s[1]];
      const T = now() * 0.35;
      S.LC = [0.55 + 0.45 * Math.sin(T), 0.4 + 0.4 * Math.sin(T + 2.3), 0.75 + 0.25 * Math.sin(T + 4.4)];
    },
  );
  return (
    <Stage r={root} g1="rgba(255,92,200,.5)" g2="rgba(92,225,255,.22)">
      <div ref={fb} className="absolute inset-0 grid grid-cols-8 grid-rows-4 gap-[6px] bg-[radial-gradient(40%_50%_at_50%_50%,#ff5cc8,#3a1250_60%,#0a0d16)] transition-opacity duration-500" aria-hidden>
        {Array.from({ length: 32 }, (_, i) => (
          <span key={i} className="bg-[#0c0e15]" />
        ))}
      </div>
      <canvas ref={cv} className="b19g3-cv opacity-0 transition-opacity duration-500" aria-hidden />
      <div className="pointer-events-none absolute bottom-[7%] left-[5%]">
        <Eyebrow>Acoustic light wall</Eyebrow>
        <p className="mt-3 text-[clamp(34px,3.4vw,52px)] leading-none tracking-[-0.02em]" style={{ fontFamily: F.sg, fontWeight: 600 }}>
          ₹4,800 per panel
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "U250", name: "Shimmering grid slider", how: "A slider drawn as a strip of shimmering squares fills to the thumb while rolling digits show the amount. A fake pointer presses and drags it between values.", kind: "play", C: U250 },
  { code: "U251", name: "Shatter glass card", how: "A tap cracks the glass pass into Voronoi shards that fall with gravity and spin, then fly back together. A fake pointer taps it on a loop.", kind: "play", C: U251 },
  { code: "U252", name: "Pixel fire fill button", how: "On hover a pixel fire floods the button from the bottom, its flames leaning toward the pointer, and dies down when it leaves. A fake pointer sweeps a figure-eight.", kind: "play", C: U252 },
  { code: "U253", name: "3D tube cursor", how: "Three shaded WebGL tubes trail and coil around the pointer, tapering away, lit by a colour-cycling light that brightens with speed. A fake pointer sweeps a figure-eight.", kind: "play", C: U253 },
  { code: "U254", name: "Morphing magnetic cursor", how: "The inverting cursor morphs to each hovered element's size and radius and pulls it toward the pointer. A fake pointer visits the nav, the bag and the CTA.", kind: "play", C: U254 },
  { code: "U255", name: "Magnetic logo swarm", how: "Partner marks fly in and drift; near the pointer they bend toward it, grow and brighten, then drift back. A fake pointer sweeps a figure-eight.", kind: "play", C: U255 },
  { code: "U256", name: "Hanging lamp follows cursor", how: "A pendant lamp swings toward the pointer like a spring pendulum and its cone of light moves across the grid floor. A fake pointer sweeps a figure-eight.", kind: "play", C: U256 },
  { code: "U257", name: "Glitch block field", how: "Pointer movement spawns drifting RGB-split glitch blocks; a click fires a full-stage glitch flash that jolts the headline. A fake pointer sweeps and taps.", kind: "play", C: U257 },
  { code: "U258", name: "Cover beams speed-up", how: "Hovering the boxed phrase speeds up the beams and stars streaking behind it and makes the words shake. A fake pointer glides across the phrase.", kind: "play", C: U258 },
  { code: "U259", name: "Ash burst physics", how: "A tap burns the button away from the click point; ash and embers erupt, fall and pile on a ledge, then the button reforms. A fake pointer taps on a loop.", kind: "play", C: U259 },
  { code: "U260", name: "Gooey progress rail", how: "A liquid blob climbs a vertical rail with the scroll and merges gooey-style with each chapter marker as it passes, switching the chapter title.", kind: "scrub", C: U260 },
  { code: "U261", name: "Backlit panel grid", how: "A neon light behind a grid of dark panels follows the pointer, glowing through the seams and rim-lighting nearby edges. A fake pointer sweeps a figure-eight.", kind: "play", C: U261 },
];
