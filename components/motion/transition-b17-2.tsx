"use client";

// Transition motions, batch 17 · group 2 (MOTION-MENU X96–X100): a dust disintegration, a hinge-and-fall page, a
// newspaper spin, a two-stack 3D lift slider and a WebGL cloth peel. Small focused demos for /lab/motion.
// Every demo loops A → B → A by itself while on screen (no rest longer than ~0.3 s) and pauses off screen. A CSS-only
// glow loop (also ON TOP of the pages, screen-blended) never stops. Canvas / WebGL work starts only within ~1 screen of
// the viewport, runs at dpr 1 and is released on unmount.
// ?static=1 / reduced motion: no JS motion, CSS loops stop, the markup shows page A (X100: the revealed page) with the
// other page hidden.
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { scene, useTicker } from "@/components/fx/shared";
import type { MotionDef } from "./types";

const F = { sg: "Space Grotesk Variable", fr: "Fraunces Variable", is: "Instrument Serif", sy: "Syne Variable", mr: "Manrope Variable" };

const CSS = `
.b17t2-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(255,213,154,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,143,122,.22)),transparent 70%);animation:b17t2-drift 5.2s linear infinite alternate;will-change:transform}
@keyframes b17t2-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b17t2-dot{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.18);box-shadow:0 0 0 6px rgba(255,255,255,.08),0 4px 14px rgba(0,0,0,.4);pointer-events:none;z-index:60}
.b17t2-dot::after{content:"";position:absolute;inset:-8px;border-radius:50%;border:1.5px solid rgba(255,255,255,.7);animation:b17t2-ping 1.2s ease-out infinite}
@keyframes b17t2-ping{0%{transform:scale(.5);opacity:1}100%{transform:scale(1.8);opacity:0}}
.b17t2-kb{animation:b17t2-kb 6s linear infinite alternate}
@keyframes b17t2-kb{to{transform:scale(1.08) translate(-2%,1%)}}
.x96-float{animation:x96-float 3.2s ease-in-out infinite alternate}
@keyframes x96-float{0%{transform:translate3d(0,-6px,0)}100%{transform:translate3d(0,6px,0)}}
html.is-static .b17t2-glow,html.is-static .b17t2-dot::after,html.is-static .b17t2-kb,html.is-static .x96-float{animation:none}
html.is-static .b17t2-dot{display:none}
html.is-static {
  .b17t2-glow,.b17t2-dot::after,.b17t2-kb,.x96-float{animation:none}
  .b17t2-dot{display:none}
}
`;

/* ---------- shared helpers (local copies) ---------- */

function Stage({ r, children, className = "", g1, g2 }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; className?: string; g1?: string; g2?: string }) {
  return (
    <div ref={r} className={`relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0a0d] text-[#f6f1ea] ${className}`}>
      <style href="b17t2-css" precedence="default">
        {CSS}
      </style>
      <div className="b17t2-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="x-in relative h-full w-full">{children}</div>
    </div>
  );
}

/** The CSS glow loop again, ON TOP of the pages (screen blend), so covered stages never read as a freeze. */
const Sheen = ({ g1 = "rgba(255,213,154,.55)", opacity = 0.45 }: { g1?: string; opacity?: number }) => (
  <div className="b17t2-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity, zIndex: 55 } as CSSProperties} aria-hidden />
);

const Dot = ({ c, r }: { c?: string; r?: RefObject<HTMLDivElement | null> }) => <div ref={r} className={`b17t2-dot ${c ?? ""}`} style={{ opacity: 0 }} aria-hidden />;

