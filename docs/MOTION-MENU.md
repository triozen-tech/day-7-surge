# Motion menu — every section moves in its own way

`DESIGN-MENU.md` makes every site *look* different. This menu makes every section *move* differently. In Round 0, give **every section one motion code** from this list in the **Motion map** of `site/DESIGN.md`.

**Rules**
- **One code per section, no code used twice on the same site.** Small supporting touches inside a section (a caption fading, a price counting) are fine; the code is the section's *main* move, the one a viewer would describe.
- **"Just fade in" is not a motion.** A plain fade/slide-up (`data-reveal`) may support a section but never be its code.
- The nav, loader and footer count as sections and get a code too.
- **The hero and signature must not repeat any earlier site's hero or signature**: check every row of `docs/SITES-LOG.md` (Hero, Signature and Motion columns), not just yesterday's.
- **No portal heroes:** the hero must not be a "shape grows to full screen" opening (a window, arch, plate, card or doorway expanding to fill the screen). M28 and M5 are for mid-page moments and loaders, not the hero.
- Every motion must work in the three engine modes:
  - `?static=1` / reduced motion → show the **final state** (nothing hidden, nothing mid-way).
  - `?record=1` → it must play **without hover or clicks**: either driven by scroll (`scrub`) or auto-playing while on screen.
  - Phone (375px) → use the **phone fallback** column; never pin sideways content on phones unless the column says so.
- Motion feel comes from `DESIGN.md` (slow and warm, bright and snappy …): pick eases and durations to match. No bounce unless the look is candy/playful.

**GSAP basics used below:****Easing vocabulary** (pick per site, write it in DESIGN.md): out `cubic-bezier(0.22,1,0.36,1)` (= GSAP `expo.out`-like) · emphasized `cubic-bezier(0.2,0,0,1)` · in-out `cubic-bezier(0.77,0,0.175,1)` · drawer/sheet `cubic-bezier(0.32,0.72,0,1)` · linear only for opacity, marquees, progress and scrub. Exits ≈ 75% of the entrance duration and move less; never ease-in for an arrival. Stagger siblings 30–80 ms (hero up to 150 ms), ≤ 8 items per group. Motion budget: a hero gets ≤ 3 staggered entrances + 1 scroll-linked element; one signature per page. (Rules adapted from ui-craft / design-taste / owl-listener motion-system, MIT; see SOURCES.)

**GSAP basics used below:****Plugins (all free since GSAP 3.13):** registered in ONE place, `lib/gsap.ts`. Always on: ScrollTrigger, **SplitText**, **ScrambleText**, **DrawSVG**, CustomEase. On demand: `await loadPlugin("Flip" | "MorphSVGPlugin" | "MotionPathPlugin" | "Physics2DPlugin" | "InertiaPlugin" | "Observer")`. Lenis stays the scroller (never ScrollSmoother on top). Prefer the plugin over hand-made code: M8 → DrawSVG, M22 → ScrambleText (`components/fx/text.tsx` ScrambleLine / DrawRings), text splits → SplitText (`data-split` / `<SplitText>` now split lines with masks). WebGL effects use OGL via `lib/gl.ts` (lazy, only in sections that use it).

**GSAP basics used below:** `gsap` + `ScrollTrigger` from `@/lib/gsap`; wrap each component's code in `gsap.context()` inside `useEffect` and start it with `onSiteReady()` from `@/lib/loading` (like `components/engine/Animations.tsx`). "Scrub" = `scrollTrigger: { scrub: true }` (tied to the scrollbar). "Once" = `scrollTrigger: { start: "top 80%", once: true }` (plays when it enters). Use `gsap.matchMedia()` for the phone fallback.

---

## A. Reveals (how a block or image arrives)

