"use client";

// Ambient motions, batch 17 · group 2 (MOTION-MENU M788–M794): a shape-shifting block inside a headline, a screensaver
// badge bouncing off the edges, a hand-drawn sea chart that wobbles under falling snow, a scroll-velocity spiral shader,
// a scroll digit stream, an aurora area chart and a paint-brush cursor. Small focused demos for /lab/motion.
// "play" demos start on screen, loop and pause off screen; "scrub" demos map the panel's scroll linearly and keep a time
// loop running so the stage never stops. Each stage has a CSS-only glow loop that never stops, plus a second one ON TOP
// of full-bleed canvases. The brush demo drives a visible fake pointer ring by itself; the real mouse takes over while it
// moves. WebGL builds only within ~1 screen of the viewport, runs at dpr 1 and is released on unmount.
// ?static=1 / reduced motion: no JS motion, CSS loops stop, the markup shows a sensible final state.
import { useEffect, useId, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
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

const CSS = `
.b17a2-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b17a2-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b17a2-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b17a2-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);pointer-events:none;z-index:45;opacity:0;transition:opacity .25s}

/* M788 shape-shifter box */
.m788-box{display:inline-block;vertical-align:middle;position:relative;overflow:hidden;width:1.4em;height:.62em;border-radius:.18em;background-color:#ffcf4a;margin:0 .2em}
.m788-shine{position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.38) 50%,transparent 70%);background-size:260% 100%;animation:m788-shine 2.4s linear infinite}
@keyframes m788-shine{0%{background-position:120% 0}100%{background-position:-120% 0}}

/* M789 screensaver badge */
.m789-badge{transition:background-color .3s ease,box-shadow .3s ease}

/* M790 sea chart */
.m790-route{stroke-dasharray:3 12;animation:m790-march 1.4s linear infinite}
@keyframes m790-march{to{stroke-dashoffset:-30}}

html.is-static .b17a2-glow,html.is-static .m788-shine,html.is-static .m790-route{animation:none}
html.is-static {
  .b17a2-glow,.m788-shine,.m790-route{animation:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop (never frozen). */
function Stage({ r, children, className = "", g1, g2, style }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; className?: string; g1?: string; g2?: string; style?: CSSProperties }) {
  return (
    <div ref={r} className={`relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff] ${className}`} style={style}>
      <style href="b17a2-css" precedence="default">
        {CSS}
      </style>
      <div className="b17a2-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

/** The CSS glow loop again, ON TOP of full-bleed canvases (screen blend), so those demos never freeze. */
const Sheen = ({ g1, opacity = 0.45 }: { g1?: string; opacity?: number }) => (
  <div className="b17a2-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity, zIndex: 35 } as CSSProperties} aria-hidden />
);

/** The visible fake pointer ring. */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => <div ref={r} className="b17a2-dot" aria-hidden />;

/** Brand copy block in a corner (kept small so the motion owns the stage). */
function Copy({ eyebrow, title, line, font = F.sg, className = "left-10 top-10", tone = "text-white" }: { eyebrow: string; title: string; line: string; font?: string; className?: string; tone?: string }) {
  return (
    <div className={`pointer-events-none absolute z-40 max-w-[420px] ${tone} ${className}`}>
      <p className="text-[13px] uppercase tracking-[0.3em] opacity-70">{eyebrow}</p>
      <h3 className="mt-3 text-[clamp(40px,4.4vw,72px)] font-[650] leading-[0.92] tracking-[-0.035em]" style={{ fontFamily: font }}>
        {title}
      </h3>
      <p className="mt-4 text-[15px] opacity-75">{line}</p>
    </div>
  );
}

/** GSAP loops: `build` runs once inside a gsap.context; the returned animations play only while the stage is on screen. */
function useAnims(root: RefObject<HTMLDivElement | null>, build: (el: HTMLDivElement) => gsap.core.Animation[] | void) {
  const b = useRef(build);
  b.current = build;
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let anims: gsap.core.Animation[] = [];
    const ctx = gsap.context(() => {
      anims = b.current(el) || [];
      anims.forEach((a) => a.pause());
    }, el);
    const io = new IntersectionObserver(([e]) => anims.forEach((a) => (e.isIntersecting ? a.resume() : a.pause())), { threshold: 0.05 });
    io.observe(el);
    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [root]);
}

/**
 * Pointer for "pointer" demos: every frame (on screen) it reports a position in root px. The real mouse wins for 2 s after
 * it last moved; otherwise `script(t, w, h)` drives the visible fake ring along a set path.
 */
function usePointer(
  root: RefObject<HTMLDivElement | null>,
  dot: RefObject<HTMLDivElement | null>,
  script: (t: number, w: number, h: number) => [number, number],
  frame: (x: number, y: number, dt: number, t: number, live: boolean) => void,
) {
  const real = useRef({ x: 0, y: 0, at: -1e9 });
  const sc = useRef(script);
  sc.current = script;
  const fr = useRef(frame);
  fr.current = frame;
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      real.current = { x: e.clientX - r.left, y: e.clientY - r.top, at: performance.now() };
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, [root]);
  useTicker(root, (t, dt) => {
    const el = root.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const live = performance.now() - real.current.at < 2000;
    const [x, y] = live ? [real.current.x, real.current.y] : sc.current(t, w, h);
    if (dot.current) {
      dot.current.style.opacity = live ? "0" : "1";
      dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
    }
    fr.current(x, y, Math.min(dt, 0.05), t, live);
  });
}

/** Runs `fn` once the element is within ~1 screen of the viewport (no textures / GL contexts at page load). */
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

type U = Record<string, { value: unknown }>;

/** Full-bleed fragment shader (OGL via lib/gl, dpr 1). Built only near the viewport; draws only while on screen. */
function Shader({ frag, fallback, uniforms, onFrame }: { frag: string; fallback: string; uniforms?: () => U; onFrame?: (u: U, t: number) => void }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const of = useRef(onFrame);
  of.current = onFrame;
  const un = useRef(uniforms);
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let dead = false;
    let h: GLHandle | null = null;
    const stop = whenNear(c, async () => {
      h = await createShader(c, frag, { dpr: 1, uniforms: un.current?.(), onFrame: (u, t) => of.current?.(u, t) });
      if (dead) h?.destroy();
    });
    return () => {
      dead = true;
      stop();
      h?.destroy();
    };
  }, [frag]);
  return (
    <div className="absolute inset-0" style={{ background: fallback }}>
      <canvas ref={cv} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500" aria-hidden />
    </div>
  );
}

/** A 2D canvas sized to its parent at dpr 1, created only near the viewport and released on unmount. */
function useCanvas2D(cv: RefObject<HTMLCanvasElement | null>, onResize?: (w: number, h: number) => void) {
  const s = useRef<{ ctx: CanvasRenderingContext2D | null; w: number; h: number }>({ ctx: null, w: 0, h: 0 });
  const rs = useRef(onResize);
  rs.current = onResize;
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let ro: ResizeObserver | null = null;
    const stop = whenNear(c, () => {
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const box = c.parentElement ?? c;
      const fit = () => {
        const r = box.getBoundingClientRect();
        const w = Math.max(1, Math.round(r.width));
        const h = Math.max(1, Math.round(r.height));
        if (w === s.current.w && h === s.current.h) return;
        c.width = w;
        c.height = h;
        s.current = { ctx, w, h };
        rs.current?.(w, h);
      };
      fit();
      ro = new ResizeObserver(fit);
      ro.observe(box);
    });
    return () => {
      stop();
      ro?.disconnect();
      s.current = { ctx: null, w: 0, h: 0 };
      c.width = 1;
      c.height = 1;
    };
  }, [cv]);
  return s;
}

/* ---------- M788 · Shape-shifter box (variant of M53: a solid block between words morphs size and pushes the text) ---------- */
const M788_SHAPES = [
  { width: "3.1em", height: ".74em", borderRadius: ".37em", backgroundColor: "#ff6a3d" },
  { width: ".72em", height: ".72em", borderRadius: ".1em", backgroundColor: "#8b7bff" },
  { width: "2.3em", height: ".42em", borderRadius: ".05em", backgroundColor: "#26c6a2" },
  { width: "1.4em", height: ".62em", borderRadius: ".18em", backgroundColor: "#ffcf4a" },
];
function M788() {
  const root = useRef<HTMLDivElement>(null);
  useAnims(root, (el) => {
    const box = el.querySelector(".m788-box");
    const tl = gsap.timeline({ repeat: -1 });
    M788_SHAPES.forEach((s) => tl.to(box, { ...s, duration: 0.72, ease: "power3.inOut" }));
    return [tl];
  });
  return (
    <Stage r={root} className="bg-[#0d0c10]" g1="rgba(255,140,90,.5)" g2="rgba(139,123,255,.24)">
      <div className="absolute inset-0 grid place-items-center px-[7%]">
        <div className="w-full text-center">
          <p className="text-[13px] uppercase tracking-[0.32em] text-white/60" style={{ fontFamily: F.mr }}>
            Fieldnote Studio · Brand systems
          </p>
          <h3 className="mx-auto mt-6 max-w-[15ch] text-[clamp(52px,6.4vw,108px)] leading-[1.02] tracking-[-0.03em]" style={{ fontFamily: F.is }}>
            Good design
            <span className="m788-box" aria-hidden>
              <span className="m788-shine" />
            </span>
            moves people, not pixels.
          </h3>
          <p className="mt-7 text-[15px] text-white/65" style={{ fontFamily: F.mr }}>
            Identity sprint, four weeks · from ₹ 2,40,000
          </p>
        </div>
      </div>
    </Stage>
  );
}

/* ---------- M789 · Screensaver bounce (a badge travels in straight lines, bounces off the edges, changes tint per hit) ---------- */
const M789_TINTS = ["#ff5d8f", "#4f8dff", "#22c69b", "#ffb238", "#a77bff", "#ff6a3d"];
function M789() {
  const root = useRef<HTMLDivElement>(null);
  const obj = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const st = useRef({ x: 0, y: 0, vx: 270, vy: 190, c: 0, init: false });
  useTicker(root, (_t, dt0) => {
    const el = root.current;
    const o = obj.current;
    if (!el || !o) return;
    const dt = Math.min(dt0, 0.05);
    const s = st.current;
    const W = el.clientWidth;
    const H = el.clientHeight;
    const ow = o.offsetWidth;
    const oh = o.offsetHeight;
    if (!s.init) {
      s.init = true;
      s.x = o.offsetLeft;
      s.y = o.offsetTop;
      o.style.left = "0px";
      o.style.top = "0px";
    }
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    let hits = 0;
    if (s.x < 0) (s.x = 0), (s.vx = Math.abs(s.vx)), hits++;
    if (s.x > W - ow) (s.x = W - ow), (s.vx = -Math.abs(s.vx)), hits++;
    if (s.y < 0) (s.y = 0), (s.vy = Math.abs(s.vy)), hits++;
    if (s.y > H - oh) (s.y = H - oh), (s.vy = -Math.abs(s.vy)), hits++;
    if (hits) {
      s.c = (s.c + 1) % M789_TINTS.length;
      const tint = M789_TINTS[s.c];
      o.style.backgroundColor = tint;
      o.style.boxShadow = `0 18px 60px -12px ${tint}`;
      if (ring.current) gsap.fromTo(ring.current, { opacity: 0.9, scale: 1 }, { opacity: 0, scale: hits > 1 ? 1.9 : 1.35, duration: 0.55, ease: "power2.out", overwrite: true });
    }
    o.style.transform = `translate3d(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px,0)`;
  });
  return (
    <Stage r={root} className="bg-[#07080d]" g1="rgba(79,141,255,.5)" g2="rgba(255,93,143,.24)">
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <p className="text-[clamp(60px,8vw,132px)] font-[800] uppercase leading-none tracking-[-0.04em] text-white/[0.06]" style={{ fontFamily: F.sy }}>
          Still on air
        </p>
      </div>
      <div ref={obj} className="m789-badge absolute z-20 rounded-[999px] px-8 py-5 text-[#0a0b10]" style={{ left: "38%", top: "40%", backgroundColor: M789_TINTS[0], boxShadow: `0 18px 60px -12px ${M789_TINTS[0]}` }}>
        <div ref={ring} className="pointer-events-none absolute inset-0 rounded-[999px] border-2 border-white opacity-0" aria-hidden />
        <p className="text-[13px] font-[700] uppercase tracking-[0.24em]" style={{ fontFamily: F.mr }}>
          Nightowl Radio
        </p>
        <p className="text-[30px] font-[700] leading-none tracking-[-0.02em]" style={{ fontFamily: F.sg }}>
          Live till 4 am
        </p>
      </div>
      <p className="absolute bottom-8 left-10 z-10 text-[14px] text-white/55" style={{ fontFamily: F.mr }}>
        Late-night sessions · membership ₹ 199 / month
      </p>
    </Stage>
  );
}

/* ---------- M790 · Hand-drawn map with snowfall (an inked sea chart wobbles through SVG displacement while snow falls) ---------- */
function blob(cx: number, cy: number, R: number, seed: number, sx = 1, sy = 0.72) {
  let d = "";
  const n = 84;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = R * (1 + 0.17 * Math.sin(3 * a + seed) + 0.09 * Math.sin(7 * a + seed * 2.3) + 0.045 * Math.sin(13 * a + seed * 0.7));
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * r * sx).toFixed(1)} ${(cy + Math.sin(a) * r * sy).toFixed(1)}`;
  }
  return d + "Z";
}
const M790_ISLES = [
  { cx: 330, cy: 300, R: 150, seed: 1.2, name: "Ivory Reach" },
  { cx: 820, cy: 440, R: 185, seed: 2.7, name: "Kestrel Isle" },
  { cx: 990, cy: 150, R: 70, seed: 4.1, name: "Gull Rock" },
];
const M790_PATHS = M790_ISLES.map((s) => ({
  coast: blob(s.cx, s.cy, s.R, s.seed),
  inner: blob(s.cx, s.cy, s.R * 0.74, s.seed + 0.4),
  core: blob(s.cx, s.cy, s.R * 0.46, s.seed + 0.9),
  shelf: blob(s.cx, s.cy, s.R * 1.2, s.seed - 0.3),
}));
type Flake = { x: number; y: number; r: number; vy: number; ph: number; sw: number };
function M790() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const fid = `m790f${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const flakes = useRef<Flake[]>([]);
  const cs = useCanvas2D(cv, (w, h) => {
    flakes.current = Array.from({ length: 210 }, () => {
      const z = Math.random();
      return { x: Math.random() * w, y: Math.random() * h, r: 0.8 + z * 2.6, vy: 22 + z * 60, ph: Math.random() * 6.28, sw: 8 + z * 22 };
    });
  });
  useAnims(root, (el) => {
    const disp = el.querySelector("feDisplacementMap");
    const turb = el.querySelector("feTurbulence");
    const ship = el.querySelector<SVGGElement>(".m790-ship");
    const route = el.querySelector<SVGPathElement>(".m790-path");
    const anims: gsap.core.Animation[] = [];
    if (disp) anims.push(gsap.fromTo(disp, { attr: { scale: 2 } }, { attr: { scale: 8 }, duration: 1.1, ease: "sine.inOut", repeat: -1, yoyo: true }));
    let seed = 2;
    if (turb) anims.push(gsap.to({}, { duration: 0.24, repeat: -1, onRepeat: () => turb.setAttribute("seed", String((seed = (seed % 30) + 1))) }));
    if (ship && route) {
      const L = route.getTotalLength();
      const o = { p: 0 };
      anims.push(
        gsap.to(o, {
          p: 1,
          duration: 7,
          ease: "none",
          repeat: -1,
          onUpdate: () => {
            const a = route.getPointAtLength(o.p * L);
            const b = route.getPointAtLength(Math.min(L, o.p * L + 2));
            const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
            ship.setAttribute("transform", `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
          },
        }),
      );
    }
    return anims;
  });
  useTicker(root, (t, dt0) => {
    const { ctx, w, h } = cs.current;
    if (!ctx) return;
    const dt = Math.min(dt0, 0.05);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(240,248,255,.85)";
    ctx.beginPath();
    for (const f of flakes.current) {
      f.y += f.vy * dt;
      if (f.y > h + 6) {
        f.y = -6;
        f.x = Math.random() * w;
      }
      const x = f.x + Math.sin(t * 0.9 + f.ph) * f.sw;
      ctx.moveTo(x + f.r, f.y);
      ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
    }
    ctx.fill();
  });
  const ink = "rgba(206,228,246,.78)";
  return (
    <Stage r={root} className="bg-[#0c1a29]" g1="rgba(140,200,255,.5)" g2="rgba(255,255,255,.14)">
      <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <filter id={fid} x="-3%" y="-3%" width="106%" height="106%">
            <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves={1} seed={2} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter={`url(#${fid})`} fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`v${i}`} x1={i * 120} y1={0} x2={i * 120} y2={700} strokeWidth={0.8} opacity={0.18} />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 120} x2={1200} y2={i * 120} strokeWidth={0.8} opacity={0.18} />
          ))}
          {M790_PATHS.map((p, i) => (
            <g key={i}>
              <path d={p.shelf} strokeWidth={1} strokeDasharray="2 7" opacity={0.5} />
              <path d={p.coast} strokeWidth={2.4} fill="rgba(206,228,246,.07)" />
              <path d={p.inner} strokeWidth={1.1} opacity={0.6} />
              <path d={p.core} strokeWidth={1.1} opacity={0.45} />
            </g>
          ))}
          <path className="m790-path m790-route" d="M120 630 C300 560 520 600 600 520 S880 300 1000 250 S1130 190 1180 120" strokeWidth={2} stroke="#ffb88a" />
          <g transform="translate(1070 560)" strokeWidth={1.4}>
            <circle r={48} opacity={0.6} />
            <circle r={36} strokeDasharray="2 5" opacity={0.6} />
            <path d="M0 -62 L9 0 L0 62 L-9 0 Z" fill="rgba(206,228,246,.25)" />
            <path d="M-62 0 L0 -7 L62 0 L0 7 Z" opacity={0.7} />
          </g>
        </g>
        <g fill={ink} style={{ fontFamily: F.is, fontStyle: "italic" }}>
          {M790_ISLES.map((s) => (
            <text key={s.name} x={s.cx - s.R * 0.4} y={s.cy + 6} fontSize={s.R > 100 ? 30 : 20}>
              {s.name}
            </text>
          ))}
          <text x={1062} y={490} fontSize={20} style={{ fontStyle: "normal", fontFamily: F.sg }}>
            N
          </text>
        </g>
        <g className="m790-ship" transform="translate(120 630)">
          <path d="M-12 -6 L12 0 L-12 6 L-6 0 Z" fill="#ffb88a" />
        </g>
      </svg>
      <canvas ref={cv} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
      <Sheen g1="rgba(160,210,255,.5)" opacity={0.35} />
      <Copy eyebrow="Northbound Outfitters · Expedition maps" title="Chart the cold." line="Hand-inked sea chart print · ₹ 3,200" font={F.fr} className="left-10 top-10" />
    </Stage>
  );
}

