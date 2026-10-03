import { inside } from "../content";
import Rings from "./Rings";

// "What's inside" (Motion map M22 scramble / decode, played by SectionMotion): three big values split by vertical
// ring-line dividers. Each value is built from single characters (.dc): as the section arrives they shuffle through
// random characters and land left → right, one column after another; each divider lights as its value lands.
// ?static=1: the real values.

function Decode({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`decode ${className}`} data-text={text} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span key={i} className="dc" aria-hidden>
          {ch}
        </span>
      ))}
    </span>
  );
}

export default function InsideStats() {
  return (
    <section id="inside" data-chapter="inside" className="inside relative" data-record-time="1.3" data-record-align="center" data-record-hold="1.1" data-record-label="Inside" data-hold-push=".inside-push">
      <Rings className="edge-rings absolute inset-x-0 top-0" />
      <div className="inside-push container-x section-y">
        <div className="flex items-end justify-between gap-10 max-md:flex-col max-md:items-start max-md:gap-4">
          <div>
            <p className="eyebrow">{inside.eyebrow}</p>
            <h2 className="font-display mt-5 max-w-[14ch] text-[clamp(44px,5vw,88px)] font-[800] leading-[0.92]">{inside.title}</h2>
          </div>
        </div>

        <div className="mt-[clamp(48px,8vh,96px)] grid grid-cols-[1fr_auto_1fr_auto_1fr] max-md:grid-cols-1">
          {inside.stats.map((s, i) => (
            <div key={s.label} className="contents">
              {i > 0 && <Rings vertical className="stat-divider max-md:hidden" />}
              {i > 0 && <Rings className="stat-divider-m my-8 md:hidden" />}
              <div className="stat px-[clamp(0px,2.4vw,40px)] first:pl-0 max-md:px-0">
                <p className="label text-[color:var(--glow)]">{s.label}</p>
                <p className="font-display stat-value mt-3 whitespace-nowrap font-[850] leading-[0.86]">
                  <Decode text={s.value} />
                  {s.unit && <span className="stat-unit ml-2 font-[700] text-muted">{s.unit}</span>}
                </p>
                <p className="mt-4 max-w-[26ch] text-[15px] leading-relaxed text-muted">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* X3 edge: three ring lines along the bottom that bend into the curve of the can's rings as they pass */}
      <svg aria-hidden className="bend-rings pointer-events-none absolute inset-x-0 bottom-0 h-[56px] w-full overflow-visible" viewBox="0 0 100 56" preserveAspectRatio="none">
        {[22, 28, 34].map((y) => (
          <path key={y} className="bend-ring" data-y={y} d={`M0,${y} Q50,${y} 100,${y}`} fill="none" stroke="#5cc8ff" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </section>
  );
}
