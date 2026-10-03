"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { pop, POP_AT } from "../content";
import FilmPin from "./FilmPin";
import Rings from "./Rings";
import { NAV_GAP, within, type Place } from "./film";

// phone: the square frames fit between the nav and the words (the can, its tab and the fizz all inside, never
// upscaled past the screen width); the flash glow + rings follow the can's opening (52% down the frame)
const place = (phone: boolean): Place =>
  phone
    ? {
        fit: { box: [0.04, 0.07, 0.96, 1], area: (c) => ({ top: NAV_GAP, bottom: (within(c, ".eyebrow")?.top ?? c.clientHeight * 0.55) - 10, left: 0, right: c.clientWidth }) },
        fade: { t: 0.14, b: 0.1, l: 0.06, r: 0.06 },
        onLayout: (r) => document.querySelector<HTMLElement>("#pop .pin-stage")?.style.setProperty("--open-y", `${Math.round(r.y + r.h * 0.52)}px`),
      }
    : { x: 0.59, fade: { l: 0.2, t: 0.06, b: 0.1 } };

// Signature "The Pop" (Motion map M25 kinetic scale word).
// Pinned can-open video (0–6.5 s): wide can → camera closes on the tab (fast pan 1.8–2.5 s, smoothed with 48 fps
// frames) → the tab lifts → THE POP at 3.042 s (frame 74: first blue light through the opening) → fizz (slow, 48 fps).
// The flash is locked to that frame: the moment the drawn video time crosses POP_AT going forward, the three ring
// lines across the screen and a soft blue glow at the opening fire in real time (0.05 s up, ~0.45 s fade), so it is
// always quick, whatever the scroll speed, and never a white-out (glow ≤ 0.45, screen blend).
// "COLD." "LOUD." "AWAKE." each land on a beat of the video (pop, fizz start, fizz peak).
// ?static=1: fizz frame, all three words (CSS: html.is-static .pop-word), no flash.

export default function ThePop() {
  const root = useRef<HTMLDivElement>(null);
  const prev = useRef(0);
  const shown = useRef<boolean[]>(pop.words.map(() => false));

  const flash = () => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    gsap.killTweensOf([q(".pop-glow"), q(".pop-rings")]);
    gsap
      .timeline()
      .fromTo(q(".pop-glow"), { opacity: 0, scale: 0.7 }, { opacity: 0.45, scale: 1, duration: 0.05, ease: "none" })
      .to(q(".pop-glow"), { opacity: 0, scale: 1.25, duration: 0.45, ease: "expo.out" })
      .fromTo(q(".pop-rings"), { opacity: 0.15 }, { opacity: 1, duration: 0.04, ease: "none" }, 0)
      .to(q(".pop-rings"), { opacity: 0.15, duration: 0.5, ease: "expo.out" }, 0.06);
  };

  const onTime = (t: number, p: number) => {
    if (prefersReducedMotion()) return;
    // a slow camera push over the whole pin (1.00 → 1.06), so the stage is never still while the fizz settles
    const stage = root.current?.parentElement;
    const cv = stage?.querySelector("canvas");
    if (cv) cv.style.transform = `scale(${(1 + 0.06 * p).toFixed(4)})`;
    if (prev.current < POP_AT && t >= POP_AT) flash();
    prev.current = t;
    // M25: each word SLAMS in on its beat, in real time (from 2.4× and blurred to its place in 0.45 s), so the hit is
    // always quick whatever the scroll speed; scrolling back above the beat takes it away again
    const el = root.current;
    if (!el) return;
    pop.words.forEach((w, i) => {
      const on = t >= w.at;
      if (on === shown.current[i]) return;
      shown.current[i] = on;
      const word = el.querySelectorAll<HTMLElement>(".pop-word")[i];
      if (!word) return;
      if (on)
        gsap
          .timeline()
          .fromTo(
            word,
            { opacity: 0, scale: 2.4, filter: "blur(14px)", x: -30 },
            { opacity: 1, scale: 1, filter: "blur(0px)", x: 0, duration: 0.45, ease: "expo.out", overwrite: true },
          )
          // the landing: a short cold flash on the letters
          .fromTo(word, { color: "#ffffff", textShadow: "0 0 28px rgba(92,200,255,0.95)" }, { color: "#eaf5ff", textShadow: "0 0 0px rgba(92,200,255,0)", duration: 0.6, ease: "power2.out" }, 0.12);
      else gsap.to(word, { opacity: 0, scale: 1.3, filter: "blur(8px)", duration: 0.25, ease: "power2.in", overwrite: true });
    });
  };


  return (
    <FilmPin id="pop" film={pop.film} arrive={1.0} onTime={onTime} className="pop" place={place}>
      <div ref={root} className="absolute inset-0">
        <div className="pop-shade pointer-events-none absolute inset-0" />
        {/* the flash: a glow at the opening + three ring lines across the screen at its height */}
        <div className="pop-glow pointer-events-none absolute left-1/2 top-[39%] h-[70vmin] w-[110vmin] -translate-x-1/2 -translate-y-1/2 opacity-0" />
        <Rings className="pop-rings absolute inset-x-0 top-[39%] opacity-[0.15]" />

        <div className="container-x relative z-[2] flex h-full flex-col justify-center max-md:justify-end max-md:pb-[7svh]">
          <p className="eyebrow mb-6 max-md:mb-3">{pop.eyebrow}</p>
          <h2 className="pop-words font-display" aria-label={pop.words.map((w) => w.text).join(" ")}>
            {pop.words.map((w) => (
              <span key={w.text} className="pop-word block" aria-hidden>
                {w.text}
              </span>
            ))}
          </h2>
        </div>
      </div>
    </FilmPin>
  );
}
