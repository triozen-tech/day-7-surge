"use client";

// Micro-interactions, batch 18 · group 2 (MOTION-MENU U178–U189). Small focused demos for /lab/motion.
// Every pointer / press demo also plays by itself: a visible fake pointer (ring) walks a path or runs a scripted press,
// resting ≤ 0.5 s per target (during a longer press something else keeps moving). The real mouse still works.
// A CSS-only glow loop never stops (and sits on top again, screen-blended) so covered stages never freeze.
// ?static=1 / reduced motion: no JS, the markup shows a sensible final state.
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
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

const CSS = `
.b18g2-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b18g2-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b18g2-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b18g2-hide{visibility:hidden}
.b18g2-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;pointer-events:none;z-index:40;opacity:0;transition:opacity .25s}
.b18g2-dot>span{display:block;width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);transition:transform .2s,background-color .2s}
.b18g2-dot.tap>span{animation:b18g2-tap .32s ease-out}
.b18g2-dot.press>span{transform:scale(.62);background:rgba(255,255,255,.6)}
@keyframes b18g2-tap{40%{transform:scale(.55);background:rgba(255,255,255,.6)}100%{transform:scale(1)}}

/* U179 magnet lines */
.u179-l{position:absolute;width:30px;height:3px;margin:-1.5px 0 0 -15px;border-radius:3px;background:linear-gradient(90deg,rgba(255,255,255,.25),#b9c8ff);will-change:transform}

/* U180 laser flow */
.u180-beam{position:absolute;left:50%;top:0;width:4px;margin-left:-2px;height:64%;transform-origin:50% 0;background:#e9fbff;box-shadow:0 0 10px #6ff0ff,0 0 26px rgba(111,240,255,.7)}
.u180-flow{position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(111,240,255,0) 0 14px,rgba(255,255,255,.95) 14px 22px,rgba(111,240,255,0) 22px 40px);animation:u180-flow .45s linear infinite}
@keyframes u180-flow{to{background-position:0 40px}}
.u180-halo{position:absolute;left:50%;top:0;width:90px;margin-left:-45px;height:64%;transform-origin:50% 0;background:linear-gradient(90deg,transparent,rgba(111,240,255,.22),transparent);pointer-events:none}
.u180-plane{position:absolute;left:-20%;right:-20%;top:64%;height:70%;transform:perspective(700px) rotateX(64deg);transform-origin:50% 0}
.u180-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(140,190,255,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(140,190,255,.14) 1px,transparent 1px);background-size:48px 48px}
.u180-lit{position:absolute;inset:0;background-image:linear-gradient(rgba(150,250,255,.9) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(150,250,255,.9) 1.5px,transparent 1.5px);background-size:48px 48px;-webkit-mask-image:radial-gradient(48% 70% at 50% 0,#000,transparent 72%);mask-image:radial-gradient(48% 70% at 50% 0,#000,transparent 72%);transform-origin:50% 0}
.u180-pool{position:absolute;left:50%;top:64%;width:1000px;height:240px;margin:-120px 0 0 -500px;background:radial-gradient(50% 50% at 50% 50%,rgba(111,240,255,.55),rgba(111,240,255,.12) 45%,transparent 70%);mix-blend-mode:screen;pointer-events:none}
.u180-core{position:absolute;left:50%;top:64%;width:180px;height:40px;margin:-20px 0 0 -90px;border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,#fff,rgba(160,250,255,.8) 40%,transparent 72%)}
.u180-sp{position:absolute;left:50%;top:64%;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;border-radius:50%;background:#dffcff;box-shadow:0 0 8px #6ff0ff;animation:u180-sp .9s ease-out infinite}
@keyframes u180-sp{0%{transform:translate(0,0);opacity:1}100%{transform:translate(var(--dx),var(--dy));opacity:0}}

/* U181 magic rings */
.u181-r{position:absolute;left:0;top:0;width:90px;height:90px;margin:-45px 0 0 -45px;border-radius:50%;border:2px solid #c9a7ff;box-shadow:0 0 18px currentColor,inset 0 0 14px currentColor;opacity:0;pointer-events:none}

/* U182 fuse button */
.u182-b{position:relative;width:360px;height:72px;border-radius:999px;background:#f4f1ea;color:#121212;transition:background-color .4s,color .4s,box-shadow .4s;overflow:visible}
.u182-b.done{background:#16130f;color:#f6eee0;box-shadow:inset 0 0 0 1.5px rgba(255,190,110,.55)}
.u182-spark{position:absolute;left:0;top:0;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:radial-gradient(circle,#fff,#ffd27a 35%,rgba(255,120,40,.6) 60%,transparent 72%);animation:u182-fl .12s linear infinite alternate}
@keyframes u182-fl{from{transform:scale(.8) rotate(0)}to{transform:scale(1.35) rotate(40deg)}}

/* U183 pulse heart */
.u183-beat.liked{animation:u183-beat 1.1s ease-in-out infinite}
@keyframes u183-beat{0%,100%{transform:scale(1)}15%{transform:scale(1.08)}30%{transform:scale(1)}45%{transform:scale(1.05)}}

/* U185 bell toggle */
.u185-ic{transition:color .4s}

/* U188 shredder */
.u188-teeth{background:repeating-linear-gradient(180deg,rgba(255,255,255,.28) 0 6px,transparent 6px 14px);animation:u188-t .6s linear infinite}
@keyframes u188-t{to{background-position:0 14px}}

/* U189 glass icons */
.u189-i{position:relative;width:132px;height:132px;perspective:700px;cursor:pointer}
.u189-back{position:absolute;inset:0;border-radius:32px;transform:rotate(15deg);transition:transform .55s ${EZ}}
.u189-i.on .u189-back{transform:rotate(26deg) translate3d(-8px,-6px,0) scale(1.04)}
.u189-gl{position:absolute;inset:0;border-radius:32px;display:grid;place-items:center;background:linear-gradient(135deg,rgba(255,255,255,.24),rgba(255,255,255,.05));border:1px solid rgba(255,255,255,.38);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 10px 30px rgba(0,0,0,.25);transition:transform .55s ${EZ},box-shadow .55s}
.u189-i.on .u189-gl{transform:translate3d(0,-12px,0) rotateX(14deg) rotateY(-16deg) translateZ(36px);box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 26px 44px rgba(0,0,0,.4)}
.u189-lab{opacity:0;transform:translateY(-8px);transition:opacity .4s,transform .45s ${EZ}}
.u189-i.on+.u189-lab{opacity:1;transform:none}

html.is-static .b18g2-glow,html.is-static .u180-flow,html.is-static .u180-sp,html.is-static .u182-spark,html.is-static .u183-beat.liked,html.is-static .u188-teeth{animation:none}
html.is-static {
  .b18g2-glow,.u180-flow,.u180-sp,.u182-spark,.u183-beat.liked,.u188-teeth{animation:none}
  .u182-b,.u189-back,.u189-gl,.u189-lab{transition:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop, again on top (screen blend) so covered stages never freeze. */
function Stage({ r, children, g1, g2 }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string }) {
  return (
    <div ref={r} className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff]">
      <style href="b18g2-css" precedence="default">
        {CSS}
      </style>
      <div className="b18g2-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      <div className="b18g2-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: 0.45, zIndex: 35 } as CSSProperties} aria-hidden />
    </div>
  );
}

/** The visible fake pointer (a ring). */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => (
  <div ref={r} className="b18g2-dot" aria-hidden>
    <span />
  </div>
);

function tapDot(d: HTMLElement | null) {
  if (!d) return;
  d.classList.remove("tap");
  void d.offsetWidth;
  d.classList.add("tap");
}

type Pt = { x: number; y: number; inside: boolean };
type Box = { l: number; t: number; w: number; h: number };

function rel(node: Element, root: Element): Box {
  const a = node.getBoundingClientRect();
  const r = root.getBoundingClientRect();
  return { l: a.left - r.left, t: a.top - r.top, w: a.width, h: a.height };
}
const inBox = (b: Box, x: number, y: number, pad = 0) => x >= b.l - pad && x <= b.l + b.w + pad && y >= b.t - pad && y <= b.t + b.h + pad;
const mid = (b: Box): [number, number] => [b.l + b.w / 2, b.t + b.h / 2];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const all = (root: Element, sel: string) => [...root.querySelectorAll<HTMLElement>(sel)];
const one = (root: Element, sel: string) => root.querySelector<HTMLElement>(sel)!;
/** Deterministic pseudo-random 0..1 (same on server and client). */
const rnd = (i: number, s = 1) => {
  const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/** Pointer driver: the real mouse wins for 2.5 s after it last moved; otherwise `script` moves a visible fake ring. */
function usePointer(
  root: RefObject<HTMLDivElement | null>,
  dot: RefObject<HTMLDivElement | null>,
  script: (t: number, el: HTMLDivElement) => Pt,
  frame: (p: Pt, el: HTMLDivElement, fake: boolean, t: number, dt: number) => void,
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
    fr.current(p, el, !useReal, t - t0.current, Math.min(dt, 0.05));
  });
}

/** A path that holds at each point and glides to the next during the last `move` part of every `seg` seconds. */
function stepPath(t: number, pts: [number, number][], seg: number, move = 0.35): [number, number] {
  const n = pts.length;
  const k = Math.floor(t / seg);
  const f = t / seg - k;
  const a = pts[k % n];
  const b = pts[(k + 1) % n];
  const m = f < 1 - move ? 0 : easeIO((f - (1 - move)) / move);
  return [a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m];
}

/** Figure-eight that glides for 70% of every `seg` seconds and rests (≤ 0.5 s) for the rest. */
function fig8(t: number, W: number, H: number, seg = 1.45, sx = 0.3, sy = 0.24, cy = 0.52): Pt {
  const k = Math.floor(t / seg);
  const f = t / seg - k;
  const m = f < 0.3 ? 0 : easeIO((f - 0.3) / 0.7);
  const u = (k + m) * 1.05;
  return { x: W / 2 + Math.sin(u) * W * sx, y: H * cy + Math.sin(u * 2) * H * sy, inside: true };
}

/** "play" helper: waits for fonts, builds a looping animation in a gsap.context, plays it only on screen. */
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

// eslint-disable-next-line @next/next/no-img-element
const Img = ({ i, className = "", w = 700, h = 900 }: { i: number; className?: string; w?: number; h?: number }) => (
  <img src={scene(i, w, h)} alt="" className={`block h-full w-full object-cover ${className}`} draggable={false} />
);

const Eyebrow = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={`text-[13px] uppercase tracking-[0.22em] text-white/55 ${className}`} style={{ fontFamily: F.sg }}>
    {children}
  </p>
);

/* ───────────────────────── U178 · Swarm cursor ───────────────────────── */
type P178 = { x: number; y: number; vx: number; vy: number; sp: number; c: number; r: number; ph: number };
const U178_N = 150;
const U178_C = ["rgba(150,200,255,.95)", "rgba(255,170,120,.9)", "rgba(200,170,255,.9)"];
function U178() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const ps = useRef<P178[]>([]);
  usePointer(
    root,
    dot,
    (t, el) => fig8(t, el.clientWidth, el.clientHeight),
    (p, el, _fake, t, dt) => {
      const c = cv.current;
      if (!c) return;
      const W = el.clientWidth;
      const H = el.clientHeight;
      if (c.width !== W || c.height !== H) {
        c.width = W;
        c.height = H;
      }
      const ctx = c.getContext("2d");
      if (!ctx) return;
      if (!ps.current.length)
        ps.current = Array.from({ length: U178_N }, (_, i) => ({
          x: rnd(i, 1) * W,
          y: rnd(i, 2) * H,
          vx: 0,
          vy: 0,
          sp: 240 + rnd(i, 3) * 200,
          c: i % 3,
          r: 1.5 + rnd(i, 4) * 2.2,
          ph: rnd(i, 5) * 6.28,
        }));
      // fade the previous frame (trails), then draw additively
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.26)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (const q of ps.current) {
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d = Math.hypot(dx, dy) || 1;
        const near = clamp(1 - d / 170, 0, 1);
        const seek = clamp(d / 90, 0.3, 1);
        // seek the pointer + swirl tangentially when close + a little wander
        const tx = (dx / d) * q.sp * seek + (-dy / d) * q.sp * 0.95 * near + Math.sin(t * 2.1 + q.ph) * 60;
        const ty = (dy / d) * q.sp * seek + (dx / d) * q.sp * 0.95 * near + Math.cos(t * 1.9 + q.ph * 1.3) * 60;
        let sx = tx - q.vx;
        let sy = ty - q.vy;
        const sm = Math.hypot(sx, sy);
        const mf = 1500 * dt;
        if (sm > mf) {
          sx *= mf / sm;
          sy *= mf / sm;
        }
        q.vx += sx;
        q.vy += sy;
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        ctx.fillStyle = U178_C[q.c];
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r, 0, 6.2832);
        ctx.fill();
      }
    },
  );
  return (
    <Stage r={root} g1="rgba(110,150,255,.55)" g2="rgba(255,150,110,.22)">
      <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute bottom-[8%] left-[5%]">
        <Eyebrow>Night market · live now</Eyebrow>
        <h3 className="mt-3 text-[clamp(38px,4vw,60px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Follow the glow
        </h3>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U179 · Magnet lines ───────────────────────── */
const U179_C = 18;
const U179_R = 10;
const U179_CELLS = Array.from({ length: U179_C * U179_R }, (_, i) => {
  const c = i % U179_C;
  const r = Math.floor(i / U179_C);
  const fx = (c + 0.5) / U179_C;
  const fy = (r + 0.5) / U179_R;
  // static pose: every line points at a magnet right of centre (stage ≈ 1330 × 630)
  const a = Math.atan2((0.45 - fy) * 630, (0.68 - fx) * 1330);
  return { fx, fy, a };
});
function U179() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  usePointer(
    root,
    dot,
    (t, el) => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const u = t * 0.75;
      return { x: W / 2 + Math.sin(u) * W * 0.36, y: H / 2 + Math.sin(u * 2) * H * 0.3, inside: true };
    },
    (p, el) => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const ls = el.querySelectorAll<HTMLElement>(".u179-l");
      ls.forEach((l, i) => {
        const c = U179_CELLS[i];
        const cx = c.fx * W;
        const cy = c.fy * H;
        const a = Math.atan2(p.y - cy, p.x - cx);
        const d = Math.hypot(p.x - cx, p.y - cy);
        const k = clamp(1 - d / 520, 0, 1);
        l.style.transform = `rotate(${a.toFixed(3)}rad) scaleX(${(0.55 + k * 0.85).toFixed(3)})`;
        l.style.opacity = (0.35 + k * 0.65).toFixed(2);
      });
    },
  );
  return (
    <Stage r={root} g1="rgba(120,140,255,.55)" g2="rgba(120,255,220,.2)">
      {U179_CELLS.map((c, i) => (
        <span key={i} className="u179-l" style={{ left: `${c.fx * 100}%`, top: `${c.fy * 100}%`, transform: `rotate(${c.a.toFixed(3)}rad)` }} />
      ))}
      <div className="pointer-events-none absolute left-[5%] top-[7%] rounded-[18px] bg-[#0a0d16]/80 px-6 py-4">
        <Eyebrow>Field series</Eyebrow>
        <p className="mt-1 text-[clamp(28px,2.6vw,40px)] tracking-[-0.02em]" style={{ fontFamily: F.sg, fontWeight: 600 }}>
          Drawn to you
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U180 · Laser flow ───────────────────────── */
const U180_SP = Array.from({ length: 10 }, (_, i) => ({
  dx: (rnd(i, 7) - 0.5) * 260,
  dy: -30 - rnd(i, 8) * 70,
  dl: rnd(i, 9) * 0.9,
}));
function U180() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const beam = one(el, ".u180-beam");
    const halo = one(el, ".u180-halo");
    const pool = one(el, ".u180-pool");
    const core = one(el, ".u180-core");
    const lit = one(el, ".u180-lit");
    const sp = one(el, ".u180-sps");
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.1 });
    tl.set([beam, halo], { transformOrigin: "50% 0%", scaleY: 0 })
      .set(pool, { scale: 0.05, opacity: 0 })
      .set(core, { scale: 0, opacity: 0 })
      .set(lit, { scale: 0.08, opacity: 0 })
      .set(sp, { opacity: 0 })
      .to([beam, halo], { scaleY: 1, duration: 0.55, ease: "power2.in" })
      .addLabel("hit")
      .to(core, { scale: 1, opacity: 1, duration: 0.22, ease: "power2.out" }, "hit")
      .to(sp, { opacity: 1, duration: 0.15 }, "hit")
      .to(pool, { scale: 1, opacity: 1, duration: 1, ease: "power2.out" }, "hit")
      .to(lit, { scale: 1, opacity: 1, duration: 1.1, ease: "power2.out" }, "hit")
      .to(core, { scaleX: 1.25, duration: 0.4, yoyo: true, repeat: 1, ease: "sine.inOut" }, "hit+=0.25")
      .addLabel("out", "hit+=1.15")
      .set([beam, halo], { transformOrigin: "50% 100%" }, "out")
      .to([beam, halo], { scaleY: 0, duration: 0.45, ease: "power2.in" }, "out")
      .to(core, { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" }, "out+=0.35")
      .to(sp, { opacity: 0, duration: 0.3 }, "out+=0.35")
      .to(pool, { scale: 1.2, opacity: 0, duration: 0.7, ease: "power1.in" }, "out+=0.2")
      .to(lit, { opacity: 0, duration: 0.7, ease: "power1.in" }, "out+=0.2");
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(90,200,255,.52)" g2="rgba(160,120,255,.22)">
      <div className="u180-plane" aria-hidden>
        <div className="u180-grid" />
        <div className="u180-lit" />
      </div>
      <div className="u180-pool" aria-hidden />
      <div className="u180-halo" aria-hidden />
      <div className="u180-beam" aria-hidden>
        <div className="u180-flow" />
      </div>
      <div className="u180-core" aria-hidden />
      <div className="u180-sps" aria-hidden>
        {U180_SP.map((s, i) => (
          <span key={i} className="u180-sp" style={{ "--dx": `${s.dx}px`, "--dy": `${s.dy}px`, animationDelay: `${s.dl}s` } as CSSProperties} />
        ))}
      </div>
      <div className="pointer-events-none absolute left-[5%] top-[10%] max-w-[22ch]">
        <Eyebrow>Engraving studio</Eyebrow>
        <h3 className="mt-3 text-[clamp(38px,4vw,62px)] leading-[0.98] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Cut with light
        </h3>
        <p className="mt-4 text-[15px] text-white/60" style={{ fontFamily: F.mr }}>
          Names, dates, crests · from ₹1,200
        </p>
      </div>
    </Stage>
  );
}

/* ───────────────────────── U181 · Magic rings ───────────────────────── */
const U181_N = 18;
const U181_C = ["#c9a7ff", "#8fd8ff", "#ffb4d8"];
function U181() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const st = useRef({ lx: -1, ly: -1, acc: 0, tt: 0, k: 0 });
  useEffect(() => {
    const el = root.current;
    return () => {
      if (el) gsap.killTweensOf(el.querySelectorAll(".u181-r"));
    };
  }, []);
  usePointer(
    root,
    dot,
    (t, el) => fig8(t, el.clientWidth, el.clientHeight, 1.4, 0.32, 0.26, 0.5),
    (p, el, _fake, _t, dt) => {
      const S = st.current;
      if (S.lx < 0) {
        S.lx = p.x;
        S.ly = p.y;
      }
      S.acc += Math.hypot(p.x - S.lx, p.y - S.ly);
      S.tt += dt;
      S.lx = p.x;
      S.ly = p.y;
      if (!p.inside || (S.acc < 44 && S.tt < 0.2)) return;
      S.acc = 0;
      S.tt = 0;
      const rings = el.querySelectorAll<HTMLElement>(".u181-r");
      const r = rings[S.k % rings.length];
      const col = U181_C[S.k % U181_C.length];
      S.k++;
      r.style.borderColor = col;
      r.style.color = col;
      gsap.fromTo(
        r,
        { x: p.x, y: p.y, scale: 0.15, opacity: 0.95 },
        { scale: 2.2 + (S.k % 4) * 0.25, opacity: 0, duration: 1.15, ease: "power2.out", overwrite: true },
      );
    },
  );
  return (
    <Stage r={root} g1="rgba(170,130,255,.55)" g2="rgba(120,210,255,.22)">
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <Eyebrow>Winter edit · candles</Eyebrow>
        <h3 className="mt-3 text-[clamp(44px,5vw,78px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.is }}>
          Every touch, a glow
        </h3>
        <p className="mt-4 text-[15px] text-white/60" style={{ fontFamily: F.mr }}>
          Hand-poured soy · ₹1,450
        </p>
      </div>
      {Array.from({ length: U181_N }, (_, i) => (
        <span key={i} className="u181-r" aria-hidden />
      ))}
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U182 · Fuse button ───────────────────────── */
const U182_W = 312;
const U182_PATH = "M0 6 " + Array.from({ length: 12 }, (_, i) => `Q ${i * 26 + 6.5} 1 ${i * 26 + 13} 6 T ${i * 26 + 26} 6`).join(" ");
function U182() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const S = useRef({ st: 0, burn: null as gsap.core.Tween | null, bag: 2 });
  const parts = () => {
    const el = root.current!;
    return {
      btn: one(el, ".u182-b"),
      labs: all(el, ".u182-lab"),
      fuse: one(el, ".u182-fuse"),
      path: el.querySelector<SVGPathElement>(".u182-p")!,
      spark: one(el, ".u182-spark"),
      bag: one(el, ".u182-bag"),
    };
  };
  const show = (k: number) => {
    const { labs } = parts();
    labs.forEach((l, i) => {
      if (i === k) gsap.fromTo(l, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out", overwrite: true });
      else gsap.to(l, { autoAlpha: 0, y: -14, duration: 0.22, ease: "power2.in", overwrite: true });
    });
  };
  const setFuse = (v: number) => {
    // a context revert on unmount can still render the burn tween once: skip when the stage is gone
    if (!root.current) return;
    const { path, spark } = parts();
    const L = path.getTotalLength();
    path.style.strokeDasharray = `${L} ${L}`;
    path.style.strokeDashoffset = String(-v * L);
    const pt = path.getPointAtLength(Math.min(v, 0.999) * L);
    gsap.set(spark, { x: pt.x, y: pt.y });
  };
  const reset = () => {
    if (!root.current) return;
    const P = parts();
    S.current.st = 0;
    P.btn.classList.remove("done");
    show(0);
    gsap.to(P.fuse, { autoAlpha: 0, duration: 0.25, overwrite: true });
  };
  const confirm = () => {
    if (!root.current) return;
    const P = parts();
    S.current.st = 2;
    show(2);
    gsap.to(P.fuse, { autoAlpha: 0, duration: 0.25, overwrite: true });
    S.current.bag += 1;
    P.bag.textContent = String(S.current.bag);
    gsap.fromTo(P.bag, { scale: 1.6 }, { scale: 1, duration: 0.45, ease: "back.out(2.5)" });
    gsap.delayedCall(0.55, reset);
  };
  const add = () => {
    if (S.current.st !== 0) return;
    const P = parts();
    S.current.st = 1;
    P.btn.classList.add("done");
    show(1);
    const prog = { v: 0 };
    setFuse(0);
    gsap.to(P.fuse, { autoAlpha: 1, duration: 0.2, overwrite: true });
    S.current.burn = gsap.to(prog, { v: 1, duration: 2.1, ease: "none", onUpdate: () => setFuse(prog.v), onComplete: confirm });
  };
  const undo = () => {
    if (S.current.st !== 1) return;
    S.current.burn?.kill();
    reset();
  };
  const click = () => {
    if (S.current.st === 0) add();
    else if (S.current.st === 1) undo();
  };
  usePlay(root, (el, dispose) => {
    const d = dot.current;
    const btn = one(el, ".u182-b");
    dispose(() => {
      S.current.burn?.kill();
      gsap.killTweensOf(reset);
    });
    const b = rel(btn, el);
    const tl = gsap.timeline({ repeat: -1 });
    // cycle A: tap, let the fuse burn out → "In your bag"
    tl.call(() => goDot(d, el, btn, 0.45, idle()))
      .to({}, { duration: 0.45 })
      .call(() => {
        if (!idle()) return;
        tapDot(d);
        add();
      })
      .call(() => goDot(d, el, [b.l + b.w + 90, b.t + b.h + 60], 0.9, idle()))
      .to({}, { duration: 0.9 })
      .call(() => goDot(d, el, [b.l + b.w + 50, b.t - 50], 0.9, idle()))
      .to({}, { duration: 0.9 })
      .call(() => goDot(d, el, [b.l + b.w * 0.6, b.t + b.h + 70], 0.9, idle()))
      .to({}, { duration: 0.9 })
      // cycle B: tap, then hit Undo while the fuse burns
      .call(() => goDot(d, el, btn, 0.45, idle()))
      .to({}, { duration: 0.45 })
      .call(() => {
        if (!idle()) return;
        tapDot(d);
        add();
      })
      .to({}, { duration: 0.45 })
      .call(() => goDot(d, el, el.querySelector(".u182-undo"), 0.45, idle()))
      .to({}, { duration: 0.5 })
      .call(() => {
        if (!idle()) return;
        tapDot(d);
        undo();
      })
      .to({}, { duration: 0.35 })
      .call(() => goDot(d, el, [b.l + b.w * 0.3, b.t + b.h + 80], 0.5, idle()))
      .to({}, { duration: 0.5 });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,170,90,.52)" g2="rgba(120,160,255,.22)">
      <div className="flex h-full w-full items-center justify-center gap-[5%] px-[6%]">
        <div className="h-[78%] w-[30%] overflow-hidden rounded-[24px] border border-white/10">
          <Img i={3} w={600} h={760} />
        </div>
        <div className="w-[420px]">
          <div className="flex items-center justify-between">
            <Eyebrow>Leather goods</Eyebrow>
            <span className="flex items-center gap-2 text-[13px] text-white/60" style={{ fontFamily: F.mr }}>
              Bag
              <span className="u182-bag grid h-[26px] w-[26px] place-items-center rounded-full bg-[#ffb86b] text-[13px] font-[700] text-[#1a1208]">2</span>
            </span>
          </div>
          <h3 className="mt-3 text-[clamp(36px,3.4vw,52px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Field Tote, tan
          </h3>
          <p className="mt-3 text-[15px] text-white/60" style={{ fontFamily: F.mr }}>
            Vegetable-tanned · hand stitched · 14 L
          </p>
          <button type="button" className="u182-b mt-8 grid place-items-center" onClick={click}>
            <span className="u182-lab col-start-1 row-start-1 text-[17px] font-[600]" style={{ fontFamily: F.sg }}>
              Add to bag · ₹2,450
            </span>
            <span className="u182-lab b18g2-hide col-start-1 row-start-1 flex w-full items-center justify-between px-7 text-[16px] font-[600]" style={{ fontFamily: F.sg }}>
              Added to bag
              <span className="u182-undo rounded-full border border-[#ffbe6e]/60 px-4 py-1.5 text-[14px] text-[#ffcf8f]">Undo</span>
            </span>
            <span className="u182-lab b18g2-hide col-start-1 row-start-1 text-[17px] font-[600]" style={{ fontFamily: F.sg }}>
              In your bag ✓
            </span>
            <span className="u182-fuse pointer-events-none absolute bottom-[5px] left-[24px] h-[12px] opacity-0" style={{ width: U182_W }} aria-hidden>
              <svg width={U182_W} height={12} viewBox={`0 0 ${U182_W} 12`} className="absolute inset-0 overflow-visible">
                <path d={U182_PATH} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={2} />
                <path className="u182-p" d={U182_PATH} fill="none" stroke="#e7b77a" strokeWidth={2.4} strokeLinecap="round" />
              </svg>
              <span className="u182-spark" />
            </span>
          </button>
          <p className="mt-4 text-[13px] text-white/50" style={{ fontFamily: F.mr }}>
            Free delivery over ₹1,999
          </p>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U183 · Pulse heart ───────────────────────── */
const U183_HEART = "M12 21s-7.5-4.6-10-9.3C.4 8.6 2.2 4.5 6.1 4.5c2.3 0 3.9 1.4 4.9 3 1-1.6 2.6-3 4.9-3 3.9 0 5.7 4.1 4.1 7.2C19.5 16.4 12 21 12 21z";
function U183() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const liked = useRef(false);
  const toggle = () => {
    const el = root.current;
    if (!el) return;
    const h = one(el, ".u183-h");
    const path = el.querySelector<SVGPathElement>(".u183-hp")!;
    const beat = one(el, ".u183-beat");
    const ring = one(el, ".u183-ring");
    const bits = all(el, ".u183-bit");
    const cnt = one(el, ".u183-n");
    const on = !liked.current;
    liked.current = on;
    beat.classList.remove("liked");
    cnt.textContent = on ? "1,285" : "1,284";
    gsap.killTweensOf(h);
    const tl = gsap.timeline();
    tl.to(h, { scale: 0.12, duration: 0.16, ease: "power2.in" }).call(() => {
      path.setAttribute("fill", on ? "#ff4f6d" : "transparent");
      path.setAttribute("stroke", on ? "#ff4f6d" : "#ffffff");
    });
    if (on) {
      tl.to(h, { scale: 1.3, duration: 0.2, ease: "power2.out" })
        .to(h, { scale: 1, duration: 0.4, ease: "elastic.out(1,0.4)" })
        .call(() => beat.classList.add("liked"));
      tl.fromTo(ring, { scale: 0.3, opacity: 0.9 }, { scale: 1.9, opacity: 0, duration: 0.5, ease: "power2.out" }, 0.16);
      bits.forEach((b, k) => {
        const a = (k / bits.length) * Math.PI * 2;
        tl.fromTo(
          b,
          { x: 0, y: 0, scale: 1, opacity: 1 },
          { x: Math.cos(a) * 56, y: Math.sin(a) * 56, scale: 0.3, opacity: 0, duration: 0.5, ease: "power2.out" },
          0.18,
        );
      });
      tl.fromTo(cnt, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.18);
    } else {
      tl.to(h, { scale: 1, duration: 0.32, ease: "power2.out" });
    }
  };
  usePlay(root, (el) => {
    const d = dot.current;
    const btn = one(el, ".u183-btn");
    const card = one(el, ".u183-card");
    const tl = gsap.timeline({ repeat: -1 });
    const tap = () => {
      if (!idle()) return;
      tapDot(d);
      toggle();
    };
    tl.call(() => goDot(d, el, btn, 0.45, idle()))
      .to({}, { duration: 0.4 })
      .call(tap)
      .to({}, { duration: 0.5 })
      .call(() => {
        const c = rel(card, el);
        goDot(d, el, [c.l + c.w * 0.4, c.t + c.h * 0.62], 0.6, idle());
      })
      .to({}, { duration: 0.85 })
      .call(() => goDot(d, el, btn, 0.5, idle()))
      .to({}, { duration: 0.45 })
      .call(tap)
      .to({}, { duration: 0.45 })
      .call(() => {
        const c = rel(card, el);
        goDot(d, el, [c.l + c.w + 70, c.t + c.h * 0.4], 0.6, idle());
      })
      .to({}, { duration: 0.7 });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,90,130,.52)" g2="rgba(255,190,120,.22)">
      <div className="flex h-full w-full items-center justify-center">
        <div className="u183-card relative h-[86%] w-[min(380px,32%)] overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
          <div className="h-[72%]">
            <Img i={1} w={600} h={700} />
          </div>
          <div className="flex items-end justify-between px-6 py-5">
            <div>
              <p className="text-[20px] font-[600]" style={{ fontFamily: F.sg }}>
                Linen Overshirt
              </p>
              <p className="mt-1 text-[15px] text-white/60" style={{ fontFamily: F.mr }}>
                ₹3,290 · Sand
              </p>
            </div>
            <p className="text-[13px] text-white/55" style={{ fontFamily: F.mr }}>
              <span className="u183-n inline-block">1,284</span> saves
            </p>
          </div>
          <button type="button" aria-label="Save" className="u183-btn absolute right-4 top-4 grid h-[64px] w-[64px] place-items-center rounded-full bg-black/45" onClick={toggle}>
            <span className="u183-ring pointer-events-none absolute inset-0 rounded-full border-2 border-[#ff4f6d] opacity-0" />
            {Array.from({ length: 8 }, (_, k) => (
              <span key={k} className="u183-bit pointer-events-none absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] h-[6px] w-[6px] rounded-full opacity-0" style={{ background: k % 2 ? "#ffb36b" : "#ff4f6d" }} />
            ))}
            <span className="u183-beat block">
              <svg className="u183-h block" width={30} height={30} viewBox="0 0 24 24">
                <path className="u183-hp" d={U183_HEART} fill="transparent" stroke="#ffffff" strokeWidth={1.8} strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U184 · Sling button ───────────────────────── */
const U184_A: [number, number] = [72, 112];
const U184_B: [number, number] = [188, 112];
const U184_REST: [number, number] = [130, 128];
function U184() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const pouch = useRef({ x: 0, y: 0 });
  const master = useRef<gsap.core.Timeline | null>(null);
  useTicker(root, () => {
    const el = root.current;
    if (!el) return;
    const px = U184_REST[0] + pouch.current.x;
    const py = U184_REST[1] + pouch.current.y;
    const stretch = Math.hypot(pouch.current.x, pouch.current.y);
    el.querySelectorAll<SVGLineElement>(".u184-band").forEach((l) => {
      l.setAttribute("x2", px.toFixed(1));
      l.setAttribute("y2", py.toFixed(1));
      l.setAttribute("stroke-width", clamp(5 - stretch * 0.018, 2.4, 5).toFixed(2));
    });
  });
  usePlay(root, (el) => {
    const d = dot.current;
    const btn = one(el, ".u184-btn");
    const area = one(el, ".u184-area");
    const draft = one(el, ".u184-draft");
    const sent = one(el, ".u184-sent");
    const a = rel(area, el);
    const rest: [number, number] = [a.l + U184_REST[0], a.t + U184_REST[1]];
    const P = pouch.current;
    const PULL = { x: -34, y: 112 };
    const tl = gsap.timeline({ repeat: -1 });
    master.current = tl;
    tl.addLabel("press")
      .call(() => goDot(d, el, rest, 0.45, idle()))
      .to({}, { duration: 0.45 })
      .call(() => {
        tapDot(d);
        d?.classList.add("press");
      })
      .to(btn, { scale: 0.92, duration: 0.12 })
      .addLabel("pull")
      .to(P, { ...PULL, duration: 0.7, ease: "power2.out" }, "pull")
      .to(btn, { ...PULL, duration: 0.7, ease: "power2.out" }, "pull")
      .call(() => goDot(d, el, [rest[0] + PULL.x, rest[1] + PULL.y], 0.7, idle()), undefined, "pull")
      // tension: the stretched button trembles
      .to(btn, { rotation: -7, duration: 0.07, yoyo: true, repeat: 5, ease: "sine.inOut" })
      .to(P, { y: PULL.y + 4, duration: 0.07, yoyo: true, repeat: 5, ease: "sine.inOut" }, "<")
      .addLabel("go")
      .call(() => d?.classList.remove("press"), undefined, "go")
      .to(btn, { x: 680, y: -540, rotation: 30, scale: 0.75, duration: 0.6, ease: "power2.out" }, "go")
      .to(P, { x: 0, y: 0, duration: 0.95, ease: "elastic.out(1,0.28)" }, "go")
      .call(() => goDot(d, el, [rest[0] - 120, rest[1] + 40], 0.6, idle()), undefined, "go+=0.1")
      .to(draft, { autoAlpha: 0, y: -10, duration: 0.25 }, "go")
      .fromTo(sent, { autoAlpha: 0, y: 18, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, "go+=0.25")
      .set(btn, { x: 0, y: 80, rotation: 0, scale: 0.6, autoAlpha: 0 }, "go+=0.75")
      .to(btn, { y: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(1.6)" }, "go+=0.8")
      .call(() => goDot(d, el, [rest[0] - 60, rest[1] - 90], 0.6, idle()), undefined, "go+=0.75")
      .to(draft, { autoAlpha: 1, y: 0, duration: 0.3 }, "go+=1.2")
      .to(sent, { autoAlpha: 0, y: -12, duration: 0.3 }, "go+=1.35");
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(110,200,255,.52)" g2="rgba(255,150,200,.22)">
      <div className="flex h-full w-full items-center justify-center gap-[6%]">
        <div className="w-[min(460px,40%)]">
          <Eyebrow>Concierge · reservations</Eyebrow>
          <h3 className="mt-3 text-[clamp(38px,3.8vw,58px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Table for two?
          </h3>
          <div className="relative mt-8 h-[150px]">
            <div className="u184-sent b18g2-hide absolute left-0 right-0 top-0 rounded-[18px] bg-[#7fd0ff] px-5 py-4 text-[16px] text-[#06202e]" style={{ fontFamily: F.mr }}>
              Sent ✓ — we&apos;ll confirm in a few minutes
            </div>
            <div className="u184-draft absolute left-0 right-0 top-0 rounded-[18px] border border-white/15 bg-white/[0.04] px-5 py-4 text-[16px] text-white/85" style={{ fontFamily: F.mr }}>
              Friday, 8 pm — a window seat if you have one.
            </div>
          </div>
        </div>
        <div className="u184-area relative h-[300px] w-[260px]">
          <svg width={260} height={300} viewBox="0 0 260 300" className="absolute inset-0 overflow-visible" aria-hidden>
            <path d="M130 300 L130 200 M130 200 L72 112 M130 200 L188 112" fill="none" stroke="#3a4766" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
            <line className="u184-band" x1={U184_A[0]} y1={U184_A[1]} x2={U184_REST[0]} y2={U184_REST[1]} stroke="#ff9fc8" strokeWidth={5} strokeLinecap="round" />
            <line className="u184-band" x1={U184_B[0]} y1={U184_B[1]} x2={U184_REST[0]} y2={U184_REST[1]} stroke="#ff9fc8" strokeWidth={5} strokeLinecap="round" />
            <circle cx={U184_A[0]} cy={U184_A[1]} r={8} fill="#56648a" />
            <circle cx={U184_B[0]} cy={U184_B[1]} r={8} fill="#56648a" />
          </svg>
          <button
            type="button"
            aria-label="Send"
            className="u184-btn absolute grid h-[72px] w-[72px] place-items-center rounded-full bg-[#7fd0ff] text-[#06202e] shadow-[0_10px_30px_rgba(0,0,0,.4)]"
            style={{ left: U184_REST[0] - 36, top: U184_REST[1] - 36 }}
            onClick={() => master.current?.play("press")}
          >
            <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
              <path d="M3 11.5 21 3l-6.5 18-3.2-7.3L3 11.5z" />
              <path d="M11.3 13.7 21 3" />
            </svg>
          </button>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U185 · Bell toggle ───────────────────────── */
const U185_OFF = "inset(38px 342px 38px 38px round 999px)";
const U185_BELL = "inset(6px 310px 6px 6px round 999px)";
const U185_ON = "inset(0px 0px 0px 0px round 999px)";
function U185() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const on = useRef(false);
  const toggle = () => {
    const el = root.current;
    if (!el) return;
    const acc = one(el, ".u185-acc");
    const bell = one(el, ".u185-bell");
    const clap = one(el, ".u185-clap");
    const ic = one(el, ".u185-ic");
    const [offS, offB, onS, onB] = ["off-s", "off-b", "on-s", "on-b"].map((k) => one(el, `.u185-${k}`));
    const v = !on.current;
    on.current = v;
    gsap.killTweensOf([acc, bell, clap, offS, offB, onS, onB]);
    const tl = gsap.timeline();
    // bell rings
    tl.fromTo(bell, { rotation: 0 }, { keyframes: { rotation: [0, -24, 20, -14, 9, -4, 0] }, duration: 0.85, ease: "none", transformOrigin: "50% 12%" }, 0);
    tl.fromTo(clap, { x: 0 }, { keyframes: { x: [0, 4, -4, 3, -2, 0] }, duration: 0.85, ease: "none" }, 0);
    // label blur-crossfade: sharp copy hands over to a fixed-blur copy, then the other label resolves from blur to sharp
    const [outS, outB, inS, inB] = v ? [offS, offB, onS, onB] : [onS, onB, offS, offB];
    tl.to(outS, { autoAlpha: 0, duration: 0.2 }, 0.05)
      .fromTo(outB, { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.15 }, 0.05)
      .to(outB, { autoAlpha: 0, duration: 0.2 }, 0.22)
      .fromTo(inB, { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.18 }, 0.3)
      .to(inB, { autoAlpha: 0, duration: 0.25 }, 0.5)
      .fromTo(inS, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.46);
    // pill unfurls from the bell via clip-path
    if (v) {
      tl.fromTo(acc, { clipPath: U185_OFF }, { clipPath: U185_BELL, duration: 0.16, ease: "power2.out" }, 0).to(acc, { clipPath: U185_ON, duration: 0.5, ease: "power3.inOut" }, 0.14);
    } else {
      tl.to(acc, { clipPath: U185_BELL, duration: 0.42, ease: "power3.inOut" }, 0.05).to(acc, { clipPath: U185_OFF, duration: 0.16, ease: "power2.in" }, 0.47);
    }
    tl.call(() => ic.style.setProperty("color", v ? "#1c1404" : "#ffffff"), undefined, v ? 0.2 : 0.45);
  };
  usePlay(root, (el) => {
    const d = dot.current;
    const pill = one(el, ".u185-pill");
    const tap = () => {
      if (!idle()) return;
      tapDot(d);
      toggle();
    };
    const tl = gsap.timeline({ repeat: -1 });
    tl.call(() => goDot(d, el, pill, 0.45, idle()))
      .to({}, { duration: 0.4 })
      .call(tap)
      .to({}, { duration: 0.5 })
      .call(() => {
        const p = rel(pill, el);
        goDot(d, el, [p.l + p.w * 0.7, p.t + p.h + 70], 0.5, idle());
      })
      .to({}, { duration: 0.95 })
      .call(() => goDot(d, el, pill, 0.5, idle()))
      .to({}, { duration: 0.45 })
      .call(tap)
      .to({}, { duration: 0.5 })
      .call(() => {
        const p = rel(pill, el);
        goDot(d, el, [p.l + p.w * 0.2, p.t - 70], 0.5, idle());
      })
      .to({}, { duration: 0.85 });
    return tl;
  });
  const Bell = () => (
    <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className="overflow-visible">
      <g className="u185-bell">
        <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15L6 16.5z" />
        <path d="M12 3v1.5" />
      </g>
      <circle className="u185-clap" cx={12} cy={20.5} r={1.6} fill="currentColor" />
    </svg>
  );
  return (
    <Stage r={root} g1="rgba(255,200,90,.52)" g2="rgba(140,150,255,.22)">
      <div className="flex h-full w-full items-center justify-center gap-[6%]">
        <div className="h-[76%] w-[28%] overflow-hidden rounded-[24px] border border-white/10">
          <Img i={2} w={560} h={700} />
        </div>
        <div className="w-[420px]">
          <Eyebrow>Trail Runner 2 · Moss</Eyebrow>
          <h3 className="mt-3 text-[clamp(36px,3.4vw,52px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Sold out in UK 9
          </h3>
          <p className="mt-3 text-[15px] text-white/60" style={{ fontFamily: F.mr }}>
            ₹8,990 · next batch lands in March
          </p>
          <button type="button" className="u185-pill relative mt-8 block h-[76px] w-[380px] rounded-full border border-white/20 bg-white/[0.04] text-left" onClick={toggle} aria-label="Notify me">
            <span className="u185-acc absolute inset-[-1px] rounded-full bg-[#ffc861]" style={{ clipPath: U185_OFF }} aria-hidden />
            <span className="absolute left-[6px] top-[6px] grid h-[64px] w-[64px] place-items-center rounded-full bg-white/10">
              <span className="u185-ic" style={{ color: "#ffffff" }}>
                <Bell />
              </span>
            </span>
            <span className="absolute inset-y-0 left-[90px] right-6 grid items-center" style={{ fontFamily: F.sg }}>
              <span className="u185-off-s col-start-1 row-start-1 text-[18px] font-[600] text-white">
                Notify me when it&apos;s back
              </span>
              <span className="u185-off-b b18g2-hide col-start-1 row-start-1 text-[18px] font-[600] text-white" style={{ filter: "blur(5px)" }} aria-hidden>
                Notify me when it&apos;s back
              </span>
              <span className="u185-on-s b18g2-hide col-start-1 row-start-1 text-[18px] font-[700] text-[#1c1404]">
                You&apos;re on the list
              </span>
              <span className="u185-on-b b18g2-hide col-start-1 row-start-1 text-[18px] font-[700] text-[#1c1404]" style={{ filter: "blur(5px)" }} aria-hidden>
                You&apos;re on the list
              </span>
            </span>
          </button>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U186 · Tear ticket ───────────────────────── */
const U186_F = 16;
function U186() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const master = useRef<gsap.core.Timeline | null>(null);
  usePlay(root, (el) => {
    const d = dot.current;
    const stub = one(el, ".u186-stub");
    const body = one(el, ".u186-body");
    const fib = all(el, ".u186-f");
    const stamp = one(el, ".u186-stamp");
    gsap.set(stub, { transformOrigin: "0% 100%" });
    gsap.set(fib, { transformOrigin: "0% 50%" });
    gsap.set(stamp, { autoAlpha: 0 });
    const sb = rel(stub, el);
    const grip: [number, number] = [sb.l + sb.w - 34, sb.t + 40];
    const tl = gsap.timeline({ repeat: -1 });
    master.current = tl;
    tl.addLabel("tear")
      .call(() => goDot(d, el, grip, 0.45, idle()))
      .to({}, { duration: 0.45 })
      .call(() => {
        tapDot(d);
        d?.classList.add("press");
      })
      .addLabel("rip")
      // the stub peels away from the top while the fibres stretch and snap one by one, top to bottom
      .to(stub, { rotation: 9, x: 10, duration: 1, ease: "power1.in" }, "rip")
      .to(fib, { scaleX: 2.8, duration: 0.2, stagger: 0.052, ease: "power1.in" }, "rip")
      .to(fib, { opacity: 0, scaleX: 1.2, duration: 0.08, stagger: 0.052 }, "rip+=0.18")
      .call(() => goDot(d, el, [grip[0] + 46, grip[1] - 6], 1, idle()), undefined, "rip")
      .addLabel("drop", "rip+=1")
      .call(() => d?.classList.remove("press"), undefined, "drop")
      .to(stub, { y: 480, x: 80, rotation: 38, autoAlpha: 0, duration: 0.7, ease: "power2.in" }, "drop")
      .call(() => goDot(d, el, [sb.l - 120, sb.t + sb.h + 50], 0.6, idle()), undefined, "drop+=0.1")
      .fromTo(stamp, { scale: 2.3, autoAlpha: 0, rotation: -2 }, { scale: 1, autoAlpha: 0.95, rotation: -12, duration: 0.24, ease: "power3.in" }, "drop+=0.3")
      .to(body, { x: 5, duration: 0.05, yoyo: true, repeat: 3, ease: "sine.inOut" }, "drop+=0.54")
      .set(body, { x: 0 })
      .call(() => goDot(d, el, [sb.l - 40, sb.t - 50], 0.6, idle()), undefined, "drop+=0.75")
      .to(stamp, { autoAlpha: 0, duration: 0.35 }, "drop+=1.25")
      .set(stub, { x: 0, y: -40, rotation: 0 }, "drop+=1.3")
      .to(stub, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" }, "drop+=1.3")
      .to(fib, { scaleX: 1, opacity: 1, duration: 0.3, stagger: 0.01 }, "drop+=1.4");
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,140,110,.52)" g2="rgba(130,170,255,.22)">
      <div className="flex h-full w-full items-center justify-center">
        <div className="relative flex h-[270px] w-[720px] text-[#1b1410]">
          <div className="u186-body relative h-full w-[530px] overflow-hidden rounded-l-[22px] bg-[#f3eadb] px-9 py-8">
            <p className="text-[13px] uppercase tracking-[0.22em] text-[#1b1410]/60" style={{ fontFamily: F.sg }}>
              Glasshouse Sessions · No. 07
            </p>
            <h3 className="mt-3 text-[44px] leading-[0.98] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
              Night Garden Concert
            </h3>
            <div className="mt-7 flex gap-10 text-[15px]" style={{ fontFamily: F.mr }}>
              <div>
                <p className="text-[12px] uppercase tracking-[0.18em] text-[#1b1410]/55">When</p>
                <p className="mt-1 font-[600]">Sat 14 Dec · 7:30 pm</p>
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-[0.18em] text-[#1b1410]/55">Seat</p>
                <p className="mt-1 font-[600]">Row F · 12</p>
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-[0.18em] text-[#1b1410]/55">Paid</p>
                <p className="mt-1 font-[600]">₹1,800</p>
              </div>
            </div>
            <div
              className="u186-stamp b18g2-hide pointer-events-none absolute right-8 top-7 grid h-[118px] w-[118px] place-items-center rounded-full border-[3px] border-[#d8432f] text-center text-[15px] font-[800] uppercase leading-[1.1] tracking-[0.12em] text-[#d8432f]"
              style={{ fontFamily: F.sg, transform: "rotate(-12deg)" }}
            >
              Admitted
              <br />
              14·12
            </div>
          </div>
          {Array.from({ length: U186_F }, (_, i) => (
            <span key={i} className="u186-f pointer-events-none absolute h-[2px] w-[9px] rounded-full bg-[#e6dac5]" style={{ left: 527, top: `${((i + 0.5) / U186_F) * 100}%` }} aria-hidden />
          ))}
          <div
            className="u186-stub relative flex h-full w-[190px] cursor-grab flex-col items-center justify-between rounded-r-[22px] border-l-[3px] border-dotted border-[#1b1410]/30 bg-[#efe3cf] py-7"
            onClick={() => master.current?.play("tear")}
          >
            <p className="text-[12px] uppercase tracking-[0.22em] text-[#1b1410]/60" style={{ fontFamily: F.sg }}>
              Admit one
            </p>
            <div className="flex h-[96px] items-stretch gap-[3px]" aria-hidden>
              {Array.from({ length: 22 }, (_, i) => (
                <span key={i} className="bg-[#1b1410]" style={{ width: 1 + Math.round(rnd(i, 11) * 3) }} />
              ))}
            </div>
            <p className="text-[14px] font-[700]" style={{ fontFamily: F.mr }}>
              F-12 · 0471
            </p>
          </div>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U187 · Paper crumple ───────────────────────── */
const U187_W = 400;
const U187_H = 500;
const U187_C = 5;
const U187_R = 6;
const U187_SRC = scene(2, U187_W, U187_H);
const U187_T = Array.from({ length: U187_C * U187_R }, (_, i) => {
  const c = i % U187_C;
  const r = Math.floor(i / U187_C);
  const w = U187_W / U187_C;
  const h = U187_H / U187_R;
  const cx = (c + 0.5) * w - U187_W / 2;
  const cy = (r + 0.5) * h - U187_H / 2;
  // crumpled target: pulled close to the centre with jitter → a lumpy paper ball
  const tx = cx * 0.2 + (rnd(i, 21) - 0.5) * 36;
  const ty = cy * 0.17 + (rnd(i, 22) - 0.5) * 36;
  return {
    l: c * w,
    t: r * h,
    w,
    h,
    x: tx - cx,
    y: ty - cy,
    rz: (rnd(i, 23) - 0.5) * 140,
    rx: (rnd(i, 24) - 0.5) * 120,
    ry: (rnd(i, 25) - 0.5) * 120,
    s: 0.2 + rnd(i, 26) * 0.45,
  };
});
function U187() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const master = useRef<gsap.core.Timeline | null>(null);
  const resume = useRef<gsap.core.Tween | null>(null);
  const crumple = () => {
    const el = root.current;
    if (!el) return;
    const tiles = all(el, ".u187-t");
    const shades = all(el, ".u187-sh");
    const sheet = one(el, ".u187-sheet");
    gsap.to(tiles, {
      x: (i) => U187_T[i].x,
      y: (i) => U187_T[i].y,
      rotation: (i) => U187_T[i].rz,
      rotationX: (i) => U187_T[i].rx,
      rotationY: (i) => U187_T[i].ry,
      scale: 0.56,
      borderRadius: "38%",
      duration: 0.9,
      ease: "power3.inOut",
      stagger: { each: 0.012, from: "edges" },
      overwrite: true,
    });
    gsap.to(shades, { opacity: (i) => U187_T[i].s, duration: 0.9, ease: "power2.inOut", overwrite: true });
    // squeezed in the hand: the ball keeps turning and pulsing while held
    gsap.to(sheet, { rotation: 12, scale: 0.94, duration: 0.3, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.8, overwrite: true });
  };
  const unfold = () => {
    const el = root.current;
    if (!el) return;
    const tiles = all(el, ".u187-t");
    const shades = all(el, ".u187-sh");
    const sheet = one(el, ".u187-sheet");
    gsap.to(sheet, { rotation: 0, scale: 1, duration: 0.4, ease: "power2.out", overwrite: true });
    gsap.to(tiles, {
      x: 0,
      y: 0,
      rotation: 0,
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      borderRadius: "0%",
      duration: 0.85,
      ease: "power3.out",
      stagger: { each: 0.01, from: "center" },
      overwrite: true,
    });
    gsap.to(shades, { opacity: 0, duration: 0.85, ease: "power2.out", overwrite: true });
  };
  usePlay(root, (el, dispose) => {
    const d = dot.current;
    const sheet = one(el, ".u187-sheet");
    dispose(() => resume.current?.kill());
    const tl = gsap.timeline({ repeat: -1 });
    master.current = tl;
    tl.call(() => goDot(d, el, sheet, 0.45, idle()))
      .to({}, { duration: 0.45 })
      .call(() => {
        if (!idle()) return;
        tapDot(d);
        d?.classList.add("press");
        crumple();
      })
      .to({}, { duration: 1.45 })
      .call(() => {
        d?.classList.remove("press");
        if (idle()) unfold();
      })
      .to({}, { duration: 0.3 })
      .call(() => {
        const s = rel(sheet, el);
        goDot(d, el, [s.l + s.w + 110, s.t + s.h * 0.7], 0.5, idle());
      })
      .to({}, { duration: 0.5 })
      .call(() => {
        const s = rel(sheet, el);
        goDot(d, el, [s.l + s.w + 60, s.t + s.h * 0.3], 0.5, idle());
      })
      .to({}, { duration: 0.5 });
    return tl;
  });
  const down = () => {
    master.current?.pause();
    resume.current?.kill();
    crumple();
  };
  const up = () => {
    unfold();
    resume.current?.kill();
    resume.current = gsap.delayedCall(2.6, () => master.current?.play());
  };
  return (
    <Stage r={root} g1="rgba(120,230,170,.52)" g2="rgba(255,200,120,.22)">
      <div className="flex h-full w-full items-center justify-center gap-[7%]">
        <div className="u187-sheet relative cursor-pointer select-none" style={{ width: U187_W * 0.92, height: U187_H * 0.92 }} onPointerDown={down} onPointerUp={up} onPointerLeave={(e) => e.buttons && up()}>
          <div className="absolute left-0 top-0 origin-top-left" style={{ width: U187_W, height: U187_H, transform: "scale(.92)", perspective: 900 }}>
            {U187_T.map((t, i) => (
              <div
                key={i}
                className="u187-t absolute overflow-hidden"
                style={{
                  left: t.l,
                  top: t.t,
                  width: t.w + 0.5,
                  height: t.h + 0.5,
                  backgroundImage: `url("${U187_SRC}")`,
                  backgroundSize: `${U187_W}px ${U187_H}px`,
                  backgroundPosition: `${-t.l}px ${-t.t}px`,
                }}
              >
                <div className="u187-sh absolute inset-0 bg-gradient-to-br from-black/30 to-black opacity-0" />
              </div>
            ))}
          </div>
        </div>
        <div className="w-[min(380px,34%)]">
          <Eyebrow>Returns · 30 days</Eyebrow>
          <h3 className="mt-3 text-[clamp(36px,3.6vw,56px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Not quite right? Crumple it.
          </h3>
          <p className="mt-4 text-[15px] text-white/60" style={{ fontFamily: F.mr }}>
            Press and hold the print. We collect it free, and the ₹2,100 is back in two days.
          </p>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U188 · Shredder ───────────────────────── */
const U188_ROWS = [
  { n: "Wool Beanie, rust", s: "Saved 3 days ago", p: "₹1,190", i: 3 },
  { n: "Canvas Sneaker, chalk", s: "Price dropped ₹400", p: "₹4,290", i: 0 },
  { n: "Ribbed Socks, 3 pack", s: "Low stock", p: "₹690", i: 2 },
  { n: "Rain Shell, olive", s: "Saved last week", p: "₹6,850", i: 1 },
];
const U188_N = 12;
const U188_DX = 230;
function U188Row({ r }: { r: (typeof U188_ROWS)[number] }) {
  return (
    <div className="flex h-[84px] items-center gap-5 rounded-[18px] bg-[#121726] px-5">
      <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[12px]">
        <Img i={r.i} w={160} h={160} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[17px] font-[600]" style={{ fontFamily: F.sg }}>
          {r.n}
        </p>
        <p className="mt-0.5 text-[13px] text-white/55" style={{ fontFamily: F.mr }}>
          {r.s}
        </p>
      </div>
      <p className="text-[16px] font-[600]" style={{ fontFamily: F.sg }}>
        {r.p}
      </p>
      <span className="u188-h grid h-[40px] w-[28px] place-items-center text-white/45" aria-hidden>
        <svg width={14} height={22} viewBox="0 0 14 22" fill="currentColor">
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <circle cx={3} cy={4 + k * 7} r={1.8} />
              <circle cx={11} cy={4 + k * 7} r={1.8} />
            </g>
          ))}
        </svg>
      </span>
    </div>
  );
}
function U188() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const master = useRef<gsap.core.Timeline | null>(null);
  usePlay(root, (el) => {
    const d = dot.current;
    const wraps = all(el, ".u188-w");
    const glow = one(el, ".u188-glow");
    const tl = gsap.timeline({ repeat: -1 });
    master.current = tl;
    [1, 2].forEach((k) => {
      const w = wraps[k];
      const row = one(w, ".u188-r");
      const sc = one(w, ".u188-s");
      const strips = all(w, ".u188-st");
      const handle = one(w, ".u188-h");
      const h0 = w.offsetHeight;
      const hb = mid(rel(handle, el));
      tl.addLabel(`c${k}`)
        .call(() => goDot(d, el, hb, 0.45, idle()))
        .to({}, { duration: 0.45 })
        .call(() => {
          tapDot(d);
          d?.classList.add("press");
        })
        .addLabel(`d${k}`)
        .to(row, { x: U188_DX, duration: 0.75, ease: "power2.inOut" }, `d${k}`)
        .call(() => goDot(d, el, [hb[0] + U188_DX, hb[1]], 0.75, idle()), undefined, `d${k}`)
        .to(glow, { opacity: 1, duration: 0.3 }, `d${k}+=0.4`)
        .addLabel(`s${k}`)
        .call(() => d?.classList.remove("press"), undefined, `s${k}`)
        .set(row, { autoAlpha: 0 }, `s${k}`)
        .set(sc, { autoAlpha: 1, x: U188_DX }, `s${k}`)
        // cut into strips that curl and fall at random
        .to(
          strips,
          {
            y: (i) => 150 + rnd(i + k * 20, 31) * 140,
            rotation: (i) => (rnd(i + k * 20, 32) - 0.5) * 80,
            rotationX: 75,
            skewX: (i) => (i % 2 ? 18 : -18),
            autoAlpha: 0,
            transformPerspective: 500,
            transformOrigin: "50% 0%",
            duration: 0.95,
            ease: "power2.in",
            stagger: { each: 0.035, from: "random" },
          },
          `s${k}`,
        )
        .to(w, { height: 0, duration: 0.45, ease: "power2.inOut" }, `s${k}+=0.4`)
        .to(glow, { opacity: 0, duration: 0.4 }, `s${k}+=0.4`)
        .call(() => goDot(d, el, [hb[0] + U188_DX + 40, hb[1] + 120], 0.6, idle()), undefined, `s${k}+=0.1`)
        .set(row, { x: -40 }, `s${k}+=1.3`)
        .to(w, { height: h0, duration: 0.4, ease: "power2.out" }, `s${k}+=1.3`)
        .to(row, { x: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" }, `s${k}+=1.4`)
        .set(sc, { autoAlpha: 0, x: 0 }, `s${k}+=1.85`)
        .set(strips, { y: 0, rotation: 0, rotationX: 0, skewX: 0, autoAlpha: 1 }, `s${k}+=1.85`)
        .set(w, { height: "auto" }, `s${k}+=1.85`);
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,110,110,.52)" g2="rgba(120,170,255,.22)">
      <div className="flex h-full w-full items-center justify-center gap-[4%]">
        <div className="w-[min(600px,46%)]">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <Eyebrow>Saved for later</Eyebrow>
              <h3 className="mt-2 text-[clamp(32px,3vw,46px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
                Clear the list
              </h3>
            </div>
            <p className="text-[13px] text-white/55" style={{ fontFamily: F.mr }}>
              Drag a row into the shredder
            </p>
          </div>
          <div className="flex flex-col">
            {U188_ROWS.map((r, k) => (
              <div key={r.n} className="u188-w relative" onClick={() => master.current?.play(k === 2 ? "c2" : "c1")}>
                <div className="pb-3">
                  <div className="u188-r">
                    <U188Row r={r} />
                  </div>
                </div>
                <div className="u188-s b18g2-hide pointer-events-none absolute left-0 right-0 top-0 h-[84px]" aria-hidden>
                  {Array.from({ length: U188_N }, (_, i) => (
                    <div key={i} className="u188-st absolute top-0 h-full overflow-hidden" style={{ left: `${(i / U188_N) * 100}%`, width: `${100 / U188_N + 0.2}%` }}>
                      <div className="absolute top-0 h-full" style={{ width: `${U188_N * 100}%`, left: `${-i * 100}%` }}>
                        <U188Row r={r} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative h-[60%] w-[56px] rounded-[16px] border border-white/15 bg-[#0d111c]" aria-hidden>
          <div className="u188-glow absolute inset-[-14px] rounded-[24px] opacity-0" style={{ background: "radial-gradient(closest-side,rgba(255,90,90,.55),transparent)" }} />
          <div className="u188-teeth absolute inset-x-[18px] inset-y-[14px] rounded-[6px]" />
          <p className="absolute -bottom-9 left-1/2 w-[120px] -translate-x-1/2 text-center text-[12px] uppercase tracking-[0.2em] text-white/50" style={{ fontFamily: F.sg }}>
            Shred
          </p>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U189 · Glass icons ───────────────────────── */
const U189_I = [
  { n: "Bag", g: "linear-gradient(135deg,#ff8a5c,#ff4f7b)", d: "M6 8h12l-1 12H7L6 8zM9 8a3 3 0 0 1 6 0" },
  { n: "Saved", g: "linear-gradient(135deg,#ff6fa8,#b46bff)", d: U183_HEART },
  { n: "Track", g: "linear-gradient(135deg,#5fb8ff,#5a6bff)", d: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 1 0 0-.1M17 19a1.5 1.5 0 1 0 0-.1" },
  { n: "Gifts", g: "linear-gradient(135deg,#ffd166,#ff9a3d)", d: "M4 10h16v4H4zM5 14h14v6H5zM12 10v10M12 10c-2-4-6-3-5 0M12 10c2-4 6-3 5 0" },
  { n: "Help", g: "linear-gradient(135deg,#6ff0c8,#2fb6a0)", d: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17v.1" },
];
function U189() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  usePointer(
    root,
    dot,
    (t, el) => {
      const pts = all(el, ".u189-i").map((n) => mid(rel(n, el)));
      if (!pts.length) return { x: 0, y: 0, inside: false };
      const ring = [...pts, ...pts.slice(1, -1).reverse()];
      const [x, y] = stepPath(t, ring, 0.95, 0.5);
      return { x, y, inside: true };
    },
    (p, el) => {
      all(el, ".u189-i").forEach((n) => {
        n.classList.toggle("on", p.inside && inBox(rel(n, el), p.x, p.y, 6));
      });
    },
  );
  return (
    <Stage r={root} g1="rgba(150,140,255,.55)" g2="rgba(255,150,120,.22)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Your account</Eyebrow>
        <h3 className="mt-3 text-[clamp(36px,3.6vw,56px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Everything, one tap away
        </h3>
        <div className="mt-14 flex gap-[clamp(28px,3.4vw,56px)]">
          {U189_I.map((ic, k) => (
            <div key={ic.n} className="flex flex-col items-center gap-5">
              <div className={`u189-i ${k === 1 ? "on" : ""}`}>
                <span className="u189-back" style={{ background: ic.g }} />
                <span className="u189-gl">
                  <svg width={46} height={46} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                    <path d={ic.d} />
                  </svg>
                </span>
              </div>
              <span className="u189-lab text-[14px] font-[600] uppercase tracking-[0.18em]" style={{ fontFamily: F.sg }}>
                {ic.n}
              </span>
            </div>
          ))}
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "U178", name: "Swarm cursor", how: "A flock of particles steers after the pointer and swirls around it whenever it rests. A fake pointer traces a slow figure-eight.", kind: "play", C: U178 },
  { code: "U179", name: "Magnet lines", how: "A grid of short lines each turns to point at the pointer, like iron filings round a magnet. A fake pointer sweeps a figure-eight.", kind: "play", C: U179 },
  { code: "U180", name: "Laser flow", how: "A flowing laser beam pours down onto a grid floor and its light spreads across the surface where it lands, then retracts. Loops on screen.", kind: "play", C: U180 },
  { code: "U181", name: "Magic rings", how: "Glowing rings spawn at the pointer and expand as they fade, trailing its path. A fake pointer traces a figure-eight.", kind: "play", C: U181 },
  { code: "U182", name: "Fuse button", how: "After Add to bag the button flips to a done state with a burning fuse as the undo timer; a fake pointer lets one burn out and undoes the next.", kind: "play", C: U182 },
  { code: "U183", name: "Pulse heart", how: "Tapping save contracts the heart to a dot, flips it red, then pulses it back with a ring and sparks; tapping again empties it. Scripted taps loop.", kind: "play", C: U183 },
  { code: "U184", name: "Sling button", how: "A fake pointer pulls the send button back on its rubber bands, it trembles, then launches off screen as the bands snap and a new one drops in.", kind: "play", C: U184 },
  { code: "U185", name: "Bell toggle", how: "Tapping Notify rings the bell, blur-crossfades the label and unfurls an accent pill from the bell via clip-path; tapping again rolls it back.", kind: "play", C: U185 },
  { code: "U186", name: "Tear ticket", how: "A fake pointer tears the stub off fibre by fibre down the perforation; it drops away and the ticket body gets an Admitted stamp. Loops.", kind: "play", C: U186 },
  { code: "U187", name: "Paper crumple", how: "Pressing the print crumples its tiles into a lumpy paper ball that keeps squeezing while held; releasing unfolds it flat. Scripted press loops.", kind: "play", C: U187 },
  { code: "U188", name: "Shredder", how: "A fake pointer drags a saved row into the shredder; it is cut into strips that curl and fall while the list closes the gap, then refills.", kind: "play", C: U188 },
  { code: "U189", name: "Glass icons", how: "Frosted glass icons over tilted colour plates; hovering lifts and tilts the glass layer in 3D and shows the label. A fake pointer walks the row.", kind: "play", C: U189 },
];
