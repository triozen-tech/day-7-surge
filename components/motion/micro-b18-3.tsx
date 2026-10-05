"use client";

// Micro-interactions, batch 18 · group 3 (MOTION-MENU U190–U201). Small focused demos for /lab/motion.
// Every hover / press / drag demo also plays by itself: a visible fake pointer (ring) walks over the targets or runs a
// scripted press, resting ≤ 0.5 s per target (it keeps gliding during longer hovers). The real mouse takes over for 2.5 s
// whenever it moves inside the stage. A CSS-only glow loop never stops (and sits on top again, screen-blended).
// ?static=1 / reduced motion: no JS, the markup shows a sensible final state.
import { useEffect, useRef, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from "react";
import { gsap, loadPlugin, prefersReducedMotion } from "@/lib/gsap";
import { scene, useScrub, useTicker } from "@/components/fx/shared";
import type { MotionDef } from "./types";

type FlipT = typeof import("gsap/Flip").Flip;

const F = {
  sg: "Space Grotesk Variable",
  fr: "Fraunces Variable",
  is: "Instrument Serif",
  sy: "Syne Variable",
  mr: "Manrope Variable",
};

const EZ = "cubic-bezier(.2,.7,.2,1)";

const NOISE = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='1' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

const CSS = `
.b18g3-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b18g3-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b18g3-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b18g3-hide{visibility:hidden}
.b18g3-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;pointer-events:none;z-index:40;opacity:0;transition:opacity .25s}
.b18g3-dot>span{display:block;width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);transition:transform .2s,background-color .2s}
.b18g3-dot.tap>span{animation:b18g3-tap .32s ease-out}
@keyframes b18g3-tap{40%{transform:scale(.55);background:rgba(255,255,255,.6)}100%{transform:scale(1)}}

/* U190 swipe to confirm */
.u190-fill{background:linear-gradient(90deg,#3fd3a8,#7ce0c3)}
.u190-str{position:absolute;inset:0;border-radius:inherit;background:linear-gradient(45deg,rgba(255,255,255,.22) 25%,transparent 25% 50%,rgba(255,255,255,.22) 50% 75%,transparent 75%);background-size:28px 28px;animation:u190-move .7s linear infinite}
@keyframes u190-move{to{background-position:28px 0}}
.u190-lab{background:linear-gradient(90deg,rgba(255,255,255,.35) 0%,#fff 45%,rgba(255,255,255,.35) 60%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:u190-shine 2.2s linear infinite}
@keyframes u190-shine{from{background-position:120% 0}to{background-position:-100% 0}}

/* U191 collab cursors */
.u191-frame{position:absolute;left:0;top:0;pointer-events:none;border:2px solid var(--c);border-radius:10px}
.u191-frame i{position:absolute;width:9px;height:9px;background:#fff;border:2px solid var(--c);border-radius:2px}

/* U192 layered shadow */
.u192-w{--d:4;display:inline-block;cursor:default;text-shadow:calc(var(--d)*1px) calc(var(--d)*1px) 0 #ff5d8f,calc(var(--d)*2px) calc(var(--d)*2px) 0 #ffd166,calc(var(--d)*3px) calc(var(--d)*3px) 0 #5fd4ff,calc(var(--d)*4px) calc(var(--d)*4px) 0 #7ce0c3;transform:translate(calc(var(--d)*-2px),calc(var(--d)*-2px))}

/* U194 scanning button */
.u194-b{isolation:isolate}
.u194-str{position:absolute;inset:0;opacity:0;transition:opacity .35s;background:linear-gradient(45deg,rgba(0,0,0,.16) 25%,transparent 25% 50%,rgba(0,0,0,.16) 50% 75%,transparent 75%);background-size:40px 40px;animation:u194-move .55s linear infinite}
@keyframes u194-move{to{background-position:40px 0}}
.u194-scan{position:absolute;top:-10%;bottom:-10%;left:0;width:24%;background:#fff;mix-blend-mode:difference;opacity:0;transition:opacity .25s;animation:u194-sweep 1.15s cubic-bezier(.45,0,.55,1) infinite;z-index:2;pointer-events:none}
@keyframes u194-sweep{from{transform:translateX(-110%) skewX(-14deg)}to{transform:translateX(430%) skewX(-14deg)}}
.u194-b.on .u194-str,.u194-b.on .u194-scan{opacity:1}
.u194-b{transition:transform .4s ${EZ},box-shadow .4s}
.u194-b.on{transform:translateY(-3px);box-shadow:0 22px 50px rgba(214,255,92,.28)}

/* U195 paper flap */
.u195-b{perspective:620px}
.u195-pw{position:absolute;left:13%;right:13%;top:-34px;height:96px;transform-origin:50% 100%;transform:translateY(22px);transition:transform .55s ${EZ}}
.u195-p{position:absolute;inset:0;border-radius:8px;background:#f6f1e7;box-shadow:0 -4px 14px rgba(0,0,0,.25);transform-origin:50% 100%;animation:u195-bob 1.1s ease-in-out infinite alternate;animation-play-state:paused}
@keyframes u195-bob{from{transform:translateY(0) rotateX(0)}to{transform:translateY(-9px) rotateX(9deg)}}
.u195-b.on .u195-pw{transform:translateY(-12px) rotateX(-20deg)}
.u195-b.on .u195-p{animation-play-state:running}
.u195-pk{transition:transform .45s ${EZ}}
.u195-b.on .u195-pk{transform:translateY(3px)}

/* U197 tv static */
.u197-st{position:absolute;inset:0;background-image:${NOISE};background-size:160px 160px;opacity:0;animation:u197-noise .32s steps(4) infinite;mix-blend-mode:screen}
@keyframes u197-noise{0%{background-position:0 0}25%{background-position:-53px 31px}50%{background-position:37px -71px}75%{background-position:-19px 88px}100%{background-position:0 0}}
.u197-scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.28) 0 2px,transparent 2px 4px);pointer-events:none}
.u197-roll{position:absolute;left:0;right:0;height:30%;background:linear-gradient(transparent,rgba(255,255,255,.08),transparent);animation:u197-rollk 2.4s linear infinite}
@keyframes u197-rollk{from{top:-30%}to{top:100%}}
.u197-eyes{animation:u197-blink 3.2s linear infinite;transform-origin:50% 50%}
@keyframes u197-blink{0%,46%,52%,100%{transform:scaleY(1)}49%{transform:scaleY(.08)}}
.u197-pu{transition:transform .3s ${EZ}}
.u197-c.on .u197-look{animation:u197-lookk 1.6s ease-in-out infinite}
@keyframes u197-lookk{0%,100%{transform:translate(0,0)}20%{transform:translate(-14px,2px)}45%{transform:translate(14px,-6px)}70%{transform:translate(4px,8px)}}
.u197-c.on .u197-t{animation:u197-glitch .9s steps(1) infinite}
@keyframes u197-glitch{0%{transform:none;text-shadow:none;clip-path:none}10%{transform:translateX(-4px);text-shadow:3px 0 #ff2e63,-3px 0 #18e4ff;clip-path:inset(10% 0 45% 0)}20%{transform:translateX(3px);text-shadow:-3px 0 #ff2e63,3px 0 #18e4ff;clip-path:inset(55% 0 5% 0)}30%{transform:none;text-shadow:2px 0 #ff2e63,-2px 0 #18e4ff;clip-path:none}55%{transform:translateX(2px);text-shadow:-2px 0 #18e4ff;clip-path:inset(30% 0 30% 0)}62%,100%{transform:none;text-shadow:1px 0 rgba(255,46,99,.6),-1px 0 rgba(24,228,255,.6);clip-path:none}}
.u197-c{transition:transform .45s ${EZ}}
.u197-c.on{transform:translateY(-6px) rotate(-1deg)}

/* U198 synthwave */
.u198-floor{position:absolute;left:-60%;width:220%;top:0;height:260%;transform:rotateX(74deg);transform-origin:50% 0;background-image:linear-gradient(#ff4fd8 2px,transparent 2px),linear-gradient(90deg,#ff4fd8 2px,transparent 2px);background-size:44px 44px;animation:u198-crawl .7s linear infinite}
@keyframes u198-crawl{from{background-position:0 0}to{background-position:0 44px}}
.u198-sun{background:linear-gradient(#ffe066,#ff7a59 55%,#ff3d9a);-webkit-mask:linear-gradient(#000 0 52%,transparent 52% 58%,#000 58% 68%,transparent 68% 74%,#000 74% 82%,transparent 82% 88%,#000 88%);mask:linear-gradient(#000 0 52%,transparent 52% 58%,#000 58% 68%,transparent 68% 74%,#000 74% 82%,transparent 82% 88%,#000 88%);animation:u198-sun 3s ease-in-out infinite alternate}
@keyframes u198-sun{to{transform:translateY(-6px) scale(1.04)}}
.u198-star{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff;animation:u198-tw 1.6s ease-in-out infinite alternate}
@keyframes u198-tw{from{opacity:.2}to{opacity:1}}

/* U199 sidebar */
.u199-side{width:250px}
.u199-c .u199-side{width:78px}
.u199-tip{opacity:0}

/* U200 origami */
.u200-tile{perspective:1100px;animation:u200-float 3.6s ease-in-out infinite alternate}
@keyframes u200-float{from{transform:rotateX(4deg) rotateY(-6deg) translateY(0)}to{transform:rotateX(-3deg) rotateY(6deg) translateY(-8px)}}
.u200-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:28px;overflow:hidden}
.u200-flap{position:absolute;inset:0;transform-style:preserve-3d}

/* U201 tick scrollbar */
.u201-head{animation:u201-pulse 1.1s ease-in-out infinite alternate}
@keyframes u201-pulse{from{box-shadow:0 0 0 0 rgba(124,224,195,.55)}to{box-shadow:0 0 0 10px rgba(124,224,195,0)}}

html.is-static .b18g3-glow,html.is-static .u190-str,html.is-static .u190-lab,html.is-static .u194-str,html.is-static .u194-scan,html.is-static .u195-p,html.is-static .u197-st,html.is-static .u197-roll,html.is-static .u197-eyes,html.is-static .u197-look,html.is-static .u197-t,html.is-static .u198-floor,html.is-static .u198-sun,html.is-static .u198-star,html.is-static .u200-tile,html.is-static .u201-head{animation:none}
html.is-static {
  .b18g3-glow,.u190-str,.u190-lab,.u194-str,.u194-scan,.u195-p,.u197-st,.u197-roll,.u197-eyes,.u197-look,.u197-t,.u198-floor,.u198-sun,.u198-star,.u200-tile,.u201-head{animation:none}
  .u194-b,.u195-pw,.u195-pk,.u197-c,.u197-pu{transition:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop, again on top (screen blend) so covered stages never freeze. */
function Stage({ r, children, g1, g2 }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string }) {
  return (
    <div ref={r} className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff]">
      <style href="b18g3-css" precedence="default">
        {CSS}
      </style>
      <div className="b18g3-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      <div className="b18g3-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: 0.45, zIndex: 35 } as CSSProperties} aria-hidden />
    </div>
  );
}

/** The visible fake pointer (a ring). */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => (
  <div ref={r} className="b18g3-dot" aria-hidden>
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

/** "play" helper: waits for fonts (and Flip if asked), builds a looping animation in a gsap.context, plays it only on screen. */
function usePlay(ref: RefObject<HTMLElement | null>, build: (root: HTMLElement, Flip: FlipT | null) => gsap.core.Animation | void, flip = false) {
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
    Promise.all([document.fonts?.ready, flip ? loadPlugin("Flip") : null]).then(([, Fl]) => {
      if (dead) return;
      ctx.add(() => {
        anim = b.current(root, (Fl as FlipT | null) ?? null);
      });
      sync();
    });
    return () => {
      dead = true;
      io.disconnect();
      ctx.revert();
      gsap.killTweensOf(root.querySelectorAll("*"));
    };
  }, [ref, flip]);
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
function goDot(dot: HTMLElement | null, root: HTMLElement, target: Element | [number, number] | null, dur = 0.45, idle = true, ease = "power2.inOut") {
  if (!dot || !target) return;
  dot.style.opacity = idle ? "1" : "0";
  const [x, y] = Array.isArray(target) ? target : mid(rel(target, root));
  gsap.to(dot, { x, y, duration: dur, ease, overwrite: "auto" });
}

/** A point inside `node` at fractions (fx, fy) of its box, relative to root. */
function at(node: Element, root: Element, fx: number, fy: number): [number, number] {
  const b = rel(node, root);
  return [b.l + b.w * fx, b.t + b.h * fy];
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

/* ───────────────────────── U190 · Swipe-to-confirm ───────────────────────── */
const U190_W = 500;
const U190_K = 64;
const U190_TRAVEL = U190_W - U190_K - 12;
function U190() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const P = useRef({ p: 0 });
  const tlR = useRef<gsap.core.Timeline | null>(null);
  const drag = useRef({ on: false, x0: 0, p0: 0, resume: null as gsap.core.Tween | null });
  const render = (follow: boolean) => {
    const el = root.current;
    if (!el) return;
    const p = P.current.p;
    const knob = one(el, ".u190-knob");
    gsap.set(knob, { x: p * U190_TRAVEL });
    one(el, ".u190-fill").style.width = `${U190_K + p * U190_TRAVEL}px`;
    one(el, ".u190-lab").style.opacity = String(clamp(1 - p * 1.7, 0, 1));
    if (follow && dot.current) {
      const tb = rel(one(el, ".u190-track"), el);
      gsap.set(dot.current, { x: tb.l + 6 + U190_K / 2 + p * U190_TRAVEL, y: tb.t + tb.h / 2 });
    }
  };
  const resetLook = () => {
    const el = root.current;
    if (!el) return;
    P.current.p = 0;
    render(false);
    gsap.set(one(el, ".u190-arrow"), { opacity: 1, scale: 1 });
    gsap.set(one(el, ".u190-check"), { opacity: 0, scale: 0.4 });
    gsap.set(one(el, ".u190-knob"), { backgroundColor: "#ffffff", scale: 1 });
    gsap.set(one(el, ".u190-done"), { autoAlpha: 0, y: 14 });
  };
  const succeed = () => {
    const el = root.current;
    if (!el) return;
    gsap.to(P.current, { p: 1, duration: 0.2, onUpdate: () => render(false) });
    gsap.to(one(el, ".u190-arrow"), { opacity: 0, scale: 0.4, duration: 0.2 });
    gsap.to(one(el, ".u190-check"), { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" });
    gsap.to(one(el, ".u190-knob"), { backgroundColor: "#0c2a22", duration: 0.3 });
    gsap.to(one(el, ".u190-done"), { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.1 });
  };
  const resumeLater = () => {
    drag.current.resume?.kill();
    drag.current.resume = gsap.delayedCall(2.6, () => {
      resetLook();
      tlR.current?.restart();
    });
  };
  const down = (e: RPointerEvent) => {
    tlR.current?.pause();
    drag.current.resume?.kill();
    gsap.killTweensOf(P.current);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { ...drag.current, on: true, x0: e.clientX, p0: P.current.p };
  };
  const move = (e: RPointerEvent) => {
    if (!drag.current.on) return;
    P.current.p = clamp(drag.current.p0 + (e.clientX - drag.current.x0) / U190_TRAVEL, 0, 1);
    render(false);
  };
  const up = () => {
    if (!drag.current.on) return;
    drag.current.on = false;
    if (P.current.p > 0.9) succeed();
    else gsap.to(P.current, { p: 0, duration: 0.5, ease: "back.out(1.6)", onUpdate: () => render(false) });
    resumeLater();
  };
  useEffect(() => () => void drag.current.resume?.kill(), []);
  usePlay(root, (el) => {
    const d = dot.current;
    const knob = one(el, ".u190-knob");
    const track = one(el, ".u190-track");
    const arrow = one(el, ".u190-arrow");
    const check = one(el, ".u190-check");
    const done = one(el, ".u190-done");
    const tl = gsap.timeline({ repeat: -1 });
    tlR.current = tl;
    tl.call(() => goDot(d, el, knob, 0.42, idle()))
      .to({}, { duration: 0.44 })
      .call(() => tapDot(d))
      .to(knob, { scale: 0.9, duration: 0.14, ease: "power2.out" })
      .to(P.current, { p: 1, duration: 1.15, ease: "power2.inOut", onUpdate: () => render(true) })
      .to(knob, { scale: 1, duration: 0.2 }, "-=0.15")
      .to(arrow, { opacity: 0, scale: 0.4, duration: 0.2 }, "<")
      .to(check, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, "<")
      .to(knob, { backgroundColor: "#0c2a22", duration: 0.3 }, "<")
      .fromTo(done, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4 }, "<0.05")
      .call(() => goDot(d, el, at(track, el, 0.55, 2.1), 0.6, idle()))
      .to({}, { duration: 0.3 })
      .to(done, { autoAlpha: 0, y: -10, duration: 0.25 })
      .to(P.current, { p: 0, duration: 0.6, ease: "power3.inOut", onUpdate: () => render(false) })
      .to(check, { opacity: 0, scale: 0.4, duration: 0.2 }, "<")
      .to(arrow, { opacity: 1, scale: 1, duration: 0.3 }, "<0.15")
      .to(knob, { backgroundColor: "#ffffff", duration: 0.3 }, "<");
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(124,224,195,.52)" g2="rgba(95,212,255,.22)">
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <Eyebrow>Checkout · step 3 of 3</Eyebrow>
        <h3 className="mt-3 text-[clamp(38px,4vw,62px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Wool overshirt, charcoal
        </h3>
        <p className="mt-3 text-[15px] text-white/55" style={{ fontFamily: F.mr }}>
          Size M · arrives Thursday · free returns
        </p>
        <div className="u190-track relative mt-10 h-[76px] rounded-full border border-white/12 bg-white/[0.06]" style={{ width: U190_W }}>
          <div className="u190-fill absolute bottom-[6px] left-[6px] top-[6px] overflow-hidden rounded-full" style={{ width: U190_K }}>
            <span className="u190-str" />
          </div>
          <span className="u190-lab pointer-events-none absolute inset-0 flex items-center justify-center pl-14 text-[19px] font-[600]" style={{ fontFamily: F.sg }}>
            Slide to pay ₹4,290 →
          </span>
          <span className="u190-done b18g3-hide pointer-events-none absolute inset-0 flex items-center justify-center pr-14 text-[19px] font-[600] text-[#05221a]" style={{ fontFamily: F.sg }}>
            Paid · order #4821
          </span>
          <button
            type="button"
            aria-label="Slide to pay"
            className="u190-knob absolute left-[6px] top-[6px] grid touch-none cursor-grab place-items-center rounded-full bg-white shadow-[0_8px_22px_rgba(0,0,0,.35)]"
            style={{ width: U190_K, height: U190_K }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
          >
            <svg className="u190-arrow col-start-1 row-start-1" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0a0d16" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
            <svg className="u190-check col-start-1 row-start-1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7ce0c3" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0 }} aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </button>
        </div>
        <p className="mt-6 text-[13px] text-white/45" style={{ fontFamily: F.mr }}>
          Secured by your bank · UPI or card
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U191 · Live teammate cursors ───────────────────────── */
const U191_T = [
  { n: "Mira", c: "#ff7a9a" },
  { n: "Kabir", c: "#5fd4ff" },
  { n: "Ines", c: "#ffd166" },
];
function U191() {
  const root = useRef<HTMLDivElement>(null);
  const real = useRef({ x: 0, y: 0, at: -1e9 });
  const st = useRef({ fx: -1, fy: 0, fw: 0, fh: 0, lx: 0, ly: 0 });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mv = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      real.current = { x: e.clientX - r.left, y: e.clientY - r.top, at: performance.now() };
    };
    el.addEventListener("pointermove", mv);
    return () => el.removeEventListener("pointermove", mv);
  }, []);
  useTicker(root, (t, rawDt) => {
    const el = root.current;
    if (!el) return;
    const dt = Math.min(rawDt, 0.05);
    const tile = rel(one(el, ".u191-tile"), el);
    const els = all(el, ".u191-el").map((n) => rel(n, el));
    const curs = all(el, ".u191-cur");
    const S = st.current;
    const seg = 1.3;
    // lead teammate walks between the tile's elements (rest ≤ 0.5 s), the others sweep figure-eights
    const pts = els.map((b) => [b.l + b.w * 0.62, b.t + b.h * 0.58] as [number, number]);
    const [lx, ly] = stepPath(t, pts, seg, 0.62);
    const jit = Math.sin(t * 7) * 2;
    const P = [
      [lx + jit, ly + Math.cos(t * 6) * 2],
      [tile.l + tile.w * (0.5 + Math.sin(t * 0.7 + 1) * 0.36), tile.t + tile.h * (0.52 + Math.sin(t * 1.4 + 1) * 0.3)],
      [tile.l + tile.w * (0.5 + Math.sin(t * 0.55 + 3.6) * 0.42), tile.t + tile.h * (0.5 + Math.cos(t * 1.1 + 2) * 0.34)],
    ];
    P.forEach(([x, y], k) => {
      const tilt = k === 0 ? (lx - S.lx) * 0.8 : Math.sin(t * 1.3 + k) * 6;
      curs[k].style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${clamp(tilt, -14, 14).toFixed(1)}deg)`;
    });
    S.lx = lx;
    S.ly = ly;
    const R = real.current;
    const useReal = performance.now() - R.at < 2500;
    const you = curs[3];
    you.style.opacity = useReal ? "1" : "0";
    you.style.transform = `translate3d(${R.x.toFixed(1)}px,${R.y.toFixed(1)}px,0)`;
    // selection frame: the element Mira is on (or the one under the real pointer)
    let k = Math.floor(t / seg) % els.length;
    if (useReal) {
      const hit = els.findIndex((b) => inBox(b, R.x, R.y));
      if (hit >= 0) k = hit;
    }
    const b = els[k];
    const pad = 8;
    const tx = b.l - pad;
    const ty = b.t - pad;
    const tw = b.w + pad * 2;
    const th = b.h + pad * 2;
    if (S.fx < 0) Object.assign(S, { fx: tx, fy: ty, fw: tw, fh: th });
    const e = Math.min(1, dt * 9);
    S.fx += (tx - S.fx) * e;
    S.fy += (ty - S.fy) * e;
    S.fw += (tw - S.fw) * e;
    S.fh += (th - S.fh) * e;
    const fr = one(el, ".u191-frame");
    fr.style.transform = `translate3d(${S.fx.toFixed(1)}px,${S.fy.toFixed(1)}px,0)`;
    fr.style.width = `${S.fw.toFixed(1)}px`;
    fr.style.height = `${S.fh.toFixed(1)}px`;
    const who = useReal ? "You" : U191_T[0].n;
    const tag = one(el, ".u191-tag");
    if (tag.textContent !== `${who} · editing`) tag.textContent = `${who} · editing`;
  });
  return (
    <Stage r={root} g1="rgba(255,122,154,.5)" g2="rgba(95,212,255,.24)">
      <div className="absolute inset-x-0 top-[7%] flex items-center justify-center gap-3">
        <div className="flex -space-x-2">
          {U191_T.map((m) => (
            <span key={m.n} className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#0a0d16] text-[13px] font-[700] text-[#0a0d16]" style={{ background: m.c, fontFamily: F.sg }}>
              {m.n[0]}
            </span>
          ))}
        </div>
        <p className="text-[14px] text-white/60" style={{ fontFamily: F.mr }}>
          3 people editing · Spring lookbook / cover
        </p>
      </div>
      <div className="absolute left-1/2 top-[54%] w-[min(700px,74%)] -translate-x-1/2 -translate-y-1/2">
        <div className="u191-tile grid grid-cols-[1fr_1.1fr] gap-7 rounded-[24px] border border-white/10 bg-[#111626] p-7 shadow-[0_30px_80px_rgba(0,0,0,.45)]">
          <div className="u191-el h-[300px] overflow-hidden rounded-[16px]">
            <Img i={1} w={500} h={600} />
          </div>
          <div className="flex flex-col justify-center gap-6">
            <div className="u191-el">
              <Eyebrow>Spring 26 · drop two</Eyebrow>
              <h3 className="mt-2 text-[clamp(32px,3vw,46px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.is }}>
                Soft tailoring for long days
              </h3>
            </div>
            <div className="u191-el self-start rounded-full bg-[#f2f4ff] px-6 py-3 text-[16px] font-[600] text-[#0b0d16]" style={{ fontFamily: F.sg }}>
              Shop the edit · from ₹3,490
            </div>
          </div>
        </div>
      </div>
      <div className="u191-frame z-20" style={{ "--c": U191_T[0].c, width: 0, height: 0 } as CSSProperties} aria-hidden>
        <i style={{ left: -6, top: -6 }} />
        <i style={{ right: -6, top: -6 }} />
        <i style={{ left: -6, bottom: -6 }} />
        <i style={{ right: -6, bottom: -6 }} />
        <span className="u191-tag absolute -top-8 left-0 whitespace-nowrap rounded-[6px] px-2 py-1 text-[12px] font-[600] text-[#0a0d16]" style={{ background: U191_T[0].c, fontFamily: F.sg }}>
          Mira · editing
        </span>
      </div>
      {[...U191_T, { n: "You", c: "#ffffff" }].map((m, k) => (
        <div key={m.n} className="u191-cur pointer-events-none absolute left-0 top-0 z-30" style={{ transformOrigin: "0 0", opacity: k === 3 ? 0 : 1, transform: `translate3d(${200 + k * 160}px,${180 + k * 60}px,0)` }} aria-hidden>
          <svg width="22" height="24" viewBox="0 0 22 24" className="block drop-shadow-[0_3px_6px_rgba(0,0,0,.45)]">
            <path d="M2 2l17 8.5-7.4 2.2L8.4 20z" fill={m.c} stroke="#0a0d16" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <span className="ml-4 mt-[-2px] inline-block whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-[600] text-[#0a0d16]" style={{ background: m.c, fontFamily: F.sg }}>
            {m.n}
          </span>
        </div>
      ))}
    </Stage>
  );
}

