"use client";

// Image motions, batch 16 · group 1 (MOTION-MENU M716–M721): a connected squircle carousel, a molten WebGL ring, a
// mirrored-pair image change, a repeated image collapsing into one, a peeling sticker and an electric logo outline.
// Small focused demos for /lab/motion. Every demo is "play": it starts on screen, loops with no rest over 0.3 s and
// pauses off screen. Each stage has a CSS-only glow loop (plus a second glow ON TOP of image-covered stages). Pointer
// demos drive a visible fake pointer ring by themselves; the real mouse takes over while it moves. WebGL demos build
// only within ~1 screen of the viewport, run at dpr 1 and release their context on unmount. ?static=1 / reduced
// motion: no JS motion, CSS loops stop, the markup shows a sensible final state. Motion ideas only (rebuilt from
// scratch, no copied code).
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { createShader, type GLHandle } from "@/lib/gl";
import { scene, toCanvas } from "@/components/fx/shared";
import type { MotionDef } from "./types";

const F = {
  sg: "'Space Grotesk Variable', system-ui, sans-serif",
  fr: "'Fraunces Variable', Georgia, serif",
  is: "'Instrument Serif', Georgia, serif",
  sy: "'Syne Variable', 'Space Grotesk Variable', system-ui, sans-serif",
  mr: "'Manrope Variable', system-ui, sans-serif",
};

const CSS = `
.b16i1-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(79,141,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,122,89,.22)),transparent 70%);animation:b16i1-drift 5.4s linear infinite alternate;will-change:transform}
@keyframes b16i1-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b16i1-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);pointer-events:none;z-index:400;opacity:0}
.b16i1-kb{animation:b16i1-kb 3.2s ease-in-out infinite alternate}
@keyframes b16i1-kb{0%{transform:scale(1.03)}100%{transform:scale(1.11)}}
.m716-card{position:absolute;background:linear-gradient(180deg,#232a40,#171c2c);padding:7px;box-shadow:0 18px 40px rgba(0,0,0,.45)}
.m716-ap{position:absolute;inset:7px;overflow:hidden;border-radius:inherit}
.m718-half{position:absolute;top:0;height:100%;width:50%;overflow:hidden;backface-visibility:hidden}
.m720-wrap{filter:drop-shadow(0 22px 26px rgba(0,0,0,.5))}
.m720-flap{filter:drop-shadow(-5px -5px 7px rgba(0,0,0,.32))}
html.is-static .b16i1-glow,html.is-static .b16i1-kb{animation:none}
html.is-static {.b16i1-glow,.b16i1-kb{animation:none}}
`;

/* ---------- shared helpers (local copies) ---------- */

/** Demo frame: dark rounded panel + the CSS-only glow loop (never frozen). */
function Stage({ r, children, className = "", bg = "#0a0d16", g1, g2 }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; className?: string; bg?: string; g1?: string; g2?: string }) {
  return (
    <div ref={r} className={`relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 text-[#eef2ff] ${className}`} style={{ background: bg }}>
      <style href="b16i1-css" precedence="default">
        {CSS}
      </style>
      <div className="b16i1-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}

/** The CSS glow loop again, ON TOP of photos / cards / canvas (screen blend), so covered stages never freeze. */
const Sheen = ({ g1, opacity = 0.45 }: { g1?: string; opacity?: number }) => (
  <div className="b16i1-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity, zIndex: 350 } as CSSProperties} aria-hidden />
);

/** The visible fake pointer ring. */
const Dot = ({ r }: { r: RefObject<HTMLDivElement | null> }) => <div ref={r} className="b16i1-dot" aria-hidden />;

// eslint-disable-next-line @next/next/no-img-element
const Img = ({ src, className = "", style }: { src: string; className?: string; style?: CSSProperties }) => <img src={src} alt="" className={`h-full w-full object-cover ${className}`} style={style} draggable={false} />;

/** True once the element is within ~1 screen of the viewport (no textures / GL context before that). */
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

type Built = gsap.core.Animation[] | { anims: gsap.core.Animation[]; cleanup?: () => void } | void;
/**
 * GSAP loops: `build` runs once inside a gsap.context; the returned animations play only while the stage is on screen
 * (`vis.on` mirrors that for per-frame work). An optional `cleanup` runs on unmount.
 */
function useAnims(root: RefObject<HTMLDivElement | null>, build: (el: HTMLDivElement, vis: { on: boolean }) => Built) {
  const b = useRef(build);
  b.current = build;
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let anims: gsap.core.Animation[] = [];
    let cleanup: (() => void) | undefined;
    const vis = { on: false };
    const ctx = gsap.context(() => {
      const r = b.current(el, vis);
      if (Array.isArray(r)) anims = r;
      else if (r) {
        anims = r.anims;
        cleanup = r.cleanup;
      }
      anims.forEach((a) => a.pause());
    }, el);
    const io = new IntersectionObserver(
      ([e]) => {
        vis.on = e.isIntersecting;
        anims.forEach((a) => (e.isIntersecting ? a.resume() : a.pause()));
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cleanup?.();
      ctx.revert();
    };
  }, [root]);
}

type U = Record<string, { value: unknown }>;
type ShaderOpts = { dpr?: number; textures?: TexImageSource[]; uniforms?: U; onFrame?: (u: U, t: number) => void };

/**
 * Fragment shader on `cv`, created only once the stage is near the viewport; hides the `fb` fallback after the first
 * frame and destroys the GL context on unmount. `setup` may be async (rasterising textures).
 */
function useShader(root: RefObject<HTMLElement | null>, cv: RefObject<HTMLCanvasElement | null>, fb: RefObject<HTMLElement | null>, frag: string, setup: () => ShaderOpts | Promise<ShaderOpts>) {
  const near = useNear(root);
  const sr = useRef(setup);
  sr.current = setup;
  useEffect(() => {
    if (!near) return;
    let dead = false;
    let h: GLHandle | null = null;
    (async () => {
      const o = await sr.current();
      if (dead || !cv.current) return;
      const user = o.onFrame;
      h = await createShader(cv.current, frag, {
        ...o,
        dpr: o.dpr ?? 1,
        onFrame: (u, t) => {
          user?.(u, t);
          const f = fb.current;
          if (f && f.style.visibility !== "hidden") f.style.visibility = "hidden";
        },
      });
      if (dead) h?.destroy();
    })();
    return () => {
      dead = true;
      h?.destroy();
    };
  }, [near, frag, cv, fb]);
}

/** Real pointer in root px (last move time), for demos where the fake pointer yields to the mouse. */
function useRealPointer(root: RefObject<HTMLElement | null>) {
  const real = useRef({ x: 0, y: 0, at: -1e9, down: false });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mv = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      real.current.x = e.clientX - r.left;
      real.current.y = e.clientY - r.top;
      real.current.at = performance.now();
    };
    const dn = (e: PointerEvent) => {
      mv(e);
      real.current.down = true;
    };
    const up = () => {
      real.current.down = false;
      real.current.at = performance.now();
    };
    el.addEventListener("pointermove", mv);
    el.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointermove", mv);
      el.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", up);
    };
  }, [root]);
  return real;
}

