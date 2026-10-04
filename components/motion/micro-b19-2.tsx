"use client";

// Micro-interactions, batch 19 · group 2 (MOTION-MENU U238–U249). Small focused demos for /lab/motion.
// Pointer demos also play by themselves: a visible fake pointer (ring, or the demo's own cursor) follows a scripted path,
// resting ≤ 0.5 s per target, and "presses" where the motion needs a click or a drag. The real mouse takes over for 2.5 s
// whenever it moves inside the stage. A CSS-only glow loop never stops (and sits on top again, screen-blended) so covered
// stages never freeze. Canvas / WebGL are built only near the viewport (dpr 1) and released on unmount.
// ?static=1 / reduced motion: no JS, the markup shows a sensible final state.
import { useContext, useEffect, useRef, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from "react";
import { gsap, loadPlugin, prefersReducedMotion } from "@/lib/gsap";
import { createShader, type GLHandle } from "@/lib/gl";
import { scene, ScrubRoot, useScrub, useTicker } from "@/components/fx/shared";
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
.b19g2-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b19g2-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b19g2-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b19g2-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;pointer-events:none;z-index:40;opacity:0;transition:opacity .25s}
.b19g2-dot>span{display:block;width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);transition:transform .15s,background-color .15s}
.b19g2-dot.press>span{transform:scale(.68);background:rgba(255,255,255,.55)}

/* U239 caret cursor */
.u239-stage{cursor:none}
.u239-cur{position:absolute;left:0;top:0;pointer-events:none;z-index:40;background:#ffd166;box-shadow:0 0 18px rgba(255,209,102,.55)}

/* U240 tour */
.u240-hole{position:absolute;left:0;top:0;border-radius:18px;pointer-events:none;z-index:20;opacity:0;box-shadow:0 0 0 9999px rgba(4,6,12,.74),0 0 26px 10px rgba(4,6,12,.6)}
.u240-ring{position:absolute;inset:-6px;border-radius:22px;border:2px solid rgba(255,209,102,.85);animation:u240-ping 1.2s ease-out infinite}
@keyframes u240-ping{0%{transform:scale(.97);opacity:1}100%{transform:scale(1.08);opacity:0}}
.u240-tip{position:absolute;left:0;top:0;z-index:22;pointer-events:none;opacity:0}

/* U241 ripple grid */
.u241-c{border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.025);border-radius:4px;will-change:transform}

