"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { ice } from "../content";
import FilmPin from "./FilmPin";
import { layoutFilm, NAV_GAP, usePhone, within, type Place } from "./film";

// phone: the whole can fits between the nav and the line of text; laptop: cover (unchanged)
const place = (phone: boolean): Place =>
  phone
    ? {
        fit: { box: [0.24, 0.08, 0.77, 0.92], area: (c) => ({ top: NAV_GAP, bottom: (within(c, ".eyebrow")?.top ?? c.clientHeight * 0.6) - 12 }) },
        fade: { t: 0.08, b: 0.12, l: 0.1, r: 0.1 },
      }
    : { fade: { t: 0.06, b: 0.1 } };

// Ice-cold (Motion map M17 grid dissolve, as a shatter).
// Pinned ice-burst video (0–3.5 s; the burst starts at 1.33 s). Over it hangs a pane of frosted ice. The pane is drawn
// ONCE (an offscreen canvas: the video's first frame, blurred, frosted, with speckles) and then cut into tiles on a
// single canvas: no DOM tiles, no per-tile backdrop blur, ~112 drawImage calls only while it changes. The tiles are
// locked to VIDEO time: from the burst they break away in a wave from the can's centre, growing as they fly past the
// camera and fading. Laptop 14×8 tiles, phone 6×10. ?static=1: no pane (the burst is the final picture).

const BURST_END = 2.35; // video second by which every tile has flown off

type Tile = { sx: number; sy: number; sw: number; sh: number; cx: number; cy: number; dx: number; dy: number; d: number; spin: number; push: number };

