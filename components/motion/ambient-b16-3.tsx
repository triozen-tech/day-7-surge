"use client";

// Ambient motions, batch 16 · group 3 (MOTION-MENU M740–M751): a spiral galaxy, a nebula emitter, a warp tunnel, a
// hyperspeed road, fireworks, a ball pit, an origami flock, foil shards in the wind, an eroding particle sphere, a network
// sphere, firing neurons and a spring mesh. Small focused demos for /lab/motion. Every demo is "play": it starts when it
// is on screen, loops, and pauses off screen. Each stage has a CSS-only glow loop that never stops, and a second one ON
// TOP of the full-bleed canvas. Pointer demos drive a visible fake pointer ring by themselves; the real mouse takes over
// while it moves. WebGL builds only within ~1 screen of the viewport, runs at dpr 1 and releases its context on unmount.
// ?static=1 / reduced motion: no JS motion, CSS loops stop, the markup shows a sensible final state.
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { createShader, type GLHandle } from "@/lib/gl";
import { useTicker } from "@/components/fx/shared";
import type { MotionDef } from "./types";

const F = {
  sg: "'Space Grotesk Variable', system-ui, sans-serif",
  fr: "'Fraunces Variable', Georgia, serif",
  is: "'Instrument Serif', Georgia, serif",
  sy: "'Syne Variable', 'Space Grotesk Variable', system-ui, sans-serif",
  mr: "'Manrope Variable', system-ui, sans-serif",
};

