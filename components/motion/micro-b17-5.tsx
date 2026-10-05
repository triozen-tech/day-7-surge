"use client";

// Micro-interactions, batch 17 · group 5 (MOTION-MENU U156–U165). Small focused demos for /lab/motion.
// Every hover / press demo also plays by itself: a visible fake pointer (ring) walks over the targets or runs a scripted
// tap, resting ≤ 0.5 s per target. The real mouse takes over for 2.5 s whenever it moves inside the stage.
// A CSS-only glow loop never stops (and sits on top again, screen-blended) so covered stages never freeze.
// ?static=1 / reduced motion: no JS, the markup shows a sensible final state.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
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
.b17g5-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b17g5-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b17g5-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b17g5-hide{visibility:hidden}
.b17g5-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;pointer-events:none;z-index:40;opacity:0;transition:opacity .25s}
.b17g5-dot>span{display:block;width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);transition:transform .2s,background-color .2s}
.b17g5-dot.tap>span{animation:b17g5-tap .32s ease-out}
@keyframes b17g5-tap{40%{transform:scale(.55);background:rgba(255,255,255,.6)}100%{transform:scale(1)}}

/* U156 liquid toggle */
.u156-sw{position:relative;width:96px;height:52px;border-radius:999px;padding:6px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);cursor:pointer;transition:background-color .45s ${EZ},border-color .45s}
.u156-sw.on{background:#7ce0c3;border-color:#7ce0c3}
.u156-th{display:block;width:40px;height:40px;border-radius:999px;background:#fff;box-shadow:0 6px 16px rgba(0,0,0,.35)}

/* U157 balloons */
.u157-ring{position:absolute;left:-46px;top:-46px;width:92px;height:92px;border-radius:50%;border:3px solid rgba(255,255,255,.85)}
.u157-sh{position:absolute;left:-6px;top:-6px;width:12px;height:12px;border-radius:3px 9px 3px 9px}

/* U159 marching ants */
.u159-ants{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;opacity:0;transition:opacity .35s}
.u159-ants rect{width:calc(100% - 3px);height:calc(100% - 3px);animation:u159-march .55s linear infinite}
@keyframes u159-march{to{stroke-dashoffset:-10}}
.u159-k{transition:transform .45s ${EZ},background-color .45s}
.u159-k.on{transform:translateY(-8px);background:rgba(255,214,120,.07)}
.u159-k.on .u159-ants{opacity:1}
.u159-k .u159-tick{opacity:0;transform:scale(.6);transition:opacity .3s,transform .4s ${EZ}}
.u159-k.on .u159-tick{opacity:1;transform:none}

/* U160 depth tabs */
.u160-bar{perspective:900px;transform-style:preserve-3d}
.u160-t{transform:translateZ(-90px) scale(.92) rotateX(10deg);opacity:.45;transition:transform .6s ${EZ},opacity .6s,background-color .6s,color .6s;transform-style:preserve-3d}
.u160-t.on{transform:translateZ(60px) scale(1.08);opacity:1;background:#f2f4ff;color:#0b0d16}
.u160-p{grid-area:1/1;opacity:0;visibility:hidden;transform:scale(.9) translateY(14px);transition:opacity .5s,transform .6s ${EZ},visibility 0s .5s}
.u160-p.on{opacity:1;visibility:visible;transform:none;transition:opacity .5s .08s,transform .6s ${EZ} .08s,visibility 0s}

/* U162 vault */
.u162-shine{position:absolute;inset:-20% auto -20% 0;width:38%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:translateX(-140%) skewX(-12deg);mix-blend-mode:overlay;pointer-events:none}

/* U163 fish */
.u163-b{transition:background-color .4s,color .4s,transform .4s ${EZ}}
.u163-b.on{background:#5fd4ff;color:#04121c;transform:scale(1.04)}
.u163-bub{position:absolute;width:8px;height:8px;border-radius:50%;border:1.5px solid rgba(160,230,255,.6);animation:u163-rise 2.6s linear infinite}
@keyframes u163-rise{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(-160px);opacity:0}}

/* U164 weather */
.u164-rays{transform-box:fill-box;transform-origin:center;animation:u164-spin 7s linear infinite}
@keyframes u164-spin{to{transform:rotate(360deg)}}
.u164-core{transform-box:fill-box;transform-origin:center;animation:u164-pulse 2.4s ease-in-out infinite alternate}
@keyframes u164-pulse{to{transform:scale(1.08)}}
.u164-drop{animation:u164-fall .9s linear infinite}
@keyframes u164-fall{0%{transform:translateY(-6px);opacity:0}20%{opacity:1}100%{transform:translateY(34px);opacity:0}}
.u164-bolt{animation:u164-flash 1.7s linear infinite}
@keyframes u164-flash{0%,38%{opacity:.15}40%{opacity:1}46%{opacity:.25}50%{opacity:1}62%,100%{opacity:.15}}
.u164-sky{animation:u164-skyf 1.7s linear infinite}
@keyframes u164-skyf{0%,38%{opacity:0}40%{opacity:.35}46%{opacity:.05}50%{opacity:.28}64%,100%{opacity:0}}
.u164-cl1{animation:u164-drift 3.2s ease-in-out infinite alternate}
.u164-cl2{animation:u164-drift 2.6s ease-in-out infinite alternate-reverse}
@keyframes u164-drift{from{transform:translateX(-8px)}to{transform:translateX(10px)}}
.u164-wind{stroke-dasharray:22 14;animation:u164-blow 1.1s linear infinite}
@keyframes u164-blow{to{stroke-dashoffset:-36}}

/* U165 map */
.u165-pulse{transform-box:fill-box;transform-origin:center;animation:u165-ping 1.4s ease-out infinite}
@keyframes u165-ping{0%{transform:scale(.6);opacity:.9}100%{transform:scale(3.2);opacity:0}}

html.is-static .b17g5-glow,html.is-static .u159-ants rect,html.is-static .u163-bub,html.is-static .u164-rays,html.is-static .u164-core,html.is-static .u164-drop,html.is-static .u164-bolt,html.is-static .u164-sky,html.is-static .u164-cl1,html.is-static .u164-cl2,html.is-static .u164-wind,html.is-static .u165-pulse{animation:none}
html.is-static {
  .b17g5-glow,.u159-ants rect,.u163-bub,.u164-rays,.u164-core,.u164-drop,.u164-bolt,.u164-sky,.u164-cl1,.u164-cl2,.u164-wind,.u165-pulse{animation:none}
  .u156-sw,.u159-k,.u160-t,.u160-p,.u163-b{transition:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop, again on top (screen blend) so covered stages never freeze. */
function Stage({ r, children, g1, g2 }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string }) {
  return (
    <div ref={r} className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff]">
      <style href="b17g5-css" precedence="default">
        {CSS}
      </style>
      <div className="b17g5-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      <div className="b17g5-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: 0.45, zIndex: 35 } as CSSProperties} aria-hidden />
    </div>
  );
}

/** The visible fake pointer (a ring). */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => (
  <div ref={r} className="b17g5-dot" aria-hidden>
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

/* ───────────────────────── U156 · Squash-stretch liquid toggle ───────────────────────── */
const U156_ROWS = [
  { n: "Night mode", s: "Dims the shop after 9 pm", on: false },
  { n: "Restock alerts", s: "Ping me when my size returns", on: true },
  { n: "Gift wrap", s: "Recycled paper · ₹49", on: false },
];
const U156_TRAVEL = 96 - 40 - 12 - 2; // track − thumb − padding − border
function U156() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const state = useRef(U156_ROWS.map((r) => r.on));
  const flip = (k: number) => {
    const el = root.current;
    if (!el) return;
    const sw = all(el, ".u156-sw")[k];
    const th = one(sw, ".u156-th");
    const on = !state.current[k];
    state.current[k] = on;
    sw.classList.toggle("on", on);
    sw.setAttribute("aria-checked", String(on));
    const st = el.querySelectorAll<HTMLElement>(".u156-st")[k];
    if (st) st.textContent = on ? "On" : "Off";
    const to = on ? U156_TRAVEL : 0;
    if (prefersReducedMotion()) {
      gsap.set(th, { x: to });
      return;
    }
    gsap.killTweensOf(th);
    const from = Number(gsap.getProperty(th, "x")) || 0;
    // squash wide while travelling, overshoot tall at the end, then spring back to round
    gsap
      .timeline()
      .to(th, { x: (from + to) / 2, scaleX: 1.55, scaleY: 0.74, duration: 0.17, ease: "power2.in" })
      .to(th, { x: to, scaleX: 0.8, scaleY: 1.16, duration: 0.15, ease: "power2.out" })
      .to(th, { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1,0.35)" });
  };
  usePlay(root, (el) => {
    const sws = all(el, ".u156-sw");
    const d = dot.current;
    const tl = gsap.timeline({ repeat: -1 });
    sws.forEach((sw, k) => {
      tl.call(() => goDot(d, el, sw, 0.42, idle()));
      tl.to({}, { duration: 0.44 });
      tl.call(() => {
        if (!idle()) return;
        tapDot(d);
        flip(k);
      });
      tl.to({}, { duration: 0.44 });
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(124,224,195,.52)" g2="rgba(159,140,255,.22)">
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-[min(560px,80%)]">
          <Eyebrow>Account · preferences</Eyebrow>
          <h3 className="mt-3 text-[clamp(34px,3.4vw,52px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Your shop, your way
          </h3>
          <div className="mt-8 divide-y divide-white/10 rounded-[22px] border border-white/10 bg-white/[0.03] px-7">
            {U156_ROWS.map((r, k) => (
              <div key={r.n} className="flex items-center justify-between py-5">
                <div>
                  <p className="text-[19px] font-[600]" style={{ fontFamily: F.sg }}>
                    {r.n}
                  </p>
                  <p className="mt-1 text-[14px] text-white/55" style={{ fontFamily: F.mr }}>
                    {r.s}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="u156-st w-[28px] text-right text-[13px] uppercase tracking-[0.14em] text-white/55" style={{ fontFamily: F.mr }}>
                    {r.on ? "On" : "Off"}
                  </span>
                  <button type="button" role="switch" aria-checked={r.on} aria-label={r.n} className={`u156-sw ${r.on ? "on" : ""}`} onClick={() => flip(k)}>
                    <span className="u156-th" style={r.on ? { transform: `translateX(${U156_TRAVEL}px)` } : undefined} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U157 · Balloon pop on hover ───────────────────────── */
const U157_COL = ["#ff7a8a", "#ffd166", "#7ad7ff", "#b8f36b", "#c79bff"];
const U157_CODE = ["−10%", "−15%", "−20%", "Free ship", "−40%"];
const U157_B = Array.from({ length: 9 }, (_, i) => ({
  x: (i + 0.5) / 9,
  sp: 66 + ((i * 37) % 46),
  off: (i * 211) % 700,
  c: U157_COL[i % 5],
  s: 0.82 + ((i * 29) % 32) / 100,
  sw: 0.6 + (i % 3) * 0.35,
}));
function U157() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const real = useRef({ x: 0, y: 0, inside: false, at: -1e9 });
  const st = useRef({ init: false, popped: U157_B.map(() => -1), cyc: U157_B.map(() => -1), tg: -1, x: -1, y: -1, wait: 0 });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      real.current = { x: e.clientX - r.left, y: e.clientY - r.top, inside: true, at: performance.now() };
    };
    const leave = () => (real.current = { ...real.current, inside: false });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(el.querySelectorAll("*"));
    };
  }, []);
  const pop = (el: HTMLElement, i: number, cx: number, cy: number) => {
    const S = st.current;
    S.popped[i] = S.cyc[i];
    gsap.to(all(el, ".u157-in")[i], { transformOrigin: "50% 35%", scale: 1.45, opacity: 0, duration: 0.13, ease: "power2.out", overwrite: true });
    const fx = all(el, ".u157-fx")[i];
    gsap.set(fx, { x: cx, y: cy, autoAlpha: 1 });
    all(fx, ".u157-sh").forEach((s, k, arr) => {
      const a = (k / arr.length) * Math.PI * 2 + 0.3;
      const d = 64 + ((k * 23) % 44);
      gsap.fromTo(
        s,
        { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1 },
        { x: Math.cos(a) * d, y: Math.sin(a) * d + 34, rotation: (k % 2 ? 1 : -1) * 220, opacity: 0, scale: 0.5, duration: 0.75, ease: "power2.out", overwrite: true },
      );
    });
    gsap.fromTo(one(fx, ".u157-ring"), { scale: 0.3, opacity: 0.9 }, { scale: 1.7, opacity: 0, duration: 0.45, ease: "power2.out", overwrite: true });
    gsap.fromTo(one(fx, ".u157-code"), { y: -10, opacity: 1 }, { y: -64, opacity: 0, duration: 1, ease: "power1.out", overwrite: true });
  };
  useTicker(root, (t, rawDt) => {
    const el = root.current;
    if (!el) return;
    const dt = Math.min(rawDt, 0.05);
    const W = el.clientWidth;
    const H = el.clientHeight;
    const S = st.current;
    const bs = all(el, ".u157-b");
    const ins = all(el, ".u157-in");
    if (!S.init) {
      S.init = true;
      bs.forEach((b) => {
        b.style.left = "0px";
        b.style.top = "0px";
      });
    }
    const L = H + 320;
    const cs = U157_B.map((b, i) => {
      const p = t * b.sp + b.off;
      const cyc = Math.floor(p / L);
      const y = H + 160 - (p % L);
      const x = b.x * W + Math.sin(t * b.sw + i) * 18 - 45 * b.s;
      if (cyc !== S.cyc[i]) {
        S.cyc[i] = cyc;
        if (S.popped[i] >= 0) {
          S.popped[i] = -1;
          gsap.set(ins[i], { scale: 1, opacity: 1 });
        }
      }
      bs[i].style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(Math.sin(t * b.sw * 1.3 + i) * 5).toFixed(2)}deg)`;
      return { x: x + 45 * b.s, y: y + 52 * b.s, r: 42 * b.s, vis: S.popped[i] < 0 };
    });
    const R = real.current;
    const useReal = performance.now() - R.at < 2500;
    let px: number;
    let py: number;
    if (useReal) {
      px = R.x;
      py = R.y;
    } else {
      if (S.x < 0) {
        S.x = W * 0.5;
        S.y = H * 0.75;
      }
      S.wait -= dt;
      const ok = (i: number) => cs[i].vis && cs[i].y > H * 0.2 && cs[i].y < H * 0.78 && cs[i].x > 40 && cs[i].x < W - 40;
      if ((S.tg < 0 || !ok(S.tg)) && S.wait <= 0) {
        let best = -1;
        let bd = 1e9;
        cs.forEach((c, i) => {
          if (!ok(i)) return;
          const d = Math.hypot(c.x - S.x, c.y - S.y);
          if (d < bd) {
            bd = d;
            best = i;
          }
        });
        S.tg = best;
      }
      const tx = S.tg >= 0 ? cs[S.tg].x : W * 0.5 + Math.sin(t) * 90;
      const ty = S.tg >= 0 ? cs[S.tg].y : H * 0.55 + Math.cos(t * 0.8) * 40;
      const k = Math.min(1, dt * 4.5);
      S.x += (tx - S.x) * k;
      S.y += (ty - S.y) * k;
      px = S.x;
      py = S.y;
    }
    const dn = dot.current;
    if (dn) {
      dn.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
      dn.style.opacity = useReal ? "0" : "1";
    }
    if (useReal && !R.inside) return;
    cs.forEach((c, i) => {
      if (!c.vis || Math.hypot(px - c.x, py - c.y) > c.r * (useReal ? 1 : 0.5)) return;
      pop(el, i, c.x, c.y);
      if (i === S.tg) {
        S.tg = -1;
        S.wait = 0.18;
      }
    });
  });
  return (
    <Stage r={root} g1="rgba(255,122,138,.5)" g2="rgba(255,209,102,.24)">
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <Eyebrow>Fifth birthday · this weekend</Eyebrow>
        <h3 className="mt-4 text-[clamp(44px,5vw,80px)] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.sy, fontWeight: 700 }}>
          Five years.
          <br />
          Pop a balloon.
        </h3>
        <p className="mt-5 text-[16px] text-white/60" style={{ fontFamily: F.mr }}>
          Every pop drops a code · up to 40% off sitewide
        </p>
      </div>
      {U157_B.map((b, i) => (
        <div key={i} className="u157-b absolute" style={{ left: `${b.x * 100 - 3}%`, top: `${12 + ((i * 17) % 52)}%`, width: 90 * b.s }}>
          <svg className="u157-in block" viewBox="0 0 90 150" width={90 * b.s} height={150 * b.s} aria-hidden>
            <path d="M45 102 C 40 116, 52 124, 44 136 S 48 146, 45 150" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth={1.4} />
            <ellipse cx={45} cy={52} rx={40} ry={48} fill={b.c} />
            <path d="M40 104 L50 104 L45 97 Z" fill={b.c} />
            <ellipse cx={31} cy={34} rx={9} ry={15} fill="#fff" opacity={0.32} transform="rotate(-22 31 34)" />
          </svg>
        </div>
      ))}
      {U157_B.map((b, i) => (
        <div key={`fx${i}`} className="u157-fx b17g5-hide pointer-events-none absolute left-0 top-0 z-30" aria-hidden>
          <span className="u157-ring" style={{ opacity: 0 }} />
          {Array.from({ length: 8 }, (_, k) => (
            <span key={k} className="u157-sh" style={{ background: b.c, opacity: 0 }} />
          ))}
          <span className="absolute left-0 top-0 -translate-x-1/2">
            <span className="u157-code block whitespace-nowrap text-[18px] font-[700]" style={{ fontFamily: F.sg, color: b.c, opacity: 0 }}>
              {U157_CODE[i % 5]}
            </span>
          </span>
        </div>
      ))}
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U158 · Fleeing target ───────────────────────── */
function U158() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const off = useRef({ x: 0, y: 0, dx: 1, dy: 0 });
  usePointer(
    root,
    dot,
    (t, el) => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      // slow figure-eight that passes just above the button's home
      return { x: w * 0.5 + Math.sin(t * 0.85) * w * 0.3, y: h * 0.58 - h * 0.08 + Math.sin(t * 1.7) * h * 0.22, inside: true };
    },
    (p, el, _fake, _t, dt) => {
      const home = one(el, ".u158-home");
      const btn = one(el, ".u158-btn");
      const b = rel(home, el);
      const [hx, hy] = mid(b);
      const O = off.current;
      const R = 200;
      let vx = hx - p.x;
      let vy = hy - p.y;
      let d = Math.hypot(vx, vy);
      let tx = 0;
      let ty = 0;
      if (p.inside && d < R) {
        if (d < 1) {
          vx = O.dx;
          vy = O.dy;
          d = 1;
        }
        const push = (R - d) * 1.05;
        tx = (vx / d) * push;
        ty = (vy / d) * push;
        O.dx = vx / d;
        O.dy = vy / d;
      }
      const near = tx !== 0 || ty !== 0;
      const k = Math.min(1, dt * (near ? 9 : 2.6));
      O.x += (tx - O.x) * k;
      O.y += (ty - O.y) * k;
      O.x = clamp(O.x, -b.l + 16, el.clientWidth - b.l - b.w - 16);
      O.y = clamp(O.y, -b.t + 16, el.clientHeight - b.t - b.h - 16);
      btn.style.transform = `translate3d(${O.x.toFixed(1)}px,${O.y.toFixed(1)}px,0) rotate(${(O.x * 0.025).toFixed(2)}deg)`;
      const line = el.querySelector<SVGLineElement>(".u158-line");
      if (line) {
        line.setAttribute("x1", hx.toFixed(1));
        line.setAttribute("y1", hy.toFixed(1));
        line.setAttribute("x2", (hx + O.x).toFixed(1));
        line.setAttribute("y2", (hy + O.y).toFixed(1));
        line.style.opacity = String(Math.min(0.7, Math.hypot(O.x, O.y) / 120));
      }
    },
  );
  return (
    <Stage r={root} g1="rgba(255,163,107,.52)" g2="rgba(124,224,195,.2)">
      <div className="pointer-events-none absolute inset-x-0 top-[9%] text-center">
        <Eyebrow>Flash sale · ends at midnight</Eyebrow>
        <h3 className="mt-3 text-[clamp(40px,4.4vw,70px)] leading-[0.98] tracking-[-0.02em]" style={{ fontFamily: F.is }}>
          This deal is a little shy.
        </h3>
      </div>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <line className="u158-line" x1={0} y1={0} x2={0} y2={0} stroke="#ffa36b" strokeWidth={1.5} strokeDasharray="4 6" style={{ opacity: 0 }} />
      </svg>
      <div className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2">
        <div className="u158-home relative rounded-full border border-dashed border-white/20 px-10 py-6 text-[20px] text-transparent" style={{ fontFamily: F.sg }}>
          Catch 70% off →
          <button type="button" className="u158-btn absolute inset-0 rounded-full bg-[#ffa36b] text-[20px] font-[600] text-[#1a0d05] shadow-[0_18px_40px_rgba(255,163,107,.35)]" style={{ fontFamily: F.sg }}>
            Catch 70% off →
          </button>
        </div>
      </div>
      <p className="pointer-events-none absolute inset-x-0 bottom-[8%] text-center text-[14px] text-white/50" style={{ fontFamily: F.mr }}>
        Linen co-ord set · <span className="text-white/80">₹2,190</span> <s className="text-white/35">₹7,300</s>
      </p>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U159 · Marching ants border ───────────────────────── */
const U159_C = [
  { n: "Weekend", p: "₹499", s: "2 days · 1 studio" },
  { n: "Monthly", p: "₹1,499", s: "Unlimited classes" },
  { n: "Yearly", p: "₹11,999", s: "Two months free" },
];
function U159() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const [sel, setSel] = useState(1);
  usePlay(root, (el) => {
    const ks = all(el, ".u159-k");
    const d = dot.current;
    const tl = gsap.timeline({ repeat: -1 });
    [2, 0, 1].forEach((k) => {
      tl.call(() => goDot(d, el, one(ks[k], ".u159-tick"), 0.45, idle()));
      tl.to({}, { duration: 0.47 });
      tl.call(() => {
        if (!idle()) return;
        tapDot(d);
        setSel(k);
      });
      tl.to({}, { duration: 0.42 });
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,214,120,.5)" g2="rgba(122,215,255,.2)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Membership</Eyebrow>
        <h3 className="mt-3 text-[clamp(36px,3.6vw,58px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.sg, fontWeight: 600 }}>
          Pick your rhythm
        </h3>
        <div className="mt-10 grid w-[min(900px,84%)] grid-cols-3 gap-6">
          {U159_C.map((c, k) => (
            <button
              type="button"
              key={c.n}
              onClick={() => setSel(k)}
              className={`u159-k relative rounded-[22px] border border-white/10 bg-white/[0.03] p-7 text-left ${sel === k ? "on" : ""}`}
            >
              <svg className="u159-ants" aria-hidden>
                <rect x={1.5} y={1.5} rx={21} ry={21} pathLength={400} fill="none" stroke="#ffd678" strokeWidth={2.5} strokeDasharray="6 4" strokeLinecap="round" />
              </svg>
              <div className="flex items-center justify-between">
                <span className="text-[15px] uppercase tracking-[0.18em] text-white/60" style={{ fontFamily: F.mr }}>
                  {c.n}
                </span>
                <span className="u159-tick grid h-7 w-7 place-items-center rounded-full bg-[#ffd678] text-[14px] font-[700] text-[#1a1404]">✓</span>
              </div>
              <p className="mt-6 text-[clamp(30px,2.8vw,44px)] font-[600] tracking-[-0.02em]" style={{ fontFamily: F.sg }}>
                {c.p}
              </p>
              <p className="mt-2 text-[14px] text-white/55" style={{ fontFamily: F.mr }}>
                {c.s}
              </p>
            </button>
          ))}
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U160 · Zoom-depth tabs ───────────────────────── */
const U160_T = [
  { n: "Sneakers", h: "Cloud Step Runner", p: "₹6,490", i: 3 },
  { n: "Bags", h: "Weekender Holdall", p: "₹8,900", i: 2 },
  { n: "Bottles", h: "Glacier Flask 750", p: "₹1,850", i: 1 },
  { n: "Cans", h: "Citrus Fizz × 6", p: "₹540", i: 0 },
];
function U160() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const [a, setA] = useState(0);
  usePlay(root, (el) => {
    const ts = all(el, ".u160-t");
    const d = dot.current;
    const tl = gsap.timeline({ repeat: -1 });
    [1, 2, 3, 0].forEach((k) => {
      tl.call(() => goDot(d, el, ts[k], 0.45, idle()));
      tl.to({}, { duration: 0.47 });
      tl.call(() => {
        if (!idle()) return;
        tapDot(d);
        setA(k);
      });
      tl.to({}, { duration: 0.48 });
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(150,170,255,.52)" g2="rgba(255,122,138,.2)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="u160-bar flex gap-3 rounded-full border border-white/10 bg-white/[0.03] p-2">
          {U160_T.map((t, k) => (
            <button
              type="button"
              key={t.n}
              onClick={() => setA(k)}
              className={`u160-t rounded-full px-7 py-3 text-[17px] font-[600] ${a === k ? "on" : ""}`}
              style={{ fontFamily: F.sg }}
            >
              {t.n}
            </button>
          ))}
        </div>
        <div className="mt-10 grid w-[min(760px,80%)]">
          {U160_T.map((t, k) => (
            <div key={t.n} className={`u160-p grid grid-cols-[1fr_1.1fr] items-center gap-8 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 ${a === k ? "on" : ""}`}>
              <div className="aspect-[4/3] overflow-hidden rounded-[16px]">
                <Img i={t.i} w={640} h={480} />
              </div>
              <div>
                <Eyebrow>{t.n} · new season</Eyebrow>
                <p className="mt-3 text-[clamp(28px,2.6vw,40px)] leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
                  {t.h}
                </p>
                <p className="mt-4 text-[18px] text-white/75" style={{ fontFamily: F.sg }}>
                  {t.p}
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

/* ───────────────────────── U161 · Drill-in list ───────────────────────── */
const U161_ROW = 58;
const U161_IND = 40;
const U161_L0 = ["New in", "Home", "Apparel", "Beauty", "Gifts"];
const U161_L1 = ["Lighting", "Ceramics", "Textiles"]; // children of Home (rows 2–4)
const U161_L2 = [
  { n: "Stoneware mugs", p: "₹890" },
  { n: "Dinner plates", p: "₹2,400" },
  { n: "Bud vases", p: "₹1,150" },
]; // children of Ceramics (rows 4–6)
function U161() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  usePlay(root, (el, dispose) => {
    const l0 = all(el, ".u161-l0");
    const l1 = all(el, ".u161-l1");
    const l2 = all(el, ".u161-l2");
    const d = dot.current!;
    const at = (n: HTMLElement): [number, number] => {
      const b = rel(n, el);
      return [b.l + 110, b.t + b.h / 2];
    };
    const crumb = { color: "rgba(255,255,255,.4)", scale: 0.92, duration: 0.35, ease: "power2.out", transformOrigin: "0% 50%" };
    const back = { color: "rgba(255,255,255,1)", scale: 1, duration: 0.35, ease: "power2.out" };
    const sib0 = l0.filter((_, i) => i !== 1);
    const sib1 = l1.filter((_, i) => i !== 1);
    const rest: [number, number] = [el.clientWidth * 0.72, el.clientHeight * 0.8];
    gsap.set(d, { x: rest[0], y: rest[1] });
    const tl = gsap.timeline({ repeat: -1 });
    tl.set([...l1, ...l2], { autoAlpha: 0, x: 40 });
    tl.set(el.querySelectorAll(".u161-chev"), { autoAlpha: 0, x: -8 });
    // 1 · click "Home": it stays put and greys into a breadcrumb, its children slide in one indent deeper
    tl.to(d, { x: at(l0[1])[0], y: at(l0[1])[1], duration: 0.45, ease: "power2.inOut" });
    tl.call(() => tapDot(d), [], ">0.05");
    tl.addLabel("s1");
    tl.to(l0[1], crumb, ">");
    tl.to(one(l0[1], ".u161-chev"), { autoAlpha: 1, x: 0, duration: 0.3 }, "<");
    tl.to(sib0, { autoAlpha: 0, x: -24, duration: 0.3, stagger: 0.03, ease: "power2.in" }, "<");
    tl.to(l1, { autoAlpha: 1, x: 0, duration: 0.42, stagger: 0.07, ease: "power3.out" }, "<0.18");
    // 2 · click "Ceramics": same again, one level deeper
    tl.to(d, { x: at(l1[1])[0], y: at(l1[1])[1], duration: 0.42, ease: "power2.inOut" }, "<0.1");
    tl.call(() => tapDot(d), [], ">0.05");
    tl.addLabel("s2");
    tl.to(l1[1], crumb, ">");
    tl.to(one(l1[1], ".u161-chev"), { autoAlpha: 1, x: 0, duration: 0.3 }, "<");
    tl.to(sib1, { autoAlpha: 0, x: -24, duration: 0.3, stagger: 0.03, ease: "power2.in" }, "<");
    tl.to(l2, { autoAlpha: 1, x: 0, duration: 0.42, stagger: 0.07, ease: "power3.out" }, "<0.18");
    // browse the leaves, then tap the top breadcrumb to climb back out
    tl.to(d, { x: at(l2[1])[0] + 120, y: at(l2[1])[1], duration: 0.4, ease: "power2.inOut" }, "<0.15");
    tl.to(d, { x: at(l2[2])[0] + 40, y: at(l2[2])[1], duration: 0.4, ease: "power2.inOut" }, ">0.05");
    tl.to(d, { x: at(l0[1])[0], y: at(l0[1])[1], duration: 0.45, ease: "power2.inOut" }, ">0.05");
    tl.call(() => tapDot(d), [], ">0.05");
    tl.addLabel("s3");
    tl.to(l2, { autoAlpha: 0, x: 40, duration: 0.3, stagger: { each: 0.04, from: "end" }, ease: "power2.in" }, ">");
    tl.to(l1, { autoAlpha: 0, x: 40, duration: 0.3, stagger: { each: 0.04, from: "end" }, ease: "power2.in" }, "<0.1");
    tl.to([l0[1], l1[1]], back, "<0.1");
    tl.to(el.querySelectorAll(".u161-chev"), { autoAlpha: 0, x: -8, duration: 0.25 }, "<");
    tl.to(sib0, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.04, ease: "power3.out" }, "<0.1");
    tl.to(d, { x: rest[0], y: rest[1], duration: 0.45, ease: "power2.inOut" }, "<");
    // the real mouse pauses the script; real clicks step it to the next stage
    let vis = true;
    let held = false;
    let stepping = false;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    const tick = () => {
      const on = idle();
      d.style.opacity = on ? "1" : "0";
      if (!on && !held && !stepping) {
        held = true;
        tl.pause();
      } else if (on && held) {
        held = false;
        if (vis) tl.play();
      }
    };
    const click = () => {
      const labels = ["s1", "s2", "s3"].map((l) => tl.labels[l]);
      const now = tl.time();
      const next = labels.find((v) => v > now + 0.01);
      if (next === undefined) tl.time(0);
      stepping = true;
      tl.tweenTo(next ?? labels[0], {
        onComplete: () => {
          stepping = false;
          if (held) tl.pause();
        },
      });
    };
    el.addEventListener("click", click);
    gsap.ticker.add(tick);
    dispose(() => {
      io.disconnect();
      el.removeEventListener("click", click);
      gsap.ticker.remove(tick);
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(184,243,107,.5)" g2="rgba(122,215,255,.2)">
      <div className="flex h-full w-full items-center justify-center gap-[7%]">
        <div className="w-[300px]">
          <Eyebrow>Shop by room</Eyebrow>
          <h3 className="mt-3 text-[clamp(40px,4vw,64px)] leading-[0.98] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Find it in three taps
          </h3>
        </div>
        <div className="relative w-[480px] cursor-pointer" style={{ height: 7 * U161_ROW }}>
          {U161_L0.map((n, i) => (
            <Row key={n} cls="u161-l0" top={i * U161_ROW} ind={0} label={n} />
          ))}
          {U161_L1.map((n, i) => (
            <Row key={n} cls="u161-l1 b17g5-hide" top={(i + 2) * U161_ROW} ind={1} label={n} />
          ))}
          {U161_L2.map((n, i) => (
            <Row key={n.n} cls="u161-l2 b17g5-hide" top={(i + 4) * U161_ROW} ind={2} label={n.n} price={n.p} />
          ))}
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}
function Row({ cls, top, ind, label, price }: { cls: string; top: number; ind: number; label: string; price?: string }) {
  return (
    <div className={`${cls} absolute right-0 flex items-center border-b border-white/10`} style={{ top, left: ind * U161_IND, height: U161_ROW }}>
      <span className="u161-chev mr-3 text-[18px] opacity-0" style={{ fontFamily: F.sg }}>
        ‹
      </span>
      <span className="text-[22px] font-[500] tracking-[-0.01em]" style={{ fontFamily: F.sg }}>
        {label}
      </span>
      <span className="ml-auto text-[15px] text-white/50" style={{ fontFamily: F.mr }}>
        {price ?? "›"}
      </span>
    </div>
  );
}

/* ───────────────────────── U162 · Vault lock reveal ───────────────────────── */
function U162() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  usePlay(root, (el, dispose) => {
    const card = one(el, ".u162-card");
    const dial = one(el, ".u162-dial");
    const doors = all(el, ".u162-door");
    const shine = one(el, ".u162-shine");
    const lockL = one(el, ".u162-lockl");
    const digits = all(el, ".u162-dg");
    const d = dot.current;
    gsap.set([...doors, lockL], { autoAlpha: 1 });
    gsap.set(digits, { opacity: 0, scale: 0.4 });
    // the hover timeline (real mouse: enter = play, leave = reverse)
    const o = gsap.timeline({ paused: true });
    o.to(dial, { rotation: 540, duration: 0.9, ease: "power3.inOut", svgOrigin: "100 100" });
    o.fromTo(shine, { xPercent: -140 }, { xPercent: 360, duration: 0.7, ease: "power2.inOut" }, 0.15);
    o.to(lockL, { autoAlpha: 0, duration: 0.2 }, 0.6);
    o.to(doors[0], { xPercent: -102, duration: 0.6, ease: "power3.inOut" }, 0.75);
    o.to(doors[1], { xPercent: 102, duration: 0.6, ease: "power3.inOut" }, 0.75);
    o.set(doors, { autoAlpha: 0 });
    const enter = () => {
      if (!idle()) o.timeScale(1).play();
    };
    const leave = () => {
      if (!idle()) o.timeScale(1.6).reverse();
    };
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    const W = el.clientWidth;
    const H = el.clientHeight;
    const cb = rel(card, el);
    const input = one(el, ".u162-input");
    const ib = rel(input, el);
    const tl = gsap.timeline({ repeat: -1 });
    const go = (p: Element | [number, number], dur = 0.45) => tl.call(() => goDot(d, el, p, dur, idle()));
    const ifIdle = (fn: () => void) => () => {
      if (idle()) fn();
    };
    go([W * 0.84, H * 0.84]);
    tl.to({}, { duration: 0.45 });
    go([cb.l + cb.w * 0.3, cb.t + cb.h * 0.42]);
    tl.to({}, { duration: 0.4 });
    tl.call(ifIdle(() => o.timeScale(1).play()));
    // keep the ring drifting inside the card while the dial spins
    go([cb.l + cb.w * 0.55, cb.t + cb.h * 0.55], 0.5);
    tl.to({}, { duration: 0.5 });
    go([cb.l + cb.w * 0.4, cb.t + cb.h * 0.36], 0.45);
    tl.to({}, { duration: 0.5 });
    go([ib.l + ib.w * 0.3, ib.t + ib.h / 2], 0.35);
    tl.to({}, { duration: 0.38 });
    tl.call(ifIdle(() => tapDot(d)));
    digits.forEach((g, k) => {
      tl.call(ifIdle(() => gsap.to(g, { opacity: 1, scale: 1, duration: 0.18, ease: "back.out(2)" })), [], k === 0 ? ">" : ">0.12");
    });
    tl.to({}, { duration: 0.3 });
    go([W * 0.16, H * 0.82]);
    tl.to({}, { duration: 0.2 });
    tl.call(
      ifIdle(() => {
        o.timeScale(1.6).reverse();
        gsap.to(digits, { opacity: 0, scale: 0.4, duration: 0.2, delay: 0.3 });
      }),
    );
    tl.to({}, { duration: 0.45 });
    go([W * 0.5, H * 0.92]);
    tl.to({}, { duration: 0.5 });
    dispose(() => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
    });
    return tl;
  });
  const ticks = Array.from({ length: 40 }, (_, i) => i);
  return (
    <Stage r={root} g1="rgba(255,214,120,.5)" g2="rgba(122,215,255,.2)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Members' vault · early access</Eyebrow>
        <div className="u162-card relative mt-6 h-[300px] w-[min(560px,80%)] overflow-hidden rounded-[26px] border border-white/12 bg-[#0e1220]">
          {/* underneath: the code input */}
          <div className="absolute inset-0 flex flex-col justify-center px-10">
            <p className="text-[clamp(28px,2.6vw,38px)] leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
              Enter your access code
            </p>
            <div className="u162-input mt-6 flex h-[64px] items-center gap-4 rounded-[16px] border border-[#ffd678]/50 bg-white/[0.04] px-6">
              {["4", "7", "1", "9"].map((g) => (
                <span key={g} className="u162-dg grid h-9 w-9 place-items-center rounded-[10px] bg-[#ffd678]/15 text-[20px] font-[600] text-[#ffd678]" style={{ fontFamily: F.sg }}>
                  {g}
                </span>
              ))}
              <span className="ml-auto text-[14px] text-white/50" style={{ fontFamily: F.mr }}>
                Drop opens ₹0 · 48 h
              </span>
            </div>
          </div>
          {/* cover: two steel doors + the dial (hidden in the markup, so ?static=1 shows the input) */}
          {[0, 1].map((k) => (
            <div
              key={k}
              className={`u162-door b17g5-hide absolute inset-y-0 ${k ? "right-0" : "left-0"} w-1/2`}
              style={{ background: k ? "linear-gradient(250deg,#2a3042,#151a28)" : "linear-gradient(110deg,#2a3042,#151a28)", borderLeft: k ? "1px solid rgba(255,255,255,.08)" : undefined }}
            />
          ))}
          <div className="u162-lockl b17g5-hide pointer-events-none absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="h-[200px] w-[200px]" aria-hidden>
              <circle cx={100} cy={100} r={92} fill="#1b2132" stroke="rgba(255,255,255,.18)" strokeWidth={2} />
              <g className="u162-dial">
                {ticks.map((i) => (
                  <line key={i} x1={100} y1={14} x2={100} y2={i % 5 ? 22 : 30} stroke={i % 5 ? "rgba(255,255,255,.35)" : "#ffd678"} strokeWidth={i % 5 ? 1.5 : 2.5} transform={`rotate(${i * 9} 100 100)`} />
                ))}
                <circle cx={100} cy={100} r={56} fill="#252c40" stroke="rgba(255,255,255,.12)" />
                <rect x={94} y={46} width={12} height={108} rx={6} fill="#3a4360" />
                <rect x={46} y={94} width={108} height={12} rx={6} fill="#3a4360" />
                <circle cx={100} cy={100} r={18} fill="#ffd678" />
              </g>
              <path d="M100 2 L94 -8 L106 -8 Z" fill="#ffd678" transform="translate(0 10)" />
            </svg>
          </div>
          <div className="u162-shine" />
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U163 · Fish swim on hover ───────────────────────── */
const U163_F = Array.from({ length: 8 }, (_, k) => ({
  rx: 30 + (k % 4) * 22,
  ry: 26 + (k % 3) * 18,
  w: (0.9 + (k % 3) * 0.35) * (k % 2 ? -1 : 1),
  ph: k * 0.8,
  c: ["#ffb36b", "#5fd4ff", "#ff7a8a", "#ffe08a"][k % 4],
  s: 0.8 + (k % 3) * 0.2,
}));
function U163() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const h = useRef(0);
  usePointer(
    root,
    dot,
    (t, el) => {
      const w = el.clientWidth;
      const H = el.clientHeight;
      const [bx, by] = mid(rel(one(el, ".u163-b"), el));
      const pts: [number, number][] = [
        [w * 0.22, H * 0.8],
        [bx - 70, by],
        [bx + 60, by + 6],
        [bx - 10, by - 4],
        [w * 0.78, H * 0.8],
      ];
      const [x, y] = stepPath(t, pts, 0.9, 0.5);
      return { x: x + Math.sin(t * 2.1) * 6, y: y + Math.cos(t * 1.7) * 5, inside: true };
    },
    (p, el, _f, t, dt) => {
      const btn = one(el, ".u163-b");
      const b = rel(btn, el);
      const over = p.inside && inBox(b, p.x, p.y, 8);
      btn.classList.toggle("on", over);
      h.current += ((over ? 1 : 0) - h.current) * Math.min(1, dt * (over ? 4 : 2.2));
      const H = h.current;
      const [cx, cy] = mid(b);
      all(el, ".u163-f").forEach((f, k) => {
        const F0 = U163_F[k];
        const a = t * F0.w + F0.ph;
        const grow = 0.55 + 0.45 * H;
        const rx = (b.w / 2 + F0.rx) * grow;
        const ry = (b.h / 2 + F0.ry) * grow;
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * ry + Math.sin(t * 3 + k) * 4;
        // face along the direction of travel
        const vx = -Math.sin(a) * rx * F0.w;
        const vy = Math.cos(a) * ry * F0.w;
        const ang = (Math.atan2(vy, vx) * 180) / Math.PI;
        const op = clamp(H * 1.5 - k * 0.07, 0, 1);
        f.style.opacity = op.toFixed(3);
        f.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${ang.toFixed(1)}deg) scale(${(F0.s * (0.4 + 0.6 * H)).toFixed(3)})`;
      });
    },
  );
  return (
    <Stage r={root} g1="rgba(95,212,255,.52)" g2="rgba(255,179,107,.22)">
      <div className="pointer-events-none absolute inset-x-0 top-[10%] text-center">
        <Eyebrow>Reef-safe sunscreen · SPF 50 · 50 ml</Eyebrow>
        <h3 className="mt-3 text-[clamp(40px,4.4vw,70px)] leading-[0.98] tracking-[-0.02em]" style={{ fontFamily: F.sy, fontWeight: 700 }}>
          Kind to the reef
        </h3>
      </div>
      <div className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2">
        <button type="button" className="u163-b rounded-full border border-[#5fd4ff]/50 bg-[#0f2433] px-12 py-6 text-[22px] font-[600] text-[#dff6ff]" style={{ fontFamily: F.sg }}>
          Dive in · ₹1,299
        </button>
      </div>
      {[0.42, 0.5, 0.58].map((x, i) => (
        <span key={i} className="u163-bub" style={{ left: `${x * 100}%`, top: "72%", animationDelay: `${i * 0.85}s` }} aria-hidden />
      ))}
      {U163_F.map((f, k) => (
        <svg key={k} className="u163-f pointer-events-none absolute left-0 top-0" width={34} height={18} viewBox="0 0 34 18" style={{ opacity: 0, marginLeft: -17, marginTop: -9 }} aria-hidden>
          <path d="M2 9 L10 2 L10 16 Z" fill={f.c} opacity={0.85} />
          <ellipse cx={20} cy={9} rx={12} ry={6.5} fill={f.c} />
          <circle cx={27} cy={7.5} r={1.4} fill="#04121c" />
        </svg>
      ))}
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U164 · Living weather icons ───────────────────────── */
const Cloud = ({ fill = "#cfd8ea", className = "" }: { fill?: string; className?: string }) => (
  <path className={className} d="M30 70 a18 18 0 0 1 4-35 a24 24 0 0 1 45-6 a17 17 0 0 1 16 41 Z" fill={fill} />
);
function U164() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const ks = all(el, ".u164-k");
    const tl = gsap.timeline({ repeat: -1 });
    ks.forEach((k) => {
      tl.to(k, { y: -12, borderColor: "rgba(255,255,255,.35)", duration: 0.4, ease: "power2.out" });
      tl.to(k, { y: 0, borderColor: "rgba(255,255,255,.1)", duration: 0.45, ease: "power2.inOut" }, ">0.1");
    });
    return tl;
  });
  const cards = [
    { city: "Goa", t: "33°", d: "Bright sun" },
    { city: "Shillong", t: "19°", d: "Steady rain" },
    { city: "Kolkata", t: "27°", d: "Thunderstorm" },
    { city: "Leh", t: "8°", d: "Windy, cloudy" },
  ];
  return (
    <Stage r={root} g1="rgba(255,200,110,.5)" g2="rgba(122,170,255,.24)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Delivery weather · today</Eyebrow>
        <h3 className="mt-3 text-[clamp(34px,3.4vw,54px)] tracking-[-0.02em]" style={{ fontFamily: F.sg, fontWeight: 600 }}>
          We ship in any sky
        </h3>
        <div className="mt-10 grid w-[min(1000px,88%)] grid-cols-4 gap-5">
          {cards.map((c, k) => (
            <div key={c.city} className="u164-k relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
              {k === 2 && <div className="u164-sky pointer-events-none absolute inset-0 bg-[#cfd8ff]" style={{ opacity: 0 }} />}
              <svg viewBox="0 0 120 110" className="relative h-[120px] w-full" aria-hidden>
                {k === 0 && (
                  <>
                    <g className="u164-rays">
                      {Array.from({ length: 12 }, (_, i) => (
                        <line key={i} x1={60} y1={10} x2={60} y2={22} stroke="#ffc861" strokeWidth={4} strokeLinecap="round" transform={`rotate(${i * 30} 60 55)`} />
                      ))}
                    </g>
                    <circle className="u164-core" cx={60} cy={55} r={22} fill="#ffc861" />
                  </>
                )}
                {k === 1 && (
                  <>
                    {[34, 50, 66, 82, 42, 74].map((x, i) => (
                      <line key={i} className="u164-drop" x1={x} y1={74} x2={x - 3} y2={84} stroke="#7ab8ff" strokeWidth={3} strokeLinecap="round" style={{ animationDelay: `${(i * 0.15).toFixed(2)}s` }} />
                    ))}
                    <Cloud />
                  </>
                )}
                {k === 2 && (
                  <>
                    {[36, 84].map((x, i) => (
                      <line key={i} className="u164-drop" x1={x} y1={74} x2={x - 3} y2={84} stroke="#7ab8ff" strokeWidth={3} strokeLinecap="round" style={{ animationDelay: `${(i * 0.4).toFixed(2)}s` }} />
                    ))}
                    <path className="u164-bolt" d="M64 62 L50 86 L60 86 L54 106 L74 78 L63 78 L70 62 Z" fill="#ffe27a" />
                    <Cloud fill="#8f9ab3" />
                  </>
                )}
                {k === 3 && (
                  <>
                    <g className="u164-cl2" opacity={0.6}>
                      <Cloud fill="#9aa6bf" />
                    </g>
                    <g transform="translate(14 14) scale(.85)">
                      <g className="u164-cl1">
                        <Cloud />
                      </g>
                    </g>
                    {[86, 96].map((y, i) => (
                      <path key={i} className="u164-wind" d={`M14 ${y} H${80 + i * 14} q10 0 10 -8`} fill="none" stroke="#cfd8ea" strokeWidth={3} strokeLinecap="round" style={{ animationDelay: `${i * 0.3}s` }} />
                    ))}
                  </>
                )}
              </svg>
              <div className="relative mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[18px] font-[600]" style={{ fontFamily: F.sg }}>
                    {c.city}
                  </p>
                  <p className="text-[14px] text-white/55" style={{ fontFamily: F.mr }}>
                    {c.d}
                  </p>
                </div>
                <p className="text-[34px] leading-none tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
                  {c.t}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── U165 · viewBox zoom ───────────────────────── */
const U165_FULL = "0 0 1000 600";
const U165_B = [
  { x: 700, y: 350, n: "Store No. 4 · Riverside", s: "Open till 10 pm · pick up in 2 h" },
  { x: 520, y: 150, n: "Store No. 9 · Old Market", s: "Open till 9 pm · try-on rooms" },
];
function U165() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el, dispose) => {
    const svg = el.querySelector<SVGSVGElement>(".u165-map")!;
    const cards = all(el, ".u165-card");
    // zoom in log space so a springy overshoot only zooms a little further (the viewBox never turns negative)
    const z = { k: 0, cx: 500, cy: 300 };
    const draw = () => {
      const w = 1000 * Math.pow(0.2, z.k);
      const h = w * 0.6;
      svg.setAttribute("viewBox", `${(z.cx - w / 2).toFixed(2)} ${(z.cy - h / 2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`);
    };
    const tl = gsap.timeline({ repeat: -1, onUpdate: draw });
    tl.set(z, { k: 0, cx: 500, cy: 300 });
    tl.set(cards, { autoAlpha: 0, y: 16 });
    U165_B.forEach((b, k) => {
      tl.to({}, { duration: 0.1 });
      tl.to(z, { k: 1, duration: 1.15, ease: "elastic.out(1,0.6)" });
      tl.to(z, { cx: b.x, cy: b.y, duration: 0.9, ease: "power3.out" }, "<");
      tl.to(cards[k], { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, "<0.35");
      tl.to({}, { duration: 0.15 });
      tl.to(cards[k], { autoAlpha: 0, y: -10, duration: 0.25, ease: "power1.in" });
      tl.to(z, { k: 0, cx: 500, cy: 300, duration: 0.8, ease: "power3.inOut" }, "<");
    });
    dispose(() => svg.setAttribute("viewBox", U165_FULL));
    return tl;
  });
  const streetsV = Array.from({ length: 9 }, (_, i) => 420 + i * 70);
  const streetsH = Array.from({ length: 9 }, (_, i) => 40 + i * 65);
  return (
    <Stage r={root} g1="rgba(122,215,255,.5)" g2="rgba(255,163,107,.22)">
      <svg className="u165-map absolute inset-0 h-full w-full" viewBox={U165_FULL} preserveAspectRatio="xMidYMid slice" aria-hidden>
        <rect width={1000} height={600} fill="#0f1626" />
        {streetsV.map((x) => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={600} stroke="#1c2840" strokeWidth={3} />
        ))}
        {streetsH.map((y) => (
          <line key={`h${y}`} x1={300} y1={y} x2={1000} y2={y} stroke="#1c2840" strokeWidth={3} />
        ))}
        <rect x={565} y={175} width={120} height={90} rx={14} fill="#15301f" />
        <rect x={775} y={435} width={150} height={95} rx={14} fill="#15301f" />
        <path d="M330 250 C450 262 520 336 610 322 S800 258 1000 302" fill="none" stroke="#123354" strokeWidth={22} />
        <path d="M0 0 H380 C340 90 300 160 330 250 C360 340 250 420 200 600 H0 Z" fill="#0b2238" />
        <path d="M420 600 L560 300 L760 120 L1000 60" fill="none" stroke="#2c3d60" strokeWidth={8} strokeLinecap="round" />
        <path d="M380 470 H1000" fill="none" stroke="#2c3d60" strokeWidth={7} />
        {U165_B.map((b, k) => (
          <g key={k}>
            <circle className="u165-pulse" cx={b.x} cy={b.y} r={8} fill="none" stroke="#ffa36b" strokeWidth={2} />
            <circle cx={b.x} cy={b.y} r={6} fill="#ffa36b" />
            <circle cx={b.x} cy={b.y} r={2.2} fill="#fff" />
          </g>
        ))}
      </svg>
      <div className="pointer-events-none absolute left-[4%] top-[6%]">
        <Eyebrow>Find a store</Eyebrow>
        <h3 className="mt-2 text-[clamp(32px,3vw,48px)] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Two doors near you
        </h3>
      </div>
      <div className="pointer-events-none absolute bottom-[7%] left-[4%] grid">
        {U165_B.map((b, k) => (
          <div key={k} className={`u165-card rounded-[18px] border border-white/12 bg-[#0b0f1a]/85 px-6 py-4 ${k ? "b17g5-hide" : ""}`} style={{ gridArea: "1/1" }}>
            <p className="text-[18px] font-[600]" style={{ fontFamily: F.sg }}>
              {b.n}
            </p>
            <p className="mt-1 text-[14px] text-white/60" style={{ fontFamily: F.mr }}>
              {b.s}
            </p>
          </div>
        ))}
      </div>
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "U156", name: "Squash-stretch liquid toggle", how: "Each toggle's thumb squashes wide as it travels, then stretches tall and springs round at the other end. A fake pointer taps the switches in turn.", kind: "play", C: U156 },
  { code: "U157", name: "Balloon pop on hover", how: "Balloons float up on loops; touching one pops it (scale burst, shards, a code) and it rises again later. A fake pointer chases and pops them.", kind: "play", C: U157 },
  { code: "U158", name: "Fleeing target", how: "The sale button slides away when the pointer comes close, keeping its distance on a dashed tether, then eases home. A fake pointer sweeps a figure-eight.", kind: "play", C: U158 },
  { code: "U159", name: "Marching ants border", how: "A dashed outline marches around the selected plan card (animated dash offset). A fake pointer picks a different card in turn.", kind: "play", C: U159 },
  { code: "U160", name: "Zoom-depth tabs", how: "The active tab zooms forward in 3D while the others recede into depth, and its panel rises in. A fake pointer clicks through the tabs.", kind: "play", C: U160 },
  { code: "U161", name: "Drill-in list", how: "A tapped row stays put and greys into a breadcrumb while its children slide in one indent deeper, twice; tapping the crumb climbs back. Scripted taps loop.", kind: "play", C: U161 },
  { code: "U162", name: "Vault lock reveal", how: "On hover the lock dial spins, a shine sweeps and the steel doors part to reveal the code input. A fake pointer opens it, types a code and leaves.", kind: "play", C: U162 },
  { code: "U163", name: "Fish swim on hover", how: "Hovering the button lets little fish swim out and circle it, facing their way; they shrink away on leave. A fake pointer hovers in and out.", kind: "play", C: U163 },
  { code: "U164", name: "Living weather icons", how: "Weather icons as tiny looping scenes: sun rays turn, rain falls, lightning flashes the card, clouds drift on the wind; cards lift in turn.", kind: "play", C: U164 },
  { code: "U165", name: "viewBox zoom", how: "The map's SVG viewBox springs from the full view into a pulsing store beacon, shows its card, pulls back out and flies to the next. Loops on screen.", kind: "play", C: U165 },
];