/* U242 HUD scan */
.u242-card{position:relative;overflow:hidden;transition:transform .45s ${EZ},box-shadow .45s}
.u242-card img{transition:transform .6s ${EZ}}
.u242-card.on{transform:translateY(-8px);box-shadow:0 30px 60px rgba(0,0,0,.5),0 0 0 1px rgba(94,255,214,.5)}
.u242-card.on img{transform:scale(1.06)}
.u242-hud{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .3s}
.u242-card.on .u242-hud{opacity:1}
.u242-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(94,255,214,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(94,255,214,.14) 1px,transparent 1px);background-size:22px 22px;mix-blend-mode:screen}
.u242-tint{position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,90,80,.35),rgba(10,30,40,.55))}
.u242-scan{position:absolute;left:0;right:0;top:0;height:60px;background:linear-gradient(180deg,transparent,rgba(94,255,214,.45) 85%,#bfffee 100%);transform:translateY(-70px)}
.u242-card.on .u242-scan{animation:u242-scan 1.1s linear infinite}
@keyframes u242-scan{0%{transform:translateY(-70px)}100%{transform:translateY(440px)}}
.u242-br{position:absolute;width:26px;height:26px;border-color:#5effd6;border-style:solid;transition:transform .4s ${EZ}}
.u242-br.a{left:12px;top:12px;border-width:2px 0 0 2px;transform:translate(-10px,-10px)}
.u242-br.b{right:12px;top:12px;border-width:2px 2px 0 0;transform:translate(10px,-10px)}
.u242-br.c{left:12px;bottom:12px;border-width:0 0 2px 2px;transform:translate(-10px,10px)}
.u242-br.d{right:12px;bottom:12px;border-width:0 2px 2px 0;transform:translate(10px,10px)}
.u242-card.on .u242-br{transform:none}
.u242-read{position:absolute;left:16px;top:44px;font:600 12px/1.5 ui-monospace,Menlo,monospace;color:#9ffff0;letter-spacing:.08em}
.u242-bar{display:block;height:3px;width:0;background:#5effd6;margin-top:6px;transition:width .9s ${EZ}}
.u242-card.on .u242-bar{width:88px}
.u242-blink{animation:u242-blink .7s steps(2) infinite}
@keyframes u242-blink{50%{opacity:0}}

/* U245 progress ring */
.u245-spin{animation:u245-spin 9s linear infinite;transform-origin:50% 50%}
@keyframes u245-spin{to{transform:rotate(360deg)}}

/* U249 liquid button fallback */
.u249-btn{transition:letter-spacing .4s ${EZ},text-shadow .4s}
.u249-btn.on{letter-spacing:.09em;text-shadow:0 0 14px rgba(255,255,255,.6)}
.u249-fb{position:absolute;inset:34px;border-radius:999px;padding:3px;background:conic-gradient(from var(--a,0deg),#e8ecf5,#59607a,#ffffff,#8a90a8,#f5d9c4,#4a5068,#e8ecf5);animation:u249-a 3s linear infinite}
@property --a{syntax:"<angle>";inherits:false;initial-value:0deg}
@keyframes u249-a{to{--a:360deg}}

html.is-static .b19g2-glow,html.is-static .u240-ring,html.is-static .u242-scan,html.is-static .u242-blink,html.is-static .u245-spin,html.is-static .u249-fb{animation:none}
@media (prefers-reduced-motion: reduce){
  .b19g2-glow,.u240-ring,.u242-scan,.u242-blink,.u245-spin,.u249-fb{animation:none}
  .u242-card,.u242-card img,.u242-hud,.u242-br,.u242-bar{transition:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop, again on top (screen blend) so covered stages never freeze. */
function Stage({ r, children, g1, g2, className = "" }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string; className?: string }) {
  return (
    <div ref={r} className={`relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff] ${className}`}>
      <style href="b19g2-css" precedence="default">
        {CSS}
      </style>
      <div className="b19g2-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      <div className="b19g2-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: 0.45, zIndex: 35 } as CSSProperties} aria-hidden />
    </div>
  );
}

/** The visible fake pointer (a ring). */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => (
  <div ref={r} className="b19g2-dot" aria-hidden>
    <span />
  </div>
);

type Pt = { x: number; y: number; inside: boolean; down: boolean };
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
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Pointer driver: the real mouse wins for 2.5 s after it last moved; otherwise `script` moves a visible fake ring. */
function usePointer(
  root: RefObject<HTMLDivElement | null>,
  dot: RefObject<HTMLDivElement | null> | null,
  script: (t: number, el: HTMLDivElement) => Pt,
  frame: (p: Pt, el: HTMLDivElement, fake: boolean, dt: number) => void,
) {
  const real = useRef({ x: 0, y: 0, inside: false, down: false, at: -1e9 });
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
      real.current = { x: e.clientX - r.left, y: e.clientY - r.top, inside: true, down: e.buttons > 0, at: performance.now() };
    };
    const leave = () => (real.current = { ...real.current, inside: false, down: false, at: performance.now() });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", move);
    el.addEventListener("pointerup", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", move);
      el.removeEventListener("pointerup", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [root]);
  useTicker(root, (t, dt) => {
    const el = root.current;
    if (!el) return;
    if (t0.current < 0) t0.current = t;
    const R = real.current;
    const useReal = performance.now() - R.at < 2500;
    const p = useReal ? { x: R.x, y: R.y, inside: R.inside, down: R.down } : sc.current(t - t0.current, el);
    const dn = dot?.current;
    if (dn) {
      dn.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0)`;
      dn.style.opacity = useReal ? "0" : "1";
      dn.classList.toggle("press", p.down);
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
function usePlay(ref: RefObject<HTMLElement | null>, build: (root: HTMLElement) => gsap.core.Animation | void, wait?: () => Promise<unknown>) {
  const b = useRef(build);
  b.current = build;
  const w = useRef(wait);
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
    Promise.all([document.fonts?.ready, w.current?.()]).then(() => {
      if (dead || !ref.current) return;
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

/** Runs `fn` once when `el` comes within ~1 screen of the viewport (heavy canvas / GL setup waits for this). */
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

/** A dpr-1 2D canvas that follows its parent's size. Returns the size ref. */
function fitCanvas(c: HTMLCanvasElement, onSize?: (w: number, h: number) => void) {
  const size = { w: 1, h: 1 };
  const box = c.parentElement ?? c;
  const resize = () => {
    const r = box.getBoundingClientRect();
    size.w = Math.max(1, Math.round(r.width));
    size.h = Math.max(1, Math.round(r.height));
    c.width = size.w;
    c.height = size.h;
    onSize?.(size.w, size.h);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(box);
  return { size, stop: () => ro.disconnect() };
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

/* ───────────────────────── U238 · Fluid particle trail ───────────────────────── */
type Part = { x: number; y: number; vx: number; vy: number; life: number; max: number; hue: number; s: number };
function U238() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const sim = useRef<{ ps: Part[]; last: { x: number; y: number } | null; ctx: CanvasRenderingContext2D | null; size: { w: number; h: number } }>({
    ps: [],
    last: null,
    ctx: null,
    size: { w: 1, h: 1 },
  });
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let fit: { stop: () => void } | null = null;
    const stop = whenNear(c, () => {
      const f = fitCanvas(c);
      fit = f;
      sim.current.size = f.size;
      sim.current.ctx = c.getContext("2d");
    });
    return () => {
      stop();
      fit?.stop();
      sim.current.ctx = null;
      sim.current.ps = [];
    };
  }, []);
  usePointer(
    root,
    dot,
    (t, el) => {
      // a looping scripted drag: a slow loop-de-loop across the stage, pressed for most of it (denser stream)
      const w = el.clientWidth;
      const h = el.clientHeight;
      const k = (t % 4.2) / 4.2;
      const a = k * Math.PI * 2;
      const x = w * (0.5 + 0.36 * Math.sin(a) + 0.06 * Math.sin(a * 3));
      const y = h * (0.52 + 0.26 * Math.sin(a * 2) * Math.cos(a * 0.5));
      return { x, y, inside: true, down: k > 0.08 && k < 0.82 };
    },
    (p, _el, _fake, dt) => {
      const S = sim.current;
      const ctx = S.ctx;
      if (!ctx || !root.current) return;
      const { w, h } = S.size;
      if (p.inside) {
        const L = S.last ?? { x: p.x, y: p.y };
        const dx = p.x - L.x;
        const dy = p.y - L.y;
        const n = Math.min(14, (p.down ? 5 : 2) + Math.floor(Math.hypot(dx, dy) / 6));
        for (let i = 0; i < n && S.ps.length < 1400; i++) {
          const f = i / n;
          const max = 0.9 + Math.random() * 1.1;
          S.ps.push({
            x: L.x + dx * f + (Math.random() - 0.5) * 6,
            y: L.y + dy * f + (Math.random() - 0.5) * 6,
            vx: dx * 9 * (0.4 + Math.random() * 0.8) + (Math.random() - 0.5) * 60,
            vy: dy * 9 * (0.4 + Math.random() * 0.8) + (Math.random() - 0.5) * 60,
            life: max,
            max,
            hue: 190 + Math.random() * 120,
            s: (p.down ? 2.4 : 1.6) + Math.random() * 2.6,
          });
        }
        S.last = { x: p.x, y: p.y };
      } else S.last = null;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const drag = Math.pow(0.12, dt);
      const tm = performance.now() / 1000;
      const next: Part[] = [];
      for (const q of S.ps) {
        q.life -= dt;
        if (q.life <= 0) continue;
        // curl: rotate velocity by a slowly varying field, so the stream swirls instead of flying straight
        const ang = Math.sin(q.x * 0.008 + tm) * Math.cos(q.y * 0.009 - tm * 0.7) * 2.2 * dt;
        const cs = Math.cos(ang);
        const sn = Math.sin(ang);
        const vx = q.vx * cs - q.vy * sn;
        const vy = q.vx * sn + q.vy * cs;
        q.vx = vx * drag;
        q.vy = vy * drag - 14 * dt;
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        const a = q.life / q.max;
        ctx.fillStyle = `hsla(${q.hue},90%,${55 + a * 20}%,${(a * 0.55).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.s * (0.5 + a), 0, Math.PI * 2);
        ctx.fill();
        next.push(q);
      }
      S.ps = next;
    },
  );
  return (
    <Stage r={root} g1="rgba(110,120,255,.55)" g2="rgba(255,110,200,.24)">
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <Eyebrow>Studio sessions · from ₹2,400</Eyebrow>
        <h3 className="mt-5 text-[clamp(56px,7.4vw,124px)] leading-[0.95] tracking-[-0.03em] text-white/90" style={{ fontFamily: F.fr, fontWeight: 400 }}>
          Move like <em style={{ fontFamily: F.is }}>water</em>
        </h3>
        <p className="mt-6 text-[16px] text-white/55" style={{ fontFamily: F.mr }}>
          Drag anywhere and the light follows.
        </p>
      </div>
      <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U239 · Caret cursor adapts to text ───────────────────────── */
function U239() {
  const root = useRef<HTMLDivElement>(null);
  const cur = useRef<HTMLDivElement>(null);
  const st = useRef({ x: 0, y: 0, w: 16, h: 16, r: 8 });
  usePointer(
    root,
    null,
    (t, el) => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const a = t * 0.62;
      return { x: w * (0.5 + 0.4 * Math.sin(a)), y: h * (0.5 + 0.34 * Math.sin(a * 2 + 0.4)), inside: true, down: false };
    },
    (p, el, _fake, dt) => {
      const c = cur.current;
      if (!c || !root.current) return;
      let tw = 16;
      let th = 16;
      let tr = 8;
      if (p.inside) {
        for (const n of all(el, "[data-u239]")) {
          if (inBox(rel(n, el), p.x, p.y, 2)) {
            const lh = parseFloat(getComputedStyle(n).lineHeight) || 20;
            tw = Math.max(3, Math.round(lh * 0.045));
            th = lh * 0.92;
            tr = 2;
            break;
          }
        }
      }
      const S = st.current;
      const k = 1 - Math.pow(0.0005, dt);
      const kp = 1 - Math.pow(0.00002, dt);
      S.x += (p.x - S.x) * kp;
      S.y += (p.y - S.y) * kp;
      S.w += (tw - S.w) * k;
      S.h += (th - S.h) * k;
      S.r += (tr - S.r) * k;
      c.style.width = `${S.w.toFixed(1)}px`;
      c.style.height = `${S.h.toFixed(1)}px`;
      c.style.borderRadius = `${S.r.toFixed(1)}px`;
      c.style.opacity = p.inside ? "1" : "0";
      c.style.transform = `translate3d(${(S.x - S.w / 2).toFixed(1)}px,${(S.y - S.h / 2).toFixed(1)}px,0)`;
    },
  );
  return (
    <Stage r={root} g1="rgba(255,209,102,.5)" g2="rgba(79,141,255,.24)" className="u239-stage">
      <div className="grid h-full w-full grid-cols-[1.2fr_1fr] items-center gap-12 px-[7%]">
        <div>
          <p data-u239 className="inline-block text-[14px] uppercase leading-[20px] tracking-[0.22em] text-white/55" style={{ fontFamily: F.sg }}>
            Journal · Issue 14
          </p>
          <h3 data-u239 className="mt-4 text-[clamp(52px,6.2vw,104px)] leading-[0.98] tracking-[-0.03em]" style={{ fontFamily: F.fr, fontWeight: 400 }}>
            Slow mornings
          </h3>
          <p data-u239 className="mt-6 max-w-[40ch] text-[19px] leading-[30px] text-white/70" style={{ fontFamily: F.mr }}>
            A field guide to the first hour: hand-ground coffee, a window seat and a notebook that stays offline.
          </p>
          <p data-u239 className="mt-6 inline-block text-[30px] leading-[38px] text-[#ffd166]" style={{ fontFamily: F.is }}>
            ₹480 per copy
          </p>
        </div>
        <div className="h-[min(60vh,440px)] overflow-hidden rounded-[22px] border border-white/10">
          <Img i={3} w={700} h={800} />
        </div>
      </div>
      <div ref={cur} className="u239-cur" style={{ width: 16, height: 16, borderRadius: 8, opacity: 0 }} aria-hidden />
    </Stage>
  );
}

/* ───────────────────────── U240 · Spotlight product tour ───────────────────────── */
const U240_STEPS = [
  { t: "Browse the range", d: "Every roast in one place." },
  { t: "See it up close", d: "Tap the photo to zoom." },
  { t: "Pick a grind", d: "Whole bean to espresso fine." },
  { t: "Add to bag", d: "Ships in 24 hours." },
];
function U240() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const hole = el.querySelector<HTMLElement>(".u240-hole")!;
    const tip = el.querySelector<HTMLElement>(".u240-tip")!;
    const tt = tip.querySelector<HTMLElement>(".u240-tt")!;
    const td = tip.querySelector<HTMLElement>(".u240-td")!;
    const tn = tip.querySelector<HTMLElement>(".u240-tn")!;
    const targets = all(el, "[data-u240]");
    const place = (k: number, dur: number) => {
      if (!root.current) return;
      const b = rel(targets[k], el);
      const pad = 12;
      gsap.to(hole, { x: b.l - pad, y: b.t - pad, width: b.w + pad * 2, height: b.h + pad * 2, duration: dur, ease: "power2.inOut", overwrite: "auto" });
      const W = el.clientWidth;
      const tw = 280;
      const right = b.l + b.w + pad + 24 + tw < W;
      const x = right ? b.l + b.w + pad + 24 : Math.max(16, b.l - pad - 24 - tw);
      const y = clamp(b.t + b.h / 2 - 60, 16, el.clientHeight - 140);
      gsap.to(tip, { x, y, duration: dur, ease: "power2.inOut", overwrite: "auto" });
      gsap.fromTo([tt, td], { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, delay: dur * 0.55, ease: "power2.out" });
      gsap.delayedCall(dur * 0.5, () => {
        if (!root.current) return;
        tt.textContent = U240_STEPS[k].t;
        td.textContent = U240_STEPS[k].d;
        tn.textContent = `Step ${k + 1} of ${U240_STEPS.length}`;
      });
    };
    place(0, 0);
    gsap.set([hole, tip], { opacity: 1 });
    const tl = gsap.timeline({ repeat: -1 });
    for (let k = 1; k <= targets.length; k++) {
      const n = k % targets.length;
      tl.to({}, { duration: 0.22 });
      tl.call(() => place(n, 0.75));
      tl.to({}, { duration: 0.75 });
    }
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,209,102,.5)" g2="rgba(79,141,255,.24)">
      <div className="flex h-full w-full flex-col px-[6%] py-[3.5%]">
        <div className="flex items-center justify-between">
          <span className="text-[22px] tracking-[-0.01em]" style={{ fontFamily: F.fr }}>
            Hearth &amp; Bean
          </span>
          <nav data-u240 className="flex gap-7 rounded-full border border-white/12 px-6 py-2.5 text-[14px] text-white/75" style={{ fontFamily: F.sg }}>
            <span>Roasts</span>
            <span>Gear</span>
            <span>Subscriptions</span>
            <span>Journal</span>
          </nav>
          <span className="text-[14px] text-white/60" style={{ fontFamily: F.sg }}>
            Bag (0)
          </span>
        </div>
        <div className="mt-[3%] grid flex-1 grid-cols-[1fr_1fr] items-center gap-[6%]">
          <div data-u240 className="h-[min(48vh,360px)] overflow-hidden rounded-[22px] border border-white/10">
            <Img i={3} w={800} h={700} />
          </div>
          <div>
            <Eyebrow>Single origin · Chikmagalur</Eyebrow>
            <h3 className="mt-3 text-[clamp(38px,4vw,62px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 400 }}>
              Ember Hill roast
            </h3>
            <p className="mt-3 text-[22px] text-white/80" style={{ fontFamily: F.sg }}>
              ₹740 · 250 g
            </p>
            <div data-u240 className="mt-6 inline-flex gap-2">
              {["Whole", "French", "Filter", "Espresso"].map((g, i) => (
                <span key={g} className={`rounded-full border px-4 py-2 text-[14px] ${i === 2 ? "border-[#ffd166] text-[#ffd166]" : "border-white/15 text-white/70"}`} style={{ fontFamily: F.mr }}>
                  {g}
                </span>
              ))}
            </div>
            <div className="mt-7">
              <span data-u240 className="inline-block rounded-full bg-[#ffd166] px-8 py-4 text-[16px] font-[700] text-[#17110a]" style={{ fontFamily: F.sg }}>
                Add to bag
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="u240-hole" aria-hidden>
        <span className="u240-ring" />
      </div>
      <div className="u240-tip w-[280px] rounded-[16px] bg-[#f4f1ea] p-5 text-[#14110c] shadow-[0_20px_40px_rgba(0,0,0,.45)]" aria-hidden>
        <p className="u240-tn text-[12px] uppercase tracking-[0.18em] text-black/50" style={{ fontFamily: F.sg }}>
          Step 1 of 4
        </p>
        <p className="u240-tt mt-2 text-[22px] leading-[1.1]" style={{ fontFamily: F.fr }}>
          {U240_STEPS[0].t}
        </p>
        <p className="u240-td mt-1 text-[14px] text-black/60" style={{ fontFamily: F.mr }}>
          {U240_STEPS[0].d}
        </p>
      </div>
    </Stage>
  );
}

/* ───────────────────────── U241 · Cell ripple on click ───────────────────────── */
const U241_C = 26;
const U241_R = 13;
const U241_PICKS = [176, 60, 290, 133, 21, 244, 99, 318];
function U241() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const ripple = (idx: number) => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const cells = all(el, ".u241-c");
    gsap.to(cells, {
      keyframes: [
        { scale: 0.72, backgroundColor: "rgba(120,255,214,.85)", borderColor: "rgba(190,255,236,.9)", duration: 0.14, ease: "power2.out" },
        { scale: 1, backgroundColor: "rgba(255,255,255,.025)", borderColor: "rgba(255,255,255,.06)", duration: 0.6, ease: "power2.inOut" },
      ],
      stagger: { grid: [U241_R, U241_C], from: idx, each: 0.034 },
      overwrite: "auto",
    });
  };
  usePlay(root, (el) => {
    const d = dot.current;
    const cells = all(el, ".u241-c");
    const tl = gsap.timeline({ repeat: -1 });
    U241_PICKS.forEach((idx) => {
      tl.call(() => root.current && goDot(d, el, cells[idx], 0.5, idle()));
      tl.to({}, { duration: 0.5 });
      tl.call(() => {
        if (!root.current || !idle()) return;
        d?.classList.add("press");
        ripple(idx);
      });
      tl.to({}, { duration: 0.2 });
      tl.call(() => root.current && d?.classList.remove("press"));
      tl.to({}, { duration: 0.28 });
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(94,255,214,.5)" g2="rgba(79,141,255,.24)">
      <div className="absolute inset-[3%] grid gap-[5px]" style={{ gridTemplateColumns: `repeat(${U241_C},1fr)`, gridTemplateRows: `repeat(${U241_R},1fr)` }}>
        {Array.from({ length: U241_C * U241_R }, (_, i) => (
          <div key={i} className="u241-c" onPointerDown={() => ripple(i)} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="rounded-[26px] bg-[#0a0d16]/80 px-12 py-9 shadow-[0_0_60px_30px_rgba(10,13,22,.8)]">
          <Eyebrow>Membership · ₹1,999 a year</Eyebrow>
          <h3 className="mt-3 text-[clamp(44px,5vw,84px)] leading-[0.98] tracking-[-0.03em]" style={{ fontFamily: F.sy, fontWeight: 700 }}>
            Make waves
          </h3>
          <p className="mt-3 text-[15px] text-white/55" style={{ fontFamily: F.mr }}>
            Tap any square.
          </p>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U242 · Cybernetic hover scan ───────────────────────── */
const U242_T = [
  { n: "Ira Valen", r: "Creative lead", id: "07", i: 0 },
  { n: "Teo Marlow", r: "Motion design", id: "12", i: 1 },
  { n: "Noor Haldi", r: "Engineering", id: "21", i: 2 },
];
function U242() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  usePointer(
    root,
    dot,
    (t, el) => {
      const cards = all(el, ".u242-card").map((c) => mid(rel(c, el)));
      if (!cards.length) return { x: 0, y: 0, inside: false, down: false };
      const pts: [number, number][] = [...cards, [el.clientWidth * 0.5, el.clientHeight * 0.92]];
      const [x, y] = stepPath(t, pts, 1.0, 0.56);
      return { x, y, inside: true, down: false };
    },
    (p, el) => {
      if (!root.current) return;
      all(el, ".u242-card").forEach((n) => n.classList.toggle("on", p.inside && inBox(rel(n, el), p.x, p.y, 4)));
    },
  );
  return (
    <Stage r={root} g1="rgba(94,255,214,.5)" g2="rgba(140,110,255,.24)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>The crew</Eyebrow>
        <h3 className="mb-8 mt-2 text-[clamp(32px,3.2vw,50px)] tracking-[-0.02em]" style={{ fontFamily: F.sg, fontWeight: 600 }}>
          People behind the pixels
        </h3>
        <div className="flex gap-7">
          {U242_T.map((m) => (
            <div key={m.n} className="u242-card h-[min(46vh,380px)] w-[min(22vw,280px)] rounded-[20px] border border-white/10 bg-[#111624]">
              <Img i={m.i} w={560} h={760} />
              <div className="u242-hud" aria-hidden>
                <div className="u242-tint" />
                <div className="u242-grid" />
                <div className="u242-scan" />
                <span className="u242-br a" />
                <span className="u242-br b" />
                <span className="u242-br c" />
                <span className="u242-br d" />
                <div className="u242-read">
                  ID-{m.id} <span className="u242-blink">▮</span>
                  <br />
                  SYNC 98.4%
                  <span className="u242-bar" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-4 pt-12">
                <p className="text-[18px] font-[600]" style={{ fontFamily: F.sg }}>
                  {m.n}
                </p>
                <p className="text-[13px] uppercase tracking-[0.16em] text-white/60" style={{ fontFamily: F.mr }}>
                  {m.r}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U243 · Swatch book fan ───────────────────────── */
const U243_S = [
  { n: "Saffron", c: "#f2a33a", k: "SW-112" },
  { n: "Terracotta", c: "#c8603f", k: "SW-204" },
  { n: "Rosewood", c: "#9c3d54", k: "SW-318" },
  { n: "Indigo", c: "#34418f", k: "SW-421" },
  { n: "Lagoon", c: "#1f8a8a", k: "SW-507" },
  { n: "Moss", c: "#5f7f3a", k: "SW-615" },
  { n: "Sand", c: "#d9c39a", k: "SW-702" },
  { n: "Chalk", c: "#eeeae0", k: "SW-809" },
];
function U243() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const state = useRef<{ open: boolean; sel: number }>({ open: false, sel: -1 });
  const N = U243_S.length;
  const angles = (open: boolean, sel: number) =>
    U243_S.map((_, j) => {
      if (!open) return 0;
      if (sel < 0) return -48 + (j * 96) / (N - 1);
      if (j === sel) return 0;
      return j < sel ? -16 - (sel - 1 - j) * 11 : 16 + (j - sel - 1) * 11;
    });
  const apply = (dur = 0.7) => {
    const el = root.current;
    if (!el) return;
    const S = state.current;
    const a = angles(S.open, S.sel);
    all(el, ".u243-s").forEach((s, j) => {
      gsap.set(s, { zIndex: j === S.sel ? 20 : j < S.sel || S.sel < 0 ? j : N - j });
      gsap.to(s, { rotation: a[j], y: j === S.sel ? -22 : 0, duration: dur, delay: S.sel < 0 && S.open ? j * 0.035 : 0, ease: "power3.inOut", overwrite: "auto" });
    });
    const lab = el.querySelector<HTMLElement>(".u243-l");
    if (lab) lab.textContent = S.sel >= 0 ? `${U243_S[S.sel].n} · ${U243_S[S.sel].k}` : S.open ? "Pick a colour" : "Tap the pin to open";
  };
  const clickSwatch = (j: number) => {
    const S = state.current;
    if (!S.open) S.open = true;
    else S.sel = S.sel === j ? -1 : j;
    apply();
  };
  const clickPin = () => {
    const S = state.current;
    S.open = !S.open;
    S.sel = -1;
    apply();
  };
  usePlay(root, (el) => {
    const d = dot.current;
    const tips = all(el, ".u243-tip");
    const pin = el.querySelector(".u243-pin");
    const tl = gsap.timeline({ repeat: -1 });
    // glide that re-measures the target every frame, so the ring lands on a swatch even while the fan is still moving
    const go = (target: () => Element | null | undefined) =>
      tl.call(() => {
        if (!root.current || !d) return;
        const tg = target();
        if (!tg) return;
        d.style.opacity = idle() ? "1" : "0";
        const x0 = Number(gsap.getProperty(d, "x")) || 0;
        const y0 = Number(gsap.getProperty(d, "y")) || 0;
        const o = { k: 0 };
        gsap.to(o, {
          k: 1,
          duration: 0.45,
          ease: "power2.inOut",
          onUpdate: () => {
            if (!root.current) return;
            const [x, y] = mid(rel(tg, el));
            gsap.set(d, { x: x0 + (x - x0) * o.k, y: y0 + (y - y0) * o.k });
          },
        });
      });
    const press = (fn: () => void) =>
      tl.call(() => {
        if (!root.current || !idle()) return;
        d?.classList.add("press");
        fn();
        gsap.delayedCall(0.16, () => {
          if (!root.current) return;
          d?.classList.remove("press");
        });
      });
    go(() => pin);
    tl.to({}, { duration: 0.45 });
    press(clickPin);
    tl.to({}, { duration: 0.45 });
    [2, 5, 4].forEach((j) => {
      go(() => tips[j]);
      tl.to({}, { duration: 0.45 });
      press(() => clickSwatch(j));
      tl.to({}, { duration: 0.45 });
    });
    go(() => pin);
    tl.to({}, { duration: 0.45 });
    press(() => {
      state.current = { open: false, sel: -1 };
      apply();
    });
    tl.to({}, { duration: 0.45 });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(242,163,58,.5)" g2="rgba(52,65,143,.26)">
      <div className="grid h-full w-full grid-cols-[1fr_1fr] items-center px-[8%]">
        <div>
          <Eyebrow>Lime-wash paints · 1 L</Eyebrow>
          <h3 className="mt-3 text-[clamp(42px,4.6vw,74px)] leading-[0.98] tracking-[-0.03em]" style={{ fontFamily: F.fr, fontWeight: 400 }}>
            Earth tones, <em style={{ fontFamily: F.is }}>fanned out</em>
          </h3>
          <p className="u243-l mt-6 text-[20px] text-white/75" style={{ fontFamily: F.sg }}>
            Tap the pin to open
          </p>
          <p className="mt-2 text-[16px] text-white/50" style={{ fontFamily: F.mr }}>
            ₹1,350 per tin
          </p>
        </div>
        <div className="relative h-full">
          <div className="absolute left-1/2 top-[50%] h-[min(56vh,400px)] w-[108px]" style={{ marginLeft: -54, marginTop: "calc(min(56vh,400px) / -2 + 40px)" }}>
            {U243_S.map((s, j) => (
              <button
                key={s.n}
                type="button"
                className="u243-s absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[14px] border border-black/20 p-3 text-left shadow-[0_10px_30px_rgba(0,0,0,.4)]"
                style={{ background: `linear-gradient(180deg,${s.c} 0 62%,#f6f3ec 62%)`, transformOrigin: "50% 90%", zIndex: j }}
                onClick={() => clickSwatch(j)}
                aria-label={s.n}
              >
                <span className="u243-tip mt-6 block h-2 w-2 self-center" aria-hidden />
                <span className="block text-[#17140f]">
                  <span className="block text-[13px] font-[700]" style={{ fontFamily: F.sg }}>
                    {s.n}
                  </span>
                  <span className="block text-[12px] text-black/55" style={{ fontFamily: F.mr }}>
                    {s.k}
                  </span>
                  <span className="mt-6 block h-5" />
                </span>
              </button>
            ))}
            <button
              type="button"
              className="u243-pin absolute left-1/2 top-[90%] z-30 h-6 w-6 rounded-full border-[3px] border-[#2a2a2a] bg-[#d8d8d8] shadow-[0_2px_8px_rgba(0,0,0,.5)]"
              style={{ marginLeft: -12, marginTop: -12 }}
              onClick={clickPin}
              aria-label="Open swatches"
            />
          </div>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U244 · Electric border ───────────────────────── */
function U244() {
  const root = useRef<HTMLDivElement>(null);
  const surge = useRef({ v: 4 });
  usePlay(root, () => {
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(surge.current, { v: 15, duration: 0.5, ease: "power2.out" })
      .to(surge.current, { v: 5, duration: 0.9, ease: "power1.inOut" })
      .to(surge.current, { v: 9, duration: 0.35, ease: "power1.inOut" })
      .to(surge.current, { v: 4, duration: 0.6, ease: "power1.inOut" });
    return tl;
  });
  useTicker(root, (t) => {
    const el = root.current;
    if (!el) return;
    const off = el.querySelector("#u244-off");
    const dm = el.querySelector("#u244-dm");
    const sparks = all(el, ".u244-spark");
    off?.setAttribute("dx", ((t * 70) % 400).toFixed(1));
    off?.setAttribute("dy", ((t * -45) % 400).toFixed(1));
    dm?.setAttribute("scale", (surge.current.v + Math.random() * 3).toFixed(2));
    sparks.forEach((s, i) => s.setAttribute("stroke-dashoffset", (-(t * (520 + i * 180)) % 1880).toFixed(1)));
  });
  return (
    <Stage r={root} g1="rgba(120,200,255,.52)" g2="rgba(160,110,255,.24)">
      <div className="flex h-full w-full items-center justify-center gap-[7%]">
        <div className="relative h-[460px] w-[380px]">
          <svg className="pointer-events-none absolute -inset-[24px] h-[508px] w-[428px]" viewBox="0 0 428 508" aria-hidden>
            <defs>
              <filter id="u244-f" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
                <feTurbulence type="turbulence" baseFrequency="0.022" numOctaves="1" seed="4" result="n" />
                <feOffset id="u244-off" in="n" dx="0" dy="0" result="no" />
                <feDisplacementMap id="u244-dm" in="SourceGraphic" in2="no" scale="6" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <g filter="url(#u244-f)">
              <rect x="24" y="24" width="380" height="460" rx="30" fill="none" stroke="rgba(120,200,255,.22)" strokeWidth="14" />
              <rect x="24" y="24" width="380" height="460" rx="30" fill="none" stroke="#9fdcff" strokeWidth="2" />
              <rect className="u244-spark" x="24" y="24" width="380" height="460" rx="30" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeDasharray="70 870" />
              <rect className="u244-spark" x="24" y="24" width="380" height="460" rx="30" fill="none" stroke="#c9b6ff" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40 900" />
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col justify-between rounded-[30px] bg-[#0d1220]/90 p-9">
            <div>
              <Eyebrow>Membership</Eyebrow>
              <h3 className="mt-3 text-[46px] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.sy, fontWeight: 700 }}>
                Volt Pro
              </h3>
              <p className="mt-4 text-[16px] leading-[1.6] text-white/60" style={{ fontFamily: F.mr }}>
                Priority charging slots, free valet and a lounge at every hub.
              </p>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-[34px]" style={{ fontFamily: F.sg, fontWeight: 600 }}>
                ₹2,499<span className="text-[15px] text-white/55">/yr</span>
              </p>
              <span className="rounded-full bg-[#9fdcff] px-5 py-2.5 text-[14px] font-[700] text-[#06121c]" style={{ fontFamily: F.sg }}>
                Join
              </span>
            </div>
          </div>
        </div>
        <div className="max-w-[300px]">
          <Eyebrow>Charging network</Eyebrow>
          <p className="mt-3 text-[clamp(30px,3vw,46px)] leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: F.fr }}>
            Live current, <em style={{ fontFamily: F.is }}>on the edge</em>
          </p>
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── U245 · Circular scroll progress (scrub) ───────────────────────── */
const U245_R = 128;
const U245_L = 2 * Math.PI * U245_R;
function U245() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const panel = useContext(ScrubRoot);
  const drag = useRef(false);
  const knobAt = (p: number) => {
    const a = p * Math.PI * 2 - Math.PI / 2;
    return [160 + U245_R * Math.cos(a), 160 + U245_R * Math.sin(a)];
  };
  useScrub(
    root,
    (p) => {
      const el = root.current;
      if (!el) return;
      const arc = el.querySelector<SVGCircleElement>(".u245-arc");
      const knob = el.querySelector<SVGCircleElement>(".u245-knob");
      const num = el.querySelector<HTMLElement>(".u245-n");
      const page = el.querySelector<HTMLElement>(".u245-page");
      const win = el.querySelector<HTMLElement>(".u245-win");
      arc?.setAttribute("stroke-dashoffset", (U245_L * (1 - p)).toFixed(2));
      const [kx, ky] = knobAt(p);
      knob?.setAttribute("cx", kx.toFixed(2));
      knob?.setAttribute("cy", ky.toFixed(2));
      if (num) num.textContent = String(Math.round(p * 100));
      if (page && win) page.style.transform = `translate3d(0,${(-p * Math.max(0, page.offsetHeight - win.clientHeight)).toFixed(1)}px,0)`;
      // the fake pointer holds the knob, as if dragging it (the scroll drives it)
      const d = dot.current;
      const svg = el.querySelector<SVGSVGElement>(".u245-svg");
      if (d && svg && !drag.current) {
        const b = rel(svg, el);
        const s = b.w / 320;
        d.style.opacity = p > 0.002 && p < 0.998 ? "1" : "0";
        d.classList.add("press");
        d.style.transform = `translate3d(${(b.l + kx * s).toFixed(1)}px,${(b.t + ky * s).toFixed(1)}px,0)`;
      }
    },
    { finalValue: 1 },
  );
  const onDrag = (e: RPointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    let a = Math.atan2(dy, dx) + Math.PI / 2;
    if (a < 0) a += Math.PI * 2;
    const p = clamp(a / (Math.PI * 2), 0, 1);
    const box = panel?.current;
    if (!box) return;
    const top = box.getBoundingClientRect().top + window.scrollY;
    const y = top + p * Math.max(0, box.offsetHeight - window.innerHeight);
    const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  };
  return (
    <Stage r={root} g1="rgba(255,143,122,.5)" g2="rgba(79,141,255,.24)">
      <div className="grid h-full w-full grid-cols-[1.15fr_1fr] items-center gap-[6%] px-[7%]">
        <div className="u245-win relative h-[min(58vh,430px)] overflow-hidden rounded-[22px] border border-white/10 bg-[#0f1422]">
          <div className="u245-page px-9 py-8">
            <Eyebrow>Long read · 9 min</Eyebrow>
            <h3 className="mt-3 text-[clamp(32px,3.2vw,48px)] leading-[1.02] tracking-[-0.02em]" style={{ fontFamily: F.fr }}>
              The slow craft of indigo
            </h3>
            {[0, 1, 2].map((k) => (
              <div key={k} className="mt-7">
                <div className="h-[170px] overflow-hidden rounded-[14px]">
                  <Img i={k + 1} w={900} h={420} />
                </div>
                {[92, 100, 86, 97, 64].map((w, i) => (
                  <div key={i} className="mt-3 h-[10px] rounded-full bg-white/12" style={{ width: `${w}%` }} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative h-[min(44vh,320px)] w-[min(44vh,320px)]">
            <svg
              className="u245-svg absolute inset-0 h-full w-full cursor-grab touch-none"
              viewBox="0 0 320 320"
              onPointerDown={(e) => {
                drag.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                dot.current?.style.setProperty("opacity", "0");
                onDrag(e);
              }}
              onPointerMove={onDrag}
              onPointerUp={() => (drag.current = false)}
              onPointerCancel={() => (drag.current = false)}
              aria-label="Scroll progress"
            >
              <g className="u245-spin">
                <circle cx="160" cy="160" r="152" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1.5" strokeDasharray="2 10" />
              </g>
              <circle cx="160" cy="160" r={U245_R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="14" />
              <circle
                className="u245-arc"
                cx="160"
                cy="160"
                r={U245_R}
                fill="none"
                stroke="#ff8f7a"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={U245_L.toFixed(2)}
                strokeDashoffset="0"
                transform="rotate(-90 160 160)"
              />
              <circle className="u245-knob" cx="160" cy={160 - U245_R} r="13" fill="#fff" stroke="#ff8f7a" strokeWidth="4" />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[clamp(56px,6vw,84px)] leading-none tracking-[-0.04em]" style={{ fontFamily: F.sg, fontWeight: 600 }}>
                <span className="u245-n">100</span>
                <span className="text-[0.4em] text-white/55">%</span>
              </p>
              <p className="mt-2 text-[13px] uppercase tracking-[0.2em] text-white/50" style={{ fontFamily: F.mr }}>
                read · drag to jump
              </p>
            </div>
          </div>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U246 · Mood-morph emoji grid ───────────────────────── */
const U246_COLS = 8;
const U246_ROWS = 4;
const U246_SAD_M = "M-17 15 C-10 7 10 7 17 15";
const U246_HAPPY_M = "M-20 6 C-12 22 12 22 20 6 C10 13 -10 13 -20 6Z";
const U246_SAD_EL = "M-17 -10 L-7 -6";
const U246_HAPPY_EL = "M-17 -5 Q-12 -13 -7 -5";
const U246_SAD_ER = "M7 -6 L17 -10";
const U246_HAPPY_ER = "M7 -5 Q12 -13 17 -5";
function U246() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const tls = useRef<gsap.core.Timeline[]>([]);
  const amt = useRef<number[]>([]);
  const centres = useRef<{ c: [number, number][]; at: number }>({ c: [], at: -1 });
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let dead = false;
    const ctx = gsap.context(() => {}, el);
    loadPlugin("MorphSVGPlugin")
      .then(() => {
        if (dead || !root.current) return;
        ctx.add(() => {
          tls.current = all(el, ".u246-f").map((f) => {
            const tl = gsap.timeline({ paused: true, defaults: { ease: "none", duration: 1 } });
            tl.to(f.querySelector(".u246-m"), { morphSVG: U246_HAPPY_M }, 0)
              .to(f.querySelector(".u246-el"), { morphSVG: U246_HAPPY_EL }, 0)
              .to(f.querySelector(".u246-er"), { morphSVG: U246_HAPPY_ER }, 0)
              .to(f.querySelector(".u246-bg"), { attr: { fill: "#ffd166" } }, 0)
              .to(f.querySelector(".u246-m"), { attr: { fill: "#5a2a14", stroke: "#5a2a14" } }, 0);
            return tl;
          });
        });
      })
      .catch(() => {});
    return () => {
      dead = true;
      ctx.revert();
      tls.current = [];
    };
  }, []);
  usePointer(
    root,
    dot,
    (t, el) => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const a = t * 0.7;
      return { x: w * (0.5 + 0.36 * Math.sin(a)), y: h * (0.56 + 0.22 * Math.sin(a * 2)), inside: true, down: false };
    },
    (p, el, _fake, dt) => {
      if (!root.current) return;
      const faces = all(el, ".u246-w");
      const C = centres.current;
      if (C.at < 0 || ++C.at > 40 || C.c.length !== faces.length) {
        C.c = faces.map((f) => mid(rel(f, el)));
        C.at = 0;
      }
      const k = 1 - Math.pow(0.002, dt);
      faces.forEach((f, i) => {
        const [cx, cy] = C.c[i];
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.hypot(dx, dy);
        const fall = p.inside ? Math.max(0, 1 - d / 260) : 0;
        const target = Math.pow(fall, 1.6);
        const prev = amt.current[i] ?? 0;
        const v = prev + (target - prev) * k;
        amt.current[i] = v;
        const ry = clamp(dx / 8, -28, 28) * Math.min(1, fall * 1.8);
        const rx = clamp(-dy / 8, -28, 28) * Math.min(1, fall * 1.8);
        f.style.transform = `perspective(500px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${(1 + v * 0.12).toFixed(3)})`;
        tls.current[i]?.progress(v);
      });
    },
  );
  return (
    <Stage r={root} g1="rgba(255,209,102,.5)" g2="rgba(79,141,255,.24)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Customer care</Eyebrow>
        <h3 className="mb-8 mt-2 text-[clamp(32px,3.4vw,52px)] tracking-[-0.02em]" style={{ fontFamily: F.fr }}>
          How was your <em style={{ fontFamily: F.is }}>delivery?</em>
        </h3>
        <div className="grid gap-x-7 gap-y-5" style={{ gridTemplateColumns: `repeat(${U246_COLS},minmax(0,1fr))` }}>
          {Array.from({ length: U246_COLS * U246_ROWS }, (_, i) => (
            <div key={i} className="u246-w h-[min(9vh,78px)] w-[min(9vh,78px)] will-change-transform">
              <svg className="u246-f h-full w-full" viewBox="-40 -40 80 80" aria-hidden>
                <circle className="u246-bg" r="36" fill="#7f8db3" />
                <path className="u246-el" d={U246_SAD_EL} fill="none" stroke="#1c2134" strokeWidth="5" strokeLinecap="round" />
                <path className="u246-er" d={U246_SAD_ER} fill="none" stroke="#1c2134" strokeWidth="5" strokeLinecap="round" />
                <path className="u246-m" d={U246_SAD_M} fill="rgba(90,42,20,0)" stroke="#1c2134" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U247 · Vapor digit countdown ───────────────────────── */
function U247() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const fb = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let dead = false;
    let fit: { size: { w: number; h: number }; stop: () => void } | null = null;
    let on = false;
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting), { rootMargin: "80px" });
    io.observe(c);
    // forming set: start, target, delay; leaving set: position, velocity, life
    let fx = new Float32Array(0), fy = new Float32Array(0), sx = new Float32Array(0), sy = new Float32Array(0), tx = new Float32Array(0), ty = new Float32Array(0), dl = new Float32Array(0);
    let lx = new Float32Array(0), ly = new Float32Array(0), lvx = new Float32Array(0), lvy = new Float32Array(0), ll = new Float32Array(0);
    let digit = 9;
    let tickAt = 0;
    const PERIOD = 1.15;
    const off = document.createElement("canvas");
    const sample = (d: number, w: number, h: number) => {
      off.width = w;
      off.height = h;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      o.clearRect(0, 0, w, h);
      o.fillStyle = "#fff";
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.font = `800 ${Math.round(h * 0.86)}px ${F.sy}`;
      o.fillText(String(d), w / 2, h * 0.53);
      const data = o.getImageData(0, 0, w, h).data;
      const pts: number[] = [];
      const step = 4;
      for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (data[(y * w + x) * 4 + 3] > 140) pts.push(x + Math.random() * 2, y + Math.random() * 2);
      let n = pts.length / 2;
      while (n > 2200) {
        const i = Math.floor(Math.random() * n);
        pts[i * 2] = pts[(n - 1) * 2];
        pts[i * 2 + 1] = pts[(n - 1) * 2 + 1];
        n--;
      }
      return pts.slice(0, n * 2);
    };
    const next = (now: number) => {
      if (!fit) return;
      const { w, h } = fit.size;
      // current digit → vapour
      const n0 = fx.length;
      lx = Float32Array.from(fx);
      ly = Float32Array.from(fy);
      lvx = new Float32Array(n0).map(() => 10 + Math.random() * 70);
      lvy = new Float32Array(n0).map(() => -30 - Math.random() * 90);
      ll = new Float32Array(n0).map(() => 0.6 + Math.random() * 0.5);
      // next digit condenses from grains
      digit = digit <= 0 ? 9 : digit - 1;
      const pts = sample(digit, w, h);
      const n = pts.length / 2;
      fx = new Float32Array(n);
      fy = new Float32Array(n);
      sx = new Float32Array(n);
      sy = new Float32Array(n);
      tx = new Float32Array(n);
      ty = new Float32Array(n);
      dl = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        tx[i] = pts[i * 2];
        ty[i] = pts[i * 2 + 1];
        const a = Math.random() * Math.PI * 2;
        const r = 90 + Math.random() * 220;
        sx[i] = tx[i] + Math.cos(a) * r - 60;
        sy[i] = ty[i] + Math.sin(a) * r + 80;
        fx[i] = sx[i];
        fy[i] = sy[i];
        dl[i] = Math.random() * 0.25;
      }
      tickAt = now;
    };
    let ctx: CanvasRenderingContext2D | null = null;
    const stopNear = whenNear(c, () => {
      Promise.resolve(document.fonts?.ready).then(() => {
        if (dead) return;
        fit = fitCanvas(c);
        ctx = c.getContext("2d");
        digit = 10;
        next(performance.now() / 1000);
        if (fb.current) fb.current.style.opacity = "0";
      });
    });
    const tick = (time: number, dtMs: number) => {
      if (!on || !ctx || !fit || !root.current) return;
      const dt = Math.min(0.05, dtMs / 1000);
      if (time - tickAt >= PERIOD) next(time);
      const { w, h } = fit.size;
      const el = time - tickAt;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(205,225,255,.9)";
      for (let i = 0; i < ll.length; i++) {
        if (ll[i] <= 0) continue;
        ll[i] -= dt;
        lvx[i] += Math.sin(ly[i] * 0.03 + time * 2) * 40 * dt;
        lx[i] += lvx[i] * dt;
        ly[i] += lvy[i] * dt;
        ctx.globalAlpha = Math.max(0, ll[i]) * 0.9;
        ctx.fillRect(lx[i], ly[i], 2, 2);
      }
      ctx.fillStyle = "#f4f7ff";
      for (let i = 0; i < fx.length; i++) {
        const k = clamp((el - dl[i]) / 0.6, 0, 1);
        const e = 1 - Math.pow(1 - k, 3);
        const j = 0.6 * Math.sin(time * 6 + i);
        fx[i] = sx[i] + (tx[i] - sx[i]) * e + j;
        fy[i] = sy[i] + (ty[i] - sy[i]) * e;
        ctx.globalAlpha = 0.15 + 0.85 * e;
        ctx.fillRect(fx[i], fy[i], 2.4, 2.4);
      }
      ctx.globalAlpha = 1;
    };
    gsap.ticker.add(tick);
    return () => {
      dead = true;
      stopNear();
      io.disconnect();
      gsap.ticker.remove(tick);
      fit?.stop();
      ctx = null;
    };
  }, []);
  return (
    <Stage r={root} g1="rgba(150,180,255,.5)" g2="rgba(255,122,89,.24)">
      <div className="grid h-full w-full grid-cols-[1fr_1.1fr] items-center px-[8%]">
        <div>
          <Eyebrow>Limited drop · 120 pairs</Eyebrow>
          <h3 className="mt-3 text-[clamp(40px,4.4vw,70px)] leading-[0.98] tracking-[-0.03em]" style={{ fontFamily: F.fr, fontWeight: 400 }}>
            Cloudwalk runner, <em style={{ fontFamily: F.is }}>almost here</em>
          </h3>
          <p className="mt-5 text-[22px] text-white/75" style={{ fontFamily: F.sg }}>
            ₹11,900
          </p>
          <p className="mt-6 text-[13px] uppercase tracking-[0.22em] text-white/50" style={{ fontFamily: F.mr }}>
            Seconds to go
          </p>
        </div>
        <div className="relative h-[min(62vh,460px)]">
          <span ref={fb} className="absolute inset-0 flex items-center justify-center text-[min(54vh,400px)] leading-none text-[#f4f7ff] transition-opacity duration-300" style={{ fontFamily: F.sy, fontWeight: 800 }} aria-hidden>
            9
          </span>
          <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── U248 · Terrain carving cursor ───────────────────────── */
const U248_W = 300;
const U248_H = 170;
function U248() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const T = useRef<{ base: Float32Array; carve: Float32Array; img: ImageData | null; small: HTMLCanvasElement | null; ctx: CanvasRenderingContext2D | null; size: { w: number; h: number } } | null>(null);
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let fit: { stop: () => void } | null = null;
    const stop = whenNear(c, () => {
      // value-noise heightfield, built once near the viewport
      const W = U248_W;
      const H = U248_H;
      const G = 18;
      const lat = new Float32Array((G + 1) * (G + 1) * 4).map(() => Math.random());
      const noise = (x: number, y: number, o: number) => {
        const g = G >> (3 - o);
        const fx = x * g;
        const fy = y * g;
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        const u = fx - ix;
        const v = fy - iy;
        const s = (a: number) => a * a * (3 - 2 * a);
        const at = (i: number, j: number) => lat[((j % (G + 1)) * (G + 1) + (i % (G + 1)) + o * 97) % lat.length];
        const a = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * s(u);
        const b = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * s(u);
        return a + (b - a) * s(v);
      };
      const base = new Float32Array(W * H);
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const nx = x / W;
          const ny = y / H;
          base[y * W + x] = noise(nx, ny, 0) * 0.55 + noise(nx, ny, 1) * 0.3 + noise(nx, ny, 2) * 0.15;
        }
      const small = document.createElement("canvas");
      small.width = W;
      small.height = H;
      const sctx = small.getContext("2d")!;
      const f = fitCanvas(c);
      fit = f;
      T.current = { base, carve: new Float32Array(W * H), img: sctx.createImageData(W, H), small, ctx: c.getContext("2d"), size: f.size };
    });
    return () => {
      stop();
      fit?.stop();
      T.current = null;
    };
  }, []);
  usePointer(
    root,
    dot,
    (t, el) => {
      // scripted drag: press and carve a winding channel left → right, release, glide back over the top
      const w = el.clientWidth;
      const h = el.clientHeight;
      const k = (t % 4) / 4;
      if (k < 0.58) {
        const u = easeIO(k / 0.58);
        return { x: w * (0.1 + 0.8 * u), y: h * (0.55 + 0.2 * Math.sin(u * Math.PI * 2.4)), inside: true, down: k > 0.03 };
      }
      const u = easeIO((k - 0.58) / 0.42);
      return { x: w * (0.9 - 0.8 * u), y: h * (0.55 - 0.32 * Math.sin(u * Math.PI)), inside: true, down: false };
    },
    (p, el, _fake, dt) => {
      const S = T.current;
      if (!S || !S.ctx || !S.img || !S.small || !root.current) return;
      const W = U248_W;
      const H = U248_H;
      const { base, carve } = S;
      const heal = Math.exp(-dt * 0.75);
      for (let i = 0; i < carve.length; i++) carve[i] *= heal;
      if (p.down && p.inside) {
        const gx = (p.x / el.clientWidth) * W;
        const gy = (p.y / el.clientHeight) * H;
        const R = 9;
        for (let y = Math.max(0, Math.floor(gy - R)); y < Math.min(H, gy + R); y++)
          for (let x = Math.max(0, Math.floor(gx - R)); x < Math.min(W, gx + R); x++) {
            const d = Math.hypot(x - gx, y - gy) / R;
            if (d < 1) {
              const i = y * W + x;
              carve[i] = Math.min(0.42, carve[i] + (1 - d * d) * 2.6 * dt);
            }
          }
      }
      const px = S.img.data;
      const tm = performance.now() / 1000;
      for (let i = 0, n = W * H; i < n; i++) {
        const c = carve[i];
        const hgt = base[i] - c * 1.3;
        const lv = hgt * 14;
        const fr = lv - Math.floor(lv);
        const edge = Math.min(fr, 1 - fr);
        const line = edge < 0.09 ? 1 - edge / 0.09 : 0;
        // land: deep teal (low) → warm sand (high); contour lines brighten it
        let r = 14 + hgt * 120;
        let g = 26 + hgt * 96;
        let b = 34 + hgt * 50;
        r += line * 110;
        g += line * 100;
        b += line * 70;
        const wet = c > 0.05 ? Math.min(1, (c - 0.05) / 0.14) : 0;
        if (wet > 0) {
          const sh = 0.5 + 0.5 * Math.sin(i * 0.05 + tm * 3);
          r += (30 + sh * 40 - r) * wet;
          g += (120 + sh * 60 - g) * wet;
          b += (200 + sh * 40 - b) * wet;
        }
        const o = i * 4;
        px[o] = r;
        px[o + 1] = g;
        px[o + 2] = b;
        px[o + 3] = 255;
      }
      S.small.getContext("2d")!.putImageData(S.img, 0, 0);
      S.ctx.imageSmoothingEnabled = true;
      S.ctx.drawImage(S.small, 0, 0, S.size.w, S.size.h);
    },
  );
  return (
    <Stage r={root} g1="rgba(94,200,255,.5)" g2="rgba(224,145,63,.24)">
      <div className="absolute inset-0" style={{ background: "repeating-radial-gradient(circle at 40% 55%,#1b2a33 0 14px,#24363e 14px 16px)" }} aria-hidden />
      <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute left-[6%] top-[8%] max-w-[420px] rounded-[20px] bg-[#0a0d16]/70 p-7">
        <Eyebrow>Trail atlas · ₹890</Eyebrow>
        <h3 className="mt-3 text-[clamp(34px,3.6vw,56px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr }}>
          Carve your <em style={{ fontFamily: F.is }}>own river</em>
        </h3>
        <p className="mt-3 text-[15px] text-white/60" style={{ fontFamily: F.mr }}>
          Drag across the map. The land heals behind you.
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U249 · Liquid metal button ───────────────────────── */
const U249_FRAG = /* glsl */ `
uniform float uHover;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main(){
  vec2 px = vUv * uRes;
  vec2 c = uRes * 0.5;
  vec2 p = px - c;
  float pad = 34.0;
  vec2 hb = c - pad;
  float d = sdBox(p, hb, hb.y);
  float t = uTime;
  float n = noise(px * 0.012 + vec2(t * 0.35, -t * 0.2)) + 0.5 * noise(px * 0.03 - t * 0.4);
  float s = sin(p.x * 0.018 + p.y * 0.06 + n * 5.0 + t * 1.6);
  float chrome = smoothstep(-0.2, 0.9, s) * 0.85 + 0.15 * n;
  vec3 metal = mix(vec3(0.22, 0.24, 0.32), vec3(0.97, 0.98, 1.0), chrome);
  metal = mix(metal, vec3(1.0, 0.86, 0.76), 0.25 * smoothstep(0.6, 1.0, noise(px * 0.02 + t * 0.5)));
  metal *= 0.85 + 0.45 * uHover;
  float bw = 4.0 + 2.0 * uHover;
  float band = 1.0 - smoothstep(bw - 1.5, bw, abs(d + bw));
  float inside = 1.0 - smoothstep(-1.0, 0.0, d + bw * 2.0);
  vec3 fill = mix(vec3(0.05, 0.06, 0.09), vec3(0.11, 0.12, 0.17), vUv.y) + metal * 0.06 * (1.0 + uHover);
  float glow = exp(-max(d, 0.0) / (10.0 + 10.0 * uHover)) * step(0.0, d) * (0.25 + 0.45 * uHover);
  vec3 col = fill * inside + metal * band + vec3(0.85, 0.9, 1.0) * glow;
  float a = max(max(inside * 0.96, band), glow);
  gl_FragColor = vec4(col / max(a, 0.001), a);
}`;
function U249() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const hover = useRef(0);
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let dead = false;
    let h: GLHandle | null = null;
    const stop = whenNear(c, async () => {
      h = await createShader(c, U249_FRAG, {
        dpr: 1,
        uniforms: { uHover: { value: 0 } },
        onFrame: (u) => {
          const v = u.uHover as { value: number };
          v.value += (hover.current - v.value) * 0.08;
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
  usePointer(
    root,
    dot,
    (t, el) => {
      const b = el.querySelector(".u249-btn");
      const w = el.clientWidth;
      const hh = el.clientHeight;
      const [bx, by] = b ? mid(rel(b, el)) : [w / 2, hh / 2];
      const pts: [number, number][] = [
        [bx - 60, by],
        [w * 0.22, hh * 0.78],
        [bx + 70, by + 6],
        [w * 0.8, hh * 0.24],
      ];
      const [x, y] = stepPath(t, pts, 0.95, 0.5);
      return { x, y, inside: true, down: false };
    },
    (p, el) => {
      const b = el.querySelector(".u249-btn");
      if (!b || !root.current) return;
      const on = p.inside && inBox(rel(b, el), p.x, p.y, 0);
      hover.current = on ? 1 : 0;
      b.classList.toggle("on", on);
    },
  );
  return (
    <Stage r={root} g1="rgba(200,210,235,.5)" g2="rgba(255,190,160,.22)">
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <Eyebrow>Chronograph 42 · Titanium</Eyebrow>
        <h3 className="mt-4 text-[clamp(50px,6vw,100px)] leading-[0.96] tracking-[-0.03em]" style={{ fontFamily: F.fr, fontWeight: 400 }}>
          Forged in <em style={{ fontFamily: F.is }}>quicksilver</em>
        </h3>
        <p className="mt-4 text-[20px] text-white/70" style={{ fontFamily: F.sg }}>
          ₹1,84,000
        </p>
        <div className="relative mt-10 h-[136px] w-[388px]">
          <div className="u249-fb" aria-hidden>
            <div className="h-full w-full rounded-full bg-[#0e1018]" />
          </div>
          <canvas ref={cv} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500" aria-hidden />
          <button type="button" className="u249-btn absolute inset-[34px] rounded-full text-[17px] font-[600] tracking-[0.04em] text-white" style={{ fontFamily: F.sg }}>
            Reserve yours
          </button>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "U238", name: "Fluid particle trail", how: "Glowing particles stream out behind the pointer with its velocity and drag, curling through a swirl field and fading. A scripted drag loops across the stage.", kind: "play", C: U238 },
  { code: "U239", name: "Caret cursor adapts to text", how: "Over text the cursor stretches into a vertical caret sized to that line's height; elsewhere it is a dot. A scripted figure-eight sweeps over headline, body, price and photo.", kind: "play", C: U239 },
  { code: "U240", name: "Spotlight product tour", how: "The page dims and a soft spotlight hole glides between nav, photo, grind chips and the bag button, with a step card following. Loops with a short rest.", kind: "play", C: U240 },
  { code: "U241", name: "Cell ripple on click", how: "A fake pointer taps a cell in the background grid and a ripple spreads outward cell by cell (stagger by grid distance), each cell flashing and dipping.", kind: "play", C: U241 },
  { code: "U242", name: "Cybernetic hover scan", how: "Hovering a team card runs a scan line, grid tint, corner brackets and a HUD readout over the portrait. A fake pointer visits each card.", kind: "play", C: U242 },
  { code: "U243", name: "Swatch book fan", how: "Paint swatches pinned at one point fan open around the pin; tapping one swings it to the front while the rest re-fan, then the book closes. A fake pointer plays it.", kind: "play", C: U243 },
  { code: "U244", name: "Electric border", how: "Jittery electric arcs crawl around the card border: a noise-displaced SVG stroke whose noise drifts and surges, with bright sparks running round it.", kind: "play", C: U244 },
  { code: "U245", name: "Circular scroll progress", how: "A progress ring and counter fill with the scroll while the article inside scrolls; the knob can be dragged to jump the page. The fake pointer holds the knob.", kind: "scrub", C: U245 },
  { code: "U246", name: "Mood-morph emoji grid", how: "A grid of faces leans toward the pointer; the face under it morphs from frown to grin (MorphSVG) and neighbours partly, by distance. A scripted figure-eight drives it.", kind: "play", C: U246 },
  { code: "U247", name: "Vapor digit countdown", how: "Each second the countdown digit dissolves into drifting canvas grains while the next one condenses from grains into shape.", kind: "play", C: U247 },
  { code: "U248", name: "Terrain carving cursor", how: "A scripted drag carves a river channel through a contour heightfield (canvas); after release the terrain slowly heals back.", kind: "play", C: U248 },
  { code: "U249", name: "Liquid metal button", how: "A pill button's chrome border flows like liquid metal (WebGL noise on a chrome gradient) and brightens with a glow when the fake pointer hovers it.", kind: "play", C: U249 },
];