| Code | Name | Looks like | Use when | GSAP notes | Phone fallback |
|---|---|---|---|---|---|
| M1 | **Curtain reveal in mask** | A solid panel (accent or bg colour) slides off the image/heading, uncovering it, like a curtain pulled aside | Big editorial photos, section openers | Wrapper `overflow:hidden`; a child `::before`-like div animates `xPercent: 0 → 101` (or `yPercent`) while the image does `scale 1.15 → 1`. Once, `power4.inOut`, 1.2 s | Same, vertical direction only |
| M5 | **Circle / mask wipe** | The section appears through a growing circle (or arch, or diamond) from one point | Colour-band sections, a big "reveal" moment, loader exits | Animate `clip-path: circle(0% at 50% 50%) → circle(75% …)`; scrub over ~80vh or once 1.2 s. Any shape works: `inset()`, `polygon()`, an arch via `ellipse()` | Once, not scrubbed; start from the centre |
| M13 | **Image scale-down inside mask** | The photo starts zoomed in and settles to size inside a fixed frame while the frame opens slightly | Product and food close-ups, arch/rounded frames | Frame: `clip-path: inset(12% round 24px) → inset(0% round 24px)`; image: `scale 1.35 → 1`. Scrub from "top bottom" to "center center" | Scale only (1.2 → 1), no clip |
| M16 | **Blinds / slice reveal** | The image appears in 5–8 vertical (or horizontal) strips, one after another, like window blinds opening | Fashion, architecture, a bold "new collection" block | Render the image N times inside strips with `background-position` offsets (or use N masks); stagger `scaleY 0 → 1` from `transformOrigin: top`, stagger 0.06, once | 3 strips instead of 8 |
| M17 | **Pixel / grid dissolve** | A grid of small squares flips away in a wave, revealing the photo underneath | Tech, gaming, electronics | Absolutely positioned grid of ~12×8 cells over the image; `opacity`/`scale → 0` with `stagger: { grid: "auto", from: "start", amount: 0.8 }`, once | 6×4 cells |
| M18 | **Clip-path corner grow** | The block grows out from one corner like a sheet being unfolded | Cards that should feel "delivered", offer tiles | `clip-path: polygon()` from a tiny triangle at a corner to the full rectangle, `power3.out`, once, stagger 0.12 across tiles | Same, less stagger |
| M19 | **Focus pull (blur to sharp)** | Image starts soft and slightly dark, sharpens like a lens focusing. Hero version: a fogged window wiped clear in a curved sweep (a mask moving over a pre-blurred copy) | Moody photography, luxury, cafés, perfume, steamy/rainy windows | `filter: blur(14px) brightness(.7) → blur(0) brightness(1)` + tiny `scale 1.05 → 1`; scrub over 60vh. Keep blur ≤ 16px (performance) | Once, 0.8 s, blur 8px |

## B. Text (how headings and copy appear)

| Code | Name | Looks like | Use when | GSAP notes | Phone fallback |
|---|---|---|---|---|---|
| M6 | **Text rise from blur** | Words float up from below while going from blurred to sharp | Soft, premium headlines (beauty, café, hotel) | `<SplitText>` words: `y: 40, filter: blur(10px), opacity: 0 → 0, blur(0), 1`, stagger 0.06, `power2.out`, once | Whole line at once, no stagger |
| M12 | **Split text stagger (letters)** | Each letter pops up out of a mask one after another | Short, loud headings (sport, streetwear, big numbers) | Split into letters, each inside `overflow:hidden`; `yPercent: 110 → 0`, stagger 0.025, `power4.out`. Keep to ≤ 20 letters | Words instead of letters |
| M20 | **Scroll-lit statement** | A long sentence sits on screen in muted colour; words turn bright one by one as you scroll | Manifesto / "about us" statement | Words start at `opacity .2` (or muted colour); a scrubbed timeline brightens them in order across ~120vh; optional pin | Scrub still works; smaller type, no pin |
| M21 | **Typewriter / caret** | Text types itself letter by letter with a blinking caret | Search bars, tech, "today's special", chat-style reviews | Tween a counter and `slice()` the string on update (`gsap.to(obj,{n: text.length, ease: "none"})`), caret = CSS blink. Once | Same (short strings only) |
| M22 | **Scramble / decode** | Letters shuffle through random characters before landing on the real word | Tech, gaming, codes, prices that "compute" | **ScrambleText plugin** (`gsap.to(el, { scrambleText: { text, chars } })`, see `ScrambleLine`); was a custom tween. Once, 0.9 s | Same |
| M23 | **Line-by-line mask slide** | Each line of a paragraph slides up from its own hidden line box | Editorial body copy, pull quotes, recipes | Split by lines (wrap lines in spans at build time or measure), each in `overflow:hidden`; `yPercent: 100 → 0`, stagger 0.12. Once | Same, stagger 0.08 |
| M24 | **Outline to fill** | A huge outlined word fills with colour from bottom to top (or left to right) | Wordmarks, footers, big category names | Two stacked copies: outline (`-webkit-text-stroke`) + filled copy with `clip-path: inset(100% 0 0 0) → inset(0)`. Scrub | Same |
| M25 | **Kinetic scale word** | One big word grows from small to screen-filling (or shrinks into place) while the page scrolls | Transitions into a new chapter, "Sale", brand word | Pin ~100vh; `scale 0.2 → 1` (or `1 → 12` flying through the word into the next section). Scrub, `ease: none` | No pin, once, scale 0.6 → 1 |