const CSS = `
.b16g3-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b16g3-drift 5.6s linear infinite alternate;will-change:transform}
@keyframes b16g3-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b16g3-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);pointer-events:none;z-index:45;opacity:0;transition:opacity .25s}
.b16g3-run{animation-play-state:paused !important}
.b16g3-on .b16g3-run{animation-play-state:running !important}

/* M743 boost pill */
.m743-pill{transition:transform .2s ease,background-color .2s ease,box-shadow .2s ease}
.m743-pill.is-on{transform:scale(.94);background:rgba(255,80,140,.9);box-shadow:0 0 40px rgba(255,80,140,.6)}

/* M746 origami flock */
.m746-pan{position:absolute;left:0;bottom:0;width:200%;animation:m746-pan linear infinite}
@keyframes m746-pan{to{transform:translate3d(-50%,0,0)}}
.m746-fly{position:absolute;top:0;width:130px;height:90px;margin:-45px 0 0 -65px;will-change:transform}
.m746-scale{position:absolute;inset:0;perspective:520px}
.m746-bird{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(58deg) rotateZ(90deg)}
.m746-body{position:absolute;left:57px;top:0;width:16px;height:90px;clip-path:polygon(50% 0,100% 38%,50% 100%,0 38%);background:linear-gradient(90deg,#efe6d8 50%,#cdbfae 50%)}
.m746-w{position:absolute;top:18px;width:58px;height:48px;transform-style:preserve-3d;animation:m746-flap .62s ease-in-out infinite alternate}
.m746-w::after{content:"";position:absolute;inset:0;background:#3b2a3f;clip-path:inherit;opacity:0;animation:inherit;animation-name:m746-shade}
.m746-wl{right:72px;transform-origin:100% 50%;clip-path:polygon(100% 0,100% 100%,0 22%);background:linear-gradient(162deg,#fbf6ee 0 46%,#ddd0bf 46% 100%)}
.m746-wr{left:72px;transform-origin:0 50%;clip-path:polygon(0 0,0 100%,100% 22%);background:linear-gradient(198deg,#fbf6ee 0 46%,#ddd0bf 46% 100%);animation-name:m746-flapr}
.m746-wr::after{animation-name:m746-shade}
@keyframes m746-flap{0%{transform:rotateY(-62deg)}100%{transform:rotateY(38deg)}}
@keyframes m746-flapr{0%{transform:rotateY(62deg)}100%{transform:rotateY(-38deg)}}
@keyframes m746-shade{0%{opacity:.34}100%{opacity:0}}

html.is-static .b16g3-glow,html.is-static .b16g3-run,html.is-static .m746-pan,html.is-static .m746-w,html.is-static .m746-w::after{animation:none}
html.is-static {
  .b16g3-glow,.b16g3-run,.m746-pan,.m746-w,.m746-w::after{animation:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop (never frozen). */
function Stage({ r, children, className = "", g1, g2, style }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; className?: string; g1?: string; g2?: string; style?: CSSProperties }) {
  return (
    <div ref={r} className={`relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0d16] text-[#eef2ff] ${className}`} style={style}>
      <style href="b16g3-css" precedence="default">
        {CSS}
      </style>
      <div className="b16g3-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

/** The CSS glow loop again, ON TOP of full-bleed canvases (screen blend), so those demos never freeze. */
const Sheen = ({ g1, opacity = 0.45 }: { g1?: string; opacity?: number }) => (
  <div className="b16g3-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity, zIndex: 35 } as CSSProperties} aria-hidden />
);

/** The visible fake pointer ring. */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => <div ref={r} className="b16g3-dot" aria-hidden />;

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

/** CSS-driven demos: toggles `b16g3-on` on the root while it is on screen (the paused keyframes run only then). */
function useOn(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("b16g3-on", e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("b16g3-on");
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

type OGL = typeof import("ogl");
type GLApi = { ogl: OGL; gl: InstanceType<OGL["Renderer"]>["gl"]; scene: InstanceType<OGL["Transform"]> };
type GLStep = (t: number, w: number, h: number) => void;

/**
 * Point / line / triangle scenes (createShader only draws one full-screen triangle). Same rules as lib/gl: OGL loaded
 * lazily, built only near the viewport, dpr 1, drawn only while on screen (its clock pauses off screen), context lost on
 * unmount. The CSS fallback stays underneath; the canvas fades in after its first frame.
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

const gauss = () => {
  let u = 0;
  for (let i = 0; i < 4; i++) u += Math.random();
  return (u - 2) / 0.58;
};

/** GLSL helpers for the point scenes: a simple perspective projection and rotations. */
const PROJ = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
vec4 proj(vec3 p, float cam, float focal) {
  float z = cam - p.z;
  vec2 q = p.xy * focal / z;
  q.x *= uRes.y / uRes.x;
  return vec4(q, clamp((z - 0.5) / 10.0, 0.0, 1.0) * 2.0 - 1.0, 1.0);
}
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
`;

const NOISE3 = /* glsl */ `
float h3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vn(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(h3(i + vec3(0.0, 1.0, 0.0)), h3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(h3(i + vec3(0.0, 0.0, 1.0)), h3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(h3(i + vec3(0.0, 1.0, 1.0)), h3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
`;

/** Soft additive point (premultiplied output, blended ONE/ONE). */
const PT_FRAG = /* glsl */ `
precision highp float;
varying vec3 vCol;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a = a * a * vA;
  gl_FragColor = vec4(vCol * a, a);
}`;

/** Additive transparent program (no depth) for glowing points / lines. */
function addProgram(api: GLApi, vertex: string, fragment: string) {
  const { ogl, gl } = api;
  const p = new ogl.Program(gl, { vertex, fragment, uniforms: { uTime: { value: 0 }, uRes: { value: [1, 1] } }, transparent: true, depthTest: false, depthWrite: false, cullFace: false });
  p.setBlendFunc(gl.ONE, gl.ONE);
  return p;
}

/* ---------- M740 · Spiral galaxy (variant of M739: a tilted 3D point galaxy with differential spin, OGL points) ---------- */
const V740 = PROJ + /* glsl */ `
attribute vec3 position;
attribute vec4 aRand;
varying vec3 vCol;
varying float vA;
void main() {
  float r = position.x;
  float a = position.y - uTime * 0.3 / (0.32 + r);
  vec3 p = vec3(cos(a) * r, position.z, sin(a) * r);
  p = rotX(1.08 + 0.08 * sin(uTime * 0.21)) * rotY(0.25) * p;
  vec4 q = proj(p, 2.6, 2.0);
  q.x += 0.2;
  gl_Position = q;
  float z = 2.6 - p.z;
  float tw = 0.7 + 0.3 * sin(uTime * (1.5 + aRand.z * 3.0) + aRand.w * 6.28);
  gl_PointSize = (1.2 + aRand.x * aRand.x * 3.4) * (2.6 / z) * uRes.y / 680.0;
  vec3 core = vec3(1.0, 0.8, 0.55);
  vec3 arm = vec3(0.42, 0.56, 1.0);
  vCol = mix(core, arm, smoothstep(0.06, 0.7, r));
  vCol = mix(vCol, vec3(1.0, 0.42, 0.75), step(0.94, aRand.y) * smoothstep(0.2, 0.5, r));
  vA = tw * (0.5 + 0.5 * aRand.x) * mix(0.4, 1.0, smoothstep(0.0, 0.3, r)) * (1.0 - smoothstep(0.9, 1.3, r) * 0.7);
}`;
const build740 = (api: GLApi): GLStep => {
  const { ogl, gl, scene } = api;
  const N = 9000;
  const pos = new Float32Array(N * 3);
  const rr = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    let r: number, a: number, y: number;
    if (i < 1400) {
      r = Math.pow(Math.random(), 2) * 0.3 + 0.01;
      a = Math.random() * Math.PI * 2;
      y = gauss() * 0.07 * (1 - r * 2);
    } else {
      const arm = i % 3;
      r = Math.pow(Math.random(), 1.6) * 1.15 + 0.04;
      a = (arm / 3) * Math.PI * 2 + r * 5.2 + gauss() * 0.3 * (1.1 - r * 0.5);
      y = gauss() * 0.045 * (1.2 - r * 0.6);
    }
    pos.set([r, a, y], i * 3);
    rr.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }
  const geo = new ogl.Geometry(gl, { position: { size: 3, data: pos }, aRand: { size: 4, data: rr } });
  const prog = addProgram(api, V740, PT_FRAG);
  const mesh = new ogl.Mesh(gl, { mode: gl.POINTS, geometry: geo, program: prog });
  mesh.setParent(scene);
  return (t, w, h) => {
    prog.uniforms.uTime.value = t;
    prog.uniforms.uRes.value = [w, h];
  };
};
function M740() {
  return (
    <Stage className="bg-[#04040b]" g1="rgba(110,120,255,.55)" g2="rgba(255,170,120,.2)">
      <div className="absolute inset-0 bg-[radial-gradient(30%_36%_at_60%_50%,rgba(255,190,130,.16),transparent_70%)]" aria-hidden />
      <GLScene build={build740} fallback="radial-gradient(18% 22% at 60% 50%,rgba(255,210,160,.45),transparent 70%),radial-gradient(42% 30% at 60% 50%,rgba(110,130,255,.25),transparent 70%),#04040b" />
      <Sheen g1="rgba(120,130,255,.55)" opacity={0.4} />
      <Copy eyebrow="Halo Observatory · Night sessions" title="Look further up." line="Dark-sky stargazing pass · ₹ 1,800" font={F.fr} className="bottom-10 left-10" />
    </Stage>
  );
}

/* ---------- M741 · Nebula emitter (variant of M15: particles pour out of a pulsing core with colour-shifting trails) ---------- */
type P741 = { x: number; y: number; px: number; py: number; vx: number; vy: number; age: number; life: number; hue: number; s: number };
function M741() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const cs = useCanvas2D(cv);
  const ps = useRef<P741[]>([]);
  const acc = useRef(0);
  useTicker(root, (t, dt0) => {
    const { ctx, w, h } = cs.current;
    if (!ctx) return;
    const dt = Math.min(dt0, 0.05);
    const cx = w * 0.62;
    const cy = h * 0.5;
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
    acc.current += dt * (180 + pulse * 160);
    const list = ps.current;
    while (acc.current > 1) {
      acc.current -= 1;
      if (list.length > 700) break;
      const a = Math.random() * Math.PI * 2;
      const sp = (30 + Math.random() * 110) * (1 + pulse * 0.7);
      const r0 = Math.random() * 14;
      const x = cx + Math.cos(a) * r0;
      const y = cy + Math.sin(a) * r0;
      list.push({ x, y, px: x, py: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, age: 0, life: 2.2 + Math.random() * 2.6, hue: 265 + Math.random() * 40, s: 0.8 + Math.random() * 2.2 });
    }
    // trails: fade the old frame instead of clearing it
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(6,4,16,0.13)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.age += dt;
      if (p.age > p.life) {
        list.splice(i, 1);
        continue;
      }
      // a gentle swirl + drag, like gas leaving the nursery
      const sw = 0.55 * dt;
      const vx = p.vx - p.vy * sw;
      const vy = p.vy + p.vx * sw;
      const drag = Math.pow(0.82, dt);
      p.vx = vx * drag;
      p.vy = vy * drag;
      p.px = p.x;
      p.py = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const k = p.age / p.life;
      const alpha = Math.sin(Math.PI * Math.min(1, k * 1.15)) * 0.75;
      ctx.strokeStyle = `hsla(${(p.hue + k * 140) % 360},90%,${62 + k * 10}%,${alpha.toFixed(3)})`;
      ctx.lineWidth = p.s * (1 + k);
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    // the pulsing core
    const R = 60 + pulse * 46;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, `rgba(255,236,255,${0.55 + pulse * 0.3})`);
    g.addColorStop(0.3, `rgba(200,120,255,${0.22 + pulse * 0.15})`);
    g.addColorStop(1, "rgba(120,60,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  });
  return (
    <Stage r={root} className="bg-[#060410]" g1="rgba(170,90,255,.55)" g2="rgba(80,220,255,.22)">
      <div className="absolute inset-0" style={{ background: "radial-gradient(14% 22% at 62% 50%,rgba(240,190,255,.5),transparent 70%),radial-gradient(40% 50% at 62% 50%,rgba(140,70,255,.25),transparent 70%),#060410" }}>
        <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      </div>
      <Sheen g1="rgba(170,100,255,.55)" opacity={0.4} />
      <Copy eyebrow="Nursery Labs · Skincare" title="Born in light." line="Nebula night serum 30 ml · ₹ 2,450" font={F.is} className="left-10 top-1/2 -translate-y-1/2" />
    </Stage>
  );
}

/* ---------- M742 · Warp-drive tunnel (variant of M15: star streaks rush at you, faster as the pointer nears the centre) ---------- */
const F742 = /* glsl */ `
uniform float uPhase, uSpeed;
float h1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
void main() {
  vec2 p = (vUv - 0.5) * uRes / min(uRes.x, uRes.y);
  float r = length(p);
  float a = atan(p.y, p.x) / 6.28318 + 0.5;
  vec3 col = vec3(0.01, 0.012, 0.035);
  float streak = 0.05 + uSpeed * 0.06;
  for (int L = 0; L < 4; L++) {
    float fl = float(L);
    float N = 70.0 + fl * 45.0;
    float cell = floor(a * N);
    float fa = fract(a * N) - 0.5;
    float h = h1(cell + fl * 91.7);
    float h2 = h1(cell * 1.7 + fl * 13.3);
    float z = fract(h * 5.0 - uPhase * (0.16 + 0.12 * h2));
    float head = 0.03 / (z + 0.035);
    float tail = head * max(0.05, 1.0 - streak * (1.0 + 2.0 * (1.0 - z)));
    float along = smoothstep(tail, head, r) * (1.0 - smoothstep(head, head + 0.012, r));
    float arc = abs(fa) / N * 6.28318 * r;
    float w = 0.0012 + 0.0035 * (1.0 - z);
    float line = smoothstep(w, 0.0, arc) * along * smoothstep(1.0, 0.75, z);
    vec3 sc = mix(vec3(0.55, 0.7, 1.0), vec3(1.0, 0.82, 0.95), h2);
    col += sc * line * (0.8 + 0.2 * uSpeed);
  }
  col += vec3(0.35, 0.45, 1.0) * exp(-r * 6.0) * (0.22 + 0.12 * uSpeed);
  col *= 0.45 + 0.55 * smoothstep(1.3, 0.2, r);
  gl_FragColor = vec4(col, 1.0);
}`;
function M742() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const read = useRef<HTMLSpanElement>(null);
  const s = useRef({ speed: 1, phase: 0 });
  usePointer(
    root,
    dot,
    (t, w, h) => {
      // the ring spirals in to the centre and back out, so the warp keeps surging and easing
      const k = 0.5 + 0.5 * Math.cos(t * 0.95);
      const a = t * 0.7;
      return [w / 2 + Math.cos(a) * w * 0.4 * k, h / 2 + Math.sin(a) * h * 0.38 * k];
    },
    (x, y, dt, _t) => {
      const el = root.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const d = Math.min(1, Math.hypot((x - w / 2) / (w / 2), (y - h / 2) / (h / 2)));
      const target = 1 + 5 * Math.pow(1 - d, 2);
      const S = s.current;
      S.speed += (target - S.speed) * Math.min(1, dt * 3);
      S.phase += S.speed * dt;
      if (read.current) read.current.textContent = `${S.speed.toFixed(1)}×`;
    },
  );
  return (
    <Stage r={root} className="cursor-crosshair bg-[#02030a]" g1="rgba(90,130,255,.55)" g2="rgba(255,140,220,.2)">
      <Shader
        frag={F742}
        fallback="repeating-conic-gradient(from 0deg at 50% 50%,rgba(150,180,255,.16) 0 .6deg,transparent .6deg 7deg),radial-gradient(circle at 50% 50%,rgba(90,120,255,.35),#02030a 60%)"
        uniforms={() => ({ uPhase: { value: 0 }, uSpeed: { value: 1 } })}
        onFrame={(u) => {
          u.uPhase.value = s.current.phase;
          u.uSpeed.value = s.current.speed;
        }}
      />
      <Sheen g1="rgba(110,140,255,.55)" opacity={0.4} />
      <Copy eyebrow="Parallax Audio · Wireless" title="Faster than sound." line="Pulse earbuds · ₹ 7,990 · steer to the centre to boost" className="bottom-10 left-10" />
      <div className="pointer-events-none absolute right-10 top-10 z-40 rounded-full border border-white/20 bg-black/30 px-5 py-2 text-[14px] tracking-[0.2em] text-white/80" style={{ fontFamily: F.sg }}>
        WARP <span ref={read}>1.0×</span>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ---------- M743 · Hyperspeed road (variant of M742: road lines and light trails rush to a vanishing point; hold boosts) ---------- */
const F743 = /* glsl */ `
uniform float uPhase, uSpeed;
float h1(float n) { return fract(sin(n * 127.1) * 43758.5453); }
void main() {
  vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float y = p.y - 0.08;
  float fov = 1.0 + (uSpeed - 1.0) * 0.16;
  vec3 sky = mix(vec3(0.17, 0.04, 0.22), vec3(0.02, 0.02, 0.07), smoothstep(0.0, 0.45, y));
  float vg = exp(-length(vec2(p.x * 0.7, y * 2.2)) * 4.0);
  vec3 horizon = vec3(1.0, 0.35, 0.6);
  vec3 col = sky + horizon * vg * (0.32 + 0.08 * uSpeed);
  if (y < 0.0) {
    float z = 0.32 / max(-y, 0.001);
    float x = p.x * z / fov;
    float zz = z + uPhase * 8.0;
    float aa = z * 0.012;
    vec3 c = vec3(0.025, 0.025, 0.05);
    c += vec3(0.4, 0.5, 1.0) * smoothstep(0.05 + aa, 0.0, abs(abs(x) - 3.2)) * 0.9;
    float dash = step(0.55, fract(zz * 0.12));
    c += vec3(0.85) * smoothstep(0.04 + aa, 0.0, abs(abs(x) - 1.05)) * dash * 0.7;
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      bool away = fi < 2.0;
      float lane = away ? (-2.4 + fi * 0.75) : (1.65 + (fi - 2.0) * 0.75);
      float k = 0.05 + 0.02 * fi;
      float s = fract(zz * k + h1(fi + 1.0) + (away ? -uPhase * 1.2 : uPhase * 2.5));
      float len = 0.22 + 0.12 * uSpeed;
      float seg = smoothstep(0.0, 0.03, s) * smoothstep(len, 0.0, s);
      float d = abs(x - lane);
      float core = smoothstep(0.06 + aa, 0.0, d);
      float halo = exp(-d * 4.0) * 0.25;
      vec3 tc = away ? vec3(1.0, 0.18, 0.3) : vec3(0.7, 0.9, 1.0);
      c += tc * (core + halo) * seg * 1.4;
    }
    float lamp = smoothstep(0.12 + aa * 2.0, 0.0, abs(abs(x) - 3.9)) * smoothstep(0.08, 0.0, abs(fract(zz * 0.08) - 0.5));
    c += vec3(1.0, 0.75, 0.45) * lamp;
    col = mix(sky + horizon * 0.22, c, exp(-z * 0.05));
  }
  gl_FragColor = vec4(col, 1.0);
}`;
const CYC743 = 4.2;
function M743() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const s = useRef({ speed: 1, phase: 0, realHold: false, on: false });
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const down = () => (s.current.realHold = true);
    const up = () => (s.current.realHold = false);
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);
  const pillPos = (w: number, h: number): [number, number] => {
    const p = pill.current;
    return p ? [p.offsetLeft + p.offsetWidth / 2, p.offsetTop + p.offsetHeight / 2] : [w * 0.85, h * 0.85];
  };
  usePointer(
    root,
    dot,
    (t, w, h) => {
      // wander → glide onto the pill → hold it down → glide away
      const c = t % CYC743;
      const [px, py] = pillPos(w, h);
      const wx = w * (0.6 + 0.08 * Math.sin(t * 1.3));
      const wy = h * (0.55 + 0.1 * Math.cos(t * 1.1));
      if (c < 1.6) return [wx, wy];
      if (c < 2.1) {
        const k = gsap.parseEase("power2.inOut")((c - 1.6) / 0.5);
        return [wx + (px - wx) * k, wy + (py - wy) * k];
      }
      if (c < 3.6) return [px + Math.sin(t * 9) * 2, py];
      const k = gsap.parseEase("power2.inOut")((c - 3.6) / 0.6);
      return [px + (wx - px) * k, py + (wy - py) * k];
    },
    (_x, _y, dt, t, live) => {
      const S = s.current;
      const c = t % CYC743;
      const hold = live ? S.realHold : c >= 2.1 && c < 3.6;
      if (hold !== S.on) {
        S.on = hold;
        pill.current?.classList.toggle("is-on", hold);
      }
      const target = hold ? 3.4 : 1;
      S.speed += (target - S.speed) * Math.min(1, dt * (hold ? 2.2 : 1.4));
      S.phase += S.speed * dt * 0.5;
    },
  );
  return (
    <Stage r={root} className="select-none bg-[#05030c]" g1="rgba(255,90,160,.55)" g2="rgba(90,140,255,.25)">
      <Shader
        frag={F743}
        fallback="linear-gradient(180deg,#05030c 0%,#2a0a36 41%,#0b0812 42%,#05030c 100%)"
        uniforms={() => ({ uPhase: { value: 0 }, uSpeed: { value: 1 } })}
        onFrame={(u) => {
          u.uPhase.value = s.current.phase;
          u.uSpeed.value = s.current.speed;
        }}
      />
      <Sheen g1="rgba(255,100,170,.55)" opacity={0.38} />
      <Copy eyebrow="Nightline Motors · Electric" title="Own the night road." line="Model N saloon · from ₹ 24.9 L ex-showroom" font={F.sy} className="left-10 top-10" />
      <div ref={pill} className="m743-pill absolute bottom-10 right-10 z-40 rounded-full border border-white/25 bg-white/10 px-7 py-3 text-[15px] font-[600] tracking-[0.08em] text-white" style={{ fontFamily: F.sg }}>
        Hold to boost
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

/* ---------- M744 · Fireworks (variant of M15: rockets climb, burst into sparks that fall with gravity, canvas) ---------- */
type R744 = { x: number; y: number; px: number; py: number; vx: number; vy: number; hue: number; ty: number };
type S744 = { x: number; y: number; px: number; py: number; vx: number; vy: number; age: number; life: number; hue: number };
function M744() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const cs = useCanvas2D(cv);
  const st = useRef({ rockets: [] as R744[], sparks: [] as S744[], next: 0 });
  useTicker(root, (_t, dt0) => {
    const { ctx, w, h } = cs.current;
    if (!ctx) return;
    const dt = Math.min(dt0, 0.05);
    const S = st.current;
    S.next -= dt;
    if (S.next <= 0) {
      S.next = 0.32 + Math.random() * 0.45;
      const x = w * (0.25 + Math.random() * 0.7);
      S.rockets.push({ x, y: h + 10, px: x, py: h + 10, vx: (Math.random() - 0.5) * 60, vy: -(h * (1.05 + Math.random() * 0.35)), hue: [38, 330, 190, 50, 280, 12][Math.floor(Math.random() * 6)], ty: h * (0.15 + Math.random() * 0.3) });
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(4,6,16,0.2)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (let i = S.rockets.length - 1; i >= 0; i--) {
      const r = S.rockets[i];
      r.px = r.x;
      r.py = r.y;
      r.vy += h * 0.55 * dt;
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      ctx.strokeStyle = `hsla(${r.hue},90%,80%,.9)`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(r.px, r.py);
      ctx.lineTo(r.x, r.y);
      ctx.stroke();
      if (r.y < r.ty || r.vy > -40) {
        S.rockets.splice(i, 1);
        const n = 70 + Math.floor(Math.random() * 30);
        const ring = Math.random() < 0.35;
        for (let k = 0; k < n && S.sparks.length < 1300; k++) {
          const a = (k / n) * Math.PI * 2 + Math.random() * 0.1;
          const sp = ring ? 190 : 40 + Math.random() * 210;
          S.sparks.push({ x: r.x, y: r.y, px: r.x, py: r.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, age: 0, life: 1.1 + Math.random() * 0.8, hue: r.hue + (Math.random() - 0.5) * 30 });
        }
      }
    }
    const drag = Math.pow(0.35, dt);
    for (let i = S.sparks.length - 1; i >= 0; i--) {
      const p = S.sparks[i];
      p.age += dt;
      if (p.age > p.life) {
        S.sparks.splice(i, 1);
        continue;
      }
      p.px = p.x;
      p.py = p.y;
      p.vx *= drag;
      p.vy = p.vy * drag + 150 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const k = p.age / p.life;
      ctx.strokeStyle = `hsla(${p.hue},95%,${70 - k * 20}%,${(1 - k).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  });
  return (
    <Stage r={root} className="bg-[#04060f]" g1="rgba(255,170,80,.5)" g2="rgba(255,80,160,.22)">
      <div className="absolute inset-0" style={{ background: "radial-gradient(10% 16% at 40% 30%,rgba(255,190,90,.45),transparent 70%),radial-gradient(9% 14% at 72% 22%,rgba(255,90,170,.4),transparent 70%),linear-gradient(180deg,#04060f,#0d0a1c)" }}>
        <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[18%] bg-[linear-gradient(0deg,#04060f,transparent)]" aria-hidden />
      <Sheen g1="rgba(255,170,90,.55)" opacity={0.35} />
      <Copy eyebrow="Lanternfest · Festive edit" title="Light up the sky." line="Celebration hampers from ₹ 1,499" font={F.fr} className="bottom-10 left-10" />
    </Stage>
  );
}

/* ---------- M745 · Ball pit (physics spheres bounce and collide, the pointer pushes them, they breathe; shader shading) ---------- */
const N745 = 22;
const F745 = /* glsl */ `
uniform vec4 uB[${N745}];
void main() {
  vec2 fc = vec2(vUv.x * uRes.x, (1.0 - vUv.y) * uRes.y);
  vec3 col = mix(vec3(0.03, 0.03, 0.07), vec3(0.13, 0.08, 0.19), 1.0 - vUv.y);
  float sh = 0.0;
  float best = -1.0;
  vec3 n = vec3(0.0, 0.0, 1.0);
  float idx = 0.0;
  float edge = 0.0;
  for (int i = 0; i < ${N745}; i++) {
    vec4 b = uB[i];
    vec2 d = (fc - b.xy) / b.z;
    float dd = dot(d, d);
    vec2 sd = d - vec2(0.18, 0.4);
    sh += exp(-dot(sd, sd) * 1.6) * 0.16;
    if (dd < 1.0) {
      float hgt = sqrt(1.0 - dd) * b.z;
      if (hgt > best) {
        best = hgt;
        n = vec3(d.x, -d.y, sqrt(1.0 - dd));
        idx = b.w;
        edge = (1.0 - sqrt(dd)) * b.z;
      }
    }
  }
  col *= 1.0 - clamp(sh, 0.0, 0.6);
  if (best > 0.0) {
    vec3 base = idx < 0.5 ? vec3(1.0, 0.45, 0.42) : idx < 1.5 ? vec3(0.42, 0.88, 0.74) : idx < 2.5 ? vec3(1.0, 0.84, 0.38) : vec3(0.66, 0.58, 1.0);
    vec3 L = normalize(vec3(-0.45, 0.6, 0.75));
    float dif = max(dot(n, L), 0.0);
    float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 48.0);
    float rim = pow(1.0 - n.z, 2.5);
    vec3 c = base * (0.26 + 0.8 * dif) + vec3(spec * 0.85) + rim * base * 0.35;
    col = mix(col, c, clamp(edge / 1.5, 0.0, 1.0));
  }
  gl_FragColor = vec4(col, 1.0);
}`;
type B745 = { x: number; y: number; vx: number; vy: number; r: number; c: number; ph: number };
function M745() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const data = useRef(new Float32Array(N745 * 4));
  const st = useRef<{ balls: B745[]; w: number; h: number; lx: number; ly: number }>({ balls: [], w: 0, h: 0, lx: 0, ly: 0 });
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.42 * Math.sin(t * 0.8)), h * (0.74 + 0.13 * Math.sin(t * 1.9))],
    (x, y, dt, t) => {
      const S = st.current;
      const el = root.current;
      if (!el || dt <= 0) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (S.balls.length === 0 || Math.abs(S.w - w) > 40 || Math.abs(S.h - h) > 40) {
        S.w = w;
        S.h = h;
        S.balls = Array.from({ length: N745 }, (_, i) => {
          const r = w * (0.028 + 0.03 * ((i * 37) % 11) / 10);
          return { x: r + Math.random() * (w - 2 * r), y: h * (0.2 + Math.random() * 0.6), vx: (Math.random() - 0.5) * 200, vy: 0, r, c: i % 4, ph: Math.random() * 6.28 };
        });
        S.lx = x;
        S.ly = y;
      }
      const pvx = (x - S.lx) / dt;
      const pvy = (y - S.ly) / dt;
      S.lx = x;
      S.ly = y;
      const B = S.balls;
      const sub = 2;
      const h2 = dt / sub;
      for (let s = 0; s < sub; s++) {
        for (const b of B) {
          const rr = b.r * (1 + 0.05 * Math.sin(t * 1.3 + b.ph));
          b.vy += 1100 * h2;
          // the pointer pushes balls away and hands on a bit of its own speed
          const dx = b.x - x;
          const dy = b.y - y;
          const d = Math.hypot(dx, dy) || 1;
          const reach = rr + 70;
          if (d < reach) {
            const f = 1 - d / reach;
            b.vx += (dx / d) * f * 2600 * h2 + pvx * f * 0.06;
            b.vy += (dy / d) * f * 2600 * h2 + pvy * f * 0.06;
          }
          b.vx *= Math.pow(0.6, h2);
          b.vy *= Math.pow(0.85, h2);
          b.x += b.vx * h2;
          b.y += b.vy * h2;
          if (b.x < rr) {
            b.x = rr;
            b.vx = Math.abs(b.vx) * 0.7;
          }
          if (b.x > w - rr) {
            b.x = w - rr;
            b.vx = -Math.abs(b.vx) * 0.7;
          }
          if (b.y > h - rr) {
            b.y = h - rr;
            b.vy = -Math.abs(b.vy) * 0.55;
          }
          if (b.y < rr) {
            b.y = rr;
            b.vy = Math.abs(b.vy) * 0.6;
          }
        }
        for (let i = 0; i < B.length; i++)
          for (let j = i + 1; j < B.length; j++) {
            const a = B[i];
            const b = B[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const min = a.r + b.r;
            const d2 = dx * dx + dy * dy;
            if (d2 >= min * min || d2 === 0) continue;
            const d = Math.sqrt(d2);
            const nx = dx / d;
            const ny = dy / d;
            const push = (min - d) / 2;
            a.x -= nx * push;
            a.y -= ny * push;
            b.x += nx * push;
            b.y += ny * push;
            const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (rel < 0) {
              const imp = -rel * 0.85;
              a.vx -= nx * imp;
              a.vy -= ny * imp;
              b.vx += nx * imp;
              b.vy += ny * imp;
            }
          }
      }
      const D = data.current;
      B.forEach((b, i) => D.set([b.x, b.y, b.r * (1 + 0.05 * Math.sin(t * 1.3 + b.ph)), b.c], i * 4));
    },
  );
  return (
    <Stage r={root} className="bg-[#08060f]" g1="rgba(255,130,150,.5)" g2="rgba(120,230,200,.22)">
      <Shader
        frag={F745}
        fallback="radial-gradient(9% 16% at 22% 84%,#ff7a70 0 96%,transparent 100%),radial-gradient(8% 14% at 40% 86%,#6ce0bd 0 96%,transparent 100%),radial-gradient(10% 17% at 60% 83%,#ffd660 0 96%,transparent 100%),radial-gradient(8% 14% at 78% 86%,#a895ff 0 96%,transparent 100%),linear-gradient(180deg,#08060f,#1d1230)"
        uniforms={() => ({ uB: { value: data.current } })}
        onFrame={(u) => {
          u.uB.value = data.current;
        }}
      />
      <Sheen g1="rgba(255,140,160,.5)" opacity={0.35} />
      <Copy eyebrow="Bouncehaus · Indoor play" title="Dive right in." line="Ball pit day pass · ₹ 650 · push the balls around" font={F.sy} className="left-10 top-10" />
      <Dot r={dot} />
    </Stage>
  );
}

/* ---------- M746 · Origami bird flock (folded paper birds flap in 3D and drift across a layered sky, CSS + GSAP) ---------- */
const BIRDS746 = [
  { l: 12, t: 30, s: 1.05, f: 0.58, d: 11 },
  { l: 30, t: 52, s: 0.7, f: 0.66, d: 14 },
  { l: 46, t: 22, s: 0.55, f: 0.72, d: 16 },
  { l: 58, t: 44, s: 1.15, f: 0.55, d: 10 },
  { l: 72, t: 18, s: 0.8, f: 0.62, d: 13 },
  { l: 86, t: 38, s: 0.6, f: 0.7, d: 15 },
  { l: 22, t: 14, s: 0.48, f: 0.78, d: 17 },
  { l: 66, t: 62, s: 0.9, f: 0.6, d: 12 },
  { l: 4, t: 58, s: 0.62, f: 0.68, d: 15 },
  { l: 92, t: 66, s: 0.5, f: 0.75, d: 16 },
];
const HILL746 = (h: number, seed: number) => {
  const pts: string[] = ["0,200"];
  for (let i = 0; i <= 16; i++) {
    const x = (i / 16) * 1200;
    const y = 200 - h * (0.55 + 0.25 * Math.abs(Math.sin((i * 3 * Math.PI) / 16 + seed)) + 0.2 * Math.abs(Math.sin((i * 5 * Math.PI) / 16 + seed * 2)));
    pts.push(`${x.toFixed(0)},${y.toFixed(0)}`);
  }
  pts.push("1200,200");
  return pts.join(" ");
};
function Hills746({ h, seed, fill, dur, z }: { h: number; seed: number; fill: string; dur: number; z: number }) {
  const poly = HILL746(h, seed);
  return (
    <div className="m746-pan b16g3-run" style={{ animationDuration: `${dur}s`, height: `${h * 0.42}%`, zIndex: z }} aria-hidden>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 2400 200" preserveAspectRatio="none">
        <polygon points={poly} fill={fill} />
        <polygon points={poly} fill={fill} transform="translate(1200 0)" />
      </svg>
    </div>
  );
}
function M746() {
  const root = useRef<HTMLDivElement>(null);
  useOn(root);
  useAnims(root, (el) => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    const out: gsap.core.Animation[] = [];
    el.querySelectorAll<HTMLElement>("[data-b]").forEach((b, i) => {
      const cfg = BIRDS746[i];
      const x0 = (cfg.l / 100) * w;
      const tw = gsap.fromTo(b, { x: -x0 - 160 }, { x: w - x0 + 160, duration: cfg.d, ease: "none", repeat: -1 });
      tw.progress((x0 + 160) / (w + 320));
      out.push(tw);
      out.push(gsap.to(b, { y: (i % 2 ? -1 : 1) * h * 0.05, duration: 1.7 + (i % 3) * 0.4, ease: "sine.inOut", repeat: -1, yoyo: true }));
    });
    return out;
  });
  return (
    <Stage r={root} className="bg-[#f3d9c6]" g1="rgba(255,236,214,.6)" g2="rgba(190,150,220,.3)" style={{ color: "#2c2033" }}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#e9c8d8_0%,#f6d7c0_55%,#fbe6cf_100%)]" aria-hidden />
      <div className="b16g3-glow" style={{ "--g1": "rgba(255,248,236,.6)", "--g2": "rgba(255,190,170,.3)" } as CSSProperties} aria-hidden />
      <div className="absolute right-[18%] top-[16%] h-[120px] w-[120px] rounded-full bg-[#fff3e2] shadow-[0_0_80px_rgba(255,236,210,.9)]" aria-hidden />
      <Hills746 h={46} seed={0.4} fill="#d9b3c4" dur={60} z={1} />
      <Hills746 h={34} seed={2.1} fill="#b98ba8" dur={40} z={2} />
      {BIRDS746.map((b, i) => (
        <div key={i} data-b className="m746-fly" style={{ left: `${b.l}%`, top: `${b.t}%`, zIndex: b.s > 0.85 ? 8 : 4, opacity: 0.55 + b.s * 0.4 }} aria-hidden>
          <div className="m746-scale" style={{ transform: `scale(${b.s})` }}>
            <div className="m746-bird">
              <div className="m746-w m746-wl b16g3-run" style={{ animationDuration: `${b.f}s`, animationDelay: `${-i * 0.13}s` }} />
              <div className="m746-w m746-wr b16g3-run" style={{ animationDuration: `${b.f}s`, animationDelay: `${-i * 0.13}s` }} />
              <div className="m746-body" />
            </div>
          </div>
        </div>
      ))}
      <Hills746 h={22} seed={4.3} fill="#7d5b7e" dur={24} z={9} />
      <Copy eyebrow="Paperwing Stationery" title="Fold something free." line="Washi crane kit, 40 sheets · ₹ 899" font={F.fr} className="left-10 top-10" tone="text-[#2c2033]" />
    </Stage>
  );
}

/* ---------- M747 · Aero shards (a wind sculpture of folded foil shards flutters in gusts, OGL triangles) ---------- */
const V747 = PROJ + /* glsl */ `
attribute vec3 position;
attribute vec3 aNormal;
attribute vec3 aCenter;
attribute vec4 aOrient;
varying vec3 vN;
varying vec3 vP;
varying float vHue;
void main() {
  float gust = sin(aCenter.y * 2.2 - uTime * 1.6) * 0.5 + 0.5;
  float f = sin(uTime * (2.4 + aOrient.z * 2.0) + aOrient.z * 6.28 + aCenter.y * 3.0) * (0.3 + 0.7 * gust);
  mat3 m = rotY(aOrient.x) * rotX(aOrient.y) * rotY(f * 0.95);
  mat3 g = rotY(uTime * 0.18) * rotX(0.12);
  vec3 p = g * (aCenter + m * position);
  vN = g * (m * aNormal);
  vP = p;
  vHue = aOrient.w + gust * 0.15;
  vec4 q = proj(p, 3.4, 2.1);
  q.x += 0.2;
  gl_Position = q;
}`;
const FR747 = /* glsl */ `
precision highp float;
varying vec3 vN;
varying vec3 vP;
varying float vHue;
void main() {
  vec3 n = normalize(vN);
  vec3 V = normalize(vec3(0.0, 0.0, 3.4) - vP);
  if (dot(n, V) < 0.0) n = -n;
  vec3 L = normalize(vec3(-0.5, 0.7, 0.6));
  float ndv = clamp(dot(n, V), 0.0, 1.0);
  vec3 irid = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + ndv * 1.3 + vHue));
  vec3 base = mix(vec3(0.78, 0.8, 0.86), irid, 0.55);
  float dif = 0.25 + 0.75 * max(dot(n, L), 0.0);
  float spec = pow(max(dot(reflect(-L, n), V), 0.0), 28.0);
  float rim = pow(1.0 - ndv, 3.0);
  gl_FragColor = vec4(base * dif + vec3(spec * 0.9) + irid * rim * 0.5, 1.0);
}`;
const build747 = (api: GLApi): GLStep => {
  const { ogl, gl, scene } = api;
  const S = 230;
  const pos = new Float32Array(S * 18);
  const nrm = new Float32Array(S * 18);
  const cen = new Float32Array(S * 18);
  const ori = new Float32Array(S * 24);
  const cross = (a: number[], b: number[], c: number[]) => {
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    return n.map((x) => x / l);
  };
  for (let i = 0; i < S; i++) {
    const u = i / S;
    const strand = i % 2;
    const ang = u * Math.PI * 4.2 + strand * Math.PI + (Math.random() - 0.5) * 0.5;
    const rad = 0.36 + 0.3 * Math.sin(u * Math.PI) + (Math.random() - 0.5) * 0.12;
    const c = [Math.cos(ang) * rad, (u - 0.5) * 2.1, Math.sin(ang) * rad];
    const s = 0.07 + Math.random() * 0.08;
    const k = s * (0.3 + Math.random() * 0.5);
    const T = [0, 1.3 * s, 0];
    const B = [0, -0.9 * s, 0];
    const L = [-s, 0, -k];
    const R = [s, 0, -k];
    const n1 = cross(T, L, B);
    const n2 = cross(T, B, R);
    const verts = [T, L, B, T, B, R];
    const ns = [n1, n1, n1, n2, n2, n2];
    const o = [-ang + Math.PI / 2 + (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 1.2, Math.random(), Math.random() * 0.3];
    for (let v = 0; v < 6; v++) {
      pos.set(verts[v], (i * 6 + v) * 3);
      nrm.set(ns[v], (i * 6 + v) * 3);
      cen.set(c, (i * 6 + v) * 3);
      ori.set(o, (i * 6 + v) * 4);
    }
  }
  const geo = new ogl.Geometry(gl, { position: { size: 3, data: pos }, aNormal: { size: 3, data: nrm }, aCenter: { size: 3, data: cen }, aOrient: { size: 4, data: ori } });
  const prog = new ogl.Program(gl, { vertex: V747, fragment: FR747, uniforms: { uTime: { value: 0 }, uRes: { value: [1, 1] } }, cullFace: false, depthTest: true });
  new ogl.Mesh(gl, { geometry: geo, program: prog }).setParent(scene);
  return (t, w, h) => {
    prog.uniforms.uTime.value = t;
    prog.uniforms.uRes.value = [w, h];
  };
};
function M747() {
  return (
    <Stage className="bg-[#07080d]" g1="rgba(150,200,255,.5)" g2="rgba(255,170,230,.22)">
      <div className="absolute inset-0 bg-[radial-gradient(34%_50%_at_60%_50%,rgba(180,200,255,.14),transparent_70%)]" aria-hidden />
      <GLScene build={build747} fallback="conic-gradient(from 200deg at 60% 50%,#2a3350,#8aa0c8,#d9c2e8,#3a3048,#9fc6d8,#2a3350)" />
      <Sheen g1="rgba(160,200,255,.5)" opacity={0.35} />
      <Copy eyebrow="Aerofoil Gallery · Sculpture" title="Shaped by the wind." line="Foil edition 07, signed · ₹ 1,20,000" font={F.is} className="bottom-10 left-10" />
    </Stage>
  );
}

/* ---------- M748 · Eroding particle sphere (variant of M45: a point sphere morphs, erodes into holes, glowing rims trail) ---------- */
const V748 = PROJ + NOISE3 + /* glsl */ `
attribute vec3 position;
attribute vec4 aRand;
varying vec3 vCol;
varying float vA;
void main() {
  vec3 n = position;
  float t = uTime;
  float m = vn(n * 1.7 + vec3(0.0, t * 0.3, t * 0.1));
  float r = 0.95 + (m - 0.5) * 0.4;
  float e = vn(n * 2.4 + vec3(t * 0.08, -t * 0.05, 0.0)) * 0.65 + vn(n * 5.5 + t * 0.12) * 0.35;
  float th = 0.45 + 0.1 * sin(t * 0.5);
  float gone = smoothstep(th, th - 0.07, e);
  float rim = 1.0 - smoothstep(0.0, 0.04, abs(e - th));
  vec3 tang = normalize(cross(n, vec3(0.2, 1.0, 0.1)));
  float fl = fract(aRand.x + t * 0.4);
  vec3 p = n * r;
  p += n * gone * (0.15 + 0.8 * aRand.y) * (0.6 + 0.4 * sin(t * 0.7 + aRand.z * 6.28));
  p += tang * rim * fl * 0.2;
  p = rotY(t * 0.2) * rotX(0.4) * p;
  vec4 q = proj(p, 3.0, 1.9);
  q.x += 0.22;
  gl_Position = q;
  float z = 3.0 - p.z;
  float front = smoothstep(4.0, 2.2, z);
  vec3 base = mix(vec3(0.32, 0.42, 0.75), vec3(0.85, 0.9, 1.0), m);
  vec3 glow = mix(vec3(1.0, 0.55, 0.25), vec3(0.4, 0.95, 1.0), aRand.w);
  vCol = mix(base, glow, rim);
  vA = (0.35 + 0.65 * front) * (1.0 - gone * 0.9) * (0.55 + rim * (1.6 - fl * 1.2));
  gl_PointSize = (1.3 + rim * 2.6 + aRand.z * 0.8) * (3.0 / z) * uRes.y / 720.0;
}`;
const build748 = (api: GLApi): GLStep => {
  const { ogl, gl, scene } = api;
  const N = 12000;
  const pos = new Float32Array(N * 3);
  const rr = new Float32Array(N * 4);
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - ((i + 0.5) / N) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * ga + (Math.random() - 0.5) * 0.02;
    pos.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
    rr.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }
  const geo = new ogl.Geometry(gl, { position: { size: 3, data: pos }, aRand: { size: 4, data: rr } });
  const prog = addProgram(api, V748, PT_FRAG);
  new ogl.Mesh(gl, { mode: gl.POINTS, geometry: geo, program: prog }).setParent(scene);
  return (t, w, h) => {
    prog.uniforms.uTime.value = t;
    prog.uniforms.uRes.value = [w, h];
  };
};
function M748() {
  return (
    <Stage className="bg-[#04050b]" g1="rgba(255,140,80,.5)" g2="rgba(90,210,255,.25)">
      <GLScene build={build748} fallback="radial-gradient(circle at 61% 50%,rgba(150,170,255,.35) 0 22%,rgba(255,150,90,.18) 25%,transparent 34%),#04050b" />
      <Sheen g1="rgba(255,150,90,.5)" opacity={0.35} />
      <Copy eyebrow="Erosion Studio · Generative art" title="Form, unmade." line="Limited giclée prints · ₹ 6,500" className="bottom-10 left-10" />
    </Stage>
  );
}

/* ---------- M749 · Network sphere (a rotating sphere of pulsing nodes, glowing links with signals, orbiting rings) ---------- */
const ROT749 = "mat3 R = rotY(uTime * 0.22) * rotX(0.35);";
const V749N = PROJ + /* glsl */ `
attribute vec3 position;
attribute vec4 aRand;
varying vec3 vCol;
varying float vA;
void main() {
  ${ROT749}
  vec3 p = R * position;
  vec4 q = proj(p, 3.2, 2.0);
  q.x += 0.2;
  gl_Position = q;
  float z = 3.2 - p.z;
  float pulse = pow(0.5 + 0.5 * sin(uTime * (1.6 + aRand.y * 1.6) + aRand.x * 6.28), 3.0);
  float front = smoothstep(4.4, 2.3, z);
  vCol = mix(vec3(0.45, 0.7, 1.0), vec3(0.85, 1.0, 1.0), pulse);
  vA = (0.35 + 0.65 * front) * (0.6 + 0.6 * pulse);
  gl_PointSize = (4.0 + 7.0 * pulse) * (3.2 / z) * uRes.y / 720.0;
}`;
const V749L = PROJ + /* glsl */ `
attribute vec3 position;
attribute vec2 aLine;
varying float vT;
varying float vPh;
varying float vD;
void main() {
  ${ROT749}
  vec3 p = R * position;
  vec4 q = proj(p, 3.2, 2.0);
  q.x += 0.2;
  gl_Position = q;
  vT = aLine.x;
  vPh = aLine.y;
  vD = smoothstep(4.4, 2.3, 3.2 - p.z);
}`;
const F749L = /* glsl */ `
precision highp float;
uniform float uTime;
varying float vT;
varying float vPh;
varying float vD;
void main() {
  float ph = fract(uTime * 0.45 + vPh);
  float on = step(0.5, fract(vPh * 7.3));
  float pulse = on * smoothstep(0.14, 0.0, abs(vT - ph));
  vec3 c = mix(vec3(0.3, 0.55, 1.0), vec3(0.8, 1.0, 1.0), pulse);
  float a = (0.14 + pulse * 0.85) * (0.3 + 0.7 * vD);
  gl_FragColor = vec4(c * a, a);
}`;
const V749R = PROJ + /* glsl */ `
attribute vec3 position;
varying vec3 vCol;
varying float vA;
void main() {
  ${ROT749}
  float ring = position.x;
  float a = position.y + uTime * (0.35 + ring * 0.15) * (ring > 0.5 ? -1.0 : 1.0);
  float rad = 1.42 + ring * 0.3 + position.z * 0.05;
  vec3 p = vec3(cos(a) * rad, 0.0, sin(a) * rad);
  p = rotX(1.2 + ring * 0.5) * rotY(ring * 0.9) * p;
  p = R * p;
  vec4 q = proj(p, 3.2, 2.0);
  q.x += 0.2;
  gl_Position = q;
  float z = 3.2 - p.z;
  vCol = ring > 0.5 ? vec3(1.0, 0.6, 0.85) : vec3(0.5, 0.85, 1.0);
  vA = (0.25 + 0.75 * smoothstep(5.0, 2.0, z)) * 0.7;
  gl_PointSize = 2.2 * (3.2 / z) * uRes.y / 720.0;
}`;
const build749 = (api: GLApi): GLStep => {
  const { ogl, gl, scene } = api;
  const N = 170;
  const nodes: number[][] = [];
  const npos = new Float32Array(N * 3);
  const nr = new Float32Array(N * 4);
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - ((i + 0.5) / N) * 2;
    const r = Math.sqrt(1 - y * y);
    const p = [Math.cos(i * ga) * r, y, Math.sin(i * ga) * r];
    nodes.push(p);
    npos.set(p, i * 3);
    nr.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }
  const seen = new Set<string>();
  const lp: number[] = [];
  const la: number[] = [];
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) }))
      .filter((o) => o.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3);
    near.forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) return;
      seen.add(key);
      const ph = Math.random();
      lp.push(...a, ...nodes[j]);
      la.push(0, ph, 1, ph);
    });
  });
  const R = 1000;
  const rp = new Float32Array(R * 3);
  for (let i = 0; i < R; i++) rp.set([i % 2, Math.random() * Math.PI * 2, Math.random() - 0.5], i * 3);
  const progL = addProgram(api, V749L, F749L);
  const progN = addProgram(api, V749N, PT_FRAG);
  const progR = addProgram(api, V749R, PT_FRAG);
  new ogl.Mesh(gl, { mode: gl.LINES, geometry: new ogl.Geometry(gl, { position: { size: 3, data: new Float32Array(lp) }, aLine: { size: 2, data: new Float32Array(la) } }), program: progL }).setParent(scene);
  new ogl.Mesh(gl, { mode: gl.POINTS, geometry: new ogl.Geometry(gl, { position: { size: 3, data: rp } }), program: progR }).setParent(scene);
  new ogl.Mesh(gl, { mode: gl.POINTS, geometry: new ogl.Geometry(gl, { position: { size: 3, data: npos }, aRand: { size: 4, data: nr } }), program: progN }).setParent(scene);
  return (t, w, h) => {
    for (const p of [progL, progN, progR]) {
      p.uniforms.uTime.value = t;
      p.uniforms.uRes.value = [w, h];
    }
  };
};
function M749() {
  return (
    <Stage className="bg-[#03060d]" g1="rgba(80,170,255,.55)" g2="rgba(255,120,200,.2)">
      <GLScene build={build749} fallback="radial-gradient(circle at 60% 50%,transparent 0 21%,rgba(90,170,255,.35) 21.5%,transparent 23%),radial-gradient(circle at 60% 50%,rgba(70,140,255,.25),transparent 36%),#03060d" />
      <Sheen g1="rgba(90,170,255,.55)" opacity={0.35} />
      <Copy eyebrow="Meshwork Cloud · Infrastructure" title="Every node, connected." line="Team plan · ₹ 2,999 / month" className="bottom-10 left-10" />
    </Stage>
  );
}

