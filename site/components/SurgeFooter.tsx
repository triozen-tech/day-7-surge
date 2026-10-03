import { footer } from "../content";
import Rings from "./Rings";

// Footer (Motion map M36 mist wisps, Round 3: cold mist curls along the bottom like the can's icy base).
// Ring-line top edge, link columns, newsletter field, concept note, copyright.

export default function SurgeFooter() {
  return (
    <footer className="surge-footer relative overflow-hidden" data-record-time="1.0" data-record-align="bottom" data-record-hold="0.5" data-record-label="Footer" data-hold-push=".footer-push">
      <Rings className="edge-rings absolute inset-x-0 top-0" />
      <div className="footer-mist pointer-events-none absolute inset-x-0 bottom-0 h-[75%]" aria-hidden>
        <span className="wisp wisp-1" />
        <span className="wisp wisp-2" />
        <span className="wisp wisp-3" />
        <span className="wisp wisp-4" />
      </div>
      <div className="footer-push container-x relative grid grid-cols-[1.4fr_1fr_1fr] gap-12 pb-10 pt-[clamp(64px,10vh,120px)] max-md:grid-cols-2 max-md:gap-10">
        <div className="max-md:col-span-2">
          <p className="font-display text-[clamp(56px,6vw,96px)] font-[900] leading-[0.85] tracking-[0.04em]">Surge</p>
          <form className="mt-8 max-w-[420px]">
            <label className="label text-muted" htmlFor="nl">
              {footer.newsletter.title}
            </label>
            <div className="frost mt-3 flex items-center rounded-full p-1.5 pl-5">
              <input id="nl" type="email" placeholder={footer.newsletter.placeholder} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted/70" />
              <button type="button" className="btn-surge btn-sm">
                {footer.newsletter.cta}
              </button>
            </div>
          </form>
        </div>
        {footer.columns.map((c) => (
          <div key={c.title}>
            <p className="label text-[color:var(--glow)]">{c.title}</p>
            <ul className="mt-5 space-y-3 text-[15px]">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#flavours" className="link-underline text-fg/90">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-x relative flex items-center justify-between gap-6 border-t border-line py-6 text-[13px] text-muted max-md:flex-col max-md:items-start max-md:gap-2">
        <p>{footer.note}</p>
        <p>{footer.copy}</p>
      </div>
    </footer>
  );
}
