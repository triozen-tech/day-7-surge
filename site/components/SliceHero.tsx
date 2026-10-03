"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { hero } from "../content";
import { onReveal } from "./ChargeLoader";
import FilmPin from "./FilmPin";
import RainCanvas from "./RainCanvas";
import Rings from "./Rings";
import { NAV_GAP, within, type Place } from "./film";

const INTRO = { to: 1.5, secs: 2.6 };
// phone: the whole can (its box in the frame, incl. the ice at its foot) fits between the nav and the SURGE slices
const place = (phone: boolean): Place =>
  phone
    ? {
        fit: { box: [0.27, 0.1, 0.73, 0.84], area: (c) => ({ top: NAV_GAP, bottom: (within(c, ".hero-copy")?.top ?? c.clientHeight * 0.6) - 14 }) },
        fade: { t: 0.08, b: 0.14, l: 0.12, r: 0.12 },
      }
    : { fade: { b: 0.12 } };

// Hero "the sliced wordmark" (Motion map M7 multi-speed parallax, sideways; the motion comes in Round 2).
// Pinned spin video (hero-orbit 0–6 s, shrunk to 90% on page black, edges dissolved into the page). The can sits on
// the left; on the right a giant SURGE is cut into three horizontal slices along two triple ring lines (the can's
// rings). Loader end: the slices snap into line; scrolling: they shear apart sideways at three speeds.
// Phone: the video fills the top of the screen (2:3 crop on the can), the word sits under it, full width.
// ?static=1: the slices in line, video at the splash.

export function SliceWord({ word, className = "" }: { word: string; className?: string }) {
  return (
    <div className={`slice-word font-display ${className}`} aria-label={word} role="img">
      <span className="slice-sizer" aria-hidden>
        {word}
      </span>
      {[0, 1, 2].map((i) => (
        <span key={i} className={`slice slice-${i}`} aria-hidden>
          <span className="slice-inner">{word}</span>
        </span>
      ))}
      <Rings className="slice-cut slice-cut-1" />
      <Rings className="slice-cut slice-cut-2" />
    </div>
  );
}

export default function SliceHero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const section = el.closest<HTMLElement>("#hero")!;
    const q = gsap.utils.selector(el);
    const slices = q(".hero-word .slice") as HTMLElement[];
    const cuts = q(".hero-word .slice-cut") as HTMLElement[];
    const mm = gsap.matchMedia();
    let offReveal = () => {};

    mm.add({ laptop: "(min-width: 768px)", phone: "(max-width: 767px)" }, (c) => {
      const { phone } = c.conditions as { phone: boolean };
      const k = phone ? 0.5 : 1;

      // 1. the charge arrives: on the loader's flash the three slices snap into line from three offsets, the cut
      //    lines flash (starts while the loader clears, so the hero is moving from its first frame)
      const from = [9, -7, 12].map((v) => v * k);
      gsap.set(slices, { xPercent: (i: number) => from[i], filter: "blur(10px)", opacity: 0.4 });
      gsap.set(cuts, { scaleX: 0.2, opacity: 0 });
      gsap.set(q(".tag-word, .hero-meta"), { opacity: 0, y: 14 });
      offReveal = onReveal(() => {
        gsap
          .timeline()
          .to(slices, { xPercent: 0, filter: "blur(0px)", opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.06 }, 0.05)
          .to(cuts, { scaleX: 1, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.05 }, 0.1)
          .fromTo(cuts, { filter: "brightness(2.2)" }, { filter: "brightness(1)", duration: 1.1, ease: "power2.out" }, 0.1)
          .to(q(".tag-word"), { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, 0.25)
          .to(q(".hero-meta"), { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.7);
      });

      // 2. scrolling: the slices shear apart sideways at three speeds (top left fast, middle right slow, bottom left
      //    medium), the cut lines stretch into speed streaks; the rain and the video drift at their own speeds
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.3 },
      });
      tl.to(slices[0], { xPercent: -26 * k }, 0)
        .to(slices[1], { xPercent: 11 * k }, 0)
        .to(slices[2], { xPercent: -16 * k }, 0)
        .to(cuts, { scaleX: 1.6, opacity: 0.55 }, 0)
        .to(q(".hero-tagline, .hero-meta"), { x: -40 * k, opacity: 0.6 }, 0)
        .to(q(".rain"), { yPercent: 8 }, 0)
        .to(section.querySelector(".hero-canvas"), { y: phone ? -20 : -36 }, 0);
    });

    return () => {
      offReveal();
      mm.revert();
    };
  }, []);

  return (
    <FilmPin
      id="hero"
      film={hero.film}
      arrive={0}
      eager
      blockLoader
      place={place}
      intro={INTRO}
      className="hero"
      canvasClass="hero-canvas breathe absolute inset-0 h-full w-full"
    >
      <div ref={root} className="absolute inset-0">
      <RainCanvas count={110} opacity={0.5} />
      <div className="hero-shade pointer-events-none absolute inset-0" />
      <div className="container-x relative z-[2] flex h-full flex-col justify-end pb-[9vh] max-md:pb-[5svh]">
        <div className="hero-copy ml-auto w-[min(58vw,960px)] max-md:w-full">
          <h1 className="sr-only">Surge energy drink. {hero.tagline.join(" ")}</h1>
          <SliceWord word={hero.word} className="hero-word" />
          <div className="mt-[3.2vh] flex items-end justify-between gap-6 max-md:mt-4 max-md:flex-col max-md:items-start max-md:gap-2">
            <p className="font-display hero-tagline text-[clamp(30px,3.1vw,54px)] font-[800] leading-[0.95] tracking-[0.02em] max-md:text-[30px]">
              {hero.tagline.map((w) => (
                <span key={w} className="tag-word mr-[0.35em] inline-block">
                  {w}
                </span>
              ))}
            </p>
            <p className="hero-meta label shrink-0 pb-1.5 text-muted">{hero.meta}</p>
          </div>
        </div>
      </div>
      <p className="hero-hint label absolute bottom-[4vh] left-[clamp(20px,5vw,80px)] z-[2] flex items-center gap-3 text-muted max-md:hidden">
        <span className="hint-line block h-px w-10" />
        {hero.hint}
      </p>
      </div>
    </FilmPin>
  );
}
