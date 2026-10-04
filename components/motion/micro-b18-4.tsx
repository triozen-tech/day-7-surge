"use client";

// Micro-interactions, batch 18 · group 4 (MOTION-MENU U202–U213). Small focused demos for /lab/motion.
// Hover demos also play by themselves: a visible fake pointer (ring) walks over the targets, resting ≤ 0.5 s per target.
// The real mouse takes over for 2.5 s whenever it moves inside the stage. Attention moves (bounce, flash, rubber band,
// tada, wobble, 3D slide) loop with a short rest (≤ 0.3 s) while on screen.
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
const OVER = "cubic-bezier(.47,2.02,.31,-.36)";

const CSS = `
.b18g4-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b18g4-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b18g4-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b18g4-hide{visibility:hidden}
.b18g4-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;pointer-events:none;z-index:40;opacity:0;transition:opacity .25s}
.b18g4-dot>span{display:block;width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4)}

/* U202 exploding chars */
.u202-c{display:inline-block;will-change:transform}

/* U204 flash */
.u204-live{animation:u204-ping 1.3s ease-out infinite}
@keyframes u204-ping{0%{box-shadow:0 0 0 0 rgba(255,90,90,.7)}100%{box-shadow:0 0 0 14px rgba(255,90,90,0)}}

/* U208 rotate */
.u208-k{transition:transform .45s ${EZ},box-shadow .45s}
.u208-k.on{transform:rotate(4deg);box-shadow:0 30px 60px rgba(0,0,0,.5)}

/* U209 skew */
.u209-b{transition:transform .35s ${EZ},background-color .35s,color .35s}
.u209-b.v1.on{transform:skewX(-20deg)}
.u209-b.v2{transition:transform .5s ${OVER},background-color .35s,color .35s}
.u209-b.v2.on{transform:skewX(-10deg)}
.u209-b.v3{transition:transform .5s ${OVER},background-color .35s,color .35s}
.u209-b.v3.on{transform:skewX(10deg)}
.u209-b.on{background:#ffd166;color:#17110a}

/* U210 round corners */
.u210-t{border-radius:0;transition:border-radius .6s ${EZ},transform .6s ${EZ}}
.u210-t.on{border-radius:56px;transform:scale(.97)}
.u210-t.v2.on{border-radius:50%}

/* U211 speech bubbles */
.u211-k{position:relative;transition:background-color .3s,color .3s}
.u211-k.on{background:#f2f4ff;color:#0b0d16}
.u211-tip{position:absolute;white-space:nowrap;pointer-events:none;opacity:0;padding:10px 14px;border-radius:12px;background:#9f8cff;color:#0b0716;font-size:14px;font-weight:600;transition:opacity .3s,transform .35s ${EZ}}
.u211-tip::after{content:"";position:absolute;border:8px solid transparent}
.u211-k.on .u211-tip{opacity:1}
.u211-tip.t{left:50%;bottom:100%;transform:translate(-50%,6px)}
.u211-tip.t::after{left:50%;top:100%;margin-left:-8px;border-top-color:#9f8cff}
.u211-k.on .u211-tip.t{transform:translate(-50%,-14px)}
.u211-tip.r{left:100%;top:50%;transform:translate(-6px,-50%)}
.u211-tip.r::after{right:100%;top:50%;margin-top:-8px;border-right-color:#9f8cff}
.u211-k.on .u211-tip.r{transform:translate(14px,-50%)}
.u211-tip.b{left:50%;top:100%;transform:translate(-50%,-6px)}
.u211-tip.b::after{left:50%;bottom:100%;margin-left:-8px;border-bottom-color:#9f8cff}
.u211-k.on .u211-tip.b{transform:translate(-50%,14px)}
.u211-tip.l{right:100%;top:50%;transform:translate(6px,-50%)}
.u211-tip.l::after{left:100%;top:50%;margin-top:-8px;border-left-color:#9f8cff}
.u211-k.on .u211-tip.l{transform:translate(-14px,-50%)}
.u211-k.on .u211-tip.fl{animation:u211-float 1.2s ease-in-out infinite alternate}
@keyframes u211-float{to{margin-top:-6px}}

/* U212 page curl */
.u212-card{position:relative;overflow:hidden;transition:transform .45s ${EZ}}
.u212-card.on{transform:translateY(-6px)}
.u212-c{position:absolute;width:0;height:0;pointer-events:none;transition:width .5s ${EZ},height .5s ${EZ}}
.u212-card.on .u212-c{width:110px;height:110px}
.u212-c.tr{top:0;right:0;background:linear-gradient(225deg,#0a0d16 45%,#8d8f99 50%,#d3d5de 56%,#ffffff 80%);box-shadow:-2px 2px 4px rgba(0,0,0,.4)}
.u212-c.tl{top:0;left:0;background:linear-gradient(135deg,#0a0d16 45%,#8d8f99 50%,#d3d5de 56%,#ffffff 80%);box-shadow:2px 2px 4px rgba(0,0,0,.4)}
.u212-c.br{bottom:0;right:0;background:linear-gradient(315deg,#0a0d16 45%,#8d8f99 50%,#d3d5de 56%,#ffffff 80%);box-shadow:-2px -2px 4px rgba(0,0,0,.4)}
.u212-c.bl{bottom:0;left:0;background:linear-gradient(45deg,#0a0d16 45%,#8d8f99 50%,#d3d5de 56%,#ffffff 80%);box-shadow:2px -2px 4px rgba(0,0,0,.4)}

/* U213 3D slide */
.u213-k{position:absolute;inset:0;backface-visibility:hidden}

html.is-static .b18g4-glow,html.is-static .u204-live,html.is-static .u211-tip{animation:none}
@media (prefers-reduced-motion: reduce){
  .b18g4-glow,.u204-live,.u211-tip{animation:none}
  .u208-k,.u209-b,.u210-t,.u211-k,.u211-tip,.u212-card,.u212-c{transition:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop, again on top (screen blend) so covered stages never freeze. */
function Stage({ r, children, g1, g2 }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string }) {
  return (
    <div ref={r} className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff]">
      <style href="b18g4-css" precedence="default">
        {CSS}
      </style>
      <div className="b18g4-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      <div className="b18g4-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: 0.45, zIndex: 35 } as CSSProperties} aria-hidden />
    </div>
  );
}

/** The visible fake pointer (a ring). */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => (
  <div ref={r} className="b18g4-dot" aria-hidden>
    <span />
  </div>
);

type Pt = { x: number; y: number; inside: boolean };
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
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** Pointer driver: the real mouse wins for 2.5 s after it last moved; otherwise `script` moves a visible fake ring. */
function usePointer(
  root: RefObject<HTMLDivElement | null>,
  dot: RefObject<HTMLDivElement | null>,
  script: (t: number, el: HTMLDivElement) => Pt,
  frame: (p: Pt, el: HTMLDivElement, fake: boolean) => void,
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
  useTicker(root, (t) => {
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
    fr.current(p, el, !useReal);
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

/** Toggle `.on` on every target the pointer is over. */
function hoverTargets(el: HTMLElement, sel: string, p: Pt, pad = 4) {
  all(el, sel).forEach((n) => n.classList.toggle("on", p.inside && inBox(rel(n, el), p.x, p.y, pad)));
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

// eslint-disable-next-line @next/next/no-img-element
const Img = ({ i, className = "", w = 700, h = 900 }: { i: number; className?: string; w?: number; h?: number }) => (
  <img src={scene(i, w, h)} alt="" className={`block h-full w-full object-cover ${className}`} draggable={false} />
);

const Eyebrow = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={`text-[13px] uppercase tracking-[0.22em] text-white/55 ${className}`} style={{ fontFamily: F.sg }}>
    {children}
  </p>
);

const Center = ({ children }: { children: ReactNode }) => <div className="flex h-full w-full flex-col items-center justify-center text-center">{children}</div>;

/* ───────────────────────── U202 · Exploding characters ───────────────────────── */
const U202_WORD = "STARDUST";
function U202() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLHeadingElement>(null);
  const idle = useIdle(root);
  const burst = () => {
    if (!word.current || prefersReducedMotion()) return;
    all(word.current, ".u202-c").forEach((c) =>
      gsap.to(c, {
        x: rnd(-280, 280),
        y: rnd(-190, 190),
        rotation: rnd(-170, 170),
        scale: rnd(0.6, 1.35),
        duration: rnd(0.45, 0.9),
        delay: rnd(0, 0.14),
        ease: "power3.out",
        overwrite: true,
      }),
    );
  };
  const back = () => {
    if (!word.current || prefersReducedMotion()) return;
    all(word.current, ".u202-c").forEach((c) =>
      gsap.to(c, { x: 0, y: 0, rotation: 0, scale: 1, duration: rnd(0.5, 0.8), delay: rnd(0.06, 0.26), ease: "power3.inOut", overwrite: true }),
    );
  };
  usePlay(root, (el) => {
    const d = dot.current;
    const w = word.current;
    const tl = gsap.timeline({ repeat: -1 });
    tl.call(() => goDot(d, el, w, 0.45, idle()));
    tl.to({}, { duration: 0.45 });
    tl.call(() => idle() && burst());
    tl.to({}, { duration: 0.5 });
    tl.call(() => goDot(d, el, [el.clientWidth * 0.8, el.clientHeight * 0.82], 0.45, idle()));
    tl.to({}, { duration: 0.2 });
    tl.call(() => idle() && back());
    tl.to({}, { duration: 0.75 });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(159,140,255,.55)" g2="rgba(255,122,89,.24)">
      <Center>
        <Eyebrow>Night-sky candle · ₹1,290</Eyebrow>
        <h3
          ref={word}
          className="mt-5 cursor-default select-none text-[min(7vw,118px)] leading-[1] tracking-[-0.02em]"
          style={{ fontFamily: F.sy, fontWeight: 800 }}
          aria-label={U202_WORD}
          onPointerEnter={burst}
          onPointerLeave={back}
        >
          {U202_WORD.split("").map((ch, i) => (
            <span key={i} className="u202-c" aria-hidden>
              {ch}
            </span>
          ))}
        </h3>
        <p className="mt-6 max-w-[34ch] text-[16px] text-white/60" style={{ fontFamily: F.mr }}>
          Hover the word and it bursts like a shooting star, then gathers back.
        </p>
      </Center>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U203 · Bounce (attention) ───────────────────────── */
function U203() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const card = el.querySelector<HTMLElement>(".u203-card")!;
    const sh = el.querySelector<HTMLElement>(".u203-sh")!;
    gsap.set(card, { transformOrigin: "50% 100%" });
    const tl = gsap.timeline({
      repeat: -1,
      onUpdate: () => {
        const y = Number(gsap.getProperty(card, "y")) || 0;
        gsap.set(sh, { scaleX: 1 + y / 260, opacity: 0.55 + y / 300 });
      },
    });
    tl.to(card, { y: -130, duration: 0.3, ease: "power2.out" })
      .to(card, { y: 0, duration: 0.26, ease: "power2.in" })
      .to(card, { scaleY: 0.86, scaleX: 1.08, duration: 0.07, ease: "power1.out" })
      .to(card, { scaleY: 1, scaleX: 1, y: -55, duration: 0.22, ease: "power2.out" })
      .to(card, { y: 0, duration: 0.19, ease: "power2.in" })
      .to(card, { scaleY: 0.93, scaleX: 1.04, duration: 0.06, ease: "power1.out" })
      .to(card, { scaleY: 1, scaleX: 1, duration: 0.12, ease: "power1.out" })
      .to({}, { duration: 0.18 });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,209,102,.52)" g2="rgba(79,141,255,.22)">
      <div className="flex h-full w-full items-center justify-center gap-16">
        <div className="flex flex-col items-center pt-24">
          <div className="u203-card relative h-[300px] w-[240px] overflow-hidden rounded-[22px] border border-white/15 shadow-[0_24px_50px_rgba(0,0,0,.45)]">
            <Img i={3} />
            <span className="absolute left-4 top-4 rounded-full bg-[#ffd166] px-3 py-1 text-[13px] font-[700] text-[#17110a]" style={{ fontFamily: F.sg }}>
              New drop
            </span>
          </div>
          <div className="u203-sh mt-3 h-[14px] w-[200px] rounded-[50%] bg-black/60" />
        </div>
        <div className="max-w-[340px] text-left">
          <Eyebrow>Just landed</Eyebrow>
          <h3 className="mt-3 text-[clamp(34px,3.4vw,52px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Amber leather tote
          </h3>
          <p className="mt-4 text-[22px] text-white/80" style={{ fontFamily: F.sg }}>
            ₹6,450
          </p>
        </div>
      </div>
    </Stage>
  );
}

/* ───────────────────────── U204 · Flash blink ───────────────────────── */
function U204() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const t = el.querySelectorAll(".u204-f");
    const secs = el.querySelector<HTMLElement>(".u204-s")!;
    let s = 59;
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(t, { opacity: 0, duration: 0.17, ease: "power1.in" })
      .to(t, { opacity: 1, duration: 0.17, ease: "power1.out" })
      .to(t, { opacity: 0, duration: 0.17, ease: "power1.in" })
      .to(t, { opacity: 1, duration: 0.17, ease: "power1.out" })
      .call(() => {
        s = s <= 0 ? 59 : s - 1;
        secs.textContent = String(s).padStart(2, "0");
      })
      .to({}, { duration: 0.28 });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,90,90,.52)" g2="rgba(255,209,102,.22)">
      <Center>
        <span className="u204-f u204-live inline-flex items-center gap-2 rounded-full bg-[#ff5a5a] px-4 py-2 text-[14px] font-[700] uppercase tracking-[0.18em] text-white" style={{ fontFamily: F.sg }}>
          <span className="h-2 w-2 rounded-full bg-white" /> Live now
        </span>
        <h3 className="mt-6 text-[clamp(56px,7vw,112px)] leading-[0.95] tracking-[-0.03em]" style={{ fontFamily: F.sy, fontWeight: 800 }}>
          Midnight sale
        </h3>
        <p className="u204-f mt-5 text-[clamp(26px,2.6vw,40px)] text-[#ffd166]" style={{ fontFamily: F.is }}>
          −40% on every lamp
        </p>
        <p className="mt-6 text-[15px] uppercase tracking-[0.2em] text-white/55" style={{ fontFamily: F.mr }}>
          Ends in 00:14:<span className="u204-s">59</span>
        </p>
      </Center>
    </Stage>
  );
}

/* ───────────────────────── U205 · Rubber band stretch ───────────────────────── */
const U205_H: [number, number][] = [
  [1.25, 0.75],
  [0.75, 1.25],
  [1.15, 0.85],
  [0.95, 1.05],
  [1.05, 0.95],
  [1, 1],
];
const U205_D = [0.15, 0.12, 0.1, 0.1, 0.08, 0.12];
function U205() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const b = el.querySelector<HTMLElement>(".u205-b")!;
    const lab = el.querySelector<HTMLElement>(".u205-m")!;
    const tl = gsap.timeline({ repeat: -1 });
    (["Horizontal", "Vertical"] as const).forEach((mode, k) => {
      tl.call(() => (lab.textContent = mode));
      U205_H.forEach(([a, c], i) => {
        const [sx, sy] = k === 0 ? [a, c] : [c, a];
        tl.to(b, { scaleX: sx, scaleY: sy, duration: U205_D[i], ease: i === U205_H.length - 1 ? "power1.out" : "sine.inOut" });
      });
      tl.to({}, { duration: 0.2 });
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(124,224,195,.52)" g2="rgba(159,140,255,.24)">
      <Center>
        <Eyebrow>Welcome offer</Eyebrow>
        <h3 className="mt-3 text-[clamp(34px,3.6vw,56px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          First order on us
        </h3>
        <button type="button" className="u205-b mt-10 rounded-full bg-[#7ce0c3] px-12 py-6 text-[24px] font-[700] text-[#04150f] shadow-[0_20px_50px_rgba(124,224,195,.25)]" style={{ fontFamily: F.sg }}>
          Claim ₹500 off
        </button>
        <p className="mt-8 text-[13px] uppercase tracking-[0.22em] text-white/50" style={{ fontFamily: F.mr }}>
          Stretch · <span className="u205-m">Horizontal</span>
        </p>
      </Center>
    </Stage>
  );
}

/* ───────────────────────── U206 · Tada ───────────────────────── */
function U206() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const c = el.querySelector<HTMLElement>(".u206-c")!;
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(c, { scale: 0.9, rotation: -3, duration: 0.1, ease: "sine.inOut" }).to(c, { scale: 0.9, rotation: -3, duration: 0.1 });
    [3, -3, 3, -3, 3, -3, 3].forEach((r) => tl.to(c, { scale: 1.1, rotation: r, duration: 0.1, ease: "sine.inOut" }));
    tl.to(c, { scale: 1, rotation: 0, duration: 0.12, ease: "power1.out" }).to({}, { duration: 0.18 });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,209,102,.55)" g2="rgba(255,122,89,.24)">
      <Center>
        <div className="u206-c w-[min(440px,80%)] rounded-[26px] border border-[#ffd166]/40 bg-gradient-to-br from-[#2a2210] to-[#120f08] px-10 py-10 shadow-[0_30px_70px_rgba(0,0,0,.5)]">
          <svg viewBox="0 0 24 24" className="mx-auto h-16 w-16" fill="#ffd166" aria-hidden>
            <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" />
          </svg>
          <Eyebrow className="mt-5">Rewards club</Eyebrow>
          <h3 className="mt-2 text-[clamp(32px,3.2vw,48px)] leading-[1] tracking-[-0.02em] text-[#ffe6a8]" style={{ fontFamily: F.fr, fontWeight: 600 }}>
            Gold tier unlocked
          </h3>
          <p className="mt-4 text-[16px] text-white/65" style={{ fontFamily: F.mr }}>
            Free express delivery on every order over ₹999
          </p>
        </div>
      </Center>
    </Stage>
  );
}

/* ───────────────────────── U207 · Wobble ───────────────────────── */
const U207_K: [number, number][] = [
  [-25, -5],
  [20, 3],
  [-15, -3],
  [10, 2],
  [-5, -1],
  [0, 0],
];
function U207() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const c = el.querySelector<HTMLElement>(".u207-c")!;
    const tl = gsap.timeline({ repeat: -1 });
    U207_K.forEach(([x, r], i) => tl.to(c, { xPercent: x, rotation: r, duration: i === 0 ? 0.16 : 0.15, ease: "sine.inOut" }));
    tl.to({}, { duration: 0.2 });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,122,89,.52)" g2="rgba(79,141,255,.22)">
      <Center>
        <div className="u207-c flex w-[min(520px,80%)] items-center gap-6 rounded-[24px] border border-white/12 bg-white/[0.05] p-5 text-left shadow-[0_24px_60px_rgba(0,0,0,.45)]">
          <div className="h-[120px] w-[100px] shrink-0 overflow-hidden rounded-[16px]">
            <Img i={1} w={400} h={480} />
          </div>
          <div>
            <p className="text-[13px] font-[700] uppercase tracking-[0.18em] text-[#ff7a59]" style={{ fontFamily: F.sg }}>
              Only 3 left
            </p>
            <p className="mt-2 text-[24px] leading-[1.1]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
              Rose clay serum
            </p>
            <p className="mt-2 text-[15px] text-white/60" style={{ fontFamily: F.mr }}>
              Still waiting in your bag · ₹1,840
            </p>
          </div>
        </div>
      </Center>
    </Stage>
  );
}

/* ───────────────────────── U208 · Rotate on hover ───────────────────────── */
const U208_P = [
  { n: "Linen overshirt", p: "₹3,290", i: 0 },
  { n: "Canvas sneaker", p: "₹4,150", i: 3 },
  { n: "Field bottle", p: "₹1,190", i: 1 },
];
function U208() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  usePointer(
    root,
    dot,
    (t, el) => {
      const pts = all(el, ".u208-k").map((n) => mid(rel(n, el)));
      const [x, y] = stepPath(t, pts, 0.92, 0.47);
      return { x, y, inside: true };
    },
    (p, el) => hoverTargets(el, ".u208-k", p),
  );
  return (
    <Stage r={root} g1="rgba(79,141,255,.55)" g2="rgba(255,209,102,.22)">
      <div className="flex h-full w-full items-center justify-center gap-10">
        {U208_P.map((c) => (
          <div key={c.n} className="u208-k w-[min(19vw,260px)] overflow-hidden rounded-[20px] border border-white/12 bg-[#121725]" data-cursor="View">
            <div className="aspect-[4/5]">
              <Img i={c.i} w={520} h={650} />
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <p className="text-[17px] font-[600]" style={{ fontFamily: F.sg }}>
                {c.n}
              </p>
              <p className="text-[15px] text-white/65" style={{ fontFamily: F.mr }}>
                {c.p}
              </p>
            </div>
          </div>
        ))}
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U209 · Skew on hover ───────────────────────── */
const U209_B = [
  { l: "New in", v: "v1", tag: "skew −20°" },
  { l: "Bestsellers", v: "v2", tag: "skew forward" },
  { l: "Sale", v: "v3", tag: "skew backward" },
];
function U209() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  usePointer(
    root,
    dot,
    (t, el) => {
      const pts = all(el, ".u209-b").map((n) => mid(rel(n, el)));
      const [x, y] = stepPath(t, pts, 0.9, 0.46);
      return { x, y, inside: true };
    },
    (p, el) => hoverTargets(el, ".u209-b", p, 6),
  );
  return (
    <Stage r={root} g1="rgba(255,209,102,.52)" g2="rgba(159,140,255,.24)">
      <Center>
        <Eyebrow>Shop the edit</Eyebrow>
        <div className="mt-10 flex items-start gap-8">
          {U209_B.map((b) => (
            <div key={b.l} className="flex flex-col items-center gap-4">
              <button type="button" className={`u209-b ${b.v} rounded-[14px] border border-white/15 bg-white/[0.05] px-10 py-6 text-[clamp(24px,2.4vw,36px)] font-[700]`} style={{ fontFamily: F.sy }}>
                {b.l}
              </button>
              <span className="text-[13px] uppercase tracking-[0.18em] text-white/45" style={{ fontFamily: F.mr }}>
                {b.tag}
              </span>
            </div>
          ))}
        </div>
      </Center>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U210 · Round corners ───────────────────────── */
function U210() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  usePointer(
    root,
    dot,
    (t, el) => {
      const ts = all(el, ".u210-t").map((n) => rel(n, el));
      const [a, b] = ts.map(mid);
      const gx = (ts[0].l + ts[0].w + ts[1].l) / 2;
      const pts: [number, number][] = [a, [gx, el.clientHeight * 0.86], b, [gx, el.clientHeight * 0.14]];
      const [x, y] = stepPath(t, pts, 0.95, 0.5);
      return { x, y, inside: true };
    },
    (p, el) => hoverTargets(el, ".u210-t", p),
  );
  return (
    <Stage r={root} g1="rgba(24,196,143,.52)" g2="rgba(255,122,89,.22)">
      <div className="flex h-full w-full items-center justify-center gap-16">
        {[
          { i: 2, n: "Moss ceramic set", p: "₹2,780", v: "" },
          { i: 0, n: "Studio lamp", p: "₹5,600", v: "v2" },
        ].map((c) => (
          <div key={c.n} className="flex flex-col items-center">
            <div className={`u210-t ${c.v} h-[min(42vh,340px)] w-[min(42vh,340px)] overflow-hidden border border-white/12`}>
              <Img i={c.i} w={600} h={600} />
            </div>
            <p className="mt-5 text-[18px] font-[600]" style={{ fontFamily: F.sg }}>
              {c.n} <span className="ml-2 font-[400] text-white/60">{c.p}</span>
            </p>
          </div>
        ))}
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U211 · Speech-bubble pointer ───────────────────────── */
const U211_K = [
  { l: "Size guide", tip: "Fits true to size", c: "t" },
  { l: "Delivery", tip: "Free over ₹999", c: "r fl" },
  { l: "Returns", tip: "30 days, no fuss", c: "l fl" },
  { l: "Care", tip: "Cold wash only", c: "b" },
];
function U211() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  usePointer(
    root,
    dot,
    (t, el) => {
      const cs = all(el, ".u211-k").map((n) => mid(rel(n, el)));
      const xs = cs.map((c) => c[0]);
      const ys = cs.map((c) => c[1]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const ax = (Math.max(...xs) - cx) / 0.7071;
      const ay = Math.max(...ys) - cy;
      const th = t * ((Math.PI * 2) / 5.2) + Math.PI / 4;
      return { x: cx + ax * Math.sin(th), y: cy + ay * Math.sin(2 * th), inside: true };
    },
    (p, el) => hoverTargets(el, ".u211-k", p, 10),
  );
  return (
    <Stage r={root} g1="rgba(159,140,255,.55)" g2="rgba(124,224,195,.22)">
      <Center>
        <Eyebrow>Before you buy</Eyebrow>
        <div className="mt-14 grid grid-cols-2 gap-x-[220px] gap-y-[110px]">
          {U211_K.map((k) => (
            <button key={k.l} type="button" className="u211-k rounded-full border border-white/15 bg-white/[0.05] px-8 py-4 text-[20px] font-[600]" style={{ fontFamily: F.sg }}>
              {k.l}
              <span className={`u211-tip ${k.c}`} style={{ fontFamily: F.mr }}>
                {k.tip}
              </span>
            </button>
          ))}
        </div>
      </Center>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U212 · Page curl ───────────────────────── */
const U212_C = [
  { c: "tl", t: "WELCOME10", d: "10% off first order", bg: "from-[#ffd166] to-[#ff9f5a]" },
  { c: "tr", t: "FREESHIP", d: "Free delivery today", bg: "from-[#7ce0c3] to-[#4fb3ff]" },
  { c: "bl", t: "DUO250", d: "₹250 off any two", bg: "from-[#c79bff] to-[#ff7ab8]" },
  { c: "br", t: "GIFTWRAP", d: "Wrapped for free", bg: "from-[#b8f36b] to-[#5fd4a0]" },
];
function U212() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  usePointer(
    root,
    dot,
    (t, el) => {
      const pts = all(el, ".u212-card").map((n) => mid(rel(n, el)));
      const [x, y] = stepPath(t, pts, 0.95, 0.48);
      return { x, y, inside: true };
    },
    (p, el) => hoverTargets(el, ".u212-card", p),
  );
  return (
    <Stage r={root} g1="rgba(255,209,102,.52)" g2="rgba(199,155,255,.24)">
      <Center>
        <Eyebrow>Peel a coupon</Eyebrow>
        <div className="mt-10 grid grid-cols-4 gap-7">
          {U212_C.map((k) => (
            <div key={k.c} className={`u212-card flex h-[210px] w-[min(15vw,220px)] flex-col justify-between rounded-[6px] bg-gradient-to-br ${k.bg} p-6 text-left text-[#120d06]`}>
              <p className="text-[13px] uppercase tracking-[0.2em] opacity-70" style={{ fontFamily: F.mr }}>
                Code
              </p>
              <div>
                <p className="text-[clamp(20px,1.7vw,26px)] font-[800] tracking-[0.02em]" style={{ fontFamily: F.sg }}>
                  {k.t}
                </p>
                <p className="mt-1 text-[14px] opacity-75" style={{ fontFamily: F.mr }}>
                  {k.d}
                </p>
              </div>
              <span className={`u212-c ${k.c}`} aria-hidden />
            </div>
          ))}
        </div>
      </Center>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U213 · Slide with 3D rotation ───────────────────────── */
