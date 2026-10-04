"use client";

// Ambient motions, batch 16 · group 1 (MOTION-MENU M722–M727): faceted gem smoke, an inward spiral, a golden-angle dot
// spiral, neuron-like noise filaments, equalizer slats and a rolling sea of micro slats.
// Small focused demos for /lab/motion. Every demo is "play": it runs while on screen and pauses off screen. Each stage
// has a CSS-only glow loop that never stops (a second one sits ON TOP of full-bleed canvases). WebGL / canvas demos build
// only within ~1 screen of the viewport, run at dpr 1 (0.7 for the faceted smoke) and release everything on unmount.
// ?static=1 / reduced motion: no JS motion, CSS loops stop, the markup shows a sensible still (gradient / SVG) state.
// Motion ideas only (rebuilt from scratch, no copied code).
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { createShader, type GLHandle } from "@/lib/gl";
import type { MotionDef } from "./types";

const F = {
  sg: "'Space Grotesk Variable', system-ui, sans-serif",
  fr: "'Fraunces Variable', Georgia, serif",
  is: "'Instrument Serif', Georgia, serif",
  sy: "'Syne Variable', 'Space Grotesk Variable', system-ui, sans-serif",
  mr: "'Manrope Variable', system-ui, sans-serif",
};

const CSS = `
.b16a1-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b16a1-drift 5.6s linear infinite alternate;will-change:transform}
@keyframes b16a1-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
html.is-static .b16a1-glow{animation:none}
@media (prefers-reduced-motion: reduce){.b16a1-glow{animation:none}}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop (never frozen). */
function Stage({ r, children, bg = "#0a0d16", g1, g2 }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; bg?: string; g1?: string; g2?: string }) {
  return (
    <div ref={r} className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 text-[#eef2ff]" style={{ background: bg }}>
      <style href="b16a1-css" precedence="default">
        {CSS}
      </style>
      <div className="b16a1-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

/** The CSS glow loop again, ON TOP of full-bleed canvases (screen blend), so those demos never freeze. */
const Sheen = ({ g1, opacity = 0.45 }: { g1?: string; opacity?: number }) => (
  <div className="b16a1-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity, zIndex: 35 } as CSSProperties} aria-hidden />
);

/** True once the element is within ~1 screen of the viewport (no GL context / canvas work before that). */
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

type U = Record<string, { value: unknown }>;

/**
 * Full-bleed fragment shader (OGL via lib/gl). Built only near the viewport; draws only while on screen; the context
 * is released on unmount. `fallback` is the CSS background shown until (or instead of) the first frame.
 */
function GLLayer({ frag, fallback, dpr = 1, uniforms, onFrame }: { frag: string; fallback: string; dpr?: number; uniforms?: () => U; onFrame?: (u: U, t: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const of = useRef(onFrame);
  of.current = onFrame;
  const un = useRef(uniforms);
  const near = useNear(box);
  useEffect(() => {
    const c = cv.current;
    if (!near || !c) return;
    let dead = false;
    let h: GLHandle | null = null;
    (async () => {
      h = await createShader(c, frag, { dpr, uniforms: un.current?.(), onFrame: (u, t) => of.current?.(u, t) });
      if (dead) h?.destroy();
    })();
    return () => {
      dead = true;
      h?.destroy();
    };
  }, [near, frag, dpr]);
  return (
    <div ref={box} className="absolute inset-0" style={{ background: fallback }}>
      <canvas ref={cv} className="absolute inset-0 h-full w-full transition-opacity duration-500" style={{ opacity: 0 }} aria-hidden />
    </div>
  );
}

/** Small overlaid copy block (bottom-left), the same on every ambient stage. */
function Caption({ kicker, title, em, note, accent }: { kicker: string; title: string; em: string; note: string; accent: string }) {
  return (
    <div className="pointer-events-none absolute bottom-[9%] left-[6%] z-40 max-w-[min(46%,560px)]" style={{ fontFamily: F.sg }}>
      <p className="text-[13px] uppercase tracking-[0.26em]" style={{ color: accent }}>
        {kicker}
      </p>
      <h3 className="mt-2 text-[clamp(36px,4vw,62px)] font-semibold leading-[0.95] tracking-[-0.035em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,.5)]">
        {title} <span style={{ fontFamily: F.is, fontWeight: 400 }}>{em}</span>
      </h3>
      <p className="mt-3 text-[15px] text-white/75">{note}</p>
    </div>
  );
}

const NOISE_GLSL = /* glsl */ `
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x), u.y);
}
`;

/* ---------- M722 · Gem smoke (variant of M190) ---------- */
const M722_F = /* glsl */ `
${NOISE_GLSL}
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= 0.5; } return s; }
float smoke(vec2 x){
  float t = uTime;
  vec2 q = x * 1.5 + vec2(0.0, -t * 0.16);
  vec2 w = vec2(fbm(q + vec2(0.0, t * 0.05)), fbm(q + vec2(5.2, 1.3) - t * 0.04));
  return fbm(q + 1.7 * w + vec2(t * 0.03, 0.0));
}
void main(){
  vec2 p = (vUv - 0.5) * uRes / uRes.y;
  float t = uTime;
  const float CELLS = 22.0;
  const float F2 = 0.3660254, G2 = 0.2113249;
  vec2 x = p * CELLS;
  vec2 s = x + (x.x + x.y) * F2;
  vec2 i = floor(s); vec2 f = fract(s);
  bool low = f.x > f.y;
  vec2 o = low ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 s1 = i + o, s2 = i + 1.0;
  vec2 v0 = (i - (i.x + i.y) * G2) / CELLS;
  vec2 v1 = (s1 - (s1.x + s1.y) * G2) / CELLS;
  vec2 v2 = (s2 - (s2.x + s2.y) * G2) / CELLS;
  float h0 = smoke(v0), h1 = smoke(v1), h2 = smoke(v2);
  const float HS = 0.55;
  vec3 n = normalize(cross(vec3(v1 - v0, (h1 - h0) * HS), vec3(v2 - v0, (h2 - h0) * HS)));
  if (n.z < 0.0) n = -n;
  float hv = (h0 + h1 + h2) / 3.0;
  float dens = smoothstep(0.36, 0.72, hv);
  float e = low ? min(min(f.y, 1.0 - f.x), (f.x - f.y) * 0.7071) : min(min(f.x, 1.0 - f.y), (f.y - f.x) * 0.7071);
  float edge = smoothstep(0.045, 0.0, e);
  vec3 emerald = vec3(0.05, 0.78, 0.58), amethyst = vec3(0.6, 0.28, 0.98), sapphire = vec3(0.16, 0.38, 1.0);
  vec3 base = mix(emerald, amethyst, smoothstep(-0.7, 0.7, p.x + 0.35 * sin(t * 0.21) + (h0 - h2) * 3.0));
  base = mix(base, sapphire, smoothstep(0.55, 0.8, hv) * 0.6);
  vec3 L = normalize(vec3(cos(t * 0.45) * 0.75, sin(t * 0.45) * 0.5 + 0.3, 0.62));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 34.0);
  vec3 bg = vec3(0.02, 0.025, 0.055) + vec3(0.03, 0.02, 0.06) * (1.0 - length(p));
  vec3 col = mix(bg, base * (0.22 + 1.15 * diff), dens);
  col += vec3(1.0, 0.96, 0.92) * spec * dens * 1.4;
  col += vec3(0.75, 0.88, 1.0) * edge * dens * 0.16;
  gl_FragColor = vec4(col, 1.0);
}`;
function M722() {
  return (
    <Stage bg="#05060c" g1="rgba(90,220,170,.5)" g2="rgba(160,100,255,.26)">
      <GLLayer
        frag={M722_F}
        dpr={0.7}
        fallback="radial-gradient(60% 70% at 30% 60%,rgba(20,200,150,.4),transparent 70%),radial-gradient(50% 60% at 72% 40%,rgba(150,80,255,.4),transparent 70%),#05060c"
      />
      <Caption kicker="Eau de parfum · 50 ml" title="Facet" em="Nº 7, cut from smoke." note="Vetiver, cold resin, violet leaf · ₹6,400" accent="#9ff0d4" />
      <Sheen g1="rgba(90,220,170,.5)" opacity={0.32} />
    </Stage>
  );
}

/* ---------- M723 · Spiral ---------- */
const M723_F = /* glsl */ `
void main(){
  vec2 p = (vUv - 0.5) * uRes / uRes.y - vec2(0.32, 0.0);
  float t = uTime;
  float r = max(length(p), 1e-4);
  float a = atan(p.y, p.x) + t * 0.22;
  const float ARMS = 5.0, K = 2.6;
  // log spiral; the + time term walks every stripe toward the centre
  float v = ARMS * a / 6.2831853 + K * log(r) + t * 0.55;
  float gr = sqrt(K * K + (ARMS / 6.2831853) * (ARMS / 6.2831853)) / (r * uRes.y);
  float fv = abs(fract(v) - 0.5);
  float m = smoothstep(0.25 - gr, 0.25 + gr, fv);
  vec3 warm = vec3(1.0, 0.5, 0.28), violet = vec3(0.48, 0.32, 1.0), ink = vec3(0.025, 0.03, 0.06);
  vec3 band = mix(warm, violet, clamp(r * 1.5 + 0.25 * sin(t * 0.6 + a), 0.0, 1.0));
  vec3 col = mix(ink, band * (0.55 + 0.45 * smoothstep(0.0, 0.9, r)), m);
  col *= smoothstep(0.02, 0.2, r);
  col += vec3(0.5, 0.35, 1.0) * exp(-r * 7.0) * 0.35;
  col *= 1.0 - smoothstep(0.7, 1.4, r) * 0.6;
  gl_FragColor = vec4(col, 1.0);
}`;
function M723() {
  return (
    <Stage bg="#05060c" g1="rgba(255,140,90,.5)" g2="rgba(130,100,255,.26)">
      <GLLayer frag={M723_F} fallback="repeating-conic-gradient(from 0deg at 66% 50%,rgba(255,130,80,.55) 0 18deg,#06070d 18deg 36deg,rgba(120,90,255,.5) 36deg 54deg,#06070d 54deg 72deg)" />
      <Caption kicker="Studio sessions · Vol. 3" title="Gravity," em="gently." note="Deep-focus listening rooms · ₹2,400 an hour" accent="#ffb08a" />
      <Sheen g1="rgba(255,140,90,.5)" opacity={0.3} />
    </Stage>
  );
}

/* ---------- M724 · Spiral dots loop (variant of M723) ---------- */
const M724_N = 760;
const M724_GA = Math.PI * (3 - Math.sqrt(5));
const M724_COLS = ["#7cf3ff", "#8fd9ff", "#a3bfff", "#b39cff", "#c690f5", "#dc8ee0", "#ef8fd0", "#ff92c2"];
/** Static fallback: 300 dots of the same phyllotaxis in an SVG (no JS needed). */
const M724_STATIC = Array.from({ length: 300 }, (_, i) => {
  const r = 46 * Math.sqrt((i + 0.5) / 300);
  const a = i * M724_GA;
  return { x: +(Math.cos(a) * r).toFixed(2), y: +(Math.sin(a) * r).toFixed(2), s: +(0.35 + 1.0 * Math.sqrt(i / 300)).toFixed(2), c: M724_COLS[Math.floor((i / 300) * M724_COLS.length)] };
});
function M724() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const fb = useRef<SVGSVGElement>(null);
  const near = useNear(root);
  useEffect(() => {
    const c = cv.current;
    const el = root.current;
    if (!near || !c || !el) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let W = 1;
    let H = 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const size = () => {
      W = el.clientWidth;
      H = el.clientHeight;
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    let raf = 0;
    let first = true;
    const t0 = performance.now();
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      const t = (now - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const cx = W * 0.66;
      const cy = H * 0.5;
      const R = H * 0.46;
      const rot = t * 0.2;
      for (let i = 0; i < M724_N; i++) {
        const k = i / M724_N;
        const r = R * Math.sqrt((i + 0.5) / M724_N);
        const a = i * M724_GA + rot;
        // a pulse wave runs outward along the spiral index (seamless: time-continuous)
        const pulse = 0.5 + 0.5 * Math.sin(i * 0.055 - t * 2.6);
        const s = (1.1 + 3.2 * Math.sqrt(k)) * (0.5 + 0.8 * pulse * pulse);
        ctx.globalAlpha = 0.3 + 0.7 * pulse;
        ctx.fillStyle = M724_COLS[Math.min(M724_COLS.length - 1, Math.floor(k * M724_COLS.length))];
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (first) {
        first = false;
        c.style.opacity = "1";
        if (fb.current) fb.current.style.visibility = "hidden";
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      c.width = 1;
      c.height = 1;
    };
  }, [near]);
  return (
    <Stage r={root} bg="#06070e" g1="rgba(140,170,255,.55)" g2="rgba(255,140,200,.24)">
      <svg ref={fb} className="absolute left-[66%] top-1/2 aspect-square h-[92%] -translate-x-1/2 -translate-y-1/2" viewBox="-50 -50 100 100" aria-hidden>
        {M724_STATIC.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={d.c} opacity={0.75} />
        ))}
      </svg>
      <canvas ref={cv} className="absolute inset-0 h-full w-full" style={{ opacity: 0 }} aria-hidden />
      <Caption kicker="Botanical serum · 30 ml" title="Grown in" em="perfect order." note="Golden-ratio extraction · ₹1,850" accent="#a9c4ff" />
      <Sheen g1="rgba(140,170,255,.5)" opacity={0.35} />
    </Stage>
  );
}

/* ---------- M725 · Neuro noise (variant of M52) ---------- */
const M725_F = /* glsl */ `
${NOISE_GLSL}
float ridged(vec2 p){
  float s = 0.0, a = 0.62, w = 1.0;
  for (int i = 0; i < 5; i++) {
    float n = 1.0 - abs(vnoise(p) * 2.0 - 1.0);
    n = pow(n, 7.0);
    s += n * a * w;
    w = clamp(n * 1.5, 0.0, 1.0);
    p = mat2(1.7, 1.1, -1.1, 1.7) * p + 3.1;
    a *= 0.6;
  }
  return s;
}
void main(){
  vec2 p = (vUv - 0.5) * uRes / uRes.y;
  float t = uTime;
  vec2 q = p * 2.3;
  q += 0.4 * vec2(vnoise(q * 0.8 + vec2(t * 0.11, 0.0)), vnoise(q * 0.8 + vec2(4.3, -t * 0.09)));
  q += vec2(t * 0.05, -t * 0.03);
  float r = ridged(q);
  float fire = 0.75 + 0.25 * sin(q.x * 2.4 + q.y * 1.3 - t * 2.2);
  float f = pow(r, 1.5) * fire;
  vec3 col = vec3(0.02, 0.025, 0.06);
  col += vec3(0.22, 0.46, 1.0) * f * 1.35;
  col += vec3(0.92, 0.36, 0.86) * pow(f, 3.0) * 1.3;
  col *= 1.0 - 0.45 * smoothstep(0.4, 1.1, length(p));
  gl_FragColor = vec4(col, 1.0);
}`;
function M725() {
  return (
    <Stage bg="#04050b" g1="rgba(90,130,255,.55)" g2="rgba(230,100,220,.24)">
      <GLLayer frag={M725_F} fallback="radial-gradient(55% 60% at 60% 45%,rgba(70,120,255,.35),transparent 70%),radial-gradient(40% 45% at 30% 65%,rgba(220,90,210,.25),transparent 70%),#04050b" />
      <Caption kicker="Cognition lab · open house" title="Thinking," em="made visible." note="Neuro-feedback sessions from ₹3,500" accent="#a8b9ff" />
      <Sheen g1="rgba(90,130,255,.5)" opacity={0.3} />
    </Stage>
  );
}

/* ---------- M726 · Equalizer slats (variant of M595) ---------- */
const M726_F = /* glsl */ `
${NOISE_GLSL}
void main(){
  vec2 uv = vUv;
  float t = uTime;
  const float N = 56.0, X0 = 0.08, X1 = 0.92;
  float xi = (uv.x - X0) / (X1 - X0) * N;
  float i = clamp(floor(xi), 0.0, N - 1.0);
  float f = fract(xi);
  float inside = step(X0, uv.x) * step(uv.x, X1);
  float c = (i - N * 0.5 + 0.5) / (N * 0.5);
  float h = 0.07 + 0.34 * (0.5 + 0.5 * sin(i * 0.37 - t * 3.1)) * (0.55 + 0.45 * sin(i * 0.11 + t * 1.3));
  h += 0.14 * (0.5 + 0.5 * sin(abs(c) * 9.0 - t * 4.2));
  h += 0.12 * vnoise(vec2(i * 0.9, t * 3.0));
  h *= 1.0 - 0.5 * c * c;
  // mirror amount breathes: from a short dim reflection to a full mirrored bar
  float mirror = 0.5 + 0.5 * sin(t * 0.7);
  bool lower = uv.y < 0.5;
  float hh = lower ? h * mix(0.32, 1.0, mirror) : h;
  float y = abs(uv.y - 0.5) * 2.0;
  float px = 2.0 / uRes.y * 2.0;
  float bw = smoothstep(0.14, 0.2, f) * smoothstep(0.86, 0.8, f) * inside;
  float bar = bw * smoothstep(hh + px, hh, y);
  float tip = bw * smoothstep(hh - 0.05, hh, y) * smoothstep(hh + px, hh, y);
  vec3 cool = vec3(0.2, 0.9, 1.0), hot = vec3(1.0, 0.36, 0.78);
  vec3 bc = mix(cool, hot, clamp(y / max(hh, 0.02), 0.0, 1.0));
  float dim = lower ? mix(0.45, 0.85, mirror) : 1.0;
  float halo = exp(-max(y - hh, 0.0) * 12.0) * 0.28 * smoothstep(0.0, 0.5, 1.0 - abs(f - 0.5) * 2.0) * inside;
  float line = exp(-abs(uv.y - 0.5) * uRes.y * 0.18) * 0.5 * inside;
  vec3 col = bc * (bar * 0.9 + halo) * dim + vec3(1.0) * tip * 0.6 * dim + vec3(0.6, 0.8, 1.0) * line;
  float a = clamp(max(max(col.r, col.g), col.b), 0.0, 1.0);
  gl_FragColor = vec4(col / max(a, 1e-4), a);
}`;
function M726() {
  return (
    <Stage bg="#060710" g1="rgba(80,200,255,.5)" g2="rgba(255,90,190,.24)">
      <GLLayer frag={M726_F} fallback="repeating-linear-gradient(90deg,transparent 0 12px,rgba(80,220,255,.16) 12px 20px)" />
      <div className="pointer-events-none absolute right-[6%] top-[8%] z-40 text-right" style={{ fontFamily: F.sy }}>
        <p className="text-[13px] uppercase tracking-[0.26em] text-[#8fe8ff]" style={{ fontFamily: F.sg }}>
          Live tonight · doors 9 pm
        </p>
        <h3 className="mt-2 text-[clamp(34px,4vw,60px)] font-[800] uppercase leading-none tracking-[-0.02em]">Low End Club</h3>
        <p className="mt-2 text-[15px] text-white/70" style={{ fontFamily: F.sg }}>
          Entry ₹1,200 · one drink on us
        </p>
      </div>
    </Stage>
  );
}

/* ---------- M727 · Micro slats sea (variant of M595) ---------- */
const M727_F = /* glsl */ `
${NOISE_GLSL}
uniform float uIntro;
void main(){
  vec2 p = (vUv - 0.5) * uRes / uRes.y;
  float t = uTime;
  const float HZ = 0.16;
  vec2 sun = vec2(0.28, HZ + 0.06);
  vec3 sky = mix(vec3(0.03, 0.035, 0.09), vec3(0.62, 0.32, 0.38), exp(-max(p.y - HZ, 0.0) * 7.0));
  sky += vec3(1.0, 0.7, 0.5) * exp(-length(p - sun) * 14.0) * 0.8;
  vec3 hzc = vec3(0.5, 0.28, 0.36);
  float yb = HZ - p.y;
  if (yb <= 0.0) { gl_FragColor = vec4(sky, 1.0); return; }
  float z = 0.32 / yb;
  float x = p.x * z;
  vec2 w = vec2(x, z + t * 0.9);
  float ph1 = w.x * 0.8 + w.y * 1.2 - t * 1.4;
  float ph2 = -w.x * 1.3 + w.y * 0.7 - t * 0.9;
  float ph3 = w.x * 0.4 + w.y * 2.3 - t * 2.1;
  float slope = cos(ph1) * 0.6 + cos(ph2) * 0.21 + cos(ph3) * 0.35;
  vec2 cell = w * vec2(6.0, 9.0);
  vec2 id = floor(cell); vec2 f = fract(cell);
  float fp = 9.0 * 0.32 / (yb * yb * uRes.y);
  float fpx = 6.0 * z / uRes.y;
  float mx = smoothstep(0.4 + fpx, 0.4 - fpx, abs(f.x - 0.5));
  float mz = smoothstep(0.16 + fp, 0.16 - fp, abs(f.y - 0.5));
  float far = smoothstep(0.25, 0.9, max(fp, fpx));
  float mask = mix(mx * mz, 0.8 * 0.32, far);
  float rnd = h21(id);
  float tilt = slope + (rnd - 0.5) * 0.6;
  float facing = clamp(0.5 + 0.32 * tilt, 0.0, 1.0);
  float glint = pow(clamp(1.0 - abs(tilt - 0.95 - 0.3 * sin(t * 0.5)) * 2.4, 0.0, 1.0), 8.0);
  glint *= (0.6 + 0.4 * sin(t * 6.0 + rnd * 30.0)) * (1.0 - far);
  vec3 water = vec3(0.015, 0.035, 0.09);
  vec3 slat = mix(vec3(0.07, 0.14, 0.3), vec3(0.36, 0.56, 0.92), facing) + vec3(1.0, 0.86, 0.72) * glint * 1.7;
  vec3 col = mix(water, slat, mask);
  col += vec3(1.0, 0.62, 0.45) * exp(-abs(p.x - sun.x) * 7.0) * exp(-yb * 5.0) * 0.45 * mask;
  col = mix(col, hzc, (1.0 - exp(-z * 0.11)) * 0.85);
  // intro: the sea rolls in from the horizon toward the viewer
  float edge = uIntro * (HZ + 0.56);
  float vis = smoothstep(edge, edge - 0.05, yb);
  col = mix(mix(sky, hzc, 0.5), col, vis);
  gl_FragColor = vec4(col, 1.0);
}`;
function M727() {
  const root = useRef<HTMLDivElement>(null);
  const intro = useRef({ v: 0 });
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let tw: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          tw?.kill();
          tw = gsap.fromTo(intro.current, { v: 0 }, { v: 1, duration: 2.3, ease: "power2.out" });
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tw?.kill();
    };
  }, []);
  return (
    <Stage r={root} bg="#04060d" g1="rgba(110,150,255,.5)" g2="rgba(255,150,120,.26)">
      <GLLayer
        frag={M727_F}
        fallback="linear-gradient(180deg,#07080f 0%,#5a2c3a 32%,#1d3460 36%,#0a1a3a 70%,#04060d 100%)"
        uniforms={() => ({ uIntro: { value: 0 } })}
        onFrame={(u) => {
          u.uIntro.value = intro.current.v;
        }}
      />
      <Caption kicker="Coastal rooms · west cliff" title="Low tide," em="high light." note="Sea-facing suites from ₹9,800 a night" accent="#ffc2a6" />
      <Sheen g1="rgba(110,150,255,.5)" opacity={0.3} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "M722", name: "Gem smoke", how: "Domain-warped smoke rendered as faceted gem planes: each triangle catches a slowly orbiting light, with glints and fine facet edges.", kind: "play", C: M722 },
  { code: "M723", name: "Spiral", how: "A five-arm logarithmic spiral shader turns continuously while every stripe walks inward toward its glowing centre.", kind: "play", C: M723 },
  { code: "M724", name: "Spiral dots loop", how: "760 dots on a golden-angle spiral rotate on canvas while a pulse wave runs out along the spiral, swelling and brightening dots.", kind: "play", C: M724 },
  { code: "M725", name: "Neuro noise", how: "Thin glowing filaments, ridges of a warped noise field, drift and branch like neurons while a slow firing wave passes through.", kind: "play", C: M725 },
  { code: "M726", name: "Equalizer slats", how: "56 glowing WebGL bars ripple up and down like an equalizer around a centre line; the lower half breathes from short reflection to full mirror.", kind: "play", C: M726 },
  { code: "M727", name: "Micro slats sea", how: "Thousands of tiny slats form a rolling sea in perspective, glinting as waves pass; on entry the sea rolls in from the horizon.", kind: "play", C: M727 },
];
