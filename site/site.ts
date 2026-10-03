import type { SiteMeta, Theme } from "@/lib/site";

// Settings for THIS site: Surge, a (concept) premium energy drink. "Cold. Loud. Awake."
// Direction + Motion map: site/DESIGN.md. Video plan + measured video times: site/DESIGN.md → "Video plan".

export const meta: SiteMeta = {
  name: "Surge",
  title: "Surge — Cold. Loud. Awake.",
  description:
    "Surge energy drink: 80 mg caffeine, B3 · B6 · B12, zero sugar. Original, Tropical and Arctic Zero, served at the edge of freezing. A concept design.",
  loaderText: "Surge",
  loader: false, // site/components/ChargeLoader.tsx replaces the engine loader
  record: { duration: 32 }, // only used without the section timeline (the page uses data-record-time stops)
};

export const theme: Theme = {
  bg: "#05080f",
  surface: "#0b1220",
  text: "#eaf5ff",
  muted: "#b9c6d3",
  accent: "#2f8cff",
  accentText: "#ffffff",
  line: "#1a2638",
  fontDisplay: "'Big Shoulders Display Variable', 'Arial Narrow', Impact, sans-serif",
  fontBody: "'Rethink Sans Variable', system-ui, sans-serif",
  radius: 20,
  uppercaseHeadings: true,
  heroText: "#eaf5ff",
};
