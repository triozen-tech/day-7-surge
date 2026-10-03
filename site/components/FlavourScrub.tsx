"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { shine } from "./SurgeDetails";
import { cart } from "../cart";
import { flavours } from "../content";
import FilmPin from "./FilmPin";
import { NAV_GAP, within, type Place } from "./film";

// phone: the whole can (it widens a little over the clip; box = its envelope) fits between the nav and the card
const place = (phone: boolean): Place =>
  phone
    ? {
        fit: { box: [0.24, 0.09, 0.77, 0.93], area: (c) => ({ top: NAV_GAP, bottom: (within(c, ".flavour-card")?.top ?? c.clientHeight * 0.65) - 12 }) },
        fade: { t: 0.08, b: 0.1, l: 0.12, r: 0.12 },
      }
    : { x: 0.35, y: 0.54, h: 0.9, fade: { l: 0.16, r: 0.26, t: 0.14, b: 0.16 } };

// Flavours (Motion map M10 pinned colour shift: the section colours wash with the can, scrubbed by video time).
// One joined video: Original (blue) → the sleeve wraps → Tropical (pink → orange) → frost drips → Arctic Zero (silver).
// The name, line, price card and the section's colours (CSS variables --fa / --fb) switch at the MEASURED video times
// where the can is half changed (content.ts: 2.80 s and 6.356 s), so the text never says "Tropical" while the can is
// still mostly blue. Laptop: the can 90% high, left of centre, all four edges melting into the page; frosted card on
// the right. Phone: the can smaller with clear space under the nav, the card at the bottom.
// "Add to cart" bumps the nav's cart count. ?static=1: Arctic Zero (the video's last picture).

/** Video seconds over which the colour washes from one flavour to the next, centred on the switch. */
const WASH = 0.6;
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
  const x = hex(a);
  const y = hex(b);
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(",")})`;
};
const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};
/** Section colours at video second t: a smooth wash between neighbours around each switch (M10). */
const coloursAt = (t: number) => {
  const items = flavours.items;
  for (let i = 1; i < items.length; i++) {
    const s = items[i].from;
    if (t < s - WASH / 2) return { a: items[i - 1].a, b: items[i - 1].b };
    if (t <= s + WASH / 2) {
      const k = smooth((t - (s - WASH / 2)) / WASH);
      return { a: mix(items[i - 1].a, items[i].a, k), b: mix(items[i - 1].b, items[i].b, k) };
    }
  }
  const last = items[items.length - 1];
  return { a: last.a, b: last.b };
};

const indexAt = (t: number) => {
  let i = 0;
  flavours.items.forEach((f, k) => {
    if (t >= f.from) i = k;
  });
  return i;
};

export default function FlavourScrub() {
  const [active, setActive] = useState(0);
  const cur = useRef(0);
  const wrap = useRef<HTMLDivElement>(null);

  const lastCol = useRef("");
  const onTime = (t: number) => {
    // M10: the section's colours wash between flavours with the can (scrubbed by video time)
    const col = coloursAt(t);
    const key = col.a + col.b;
    if (key !== lastCol.current) {
      lastCol.current = key;
      const el = wrap.current?.closest<HTMLElement>(".flavours");
      el?.style.setProperty("--fa", col.a);
      el?.style.setProperty("--fb", col.b);
    }
    // the card's text switches exactly at the measured half-change
    const i = indexAt(t);
    if (i === cur.current) return;
    cur.current = i;
    setActive(i);
  };

  // the new name lands with a quick blur-in (not on the first render)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (prefersReducedMotion()) return;
    const card = wrap.current?.closest<HTMLElement>(".flavours")?.querySelector(".flavour-card");
    if (!card) return;
    shine(card.querySelector(".btn-surge")); // the button shines in the new flavour colour
    gsap.fromTo(
      card.querySelectorAll(".flavour-name, .flavour-line, .flavour-price"),
      { yPercent: 35, opacity: 0, filter: "blur(8px)" },
      { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "expo.out", stagger: 0.05, overwrite: true },
    );
  }, [active]);

  // the card leaves WITH the section: as soon as the stage starts scrolling away it lifts and fades out, so it never
  // hangs at the top of the screen while the next section comes in (phone: it sits at the bottom, so it would)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const section = wrap.current!.closest<HTMLElement>(".flavours")!;
    const card = section.querySelector<HTMLElement>(".flavour-card")!;
    const tw = gsap.fromTo(
      card,
      { opacity: 1, y: 0 },
      {
        opacity: 0,
        y: -40,
        ease: "power1.in",
        scrollTrigger: { trigger: section, start: "bottom bottom", end: "bottom 62%", scrub: true },
      },
    );
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, []);

  const f = flavours.items[active];

  return (
    <FilmPin id="flavours" film={flavours.film} arrive={1.0} onTime={onTime} className="flavours" place={place}>
      <div ref={wrap} className="flavour-glow pointer-events-none absolute inset-0" />
      <div className="container-x relative z-[2] flex h-full items-center justify-end max-md:items-end max-md:pb-[4svh]">
        <article className="flavour-card frost condensation w-[min(460px,36vw)] p-[clamp(22px,2.4vw,36px)] max-md:w-full max-md:p-5" data-flavour={f.id}>
          <div className="flex items-center justify-between">
            <p className="eyebrow">{flavours.eyebrow}</p>
            <ol className="flex gap-2" aria-label="Flavours">
              {flavours.items.map((x, k) => (
                <li key={x.id} className={`flavour-dot ${k === active ? "is-on" : ""}`} style={{ background: `linear-gradient(135deg, ${x.a}, ${x.b})` }} aria-label={x.name} aria-current={k === active} />
              ))}
            </ol>
          </div>
          <div className="mt-6 max-md:mt-3" aria-live="polite">
            <h2 className="font-display flavour-name text-[clamp(52px,4.6vw,84px)] font-[850] leading-[0.86] md:whitespace-nowrap max-md:text-[52px]">{f.name}</h2>
            <p className="flavour-line mt-3 text-[17px] leading-snug text-fg/90 max-md:mt-2 max-md:text-[15px]">{f.line}</p>
          </div>
          <div className="mt-7 flex items-end justify-between gap-4 max-md:mt-4">
            <div>
              <p className="flavour-price font-display text-[44px] font-[800] leading-none tabular-nums max-md:text-[36px]">{f.price}</p>
              <p className="label mt-2 text-muted">{f.size}</p>
            </div>
            <button type="button" className="btn-surge" onClick={() => cart.add(f.name)} data-cursor="Add">
              Add to cart
            </button>
          </div>
        </article>
      </div>
    </FilmPin>
  );
}
