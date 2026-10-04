"use client";

// Micro-interactions, batch 19 · group 4 (MOTION-MENU U262–U264). Small focused demos for /lab/motion.
// Every demo plays by itself while on screen: a visible fake pointer (ring) presses, types or sweeps, resting ≤ 0.5 s.
// The real mouse still works (click the button, type in the field, swipe hard across the footer).
// A CSS-only glow loop never stops (and sits on top again, screen-blended) so the stages never freeze.
// ?static=1 / reduced motion: no JS, the markup shows a sensible final state.
import { useEffect, useRef, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useTicker } from "@/components/fx/shared";
import type { MotionDef } from "./types";

const F = {
  sg: "Space Grotesk Variable",
  fr: "Fraunces Variable",
  is: "Instrument Serif",
  sy: "Syne Variable",
  mr: "Manrope Variable",
};

const CSS = `
.b19g4-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b19g4-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b19g4-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b19g4-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;pointer-events:none;z-index:40;opacity:0;transition:opacity .25s}
.b19g4-dot>span{display:block;width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4)}

/* U263 input */
.u263-in{outline:none;caret-color:#7cf0c9;transition:box-shadow .3s,border-color .3s}
.u263-in:focus,.u263-in.on{border-color:rgba(124,240,201,.7);box-shadow:0 0 0 6px rgba(124,240,201,.12)}

/* U264 footer pieces */
.u264-p{display:inline-block;will-change:transform;touch-action:none}

html.is-static .b19g4-glow{animation:none}
@media (prefers-reduced-motion: reduce){
  .b19g4-glow{animation:none}
  .u263-in{transition:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop, again on top (screen blend) so covered stages never freeze. */
function Stage({ r, children, g1, g2 }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string }) {
  return (
    <div ref={r} className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff]">
      <style href="b19g4-css" precedence="default">
        {CSS}
      </style>
      <div className="b19g4-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      <div className="b19g4-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: 0.45, zIndex: 35 } as CSSProperties} aria-hidden />
    </div>
  );
}

/** The visible fake pointer (a ring). */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => (
  <div ref={r} className="b19g4-dot" aria-hidden>
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
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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
    fr.current(p, el, !useReal, Math.min(dt, 1 / 30));
  });
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

/** A quick press on the fake ring (shrink + back). */
function pressDot(dot: HTMLElement | null) {
  const s = dot?.firstElementChild;
  if (!s) return;
  gsap.fromTo(s, { scale: 1 }, { scale: 0.6, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.inOut" });
}

const Eyebrow = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={`text-[13px] uppercase tracking-[0.22em] text-white/55 ${className}`} style={{ fontFamily: F.sg }}>
    {children}
  </p>
);

/* ───────────────────────── U262 · Elastic progress bar ───────────────────────── */
const U262_X0 = 90;
const U262_X1 = 710;
const U262_CY = 170;
function U262() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const idle = useIdle(root);
  usePlay(root, (el) => {
    const q = <T extends Element>(s: string) => el.querySelector(s) as T;
    const btnG = q<SVGGElement>(".u262-bg");
    const btn = q<SVGRectElement>(".u262-btn");
    const label = q<SVGTextElement>(".u262-label");
    const saved = q<SVGGElement>(".u262-saved");
    const track = q<SVGPathElement>(".u262-track");
    const fill = q<SVGPathElement>(".u262-fill");
    const arrow = q<SVGGElement>(".u262-arrow");
    const arrowIn = q<SVGGElement>(".u262-arrow-in");
    const check = q<SVGPathElement>(".u262-check");
    const pct = q<SVGTextElement>(".u262-pct");
    const d = dot.current;
    // m: button→line morph · b: bend depth · p: progress · a: arrow drop · w: wobble
    const s = { m: 0, b: 0, p: 0, a: 0, w: 0 };
    let lastPct = "";
    const draw = () => {
      if (!root.current) return;
      const W = lerp(300, U262_X1 - U262_X0, s.m);
      const H = lerp(76, 6, s.m);
      btn.setAttribute("x", (400 - W / 2).toFixed(1));
      btn.setAttribute("y", (U262_CY - H / 2).toFixed(1));
      btn.setAttribute("width", W.toFixed(1));
      btn.setAttribute("height", H.toFixed(1));
      btn.setAttribute("rx", (H / 2).toFixed(1));
      const ax = lerp(U262_X0, U262_X1, s.p);
      const b = s.b + s.w * 5 * Math.sin(performance.now() / 70);
      const X0 = U262_X0;
      const X1 = U262_X1;
      const CY = U262_CY;
      const c1 = `M${X0} ${CY} C${(X0 + (ax - X0) * 0.6).toFixed(1)} ${CY} ${(ax - (ax - X0) * 0.4).toFixed(1)} ${(CY + b).toFixed(1)} ${ax.toFixed(1)} ${(CY + b).toFixed(1)}`;
      const c2 = ` C${(ax + (X1 - ax) * 0.4).toFixed(1)} ${(CY + b).toFixed(1)} ${(X1 - (X1 - ax) * 0.6).toFixed(1)} ${CY} ${X1} ${CY}`;
      track.setAttribute("d", c1 + c2);
      fill.setAttribute("d", c1);
      arrow.setAttribute("transform", `translate(${ax.toFixed(1)} ${(CY + b - 10 - (1 - s.a) * 90).toFixed(1)})`);
      const t = s.p >= 1 ? "Done" : `${Math.round(s.p * 100)}%`;
      if (t !== lastPct) {
        pct.textContent = t;
        lastPct = t;
      }
    };
    const tl = gsap.timeline({ repeat: -1, onUpdate: draw });
    tlRef.current = tl;
    tl.set([track, fill, arrow, check, pct, saved], { opacity: 0 })
      .set(label, { opacity: 1 })
      .set(btn, { opacity: 1 })
      .set(arrowIn, { scale: 1, svgOrigin: "0 -20" })
      .set(check, { strokeDashoffset: 1 })
      .call(() => goDot(d, el, btn, 0.4, idle()))
      .to(s, { m: 0, duration: 0.4 })
      .call(() => idle() && pressDot(d))
      .to(btnG, { scale: 0.94, svgOrigin: `400 ${U262_CY}`, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.inOut" })
      .to(label, { opacity: 0, duration: 0.15 }, "<")
      .call(() => goDot(d, el, [el.clientWidth * 0.8, el.clientHeight * 0.82], 1.6, idle()))
      .to(s, { m: 1, duration: 0.45, ease: "power3.inOut" })
      .set(btn, { opacity: 0 })
      .set([track, fill], { opacity: 1 })
      .to(arrow, { opacity: 1, duration: 0.15 }, "<")
      .to(pct, { opacity: 1, duration: 0.2 }, "<")
      .to(s, { a: 1, duration: 0.3, ease: "power2.in" }, "<")
      .addLabel("land")
      .to(s, { b: 26, duration: 0.8, ease: "elastic.out(1,0.28)" }, "land")
      .to(s, { w: 1, duration: 0.3 }, "land+=0.4")
      .to(s, { p: 1, duration: 1.3, ease: "power1.inOut" }, "land+=0.1")
      .addLabel("end")
      .to(s, { w: 0, duration: 0.15 }, "end")
      .to(s, { b: 0, duration: 0.6, ease: "elastic.out(1.1,0.3)" }, "end")
      .to(arrowIn, { scale: 0, duration: 0.2, ease: "back.in(2)" }, "end")
      .to(check, { opacity: 1, duration: 0.05 }, "end+=0.12")
      .to(check, { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" }, "end+=0.12")
      .call(() => goDot(d, el, [el.clientWidth * 0.62, el.clientHeight * 0.68], 0.7, idle()), [], "end+=0.3")
      .to([check, pct, arrow], { opacity: 0, duration: 0.15 }, "end+=0.45")
      .set([track, fill], { opacity: 0 }, "end+=0.6")
      .set(btn, { opacity: 1 }, "end+=0.6")
      .to(s, { m: 0, duration: 0.65, ease: "elastic.out(1,0.45)" }, "end+=0.6")
      .to(saved, { opacity: 1, duration: 0.2 }, "end+=0.75")
      .to(saved, { opacity: 0, duration: 0.18 }, "+=0.2")
      .to(label, { opacity: 1, duration: 0.18 }, "<");
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(124,240,201,.52)" g2="rgba(79,141,255,.24)">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <Eyebrow>Spring lookbook · 48 pages · 22 MB</Eyebrow>
        <h3 className="mt-4 text-center text-[clamp(40px,4.4vw,68px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
          Take the season with you
        </h3>
        <svg viewBox="0 0 800 300" className="mt-4 w-[min(80%,820px)] overflow-visible" aria-label="Download progress">
          <path className="u262-track" d={`M${U262_X0} ${U262_CY} L${U262_X1} ${U262_CY}`} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={6} strokeLinecap="round" opacity={0} />
          <path className="u262-fill" d={`M${U262_X0} ${U262_CY} L${U262_X0} ${U262_CY}`} fill="none" stroke="#7cf0c9" strokeWidth={6} strokeLinecap="round" opacity={0} />
          <g
            className="u262-bg cursor-pointer"
            onClick={() => {
              tlRef.current?.restart();
            }}
          >
            <rect className="u262-btn" x={250} y={U262_CY - 38} width={300} height={76} rx={38} fill="#7cf0c9" />
            <text className="u262-label" x={400} y={U262_CY + 7} textAnchor="middle" fill="#06140f" fontSize={21} fontWeight={700} style={{ fontFamily: F.sg }}>
              Download lookbook
            </text>
            <g className="u262-saved" opacity={0}>
              <path d={`M352 ${U262_CY} l9 9 l17 -18`} fill="none" stroke="#06140f" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
              <text x={390} y={U262_CY + 7} fill="#06140f" fontSize={21} fontWeight={700} style={{ fontFamily: F.sg }}>
                Saved
              </text>
            </g>
          </g>
          <g className="u262-arrow" transform={`translate(${U262_X0} ${U262_CY - 100})`} opacity={0}>
            <text className="u262-pct" x={0} y={-58} textAnchor="middle" fill="#eef2ff" fontSize={20} fontWeight={600} style={{ fontFamily: F.sg }}>
              0%
            </text>
            <g className="u262-arrow-in">
              <path d="M0 0 L-15 -17 H-5.5 V-40 H5.5 V-17 H15 Z" fill="#eef2ff" />
            </g>
            <path className="u262-check" d="M-13 -20 l9 9 l17 -19" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1} fill="none" stroke="#7cf0c9" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={0} />
          </g>
        </svg>
        <p className="text-[15px] text-white/55" style={{ fontFamily: F.mr }}>
          Free with any order over ₹2,500
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U263 · Placeholder cycle + vanish ───────────────────────── */
const U263_PH = ["Search linen shirts…", "Try “gifts under ₹2,000”", "Find your size in denim", "Ask about free returns"];
const U263_Q = "linen shirt under ₹2,000";
type U263P = { x: number; y: number; vx: number; vy: number; a: number; go: boolean; tint: boolean };
function U263() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const inp = useRef<HTMLInputElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const ph = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const raf = useRef(0);
  const idle = useIdle(root);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const showPh = (v: boolean) => {
    if (ph.current) ph.current.style.opacity = v ? "1" : "0";
  };

  const vanish = () => {
    const el = root.current;
    const i = inp.current;
    const c = cvs.current;
    if (!el || !i || !c || !i.value) return;
    const text = i.value;
    const r = i.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const cs = getComputedStyle(i);
    ctx.clearRect(0, 0, w, h);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.fillStyle = "#eef2ff";
    ctx.textBaseline = "middle";
    ctx.fillText(text, parseFloat(cs.paddingLeft) || 0, h / 2);
    const data = ctx.getImageData(0, 0, w, h).data;
    const pts: U263P[] = [];
    let maxX = 0;
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        if (data[(y * w + x) * 4 + 3] > 110) {
          pts.push({ x, y, vx: 0, vy: 0, a: 1, go: false, tint: Math.random() < 0.3 });
          if (x > maxX) maxX = x;
        }
      }
    }
    i.value = "";
    cancelAnimationFrame(raf.current);
    let edge = 0;
    let last = performance.now();
    const step = (now: number) => {
      if (!root.current) return;
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      edge += ((maxX + 40) * dt) / 0.45;
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of pts) {
        if (!p.go && p.x < edge) {
          p.go = true;
          p.vx = rnd(60, 280);
          p.vy = rnd(-170, 50);
        }
        if (p.go) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy -= 40 * dt;
          p.a -= dt * rnd(1.2, 2.2);
        }
        if (p.a <= 0) continue;
        alive++;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.tint ? "#7cf0c9" : "#eef2ff";
        const sz = p.go ? 1.5 + p.a : 2;
        ctx.fillRect(p.x, p.y, sz, sz);
      }
      ctx.globalAlpha = 1;
      if (alive > 0) raf.current = requestAnimationFrame(step);
      else {
        ctx.clearRect(0, 0, w, h);
        if (!inp.current?.value) showPh(true);
      }
    };
    raf.current = requestAnimationFrame(step);
  };

  usePlay(root, (el) => {
    const i = inp.current;
    const col = el.querySelector<HTMLElement>(".u263-col");
    const sub = el.querySelector<HTMLElement>(".u263-sub");
    const d = dot.current;
    if (!i || !col || !sub) return;
    const lh = () => ph.current?.clientHeight || 30;
    const type = { n: 0 };
    const tl = gsap.timeline({ repeat: -1 });
    tlRef.current = tl;
    tl.set(col, { y: 0 })
      .call(() => {
        if (!root.current) return;
        i.value = "";
        i.classList.remove("on");
        showPh(true);
        goDot(d, el, [el.clientWidth * 0.3, el.clientHeight * 0.72], 0.6, idle());
      })
      .to(col, { y: () => -lh(), duration: 0.4, ease: "power3.inOut" }, "+=0.3")
      .call(() => goDot(d, el, i, 0.6, idle()), [], "+=0.05")
      .to(col, { y: () => -2 * lh(), duration: 0.4, ease: "power3.inOut" }, "+=0.25")
      .call(() => {
        if (!root.current) return;
        if (idle()) pressDot(d);
        i.classList.add("on");
        goDot(d, el, sub, 1.3, idle());
      })
      .fromTo(
        type,
        { n: 0 },
        {
          n: U263_Q.length,
          duration: 1.1,
          ease: "none",
          onStart: () => {
            if (root.current) showPh(false);
          },
          onUpdate: () => {
            if (!root.current) return;
            i.value = U263_Q.slice(0, Math.round(type.n));
          },
        },
        "+=0.1",
      )
      .call(() => idle() && pressDot(d), [], "+=0.2")
      .to(sub, { scale: 0.88, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.inOut" }, "<")
      .call(() => {
        if (!root.current) return;
        vanish();
        i.classList.remove("on");
        goDot(d, el, [el.clientWidth * 0.74, el.clientHeight * 0.3], 0.9, idle());
      })
      .set(col, { y: () => -2 * lh() }, "+=0.95")
      .to(col, { y: () => -3 * lh(), duration: 0.4, ease: "power3.inOut" }, "+=0.15")
      .to(col, { y: () => -4 * lh(), duration: 0.4, ease: "power3.inOut" }, "+=0.25");
    return tl;
  });

  return (
    <Stage r={root} g1="rgba(124,240,201,.5)" g2="rgba(159,140,255,.26)">
      <div className="flex h-full w-full flex-col items-center justify-center px-8">
        <Eyebrow>Ask the store</Eyebrow>
        <h3 className="mt-4 text-center text-[clamp(44px,5vw,76px)] leading-[1] tracking-[-0.02em]" style={{ fontFamily: F.is }}>
          What are you looking for?
        </h3>
        <form
          className="relative mt-10 w-[min(82%,680px)]"
          onSubmit={(e) => {
            e.preventDefault();
            vanish();
          }}
        >
          <input
            ref={inp}
            className="u263-in h-[76px] w-full rounded-full border border-white/15 bg-white/[0.06] pl-8 pr-24 text-[22px] text-[#eef2ff]"
            style={{ fontFamily: F.mr, fontWeight: 500 }}
            aria-label="Search the store"
            onFocus={() => tlRef.current?.pause()}
            onBlur={() => {
              if (!inp.current?.value) tlRef.current?.restart();
            }}
            onInput={(e) => showPh(!(e.target as HTMLInputElement).value)}
          />
          <div ref={ph} className="pointer-events-none absolute left-8 top-1/2 mt-[-15px] h-[30px] overflow-hidden text-[22px] leading-[30px] text-white/45" style={{ fontFamily: F.mr }} aria-hidden>
            <div className="u263-col">
              {[...U263_PH, U263_PH[0]].map((t, k) => (
                <div key={k} className="h-[30px] whitespace-nowrap">
                  {t}
                </div>
              ))}
            </div>
          </div>
          <canvas ref={cvs} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
          <button
            type="submit"
            className="u263-sub absolute right-3 top-1/2 mt-[-27px] grid h-[54px] w-[54px] place-items-center rounded-full bg-[#7cf0c9] text-[#06140f]"
            aria-label="Search"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
        <p className="mt-6 text-[15px] text-white/50" style={{ fontFamily: F.mr }}>
          Linen from ₹1,890 · free returns in 30 days
        </p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ───────────────────────── U264 · Breakable footer ───────────────────────── */
type U264B = { el: HTMLElement; hx: number; hy: number; w: number; h: number; x: number; y: number; vx: number; vy: number; a: number; va: number; st: 0 | 1 | 2 };
const U264_LINKS = ["Shop", "Journal", "Stores", "Care guide", "Gift cards", "Returns"];
const U264_WORD = "HALDEN";
function U264() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const bodies = useRef<U264B[]>([]);
  const tweens = useRef<gsap.core.Tween[]>([]);
  const firstBreak = useRef(-1);
  const clock = useRef(0);
  const prev = useRef<{ x: number; y: number } | null>(null);

  const reset = () => {
    tweens.current.forEach((t) => t.kill());
    tweens.current = [];
    bodies.current.forEach((b) => (b.el.style.transform = ""));
    bodies.current = [];
    firstBreak.current = -1;
  };

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(() => reset());
    ro.observe(el);
    return () => {
      ro.disconnect();
      tweens.current.forEach((t) => t.kill());
      tweens.current = [];
    };
  }, []);

  const measure = (el: HTMLElement) => {
    bodies.current = [...el.querySelectorAll<HTMLElement>("[data-u264]")].map((n) => {
      const b = rel(n, el);
      const [cx, cy] = mid(b);
      return { el: n, hx: cx, hy: cy, w: b.w, h: b.h, x: cx, y: cy, vx: 0, vy: 0, a: 0, va: 0, st: 0 };
    });
  };

  const breakBody = (b: U264B, vx: number, vy: number) => {
    b.st = 1;
    b.vx = vx * 0.5 + rnd(-80, 80);
    b.vy = Math.min(vy * 0.4, 0) - rnd(160, 380);
    b.va = rnd(-5, 5) + vx * 0.004;
    if (firstBreak.current < 0) firstBreak.current = clock.current;
  };

  const reassemble = () => {
    firstBreak.current = -1;
    let k = 0;
    bodies.current.forEach((b) => {
      if (b.st !== 1) return;
      b.st = 2;
      const ta = Math.round(b.a / (Math.PI * 2)) * Math.PI * 2;
      const tw = gsap.to(b, {
        x: b.hx,
        y: b.hy,
        a: ta,
        duration: 0.7,
        delay: k++ * 0.03,
        ease: "power3.inOut",
        onComplete: () => {
          if (!root.current) return;
          b.st = 0;
          b.a = 0;
          b.vx = b.vy = b.va = 0;
        },
      });
      tweens.current.push(tw);
    });
  };

  usePointer(
    root,
    dot,
    (t, el) => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const om = (Math.PI * 2) / 3.4;
      return { x: W * (0.5 + 0.4 * Math.sin(om * t)), y: H * (0.46 + 0.26 * Math.sin(2 * om * t)), inside: true };
    },
    (p, el, _fake, dt) => {
      if (!bodies.current.length) {
        measure(el);
        prev.current = null;
      }
      clock.current += dt;
      const W = el.clientWidth;
      const H = el.clientHeight;
      const pv = prev.current;
      const vx = pv && dt > 0 ? (p.x - pv.x) / dt : 0;
      const vy = pv && dt > 0 ? (p.y - pv.y) / dt : 0;
      prev.current = { x: p.x, y: p.y };
      const speed = Math.hypot(vx, vy);
      const bs = bodies.current;
      // hard hits break pieces loose
      if (p.inside && speed > 480) {
        for (const b of bs) {
          if (b.st === 0 && inBox({ l: b.hx - b.w / 2, t: b.hy - b.h / 2, w: b.w, h: b.h }, p.x, p.y, 6)) breakBody(b, vx, vy);
        }
      }
      // physics for loose pieces
      for (const b of bs) {
        if (b.st !== 1) continue;
        b.vy += 1900 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.a += b.va * dt;
        const c = Math.abs(Math.cos(b.a));
        const s = Math.abs(Math.sin(b.a));
        const he = (c * b.h + s * b.w) / 2;
        const hw = (c * b.w + s * b.h) / 2;
        if (b.y + he > H) {
          b.y = H - he;
          b.vy = Math.abs(b.vy) < 60 ? 0 : -b.vy * 0.3;
          b.vx *= 0.86;
          b.va *= 0.7;
          const flat = Math.round(b.a / Math.PI) * Math.PI;
          b.a += (flat - b.a) * Math.min(1, 9 * dt);
        }
        if (b.x - hw < 0) {
          b.x = hw;
          b.vx = Math.abs(b.vx) * 0.5;
        } else if (b.x + hw > W) {
          b.x = W - hw;
          b.vx = -Math.abs(b.vx) * 0.5;
        }
      }
      // loose pieces pile on each other (rotated bounding boxes)
      for (let i = 0; i < bs.length; i++) {
        const A = bs[i];
        if (A.st !== 1) continue;
        for (let j = i + 1; j < bs.length; j++) {
          const B = bs[j];
          if (B.st !== 1) continue;
          const ahw = (Math.abs(Math.cos(A.a)) * A.w + Math.abs(Math.sin(A.a)) * A.h) / 2;
          const ahe = (Math.abs(Math.cos(A.a)) * A.h + Math.abs(Math.sin(A.a)) * A.w) / 2;
          const bhw = (Math.abs(Math.cos(B.a)) * B.w + Math.abs(Math.sin(B.a)) * B.h) / 2;
          const bhe = (Math.abs(Math.cos(B.a)) * B.h + Math.abs(Math.sin(B.a)) * B.w) / 2;
          const ox = ahw + bhw - Math.abs(A.x - B.x);
          const oy = ahe + bhe - Math.abs(A.y - B.y);
          if (ox <= 0 || oy <= 0) continue;
          if (oy < ox) {
            const top = A.y < B.y ? A : B;
            const bot = top === A ? B : A;
            top.y -= oy * 0.8;
            bot.y += oy * 0.2;
            if (top.vy > 0) top.vy = 0;
            top.vx *= 0.9;
            top.va *= 0.8;
          } else {
            const l = A.x < B.x ? A : B;
            const r = l === A ? B : A;
            l.x -= ox / 2;
            r.x += ox / 2;
            const avg = (l.vx + r.vx) / 2;
            l.vx = avg - 20;
            r.vx = avg + 20;
          }
        }
      }
      // write transforms
      for (const b of bs) {
        if (b.st === 0) {
          if (b.el.style.transform) b.el.style.transform = "";
          continue;
        }
        b.el.style.transform = `translate3d(${(b.x - b.hx).toFixed(1)}px,${(b.y - b.hy).toFixed(1)}px,0) rotate(${b.a.toFixed(3)}rad)`;
      }
      // rebuild the footer a few seconds after it started breaking
      if (firstBreak.current >= 0 && clock.current - firstBreak.current > 2.6) reassemble();
    },
  );

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    for (const b of bodies.current) {
      if (b.st === 0 && inBox({ l: b.hx - b.w / 2, t: b.hy - b.h / 2, w: b.w, h: b.h }, x, y, 4)) breakBody(b, rnd(-300, 300), -200);
    }
  };

  return (
    <Stage r={root} g1="rgba(255,176,87,.52)" g2="rgba(79,141,255,.24)">
      <div className="flex h-full w-full cursor-crosshair select-none flex-col justify-center px-[6%]" onPointerDown={onDown}>
        <div className="flex items-end justify-between gap-8">
          <div>
            <p data-u264 className="u264-p text-[13px] uppercase tracking-[0.22em] text-white/55" style={{ fontFamily: F.sg }}>
              Footer · swipe hard to break it
            </p>
            <h4 className="mt-3 text-[clamp(30px,3vw,46px)] leading-[1]" style={{ fontFamily: F.fr, fontWeight: 500 }}>
              <span data-u264 className="u264-p mr-[0.28em]">Made</span>
              <span data-u264 className="u264-p mr-[0.28em]">slowly,</span>
              <span data-u264 className="u264-p mr-[0.28em]">worn</span>
              <span data-u264 className="u264-p">daily.</span>
            </h4>
          </div>
          <span data-u264 className="u264-p rounded-full bg-[#ffb057] px-6 py-3.5 text-[16px] font-[700] text-[#1a1105]" style={{ fontFamily: F.sg }}>
            Join the list →
          </span>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {U264_LINKS.map((l) => (
            <span key={l} data-u264 className="u264-p rounded-full border border-white/20 bg-white/[0.05] px-5 py-2.5 text-[16px] text-white/85" style={{ fontFamily: F.mr, fontWeight: 600 }}>
              {l}
            </span>
          ))}
        </div>
        <div className="mt-6 flex justify-between text-[min(10.5vw,150px)] leading-[0.92] tracking-[-0.02em]" style={{ fontFamily: F.sy, fontWeight: 800 }} aria-label={U264_WORD}>
          {U264_WORD.split("").map((ch, k) => (
            <span key={k} data-u264 className="u264-p" aria-hidden>
              {ch}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between text-[13px] text-white/50" style={{ fontFamily: F.mr }}>
          <span data-u264 className="u264-p">© 2026 Halden Studio · concept website</span>
          <span data-u264 className="u264-p">Linen tees from ₹1,490</span>
        </div>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "U262", name: "Elastic progress bar", how: "A fake pointer presses the button; it stretches into a line that bends elastically under a falling arrow, fills with a counter, and springs back to a saved check. Loops.", kind: "play", C: U262 },
  { code: "U263", name: "Placeholder cycle + vanish", how: "Placeholder phrases slide up through the search field; a fake pointer types a query and submits, and the text breaks into canvas particles that blow away. Loops.", kind: "play", C: U263 },
  { code: "U264", name: "Breakable footer", how: "A fake pointer sweeps a fast figure-eight over the footer; pieces it hits hard break loose, fall and pile up with physics, then fly back into place. Click works too.", kind: "play", C: U264 },
];