/* ---------- M791 · Scroll-velocity spiral (variant of M55: shader spirals turn with scroll; speed adds twist and spin) ---------- */
const F791 = /* glsl */ `
uniform float uPhase, uTwist;
void main() {
  vec2 p = (vUv - 0.5) * uRes / min(uRes.x, uRes.y);
  float r = length(p);
  float a = atan(p.y, p.x);
  float lr = log(r + 0.02);
  float v = sin(a * 6.0 + lr * uTwist - uPhase);
  float edge = 1.0 - smoothstep(0.0, 0.07 + r * 0.14, abs(v - 0.55));
  float v2 = sin(a * 3.0 - lr * uTwist * 0.55 + uPhase * 0.7);
  vec3 c1 = vec3(1.0, 0.44, 0.26);
  vec3 c2 = vec3(0.34, 0.46, 1.0);
  vec3 c3 = vec3(1.0, 0.9, 0.98);
  vec3 col = mix(c2, c1, 0.5 + 0.5 * sin(lr * 2.0 + uPhase * 0.3 + a));
  float fall = smoothstep(1.25, 0.04, r);
  vec3 o = vec3(0.02, 0.02, 0.05);
  o += col * (0.22 * smoothstep(-0.2, 1.0, v) + 0.95 * edge) * fall;
  o += c2 * 0.18 * smoothstep(0.75, 1.0, v2) * fall;
  o += c3 * exp(-r * 8.0) * 0.85;
  gl_FragColor = vec4(o, 1.0);
}`;
function M791() {
  const root = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLDivElement>(null);
  const s = useRef({ p: 0, v: 0, vs: 0, phase: 0, last: -1 });
  useScrub(root, (p, v) => {
    s.current.p = p;
    s.current.v = v;
  });
  const onFrame = (u: U, time: number) => {
    const S = s.current;
    const dt = S.last < 0 ? 0 : Math.min(0.05, time - S.last);
    S.last = time;
    S.vs += (Math.abs(S.v) - S.vs) * 0.08;
    S.v *= 0.92;
    S.phase += dt * (0.6 + S.vs * 7);
    (u.uPhase as { value: number }).value = S.phase + S.p * 18;
    (u.uTwist as { value: number }).value = 4 + S.p * 3 + S.vs * 16;
    if (meter.current) meter.current.style.transform = `scaleX(${(0.06 + Math.min(1, S.vs * 2.2) * 0.94).toFixed(3)})`;
  };
  return (
    <Stage r={root} className="bg-[#05050b]" g1="rgba(110,120,255,.5)" g2="rgba(255,120,80,.24)">
      <Shader frag={F791} fallback="radial-gradient(30% 40% at 50% 50%,rgba(255,140,100,.35),transparent 70%),radial-gradient(60% 70% at 50% 50%,rgba(90,110,255,.25),transparent 70%),#05050b" uniforms={() => ({ uPhase: { value: 0 }, uTwist: { value: 4 } })} onFrame={onFrame} />
      <Sheen g1="rgba(120,130,255,.5)" opacity={0.35} />
      <Copy eyebrow="Orbit Audio · Turntables" title="Spin it faster." line="Belt-drive deck, walnut plinth · ₹ 38,500" font={F.sy} className="bottom-10 left-10" />
      <div className="pointer-events-none absolute bottom-10 right-10 z-40 w-[220px]" style={{ fontFamily: F.mr }}>
        <p className="text-[13px] uppercase tracking-[0.24em] text-white/60">Scroll speed</p>
        <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-white/15">
          <div ref={meter} className="h-full w-full origin-left rounded-full bg-[#ff8a64]" style={{ transform: "scaleX(.06)" }} />
        </div>
      </div>
    </Stage>
  );
}

