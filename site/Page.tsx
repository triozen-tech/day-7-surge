import ChargeLoader from "./components/ChargeLoader";
import SiteFlags from "./components/SiteFlags";
import ChargeNav from "./components/ChargeNav";
import SliceHero from "./components/SliceHero";
import ThePop from "./components/ThePop";
import InsideStats from "./components/InsideStats";
import FlavourScrub from "./components/FlavourScrub";
import IceBurst from "./components/IceBurst";
import NightRun from "./components/NightRun";
import StayAwake from "./components/StayAwake";
import SurgeFooter from "./components/SurgeFooter";
import HoldPush from "./components/HoldPush";
import SectionMotion from "./components/SectionMotion";
import SurgeDetails from "./components/SurgeDetails";

const ICON = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#05080f"/><g stroke="#5cc8ff" stroke-width="3" fill="none"><ellipse cx="32" cy="22" rx="20" ry="3"/><ellipse cx="32" cy="32" rx="20" ry="3"/><ellipse cx="32" cy="42" rx="20" ry="3"/></g></svg>`,
)}`;

/** Surge: a product page you can hear crack open. Plan + Motion map: site/DESIGN.md. */
export default function Page() {
  return (
    <>
      {/* never restore the old scroll position on reload · cover the page as it unloads so a reload never flashes
          the old page · ?record=1: hide the mouse arrow from the first frame */}
      <script
        dangerouslySetInnerHTML={{
          __html: `history.scrollRestoration="manual";addEventListener("pagehide",function(){var c=document.createElement("div");c.style.cssText="position:fixed;inset:0;z-index:2147483647;background:#05080f";document.body.appendChild(c)});addEventListener("pageshow",function(e){if(e.persisted)location.reload()});if(/[?&]record/.test(location.search)){var s=document.createElement("style");s.textContent="*,*::before,*::after{cursor:none!important}html{scrollbar-width:none}html::-webkit-scrollbar{display:none}";document.head.appendChild(s)}`,
        }}
      />
      <link rel="icon" type="image/svg+xml" href={ICON} />
      <meta property="og:image" content="/images/surge/og.jpg" />
      <SiteFlags />
      <ChargeLoader />
      <HoldPush />
      <SectionMotion />
      <SurgeDetails />
      <ChargeNav />
      <main className="relative overflow-x-clip">
        <SliceHero />
        <ThePop />
        <InsideStats />
        <FlavourScrub />
        <IceBurst />
        <NightRun />
        <StayAwake />
      </main>
      <SurgeFooter />
    </>
  );
}
