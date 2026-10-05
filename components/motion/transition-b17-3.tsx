"use client";

// Transition motions, batch 17 · group 3 (MOTION-MENU X101–X103). Small focused demos for /lab/motion.
// Every demo loops A → B → A between two simple "pages" by itself while on screen and pauses off screen.
// A CSS-only glow loop (also ON TOP of the pages, screen-blended) never stops. ?static=1 / reduced motion:
// no JS motion, the markup shows page A on top. X101 builds its WebGL context only near the viewport (dpr 1).
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { createShader, type GLHandle } from "@/lib/gl";
import { scene, toCanvas } from "@/components/fx/shared";
import type { MotionDef } from "./types";

const F = { sg: "Space Grotesk Variable", fr: "Fraunces Variable", is: "Instrument Serif", sy: "Syne Variable", mr: "Manrope Variable" };

const CSS = `
.b17t3-glow{position:absolute;inset:-25%;pointer-events:none;background:radial-gradient(38% 42% at 34% 40%,var(--g1,rgba(170,150,255,.55)),transparent 70%),radial-gradient(32% 38% at 68% 64%,var(--g2,rgba(255,143,122,.22)),transparent 70%);animation:b17t3-drift 5.2s linear infinite alternate;will-change:transform}
@keyframes b17t3-drift{0%{transform:translate3d(-8%,-5%,0) scale(1)}100%{transform:translate3d(8%,6%,0) scale(1.16)}}
.b17t3-kb{animation:b17t3-kb 6s linear infinite alternate}
@keyframes b17t3-kb{to{transform:scale(1.08) translate(-2%,1%)}}
html.is-static .b17t3-glow,html.is-static .b17t3-kb{animation:none}
html.is-static {.b17t3-glow,.b17t3-kb{animation:none}}
`;

/* ---------- shared helpers (local copies) ---------- */

function Stage({ r, children, g1, g2 }: { r?: RefObject<HTMLDivElement | null>; children: ReactNode; g1?: string; g2?: string }) {
  return (
    <div ref={r} className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0a10] text-[#f4f1fb]">
      <style href="b17t3-css" precedence="default">
        {CSS}
      </style>
      <div className="b17t3-glow" style={{ "--g1": g1, "--g2": g2 } as CSSProperties} aria-hidden />
      <div className="x-in relative h-full w-full">{children}</div>
    </div>
  );
}

/** The CSS glow loop again, ON TOP of the pages (screen blend), so covered stages never read as a freeze. */
const Sheen = ({ g1 = "rgba(170,150,255,.55)" }: { g1?: string }) => (
  <div className="b17t3-glow" style={{ "--g1": g1, "--g2": "transparent", mixBlendMode: "screen", opacity: 0.45, zIndex: 55 } as CSSProperties} aria-hidden />
);

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

const hold = (tl: gsap.core.Timeline, d = 0.2) => tl.to({}, { duration: d });

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

// eslint-disable-next-line @next/next/no-img-element
const Img = ({ i, className = "", w = 1000, h = 1000 }: { i: number; className?: string; w?: number; h?: number }) => (
  <img src={scene(i, w, h)} alt="" className={`h-full w-full object-cover ${className}`} draggable={false} />
);

