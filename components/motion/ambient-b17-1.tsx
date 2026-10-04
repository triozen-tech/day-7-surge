"use client";

// Ambient motions, batch 17 · group 1 (MOTION-MENU M776–M787): a glass fractal solid, a crystal field, clockwork gears,
// jellyfish, a fractal fly-through, lightning, Voronoi cells, 3D gradient circles, a HUD reticle, a flip-disc board, an
// ASCII plasma field and an ASCII image lit by the cursor. Small focused demos for /lab/motion. Every demo is "play": it
// starts when it is on screen, loops, and pauses off screen. Each stage has a CSS-only glow loop that never stops, and a
// second one ON TOP of full-bleed canvases / boards. Pointer demos drive a visible fake pointer ring by themselves; the
// real mouse takes over while it moves. WebGL builds only within ~1 screen of the viewport, runs at dpr 1 (0.7 for the
// raymarched shaders) and releases its context on unmount.
// ?static=1 / reduced motion: no JS motion, CSS loops stop, the markup shows a sensible final state.
import { useEffect, useId, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
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
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

const CSS = `
.b17g1-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b17g1-drift 5.6s linear infinite alternate;will-change:transform}
@keyframes b17g1-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b17g1-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);pointer-events:none;z-index:45;opacity:0;transition:opacity .25s}
.b17g1-run{animation-play-state:paused !important}
.b17g1-on .b17g1-run{animation-play-state:running !important}

/* M778 sparks */
.m778-sp{transform-box:view-box;animation:m778-sp var(--d,.8s) linear infinite;animation-delay:var(--l,0s);opacity:0}
@keyframes m778-sp{0%{transform:translate(0,0) scaleX(.4);opacity:0}12%{opacity:1}100%{transform:translate(var(--tx,90px),var(--ty,30px)) scaleX(1.3);opacity:0}}
.m778-flash{animation:m778-flash .45s ease-in-out infinite alternate}
@keyframes m778-flash{0%{opacity:.25}100%{opacity:.9}}

/* M784 HUD */
.m784-scan{position:absolute;left:0;right:0;height:2px;top:0;background:linear-gradient(90deg,transparent,rgba(120,255,200,.55),transparent);animation:m784-scan 3.2s linear infinite}
@keyframes m784-scan{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(0,var(--sh,640px),0)}}
.m784-blip{transform-box:fill-box;transform-origin:center;animation:m784-blip 1.2s ease-in-out infinite alternate}
@keyframes m784-blip{0%{opacity:.35;transform:scale(.8)}100%{opacity:1;transform:scale(1.25)}}

/* M785 flip discs */
.m785-d{width:100%;aspect-ratio:1;border-radius:50%;background:#1b1e26;box-shadow:inset 0 -2px 3px rgba(0,0,0,.55),inset 0 2px 2px rgba(255,255,255,.06);transform:rotateX(0deg);transition:transform .26s ease var(--d,0s),background-color 0s linear calc(var(--d,0s) + .13s)}
.m785-d.on{transform:rotateX(180deg);background:#ffd23a}

html.is-static .b17g1-glow,html.is-static .b17g1-run,html.is-static .m778-sp,html.is-static .m778-flash,html.is-static .m784-scan,html.is-static .m784-blip{animation:none}
html.is-static .m785-d{transition:none}
@media (prefers-reduced-motion: reduce){
  .b17g1-glow,.b17g1-run,.m778-sp,.m778-flash,.m784-scan,.m784-blip{animation:none}
  .m785-d{transition:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop (never frozen). */
function Stage({ r, children, className = "", g1, g2, style }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; className?: string; g1?: string; g2?: string; style?: CSSProperties }) {
  return (
    <div ref={r} className={`relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff] ${className}`} style={style}>
      <style href="b17g1-css" precedence="default">
        {CSS}
      </style>
      <div className="b17g1-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

/** The CSS glow loop again, ON TOP of full-bleed canvases (screen blend), so those demos never freeze. */
const Sheen = ({ g1, opacity = 0.45 }: { g1?: string; opacity?: number }) => (
  <div className="b17g1-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity, zIndex: 35 } as CSSProperties} aria-hidden />
);

/** The visible fake pointer ring. */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => <div ref={r} className="b17g1-dot" aria-hidden />;

/** Brand copy block in a corner (kept small so the motion owns the stage). */
function Copy({ eyebrow, title, line, font = F.sg, className = "left-10 top-10", tone = "text-white" }: { eyebrow: string; title: string; line: string; font?: string; className?: string; tone?: string }) {
  return (
    <div className={`pointer-events-none absolute z-40 max-w-[420px] ${tone} ${className}`}>
      <p className="text-[13px] uppercase tracking-[0.3em] opacity-70">{eyebrow}</p>
      <h3 className="mt-3 text-[clamp(44px,4.8vw,78px)] font-[650] leading-[0.92] tracking-[-0.035em]" style={{ fontFamily: font }}>
        {title}
      </h3>
      <p className="mt-4 text-[15px] opacity-75">{line}</p>
    </div>
  );
}

/** CSS-driven demos: toggles `b17g1-on` on the root while it is on screen (the paused keyframes run only then). */
function useOn(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("b17g1-on", e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("b17g1-on");
    };
  }, [ref]);
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

/** Full-bleed fragment shader (OGL via lib/gl). Built only near the viewport; draws only while on screen. */
function Shader({ frag, fallback, dpr = 1, uniforms, onFrame }: { frag: string; fallback: string; dpr?: number; uniforms?: () => U; onFrame?: (u: U, t: number) => void }) {
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
      h = await createShader(c, frag, { dpr, uniforms: un.current?.(), onFrame: (u, t) => of.current?.(u, t) });
      if (dead) h?.destroy();
    });
    return () => {
      dead = true;
      stop();
      h?.destroy();
    };
  }, [frag, dpr]);
  return (
    <div className="absolute inset-0" style={{ background: fallback }}>
      <canvas ref={cv} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500" aria-hidden />
    </div>
  );
}

type OGL = typeof import("ogl");
type GLApi = { ogl: OGL; gl: InstanceType<OGL["Renderer"]>["gl"]; scene: InstanceType<OGL["Transform"]> };
type GLStep = (t: number, w: number, h: number) => void;

/**
 * Mesh scenes (createShader only draws one full-screen triangle). Same rules as lib/gl: OGL loaded lazily, built only
 * near the viewport, dpr 1, drawn only while on screen (its clock pauses off screen), context lost on unmount.
 */
function GLScene({ build, fallback }: { build: (api: GLApi) => GLStep; fallback: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const bd = useRef(build);
  bd.current = build;
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let dead = false;
    let cleanup: (() => void) | null = null;
    const stop = whenNear(c, async () => {
      try {
        const ogl = await import("ogl");
        if (dead) return;
        const renderer = new ogl.Renderer({ canvas: c, dpr: Math.min(window.devicePixelRatio || 1, 1), alpha: true, premultipliedAlpha: true, antialias: false });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        const scene = new ogl.Transform();
        const step = bd.current({ ogl, gl, scene });
        const box = c.parentElement ?? c;
        const fit = () => {
          const r = box.getBoundingClientRect();
          renderer.setSize(Math.max(1, r.width), Math.max(1, r.height));
          c.style.width = "100%";
          c.style.height = "100%";
        };
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(box);
        let vis = false;
        const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting), { rootMargin: "80px" });
        io.observe(c);
        let last = performance.now();
        let t = 0;
        let raf = 0;
        let shown = false;
        const loop = () => {
          raf = requestAnimationFrame(loop);
          const now = performance.now();
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          if (!vis) return;
          t += dt;
          step(t, gl.canvas.width, gl.canvas.height);
          renderer.render({ scene, sort: false, frustumCull: false });
          if (!shown) {
            shown = true;
            c.style.opacity = "1";
          }
        };
        raf = requestAnimationFrame(loop);
        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          io.disconnect();
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
        if (dead) cleanup();
      } catch (err) {
        console.warn("[gl] scene off, showing the fallback:", (err as Error).message);
      }
    });
    return () => {
      dead = true;
      stop();
      cleanup?.();
      cleanup = null;
    };
  }, []);
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

/** Soft round glow sprite for 2D canvases (drawn with "lighter"), so no per-frame shadowBlur. */
function sprite(rgb: string, size = 64) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, `rgba(${rgb},1)`);
  gr.addColorStop(0.25, `rgba(${rgb},.45)`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  return c;
}

const R2 = /* glsl */ `
mat2 r2(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
`;

/* ---------- M776 · Glass fractal solid (a bevelled glass cube holding a morphing fractal and a glowing orb, raymarched) ---------- */
const F776 = R2 + /* glsl */ `
float sdRB(vec3 p) { vec3 q = abs(p) - vec3(0.58); return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - 0.14; }
float kifs(vec3 p) {
  float m = 0.5 + 0.5 * sin(uTime * 0.55);
  p.xz *= r2(uTime * 0.4);
  float s = 1.0;
  for (int i = 0; i < 5; i++) {
    p = abs(p);
    if (p.x < p.y) p.xy = p.yx;
    if (p.x < p.z) p.xz = p.zx;
    if (p.y < p.z) p.yz = p.zy;
    p.xy *= r2(0.15 + 0.35 * m);
    p.yz *= r2(0.2 * sin(uTime * 0.3));
    p = p * 1.9 - vec3(0.34, 0.26, 0.2) * (0.9 + 0.3 * m);
    s *= 1.9;
  }
  return (length(p) - 0.35) / s;
}
vec3 inner(vec3 p, vec3 rd) {
  vec3 acc = vec3(0.0);
  float t = 0.0;
  float orbR = 0.13 + 0.025 * sin(uTime * 2.1);
  float mo = 1.0;
  float k = 0.0;
  for (int i = 0; i < 46; i++) {
    vec3 q = p + rd * t;
    if (sdRB(q) > 0.005) break;
    float f = kifs(q);
    float o = length(q) - orbR;
    mo = min(mo, o);
    acc += vec3(0.3, 0.45, 1.0) * 0.0022 / (0.008 + abs(f));
    float d = min(f, o);
    if (d < 0.002) {
      if (o < f) acc += vec3(1.0, 0.75, 0.95) * 1.4;
      else acc += vec3(0.55, 0.72, 1.0) * (1.0 - k / 46.0) * 0.9;
      break;
    }
    t += max(d * 0.8, 0.004);
    k += 1.0;
  }
  acc += vec3(1.0, 0.45, 0.8) * 0.7 * exp(-max(mo, 0.0) * 16.0);
  return acc;
}
void main() {
  float asp = uRes.x / uRes.y;
  vec2 uv = (vUv - 0.5) * vec2(asp, 1.0);
  uv.x -= 0.2 * asp;
  vec3 ro = vec3(0.0, 0.0, 3.4);
  vec3 rd = normalize(vec3(uv, -1.75));
  vec3 col = mix(vec3(0.02, 0.025, 0.05), vec3(0.06, 0.05, 0.12), vUv.y);
  col += vec3(0.15, 0.2, 0.45) * 0.35 * exp(-5.0 * dot(uv, uv));
  mat2 A = r2(uTime * 0.33), B = r2(0.5 + 0.25 * sin(uTime * 0.23));
  vec3 o = ro, d = rd;
  o.xz *= A; d.xz *= A; o.yz *= B; d.yz *= B;
  float t = 0.0, hit = 0.0;
  for (int i = 0; i < 44; i++) {
    float h = sdRB(o + d * t);
    if (h < 0.001) { hit = 1.0; break; }
    t += h;
    if (t > 7.0) break;
  }
  if (hit > 0.5) {
    vec3 p = o + d * t;
    vec2 e = vec2(0.001, 0.0);
    vec3 n = normalize(vec3(sdRB(p + e.xyy) - sdRB(p - e.xyy), sdRB(p + e.yxy) - sdRB(p - e.yxy), sdRB(p + e.yyx) - sdRB(p - e.yyx)));
    float fr = pow(1.0 - max(dot(n, -d), 0.0), 3.0);
    vec3 rd2 = refract(d, n, 0.68);
    vec3 ins = inner(p + rd2 * 0.02, rd2);
    vec3 L = normalize(vec3(-0.5, 0.8, 0.6)); L.xz *= A; L.yz *= B;
    float sp = pow(max(dot(reflect(d, n), L), 0.0), 40.0);
    vec3 q = abs(p);
    float edge = smoothstep(0.5, 0.68, min(min(max(q.x, q.y), max(q.y, q.z)), max(q.z, q.x)));
    col = col * 0.35 + vec3(0.03, 0.05, 0.09) + ins;
    col += vec3(0.55, 0.75, 1.0) * fr * 0.8 + vec3(1.0) * sp * 1.4 + vec3(0.6, 0.8, 1.0) * edge * 0.35;
  }
  col = 1.0 - exp(-col * 1.25);
  gl_FragColor = vec4(col, 1.0);
}`;
function M776() {
  return (
    <Stage className="bg-[#04050c]" g1="rgba(110,140,255,.55)" g2="rgba(255,120,200,.22)">
      <Shader
        frag={F776}
        dpr={0.7}
        fallback="radial-gradient(14% 22% at 70% 50%,rgba(255,150,220,.5),transparent 70%),radial-gradient(20% 32% at 70% 50%,rgba(140,170,255,.35),transparent 75%),linear-gradient(180deg,#0d0b1e,#04050c)"
      />
      <Sheen g1="rgba(130,150,255,.55)" opacity={0.4} />
      <Copy eyebrow="Prism Lab · Glassware" title="Light, held still." line="Hand-cut crystal paperweight · ₹ 14,500" font={F.fr} className="bottom-10 left-10" />
    </Stage>
  );
}

/* ---------- M777 · Crystalline field (faceted 3D crystals turn and glint toward the pointer, OGL mesh, scripted pointer) ---------- */
const V777 = /* glsl */ `
precision highp float;
attribute vec3 position;
attribute vec3 normal;
attribute vec3 aCenter;
attribute vec4 aRand;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uTime;
varying vec3 vN;
varying vec3 vP;
varying float vNear;
varying float vHue;
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }
void main() {
  vec3 c = aCenter;
  c.y += 0.07 * sin(uTime * 0.6 + aRand.w * 6.28);
  vec2 dm = uMouse - c.xy;
  float near = exp(-dot(dm, dm) * 0.9);
  float spin = uTime * (0.2 + aRand.x * 0.35) + aRand.y * 6.28;
  mat3 R = rotY(spin + near * 1.4 * sign(dm.x + 0.001)) * rotX(aRand.z * 1.4 - 0.7 + 0.25 * sin(uTime * 0.5 + aRand.w * 5.0) - near * dm.y * 0.9) * rotZ(aRand.w * 1.2 - 0.6 + near * dm.x * 0.5);
  vec3 p = R * position * (1.0 + near * 0.18) + c;
  vN = R * normal;
  vP = p;
  vNear = near;
  vHue = aRand.y;
  float z = 4.2 - p.z;
  vec2 q = p.xy * 2.2 / z;
  q.x *= uRes.y / uRes.x;
  gl_Position = vec4(q, clamp((z - 0.5) / 10.0, 0.0, 1.0) * 2.0 - 1.0, 1.0);
}`;
const FR777 = /* glsl */ `
precision highp float;
uniform vec2 uMouse;
uniform float uTime;
varying vec3 vN;
varying vec3 vP;
varying float vNear;
varying float vHue;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(vec3(0.0, 0.0, 4.2) - vP);
  if (dot(n, v) < 0.0) n = -n;
  vec3 L = normalize(vec3(uMouse, 1.6) - vP);
  vec3 L2 = normalize(vec3(-0.6, 0.9, 0.5));
  float dif = max(dot(n, L), 0.0) * 0.6 + max(dot(n, L2), 0.0) * 0.25;
  float sp = pow(max(dot(n, normalize(L + v)), 0.0), 60.0);
  float rim = pow(1.0 - max(dot(n, v), 0.0), 2.5);
  vec3 base = mix(vec3(0.25, 0.55, 0.95), vec3(0.7, 0.45, 1.0), vHue);
  vec3 col = base * (0.12 + dif) + vec3(0.7, 0.9, 1.0) * rim * 0.55;
  col += vec3(1.0) * sp * (0.4 + 2.2 * vNear);
  col += base * vNear * 0.25;
  gl_FragColor = vec4(col, 1.0);
}`;
function crystalGeo(N: number) {
  // elongated six-sided bipyramids, flat normals per face; a seeded random keeps the field the same every load
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pos: number[] = [];
  const nor: number[] = [];
  const cen: number[] = [];
  const rr: number[] = [];
  for (let i = 0; i < N; i++) {
    const c = [(rnd() * 2 - 1) * 3.4, (rnd() * 2 - 1) * 1.7, -1.6 + rnd() * 2.2];
    const r = 0.1 + rnd() * 0.16;
    const h = r * (2.2 + rnd() * 1.6);
    const rand = [rnd(), rnd(), rnd(), rnd()];
    const ring: number[][] = [];
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      ring.push([Math.cos(a) * r, 0, Math.sin(a) * r]);
    }
    const tips = [
      [0, h, 0],
      [0, -h * 0.55, 0],
    ];
    for (let k = 0; k < 6; k++) {
      const a = ring[k];
      const b = ring[(k + 1) % 6];
      for (const tip of tips) {
        const tri = [a, b, tip];
        const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const v = [tip[0] - a[0], tip[1] - a[1], tip[2] - a[2]];
        let nx = u[1] * v[2] - u[2] * v[1];
        let ny = u[2] * v[0] - u[0] * v[2];
        let nz = u[0] * v[1] - u[1] * v[0];
        const mx = (a[0] + b[0] + tip[0]) / 3;
        const my = (a[1] + b[1] + tip[1]) / 3;
        const mz = (a[2] + b[2] + tip[2]) / 3;
        if (nx * mx + ny * my + nz * mz < 0) {
          nx = -nx;
          ny = -ny;
          nz = -nz;
        }
        const l = Math.hypot(nx, ny, nz) || 1;
        for (const p of tri) {
          pos.push(p[0], p[1], p[2]);
          nor.push(nx / l, ny / l, nz / l);
          cen.push(c[0], c[1], c[2]);
          rr.push(rand[0], rand[1], rand[2], rand[3]);
        }
      }
    }
  }
  return { pos: new Float32Array(pos), nor: new Float32Array(nor), cen: new Float32Array(cen), rr: new Float32Array(rr) };
}
function M777() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const mouse = useRef<[number, number]>([0, 0]);
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.55 + 0.33 * Math.sin(t * 0.55)), h * (0.5 + 0.3 * Math.sin(t * 0.9 + 1))],
    (x, y, _dt, _t) => {
      const el = root.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      // pointer px → scene units on the z = 0 plane (camera at z 4.2, focal 2.2)
      const k = 4.2 / 2.2;
      const tx = ((x / w) * 2 - 1) * k * (w / h);
      const ty = (1 - (y / h) * 2) * k;
      mouse.current = [mouse.current[0] + (tx - mouse.current[0]) * 0.12, mouse.current[1] + (ty - mouse.current[1]) * 0.12];
    },
  );
  const build = (api: GLApi): GLStep => {
    const { ogl, gl, scene: sc } = api;
    const g = crystalGeo(70);
    const geo = new ogl.Geometry(gl, {
      position: { size: 3, data: g.pos },
      normal: { size: 3, data: g.nor },
      aCenter: { size: 3, data: g.cen },
      aRand: { size: 4, data: g.rr },
    });
    const prog = new ogl.Program(gl, {
      vertex: V777,
      fragment: FR777,
      uniforms: { uTime: { value: 0 }, uRes: { value: [1, 1] }, uMouse: { value: [0, 0] } },
      cullFace: false,
      depthTest: true,
      depthWrite: true,
    });
    const mesh = new ogl.Mesh(gl, { geometry: geo, program: prog });
    mesh.setParent(sc);
    return (t, w, h) => {
      prog.uniforms.uTime.value = t;
      prog.uniforms.uRes.value = [w, h];
      prog.uniforms.uMouse.value = mouse.current;
    };
  };
  return (
    <Stage r={root} className="bg-[#050812]" g1="rgba(120,170,255,.55)" g2="rgba(190,130,255,.22)">
      <GLScene
        build={build}
        fallback="conic-gradient(from 30deg at 62% 46%,rgba(120,170,255,.18),transparent 20%,rgba(190,130,255,.16) 40%,transparent 60%,rgba(120,200,255,.14) 80%,transparent),#050812"
      />
      <Sheen g1="rgba(120,170,255,.5)" opacity={0.4} />
      <Copy eyebrow="Halite & Co · Skincare" title="Mineral clear." line="Crystal serum 30 ml · ₹ 2,450" font={F.mr} className="bottom-10 left-10" />
      <Dot r={dot} />
    </Stage>
  );
}

/* ---------- M778 · Clockwork gears (meshed brass gears turn at true ratios, sparks fly from each contact point; GSAP + CSS) ---------- */
type Gear = { n: number; x: number; y: number; r: number; dir: number; phi: number };
type Contact = { x: number; y: number; ang: number };
function gearPath(g: Gear) {
  const p = (Math.PI * 2) / g.n;
  const ra = g.r + 6;
  const rd = g.r - 6;
  const pts: string[] = [];
  const P = (rad: number, a: number) => `${(g.x + Math.cos(a) * rad).toFixed(2)} ${(g.y + Math.sin(a) * rad).toFixed(2)}`;
  for (let k = 0; k < g.n; k++) {
    const a = g.phi + k * p;
    pts.push(P(rd, a - 0.32 * p), P(ra, a - 0.14 * p), P(ra, a + 0.14 * p), P(rd, a + 0.32 * p));
  }
  const hub = g.r * 0.2;
  return `M${pts.join("L")}Z M${g.x + hub} ${g.y} a${hub} ${hub} 0 1 0 ${-hub * 2} 0 a${hub} ${hub} 0 1 0 ${hub * 2} 0Z`;
}
const GEARS: { gears: Gear[]; contacts: Contact[] } = (() => {
  // pitch radius = 4 × teeth; a child sits on its parent at angle θ with its phase set so its gap meets the parent's tooth
  const gears: Gear[] = [{ n: 28, x: 640, y: 380, r: 112, dir: 1, phi: 0 }];
  const contacts: Contact[] = [];
  const add = (pi: number, n: number, deg: number) => {
    const A = gears[pi];
    const th = (deg * Math.PI) / 180;
    const r = n * 4;
    const x = A.x + Math.cos(th) * (A.r + r);
    const y = A.y + Math.sin(th) * (A.r + r);
    const pB = (Math.PI * 2) / n;
    const phi = -(A.n / n) * (A.phi - th) + th + Math.PI + pB / 2;
    gears.push({ n, x, y, r, dir: -A.dir, phi });
    contacts.push({ x: A.x + Math.cos(th) * A.r, y: A.y + Math.sin(th) * A.r, ang: (th * 180) / Math.PI + 90 * A.dir });
  };
  add(0, 14, -35);
  add(1, 10, 30);
  add(0, 18, 165);
  return { gears, contacts };
})();
const SPARKS = Array.from({ length: 30 }, (_, i) => {
  const c = GEARS.contacts[i % 3];
  const a = ((c.ang + ((i * 37) % 50) - 25) * Math.PI) / 180;
  const len = 70 + ((i * 53) % 60);
  return { c, len, rot: (a * 180) / Math.PI, d: 0.55 + ((i * 29) % 40) / 100, l: -((i * 0.137) % 1) };
});
function M778() {
  const root = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  useOn(root);
  useAnims(root, (el) => {
    const gs = Array.from(el.querySelectorAll<SVGGElement>(".m778-g"));
    const anims: gsap.core.Animation[] = gs.map((g, i) => {
      const G = GEARS.gears[i];
      return gsap.to(g, { rotation: G.dir * 360, svgOrigin: `${G.x} ${G.y}`, duration: (9 * G.n) / 28, ease: "none", repeat: -1 });
    });
    const bal = el.querySelector(".m778-bal");
    if (bal) anims.push(gsap.fromTo(bal, { rotation: -70 }, { rotation: 70, svgOrigin: "250 170", duration: 0.5, ease: "sine.inOut", repeat: -1, yoyo: true }));
    return anims;
  });
  return (
    <Stage r={root} className="bg-[#0c0906]" g1="rgba(255,170,90,.5)" g2="rgba(255,220,160,.18)">
      <svg viewBox="0 0 1000 700" preserveAspectRatio="xMaxYMid meet" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id={`${uid}b`} cx="40%" cy="35%" r="75%">
            <stop offset="0" stopColor="#ffe2a8" />
            <stop offset=".45" stopColor="#c8903f" />
            <stop offset="1" stopColor="#5a3a14" />
          </radialGradient>
          <linearGradient id={`${uid}s`} x1="0" x2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".4" stopColor="#ffd27a" />
            <stop offset="1" stopColor="#ff7a2a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* faint back gear + balance wheel */}
        <circle cx="250" cy="170" r="70" fill="none" stroke="rgba(255,210,150,.18)" strokeWidth="2" />
        <g className="m778-bal">
          <circle cx="250" cy="170" r="54" fill="none" stroke="#d9a75a" strokeWidth="5" />
          <path d="M196 170H304M250 116V224" stroke="#d9a75a" strokeWidth="3" />
          <circle cx="250" cy="170" r="7" fill="#ffe2a8" />
        </g>
        {GEARS.gears.map((g, i) => (
          <g key={i} className="m778-g">
            <path d={gearPath(g)} fill={`url(#${uid}b)`} fillRule="evenodd" stroke="rgba(40,24,8,.7)" strokeWidth="1.5" />
            {g.n >= 14 &&
              Array.from({ length: 5 }, (_, k) => {
                const a = g.phi + (k / 5) * Math.PI * 2;
                return <circle key={k} cx={g.x + Math.cos(a) * g.r * 0.56} cy={g.y + Math.sin(a) * g.r * 0.56} r={g.r * 0.2} fill="#120c06" stroke="rgba(255,220,160,.25)" />;
              })}
            <circle cx={g.x} cy={g.y} r={g.r * 0.08} fill="#ffe9c0" />
          </g>
        ))}
        {GEARS.contacts.map((c, i) => (
          <circle key={i} className="m778-flash b17g1-run" cx={c.x} cy={c.y} r="14" fill="rgba(255,200,110,.55)" />
        ))}
        {SPARKS.map((s, i) => (
          <g key={i} transform={`translate(${s.c.x.toFixed(1)} ${s.c.y.toFixed(1)}) rotate(${s.rot.toFixed(1)})`}>
            <line
              className="m778-sp b17g1-run"
              x1="-14"
              y1="0"
              x2="6"
              y2="0"
              stroke={`url(#${uid}s)`}
              strokeWidth="2.4"
              strokeLinecap="round"
              style={{ "--tx": `${s.len}px`, "--ty": "0px", "--d": `${s.d.toFixed(2)}s`, "--l": `${s.l.toFixed(2)}s` } as CSSProperties}
            />
          </g>
        ))}
      </svg>
      <Sheen g1="rgba(255,170,90,.45)" opacity={0.3} />
      <Copy eyebrow="Meridian Horology · Atelier" title="Every second, by hand." line="Skeleton automatic · ₹ 3,85,000" font={F.fr} className="left-10 top-10" />
    </Stage>
  );
}

