"use client";

import { useRef } from "react";
import { closing } from "../content";
import FilmPin from "./FilmPin";
import Rings from "./Rings";
import { within, type Place } from "./film";

// phone: title, line and button on top; the whole can fits in the space below the button (lower middle)
const place = (phone: boolean): Place =>
  phone
    ? {
        fit: { box: [0.37, 0.12, 0.69, 0.91], area: (c) => ({ top: (within(c, ".cta-ring")?.bottom ?? c.clientHeight * 0.45) + 16, bottom: c.clientHeight - 14 }) },
        fade: { t: 0.14, b: 0.08, l: 0.12, r: 0.12 },
      } : { fade: { t: 0.06, b: 0.14 } };

// Closing (Motion map M27 frame-sequence scrub).
// The street video plays with the scroll (0–8 s, a car passes far behind at 1–3 s). "STAY AWAKE." big on the dark left.
// The "Get Surge" button is lit by the video: its glow (--lit, 0 → 1) follows the can's rings, measured in the frames
// (start 2.75 s, full 4.75 s), so the button lights up with them. Phone: the can centred (2:3 crop), text on top.
// ?static=1: the lit end picture with the lit button.

export default function StayAwake() {
  const root = useRef<HTMLDivElement>(null);
  const last = useRef(-1);

  const onTime = (t: number) => {
    const lit = Math.min(1, Math.max(0, (t - closing.GLOW_FROM) / (closing.GLOW_FULL - closing.GLOW_FROM)));
    const v = Math.round(lit * 100) / 100;
    if (v === last.current) return;
    last.current = v;
    root.current?.style.setProperty("--lit", String(v));
  };

  return (
    <FilmPin id="closing" film={closing.film} arrive={0.8} onTime={onTime} className="closing" place={place}>
      <div ref={root} className="absolute inset-0" style={{ ["--lit" as string]: 0 }}>
        <div className="closing-shade pointer-events-none absolute inset-0" />
        <div className="container-x relative z-[2] flex h-full flex-col justify-center max-md:justify-start max-md:pt-[78px]">
          <h2 className="font-display closing-title font-[900] leading-[0.84]">
            {closing.title.map((l) => (
              <span key={l} className="line block">
                <span className="line-inner block">{l}</span>
              </span>
            ))}
          </h2>
          <p className="mt-6 text-[18px] text-muted max-md:mt-4 max-md:text-[15px]">{closing.text}</p>
          <div className="mt-10 max-md:mt-5">
            <a href="#flavours" className="cta-ring" data-cursor="Get it">
              <Rings className="cta-rings" />
              <span className="relative z-[1]">{closing.cta}</span>
            </a>
          </div>
        </div>
      </div>
    </FilmPin>
  );
}