const Label = ({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) => (
  <p className={`text-[13px] uppercase tracking-[0.22em] ${className}`} style={{ fontFamily: F.mr, ...style }}>
    {children}
  </p>
);

/* ───────────────────────── X101 · Planetary swirl (OGL) ───────────────────────── */
type X101P = { bg: string; ink: string; hot: string; kick: string; title: [string, string]; line: string; price: string; i: number };
const X101_A: X101P = { bg: "#120f22", ink: "#efeaff", hot: "#b9a6ff", kick: "Eau de parfum · 50 ml", title: ["Night", "Orchard"], line: "Black plum, cold iris and a trail of smoked vanilla.", price: "₹ 3,900", i: 0 };
const X101_B: X101P = { bg: "#24140b", ink: "#fff1e2", hot: "#ffb36b", kick: "Eau de parfum · 50 ml", title: ["Dune", "Bloom"], line: "Warm amber, orange blossom and sun-dried cedar.", price: "₹ 4,400", i: 3 };

/** The page drawn into a canvas (the WebGL texture): same layout as the DOM fallback. */
async function x101Tex(p: X101P, W: number, H: number) {
  const img = await toCanvas(scene(p.i, 900, 1000), 900, 1000);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = p.bg;
  g.fillRect(0, 0, W, H);
  const ix = W * 0.56;
  const iy = H * 0.12;
  const iw = W * 0.38;
  const ih = H * 0.76;
  g.save();
  g.beginPath();
  g.roundRect(ix, iy, iw, ih, 26);
  g.clip();
  const k = Math.max(iw / img.width, ih / img.height);
  g.drawImage(img, ix + (iw - img.width * k) / 2, iy + (ih - img.height * k) / 2, img.width * k, img.height * k);
  g.restore();
  const x = W * 0.07;
  g.textBaseline = "alphabetic";
  g.fillStyle = p.hot;
  g.font = `600 ${Math.round(H * 0.024)}px "${F.mr}", sans-serif`;
  g.fillText(p.kick.toUpperCase(), x, H * 0.3);
  g.fillStyle = p.ink;
  g.font = `500 ${Math.round(H * 0.17)}px "${F.fr}", serif`;
  g.fillText(p.title[0], x, H * 0.48);
  g.fillText(p.title[1], x, H * 0.64);
  g.globalAlpha = 0.72;
  g.font = `400 ${Math.round(H * 0.028)}px "${F.mr}", sans-serif`;
  g.fillText(p.line, x, H * 0.73);
  g.globalAlpha = 1;
  g.font = `600 ${Math.round(H * 0.036)}px "${F.sg}", sans-serif`;
  g.fillText(p.price, x, H * 0.82);
  return c;
}

const X101_FRAG = /* glsl */ `
uniform float uP;
void main(){
  float asp = uRes.x / uRes.y;
  vec2 c = vec2(0.5);
  vec2 d = (vUv - c) * vec2(asp, 1.0);
  float r = length(d);
  float s = sin(3.14159265 * uP);
  float fall = smoothstep(1.05, 0.0, r);
  // the old page twists one way, the new page arrives twisted the other way and unwinds
  float ang = s * 7.0 * fall * fall + uTime * 0.04 * s;
  float pull = 1.0 - 0.32 * s * fall;
  float ca = cos(ang), sa = sin(ang);
  vec2 dA = mat2(ca, -sa, sa, ca) * d * pull;
  vec2 dB = mat2(ca, sa, -sa, ca) * d * pull;
  vec2 uvA = dA / vec2(asp, 1.0) + c;
  vec2 uvB = dB / vec2(asp, 1.0) + c;
  vec4 A = texture2D(uTex0, cover(uvA, uTexRes0));
  vec4 B = texture2D(uTex1, cover(uvB, uTexRes1));
  float m = smoothstep(r * 0.45, r * 0.45 + 0.5, uP);
  vec4 col = mix(A, B, m);
  // a soft planet glow at the eye of the swirl, strongest mid-way
  float core = smoothstep(0.42, 0.0, r) * s;
  col.rgb += core * core * vec3(0.55, 0.45, 0.85) * 0.55;
  col.rgb *= 1.0 - 0.25 * s * smoothstep(0.35, 1.1, r);
  gl_FragColor = vec4(col.rgb, 1.0);
}`;

function X101Page({ p }: { p: X101P }) {
  return (
    <div className="absolute inset-0" style={{ background: p.bg, color: p.ink }}>
      <div className="absolute left-[7%] top-[22%] max-w-[46%]">
        <Label style={{ color: p.hot, fontWeight: 600 }}>{p.kick}</Label>
        <h3 className="mt-[0.3em] leading-[0.95]" style={{ fontFamily: F.fr, fontWeight: 500, fontSize: "clamp(56px,10vh,150px)" }}>
          {p.title[0]}
          <br />
          {p.title[1]}
        </h3>
        <p className="mt-4 text-[15px] opacity-70" style={{ fontFamily: F.mr }}>
          {p.line}
        </p>
        <p className="mt-4 text-[18px] font-semibold" style={{ fontFamily: F.sg }}>
          {p.price}
        </p>
      </div>
      <div className="absolute bottom-[12%] right-[6%] top-[12%] w-[38%] overflow-hidden rounded-[22px]">
        <Img i={p.i} w={900} h={1000} />
      </div>
    </div>
  );
}

function X101() {
  const root = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ p: 0 });
  const labs = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = cv.current;
    if (!c || prefersReducedMotion()) return;
    let dead = false;
    let h: GLHandle | null = null;
    const stop = whenNear(c, async () => {
      await document.fonts?.ready;
      const box = c.parentElement!.getBoundingClientRect();
      const W = 1400;
      const H = Math.round((W * Math.max(1, box.height)) / Math.max(1, box.width));
      const [a, b] = await Promise.all([x101Tex(X101_A, W, H), x101Tex(X101_B, W, H)]);
      if (dead) return;
      h = await createShader(c, X101_FRAG, {
        dpr: 1,
        textures: [a, b],
        uniforms: { uP: { value: 0 } },
        onFrame: (u) => {
          u.uP.value = st.current.p;
        },
      });
      if (dead) h?.destroy();
    });
    return () => {
      dead = true;
      stop();
      h?.destroy();
    };
  }, []);

  usePlay(root, (el) => {
    const q = gsap.utils.selector(el);
    const tags = q(".x101-tag");
    const tl = gsap.timeline({ repeat: -1 });
    st.current.p = 0;
    gsap.set(tags[1], { autoAlpha: 0, yPercent: 100 });
    const go = (to: number) => {
      tl.to(st.current, { p: to, duration: 1.2, ease: "power2.inOut" });
      tl.to(tags[1 - to], { autoAlpha: 0, yPercent: -100, duration: 0.4, ease: "power2.in" }, "<0.2");
      tl.fromTo(tags[to], { autoAlpha: 0, yPercent: 100 }, { autoAlpha: 1, yPercent: 0, duration: 0.45, ease: "power2.out" }, "<0.5");
      hold(tl, 0.18);
    };
    go(1);
    go(0);
    return tl;
  });

  return (
    <Stage r={root} g1="rgba(170,150,255,.55)" g2="rgba(255,179,107,.22)">
      <X101Page p={X101_A} />
      <canvas ref={cv} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500" aria-hidden />
      <div ref={labs} className="absolute bottom-[5%] left-[7%] z-10 overflow-hidden text-white/70">
        <div className="x101-tag relative">
          <Label>Chapter 01 · Night</Label>
        </div>
        <div className="x101-tag absolute inset-0" style={{ visibility: "hidden", opacity: 0 }}>
          <Label>Chapter 02 · Day</Label>
        </div>
      </div>
      <Sheen g1="rgba(170,150,255,.5)" />
    </Stage>
  );
}

