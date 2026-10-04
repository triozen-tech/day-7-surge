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


## L. Motion library (M75+ · X19+ · I11+ · U01+, live at `/lab/motion`)

Grown from open animation libraries and award sites (log: `docs/MOTION-LOG.md`; licences: `docs/SOURCES.md`). Only exact duplicates were skipped, so variants of older codes appear as their own codes (see the last column). Every code is a small live demo at `/lab/motion/<group>`; all built in GSAP, no code copied.

### L·reveal · Reveals

| Code | Motion | What moves | Trigger | Stack | Best for | Avoid with | Variant of |
|---|---|---|---|---|---|---|---|
| M75 | **Product rises from behind a horizon** | A product cut-out slides up (yPercent 100→0) from behind a hard colour-band edge while a soft shadow grows on the "table". | scrub | gsap | Drinks, skincare, food packs: hero or product intro | Busy full-bleed photo backgrounds (no clear horizon) | M1 |
| M76 | **Product rises in front of giant type** | The product rises and turns in front of a huge word that scales up more slowly, partly covering the letters for depth. | scrub | gsap | Single-hero products (cans, bottles, sneakers): hero, launch | Long headlines; small or many products | M25 |
| M77 | **Image seen through the headline** | A photo shows only through the letters of an SVG text mask, then the word scales away and the full photo fades in with parallax. | scrub | gsap/svg | Travel, hospitality, fashion: hero or chapter opener | Thin or serif-light fonts (too little image shows) | M24 |
| M78 | **Letterbox band opens** | A full-bleed image clipped to a thin horizontal band opens to the full frame while the image inside settles from 1.15 to 1. | scrub | gsap/css | Restaurants, film-like brands, interiors: story or atmosphere section | Next to another clip-path opener | M18 |
| M79 | **Full-bleed hero shrinks into its frame** | The full-bleed hero shrinks (clip-path inset + radius) into a rounded image in the layout while the page copy arrives around it. | scrub | gsap/css | Fashion, homeware, real estate: hero into intro | Portal/arch "grows to full screen" openings on the same page | M13 |
| M80 | **Zoom-out reveals the gallery** | One full-frame image scales down into the middle tile of a 3×3 gallery while the other tiles fade and slide in around it. | scrub | gsap | Travel, collections, portfolios: gallery or lookbook | Few images (needs 8+ tiles) | M28 |
| M81 | **Media opens between two words** | A small image window grows from zero width inside a headline and pushes the two words apart (expo.out), then closes, looping. | auto | gsap | Crafts, studios, food: section intros, manifesto lines | Headlines longer than ~3 words | M28 |
| M82 | **Block reveal (two-phase box wipe)** | A colour block grows across the image and text from one edge, the content changes underneath, and it shrinks away to the opposite edge; the four directions cycle. | auto | gsap | Fashion, editorial, agencies: product cards, headings | Soft, slow, organic brands | M1 |
| M83 | **Paper-tear headline reveal** | A crack draws down a big word, the paper rips along a jagged SVG clip into two halves that pull apart and tilt over a rising image. | scrub | svg/gsap (DrawSVG) | Outdoor, streetwear, launches: hero or drop reveal | Luxury/calm brands; small type | M62 |
| M84 | **Folded flyer unfolds** | A tri-fold menu opens its side panels on their hinges in 3D (rotateY 180→0) one after another, with shading on the moving panel. | auto | gsap/css 3D | Restaurants, cafes, events: menu or programme section | Dense text panels (keep 3 items per panel) | M2 |
| M85 | **Sticky text with clip-path image steps** | Each step's image opens with an inset clip-path while the sticky heading swaps to that step and a tick icon draws in. | scrub | gsap (DrawSVG) | Subscriptions, services, how-it-works | More than 4 steps | M18 |
| M86 | **Pinned list with cross-swapping visual** | A list highlights one item at a time (with a filling line) and the visual on the right swaps: old slides up out, new slides up in. | scrub | gsap | Travel, agencies, services, categories | Very short lists (under 3 items) | M29 |
| M87 | **Images pass a fixed title** | A centred title stays fixed while image columns scroll past at their own data-speed, two columns crossing over it. | scrub | gsap | Editorial / lookbook / studio intros, gallery heroes | Busy titles or long copy; another parallax section next to it | M7 |
| M88 | **Stacking cards tilt back in 3D** | Cards slide up and stack; each covered card tilts back (rotateX -10deg) and recedes in Z, so the stack reads as a 3D pile. | scrub | gsap | Services, process steps, feature cards (studios, SaaS, D2C) | Image-heavy cards that need full legibility when covered; flat minimal looks | M40 |
| M89 | **Batched viewport stagger** | ScrollTrigger.batch groups cards that enter in the same tick and staggers each group in (y 60, scale .9 to 1, 0.08 s). | scroll | gsap | Product grids, shop listings, journal feeds | Pinned sections; very small grids (use a plain stagger) | M34 |