/* ---------- M792 · Scroll digit stream (variant of M35: digits flow along a winding path with scroll, scatter when it stops) ---------- */
type D792 = { u: number; lane: number; sp: number; ch: string; b: number; sx: number; sy: number; ph: number };
const M792_SIZES = [13, 18, 26];
function M792() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const ds = useRef<D792[]>([]);
  const s = useRef({ p: 0, moveAt: -1e9, A: 0, drift: 0 });
  const cs = useCanvas2D(cv, () => {
    ds.current = Array.from({ length: 280 }, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      const r = 50 + Math.random() * 130;
      return {
        u: i / 280 + Math.random() * 0.004,
        lane: (Math.random() * 2 - 1) * (Math.random() < 0.7 ? 0.45 : 1),
        sp: 0.75 + Math.random() * 0.5,
        ch: String(Math.floor(Math.random() * 10)),
        b: Math.random() < 0.55 ? 0 : Math.random() < 0.7 ? 1 : 2,
        sx: Math.cos(a) * r,
        sy: Math.sin(a) * r,
        ph: Math.random() * 6.28,
      };
    });
  });
  useScrub(root, (p, v) => {
    s.current.p = p;
    if (Math.abs(v) > 0.004) s.current.moveAt = performance.now();
  });
  useTicker(root, (t, dt0) => {
    const { ctx, w, h } = cs.current;
    if (!ctx) return;
    const dt = Math.min(dt0, 0.05);
    const S = s.current;
    const moving = performance.now() - S.moveAt < 260;
    S.A += ((moving ? 1 : 0) - S.A) * Math.min(1, dt * (moving ? 6 : 2.2));
    S.drift += dt * 0.012;
    const off = S.p * 2.4 + S.drift;
    const ph = t * 0.15;
    const path = (u: number) => {
      const x = -0.04 * w + u * 1.08 * w;
      const y = h * 0.52 + Math.sin(u * Math.PI * 2 * 1.25 + 0.8 + ph) * h * 0.24 + Math.sin(u * 9 + ph * 2) * h * 0.04;
      return [x, y] as const;
    };
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = `rgba(120,230,255,${(0.08 + 0.1 * S.A).toFixed(3)})`;
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const [x, y] = path(i / 80);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const A = S.A;
    for (let b = 0; b < 3; b++) {
      ctx.font = `600 ${M792_SIZES[b]}px ui-monospace, "SF Mono", Menlo, monospace`;
      for (const d of ds.current) {
        if (d.b !== b) continue;
        const u = (((d.u + off * d.sp) % 1) + 1) % 1;
        const [x, y] = path(u);
        const [x2, y2] = path(Math.min(1, u + 0.003));
        const tl = Math.hypot(x2 - x, y2 - y) || 1;
        const nx = -(y2 - y) / tl;
        const ny = (x2 - x) / tl;
        const sc = (1 - A) * (1 + 0.25 * Math.sin(t * 0.9 + d.ph));
        const px = x + nx * d.lane * 46 + d.sx * sc;
        const py = y + ny * d.lane * 46 + d.sy * sc + Math.sin(t * 1.3 + d.ph) * 4;
        if (Math.random() < 0.03 * A) d.ch = String(Math.floor(Math.random() * 10));
        const edge = Math.min(1, u * 8, (1 - u) * 8);
        const alpha = (0.2 + 0.8 * A) * edge * (b === 2 ? 1 : b === 1 ? 0.8 : 0.6);
        ctx.fillStyle = b === 2 ? `rgba(235,252,255,${alpha.toFixed(3)})` : `rgba(110,225,255,${alpha.toFixed(3)})`;
        ctx.fillText(d.ch, px, py);
      }
    }
  });
  return (
    <Stage r={root} className="bg-[#040a10]" g1="rgba(60,200,255,.5)" g2="rgba(120,90,255,.22)">
      <div className="absolute inset-0" style={{ background: "radial-gradient(60% 40% at 50% 52%,rgba(60,200,255,.12),transparent 70%),#040a10" }}>
        <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      </div>
      <Sheen g1="rgba(70,200,255,.5)" opacity={0.35} />
      <Copy eyebrow="Ledgerline · Finance app" title="Money in motion." line="Pro plan, real-time ledgers · ₹ 499 / month" font={F.sg} className="left-10 top-10" />
      <p className="pointer-events-none absolute bottom-8 right-10 z-40 text-[13px] uppercase tracking-[0.24em] text-white/55" style={{ fontFamily: F.mr }}>
        Stop scrolling and the stream scatters
      </p>
    </Stage>
  );
}