/* ───────────────────────── X102 · Roll-out ───────────────────────── */
const X102_C = [
  { t: "Terra", d: "Hand-thrown vase", p: "₹ 2,450", i: 3, bg: "#2a1a10", acc: "#ffcf9a" },
  { t: "Lagoon", d: "Glazed bowl set", p: "₹ 3,100", i: 0, bg: "#0e1a2c", acc: "#9fd8ff" },
];
// left, right, top, bottom: where the top card rolls off to (x/y in stage fractions) and its spin
const X102_DIR = [
  { x: -1, y: 0, r: -540, n: "left" },
  { x: 1, y: 0, r: 540, n: "right" },
  { x: 0, y: -1, r: -540, n: "top" },
  { x: 0, y: 1, r: 540, n: "bottom" },
];

function X102() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const q = gsap.utils.selector(el);
    const cards = q(".x102-card");
    const dirs = q(".x102-dir");
    const W = el.clientWidth;
    const H = el.clientHeight;
    const tl = gsap.timeline({ repeat: -1 });
    gsap.set(dirs, { autoAlpha: 0 });
    gsap.set(dirs[0], { autoAlpha: 1 });
    X102_DIR.forEach((d, k) => {
      const top = cards[k % 2];
      const under = cards[(k + 1) % 2];
      tl.set(top, { zIndex: 2 });
      tl.set(under, { zIndex: 1, x: 0, y: 0, rotation: 0, autoAlpha: 1, scale: 0.9 });
      tl.set(dirs, { autoAlpha: 0 }).set(dirs[k], { autoAlpha: 1 });
      tl.to(top, { x: d.x * W * 0.95, y: d.y * H * 1.05, rotation: d.r, autoAlpha: 0, duration: 0.6, ease: "power2.in" });
      tl.to(under, { scale: 1, duration: 0.55, ease: "power2.out" }, "<0.25");
      hold(tl, 0.18);
    });
    return tl;
  });

  return (
    <Stage r={root} g1="rgba(255,190,140,.55)" g2="rgba(140,180,255,.24)">
      <div className="absolute left-[6%] top-[9%] z-10">
        <Label className="text-white/60">Studio ceramics · Spring kiln</Label>
        <div className="relative mt-2 h-[20px] text-[13px] uppercase tracking-[0.22em] text-white/80" style={{ fontFamily: F.mr }}>
          {X102_DIR.map((d, k) => (
            <span key={k} className={`x102-dir ${k === 0 ? "relative" : "absolute left-0 top-0"}`} style={k === 0 ? undefined : { visibility: "hidden", opacity: 0 }}>
              Roll-out · {d.n}
            </span>
          ))}
        </div>
      </div>
      {X102_C.map((c, k) => (
        <div
          key={k}
          className="x102-card absolute left-[29%] top-[13%] flex h-[74%] w-[42%] overflow-hidden rounded-[36px] border border-white/10"
          style={{ background: c.bg, zIndex: k === 0 ? 2 : 1 }}
        >
          <div className="relative w-1/2 overflow-hidden">
            <div className="b17t3-kb absolute inset-0">
              <Img i={c.i} w={700} h={900} />
            </div>
          </div>
          <div className="flex w-1/2 flex-col justify-center px-[7%]">
            <Label style={{ color: c.acc }}>{c.d}</Label>
            <p className="mt-3 leading-[0.95]" style={{ fontFamily: F.is, fontSize: "clamp(48px,5.4vw,96px)" }}>
              {c.t}
            </p>
            <p className="mt-5 text-[18px] font-semibold" style={{ fontFamily: F.sg }}>
              {c.p}
            </p>
            <span className="mt-6 w-fit rounded-full px-5 py-2.5 text-[13px] font-semibold text-[#120d0a]" style={{ background: c.acc, fontFamily: F.mr }}>
              Add to cart
            </span>
          </div>
        </div>
      ))}
      <Sheen g1="rgba(255,190,140,.5)" />
    </Stage>
  );
}