const U213_K = [
  { n: "Cold brew kit", p: "₹2,150", i: 0, dir: "up" },
  { n: "Pour-over cone", p: "₹1,480", i: 1, dir: "right" },
  { n: "Bean tin · 250 g", p: "₹890", i: 2, dir: "down" },
  { n: "Travel tumbler", p: "₹1,790", i: 3, dir: "left" },
];
const U213_V: Record<string, { in: gsap.TweenVars; out: gsap.TweenVars }> = {
  up: { in: { y: 180, rotationX: -90 }, out: { y: -180, rotationX: 90 } },
  down: { in: { y: -180, rotationX: 90 }, out: { y: 180, rotationX: -90 } },
  right: { in: { x: -240, rotationY: -90 }, out: { x: 240, rotationY: 90 } },
  left: { in: { x: 240, rotationY: 90 }, out: { x: -240, rotationY: -90 } },
};
function U213() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const ks = all(el, ".u213-k");
    const lab = el.querySelector<HTMLElement>(".u213-d")!;
    const n = ks.length;
    const tl = gsap.timeline({ repeat: -1 });
    ks.forEach((k, i) => {
      const nx = ks[(i + 1) % n];
      const v = U213_V[U213_K[(i + 1) % n].dir];
      tl.to({}, { duration: 0.25 });
      tl.call(() => (lab.textContent = U213_K[(i + 1) % n].dir));
      tl.to(k, { ...v.out, autoAlpha: 0, duration: 0.5, ease: "power2.in" });
      tl.fromTo(
        nx,
        { x: 0, y: 0, rotationX: 0, rotationY: 0, ...v.in, autoAlpha: 0 },
        { x: 0, y: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", immediateRender: false },
        "-=0.22",
      );
    });
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,122,89,.52)" g2="rgba(255,209,102,.22)">
      <div className="flex h-full w-full items-center justify-center gap-20">
        <div className="relative h-[min(52vh,400px)] w-[min(40vh,310px)]" style={{ perspective: "1000px" }}>
          {U213_K.map((k, i) => (
            <div key={k.n} className={`u213-k overflow-hidden rounded-[22px] border border-white/12 bg-[#121725] ${i ? "b18g4-hide" : ""}`}>
              <div className="h-[78%]">
                <Img i={k.i} w={520} h={620} />
              </div>
              <div className="flex h-[22%] items-center justify-between px-5">
                <p className="text-[17px] font-[600]" style={{ fontFamily: F.sg }}>
                  {k.n}
                </p>
                <p className="text-[15px] text-white/65" style={{ fontFamily: F.mr }}>
                  {k.p}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-[320px] text-left">
          <Eyebrow>Brew bar</Eyebrow>
          <h3 className="mt-3 text-[clamp(34px,3.4vw,52px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
            Tip through the range
          </h3>
          <p className="mt-5 text-[13px] uppercase tracking-[0.22em] text-white/50" style={{ fontFamily: F.mr }}>
            Slide · <span className="u213-d">up</span>
          </p>
        </div>
      </div>
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "U202", name: "Exploding characters", how: "Hovering the word bursts its letters to random offsets and spins at random speeds; leaving gathers them back with a slight delay. A fake pointer hovers in and out.", kind: "play", C: U202 },
  { code: "U203", name: "Bounce (attention)", how: "The new-drop card jumps twice with decreasing height and squashes on each landing while its shadow breathes. Loops with a short rest.", kind: "play", C: U203 },
  { code: "U204", name: "Flash blink", how: "The live badge and the offer line blink 1-0-1-0-1 in about a second, then rest briefly and blink again.", kind: "play", C: U204 },
  { code: "U205", name: "Rubber band stretch", how: "The offer button stretches wide/short then tall/narrow in decaying steps like a snapping band, alternating horizontal and vertical runs.", kind: "play", C: U205 },
  { code: "U206", name: "Tada", how: "The reward card shrinks a touch, then scales up while wiggling ±3°, then settles. Loops with a short rest.", kind: "play", C: U206 },
  { code: "U207", name: "Wobble", how: "The bag reminder slides left and right with matching tilt in decaying swings, like jelly sliding to rest. Loops with a short rest.", kind: "play", C: U207 },
  { code: "U208", name: "Rotate on hover", how: "The hovered product card rotates 4° and lifts its shadow. A fake pointer visits the cards in turn.", kind: "play", C: U208 },
  { code: "U209", name: "Skew on hover", how: "Hovered buttons skew: a plain −20° lean, a forward skew with overshoot and a backward skew with overshoot. A fake pointer visits each.", kind: "play", C: U209 },
  { code: "U210", name: "Round corners", how: "On hover the square image tile's corners round off (one to a soft square, one to a circle). A fake pointer moves between the tiles.", kind: "play", C: U210 },
  { code: "U211", name: "Speech-bubble pointer", how: "Hovered chips show a tooltip with a triangle pointer sliding out on one side (two float). A fake pointer sweeps a figure-eight over them.", kind: "play", C: U211 },
  { code: "U212", name: "Page curl", how: "On hover a coupon's corner peels back with a folded-paper gradient, each card from a different corner. A fake pointer visits the coupons.", kind: "play", C: U212 },
  { code: "U213", name: "Slide with 3D rotation", how: "Product cards slide out and in while tipping 90° in 3D, cycling up, right, down and left. Loops with a short rest.", kind: "play", C: U213 },
];
