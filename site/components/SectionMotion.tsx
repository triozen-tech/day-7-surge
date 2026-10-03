"use client";

import { useEffect } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

// Round 3: the motion of the calm sections + the transitions between sections (Motion map in site/DESIGN.md).
// Big moments (loader, hero, pop, flavours, ice, closing) live in their own components; this only adds:
//   M22 What's inside: values decode (scramble → land) column by column, dividers light as each lands
//   M1  Night run: a navy curtain with a rain-streak edge lifts off the photo, the photo settles 1.15 → 1
//   X1  hero → pop: the hero recedes (dims, 0.96) as the pop comes up over it
//   X3  inside → flavours: the bottom ring lines bend into the curve of the can's rings as they pass
//   X2  flavours → ice: the ice stage arrives tinted with the last flavour's cyan, washing to ice white
//   X4  ice → night run: the burst pushes in and whitens slightly as it leaves (the frost "fills" the screen)
//   X1  night run → closing: the photo + offer recede as the street comes up
//   X3  closing → footer: the footer's ring lines stretch out from the centre as it arrives
// Everything is scroll-driven or plays once on arrival, never needs hover/click. ?static=1: nothing runs (final state).

const DIGITS = "0123456789";
const LETTERS = "BCDEFHKMNPRSTVXZ";

/** M22: shuffles each character through random ones of the same kind, landing left → right. */
function decode(el: HTMLElement, delay: number, duration: number) {
  const chars = Array.from(el.querySelectorAll<HTMLElement>(".dc"));
  const finals = chars.map((c) => c.textContent ?? "");
  const pool = (ch: string) => (/\d/.test(ch) ? DIGITS : /[A-Z]/i.test(ch) ? LETTERS : "");
  const state = { p: 0 };
  let last = -1;
  return gsap.to(state, {
    p: 1,
    delay,
    duration,
    ease: "none",
    onStart: () => {
      chars.forEach((c, i) => {
        const set = pool(finals[i]);
        if (set) c.textContent = set[Math.floor(Math.random() * set.length)];
      });
    },
    onUpdate: () => {
      // change the random characters ~30 times a second, not every frame (readable flicker)
      const step = Math.floor(state.p * duration * 30);
      if (step === last) return;
      last = step;
      chars.forEach((c, i) => {
        const set = pool(finals[i]);
        if (!set) return;
        const landAt = 0.35 + (0.65 * (i + 1)) / chars.length;
        c.textContent = state.p >= landAt ? finals[i] : set[Math.floor(Math.random() * set.length)];
      });
    },
    onComplete: () => chars.forEach((c, i) => (c.textContent = finals[i])),
  });
}

