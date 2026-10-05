"use client";

// Loader motions, batch 17 · group 5 (MOTION-MENU I59–I60). Small focused demos for /lab/motion.
// Every loader is contained inside its demo frame (never fixed to the viewport) and loops its whole sequence:
// cover in → loading move → short hold (≤ 0.3 s) → reveal the little page underneath → short hold → restart.
// It plays only while on screen, a CSS-only glow loop never stops (a second one sits ON TOP of the cover), and
// ?static=1 / reduced motion shows the revealed page (every loader cover starts hidden in the markup).
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { scene } from "@/components/fx/shared";
import type { MotionDef } from "./types";

const F = { sg: "Space Grotesk Variable", fr: "Fraunces Variable", is: "Instrument Serif", sy: "Syne Variable", mr: "Manrope Variable" };

const CSS = `
.b17g5l-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(122,162,255,.5)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,140,105,.22)),transparent 70%);animation:b17g5l-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b17g5l-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b17g5l-hide{visibility:hidden}
.i59-well{background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:34px 34px}
.i59-c{position:absolute;width:34px;height:34px;padding:2px}
.i59-c>i{display:block;width:100%;height:100%;border-radius:6px;background:var(--c);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),inset 0 3px 0 rgba(255,255,255,.35)}
html.is-static .b17g5l-glow{animation:none}
html.is-static {.b17g5l-glow{animation:none}}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop + a second glow ON TOP (the loader covers hide the first). */
function Stage({ r, children, g1, g2, top = 0.5 }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string; top?: number }) {
  return (
    <div ref={r} className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0c14] text-[#eef1fb]">
      <style href="b17g5l-css" precedence="default">
        {CSS}
      </style>
      <div className="b17g5l-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
      <div className="b17g5l-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: top, zIndex: 60 } as CSSProperties} aria-hidden />
    </div>
  );
}

/** "play" helper: waits for fonts, builds the looping timeline in a gsap.context, plays it only while on screen. */
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
    };
  }, [ref]);
}

const all = (root: Element, sel: string) => [...root.querySelectorAll<HTMLElement>(sel)];
const one = (root: Element, sel: string) => root.querySelector<HTMLElement>(sel)!;
const hold = (tl: gsap.core.Timeline, d = 0.2) => tl.to({}, { duration: d });

/** Adds a 0→100 counter to the timeline, written into every `els`. */
function count(tl: gsap.core.Timeline, els: Element[], duration: number, at?: gsap.Position, ease = "power1.inOut") {
  const o = { v: 0 };
  tl.fromTo(
    o,
    { v: 0 },
    {
      v: 100,
      duration,
      ease,
      onUpdate: () => {
        const s = String(Math.round(o.v)).padStart(3, "0");
        els.forEach((e) => (e.textContent = s));
      },
    },
    at,
  );
}

// eslint-disable-next-line @next/next/no-img-element
const Img = ({ i, className = "", w = 900, h = 760 }: { i: number; className?: string; w?: number; h?: number }) => (
  <img src={scene(i, w, h)} alt="" className={`block h-full w-full object-cover ${className}`} draggable={false} />
);

type PageP = { brand: string; links: string[]; kicker: string; title: [string, string]; price: string; i: number; acc: string; font: string; weight?: number };

/** The little page every loader reveals: nav, kicker, two-line title, CTA + price, one image card. */
function Page({ p, c }: { p: PageP; c: string }) {
  return (
    <div className={`${c} absolute inset-0 bg-[#0a0c14] px-[4%] py-[3.5%]`}>
      <div className="flex items-center justify-between text-[13px] text-white/75">
        <span className="text-[16px] font-[700] tracking-[-0.01em] text-white" style={{ fontFamily: F.sg }}>
          {p.brand}
        </span>
        <span className="flex gap-6">
          {p.links.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </span>
      </div>
      <div className="mt-[4%] grid h-[78%] grid-cols-[1.1fr_1fr] gap-[5%]">
        <div className="flex flex-col justify-center">
          <p className="text-[13px] font-[600] uppercase tracking-[0.22em]" style={{ fontFamily: F.mr, color: p.acc }}>
            {p.kicker}
          </p>
          <h3 className="mt-4 text-[clamp(40px,4.6vw,74px)] leading-[0.98] tracking-[-0.02em]" style={{ fontFamily: p.font, fontWeight: p.weight ?? 500 }}>
            {p.title[0]}
            <br />
            {p.title[1]}
          </h3>
          <div className="mt-7 flex items-center gap-5">
            <span className="rounded-full px-6 py-3 text-[14px] font-[600] text-[#0b0d14]" style={{ background: p.acc, fontFamily: F.mr }}>
              Shop the drop
            </span>
            <span className="text-[15px] text-white/70" style={{ fontFamily: F.sg }}>
              {p.price}
            </span>
          </div>
        </div>
        <div className="overflow-hidden rounded-[18px] border border-white/10">
          <Img i={p.i} />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── I59 · Tetris stack ───────────────────────── */
const I59_P: PageP = { brand: "Blockhaus Toys", links: ["Sets", "Ages", "Gifts"], kicker: "Wooden sets · ages 4+", title: ["Build it,", "stack it"], price: "from ₹ 1,890", i: 3, acc: "#ffd166", font: F.sy, weight: 700 };
const I59_CELL = 34;
const I59_COLS = 8;
const I59_ROWS = 9;
// [col, row] with row 0 at the bottom. Rows 0–3 fill completely and clear; four cells on row 4 drop down after.
const I59_PIECES: { c: string; cells: [number, number][] }[] = [
  { c: "#7ad7ff", cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  { c: "#ff7a8a", cells: [[4, 0], [5, 0], [6, 0], [7, 0]] },
  { c: "#ffd166", cells: [[0, 1], [1, 1], [2, 1], [0, 2]] },
  { c: "#b8f36b", cells: [[3, 1], [3, 2], [2, 2], [1, 2]] },
  { c: "#c79bff", cells: [[4, 1], [5, 1], [4, 2], [5, 2]] },
  { c: "#ffa36b", cells: [[6, 1], [7, 1], [6, 2], [7, 2]] },
  { c: "#7ad7ff", cells: [[0, 3], [1, 3], [2, 3], [1, 4]] },
  { c: "#ff7a8a", cells: [[3, 3], [4, 3], [5, 3], [6, 3]] },
  { c: "#ffd166", cells: [[7, 3], [7, 4], [6, 4], [5, 4]] },
];
function I59() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const cover = one(el, ".i59-cover");
    const pieces = all(el, ".i59-p");
    const clear = all(el, ".i59-c[data-r='0'],.i59-c[data-r='1'],.i59-c[data-r='2'],.i59-c[data-r='3']");
    const tops = all(el, ".i59-c[data-r='4']");
    const page = one(el, ".i59-page");
    const flash = one(el, ".i59-flash");
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(cover, { autoAlpha: 0, yPercent: 0 });
    tl.set(pieces, { y: -(I59_ROWS * I59_CELL + 90), autoAlpha: 0 });
    tl.set(flash, { opacity: 0 });
    tl.to(cover, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
    const t0 = tl.duration();
    pieces.forEach((p, k) => {
      const at = t0 + k * 0.26;
      tl.set(p, { autoAlpha: 1 }, at);
      tl.to(p, { y: 0, duration: 0.36, ease: "power2.in" }, at);
      tl.fromTo(p, { rotation: k % 3 === 1 ? 90 : 0, x: (k % 2 ? 1 : -1) * I59_CELL }, { rotation: 0, x: 0, duration: 0.24, ease: "power1.out" }, at);
      tl.to(p, { scaleY: 0.9, duration: 0.06, yoyo: true, repeat: 1, transformOrigin: "50% 100%", ease: "sine.out" }, at + 0.36);
    });
    const fall = pieces.length * 0.26 + 0.24;
    count(tl, all(el, ".i59-n"), fall, t0);
    // four full rows: flash, clear from the middle out, leftovers drop four rows
    tl.to(flash, { opacity: 0.9, duration: 0.08, yoyo: true, repeat: 1 });
    tl.to(clear, { scaleX: 0, duration: 0.24, ease: "power2.in", stagger: { each: 0.008, from: "center" } }, "<0.08");
    tl.to(tops, { y: 4 * I59_CELL, duration: 0.3, ease: "power2.in" }, ">-0.05");
    tl.to(tops, { scaleY: 0.86, duration: 0.06, yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, ">");
    hold(tl, 0.08);
    tl.to(cover, { yPercent: -100, duration: 0.7, ease: "power2.inOut" });
    tl.fromTo(page, { y: 50, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" }, "<0.15");
    hold(tl, 0.25);
    return tl;
  });
  const W = I59_COLS * I59_CELL;
  const H = I59_ROWS * I59_CELL;
  return (
    <Stage r={root} g1="rgba(255,209,102,.5)" g2="rgba(122,215,255,.22)">
      <Page p={I59_P} c="i59-page" />
      <div className="i59-cover b17g5l-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0c0d12]">
        <div className="i59-well relative overflow-hidden rounded-[10px] border border-white/15 bg-white/[0.02]" style={{ width: W, height: H }}>
          {I59_PIECES.map((p, k) => {
            const minC = Math.min(...p.cells.map((c) => c[0]));
            const maxC = Math.max(...p.cells.map((c) => c[0]));
            const minR = Math.min(...p.cells.map((c) => c[1]));
            const maxR = Math.max(...p.cells.map((c) => c[1]));
            return (
              <div
                key={k}
                className="i59-p absolute"
                style={{ left: minC * I59_CELL, bottom: minR * I59_CELL, width: (maxC - minC + 1) * I59_CELL, height: (maxR - minR + 1) * I59_CELL, "--c": p.c } as CSSProperties}
              >
                {p.cells.map(([c, r]) => (
                  <span key={`${c}-${r}`} data-r={r} className="i59-c" style={{ left: (c - minC) * I59_CELL, bottom: (r - minR) * I59_CELL }}>
                    <i />
                  </span>
                ))}
              </div>
            );
          })}
          <div className="i59-flash pointer-events-none absolute inset-x-0 bottom-0 bg-white" style={{ height: 4 * I59_CELL, opacity: 0 }} />
        </div>
        <p className="mt-8 text-[13px] uppercase tracking-[0.3em] text-white/55" style={{ fontFamily: F.mr }}>
          Stacking the shelves · <span className="i59-n tabular-nums text-white">100</span>
        </p>
      </div>
    </Stage>
  );
}

/* ───────────────────────── I60 · Weaving threads ───────────────────────── */
const I60_P: PageP = { brand: "Loom & Lantern", links: ["Throws", "Rugs", "Makers"], kicker: "Handwoven · small batch", title: ["Threads with", "a memory"], price: "Throws from ₹ 4,600", i: 1, acc: "#f4b6ff", font: F.is, weight: 400 };
const I60_COL = ["#f4b6ff", "#9fd8ff", "#ffd59a", "#b8f36b"];
/** A closed ring whose radius waves three times around, rotated per thread, so the four threads cross over and under. */
function i60Path(k: number) {
  const rot = (k * Math.PI) / 4;
  const pts: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const t = (i / 160) * Math.PI * 2;
    const r = 1 + 0.24 * Math.sin(3 * t + k * 1.3);
    const x = Math.cos(t) * 150 * r;
    const y = Math.sin(t) * 72 * r;
    pts.push(`${(200 + x * Math.cos(rot) - y * Math.sin(rot)).toFixed(1)} ${(200 + x * Math.sin(rot) + y * Math.cos(rot)).toFixed(1)}`);
  }
  return `M${pts.join(" L")}Z`;
}
const I60_D = I60_COL.map((_, k) => i60Path(k));
function I60() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const cover = one(el, ".i60-cover");
    const grp = one(el, ".i60-g");
    const dashes = all(el, ".i60-dash");
    const glows = all(el, ".i60-glow");
    const node = one(el, ".i60-node");
    const ring = one(el, ".i60-ring");
    const page = one(el, ".i60-page");
    const lab = one(el, ".i60-lab");
    const tl = gsap.timeline({ repeat: -1 });
    tl.set(cover, { autoAlpha: 1 });
    tl.set(page, { clipPath: "circle(0% at 50% 50%)" });
    tl.set(grp, { scale: 0.4, rotation: 0, opacity: 0, svgOrigin: "200 200" });
    tl.set([...dashes, ...glows], { strokeDashoffset: 0 });
    tl.set(node, { scale: 0, svgOrigin: "200 200" });
    tl.set(ring, { scale: 1, opacity: 0, svgOrigin: "200 200" });
    tl.set(lab, { opacity: 1 });
    tl.to(grp, { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" });
    tl.to(node, { scale: 1, duration: 0.4, ease: "back.out(2)" }, "<");
    const T = 2.4;
    const t0 = tl.duration() - 0.3;
    dashes.forEach((d, k) => {
      const end = -100 * (1 + k * 0.25) * (k % 2 ? -1 : 1);
      tl.to([d, glows[k]], { strokeDashoffset: end, duration: T + 0.3, ease: "none" }, t0);
    });
    tl.to(grp, { rotation: 100, duration: T + 0.3, ease: "none" }, t0);
    tl.to(node, { scale: 1.3, duration: 0.3, yoyo: true, repeat: 7, ease: "sine.inOut" }, t0 + 0.1);
    for (let k = 0; k < 4; k++) tl.fromTo(ring, { scale: 1, opacity: 0.7 }, { scale: 2.6, opacity: 0, duration: 0.6, ease: "power1.out", immediateRender: false }, t0 + 0.1 + k * 0.6);
    count(tl, all(el, ".i60-n"), T, t0 + 0.2);
    // threads pull tight into the node, then the page opens out of it
    tl.to(grp, { scale: 0, rotation: "+=90", duration: 0.45, ease: "power3.in" });
    tl.to(node, { scale: 1.7, duration: 0.45, ease: "power2.in" }, "<");
    tl.to(lab, { opacity: 0, duration: 0.2 }, "<");
    tl.to(page, { clipPath: "circle(80% at 50% 50%)", duration: 0.85, ease: "power2.inOut" }, ">-0.08");
    tl.set(cover, { autoAlpha: 0 });
    hold(tl, 0.25);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(244,182,255,.5)" g2="rgba(159,216,255,.22)">
      <div className="i60-cover b17g5l-hide absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0b0a12]">
        <svg viewBox="0 0 400 400" className="h-[min(62%,420px)] w-auto overflow-visible" aria-hidden>
          <g className="i60-g">
            {I60_D.map((d, k) => (
              <path key={`b${k}`} d={d} fill="none" stroke={I60_COL[k]} strokeOpacity={0.16} strokeWidth={1.4} />
            ))}
            {I60_D.map((d, k) => (
              <path key={`g${k}`} className="i60-glow" d={d} pathLength={100} fill="none" stroke={I60_COL[k]} strokeOpacity={0.14} strokeWidth={9} strokeLinecap="round" strokeDasharray="32 68" />
            ))}
            {I60_D.map((d, k) => (
              <path key={`d${k}`} className="i60-dash" d={d} pathLength={100} fill="none" stroke={I60_COL[k]} strokeWidth={2.6} strokeLinecap="round" strokeDasharray="32 68" />
            ))}
          </g>
          <circle className="i60-ring" cx={200} cy={200} r={20} fill="none" stroke="#f4b6ff" strokeWidth={2} opacity={0} />
          <circle className="i60-node" cx={200} cy={200} r={17} fill="#fbe6ff" />
          <circle cx={200} cy={200} r={7} fill="#0b0a12" opacity={0.35} />
        </svg>
        <p className="i60-lab mt-6 text-[13px] uppercase tracking-[0.3em] text-white/55" style={{ fontFamily: F.mr }}>
          Setting the warp · <span className="i60-n tabular-nums text-white">100</span>
        </p>
      </div>
      <div className="relative z-20 h-full w-full">
        <Page p={I60_P} c="i60-page" />
      </div>
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "I59", name: "Tetris stack", how: "Coloured blocks fall, turn and stack in a well; four full rows flash and clear, then the cover lifts to the page. Loops on screen.", kind: "play", C: I59 },
  { code: "I60", name: "Weaving threads", how: "Four glowing threads weave over and under around a pulsing node, then pull into it and the page opens out of the centre. Loops on screen.", kind: "play", C: I60 },
];
