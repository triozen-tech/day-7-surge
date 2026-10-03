import type { Metadata } from "next";
import Loader from "@/components/engine/Loader";
import SmoothScroll from "@/components/engine/SmoothScroll";
import RecordMode from "@/components/engine/RecordMode";
import "@fontsource-variable/fraunces";
import "@fontsource/instrument-serif";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/syne";
import "@fontsource-variable/manrope";
import "@/components/fx/fx.css";
import "@/components/sections/sections.css";
import SectionsLab from "./SectionsLab";

// /lab/sections: every SECTION-MENU layout (docs/SECTION-MENU.md) as a real designed section, labelled with its code.
export const metadata: Metadata = { title: "Section lab", robots: { index: false, follow: false, nocache: true } };

export default function Page() {
  return (
    <>
      <Loader text="Lab" enabled={false} />
      <SmoothScroll />
      <RecordMode />
      <SectionsLab />
    </>
  );
}