/* ---------- M779 · Jellyfish (bells pulse and push upward, tentacles trail behind on chains; canvas 2D) ---------- */
type Pt = { x: number; y: number };
type Jelly = { x: number; y: number; vy: number; s: number; ph: number; f: number; hue: number; tent: Pt[][] };
function M779() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef<{ jellies: Jelly[]; snow: Pt[]; glow: HTMLCanvasElement | null }>({ jellies: [], snow: [], glow: null });
  const reset = (j: Jelly, w: number, h: number, first: boolean) => {
    j.x = w * (0.42 + Math.random() * 0.54);
    j.y = first ? h * (0.15 + Math.random() * 0.85) : h + j.s * 1.6 + Math.random() * 90;
    j.vy = -30;
    j.tent = Array.from({ length: 7 }, () => Array.from({ length: 12 }, (_, i) => ({ x: j.x, y: j.y + i * j.s * 0.28 })));
  };
  const cs = useCanvas2D(cv, (w, h) => {
    const S = st.current;
    if (!S.glow) S.glow = sprite("150,190,255", 128);
    S.jellies = Array.from({ length: 6 }, (_, i) => {
      const j: Jelly = { x: 0, y: 0, vy: 0, s: 34 + i * 9 + Math.random() * 8, ph: Math.random() * 6, f: 3.6 + Math.random() * 1.6, hue: 200 + Math.random() * 110, tent: [] };
      reset(j, w, h, true);
      return j;
    });
    S.snow = Array.from({ length: 140 }, () => ({ x: Math.random() * w, y: Math.random() * h }));
  });
  useTicker(root, (t, dt0) => {
    const { ctx, w, h } = cs.current;
    const S = st.current;
    if (!ctx || !S.glow) return;
    const dt = Math.min(dt0, 0.05);
    ctx.globalCompositeOperation = "source-over";
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#071a2e");
    bg.addColorStop(1, "#02060e");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    // marine snow, one path
    ctx.fillStyle = "rgba(190,220,255,.35)";
    ctx.beginPath();
    for (const p of S.snow) {
      p.y -= dt * 9;
      p.x += Math.sin(t * 0.6 + p.y * 0.02) * dt * 4;
      if (p.y < -4) p.y = h + 4;
      ctx.moveTo(p.x + 1.3, p.y);
      ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.globalCompositeOperation = "lighter";
    for (const j of S.jellies) {
      j.ph += dt * j.f * 0.5;
      const c = Math.pow(Math.max(0, Math.sin(j.ph)), 2);
      j.vy += (-c * 150 * (j.s / 60) + 10) * dt;
      j.vy *= Math.pow(0.4, dt);
      j.y += j.vy * dt;
      const vx = Math.sin(t * 0.3 + j.hue) * 10;
      j.x += vx * dt;
      if (j.y < -j.s * 3) reset(j, w, h, false);
      const tilt = vx * 0.012;
      const bw = j.s * (1 - 0.22 * c);
      const bh = j.s * (0.8 + 0.2 * c);
      const cos = Math.cos(tilt);
      const sin = Math.sin(tilt);
      // tentacles: chains that hang from the rim and trail behind the swim
      const seg = j.s * 0.28;
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = `hsla(${j.hue},90%,72%,.45)`;
      j.tent.forEach((ch, k) => {
        const lx = -bw * 0.8 + (k * 1.6 * bw) / 6;
        ch[0].x = j.x + lx * cos;
        ch[0].y = j.y + lx * sin + bh * 0.04;
        for (let i = 1; i < ch.length; i++) {
          const p = ch[i];
          p.x += Math.sin(t * 2.2 + i * 0.55 + k) * dt * 14;
          p.y += dt * 18;
          const dx = p.x - ch[i - 1].x;
          const dy = p.y - ch[i - 1].y;
          const d = Math.hypot(dx, dy) || 1;
          p.x = ch[i - 1].x + (dx / d) * seg;
          p.y = ch[i - 1].y + (dy / d) * seg;
        }
        ctx.beginPath();
        ctx.moveTo(ch[0].x, ch[0].y);
        for (let i = 1; i < ch.length - 1; i++) ctx.quadraticCurveTo(ch[i].x, ch[i].y, (ch[i].x + ch[i + 1].x) / 2, (ch[i].y + ch[i + 1].y) / 2);
        ctx.stroke();
      });
      // glow under the bell
      const gs = j.s * 3.2;
      ctx.globalAlpha = 0.35 + 0.3 * c;
      ctx.drawImage(S.glow, j.x - gs / 2, j.y - bh * 0.5 - gs / 2, gs, gs);
      ctx.globalAlpha = 1;
      // the bell: dome + scalloped rim
      ctx.save();
      ctx.translate(j.x, j.y);
      ctx.rotate(tilt);
      ctx.beginPath();
      ctx.moveTo(-bw, 0);
      ctx.bezierCurveTo(-bw, -bh * 1.3, bw, -bh * 1.3, bw, 0);
      for (let k = 0; k < 6; k++) {
        const x0 = bw - ((k + 1) * 2 * bw) / 6;
        ctx.quadraticCurveTo(x0 + bw / 6, bh * (0.16 + 0.08 * c), x0, 0);
      }
      const gr = ctx.createRadialGradient(0, -bh * 0.55, 0, 0, -bh * 0.4, j.s * 1.1);
      gr.addColorStop(0, `hsla(${j.hue + 30},95%,85%,.55)`);
      gr.addColorStop(0.6, `hsla(${j.hue},90%,60%,.25)`);
      gr.addColorStop(1, `hsla(${j.hue},90%,50%,.05)`);
      ctx.fillStyle = gr;
      ctx.fill();
      ctx.strokeStyle = `hsla(${j.hue + 20},100%,80%,.6)`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // inner frills
      ctx.beginPath();
      for (let k = -1; k <= 1; k++) {
        ctx.moveTo(k * bw * 0.3 + bw * 0.12, -bh * 0.35);
        ctx.ellipse(k * bw * 0.3, -bh * 0.35, bw * 0.12, bh * 0.16, 0, 0, Math.PI * 2);
      }
      ctx.strokeStyle = `hsla(${j.hue + 60},100%,85%,.5)`;
      ctx.stroke();
      ctx.restore();
    }
  });
  return (
    <Stage r={root} className="bg-[#02060e]" g1="rgba(90,150,255,.5)" g2="rgba(200,120,255,.22)">
      <div className="absolute inset-0" style={{ background: "radial-gradient(10% 16% at 70% 40%,rgba(170,200,255,.35),transparent 70%),radial-gradient(8% 12% at 85% 70%,rgba(220,150,255,.3),transparent 70%),linear-gradient(180deg,#071a2e,#02060e)" }}>
        <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      </div>
      <Sheen g1="rgba(90,150,255,.5)" opacity={0.35} />
      <Copy eyebrow="Abyssal Aquarium · Night dives" title="Drift with them." line="After-dark gallery pass · ₹ 950" font={F.is} className="bottom-10 left-10" />
    </Stage>
  );
}

