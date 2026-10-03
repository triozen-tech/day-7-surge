"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { isPhone } from "./film";

/**
 * Fine night rain: thin slanted streaks falling over a section (ambient, keeps every hold alive).
 * One canvas, paused while off screen. ?static=1: nothing drawn.
 */
export default function RainCanvas({ count = 90, className = "", opacity = 0.55 }: { count?: number; className?: string; opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const n = isPhone() ? Math.round(count * 0.45) : count;
    let w = 0;
    let h = 0;
    let dpr = 1;
    type Drop = { x: number; y: number; len: number; v: number; a: number };
    let drops: Drop[] = [];
    const seed = (d: Partial<Drop> = {}): Drop => ({
      x: Math.random() * (w + 200) - 100,
      y: Math.random() * h,
      len: 14 + Math.random() * 34,
      v: 0.9 + Math.random() * 1.4,
      a: 0.15 + Math.random() * 0.45,
      ...d,
    });
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      drops = Array.from({ length: n }, () => seed());
    };
    let raf = 0;
    let on = false;
    let lastT = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = lastT ? Math.min(50, t - lastT) / 16.7 : 1;
      lastT = t;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (const d of drops) {
        d.y += d.v * 9 * dt;
        d.x -= d.v * 1.6 * dt;
        if (d.y - d.len > h) Object.assign(d, seed({ y: -d.len - Math.random() * 60 }));
        const g = ctx.createLinearGradient(d.x, d.y - d.len, d.x - d.len * 0.18, d.y);
        g.addColorStop(0, "rgba(140,200,255,0)");
        g.addColorStop(1, `rgba(200,230,255,${d.a})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x + d.len * 0.18, d.y - d.len);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) {
        on = true;
        lastT = 0;
        raf = requestAnimationFrame(tick);
      } else if (!e.isIntersecting && on) {
        on = false;
        cancelAnimationFrame(raf);
      }
    });
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    io.observe(c);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [count]);

  return <canvas ref={ref} aria-hidden className={`rain pointer-events-none absolute inset-0 h-full w-full ${className}`} style={{ opacity }} />;
}