## C. Numbers & data

| Code | Name | Looks like | Use when | GSAP notes | Phone fallback |
|---|---|---|---|---|---|
| M3 | **Number counter roll** | Digits roll vertically like an odometer/slot machine to the final number | Stats, prices, "since 1998" | Each digit is a column 0–9 in a mask; tween `yPercent` to `-digit*10`, stagger right-to-left. Once, 1.6 s. (Simpler: `data-count` counts, but the roll is the motion) | Same |
| M26 | **Progress fill** | Bars, rings or a liquid level fill to their value as you scroll | Specs, roast levels, ratings, brew timers | `scaleX`/`scaleY 0 → value` from origin, or SVG `stroke-dashoffset` for rings. Scrub (or once) | Once |

## D. Scroll-driven & pinned (the big moments)

| Code | Name | Looks like | Use when | GSAP notes | Phone fallback |
|---|---|---|---|---|---|
| M7 | **Multi-speed parallax** | 3–5 layers (photo, cut-out, text, shapes) move at different speeds, giving depth | Heroes, collages, "stay a while" scenes | `data-parallax` per layer with different values (0.05 → 0.35) or one scrubbed timeline moving layers by different `yPercent` | 2 layers, half the amounts |
| M10 | **Pinned background colour shift** | The section pins; the whole background (and text colour) changes step by step as content changes | Chapters, colourways, room lights, flavours | Pin; scrubbed timeline tweens CSS variables (`--bg`, `--fg`) on the section or `:root`. Keep text contrast at every step | Same colours, no pin: each block sets its colour on enter (`onEnter`) |
| M11 | **Horizontal pinned scroll** | The section pins and its content slides sideways as you scroll down | Product shelves, timelines, galleries | Pin; `x: -(track.scrollWidth - innerWidth)`, `scrub: 1`, `end: "+=" + distance`. Use `invalidateOnRefresh: true` | Native sideways swipe (`overflow-x: auto`, snap), no pin |
| M27 | **Frame-sequence scrub** | A video plays forwards/backwards with the scrollbar | Hero fly-throughs, product spins, pours, explodes | `FrameHero` / `FrameScrub` / `useFramePlayer` from the engine; pin for 200–400vh | Same frames, shorter pin (150vh) |
| M28 | **Grow to full screen** | A small framed image/video (window, arch, card) expands until it fills the screen | Mid-page "step inside" moments. **Never as the hero** (kit rule: no portal heroes) | Pin; tween the frame's `clip-path: inset()` / `border-radius` / width to full viewport, scrub. Content inside stays fixed (no stretch) | Starts wider (80vw), same growth |
| M29 | **Stacking cards** | Cards pin one after another; each new card slides over the last, which shrinks and darkens | Services, features, steps, menus | Each card `position: sticky` (or pin) with increasing `top`; scrub previous card `scale 1 → .92, filter: brightness(.7)` | Sticky still works; smaller offset |
| M30 | **Dial / rotate on scroll** | A dial, badge, plate or product rotates as you scroll, pointing at changing labels | Roast levels, sizes, watch bezels, "choose your…" | Scrub `rotation` on an SVG group; labels switch at set progress points (`onUpdate` with thresholds) | Same, smaller dial |
| M31 | **3D tilt-in from depth** | The block starts tilted back in 3D and swings upright as it enters | Big screenshots, product boards, menu cards | Parent `perspective: 1200px`; `rotationX: 35, y: 120, opacity: 0 → 0, 0, 1`, scrub from "top bottom" to "top 40%" | Flat rise, `rotationX: 12` |