const NOISE_GLSL = /* glsl */ `
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x), u.y);
}
`;

/* ---------- M716 · Connected squircle carousel ---------- */
const M716_N = 5;
const M716_ITEMS = [
  { name: "Harbour lamp", price: "₹4,200" },
  { name: "Ember carafe", price: "₹2,650" },
  { name: "Fern planter", price: "₹1,890" },
  { name: "Dune stool", price: "₹7,400" },
  { name: "Tide bowl", price: "₹1,350" },
];
const M716_SRC = M716_ITEMS.map((_, i) => scene(i % 4, 800, 1000));
const M716_VW = 1000;
const M716_VH = 600;
type M716Card = { x: number; y: number; w: number; h: number; e: number; r: number };
/** Layout in a 1000×600 virtual box for a float active index `a` (sx/sy: px per virtual unit, for the corner radius). */
function m716Layout(a: number, sx = 1.33, sy = 1.05) {
  const bw = 100, aw = 280, bh = 230, ah = 390, g0 = 30, g1 = 46, cy = 290;
  const e = Array.from({ length: M716_N }, (_, i) => Math.max(0, 1 - Math.abs(i - a)));
  const lo = Math.floor(a);
  const bump = Math.sin(Math.PI * (a - lo));
  const gaps = Array.from({ length: M716_N - 1 }, (_, i) => g0 + (i === lo ? g1 * bump : 0) + 14 * (e[i] + e[i + 1]));
  const ws = e.map((v) => bw + (aw - bw) * v);
  const hs = e.map((v) => bh + (ah - bh) * v);
  const total = ws.reduce((s, v) => s + v, 0) + gaps.reduce((s, v) => s + v, 0);
  let x = (M716_VW - total) / 2;
  const cards: M716Card[] = ws.map((w, i) => {
    const h = hs[i];
    const rPx = Math.min(64, 0.24 * Math.min(w * sx, h * sy));
    const c = { x, y: cy - h / 2, w, h, e: e[i], r: rPx };
    x += w + (gaps[i] ?? 0);
    return c;
  });
  const paths = gaps.map((_, i) => {
    const A = cards[i];
    const B = cards[i + 1];
    const a1 = Math.min(A.h / 2 - A.r / sy - 4, A.h * 0.31);
    const a2 = Math.min(B.h / 2 - B.r / sy - 4, B.h * 0.31);
    const x1 = A.x + A.w - 12;
    const x2 = B.x + 12;
    const G = x2 - x1;
    const xm = (x1 + x2) / 2;
    const gap = B.x - (A.x + A.w);
    const n = Math.min(a1, a2) * Math.min(0.55, Math.max(0.16, 16 / gap));
    const f = (v: number) => v.toFixed(1);
    return `M${f(x1)} ${f(cy - a1)}C${f(x1 + G * 0.35)} ${f(cy - a1)} ${f(xm - G * 0.22)} ${f(cy - n)} ${f(xm)} ${f(cy - n)}C${f(xm + G * 0.22)} ${f(cy - n)} ${f(x2 - G * 0.35)} ${f(cy - a2)} ${f(x2)} ${f(cy - a2)}L${f(x2)} ${f(cy + a2)}C${f(x2 - G * 0.35)} ${f(cy + a2)} ${f(xm + G * 0.22)} ${f(cy + n)} ${f(xm)} ${f(cy + n)}C${f(xm - G * 0.22)} ${f(cy + n)} ${f(x1 + G * 0.35)} ${f(cy + a1)} ${f(x1)} ${f(cy + a1)}Z`;
  });
  return { cards, paths, bump };
}
const m716CardStyle = (c: M716Card): CSSProperties => ({
  left: `${(c.x / M716_VW) * 100}%`,
  top: `${(c.y / M716_VH) * 100}%`,
  width: `${(c.w / M716_VW) * 100}%`,
  height: `${(c.h / M716_VH) * 100}%`,
  borderRadius: `${c.r.toFixed(1)}px`,
  zIndex: 2 + Math.round(c.e * 4),
});
const m716Clip = (e: number) => `circle(${(30 + 46 * e).toFixed(2)}% at 50% 50%)`;
function M716() {
  const root = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const aps = useRef<(HTMLDivElement | null)[]>([]);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const cap = useRef<HTMLDivElement>(null);
  const capName = useRef<HTMLSpanElement>(null);
  const capPrice = useRef<HTMLSpanElement>(null);
  const init = m716Layout(2);
  useAnims(root, (el) => {
    const o = { a: 2 };
    let shown = 2;
    const render = () => {
      const sx = el.clientWidth / M716_VW || 1.33;
      const sy = el.clientHeight / M716_VH || 1.05;
      const L = m716Layout(o.a, sx, sy);
      L.cards.forEach((c, i) => {
        const d = cards.current[i];
        if (d) Object.assign(d.style, m716CardStyle(c));
        const ap = aps.current[i];
        if (ap) ap.style.clipPath = m716Clip(c.e);
      });
      L.paths.forEach((p, i) => paths.current[i]?.setAttribute("d", p));
      const idx = Math.round(o.a);
      if (idx !== shown && capName.current && capPrice.current) {
        shown = idx;
        capName.current.textContent = M716_ITEMS[idx].name;
        capPrice.current.textContent = M716_ITEMS[idx].price;
      }
      if (cap.current) cap.current.style.opacity = String(1 - L.bump * 0.85);
    };
    const tl = gsap.timeline({ repeat: -1, onUpdate: render });
    [3, 4, 3, 2, 1, 0, 1, 2].forEach((v) => tl.to(o, { a: v, duration: 0.95, ease: "power2.inOut" }, "+=0.1"));
    render();
    return [tl];
  });
  return (
    <Stage r={root} bg="#090c15" g1="rgba(120,140,255,.55)" g2="rgba(255,150,110,.24)">
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${M716_VW} ${M716_VH}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="m716-br" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#232a40" />
            <stop offset="1" stopColor="#171c2c" />
          </linearGradient>
        </defs>
        {init.paths.map((d, i) => (
          <path key={i} ref={(n) => void (paths.current[i] = n)} d={d} fill="url(#m716-br)" />
        ))}
      </svg>
      {init.cards.map((c, i) => (
        <div key={i} ref={(n) => void (cards.current[i] = n)} className="m716-card" style={m716CardStyle(c)}>
          <div ref={(n) => void (aps.current[i] = n)} className="m716-ap" style={{ clipPath: m716Clip(c.e), borderRadius: "inherit" }}>
            <Img src={M716_SRC[i]} className="b16i1-kb" />
          </div>
        </div>
      ))}
      <div ref={cap} className="pointer-events-none absolute bottom-[7%] left-0 right-0 z-20 text-center" style={{ fontFamily: F.sg }}>
        <p className="text-[13px] uppercase tracking-[0.26em] text-white/60">Objects for slow rooms</p>
        <p className="mt-1 text-[clamp(26px,2.6vw,40px)] font-semibold tracking-[-0.02em]">
          <span ref={capName}>{M716_ITEMS[2].name}</span> <span className="text-white/55">·</span>{" "}
          <span ref={capPrice} className="text-[#a9b6ff]">
            {M716_ITEMS[2].price}
          </span>
        </p>
      </div>
      <Sheen g1="rgba(120,140,255,.5)" opacity={0.35} />
    </Stage>
  );
}

