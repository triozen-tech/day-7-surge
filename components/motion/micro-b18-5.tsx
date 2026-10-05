"use client";

// Micro-interactions, batch 18 · group 5 (MOTION-MENU U214–U225). Small focused demos for /lab/motion.
// Every hover / drag / press demo also plays by itself: a visible fake pointer (ring) walks a path or runs a scripted
// drag / tap, resting ≤ 0.5 s per target. The real mouse takes over for 2.5 s whenever it moves inside the stage.
// A CSS-only glow loop never stops (and sits on top again, screen-blended) so covered stages never freeze.
// WebGL demos (U218, U223) build only within ~1 screen of the viewport, run at dpr 1 and release the context on unmount.
// ?static=1 / reduced motion: no JS, the markup shows a sensible final state. Motion ideas only, rebuilt from scratch.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { createShader, type GLHandle } from "@/lib/gl";
import { scene, useTicker } from "@/components/fx/shared";
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
.b18g5-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b18g5-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b18g5-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b18g5-hide{visibility:hidden}
.b18g5-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;pointer-events:none;z-index:40;opacity:0;transition:opacity .25s}
.b18g5-dot>span{display:block;width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);transition:transform .2s,background-color .2s}
.b18g5-dot.tap>span{animation:b18g5-tap .32s ease-out}
.b18g5-dot.press>span{transform:scale(.62);background:rgba(255,255,255,.55)}
@keyframes b18g5-tap{40%{transform:scale(.55);background:rgba(255,255,255,.6)}100%{transform:scale(1)}}

/* U214 shadow pop */
.u214-t{will-change:transform,box-shadow}