## E. Groups & layout

| Code | Name | Looks like | Use when | GSAP notes | Phone fallback |
|---|---|---|---|---|---|
| M2 | **3D page flip** | Cards or pages turn over like a book or menu page | Menus, catalogues, before/after, recipes | `transformStyle: preserve-3d` on the card; `rotationY: -180 → 0` with `transformOrigin: left center`, back face `backface-visibility: hidden`. Scrub per page or once in sequence | Flip on the X axis (top to bottom), one card at a time |
| M4 | **Stack fan-out** | A tight stack of cards spreads out into a fan or a row | Product ranges, flavours, bags, colourways | Start all cards at the same `x/rotation`; tween to final `x`, `rotation: ±8`, stagger from centre. Scrub over 60vh or once | Stack spreads into a 2×2 grid |
| M32 | **Masonry drift** | Columns of a grid move at different speeds, some up some down, as you scroll | Photo walls, reviews, Instagram grids | Scrub each column `yPercent` with alternating signs (−10 / +10) | Single column, no drift, M23-style reveal per item |
| M33 | **Orbit / carousel ring** | Items circle around a centre (a product, a word) in a slow ring | Ingredients around a product, categories around a logo | Items placed with `rotation` on a parent + counter-rotation on each item; auto `repeat: -1` loop while on screen, or scrub | Ring becomes a slow marquee |
| M34 | **Snap-in tiles (bento assemble)** | Tiles fly in from different sides and lock into a bento grid | Offers, features, "why us" | Each tile `from` a different `x/y/rotation`; once, stagger 0.08, `power3.out`; final state is the plain grid | All tiles rise from below |

## F. Lines, paths & continuous

| Code | Name | Looks like | Use when | GSAP notes | Phone fallback |
|---|---|---|---|---|---|
| M8 | **SVG line draw-on** | A line, map route, signature or icon draws itself as you scroll | Maps, process steps, logos, footers | **DrawSVG plugin** (`gsap.fromTo(path, { drawSVG: "0%" }, { drawSVG: "100%", scrub: true })`, see `DrawRings`); was dasharray/dashoffset by hand | Same |
| M9 | **Print-out line by line** | A receipt, ticket or list feeds out downwards, one line at a time, like a printer | Reviews as receipts, orders, specs, menus | Container `clip-path: inset(0 0 100% 0) → inset(0)` stepped with `ease: "steps(N)"`, or lines stagger with tiny `y` + a paper `translateY` feed. Once | Same, fewer lines |
| M14 | **Marquee strip** | An endless strip of words or images slides sideways; scrolling speeds it up or reverses it | Offer tickers, flavour lists, brand values | Pattern `Marquee` / `Ticker`; add `ScrollTrigger` `onUpdate` velocity → `timeScale` for speed-up | Same, slower |
| M35 | **Path-follow object** | An object (a bean, a leaf, a car) travels along a curved path down the page | Linking sections, "the journey" stories | Needs `MotionPathPlugin` (register in the component, not `lib/`); scrub along an SVG path | Hide the object, draw the path only (M8) |

## G. Ambient (always-on life)

| Code | Name | Looks like | Use when | GSAP notes | Phone fallback |
|---|---|---|---|---|---|
| M15 | **Glow / ember particles** | Soft glowing dots drift upward and fade (embers, dust, bubbles, snow) | Warm, magical or night scenes; footers | `<canvas>` with ~40–80 particles and `requestAnimationFrame`, paused when off screen (`IntersectionObserver`) | 20 particles |
| M36 | **Steam / smoke wisps** | Thin curling wisps rise and dissolve above an object | Coffee, tea, food, incense | SVG paths with `feTurbulence` or CSS blurred strokes; loop `y` + `opacity` + `scaleX` with random delays | Same, 2 wisps |
| M37 | **Breathing light / glow pulse** | A soft light behind a product or word slowly brightens and dims | Luxury products, CTAs, "open now" signs | Radial-gradient layer; `opacity`/`scale` yoyo loop, 3–4 s, `sine.inOut` | Same |

## J. New motions M38+ (live at `/lab`, components in `components/fx/`)