/* ---------- M717 · Molten ring carousel ---------- */
const M717_N = 6;
const M717_NAMES = ["Mercury", "Opal", "Cinder", "Lagoon", "Brass", "Quartz"];
const M717_F = /* glsl */ `
uniform vec4 uB[6];
uniform vec4 uT[6];
uniform float uK;
const vec2 HB = vec2(0.11, 0.15);
float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
float sdSeg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return length(pa - ba * h); }
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float field(vec2 p){
  float d = 1e3;
  for (int i = 0; i < 6; i++) {
    vec4 b = uB[i]; vec2 t = uT[i].xy;
    float db = sdBox(p - b.xy, HB * b.z, 0.035 * b.z);
    float ds = sdSeg(p, b.xy, t) - 0.022 * b.z;
    float dt = length(p - t) - 0.05 * b.z;
    d = smin(d, smin(db, smin(ds, dt, 0.03), uK), uK);
  }
  return d;
}
void main(){
  vec2 p = (vUv - 0.5) * uRes / uRes.y;
  float d = field(p);
  vec2 e = vec2(1.5 / uRes.y, 0.0);
  vec2 g = vec2(field(p + e.xy) - field(p - e.xy), field(p + e.yx) - field(p - e.yx));
  g = g / max(length(g), 1e-5);
  float best = -9.0; vec2 auv = vec2(0.0); float bd = 1.0;
  for (int i = 0; i < 6; i++) {
    vec4 b = uB[i]; vec2 hb = HB * b.z;
    float db = sdBox(p - b.xy, hb, 0.035 * b.z);
    if (db < -0.004 && b.w > best) {
      best = b.w;
      vec2 l = clamp((p - b.xy) / (2.0 * hb) + 0.5, 0.01, 0.99);
      auv = vec2((float(i) + l.x) / 6.0, l.y);
      bd = db;
    }
  }
  float inside = smoothstep(0.003, -0.003, d);
  float rim = 1.0 - clamp(-d / 0.04, 0.0, 1.0);
  vec3 n = normalize(vec3(-g * rim * 1.7, 1.0));
  vec3 L = normalize(vec3(-0.45, 0.6, 0.7));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 28.0);
  vec3 liquid = mix(vec3(0.05, 0.06, 0.13), vec3(0.62, 0.66, 1.0), diff * 0.85) + vec3(1.0, 0.92, 0.96) * spec;
  liquid += vec3(0.95, 0.45, 0.62) * pow(1.0 - n.z, 1.6) * 0.7;
  vec3 col = liquid;
  if (best > -9.0) {
    float m = smoothstep(-0.004, -0.028, bd);
    vec2 off = vec2(n.x / 6.0, n.y) * 0.03;
    vec3 img = texture2D(uTex0, auv + off).rgb;
    col = mix(liquid, img * (0.8 + 0.35 * diff) + spec * 0.5, m);
  }
  float glow = exp(-max(d, 0.0) * 34.0) * 0.32 * (1.0 - inside);
  vec3 outc = col * inside + vec3(0.55, 0.45, 1.0) * glow;
  gl_FragColor = vec4(outc / max(inside + glow, 1e-4), clamp(inside + glow, 0.0, 1.0));
}`;
function m717Box(i: number, th: number) {
  const ph = th + (i * Math.PI * 2) / M717_N;
  const c = Math.cos(ph);
  return { x: Math.sin(ph) * 0.72, y: -c * 0.13 + 0.03, s: 0.62 + 0.38 * (0.5 + 0.5 * c), w: c };
}
function M717() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const fb = useRef<HTMLDivElement>(null);
  const cap = useRef<HTMLSpanElement>(null);
  const st = useRef({ th: 0, prev: 0, v: 0, last: 0 });
  useAnims(root, () => {
    const tl = gsap.timeline({ repeat: -1 });
    for (let k = 1; k <= M717_N; k++) {
      tl.to(st.current, {
        th: (-k * Math.PI * 2) / M717_N,
        duration: 1.05,
        ease: "power3.inOut",
        onComplete: () => {
          if (cap.current) cap.current.textContent = M717_NAMES[k % M717_N];
        },
      }, "+=0.12");
    }
    tl.set(st.current, { th: 0 });
    return [tl];
  });
  useShader(root, cv, fb, M717_F, async () => {
    const atlas = document.createElement("canvas");
    atlas.width = 300 * M717_N;
    atlas.height = 400;
    const ctx = atlas.getContext("2d")!;
    for (let i = 0; i < M717_N; i++) ctx.drawImage(await toCanvas(scene(i % 4, 300, 400), 300, 400), i * 300, 0);
    // plain arrays (OGL only binds uniform arrays given as Array values)
    const B = Array.from({ length: M717_N }, () => [0, 0, 1, 0]);
    const T = Array.from({ length: M717_N }, () => [0, 0, 0, 0]);
    return {
      textures: [atlas],
      uniforms: { uB: { value: B }, uT: { value: T }, uK: { value: 0.04 } },
      onFrame: (u, t) => {
        const S = st.current;
        const dt = Math.max(1e-3, Math.min(0.1, t - S.last));
        S.last = t;
        // the ring always creeps a little (no still frame between steps)
        const th = S.th - t * 0.05;
        let dth = th - S.prev;
        if (dth > Math.PI) dth -= Math.PI * 2;
        if (dth < -Math.PI) dth += Math.PI * 2;
        const raw = dth / dt;
        S.prev = th;
        S.v += (raw - S.v) * Math.min(1, dt * 10);
        for (let i = 0; i < M717_N; i++) {
          const b = m717Box(i, th);
          const tb = m717Box(i, th - S.v * 0.16);
          B[i] = [b.x, b.y, b.s, b.w];
          T[i] = [tb.x, tb.y, 0, 0];
        }
        u.uK.value = 0.035 + Math.min(0.1, Math.abs(S.v) * 0.045);
        u.uB.value = B;
        u.uT.value = T;
      },
    };
  });
  return (
    <Stage r={root} bg="#07080f" g1="rgba(150,120,255,.55)" g2="rgba(255,120,170,.24)">
      <div ref={fb} className="absolute inset-0">
        {Array.from({ length: M717_N }, (_, i) => {
          const b = m717Box(i, 0);
          return (
            <div
              key={i}
              className="absolute overflow-hidden rounded-[14px] border border-white/15"
              style={{ left: `${50 + (b.x / 2.1) * 100}%`, top: `${50 - b.y * 100}%`, width: `${((0.22 * b.s) / 2.1) * 100}%`, height: `${0.3 * b.s * 100}%`, transform: "translate(-50%,-50%)", zIndex: Math.round((b.w + 1) * 5) }}
            >
              <Img src={scene(i % 4, 300, 400)} />
            </div>
          );
        })}
      </div>
      <canvas ref={cv} className="absolute inset-0 h-full w-full transition-opacity duration-300" style={{ opacity: 0 }} aria-hidden />
      <div className="pointer-events-none absolute left-[6%] top-[9%] z-20" style={{ fontFamily: F.sy }}>
        <p className="text-[13px] uppercase tracking-[0.26em] text-white/60" style={{ fontFamily: F.sg }}>
          Liquid metal finishes · from ₹3,200
        </p>
        <h3 className="mt-2 text-[clamp(34px,3.8vw,58px)] font-[800] uppercase leading-none tracking-[-0.02em]">
          <span ref={cap}>{M717_NAMES[0]}</span>
        </h3>
      </div>
      <Sheen g1="rgba(150,120,255,.5)" opacity={0.3} />
    </Stage>
  );
}