/* ---------- M780 · Fractal fly-through (the camera glides down the endless tunnels of a repeating sponge fractal, raymarched) ---------- */
const F780 = R2 + /* glsl */ `
float sdB(vec3 p, vec3 b) { vec3 d = abs(p) - b; return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0)); }
float map(vec3 p) {
  vec3 q = mod(p + 1.0, 2.0) - 1.0;
  float d = sdB(q, vec3(1.0));
  float s = 1.0;
  for (int m = 0; m < 4; m++) {
    vec3 a = mod(q * s, 2.0) - 1.0;
    s *= 3.0;
    vec3 r = abs(1.0 - 3.0 * abs(a));
    float da = max(r.x, r.y), db = max(r.y, r.z), dc = max(r.z, r.x);
    d = max(d, (min(da, min(db, dc)) - 1.0) / s);
  }
  return d;
}
void main() {
  vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float T = uTime * 0.45;
  vec3 ro = vec3(0.12 * sin(T * 0.9), 0.1 * cos(T * 0.7), -T);
  vec3 rd = normalize(vec3(uv, -1.2));
  rd.xy *= r2(uTime * 0.12);
  rd.xz *= r2(0.06 * sin(uTime * 0.31));
  float t = 0.0, it = 0.0;
  for (int i = 0; i < 72; i++) {
    float d = map(ro + rd * t);
    if (d < 0.0008 * t + 0.0005) break;
    t += d;
    it += 1.0;
    if (t > 14.0) break;
  }
  vec3 p = ro + rd * t;
  float ao = 1.0 - it / 72.0;
  float band = 0.5 + 0.5 * sin(p.z * 1.4 + uTime * 0.8);
  vec3 col = mix(vec3(0.3, 0.45, 1.0), vec3(1.0, 0.55, 0.3), band) * ao * ao * 1.4;
  float fog = exp(-t * 0.17);
  col = col * fog + vec3(0.02, 0.02, 0.05) * (1.0 - fog);
  col += vec3(0.5, 0.6, 1.0) * 0.22 * exp(-7.0 * dot(uv, uv));
  col = 1.0 - exp(-col * 1.4);
  gl_FragColor = vec4(col, 1.0);
}`;
function M780() {
  return (
    <Stage className="bg-[#03040a]" g1="rgba(100,130,255,.5)" g2="rgba(255,150,90,.22)">
      <Shader
        frag={F780}
        dpr={0.7}
        fallback="repeating-linear-gradient(90deg,rgba(255,150,90,.1) 0 2px,transparent 2px 60px),radial-gradient(18% 24% at 50% 50%,rgba(140,160,255,.45),transparent 70%),radial-gradient(60% 60% at 50% 50%,#141a3a,#03040a)"
      />
      <Sheen g1="rgba(110,140,255,.5)" opacity={0.35} />
      <Copy eyebrow="Recursion · Sound studio" title="Deeper every bar." line="Spatial headphones · ₹ 32,900" font={F.sy} className="bottom-10 left-10" />
    </Stage>
  );
}