Every one is built so a `?record=1` run at 1440×900 has **zero frozen frames** (`/lab` passes freezedetect + frame-diff). Rules they follow (copy them for new effects): a scrubbed effect uses the **whole** scroll range linearly and finishes exactly at the end (no flat start/end, no early finish), and keeps a time-based life (drift, shimmer, noise) because a sticky stage itself does not move. Cost: **low** = transforms/CSS · **med** = canvas 2D / many elements / blur · **high** = WebGL full screen.

| Code | Name | How it works (1 line) | Plugin / library | Record mode (never frozen) | Phone | Cost |
|---|---|---|---|---|---|---|
| M38 | **Liquid image reveal** | the photo flows in through a noisy, wobbling edge with a glowing rim; slow zoom 1.15 → 1 | OGL shader (`LiquidReveal`) | scrub over the whole pin + noise moves with time | same, 1 picture | high |
| M39 | **Text on a moving curved path** | a line of text runs along an SVG curve that breathes; the text slides with time + scroll | SVG textPath + GSAP ticker (`CurvedPathText`) | always sliding (time) | the curve is drawn wider than the screen so words stay big | low |
| M40 | **Sticky stacking cards** | each card slides over the last; covered cards shrink back and dim | ScrollTrigger scrub (`StackCards`) | scrub, cards always moving | same, 3 cards | low |
| M41 | **Pinned horizontal gallery + speed skew** | vertical scroll moves a row sideways; scroll speed skews the cards | ScrollTrigger velocity + ticker (`SkewGallery`) | scrub; skew eases back | cards 70vw | med |
| M42 | **Split screen, opposite scroll** | two image columns travel in opposite directions while pinned | ScrollTrigger scrub (`SplitOpposite`) | scrub | same (2 narrow columns) | low |
| M43 | **Pixelated → sharp** | the image redraws from big pixels to sharp, continuously, with a slow zoom (after Codrops ImagePixelLoading) | canvas 2D (`Pixelate`) | continuous scrub (not stepped) | same | med |
| M44 | **Marquee that bends with scroll speed** | an endless word row; faster scroll = deeper arc and tilt | GSAP ticker + ScrollTrigger velocity (`BendMarquee`) | always drifting + idle wave | smaller type | low |
| M45 | **Particle text** | canvas dots fly in from a cloud and form the word; they keep shimmering | canvas 2D (`ParticleText`) | scrub + shimmer | bigger dots (auto) | med |
| M46 | **Scroll before/after slider** | a divider sweeps across revealing the "after" image | clip-path scrub (`BeforeAfter`) | scrub + drift | same | low |
| M47 | **Exploded product view** | product layers pull apart in depth; callout lines draw on | transforms + DrawSVG (`Exploded`) | scrub + drift | callouts shorter | low |
| M48 | **Odometer roll, full spin** | each digit column spins a full 0–9 cycle to its value; replays on re-entry. Upgraded M3: use M3 **or** M48, never both | GSAP (`Odometer`) | plays on enter (1.4–2 s) | same | low |
| M49 | **Light sweep / shine** | a bright band sweeps the type (or a card) on a loop, faster while scrolling | background-clip text + ticker (`ShineText`) | always looping | same | low |
| M50 | **Rack focus** | background sharpens while the foreground softens, like a lens pulling focus. Different from M19 (one layer blur → sharp) | CSS filter scrub (`RackFocus`) | scrub + drift | blur ≤ 8px | med |
| M51 | **3D card tilt-rotate** | the card tilts toward the pointer with a moving glare; hands-free a slow figure-eight | GSAP ticker (`TiltCard3D`) | figure-eight in record mode | figure-eight always | low |
| M52 | **Animated gradient mesh** | soft colour fields drift and blend forever (section background) | OGL shader + CSS fallback (`GradientMesh`) | time-based | dpr 1 | high |
| M53 | **SVG shape morph** | a badge/shape melts circle → diamond → star → square with the scroll, slowly turning | MorphSVG (on demand) (`MorphShape`) | scrub + rotation | same | low |
| M54 | **Flip layout morph (grid → detail)** | a grid tile grows into the detail view and back; plays by itself every ~1 s | Flip (on demand) (`FlipGrid`) | auto-plays while on screen | 2-column grid | med |
| M55 | **WebGL RGB shift on scroll speed** | red/blue channels split along the scroll direction, faster = wider (three.js RGBShift idea) | OGL (`RGBShift`) | idle shimmer + scroll speed | same | high |
| M56 | **WebGL zoom-blur transition** | image A rushes into image B through a radial blur (glfx zoomblur / gl-transitions CrossZoom) | OGL (`ZoomBlur`) | scrub | same | high |
| M57 | **Scroll blur typography** | letters come into focus left → right with the scroll (after Codrops ScrollBlurTypography) | SplitText + scrub (`ScrollBlurText`) | scrub | same | med |
| M58 | **Type shuffle** | each letter flickers through glyphs on a colour cell, then settles; loops (after Codrops TypeShuffle) | SplitText + GSAP (`TypeShuffle`) | loops while on screen | same | low |
| M59 | **Liquid morphing words** | words melt into each other through a gooey threshold filter (after Magic UI morphing-text) | SVG filter + ticker (`MorphingWords`) | cycles by itself | same | med |
| M60 | **Flickering grid background** | a canvas of small squares twinkles (after Magic UI flickering-grid) | canvas 2D (`FlickeringGrid`) | always twinkling (pauses off screen) | same | low |
| M61 | **Light rays background** | soft blurred beams from the top sway and breathe (after Magic UI light-rays) | CSS + GSAP (`LightRays`) | looping | 4 rays | med |
| M62 | **Double-image clip reveal** | a colour panel and the image unfold with clip-path while the image counter-scales (after Codrops DoubleImageHover / UnrevealEffects) | GSAP clip-path (`ClipDouble`) | plays on enter / re-entry | same | low |
| M63 | **Rapid layers intro** | colour/photo layers wipe in fast one after another, ending on the title (after Codrops RapidLayers); also loader I7 | GSAP clip-path (`RapidLayers`) | plays once (demo loops) | same | low |
| M64 | **Shimmer border button** | a light spark runs round the button's border forever (after Magic UI shimmer-button) | CSS conic gradient (`ShimmerButton`) | always running | same | low |
| M65 | **Gooey cursor trail** | cells light under the pointer and melt together through a goo filter (after Codrops GooeyCursor) | SVG filter + ticker (`GooeyCursor`) | scripted figure-eight in record mode | scripted path | med |
| M66 | **Displacement-map swap** | images melt into each other through a noise map, cycling A → B → C by itself (after robin-dela/hover-effect) | OGL (`DisplaceSwap`) | time-based cycle | same | high |
| M67 | **Flowmap liquid trail** | the pointer (or a scripted path) drags the picture like liquid; the trail settles (after curtains.js flowmap) | OGL Flowmap (`Flowmap`) | scripted path | scripted path | high |
| M68 | **Scroll bulge** | the picture bulges/pinches with scroll speed (after curtains.js scroll effect) | OGL (`ScrollBulge`) | idle wobble + scroll speed | same | high |
| M69 | **Ripple** | water rings spread from the centre on a loop (gl-transitions ripple idea) | OGL (`Ripple`) | looping | same | high |
| M70 | **Film grain + vignette** | moving grain and a softly breathing light over a picture (three.js FilmShader idea) | OGL (`FilmGrain`) | always moving | same | high |
| M71 | **Magnetic button + text parallax** | the button leans toward the pointer, its label leans further; hands-free a slow orbit (after Codrops MagneticButtons) | GSAP ticker (`MagneticButton`) | orbit in record mode | orbit | low |
| M72 | **Glacial-then-sudden pin** | a long pin (280–350vh): the first 60% is slow linear atmospheric drift, the last 40% a payoff reveal on `power2.out` | ScrollTrigger scrub | drift never stops | pin 200vh | low |
| M73 | **Velocity-skew type** | each character skews and lifts with damped scroll speed (cap ~6° skew, ~0.18em lift), one rAF writer | SplitText + ticker | idle wave + scroll speed | words, not chars | med |
| M74 | **Thrown curved path (CSS)** | separate typed `@property --x / --y` keyframes give curved, thrown paths in pure CSS (no JS), e.g. a logo or sticker flying in on an arc | CSS `@property` | loops while on screen | same | low |