/* ---------- M793 · Aurora chart fill (variant of M181: the area under a live line chart glows as drifting aurora curtains) ---------- */
const M793_MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
function M793() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const val = useRef<HTMLSpanElement>(null);
  const cs = useCanvas2D(cv);
  useTicker(root, (t) => {
    const { ctx, w, h } = cs.current;
    if (!ctx) return;
    const x0 = w * 0.07;
    const x1 = w * 0.96;
    const top = h * 0.3;
    const base = h * 0.86;
    const v = (x: number) => Math.min(0.96, Math.max(0.06, 0.34 + 0.16 * Math.sin(x * 5.2 + 0.6 + t * 0.35) + 0.09 * Math.sin(x * 11.3 - t * 0.5) + 0.05 * Math.sin(x * 23 + t * 0.9) + 0.32 * x));
    const Y = (k: number) => base - k * (base - top);
    ctx.clearRect(0, 0, w, h);
    const N = 120;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, base);
    for (let i = 0; i <= N; i++) ctx.lineTo(x0 + ((x1 - x0) * i) / N, Y(v(i / N)));
    ctx.lineTo(x1, base);
    ctx.closePath();
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    const S = 56;
    const sw = (x1 - x0) / S;
    for (let k = 0; k < S; k++) {
      const xc = x0 + sw * (k + 0.5);
      const vk = v((k + 0.5) / S);
      const yT = Y(vk);
      const hue = 165 + vk * 150;
      const curtain = 0.5 + 0.5 * Math.sin(k * 0.45 + t * 1.3 + 2 * Math.sin(k * 0.13 - t * 0.6));
      const g = ctx.createLinearGradient(0, yT - 20, 0, base);
      g.addColorStop(0, `hsla(${hue.toFixed(0)},95%,72%,${(0.12 + 0.5 * curtain).toFixed(3)})`);
      g.addColorStop(0.45, `hsla(${(hue + 30).toFixed(0)},90%,56%,${(0.05 + 0.24 * curtain).toFixed(3)})`);
      g.addColorStop(1, `hsla(${(hue + 60).toFixed(0)},90%,40%,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(xc - sw * 0.9, yT - 20, sw * 1.8, base - yT + 20);
    }
    ctx.restore();
    const line = ctx.createLinearGradient(x0, 0, x1, 0);
    line.addColorStop(0, "#5ef2c8");
    line.addColorStop(0.55, "#8f8bff");
    line.addColorStop(1, "#ff7fd1");
    ctx.lineJoin = "round";
    for (const [lw, a] of [
      [10, 0.14],
      [2.5, 1],
    ] as const) {
      ctx.globalAlpha = a;
      ctx.lineWidth = lw;
      ctx.strokeStyle = line;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const x = x0 + ((x1 - x0) * i) / N;
        if (i) ctx.lineTo(x, Y(v(i / N)));
        else ctx.moveTo(x, Y(v(i / N)));
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const m = (t * 0.08) % 1;
    const mx = x0 + (x1 - x0) * m;
    const my = Y(v(m));
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx, base);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(mx, my, 5, 0, Math.PI * 2);
    ctx.fill();
    if (val.current) val.current.textContent = `₹ ${(6 + v(m) * 22).toFixed(1)}L`;
  });
  return (
    <Stage r={root} className="bg-[#060812]" g1="rgba(110,120,255,.5)" g2="rgba(94,242,200,.22)">
      <div className="absolute inset-0">
        {[0.3, 0.44, 0.58, 0.72, 0.86].map((y) => (
          <div key={y} className="absolute left-[7%] right-[4%] h-px bg-white/[0.08]" style={{ top: `${y * 100}%` }} />
        ))}
        <div className="absolute bottom-[5%] left-[7%] right-[4%] flex justify-between text-[12px] text-white/45" style={{ fontFamily: F.mr }}>
          {M793_MONTHS.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      </div>
      <Sheen g1="rgba(120,130,255,.5)" opacity={0.3} />
      <div className="pointer-events-none absolute left-[7%] top-[7%] z-40 flex w-[89%] items-end justify-between" style={{ fontFamily: F.mr }}>
        <div>
          <p className="text-[13px] uppercase tracking-[0.28em] text-white/60">Kiln & Co · Store revenue</p>
          <p className="mt-2 text-[clamp(36px,3.8vw,60px)] font-[650] leading-none tracking-[-0.03em]" style={{ fontFamily: F.sg }}>
            A brighter year.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[13px] uppercase tracking-[0.24em] text-white/55">This month</p>
          <p className="mt-1 text-[32px] font-[650] leading-none" style={{ fontFamily: F.sg }}>
            <span ref={val}>₹ 18.4L</span>
          </p>
        </div>
      </div>
    </Stage>
  );
}

/* ---------- M794 · Brush cursor paints (variant of M65: the pointer paints thick brand-colour strokes that fade away) ---------- */
type Seg = { x0: number; y0: number; x1: number; y1: number; w: number; born: number; o: number[] };
function M794() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const cs = useCanvas2D(cv);
  const segs = useRef<Seg[]>([]);
  const last = useRef<{ x: number; y: number; w: number } | null>(null);
  const clock = useRef(0);
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.36 * Math.sin(t * 0.85)), h * (0.54 + 0.26 * Math.sin(t * 1.62 + 0.6))],
    (x, y, dt) => {
      const { ctx, w, h } = cs.current;
      if (!ctx) return;
      clock.current += dt;
      const now = clock.current;
      const L = last.current;
      if (L) {
        const d = Math.hypot(x - L.x, y - L.y);
        if (d > 1.5 && d < 300) {
          const speed = d / Math.max(dt, 0.008);
          const target = Math.max(14, Math.min(46, 48 - speed * 0.025));
          const bw = L.w + (target - L.w) * 0.25;
          segs.current.push({ x0: L.x, y0: L.y, x1: x, y1: y, w: bw, born: now, o: [-0.42, -0.2, 0.1, 0.36].map((k) => k + (Math.random() - 0.5) * 0.08) });
          last.current = { x, y, w: bw };
        } else if (d >= 300) last.current = { x, y, w: L.w };
      } else last.current = { x, y, w: 30 };
      const life = 2.6;
      const list = segs.current;
      while (list.length && now - list[0].born > life) list.shift();
      if (list.length > 400) list.splice(0, list.length - 400);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (const s of list) {
        const k = (now - s.born) / life;
        const a = 1 - k * k;
        const dx = s.x1 - s.x0;
        const dy = s.y1 - s.y0;
        const dl = Math.hypot(dx, dy) || 1;
        const nx = -dy / dl;
        const ny = dx / dl;
        ctx.strokeStyle = `rgba(255,84,48,${(0.92 * a).toFixed(3)})`;
        ctx.lineWidth = s.w;
        ctx.beginPath();
        ctx.moveTo(s.x0, s.y0);
        ctx.lineTo(s.x1, s.y1);
        ctx.stroke();
        ctx.lineWidth = Math.max(2, s.w * 0.12);
        for (let j = 0; j < s.o.length; j++) {
          const off = s.o[j] * s.w;
          ctx.strokeStyle = j % 2 ? `rgba(255,170,120,${(0.55 * a).toFixed(3)})` : `rgba(160,30,18,${(0.5 * a).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(s.x0 + nx * off, s.y0 + ny * off);
          ctx.lineTo(s.x1 + nx * off, s.y1 + ny * off);
          ctx.stroke();
        }
      }
    },
  );
  return (
    <Stage r={root} className="bg-[#0d0b0a]" g1="rgba(255,110,70,.5)" g2="rgba(255,200,140,.18)">
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <p className="text-[clamp(56px,7.4vw,124px)] font-[800] uppercase leading-none tracking-[-0.04em] text-transparent" style={{ fontFamily: F.sy, WebkitTextStroke: "1.5px rgba(255,236,220,.35)" }}>
          Make your mark
        </p>
      </div>
      <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      <Sheen g1="rgba(255,120,80,.5)" opacity={0.3} />
      <p className="pointer-events-none absolute bottom-8 left-10 z-40 text-[14px] text-white/60" style={{ fontFamily: F.mr }}>
        Oxblood Paint Co · Studio gouache set of 12 · ₹ 1,850
      </p>
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "M788", name: "Shape-shifter box", how: "A solid block between the words loops through sizes, shapes and colours, pushing the headline text around it (GSAP)", kind: "play", C: M788 },
  { code: "M789", name: "Screensaver bounce", how: "A badge travels in straight lines and bounces off the frame edges, changing tint with a ring flash on every hit (GSAP ticker)", kind: "play", C: M789 },
  { code: "M790", name: "Hand-drawn map with snowfall", how: "An inked sea chart wobbles through an SVG displacement filter while snow falls and a ship marches along its route (SVG + canvas)", kind: "play", C: M790 },
  { code: "M791", name: "Scroll-velocity spiral", how: "A full-screen shader spiral turns with the scroll; scrolling faster adds twist and spin (OGL, scrub)", kind: "scrub", C: M791 },
  { code: "M792", name: "Scroll digit stream", how: "Digits flow along a winding path as you scroll; when scrolling stops they dim and scatter, easing back on resume (canvas, scrub)", kind: "scrub", C: M792 },
  { code: "M793", name: "Aurora chart fill", how: "The area under a live line chart glows as drifting aurora curtains whose hue tracks each value (canvas)", kind: "play", C: M793 },
  { code: "M794", name: "Brush cursor paints", how: "The pointer paints thick brand-colour brush strokes with bristle streaks that fade after a few seconds (canvas, scripted pointer)", kind: "play", C: M794 },
];