/* ---------- M781 · Lightning (a procedural branching bolt strikes, flickers and re-forms; shader) ---------- */
const F781 = /* glsl */ `
float h1(float n) { return fract(sin(n) * 43758.5453); }
float n1(float x) { float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
float fbm(float x) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * (n1(x) * 2.0 - 1.0); x *= 2.03; a *= 0.5; } return v; }
float mainX(float y, float seed) { return 0.62 + fbm(y * 3.2 + seed * 7.1) * 0.16 + fbm(y * 11.0 + seed * 3.3 + uTime * 1.5) * 0.012; }
float line(float dx, float w) { return w / (abs(dx) + w * 0.6); }
void main() {
  float asp = uRes.x / uRes.y;
  vec2 uv = vUv;
  float y = uv.y;
  float rate = 1.35;
  float k = uTime * rate;
  float seed = floor(k);
  float ph = fract(k);
  float flash = exp(-ph * 5.0) + 0.6 * exp(-abs(ph - 0.16) * 40.0) + 0.4 * exp(-abs(ph - 0.3) * 45.0);
  float inten = 0.3 + flash;
  float dx = (uv.x - mainX(y, seed)) * asp;
  float b = line(dx, 0.0018) * smoothstep(0.0, 0.08, y);
  // three branches leave the main bolt and fork away, shorter and dimmer
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float yb = 0.25 + 0.55 * h1(seed * 3.1 + fi * 1.7);
    float dir = h1(seed + fi * 9.3) > 0.5 ? 1.0 : -1.0;
    float len = 0.12 + 0.16 * h1(seed * 1.3 + fi);
    float s = clamp((yb - y) / len, 0.0, 1.0);
    float on = step(y, yb) * step(yb - len, y);
    float bx = mainX(yb, seed) + dir * (yb - y) * 0.55 + fbm(y * 9.0 + seed + fi * 5.0) * 0.05 * s;
    b += line((uv.x - bx) * asp, 0.0011) * on * (1.0 - s) * 0.8;
  }
  vec3 core = vec3(0.85, 0.9, 1.0);
  vec3 tint = vec3(0.55, 0.45, 1.0);
  vec3 col = mix(tint, core, clamp(b * 0.25, 0.0, 1.0)) * b * 0.16 * inten;
  // sky lit by the strike + a dim storm wash that always drifts
  float cloud = n1(uv.x * 6.0 + uTime * 0.3) * n1(uv.y * 4.0 - uTime * 0.2 + 3.0);
  col += vec3(0.25, 0.22, 0.55) * (0.08 + 0.35 * flash) * (0.4 + cloud) * smoothstep(0.0, 1.0, y);
  col += vec3(0.4, 0.35, 0.9) * 0.22 * flash * exp(-pow((uv.x - 0.62) * asp, 2.0) * 3.0);
  col = 1.0 - exp(-col * 1.3);
  gl_FragColor = vec4(col, 1.0);
}`;
function M781() {
  return (
    <Stage className="bg-[#05040e]" g1="rgba(130,110,255,.5)" g2="rgba(90,160,255,.2)">
      <Shader
        frag={F781}
        fallback="linear-gradient(100deg,transparent 61.6%,rgba(220,225,255,.85) 62%,transparent 62.4%),radial-gradient(22% 60% at 62% 40%,rgba(130,110,255,.35),transparent 70%),linear-gradient(180deg,#141030,#05040e)"
      />
      <Sheen g1="rgba(130,110,255,.5)" opacity={0.35} />
      <Copy eyebrow="Stormcell · Performance" title="Charged in a flash." line="Electrolyte mix · 30 sachets · ₹ 1,299" font={F.sg} className="bottom-10 left-10" />
    </Stage>
  );
}