## K. Travelling / floating object (F1–F8)

(Your brief proposed calling this "M57 travelling object"; M57 is already scroll blur typography, so these use their own F codes.) One code per site for the carrier (F1/F3/F6, or F2/F4/F5), plus F7/F8 freely. Components: `components/fx/travel/` (driver `useTravel.ts`, page `TravelPage.tsx`). Demo: `/lab/travel/<f1|f3|f3t|f3r|f6>`; all pass `?record=1` at 1440 (freezedetect + frame-diff) and 360/390 screenshots.

**Rules for all:** the object never covers text (text sits on the opposite side of its anchor; text is above the object layer) · a soft shadow + glow follows it (`ShadowGlow`) · an idle float (bob + sway) so it is never frozen · phones: anchors sit above the text (simple up/down path), the object stays fully visible at 360×640 and 390×844 · 3D is lazy (`next/dynamic`, ssr:false) with the PNG version as fallback (no WebGL, or < 25 fps at start) · renders only while near the screen · GLB ≤ 3 MB (`npm run glb`) · 3D code ≤ +150 KB gzip (only OGL fits) · first screen + last screen have CSS/ambient motion (the 3D model takes a moment to load; the reel rests at the end).

| Code | Name | How it works | Plugin / library | Record mode (never frozen) | Phone | Cost |
|---|---|---|---|---|---|---|
| F1 | **Waypoint travel** | each section has an invisible anchor (`data-anchor`, `data-rot/turn/tilt/spin`); the driver measures them and tweens one state between them (rest while a section is centred, fly between) — Codrops OneElementScroll idea; PNG angles crossfade by `turn` | GSAP timeline (time = scroll) · `ObjectPNG` | scroll + idle float | anchors above text | low |
| F2 | **Pinned 3D turn** | same driver; the anchor stays put while `data-spin` adds full turns and `data-tilt` tilts | OGL (`Object3DOGL`) | turn follows scroll + idle | same, smaller model | med |
| F3 | **3D travel** | the driver's state is applied to a .glb every frame (tween a params object → apply in the render loop) | **OGL +40 KB** (`Object3DOGL`, own lit shader) · compare: three.js +203 KB (`Object3DLite`), R3F +261 KB (`Object3D`) | scroll + idle | up/down path | med–high |
| F4 | **Camera fly-through** | a GSAP timeline moves the camera along a curve (e.g. CatmullRom points) around/into the model; scrub | OGL/three + GSAP (not Theatre: stalled, AGPL studio) | scrub + slow idle drift | shorter path | high |
| F5 | **Fold / assemble** | parts (layered PNGs or a multi-part model) are tweened from apart to together; pivots on hinge edges (Codrops folding box idea) | GSAP (+ OGL for 3D parts) | scrub + idle | fewer parts | med |
| F6 | **Simple 3D orbit** | `<model-viewer>` placed on the anchor box; `camera-orbit` = turn/tilt each frame | @google/model-viewer (Apache-2.0, +336 KB) · `ObjectModelViewer` | orbit follows scroll + idle | same | high |
| F7 | **Floating ingredients** | 5–12 cut-outs at 3 depths (size, blur, parallax) around the product; idle bob + scroll parallax | GSAP ticker · `FloatingIngredients` | always bobbing | 6 items | low |
| F8 | **Land in UI** | Add to cart: a copy of the product flies (Flip.fit, with an up-arc) into the cart pill, the count bumps; record mode adds once by itself | Flip (on demand) · in `TravelPage` | plays once on camera | same | low |