/* ───────────────────────── X103 · Anticipation pop-out ───────────────────────── */
const X103_P = [
  { k: "New season · Trail", t: ["Ridge", "Runner"], p: "₹ 8,990", i: 2, bg: "#0c1712", acc: "#c8ff8a" },
  { k: "New season · City", t: ["Metro", "Glide"], p: "₹ 7,450", i: 1, bg: "#1b0c12", acc: "#ff8fa3" },
];
const X103_EXIT = [
  { x: -0.18, y: 0.12 },
  { x: 0.18, y: -0.1 },
];

function X103() {
  const root = useRef<HTMLDivElement>(null);
  usePlay(root, (el) => {
    const q = gsap.utils.selector(el);
    const pages = q(".x103-page");
    const W = el.clientWidth;
    const H = el.clientHeight;
    const tl = gsap.timeline({ repeat: -1 });
    [0, 1].forEach((k) => {
      const top = pages[k];
      const under = pages[1 - k];
      const e = X103_EXIT[k];
      tl.set(top, { zIndex: 2 });
      tl.set(under, { zIndex: 1, x: 0, y: 0, scale: 0.94, autoAlpha: 0.35 });
      // anticipation: a small dip, then a pop up — then it shrinks and slides away
      tl.to(top, { scale: 0.97, duration: 0.12, ease: "power1.out" });
      tl.to(top, { scale: 1.06, duration: 0.2, ease: "power2.out" });
      tl.to(top, { scale: 0.3, x: e.x * W, y: e.y * H, autoAlpha: 0, duration: 0.45, ease: "power3.in" });
      tl.to(under, { scale: 1, autoAlpha: 1, duration: 0.55, ease: "power2.out" }, "<0.15");
      hold(tl, 0.2);
    });
    return tl;
  });

  return (
    <Stage r={root} g1="rgba(200,255,138,.5)" g2="rgba(255,143,163,.24)">
      {X103_P.map((p, k) => (
        <div
          key={k}
          className="x103-page absolute inset-[5%] grid grid-cols-[1.1fr_1fr] items-center gap-[5%] overflow-hidden rounded-[28px] border border-white/10 px-[5%]"
          style={{ background: p.bg, zIndex: k === 0 ? 2 : 1 }}
        >
          <div>
            <Label style={{ color: p.acc }}>{p.k}</Label>
            <p className="mt-4 leading-[0.92]" style={{ fontFamily: F.sy, fontWeight: 800, fontSize: "clamp(48px,6.2vw,108px)", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              {p.t[0]}
              <br />
              {p.t[1]}
            </p>
            <div className="mt-7 flex items-center gap-5">
              <span className="rounded-full px-6 py-3 text-[14px] font-semibold text-[#0b0d0c]" style={{ background: p.acc, fontFamily: F.mr }}>
                Shop now
              </span>
              <span className="text-[17px] text-white/80" style={{ fontFamily: F.sg }}>
                {p.p}
              </span>
            </div>
          </div>
          <div className="relative h-[78%] overflow-hidden rounded-[22px]">
            <div className="b17t3-kb absolute inset-0">
              <Img i={p.i} w={900} h={900} />
            </div>
          </div>
        </div>
      ))}
      <Sheen g1="rgba(200,255,138,.5)" />
    </Stage>
  );
}

export const DEFS: MotionDef[] = [
  {
    code: "X101",
    name: "Planetary swirl",
    how: "A rotating vortex twists the old page into the new one (~1.2 s): the old frame winds into the centre, the new one unwinds out of it (WebGL).",
    kind: "play",
    C: X101,
  },
  {
    code: "X102",
    name: "Roll-out",
    how: "The page card rolls off to a side, spinning 540° as it travels (~0.6 s), and the next card settles in behind it: left, right, top, bottom.",
    kind: "play",
    C: X102,
  },
  {
    code: "X103",
    name: "Anticipation pop-out",
    how: "The page dips, pops up a little, then shrinks and slides away (~0.75 s) while the next page grows in behind it.",
    kind: "play",
    C: X103,
  },
];