/* ───────────────────────── U192 · Layered shadow snap ───────────────────────── */
function U192() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const snap = (w: HTMLElement) => gsap.to(w, { "--d": 0, duration: 0.2, ease: "power4.in", overwrite: true });
  const unsnap = (w: HTMLElement) => gsap.to(w, { "--d": 4, duration: 0.85, ease: "elastic.out(1,0.4)", overwrite: true });
  usePlay(root, (el) => {
    const ws = all(el, ".u192-w");
    const d = dot.current;
    const tl = gsap.timeline({ repeat: -1 });
    ws.forEach((w, k) => {
      tl.call(() => {
        goDot(d, el, at(w, el, k ? 0.62 : 0.38, 0.55), 0.42, idle());
        if (k && idle()) unsnap(ws[k - 1]);
      });
      tl.to({}, { duration: 0.42 });
      tl.call(() => {
        if (idle()) snap(w);
      });
      tl.to({}, { duration: 0.42 });
    });
    tl.call(() => {
      goDot(d, el, at(ws[1], el, 0.5, 1.9), 0.5, idle());
      if (idle()) unsnap(ws[ws.length - 1]);
    });
    tl.to({}, { duration: 0.55 });
    return tl;
  });
  const words = ["SUMMER", "DROP 04"];
  return (
    <Stage r={root} g1="rgba(255,93,143,.5)" g2="rgba(95,212,255,.24)">
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <Eyebrow>Swimwear · limited run of 300</Eyebrow>
        <div className="mt-6 flex flex-col items-center gap-2">
          {words.map((w) => (
            <span
              key={w}
              className="u192-w text-[clamp(64px,8.4vw,136px)] uppercase leading-[0.95] tracking-[-0.01em] text-[#fff8ee]"
              style={{ fontFamily: F.sy, fontWeight: 800 }}
              onPointerEnter={(e) => snap(e.currentTarget)}
              onPointerLeave={(e) => unsnap(e.currentTarget)}
            >
              {w}
            </span>
          ))}
        </div>
        <p className="mt-8 text-[15px] text-white/55" style={{ fontFamily: F.mr }}>
          Prints from ₹2,190 · lands Friday 10 am
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U193 · Drawing cursor stroke ───────────────────────── */
function U193() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const pts = useRef<{ x: number; y: number; t: number }[]>([]);
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  useEffect(() => {
    const el = root.current;
    const c = cv.current;
    if (!el || !c) return;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = el.clientWidth;
      const h = el.clientHeight;
      size.current = { w, h, dpr };
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => {
      ro.disconnect();
      c.width = 0;
      c.height = 0;
    };
  }, []);
  usePointer(
    root,
    dot,
    (t, el) => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      return { x: w * 0.5 + Math.sin(t * 0.95) * w * 0.34, y: h * 0.52 + Math.sin(t * 1.9) * h * 0.26, inside: true };
    },
    (p, _el, _fake, t) => {
      const c = cv.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) return;
      const L = pts.current;
      const last = L[L.length - 1];
      if (p.inside && (!last || Math.hypot(p.x - last.x, p.y - last.y) > 1.5)) L.push({ x: p.x, y: p.y, t });
      while (L.length && t - L[0].t > 1) L.shift();
      const { w, h, dpr } = size.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 2; i < L.length; i++) {
        const a = L[i - 2];
        const b = L[i - 1];
        const q = L[i];
        const k = clamp(1 - (t - b.t) / 1, 0, 1);
        if (k <= 0) continue;
        const m1x = (a.x + b.x) / 2;
        const m1y = (a.y + b.y) / 2;
        const m2x = (b.x + q.x) / 2;
        const m2y = (b.y + q.y) / 2;
        const lw = 1.5 + 17 * k * k;
        const hue = 330 + (i / L.length) * 60;
        ctx.beginPath();
        ctx.moveTo(m1x, m1y);
        ctx.quadraticCurveTo(b.x, b.y, m2x, m2y);
        ctx.strokeStyle = `hsla(${hue},95%,70%,${(0.16 * k).toFixed(3)})`;
        ctx.lineWidth = lw * 2.6;
        ctx.stroke();
        ctx.strokeStyle = `hsla(${hue},95%,${72 + 14 * k}%,${k.toFixed(3)})`;
        ctx.lineWidth = lw;
        ctx.stroke();
      }
    },
  );
  return (
    <Stage r={root} g1="rgba(255,122,186,.5)" g2="rgba(255,209,102,.22)">
      <div className="grid h-full w-full grid-cols-[1.1fr_0.9fr] items-center gap-10 px-[7%]">
        <div>
          <Eyebrow>Custom studio · open now</Eyebrow>
          <h3 className="mt-4 text-[clamp(48px,5vw,84px)] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Sketch your own colourway
          </h3>
          <p className="mt-5 max-w-[420px] text-[16px] text-white/60" style={{ fontFamily: F.mr }}>
            Draw on the sneaker, we dye it by hand. Ready in 12 days · from ₹8,900.
          </p>
          <div className="mt-7 flex gap-3">
            {["Coral", "Butter", "Ink"].map((s) => (
              <span key={s} className="rounded-full border border-white/15 px-4 py-2 text-[13px] text-white/70" style={{ fontFamily: F.sg }}>
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="h-[min(440px,72%)] overflow-hidden rounded-[26px] border border-white/10">
          <Img i={3} w={700} h={800} />
        </div>
      </div>
      <canvas ref={cv} className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden />
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U194 · Scanning progress button ───────────────────────── */
function U194() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const setOn = (on: boolean) => {
    const el = root.current;
    if (!el) return;
    one(el, ".u194-b").classList.toggle("on", on);
    one(el, ".u194-l1").classList.toggle("b18g3-hide", on);
    one(el, ".u194-l2").classList.toggle("b18g3-hide", !on);
  };
  usePlay(root, (el) => {
    const b = one(el, ".u194-b");
    const d = dot.current;
    const tl = gsap.timeline({ repeat: -1 });
    tl.call(() => goDot(d, el, at(b, el, 0.2, 0.55), 0.45, idle()))
      .to({}, { duration: 0.42 })
      .call(() => {
        if (idle()) setOn(true);
        goDot(d, el, at(b, el, 0.82, 0.45), 1.5, idle(), "sine.inOut");
      })
      .to({}, { duration: 1.5 })
      .call(() => {
        goDot(d, el, at(b, el, 0.5, 2.1), 0.5, idle());
        if (idle()) gsap.delayedCall(0.14, () => idle() && setOn(false));
      })
      .to({}, { duration: 0.52 });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(214,255,92,.5)" g2="rgba(95,212,255,.22)">
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <Eyebrow>Returns · instant check</Eyebrow>
        <h3 className="mt-3 text-[clamp(38px,4vw,62px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.is }}>
          Scan the tag, get refunded today
        </h3>
        <button
          type="button"
          className="u194-b relative mt-10 overflow-hidden rounded-[18px] bg-[#d6ff5c] px-16 py-7 text-[22px] font-[700] text-[#0c1200]"
          style={{ fontFamily: F.sg }}
          onPointerEnter={() => setOn(true)}
          onPointerLeave={() => setOn(false)}
        >
          <span className="u194-str" aria-hidden />
          <span className="relative z-[1] grid">
            <span className="u194-l1" style={{ gridArea: "1/1" }}>
              Scan &amp; verify return
            </span>
            <span className="u194-l2 b18g3-hide" style={{ gridArea: "1/1" }}>
              Scanning order #7712…
            </span>
          </span>
          <span className="u194-scan" aria-hidden />
        </button>
        <p className="mt-6 text-[14px] text-white/50" style={{ fontFamily: F.mr }}>
          Refund of <span className="text-white/80">₹2,750</span> to your original card
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U195 · Paper flap button ───────────────────────── */
const U195_B = [
  { l: "Download invoice", s: "PDF · 84 KB", c: "#4f7dff" },
  { l: "Get the lookbook", s: "PDF · 12 pages", c: "#ff7a59" },
];
function U195() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const setOn = (k: number) => {
    const el = root.current;
    if (!el) return;
    all(el, ".u195-b").forEach((b, i) => b.classList.toggle("on", i === k));
  };
  usePlay(root, (el) => {
    const bs = all(el, ".u195-b");
    const d = dot.current;
    const tl = gsap.timeline({ repeat: -1 });
    bs.forEach((b, k) => {
      tl.call(() => goDot(d, el, at(b, el, 0.18, 0.6), 0.45, idle()))
        .to({}, { duration: 0.42 })
        .call(() => {
          if (idle()) setOn(k);
          goDot(d, el, at(b, el, 0.82, 0.5), 1.3, idle(), "sine.inOut");
        })
        .to({}, { duration: 1.3 });
    });
    tl.call(() => {
      goDot(d, el, at(el, el, 0.5, 0.86), 0.55, idle());
      if (idle()) setOn(-1);
    }).to({}, { duration: 0.55 });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(79,125,255,.52)" g2="rgba(255,122,89,.22)">
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <Eyebrow>Order #5530 · delivered</Eyebrow>
        <h3 className="mt-3 text-[clamp(38px,4vw,62px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Your paperwork, ready
        </h3>
        <div className="mt-20 flex gap-10">
          {U195_B.map((b, k) => (
            <button key={b.l} type="button" className="u195-b relative h-[96px] w-[290px]" onPointerEnter={() => setOn(k)} onPointerLeave={() => setOn(-1)}>
              <span className="u195-pw" aria-hidden>
                <span className="u195-p">
                  <span className="absolute left-[12%] right-[12%] top-[16%] grid gap-[7px]">
                    <i className="block h-[6px] w-[55%] rounded bg-[#1b2030]/70" />
                    <i className="block h-[4px] rounded bg-[#1b2030]/25" />
                    <i className="block h-[4px] w-[80%] rounded bg-[#1b2030]/25" />
                    <i className="block h-[4px] w-[66%] rounded bg-[#1b2030]/25" />
                  </span>
                  <span className="absolute right-[12%] top-[14%] text-[12px] font-[700] text-[#1b2030]/70" style={{ fontFamily: F.sg }}>
                    ₹
                  </span>
                </span>
              </span>
              <span className="u195-pk relative z-[2] flex h-full w-full items-center gap-4 rounded-[18px] px-6 text-left text-white shadow-[0_18px_40px_rgba(0,0,0,.35)]" style={{ background: b.c }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
                </svg>
                <span>
                  <span className="block text-[19px] font-[600]" style={{ fontFamily: F.sg }}>
                    {b.l}
                  </span>
                  <span className="block text-[13px] text-white/75" style={{ fontFamily: F.mr }}>
                    {b.s}
                  </span>
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

/* ───────────────────────── U196 · Paper plane launch ───────────────────────── */
function U196() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const busy = useRef<gsap.core.Timeline | null>(null);
  const flight = (el: HTMLElement) => {
    const plane = one(el, ".u196-plane");
    const wl = one(el, ".u196-wl");
    const wr = one(el, ".u196-wr");
    const btn = one(el, ".u196-btn");
    const l1 = one(el, ".u196-l1");
    const l2 = one(el, ".u196-l2");
    const msg = one(el, ".u196-msg");
    const note = one(el, ".u196-note");
    const tl = gsap.timeline();
    tl.to(btn, { scale: 0.95, duration: 0.1, ease: "power2.out" })
      .to(btn, { scale: 1, duration: 0.3, ease: "back.out(2.4)" })
      .to(wl, { scaleY: 0.35, svgOrigin: "11 12", duration: 0.2, ease: "power2.in" }, 0.05)
      .to(wr, { scaleX: 0.55, svgOrigin: "11 12", duration: 0.2, ease: "power2.in" }, 0.05)
      .to(plane, { rotation: -18, scale: 0.9, duration: 0.2 }, 0.05)
      .to(plane, {
        keyframes: [
          { x: -14, y: 8, duration: 0.14, ease: "power1.out" },
          { x: 140, y: -70, rotation: -28, duration: 0.3, ease: "power1.in" },
          { x: 380, y: -230, rotation: -34, scale: 0.55, opacity: 0, duration: 0.36, ease: "power1.in" },
        ],
      })
      .to(l1, { yPercent: -110, opacity: 0, duration: 0.3, ease: "power2.in" }, 0.3)
      .fromTo(l2, { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.35, ease: "power3.out" }, 0.55)
      .to(btn, { backgroundColor: "#7ce0c3", color: "#05221a", duration: 0.3 }, 0.55)
      .to(msg, { opacity: 0.25, duration: 0.3 }, 0.4)
      .fromTo(note, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 0.7)
      .to({}, { duration: 0.28 })
      // return: plane glides back in from the left, label resets
      .to(note, { autoAlpha: 0, duration: 0.25 })
      .to(l2, { yPercent: -110, autoAlpha: 0, duration: 0.25, ease: "power2.in" }, "<")
      .to(btn, { backgroundColor: "#f2f4ff", color: "#0b0d16", duration: 0.3 }, "<")
      .to(msg, { opacity: 1, duration: 0.3 }, "<")
      .fromTo(l1, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "power3.out" }, "<0.15")
      .set(wl, { scaleY: 1 })
      .set(wr, { scaleX: 1 })
      .fromTo(plane, { x: -70, y: 10, rotation: 10, scale: 1, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.5, ease: "back.out(1.6)" }, "<");
    return tl;
  };
  const fire = () => {
    const el = root.current;
    if (!el || busy.current?.isActive()) return;
    busy.current = flight(el);
  };
  usePlay(root, (el) => {
    const btn = one(el, ".u196-btn");
    const d = dot.current;
    const tl = gsap.timeline({ repeat: -1 });
    tl.call(() => goDot(d, el, btn, 0.45, idle()))
      .to({}, { duration: 0.46 })
      .call(() => {
        if (!idle()) return;
        tapDot(d);
        fire();
      })
      .to({}, { duration: 0.36 })
      .call(() => goDot(d, el, at(btn, el, -1.4, 1.6), 0.7, idle()))
      .to({}, { duration: 0.75 })
      .call(() => goDot(d, el, at(btn, el, -0.3, -1.2), 0.6, idle()))
      .to({}, { duration: 1 });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(159,140,255,.52)" g2="rgba(124,224,195,.22)">
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-[min(600px,80%)] rounded-[26px] border border-white/10 bg-[#111626] p-8 text-left shadow-[0_30px_80px_rgba(0,0,0,.45)]">
          <Eyebrow>Message the atelier</Eyebrow>
          <p className="mt-2 text-[clamp(28px,2.6vw,38px)] leading-[1.05]" style={{ fontFamily: F.is }}>
            Fittings, alterations, gift notes
          </p>
          <div className="u196-msg mt-6 min-h-[96px] rounded-[16px] border border-white/10 bg-white/[0.04] px-5 py-4 text-[16px] leading-[1.5] text-white/80" style={{ fontFamily: F.mr }}>
            Hi! Could I book a fitting for the linen suit (₹18,400) this Saturday around noon?
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="u196-note b18g3-hide text-[14px] text-[#7ce0c3]" style={{ fontFamily: F.mr }}>
              Delivered · replies in about an hour
            </span>
            <button type="button" className="u196-btn ml-auto flex items-center gap-3 overflow-visible rounded-full bg-[#f2f4ff] py-4 pl-6 pr-7 text-[18px] font-[600] text-[#0b0d16]" style={{ fontFamily: F.sg }} onClick={fire}>
              <span className="u196-plane relative z-10 inline-block">
                <svg width="24" height="24" viewBox="0 0 24 24" className="block overflow-visible" aria-hidden>
                  <path className="u196-wl" d="M2.5 11.2L21.5 2.5 10.5 13.3z" fill="currentColor" />
                  <path className="u196-wr" d="M21.5 2.5L14 21.5l-3.5-8.2z" fill="currentColor" opacity=".7" />
                </svg>
              </span>
              <span className="relative grid overflow-hidden">
                <span className="u196-l1" style={{ gridArea: "1/1" }}>
                  Send message
                </span>
                <span className="u196-l2 b18g3-hide" style={{ gridArea: "1/1" }}>
                  Sent ✓
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U197 · TV static card ───────────────────────── */
function U197() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const onR = useRef(false);
  const setOn = (on: boolean) => {
    const el = root.current;
    if (!el || on === onR.current) return;
    onR.current = on;
    const card = one(el, ".u197-c");
    const st = one(el, ".u197-st");
    card.classList.toggle("on", on);
    if (prefersReducedMotion()) return;
    gsap.killTweensOf(st);
    if (on) gsap.timeline().to(st, { opacity: 0.95, duration: 0.08 }).to(st, { opacity: 0.22, duration: 0.45, delay: 0.32, ease: "power2.out" });
    else gsap.timeline().to(st, { opacity: 0.8, duration: 0.06 }).to(st, { opacity: 0, duration: 0.3, delay: 0.1 });
  };
  usePlay(root, (el) => {
    const c = one(el, ".u197-c");
    const d = dot.current;
    const tl = gsap.timeline({ repeat: -1 });
    tl.call(() => goDot(d, el, at(c, el, 0.3, 0.3), 0.45, idle()))
      .to({}, { duration: 0.44 })
      .call(() => {
        if (idle()) setOn(true);
        goDot(d, el, at(c, el, 0.7, 0.62), 1.6, idle(), "sine.inOut");
      })
      .to({}, { duration: 1.6 })
      .call(() => {
        goDot(d, el, at(c, el, 1.5, 0.75), 0.5, idle());
        if (idle()) gsap.delayedCall(0.18, () => idle() && setOn(false));
      })
      .to({}, { duration: 0.55 });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(24,228,255,.5)" g2="rgba(255,46,99,.24)">
      <div className="flex h-full w-full items-center justify-center gap-16 px-[8%]">
        <div className="max-w-[440px]">
          <Eyebrow>After hours</Eyebrow>
          <h3 className="mt-3 text-[clamp(44px,4.6vw,76px)] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.sy, fontWeight: 700 }}>
            Tune in for the late drop
          </h3>
          <p className="mt-5 text-[16px] text-white/60" style={{ fontFamily: F.mr }}>
            One live edit every Friday at 11 pm. Pieces from ₹1,290, gone by sunrise.
          </p>
        </div>
        <div className="u197-c w-[360px] rounded-[26px] border border-white/12 bg-[#151a2b] p-6 shadow-[0_30px_80px_rgba(0,0,0,.5)]" onPointerEnter={() => setOn(true)} onPointerLeave={() => setOn(false)}>
          <div className="relative mx-auto mb-2 h-[30px] w-[120px]" aria-hidden>
            <i className="absolute bottom-0 left-[34%] h-[30px] w-[3px] origin-bottom -rotate-[24deg] rounded bg-white/50" />
            <i className="absolute bottom-0 right-[34%] h-[30px] w-[3px] origin-bottom rotate-[24deg] rounded bg-white/50" />
          </div>
          <div className="relative h-[220px] overflow-hidden rounded-[18px] border-[6px] border-[#2a3150] bg-[#0b2a3a]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#16607a,#0b2a3a_70%)]" />
            <div className="u197-eyes absolute inset-0 flex items-center justify-center gap-10" aria-hidden>
              {[0, 1].map((k) => (
                <span key={k} className="relative grid h-[64px] w-[48px] place-items-center rounded-[50%] bg-[#e9fbff]">
                  <span className="u197-look block">
                    <span className="u197-pu block h-[24px] w-[24px] rounded-full bg-[#0a0d16]" />
                  </span>
                </span>
              ))}
            </div>
            <div className="u197-st" aria-hidden />
            <div className="u197-scan" aria-hidden />
            <div className="u197-roll" aria-hidden />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="u197-t text-[24px] font-[700]" style={{ fontFamily: F.sg }}>
                Channel 07
              </p>
              <p className="mt-1 text-[13px] text-white/55" style={{ fontFamily: F.mr }}>
                Late-night edits · live
              </p>
            </div>
            <span className="rounded-full bg-[#ff2e63] px-4 py-2 text-[13px] font-[700] text-white" style={{ fontFamily: F.sg }}>
              ● On air
            </span>
          </div>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U198 · Synthwave grid crawl button ───────────────────────── */
const U198_S = Array.from({ length: 14 }, (_, i) => ({ l: (i * 37) % 100, t: (i * 23) % 40, d: (i % 5) * 0.3 }));
function U198() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const tilt = useRef({ x: 0, y: 0, a: 0 });
  usePointer(
    root,
    dot,
    (t, el) => {
      const b = rel(one(el, ".u198-b"), el);
      return { x: b.l + b.w * (0.5 + Math.sin(t * 0.8) * 0.42), y: b.t + b.h * (0.5 + Math.sin(t * 1.6) * 0.62), inside: true };
    },
    (p, el, _f, _t, dt) => {
      const btn = one(el, ".u198-b");
      const b = rel(btn, el);
      const T = tilt.current;
      const hit = p.inside && inBox(b, p.x, p.y, 30);
      const nx = hit ? clamp((p.x - b.l) / b.w - 0.5, -0.5, 0.5) : 0;
      const ny = hit ? clamp((p.y - b.t) / b.h - 0.5, -0.5, 0.5) : 0;
      const k = Math.min(1, dt * 6);
      T.x += (nx - T.x) * k;
      T.y += (ny - T.y) * k;
      T.a += ((hit ? 1 : 0) - T.a) * k;
      btn.style.transform = `perspective(900px) rotateY(${(T.x * 14).toFixed(2)}deg) rotateX(${(-T.y * 12).toFixed(2)}deg) scale(${(1 + T.a * 0.03).toFixed(3)})`;
      btn.style.setProperty("--mx", `${((nx + 0.5) * 100).toFixed(1)}%`);
      btn.style.setProperty("--my", `${((ny + 0.5) * 100).toFixed(1)}%`);
      btn.style.setProperty("--ha", T.a.toFixed(3));
    },
  );
  return (
    <Stage r={root} g1="rgba(255,79,216,.52)" g2="rgba(255,209,102,.22)">
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <Eyebrow>One night only · Saturday</Eyebrow>
        <h3 className="mt-3 text-[clamp(38px,4vw,62px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          The midnight market opens
        </h3>
        <button type="button" className="u198-b relative mt-10 h-[170px] w-[min(620px,80%)] overflow-hidden rounded-[26px] border border-[#ff4fd8]/40 bg-[linear-gradient(#12052a,#2c0a45_55%,#12052a)] shadow-[0_30px_80px_rgba(255,79,216,.25)]">
          {U198_S.map((s, i) => (
            <span key={i} className="u198-star" style={{ left: `${s.l}%`, top: `${s.t}%`, animationDelay: `${s.d}s` }} aria-hidden />
          ))}
          <span className="u198-sun absolute left-1/2 top-[14%] ml-[-70px] h-[140px] w-[140px] rounded-full" aria-hidden />
          <span className="absolute inset-x-0 bottom-0 top-[56%] overflow-hidden" style={{ perspective: "180px" }} aria-hidden>
            <span className="u198-floor" />
            <span className="absolute inset-x-0 top-0 h-[60%] bg-[linear-gradient(#2c0a45,transparent)]" />
          </span>
          <span className="absolute inset-x-0 top-[56%] h-[2px] bg-[#ff4fd8] shadow-[0_0_18px_#ff4fd8]" aria-hidden />
          <span
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(240px 160px at var(--mx,50%) var(--my,50%),rgba(255,255,255,.18),transparent 70%)", opacity: "var(--ha,0)" } as CSSProperties}
            aria-hidden
          />
          <span className="relative z-[2] flex h-full flex-col items-center justify-start pt-[34px]">
            <span className="text-[clamp(26px,2.4vw,36px)] font-[700] uppercase tracking-[0.04em] text-white [text-shadow:0_0_18px_#ff4fd8,0_2px_0_#7a1a8a]" style={{ fontFamily: F.sy }}>
              Enter the night sale →
            </span>
            <span className="mt-2 text-[13px] uppercase tracking-[0.2em] text-[#ffd1f4]" style={{ fontFamily: F.sg }}>
              Up to 60% off · 12 am – 4 am
            </span>
          </span>
        </button>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U199 · Retracting sidebar ───────────────────────── */
const U199_NAV = [
  { n: "Overview", d: "M4 13h6V4H4zm10 7h6v-9h-6zM4 20h6v-4H4zm10-11h6V4h-6z" },
  { n: "Orders", d: "M6 7h12l-1 13H7zM9 7V5a3 3 0 0 1 6 0v2" },
  { n: "Products", d: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" },
  { n: "Customers", d: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 4a4 4 0 0 1 0 7M22 21a7 7 0 0 0-4-6.3" },
  { n: "Discounts", d: "M19 5L5 19M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
  { n: "Settings", d: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 14H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 10h.1a2 2 0 1 1 0 4z" },
];
const U199_CARDS = [
  { n: "Revenue · today", v: "₹1,84,200", s: "+12% vs last Fri" },
  { n: "Orders", v: "318", s: "42 waiting to ship" },
  { n: "Returning buyers", v: "61%", s: "Best week this season" },
];
function U199() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const FlipR = useRef<FlipT | null>(null);
  const shut = useRef(false);
  const toggle = (collapse = !shut.current) => {
    const el = root.current;
    const Flip = FlipR.current;
    if (!el) return;
    shut.current = collapse;
    const frame = one(el, ".u199-frame");
    const labs = all(el, ".u199-lab");
    const chev = one(el, ".u199-chev");
    const targets = [one(el, ".u199-side"), ...all(el, ".u199-card")];
    if (!Flip || prefersReducedMotion()) {
      frame.classList.toggle("u199-c", collapse);
      gsap.set(labs, { opacity: collapse ? 0 : 1 });
      return;
    }
    gsap.to(chev, { rotation: collapse ? 180 : 0, duration: 0.5, ease: "power3.inOut" });
    if (collapse) {
      gsap.to(labs, { opacity: 0, x: -10, duration: 0.2, stagger: 0.02, ease: "power2.in", overwrite: true });
      gsap.delayedCall(0.16, () => {
        const s = Flip.getState(targets);
        frame.classList.add("u199-c");
        Flip.from(s, { duration: 0.6, ease: "power3.inOut" });
      });
    } else {
      const s = Flip.getState(targets);
      frame.classList.remove("u199-c");
      Flip.from(s, { duration: 0.6, ease: "power3.inOut" });
      gsap.to(labs, { opacity: 1, x: 0, duration: 0.3, stagger: 0.03, delay: 0.3, ease: "power2.out", overwrite: true });
    }
  };
  const tip = (k: number) => {
    const el = root.current;
    if (!el) return;
    const t = one(el, ".u199-tip");
    if (k < 0) {
      gsap.to(t, { opacity: 0, x: -6, duration: 0.2 });
      return;
    }
    const it = all(el, ".u199-it")[k];
    const fb = rel(one(el, ".u199-frame"), el);
    const b = rel(it, el);
    t.textContent = U199_NAV[k].n;
    gsap.set(t, { top: b.t - fb.t + b.h / 2 - 17 });
    gsap.to(t, { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" });
  };
  usePlay(
    root,
    (el, Flip) => {
      FlipR.current = Flip;
      const d = dot.current;
      const btn = one(el, ".u199-tg");
      const its = all(el, ".u199-it");
      const cards = all(el, ".u199-card");
      const tl = gsap.timeline({ repeat: -1 });
      tl.call(() => goDot(d, el, btn, 0.45, idle()))
        .to({}, { duration: 0.46 })
        .call(() => {
          if (!idle()) return;
          tapDot(d);
          toggle(true);
        })
        .to({}, { duration: 0.5 })
        .call(() => goDot(d, el, its[1], 0.45, idle()))
        .to({}, { duration: 0.46 })
        .call(() => idle() && shut.current && tip(1))
        .to({}, { duration: 0.3 })
        .call(() => goDot(d, el, its[3], 0.4, idle()))
        .to({}, { duration: 0.42 })
        .call(() => idle() && shut.current && tip(3))
        .to({}, { duration: 0.3 })
        .call(() => {
          tip(-1);
          goDot(d, el, btn, 0.45, idle());
        })
        .to({}, { duration: 0.46 })
        .call(() => {
          if (!idle()) return;
          tapDot(d);
          toggle(false);
        })
        .to({}, { duration: 0.5 })
        .call(() => goDot(d, el, at(cards[1], el, 0.5, 0.55), 0.55, idle()))
        .to({}, { duration: 0.56 });
      return tl;
    },
    true,
  );
  return (
    <Stage r={root} g1="rgba(124,224,195,.5)" g2="rgba(79,141,255,.24)">
      <div className="flex h-full w-full items-center justify-center">
        <div className="u199-frame relative flex h-[min(520px,84%)] w-[min(1000px,86%)] overflow-hidden rounded-[24px] border border-white/10 bg-[#0e1220] shadow-[0_30px_80px_rgba(0,0,0,.45)]">
          <aside className="u199-side relative flex shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#121729] py-5">
            <div className="flex items-center gap-3 whitespace-nowrap px-[17px]">
              <span className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-[12px] bg-[#7ce0c3] text-[18px] font-[800] text-[#05221a]" style={{ fontFamily: F.sy }}>
                F
              </span>
              <span className="u199-lab text-[18px] font-[700]" style={{ fontFamily: F.sg }}>
                Fennel Admin
              </span>
            </div>
            <nav className="mt-6 grid gap-1 px-[11px]">
              {U199_NAV.map((it, k) => (
                <a key={it.n} href="#" onClick={(e) => e.preventDefault()} className={`u199-it flex items-center gap-3 whitespace-nowrap rounded-[12px] px-[10px] py-[9px] ${k === 0 ? "bg-white/[0.08] text-white" : "text-white/65"}`}>
                  <svg className="shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={it.d} />
                  </svg>
                  <span className="u199-lab text-[15px] font-[500]" style={{ fontFamily: F.mr }}>
                    {it.n}
                  </span>
                </a>
              ))}
            </nav>
            <div className="mt-auto flex items-center gap-3 whitespace-nowrap px-[17px]">
              <span className="h-[44px] w-[44px] shrink-0 rounded-full bg-[linear-gradient(135deg,#ffd166,#ff7a59)]" />
              <span className="u199-lab">
                <span className="block text-[14px] font-[600]" style={{ fontFamily: F.sg }}>
                  Tara Velan
                </span>
                <span className="block text-[12px] text-white/50" style={{ fontFamily: F.mr }}>
                  Store owner
                </span>
              </span>
            </div>
          </aside>
          <div className="relative flex min-w-0 flex-1 flex-col p-7">
            <div className="flex items-center gap-4">
              <button type="button" aria-label="Collapse sidebar" onClick={() => toggle()} className="u199-tg grid h-[40px] w-[40px] place-items-center rounded-[10px] border border-white/12 bg-white/[0.05]">
                <svg className="u199-chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <div>
                <p className="text-[13px] uppercase tracking-[0.2em] text-white/50" style={{ fontFamily: F.sg }}>
                  Friday · 4 Oct
                </p>
                <p className="text-[28px] leading-[1.1]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
                  Good evening, Tara
                </p>
              </div>
            </div>
            <div className="mt-7 flex gap-4">
              {U199_CARDS.map((c) => (
                <div key={c.n} className="u199-card min-w-0 flex-1 overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.04] p-5">
                  <p className="truncate text-[13px] text-white/55" style={{ fontFamily: F.mr }}>
                    {c.n}
                  </p>
                  <p className="mt-2 truncate text-[30px] font-[600] tracking-[-0.02em]" style={{ fontFamily: F.sg }}>
                    {c.v}
                  </p>
                  <p className="mt-1 truncate text-[13px] text-[#7ce0c3]" style={{ fontFamily: F.mr }}>
                    {c.s}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex min-h-0 flex-1 items-end gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] p-5">
              {Array.from({ length: 18 }, (_, i) => (
                <span key={i} className="flex-1 rounded-t-[6px] bg-[linear-gradient(#7ce0c3,rgba(124,224,195,.15))]" style={{ height: `${30 + ((i * 41) % 62)}%` }} />
              ))}
            </div>
          </div>
          <span
            className="u199-tip pointer-events-none absolute left-[86px] top-0 z-20 rounded-[8px] bg-[#f2f4ff] px-3 py-[7px] text-[13px] font-[600] text-[#0b0d16] shadow-[0_8px_20px_rgba(0,0,0,.35)]"
            style={{ fontFamily: F.sg }}
            aria-hidden
          >
            Orders
          </span>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U200 · Logo origami ───────────────────────── */
const U200_L = [
  { n: "Halden & Co", bg: "#f3ede2", fg: "#1c2233" },
  { n: "Norva", bg: "#1f3b8f", fg: "#f2f4ff" },
  { n: "Oakline", bg: "#1d4b3a", fg: "#e8f5d8" },
  { n: "Studio Pell", bg: "#ff7a59", fg: "#2a0d05" },
];
function U200Logo({ i, vis }: { i: number; vis: boolean }) {
  const L = U200_L[i];
  return (
    <div className="u200-l absolute inset-0 flex flex-col items-center justify-center" data-i={i} style={{ background: L.bg, visibility: vis ? "visible" : "hidden" }}>
      <svg width="120" height="120" viewBox="0 0 100 100" aria-hidden>
        {i === 0 && <circle cx="50" cy="50" r="30" fill="none" stroke={L.fg} strokeWidth="8" />}
        {i === 1 && <path d="M50 18L84 80H16z" fill={L.fg} />}
        {i === 2 && <path d="M50 14C78 32 80 66 50 86 20 66 22 32 50 14zM50 30v52" fill="none" stroke={L.fg} strokeWidth="7" strokeLinecap="round" />}
        {i === 3 && (
          <g fill={L.fg}>
            <rect x="18" y="18" width="28" height="28" rx="6" />
            <rect x="54" y="54" width="28" height="28" rx="14" />
            <rect x="54" y="18" width="28" height="28" rx="6" opacity=".45" />
          </g>
        )}
      </svg>
      <span className="mt-4 text-[26px] font-[700] tracking-[-0.01em]" style={{ fontFamily: i % 2 ? F.sy : F.fr, color: L.fg }}>
        {L.n}
      </span>
    </div>
  );
}
function U200Face({ cls, clip, show, style }: { cls: string; clip: string; show: number; style?: CSSProperties }) {
  return (
    <div className={`u200-face ${cls}`} style={{ clipPath: clip, ...style }}>
      {U200_L.map((_, i) => (
        <U200Logo key={i} i={i} vis={show === i} />
      ))}
      <span className="u200-sh pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0 }} />
    </div>
  );
}
const U200_CLIP = {
  top: "inset(0 0 50% 0)",
  bottom: "inset(50% 0 0 0)",
  left: "inset(0 50% 0 0)",
  right: "inset(0 0 0 50%)",
};
function U200() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const show = (face: HTMLElement, i: number) => all(face, ".u200-l").forEach((l) => (l.style.visibility = Number(l.dataset.i) === i ? "visible" : "hidden"));
    const baseNext = one(el, ".u200-bn");
    const baseCur = one(el, ".u200-bc");
    const flap = one(el, ".u200-flap");
    const front = one(el, ".u200-ff");
    const back = one(el, ".u200-fb");
    const name = one(el, ".u200-name");
    const n = U200_L.length;
    const tl = gsap.timeline({ repeat: -1 });
    for (let k = 0; k < n; k++) {
      const cur = k;
      const nxt = (k + 1) % n;
      const H = k % 2 === 0;
      tl.call(() => {
        show(baseNext, nxt);
        show(baseCur, cur);
        show(front, cur);
        show(back, nxt);
        baseNext.style.clipPath = H ? U200_CLIP.top : U200_CLIP.right;
        baseCur.style.clipPath = H ? U200_CLIP.bottom : U200_CLIP.left;
        front.style.clipPath = H ? U200_CLIP.top : U200_CLIP.right;
        back.style.clipPath = H ? U200_CLIP.bottom : U200_CLIP.left;
        gsap.set(back, { rotationX: H ? 180 : 0, rotationY: H ? 0 : 180 });
        gsap.set(flap, { rotationX: 0, rotationY: 0, transformOrigin: "50% 50%" });
      });
      tl.to(flap, { [H ? "rotationX" : "rotationY"]: -180, duration: 0.9, ease: "power2.inOut" });
      tl.fromTo(one(front, ".u200-sh"), { opacity: 0 }, { opacity: 0.5, duration: 0.45, ease: "power1.in" }, "<");
      tl.fromTo(one(back, ".u200-sh"), { opacity: 0.5 }, { opacity: 0, duration: 0.45, ease: "power1.out" }, "<0.45");
      tl.fromTo(one(baseCur, ".u200-sh"), { opacity: 0 }, { opacity: 0.35, duration: 0.9, ease: "power1.in" }, "<-0.45");
      tl.call(() => {
        name.textContent = `${String(nxt + 1).padStart(2, "0")} / ${U200_L[nxt].n}`;
        gsap.fromTo(name, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "power3.out" });
        gsap.set(one(baseCur, ".u200-sh"), { opacity: 0 });
      });
      tl.to({}, { duration: 0.24 });
    }
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,122,89,.5)" g2="rgba(79,141,255,.24)">
      <div className="flex h-full w-full items-center justify-center gap-20 px-[8%]">
        <div className="max-w-[420px]">
          <Eyebrow>Identity studio · selected work</Eyebrow>
          <h3 className="mt-3 text-[clamp(44px,4.6vw,74px)] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            140 marks, folded with care
          </h3>
          <p className="u200-name mt-6 text-[16px] uppercase tracking-[0.16em] text-white/65" style={{ fontFamily: F.sg }}>
            01 / Halden &amp; Co
          </p>
        </div>
        <div className="u200-tile relative h-[340px] w-[340px] shrink-0">
          <U200Face cls="u200-bn" clip={U200_CLIP.top} show={1} />
          <U200Face cls="u200-bc" clip={U200_CLIP.bottom} show={0} />
          <div className="u200-flap">
            <U200Face cls="u200-ff" clip={U200_CLIP.top} show={0} />
            <U200Face cls="u200-fb" clip={U200_CLIP.bottom} show={1} style={{ transform: "rotateX(180deg)" }} />
          </div>
          <span className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,.5)]" aria-hidden />
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── U201 · Segmented tick scrollbar (scrub) ───────────────────────── */
const U201_N = 36;
const U201_ROWS = [
  ["Linen camp shirt", "₹3,290"],
  ["Pleated wide trouser", "₹4,450"],
  ["Merino crew, oat", "₹5,100"],
  ["Canvas tote, large", "₹1,890"],
  ["Suede loafer", "₹7,900"],
  ["Ribbed tank, 2-pack", "₹1,490"],
  ["Overshirt, charcoal", "₹4,290"],
  ["Silk scarf, tide", "₹2,350"],
  ["Cord jacket", "₹6,800"],
  ["Knit polo, sage", "₹3,650"],
  ["Leather belt", "₹2,190"],
  ["Rain shell, ink", "₹8,450"],
  ["Cotton socks, 3-pack", "₹890"],
  ["Weekend holdall", "₹9,900"],
];
function u201Tick(i: number, p: number, v = 0) {
  const idx = p * (U201_N - 1);
  const d = Math.abs(i - idx);
  const g = Math.exp(-(d * d) / 5);
  const w = (12 + 46 * g) * (1 + Math.abs(v) * 0.5 * g);
  const h = 4 + 5 * g;
  const passed = i <= idx;
  return {
    width: `${w.toFixed(1)}px`,
    height: `${h.toFixed(1)}px`,
    borderRadius: `${(1 + 8 * g).toFixed(1)}px`,
    background: g > 0.35 ? `rgba(124,224,195,${(0.45 + 0.55 * g).toFixed(3)})` : passed ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.16)",
  };
}
function U201() {
  const root = useRef<HTMLDivElement>(null);
  useScrub(root, (p, v) => {
    const el = root.current;
    if (!el) return;
    all(el, ".u201-t").forEach((t, i) => Object.assign(t.style, u201Tick(i, p, v)));
    const win = one(el, ".u201-win");
    const list = one(el, ".u201-list");
    const max = Math.max(0, list.scrollHeight - win.clientHeight);
    list.style.transform = `translate3d(0,${(-p * max).toFixed(1)}px,0)`;
    const bar = one(el, ".u201-bar");
    const head = one(el, ".u201-hd");
    head.style.transform = `translate3d(0,${(p * bar.clientHeight).toFixed(1)}px,0)`;
    one(el, ".u201-pc").textContent = `${Math.round(p * 100)}%`;
  });
  return (
    <Stage r={root} g1="rgba(124,224,195,.5)" g2="rgba(159,140,255,.22)">
      <div className="flex h-full w-full items-center justify-center gap-16 px-[8%]">
        <div className="w-[min(620px,60%)]">
          <Eyebrow>Autumn index · 14 pieces</Eyebrow>
          <h3 className="mt-3 text-[clamp(38px,4vw,62px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.is }}>
            Everything in the new season
          </h3>
          <div className="u201-win relative mt-7 h-[min(340px,44vh)] overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03]">
            <div className="u201-list px-6">
              {U201_ROWS.map(([n, pr], k) => (
                <div key={n} className="flex items-center justify-between border-b border-white/8 py-4">
                  <span className="flex items-center gap-4">
                    <span className="text-[13px] text-white/40" style={{ fontFamily: F.sg }}>
                      {String(k + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[19px]" style={{ fontFamily: F.sg }}>
                      {n}
                    </span>
                  </span>
                  <span className="text-[16px] text-white/65" style={{ fontFamily: F.mr }}>
                    {pr}
                  </span>
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(transparent,#0a0d16)]" />
          </div>
        </div>
        <div className="relative flex h-[min(500px,72%)] items-stretch gap-5">
          <div className="u201-bar relative flex w-[64px] flex-col items-end justify-between">
            {Array.from({ length: U201_N }, (_, i) => (
              <span key={i} className="u201-t block" style={u201Tick(i, 0)} />
            ))}
            <span className="u201-hd absolute -right-[14px] top-0 -mt-[5px] block h-[10px] w-[10px]" aria-hidden>
              <span className="u201-head block h-full w-full rounded-full bg-[#7ce0c3]" />
            </span>
          </div>
          <div className="flex flex-col justify-between py-1 text-[13px] text-white/45" style={{ fontFamily: F.sg }}>
            <span>Top</span>
            <span className="u201-pc text-[28px] font-[600] text-[#7ce0c3]">0%</span>
            <span>End</span>
          </div>
        </div>
      </div>
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "U190", name: "Swipe-to-confirm", how: "A knob is dragged along the track; the striped fill follows it and the label turns to a paid receipt at the end. A fake pointer runs the drag on a loop.", kind: "play", C: U190 },
  { code: "U191", name: "Live teammate cursors", how: "Labelled teammate cursors roam a design tile; a coloured selection frame springs between the elements one of them is editing. Loops on screen.", kind: "play", C: U191 },
  { code: "U192", name: "Layered shadow snap", how: "Each word carries four coloured offset shadows; on hover they snap flat into the text, then spring back out. A fake pointer hovers the lines.", kind: "play", C: U192 },
  { code: "U193", name: "Drawing cursor stroke", how: "The pointer draws a glowing, tapering stroke on a canvas over the page that thins and fades within a second. A fake pointer sweeps a figure-eight.", kind: "play", C: U193 },
  { code: "U194", name: "Scanning progress button", how: "On hover diagonal stripes scroll inside the button and a difference-blend bar sweeps across the label, inverting it. A fake pointer hovers in and out.", kind: "play", C: U194 },
  { code: "U195", name: "Paper flap button", how: "On hover the sheet tucked in the button lifts and tilts out in 3D (rotateX) and keeps bobbing. A fake pointer hovers each button in turn.", kind: "play", C: U195 },
  { code: "U196", name: "Paper plane launch", how: "On click the plane icon folds its wings and flies off up-right, the label rolls to Sent, then a new plane glides back in. A fake pointer clicks it.", kind: "play", C: U196 },
  { code: "U197", name: "TV static card", how: "Hovering the card bursts TV static over its screen, glitches the title in RGB slices and the eyes start looking around. A fake pointer hovers it.", kind: "play", C: U197 },
  { code: "U198", name: "Synthwave grid crawl button", how: "A perspective neon grid floor crawls toward you inside the button under a striped sun, looping; the button tilts toward the pointer.", kind: "play", C: U198 },
  { code: "U199", name: "Retracting sidebar", how: "The sidebar's labels fade out and it collapses to icons (Flip) while the dashboard cards widen, shows icon tips, then expands back. Scripted taps loop.", kind: "play", C: U199 },
  { code: "U200", name: "Logo origami", how: "A logo tile folds along its crease (3D rotation of a clipped half, shaded) to reveal the next logo, alternating horizontal and vertical folds. Loops.", kind: "play", C: U200 },
  { code: "U201", name: "Segmented tick scrollbar", how: "A scrollbar of thin ticks follows the scroll: ticks near the position swell, round off and light up in a wave, passed ones stay lit.", kind: "scrub", C: U201 },
];