## H. Section transitions (Round 3)

A transition is how one section hands over to the next. Pick one per boundary; these may repeat (they are not section codes), but vary them.

| Code | Name | Looks like | GSAP notes |
|---|---|---|---|
| X1 | **Overlap slide** | The next section slides up over the last, which stays pinned and dims | Pin outgoing (`pinSpacing: false`), next has higher `z-index`; scrub outgoing `brightness .6` |
| X2 | **Colour wash** | The page background tweens to the next section's colour before its content arrives | Scrub `--bg` between the two sections' colours |
| X3 | **Edge shape morph** | The dividing edge (wave, torn paper, arch) stretches or flattens as it passes | Scrub the edge SVG path (`attr: { d }`) or `scaleY` |
| X4 | **Zoom-through** | The last element of a section scales up and becomes the next section's background | Scrub `scale` of the element to cover the screen, cross-fade to the next background |
| X5 | **Hard cut on beat** | No tween: the next section is already in place, and its first element starts moving right at the edge | Just careful `start` positions; good after a long pinned moment |

**New transitions (live at `/lab`, `components/fx/more.tsx` + `gl.tsx`).** Each: how it works · plugin/library · record mode · phone · cost.

| Code | Name | How it works | Plugin / library | Record mode (never frozen) | Phone | Cost |
|---|---|---|---|---|---|---|
| X6 | **Circle iris** | the next scene opens through a circle from the centre, reaching the corners exactly at the end; both scenes zoom slowly | clip-path scrub (`IrisTransition`) | scrub + scene zoom | same | low |
| X7 | **Diagonal wipe** | a slanted edge sweeps across leaving the next scene | clip-path polygon scrub (`DiagonalWipe`) | scrub + scene zoom | same | low |
| X8 | **Pixel dissolve** | scene A breaks into growing squares, B resolves from them (gl-transitions pixelize) | OGL (`PixelDissolve`); DOM version = M17 grid | scrub | same | high |
| X9 | **RGB glitch cut** | crossing the middle, the frame tears into RGB-split slices for 0.45 s and cuts to B; a slow zoom runs throughout | CSS filters + ticker (`GlitchCut`) | scrub zoom + scanline + burst | same | med |
| X10 | **Zoom into a window** | a small window in A grows while A rushes past the camera, until B fills the screen. Mid-page only (never the hero) | clip-path + scale scrub (`PortalZoom`) | scrub | same | low |
| X11 | **Shader liquid wipe** | B pours over A along a diagonal whose edge ripples like liquid | OGL (`LiquidWipe`) | scrub + noise in time | same | high |
| X12 | **Fade through black** | fade out to black, hold ~20vh of darkness, fade the next chapter up (`power2.inOut`); a CSS light or grain keeps the black alive on camera | GSAP scrub | hold has ambient life | same | low |
| X13 | **Inversion cut** | the next section opens as the photographic negative of the last (warm→cold, light→dark), with `rotateX(2deg)` settling over the first 20% | CSS filter + scrub | scrub | no rotate | low |
| X14 | **Atmospheric bleed** | a haze overlay rises 0→1 over 40vh, holds 20vh, clears onto the next world; no hard edges | gradient/blur layer scrub (or OGL fog) | scrub + drifting haze | same | med |
| X15 | **Vignette spotlight** | the edges darken inward over 30vh to spotlight the next image, then the vignette resets | radial-gradient scrub | scrub | same | low |
| X16 | **Cut-and-stamp** | a hard cut + a 1–2px positional jolt that settles at once, like a press closing (`expo.inOut`) | GSAP | plays on crossing | same | low |
| X17 | **Lock-on reticle wipe** | the next frame draws in like a targeting reticle; the accent traces the new boundary (DrawSVG) | DrawSVG + clip-path | scrub | same | low |
| X18 | **Stamp-pop dissolve** | a 15vh crossfade while a foreground stamp/shape pops 1 → 1.05 → 1 | GSAP scrub + once | scrub | same | low |