export default function IceBurst() {
  const paneCanvas = useRef<HTMLCanvasElement>(null);
  const sheen = useRef<HTMLDivElement>(null);
  const state = useRef<{ b: number; want: number; draw: (b: number) => void }>({ b: -1, want: 0, draw: () => {} });
  const phoneNow = usePhone();

  useEffect(() => {
    if (prefersReducedMotion() || phoneNow === null) return;
    const c = paneCanvas.current!;
    const ctx = c.getContext("2d")!;
    const phone = phoneNow;
    const at = place(phone);
    const cols = phone ? 6 : 14;
    const rows = phone ? 10 : 8;
    const pane = document.createElement("canvas");
    const pctx = pane.getContext("2d")!;
    // the broken tiles: clear frosted ice only (light tint + speckles, see-through), never the picture under the
    // sheet, so a flying tile can never carry the dark can with it
    const frost = document.createElement("canvas");
    const fctx = frost.getContext("2d")!;
    let tiles: Tile[] = [];
    const P = 0.5; // the pane is kept at half size
    let ready = false;
    let w = 0;
    let h = 0;

    const img = new Image();
    img.decoding = "async";
    // the pane's source frame loads with the section (lazy), like the frames
    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        near.disconnect();
        img.src = `${ice.film.frames}${phone ? "-m" : ""}/frame_0001.webp`;
      },
      { rootMargin: "0px" },
    );
    near.observe(document.getElementById("inside") ?? c); // with its frames, during the calm "What's inside"

    /** Builds the frosted pane once per size: blurred first frame + frost tint + speckles + faint cracks. */
    const build = () => {
      // frosted glass is soft anyway: the tile canvas at 1× and the pane itself at half size keep the GPU textures small
      const dpr = 1;
      const r = c.getBoundingClientRect();
      w = Math.round(r.width * dpr);
      h = Math.round(r.height * dpr);
      c.width = w;
      c.height = h;
      pane.width = Math.round(w * P);
      pane.height = Math.round(h * P);
      if (!img.naturalWidth) return;
      pctx.setTransform(P, 0, 0, P, 0, 0); // draw in full-size coordinates onto the half-size pane
      // the frame exactly where the player draws it (same layout function), blurred and lifted (done once)
      const r0 = layoutFilm(at, w, h, img.naturalWidth, img.naturalHeight, 1, at.fit ? at.fit.area(c) : null);
      // blur a tiny copy (1/8 size) and scale it up: looks the same as a big blur for frosted glass, but costs ~1 ms
      // instead of a long main-thread blur (which stalled the video playing above it)
      const k = 8;
      const small = document.createElement("canvas");
      small.width = Math.max(1, Math.round(w / k));
      small.height = Math.max(1, Math.round(h / k));
      const sctx = small.getContext("2d")!;
      sctx.fillStyle = "#05080f";
      sctx.fillRect(0, 0, small.width, small.height);
      sctx.filter = "blur(2.5px) brightness(1.25) saturate(0.8)";
      sctx.drawImage(img, r0.x / k, r0.y / k, r0.w / k, r0.h / k);
      pctx.imageSmoothingEnabled = true;
      pctx.imageSmoothingQuality = "high";
      pctx.drawImage(small, 0, 0, w, h);
      const g = pctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(210,235,255,0.20)");
      g.addColorStop(1, "rgba(235,248,255,0.34)");
      pctx.fillStyle = g;
      pctx.fillRect(0, 0, w, h);
      // frost speckles
      for (let i = 0; i < (phone ? 700 : 1600); i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const rad = Math.random() * 1.6 * dpr + 0.3;
        pctx.fillStyle = `rgba(255,255,255,${0.08 + Math.random() * 0.22})`;
        pctx.fillRect(x, y, rad * 1.6, rad * 1.6);
      }
      // soft top and bottom edges: the sheet melts into the page as the section arrives / leaves
      pctx.globalCompositeOperation = "destination-in";
      const edge = pctx.createLinearGradient(0, 0, 0, h);
      edge.addColorStop(0, "rgba(0,0,0,0)");
      edge.addColorStop(0.16, "rgba(0,0,0,1)");
      edge.addColorStop(0.9, "rgba(0,0,0,1)");
      edge.addColorStop(1, "rgba(0,0,0,0)");
      pctx.fillStyle = edge;
      pctx.fillRect(0, 0, w, h);
      pctx.globalCompositeOperation = "source-over";
      // frost-only texture for the flying tiles (same size as the pane)
      frost.width = pane.width;
      frost.height = pane.height;
      fctx.setTransform(P, 0, 0, P, 0, 0);
      const fg = fctx.createLinearGradient(0, 0, w, h);
      fg.addColorStop(0, "rgba(225,243,255,0.30)");
      fg.addColorStop(0.5, "rgba(240,250,255,0.42)");
      fg.addColorStop(1, "rgba(215,238,255,0.30)");
      fctx.fillStyle = fg;
      fctx.fillRect(0, 0, w, h);
      for (let i = 0; i < (phone ? 900 : 2000); i++) {
        const rad = Math.random() * 1.6 + 0.3;
        fctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.35})`;
        fctx.fillRect(Math.random() * w, Math.random() * h, rad * 1.6, rad * 1.6);
      }
      // tiles: each a slightly irregular cell; direction away from the can's centre
      const cw = w / cols;
      const ch = h / rows;
      const ox = w * 0.5;
      const oy = h * 0.55;
      const maxD = Math.hypot(w / 2, h / 2);
      tiles = [];
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const cx = (x + 0.5) * cw;
          const cy = (y + 0.5) * ch;
          const vx = cx - ox;
          const vy = cy - oy;
          const len = Math.hypot(vx, vy) || 1;
          tiles.push({
            sx: x * cw,
            sy: y * ch,
            sw: cw,
            sh: ch,
            cx,
            cy,
            dx: vx / len,
            dy: vy / len,
            d: len / maxD,
            spin: (Math.random() - 0.5) * 1.4,
            push: 0.6 + Math.random() * 0.8,
          });
        }
      ready = true;
      state.current.b = -1;
      draw(state.current.want);
    };

    const draw = (b: number) => {
      state.current.want = b;
      if (!ready || b === state.current.b) return;
      state.current.b = b;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (b >= 1) return;
      if (b <= 0) {
        // before the burst: ONE smooth frosted sheet (no tiles, no seams)
        ctx.drawImage(pane, 0, 0, w, h);
        return;
      }
      // the sheet stays ONE piece: draw it whole, cut out only the tiles that have broken loose, then draw those
      // flying (so resting parts can never show a seam; the crack edges belong to the moving tiles only)
      ctx.drawImage(pane, 0, 0, w, h);
      const moving: { t: Tile; l: number }[] = [];
      for (const t of tiles) {
        const l = Math.min(1, Math.max(0, (b - t.d * 0.45) / 0.55));
        if (l > 0) {
          ctx.clearRect(t.sx, t.sy, t.sw, t.sh);
          if (l < 1) moving.push({ t, l });
        }
      }
      for (const { t, l } of moving) {
        const e = l * l;
        const s = 1 + e * 2.4; // flies toward the camera
        const tx = t.cx + t.dx * e * w * 0.55 * t.push;
        const ty = t.cy + t.dy * e * h * 0.55 * t.push;
        ctx.globalAlpha = 1 - Math.pow(l, 1.4);
        ctx.setTransform(s, 0, 0, s, tx, ty);
        ctx.rotate(t.spin * e);
        ctx.drawImage(frost, t.sx * P, t.sy * P, t.sw * P, t.sh * P, -t.sw / 2, -t.sh / 2, t.sw, t.sh);
        // crack edge, only on broken tiles
        ctx.globalAlpha *= Math.min(1, l * 6) * 0.55;
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 1;
        ctx.strokeRect(-t.sw / 2, -t.sh / 2, t.sw, t.sh);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      ctx.globalAlpha = 1;
    };
    state.current.draw = draw;

    img.onload = build;
    const ro = new ResizeObserver(() => img.naturalWidth && build());
    ro.observe(c);
    document.fonts?.ready.then(() => img.naturalWidth && build()); // the text area is measured: again with the fonts in
    return () => {
      ro.disconnect();
      near.disconnect();
    };
  }, [phoneNow]);

  const onTime = (t: number, p: number) => {
    const b = Math.min(1, Math.max(0, (t - ice.BURST_AT) / (BURST_END - ice.BURST_AT)));
    state.current.draw(b);
    if (sheen.current) sheen.current.style.opacity = String(Math.max(0, 1 - b * 8));
    // a slow camera push over the whole pin (1.00 → 1.06) on the video AND the pane together (they stay lined up),
    // so the stage is never still while the last cubes hang in the air
    if (prefersReducedMotion()) return;
    const k = `scale(${(1 + 0.06 * p).toFixed(4)})`;
    const stage = paneCanvas.current?.parentElement;
    stage?.querySelectorAll<HTMLCanvasElement>("canvas").forEach((cv) => (cv.style.transform = k));
  };

  return (
    <FilmPin id="ice" film={ice.film} arrive={0.7} onTime={onTime} className="ice" place={place} loadWhen="#inside">
      <canvas ref={paneCanvas} aria-hidden className="ice-pane breathe pointer-events-none absolute inset-0 h-full w-full" />
      {/* a cold light sweeps across the frosted sheet while it is whole (hidden from the burst on) */}
      <div ref={sheen} aria-hidden className="ice-sheen pointer-events-none absolute inset-0" />
      <div className="ice-shade pointer-events-none absolute inset-0" />
      {/* X2: arrives tinted with the last flavour's cyan · X4: frost whitens the picture as it leaves */}
      <div aria-hidden className="ice-tint pointer-events-none absolute inset-0 opacity-0" />
      <div aria-hidden className="ice-frost pointer-events-none absolute inset-0 opacity-0" />
      <div className="container-x relative z-[2] flex h-full flex-col justify-end pb-[9vh] max-md:pb-[6svh]">
        <p className="eyebrow">{ice.eyebrow}</p>
        <h2 className="font-display mt-4 max-w-[12ch] text-[clamp(52px,6.4vw,116px)] font-[850] leading-[0.88] max-md:text-[46px]">{ice.line}</h2>
        <p className="label mt-5 text-muted">{ice.note}</p>
      </div>
    </FilmPin>
  );
}
