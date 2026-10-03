"use client";

import { cart } from "../cart";
import { run } from "../content";
import RainCanvas from "./RainCanvas";
import Rings from "./Rings";

// Night run (Motion map M1 curtain reveal with a rain-streak edge, Round 3).
// Tall photo left (3:4) under a navy curtain whose lower edge is a ragged line of rain streaks (.run-curtain: it slides
// down off the photo); rain keeps running over the photo. Right: the line + the Night Pack offer on a frosted card.
// Phone: photo on top, text and offer under it. ?static=1: no curtain.

export default function NightRun() {
  return (
    <section id="run" data-chapter="run" className="run relative" data-record-time="1.0" data-record-align="center" data-record-hold="1.4" data-record-label="Night run" data-hold-push=".run-push">
      {/* X4: the white frost from the ice burst carries over the seam and clears onto the photo (Round 3) */}
      <div aria-hidden className="run-frost pointer-events-none absolute inset-x-0 top-0 z-[3] h-[110svh] opacity-0" />
      <div className="run-push container-x section-y grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center gap-[clamp(32px,6vw,110px)] max-md:grid-cols-1">
        <div className="run-photo relative aspect-[3/4] max-h-[82vh] overflow-hidden rounded-[var(--radius)] max-md:max-h-[64svh]" data-cursor="Run">
          <img src={run.image} alt="A hooded runner on a wet street at night, holding a Surge can" className="run-img breathe absolute inset-0 h-full w-full object-cover" />
          <RainCanvas count={70} opacity={0.6} />
          <div className="run-curtain pointer-events-none absolute inset-0" aria-hidden>
            <div className="run-curtain-fill absolute inset-0" />
            <svg className="run-curtain-edge absolute inset-x-0 top-full h-[22%] w-full" viewBox="0 0 100 22" preserveAspectRatio="none">
              {Array.from({ length: 34 }, (_, i) => {
                const x = i * 3 + 1.5;
                const len = 4 + ((i * 37) % 17);
                return <rect key={i} x={x - 0.7} y="0" width="1.4" height={len} fill="#05080f" />;
              })}
            </svg>
          </div>
        </div>

        <div>
          <p className="eyebrow">{run.eyebrow}</p>
          <h2 className="font-display mt-5 text-[clamp(52px,6vw,108px)] font-[850] leading-[0.88]">
            {run.title.map((l) => (
              <span key={l} className="line block">
                <span className="line-inner block">{l}</span>
              </span>
            ))}
          </h2>
          <p className="mt-6 max-w-[38ch] text-[17px] leading-relaxed text-muted">{run.text}</p>

          <article className="frost condensation mt-10 flex items-center justify-between gap-6 p-6 max-sm:flex-col max-sm:items-start">
            <div>
              <Rings className="mb-4 w-24" />
              <p className="font-display text-[34px] font-[850] leading-none">{run.offer.name}</p>
              <p className="label mt-2 text-muted">{run.offer.detail}</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-right max-sm:text-left">
                <p className="font-display text-[40px] font-[800] leading-none tabular-nums">{run.offer.price}</p>
                <p className="mt-1.5 text-[13px] text-muted">
                  <s className="mr-2 opacity-70">{run.offer.was}</s>
                  {run.offer.per}
                </p>
              </div>
              <button type="button" className="btn-surge" onClick={() => cart.add(run.offer.name)} data-cursor="Add">
                Add to cart
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