/* ---------- M718 · Mirrored pair transition ---------- */
const M718_SET = [
  { src: scene(0, 900, 1000), name: "Tidal vase", price: "₹3,800" },
  { src: scene(1, 900, 1000), name: "Coral flask", price: "₹2,450" },
  { src: scene(3, 900, 1000), name: "Amber jar", price: "₹1,990" },
];
function M718() {
  const root = useRef<HTMLDivElement>(null);
  useAnims(root, (el) => {
    const pairs = gsap.utils.toArray<HTMLElement>(".m718-pair", el);
    const caps = gsap.utils.toArray<HTMLElement>(".m718-cap", el);
    const tl = gsap.timeline({ repeat: -1 });
    gsap.set(pairs, { autoAlpha: 0, zIndex: 0 });
    gsap.set(pairs[0], { autoAlpha: 1, zIndex: 2 });
    gsap.set(caps, { autoAlpha: 0 });
    gsap.set(caps[0], { autoAlpha: 1 });
    M718_SET.forEach((_, k) => {
      const cur = pairs[k];
      const nxt = pairs[(k + 1) % pairs.length];
      const [cl, cr] = Array.from(cur.querySelectorAll<HTMLElement>(".m718-half"));
      const [nl, nr] = Array.from(nxt.querySelectorAll<HTMLElement>(".m718-half"));
      const shade = nxt.querySelector<HTMLElement>(".m718-shade");
      const at = tl.duration() + 0.12;
      tl.set(cur, { zIndex: 2, autoAlpha: 1 }, at)
        .set(nxt, { zIndex: 1, autoAlpha: 1, scale: 1.16 }, at)
        .set([nl, nr], { rotationY: 0, xPercent: 0, autoAlpha: 1 }, at)
        .set(shade, { opacity: 0.65 }, at)
        .to(cl, { rotationY: -78, xPercent: -38, autoAlpha: 0, duration: 1.1, ease: "power3.inOut" }, at)
        .to(cr, { rotationY: 78, xPercent: 38, autoAlpha: 0, duration: 1.1, ease: "power3.inOut" }, at)
        .to(nxt, { scale: 1, duration: 1.2, ease: "power2.out" }, at + 0.05)
        .to(shade, { opacity: 0, duration: 1, ease: "power1.out" }, at + 0.05)
        .to(caps[k], { autoAlpha: 0, y: -14, duration: 0.45, ease: "power2.in" }, at)
        .fromTo(caps[(k + 1) % caps.length], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, at + 0.5)
        .set(cur, { autoAlpha: 0, zIndex: 0 }, at + 1.2);
    });
    return [tl];
  });
  return (
    <Stage r={root} bg="#0b0a10" g1="rgba(255,150,110,.55)" g2="rgba(110,150,255,.24)">
      <div className="absolute left-1/2 top-[8%] h-[76%] w-[min(64%,820px)] -translate-x-1/2" style={{ perspective: "1600px" }}>
        {M718_SET.map((it, i) => (
          <div key={i} className="m718-pair absolute inset-0 overflow-hidden rounded-[22px]" style={{ visibility: i === 0 ? "visible" : "hidden", zIndex: i === 0 ? 2 : 0 }}>
            <div className="m718-half left-0" style={{ transformOrigin: "0% 50%" }}>
              <Img src={it.src} className="b16i1-kb" style={{ objectPosition: "100% 50%" }} />
            </div>
            <div className="m718-half right-0" style={{ transformOrigin: "100% 50%" }}>
              <div className="h-full w-full" style={{ transform: "scaleX(-1)" }}>
                <Img src={it.src} className="b16i1-kb" style={{ objectPosition: "100% 50%" }} />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-white/25" />
            <div className="m718-shade pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0 }} />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-[5%] left-0 right-0 z-20 h-[56px] text-center" style={{ fontFamily: F.is }}>
        {M718_SET.map((it, i) => (
          <p key={i} className="m718-cap absolute inset-x-0 text-[clamp(30px,3vw,46px)] leading-none" style={{ visibility: i === 0 ? "visible" : "hidden" }}>
            {it.name} <span className="text-[0.6em] text-[#ffc7a8]" style={{ fontFamily: F.sg }}>{it.price}</span>
          </p>
        ))}
      </div>
      <Sheen g1="rgba(255,150,110,.5)" />
    </Stage>
  );
}

/* ---------- M719 · Repeated image collapses to one ---------- */
const M719_C = 5;
const M719_R = 3;
const M719_IA = 2100 / 1000;
const M719_SRC = scene(2, 2100, 1000);
function M719() {
  const root = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const one = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLDivElement | null)[]>([]);
  const inners = useRef<(HTMLDivElement | null)[]>([]);
  useAnims(root, () => {
    const b = box.current;
    if (!b) return;
    b.style.visibility = "visible";
    if (one.current) one.current.style.visibility = "hidden";
    const o = { p: 1 };
    const geo = (a: number, c: number, p: number) => a * Math.pow(c / a, p);
    const render = () => {
      const W = b.clientWidth;
      const H = b.clientHeight;
      const p = o.p;
      const gap = 14 * (1 - p);
      const tw = (W - (M719_C - 1) * gap) / M719_C;
      const th = (H - (M719_R - 1) * gap) / M719_R;
      // cover-fit sizes: image in one tile (pattern) vs image in the whole box (one picture)
      const sT = Math.max(tw / M719_IA, th);
      const sB = Math.max(W / M719_IA, H);
      const ih = geo(sT, sB, p);
      const iw = ih * M719_IA;
      const rad = 16 * (1 - p);
      for (let r = 0; r < M719_R; r++)
        for (let c = 0; c < M719_C; c++) {
          const i = r * M719_C + c;
          const t = tiles.current[i];
          if (!t) continue;
          const tx = c * (tw + gap);
          const ty = r * (th + gap);
          const cx = tw / 2 + (W / 2 - tx - tw / 2) * p;
          const cy = th / 2 + (H / 2 - ty - th / 2) * p;
          t.style.left = `${tx}px`;
          t.style.top = `${ty}px`;
          t.style.width = `${tw}px`;
          t.style.height = `${th}px`;
          t.style.borderRadius = `${rad}px`;
          t.style.backgroundSize = `${iw}px ${ih}px`;
          t.style.backgroundPosition = `${cx - iw / 2}px ${cy - ih / 2}px`;
          const inn = inners.current[i];
          if (inn) {
            inn.style.opacity = String(Math.max(0, 1 - p * 1.6));
            inn.style.transform = `scale(${1 + p * 0.9})`;
          }
        }
    };
    const tw = gsap.to(o, { p: 0, duration: 1.45, ease: "power2.inOut", repeat: -1, yoyo: true, repeatDelay: 0.1, onUpdate: render });
    render();
    const ro = new ResizeObserver(render);
    ro.observe(b);
    return { anims: [tw], cleanup: () => ro.disconnect() };
  });
  const bg = `url("${M719_SRC}")`;
  return (
    <Stage r={root} bg="#06100c" g1="rgba(80,220,160,.5)" g2="rgba(200,255,140,.2)">
      <div className="absolute inset-x-[7%] top-[8%] bottom-[20%]">
        <div ref={one} className="absolute inset-0 overflow-hidden rounded-[6px]">
          <Img src={M719_SRC} />
        </div>
        <div ref={box} className="absolute inset-0" style={{ visibility: "hidden" }}>
          {Array.from({ length: M719_C * M719_R }, (_, i) => (
            <div key={i} ref={(n) => void (tiles.current[i] = n)} className="absolute overflow-hidden" style={{ backgroundImage: bg, backgroundRepeat: "no-repeat", backgroundColor: "#07140f" }}>
              <div
                ref={(n) => void (inners.current[i] = n)}
                className="absolute inset-[24%] rounded-[8px] border border-white/40 shadow-[0_8px_24px_rgba(0,0,0,.45)]"
                style={{ backgroundImage: bg, backgroundSize: "cover", backgroundPosition: "center", opacity: 0 }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-[6%] left-[7%] right-[7%] z-20 flex items-end justify-between" style={{ fontFamily: F.sg }}>
        <h3 className="text-[clamp(30px,3.2vw,50px)] font-semibold leading-none tracking-[-0.03em]">
          Many rooms, <span style={{ fontFamily: F.is, fontWeight: 400 }}>one view.</span>
        </h3>
        <p className="text-[13px] uppercase tracking-[0.24em] text-white/65">Glasshouse stays · ₹8,900 / night</p>
      </div>
      <Sheen g1="rgba(80,220,160,.45)" />
    </Stage>
  );
}

/* ---------- M720 · Sticker peel ---------- */
const M720_SRC = scene(1, 800, 800);
const M720_ROT = -6;
const m720Front = (c: number) => `polygon(0 0,100% 0,100% ${c - 100}%,${c - 100}% 100%,0 100%)`;
const m720Flap = (c: number) => `polygon(${c - 100}% 100%,${c - 100}% ${c - 100}%,100% ${c - 100}%)`;
const m720FlapBg = (c: number) => {
  const tip = c - 100;
  const fold = c / 2;
  return `repeating-linear-gradient(45deg,rgba(0,0,0,.035) 0 6px,transparent 6px 12px),linear-gradient(135deg,#f7f4ec ${tip}%,#e2ddd2 ${(tip + fold) / 2}%,#aea898 ${fold}%)`;
};
const m720Shade = (c: number) => `linear-gradient(135deg,transparent ${c / 2 - 14}%,rgba(0,0,0,.34) ${c / 2}%)`;
function M720() {
  const root = useRef<HTMLDivElement>(null);
  const stk = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const real = useRealPointer(root);
  useAnims(root, (el, vis) => {
    const s = stk.current;
    if (!s) return;
    const o = { x: 0, y: 0, t: 0, down: 0 };
    let cur = 0;
    const apply = (t: number) => {
      const c = 200 - Math.min(92, Math.max(0, t));
      if (front.current) front.current.style.clipPath = m720Front(c);
      if (shade.current) shade.current.style.background = m720Shade(c);
      if (flap.current) {
        flap.current.style.clipPath = m720Flap(c);
        flap.current.style.background = m720FlapBg(c);
      }
    };
    const S = () => s.clientWidth || 320;
    const tl = gsap.timeline({ repeat: -1 });
    const build = () => {
      const k = S();
      tl.clear();
      tl.set(o, { x: 1.35 * k, y: 1.25 * k, t: 0, down: 0 })
        .to(o, { x: 0.94 * k, y: 0.94 * k, duration: 0.55, ease: "power2.out" })
        .to(o, { t: 18, duration: 0.3, ease: "power2.out" }, "-=0.15")
        .set(o, { down: 1 })
        .to(o, { x: 0.22 * k, y: 0.28 * k, t: ((2 * k - 0.5 * k) / (2 * k)) * 100, duration: 1.05, ease: "power2.inOut" })
        .to(o, { x: 0.26 * k, y: 0.24 * k, t: 74, duration: 0.2, ease: "sine.inOut" })
        .set(o, { down: 0 })
        .to(o, { t: 18, duration: 0.4, ease: "power3.out" })
        .to(o, { x: 0.6 * k, y: 0.62 * k, duration: 0.4, ease: "power2.inOut" }, "<")
        .to(o, { x: 1.35 * k, y: 1.25 * k, t: 0, duration: 0.45, ease: "power2.in" });
    };
    build();
    const tick = (_t: number, dtMs: number) => {
      if (!vis.on) return;
      const R = real.current;
      const live = performance.now() - R.at < 2500 || R.down;
      const k = S();
      let target = o.t;
      if (live) {
        if (!tl.paused()) tl.pause();
        // client → sticker-local coordinates (undo the wrapper rotation)
        const rr = el.getBoundingClientRect();
        const sr = s.getBoundingClientRect();
        const cx = sr.left + sr.width / 2 - rr.left;
        const cy = sr.top + sr.height / 2 - rr.top;
        const a = (-M720_ROT * Math.PI) / 180;
        const dx = R.x - cx;
        const dy = R.y - cy;
        const lx = dx * Math.cos(a) - dy * Math.sin(a) + k / 2;
        const ly = dx * Math.sin(a) + dy * Math.cos(a) + k / 2;
        const inside = lx > 0 && ly > 0 && lx < k && ly < k;
        if (R.down && (cur > 5 || (inside && lx + ly > 1.4 * k))) target = ((2 * k - lx - ly) / (2 * k)) * 100;
        else target = inside && lx + ly > 1.4 * k ? 18 : 0;
      } else if (tl.paused()) tl.resume();
      cur += (target - cur) * Math.min(1, (dtMs / 1000) * (live ? 14 : 60));
      apply(cur);
      const d = dot.current;
      if (d) {
        d.style.transform = `translate3d(${o.x.toFixed(1)}px,${o.y.toFixed(1)}px,0) scale(${o.down ? 0.8 : 1})`;
        d.style.opacity = live ? "0" : "1";
      }
    };
    gsap.ticker.add(tick);
    const ro = new ResizeObserver(build);
    ro.observe(s);
    return {
      anims: [tl],
      cleanup: () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
      },
    };
  });
  return (
    <Stage r={root} bg="#100b0d" g1="rgba(255,120,150,.55)" g2="rgba(255,210,120,.24)">
      <div className="pointer-events-none absolute left-[7%] top-1/2 z-20 w-[min(34%,440px)] -translate-y-1/2" style={{ fontFamily: F.sg }}>
        <p className="text-[13px] uppercase tracking-[0.26em] text-white/60">Sticker pack · 01</p>
        <h3 className="mt-3 text-[clamp(38px,4.2vw,66px)] font-semibold leading-[0.95] tracking-[-0.035em]">
          Peel it. <span style={{ fontFamily: F.is, fontWeight: 400 }}>Stick it anywhere.</span>
        </h3>
        <p className="mt-4 text-[15px] text-white/70">Matte vinyl, weatherproof · ₹249 for a sheet of six</p>
      </div>
      <div className="absolute left-[62%] top-1/2 z-10" style={{ transform: `translate(-50%,-50%) rotate(${M720_ROT}deg)` }}>
        <div ref={stk} className="m720-wrap relative h-[min(56vh,380px)] w-[min(56vh,380px)] touch-none">
          <div ref={front} className="absolute inset-0 overflow-hidden rounded-[26px] bg-[#fbf8f2] p-[14px]" style={{ clipPath: m720Front(200) }}>
            <div className="h-full w-full overflow-hidden rounded-[16px]">
              <Img src={M720_SRC} />
            </div>
            <div className="absolute left-[26px] top-[22px] rounded-full bg-[#fbf8f2] px-3 py-1 text-[12px] font-bold uppercase tracking-[0.18em] text-[#2a1d22]" style={{ fontFamily: F.sg }}>
              Sunday club
            </div>
            <div ref={shade} className="pointer-events-none absolute inset-0" style={{ background: m720Shade(200) }} />
          </div>
          <div className="m720-flap pointer-events-none absolute inset-0">
            <div ref={flap} className="absolute inset-0" style={{ clipPath: m720Flap(200), background: m720FlapBg(200) }} />
          </div>
          <Dot r={dot} />
        </div>
      </div>
      <Sheen g1="rgba(255,120,150,.4)" opacity={0.3} />
    </Stage>
  );
}

/* ---------- M721 · Electric logo outline (variant of M8) ---------- */
const M721_F = /* glsl */ `
${NOISE_GLSL}
uniform vec2 uMouse;
uniform vec4 uArc[3];
uniform vec3 uArcL[3];
const vec2 OFF = vec2(0.36, 0.0);
float sdHex(vec2 p, float r){
  const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
  p = abs(p);
  p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
  p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return length(p) * sign(p.y);
}
float sdSeg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
float logo(vec2 p){
  float h = abs(sdHex(p, 0.29));
  float b = sdSeg(p, vec2(0.06, 0.17), vec2(-0.07, 0.0));
  b = min(b, sdSeg(p, vec2(-0.07, 0.0), vec2(0.06, 0.0)));
  b = min(b, sdSeg(p, vec2(0.06, 0.0), vec2(-0.06, -0.17)));
  return min(h, b);
}
void main(){
  vec2 p = (vUv - 0.5) * uRes / uRes.y - OFF;
  vec2 m = uMouse - OFF;
  float t = uTime;
  float charge = exp(-length(p - m) * 7.0);
  float I = 0.0;
  for (int k = 0; k < 3; k++) {
    float fk = float(k);
    vec2 w = vec2(vnoise(p * 9.0 + vec2(t * 2.1, fk * 4.7)), vnoise(p * 9.0 + vec2(fk * 7.3, -t * 1.8))) - 0.5;
    vec2 w2 = vec2(vnoise(p * 23.0 + vec2(-t * 4.0, fk * 3.1)), vnoise(p * 23.0 + vec2(fk * 1.7, t * 3.6))) - 0.5;
    float d = logo(p + w * (0.034 + 0.02 * charge) + w2 * 0.008);
    float flow = 0.55 + 0.45 * sin(atan(p.y, p.x) * 5.0 - t * (4.0 + fk) + fk * 2.1);
    I += 0.0016 / (d + 0.0022) * flow * (0.7 + 0.3 * fk / 2.0);
  }
  I *= 1.0 + 2.2 * charge;
  float base = 0.0011 / (logo(p) + 0.003);
  for (int j = 0; j < 3; j++) {
    vec4 A = uArc[j]; vec3 Lf = uArcL[j];
    if (Lf.z < 0.5) continue;
    vec2 a = A.xy - OFF, b = A.zw - OFF;
    vec2 ba = b - a; vec2 pa = p - a;
    float len = max(length(ba), 1e-4);
    vec2 dir = ba / len; vec2 nrm = vec2(-dir.y, dir.x);
    float h = clamp(dot(pa, dir) / len, 0.0, 1.0);
    float env = sin(3.14159 * h);
    float disp = (vnoise(vec2(h * 7.0, Lf.y * 13.0 + t * 22.0)) - 0.5) * 0.11 * env + (vnoise(vec2(h * 26.0, Lf.y * 5.0 - t * 30.0)) - 0.5) * 0.025 * env;
    vec2 c = a + ba * h + nrm * disp;
    float d = length(p - c);
    float fade = (1.0 - Lf.x) * (0.6 + 0.4 * step(0.5, fract(Lf.x * 9.0 + Lf.y)));
    I += 0.0013 / (d + 0.0018) * fade;
  }
  vec3 col = vec3(0.45, 0.68, 1.0) * I + vec3(0.75, 0.55, 1.0) * base * 0.6 + vec3(1.0) * pow(I, 2.2) * 0.22;
  col = 1.0 - exp(-col);
  float a = clamp(max(max(col.r, col.g), col.b) * 1.15, 0.0, 1.0);
  gl_FragColor = vec4(col / max(a, 1e-4), a);
}`;
const M721_HEX_R = 0.29 / Math.cos(Math.PI / 6);
function M721() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const fb = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const real = useRealPointer(root);
  useShader(root, cv, fb, M721_F, () => {
    const arcs = Array.from({ length: 3 }, () => ({ life: 1, on: 0, sx: 0, sy: 0, ex: 0, ey: 0, seed: 0 }));
    const A = Array.from({ length: 3 }, () => [0, 0, 0, 0]);
    const L = Array.from({ length: 3 }, () => [1, 0, 0]);
    const m = { x: 0.36, y: 0 };
    let last = 0;
    let next = 0.1;
    return {
      uniforms: { uMouse: { value: [0.36, 0] }, uArc: { value: A }, uArcL: { value: L } },
      onFrame: (u, t) => {
        const dt = Math.max(0, Math.min(0.1, t - last));
        last = t;
        const el = root.current;
        if (!el) return;
        const W = el.clientWidth;
        const H = el.clientHeight;
        const R = real.current;
        const live = performance.now() - R.at < 2500;
        // fake pointer orbits the mark on a wobbling loop
        const fx = 0.36 + Math.cos(t * 0.9) * (0.44 + 0.06 * Math.sin(t * 2.3));
        const fy = Math.sin(t * 0.9) * (0.36 + 0.05 * Math.cos(t * 1.7));
        const tx = live ? (R.x / W - 0.5) * (W / H) : fx;
        const ty = live ? 0.5 - R.y / H : fy;
        m.x += (tx - m.x) * Math.min(1, dt * 9);
        m.y += (ty - m.y) * Math.min(1, dt * 9);
        u.uMouse.value = [m.x, m.y];
        const d = dot.current;
        if (d) {
          d.style.transform = `translate3d(${((m.x / (W / H) + 0.5) * W).toFixed(1)}px,${((0.5 - m.y) * H).toFixed(1)}px,0)`;
          d.style.opacity = live ? "0" : "1";
        }
        next -= dt;
        if (next <= 0) {
          next = 0.18 + Math.random() * 0.22;
          const free = arcs.find((a) => a.life >= 1);
          if (free) {
            // start on a hexagon vertex (the one nearest the pointer half the time)
            const mx = m.x - 0.36;
            const my = m.y;
            let k = Math.floor(Math.random() * 6);
            if (Math.random() < 0.55) k = Math.round(Math.atan2(my, mx) / (Math.PI / 3));
            const ang = (k * Math.PI) / 3;
            free.sx = 0.36 + Math.cos(ang) * M721_HEX_R;
            free.sy = Math.sin(ang) * M721_HEX_R;
            const toP = Math.hypot(m.x - free.sx, m.y - free.sy);
            if (toP < 0.32) {
              free.ex = m.x;
              free.ey = m.y;
            } else {
              const ja = ang + (Math.random() - 0.5) * 1.1;
              const len = 0.12 + Math.random() * 0.14;
              free.ex = free.sx + Math.cos(ja) * len;
              free.ey = free.sy + Math.sin(ja) * len;
            }
            free.seed = Math.random() * 10;
            free.life = 0;
            free.on = 1;
          }
        }
        arcs.forEach((a, i) => {
          if (a.life < 1) a.life = Math.min(1, a.life + dt / 0.34);
          else a.on = 0;
          A[i] = [a.sx, a.sy, a.ex, a.ey];
          L[i] = [a.life, a.seed, a.on];
        });
        u.uArc.value = A;
        u.uArcL.value = L;
      },
    };
  });
  // fallback outline (static): hexagon + bolt in the same place as the shader mark
  const hexPts = Array.from({ length: 6 }, (_, k) => {
    const a = (k * Math.PI) / 3;
    return `${(Math.cos(a) * M721_HEX_R * 100).toFixed(2)},${(-Math.sin(a) * M721_HEX_R * 100).toFixed(2)}`;
  }).join(" ");
  return (
    <Stage r={root} bg="#05070d" g1="rgba(90,150,255,.55)" g2="rgba(170,120,255,.24)">
      <div ref={fb} className="absolute inset-0">
        <svg className="absolute left-[67%] top-1/2 aspect-square h-[80%] -translate-x-1/2 -translate-y-1/2 overflow-visible" viewBox="-40 -40 80 80" aria-hidden>
          <g fill="none" stroke="#9cc0ff" strokeWidth="0.8" strokeLinejoin="round" strokeLinecap="round">
            <polygon points={hexPts} />
            <polyline points="6,-17 -7,0 6,0 -6,17" />
          </g>
          <g fill="none" stroke="#9cc0ff" strokeOpacity=".18" strokeWidth="4" strokeLinejoin="round">
            <polygon points={hexPts} />
            <polyline points="6,-17 -7,0 6,0 -6,17" />
          </g>
        </svg>
      </div>
      <canvas ref={cv} className="absolute inset-0 h-full w-full transition-opacity duration-300" style={{ opacity: 0 }} aria-hidden />
      <div className="pointer-events-none absolute left-[7%] top-1/2 z-20 w-[min(36%,460px)] -translate-y-1/2" style={{ fontFamily: F.sg }}>
        <p className="text-[13px] uppercase tracking-[0.26em] text-[#9cc0ff]/80">Voltline energy · est. 2026</p>
        <h3 className="mt-3 text-[clamp(38px,4.2vw,66px)] font-semibold leading-[0.95] tracking-[-0.035em]">
          Charged, <span style={{ fontFamily: F.is, fontWeight: 400 }}>by design.</span>
        </h3>
        <p className="mt-4 text-[15px] text-white/65">Home battery packs from ₹38,000</p>
      </div>
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  { code: "M716", name: "Connected squircle carousel", how: "Squircle cards joined by curved SVG bridges; the active card opens its circular aperture and grows while the bridges stretch thin between them.", kind: "play", C: M716 },
  { code: "M717", name: "Molten ring carousel", how: "Image cards on a WebGL ring are liquid boxes: they fuse with their neighbours and pull molten strands behind them as the ring steps round.", kind: "play", C: M717 },
  { code: "M718", name: "Mirrored pair transition", how: "Each image shows with a mirrored twin; the two halves swing apart in 3D, revealing the next mirrored pair settling in beneath.", kind: "play", C: M718 },
  { code: "M719", name: "Repeated image collapses to one", how: "A grid of repeated copies (each with an inner copy) zooms and slides together into one seamless picture, then splits back out.", kind: "play", C: M719 },
  { code: "M720", name: "Sticker peel", how: "A (fake) pointer hovers a sticker's corner to lift it, then drags it back: the flap shows its paper backing and shadow, then settles.", kind: "play", C: M720 },
  { code: "M721", name: "Electric logo outline", how: "A logo outline turns into flowing WebGL lightning strands; arcs leap off its corners and the charge brightens toward the (fake) pointer.", kind: "play", C: M721 },
];
