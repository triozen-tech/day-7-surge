"use client";

// Micro-interactions, batch 18 · group 1 (MOTION-MENU U166–U177). Small focused demos for /lab/motion.
// Every click / hover / cursor demo also plays by itself: a visible fake pointer (ring, or the custom cursor itself) walks
// over the targets or runs a scripted press, resting ≤ 0.5 s per target (anything held longer keeps something moving).
// The real mouse takes over for 2.5 s whenever it moves inside the stage.
// A CSS-only glow loop never stops (and sits on top again, screen-blended) so covered stages never freeze.
// ?static=1 / reduced motion: no JS, the markup shows a sensible final state.
import { useEffect, useId, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
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
.b18g1-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b18g1-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b18g1-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b18g1-hide{visibility:hidden}
.b18g1-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;pointer-events:none;z-index:60;opacity:0;transition:opacity .25s}
.b18g1-dot>span{display:block;width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);transition:transform .2s,background-color .2s}
.b18g1-dot.tap>span{animation:b18g1-tap .32s ease-out}
.b18g1-dot.down>span{transform:scale(.62);background:rgba(255,255,255,.62)}
@keyframes b18g1-tap{40%{transform:scale(.55);background:rgba(255,255,255,.6)}100%{transform:scale(1)}}

/* U166 border frame menu */
.u166-side{position:absolute;background:#dfff5e;z-index:20}
.u166-burger{position:absolute;right:14px;top:14px;z-index:30;width:44px;height:44px;border-radius:12px;display:grid;place-items:center;cursor:pointer;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);transition:background-color .35s,border-color .35s}
.u166-burger i{position:absolute;left:12px;width:20px;height:2px;border-radius:2px;background:#fff;transition:transform .4s ${EZ},background-color .35s,opacity .3s}
.u166-burger i:nth-child(1){top:16px}.u166-burger i:nth-child(2){top:21px}.u166-burger i:nth-child(3){top:26px}
.u166-burger.on{background:#0c0f08;border-color:#0c0f08}
.u166-burger.on i:nth-child(1){transform:translateY(5px) rotate(45deg)}
.u166-burger.on i:nth-child(2){opacity:0}
.u166-burger.on i:nth-child(3){transform:translateY(-5px) rotate(-45deg)}
.u166-it{position:relative;transition:color .3s}
.u166-it::after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:2px;background:#0c0f08;transform:scaleX(0);transform-origin:left;transition:transform .35s ${EZ}}
.u166-it.hov::after{transform:none}

/* U167 3D progress button */
.u167-scene{perspective:900px}
.u167-cube{position:relative;width:360px;height:72px;transform-style:preserve-3d}
.u167-face{position:absolute;inset:0;border-radius:16px;display:flex;align-items:center;justify-content:center;backface-visibility:hidden}
.u167-front{transform:translateZ(36px);background:#f4efe6;color:#14110d;transition:background-color .4s,color .4s}
.u167-front .u167-ok{position:absolute;opacity:0;transition:opacity .3s}
.u167-front .u167-lab{transition:opacity .3s}
.u167-front.done{background:#5fe0a0;color:#06170e}
.u167-front.done .u167-ok{opacity:1}
.u167-front.done .u167-lab{opacity:0}
.u167-front .u167-ok path{stroke-dasharray:30;stroke-dashoffset:30;transition:stroke-dashoffset .5s ${EZ} .1s}
.u167-front.done .u167-ok path{stroke-dashoffset:0}
.u167-bottom{transform:rotateX(-90deg) translateZ(36px);background:#1b1f2c;overflow:hidden;border:1px solid rgba(255,255,255,.12)}
.u167-fill{position:absolute;inset:0;background:linear-gradient(90deg,#ffb35c,#ff6f61);transform-origin:left;transform:scaleX(0)}

/* U169 letters */
.u169-w{transition:color .35s}
.u169-w.on{color:#ff9f6e}
.u169-c{display:inline-block;will-change:transform}

/* U170 grid menu */
.u170-box{position:relative;overflow:hidden;border-radius:18px;background:#141826}
.u170-box img{transition:transform .8s ${EZ}}
.u170-box.hov img{transform:scale(1.08)}
.u170-cover{position:absolute;inset:0;background:#c9b8ff;z-index:5}

/* U171 drag menu */
.u171-it{transition:color .45s,opacity .45s;color:rgba(255,255,255,.22)}
.u171-it.on{color:#fff6ea}
.u171-ph{position:absolute;inset:0;opacity:0;transition:opacity .45s}
.u171-ph.on{opacity:1}

/* U172 cursor ring */
.u172-l{position:relative;transition:color .35s}
.u172-l::after{content:"";position:absolute;left:0;right:0;bottom:2px;height:1px;background:currentColor;transform:scaleX(0);transition:transform .45s ${EZ}}
.u172-l.on{color:#ffd29a}
.u172-l.on::after{transform:none}

/* U173 crosshair */
.u173-l{transition:color .3s}
.u173-l.on{color:#8ff5d4}
.u173-c{display:inline-block}

/* U174 spring cursor */
.u174-card{transition:border-color .35s,transform .45s ${EZ},background-color .35s}
.u174-card.on{border-color:rgba(160,200,255,.7);background:rgba(160,200,255,.07);transform:translateY(-6px)}

/* U175 cool mode */
.u175-btn{transition:transform .2s ${EZ},background-color .3s}
.u175-btn.down{transform:scale(.95);background:#ff4f7b}
.u175-p{position:absolute;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;opacity:0;pointer-events:none;will-change:transform,opacity}

/* U176 skeleton scan */
.u176-scan{position:absolute;inset:0;animation:u176-sweep 2.8s linear infinite;pointer-events:none}
@keyframes u176-sweep{0%{transform:translateX(4%);opacity:0}8%{opacity:1}92%{opacity:1}100%{transform:translateX(96%);opacity:0}}
.u176-line{position:absolute;left:0;top:0;bottom:0;width:2px;margin-left:-1px;background:linear-gradient(180deg,transparent,#bfe9ff 30%,#fff 50%,#bfe9ff 70%,transparent);box-shadow:0 0 18px 4px rgba(120,200,255,.45)}
.u176-sp{position:absolute;left:-2px;width:5px;height:5px;border-radius:50%;background:#fff;box-shadow:0 0 8px 2px rgba(150,220,255,.8);animation:u176-rise 1.3s linear infinite}
@keyframes u176-rise{0%{transform:translate(0,0) scale(.4);opacity:0}25%{opacity:1}100%{transform:translate(var(--dx,10px),-38px) scale(1);opacity:0}}
.u176-ic{position:absolute;top:50%;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;display:grid;place-items:center;background:#141a28;border:1px solid rgba(255,255,255,.12);animation:u176-pulse 2.8s ease-out infinite}
@keyframes u176-pulse{0%,100%{transform:scale(1);border-color:rgba(255,255,255,.12)}6%{transform:scale(1.16);border-color:rgba(150,220,255,.9)}24%{transform:scale(1);border-color:rgba(255,255,255,.2)}}
.u176-ring{position:absolute;inset:-1px;border-radius:50%;border:2px solid rgba(150,220,255,.8);opacity:0;animation:u176-ring 2.8s ease-out infinite;animation-delay:inherit}
@keyframes u176-ring{0%{transform:scale(1);opacity:0}5%{opacity:.9}30%{transform:scale(1.9);opacity:0}100%{opacity:0}}
.u176-sk{background:linear-gradient(90deg,rgba(255,255,255,.06) 0%,rgba(255,255,255,.16) 50%,rgba(255,255,255,.06) 100%);background-size:200% 100%;animation:u176-sh 1.8s linear infinite}
@keyframes u176-sh{from{background-position:100% 0}to{background-position:-100% 0}}
.u176-grid{background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:28px 28px}

html.is-static .b18g1-glow,html.is-static .u176-scan,html.is-static .u176-sp,html.is-static .u176-ic,html.is-static .u176-ring,html.is-static .u176-sk{animation:none}
html.is-static .u176-scan{transform:translateX(50%)}
html.is-static {
  .b18g1-glow,.u176-scan,.u176-sp,.u176-ic,.u176-ring,.u176-sk{animation:none}
  .u176-scan{transform:translateX(50%)}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop, again on top (screen blend) so covered stages never freeze. */
function Stage({ r, children, g1, g2, style }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string; style?: CSSProperties }) {
  return (
    <div ref={r} className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff]" style={style}>
      <style href="b18g1-css" precedence="default">
        {CSS}
      </style>
      <div className="b18g1-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      <div className="b18g1-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: 0.45, zIndex: 45 } as CSSProperties} aria-hidden />
    </div>
  );
}

/** The visible fake pointer (a ring). */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => (
  <div ref={r} className="b18g1-dot" aria-hidden>
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
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const lerpK = (dt: number, rate: number) => 1 - Math.exp(-dt * rate);

/** Real-pointer record for a stage (position + when it last moved). */
function useReal(root: RefObject<HTMLDivElement | null>) {
  const real = useRef({ x: 0, y: 0, inside: false, at: -1e9 });
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
  return real;
}

/** Pointer driver: the real mouse wins for 2.5 s after it last moved; otherwise `script` moves a visible fake ring. */
function usePointer(
  root: RefObject<HTMLDivElement | null>,
  dot: RefObject<HTMLDivElement | null> | null,
  script: (t: number, el: HTMLDivElement) => Pt,
  frame: (p: Pt, el: HTMLDivElement, fake: boolean, t: number, dt: number) => void,
) {
  const real = useReal(root);
  const sc = useRef(script);
  sc.current = script;
  const fr = useRef(frame);
  fr.current = frame;
  const t0 = useRef(-1);
  useTicker(root, (t, dt) => {
    const el = root.current;
    if (!el) return;
    if (t0.current < 0) t0.current = t;
    const R = real.current;
    const useR = performance.now() - R.at < 2500;
    const p = useR ? { x: R.x, y: R.y, inside: R.inside } : sc.current(t - t0.current, el);
    const dn = dot?.current;
    if (dn) {
      dn.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0)`;
      dn.style.opacity = useR ? "0" : "1";
    }
    fr.current(p, el, !useR, t - t0.current, Math.min(dt, 0.05));
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

/** Pause for `d` seconds inside a timeline. */
const wait = (tl: gsap.core.Timeline, d: number) => tl.to({}, { duration: d });

// eslint-disable-next-line @next/next/no-img-element
const Img = ({ i, className = "", w = 700, h = 900 }: { i: number; className?: string; w?: number; h?: number }) => (
  <img src={scene(i, w, h)} alt="" className={`block h-full w-full object-cover ${className}`} draggable={false} />
);

const Eyebrow = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={`text-[13px] uppercase tracking-[0.22em] text-white/55 ${className}`} style={{ fontFamily: F.sg }}>
    {children}
  </p>
);

/* ───────────────────────── U166 · Animated border frame menu ───────────────────────── */
const U166_TOP = ["New in", "Outerwear", "Knitwear", "Journal", "Stores"];
const BAND = 64;
function U166() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const st = useRef<{ open: boolean; tl: gsap.core.Timeline | null }>({ open: false, tl: null });
  const toggle = (want?: boolean) => {
    const el = root.current;
    if (!el) return;
    const S = st.current;
    const on = want ?? !S.open;
    if (on === S.open) return;
    S.open = on;
    one(el, ".u166-burger").classList.toggle("on", on);
    const [t, r, b, l] = all(el, ".u166-side");
    const items = all(el, ".u166-it");
    const page = one(el, ".u166-page");
    S.tl?.kill();
    if (prefersReducedMotion()) {
      gsap.set([t, b], { scaleX: on ? 1 : 0 });
      gsap.set([r, l], { scaleY: on ? 1 : 0 });
      gsap.set(items, { autoAlpha: on ? 1 : 0 });
      return;
    }
    const tl = gsap.timeline();
    if (on) {
      tl.to(page, { scale: 0.8, borderRadius: 22, duration: 0.95, ease: "power3.inOut" }, 0)
        .to(t, { scaleX: 1, duration: 0.24, ease: "power2.in" }, 0)
        .to(r, { scaleY: 1, duration: 0.18, ease: "none" })
        .to(b, { scaleX: 1, duration: 0.24, ease: "none" })
        .to(l, { scaleY: 1, duration: 0.18, ease: "power2.out" })
        .fromTo(items, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.05, ease: "power3.out" }, "-=0.2");
    } else {
      all(el, ".u166-it").forEach((n) => n.classList.remove("hov"));
      tl.to(items, { y: -10, autoAlpha: 0, duration: 0.2, stagger: 0.025, ease: "power2.in" })
        .to(l, { scaleY: 0, duration: 0.16, ease: "power2.in" })
        .to(b, { scaleX: 0, duration: 0.2, ease: "none" })
        .to(r, { scaleY: 0, duration: 0.16, ease: "none" })
        .to(t, { scaleX: 0, duration: 0.2, ease: "power2.out" })
        .to(page, { scale: 1, borderRadius: 0, duration: 0.75, ease: "power3.inOut" }, 0.15);
    }
    S.tl = tl;
  };
  usePlay(root, (el) => {
    const [t, r, b, l] = all(el, ".u166-side");
    gsap.set(t, { scaleX: 0, transformOrigin: "0% 50%" });
    gsap.set(r, { scaleY: 0, transformOrigin: "50% 0%" });
    gsap.set(b, { scaleX: 0, transformOrigin: "100% 50%" });
    gsap.set(l, { scaleY: 0, transformOrigin: "50% 100%" });
    const d = dot.current;
    const burger = one(el, ".u166-burger");
    const items = all(el, ".u166-it");
    const hov = (k: number) => items.forEach((n, j) => n.classList.toggle("hov", j === k));
    const tl = gsap.timeline({ repeat: -1 });
    tl.call(() => goDot(d, el, [el.clientWidth * 0.58, el.clientHeight * 0.62], 0.5, idle()));
    wait(tl, 0.55);
    tl.call(() => goDot(d, el, burger, 0.45, idle()));
    wait(tl, 0.5);
    tl.call(() => {
      if (!idle()) return;
      tapDot(d);
      toggle(true);
    });
    wait(tl, 0.45);
    [1, 3].forEach((k) => {
      tl.call(() => goDot(d, el, items[k], 0.4, idle()));
      wait(tl, 0.42);
      tl.call(() => idle() && hov(k));
      wait(tl, 0.3);
    });
    tl.call(() => goDot(d, el, burger, 0.45, idle()));
    wait(tl, 0.5);
    tl.call(() => {
      if (!idle()) return;
      tapDot(d);
      toggle(false);
    });
    wait(tl, 0.45);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(223,255,94,.5)" g2="rgba(120,160,255,.24)">
      <div className="u166-page absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-center pl-[8%] pr-6">
            <Eyebrow>Autumn · 26 collection</Eyebrow>
            <h3 className="mt-4 text-[clamp(44px,5vw,84px)] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
              Layers,
              <br />
              made slowly.
            </h3>
            <p className="mt-5 max-w-[34ch] text-[16px] text-white/60" style={{ fontFamily: F.mr }}>
              Merino, waxed cotton and boiled wool · from ₹4,890
            </p>
          </div>
          <div className="relative m-6 overflow-hidden rounded-[22px]">
            <Img i={3} />
          </div>
        </div>
      </div>
      <div className="u166-side left-0 right-0 top-0" style={{ height: BAND, transform: "scaleX(0)" }} />
      <div className="u166-side bottom-0 right-0 top-0" style={{ width: BAND, transform: "scaleY(0)" }} />
      <div className="u166-side bottom-0 left-0 right-0" style={{ height: BAND, transform: "scaleX(0)" }} />
      <div className="u166-side bottom-0 left-0 top-0" style={{ width: BAND, transform: "scaleY(0)" }} />
      <nav className="absolute left-0 right-[76px] top-0 z-[25] flex items-center gap-[clamp(18px,2.6vw,42px)] pl-[88px] text-[#0c0f08]" style={{ height: BAND }}>
        {U166_TOP.map((n) => (
          <span key={n} className="u166-it b18g1-hide text-[17px] font-[600]" style={{ fontFamily: F.sg }}>
            {n}
          </span>
        ))}
      </nav>
      <div className="absolute bottom-0 left-[88px] right-[88px] z-[25] flex items-center justify-between text-[#0c0f08]" style={{ height: BAND }}>
        <span className="u166-it b18g1-hide text-[14px] font-[600] uppercase tracking-[0.16em]" style={{ fontFamily: F.mr }}>
          Free returns · 30 days
        </span>
        <span className="u166-it b18g1-hide text-[14px] font-[600] uppercase tracking-[0.16em]" style={{ fontFamily: F.mr }}>
          Shipping free over ₹4,999
        </span>
      </div>
      <div className="absolute bottom-[88px] left-0 top-[88px] z-[25] flex items-center justify-center" style={{ width: BAND }}>
        <span className="u166-it b18g1-hide text-[13px] font-[700] uppercase tracking-[0.3em] text-[#0c0f08]" style={{ fontFamily: F.sg, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          Halden Row
        </span>
      </div>
      <button type="button" aria-label="Menu" className="u166-burger" onClick={() => toggle()}>
        <i />
        <i />
        <i />
      </button>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U167 · 3D progress button ───────────────────────── */
function U167() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const busy = useRef(false);
  const run = () => {
    const el = root.current;
    if (!el || busy.current) return;
    const cube = one(el, ".u167-cube");
    const fill = one(el, ".u167-fill");
    const pct = one(el, ".u167-pct");
    const front = one(el, ".u167-front");
    if (prefersReducedMotion()) {
      front.classList.toggle("done");
      return;
    }
    busy.current = true;
    const o = { p: 0 };
    gsap
      .timeline({ onComplete: () => void (busy.current = false) })
      .set(fill, { scaleX: 0 })
      .call(() => (pct.textContent = "0%"))
      .to(cube, { rotationX: 90, duration: 0.45, ease: "power3.inOut" })
      .to(o, {
        p: 100,
        duration: 1.3,
        ease: "power1.inOut",
        onUpdate: () => {
          fill.style.transform = `scaleX(${(o.p / 100).toFixed(3)})`;
          pct.textContent = `${Math.round(o.p)}%`;
        },
      })
      .call(() => front.classList.add("done"))
      .to(cube, { rotationX: 0, duration: 0.55, ease: "back.out(1.7)" })
      .to(cube, { scale: 1.04, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" })
      .call(() => front.classList.remove("done"), [], "+=0.25")
      .to({}, { duration: 0.3 });
  };
  usePlay(root, (el) => {
    const d = dot.current;
    const btn = one(el, ".u167-scene");
    const tl = gsap.timeline({ repeat: -1 });
    tl.call(() => goDot(d, el, btn, 0.45, idle()));
    wait(tl, 0.5);
    tl.call(() => {
      if (!idle()) return;
      tapDot(d);
      run();
    });
    wait(tl, 0.15);
    tl.call(() => {
      const [x, y] = mid(rel(btn, el));
      goDot(d, el, [x + 230, y + 70], 1.3, idle());
    });
    wait(tl, 1.3);
    tl.call(() => {
      const [x, y] = mid(rel(btn, el));
      goDot(d, el, [x + 140, y - 110], 1.4, idle());
    });
    wait(tl, 1.4);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,179,92,.5)" g2="rgba(95,224,160,.22)">
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-[min(520px,82%)] rounded-[26px] border border-white/10 bg-white/[0.035] p-8">
          <Eyebrow>Checkout · 2 items</Eyebrow>
          <div className="mt-6 space-y-4">
            {[
              { n: "Clay pour-over set", p: "₹1,690", i: 2 },
              { n: "Single-origin beans, 250 g", p: "₹800", i: 3 },
            ].map((r) => (
              <div key={r.n} className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-[12px]">
                  <Img i={r.i} w={200} h={200} />
                </div>
                <p className="flex-1 text-[17px]" style={{ fontFamily: F.sg }}>
                  {r.n}
                </p>
                <p className="text-[17px] text-white/80" style={{ fontFamily: F.mr }}>
                  {r.p}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-baseline justify-between border-t border-white/10 pt-5">
            <span className="text-[15px] text-white/55" style={{ fontFamily: F.mr }}>
              Total
            </span>
            <span className="text-[30px]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
              ₹2,490
            </span>
          </div>
          <div className="u167-scene mt-7 flex justify-center">
            <button type="button" className="u167-cube cursor-pointer" onClick={run} aria-label="Place order">
              <span className="u167-face u167-front text-[18px] font-[700]" style={{ fontFamily: F.sg }}>
                <span className="u167-lab">Place order · ₹2,490</span>
                <svg className="u167-ok" width="34" height="34" viewBox="0 0 24 24" aria-hidden>
                  <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="u167-face u167-bottom">
                <span className="u167-fill" />
                <span className="u167-pct relative text-[18px] font-[700] text-white" style={{ fontFamily: F.sg }}>
                  0%
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

/* ───────────────────────── U168 · Elastic SVG UI ───────────────────────── */
const sidePath = (c: number) => `M0 0 H300 Q${(300 + c).toFixed(1)} 300 300 600 H0 Z`;
const linePath = (d: number) => `M0 15 Q180 ${(15 + d).toFixed(1)} 360 15`;
const btnPath = (k: number) =>
  `M14 14 Q125 ${(14 - k).toFixed(1)} 236 14 Q${(236 + k * 0.5).toFixed(1)} 46 236 78 Q125 ${(78 + k).toFixed(1)} 14 78 Q${(14 - k * 0.5).toFixed(1)} 46 14 14 Z`;
function U168() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const st = useRef({ open: false, c: 0, d: 0, k: 0 });
  const draw = () => {
    const el = root.current;
    if (!el) return;
    const S = st.current;
    one(el, ".u168-side path").setAttribute("d", sidePath(S.c));
    one(el, ".u168-line path").setAttribute("d", linePath(S.d));
    one(el, ".u168-btn path").setAttribute("d", btnPath(S.k));
  };
  const side = (want?: boolean) => {
    const el = root.current;
    if (!el) return;
    const S = st.current;
    const on = want ?? !S.open;
    if (on === S.open) return;
    S.open = on;
    one(el, ".u168-burger").style.color = on ? "#120d1f" : "";
    const panel = one(el, ".u168-side");
    const items = all(el, ".u168-si");
    if (prefersReducedMotion()) {
      gsap.set(panel, { x: on ? 0 : -360 });
      return;
    }
    gsap.to(panel, { x: on ? 0 : -360, duration: on ? 0.55 : 0.45, ease: on ? "power3.out" : "power3.in", overwrite: true });
    gsap
      .timeline({ onUpdate: draw })
      .to(S, { c: on ? -80 : 70, duration: 0.28, ease: "power2.out", overwrite: true })
      .to(S, { c: 0, duration: 1.2, ease: "elastic.out(1.3,0.22)" });
    if (on) gsap.fromTo(items, { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06, delay: 0.2, ease: "power3.out", overwrite: true });
  };
  const focus = () => {
    const S = st.current;
    gsap
      .timeline({ onUpdate: draw })
      .to(S, { d: 16, duration: 0.14, ease: "power2.out", overwrite: true })
      .to(S, { d: 0, duration: 1.1, ease: "elastic.out(1.4,0.2)" });
    const el = root.current;
    if (el) one(el, ".u168-line path").setAttribute("stroke", "#c7a6ff");
  };
  const press = () => {
    const S = st.current;
    gsap
      .timeline({ onUpdate: draw })
      .to(S, { k: -12, duration: 0.12, ease: "power2.out", overwrite: true })
      .to(S, { k: 0, duration: 1.1, ease: "elastic.out(1.5,0.22)" });
    const el = root.current;
    if (!el) return;
    one(el, ".u168-bl").textContent = "You're in ✓";
  };
  usePlay(root, (el) => {
    const d = dot.current;
    const burger = one(el, ".u168-burger");
    const items = all(el, ".u168-si");
    const input = one(el, ".u168-in");
    const btn = one(el, ".u168-btn");
    const txt = one(el, ".u168-txt");
    const EMAIL = "mira@fieldnotes.in";
    const tl = gsap.timeline({ repeat: -1 });
    tl.call(() => goDot(d, el, burger, 0.45, idle()));
    wait(tl, 0.5);
    tl.call(() => {
      if (!idle()) return;
      tapDot(d);
      side(true);
    });
    wait(tl, 0.45);
    tl.call(() => goDot(d, el, items[1], 0.4, idle()));
    wait(tl, 0.45);
    tl.call(() => goDot(d, el, burger, 0.4, idle()));
    wait(tl, 0.45);
    tl.call(() => {
      if (!idle()) return;
      tapDot(d);
      side(false);
    });
    wait(tl, 0.15);
    tl.call(() => goDot(d, el, input, 0.45, idle()));
    wait(tl, 0.5);
    tl.call(() => {
      if (!idle()) return;
      tapDot(d);
      focus();
      const [x, y] = mid(rel(input, el));
      goDot(d, el, [x + 130, y], 0.85, idle());
    });
    for (let i = 1; i <= EMAIL.length; i++) {
      tl.call(() => {
        if (idle()) txt.textContent = EMAIL.slice(0, i);
      });
      wait(tl, 0.045);
    }
    tl.call(() => goDot(d, el, btn, 0.4, idle()));
    wait(tl, 0.45);
    tl.call(() => {
      if (!idle()) return;
      tapDot(d);
      press();
    });
    wait(tl, 0.35);
    tl.call(() => goDot(d, el, [el.clientWidth * 0.5, el.clientHeight * 0.84], 0.5, idle()));
    wait(tl, 0.5);
    tl.call(() => {
      if (!idle()) return;
      txt.textContent = "";
      one(el, ".u168-bl").textContent = "Join the list";
      one(el, ".u168-line path").setAttribute("stroke", "rgba(255,255,255,.35)");
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(199,166,255,.52)" g2="rgba(255,140,200,.22)">
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-[min(420px,80%)]">
          <Eyebrow>Field Notes · weekly letter</Eyebrow>
          <h3 className="mt-3 text-[clamp(38px,3.8vw,58px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.is }}>
            Slow news for quick minds
          </h3>
          <div className="u168-in relative mt-9 cursor-text" onClick={focus}>
            <p className="h-[30px] text-[20px]" style={{ fontFamily: F.mr }}>
              <span className="u168-txt" />
              <span className="ml-[2px] inline-block h-[22px] w-[2px] translate-y-[3px] bg-[#c7a6ff] align-baseline" />
            </p>
            <p className="pointer-events-none absolute right-0 top-[4px] text-[13px] uppercase tracking-[0.16em] text-white/45" style={{ fontFamily: F.sg }}>
              Email
            </p>
            <svg className="u168-line block" width="100%" height="30" viewBox="0 0 360 30" preserveAspectRatio="none" style={{ overflow: "visible" }} aria-hidden>
              <path d={linePath(0)} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={2} />
            </svg>
          </div>
          <button type="button" className="u168-btn relative mt-7 block h-[92px] w-[250px] cursor-pointer" onClick={press}>
            <svg className="absolute inset-0" width="250" height="92" viewBox="0 0 250 92" style={{ overflow: "visible" }} aria-hidden>
              <path d={btnPath(0)} fill="#c7a6ff" />
            </svg>
            <span className="u168-bl relative text-[18px] font-[700] text-[#120d1f]" style={{ fontFamily: F.sg }}>
              Join the list
            </span>
          </button>
        </div>
      </div>
      <div className="u168-side absolute bottom-0 left-0 top-0 z-20 w-[300px]" style={{ transform: "translateX(-360px)" }}>
        <svg className="absolute left-0 top-0 h-full" width="380" viewBox="0 0 380 600" preserveAspectRatio="none" style={{ overflow: "visible" }} aria-hidden>
          <path d={sidePath(0)} fill="#efe6ff" />
        </svg>
        <div className="relative flex h-full flex-col justify-center gap-5 pl-10 text-[#120d1f]">
          {["Latest issue", "Archive", "Essays", "About"].map((n) => (
            <span key={n} className="u168-si text-[30px]" style={{ fontFamily: F.is }}>
              {n}
            </span>
          ))}
        </div>
      </div>
      <button type="button" aria-label="Menu" className="u168-burger absolute left-6 top-6 z-30 flex h-11 w-11 flex-col items-center justify-center gap-[5px] text-white" onClick={() => side()}>
        <i className="block h-[2px] w-5 rounded bg-current" />
        <i className="block h-[2px] w-5 rounded bg-current" />
        <i className="block h-[2px] w-5 rounded bg-current" />
      </button>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U169 · Menu hover pack (letters) ───────────────────────── */
const U169_ITEMS = ["Shop", "Journal", "Ateliers", "Contact"];
const U169_ORDER = [0, 1, 2, 3, 2, 1];
function U169() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const hov = useRef(-1);
  const jump = (el: HTMLElement, k: number) => {
    const w = all(el, ".u169-w")[k];
    all(w, ".u169-c").forEach((c) => {
      gsap
        .timeline({ delay: rnd(0, 0.08) })
        .to(c, { y: -rnd(14, 48), scale: rnd(1.12, 1.7), rotation: rnd(-18, 18), duration: 0.22, ease: "power2.out", overwrite: true })
        .to(c, { y: 0, scale: 1, rotation: 0, duration: 0.65, ease: "elastic.out(1,0.45)" });
    });
  };
  usePointer(
    root,
    dot,
    (t, el) => {
      const ws = all(el, ".u169-w");
      const pts = U169_ORDER.map((k) => mid(rel(ws[k], el)));
      const [x, y] = stepPath(t, pts, 0.82, 0.45);
      return { x, y, inside: true };
    },
    (p, el) => {
      const ws = all(el, ".u169-w");
      let k = -1;
      if (p.inside) ws.forEach((w, j) => inBox(rel(w, el), p.x, p.y, 6) && (k = j));
      if (k !== hov.current) {
        hov.current = k;
        ws.forEach((w, j) => w.classList.toggle("on", j === k));
        if (k >= 0) jump(el, k);
      }
    },
  );
  useEffect(() => {
    const el = root.current;
    return () => {
      if (el) gsap.killTweensOf(el.querySelectorAll(".u169-c"));
    };
  }, []);
  return (
    <Stage r={root} g1="rgba(255,159,110,.5)" g2="rgba(140,120,255,.24)">
      <div className="flex h-full w-full items-center justify-between px-[9%]">
        <div>
          <Eyebrow>Menu</Eyebrow>
          <ul className="mt-4 space-y-1">
            {U169_ITEMS.map((n) => (
              <li key={n} className="leading-[1.05]">
                <span className="u169-w inline-block text-[clamp(48px,5.6vw,88px)] font-[700] tracking-[-0.02em]" style={{ fontFamily: F.sy }}>
                  {n.split("").map((c, i) => (
                    <span key={i} className="u169-c">
                      {c}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="max-w-[300px] text-right">
          <p className="text-[15px] leading-[1.6] text-white/55" style={{ fontFamily: F.mr }}>
            Hand-thrown ceramics and linen goods from small studios across the coast.
          </p>
          <p className="mt-4 text-[13px] uppercase tracking-[0.2em] text-white/45" style={{ fontFamily: F.sg }}>
            Open daily · 10–7
          </p>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U170 · Grid box menu ───────────────────────── */
const U170_BOX = [
  { n: "New season", s: "42 pieces", img: 1, cls: "row-span-2" },
  { n: "Women", s: "Dresses · knits", img: 0, cls: "" },
  { n: "Men", s: "Shirts · denim", img: 2, cls: "" },
  { n: "Home", s: "Linen · ceramics", img: 3, cls: "" },
  { n: "Sale −30%", s: "Ends Sunday", img: -1, cls: "" },
];
function U170() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const idle = useIdle(root);
  const st = useRef<{ open: boolean; tl: gsap.core.Timeline | null }>({ open: true, tl: null });
  const toggle = (want?: boolean) => {
    const el = root.current;
    if (!el) return;
    const S = st.current;
    const on = want ?? !S.open;
    if (on === S.open) return;
    S.open = on;
    one(el, ".u170-lab").textContent = on ? "Close" : "Menu";
    const boxes = all(el, ".u170-box");
    const covers = all(el, ".u170-cover");
    const labs = all(el, ".u170-t");
    S.tl?.kill();
    if (prefersReducedMotion()) {
      gsap.set(boxes, { scale: on ? 1 : 0 });
      return;
    }
    const tl = gsap.timeline();
    if (on) {
      boxes.forEach((b, i) => {
        const x = i % 2 === 0;
        tl.set(b, { autoAlpha: 1 }, 0);
        tl.fromTo(
          b,
          x ? { scaleX: 0, scaleY: 1, transformOrigin: "0% 50%" } : { scaleY: 0, scaleX: 1, transformOrigin: "50% 0%" },
          { scaleX: 1, scaleY: 1, duration: 0.55, ease: "power3.out" },
          i * 0.08,
        );
        tl.fromTo(
          covers[i],
          { scaleX: 1, scaleY: 1 },
          x ? { scaleX: 0, transformOrigin: "100% 50%", duration: 0.5, ease: "power3.inOut" } : { scaleY: 0, transformOrigin: "50% 100%", duration: 0.5, ease: "power3.inOut" },
          0.32 + i * 0.08,
        );
      });
      tl.fromTo(labs, { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: "power3.out" }, 0.6);
    } else {
      boxes.forEach((b) => b.classList.remove("hov"));
      tl.to(labs, { autoAlpha: 0, duration: 0.18 }, 0);
      boxes.forEach((b, i) => {
        const x = i % 2 === 0;
        tl.to(covers[i], x ? { scaleX: 1, transformOrigin: "0% 50%", duration: 0.28, ease: "power2.in" } : { scaleY: 1, transformOrigin: "50% 0%", duration: 0.28, ease: "power2.in" }, 0.05 + i * 0.05);
        tl.to(b, x ? { scaleX: 0, transformOrigin: "100% 50%", duration: 0.32, ease: "power3.in" } : { scaleY: 0, transformOrigin: "50% 100%", duration: 0.32, ease: "power3.in" }, 0.33 + i * 0.05);
      });
    }
    S.tl = tl;
  };
  usePlay(root, (el) => {
    // static markup shows the open menu; the loop starts from closed
    st.current.open = false;
    one(el, ".u170-lab").textContent = "Menu";
    gsap.set(all(el, ".u170-box"), { scaleX: 0 });
    gsap.set(all(el, ".u170-cover"), { scaleX: 1, scaleY: 1 });
    gsap.set(all(el, ".u170-t"), { autoAlpha: 0 });
    const d = dot.current;
    const btn = one(el, ".u170-btn");
    const boxes = all(el, ".u170-box");
    const tl = gsap.timeline({ repeat: -1 });
    tl.call(() => goDot(d, el, btn, 0.45, idle()));
    wait(tl, 0.5);
    tl.call(() => {
      if (!idle()) return;
      tapDot(d);
      toggle(true);
    });
    wait(tl, 0.45);
    [1, 4].forEach((k) => {
      tl.call(() => goDot(d, el, boxes[k], 0.42, idle()));
      wait(tl, 0.44);
      tl.call(() => idle() && boxes.forEach((b, j) => b.classList.toggle("hov", j === k)));
      wait(tl, 0.3);
    });
    tl.call(() => goDot(d, el, btn, 0.45, idle()));
    wait(tl, 0.5);
    tl.call(() => {
      if (!idle()) return;
      tapDot(d);
      toggle(false);
    });
    wait(tl, 0.45);
    tl.call(() => goDot(d, el, [el.clientWidth * 0.5, el.clientHeight * 0.6], 0.5, idle()));
    wait(tl, 0.55);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(201,184,255,.52)" g2="rgba(255,200,120,.22)">
      <div className="absolute left-0 right-0 top-0 z-20 flex h-[72px] items-center justify-between px-8">
        <span className="text-[20px] font-[700] tracking-[-0.01em]" style={{ fontFamily: F.sy }}>
          Ostra Goods
        </span>
        <button type="button" className="u170-btn flex h-11 items-center gap-3 rounded-full border border-white/20 px-5 text-[15px] font-[600]" style={{ fontFamily: F.sg }} onClick={() => toggle()}>
          <span className="u170-lab">Close</span>
          <span className="grid grid-cols-2 gap-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <i key={i} className="block h-[5px] w-[5px] rounded-[1px] bg-current" />
            ))}
          </span>
        </button>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <Eyebrow>Everyday objects</Eyebrow>
        <h3 className="mt-4 text-[clamp(44px,5vw,80px)] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Quiet goods
          <br />
          for loud days
        </h3>
      </div>
      <div className="absolute inset-x-6 bottom-6 top-[72px] z-10 grid grid-cols-[1.4fr_1fr_1fr] grid-rows-2 gap-[10px]">
        {U170_BOX.map((b) => (
          <div key={b.n} className={`u170-box ${b.cls}`} style={b.img < 0 ? { background: "#ff8a5c" } : undefined}>
            {b.img >= 0 && (
              <div className="absolute inset-0">
                <Img i={b.img} w={800} h={700} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
              </div>
            )}
            <div className="u170-t absolute bottom-5 left-6">
              <p className={`text-[clamp(24px,2.2vw,36px)] font-[700] leading-none tracking-[-0.02em] ${b.img < 0 ? "text-[#1b0a04]" : ""}`} style={{ fontFamily: F.sy }}>
                {b.n}
              </p>
              <p className={`mt-2 text-[14px] ${b.img < 0 ? "text-[#1b0a04]/70" : "text-white/70"}`} style={{ fontFamily: F.mr }}>
                {b.s}
              </p>
            </div>
            <div className="u170-cover" style={{ transform: "scaleX(0)" }} />
          </div>
        ))}
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U171 · Draggable inline menu with scattered thumbs ───────────────────────── */
const U171_ITEMS = ["Linen", "Ceramics", "Lamps", "Rugs", "Glassware"];
const U171_TH = [
  { l: "7%", t: "9%", w: 170, h: 210, r: -6, k: 7 },
  { l: "73%", t: "7%", w: 210, h: 150, r: 4, k: 4.2 },
  { l: "15%", t: "62%", w: 160, h: 190, r: 5, k: 2.8 },
  { l: "69%", t: "60%", w: 190, h: 200, r: -4, k: 1.8 },
];
function U171() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const S = useRef({ init: false, x: 0, rx: 0, x0: 0, px: 0, idx: 0, cur: -1, drag: false, realAt: -1e9, tx: U171_TH.map(() => 0), ft: 0, cyc: -1, dir: 1, step: 0, rel: false, next: 0 });
  const offs = () => all(row.current!, ".u171-it").map((n) => n.offsetLeft + n.offsetWidth / 2);
  const nearest = (x: number, W: number, o: number[]) => {
    let b = 0;
    o.forEach((c, i) => Math.abs(W / 2 - c - x) < Math.abs(W / 2 - o[b] - x) && (b = i));
    return b;
  };
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const s = S.current;
    const down = (e: PointerEvent) => {
      s.realAt = performance.now();
      s.drag = true;
      s.x0 = s.x;
      s.px = e.clientX;
      dot.current?.classList.remove("down");
    };
    const move = (e: PointerEvent) => {
      s.realAt = performance.now();
      if (s.drag) s.x = s.x0 + (e.clientX - s.px);
    };
    const up = () => {
      if (!s.drag) return;
      s.drag = false;
      const o = offs();
      s.idx = nearest(s.x, el.clientWidth, o);
      s.x = el.clientWidth / 2 - o[s.idx];
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointerleave", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);
  useTicker(root, (_t, rawDt) => {
    const el = root.current;
    const rw = row.current;
    if (!el || !rw) return;
    const dt = Math.min(rawDt, 0.05);
    const s = S.current;
    const W = el.clientWidth;
    const H = el.clientHeight;
    const o = offs();
    if (!s.init) {
      s.init = true;
      s.x = s.rx = W / 2 - o[0];
    }
    const idle = performance.now() - s.realAt > 2500;
    const dn = dot.current;
    let fakeDrag = false;
    if (idle) {
      s.ft += dt;
      const CY = 1.7;
      const cyc = Math.floor(s.ft / CY);
      const c = s.ft - cyc * CY;
      if (cyc !== s.cyc) {
        s.cyc = cyc;
        if (s.idx + s.dir < 0 || s.idx + s.dir >= o.length) s.dir *= -1;
        s.next = s.idx + s.dir;
        s.step = o[s.idx] - o[s.next];
        s.x0 = W / 2 - o[s.idx];
        s.rel = false;
      }
      const P0x = W * 0.5 - s.step * 0.35;
      const P0y = H * 0.5;
      let dx = 0;
      let dotx = P0x;
      if (c < 0.25) {
        fakeDrag = true;
      } else if (c < 1.05) {
        fakeDrag = true;
        dx = s.step * easeIO((c - 0.25) / 0.8);
        s.x = s.x0 + dx;
        dotx = P0x + dx;
      } else {
        if (!s.rel) {
          s.rel = true;
          s.idx = s.next;
          s.x = W / 2 - o[s.idx];
        }
        dotx = P0x + s.step * (1 - easeIO(clamp((c - 1.05) / 0.6, 0, 1)));
      }
      if (dn) {
        dn.style.transform = `translate3d(${dotx.toFixed(1)}px,${P0y.toFixed(1)}px,0)`;
        dn.style.opacity = "1";
        dn.classList.toggle("down", fakeDrag);
      }
    } else if (dn) {
      dn.style.opacity = "0";
    }
    const dragging = s.drag || fakeDrag;
    s.rx += (s.x - s.rx) * lerpK(dt, dragging ? 22 : 8);
    rw.style.transform = `translate3d(${s.rx.toFixed(1)}px,0,0)`;
    const cur = nearest(s.rx, W, o);
    if (cur !== s.cur) {
      s.cur = cur;
      all(rw, ".u171-it").forEach((n, i) => n.classList.toggle("on", i === cur));
      all(el, ".u171-th").forEach((th) => all(th, ".u171-ph").forEach((p, i) => p.classList.toggle("on", i === cur)));
    }
    const disp = s.rx - (W / 2 - o[cur]);
    all(el, ".u171-in").forEach((n, i) => {
      s.tx[i] += (disp * 0.6 - s.tx[i]) * lerpK(dt, U171_TH[i].k);
      n.style.transform = `translate3d(${s.tx[i].toFixed(1)}px,0,0)`;
    });
  });
  return (
    <Stage r={root} g1="rgba(255,200,140,.5)" g2="rgba(120,180,255,.22)" style={{ cursor: "grab", touchAction: "pan-y" }}>
      {U171_TH.map((t, k) => (
        <div key={k} className="u171-th pointer-events-none absolute" style={{ left: t.l, top: t.t, width: t.w, height: t.h, transform: `rotate(${t.r}deg)` }}>
          <div className="u171-in relative h-full w-full overflow-hidden rounded-[16px] shadow-[0_18px_40px_rgba(0,0,0,.45)]">
            {U171_ITEMS.map((_, i) => (
              <div key={i} className={`u171-ph ${i === 0 ? "on" : ""}`}>
                <Img i={(i + k) % 4} w={420} h={420} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <Eyebrow className="absolute left-8 top-7">Drag to browse · 5 rooms</Eyebrow>
      <div className="pointer-events-none absolute left-0 top-1/2 w-full -translate-y-1/2">
        <div ref={row} className="inline-flex whitespace-nowrap" style={{ transform: "translate3d(28vw,0,0)" }}>
          {U171_ITEMS.map((n, i) => (
            <span key={n} className={`u171-it mr-[0.5em] text-[clamp(64px,8vw,128px)] italic leading-none tracking-[-0.03em] ${i === 0 ? "on" : ""}`} style={{ fontFamily: F.fr, fontWeight: 400 }}>
              {n}
            </span>
          ))}
        </div>
      </div>
      <p className="absolute bottom-7 right-8 text-[14px] text-white/55" style={{ fontFamily: F.mr }}>
        From ₹690 · made in small batches
      </p>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U172 · Cursor ring distortion ───────────────────────── */
const U172_L = [
  { n: "Rings", x: 0.18 },
  { n: "Bespoke", x: 0.5 },
  { n: "Pendants", x: 0.82 },
];
function U172() {
  const root = useRef<HTMLDivElement>(null);
  const cur = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const uid = useId().replace(/:/g, "");
  const S = useRef({ init: false, dx: 0, dy: 0, rx: 0, ry: 0, sc: 1, pulse: 0, hov: -1 });
  usePointer(
    root,
    null,
    (t, el) => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const s = t * 1.05;
      return { x: W / 2 + W * 0.32 * Math.sin(s), y: H * 0.52 + H * 0.2 * Math.sin(2 * s), inside: true };
    },
    (p, el, _fake, t, dt) => {
      const s = S.current;
      if (!s.init) {
        s.init = true;
        s.dx = s.rx = p.x;
        s.dy = s.ry = p.y;
      }
      s.dx += (p.x - s.dx) * lerpK(dt, 26);
      s.dy += (p.y - s.dy) * lerpK(dt, 26);
      s.rx += (p.x - s.rx) * lerpK(dt, 7);
      s.ry += (p.y - s.ry) * lerpK(dt, 7);
      const ls = all(el, ".u172-l");
      let k = -1;
      if (p.inside) ls.forEach((l, j) => inBox(rel(l, el), s.dx, s.dy, 14) && (k = j));
      if (k !== s.hov) {
        if (k >= 0) s.pulse = 1;
        s.hov = k;
        ls.forEach((l, j) => l.classList.toggle("on", j === k));
      }
      s.pulse = Math.max(0, s.pulse - dt * 2.2);
      s.sc += ((k >= 0 ? 1.7 : 1) - s.sc) * lerpK(dt, 9);
      const d = (k >= 0 ? 8 + 5 * Math.sin(t * 9) : 0) + 26 * s.pulse;
      disp.current?.setAttribute("scale", d.toFixed(1));
      if (cur.current) cur.current.style.transform = `translate3d(${s.dx.toFixed(1)}px,${s.dy.toFixed(1)}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${s.rx.toFixed(1)}px,${s.ry.toFixed(1)}px,0) scale(${s.sc.toFixed(3)})`;
    },
  );
  return (
    <Stage r={root} g1="rgba(255,210,154,.5)" g2="rgba(160,140,255,.22)" style={{ cursor: "none" }}>
      <div className="absolute inset-x-0 top-[12%] text-center">
        <Eyebrow>Solene · fine jewellery</Eyebrow>
        <p className="mt-3 text-[16px] text-white/55" style={{ fontFamily: F.mr }}>
          Recycled gold · lab-grown stones · from ₹18,400
        </p>
      </div>
      {U172_L.map((l) => (
        <div key={l.n} className="absolute top-[52%]" style={{ left: `${l.x * 100}%` }}>
          <span className="u172-l block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(52px,5.4vw,86px)] leading-none" style={{ fontFamily: F.is }}>
            {l.n}
          </span>
        </div>
      ))}
      <div ref={ring} className="pointer-events-none absolute left-0 top-0 z-50" style={{ width: 0, height: 0 }} aria-hidden>
        <svg width="120" height="120" viewBox="0 0 120 120" className="absolute left-[-60px] top-[-60px] overflow-visible">
          <defs>
            <filter id={`${uid}-f`} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={1} seed={4} result="n" />
              <feDisplacementMap ref={disp} in="SourceGraphic" in2="n" scale={0} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <circle cx="60" cy="60" r="24" fill="none" stroke="#fff" strokeWidth={1.5} filter={`url(#${uid}-f)`} />
        </svg>
      </div>
      <div ref={cur} className="pointer-events-none absolute left-0 top-0 z-50" aria-hidden>
        <span className="absolute left-[-5px] top-[-5px] block h-[10px] w-[10px] rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.6)]" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── U173 · Crosshair cursor with noise ───────────────────────── */
const U173_L = ["Index", "Studio", "Contact"];
function U173() {
  const root = useRef<HTMLDivElement>(null);
  const hz = useRef<HTMLDivElement>(null);
  const vt = useRef<HTMLDivElement>(null);
  const dotR = useRef<HTMLDivElement>(null);
  const coord = useRef<HTMLSpanElement>(null);
  const dH = useRef<SVGFEDisplacementMapElement>(null);
  const dV = useRef<SVGFEDisplacementMapElement>(null);
  const uid = useId().replace(/:/g, "");
  const S = useRef({ init: false, x: 0, y: 0, pulse: 0, hov: -1, jit: 0, fr: 0 });
  usePointer(
    root,
    null,
    (t, el) => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const s = t * 1.0;
      return { x: W / 2 + W * 0.3 * Math.sin(2 * s), y: H / 2 + H * 0.25 * Math.sin(s), inside: true };
    },
    (p, el, fake, _t, dt) => {
      const s = S.current;
      if (!s.init) {
        s.init = true;
        s.x = p.x;
        s.y = p.y;
      }
      s.x += (p.x - s.x) * lerpK(dt, 9);
      s.y += (p.y - s.y) * lerpK(dt, 9);
      if (hz.current) hz.current.style.transform = `translate3d(0,${(s.y - 20).toFixed(1)}px,0)`;
      if (vt.current) vt.current.style.transform = `translate3d(${(s.x - 20).toFixed(1)}px,0,0)`;
      if (dotR.current) {
        dotR.current.style.transform = `translate3d(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px,0)`;
        dotR.current.style.opacity = fake ? "1" : "0.7";
      }
      if (coord.current) coord.current.textContent = `X ${String(Math.round(s.x)).padStart(4, "0")} · Y ${String(Math.round(s.y)).padStart(4, "0")}`;
      const ls = all(el, ".u173-l");
      let k = -1;
      if (p.inside) ls.forEach((l, j) => inBox(rel(l, el), s.x, s.y, 4) && (k = j));
      if (k !== s.hov) {
        if (k >= 0) {
          s.pulse = 1;
          s.jit = 0.45;
        }
        s.hov = k;
        ls.forEach((l, j) => l.classList.toggle("on", j === k));
      }
      s.pulse = Math.max(0, s.pulse - dt * 1.8);
      const d = (26 * s.pulse + (k >= 0 ? 4 : 0)).toFixed(1);
      dH.current?.setAttribute("scale", d);
      dV.current?.setAttribute("scale", d);
      s.fr++;
      if (s.jit > 0) {
        s.jit -= dt;
        const cs = s.hov >= 0 ? all(ls[s.hov], ".u173-c") : [];
        if (s.jit <= 0) all(el, ".u173-c").forEach((c) => (c.style.transform = ""));
        else if (s.fr % 3 === 0) cs.forEach((c) => (c.style.transform = `translate(${rnd(-6, 6).toFixed(1)}px,${rnd(-5, 5).toFixed(1)}px)`));
      }
    },
  );
  return (
    <Stage r={root} g1="rgba(143,245,212,.5)" g2="rgba(120,140,255,.22)" style={{ cursor: "none" }}>
      <Eyebrow className="absolute left-8 top-7">Northbound Studio · motion & type</Eyebrow>
      <p className="absolute bottom-7 left-8 text-[14px] text-white/50" style={{ fontFamily: F.mr }}>
        Taking projects for spring · retainers from ₹2.4L
      </p>
      <span ref={coord} className="absolute bottom-7 right-8 text-[13px] tracking-[0.12em] text-white/55" style={{ fontFamily: F.sg }}>
        X 0000 · Y 0000
      </span>
      {U173_L.map((n, i) => (
        <div key={n} className="absolute left-1/2" style={{ top: `${25 + i * 25}%` }}>
          <span className="u173-l block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(44px,4.6vw,74px)] font-[700] uppercase leading-none tracking-[-0.02em]" style={{ fontFamily: F.sg }}>
            {n.split("").map((c, j) => (
              <span key={j} className="u173-c">
                {c}
              </span>
            ))}
          </span>
        </div>
      ))}
      <div ref={hz} className="pointer-events-none absolute left-0 top-0 z-40 h-[40px] w-full" aria-hidden>
        <svg width="100%" height="40" viewBox="0 0 1000 40" preserveAspectRatio="none" className="block">
          <defs>
            <filter id={`${uid}-h`} filterUnits="userSpaceOnUse" x="0" y="0" width="1000" height="40">
              <feTurbulence type="fractalNoise" baseFrequency="0.04 0.2" numOctaves={1} seed={2} result="n" />
              <feDisplacementMap ref={dH} in="SourceGraphic" in2="n" scale={0} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <line x1="0" y1="20" x2="1000" y2="20" stroke="rgba(255,255,255,.6)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" filter={`url(#${uid}-h)`} />
        </svg>
      </div>
      <div ref={vt} className="pointer-events-none absolute left-0 top-0 z-40 h-full w-[40px]" aria-hidden>
        <svg width="40" height="100%" viewBox="0 0 40 1000" preserveAspectRatio="none" className="block h-full">
          <defs>
            <filter id={`${uid}-v`} filterUnits="userSpaceOnUse" x="0" y="0" width="40" height="1000">
              <feTurbulence type="fractalNoise" baseFrequency="0.2 0.04" numOctaves={1} seed={7} result="n" />
              <feDisplacementMap ref={dV} in="SourceGraphic" in2="n" scale={0} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <line x1="20" y1="0" x2="20" y2="1000" stroke="rgba(255,255,255,.6)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" filter={`url(#${uid}-v)`} />
        </svg>
      </div>
      <div ref={dotR} className="pointer-events-none absolute left-0 top-0 z-50" aria-hidden>
        <span className="absolute left-[-7px] top-[-7px] block h-[14px] w-[14px] rounded-full border-2 border-[#8ff5d4] bg-[#8ff5d4]/20" />
      </div>
    </Stage>
  );
}

/* ───────────────────────── U174 · Smooth spring cursor ───────────────────────── */
const U174_C = [
  { n: "Trail runner 3", p: "₹8,990", i: 3 },
  { n: "Day pack 22 L", p: "₹5,450", i: 2 },
  { n: "Merino base tee", p: "₹2,990", i: 0 },
];
function U174() {
  const root = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLDivElement>(null);
  const S = useRef({ init: false, x: 0, y: 0, vx: 0, vy: 0, a: -90, hov: -1 });
  usePointer(
    root,
    null,
    (t, el) => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const s = t * 0.95 + 0.4 * Math.sin(t * 1.3);
      return { x: W / 2 + W * 0.36 * Math.sin(s), y: H * 0.56 + H * 0.24 * Math.sin(2 * s + 0.6), inside: true };
    },
    (p, el, _f, _t, dt) => {
      const s = S.current;
      if (!s.init) {
        s.init = true;
        s.x = p.x;
        s.y = p.y;
      }
      // spring: stiffness 400, damping 45, mass 1 (4 sub-steps for stability)
      const n = 4;
      const h = dt / n;
      for (let i = 0; i < n; i++) {
        s.vx += (400 * (p.x - s.x) - 45 * s.vx) * h;
        s.vy += (400 * (p.y - s.y) - 45 * s.vy) * h;
        s.x += s.vx * h;
        s.y += s.vy * h;
      }
      const sp = Math.hypot(s.vx, s.vy);
      if (sp > 40) {
        const target = (Math.atan2(s.vy, s.vx) * 180) / Math.PI;
        let diff = target - s.a;
        diff = ((((diff + 180) % 360) + 360) % 360) - 180;
        s.a += diff * lerpK(dt, 10);
      }
      const sc = 1 + Math.min(sp / 2200, 0.22);
      if (arrow.current) arrow.current.style.transform = `translate3d(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px,0) rotate(${(s.a + 90).toFixed(1)}deg) scale(${sc.toFixed(3)})`;
      const cs = all(el, ".u174-card");
      let k = -1;
      if (p.inside) cs.forEach((c, j) => inBox(rel(c, el), s.x, s.y) && (k = j));
      if (k !== s.hov) {
        s.hov = k;
        cs.forEach((c, j) => c.classList.toggle("on", j === k));
      }
    },
  );
  return (
    <Stage r={root} g1="rgba(140,190,255,.52)" g2="rgba(255,170,120,.22)" style={{ cursor: "none" }}>
      <div className="absolute inset-x-0 top-[9%] text-center">
        <Eyebrow>Ridgeline · trail kit</Eyebrow>
        <h3 className="mt-3 text-[clamp(34px,3.4vw,54px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.sg, fontWeight: 600 }}>
          Built for the long way round
        </h3>
      </div>
      <div className="absolute inset-x-[10%] bottom-[10%] grid grid-cols-3 gap-6">
        {U174_C.map((c) => (
          <div key={c.n} className="u174-card rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
            <div className="h-[clamp(120px,22vh,200px)] overflow-hidden rounded-[14px]">
              <Img i={c.i} w={600} h={420} />
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-[17px] font-[600]" style={{ fontFamily: F.sg }}>
                {c.n}
              </p>
              <p className="text-[16px] text-white/70" style={{ fontFamily: F.mr }}>
                {c.p}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div ref={arrow} className="pointer-events-none absolute left-0 top-0 z-50" aria-hidden>
        <svg width="26" height="30" viewBox="0 0 26 30" className="absolute left-[-13px] top-[-15px] overflow-visible drop-shadow-[0_4px_10px_rgba(0,0,0,.5)]">
          <path d="M13 1 L24 28 L13 21 L2 28 Z" fill="#f4f7ff" stroke="#0a0d16" strokeWidth={1.5} strokeLinejoin="round" />
        </svg>
      </div>
    </Stage>
  );
}

/* ───────────────────────── U175 · Cool mode particle burst ───────────────────────── */
const U175_N = 44;
function U175() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const real = useReal(root);
  const P = useRef(Array.from({ length: U175_N }, () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, life: 0, max: 1, s: 1, live: false })));
  const S = useRef({ ft: 0, cyc: -1, spawnT: 0, realDown: false, count: 1248, wasDown: false, ax: 0, ay: 0 });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const btn = one(el, ".u175-btn");
    const dn = () => (S.current.realDown = true);
    const upf = () => (S.current.realDown = false);
    btn.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", upf);
    btn.addEventListener("pointerleave", upf);
    return () => {
      btn.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", upf);
      btn.removeEventListener("pointerleave", upf);
    };
  }, []);
  const spawn = (x: number, y: number) => {
    const p = P.current.find((q) => !q.live);
    if (!p) return;
    p.live = true;
    p.x = x + rnd(-10, 10);
    p.y = y + rnd(-6, 6);
    p.vx = rnd(-280, 280);
    p.vy = rnd(-760, -430);
    p.r = rnd(-40, 40);
    p.vr = rnd(-380, 380);
    p.max = p.life = rnd(1.0, 1.4);
    p.s = rnd(0.6, 1.1);
  };
  useTicker(root, (_t, rawDt) => {
    const el = root.current;
    if (!el) return;
    const dt = Math.min(rawDt, 0.05);
    const s = S.current;
    const btn = one(el, ".u175-btn");
    const [bx, by] = mid(rel(btn, el));
    const R = real.current;
    const useR = performance.now() - R.at < 2500;
    let px: number;
    let py: number;
    let down: boolean;
    if (useR) {
      px = R.x;
      py = R.y;
      down = s.realDown;
    } else {
      s.ft += dt;
      const CY = 2.6;
      const c = s.ft % CY;
      const ax = bx + 210;
      const ay = by + 90;
      if (c < 0.5) {
        const e = easeIO(c / 0.5);
        px = ax + (bx - ax) * e;
        py = ay + (by - ay) * e;
        down = false;
      } else if (c < 1.45) {
        // hold: the pointer circles a little while particles spray
        const a = (c - 0.5) * 9;
        px = bx + Math.cos(a) * 7;
        py = by + Math.sin(a) * 5;
        down = true;
      } else if (c < 2.25) {
        const e = easeIO((c - 1.45) / 0.8);
        px = bx + (ax - bx) * e;
        py = by + (ay - by) * e;
        down = false;
      } else {
        px = ax;
        py = ay;
        down = false;
      }
    }
    const dn = dot.current;
    if (dn) {
      dn.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
      dn.style.opacity = useR ? "0" : "1";
      dn.classList.toggle("down", down);
    }
    btn.classList.toggle("down", down);
    if (down && !s.wasDown) {
      s.count += 1;
      const cn = el.querySelector(".u175-count");
      if (cn) cn.textContent = s.count.toLocaleString("en-IN");
      s.spawnT = 0;
    }
    s.wasDown = down;
    if (down) {
      s.spawnT -= dt;
      while (s.spawnT <= 0) {
        spawn(px, py);
        s.spawnT += 0.045;
      }
    }
    const nodes = all(el, ".u175-p");
    P.current.forEach((p, i) => {
      const n = nodes[i];
      if (!n || !p.live) return;
      p.vy += 1500 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      p.life -= dt;
      if (p.life <= 0) {
        p.live = false;
        n.style.opacity = "0";
        return;
      }
      const grow = clamp((p.max - p.life) / 0.12, 0, 1);
      n.style.opacity = clamp(p.life / 0.45, 0, 1).toFixed(2);
      n.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0) rotate(${p.r.toFixed(0)}deg) scale(${(p.s * grow).toFixed(3)})`;
    });
  });
  return (
    <Stage r={root} g1="rgba(255,95,140,.5)" g2="rgba(255,210,110,.24)">
      <div className="flex h-full w-full items-center justify-center gap-[6%]">
        <div className="h-[min(56vh,420px)] w-[min(24vw,320px)] overflow-hidden rounded-[24px]">
          <Img i={1} w={640} h={840} />
        </div>
        <div className="max-w-[380px]">
          <Eyebrow>Limited run · 300 bottles</Eyebrow>
          <h3 className="mt-3 text-[clamp(36px,3.6vw,56px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Rosewater &amp; vetiver mist
          </h3>
          <p className="mt-4 text-[22px]" style={{ fontFamily: F.mr }}>
            ₹1,850 <span className="text-[15px] text-white/50">· 100 ml</span>
          </p>
          <button type="button" className="u175-btn mt-7 flex h-14 select-none items-center gap-3 rounded-full bg-[#ff6f95] px-7 text-[17px] font-[700] text-[#2a0712]" style={{ fontFamily: F.sg }}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" fill="currentColor" />
            </svg>
            Hold to save
          </button>
          <p className="mt-4 text-[14px] text-white/55" style={{ fontFamily: F.mr }}>
            Saved by <span className="u175-count">1,248</span> people
          </p>
        </div>
      </div>
      {Array.from({ length: U175_N }, (_, i) => (
        <div key={i} className="u175-p z-40" aria-hidden>
          {i % 3 === 0 ? (
            <div className="h-full w-full overflow-hidden rounded-full border-2 border-white/80">
              <Img i={i % 4} w={80} h={80} />
            </div>
          ) : i % 3 === 1 ? (
            <svg width="34" height="34" viewBox="0 0 24 24">
              <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" fill={i % 2 ? "#ff6f95" : "#ffb3c8"} />
            </svg>
          ) : (
            <svg width="34" height="34" viewBox="0 0 24 24">
              <path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" fill={i % 2 ? "#ffd36e" : "#fff4d6"} />
            </svg>
          )}
        </div>
      ))}
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U176 · Skeleton scan feature card ───────────────────────── */
const U176_IC = [
  "M4 7h16v10H4z M4 7l8 6 8-6",
  "M12 3a9 9 0 100 18 9 9 0 000-18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18",
  "M5 5h14v10H9l-4 4z",
  "M6 4h12v16H6z M9 8h6 M9 12h6 M9 16h3",
  "M4 18l5-6 4 4 7-9 M15 7h5v5",
];
const U176_X = [0.18, 0.34, 0.5, 0.66, 0.82];
function U176() {
  return (
    <Stage g1="rgba(120,200,255,.52)" g2="rgba(170,140,255,.22)">
      <div className="flex h-full w-full items-center justify-center gap-[6%] px-[6%]">
        <div className="max-w-[360px]">
          <Eyebrow>Integrations</Eyebrow>
          <h3 className="mt-4 text-[clamp(40px,4vw,64px)] leading-[0.98] tracking-[-0.03em]" style={{ fontFamily: F.sg, fontWeight: 600 }}>
            Every channel, one quiet inbox
          </h3>
          <p className="mt-5 text-[16px] leading-[1.6] text-white/55" style={{ fontFamily: F.mr }}>
            Mail, chat, forms and reviews land in one place · plans from ₹1,499 a month.
          </p>
        </div>
        <div className="w-[min(560px,48%)] overflow-hidden rounded-[26px] border border-white/10 bg-[#0e1320]">
          <div className="u176-grid relative h-[210px] overflow-hidden border-b border-white/10">
            {U176_IC.map((d, i) => {
              const delay = ((U176_X[i] - 0.04) / 0.92) * 2.8 - 0.17;
              return (
                <div key={i} className="u176-ic" style={{ left: `${U176_X[i] * 100}%`, animationDelay: `${delay.toFixed(2)}s` }}>
                  <span className="u176-ring" />
                  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                    <path d={d} fill="none" stroke="#cfe8ff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              );
            })}
            <div className="absolute bottom-6 left-[12%] right-[12%] flex gap-3">
              <span className="u176-sk block h-[8px] flex-[3] rounded-full" />
              <span className="u176-sk block h-[8px] flex-[2] rounded-full" />
              <span className="u176-sk block h-[8px] flex-[4] rounded-full" />
            </div>
            <div className="u176-scan" aria-hidden>
              <span className="u176-line">
                {[0.18, 0.32, 0.46, 0.6, 0.74, 0.86].map((t, k) => (
                  <i key={k} className="u176-sp" style={{ top: `${t * 100}%`, animationDelay: `${(k * 0.21).toFixed(2)}s`, "--dx": `${(k % 2 ? -1 : 1) * (6 + k * 2)}px` } as CSSProperties} />
                ))}
              </span>
            </div>
          </div>
          <div className="p-7">
            <p className="text-[22px] font-[600]" style={{ fontFamily: F.sg }}>
              Connected in two minutes
            </p>
            <p className="mt-2 text-[15px] leading-[1.6] text-white/55" style={{ fontFamily: F.mr }}>
              Link your channels once; replies sync both ways, tagged by customer.
            </p>
            <div className="mt-5 space-y-2">
              <span className="u176-sk block h-[10px] w-[82%] rounded-full" />
              <span className="u176-sk block h-[10px] w-[58%] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── U177 · Ribbons trail ───────────────────────── */
const U177_R = [
  { c: "#ff5f7e", k: 150, d: 9, f: 0.5, w: 16 },
  { c: "#ffb35c", k: 210, d: 12, f: 0.55, w: 13 },
  { c: "#5fd4ff", k: 120, d: 8, f: 0.45, w: 18 },
  { c: "#b48cff", k: 260, d: 15, f: 0.6, w: 11 },
];
const U177_N = 34;
function U177() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const R = useRef(U177_R.map(() => ({ hx: 0, hy: 0, vx: 0, vy: 0, pts: Array.from({ length: U177_N }, () => ({ x: 0, y: 0 })) })));
  const S = useRef({ init: false, dpr: 1, w: 0, h: 0 });
  useEffect(() => {
    const el = root.current;
    const c = cv.current;
    if (!el || !c) return;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      S.current.dpr = dpr;
      S.current.w = el.clientWidth;
      S.current.h = el.clientHeight;
      c.width = Math.round(el.clientWidth * dpr);
      c.height = Math.round(el.clientHeight * dpr);
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
      const W = el.clientWidth;
      const H = el.clientHeight;
      const s = t * 1.35 + 0.5 * Math.sin(t * 0.7);
      return { x: W / 2 + W * 0.34 * Math.sin(s) + 40 * Math.sin(t * 4.1), y: H / 2 + H * 0.28 * Math.sin(2 * s) + 30 * Math.cos(t * 3.3), inside: true };
    },
    (p, _el, _f, t, dt) => {
      const c = cv.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) return;
      const s = S.current;
      const rs = R.current;
      if (!s.init) {
        s.init = true;
        rs.forEach((r) => {
          r.hx = p.x;
          r.hy = p.y;
          r.pts.forEach((q) => {
            q.x = p.x;
            q.y = p.y;
          });
        });
      }
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      ctx.clearRect(0, 0, s.w, s.h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      rs.forEach((r, i) => {
        const cfg = U177_R[i];
        const a = t * 2.2 + (i * Math.PI) / 2;
        const tx = p.x + Math.cos(a) * 10;
        const ty = p.y + Math.sin(a) * 10;
        const n = 3;
        const h = dt / n;
        for (let k = 0; k < n; k++) {
          r.vx += (cfg.k * (tx - r.hx) - cfg.d * r.vx) * h;
          r.vy += (cfg.k * (ty - r.hy) - cfg.d * r.vy) * h;
          r.hx += r.vx * h;
          r.hy += r.vy * h;
        }
        r.pts[0].x = r.hx;
        r.pts[0].y = r.hy;
        const f = 1 - Math.pow(1 - cfg.f, dt * 60);
        for (let j = 1; j < U177_N; j++) {
          r.pts[j].x += (r.pts[j - 1].x - r.pts[j].x) * f;
          r.pts[j].y += (r.pts[j - 1].y - r.pts[j].y) * f;
        }
        ctx.strokeStyle = cfg.c;
        ctx.globalAlpha = 0.85;
        for (let j = 1; j < U177_N - 1; j++) {
          const a0 = r.pts[j - 1];
          const a1 = r.pts[j];
          const a2 = r.pts[j + 1];
          ctx.lineWidth = Math.max(0.6, cfg.w * (1 - j / U177_N));
          ctx.beginPath();
          ctx.moveTo((a0.x + a1.x) / 2, (a0.y + a1.y) / 2);
          ctx.quadraticCurveTo(a1.x, a1.y, (a1.x + a2.x) / 2, (a1.y + a2.y) / 2);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    },
  );
  return (
    <Stage r={root} g1="rgba(255,95,126,.5)" g2="rgba(95,212,255,.24)">
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <Eyebrow>Spring dye-house edit</Eyebrow>
        <h3 className="mt-4 text-[clamp(48px,5.6vw,92px)] leading-[0.94] tracking-[-0.03em]" style={{ fontFamily: F.sy, fontWeight: 700 }}>
          Colour that
          <br />
          follows you
        </h3>
        <p className="mt-5 text-[16px] text-white/60" style={{ fontFamily: F.mr }}>
          Silk scarves, hand-dyed · ₹3,200
        </p>
      </div>
      <canvas ref={cv} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "U166", name: "Animated border frame menu", how: "Tapping the menu icon draws a thick border round the frame, one side after another, and the menu items rise inside the band. A fake pointer opens, browses and closes it.", kind: "play", C: U166 },
  { code: "U167", name: "3D progress button", how: "Pressing the button rolls it over in 3D to a side face that fills as a progress bar, then rolls back showing a success state. A fake pointer presses it.", kind: "play", C: U167 },
  { code: "U168", name: "Elastic SVG UI", how: "The sidebar edge, input underline and button are SVG paths that overshoot and wobble back elastically when opened, focused or pressed. A fake pointer uses each.", kind: "play", C: U168 },
  { code: "U169", name: "Menu hover pack (letters)", how: "Hovering a menu item makes each letter jump, scale and tilt by a random amount, then land back with a springy settle. A fake pointer walks the menu.", kind: "play", C: U169 },
  { code: "U170", name: "Grid box menu", how: "Menu boxes scale in from alternating edges (X or Y) and a cover wipes off each one to reveal its item; closing reverses it. A fake pointer opens and closes it.", kind: "play", C: U170 },
  { code: "U171", name: "Draggable inline menu with scattered thumbs", how: "The big inline menu row is dragged sideways and snaps to an item; the scattered thumbnails of the current item trail the drag at different lags. Scripted drags loop.", kind: "play", C: U171 },
  { code: "U172", name: "Cursor ring distortion", how: "A dot cursor and a lagging ring follow the pointer; over a link the ring grows and its outline wobbles through an SVG noise displacement. A scripted figure-eight drives it.", kind: "play", C: U172 },
  { code: "U173", name: "Crosshair cursor with noise", how: "Full-width and full-height lines follow the pointer; over a link they ripple through an SVG noise filter and the link's letters jitter. A scripted figure-eight drives it.", kind: "play", C: U173 },
  { code: "U174", name: "Smooth spring cursor", how: "An arrow cursor trails the pointer on a spring (stiffness 400, damping 45), turning to point where it travels and stretching slightly with speed. A scripted path drives it.", kind: "play", C: U174 },
  { code: "U175", name: "Cool mode particle burst", how: "Holding the button sprays little photos, hearts and sparkles from the pointer that fly up, fall with gravity, spin and fade. A fake pointer presses and holds it.", kind: "play", C: U175 },
  { code: "U176", name: "Skeleton scan feature card", how: "In a feature card, a vertical light line with sparkles scans across while the icon circles pulse one by one as it passes; skeleton bars shimmer. Loops on its own.", kind: "play", C: U176 },
  { code: "U177", name: "Ribbons trail", how: "Four coloured ribbons chase the pointer on springs of different stiffness, whipping and curling behind it. A scripted fast figure-eight drives it.", kind: "play", C: U177 },
];
