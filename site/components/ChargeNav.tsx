"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cart } from "../cart";
import { nav } from "../content";

// Nav "charge HUD" (N3 split; Motion map M2: the chapter label flips like a split-flap board).
// Left: SURGE wordmark · centre: "02 · OPEN" chapter label in a flip window + three ring segments that light as you go
// down the page · right: frosted Cart pill with a count that bumps when something is added.
// Phone: wordmark + chapter label + cart.

export default function ChargeNav() {
  const [chapter, setChapter] = useState(0);
  const [count, setCount] = useState(0);
  const pill = useRef<HTMLAnchorElement>(null);
  const face = useRef<HTMLSpanElement>(null);
  const firstFlip = useRef(true);

  // M2: each new chapter label flips down into the window like a split-flap board (the old one is already swapped by
  // React; the new face turns from 90° down to flat)
  useEffect(() => {
    if (firstFlip.current) {
      firstFlip.current = false;
      return;
    }
    if (prefersReducedMotion() || !face.current) return;
    gsap.fromTo(
      face.current,
      { rotationX: -95, opacity: 0.2, transformPerspective: 300, transformOrigin: "50% 0%" },
      { rotationX: 0, opacity: 1, duration: 0.5, ease: "power3.out", overwrite: true },
    );
  }, [chapter]);

  // which chapter is on screen (the section crossing the middle of the screen)
  useEffect(() => {
    const els = nav.chapters.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = nav.chapters.findIndex((c) => c.id === e.target.id);
            if (i >= 0) setChapter(i);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // cart count + bump
  useEffect(
    () =>
      cart.subscribe((n, added) => {
        setCount(n);
        if (added && pill.current && !prefersReducedMotion()) {
          gsap.fromTo(pill.current, { scale: 1.14 }, { scale: 1, duration: 0.6, ease: "expo.out" });
          gsap.fromTo(pill.current.querySelector(".cart-glow"), { opacity: 1 }, { opacity: 0, duration: 0.9, ease: "power2.out" });
          // the charge segments flash with it
          gsap.fromTo(".nav-seg", { filter: "brightness(2.6)", scaleY: 2 }, { filter: "brightness(1)", scaleY: 1, duration: 0.9, ease: "power2.out", stagger: 0.06 });
        }
      }),
    [],
  );

  const c = nav.chapters[chapter];
  const lit = Math.min(3, Math.floor(((chapter + 1) / nav.chapters.length) * 3 + 0.0001));

  return (
    <header className="charge-nav fixed inset-x-0 top-0 z-50">
      <div className="container-x flex h-[68px] items-center justify-between gap-6 max-md:h-[58px]">
        <a href="#hero" className="font-display text-[30px] font-[850] tracking-[0.08em] max-md:text-[24px]" aria-label="Surge, back to top">
          Surge
        </a>

        <div className="flex flex-col items-center gap-1.5" aria-live="polite">
          <div className="flip-window label h-[1.2em] overflow-hidden text-center tabular-nums">
            <span ref={face} className="flip-face block whitespace-nowrap">
              <span className="text-[color:var(--glow)]">{String(chapter + 1).padStart(2, "0")}</span>
              <span className="mx-2 text-muted">·</span>
              {c.label}
            </span>
          </div>
          <div className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`nav-seg ${i < lit ? "is-lit" : ""}`} />
            ))}
          </div>
        </div>

        <a ref={pill} href="#flavours" className="cart-pill frost relative flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] font-semibold" aria-label={`Cart, ${count} items`}>
          <span className="cart-glow pointer-events-none absolute inset-0 rounded-full opacity-0" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M5 7h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 7Z" />
            <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
          </svg>
          <span className="max-sm:hidden">Cart</span>
          <span className="cart-count tabular-nums">{count}</span>
        </a>
      </div>
    </header>
  );
}
