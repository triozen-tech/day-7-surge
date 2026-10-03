"use client";

import { useEffect } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cart } from "../cart";

// Round 4 details. Each one that matters on camera also plays ONCE by itself when it first comes on screen (nobody
// touches the mouse while filming):
//  - magnetic buttons ("Get Surge", every "Add to cart"): lean toward the pointer (smooth, never springy);
//    by itself: a small lean-in + settle when the button arrives
//  - button shine: a light sweep across the button (hover); by itself: once on arrival (flavour buttons: on every
//    flavour switch, see FlavourScrub)
//  - Night Pack frost card: tilts slightly with the pointer; by itself: a slow tilt-in once
//  - record mode only: the Night Pack is "added" once on camera → the nav Cart pill bumps and its ring segments flash
//  - ring underlines on the footer links: drawn on hover; by itself: drawn in sequence once as the footer arrives
//  - cursor labels: "Crack" on the pop, "Taste" on the flavour can
// ?static=1 / reduced motion: none of this runs.

const once = (el: Element, fn: () => void, threshold = 0.6) => {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        fn();
      }
    },
    { threshold },
  );
  io.observe(el);
  return () => io.disconnect();
};

export const shine = (btn: Element | null | undefined) => {
  if (!btn) return;
  btn.classList.remove("is-shine");
  void (btn as HTMLElement).offsetWidth; // restart the sweep
  btn.classList.add("is-shine");
  window.setTimeout(() => btn.classList.remove("is-shine"), 950);
};

export default function SurgeDetails() {
  useEffect(() => {
    // cursor labels on the two big films (the card's own "Add" label is closer, so it still wins over the button)
    document.querySelector<HTMLElement>("#pop .pin-stage")?.setAttribute("data-cursor", "Crack");
    document.querySelector<HTMLElement>("#flavours .pin-stage")?.setAttribute("data-cursor", "Taste");
    if (prefersReducedMotion()) return;

    const offs: (() => void)[] = [];
    const hover = window.matchMedia("(hover: hover)").matches;
    const recording = document.documentElement.classList.contains("is-recording") || new URLSearchParams(location.search).has("record");

    // ---- magnetic buttons ----
    document.querySelectorAll<HTMLElement>(".btn-surge, .cta-ring").forEach((el) => {
      if (hover) {
        const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        offs.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      }
      // by itself: lean in + settle, and the shine, once on arrival (not the flavour button: it shines per switch)
      if (!el.closest(".flavours"))
        offs.push(
          once(el, () => {
            gsap.fromTo(el, { scale: 0.94 }, { scale: 1, duration: 0.9, ease: "expo.out", clearProps: "scale" });
            shine(el);
          }, 0.9),
        );
    });

    // ---- Night Pack frost card: pointer tilt + a tilt-in once ----
    const card = document.querySelector<HTMLElement>("#run .frost");
    if (card) {
      gsap.set(card, { transformPerspective: 900 });
      if (hover) {
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 7);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
        offs.push(() => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerleave", leave);
        });
      }
      offs.push(
        once(card, () => {
          gsap.fromTo(card, { rotationY: -9, rotationX: 4 }, { rotationY: 0, rotationX: 0, duration: 1.6, ease: "power3.out" });
          // on camera: the Night Pack goes into the cart once (button press → nav pill bump + ring flash)
          if (recording) {
            const btn = card.querySelector<HTMLElement>(".btn-surge");
            window.setTimeout(() => {
              if (btn) gsap.fromTo(btn, { scale: 0.92 }, { scale: 1, duration: 0.6, ease: "expo.out", clearProps: "scale" });
              shine(btn);
              cart.add("Night Pack");
            }, 700);
          }
        }, 0.8),
      );
    }

    // ---- footer: ring underlines draw in sequence once ----
    const footer = document.querySelector(".surge-footer");
    if (footer) {
      const links = footer.querySelectorAll<HTMLElement>("a.link-underline");
      offs.push(
        once(footer, () => {
          links.forEach((a, i) => {
            window.setTimeout(() => a.classList.add("is-drawn"), 200 + i * 120);
            window.setTimeout(() => a.classList.remove("is-drawn"), 1300 + i * 120);
          });
        }, 0.35),
      );
    }

    return () => offs.forEach((f) => f());
  }, []);

  return null;
}