/* ---------- M782 · Voronoi cells (seeds drift, weighted cells swell and shrink, edges glow; shader) ---------- */
const F782 = /* glsl */ `
vec2 hash2(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
void main() {
  vec2 uv = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec2 p = uv * 5.2 + vec2(uTime * 0.05, 0.0);
  vec2 g = floor(p), f = fract(p);
  float d1 = 9.0, d2 = 9.0;
  vec2 id = vec2(0.0);
  for (int j = -1; j <= 1; j++)
  for (int i = -1; i <= 1; i++) {
    vec2 o = vec2(float(i), float(j));
    vec2 h = hash2(g + o);
    vec2 s = o + 0.5 + 0.42 * sin(uTime * 0.7 + 6.2831 * h);
    float wgt = 0.16 * sin(uTime * 0.9 + h.x * 6.2831);
    float d = length(s - f) - wgt;
    if (d < d1) { d2 = d1; d1 = d; id = g + o; }
    else if (d < d2) { d2 = d; }
  }
  float e = d2 - d1;
  vec2 hh = hash2(id);
  vec3 fill = mix(vec3(0.05, 0.12, 0.2), vec3(0.18, 0.08, 0.22), hh.x) * (0.6 + 0.6 * hh.y);
  fill *= 0.7 + 0.5 * smoothstep(0.9, 0.0, d1);
  vec3 edgeC = mix(vec3(0.2, 0.95, 0.8), vec3(0.55, 0.6, 1.0), hh.y);
  vec3 col = fill + edgeC * (0.012 / (e + 0.012)) * 0.55 + edgeC * smoothstep(0.035, 0.0, e) * 0.6;
  col = 1.0 - exp(-col * 1.3);
  gl_FragColor = vec4(col, 1.0);
}`;
function M782() {
  return (
    <Stage className="bg-[#040a10]" g1="rgba(60,220,190,.5)" g2="rgba(140,120,255,.22)">
      <Shader
        frag={F782}
        fallback="conic-gradient(from 20deg at 30% 40%,#0b2230,#1a1030,#0b2230,#12283a,#0b2230),#040a10"
      />
      <Sheen g1="rgba(60,220,190,.45)" opacity={0.35} />
      <Copy eyebrow="Cellula · Architecture" title="Grown, not drawn." line="Biophilic facade study · from ₹ 4,20,000" font={F.sy} className="left-10 top-10" />
    </Stage>
  );
}