### L·text · Text effects

| Code | Motion | What moves | Trigger | Stack | Best for | Avoid with | Variant of |
|---|---|---|---|---|---|---|---|
| M90 | **Dual curtain text wipe** | Two coloured blocks sweep across a heading in sequence (second ~0.15 s behind) and unveil the text behind them. | load/scroll | gsap | Bold fashion / streetwear / launch headlines, section openers | Soft calm brands; long multi-line paragraphs | M104 |
| M91 | **Layout-pushing word flip** | A swapped word slides out up / in from below while the static words glide sideways (Flip) to fit its new width. | auto | gsap/Flip | Hero taglines, value statements, SaaS / agency heroes | Words of near-equal width (no visible push); centred multi-line text that rewraps | M106 |
| M92 | **Mask-filled heading, word wipe** | A moving image lives inside the letters and each word is painted in by a left-to-right clip-path wipe in sequence. | scroll | gsap/SplitText/css | Colourful brands, beauty, drinks, art and festival heroes | Thin fonts (image unreadable); a second image-in-text heading | M119 |
| M93 | **Paper-fold from bottom hinge (words)** | Words swing up from a bottom hinge (rotateX 92 to 0) like paper flaps lifting off a table, staggered 0.06 s. | scroll | gsap/SplitText | Stationery, print, crafts, editorial headings | Tiny text; a top-hinge fold on the same page | M122 |
| M94 | **Scroll-scrubbed letter swap** | Each letter rolls vertically from word A to word B inside a clipped cell, staggered and tied directly to scroll. | scrub | gsap/SplitText | Two-mood products, before/after, day/night collections | Words of different length; hover letter rolls nearby | U33 |
| M95 | **Short slide-down stack** | Each new line drops in from above and pushes the stack down (Flip) until a centred three-line composition locks. | auto | gsap/Flip | Manifestos, three-beat taglines (coffee, food, craft) | Long lines; more than 3-4 beats | M113 |
| M96 | **Word pull-up** | Words rise 8-20px from below with a fade, no mask, in a calm keynote stagger. | scroll | gsap/SplitText | Tech / audio / premium product statements, keynote-style sections | Loud brands needing impact; stacked with other word reveals | M124 |
| M97 | **3D rotating phrase swap** | A word cycles every ~2 s: its chars rotate up and out, new chars rise in (stagger from first / last / centre) and the pill resizes. | auto | gsap/SplitText | Hero sentences, use-case lines, cafes and lifestyle brands | Several rotators on one page; very long options | M23 |
| M98 | **Blur-in characters, no travel** | Each letter condenses in place from blur(10px) and opacity 0, staggered 0.03 s left to right. | scroll | gsap/SplitText | Dreamy, fragrance, wellness, skincare headings | Many lines at once (blur filter cost); hard-edged sporty brands | M6 |
| M99 | **Bottom-up letters staircase** | Letters rise from far below the baseline (or drop from far above) in a pronounced staircase, each starting once the previous is under way, crisp with no mask or blur | load (plays on view, loops) | gsap/SplitText | Loud short headings: bakery, streetwear, sport, sale banners | Long sentences, quiet luxury | M12 (no mask, long travel, slow stagger, two directions) |
| M100 | **Box reveal wipe** | A solid accent box covers heading, subhead and button in turn, then slides off right while each text rises ~75px into place | load (plays on view, loops) | gsap | Collection openers, launch heroes, fashion and homeware | Busy photo backgrounds, many lines | M1 (box per text block in sequence, text rises underneath) |
| M101 | **Char flip-up** | Characters flip up from edge-on (rotateX 90 to 0, 10px low) with a 0.05 s stagger, line chained after line | load (plays on view, loops) | gsap/SplitText | Juice, café, product-name reveals, menus | Thin serif type, very long lines | M12 (3D hinge flip instead of a masked slide) |
| M102 | **Chars stretch down from above** | Chars start pushed below and stretched tall (scaleY 2.3, scaleX 0.7, top origin) and spring back into shape one by one with back.inOut | scrub | gsap/SplitText | Sport, sneakers, bold section titles | Body copy, delicate brands | M12 (squash-and-stretch, scrubbed) |
| M103 | **Circular text ring** | A seal of letters laid round a circle spins every 10 s round a price badge; hover (an auto pointer on camera) speeds it up and scales it | auto + hover | css/gsap | Fresh-daily stamps, badges, bakery, coffee, CTA seals | Long text, more than one ring per screen | M39 (closed ring badge, no curve or scroll) |
| M104 | **Colour block line wipe** | A solid colour block wipes across each line from the left, then off to the right leaving the text, lines staggered 0.12 s | load (plays on view, loops) | gsap | Editorial headings, fashion, homeware, pull quotes | Dark accent on dark bg, long paragraphs | M23 (a colour block per line instead of a mask slide) |
| M105 | **Echo-trail entrance** | 5 blurred, tinted ghost copies slide in with growing lag and collapse into the one solid word (right, up or diagonal) | load (plays on view, loops) | gsap | Nightlife, music, coffee, energy drinks, single-word heroes | Calm wellness, multi-line text | M6 (ghost trail and direction instead of a soft rise) |
| M106 | **Flip words** | Every ~2 s the highlighted word exits up with blur and scale, the next types in letter by letter (y 10, blur 8, 0.05 s stagger) and the slot resizes | auto (cycles) | gsap/SplitText | Taglines with a changing benefit: skincare, SaaS, services | Many words, long rotating words | M59 (blur-exit plus letter entrance instead of a gooey melt) |
| M107 | **Focus-blur resolve** | The whole headline pulls from heavy blur and slight scale-up into focus in ~1 s, holds, then exits with a soft blur-out | load (plays on view, loops) | gsap/css | Luxury food, perfume, hotel, quiet hero statements | Several blurred layers on one screen (cost) | M50 (one headline in and out of focus, not a two-layer rack) |
| M108 | **Focus-in with tracking** | Text sharpens from blur(12px) while its letter-spacing contracts from wide (from depth), or expands from tight, to normal | load (plays on view, loops) | gsap | Uppercase wordmarks, retreats, fashion, premium openers | Lowercase body text, long lines | M6 (whole line with tracking change and depth, no rise) |
| M109 | **Hand-drawn marker annotation** | Rough marker strokes draw twice with jitter round key words: underline, circle, highlight, box and strike-through | load (plays on view, loops) | svg/DrawSVG/gsap | Offers, prices, benefits, editorial copy, cafés | Very formal or luxury brands, too many marks | M8 (rough doubled stroke round words, not one clean line) |
| M110 | **Handwriting draw** | A script word made of single-line SVG strokes writes itself letter by letter (DrawSVG per path), then a soft glow fills in | load (plays on view, loops) | svg/DrawSVG/gsap | Stationery, bakery, wedding, welcome and signature moments | Real fonts as outlines (needs single-stroke paths) | M8 (letters written in order like a pen) |
| M111 | **Headline splits in half** | A big headline cut into top/bottom clipped copies slides apart (up/down, then top-left/bottom-right) to open a gap where the next content scales in. | scrub | gsap | Event/expo launches, campaign heroes, section hand-offs | Long or multi-line headlines, busy photo backgrounds | M23 |
| M112 | **Inline image text reveal** | A statement lights up word by word on scroll while small inline photo pills grow from width 0 to pill size as the reveal reaches them. | scrub | gsap | Coffee, food, craft and travel "about us" statements | Long body copy, brands without good small imagery | M20 |
| M113 | **Kinetic centre build** | Each new word blurs in from the right and pushes the earlier words left (Flip) so the growing line stays centred, then an accent underline locks the phrase. | auto | gsap+Flip | Keynote-style launch lines, sport, tech, taglines (≤ 6 words) | Long sentences that wrap, several moving things on screen | M12 |
| M114 | **Letter roll-up on hover** | Each letter of a link slides away while an accent duplicate rolls in from below (or drops in from above), staggered 0.02 s; a fake pointer plays it by itself. | hover/auto | gsap | Nav links, menu items, CTA labels for fashion, studio, streetwear | Body text, very long labels | M12 |
| M115 | **Letter scroll reveal** | A statement brightens letter by letter (opacity + muted → white + small lift) scrubbed to scroll. | scrub | gsap+SplitText | Perfume, luxury, manifesto lines | Long paragraphs (too many letters), small type | M20 |
| M116 | **Line-by-line slide-left** | Each line of a paragraph slides 40px in from the side while fading (no mask), staggered 0.1 s, then exits to the opposite side; left then right. | auto | gsap+SplitText | Editorial product copy, fashion/linen, story blocks | Headlines, masked-reveal sections nearby | M23 |
| M117 | **Marker highlight sweep** | A yellow highlighter bar scales in behind chosen words word by word, cycling from left, right, top and bottom. | auto | gsap | Food/drink claims, benefits, offers and key numbers | Dark-on-dark palettes, highlighting more than 3–4 words | M20 |
| M118 | **Marker highlight sweeps words** | A highlighter (background-size 0 → 100%) sweeps behind every word of a paragraph in reading order as you scroll. | scrub | gsap | Skincare, wellness, "why us" paragraphs | Headlines, serif hairline fonts on low contrast | M20 |
| M119 | **Mask-filled heading, word rise** | Words of a huge heading filled with a photo/colour mesh (1.25× scale, drifting) rise out of line masks, staggered 0.08 s, while the fill keeps drifting. | auto | gsap+css | Travel, outdoor, fashion heroes, campaign titles | Thin fonts (fill unreadable), busy backgrounds | M23 |
| M120 | **One word in a sentence changes** | In a pinned sentence one keyword slides up and out at each scroll step and the next slides in, the slot width and line re-centring with it. | scrub | gsap | Coffee, services, "made for …" positioning lines | Many options (> 6), long keywords | M23 |
| M121 | **Panning image inside type** | A photo pans and scales inside a giant word (background-clip text) over an outline copy and crossfades to the next photo every 3 s. | auto | css | Books, travel, outdoor, wordmark sections | Narrow fonts, small words, low-contrast photos | M24 |
| M122 | **Paper-fold line unfold (top hinge)** | Each line swings down flat from a top hinge (rotateX -92° → 0), staggered, with a crease shadow that fades as it opens. | auto | gsap | Restaurant menus, editorial, invitations, events | Scroll-tilt (M31) sections nearby, very long lines | M31 |
| M123 | **Per-char fade-in-blur rise** | Each letter rises 20px while clearing blur(12px) and fading in, 0.04 s stagger, ~0.3 s per letter: a fine Apple-like build. | load / auto (on enter) | gsap/SplitText | Premium tech, audio, beauty hero titles and product names | Long paragraphs, heavy display faces (blur on many chars is costly) | M6 |
| M124 | **Per-character slide-up (unmasked)** | Letters travel ~20px with opacity and no clip mask, staggered 0.03 s, visible while moving; direction from below or from above. | auto (on enter) | gsap/SplitText | Food, lifestyle, friendly brands; section titles | Hard-edged masked layouts that expect a clean baseline cut | M12 |
| M125 | **Per-line slide-up (no mask)** | Whole lines rise 20px and fade in one after another with no mask, each line visible while travelling. | auto (on enter) | gsap/SplitText | Editorial intros, crafts, about/story paragraphs | Single-line headlines (no stagger to show) | M23 |
| M126 | **Per-word blur dissolve-in** | Words clear from opacity 0 + blur(12px) to sharp in place with no movement; on exit they re-blur in reverse order. | auto (on enter) | gsap/SplitText | Calm premium: wellness, lighting, skincare quotes and taglines | Energetic sports/streetwear; busy image backgrounds | M6 |
| M127 | **Rainbow sweep settling to ink** | A multi-colour band sweeps once across the headline while it fades in, and behind the band the letters settle to ink. | auto (on enter) | css | Colourful launches, design studios, kids/creative brands | Muted luxury palettes; one-accent strict sites | M49 |
| M128 | **Rolling drum text** | Letters sit on a virtual cylinder behind the text and roll over it in a stagger, the next word coming up from below like a split-flap barrel. | auto (on enter) | gsap/SplitText | Night-life, food, events, bold uppercase labels and CTAs | Long sentences; thin serifs (edges look flat when tipped) | M12 |
| M129 | **Rotated line reveal** | Masked lines enter from yPercent 150 with rotate 15deg to flat (expo.out 1.2 s, 0.04 s stagger) and leave to yPercent -150 with rotate -5deg. | auto (on enter) | gsap/SplitText | Architecture, interiors, fashion editorial headlines | Centred short words (rotation reads weak) | M23 |
| M130 | **Rotating word slot** | One word in a headline swaps through a list: its letters drop out, the next word's letters rise in, and the slot width animates to fit. | auto (timed loop) | gsap/SplitText | Coffee, travel, SaaS-ish "made for ___" heroes | Several moving elements nearby; serious/legal tone | M58 |
| M131 | **Scroll reveal with tilt + blur** | A paragraph rotates from 3deg (left origin) to flat while each word goes from opacity 0.1 + blur(4px) to sharp in order. | scrub | gsap/SplitText | Brand story / manifesto paragraphs, tea, craft, sustainability | Short headlines; pinned sections already scrubbing something else | M20 |
| M132 | **Sliced text glass effect** | Horizontal clipped slices of a headline start offset and slightly rotated and converge into one crisp line, like glass panes aligning. | scrub | gsap/css | Glassware, water, tech, architecture wordmarks | Long multi-line text; small font sizes | M16 |
| M133 | **Sliding digits** | Each digit is a 0-9 column clipped to one row; when the value changes only the changed digits spring up or down, separators stay. | auto (value change) | gsap | Prices, live configurators, stats, counters in shop cards | Big count-up-from-zero moments (use a counter) | M48 |
| M134 | **Smooth typewriter (clip sweep)** | A linear clip-path sweep reveals the whole line left to right in ~2 s with a tall blinking block caret riding the clip edge; accent words keep their colour. | auto (on enter) | gsap/css | Coffee, tech, editorial taglines and hero sublines | Multi-line paragraphs; layouts where the line width changes | M21 |

## Motion map (copy into `site/DESIGN.md`)

```
## Motion map

| # | Section | Layout | Motion | How it plays here | Phone | Record mode |
|---|---|---|---|---|---|---|
| 0 | Loader | — | M5 circle wipe | cup rim grows into the page | same | fixed 2.5 s |
| 1 | Nav | — | M9 print-out | menu links feed out line by line when opened | same | not shown |
| 2 | Hero | HR08 | M19 focus pull | fogged window wiped clear, then the video scrubs | lighter blur | scrub |
| … | | | | | |

Transitions: 2→3 X2 colour wash · 3→4 X3 torn edge stretches · …
Details: magnetic Menu button · copper underline draw on links · …
```

Checklist before approving: every section has a layout code (SECTION-MENU) and a motion code · no code appears twice · no section is "fade in" · the hero and signature repeat no earlier site's (every row of the sites log) · the hero is not a shape growing to full screen.