/** "play" helper: waits for fonts, builds the looping timeline in a gsap.context, plays only on screen, rebuilds on resize. */
function usePlay(ref: RefObject<HTMLElement | null>, build: (root: HTMLElement) => gsap.core.Animation | void) {
  const b = useRef(build);
  b.current = build;
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    let dead = false;
    let on = false;
    let ready = false;
    let anim: gsap.core.Animation | void;
    let ctx = gsap.context(() => {}, root);
    let timer = 0;
    const sync = () => {
      if (!anim) return;
      if (on) anim.play();
      else anim.pause();
    };
    const make = () => {
      ctx.revert();
      ctx = gsap.context(() => {}, root);
      ctx.add(() => {
        anim = b.current(root);
      });
      sync();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        on = e.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    io.observe(root);
    const onResize = () => {
      if (!ready) return;
      clearTimeout(timer);
      timer = window.setTimeout(make, 220);
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => {
      if (dead) return;
      ready = true;
      make();
    });
    return () => {
      dead = true;
      clearTimeout(timer);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, [ref]);
}

type Box = { x: number; y: number; w: number; h: number };
function rel(node: Element, root: Element): Box {
  const a = node.getBoundingClientRect();
  const r = root.getBoundingClientRect();
  return { x: a.left - r.left, y: a.top - r.top, w: a.width, h: a.height };
}
const centre = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
const hold = (tl: gsap.core.Timeline, d = 0.15) => tl.to({}, { duration: d });

/** Fake pointer: glide to a point, then a short press. */
function tap(tl: gsap.core.Timeline, dot: Element, p: { x: number; y: number }, at?: gsap.Position) {
  tl.to(dot, { x: p.x, y: p.y, opacity: 1, duration: 0.4, ease: "power2.inOut" }, at);
  tl.to(dot, { scale: 0.7, duration: 0.1, ease: "power1.in" }).to(dot, { scale: 1, duration: 0.12, ease: "power1.out" });
}

/** Runs `fn` once the element is within ~1 screen of the viewport (no canvases / GL contexts at page load). */
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

// eslint-disable-next-line @next/next/no-img-element
const Img = ({ i, className = "", style, w = 1000, h = 1000 }: { i: number; className?: string; style?: CSSProperties; w?: number; h?: number }) => (
  <img src={scene(i, w, h)} alt="" className={`h-full w-full object-cover ${className}`} style={style} draggable={false} />
);

const HIDDEN: CSSProperties = { visibility: "hidden", opacity: 0 };
const Label = ({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) => (
  <p className={`text-[13px] uppercase tracking-[0.22em] ${className}`} style={{ fontFamily: F.mr, ...style }}>
    {children}
  </p>
);

/* ───────────────────────── X96 · Dust disintegrate (variant of X8) ───────────────────────── */
const X96_CARDS = [
  { title: "Ember Lamp", tag: "AUTUMN LIGHT", price: "₹ 5,400", bg1: "#2a120b", bg2: "#ff9a5a", obj: "#ffe1c4", head: "Last light", sub: "Hand-spun brass, linen shade." },
  { title: "Frost Vase", tag: "WINTER GLASS", price: "₹ 3,900", bg1: "#0d1730", bg2: "#6fa8ff", obj: "#e6f1ff", head: "First frost", sub: "Mouth-blown glass, smoke grey." },
];
/** A self-contained SVG product card (system fonts only, no nested images) so it can be rasterised into particles. */
function x96Card(k: number) {
  const c = X96_CARDS[k];
  const W = 600;
  const H = 760;
  const art =
    k === 0
      ? `<path d="M220 160 L380 160 L430 300 L170 300 Z" fill="${c.obj}"/><rect x="292" y="300" width="16" height="170" fill="${c.obj}" opacity=".85"/><ellipse cx="300" cy="478" rx="78" ry="16" fill="${c.obj}"/><ellipse cx="300" cy="300" rx="130" ry="26" fill="#ffd27a" opacity=".55"/>`
      : `<path d="M262 150 h76 v40 q70 40 70 150 q0 120 -70 150 h-76 q-70 -30 -70 -150 q0 -110 70 -150 z" fill="${c.obj}" opacity=".92"/><path d="M276 210 q-40 40 -40 130" stroke="#ffffff" stroke-width="10" fill="none" opacity=".7"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.bg2}"/><stop offset="1" stop-color="${c.bg1}"/></linearGradient><radialGradient id="g" cx="50%" cy="38%" r="55%"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><clipPath id="c"><rect width="${W}" height="${H}" rx="36"/></clipPath></defs><g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="url(#b)"/><rect width="${W}" height="${H}" fill="url(#g)"/><ellipse cx="300" cy="500" rx="200" ry="26" fill="#000" opacity=".25"/>${art}<rect y="560" width="${W}" height="200" fill="#0c0b0e" opacity=".88"/><text x="44" y="616" font-family="Arial, Helvetica, sans-serif" font-size="18" letter-spacing="4" fill="${c.bg2}">${c.tag}</text><text x="44" y="672" font-family="Georgia, serif" font-size="46" fill="#f6f1ea">${c.title}</text><text x="44" y="720" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="28" fill="#f6f1ea" opacity=".85">${c.price}</text></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
const X96_SRC = [x96Card(0), x96Card(1)];
type Dust = { n: number; px: Float32Array; py: Float32Array; rgb: Uint8Array; del: Float32Array; life: Float32Array; vx: Float32Array; vy: Float32Array; sd: Float32Array };
const X96_STEP = 3;
const X96_HOLD = 0.2;
const X96_SNAP = 1.9;

function X96() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const S = useRef<{ ctx: CanvasRenderingContext2D | null; img: ImageData | null; w: number; h: number; dust: (Dust | null)[]; T: number; half: number; snapping: boolean; ox: number; oy: number }>({
    ctx: null,
    img: null,
    w: 0,
    h: 0,
    dust: [null, null],
    T: 0,
    half: 0,
    snapping: false,
    ox: 0,
    oy: 0,
  });

  useEffect(() => {
    const el = root.current;
    const c = cv.current;
    if (!el || !c || prefersReducedMotion()) return;
    let dead = false;
    let ro: ResizeObserver | null = null;
    const build = async () => {
      const box = el.querySelector(".x-in") as HTMLElement;
      const w = Math.max(1, box.clientWidth);
      const h = Math.max(1, box.clientHeight);
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const imgs = Array.from(el.querySelectorAll<HTMLImageElement>(".x96-card"));
      const dust: (Dust | null)[] = [];
      for (let k = 0; k < imgs.length; k++) {
        const im = imgs[k];
        try {
          await im.decode();
        } catch {
          /* already decoded or not decodable: drawImage below still works once loaded */
        }
        if (dead) return;
        const cw = Math.max(1, Math.round(im.offsetWidth));
        const ch = Math.max(1, Math.round(im.offsetHeight));
        const off = document.createElement("canvas");
        off.width = cw;
        off.height = ch;
        const g = off.getContext("2d");
        if (!g) return;
        g.drawImage(im, 0, 0, cw, ch);
        let data: Uint8ClampedArray;
        try {
          data = g.getImageData(0, 0, cw, ch).data;
        } catch {
          return;
        }
        const cols = Math.floor(cw / X96_STEP);
        const rows = Math.floor(ch / X96_STEP);
        const max = cols * rows;
        const d: Dust = { n: 0, px: new Float32Array(max), py: new Float32Array(max), rgb: new Uint8Array(max * 3), del: new Float32Array(max), life: new Float32Array(max), vx: new Float32Array(max), vy: new Float32Array(max), sd: new Float32Array(max) };
        for (let yy = 0; yy < rows; yy++)
          for (let xx = 0; xx < cols; xx++) {
            const sx = xx * X96_STEP;
            const sy = yy * X96_STEP;
            const o = (sy * cw + sx) * 4;
            if (data[o + 3] < 60) continue;
            const i = d.n++;
            d.px[i] = sx;
            d.py[i] = sy;
            d.rgb[i * 3] = data[o];
            d.rgb[i * 3 + 1] = data[o + 1];
            d.rgb[i * 3 + 2] = data[o + 2];
            d.del[i] = (1 - sx / cw) * 0.45 + Math.random() * 0.35;
            d.life[i] = 0.55 + Math.random() * 0.5;
            d.vx[i] = 80 + Math.random() * 230;
            d.vy[i] = -(20 + Math.random() * 100);
            d.sd[i] = Math.random() * 6.28;
          }
        dust.push(d);
      }
      S.current = { ...S.current, ctx, img: ctx.createImageData(w, h), w, h, dust };
    };
    const stop = whenNear(c, () => {
      document.fonts?.ready.then(() => {
        if (dead) return;
        build();
        ro = new ResizeObserver(() => build());
        ro.observe(el);
      });
    });
    return () => {
      dead = true;
      stop();
      ro?.disconnect();
      S.current.ctx = null;
      S.current.img = null;
      c.width = 1;
      c.height = 1;
    };
  }, []);

  useTicker(root, (_t, dt0) => {
    const s = S.current;
    const el = root.current;
    if (!s.ctx || !s.img || !el) return;
    const dt = Math.min(dt0, 0.05);
    s.T += dt;
    if (s.T > X96_HOLD + X96_SNAP) {
      s.T -= X96_HOLD + X96_SNAP;
      s.half = 1 - s.half;
      s.snapping = false;
    }
    const from = s.half;
    const to = 1 - from;
    const cards = el.querySelectorAll<HTMLElement>(".x96-cw");
    const heads = el.querySelectorAll<HTMLElement>(".x96-h");
    const box = el.querySelector(".x-in") as HTMLElement;
    const lt = s.T - X96_HOLD;
    if (lt < 0) {
      // calm beat: "from" fully shown, "to" hidden
      cards[from].style.opacity = "1";
      cards[from].style.transform = "none";
      cards[to].style.opacity = "0";
      heads[from].style.opacity = "1";
      heads[from].style.visibility = "visible";
      heads[from].style.transform = "none";
      heads[to].style.visibility = "hidden";
      if (s.snapping || s.T < dt * 1.5) s.ctx.clearRect(0, 0, s.w, s.h);
      s.snapping = false;
      return;
    }
    if (!s.snapping) {
      s.snapping = true;
      const r = rel(el.querySelectorAll(".x96-card")[from], box);
      s.ox = r.x;
      s.oy = r.y;
    }
    cards[from].style.opacity = "0";
    const e = gsap.parseEase("power3.out")(Math.min(1, Math.max(0, (lt - 0.35) / 0.8)));
    cards[to].style.opacity = String(e);
    cards[to].style.transform = `scale(${(0.94 + 0.06 * e).toFixed(4)})`;
    const hk = Math.min(1, Math.max(0, lt / 0.6));
    heads[from].style.opacity = String(1 - hk);
    heads[from].style.transform = `translateY(${(-hk * 30).toFixed(1)}px)`;
    heads[to].style.visibility = "visible";
    const hk2 = gsap.parseEase("power3.out")(Math.min(1, Math.max(0, (lt - 0.45) / 0.6)));
    heads[to].style.opacity = String(hk2);
    heads[to].style.transform = `translateY(${((1 - hk2) * 30).toFixed(1)}px)`;
    const d = s.dust[from];
    const data = s.img.data;
    data.fill(0);
    if (d) {
      const W = s.w;
      const H = s.h;
      for (let i = 0; i < d.n; i++) {
        const tp = lt - d.del[i];
        let x: number;
        let y: number;
        let a: number;
        let sz: number;
        if (tp < 0) {
          x = s.ox + d.px[i];
          y = s.oy + d.py[i];
          a = 255;
          sz = X96_STEP;
        } else {
          const k = tp / d.life[i];
          if (k >= 1) continue;
          x = s.ox + d.px[i] + d.vx[i] * tp + 90 * tp * tp + Math.sin(tp * 6 + d.sd[i]) * 7;
          y = s.oy + d.py[i] + d.vy[i] * tp - 20 * tp * tp;
          a = 255 * Math.pow(1 - k, 1.4);
          sz = 2;
        }
        const xi = x | 0;
        const yi = y | 0;
        if (xi < 0 || yi < 0 || xi + sz > W || yi + sz > H) continue;
        const r = d.rgb[i * 3];
        const g = d.rgb[i * 3 + 1];
        const b = d.rgb[i * 3 + 2];
        for (let oy = 0; oy < sz; oy++) {
          let o = ((yi + oy) * W + xi) * 4;
          for (let ox = 0; ox < sz; ox++, o += 4) {
            data[o] = r;
            data[o + 1] = g;
            data[o + 2] = b;
            data[o + 3] = a;
          }
        }
      }
    }
    s.ctx.putImageData(s.img, 0, 0);
  });

  return (
    <Stage r={root} g1="rgba(255,170,110,.55)" g2="rgba(111,168,255,.24)">
      <div className="absolute inset-y-0 left-[7%] flex w-[44%] flex-col justify-center">
        <Label className="text-white/60">Hearth & Kiln · Seasonal objects</Label>
        <div className="relative mt-5">
          {X96_CARDS.map((c, k) => (
            <div key={k} className={`x96-h ${k === 0 ? "relative" : "absolute inset-x-0 top-0"}`} style={k === 0 ? undefined : HIDDEN}>
              <h3 className="leading-[0.95]" style={{ fontFamily: F.fr, fontSize: "clamp(52px,6.2vw,104px)", fontWeight: 500 }}>
                {c.head}
              </h3>
              <p className="mt-5 text-[16px] text-white/70" style={{ fontFamily: F.mr }}>
                {c.sub} {c.price}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-[10%] top-1/2 h-[80%] -translate-y-1/2" style={{ aspectRatio: "600 / 760" }}>
        <div className="x96-float relative h-full w-full">
          {X96_SRC.map((src, k) => (
            <div key={k} className="x96-cw absolute inset-0" style={k === 0 ? undefined : { opacity: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="x96-card h-full w-full" draggable={false} />
            </div>
          ))}
        </div>
      </div>
      <canvas ref={cv} className="pointer-events-none absolute inset-0 z-30 h-full w-full" aria-hidden />
      <Sheen g1="rgba(255,180,120,.5)" />
    </Stage>
  );
}

/* ───────────────────────── X97 · Hinge fall away (variant of X1) ───────────────────────── */
const X97_PAGES = [
  { bg: "#efe6d8", ink: "#24180f", hot: "#b4481e", eyebrow: "Atelier Wren · Spring tailoring", title: "Soft Shoulders", line: "Unlined linen blazer in chalk", price: "₹ 12,800", i: 3 },
  { bg: "#14202b", ink: "#e8f1f7", hot: "#7fc4ff", eyebrow: "Atelier Wren · Rain edit", title: "Weather Proof", line: "Waxed cotton trench in slate", price: "₹ 18,400", i: 0 },
];
function X97Page({ k }: { k: number }) {
  const p = X97_PAGES[k];
  return (
    <div className="absolute inset-0 grid grid-cols-[1.1fr_1fr] items-center gap-[5%] px-[6%]" style={{ background: p.bg, color: p.ink }}>
      <div>
        <Label style={{ color: p.hot }}>{p.eyebrow}</Label>
        <h3 className="mt-4 leading-[0.92]" style={{ fontFamily: F.is, fontSize: "clamp(52px,6.6vw,112px)" }}>
          {p.title}
        </h3>
        <p className="mt-5 text-[16px] opacity-75" style={{ fontFamily: F.mr }}>
          {p.line}
        </p>
        <p className="mt-3 text-[18px] font-semibold" style={{ fontFamily: F.sg }}>
          {p.price}
        </p>
      </div>
      <div className="relative h-[76%] overflow-hidden rounded-[18px]">
        <div className="b17t2-kb absolute inset-0">
          <Img i={p.i} w={900} h={1000} />
        </div>
      </div>
      <span className="absolute left-[14px] top-[14px] h-[10px] w-[10px] rounded-full" style={{ background: p.ink, opacity: 0.55 }} aria-hidden />
      <span className="absolute right-[14px] top-[14px] h-[10px] w-[10px] rounded-full" style={{ background: p.ink, opacity: 0.55 }} aria-hidden />
    </div>
  );
}
function X97() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const q = gsap.utils.selector(el);
    const pages = q(".x97-p");
    const H = el.clientHeight;
    gsap.set(pages[1], { autoAlpha: 1, zIndex: 1 });
    gsap.set(pages[0], { zIndex: 2 });
    const tl = gsap.timeline({ repeat: -1 });
    const fall = (a: number, b: number, side: 1 | -1) => {
      tl.set(pages[b], { zIndex: 1, rotation: 0, y: 0, autoAlpha: 1 })
        .set(pages[a], { zIndex: 2, transformOrigin: side > 0 ? "0% 0%" : "100% 0%" })
        .to(pages[a], { rotation: side * 70, duration: 0.45, ease: "power2.in" })
        .to(pages[a], { rotation: side * 56, duration: 0.18, ease: "sine.out" })
        .to(pages[a], { rotation: side * 67, duration: 0.15, ease: "sine.inOut" })
        .to(pages[a], { rotation: side * 62, duration: 0.12, ease: "sine.inOut" })
        .to(pages[a], { y: H * 1.9, rotation: side * 84, duration: 0.52, ease: "power2.in" })
        .set(pages[a], { autoAlpha: 0, rotation: 0, y: 0 });
      hold(tl, 0.14);
    };
    fall(0, 1, 1);
    fall(1, 0, -1);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,213,154,.55)" g2="rgba(127,196,255,.24)">
      <div className="absolute inset-0 bg-[#0b0a0d]" />
      {[0, 1].map((k) => (
        <div key={k} className="x97-p absolute inset-0 overflow-hidden rounded-[22px] shadow-[0_30px_80px_rgba(0,0,0,.45)]" style={k === 0 ? { zIndex: 2 } : { ...HIDDEN, zIndex: 1 }}>
          <X97Page k={k} />
        </div>
      ))}
      <Sheen g1="rgba(255,213,154,.5)" opacity={0.35} />
    </Stage>
  );
}

/* ───────────────────────── X98 · Newspaper spin out / in (variant of X5) ───────────────────────── */
const X98_PAGES = [
  { mast: "The Morning Courant", date: "Saturday edition · No. 214", head: "Linen Season Arrives", deck: "Breathable shirts in six washed colours land on Monday.", price: "From ₹ 2,400", i: 3, tone: "#efe7d6" },
  { mast: "The Evening Ledger", date: "Late edition · No. 215", head: "Wool Returns Early", deck: "A cold snap brings the merino knits forward by two weeks.", price: "From ₹ 3,800", i: 0, tone: "#e7e2d8" },
];
function X98Page({ k }: { k: number }) {
  const p = X98_PAGES[k];
  return (
    <div className="absolute inset-0 flex flex-col px-[4.5%] py-[3.5%] text-[#1d1a16]" style={{ background: p.tone }}>
      <div className="flex items-end justify-between border-b-2 border-[#1d1a16] pb-2">
        <p className="leading-none" style={{ fontFamily: F.fr, fontSize: "clamp(30px,3.4vw,54px)", fontWeight: 700 }}>
          {p.mast}
        </p>
        <p className="text-[12px] uppercase tracking-[0.18em]" style={{ fontFamily: F.mr }}>
          {p.date}
        </p>
      </div>
      <div className="mt-[3%] grid flex-1 grid-cols-[1.2fr_1fr] gap-[4%]">
        <div className="flex flex-col">
          <h3 className="leading-[0.95]" style={{ fontFamily: F.is, fontSize: "clamp(40px,4.6vw,76px)" }}>
            {p.head}
          </h3>
          <p className="mt-3 text-[15px] leading-snug" style={{ fontFamily: F.mr }}>
            {p.deck}
          </p>
          <div className="mt-4 grid flex-1 grid-cols-2 gap-x-4 gap-y-[7px]">
            {Array.from({ length: 16 }, (_, j) => (
              <span key={j} className="block h-[5px] rounded-full bg-[#1d1a16]/25" style={{ width: `${70 + ((j * 37) % 30)}%` }} />
            ))}
          </div>
          <p className="mt-3 text-[16px] font-semibold" style={{ fontFamily: F.sg }}>
            {p.price}
          </p>
        </div>
        <div className="relative overflow-hidden grayscale-[35%]">
          <div className="b17t2-kb absolute inset-0">
            <Img i={p.i} w={800} h={900} />
          </div>
        </div>
      </div>
    </div>
  );
}
function X98() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const q = gsap.utils.selector(el);
    const pages = q(".x98-p");
    gsap.set(pages[1], { autoAlpha: 1, scale: 0, rotation: 620 });
    const tl = gsap.timeline({ repeat: -1 });
    const go = (a: number, b: number) => {
      tl.to(pages[a], { rotation: -640, scale: 0, duration: 0.8, ease: "power2.in" })
        .set(pages[a], { autoAlpha: 0 })
        .set(pages[b], { autoAlpha: 1, rotation: 720, scale: 0 })
        .to(pages[b], { rotation: 0, scale: 1, duration: 0.8, ease: "power2.out" })
        .set(pages[a], { rotation: 0, scale: 1 });
      hold(tl, 0.05);
    };
    go(0, 1);
    go(1, 0);
    return tl;
  });
  return (
    <Stage r={root} g1="rgba(255,213,154,.6)" g2="rgba(255,120,90,.26)">
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(255,220,170,.12),transparent_70%)]" />
      <Label className="absolute left-[5%] top-[6%] z-10 text-white/55">Fold & Press · Weekly drops</Label>
      {[0, 1].map((k) => (
        <div key={k} className="x98-p absolute left-[19%] top-[9%] h-[82%] w-[62%] overflow-hidden rounded-[6px] shadow-[0_40px_90px_rgba(0,0,0,.55)]" style={k === 0 ? undefined : HIDDEN}>
          <X98Page k={k} />
        </div>
      ))}
      <Sheen g1="rgba(255,213,154,.5)" opacity={0.35} />
    </Stage>
  );
}

/* ───────────────────────── X99 · Two-stack 3D lift slider (variant of M29) ───────────────────────── */
const X99_ITEMS = [
  { t: "Dune", d: "Suede loafer", p: "₹ 6,900", i: 3 },
  { t: "Tide", d: "Canvas sneaker", p: "₹ 4,200", i: 0 },
  { t: "Fern", d: "Trail runner", p: "₹ 7,800", i: 2 },
  { t: "Coral", d: "Knit slip-on", p: "₹ 3,600", i: 1 },
  { t: "Basalt", d: "Leather boot", p: "₹ 11,400", i: 3 },
];
const X99_START = 2;
const X99_PATH = [3, 2, 1, 2];
function x99Lay(idx: number, k: number) {
  if (idx === k) return { xPercent: 0, yPercent: 0, z: 0, rotationY: 0, rotation: 0, scale: 1, zIndex: 50 };
  const left = idx > k;
  const j = left ? idx - (k + 1) : k - 1 - idx;
  return { xPercent: (left ? -1 : 1) * 150, yPercent: 6 - j * 2.4, z: -j * 30, rotationY: (left ? 1 : -1) * 22, rotation: (left ? -1 : 1) * (2 + (idx % 2) * 2.5), scale: 0.6, zIndex: 40 - j };
}
function X99() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const q = gsap.utils.selector(el);
    const box = q(".x-in")[0];
    const cards = q(".x99-c");
    const titles = q(".x99-t");
    const dot = q(".x99-dot")[0];
    const nx = centre(rel(q(".x99-next")[0], box));
    const pv = centre(rel(q(".x99-prev")[0], box));
    cards.forEach((c, idx) => {
      gsap.set(c, { clearProps: "transform" });
      gsap.set(c, x99Lay(idx, X99_START));
    });
    gsap.set(titles, { autoAlpha: 0, yPercent: 110 });
    gsap.set(titles[X99_START], { autoAlpha: 1, yPercent: 0 });
    gsap.set(dot, { x: box.clientWidth * 0.5, y: box.clientHeight * 0.92 });
    const tl = gsap.timeline({ repeat: -1 });
    let k = X99_START;
    X99_PATH.forEach((k2, n) => {
      const lab = `s${n}`;
      tap(tl, dot, k2 > k ? nx : pv);
      tl.addLabel(lab);
      cards.forEach((c, idx) => {
        const from = x99Lay(idx, k);
        const { zIndex, ...to } = x99Lay(idx, k2);
        if (idx === k2) {
          const side = from.xPercent < 0 ? -1 : 1;
          tl.set(c, { zIndex: 60 }, lab).to(
            c,
            {
              keyframes: [
                { xPercent: from.xPercent * 0.55, yPercent: -26, z: 260, rotationY: -side * 48, rotation: 0, scale: 0.84, duration: 0.5, ease: "power2.out" },
                { ...to, duration: 0.55, ease: "power3.inOut" },
              ],
            },
            lab,
          );
          tl.set(c, { zIndex }, `${lab}+=1.05`);
        } else if (idx === k) {
          tl.set(c, { zIndex: 55 }, lab).to(
            c,
            {
              keyframes: [
                { xPercent: to.xPercent * 0.45, yPercent: -16, z: 150, rotationY: to.rotationY * 2.2, scale: 0.78, duration: 0.45, ease: "power2.inOut" },
                { ...to, duration: 0.55, ease: "power3.inOut" },
              ],
            },
            `${lab}+=0.05`,
          );
          tl.set(c, { zIndex }, `${lab}+=1.05`);
        } else {
          tl.set(c, { zIndex }, lab).to(c, { ...to, duration: 0.7, ease: "power3.inOut" }, `${lab}+=0.15`);
        }
      });
      tl.to(titles[k], { yPercent: -110, autoAlpha: 0, duration: 0.4, ease: "power3.in" }, lab).fromTo(
        titles[k2],
        { yPercent: 110, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out" },
        `${lab}+=0.45`,
      );
      tl.to(dot, { x: (k2 > k ? nx.x : pv.x) - 40, y: nx.y + 30, duration: 0.8, ease: "sine.inOut" }, `${lab}+=0.1`);
      tl.to({}, { duration: 0.08 }, `${lab}+=1.05`);
      k = k2;
    });
    return tl;
  });
  const lay0 = (idx: number) => {
    const L = x99Lay(idx, X99_START);
    return {
      transform: `translate(${L.xPercent}%, ${L.yPercent}%) translateZ(${L.z}px) rotate(${L.rotation}deg) rotateY(${L.rotationY}deg) scale(${L.scale})`,
      zIndex: L.zIndex,
    } as CSSProperties;
  };
  return (
    <Stage r={root} g1="rgba(255,190,140,.55)" g2="rgba(120,200,170,.24)">
      <div className="absolute inset-0" style={{ perspective: "1400px" }}>
        <div className="absolute left-1/2 top-[50%] h-[66%]" style={{ aspectRatio: "3 / 4", transformStyle: "preserve-3d", transform: "translate(-50%,-50%)" }}>
          {X99_ITEMS.map((it, idx) => (
            <div key={idx} className="x99-c absolute inset-0 overflow-hidden rounded-[20px] border border-white/15 bg-[#141018] shadow-[0_30px_70px_rgba(0,0,0,.5)]" style={lay0(idx)}>
              <Img i={it.i} w={750} h={1000} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-[6%] left-[8%] right-[8%] flex items-end justify-between" style={{ fontFamily: F.mr }}>
                <span className="text-[14px] text-white/85">{it.d}</span>
                <span className="text-[15px] font-semibold">{it.p}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute left-[5%] top-[7%] z-[70]">
        <Label className="text-white/60">Strider Footwear · Spring line</Label>
        <div className="relative mt-2 overflow-hidden pb-[0.1em]">
          {X99_ITEMS.map((it, i) => (
            <p key={i} className={`x99-t leading-none ${i === X99_START ? "relative" : "absolute inset-x-0 top-0"}`} style={{ fontFamily: F.sy, fontWeight: 800, fontSize: "clamp(36px,4.4vw,72px)", textTransform: "uppercase", ...(i === X99_START ? {} : HIDDEN) }}>
              {it.t}
            </p>
          ))}
        </div>
      </div>
      <div className="absolute bottom-[6%] right-[5%] z-[70] flex gap-3">
        <button type="button" className="x99-prev grid h-12 w-12 place-items-center rounded-full border border-white/25 text-[18px]" aria-label="Previous">
          ←
        </button>
        <button type="button" className="x99-next grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-white text-[18px] text-[#0b0a0d]" aria-label="Next">
          →
        </button>
      </div>
      <Sheen g1="rgba(255,190,140,.5)" opacity={0.35} />
      <Dot c="x99-dot" />
    </Stage>
  );
}

/* ───────────────────────── X100 · Cloth peel reveal (variant of X11) ───────────────────────── */
const V100 = /* glsl */ `
precision highp float;
attribute vec2 uv;
uniform float uF, uR, uAsp, uTime, uCr;
uniform vec2 uD;
varying vec2 vUv;
varying vec3 vN;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
vec3 deform(vec2 q) {
  vec2 P = vec2((q.x * 2.0 - 1.0) * uAsp, q.y * 2.0 - 1.0);
  vec2 C = vec2(uAsp, -1.0);
  float s = dot(P - C, uD);
  float d = uF - s;
  float z = 0.012 * sin(q.x * 9.0 + uTime * 1.6) * sin(q.y * 7.0 + uTime * 1.1);
  float sp = s;
  if (d > 0.0) {
    float th = d / uR;
    if (th < 3.14159) { sp = uF - uR * sin(th); z += uR * (1.0 - cos(th)); }
    else { sp = uF + (d - 3.14159 * uR); z += 2.0 * uR; }
    float cr = smoothstep(0.0, 0.5, d) * uCr;
    z += (vnoise(q * vec2(9.0, 6.0)) - 0.5) * cr * 0.35 + (vnoise(q * vec2(23.0, 17.0)) - 0.5) * cr * 0.12;
  }
  P += uD * (sp - s);
  return vec3(P, z);
}
void main() {
  vUv = uv;
  vec3 p = deform(uv);
  vec3 pu = deform(uv + vec2(0.01, 0.0));
  vec3 pv = deform(uv + vec2(0.0, 0.01));
  vN = normalize(cross(pu - p, pv - p));
  float k = 3.5 / (3.5 - p.z);
  gl_Position = vec4(p.x * k / uAsp, p.y * k, -p.z * 0.2, 1.0);
}`;
const F100 = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
varying vec2 vUv;
varying vec3 vN;
void main() {
  vec3 n = normalize(vN);
  float back = step(n.z, 0.0);
  n = mix(n, -n, back);
  vec3 L = normalize(vec3(-0.4, 0.5, 0.8));
  float dif = clamp(dot(n, L), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 24.0);
  vec3 base = mix(texture2D(uTex, vUv).rgb, vec3(0.86, 0.8, 0.72), back);
  gl_FragColor = vec4(base * (0.35 + 0.75 * dif) + spec * 0.22, 1.0);
}`;
const X100_D: [number, number] = (() => {
  const l = Math.hypot(-0.78, 0.62);
  return [-0.78 / l, 0.62 / l];
})();
/** The cloth face: velvet with a woven texture, a stitched border and an embroidered label (drawn once). */
function x100Cloth() {
  const W = 1024;
  const H = 640;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const bg = g.createRadialGradient(W * 0.45, H * 0.4, 40, W * 0.5, H * 0.5, W * 0.7);
  bg.addColorStop(0, "#7a1f45");
  bg.addColorStop(1, "#2a0818");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  g.lineWidth = 1;
  g.strokeStyle = "rgba(255,255,255,.045)";
  for (let x = -H; x < W; x += 5) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + H, H);
    g.stroke();
  }
  g.strokeStyle = "rgba(0,0,0,.08)";
  for (let x = 0; x < W + H; x += 5) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x - H, H);
    g.stroke();
  }
  g.setLineDash([10, 8]);
  g.lineWidth = 2;
  g.strokeStyle = "rgba(255,214,170,.55)";
  g.strokeRect(34, 34, W - 68, H - 68);
  g.setLineDash([]);
  g.textAlign = "center";
  g.fillStyle = "rgba(255,226,196,.92)";
  g.font = `600 20px "${F.mr}", Arial, sans-serif`;
  g.fillText("M A I S O N   O R R I N", W / 2, H * 0.36);
  g.font = `italic 64px "${F.is}", Georgia, serif`;
  g.fillText("Something new is underneath", W / 2, H * 0.52);
  g.font = `500 18px "${F.mr}", Arial, sans-serif`;
  g.fillStyle = "rgba(255,226,196,.7)";
  g.fillText("Unveiling the winter collection", W / 2, H * 0.62);
  return c;
}
const X100_CYCLE = 4.0;
function X100() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let dead = false;
    let cleanup: (() => void) | null = null;
    const stop = whenNear(c, async () => {
      try {
        const ogl = await import("ogl");
        await document.fonts?.ready;
        if (dead) return;
        const renderer = new ogl.Renderer({ canvas: c, dpr: 1, alpha: true, premultipliedAlpha: true, antialias: false });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        const tex = new ogl.Texture(gl, { image: x100Cloth(), generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
        const uni = { uTex: { value: tex }, uF: { value: -0.1 }, uR: { value: 0.16 }, uAsp: { value: 1 }, uTime: { value: 0 }, uCr: { value: 0 }, uD: { value: X100_D } };
        const program = new ogl.Program(gl, { vertex: V100, fragment: F100, uniforms: uni, cullFace: false, depthTest: true, depthWrite: true });
        const mesh = new ogl.Mesh(gl, { geometry: new ogl.Plane(gl, { widthSegments: 72, heightSegments: 44 }), program });
        const box = c.parentElement ?? c;
        let W = 1;
        let H = 1;
        const fit = () => {
          const r = box.getBoundingClientRect();
          W = Math.max(1, r.width);
          H = Math.max(1, r.height);
          renderer.setSize(W, H);
          c.style.width = "100%";
          c.style.height = "100%";
          uni.uAsp.value = W / H;
        };
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(box);
        let vis = false;
        const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting), { rootMargin: "80px" });
        io.observe(c);
        // the pulled point (a little inside the bottom-right corner), mirrored from the vertex shader (no noise)
        const pull = (Fv: number, R: number, A: number) => {
          const P = [A - 0.07, -1 + 0.08];
          const s = (P[0] - A) * X100_D[0] + (P[1] + 1) * X100_D[1];
          const d = Fv - s;
          let sp = s;
          let z = 0;
          if (d > 0) {
            const th = d / R;
            if (th < Math.PI) {
              sp = Fv - R * Math.sin(th);
              z = R * (1 - Math.cos(th));
            } else {
              sp = Fv + (d - Math.PI * R);
              z = 2 * R;
            }
          }
          const X = P[0] + X100_D[0] * (sp - s);
          const Y = P[1] + X100_D[1] * (sp - s);
          const k = 3.5 / (3.5 - z);
          return [((X * k) / A) * 0.5 * W + W / 2, H / 2 - Y * k * 0.5 * H];
        };
        const io2 = gsap.parseEase("power2.inOut");
        const out = gsap.parseEase("power2.out");
        let last = performance.now();
        let T = 0;
        let time = 0;
        let raf = 0;
        let shown = false;
        const loop = () => {
          raf = requestAnimationFrame(loop);
          const now = performance.now();
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          if (!vis) return;
          T = (T + dt) % X100_CYCLE;
          time += dt;
          const A = W / H;
          const L = 2 * A * -X100_D[0] + 2 * X100_D[1];
          const Fend = L + Math.PI * 0.28 + 0.45;
          let e = 0;
          let press = 1;
          if (T < 0.3) press = 1 - 0.3 * Math.sin((T / 0.3) * Math.PI);
          else if (T < 2.1) e = io2((T - 0.3) / 1.8);
          else if (T < 2.35) e = 1;
          else if (T < 3.75) e = 1 - out((T - 2.35) / 1.4);
          const R = 0.16 + 0.12 * e;
          const Fv = -0.05 + (Fend + 0.05) * e;
          uni.uF.value = Fv;
          uni.uR.value = R;
          uni.uCr.value = e;
          uni.uTime.value = time;
          if (dot.current) {
            const [x, y] = pull(Fv, R, A);
            dot.current.style.opacity = T < 2.1 ? "1" : "0";
            dot.current.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${press.toFixed(3)})`;
          }
          renderer.render({ scene: mesh });
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
        console.warn("[gl] cloth off, showing the page:", (err as Error).message);
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
    <Stage r={root} g1="rgba(255,170,190,.55)" g2="rgba(255,214,170,.24)">
      <div className="absolute inset-0 grid grid-cols-[1fr_1.25fr] items-center gap-[5%] bg-[#f1ebe3] px-[6%] text-[#22141a]">
        <div>
          <Label className="text-[#8a2a4f]">Maison Orrin · Winter 26</Label>
          <h3 className="mt-4 leading-[0.92]" style={{ fontFamily: F.is, fontSize: "clamp(52px,6.4vw,108px)" }}>
            The Velvet Hour
          </h3>
          <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed opacity-75" style={{ fontFamily: F.mr }}>
            Twelve evening pieces cut from crushed velvet and silk.
          </p>
          <p className="mt-5 text-[17px] font-semibold" style={{ fontFamily: F.sg }}>
            Wrap dress · ₹ 16,500
          </p>
        </div>
        <div className="grid h-[74%] grid-cols-3 gap-3">
          {[1, 3, 0].map((i, j) => (
            <div key={j} className={`relative overflow-hidden rounded-[16px] ${j === 1 ? "translate-y-[8%]" : ""}`}>
              <div className="b17t2-kb absolute inset-0">
                <Img i={i} w={600} h={900} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <canvas ref={cv} className="pointer-events-none absolute inset-0 z-40 h-full w-full opacity-0" aria-hidden />
      <Sheen g1="rgba(255,170,190,.5)" opacity={0.4} />
      <Dot r={dot} />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  {
    code: "X96",
    name: "Dust disintegrate",
    how: "The product card breaks into dust particles sampled from its own pixels; they drift off to the right on the wind and fade while the next card settles in (~1.6 s, canvas).",
    kind: "play",
    C: X96,
  },
  {
    code: "X97",
    name: "Hinge fall away",
    how: "The page swings from one top corner as if a screw came loose, wobbles, then drops off screen with gravity to reveal the next page behind (~1.4 s).",
    kind: "play",
    C: X97,
  },
  {
    code: "X98",
    name: "Newspaper spin out / in",
    how: "The front page spins out to nothing (~640°), then the next edition spins in from nothing to full size, like an old newsreel insert (0.8 s each).",
    kind: "play",
    C: X98,
  },
  {
    code: "X99",
    name: "Two-stack 3D lift slider",
    how: "Two piles of cards sit left and right; each step lifts the top card off one pile and turns it in 3D to the centre while the previous one returns to the other pile (~1 s). A fake pointer presses the arrows.",
    kind: "play",
    C: X99,
  },
  {
    code: "X100",
    name: "Cloth peel reveal",
    how: "A velvet sheet covering the page is pulled from its corner, curls and crumples along a vertex mesh and slides away to reveal the collection, then settles back (WebGL, scripted pull).",
    kind: "play",
    C: X100,
  },
];