/* ---------- M783 · 3D gradient circles (four gradient-stroked rings tilt and swirl in 3D around a soft core; SVG + GSAP) ---------- */
const RINGS783 = [
  { r: 240, rx: 72, ry: 0, a: "#7c5cff", b: "#26d0ff", spin: 9 },
  { r: 205, rx: 64, ry: 55, a: "#ff5ca8", b: "#ffb36b", spin: 7 },
  { r: 170, rx: 76, ry: 115, a: "#26d0ff", b: "#9dff9a", spin: 11 },
  { r: 135, rx: 58, ry: 200, a: "#ffb36b", b: "#7c5cff", spin: 6 },
];
function M783() {
  const root = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  useAnims(root, (el) => {
    const tilts = Array.from(el.querySelectorAll<HTMLElement>(".m783-tilt"));
    const spins = Array.from(el.querySelectorAll<SVGElement>(".m783-spin"));
    const comets = Array.from(el.querySelectorAll<SVGCircleElement>(".m783-comet"));
    const anims: gsap.core.Animation[] = [];
    tilts.forEach((t, i) => {
      const R = RINGS783[i];
      gsap.set(t, { rotationX: R.rx, rotationY: R.ry, rotation: 0 });
      anims.push(gsap.to(t, { rotationY: `+=${i % 2 ? -360 : 360}`, duration: 14 + i * 3, ease: "none", repeat: -1 }));
      anims.push(gsap.to(t, { rotationX: R.rx - 26, duration: 2.6 + i * 0.5, ease: "sine.inOut", repeat: -1, yoyo: true }));
    });
    spins.forEach((s, i) => anims.push(gsap.to(s, { rotation: i % 2 ? -360 : 360, transformOrigin: "50% 50%", duration: RINGS783[i].spin, ease: "none", repeat: -1 })));
    comets.forEach((c, i) => {
      const L = 2 * Math.PI * RINGS783[i].r;
      anims.push(gsap.fromTo(c, { strokeDashoffset: 0 }, { strokeDashoffset: -L, duration: 2.2 + i * 0.4, ease: "none", repeat: -1 }));
    });
    return anims;
  });
  return (
    <Stage r={root} className="bg-[#06050f]" g1="rgba(124,92,255,.55)" g2="rgba(38,208,255,.22)">
      <div className="absolute right-[10%] top-[calc(50%-270px)] h-[540px] w-[540px]" style={{ perspective: "1100px" }}>
        <div className="absolute inset-[34%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.9),rgba(160,130,255,.45)_35%,transparent_70%)]" aria-hidden />
        {RINGS783.map((R, i) => (
          <div key={i} className="m783-tilt absolute inset-0" style={{ transformStyle: "preserve-3d", transform: `rotateY(${R.ry}deg) rotateX(${R.rx}deg)` }}>
            <svg viewBox="-270 -270 540 540" className="m783-spin absolute inset-0 h-full w-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient id={`${uid}g${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={R.a} />
                  <stop offset=".55" stopColor={R.b} stopOpacity=".55" />
                  <stop offset="1" stopColor={R.b} stopOpacity="0" />
                </linearGradient>
              </defs>
              <circle r={R.r} fill="none" stroke={R.a} strokeOpacity=".12" strokeWidth="14" />
              <circle r={R.r} fill="none" stroke={`url(#${uid}g${i})`} strokeWidth="3" />
              <circle className="m783-comet" r={R.r} fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeDasharray={`28 ${Math.round(2 * Math.PI * R.r)}`} />
            </svg>
          </div>
        ))}
      </div>
      <Copy eyebrow="Orbit Labs · Wearables" title="Always in motion." line="Smart ring tracker · ₹ 21,990" font={F.sg} className="left-10 top-1/2 -translate-y-1/2" />
    </Stage>
  );
}

/* ---------- M784 · HUD reticle (rotating rings and arcs track a target box that locks onto blips; read-outs count; SVG + GSAP) ---------- */
const TARGETS784 = [
  [640, 250],
  [820, 420],
  [520, 470],
  [760, 200],
];
function arc(r: number, a0: number, a1: number) {
  const P = (a: number) => `${(Math.cos((a * Math.PI) / 180) * r).toFixed(2)} ${(Math.sin((a * Math.PI) / 180) * r).toFixed(2)}`;
  return `M${P(a0)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${P(a1)}`;
}
function M784() {
  const root = useRef<HTMLDivElement>(null);
  const tx = useRef<SVGTextElement>(null);
  const ty = useRef<SVGTextElement>(null);
  const tid = useRef<SVGTextElement>(null);
  const ret = useRef<SVGGElement>(null);
  const acc = useRef(0);
  useOn(root);
  useAnims(root, (el) => {
    const g = ret.current;
    if (!g) return;
    const anims: gsap.core.Animation[] = [
      gsap.to(el.querySelector(".m784-ticks"), { rotation: 360, svgOrigin: "0 0", duration: 18, ease: "none", repeat: -1 }),
      gsap.to(el.querySelector(".m784-arcs"), { rotation: -360, svgOrigin: "0 0", duration: 7, ease: "none", repeat: -1 }),
      gsap.to(el.querySelector(".m784-dash"), { rotation: 360, svgOrigin: "0 0", duration: 3.2, ease: "none", repeat: -1 }),
    ];
    const br = el.querySelector(".m784-br");
    const lock = el.querySelector(".m784-lock");
    gsap.set(g, { x: TARGETS784[0][0], y: TARGETS784[0][1] });
    const tl = gsap.timeline({ repeat: -1 });
    TARGETS784.forEach((_, i) => {
      const [x, y] = TARGETS784[(i + 1) % TARGETS784.length];
      tl.to(lock, { opacity: 0, duration: 0.15 })
        .to(br, { scale: 1, svgOrigin: "0 0", duration: 0.3, ease: "power2.out" }, "<")
        .to(g, { x, y, duration: 0.85, ease: "power3.inOut" }, "<")
        .to(br, { scale: 0.62, svgOrigin: "0 0", duration: 0.28, ease: "back.out(2)" })
        .to(lock, { opacity: 1, duration: 0.12 }, "<0.1")
        .to(br, { rotation: `+=90`, svgOrigin: "0 0", duration: 0.3, ease: "power2.inOut" });
    });
    anims.push(tl);
    return anims;
  });
  useTicker(root, (_t, dt) => {
    acc.current += dt;
    if (acc.current < 0.08) return;
    acc.current = 0;
    const g = ret.current;
    if (!g) return;
    const x = Number(gsap.getProperty(g, "x")) || 0;
    const y = Number(gsap.getProperty(g, "y")) || 0;
    if (tx.current) tx.current.textContent = `X ${(x * 1.37).toFixed(2).padStart(7, "0")}`;
    if (ty.current) ty.current.textContent = `Y ${(y * 1.37).toFixed(2).padStart(7, "0")}`;
    if (tid.current) tid.current.textContent = `TRK ${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0")}-${Math.round(900 + Math.hypot(x - 500, y - 350))}M`;
  });
  return (
    <Stage r={root} className="bg-[#030a09]" g1="rgba(70,255,190,.5)" g2="rgba(60,160,255,.2)">
      <div className="absolute inset-0" style={{ background: "linear-gradient(rgba(120,255,200,.06) 1px,transparent 1px) 0 0/48px 48px,linear-gradient(90deg,rgba(120,255,200,.06) 1px,transparent 1px) 0 0/48px 48px" }} aria-hidden />
      <div className="m784-scan b17g1-run" aria-hidden />
      <svg viewBox="0 0 1000 700" preserveAspectRatio="xMaxYMid meet" className="absolute inset-0 h-full w-full" fill="none" stroke="#7dffcf" aria-hidden>
        {TARGETS784.map(([x, y], i) => (
          <path key={i} className="m784-blip b17g1-run" d={`M${x} ${y - 7}L${x + 7} ${y}L${x} ${y + 7}L${x - 7} ${y}Z`} fill="rgba(125,255,207,.6)" stroke="none" style={{ animationDelay: `${-i * 0.3}s` }} />
        ))}
        <g ref={ret} transform={`translate(${TARGETS784[0][0]} ${TARGETS784[0][1]})`}>
          <g className="m784-ticks" strokeOpacity=".7">
            <circle r="150" strokeOpacity=".25" />
            {Array.from({ length: 60 }, (_, i) => {
              const a = (i / 60) * Math.PI * 2;
              const l = i % 5 === 0 ? 14 : 6;
              return <line key={i} x1={Math.cos(a) * 150} y1={Math.sin(a) * 150} x2={Math.cos(a) * (150 - l)} y2={Math.sin(a) * (150 - l)} strokeWidth={i % 5 === 0 ? 2 : 1} />;
            })}
          </g>
          <g className="m784-arcs" strokeWidth="4" strokeLinecap="round">
            {[0, 90, 180, 270].map((a) => (
              <path key={a} d={arc(118, a + 10, a + 62)} />
            ))}
          </g>
          <circle className="m784-dash" r="92" strokeDasharray="4 10" strokeOpacity=".8" />
          <path d="M-190 0H-40M40 0H190M0 -190V-40M0 40V190" strokeOpacity=".55" />
          <g className="m784-br" strokeWidth="3" stroke="#d6ffef">
            <path d="M-62 -38V-62H-38M38 -62H62V-38M62 38V62H38M-38 62H-62V38" />
          </g>
          <circle r="3" fill="#d6ffef" stroke="none" />
          <text className="m784-lock" x="70" y="-70" fill="#d6ffef" stroke="none" fontSize="16" fontFamily={MONO} letterSpacing="3" opacity="1">
            LOCK
          </text>
        </g>
        <g fill="#7dffcf" stroke="none" fontFamily={MONO} fontSize="16" letterSpacing="2">
          <text ref={tx} x="560" y="640">
            X 0876.80
          </text>
          <text ref={ty} x="720" y="640">
            Y 0342.50
          </text>
          <text ref={tid} x="560" y="668" fillOpacity=".7">
            TRK 3F2A-1190M
          </text>
        </g>
      </svg>
      <Copy eyebrow="Vantage Optics · Field series" title="Lock on. Stay on." line="Thermal scope VX-4 · ₹ 1,24,000" font={F.sg} className="left-10 top-10" tone="text-[#e6fff6]" />
    </Stage>
  );
}