## I. Details (Round 4)

Micro-interactions are not section codes; list the ones used under the Motion map. Ideas: magnetic buttons (`components/ui/Magnetic`), cursor label (`data-cursor`), image tilt (`TiltCard`), link underline draw, button fill wipe, price flip on hover, "added to bag" count bump, nav item sliding pill, hover image preview that follows the cursor. **Each one also needs a hands-free version** (plays by itself once while on screen) so it shows up when filming.

---

## Motion map (copy into `site/DESIGN.md`)

```
## Motion map

| # | Section | Motion | How it plays here | Phone | Record mode |
|---|---|---|---|---|---|
| 0 | Loader | M5 circle wipe | cup rim grows into the page | same | fixed 2.5 s |
| 1 | Nav | M9 print-out | menu links feed out line by line when opened | same | not shown |
| 2 | Hero | M19 focus pull | fogged window wiped clear, then the video scrubs | lighter blur | scrub |
| … | | | | | |

Transitions: 2→3 X2 colour wash · 3→4 X3 torn edge stretches · …
Details: magnetic Menu button · copper underline draw on links · …
```

Checklist before approving: every section has a code · no code appears twice · no section is "fade in" · the hero and signature repeat no earlier site's (every row of the sites log) · the hero is not a shape growing to full screen.