/* ---------- M750 · Firing neurons (variant of M749: neurons near the pointer fire and send pulses along their links) ---------- */
type N750 = { x: number; y: number; fire: number; ref: number; edges: number[] };
type E750 = { a: number; b: number; len: number };
type Q750 = { e: number; from: number; s: number };
function M750() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef<{ nodes: N750[]; edges: E750[]; pulses: Q750[]; spont: number; sp: HTMLCanvasElement | null; sp2: HTMLCanvasElement | null }>({ nodes: [], edges: [], pulses: [], spont: 0, sp: null, sp2: null });
  const cs = useCanvas2D(cv, (w, h) => {
    const S = st.current;
    const nodes: N750[] = [];
    const cols = 11;
    const rows = 6;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) nodes.push({ x: ((c + 0.5 + (Math.random() - 0.5) * 0.8) / cols) * w, y: ((r + 0.5 + (Math.random() - 0.5) * 0.8) / rows) * h, fire: 0, ref: 0, edges: [] });
    const edges: E750[] = [];
    const seen = new Set<string>();
    nodes.forEach((a, i) => {
      nodes
        .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
        .filter((o) => o.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 3)
        .forEach(({ j, d }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) return;
          seen.add(key);
          edges.push({ a: i, b: j, len: d });
          a.edges.push(edges.length - 1);
          nodes[j].edges.push(edges.length - 1);
        });
    });
    S.nodes = nodes;
    S.edges = edges;
    S.pulses = [];
    S.sp = S.sp ?? sprite("120,200,255");
    S.sp2 = S.sp2 ?? sprite("255,180,120");
  });
  const fire = (i: number) => {
    const S = st.current;
    const n = S.nodes[i];
    if (!n || n.ref > 0) return;
    n.fire = 1;
    n.ref = 1.1;
    for (const e of n.edges) if (S.pulses.length < 220) S.pulses.push({ e, from: i, s: 0 });
  };
  usePointer(
    root,
    dot,
    (t, w, h) => [w * (0.5 + 0.4 * Math.sin(t * 0.55) * Math.cos(t * 0.21)), h * (0.5 + 0.36 * Math.sin(t * 0.9 + 1))],
    (x, y, dt) => {
      const { ctx, w, h } = cs.current;
      const S = st.current;
      if (!ctx || !S.sp || !S.sp2) return;
      S.nodes.forEach((n, i) => {
        n.fire *= Math.exp(-dt * 3);
        n.ref -= dt;
        if (Math.hypot(n.x - x, n.y - y) < 110) fire(i);
      });
      S.spont -= dt;
      if (S.spont <= 0) {
        S.spont = 0.5 + Math.random() * 0.4;
        fire(Math.floor(Math.random() * S.nodes.length));
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(5,6,16,0.45)";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(120,150,255,0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const e of S.edges) {
        const a = S.nodes[e.a];
        const b = S.nodes[e.b];
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(150,215,255,0.85)";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = S.pulses.length - 1; i >= 0; i--) {
        const p = S.pulses[i];
        const e = S.edges[p.e];
        p.s += (dt * 380) / e.len;
        const to = p.from === e.a ? e.b : e.a;
        if (p.s >= 1) {
          S.pulses.splice(i, 1);
          if (Math.random() < 0.55) fire(to);
          continue;
        }
        const A = S.nodes[p.from];
        const B = S.nodes[to];
        const s0 = Math.max(0, p.s - 0.25);
        ctx.moveTo(A.x + (B.x - A.x) * s0, A.y + (B.y - A.y) * s0);
        ctx.lineTo(A.x + (B.x - A.x) * p.s, A.y + (B.y - A.y) * p.s);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(170,200,255,0.75)";
      ctx.beginPath();
      for (const n of S.nodes) {
        ctx.moveTo(n.x + 3, n.y);
        ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
      }
      ctx.fill();
      for (const n of S.nodes) {
        if (n.fire < 0.04) continue;
        const r = 20 + n.fire * 46;
        ctx.globalAlpha = n.fire;
        ctx.drawImage(n.fire > 0.7 ? S.sp2 : S.sp, n.x - r, n.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 0.35;
      ctx.drawImage(S.sp, x - 110, y - 110, 220, 220);
      ctx.globalAlpha = 1;
    },
  );
  return (
    <Stage r={root} className="bg-[#050610]" g1="rgba(100,170,255,.55)" g2="rgba(255,170,110,.2)">
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 40%,rgba(110,160,255,.18),transparent 45%),#050610" }}>
        <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      </div>
      <Sheen g1="rgba(110,170,255,.55)" opacity={0.35} />
      <Copy eyebrow="Synapse Labs · Focus tea" title="Spark every thought." line="Focus blend, 50 g tin · ₹ 549" font={F.fr} className="bottom-10 left-10" />
      <Dot r={dot} />
    </Stage>
  );
}

/* ---------- M751 · Spring mesh (variant of M633: grid nodes on springs bend with pointer speed and ring with shockwaves) ---------- */
type W751 = { x: number; y: number; r: number; amp: number };
function M751() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ cols: 0, rows: 0, gap: 38, ox: 0, oy: 0, dx: new Float32Array(0), dy: new Float32Array(0), vx: new Float32Array(0), vy: new Float32Array(0), lx: -1, ly: -1, waves: [] as W751[], cool: 0, tick: -1 });
  const cs = useCanvas2D(cv, (w, h) => {
    const S = st.current;
    S.cols = Math.min(40, Math.round(w / S.gap) + 1);
    S.rows = Math.min(15, Math.round(h / S.gap) + 1);
    S.ox = (w - (S.cols - 1) * S.gap) / 2;
    S.oy = (h - (S.rows - 1) * S.gap) / 2;
    const n = S.cols * S.rows;
    S.dx = new Float32Array(n);
    S.dy = new Float32Array(n);
    S.vx = new Float32Array(n);
    S.vy = new Float32Array(n);
  });
  usePointer(
    root,
    dot,
    (t, w, h) => {
      // swoops that speed up and slow down, so the pointer velocity (and the mesh) keeps changing
      const u = t + 0.55 * Math.sin(t * 0.8);
      return [w * (0.5 + 0.4 * Math.sin(u * 0.9)), h * (0.5 + 0.32 * Math.sin(u * 1.7 + 1))];
    },
    (x, y, dt, t, live) => {
      const { ctx, w, h } = cs.current;
      const S = st.current;
      if (!ctx || dt <= 0 || S.cols === 0) return;
      if (S.lx < 0) {
        S.lx = x;
        S.ly = y;
      }
      const pvx = (x - S.lx) / dt;
      const pvy = (y - S.ly) / dt;
      S.lx = x;
      S.ly = y;
      const speed = Math.hypot(pvx, pvy);
      S.cool -= dt;
      // shockwave: on a fast flick (real or scripted), and on a beat every 1.6 s while the script drives
      const beat = Math.floor(t / 1.6);
      if ((!live && beat !== S.tick) || (speed > 1800 && S.cool <= 0)) {
        S.tick = beat;
        S.cool = 0.6;
        S.waves.push({ x, y, r: 0, amp: 1 });
      }
      const { cols, rows, gap, ox, oy, dx, dy, vx, vy } = S;
      const sub = 2;
      const h2 = dt / sub;
      for (let s = 0; s < sub; s++) {
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++) {
            const i = r * cols + c;
            const px = ox + c * gap + dx[i];
            const py = oy + r * gap + dy[i];
            let lx = 0;
            let ly = 0;
            if (c > 0) (lx += dx[i - 1] - dx[i]), (ly += dy[i - 1] - dy[i]);
            if (c < cols - 1) (lx += dx[i + 1] - dx[i]), (ly += dy[i + 1] - dy[i]);
            if (r > 0) (lx += dx[i - cols] - dx[i]), (ly += dy[i - cols] - dy[i]);
            if (r < rows - 1) (lx += dx[i + cols] - dx[i]), (ly += dy[i + cols] - dy[i]);
            let ax = -30 * dx[i] - 2.4 * vx[i] + 160 * lx;
            let ay = -30 * dy[i] - 2.4 * vy[i] + 160 * ly;
            const ddx = px - x;
            const ddy = py - y;
            const d = Math.hypot(ddx, ddy);
            if (d < 120) {
              const f = 1 - d / 120;
              ax += pvx * f * 9;
              ay += pvy * f * 9;
            }
            for (const wv of S.waves) {
              const wx = px - wv.x;
              const wy = py - wv.y;
              const wd = Math.hypot(wx, wy) || 1;
              const band = 1 - Math.abs(wd - wv.r) / 26;
              if (band > 0) {
                ax += (wx / wd) * band * wv.amp * 5200;
                ay += (wy / wd) * band * wv.amp * 5200;
              }
            }
            vx[i] += ax * h2;
            vy[i] += ay * h2;
          }
        for (let i = 0; i < dx.length; i++) {
          dx[i] += vx[i] * h2;
          dy[i] += vy[i] * h2;
        }
      }
      for (let k = S.waves.length - 1; k >= 0; k--) {
        const wv = S.waves[k];
        wv.r += 560 * dt;
        wv.amp *= Math.exp(-dt * 1.6);
        if (wv.amp < 0.05 || wv.r > Math.max(w, h) * 1.2) S.waves.splice(k, 1);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#0a0b10";
      ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,200,150,0.22)";
      ctx.beginPath();
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const px = ox + c * gap + dx[i];
          const py = oy + r * gap + dy[i];
          if (c === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      for (let c = 0; c < cols; c++)
        for (let r = 0; r < rows; r++) {
          const i = r * cols + c;
          const px = ox + c * gap + dx[i];
          const py = oy + r * gap + dy[i];
          if (r === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      ctx.stroke();
      // nodes in three brightness buckets by how far they are stretched (3 fills a frame)
      const buckets: [string, number, number][] = [
        ["rgba(255,215,180,0.45)", 0, 4],
        ["rgba(255,170,110,0.85)", 4, 14],
        ["rgba(255,240,220,1)", 14, 1e9],
      ];
      for (const [col, lo, hi] of buckets) {
        ctx.fillStyle = col;
        ctx.beginPath();
        for (let i = 0; i < dx.length; i++) {
          const m = Math.hypot(dx[i], dy[i]);
          if (m < lo || m >= hi) continue;
          const px = ox + (i % cols) * gap + dx[i];
          const py = oy + Math.floor(i / cols) * gap + dy[i];
          const rad = 1.6 + Math.min(3, m * 0.12);
          ctx.moveTo(px + rad, py);
          ctx.arc(px, py, rad, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.lineWidth = 2;
      for (const wv of S.waves) {
        ctx.strokeStyle = `rgba(255,190,130,${(wv.amp * 0.5).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(wv.x, wv.y, wv.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  );
  return (
    <Stage r={root} className="bg-[#0a0b10]" g1="rgba(255,160,100,.5)" g2="rgba(120,140,255,.2)">
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle,rgba(255,200,160,.35) 1.6px,transparent 2px) 0 0/38px 38px,#0a0b10" }}>
        <canvas ref={cv} className="absolute inset-0 h-full w-full" aria-hidden />
      </div>
      <Sheen g1="rgba(255,160,100,.5)" opacity={0.35} />
      <Copy eyebrow="Tensile Studio · Furniture" title="Built to spring back." line="Woven mesh lounger · ₹ 42,000" font={F.sy} className="bottom-10 left-10" />
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "M740", name: "Spiral galaxy", how: "A tilted galaxy of 3D points slowly turns, its inner stars orbiting faster than the arms (OGL points)", kind: "play", C: M740 },
  { code: "M741", name: "Nebula emitter", how: "Particles pour out of a pulsing core, swirl outward with colour-shifting trails and fade (canvas)", kind: "play", C: M741 },
  { code: "M742", name: "Warp-drive tunnel", how: "Star streaks rush toward you; they stretch and speed up as the pointer nears the centre (shader, scripted pointer)", kind: "play", C: M742 },
  { code: "M743", name: "Hyperspeed road", how: "Lane lines and light trails race to a vanishing point; holding the button boosts the speed (shader, scripted hold)", kind: "play", C: M743 },
  { code: "M744", name: "Fireworks", how: "Rockets climb and burst into sparks that trail, fall with gravity and fade (canvas)", kind: "play", C: M744 },
  { code: "M745", name: "Ball pit", how: "Glossy spheres fall, bounce and collide; the pointer shoves them around and they gently breathe (shader, scripted pointer)", kind: "play", C: M745 },
  { code: "M746", name: "Origami bird flock", how: "Folded paper birds flap their wings in 3D and drift across a layered, panning sky (CSS + GSAP)", kind: "play", C: M746 },
  { code: "M747", name: "Aero shards", how: "A twisting sculpture of folded foil shards flutters in travelling gusts, flashing iridescent light (OGL)", kind: "play", C: M747 },
  { code: "M748", name: "Eroding particle sphere", how: "A point sphere morphs, erodes into drifting holes and grows glowing trails along the hole edges (OGL points)", kind: "play", C: M748 },
  { code: "M749", name: "Network sphere", how: "A rotating sphere of pulsing nodes with links that carry signals, circled by two particle rings (OGL)", kind: "play", C: M749 },
  { code: "M750", name: "Firing neurons", how: "Neurons near the pointer fire and send pulses down their links, setting off chain reactions (canvas, scripted pointer)", kind: "play", C: M750 },
  { code: "M751", name: "Spring mesh", how: "A grid on springs bends with the pointer's speed and rings with shockwaves that ripple outward (canvas, scripted pointer)", kind: "play", C: M751 },
];