/* U215 hearts */
.u215-h{position:absolute;left:0;top:0;width:26px;height:26px;margin:-13px 0 0 -13px;opacity:0;pointer-events:none}
.u215-b.on .u215-ic path{fill:#ff5c7a;stroke:#ff5c7a}

/* U217 mascot */
.u217-body{transform-box:fill-box;transform-origin:50% 100%;animation:u217-breathe 2.2s ease-in-out infinite alternate}
@keyframes u217-breathe{to{transform:scale(1.03,.97)}}

/* U219 spider */
.u219-cv{position:absolute;inset:0;width:100%;height:100%}

/* U221 pull cord */
.u221-day{position:absolute;inset:0;background:radial-gradient(60% 70% at 66% 0%,#fff7e3,#efe6d3 55%,#e3d7bf);opacity:0;transition:opacity .6s ${EZ}}
.u221.on .u221-day{opacity:1}
.u221-ink{transition:color .6s}
.u221.on .u221-ink{color:#1b1610}
.u221-sub{transition:color .6s}
.u221.on .u221-sub{color:rgba(27,22,16,.62)}
.u221-cone{opacity:0;transition:opacity .6s}
.u221.on .u221-cone{opacity:1}
.u221-bulb{transition:fill .5s}
.u221.on .u221-bulb{fill:#ffe9a8}

/* U222 god-ray toggle */
.u222-rays{position:absolute;left:-30%;right:-30%;top:-12%;height:118%;pointer-events:none;opacity:.12;transition:opacity .8s ${EZ};-webkit-mask-image:radial-gradient(60% 85% at 50% 0%,#000 30%,transparent 80%);mask-image:radial-gradient(60% 85% at 50% 0%,#000 30%,transparent 80%)}
.u222.on .u222-rays{opacity:.95}
.u222-r1,.u222-r2{position:absolute;inset:0;transform-origin:50% 0}
.u222-r1{background:repeating-conic-gradient(from 150deg at 50% 0%,rgba(255,236,200,0) 0deg,rgba(255,236,200,.38) 2.4deg,rgba(255,236,200,0) 5.5deg,rgba(255,236,200,0) 9deg);animation:u222-sway 6s ease-in-out infinite alternate}
.u222-r2{background:repeating-conic-gradient(from 154deg at 50% 0%,rgba(255,210,150,0) 0deg,rgba(255,210,150,.26) 1.6deg,rgba(255,210,150,0) 4deg,rgba(255,210,150,0) 13deg);animation:u222-sway 4.6s ease-in-out infinite alternate-reverse}
@keyframes u222-sway{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}
.u222-mote{position:absolute;width:4px;height:4px;border-radius:50%;background:#fff3d6;opacity:0;animation:u222-float 5s linear infinite;transition:none}
@keyframes u222-float{0%{transform:translate3d(0,0,0);opacity:0}20%{opacity:var(--mo,.15)}80%{opacity:var(--mo,.15)}100%{transform:translate3d(24px,-120px,0);opacity:0}}
.u222.on .u222-mote{--mo:.85}
.u222-trk{position:relative;width:260px;height:112px;border-radius:999px;padding:10px;border:1px solid rgba(255,255,255,.22);background:linear-gradient(180deg,#3a3f48,#1d2026 60%,#2a2e35);box-shadow:inset 0 2px 8px rgba(0,0,0,.7),0 20px 50px rgba(0,0,0,.5);cursor:pointer;transition:box-shadow .6s}
.u222.on .u222-trk{box-shadow:inset 0 2px 8px rgba(0,0,0,.7),0 0 0 1px rgba(255,200,120,.35),0 0 60px rgba(255,190,110,.35),0 20px 50px rgba(0,0,0,.5)}
.u222-knob{display:block;width:92px;height:92px;border-radius:50%;background:repeating-conic-gradient(from 0deg,#d9dde3 0deg,#9aa1ab 8deg,#eef1f5 16deg,#a7aeb8 26deg,#d9dde3 36deg);box-shadow:inset 0 0 0 1px rgba(255,255,255,.6),inset 0 -6px 12px rgba(0,0,0,.35),0 8px 18px rgba(0,0,0,.6);transition:transform .55s ${EZ}}
.u222.on .u222-knob{transform:translateX(146px) rotate(200deg)}
.u222-led{width:12px;height:12px;border-radius:50%;background:#3a2a18;transition:background-color .4s,box-shadow .4s}
.u222.on .u222-led{background:#ffc067;box-shadow:0 0 14px #ffb04d}
.u222-st{transition:color .5s}
.u222.on .u222-st{color:#ffd59a}

/* U225 trampoline */
.u225-post{fill:#e9ecf5}

html.is-static .b18g5-glow,html.is-static .u217-body,html.is-static .u222-r1,html.is-static .u222-r2,html.is-static .u222-mote{animation:none}
html.is-static {
  .b18g5-glow,.u217-body,.u222-r1,.u222-r2,.u222-mote{animation:none}
  .u221-day,.u221-ink,.u221-sub,.u221-cone,.u222-rays,.u222-knob,.u222-trk{transition:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop, again on top (screen blend) so covered stages never freeze. */
function Stage({ r, children, g1, g2, className = "" }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string; className?: string }) {
  return (
    <div ref={r} className={`relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff] ${className}`}>
      <style href="b18g5-css" precedence="default">
        {CSS}
      </style>
      <div className="b18g5-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      <div className="b18g5-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: 0.45, zIndex: 35 } as CSSProperties} aria-hidden />
    </div>
  );
}

/** The visible fake pointer (a ring). */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => (
  <div ref={r} className="b18g5-dot" aria-hidden>
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
const mid = (b: Box): [number, number] => [b.l + b.w / 2, b.t + b.h / 2];
const inBox = (b: Box, x: number, y: number, pad = 0) => x >= b.l - pad && x <= b.l + b.w + pad && y >= b.t - pad && y <= b.t + b.h + pad;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const all = (root: Element, sel: string) => [...root.querySelectorAll<HTMLElement>(sel)];
const one = (root: Element, sel: string) => root.querySelector<HTMLElement>(sel)!;

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

/** Real mouse state for drag demos (position, inside, pressed, last activity). */
function useMouse(root: RefObject<HTMLElement | null>) {
  const m = useRef({ x: 0, y: 0, inside: false, at: -1e9, down: false });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mv = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const s = m.current;
      s.x = e.clientX - r.left;
      s.y = e.clientY - r.top;
      s.inside = true;
      s.at = performance.now();
    };
    const lv = () => (m.current.inside = false);
    const dn = (e: PointerEvent) => {
      mv(e);
      m.current.down = true;
    };
    const up = () => (m.current.down = false);
    el.addEventListener("pointermove", mv);
    el.addEventListener("pointerleave", lv);
    el.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointermove", mv);
      el.removeEventListener("pointerleave", lv);
      el.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [root]);
  return m;
}
const isReal = (m: { at: number }) => performance.now() - m.at < 2500;

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

/** True once the element is within ~1 screen of the viewport (WebGL / textures wait for this). */
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

// eslint-disable-next-line @next/next/no-img-element
const Img = ({ i, className = "", w = 700, h = 900 }: { i: number; className?: string; w?: number; h?: number }) => (
  <img src={scene(i, w, h)} alt="" className={`block h-full w-full object-cover ${className}`} draggable={false} />
);

const Eyebrow = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={`text-[13px] uppercase tracking-[0.22em] text-white/55 ${className}`} style={{ fontFamily: F.sg }}>
    {children}
  </p>
);

/* ───────────────────────── U214 · Hard shadow pop (3D extrude) ───────────────────────── */
const U214_T = [
  { n: "Field jacket", p: "₹6,890", c: "#ffcf5a", s: "#a57a12", sx: 1, sy: -1, dir: "Top right" },
  { n: "Canvas tote", p: "₹1,490", c: "#7ce0c3", s: "#2f8a70", sx: 1, sy: 1, dir: "Bottom right" },
  { n: "Wool beanie", p: "₹990", c: "#ff8a7a", s: "#a8423a", sx: -1, sy: 1, dir: "Bottom left" },
  { n: "Trail cap", p: "₹1,290", c: "#a9b8ff", s: "#4f5fae", sx: -1, sy: -1, dir: "Top left" },
];
const U214_D = 12;
function u214Apply(el: HTMLElement, d: number, k: number) {
  const T = U214_T[k];
  const parts: string[] = [];
  const n = Math.ceil(d);
  for (let i = 1; i <= n; i++) {
    const s = Math.min(i, d);
    parts.push(`${(T.sx * s).toFixed(2)}px ${(T.sy * s).toFixed(2)}px 0 ${T.s}`);
  }
  el.style.boxShadow = parts.length ? parts.join(",") : "none";
  el.style.transform = `translate3d(${(-T.sx * d).toFixed(2)}px,${(-T.sy * d).toFixed(2)}px,0)`;
}
function U214() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const depth = useRef(U214_T.map(() => ({ d: 0 })));
  const pop = (k: number, up: boolean) => {
    const el = root.current;
    if (!el) return;
    const t = all(el, ".u214-t")[k];
    const o = depth.current[k];
    gsap.to(o, { d: up ? U214_D : 0, duration: up ? 0.42 : 0.36, ease: up ? "power3.out" : "power2.inOut", overwrite: true, onUpdate: () => u214Apply(t, o.d, k) });
  };
  usePlay(root, (el, dispose) => {
    const ts = all(el, ".u214-t");
    const d = dot.current;
    dispose(() => depth.current.forEach((o) => gsap.killTweensOf(o)));
    const tl = gsap.timeline({ repeat: -1 });
    ts.forEach((t, k) => {
      tl.call(() => goDot(d, el, t, 0.4, idle()));
      tl.to({}, { duration: 0.3 });
      tl.call(() => {
        if (!idle()) return;
        pop(k, true);
        pop((k + ts.length - 1) % ts.length, false);
      });
      tl.to({}, { duration: 0.45 });
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,207,90,.5)" g2="rgba(124,224,195,.24)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Winter edit · four drops</Eyebrow>
        <h3 className="mt-3 text-[clamp(40px,4.2vw,66px)] leading-[1] tracking-[-0.03em]" style={{ fontFamily: F.sy, fontWeight: 800 }}>
          Pop the pick
        </h3>
        <div className="mt-12 grid w-[min(1040px,86%)] grid-cols-4 gap-8">
          {U214_T.map((t, k) => (
            <div
              key={t.n}
              className="u214-t rounded-[18px] border-2 border-[#0a0d16] px-6 pb-6 pt-5 text-[#0a0d16]"
              style={{ background: t.c }}
              onPointerEnter={() => pop(k, true)}
              onPointerLeave={() => pop(k, false)}
            >
              <p className="text-[12px] uppercase tracking-[0.18em] opacity-70" style={{ fontFamily: F.mr, fontWeight: 700 }}>
                {t.dir}
              </p>
              <div className="mt-4 aspect-[4/3] overflow-hidden rounded-[10px] border-2 border-[#0a0d16]">
                <Img i={k} w={480} h={360} />
              </div>
              <p className="mt-4 text-[20px] font-[700] leading-tight" style={{ fontFamily: F.sg }}>
                {t.n}
              </p>
              <p className="mt-1 text-[16px]" style={{ fontFamily: F.mr, fontWeight: 600 }}>
                {t.p}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U215 · Floating heart microinteraction ───────────────────────── */
const U215_POOL = 22;
const U215_COL = ["#ff5c7a", "#ff8fa3", "#ffb3c1", "#ff4d6d", "#ffd1dc"];
const Heart = ({ fill = "none", stroke = "currentColor", className = "", size = 26 }: { fill?: string; stroke?: string; className?: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
    <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4.5 6.9 4.5c2 0 3.4 1.1 5.1 3 1.7-1.9 3.1-3 5.1-3 3.3 0 5.5 3.1 4.2 6.6-1.8 4.8-9.3 9.4-9.3 9.4z" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinejoin="round" />
  </svg>
);
function U215() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const st = useRef({ next: 0, count: 2418, liked: false });
  const fire = (n: number) => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const btn = one(el, ".u215-b");
    const [cx, cy] = mid(rel(one(btn, ".u215-ic"), el));
    const hs = all(el, ".u215-h");
    const S = st.current;
    for (let i = 0; i < n; i++) {
      const h = hs[S.next % hs.length];
      S.next++;
      const s = 0.55 + Math.random() * 0.75;
      const side = Math.random() < 0.5 ? -1 : 1;
      const drift = 18 + Math.random() * 36;
      const rise = 150 + Math.random() * 130;
      gsap.killTweensOf(h);
      gsap.set(h, { x: cx + (Math.random() - 0.5) * 16, y: cy, scale: 0.3, rotation: 0, opacity: 1, color: U215_COL[(S.next + i) % U215_COL.length] });
      gsap.to(h, {
        keyframes: {
          x: [cx, cx + side * drift, cx - side * drift * 0.6, cx + side * drift * 0.9],
          y: [cy, cy - rise * 0.35, cy - rise * 0.7, cy - rise],
          scale: [0.3, s, s, s * 0.8],
          opacity: [1, 1, 0.85, 0],
          rotation: [0, side * 12, -side * 10, side * 8],
          easeEach: "sine.inOut",
        },
        duration: 1.3 + Math.random() * 0.5,
        delay: i * 0.05,
        ease: "power1.out",
      });
    }
    S.count++;
    S.liked = true;
    btn.classList.add("on");
    const c = one(btn, ".u215-n");
    c.textContent = `${S.count.toLocaleString("en-IN")} likes`;
    gsap.fromTo(one(btn, ".u215-ic"), { scale: 0.7 }, { scale: 1, duration: 0.5, ease: "back.out(3)", overwrite: true });
  };
  usePlay(root, (el) => {
    const btn = one(el, ".u215-b");
    const d = dot.current;
    const tl = gsap.timeline({ repeat: -1 });
    const jit: [number, number][] = [
      [-30, -4],
      [26, 6],
      [-8, 10],
      [40, -6],
    ];
    jit.forEach(([jx, jy]) => {
      tl.call(() => {
        const [x, y] = mid(rel(btn, el));
        goDot(d, el, [x + jx, y + jy], 0.36, idle());
      });
      tl.to({}, { duration: 0.42 });
      tl.call(() => {
        if (!idle()) return;
        tapDot(d);
        fire(7);
      });
      tl.to({}, { duration: 0.34 });
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,92,122,.52)" g2="rgba(255,179,193,.22)">
      <div className="flex h-full w-full items-center justify-center gap-[6%]">
        <div className="h-[72%] w-[min(30%,380px)] overflow-hidden rounded-[24px] border border-white/10">
          <Img i={1} w={600} h={800} />
        </div>
        <div className="w-[min(40%,480px)]">
          <Eyebrow>Community favourite</Eyebrow>
          <h3 className="mt-3 text-[clamp(38px,3.8vw,60px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Rose Petal Mist
          </h3>
          <p className="mt-4 text-[17px] text-white/60" style={{ fontFamily: F.mr }}>
            Toner with Kannauj rose water · 120 ml
          </p>
          <p className="mt-6 text-[26px]" style={{ fontFamily: F.sg, fontWeight: 600 }}>
            ₹890
          </p>
          <button
            type="button"
            className="u215-b mt-8 inline-flex items-center gap-4 rounded-full border border-white/20 bg-white/[0.06] py-4 pl-5 pr-7 text-[18px]"
            style={{ fontFamily: F.sg, fontWeight: 600 }}
            onClick={() => fire(7)}
            onPointerEnter={() => fire(3)}
          >
            <span className="u215-ic inline-flex text-white">
              <Heart size={30} />
            </span>
            <span className="u215-n">2,418 likes</span>
          </button>
        </div>
      </div>
      {Array.from({ length: U215_POOL }, (_, i) => (
        <span key={i} className="u215-h z-30" aria-hidden>
          <Heart fill="currentColor" stroke="none" />
        </span>
      ))}
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U216 · Rope-hung badge with physics ───────────────────────── */
const U216_N = 10;
const U216_CW = 230;
const U216_CH = 320;
const U216_QR = Array.from({ length: 81 }, (_, i) => {
  const x = i % 9;
  const y = Math.floor(i / 9);
  const corner = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
  return corner ? !(x % 8 === 1 && y % 8 === 1) && !((x === 7 || x === 1) && (y === 1 || y === 7)) : (x * 7 + y * 13 + x * y) % 3 === 0;
});
type VP = { x: number; y: number; px: number; py: number };
function U216() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const path2 = useRef<SVGPathElement>(null);
  const line = useRef<SVGLineElement>(null);
  const M = useMouse(root);
  const S = useRef({
    W: 0,
    H: 0,
    seg: 0,
    pts: [] as VP[],
    grab: false,
    gx: 0,
    gy: 0,
    sx: 0,
    sy: 0,
    ry: 0,
    rot: 0,
    dx: 0,
    dy: 0,
    cyc: -1,
    ev: 0,
    acc: 0,
    lastEx: 0,
    lastEy: 0,
    realGrab: false,
    downAt: 0,
    downX: 0,
    downY: 0,
    t: 0,
  });
  const flip = (extra = 180) => {
    const s = S.current;
    gsap.to(s, { ry: Math.round((s.ry + extra) / 180) * 180, duration: extra > 180 ? 1.1 : 0.75, ease: extra > 180 ? "power3.out" : "back.out(1.5)", overwrite: true });
  };
  const centre = () => {
    const s = S.current;
    const e = s.pts[U216_N];
    const a = (s.rot * Math.PI) / 180;
    return [e.x - (Math.sin(a) * U216_CH) / 2, e.y + (Math.cos(a) * U216_CH) / 2] as [number, number];
  };
  const release = (fling: boolean) => {
    const s = S.current;
    s.grab = false;
    const e = s.pts[U216_N];
    if (fling) {
      e.px = e.x - s.lastEx / 4;
      e.py = e.y - s.lastEy / 4;
    }
  };
  useEffect(() => {
    const s = S.current;
    const up = () => {
      if (!s.realGrab) return;
      s.realGrab = false;
      release(true);
      const m = M.current;
      if (Math.hypot(m.x - s.downX, m.y - s.downY) < 6 && performance.now() - s.downAt < 320) flip();
    };
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointerup", up);
      gsap.killTweensOf(s);
    };
  }, [M]);
  const onDown = (e: React.PointerEvent) => {
    const el = root.current;
    const s = S.current;
    if (!el || !s.pts.length) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const end = s.pts[U216_N];
    s.realGrab = true;
    s.grab = true;
    s.gx = x - end.x;
    s.gy = y - end.y;
    s.downAt = performance.now();
    s.downX = x;
    s.downY = y;
  };
  useTicker(root, (t, rawDt) => {
    const el = root.current;
    const s = S.current;
    if (!el) return;
    const dt = Math.min(rawDt, 0.05);
    const W = el.clientWidth;
    const H = el.clientHeight;
    const ax = W / 2;
    const ay = -6;
    const RL = H * 0.36;
    if (W !== s.W || H !== s.H || !s.pts.length) {
      s.W = W;
      s.H = H;
      s.seg = RL / U216_N;
      s.pts = Array.from({ length: U216_N + 1 }, (_, i) => ({ x: ax, y: ay + i * s.seg, px: ax, py: ay + i * s.seg }));
      if (line.current) line.current.style.visibility = "hidden";
    }
    const m = M.current;
    const real = isReal(m);
    const d = dot.current;
    // target for the grabbed end (and the fake ring)
    let tx = s.dx;
    let ty = s.dy;
    if (real) {
      tx = m.x;
      ty = m.y;
      if (!s.realGrab && s.grab) release(true);
    } else {
      const T = 6.4;
      const cyc = Math.floor(t / T);
      const tc = t - cyc * T;
      if (cyc !== s.cyc) {
        s.cyc = cyc;
        s.ev = 0;
        if (s.dx === 0 && s.dy === 0) {
          s.dx = W * 0.78;
          s.dy = H * 0.8;
        }
      }
      const [cx, cy] = centre();
      const k = (r: number) => 1 - Math.exp(-dt * r);
      if (tc < 0.55) {
        s.dx = lerp(s.dx, cx, k(9));
        s.dy = lerp(s.dy, cy, k(9));
      } else if (tc < 1.5) {
        if (s.ev === 0) {
          s.ev = 1;
          const e = s.pts[U216_N];
          s.grab = true;
          s.gx = s.dx - e.x;
          s.gy = s.dy - e.y;
          s.sx = s.dx;
          s.sy = s.dy;
          d?.classList.add("press");
        }
        const f = easeIO((tc - 0.55) / 0.95);
        s.dx = lerp(s.sx, ax + W * 0.22, f);
        s.dy = lerp(s.sy, RL + U216_CH * 0.55 + 40, f);
      } else if (tc < 2.5) {
        if (s.ev === 1) {
          s.ev = 2;
          release(true);
          d?.classList.remove("press");
        }
        s.dx = lerp(s.dx, ax - W * 0.27 + Math.sin(t * 2) * 30, k(4));
        s.dy = lerp(s.dy, H * 0.56 + Math.cos(t * 1.7) * 30, k(4));
      } else if (tc < 3.0) {
        s.dx = lerp(s.dx, cx, k(11));
        s.dy = lerp(s.dy, cy, k(11));
      } else if (tc < 3.4) {
        if (s.ev === 2) {
          s.ev = 3;
          tapDot(d);
          flip();
        }
        s.dx = lerp(s.dx, cx + 40, k(8));
        s.dy = lerp(s.dy, cy - 20, k(8));
      } else if (tc < 3.75) {
        if (tc > 3.55 && s.ev === 3) {
          s.ev = 4;
          const e = s.pts[U216_N];
          e.px = e.x + 16;
          flip(360);
        }
        s.dx = lerp(s.dx, cx - 220, k(10));
        s.dy = lerp(s.dy, cy + 10, k(10));
      } else if (tc < 4.7) {
        s.dx = lerp(s.dx, ax + W * 0.3 + Math.sin(t * 2.2) * 26, k(4));
        s.dy = lerp(s.dy, H * 0.38, k(4));
      } else if (tc < 5.1) {
        s.dx = lerp(s.dx, cx, k(11));
        s.dy = lerp(s.dy, cy, k(11));
      } else {
        if (s.ev === 4) {
          s.ev = 5;
          tapDot(d);
          flip();
        }
        s.dx = lerp(s.dx, W * 0.76, k(3));
        s.dy = lerp(s.dy, H * 0.78, k(3));
      }
      tx = s.dx;
      ty = s.dy;
    }
    if (d) {
      d.style.transform = `translate3d(${s.dx.toFixed(1)}px,${s.dy.toFixed(1)}px,0)`;
      d.style.opacity = real ? "0" : "1";
    }
    // Verlet rope (fixed substeps)
    const pts = s.pts;
    const end = pts[U216_N];
    let gx = tx - s.gx;
    let gy = ty - s.gy;
    const gd = Math.hypot(gx - ax, gy - ay);
    if (gd > RL * 0.995) {
      gx = ax + ((gx - ax) / gd) * RL * 0.995;
      gy = ay + ((gy - ay) / gd) * RL * 0.995;
    }
    if (s.grab) {
      s.lastEx = gx - end.x;
      s.lastEy = gy - end.y;
    }
    s.acc += dt;
    const h = 1 / 120;
    const G = 1500 * h * h;
    let steps = 0;
    while (s.acc >= h && steps < 8) {
      s.acc -= h;
      steps++;
      for (let i = 1; i <= U216_N; i++) {
        const p = pts[i];
        if (i === U216_N && s.grab) {
          p.px = p.x;
          p.py = p.y;
          p.x = gx;
          p.y = gy;
          continue;
        }
        const vx = (p.x - p.px) * 0.993;
        const vy = (p.y - p.py) * 0.993;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + G;
      }
      for (let it = 0; it < 10; it++) {
        pts[0].x = ax;
        pts[0].y = ay;
        for (let i = 0; i < U216_N; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          const ddx = b.x - a.x;
          const ddy = b.y - a.y;
          const dd = Math.hypot(ddx, ddy) || 1e-4;
          const diff = (dd - s.seg) / dd;
          const fixA = i === 0;
          const fixB = i + 1 === U216_N && s.grab;
          if (fixA && fixB) continue;
          if (fixA) {
            b.x -= ddx * diff;
            b.y -= ddy * diff;
          } else if (fixB) {
            a.x += ddx * diff;
            a.y += ddy * diff;
          } else {
            a.x += ddx * diff * 0.5;
            a.y += ddy * diff * 0.5;
            b.x -= ddx * diff * 0.5;
            b.y -= ddy * diff * 0.5;
          }
        }
      }
    }
    const prev = pts[U216_N - 1];
    const ang = (-Math.atan2(end.x - prev.x, end.y - prev.y) * 180) / Math.PI;
    s.rot += (ang - s.rot) * Math.min(1, dt * 12);
    const dStr = "M" + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L");
    path.current?.setAttribute("d", dStr);
    path2.current?.setAttribute("d", dStr);
    const c = card.current;
    if (c) {
      c.style.left = `${(end.x - U216_CW / 2).toFixed(1)}px`;
      c.style.top = `${end.y.toFixed(1)}px`;
      c.style.transform = `rotate(${s.rot.toFixed(2)}deg)`;
    }
    if (inner.current) inner.current.style.transform = `rotateY(${s.ry.toFixed(1)}deg)`;
  });
  return (
    <Stage r={root} g1="rgba(159,140,255,.52)" g2="rgba(124,224,195,.22)">
      <div className="pointer-events-none absolute left-[6%] top-1/2 max-w-[min(30%,380px)]" style={{ transform: "translateY(-50%)" }}>
        <Eyebrow>Studio Night · 14 Nov</Eyebrow>
        <h3 className="mt-3 text-[clamp(38px,3.6vw,58px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Your pass is ready
        </h3>
        <p className="mt-4 text-[16px] text-white/60" style={{ fontFamily: F.mr }}>
          Drag it, swing it, tap to see the back.
        </p>
      </div>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <line ref={line} x1="50%" y1="0" x2="50%" y2="36%" stroke="#8f7dff" strokeWidth={16} />
        <path ref={path} fill="none" stroke="#8f7dff" strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" />
        <path ref={path2} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth={1.5} strokeDasharray="5 5" strokeLinejoin="round" />
      </svg>
      <div
        ref={card}
        className="absolute z-20 cursor-grab touch-none select-none"
        style={{ left: `calc(50% - ${U216_CW / 2}px)`, top: "36%", width: U216_CW, height: U216_CH, transformOrigin: "50% 0", perspective: 900 }}
        onPointerDown={onDown}
      >
        <div className="absolute left-1/2 top-[-14px] h-[26px] w-[34px] rounded-[6px] border border-white/40 bg-[#c9ccd6]" style={{ marginLeft: -17 }} />
        <div ref={inner} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          <div className="absolute inset-0 overflow-hidden rounded-[20px] border border-white/20 bg-[#f4f1ea] p-5 text-[#121420]" style={{ backfaceVisibility: "hidden" }}>
            <p className="text-[12px] uppercase tracking-[0.22em] text-[#121420]/60" style={{ fontFamily: F.sg, fontWeight: 600 }}>
              Atelier Kora · pass
            </p>
            <div className="mt-4 h-[130px] overflow-hidden rounded-[12px]">
              <Img i={2} w={420} h={260} />
            </div>
            <p className="mt-4 text-[26px] leading-none" style={{ fontFamily: F.fr, fontWeight: 600 }}>
              Ira Mehta
            </p>
            <p className="mt-2 text-[13px] text-[#121420]/65" style={{ fontFamily: F.mr }}>
              Guest designer · Hall B
            </p>
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between border-t border-[#121420]/15 pt-3 text-[12px] uppercase tracking-[0.16em]" style={{ fontFamily: F.sg }}>
              <span>No. 0418</span>
              <span>All access</span>
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[20px] border border-white/20 bg-[#8f7dff] p-5 text-[#0d0b1c]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <p className="text-[13px] uppercase tracking-[0.24em]" style={{ fontFamily: F.sg, fontWeight: 700 }}>
              Admit one
            </p>
            <div className="mt-5 grid grid-cols-9 gap-[3px] rounded-[10px] bg-[#f4f1ea] p-3">
              {U216_QR.map((on, i) => (
                <span key={i} className="block h-[11px] w-[11px] rounded-[2px]" style={{ background: on ? "#121420" : "transparent" }} />
              ))}
            </div>
            <p className="mt-5 text-[22px]" style={{ fontFamily: F.fr, fontWeight: 600 }}>
              Doors 7 pm
            </p>
          </div>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U217 · Head-tracking mascot ───────────────────────── */
const U217_MOUTH = { calm: "M-30 0 Q0 14 30 0 Q0 6 -30 0Z", grin: "M-40 -4 Q0 50 40 -4 Q0 8 -40 -4Z" };
function U217() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const q = useRef<{ fx: (v: number) => void; fy: (v: number) => void; fr: (v: number) => void; px: (v: number) => void; py: (v: number) => void } | null>(null);
  const st = useRef({ lastTap: -1 });
  const grin = () => {
    const el = svg.current;
    if (!el || prefersReducedMotion()) return;
    const m = el.querySelector(".u217-mouth");
    const cheeks = el.querySelectorAll(".u217-cheek");
    gsap.killTweensOf([m, ...cheeks]);
    gsap
      .timeline()
      .to(m, { attr: { d: U217_MOUTH.grin }, duration: 0.28, ease: "back.out(2)" })
      .to(cheeks, { opacity: 0.85, scale: 1.25, transformOrigin: "50% 50%", duration: 0.28 }, 0)
      .to(m, { attr: { d: U217_MOUTH.calm }, duration: 0.45, ease: "power2.inOut" }, 0.9)
      .to(cheeks, { opacity: 0.35, scale: 1, duration: 0.45 }, 0.9);
  };
  useEffect(() => {
    const el = svg.current;
    if (!el || prefersReducedMotion()) return;
    const face = el.querySelector(".u217-face");
    const pupils = el.querySelectorAll(".u217-pupil");
    const lids = el.querySelectorAll(".u217-lid");
    const ctx = gsap.context(() => {
      q.current = {
        fx: gsap.quickTo(face, "x", { duration: 0.7, ease: "power3" }),
        fy: gsap.quickTo(face, "y", { duration: 0.7, ease: "power3" }),
        fr: gsap.quickTo(face, "rotation", { duration: 0.9, ease: "power3" }),
        px: gsap.quickTo(pupils, "x", { duration: 0.35, ease: "power3" }),
        py: gsap.quickTo(pupils, "y", { duration: 0.35, ease: "power3" }),
      };
      gsap.set(face, { svgOrigin: "200 220" });
    });
    let call: gsap.core.Tween | null = null;
    const blink = () => {
      gsap.to(lids, { attr: { height: 78 }, duration: 0.07, yoyo: true, repeat: Math.random() < 0.3 ? 3 : 1, ease: "power1.in" });
      call = gsap.delayedCall(1.1 + Math.random() * 1.8, blink);
    };
    call = gsap.delayedCall(0.8, blink);
    return () => {
      call?.kill();
      gsap.killTweensOf(lids);
      ctx.revert();
      q.current = null;
    };
  }, []);
  usePointer(
    root,
    dot,
    (t, el) => ({ x: el.clientWidth * (0.5 + 0.34 * Math.sin(t * 0.95)), y: el.clientHeight * (0.5 + 0.3 * Math.sin(t * 1.9)), inside: true }),
    (p, el, fake, t) => {
      const Q = q.current;
      const s = svg.current;
      if (!Q || !s) return;
      const b = rel(s, el);
      const [cx, cy] = mid(b);
      const nx = clamp((p.x - cx) / (el.clientWidth * 0.45), -1, 1);
      const ny = clamp((p.y - cy) / (el.clientHeight * 0.5), -1, 1);
      Q.fx(nx * 34);
      Q.fy(ny * 24);
      Q.fr(nx * 9);
      Q.px(nx * 9);
      Q.py(ny * 7);
      if (fake) {
        const k = Math.floor((t + 1) / 2.6);
        if (k !== st.current.lastTap && t > 1) {
          st.current.lastTap = k;
          tapDot(dot.current);
          grin();
        }
      }
    },
  );
  return (
    <Stage r={root} g1="rgba(255,190,92,.5)" g2="rgba(124,180,255,.22)">
      <div className="flex h-full w-full items-center justify-center gap-[5%]">
        <div className="max-w-[min(34%,420px)]">
          <Eyebrow>Help desk · always on</Eyebrow>
          <h3 className="mt-3 text-[clamp(40px,4vw,64px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.sy, fontWeight: 700 }}>
            Say hi to Momo
          </h3>
          <p className="mt-4 text-[17px] text-white/60" style={{ fontFamily: F.mr }}>
            Our little guide keeps an eye on you and grins when you tap.
          </p>
        </div>
        <svg ref={svg} viewBox="0 0 400 400" className="aspect-square h-[78%] w-auto cursor-pointer overflow-visible" onClick={grin} aria-label="Mascot">
          <ellipse cx={200} cy={372} rx={120} ry={14} fill="rgba(0,0,0,.35)" />
          <g className="u217-body">
            <path d="M200 60c92 0 150 70 150 168 0 86-58 140-150 140S50 314 50 228C50 130 108 60 200 60z" fill="#ffb84d" />
            <path d="M120 86c-14-30-6-56 6-66 10 18 20 40 22 58z" fill="#ffb84d" />
            <path d="M280 86c14-30 6-56-6-66-10 18-20 40-22 58z" fill="#ffb84d" />
            <path d="M98 300c30 36 70 52 102 52s72-16 102-52" fill="none" stroke="#e8972c" strokeWidth={6} strokeLinecap="round" opacity={0.5} />
          </g>
          <g className="u217-face">
            <ellipse className="u217-cheek" cx={128} cy={252} rx={20} ry={12} fill="#ff7a6b" opacity={0.35} />
            <ellipse className="u217-cheek" cx={272} cy={252} rx={20} ry={12} fill="#ff7a6b" opacity={0.35} />
            {[150, 250].map((x) => (
              <g key={x}>
                <ellipse cx={x} cy={200} rx={30} ry={36} fill="#fffaf0" />
                <g className="u217-pupil">
                  <circle cx={x} cy={204} r={16} fill="#1c1a2a" />
                  <circle cx={x + 6} cy={197} r={5} fill="#fff" />
                </g>
                <clipPath id={`u217-eye-${x}`}>
                  <ellipse cx={x} cy={200} rx={31} ry={37} />
                </clipPath>
                <rect className="u217-lid" x={x - 34} y={162} width={68} height={0} fill="#ffb84d" clipPath={`url(#u217-eye-${x})`} />
              </g>
            ))}
            <g transform="translate(200 262)">
              <path className="u217-mouth" d={U217_MOUTH.calm} fill="#3a1f2a" stroke="#3a1f2a" strokeWidth={4} strokeLinejoin="round" />
            </g>
          </g>
        </svg>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U218 · Embroidered patch lighting (WebGL) ───────────────────────── */
const U218_TW = 1400;
const U218_TH = 800;
const U218_FRAG = /* glsl */ `
uniform vec2 uLight;
vec2 contain(vec2 uv, vec2 tr) { vec2 s = uRes / tr; float k = min(s.x, s.y); vec2 size = tr * k; return (uv * uRes - (uRes - size) * 0.5) / size; }
float thread(vec2 px, vec4 a, vec4 b) {
  float f = sin(dot(px, vec2(0.7071, 0.7071)) * 1.9);
  float l = sin(px.x * 2.3 + sin(px.y * 0.045) * 2.0);
  float bd = sin(dot(px, vec2(-0.7071, 0.7071)) * 2.6);
  return mix(mix(f, l, a.b), bd, b.b * (1.0 - a.b));
}
float hgt(vec2 t) {
  vec4 a = texture2D(uTex0, t); vec4 b = texture2D(uTex1, t);
  float fill = max(max(a.r, a.g), b.g);
  return fill * 0.6 + a.b * 0.35 + b.b * 0.22 + b.r * 0.25 + fill * 0.06 * thread(t * uTexRes0, a, b);
}
void main() {
  vec2 t = contain(vUv, uTexRes0);
  if (t.x < 0.0 || t.y < 0.0 || t.x > 1.0 || t.y > 1.0) { gl_FragColor = vec4(0.0); return; }
  vec4 a = texture2D(uTex0, t); vec4 b = texture2D(uTex1, t);
  float fill = max(max(a.r, a.g), b.g);
  if (fill < 0.004) { gl_FragColor = vec4(0.0); return; }
  vec2 e = 1.2 / uTexRes0;
  float hx = hgt(t + vec2(e.x, 0.0)) - hgt(t - vec2(e.x, 0.0));
  float hy = hgt(t + vec2(0.0, e.y)) - hgt(t - vec2(0.0, e.y));
  vec3 n = normalize(vec3(-hx * 3.0, -hy * 3.0, 1.0));
  float asp = uRes.x / uRes.y;
  vec2 dl = (uLight - vUv) * vec2(asp, 1.0);
  vec3 L = normalize(vec3(dl, 0.42));
  float diff = max(dot(n, L), 0.0);
  vec3 hv = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, hv), 0.0), 26.0);
  float att = 1.0 / (1.0 + dot(dl, dl) * 4.0);
  vec3 cA = vec3(0.78, 0.2, 0.19);
  vec3 cB = vec3(0.93, 0.68, 0.22);
  vec3 cC = vec3(0.16, 0.26, 0.55);
  vec3 cream = vec3(0.96, 0.92, 0.84);
  vec3 base = (cA * a.r + cB * a.g + cC * b.g) / max(fill, 0.001);
  vec3 letter = mix(cream, cC * 0.9, step(0.5, a.g));
  base = mix(base, letter, a.b);
  base = mix(base, base * 0.62, b.b * (1.0 - a.b));
  base = mix(base, cream, b.r * 0.9);
  base *= 0.9 + 0.1 * thread(t * uTexRes0, a, b);
  vec3 col = base * (0.24 + 1.15 * diff * att + 0.16 * diff) + vec3(1.0, 0.95, 0.85) * spec * 0.55 * att;
  gl_FragColor = vec4(col, smoothstep(0.0, 0.6, fill));
}`;
type U218Shape = { kind: "rr"; x: number; y: number; w: number; h: number; r: number } | { kind: "el"; cx: number; cy: number; rx: number; ry: number };
const U218_SH: { s: U218Shape; word: string; font: string; fit: number; ch: 0 | 1 | 2; tex: 0 | 1 }[] = [
  { s: { kind: "rr", x: 90, y: 120, w: 640, h: 350, r: 64 }, word: "SLOW", font: "800 {s}px 'Syne Variable', sans-serif", fit: 500, ch: 0, tex: 0 },
  { s: { kind: "el", cx: 1060, cy: 300, rx: 250, ry: 210 }, word: "made", font: "italic 600 {s}px 'Fraunces Variable', serif", fit: 330, ch: 1, tex: 0 },
  { s: { kind: "rr", x: 380, y: 560, w: 640, h: 160, r: 80 }, word: "EST · 2026", font: "700 {s}px 'Space Grotesk Variable', sans-serif", fit: 470, ch: 1, tex: 1 },
];
function u218Path(ctx: CanvasRenderingContext2D, s: U218Shape, inset: number) {
  ctx.beginPath();
  if (s.kind === "el") {
    ctx.ellipse(s.cx, s.cy, s.rx - inset, s.ry - inset, 0, 0, Math.PI * 2);
    return;
  }
  const x = s.x + inset;
  const y = s.y + inset;
  const w = s.w - inset * 2;
  const h = s.h - inset * 2;
  const r = Math.max(2, s.r - inset);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function u218Textures() {
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = U218_TW;
    c.height = U218_TH;
    const x = c.getContext("2d")!;
    x.fillStyle = "#000";
    x.fillRect(0, 0, U218_TW, U218_TH);
    x.globalCompositeOperation = "lighter";
    return [c, x] as const;
  };
  const [c0, x0] = mk();
  const [c1, x1] = mk();
  const chan = ["rgb(255,0,0)", "rgb(0,255,0)", "rgb(0,0,255)"];
  U218_SH.forEach((p) => {
    // fill: patches A/B in tex0 R/G, patch C in tex1 G
    const fx = p.tex === 0 ? x0 : x1;
    fx.fillStyle = p.tex === 0 ? chan[p.ch] : chan[1];
    u218Path(fx, p.s, 0);
    fx.fill();
    // merrow border (tex1 B) + dashed stitches (tex1 R)
    x1.strokeStyle = chan[2];
    x1.lineWidth = 26;
    u218Path(x1, p.s, 0);
    x1.stroke();
    x1.strokeStyle = chan[0];
    x1.lineWidth = 4;
    x1.setLineDash([12, 9]);
    u218Path(x1, p.s, 30);
    x1.stroke();
    x1.setLineDash([]);
    // letters (tex0 B)
    let size = 260;
    x0.font = p.font.replace("{s}", String(size));
    const w = x0.measureText(p.word).width;
    size = Math.min(size, (size * p.fit) / w);
    x0.font = p.font.replace("{s}", String(Math.floor(size)));
    x0.fillStyle = chan[2];
    x0.textAlign = "center";
    x0.textBaseline = "middle";
    const [cx, cy] = p.s.kind === "el" ? [p.s.cx, p.s.cy] : [p.s.x + p.s.w / 2, p.s.y + p.s.h / 2];
    x0.fillText(p.word, cx, cy + size * 0.04);
  });
  return [c0, c1];
}
function U218() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const fb = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const light = useRef<[number, number]>([0.5, 0.5]);
  const near = useNear(root);
  useEffect(() => {
    const c = cv.current;
    if (!near || !c) return;
    let dead = false;
    let h: GLHandle | null = null;
    let first = true;
    (async () => {
      try {
        await Promise.all([document.fonts.load("800 200px 'Syne Variable'"), document.fonts.load("italic 600 200px 'Fraunces Variable'"), document.fonts.load("700 200px 'Space Grotesk Variable'")]);
      } catch {
        /* fall back to whatever is loaded */
      }
      if (dead) return;
      const tex = u218Textures();
      h = await createShader(c, U218_FRAG, {
        dpr: 1,
        textures: tex,
        uniforms: { uLight: { value: [0.5, 0.5] } },
        onFrame: (u) => {
          (u.uLight as { value: number[] }).value = light.current;
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
    (t, el) => ({ x: el.clientWidth * (0.5 + 0.38 * Math.sin(t * 0.8)), y: el.clientHeight * (0.48 + 0.3 * Math.sin(t * 1.6)), inside: true }),
    (p, el) => {
      const c = cv.current;
      if (!c) return;
      const b = rel(c, el);
      light.current = [(p.x - b.l) / Math.max(1, b.w), 1 - (p.y - b.t) / Math.max(1, b.h)];
      if (halo.current) halo.current.style.transform = `translate3d(${(p.x - 260).toFixed(1)}px,${(p.y - 260).toFixed(1)}px,0)`;
    },
  );
  return (
    <Stage r={root} g1="rgba(238,174,56,.5)" g2="rgba(199,52,48,.24)">
      <div ref={halo} className="pointer-events-none absolute left-0 top-0 h-[520px] w-[520px] rounded-full" style={{ background: "radial-gradient(closest-side,rgba(255,236,200,.22),transparent)" }} aria-hidden />
      <div className="absolute inset-x-[4%] bottom-[4%] top-[12%]">
        {/* static / fallback patches (hidden once the shader draws its first frame) */}
        <div ref={fb} className="absolute inset-0 flex items-center justify-center transition-opacity duration-500">
          <div className="relative aspect-[1400/800] h-full max-w-full">
            <div className="absolute flex items-center justify-center rounded-[40px] border-[10px] border-[#a3241f] bg-[#c73430] text-[#f5ebd6] outline-dashed outline-2 outline-offset-[-22px] outline-[#f5ebd6]" style={{ left: "6.4%", top: "15%", width: "45.7%", height: "43.7%", fontFamily: F.sy, fontWeight: 800, fontSize: "clamp(60px,9vw,150px)" }}>
              SLOW
            </div>
            <div className="absolute flex items-center justify-center rounded-[50%] border-[10px] border-[#b98a22] bg-[#eeae38] text-[#29427f] outline-dashed outline-2 outline-offset-[-22px] outline-[#f5ebd6]" style={{ left: "57.9%", top: "11.2%", width: "35.7%", height: "52.5%", fontFamily: F.fr, fontStyle: "italic", fontWeight: 600, fontSize: "clamp(50px,7vw,120px)" }}>
              made
            </div>
            <div className="absolute flex items-center justify-center rounded-full border-[10px] border-[#1d2f63] bg-[#29427f] text-[#f5ebd6]" style={{ left: "27.1%", top: "70%", width: "45.7%", height: "20%", fontFamily: F.sg, fontWeight: 700, fontSize: "clamp(24px,3vw,52px)" }}>
              EST · 2026
            </div>
          </div>
        </div>
        <canvas ref={cv} className="absolute inset-0 h-full w-full transition-opacity duration-500" style={{ opacity: 0 }} aria-hidden />
      </div>
      <div className="pointer-events-none absolute left-[5%] top-[6%]">
        <Eyebrow>Patch collection · hand-finished</Eyebrow>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U219 · Spider leg cursor ───────────────────────── */
const U219_ANG = [-160, -122, -58, -20, 20, 58, 122, 160].map((a) => (a * Math.PI) / 180);
const U219_L1 = 78;
const U219_L2 = 86;
type U219Leg = { fx: number; fy: number; ox: number; oy: number; nx: number; ny: number; t: number; step: boolean; idx: number };
function U219() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const S = useRef({ W: 0, H: 0, pts: [] as [number, number][], legs: [] as U219Leg[], bx: -1, by: -1 });
  const build = (W: number, H: number) => {
    const s = S.current;
    s.W = W;
    s.H = H;
    const pts: [number, number][] = [];
    const g = 64;
    let k = 0;
    for (let y = g / 2; y < H; y += g)
      for (let x = g / 2; x < W; x += g) {
        k++;
        pts.push([x + Math.sin(k * 12.9898) * 20, y + Math.cos(k * 78.233) * 20]);
      }
    s.pts = pts;
    s.legs = [];
  };
  const nearest = (x: number, y: number) => {
    const s = S.current;
    let best = 0;
    let bd = 1e12;
    s.pts.forEach(([px, py], i) => {
      const d = (px - x) ** 2 + (py - y) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  };
  usePointer(
    root,
    dot,
    (t, el) => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const tt = t * 0.62 + Math.sin(t * 0.9) * 0.35;
      return { x: W * (0.5 + 0.38 * Math.sin(tt)), y: H * (0.52 + 0.3 * Math.sin(tt * 2)), inside: true };
    },
    (p, el, _fake, _t, dt) => {
      const c = cv.current;
      if (!c) return;
      const W = el.clientWidth;
      const H = el.clientHeight;
      const s = S.current;
      if (c.width !== W || c.height !== H) {
        c.width = W;
        c.height = H;
      }
      if (s.W !== W || s.H !== H) build(W, H);
      if (s.bx < 0) {
        s.bx = p.x;
        s.by = p.y;
      }
      const k = 1 - Math.exp(-dt * 9);
      s.bx += (p.x - s.bx) * k;
      s.by += (p.y - s.by) * k;
      const bx = s.bx;
      const by = s.by;
      if (!s.legs.length)
        s.legs = U219_ANG.map((a) => {
          const i = nearest(bx + Math.cos(a) * 110, by + Math.sin(a) * 110);
          const [fx, fy] = s.pts[i];
          return { fx, fy, ox: fx, oy: fy, nx: fx, ny: fy, t: 1, step: false, idx: i };
        });
      // stepping: a leg re-plants when its foot is too far from where it wants to be; neighbours never step together
      s.legs.forEach((L, i) => {
        if (L.step) {
          L.t = Math.min(1, L.t + dt / 0.13);
          const e = easeIO(L.t);
          L.fx = lerp(L.ox, L.nx, e);
          L.fy = lerp(L.oy, L.ny, e);
          if (L.t >= 1) L.step = false;
          return;
        }
        const a = U219_ANG[i];
        const wx = bx + Math.cos(a) * 110;
        const wy = by + Math.sin(a) * 110;
        const far = Math.hypot(L.fx - wx, L.fy - wy) > 78 || Math.hypot(L.fx - bx, L.fy - by) > U219_L1 + U219_L2 - 8;
        const nb = s.legs[(i + 1) % 8].step || s.legs[(i + 7) % 8].step;
        if (far && !nb) {
          const vx = p.x - bx;
          const vy = p.y - by;
          const j = nearest(wx + vx * 0.6, wy + vy * 0.6);
          if (j === L.idx) return;
          L.idx = j;
          L.ox = L.fx;
          L.oy = L.fy;
          [L.nx, L.ny] = s.pts[j];
          L.t = 0;
          L.step = true;
        }
      });
      const x = c.getContext("2d")!;
      x.clearRect(0, 0, W, H);
      const grip = new Set(s.legs.map((L) => L.idx));
      s.pts.forEach(([px, py], i) => {
        const dd = Math.hypot(px - bx, py - by);
        const a = grip.has(i) ? 0.95 : Math.max(0.14, 0.5 - dd / 700);
        x.fillStyle = grip.has(i) ? `rgba(255,214,120,${a})` : `rgba(220,228,255,${a})`;
        x.beginPath();
        x.arc(px, py, grip.has(i) ? 3.6 : 2, 0, Math.PI * 2);
        x.fill();
      });
      x.lineCap = "round";
      x.lineJoin = "round";
      s.legs.forEach((L, i) => {
        const a = U219_ANG[i];
        const hx = bx + Math.cos(a) * 10;
        const hy = by + Math.sin(a) * 10;
        let fx = L.fx;
        let fy = L.fy;
        if (L.step) fy -= Math.sin(L.t * Math.PI) * 16;
        let dx = fx - hx;
        let dy = fy - hy;
        let d = Math.hypot(dx, dy) || 1;
        const maxD = U219_L1 + U219_L2 - 1;
        if (d > maxD) {
          fx = hx + (dx / d) * maxD;
          fy = hy + (dy / d) * maxD;
          dx = fx - hx;
          dy = fy - hy;
          d = maxD;
        }
        const along = (d * d + U219_L1 * U219_L1 - U219_L2 * U219_L2) / (2 * d);
        const hgt = Math.sqrt(Math.max(0, U219_L1 * U219_L1 - along * along));
        const ux = dx / d;
        const uy = dy / d;
        const k1x = hx + ux * along - uy * hgt;
        const k1y = hy + uy * along + ux * hgt;
        const k2x = hx + ux * along + uy * hgt;
        const k2y = hy + uy * along - ux * hgt;
        const far1 = Math.hypot(k1x - bx, k1y - by) > Math.hypot(k2x - bx, k2y - by);
        const kx = far1 ? k1x : k2x;
        const ky = far1 ? k1y : k2y;
        x.strokeStyle = "rgba(255,214,120,.16)";
        x.lineWidth = 8;
        x.beginPath();
        x.moveTo(hx, hy);
        x.lineTo(kx, ky);
        x.lineTo(fx, fy);
        x.stroke();
        x.strokeStyle = "#f3f5ff";
        x.lineWidth = 2.4;
        x.beginPath();
        x.moveTo(hx, hy);
        x.lineTo(kx, ky);
        x.lineTo(fx, fy);
        x.stroke();
        x.fillStyle = "#ffd678";
        x.beginPath();
        x.arc(kx, ky, 3, 0, Math.PI * 2);
        x.fill();
      });
      const gr = x.createRadialGradient(bx, by, 0, bx, by, 40);
      gr.addColorStop(0, "rgba(255,214,120,.55)");
      gr.addColorStop(1, "rgba(255,214,120,0)");
      x.fillStyle = gr;
      x.beginPath();
      x.arc(bx, by, 40, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = "#ffd678";
      x.beginPath();
      x.ellipse(bx, by, 13, 16, Math.atan2(p.y - by, p.x - bx) + Math.PI / 2, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = "#0a0d16";
      x.beginPath();
      x.arc(bx, by, 4, 0, Math.PI * 2);
      x.fill();
    },
  );
  return (
    <Stage r={root} g1="rgba(255,214,120,.5)" g2="rgba(140,120,255,.22)">
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <Eyebrow>Night market · after dark</Eyebrow>
        <h3 className="mt-4 max-w-[14ch] text-[clamp(48px,5.6vw,92px)] leading-[0.95] tracking-[-0.03em] text-white/90" style={{ fontFamily: F.is }}>
          Crawl the new collection
        </h3>
      </div>
      <canvas ref={cv} className="u219-cv" aria-hidden />
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U220 · Repelling labels ───────────────────────── */
const U220_L = [
  { t: "Linen", h: [0.2, 0.26] },
  { t: "₹2,490", h: [0.33, 0.2] },
  { t: "New in", h: [0.66, 0.2] },
  { t: "Sun-faded", h: [0.8, 0.27] },
  { t: "Oversized", h: [0.15, 0.48] },
  { t: "Organic cotton", h: [0.27, 0.68] },
  { t: "Only 4 left", h: [0.84, 0.5] },
  { t: "Indigo", h: [0.72, 0.7] },
  { t: "Free returns", h: [0.47, 0.8] },
  { t: "Hand-dyed", h: [0.58, 0.28] },
  { t: "Relaxed fit", h: [0.4, 0.3] },
  { t: "Size M", h: [0.12, 0.8] },
  { t: "Ships in 48 h", h: [0.88, 0.8] },
  { t: "Breathable", h: [0.6, 0.72] },
];
function U220() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const S = useRef({ init: false, b: U220_L.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, w: 0, h: 0 })) });
  usePointer(
    root,
    dot,
    (t, el) => {
      const tt = t * 0.75;
      return { x: el.clientWidth * (0.5 + 0.4 * Math.sin(tt)), y: el.clientHeight * (0.5 + 0.32 * Math.sin(tt * 2 + 0.6)), inside: true };
    },
    (p, el, _fake, _t, dt) => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const s = S.current;
      const ls = all(el, ".u220-l");
      if (!s.init) {
        s.init = true;
        ls.forEach((l, i) => {
          s.b[i].w = l.offsetWidth;
          s.b[i].h = l.offsetHeight;
        });
      }
      if (field.current) field.current.style.transform = `translate3d(${(p.x - 120).toFixed(1)}px,${(p.y - 120).toFixed(1)}px,0)`;
      const R = 120;
      const B = s.b;
      const n = B.length;
      const sub = 2;
      const h = dt / sub;
      for (let st = 0; st < sub; st++) {
        const ax = new Array(n).fill(0);
        const ay = new Array(n).fill(0);
        const cx = B.map((b, i) => U220_L[i].h[0] * W + b.x);
        const cy = B.map((b, i) => U220_L[i].h[1] * H + b.y);
        for (let i = 0; i < n; i++) {
          // home spring
          ax[i] -= B[i].x * 7;
          ay[i] -= B[i].y * 7;
          // pointer push
          if (p.inside) {
            const dx = cx[i] - p.x;
            const dy = cy[i] - p.y;
            const reach = R + Math.max(B[i].w, B[i].h) * 0.35;
            const d = Math.hypot(dx, dy) || 1;
            if (d < reach) {
              const f = ((reach - d) / reach) * 2600;
              ax[i] += (dx / d) * f;
              ay[i] += (dy / d) * f;
            }
          }
          // label-to-label (box overlap, push along the shallower axis)
          for (let j = i + 1; j < n; j++) {
            const dx = cx[j] - cx[i];
            const dy = cy[j] - cy[i];
            const ox = (B[i].w + B[j].w) / 2 + 14 - Math.abs(dx);
            const oy = (B[i].h + B[j].h) / 2 + 12 - Math.abs(dy);
            if (ox > 0 && oy > 0) {
              const k = 60;
              if (ox / (B[i].w + B[j].w) < oy / (B[i].h + B[j].h)) {
                const f = ox * k * (dx >= 0 ? 1 : -1);
                ax[i] -= f;
                ax[j] += f;
              } else {
                const f = oy * k * (dy >= 0 ? 1 : -1);
                ay[i] -= f;
                ay[j] += f;
              }
            }
          }
        }
        for (let i = 0; i < n; i++) {
          const b = B[i];
          b.vx = (b.vx + ax[i] * h) * Math.exp(-h * 5.5);
          b.vy = (b.vy + ay[i] * h) * Math.exp(-h * 5.5);
          b.x += b.vx * h;
          b.y += b.vy * h;
        }
      }
      ls.forEach((l, i) => {
        const b = B[i];
        l.style.transform = `translate(-50%,-50%) translate3d(${b.x.toFixed(1)}px,${b.y.toFixed(1)}px,0) rotate(${clamp(b.vx * 0.02, -8, 8).toFixed(2)}deg)`;
      });
    },
  );
  return (
    <Stage r={root} g1="rgba(110,200,255,.5)" g2="rgba(255,170,120,.22)">
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <Eyebrow>Summer shirt · 03</Eyebrow>
        <h3 className="mt-3 text-[clamp(44px,4.8vw,78px)] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.sg, fontWeight: 700 }}>
          Every detail,
          <br />
          give it room
        </h3>
      </div>
      <div ref={field} className="pointer-events-none absolute left-0 top-0 h-[240px] w-[240px] rounded-full border border-white/15" style={{ background: "radial-gradient(closest-side,rgba(110,200,255,.14),transparent)" }} aria-hidden />
      {U220_L.map((l, i) => (
        <span
          key={l.t}
          className="u220-l absolute whitespace-nowrap rounded-full border border-white/20 bg-[#121827]/90 px-5 py-2.5 text-[16px] text-white/90 shadow-[0_10px_30px_rgba(0,0,0,.35)]"
          style={{ left: `${l.h[0] * 100}%`, top: `${l.h[1] * 100}%`, transform: "translate(-50%,-50%)", fontFamily: F.mr, fontWeight: 600, color: i % 4 === 1 ? "#9fdcff" : undefined }}
        >
          {l.t}
        </span>
      ))}
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U221 · Pull-cord light switch ───────────────────────── */
function U221() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cord = useRef<SVGPathElement>(null);
  const bead = useRef<SVGGElement>(null);
  const sline = useRef<SVGLineElement>(null);
  const M = useMouse(root);
  const S = useRef({ init: false, x: 0, y: 0, vx: 0, vy: 0, grab: false, realGrab: false, dx: -1, dy: -1, sx: 0, sy: 0, cyc: -1, ev: 0, on: false, lx: 0, ly: 0 });
  const toggle = () => {
    const el = root.current;
    const s = S.current;
    if (!el) return;
    s.on = !s.on;
    el.querySelector(".u221")?.classList.toggle("on", s.on);
  };
  const release = () => {
    const s = S.current;
    const el = root.current;
    if (!s.grab || !el) return;
    s.grab = false;
    const H = el.clientHeight;
    if (s.y - H * 0.42 > 45) toggle();
  };
  useEffect(() => {
    const s = S.current;
    const up = () => {
      if (!s.realGrab) return;
      s.realGrab = false;
      release();
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);
  useTicker(root, (t, rawDt) => {
    const el = root.current;
    if (!el) return;
    const s = S.current;
    const dt = Math.min(rawDt, 0.05);
    const W = el.clientWidth;
    const H = el.clientHeight;
    const ax = W * 0.66;
    const ay = H * 0.2;
    const restY = H * 0.42;
    if (!s.init) {
      s.init = true;
      if (sline.current) sline.current.style.visibility = "hidden";
      if (bead.current) bead.current.style.transform = "";
      s.x = ax;
      s.y = restY;
      s.dx = W * 0.85;
      s.dy = H * 0.8;
    }
    const m = M.current;
    const real = isReal(m);
    const d = dot.current;
    let tx = s.x;
    let ty = s.y;
    if (real) {
      if (s.grab && !s.realGrab) release();
      tx = m.x;
      ty = m.y;
    } else {
      const T = 2.9;
      const cyc = Math.floor(t / T);
      const tc = t - cyc * T;
      if (cyc !== s.cyc) {
        s.cyc = cyc;
        s.ev = 0;
      }
      const k = (r: number) => 1 - Math.exp(-dt * r);
      if (tc < 0.5) {
        s.dx = lerp(s.dx, s.x, k(10));
        s.dy = lerp(s.dy, s.y, k(10));
      } else if (tc < 1.05) {
        if (s.ev === 0) {
          s.ev = 1;
          s.grab = true;
          s.sx = s.dx;
          s.sy = s.dy;
          d?.classList.add("press");
        }
        const f = easeIO((tc - 0.5) / 0.55);
        s.dx = lerp(s.sx, ax + (cyc % 2 ? -34 : 34), f);
        s.dy = lerp(s.sy, restY + 115, f);
      } else {
        if (s.ev === 1) {
          s.ev = 2;
          release();
          d?.classList.remove("press");
        }
        const side = cyc % 2 ? 1 : -1;
        s.dx = lerp(s.dx, ax + side * W * 0.18 + Math.sin(t * 2) * 24, k(3.2));
        s.dy = lerp(s.dy, H * 0.62 + Math.cos(t * 1.6) * 30, k(3.2));
      }
      tx = s.dx;
      ty = s.dy;
    }
    if (d) {
      d.style.transform = `translate3d(${s.dx.toFixed(1)}px,${s.dy.toFixed(1)}px,0)`;
      d.style.opacity = real ? "0" : "1";
    }
    // bead physics: held → follows the pointer; free → springs back (soft sideways = swing, stiff vertical = bounce)
    if (s.grab) {
      const nx = clamp(tx, ax - 160, ax + 160);
      const ny = clamp(ty, restY - 30, restY + 170);
      s.vx = (nx - s.x) / Math.max(dt, 1e-3);
      s.vy = (ny - s.y) / Math.max(dt, 1e-3);
      s.x = nx;
      s.y = ny;
    } else {
      const sub = 3;
      const h = dt / sub;
      for (let i = 0; i < sub; i++) {
        const fx = -(s.x - ax) * 34 - s.vx * 1.4;
        const fy = -(s.y - restY) * 150 - s.vy * 7;
        s.vx += fx * h;
        s.vy += fy * h;
        s.x += s.vx * h;
        s.y += s.vy * h;
      }
    }
    const len = Math.hypot(s.x - ax, s.y - ay);
    const restLen = restY - ay;
    const slack = Math.max(0, restLen - len) * 0.6 + Math.abs(s.vx) * 0.02;
    const mx = (ax + s.x) / 2 + slack * (s.vx >= 0 ? -1 : 1);
    const my = (ay + s.y) / 2;
    cord.current?.setAttribute("d", `M${ax.toFixed(1)} ${ay.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${s.x.toFixed(1)} ${(s.y - 16).toFixed(1)}`);
    const ang = (-Math.atan2(s.x - ax, s.y - ay) * 180) / Math.PI;
    bead.current?.setAttribute("transform", `translate(${s.x.toFixed(1)} ${s.y.toFixed(1)}) rotate(${ang.toFixed(2)})`);
  });
  const onDown = () => {
    const s = S.current;
    s.realGrab = true;
    s.grab = true;
  };
  return (
    <Stage r={root} g1="rgba(255,206,120,.52)" g2="rgba(120,150,255,.22)">
      <div className="u221 absolute inset-0">
        <div className="u221-day" />
        <div className="u221-cone pointer-events-none absolute left-[38%] top-[20%] h-[80%] w-[24%]" style={{ background: "linear-gradient(180deg,rgba(255,236,170,.75),rgba(255,236,170,0))", clipPath: "polygon(38% 0,62% 0,100% 100%,0 100%)" }} aria-hidden />
        <div className="absolute left-[50%] top-0 h-[12%] w-[2px] bg-[#1b1610]/60" />
        <svg className="absolute left-[50%] top-[11%] overflow-visible" width={1} height={1} aria-hidden>
          <path d="M-70 60 Q-64 0 0 0 Q64 0 70 60 Z" fill="#2a2d36" stroke="#4a4f5c" strokeWidth={2} />
          <ellipse className="u221-bulb" cx={0} cy={62} rx={30} ry={14} fill="#4b4e58" />
        </svg>
        <div className="absolute left-[6%] top-1/2 max-w-[min(30%,400px)]" style={{ transform: "translateY(-50%)" }}>
          <p className="u221-sub text-[13px] uppercase tracking-[0.22em] text-white/55" style={{ fontFamily: F.sg }}>
            Pendant No. 6 · brass
          </p>
          <h3 className="u221-ink mt-3 text-[clamp(40px,4vw,64px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Pull for daylight
          </h3>
          <p className="u221-sub mt-4 text-[17px] text-white/60" style={{ fontFamily: F.mr }}>
            Hand-spun shade · ₹7,450
          </p>
        </div>
        <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <line ref={sline} x1="66%" y1="20%" x2="66%" y2="40%" stroke="#d8c7a0" strokeWidth={3} />
          <path ref={cord} d="" fill="none" stroke="#d8c7a0" strokeWidth={3} strokeLinecap="round" />
          <g ref={bead} className="cursor-grab" style={{ pointerEvents: "auto", transform: "translate(66%,42%)" }} onPointerDown={onDown}>
            <rect x={-4} y={-22} width={8} height={10} rx={2} fill="#b89a62" />
            <ellipse cx={0} cy={2} rx={15} ry={18} fill="#c9a46a" stroke="#8a6a3a" strokeWidth={2} />
            <ellipse cx={-5} cy={-4} rx={4} ry={6} fill="#fff" opacity={0.35} />
          </g>
        </svg>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U222 · God-ray toggle ───────────────────────── */
const U222_M = Array.from({ length: 14 }, (_, i) => ({ l: 30 + ((i * 37) % 40), t: 30 + ((i * 23) % 50), d: (i * 0.37) % 5 }));
function U222() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const on = useRef(false);
  const set = (v: boolean) => {
    const el = root.current?.querySelector(".u222");
    if (!el) return;
    on.current = v;
    el.classList.toggle("on", v);
    const stt = el.querySelector(".u222-st");
    if (stt) stt.textContent = v ? "Key light on" : "Key light off";
    el.querySelector(".u222-trk")?.setAttribute("aria-checked", String(v));
    const fl = el.querySelector(".u222-flash");
    if (fl && !prefersReducedMotion()) gsap.fromTo(fl, { opacity: v ? 0.7 : 0.25, scale: 0.6 }, { opacity: 0, scale: 1.6, duration: 0.7, ease: "power2.out", overwrite: true });
  };
  usePlay(root, (el) => {
    const trk = one(el, ".u222-trk");
    const d = dot.current;
    const tl = gsap.timeline({ repeat: -1 });
    [true, false].forEach((v, k) => {
      tl.call(() => goDot(d, el, one(trk, ".u222-knob"), 0.42, idle()));
      tl.to({}, { duration: 0.46 });
      tl.call(() => {
        if (!idle()) return;
        tapDot(d);
        set(v);
      });
      tl.to({}, { duration: 0.3 });
      tl.call(() => {
        const [x, y] = mid(rel(trk, el));
        goDot(d, el, [x + (k ? -210 : 210), y + 90], 0.5, idle());
      });
      tl.to({}, { duration: 0.6 });
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,196,120,.5)" g2="rgba(120,150,220,.22)">
      <div className="u222 absolute inset-0">
        <div className="u222-rays" aria-hidden>
          <div className="u222-r1" />
          <div className="u222-r2" />
        </div>
        {U222_M.map((m, i) => (
          <span key={i} className="u222-mote" style={{ left: `${m.l}%`, top: `${m.t}%`, animationDelay: `-${m.d}s` }} aria-hidden />
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Eyebrow>Scene 04 · studio lights</Eyebrow>
          <h3 className="mt-3 text-[clamp(40px,4.2vw,66px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.is }}>
            Set the mood
          </h3>
          <div className="relative mt-10">
            <span className="u222-flash pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[420px] rounded-full opacity-0" style={{ margin: "-110px 0 0 -210px", background: "radial-gradient(closest-side,rgba(255,220,160,.9),transparent)" }} aria-hidden />
            <button type="button" role="switch" aria-checked={false} aria-label="Key light" className="u222-trk" onClick={() => set(!on.current)}>
              <span className="u222-knob" />
            </button>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <span className="u222-led" />
            <span className="u222-st text-[15px] uppercase tracking-[0.2em] text-white/60" style={{ fontFamily: F.sg }}>
              Key light off
            </span>
          </div>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U223 · Liquid slosh button (WebGL) ───────────────────────── */
const U223_FRAG = /* glsl */ `
uniform float uTilt, uSlosh, uSplash, uSplashT, uSplashX;
void main() {
  vec2 p = vUv;
  float asp = uRes.x / uRes.y;
  float x = p.x;
  float lvl = 0.46;
  float amp = 0.014 + uSlosh * 0.06;
  float w = uTilt * (x - 0.5) * 0.9 + sin(x * 6.0 + uTime * 2.6) * amp + sin(x * 11.0 - uTime * 3.7) * amp * 0.6;
  float d = abs(x - uSplashX) * asp;
  float front = smoothstep(0.0, 0.25, uSplashT * 1.55 - d);
  w += uSplash * 0.14 * exp(-d * 1.4) * sin(d * 9.0 - uSplashT * 14.0) * front;
  w += uSplash * 0.2 * exp(-d * d * 30.0) * sin(min(uSplashT * 10.0, 3.1416));
  float s = lvl + w;
  float aa = 1.5 / uRes.y;
  float inside = smoothstep(s + aa, s - aa, p.y);
  float depth = clamp((s - p.y) / max(s, 0.01), 0.0, 1.0);
  vec3 ink = mix(vec3(0.12, 0.13, 0.24), vec3(0.03, 0.035, 0.07), depth);
  ink += vec3(0.32, 0.38, 0.62) * exp(-abs(p.y - s) * uRes.y * 0.09) * 0.7;
  vec2 g = vec2(p.x * asp * 16.0, p.y * 16.0 - uTime * 1.4);
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float rnd = fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453);
  float bub = smoothstep(0.1, 0.05, length(f + vec2(sin(uTime + rnd * 6.28) * 0.2, 0.0))) * step(0.84, rnd);
  ink += bub * 0.22 * depth;
  float drops = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float tt = uSplashT;
    vec2 dp = vec2(uSplashX + (fi - 1.0) * 0.07 * tt, lvl + (1.0 + fi * 0.2) * tt - 2.6 * tt * tt);
    float dd = length((p - dp) * uRes);
    drops += smoothstep(7.0, 5.0, dd) * step(0.04, uSplash) * step(lvl - 0.02, dp.y);
  }
  vec3 glass = vec3(0.95, 0.93, 0.88);
  vec3 col = mix(glass, ink, max(inside, clamp(drops, 0.0, 1.0)));
  gl_FragColor = vec4(col, 1.0);
}`;
function U223() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const near = useNear(root);
  const S = useRef({ tilt: 0, tv: 0, slosh: 0, splash: 0, splashT: 9, splashX: 0.5, lx: -1, tap: -1 });
  const splash = (xr: number) => {
    const s = S.current;
    s.splash = 1;
    s.splashT = 0;
    s.splashX = clamp(xr, 0.05, 0.95);
    const b = btn.current;
    if (b && !prefersReducedMotion()) gsap.fromTo(b, { scale: 0.97 }, { scale: 1, duration: 0.5, ease: "back.out(3)", overwrite: true });
  };
  useEffect(() => {
    const c = cv.current;
    if (!near || !c) return;
    let dead = false;
    let h: GLHandle | null = null;
    (async () => {
      h = await createShader(c, U223_FRAG, {
        dpr: 1,
        uniforms: { uTilt: { value: 0 }, uSlosh: { value: 0 }, uSplash: { value: 0 }, uSplashT: { value: 9 }, uSplashX: { value: 0.5 } },
        onFrame: (u) => {
          const s = S.current;
          u.uTilt.value = s.tilt;
          u.uSlosh.value = s.slosh;
          u.uSplash.value = s.splash;
          u.uSplashT.value = s.splashT;
          u.uSplashX.value = s.splashX;
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
    (t, el) => {
      const b = btn.current;
      if (!b) return { x: 0, y: 0, inside: true };
      const [cx, cy] = mid(rel(b, el));
      const w = b.offsetWidth;
      const hh = b.offsetHeight;
      return { x: cx + w * 0.44 * Math.sin(t * 1.6) + Math.sin(t * 4.1) * 10, y: cy + hh * 0.42 * Math.sin(t * 3.2), inside: true };
    },
    (p, el, fake, t, dt) => {
      const s = S.current;
      const b = btn.current;
      if (!b) return;
      if (s.lx < 0) s.lx = p.x;
      const vx = (p.x - s.lx) / Math.max(dt, 1e-3);
      s.lx = p.x;
      const target = clamp(-vx / 1700, -0.45, 0.45);
      s.tv += (-(s.tilt - target) * 70 - s.tv * 5) * dt;
      s.tilt += s.tv * dt;
      s.slosh += (Math.min(1, Math.abs(vx) / 1400) - s.slosh) * Math.min(1, dt * 3);
      s.splash *= Math.exp(-dt * 1.1);
      s.splashT += dt;
      if (fake) {
        const k = Math.floor((t + 0.6) / 2.2);
        if (k !== s.tap && t > 1) {
          s.tap = k;
          const bx = rel(b, el);
          if (inBox(bx, p.x, p.y)) {
            tapDot(dot.current);
            splash((p.x - bx.l) / bx.w);
          }
        }
      }
    },
  );
  return (
    <Stage r={root} g1="rgba(120,140,255,.52)" g2="rgba(255,190,140,.22)">
      <div className="flex h-full w-full items-center justify-center gap-[6%]">
        <div className="h-[70%] w-[min(24%,300px)] overflow-hidden rounded-[24px] border border-white/10">
          <Img i={1} w={500} h={760} />
        </div>
        <div className="w-[min(46%,600px)]">
          <Eyebrow>Cold brew concentrate · 500 ml</Eyebrow>
          <h3 className="mt-3 text-[clamp(40px,4.2vw,66px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.sy, fontWeight: 700 }}>
            Midnight Pour
          </h3>
          <p className="mt-4 text-[17px] text-white/60" style={{ fontFamily: F.mr }}>
            Slow-steeped for 18 hours. Shake it, pour it, keep it cold.
          </p>
          <button
            ref={btn}
            type="button"
            className="relative mt-10 flex h-[150px] w-full items-center justify-center overflow-hidden rounded-full border border-white/25"
            style={{ background: "linear-gradient(180deg,#f2efe8 0 54%,#14172b 54% 100%)" }}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              splash((e.clientX - r.left) / r.width);
            }}
          >
            <canvas ref={cv} className="absolute inset-0 h-full w-full transition-opacity duration-500" style={{ opacity: 0 }} aria-hidden />
            <span className="relative z-10 text-[30px] tracking-[-0.01em] text-white" style={{ fontFamily: F.sg, fontWeight: 700, mixBlendMode: "difference" }}>
              Add to bag · ₹1,190
            </span>
          </button>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U224 · Elastic drag-off stack ───────────────────────── */
const U224_C = [
  { n: "Terracotta vase", p: "₹2,350", i: 3 },
  { n: "Ash bowl set", p: "₹1,780", i: 0 },
  { n: "Moss planter", p: "₹1,240", i: 2 },
  { n: "Ember lamp", p: "₹4,990", i: 1 },
  { n: "Dune tray", p: "₹960", i: 3 },
];
const U224_GAP = 16;
function U224() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const S = useRef({ order: U224_C.map((_, i) => i), busy: false, real: false, x0: 0, y0: 0, dx: 0, dy: 0 });
  const cards = () => (root.current ? all(root.current, ".u224-c") : []);
  const layout = (ease = "elastic.out(1,0.5)", dur = 0.9) => {
    const cs = cards();
    S.current.order.forEach((ci, d) => {
      gsap.to(cs[ci], { x: 0, y: d * U224_GAP, scale: 1 - d * 0.05, rotation: 0, opacity: d < 4 ? 1 : 0, zIndex: 10 - d, duration: dur, ease, overwrite: "auto" });
    });
  };
  const drag = (dx: number, dy: number) => {
    const cs = cards();
    S.current.order.forEach((ci, d) => {
      if (d === 0) gsap.set(cs[ci], { x: dx, y: dy, rotation: dx * 0.06, overwrite: "auto" });
      else if (d < 4) gsap.to(cs[ci], { x: dx * Math.pow(0.5, d), y: d * U224_GAP + dy * Math.pow(0.5, d), rotation: dx * 0.06 * Math.pow(0.4, d), duration: 0.9, ease: "elastic.out(1,0.45)", overwrite: "auto" });
    });
  };
  const drop = (dx: number, dy: number) => {
    const s = S.current;
    const cs = cards();
    if (Math.abs(dx) < 150) {
      layout();
      return;
    }
    const top = cs[s.order[0]];
    const sg = dx > 0 ? 1 : -1;
    s.busy = true;
    gsap.to(top, {
      x: sg * 700,
      y: dy * 1.6 - 40,
      rotation: sg * 32,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
      overwrite: "auto",
      onComplete: () => {
        s.order.push(s.order.shift()!);
        gsap.set(top, { x: 0, y: 4 * U224_GAP, scale: 0.8, rotation: 0, zIndex: 1 });
        layout("back.out(1.8)", 0.55);
        s.busy = false;
      },
    });
  };
  useEffect(() => {
    const s = S.current;
    const up = () => {
      if (!s.real) return;
      s.real = false;
      drop(s.dx, s.dy);
    };
    const mv = (e: PointerEvent) => {
      if (!s.real) return;
      s.dx = e.clientX - s.x0;
      s.dy = e.clientY - s.y0;
      drag(s.dx, s.dy);
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointermove", mv);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointermove", mv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  usePlay(root, (el) => {
    const d = dot.current;
    const p = { dx: 0, dy: 0 };
    const topCard = () => cards()[S.current.order[0]];
    const follow = () => {
      if (!d || !idle()) return;
      const [x, y] = mid(rel(topCard(), el));
      gsap.set(d, { x, y: y + 40 });
    };
    const tl = gsap.timeline({ repeat: -1 });
    const pull = (tx: number, ty: number, dur: number) => {
      tl.call(() => {
        p.dx = 0;
        p.dy = 0;
        if (idle()) d?.classList.add("press");
      });
      tl.to(p, {
        dx: tx,
        dy: ty,
        duration: dur,
        ease: "power2.inOut",
        onUpdate: () => {
          if (!idle() || S.current.busy) return;
          drag(p.dx, p.dy);
          follow();
        },
      });
      tl.call(() => {
        d?.classList.remove("press");
        if (idle() && !S.current.busy) drop(p.dx, p.dy);
      });
    };
    tl.call(() => goDot(d, el, [mid(rel(topCard(), el))[0], mid(rel(topCard(), el))[1] + 40], 0.4, idle()));
    tl.to({}, { duration: 0.42 });
    pull(110, 20, 0.5);
    tl.call(() => {
      const [x, y] = mid(rel(topCard(), el));
      goDot(d, el, [x - 20, y + 40], 0.45, idle());
    });
    tl.to({}, { duration: 0.5 });
    pull(-260, 40, 0.55);
    tl.to({}, { duration: 0.15 });
    tl.call(() => {
      const [x, y] = mid(rel(topCard(), el));
      goDot(d, el, [x + 230, y + 120], 0.5, idle());
    });
    tl.to({}, { duration: 0.55 });
    return tl;
  });
  const onDown = (e: React.PointerEvent, ci: number) => {
    const s = S.current;
    if (s.order[0] !== ci || s.busy) return;
    s.real = true;
    s.x0 = e.clientX;
    s.y0 = e.clientY;
    s.dx = 0;
    s.dy = 0;
  };
  return (
    <Stage r={root} g1="rgba(255,150,100,.5)" g2="rgba(120,220,180,.22)">
      <div className="flex h-full w-full items-center justify-center gap-[8%]">
        <div className="max-w-[min(30%,380px)]">
          <Eyebrow>Ceramics · weekly pick</Eyebrow>
          <h3 className="mt-3 text-[clamp(40px,4vw,62px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Swipe the shelf
          </h3>
          <p className="mt-4 text-[17px] text-white/60" style={{ fontFamily: F.mr }}>
            Pull a card past the line to send it off. The rest follow on a spring.
          </p>
        </div>
        <div className="relative h-[420px] w-[300px]">
          {U224_C.map((c, k) => (
            <div
              key={c.n}
              className="u224-c absolute inset-x-0 top-0 h-[360px] cursor-grab touch-none select-none overflow-hidden rounded-[22px] border border-white/15 bg-[#151a28] shadow-[0_24px_60px_rgba(0,0,0,.45)]"
              style={{ transform: `translateY(${Math.min(k, 4) * U224_GAP}px) scale(${1 - Math.min(k, 4) * 0.05})`, zIndex: 10 - k, opacity: k < 4 ? 1 : 0 }}
              onPointerDown={(e) => onDown(e, k)}
            >
              <div className="h-[260px]">
                <Img i={c.i} w={600} h={520} />
              </div>
              <div className="flex items-end justify-between px-5 py-4">
                <p className="text-[19px] font-[600]" style={{ fontFamily: F.sg }}>
                  {c.n}
                </p>
                <p className="text-[16px] text-white/70" style={{ fontFamily: F.mr }}>
                  {c.p}
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

/* ───────────────────────── U225 · Trampoline drag ───────────────────────── */
function U225() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const line = useRef<SVGPathElement>(null);
  const glowLine = useRef<SVGPathElement>(null);
  const posts = useRef<SVGGElement>(null);
  const sl = useRef<SVGLineElement>(null);
  const M = useMouse(root);
  const S = useRef({ y: 0, v: 0, sag: 0, sv: 0, grab: false, realGrab: false, y0: 0, gy: 0, dx: -1, dy: -1, sx: 0, sy: 0, cyc: -1, ev: 0, rot: 0 });
  const release = () => {
    const s = S.current;
    if (!s.grab) return;
    s.grab = false;
    s.v = 0;
  };
  useEffect(() => {
    const s = S.current;
    const up = () => {
      if (!s.realGrab) return;
      s.realGrab = false;
      release();
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);
  useTicker(root, (t, rawDt) => {
    const el = root.current;
    const st = stack.current;
    if (!el || !st) return;
    const s = S.current;
    const dt = Math.min(rawDt, 0.05);
    const W = el.clientWidth;
    const H = el.clientHeight;
    const ly = H * 0.74;
    const x0 = W * 0.42;
    const x1 = W * 0.9;
    const cx = (x0 + x1) / 2;
    const CH = st.offsetHeight;
    const m = M.current;
    const real = isReal(m);
    const d = dot.current;
    if (s.dx < 0) {
      s.dx = W * 0.9;
      s.dy = H * 0.3;
      if (sl.current) sl.current.style.visibility = "hidden";
    }
    let ty = 0;
    if (real) {
      if (s.grab && !s.realGrab) release();
      ty = m.y - s.gy;
    } else {
      const T = 3.6;
      const cyc = Math.floor(t / T);
      const tc = t - cyc * T;
      if (cyc !== s.cyc) {
        s.cyc = cyc;
        s.ev = 0;
      }
      const k = (r: number) => 1 - Math.exp(-dt * r);
      const cardMidY = ly + s.y - CH / 2;
      if (tc < 0.45) {
        s.dx = lerp(s.dx, cx, k(10));
        s.dy = lerp(s.dy, cardMidY, k(10));
      } else if (tc < 1.05) {
        if (s.ev === 0) {
          s.ev = 1;
          s.grab = true;
          s.gy = s.dy - (ly + s.y);
          s.sx = s.dx;
          s.sy = s.dy;
          d?.classList.add("press");
        }
        const f = easeIO((tc - 0.45) / 0.6);
        s.dx = lerp(s.sx, cx, f);
        s.dy = lerp(s.sy, ly + 82 + s.gy, f);
      } else {
        if (s.ev === 1) {
          s.ev = 2;
          release();
          d?.classList.remove("press");
        }
        const side = cyc % 2 ? -1 : 1;
        s.dx = lerp(s.dx, cx + side * W * 0.2 + Math.sin(t * 2.1) * 20, k(3));
        s.dy = lerp(s.dy, H * 0.3 + Math.cos(t * 1.7) * 26, k(3));
      }
      ty = s.dy - s.gy;
    }
    if (d) {
      d.style.transform = `translate3d(${s.dx.toFixed(1)}px,${s.dy.toFixed(1)}px,0)`;
      d.style.opacity = real ? "0" : "1";
    }
    // physics: y = card bottom offset from the unstretched line (down +); contact springs it, gravity pulls it back
    const sub = 4;
    const h = dt / sub;
    for (let i = 0; i < sub; i++) {
      if (s.grab) {
        const ny = clamp(ty - ly, 0, 130);
        s.v = (ny - s.y) / Math.max(h * sub, 1e-3);
        s.y = ny;
        s.sag = s.y;
        s.sv = 0;
      } else {
        let a = 3200;
        if (s.y > 0) a += -s.y * 150 - s.v * 3.2;
        s.v += a * h;
        s.y += s.v * h;
        if (s.y >= 0) {
          s.sag = s.y;
          s.sv = s.v;
        } else {
          s.sv += (-s.sag * 420 - s.sv * 7) * h;
          s.sag += s.sv * h;
        }
      }
    }
    s.rot += ((s.y < -4 ? clamp(s.v * 0.006, -8, 8) : 0) - s.rot) * Math.min(1, dt * 8);
    st.style.transform = `translate3d(0,${(ly + s.y - CH).toFixed(1)}px,0) rotate(${s.rot.toFixed(2)}deg)`;
    st.style.left = `${(cx - st.offsetWidth / 2).toFixed(1)}px`;
    st.style.top = "0px";
    const cy = ly + 2 * s.sag;
    const dStr = `M${x0.toFixed(1)} ${ly.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${ly.toFixed(1)}`;
    line.current?.setAttribute("d", dStr);
    glowLine.current?.setAttribute("d", dStr);
    const ps = posts.current?.children;
    if (ps && ps.length >= 2) {
      ps[0].setAttribute("cx", x0.toFixed(1));
      ps[0].setAttribute("cy", ly.toFixed(1));
      ps[1].setAttribute("cx", x1.toFixed(1));
      ps[1].setAttribute("cy", ly.toFixed(1));
    }
  });
  const onDown = (e: React.PointerEvent) => {
    const el = root.current;
    if (!el) return;
    const s = S.current;
    const r = el.getBoundingClientRect();
    const H = el.clientHeight;
    s.realGrab = true;
    s.grab = true;
    s.gy = e.clientY - r.top - (H * 0.74 + s.y);
  };
  return (
    <Stage r={root} g1="rgba(140,255,190,.5)" g2="rgba(255,150,200,.22)">
      <div className="pointer-events-none absolute left-[6%] top-1/2 max-w-[min(30%,380px)]" style={{ transform: "translateY(-50%)" }}>
        <Eyebrow>Drop 07 · sneakers</Eyebrow>
        <h3 className="mt-3 text-[clamp(40px,4vw,64px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.sy, fontWeight: 700 }}>
          Bounce into the weekend
        </h3>
        <p className="mt-4 text-[17px] text-white/60" style={{ fontFamily: F.mr }}>
          Pull the card down and let go.
        </p>
      </div>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <path ref={glowLine} d="" fill="none" stroke="rgba(140,255,190,.18)" strokeWidth={14} strokeLinecap="round" />
        <path ref={line} d="" fill="none" stroke="#e9ecf5" strokeWidth={3} strokeLinecap="round" />
        <line ref={sl} x1="42%" y1="74%" x2="90%" y2="74%" stroke="#e9ecf5" strokeWidth={3} />
        <g ref={posts}>
          <circle className="u225-post" cx="42%" cy="74%" r={7} />
          <circle className="u225-post" cx="90%" cy="74%" r={7} />
        </g>
      </svg>
      <div
        ref={stack}
        className="absolute z-20 h-[300px] w-[240px] cursor-grab touch-none select-none"
        style={{ left: "calc(66% - 120px)", top: "calc(74% - 300px)", transformOrigin: "50% 100%" }}
        onPointerDown={onDown}
      >
        {[2, 1, 0].map((k) => (
          <div
            key={k}
            className="absolute inset-0 overflow-hidden rounded-[20px] border border-white/15 bg-[#151a28] shadow-[0_20px_50px_rgba(0,0,0,.45)]"
            style={{ transform: `translate(${k * 10}px,${-k * 10}px) rotate(${k * 3}deg)`, opacity: 1 - k * 0.25 }}
          >
            <div className="h-[210px]">
              <Img i={3 - k} w={480} h={420} />
            </div>
            <div className="flex items-end justify-between px-5 py-4">
              <p className="text-[18px] font-[600]" style={{ fontFamily: F.sg }}>
                Loop Runner
              </p>
              <p className="text-[15px] text-white/70" style={{ fontFamily: F.mr }}>
                ₹5,490
              </p>
            </div>
          </div>
        ))}
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "U214", name: "Hard shadow pop (3D extrude)", how: "Stacked 1px hard shadows build toward a corner while the card shifts the other way, extruding it like a block — one card per direction. A fake pointer pops each in turn.", kind: "play", C: U214 },
  { code: "U215", name: "Floating heart microinteraction", how: "Tapping like spawns small hearts that float up from the button with sideways drift and fade, and the count ticks up. A fake pointer keeps tapping.", kind: "play", C: U215 },
  { code: "U216", name: "Rope-hung badge with physics", how: "A pass hangs on a Verlet strap: a scripted drag pulls it taut, release swings it to rest, a tap flips it to its back and a flick spins it.", kind: "play", C: U216 },
  { code: "U217", name: "Head-tracking mascot", how: "The mascot's face and pupils follow the pointer on lagged quickTo, it blinks on a random timer and grins (path morph) on tap. A fake pointer sweeps a figure-eight.", kind: "play", C: U217 },
  { code: "U218", name: "Embroidered patch lighting", how: "Stitched word patches in WebGL: a light follows the pointer so the satin threads, merrow borders and stitches catch highlights and shadows. A fake light sweeps a figure-eight.", kind: "play", C: U218 },
  { code: "U219", name: "Spider leg cursor", how: "Eight jointed legs reach out and plant on nearby dots as the cursor moves, stepping in turns like a walking spider. A fake pointer walks a figure-eight.", kind: "play", C: U219 },
  { code: "U220", name: "Repelling labels", how: "Floating labels push each other apart and the pointer's field shoves them aside; they spring home and settle behind it. A fake pointer sweeps through.", kind: "play", C: U220 },
  { code: "U221", name: "Pull-cord light switch", how: "A scripted pull drags the cord's bead down; on release it bounces and swings, and the stage flips between night and daylight.", kind: "play", C: U221 },
  { code: "U222", name: "God-ray toggle", how: "A brushed-metal toggle: switching it on brightens volumetric light shafts and dust from above, switching off dims them. A fake pointer flips it on and off.", kind: "play", C: U222 },
  { code: "U223", name: "Liquid slosh button", how: "Dark liquid inside the button (WebGL) tilts and sloshes with the pointer's speed and splashes with droplets on tap. A fake pointer sweeps and taps.", kind: "play", C: U223 },
  { code: "U224", name: "Elastic drag-off stack", how: "Dragging the top card makes the cards beneath follow on an elastic lag; a short pull snaps back, a long one flies it off and the next pops forward. Scripted drags loop.", kind: "play", C: U224 },
  { code: "U225", name: "Trampoline drag", how: "Pulling the card stack down bends the line beneath it; on release the stack is bounced up and the line oscillates as it lands. Scripted pulls loop.", kind: "play", C: U225 },
];