export default function SectionMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();

    mm.add({ laptop: "(min-width: 768px)", phone: "(max-width: 767px)" }, (cond) => {
      const { phone } = cond.conditions as { phone: boolean };

      // ---------- M22 What's inside (X5: starts right at the edge) ----------
      const inside = document.getElementById("inside");
      if (inside) {
        const values = Array.from(inside.querySelectorAll<HTMLElement>(".decode"));
        const dividers = Array.from(inside.querySelectorAll<HTMLElement>(phone ? ".stat-divider-m" : ".stat-divider"));
        const notes = inside.querySelectorAll(".stat .label, .stat p:last-child");
        gsap.set(values, { opacity: 0.25 });
        gsap.set(dividers, { opacity: 0.15 });
        gsap.set(notes, { opacity: 0, y: 10 });
        const tl = gsap.timeline({ paused: true });
        values.forEach((v, i) => {
          const at = i * 0.5;
          tl.to(v, { opacity: 1, duration: 0.2 }, at);
          tl.add(decode(v, 0, 0.9), at);
          tl.to(v.closest(".stat")!.querySelectorAll(".label, p:last-child"), { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, at + 0.3);
          // the divider before the next column lights as this value lands
          if (dividers[i])
            tl.fromTo(dividers[i], { opacity: 0.15, filter: "brightness(1)" }, { opacity: 1, filter: "brightness(2)", duration: 0.25, ease: "power2.out" }, at + 0.85).to(
              dividers[i],
              { opacity: 0.7, filter: "brightness(1)", duration: 0.8, ease: "power2.out" },
              at + 1.1,
            );
        });
        gsap.timeline({ scrollTrigger: { trigger: inside, start: "top 85%", once: true, onEnter: () => tl.play() } });

        // X3: the bottom ring lines bend into the can's ring curve as they pass (scrubbed)
        inside.querySelectorAll<SVGPathElement>(".bend-ring").forEach((p, i) => {
          const y = Number(p.dataset.y);
          gsap.fromTo(
            p,
            { attr: { d: `M0,${y} Q50,${y} 100,${y}` } },
            {
              attr: { d: `M0,${y - 10} Q50,${y + 26 - i * 2} 100,${y - 10}` },
              ease: "none",
              scrollTrigger: { trigger: inside, start: "bottom bottom", end: "bottom top", scrub: true },
            },
          );
        });
      }

      // ---------- M1 Night run: the rain-edge curtain lifts off the photo ----------
      const run = document.getElementById("run");
      if (run) {
        const curtain = run.querySelector(".run-curtain");
        const img = run.querySelector(".run-img");
        // the CSS holds the lifted (final) state as a transform: clear it, then cover the photo
        const photo = run.querySelector(".run-photo");
        // scroll-linked and early: the curtain starts lifting before the photo reaches the screen (under the frost of
        // the hand-over), so the photo is already half revealed as it enters and fully revealed a quarter in
        gsap.fromTo(
          curtain,
          { y: 0, yPercent: 0 },
          { yPercent: -125, ease: "power1.inOut", scrollTrigger: { trigger: photo, start: "top 125%", end: "top 72%", scrub: 0.4 } },
        );
        gsap.fromTo(img, { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: photo, start: "top 125%", end: "top 20%", scrub: 0.4 } });
        // the title lines rise from their own line boxes at the same moment (time-based, once)
        gsap.from(run.querySelectorAll(".line-inner"), {
          yPercent: 105,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.1,
          scrollTrigger: { trigger: run.querySelector("h2"), start: "top 100%", once: true },
        });

        // X4 (second half): the frost clears off Night Run as it comes up; full white while the seam crosses the
        // middle of the screen, gone by the time the photo is in place
        gsap.fromTo(
          run.querySelector(".run-frost"),
          { opacity: 1 },
          { opacity: 0, ease: "power1.in", scrollTrigger: { trigger: run, start: "top 52%", end: "top 12%", scrub: true } },
        );

        // X1 night run → closing: the photo + offer recede as the street comes up
        gsap.to(run, {
          opacity: 0.35,
          scale: 0.96,
          ease: "none",
          scrollTrigger: { trigger: run, start: "bottom 70%", end: "bottom top", scrub: true },
        });
      }

      // ---------- X1 night run → closing: the closing's title lines rise in as the street comes up ----------
      const closingEl = document.getElementById("closing");
      if (closingEl) {
        gsap.from(closingEl.querySelectorAll(".closing-title .line-inner"), {
          yPercent: 105,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.14,
          scrollTrigger: { trigger: closingEl, start: "top 70%", once: true },
        });
      }

      // ---------- X1 hero → pop: the hero recedes as the pop comes up ----------
      const hero = document.getElementById("hero");
      const heroStage = hero?.querySelector<HTMLElement>(".pin-stage");
      if (hero && heroStage) {
        gsap.to(heroStage, {
          scale: 0.96,
          opacity: 0.35,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "bottom bottom", end: "bottom top", scrub: true },
        });
      }

      // ---------- X2 flavours → ice: arrives tinted with the last flavour's cyan, washes to ice white ----------
      const ice = document.getElementById("ice");
      const tint = ice?.querySelector<HTMLElement>(".ice-tint");
      if (ice && tint) {
        gsap.fromTo(tint, { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { trigger: ice, start: "top bottom", end: "top top", scrub: true } });
      }

      // ---------- X4 ice → night run: the burst pushes in and whitens a little as it leaves ----------
      const iceStage = ice?.querySelector<HTMLElement>(".pin-stage");
      if (ice && iceStage) {
        gsap
          .timeline({ scrollTrigger: { trigger: ice, start: "bottom bottom", end: "bottom top", scrub: true } })
          .to(iceStage, { scale: 1.18, ease: "none", duration: 1 }, 0)
          // X4 (first half): the burst's frost fills the screen by the time the seam is mid-screen
          .fromTo(ice.querySelector(".ice-frost"), { opacity: 0 }, { opacity: 1, ease: "power1.in", duration: 0.5 }, 0);
      }

      // ---------- X3 closing → footer: the footer's ring lines stretch out from the centre ----------
      const footer = document.querySelector<HTMLElement>(".surge-footer");
      if (footer) {
        gsap.fromTo(
          footer.querySelectorAll(".edge-rings > i"),
          { scaleX: 0.15, opacity: 0.4 },
          { scaleX: 1, opacity: 1, ease: "power2.out", stagger: 0.05, scrollTrigger: { trigger: footer, start: "top bottom", end: "top 55%", scrub: true } },
        );
      }
    });

    return () => mm.revert();
  }, []);

  return null;
}