/* ---------- M785 · Flip-disc matrix (two-tone discs flip one by one to scroll text, run a wave and tick a clock; CSS + JS) ---------- */
const COLS = 40;
const ROWS = 14;
const GLYPH: Record<string, string[]> = {
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  "0": ["01110", "10011", "10101", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};
/** Text → columns of 7-bit glyph slices (5 wide + 1 gap). */
function textCols(s: string) {
  const out: number[][] = [];
  for (const ch of s) {
    const g = GLYPH[ch] ?? GLYPH[" "];
    for (let x = 0; x < 5; x++) out.push(g.map((row) => (row[x] === "1" ? 1 : 0)));
    out.push([0, 0, 0, 0, 0, 0, 0]);
  }
  return out;
}
const MARQ = textCols("OPEN TILL 2AM   ");
const STATIC785 = (() => {
  const a = new Uint8Array(COLS * ROWS);
  const word = textCols("OPEN");
  const x0 = Math.floor((COLS - (word.length - 1)) / 2);
  word.forEach((col, x) => col.forEach((v, y) => v && x0 + x < COLS && (a[(y + 3) * COLS + x0 + x] = 1)));
  return a;
})();
function M785() {
  const root = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const cur = useRef<Uint8Array>(STATIC785.slice());
  const acc = useRef(0);
  const step = useRef(0);
  useTicker(root, (t, dt) => {
    acc.current += dt;
    if (acc.current < 0.075) return;
    acc.current = 0;
    step.current++;
    const cells = board.current?.children;
    if (!cells) return;
    const next = new Uint8Array(COLS * ROWS);
    const mode = Math.floor(t / 3.4) % 3;
    const ph = (t % 3.4) / 3.4;
    if (mode === 0) {
      // scrolling text, one column per step
      for (let x = 0; x < COLS; x++) {
        const col = MARQ[(x + step.current) % MARQ.length];
        for (let y = 0; y < 7; y++) if (col[y]) next[(y + 3) * COLS + x] = 1;
      }
    } else if (mode === 1) {
      // a travelling sine band
      for (let x = 0; x < COLS; x++) {
        const c = 6.5 + 4.5 * Math.sin(x * 0.32 + t * 3.2);
        for (let y = 0; y < ROWS; y++) if (Math.abs(y - c) < 1.2) next[y * COLS + x] = 1;
      }
    } else {
      // the clock + a seconds bar that fills along the bottom row
      const d = new Date();
      const s = `${String(d.getHours()).padStart(2, "0")}${Math.floor(t * 2) % 2 ? ":" : " "}${String(d.getMinutes()).padStart(2, "0")}`;
      const tc = textCols(s);
      const x0 = Math.floor((COLS - (tc.length - 1)) / 2);
      tc.forEach((col, x) => col.forEach((v, y) => v && x0 + x < COLS && (next[(y + 3) * COLS + x0 + x] = 1)));
      const fill = Math.floor(ph * COLS);
      for (let x = 0; x < fill; x++) next[(ROWS - 1) * COLS + x] = 1;
    }
    const c0 = cur.current;
    for (let i = 0; i < next.length; i++) {
      if (next[i] !== c0[i]) {
        (cells[i] as HTMLElement).classList.toggle("on", next[i] === 1);
        c0[i] = next[i];
      }
    }
  });
  return (
    <Stage r={root} className="bg-[#0b0c10]" g1="rgba(255,200,60,.5)" g2="rgba(255,120,60,.2)">
      <div className="absolute left-1/2 top-[52%] w-[min(86%,980px)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] border border-white/10 bg-[#101218] p-5 shadow-[0_30px_80px_rgba(0,0,0,.5)]">
        <div ref={board} className="grid gap-[4px]" style={{ gridTemplateColumns: `repeat(${COLS},1fr)`, perspective: "600px" }}>
          {Array.from(STATIC785, (v, i) => (
            <div key={i} className={`m785-d${v ? " on" : ""}`} style={{ "--d": `${(i % COLS) * 4}ms` } as CSSProperties} />
          ))}
        </div>
      </div>
      <Sheen g1="rgba(255,200,60,.45)" opacity={0.3} />
      <div className="pointer-events-none absolute left-10 top-8 z-40 flex items-baseline gap-6 text-white">
        <p className="text-[13px] uppercase tracking-[0.3em] opacity-70">Night Line Coffee · Late bar</p>
        <h3 className="text-[clamp(32px,3.2vw,52px)] font-[650] tracking-[-0.03em]" style={{ fontFamily: F.sy }}>
          Open late.
        </h3>
        <p className="text-[15px] opacity-75">Flat white · ₹ 180</p>
      </div>
    </Stage>
  );
}

/* ---------- M786 · ASCII plasma field (drifting plasma drawn in monospace glyphs; the pointer pushes the field outward; canvas) ---------- */
const RAMP786 = " .:-=+*#%@";
const COL786 = ["rgba(60,140,170,.55)", "rgba(70,210,200,.75)", "rgba(140,150,255,.85)", "rgba(230,110,230,.95)", "rgba(255,230,250,1)"];
function M786() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cs = useCanvas2D(cv);
  const buf = useRef<{ ch: Int8Array; bk: Int8Array }>({ ch: new Int8Array(0), bk: new Int8Array(0) });
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.6 + 0.3 * Math.sin(t * 0.7)), h * (0.5 + 0.32 * Math.sin(t * 1.15 + 0.6))],
    (px, py, _dt, t) => {
      const { ctx, w, h } = cs.current;
      if (!ctx) return;
      const CW = 14;
      const CH = 22;
      const cols = Math.ceil(w / CW);
      const rows = Math.ceil(h / CH);
      const n = cols * rows;
      if (buf.current.ch.length !== n) buf.current = { ch: new Int8Array(n), bk: new Int8Array(n) };
      const { ch, bk } = buf.current;
      const RR = 170 * 170;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CW + CW / 2;
          const y = r * CH + CH / 2;
          const dx = x - px;
          const dy = y - py;
          const k = Math.exp(-(dx * dx + dy * dy) / RR);
          // sample closer to the pointer, so the pattern looks pushed outward around it
          const sx = x - dx * k * 0.85;
          const sy = y - dy * k * 0.85;
          let v = (Math.sin(sx * 0.012 + t * 0.9) + Math.sin(sy * 0.017 - t * 1.2) + Math.sin((sx + sy) * 0.008 + t * 0.6) + Math.sin(Math.hypot(sx - w * 0.6, sy - h * 0.5) * 0.014 - t * 1.5)) / 4;
          v = Math.min(0.999, Math.max(0, v * 0.5 + 0.5 + k * 0.22));
          const i = r * cols + c;
          ch[i] = Math.floor(v * RAMP786.length);
          bk[i] = Math.min(4, Math.floor(v * 5));
        }
      }
      ctx.fillStyle = "#06050d";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `600 15px ${MONO}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let b = 0; b < 5; b++) {
        ctx.fillStyle = COL786[b];
        for (let i = 0; i < n; i++) {
          if (bk[i] !== b || ch[i] === 0) continue;
          ctx.fillText(RAMP786[ch[i]], (i % cols) * CW + CW / 2, Math.floor(i / cols) * CH + CH / 2);
        }
      }
    },
  );
  return (
    <Stage r={root} className="bg-[#06050d]" g1="rgba(160,110,255,.5)" g2="rgba(60,220,200,.2)">
      <div className="absolute inset-0" style={{ background: "radial-gradient(30% 40% at 60% 50%,rgba(160,110,255,.25),transparent 70%),#06050d" }}>
        <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      </div>
      <Sheen g1="rgba(160,110,255,.5)" opacity={0.35} />
      <Copy eyebrow="Static Club · Live sets" title="Feel the frequency." line="Friday night pass · ₹ 1,500" font={F.sg} className="bottom-10 left-10" />
      <Dot r={dot} />
    </Stage>
  );
}

/* ---------- M787 · ASCII image near cursor (a photo as a Bayer-dithered dot field; glyphs light up round the pointer; canvas) ---------- */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const RAMP787 = ".:-+*=%#@";
const IMG787 = scene(1, 800, 500);
function M787() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cs = useCanvas2D(cv);
  const lum = useRef<{ d: Float32Array; w: number; h: number } | null>(null);
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let dead = false;
    const stop = whenNear(c, async () => {
      const SW = 240;
      const SH = 150;
      const off = document.createElement("canvas");
      off.width = SW;
      off.height = SH;
      const g = off.getContext("2d");
      if (!g) return;
      const d = new Float32Array(SW * SH);
      try {
        const img = new Image();
        img.src = IMG787;
        await img.decode();
        g.drawImage(img, 0, 0, SW, SH);
        const px = g.getImageData(0, 0, SW, SH).data;
        for (let i = 0; i < SW * SH; i++) d[i] = (px[i * 4] * 0.3 + px[i * 4 + 1] * 0.59 + px[i * 4 + 2] * 0.11) / 255;
      } catch {
        // tainted or failed: a soft procedural glow instead
        for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) d[y * SW + x] = Math.exp(-(((x - SW / 2) / 60) ** 2 + ((y - SH / 2) / 45) ** 2));
      }
      off.width = 1;
      off.height = 1;
      if (!dead) lum.current = { d, w: SW, h: SH };
    });
    return () => {
      dead = true;
      stop();
      lum.current = null;
    };
  }, []);
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.58 + 0.28 * Math.sin(t * 0.6)), h * (0.5 + 0.28 * Math.cos(t * 0.95))],
    (px, py, _dt, t) => {
      const { ctx, w, h } = cs.current;
      const L = lum.current;
      if (!ctx || !L) return;
      const CELL = 10;
      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      const zoom = 1.1 + 0.06 * Math.sin(t * 0.35);
      const panX = 0.03 * Math.sin(t * 0.23);
      const panY = 0.025 * Math.cos(t * 0.31);
      const sa = w / h;
      const ia = L.w / L.h;
      const RR = 150 * 150;
      ctx.fillStyle = "#0b0a08";
      ctx.fillRect(0, 0, w, h);
      const paths = [new Path2D(), new Path2D(), new Path2D()];
      const glyphs: number[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL + CELL / 2;
          const y = r * CELL + CELL / 2;
          let u = (x / w - 0.5) / zoom;
          let v = (y / h - 0.5) / zoom;
          if (sa > ia) v *= ia / sa;
          else u *= sa / ia;
          const ix = Math.min(L.w - 1, Math.max(0, Math.floor((u + 0.5 + panX) * L.w)));
          const iy = Math.min(L.h - 1, Math.max(0, Math.floor((v + 0.5 + panY) * L.h)));
          const dx = x - px;
          const dy = y - py;
          const k = Math.exp(-(dx * dx + dy * dy) / RR);
          const lv = Math.min(1, L.d[iy * L.w + ix] * (0.6 + 0.9 * k) + 0.03);
          if (k > 0.35) {
            glyphs.push(x, y, lv);
            continue;
          }
          if (lv <= BAYER[(c & 3) + (r & 3) * 4]) continue;
          const rad = 1 + lv * 2.4;
          const p = paths[lv < 0.35 ? 0 : lv < 0.65 ? 1 : 2];
          p.moveTo(x + rad, y);
          p.arc(x, y, rad, 0, Math.PI * 2);
        }
      }
      ctx.fillStyle = "rgba(200,180,150,.45)";
      ctx.fill(paths[0]);
      ctx.fillStyle = "rgba(240,215,175,.7)";
      ctx.fill(paths[1]);
      ctx.fillStyle = "rgba(255,240,215,.92)";
      ctx.fill(paths[2]);
      ctx.font = `700 12px ${MONO}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffb84d";
      for (let i = 0; i < glyphs.length; i += 3) ctx.fillText(RAMP787[Math.min(RAMP787.length - 1, Math.floor(glyphs[i + 2] * RAMP787.length))], glyphs[i], glyphs[i + 1]);
    },
  );
  return (
    <Stage r={root} className="bg-[#0b0a08]" g1="rgba(255,180,90,.5)" g2="rgba(255,120,80,.2)">
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle,rgba(11,10,8,0) 1.4px,rgba(11,10,8,.85) 2.2px) 0 0/10px 10px,url("${IMG787}") center/cover` }}>
        <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      </div>
      <Sheen g1="rgba(255,180,90,.45)" opacity={0.3} />
      <Copy eyebrow="Grain Press · Prints" title="Every dot, by hand." line="Risograph print A2 · ₹ 3,200" font={F.fr} className="bottom-10 left-10" />
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "M776", name: "Glass fractal solid", how: "A bevelled glass cube turns slowly while a fractal morphs and an orb pulses inside it (raymarched shader)", kind: "play", C: M776 },
  { code: "M777", name: "Crystalline field", how: "A field of faceted 3D crystals turns; those near the pointer tilt toward it and glint (OGL mesh, scripted pointer)", kind: "play", C: M777 },
  { code: "M778", name: "Clockwork gears", how: "Meshed brass gears turn at true tooth ratios, a balance wheel swings, sparks fly from each contact (SVG + GSAP + CSS)", kind: "play", C: M778 },
  { code: "M779", name: "Jellyfish", how: "Glowing jellyfish pulse their bells to swim upward, tentacles trailing on soft chains (canvas)", kind: "play", C: M779 },
  { code: "M780", name: "Fractal fly-through", how: "The camera glides endlessly down the tunnels of a self-similar sponge fractal (raymarched shader)", kind: "play", C: M780 },
  { code: "M781", name: "Lightning", how: "A procedural branching bolt strikes, flickers, fades and re-forms in a new shape, lighting the sky (shader)", kind: "play", C: M781 },
  { code: "M782", name: "Voronoi cells", how: "Voronoi cells drift, swell and shrink while their shared edges glow (shader)", kind: "play", C: M782 },
  { code: "M783", name: "3D gradient circles", how: "Four gradient-stroked rings tilt and swirl in 3D round a soft core, a bright comet running each (SVG + GSAP)", kind: "play", C: M783 },
  { code: "M784", name: "HUD reticle", how: "Rotating rings and arcs carry a target box that glides and locks onto blips while read-outs tick (SVG + GSAP)", kind: "play", C: M784 },
  { code: "M785", name: "Flip-disc matrix", how: "Two-tone discs flip one by one to scroll text, run a wave and tick a clock (CSS + JS)", kind: "play", C: M785 },
  { code: "M786", name: "ASCII plasma field", how: "Drifting plasma drawn in monospace glyphs; the pointer pushes the field outward (canvas, scripted pointer)", kind: "play", C: M786 },
  { code: "M787", name: "ASCII image near cursor", how: "A photo shown as a Bayer-dithered dot field; glyphs light up round the pointer (canvas, scripted pointer)", kind: "play", C: M787 },
];
