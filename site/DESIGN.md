# Design direction: Surge (Day 7)

**Brief:** Surge, a premium energy drink for night runners, gamers and late workers. "Cold. Loud. Awake." Feel: electric, icy, fast, but premium and clean: an Apple-level product page at night, not a gamer site. Concept brand (Surge is a real soda name elsewhere): no real logos, footer says it is a concept. Assets: made by the team (see "Assets").

**The idea in one line:** *a product page you can hear crack open.* The page is one continuous night film in five scroll videos (spin → pop → flavour change → ice burst → street), with only three short still sections between them. Every video is driven by scroll **time**, never frame numbers, and nothing on screen ever freezes.

**Video-first (from the brief):** 5 scroll-scrubbed videos, 3 short static sections, 8 sections + loader. This replaces the kit's usual "~5 shop sections": the shop parts live inside the videos (flavour prices + Add to cart, the 12-pack offer, the closing "Get Surge").

## Choices (codes from docs/DESIGN-MENU.md)

8 of 8 different from the last three sites (see the sites log).

| | Choice | Why |
|---|---|---|
| Look | **L4 tech, "cold lab" version**: a clean product page in the dark. Midnight navy pages, lots of air, one product at a time, frosted glass panels and soft blue glows. Detail language = the can itself: three thin glowing ring lines, frost/condensation texture, small rain. **No** neon-on-black stickers, tapes, slants or outlines-with-shadow: calm and exact, the energy comes from the motion and the light | An energy drink usually shouts; making it calm, cold and precise is what makes it look premium, and it matches the icy can |
| Palette | **Midnight voltage** (new). bg `#05080f` (midnight navy-black) · surface `#0b1220` · text **ice white `#eaf5ff`** · muted **frost silver `#b9c6d3`** (11:1) · accent **electric blue `#2f8cff`** (buttons, active states) with **glow blue `#5cc8ff`** used only as *light* (ring lines, glows, focus). Flavour accents **only inside Flavours**: Tropical pink `#ff4f8b` → orange `#ff9a3c` (gradient), Arctic Zero cyan `#7fe7ff` | One blue accent, two blues by job (solid vs light). Flavour colours are allowed to take over one section on purpose, so the colour change in the can feels like an event |
| Type pair | **T15 Big Shoulders Display + Rethink Sans**. Big Shoulders Display at 800–900 weight, uppercase, very tall and tight (`SURGE`, `COLD.`, `STAY AWAKE.`); Rethink Sans for body, small spaced labels, prices (tabular figures) and buttons | Tall condensed letters look like the can (tall, narrow) and fit huge words into a screen without shouting width. Never used on an earlier site, no serif |
| Nav | **N3 split, "charge HUD" version**: one slim bar: `SURGE` wordmark left · centre: a small chapter label in a flip window ("01 · SPIN", "02 · OPEN" …) with three tiny ring segments under it that light as you go · right: a frosted **Cart** pill with a count. Bar is transparent, a hairline ring line under it after the hero. Phone: wordmark + flip label + cart only | Nothing covers the videos; the flip label tells the viewer where they are in the film, and the cart count bumps when a flavour is added |
| Hero | **The sliced wordmark (new)**: the scroll video spins the can (citrus, ice and splash fly in). A giant `SURGE` (taller than half the screen) is **cut into three horizontal slices along three glowing ring lines**, exactly like the rings on the can. When the loader ends, the slices snap into line (the charge arrives); as you scroll, the slices **shear apart sideways at three speeds** (top left fast, middle right slow, bottom left medium) with speed streaks along the ring lines, while the video plays. Tagline "Cold. Loud. Awake." + small "Energy · 500 ml · ₹149" under it. Rain particles drift | The word itself is the moving part and is cut by the brand's own mark (the 3 rings). Nothing grows to full screen; it is not a still word behind a product |
| Section shape | **S1 straight, "ring line" version**: sections meet on straight edges marked by **three thin glowing hairlines** (the can's rings, 1px, 6px apart, glow blue), sometimes with a faint frost band under them | Clean like a product page, and every border repeats the brand mark |
| Cards | **C5 frosted glass, "condensation" version**: rounded 20px frosted panels (backdrop blur over the video), a fine water-droplet texture in the lower third (like the frosted bottom of the can), three ring lines across the top edge. No cut corners, no product breaking out | The can's bottom quarter is frosted ice; the cards are made of the same material |
| Signature moment | **The Pop (new)**: pinned, the can-open video scrubs: wide can → close on the tab → **the pop at ~3.0 s**: the three rings on the can **and** three ring lines on the page flash, a soft blue screen glow blooms. On the beat, **"COLD." "LOUD." "AWAKE."** slam in one by one (kinetic scale) in sync with the pop and the fizz. The fizz peak (3.5–4.5 s) gets the most scroll (slow motion, double frames). Supporting: **1. Flavour change** (the can changes colour, the page accent follows), **2. Ice burst** (a frost pane shatters past the camera) | It is a sound you can *see*: the one moment everyone knows from a can. No earlier site had a sound/beat moment |
| Loader | **"Charge" (new)**: on midnight navy, three thin ring lines (drawn as flat ellipses, like the can's rings in perspective) **draw on one after another like a charge bar**, a small `%` counter beside them, `SURGE` small above. At 100% the rings flash white-blue and the flash becomes the hero's ring lines (the slices snap together on the same beat). Fixed ~2.5 s, supports `&at=`; all hero frames are loaded before it ends | Shows the brand mark and "charging" (energy) before the first frame; hands over into the hero with no gap |

**Motion feel: cold, fast, exact.** Quick, clean eases (`expo.out` 0.6–0.9 s for hits, `power3.inOut` for slides, `none` for scrubs), hard stops, flashes that decay fast. No bounce, no wobble. Between hits, things drift slowly (rain, glow, a 1.00 → 1.03 push) so a hold is never frozen. One main thing moves at a time; the busiest moment is the pop.

## Section plan (8 + loader + nav)

| # | Section | Kind | Starts from | How it's restyled |
|---|---|---|---|---|
| 0 | **Loader "Charge"** | — | engine Loader → `ChargeLoader` | 3 ring ellipses draw on as a charge bar, `%` counter, flash into the hero |
| — | **Nav "charge HUD"** | — | custom → `ChargeNav` | Split bar: wordmark · flip chapter label + 3 ring segments · frosted Cart pill with count |
| 1 | **Hero: SURGE** (video `hero-orbit`, 0–6 s) | cinematic | FrameHero → `SliceHero` | Pinned frames, can on the left third (video shrunk to 90% on black so the can has headroom). `SURGE` on the right two-thirds, huge, cut into 3 slices along 3 ring lines; tagline + "₹149" below. Rain canvas |
| 2 | **Crack it open** (video `can-open`, 0–6.5 s) — signature | cinematic | FrameScrub → `ThePop` | Pinned ~360vh. Frames centred. Ring-line flash + screen glow at the pop; `COLD.` `LOUD.` `AWAKE.` slam in at the pop / fizz start / fizz peak, stacked left of the can |
| 3 | **What's inside** (static) | shop / info | Stats → `InsideStats` | Three big columns split by ring-line dividers: **80 mg** caffeine ("about a double espresso") · **B3 · B6 · B12** ("for steady energy") · **0 g** sugar ("in every flavour"). Short heading "What's inside." |
| 4 | **Flavours** (videos `flavour-1` + `flavour-2` joined, 8.5 s) | shop | VariantHero → `FlavourScrub` | Pinned ~380vh. Can centred-left, a frosted card on the right: flavour name (huge condensed), one-line taste, `₹149 · 500 ml`, Add to cart. Name, line, accent colour and glow change with the can: Original (blue) → Tropical (pink → orange) → Arctic Zero (cyan). Three small flavour dots show which one |
| 5 | **Ice-cold** (video `ice-burst`, 0–3.5 s) | cinematic | FrameScrub → `IceBurst` | Pinned ~240vh. A pane of frosted ice tiles over the can; at the burst the tiles shatter outward and fly past the camera. Line "Served at the edge of freezing." + small "Best at 2 °C" |
| 6 | **Night run** (static `athlete.jpg`) | shop | Split → `NightRun` | Tall photo left (3:4), right: "For the ones still running at 2 AM." + frosted offer card "Night Pack · 12 × 500 ml · mixed flavours · **₹1,599** (₹133 a can)" + Add to cart. Rain streaks over the photo |
| 7 | **Closing** (video `closing`, 0–8 s) | cinematic + CTA | Cta → `StayAwake` | Pinned ~260vh. Can on the right in the rainy street; "STAY AWAKE." huge on the dark left; the glowing "Get Surge" button (three ring lines as its border) appears with the rings' glow at 4–8 s |
| 8 | **Footer** | — | Footer → `SurgeFooter` | Link columns (Flavours · What's inside · Night Pack · Stockists), newsletter "Get the night drop" field, "Concept design by Triozen Tech — not a real product.", "© Surge 2026". Ring-line border on top |

Unchanged patterns imported: 0 planned (everything copied + restyled).

## Motion map (codes from docs/MOTION-MENU.md)

Every section has its own main move; no code is used twice; nothing is "just a fade"; no code from the previous site. The scroll videos are the medium (frame player); each section's code is the move built on top of it. Only the closing uses the plain frame scrub (M27) as its code.

| # | Section | Motion | How it plays here | Phone | Record mode |
|---|---|---|---|---|---|
| 0 | Loader | **M8** SVG line draw-on | The three ring ellipses draw themselves one after another like a charge bar (`stroke-dashoffset`), `%` counts beside them; at 100% they flash and hand over into the hero's ring lines | same, smaller | fixed 2.5 s |
| — | Nav | **M2** 3D page flip (X axis) | The chapter label flips over like a split-flap board ("01 · SPIN" → "02 · OPEN" …) as each video section starts; the ring segment under it lights | same (label only, no links) | follows the page |
| 1 | Hero | **M7** multi-speed parallax (sideways, sliced) | On the loader's flash the 3 slices of `SURGE` snap into line from three offsets (blur → sharp), the cut lines flash, the tagline rises; the video starts playing by itself at the same moment (0 → 0.9 s, the scroll takes over seamlessly). Scroll: top slice −26%, middle +11%, bottom −16% (three speeds), cut lines stretch into streaks; rain and video drift at their own speeds | video in the top 70%, `SURGE` under it full width, half the shear | scrub, 3.6 s |
| 2 | Crack it open (signature) | **M25** kinetic scale word | `COLD.` hits on the pop frame (3.042 s video), `LOUD.` at fizz start (3.5 s), `AWAKE.` at fizz peak (4.2 s): each slams in real time the moment the video crosses its beat (2.4× + blur → place in 0.45 s, a cold flash on the letters); the ring lines + a soft glow at the opening flash on the pop frame (0.05 s up, 0.45 s fade, never a white-out); slow camera push 1.00 → 1.06 over the pin | square frames fill the width (whole top of the can, sharp), words under it | scrub + real-time hits, 5.9 s |
| 3 | What's inside | **M22** scramble / decode | Each value shuffles through random characters and lands left → right, one column after another (`80 mg` → `B3 · B6 · B12` → `0 g`); the ring dividers light as each lands | columns stacked, same decode | once, ~2.5 s |
| 4 | Flavours | **M10** pinned colour shift | Pinned: the section's colours (`--fa`/`--fb`: glow around the can, a faint stage tint above the video, button, rings on the card) wash from flavour to flavour over 0.6 s of video centred on each measured half-change; the card's name, line and price switch exactly at the half-change with a quick blur-in; the card lifts and fades out as the section leaves | can on top (60% high, space under the nav), card at the bottom, same colours | scrub, 6.6 s |
| 5 | Ice-cold | **M17** grid dissolve (shatter) | A grid of ~14×8 frosted ice tiles covers the can (blurred view through them); at the burst (video 1.2 s) they break away in a wave from the can's centre, scaling up and flying off past the camera; the line rises after | 6×10 tiles | scrub, ~3.5 s |
| 6 | Night run | **M1** curtain reveal (rain edge) | A navy curtain slides down off the photo; its lower edge is a ragged line of rain streaks; the photo settles 1.15 → 1. Then rain streaks keep running over it | same (vertical), photo on top, text under | once, ~3 s |
| 7 | Closing | **M27** frame-sequence scrub | The street video plays with the scroll (0–8 s, car passes at 1–3 s); "STAY AWAKE." lit from the start; at 4 s the rings glow and the "Get Surge" button lights up with them (its three ring borders glow in sync) | can right-of-centre crop, text on top half | scrub, ~4.5 s |
| 8 | Footer | **M36** mist wisps | Cold mist (like the can's icy bottom) curls slowly along the bottom of the footer, behind the links and the newsletter field | 2 wisps | auto, ~1 s |

Codes used once each: M8 M2 M7 M25 M22 M10 M17 M1 M27 M36 (10 codes, no repeats, none from the previous site).

**Transitions:** 0→1 **X5** hard cut on the flash: the loader's rings *become* the hero's ring lines, the slices snap on the same beat · 1→2 **X1** the pop section slides up over the dimming hero · 2→3 **X5** hard cut after the long pin: the numbers start decoding right at the edge · 3→4 **X3** the three ring dividers at the bottom of "What's inside" bend into the curve of the can's rings as they pass · 4→5 **X2** colour wash: Arctic Zero cyan cools back into ice blue-white · 5→6 **X4** zoom-through: the burst's white frost fills the screen and clears onto the night-run photo · 6→7 **X1** the street slides up over the photo · 7→8 **X3** ring-line edge.

**Never frozen:** rain (hero, night run, closing), glow pulses on the rings, a slow 1.00 → 1.03 push during every hold, the videos keep easing on in slow motion during record holds.

**Built (Round 3/4):** X4 = the ice frost rises to full white by the time the seam is mid-screen, Night Run's own frost starts at the same white and clears onto the photo; the curtain is scroll-linked and starts lifting before the photo reaches the screen (half revealed as it enters). Details live in `SurgeDetails.tsx`: magnetic buttons (smooth, no spring), shine sweep (hover + once on arrival; flavour button on every switch), Night Pack card pointer tilt + tilt-in once, record mode adds the Night Pack once on camera (cart pill bump + ring segments flash), footer ring underlines draw in once, cursor labels "Crack" / "Taste" / "Add" / "Get it" / "Run". Phone pass: no sideways scroll and no text under 12px at 375 and 360.

**Details (Round 4, each with a hands-free play-once):** Add to cart → the nav Cart pill bumps (+1) and its ring segment flashes · magnetic "Get Surge" and "Add to cart" · `data-cursor="Crack"` on the pop, "Taste" on the flavour can · button fill wipe in the flavour colour · ring underline draws on links · frost card tilts slightly on hover (once by itself).

## Video plan (frames)

Rules from the brief: map scroll to **video time**, blend neighbour frames (no stutter), double density in slow/important parts, crop the Veo watermark (bottom right), each folder ≤ 12 MB desktop / ≤ 6 MB phone (kit hard limit 15 MB), loaded **only when the section is near** (lazy), **first load ≤ 8 MB** (hero frames fully preloaded before the loader ends). All sources are 1920×1080, 24 fps, 8 s.

Built by `python3 site/tools/make_frames.py` (not `npm run frames`): trim → `delogo` paints out the Veo mark (x 1865–1895, y 1042–1055 in every clip) → motion-interpolated 48 fps → frames picked by **video time** per segment → near-black mapped exactly onto the page background `#05080f` (frames melt into the page, no box edge) → WebP desktop + phone (2:3 crop following the can) → `manifest.json` with a `times` list (the video second of every frame). The site's player (`site/components/film.ts`) maps scroll → video second → the two frames around it, blended.

**Measured in the frames (not guessed):**

| Clip | Landmarks (seconds of the source) |
|---|---|
| `hero-orbit` | The can is already on the left (centre x ≈ 480 of 1920). Shrunk to 90% on page black with a wide soft fade (top 28%, bottom 18%, sides 14%) so fruit and mist dissolve before any edge |
| `can-open` | No cut: a fast camera pan peaks at 1.8–2.5 s (≈ 14 px per frame), smoothed with 48 fps frames · tab lifts 2.7–3.0 s · **pop = frame 74 = 3.042 s** (first blue light through the opening; rim glow 3.12 s on) · fizz 3.5–4.6 s |
| `flavour-1` | Sleeve wraps from 1.6 s · **half the can body changed at 2.80 s** → "Tropical" (rings turn gold ~2.6 s) · the can slowly gets wider (315 → 425 px, same height) |
| `flavour-2` | Frost drips from 1.3 s · **half the can body silver at 2.69 s** (= 6.356 s of the joined clip) → "Arctic Zero" |
| join | flavour-1 0–4.0 s + flavour-2 0–4.0 s, 1/3 s cross-fade; around it flavour-1 is squeezed and flavour-2 stretched to one can width (353 px), easing back to natural |
| `ice-burst` | Still until 1.25 s · **burst starts 1.33 s**, peak 1.6–2.6 s |
| `closing` | Car passes 1–3 s · **rings start glowing 2.75 s, half 3.6 s, full 4.75 s** → the "Get Surge" glow follows this curve |

| Folder | Video used | Frames (density) | Desktop | Phone |
|---|---|---|---|---|
| `surge-hero` | 0–6 s | 16 fps to 3 s, 24 fps after (121) | 1600 px, 4.1 MB (preloaded) | 540×810, 2.7 MB |
| `surge-pop` | 0–6.5 s | 48 fps in 1.8–2.6 s and 2.9–4.6 s (187) | 1440 px, 6.2 MB (lazy) | 3.6 MB |
| `surge-flavours` | joined 7.67 s | 48 fps around both colour changes and the join (231) | 1600 px, 5.7 MB (lazy) | 4.3 MB |
| `surge-ice` | 0–3.5 s | 12 fps before the burst, 36 fps after (97) | 1280 px, 8.0 MB (lazy) | 4.0 MB |
| `surge-closing` | 0–8 s | 18 fps (145) | 1440 px, 8.6 MB (lazy) | 600×600 square (whole can, street to the sides), 5.1 MB |

First load (desktop), measured: 4.57 MB (hero frames + fonts + JS; budget 8 MB). The ice frames and its pane load while "What's inside" is on screen (a still section), so their loading burst never lands during the flavour video.

**Phone placement (any phone size):** each phone video knows where the can is in its frames (its box over the whole clip) and is scaled + centred so the WHOLE can fits a free area measured from the page: hero = nav → SURGE slices, pop = nav → words, flavours = nav → card, ice = nav → text, closing = below the button → bottom (closing on phones: title, line and button on top, can below). Measured again on resize and when the fonts load; crossing 768px switches between the laptop and phone frame sets. Checked at 360×640, 375×667, 352×681, 390×844, 430×932 and 1366×768.

**Edges:** every video is placed and faded inside its canvas by the player (`place` in each section: position, height, soft fade on each side into `#05080f`), never by CSS masks, so no box edge can show. Laptop flavours: 90% high, left of centre, all four sides fade. Phone flavours: 60% high with space under the nav. Phone closing: square frames, the whole can in the lower middle, title on top, button on the road below.

**Ice pane:** built once (a 1/8-size blurred copy of the first frame scaled up, frost tint, speckles) at half resolution; drawn as ONE sheet until the burst; tiles are cut out only as they break loose (crack edges only on moving tiles). A light sheen sweeps the sheet while it is whole.

**Never frozen (checked with ffmpeg freezedetect n=0.002 d=0.4 + a frame-diff script on 1440 and 390 record runs: zero stuck spots):** loader glow pulses with CSS from the first paint and each ring flashes as it closes; the record holds push the held section in slowly (`HoldPush`); the footer mist drifts.

Test (Round 2 on): `?record=1` on desktop and phone, recorded, then ffmpeg `freezedetect=n=0.002:d=0.4` + the frame-diff script: zero stuck spots.

**Record timing (Round 1 run: 30.9 s after a 2.5 s loader, ≈ 33.4 s total, same on laptop and phone):** hero 3.6 · pop 6.3 · inside 2.1 · flavours 6.6 · ice 3.7 · night run 2.4 · closing 4.7 · footer 1.5. Seconds per part live in `site/content.ts` (each video's segments); pinned length = 55vh per record second.

## Assets

All in `raw/`, one look: midnight navy, blue ring light, frost, rain.

| File | Use | Processing (Round 1) |
|---|---|---|
| `hero-orbit.mp4` | Hero frames | see video plan |
| `can-open.mp4` | The Pop frames | see video plan |
| `flavour-1.mp4`, `flavour-2.mp4` | Flavours frames (one joined folder) | see video plan |
| `ice-burst.mp4` | Ice-cold frames | see video plan |
| `closing.mp4` | Closing frames | see video plan |
| `hero-can.jpg` (16:9) | OG image (`og.jpg`), spare | WebP 1920 px |
| `can-original.jpg`, `can-tropical.jpg`, `can-zero.jpg` (3:4) | Cart thumbnails, phone flavour fallback, static flavour states | WebP 1200 px tall |
| `athlete.jpg` (3:4) | Night run | WebP 1600 px tall |

Folders: images → `public/images/surge/`, frames → `public/frames/surge-*`. Archive name: `day-07-surge`.

**Still needed:** nothing.
