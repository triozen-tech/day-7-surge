// All text and data for Surge (a concept brand). Prices are samples (concept website).
// Video times are seconds of each SOURCE clip, measured frame by frame (site/DESIGN.md → "Video plan").
// Each scroll video is a list of segments: play the video up to `to` seconds over `secs` seconds of record time.
// The pinned scroll length follows the same seconds (PIN_VH_PER_SEC), so hand scrolling and record mode feel alike.

export type Segment = { to: number; secs: number; label: string };
export type Film = { frames: string; start: number; segments: Segment[]; poster: number };

/** Pinned scroll length per second of record time (vh). */
export const PIN_VH_PER_SEC = 55;

export const nav = {
  chapters: [
    { id: "hero", label: "Spin" },
    { id: "pop", label: "Open" },
    { id: "inside", label: "Inside" },
    { id: "flavours", label: "Flavours" },
    { id: "ice", label: "Ice-cold" },
    { id: "run", label: "Night run" },
    { id: "closing", label: "Stay awake" },
  ],
};

export const loader = { brand: "Surge", note: "Charging" };

export const hero = {
  film: {
    frames: "/frames/surge-hero",
    start: 0,
    // the can turns, then citrus, ice and splash fly in (3–6 s)
    segments: [
      { to: 3.0, secs: 1.6, label: "Hero: spin" },
      { to: 6.0, secs: 2.0, label: "Hero: splash" },
    ],
    poster: 4.6,
  } satisfies Film,
  word: "Surge",
  tagline: ["Cold.", "Loud.", "Awake."],
  meta: "Energy drink · 500 ml · ₹149",
  hint: "Scroll to crack it open",
};

/** The pop: the first blue light through the tab opening (frame 74 of can-open.mp4 = 73/24 s). */
export const POP_AT = 73 / 24;

export const pop = {
  film: {
    frames: "/frames/surge-pop",
    start: 0,
    segments: [
      { to: 2.6, secs: 1.2, label: "Pop: close on the tab" }, // fast camera pan 1.8–2.5 s (48 fps there)
      { to: 3.0, secs: 0.7, label: "Pop: tab lifts" },
      { to: 3.6, secs: 0.9, label: "Pop: the pop" }, // POP_AT inside
      { to: 4.6, secs: 1.5, label: "Pop: fizz peak" }, // slow motion, 48 fps
      { to: 6.0, secs: 0.7, label: "Pop: fizz settles" },
    ],
    poster: 4.3,
  } satisfies Film,
  // each word hits on a beat of the video
  words: [
    { text: "Cold.", at: POP_AT },
    { text: "Loud.", at: 3.5 },
    { text: "Awake.", at: 4.2 },
  ],
  eyebrow: "Crack it open",
};

export const inside = {
  eyebrow: "What's inside",
  title: "Clean energy. Nothing loud on the label.",
  stats: [
    { value: "80", unit: "mg", label: "Caffeine", note: "About a double espresso." },
    { value: "B3·B6·B12", unit: "", label: "B-vitamins", note: "For steady energy, not a spike." },
    { value: "0", unit: "g", label: "Sugar", note: "In every flavour." },
  ],
};

// flavour-1 (0–4 s) + flavour-2 (0–4 s) joined with a 1/3 s cross-fade → 7.667 s.
// Colour changes measured in the frames as the share of the can body that has changed: the text switches when the
// can is HALF changed: 2.80 s of flavour-1 (navy → pink/orange 50%) and 2.69 s of flavour-2 (= 6.356 s, → silver 50%).
const JOIN = 4 - 1 / 3;
export const flavours = {
  film: {
    frames: "/frames/surge-flavours",
    start: 0,
    segments: [
      { to: 1.6, secs: 0.8, label: "Flavours: Original" },
      { to: 3.2, secs: 1.6, label: "Flavours: sleeve wraps → Tropical" },
      { to: JOIN + 2.0, secs: 1.4, label: "Flavours: Tropical, frost starts" },
      { to: JOIN + 3.3, secs: 1.3, label: "Flavours: frost → Arctic Zero" },
      { to: JOIN + 4.0, secs: 0.5, label: "Flavours: Arctic Zero" },
    ],
    poster: JOIN + 3.9,
  } satisfies Film,
  eyebrow: "Three flavours",
  items: [
    {
      id: "original",
      name: "Original",
      line: "Citrus ice, clean kick.",
      price: "₹149",
      size: "500 ml",
      from: 0,
      a: "#2f8cff",
      b: "#5cc8ff",
      image: "/images/surge/can-original.webp",
    },
    {
      id: "tropical",
      name: "Tropical",
      line: "Mango, passion fruit, sunset.",
      price: "₹149",
      size: "500 ml",
      from: 2.8,
      a: "#ff4f8b",
      b: "#ff9a3c",
      image: "/images/surge/can-tropical.webp",
    },
    {
      id: "zero",
      name: "Arctic Zero",
      line: "Zero sugar. Pure frost.",
      price: "₹149",
      size: "500 ml · 0 g sugar",
      from: JOIN + 2.69,
      a: "#7fe7ff",
      b: "#c9f6ff",
      image: "/images/surge/can-zero.webp",
    },
  ],
};

export const ice = {
  film: {
    frames: "/frames/surge-ice",
    start: 0,
    segments: [
      { to: 1.33, secs: 0.8, label: "Ice: frost pane" }, // burst starts 1.33 s
      { to: 2.6, secs: 1.4, label: "Ice: burst" },
      { to: 3.5, secs: 0.8, label: "Ice: settles" },
    ],
    poster: 2.6,
  } satisfies Film,
  BURST_AT: 1.33,
  eyebrow: "Ice-cold",
  line: "Served at the edge of freezing.",
  note: "Best at 2 °C",
};

export const run = {
  image: "/images/surge/athlete.webp",
  eyebrow: "Night run",
  title: ["For the ones", "still running", "at 2 AM."],
  text: "Twelve cold cans for the nights that keep going. Mix all three flavours.",
  offer: {
    name: "Night Pack",
    detail: "12 × 500 ml · mixed flavours",
    price: "₹1,599",
    was: "₹1,788",
    per: "₹133 a can",
  },
};

export const closing = {
  film: {
    frames: "/frames/surge-closing",
    start: 0,
    segments: [
      { to: 3.0, secs: 1.4, label: "Closing: street, car passes" },
      { to: 4.75, secs: 1.3, label: "Closing: rings light up" }, // glow 2.75 → full 4.75 s
      { to: 8.0, secs: 1.2, label: "Closing: glow" },
    ],
    poster: 6.5,
  } satisfies Film,
  GLOW_FROM: 2.75,
  GLOW_FULL: 4.75,
  title: ["Stay", "awake."],
  text: "Cold. Loud. Awake. ₹149 a can.",
  cta: "Get Surge",
};

export const footer = {
  columns: [
    { title: "Shop", links: ["Original", "Tropical", "Arctic Zero", "Night Pack"] },
    { title: "Surge", links: ["What's inside", "Stockists", "Contact"] },
  ],
  newsletter: { title: "Get the night drop", placeholder: "Your email", cta: "Join" },
  note: "Concept design by Triozen Tech — not a real product.",
  copy: "© Surge 2026",
};
