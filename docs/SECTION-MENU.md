# Section menu — a layout code for every section

`DESIGN-MENU.md` picks the look, `MOTION-MENU.md` how each section moves. **This menu picks how each section is laid out.** In Round 0, give every section **one layout code** from here **and** one motion code (each entry lists motion codes that suit it). Every layout is live, as a real designed section, at **`/lab/sections/<category>`** (e.g. `/lab/sections/hr`; index at `/lab/sections`; each build batch also at `/lab/sections/b<N>`). Code: `components/sections/` (first set `<type>.tsx`, later batches `<cat>-b<N>.tsx`), building blocks `kit.tsx`, motion hook `motion.ts`. Where each layout came from: `docs/SECTION-LOG.md`.

**Rules**
- **No layout code twice on a site, and none used by any of the last 3 sites** (SITES-LOG → Layouts column).
- Copy the layout into `site/components/`, rename it for the brand, and restyle it (content, fonts, colours, proportions): two sites using the same code must still not look alike.
- The layout's listed motion is a suggestion; the Motion map decides (no motion code twice per site).
- Desktop first (1440×900, 1920×1080). The first 90 layouts also have phone wireframes; later entries are desktop-only (basic stacking in code, not tuned for phones).
- Sources: every layout was rebuilt from scratch after studying 21st.dev (look-and-learn only), Tailark, shadcn/ui, Magic UI, Aceternity (look-and-learn only), HyperUI, Preline, Flowbite, Meraki UI, Tailblocks, Mamba UI, Float UI, Codrops and award galleries (Awwwards, SiteInspire); **no code was copied**. See `docs/SOURCES.md` and `docs/SECTION-LOG.md`.

Codes (31 categories): **HR** hero ×28 · **NV** navbar / menu ×12 · **FT** features ×16 · **BN** bento ×10 · **PS** product showcase ×16 · **ST** stats / ingredients ×10 · **PD** process / steps ×4 · **CP** comparison / before-after ×3 · **SY** story / about ×10 · **TM** team ×6 · **GL** gallery ×18 · **VD** video feature ×7 · **SP** social proof ×12 · **LG** logos / press ×5 · **PR** pricing / shop ×9 · **MN** menu / price list ×4 · **BK** booking / reservation ×4 · **LS** listings / rooms / property ×3 · **MP** locations / map ×6 · **EV** events / schedule ×4 · **AP** app download ×4 · **JR** journal / blog ×7 · **FQ** faq ×7 · **CT** cta band ×8 · **NL** newsletter ×4 · **CC** contact ×6 · **FO** footer ×11 · **AN** announcement / promo bar ×3 · **PL** poll / vote ×1 · **CR** careers ×1 · **ER** error / 404 ×1 (240 layouts).

---

## HR · Hero

**HR01 · Split product hero + logo strip** · motion M6 · fit: drinks, gadgets, skincare: one hero product with a short promise · avoid with: HR04/HR10 (another centred product) right after
```
desktop                                   phone
┌────────────────┬─────────────────────┐  ┌──────────────┐
│ Headline       │      ( product )    │  │ Headline     │
│ copy           │        glow         │  │ copy [Shop]  │
│ [Shop][Store]  │                     │  │ ( product )  │
├────────────────┴─────────────────────┤  │ logo logo    │
│ logo  logo  logo  logo  logo  logo   │  │ logo logo    │
└──────────────────────────────────────┘  └──────────────┘
```
**HR02 · Full-bleed photo, centred statement, info bar** · motion M13 · fit: coffee, hotels, food, travel: a strong mood photo · avoid with: other full-bleed photo sections back to back
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│            (full-bleed photo)        │  │  (photo)     │
│        The slow roast, made light.   │  │ The slow     │
│                copy                  │  │ roast...     │
├────────┬────────┬────────┬───────────┤  ├──────┬───────┤
│ Origin │ Roast  │ Notes  │  [Order]  │  │Origin│ Roast │
└────────┴────────┴────────┴───────────┘  └──────┴───────┘
```
**HR03 · Editorial collage** · motion M1 · fit: fashion, linen, interiors, editorial brands · avoid with: HR05 fan, gallery grids right after
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Linen, slowly made.        copy      │  │ Linen,       │
│ (huge serif)               [edit →]  │  │ slowly made. │
│ ┌──────┐  ┌────┐   ┌───┐             │  │ copy [edit]  │
│ │ 3:4  │  │1:1 │   │2:3│ (stepped)   │  │ ▯ ▯ ▯        │
└──────────────────────────────────────┘  └──────────────┘
```
**HR04 · Giant wordmark behind a centred product + spec chips** · motion M12 · fit: energy drinks, sneakers, audio: a hero product with a short name · avoid with: other huge-type sections next to it (CT01, FO01, FT10)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│     [Caffeine]      ▐█▌    [Sugar]   │  │ V O ▐█▌ L T  │
│  V  O  L  T  ( product )   (giant)   │  │    ▐█▌       │
│                     ▐█▌ [Electrolyt] │  │ [chip][chip] │
├──────────────────────────────────────┤  │ copy         │
│ copy                  ₹120 [Add 12pk]│  │ ₹120 [Add]   │
└──────────────────────────────────────┘  └──────────────┘
```
**HR05 · Image fan under a centred headline** · motion M34 · fit: perfume, fashion, tea ranges: products sold as a set of variants · avoid with: photo grids right after (GL, HR03)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│       Five scents, one evening.      │  │ Five scents, │
│        copy  [Discovery] [Find]      │  │ one evening. │
│     ╱▯ ╱▯  ▯  ▯╲ ▯╲                  │  │ [Discovery]  │
│    (5 cards splayed like a hand)     │  │  ╱▯ ▯ ▯╲     │
└──────────────────────────────────────┘  └──────────────┘
```
**HR06 · Bento hero (headline, product, stat, swatches)** · motion M18 · fit: drinks, snacks, skincare with flavours/shades and a number · avoid with: a BN bento straight after
```
desktop                                   phone
┌───────────────────────┬──────────────┐  ┌──────────────┐
│ Sparkling tea,        │   ( can )    │  │ Headline     │
│ nothing hidden. [Shop]│   accent     │  │ [Shop]       │
├─────────┬─────────────┤   cell       │  │  ( can )     │
│ 14 cal  │ ● ● ● ●     │              │  │ 14 │ ● ● ● ● │
└─────────┴─────────────┴──────────────┘  └──────────────┘
```
**HR07 · Pack-size hero with live price** · motion M3 · fit: chocolate, coffee, drinks bought in multiples · avoid with: a pricing table or another buy section right after
```
desktop                                   phone
┌──────────────────┬───────────────────┐  ┌──────────────┐
│  ( 1 / 3 / 5     │ Dark chocolate,   │  │ ( packs )    │
│    products )    │ sea-salt sharp.   │  │ Headline     │
│                  │ [Single|6|12]     │  │ [1 | 6 | 12] │
│                  │ ₹990  Save 8%     │  │ ₹990         │
│                  │ [Add to bag]      │  │ [Add to bag] │
└──────────────────┴───────────────────┘  └──────────────┘
```
**HR08 · Two-mood split, title on the seam** · motion M23 · fit: tea, skincare AM/PM, day/night collections · avoid with: other full-bleed photo sections back to back (HR02)
```
desktop                                   phone
┌──────────────────┬───────────────────┐  ┌──────────────┐
│     Two teas,│ one day.  (title)     │  │ Two teas,    │
│   photo A    │    photo B            │  │ one day.     │
│ Morning ₹640 │         Night ₹560    │  │ Morning ₹640 │
└──────────────────┴───────────────────┘  │ Night ₹560   │
                                          └──────────────┘
```
**HR09 · Chapter opener** · motion M20 · fit: origin stories (coffee, cacao, craft) told in chapters · avoid with: pages that are not a sequence; FT06 numbered steps nearby
```
desktop                                   phone
┌───────────────────────┬──────────────┐  ┌──────────────┐
│ 01 (huge numeral)     │              │  │ 01           │
│ It starts with the    │   photo 4:5  │  │ It starts    │
│ forest floor.         │              │  │ with the...  │
│ 1,400 m │ copy        │              │  │ 1,400 m      │
└───────────────────────┴──────────────┘  │ copy  photo  │
                                          └──────────────┘
```
**HR10 · Product on a plinth + spec bar** · motion M3 · fit: audio, gadgets, premium bottles: one flagship · avoid with: a ST stats section right after
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│           Quiet, finally.            │  │ Quiet,       │
│              ( product )             │  │ finally.     │
│              ═══plinth═══            │  │ ( product )  │
├────────┬────────┬────────┬───────────┤  │ ══plinth══   │
│ 40     │ 38     │ 250    │ 12        │  │ 40   │ 38    │
└────────┴────────┴────────┴───────────┘  └──────────────┘
```
**HR11 · Diced image hero (drifting tile columns)** · motion M32 · fit: sneakers, fashion, design-led products with one strong image · avoid with: GL01 masonry (same drift)
```
desktop                                   phone
┌───────────────────────┬──────────────┐  ┌──────────────┐
│ Sneakers, cut from    │ copy         │  │ Headline     │
│ one piece.            │ [Shop][link] │  │ copy [Shop]  │
├───────────────────────┴──────────────┤  │ ▪ ▪ ▪ ▪ ▪    │
│ ▪  ▪  ▪  ▪  ▪   (5 offset columns    │  │ ▪ ▪ ▪ ▪ ▪    │
│ ▪  ▪  ▪  ▪  ▪    of one image)       │  │ ▪ ▪ ▪ ▪ ▪    │
└──────────────────────────────────────┘  └──────────────┘
```
**HR12 · Atmospheric light-ray hero** · motion M61 · fit: perfume, attar, wellness, slow luxury, launch teasers · avoid with: other fx backgrounds (M60/M52) on the same page
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│  ╲  │  ╱  ╲ (light rays sway)  │  ╱  │  │ ╲ │ ╱ rays   │
│        Scent of the first rain.      │  │ Scent of the │
│               copy                   │  │ first rain.  │
│        [Reserve ₹3,200] [Story]      │  │ [Reserve]    │
└──────────────────────────────────────┘  └──────────────┘
```

**HR13 · Video shrinks into the title** · motion M13 · fit: energy drinks, sneakers, music, sports · suggested motions: M13, M25, M12 · avoid with: another video-in-text section
```
┌──────────────────────────────────────┐
│ ▶ Brand film            (film fades) │
│   ██████  ██  ██ ██████ ██  ██       │
│   R  U  S  H  ← film inside letters  │
├──────────────────────────────────────┤
│ copy line          ₹110 [Shop][Film] │
└──────────────────────────────────────┘
```

**HR14 · Torn-word reveal** · motion M31 · fit: energy drinks, cold brew, sneakers, launches · suggested motions: M31, M12, M37 · avoid with: HR04 giant wordmark
```
┌──────────────────────────────────────┐
│  AWA╱      ( glow )      ╲KE         │
│  ←half      [ can ]      half→       │
│             rising                   │
├──────────────────────────────────────┤
│ Nitro cold brew…          ₹160 [Pre] │
└──────────────────────────────────────┘
```

**HR15 · Copy, subject on a colour disc, stacked words** · motion M12 · fit: kombucha/drinks, sneakers, fashion with a cut-out subject · suggested motions: M12, M18, M37 · avoid with: HR01 split product
```
┌──────────────────────────────────────┐
│ BRAND   Shop Flavours How   Cart (0) │
│ small     ╭──────╮          Wild.    │
│ copy      │ can  │           Raw.    │
│ ₹ link    ╰─disc─╯        Alive.     │
├──────────────────────────────────────┤
│ Instagram Pinterest      Brewed in … │
└──────────────────────────────────────┘
```

**HR16 · Layered landscape parallax** · motion M7 · fit: outdoor, mineral water, tea estates, travel · suggested motions: M7, M6, M42 · avoid with: HR12 light rays
```
┌──────────────────────────────────────┐
│ sky                         ( moon ) │
│  /\/\/\ far range /\/\/\/\           │
│    ABOVE THE CLOUDS                  │
│ ~~~~ near hills cover base ~~~~      │
│ ≈≈ tea rows ≈≈  copy   ₹780 [Shop]   │
└──────────────────────────────────────┘
```

**HR17 · Headline over a full-width image belt** · motion M6 · fit: fashion, food, pantry/lifestyle ranges · suggested motions: M6, M14, M44 · avoid with: GL02 filmstrip right after
```
┌──────────────────────────────────────┐
│     A summer pantry, made by hand.   │
│        copy  [Build a hamper][Meet]  │
├──────────────────────────────────────┤
│ [▯][▯][▯][▯][▯][▯][▯][▯] → endless   │
│ belt of portrait cards               │
└──────────────────────────────────────┘
```

**HR18 · Scatter-to-ring image hero** · motion M33 · fit: collections, festivals, fairs, galleries · suggested motions: M33, M32, M4 · avoid with: GL ring layouts
```
┌──────────────────────────────────────┐
│ ▯     ▯    ▯      ▯     ▯  (scatter) │
│    ▯ ╭ ring ╮  ▯                     │
│     Sixty makers. Four days.         │
│      [Passes ₹600] [Makers]          │
│  ▯ ▯ ▯ ▯ ▯ ▯ ▯ ▯ ▯ ▯ (arc at end)    │
└──────────────────────────────────────┘
```

**HR19 · Bottom-anchored giant title on a full-bleed photo** · motion M12 · fit: hotels, restaurants, heritage brands · suggested motions: M12, M13 · avoid with: HR02 centred statement
```
┌──────────────────────────────────────┐
│ Wordmark            links  links     │
│            full-bleed photo          │
│ (Est. 1932)                          │
│ THE FERNHILL            copy  ( Book │
│ RETREAT                       a stay)│
└──────────────────────────────────────┘
```

**HR20 · Isometric image wall behind a statement** · motion M32 · fit: fashion, sneakers, catalogue-rich brands · suggested motions: M32, M6 · avoid with: HR11 diced hero
```
┌──────────────────────────────────────┐
│ ╲▢╲ ╲▢╲ ╲▢╲ ╲▢╲  (tilted plane, dark)│
│  ╲▢╲  Linen for the LONGEST  ╲▢╲     │
│ ╲▢╲     summer.        ╲▢╲ ╲▢╲       │
│  ╲▢╲  copy [Shop][Lookbook]  ╲▢╲     │
│ ╲▢╲ ╲▢╲ ╲▢╲ ╲▢╲  cols drift ↑↓      │
└──────────────────────────────────────┘
```

**HR21 · Day-to-night crossfade landscape** · motion M6 · fit: hotels, resorts, tea/coffee estates, real estate · suggested motions: M6, M13 · avoid with: HR08 two-mood split
```
┌──────────────────────────────────────┐
│  landscape: day ⇄ night (☾ ✦ loop)   │
│          (New · Monsoon stays →)     │
│          WAKE ABOVE THE              │
│          TEA CLOUDS.                 │
│          copy  [Check dates][Tour]   │
└──────────────────────────────────────┘
```

**HR22 · Vanishing-point image rails** · motion M42 · fit: travel, fashion, music · suggested motions: M42, M13 · avoid with: HR11 diced hero
```
┌──────────────────────────────────────┐
│ ▢▢       ▫ ·   GO FURTHER,   · ▫  ▢▢ │
│  ▢▢▢   ▫ ·       SLOWER.     · ▫ ▢▢▢ │
│ ◄── rail out      copy      rail out ──►│
│           [Plan a journey][Dates]    │
└──────────────────────────────────────┘
```

**HR23 · Tilted card wall that straightens** · motion M31 · fit: sneakers, catalogues, D2C ranges · suggested motions: M31, M42 · avoid with: GL tilted grids
```
┌──────────────────────────────────────┐
│ Every pair,          copy            │
│ on one wall.         [Shop] link     │
│ ▭▭ ▭▭ ▭▭ ▭▭ ▭▭  →  (tilted → flat)   │
│   ▭▭ ▭▭ ▭▭ ▭▭ ▭▭  ←                  │
│ ▭▭ ▭▭ ▭▭ ▭▭ ▭▭  →                    │
└──────────────────────────────────────┘
```

**HR24 · Curved panorama strip** · motion M31 · fit: hotels, travel, furniture · suggested motions: M31, M44 · avoid with: other image strips / rails (HR22)
```
┌──────────────────────────────────────┐
│     Wake where the coast curves.     │
│          copy                        │
│ ▐▌ ▐█▌ ▐██▌ ▐██▌ ▐██▌ ▐██▌ ▐█▌ ▐▌    │
│   (concave 3D strip, sways)          │
│      [Check availability] from ₹     │
└──────────────────────────────────────┘
```

**HR25 · Centre copy ringed by floating images** · motion M32 · fit: bakeries, florists, lifestyle · suggested motions: M32, M6 · avoid with: HR03 collage
```
┌──────────────────────────────────────┐
│ [img]  [i]                   [img]   │
│   [i]      Bread, still              │
│            warm at seven.     [img]  │
│             copy [CTA]               │
│ [img]                 [i]  [img]     │
└──────────────────────────────────────┘
```

**HR26 · Tilted 3D object above the title** · motion M51 · fit: chocolate bars, cards, passes, books · suggested motions: M51, M6 · avoid with: HR10 plinth
```
┌──────────────────────────────────────┐
│     ░░░ radial photo glow ░░░        │
│              ╱▔▔▔╲                   │
│             ╱ bar ╱ (tilted, sways)  │
│             ╲___╱                    │
│     A bar worth unwrapping slowly.   │
│          copy  [Buy] link            │
└──────────────────────────────────────┘
```

**HR27 · Tilted screen that flattens on scroll** · motion M31 · fit: apps, audio, tech, booking sites · suggested motions: M31, M6 · avoid with: HR10
```
┌──────────────────────────────────────┐
│        small line above              │
│      HEAR THE WHOLE ROOM.            │
│    ╱▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔╲         │
│   ╱ art │ waveform · tracks  ╲ →flat │
│   ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔         │
│          [Shop] [Get the app]        │
└──────────────────────────────────────┘
```

**HR28 · Split header over a landscape product stage** · motion M13 · fit: D2C, audio, skincare · suggested motions: M13, M6 · avoid with: HR01
```
┌──────────────────┬───────────────────┐
│ SKIN, KEPT       │ copy              │
│ SIMPLE.          │ [Build] [Read]    │
├──────────────────┴───────────────────┤
│  landscape  ┌─[prod]│Serum ₹┐  stage │
│             └───────────────┘        │
├──────────────────────────────────────┤
│ logo  logo  logo  logo  logo         │
└──────────────────────────────────────┘
```

## NV · Navbar / menu

**NV01 · Numbered full-screen menu with image swap** · motion M23 · fit: hotels, resorts, restaurants, fashion · suggested motions: M23, M13, M6 · avoid with: any other full-screen overlay (NV02)
```
┌──────────────────────────────────────┐
│ Wordmark            Close  [BOOK NOW]│
├───────────────────────┬──────────────┤
│ 01 Stay               │ ┌──────────┐ │
│ 02 Villas  ← active   │ │ tall     │ │
│ 03 Dine … 10 Contact  │ │ photo    │ │
├───────────────────────┴──────────────┤
│ email · concierge · socials          │
└──────────────────────────────────────┘
```

**NV02 · Marquee row menu** · motion M44 · fit: streetwear, music, sneakers · suggested motions: M44, M23, M12 · avoid with: FO08 marquee footer, NV01
```
┌──────────────────────────────────────┐
│ KNOTWORK                    Close ✕  │
├──────────────────────────────────────┤
│ DROPS                      Friday 7pm│
│▓SNEAKERS (o) SNEAKERS (o) SNEAK…  ▓▓│
│ APPAREL / SOUND / ARCHIVE            │
├──────────────────────────────────────┤
│ shipping note            socials     │
└──────────────────────────────────────┘
```

**NV03 · Floating bottom dock with CTA** · motion M71 · fit: apps, D2C stores, single-page brands · suggested motions: M71, M18, M64 · avoid with: AN floating pill nav, any fixed top bar
```
┌──────────────────────────────────────┐
│ Headline            ░░ photo ░░      │
│ copy  price          ( product )     │
│                                      │
│     ( ⌂  ▣  ◉  ≡  ☺ │ [Start →] )    │
└──────────────────────────────────────┘
```

**NV04 · Header morphs into a floating capsule** · motion M6 · fit: any premium brand (shown: furniture) · suggested motions: M6, M18 · avoid with: other floating pills (NV03 dock, NV06 pill)
```
┌──────────────────────────────────────┐
│ Headline               copy          │
│ ┌──────────────────────────────────┐ │
│ │   ( Logo  links  [CTA] )══progress│ │
│ │ page scrolls by itself: hero,    │ │
│ │ product row, quote, wide photo   │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

**NV05 · Mega menu with featured story card** · motion M23 · fit: furniture, fashion, multi-category stores · suggested motions: M23, M13 · avoid with: FO02 mega footer
```
┌──────────────────────────────────────┐
│ Logo   Living Dining Bed Out   Bag   │
├────────────┬───────────┬──────┬──────┤
│ SEATING    │ TABLES    │ LIGHT│[photo]│
│ links      │ links     │ links│ title→│
├────────────┴───────────┴──────┴──────┤
│ (page peeking: headline · copy)      │
└──────────────────────────────────────┘
```

**NV06 · Hover menu with one morphing panel** · motion M18 · fit: tech, audio, product-family brands · suggested motions: M18, M34 · avoid with: mega menus (NV05)
```
┌──────────────────────────────────────┐
│ Logo     ( Sound|Studio|Support ) Cart│
│        ┌──────────────────────┐      │
│        │ [▣ card] [▣ card]    │ ←resizes│
│        │ [▣ card] [▣ card]    │      │
│        └──────────────────────┘      │
│ Headline                 [Shop][Find]│
└──────────────────────────────────────┘
```

**NV07 · Corner circle menu** · motion M12 · fit: perfume, fashion, agencies · suggested motions: M18, M12 · avoid with: other full-screen overlay menus (NV01, NV02)
```
┌──────────────────────────────────────┐
│ Logo                     Close (×)◜  │
│          Fragrances  twelve eaux     │
│          Atelier     how we blend    │
│          Gifting     sets from ₹     │
│          Visit       the salon       │
│ note                       socials   │
└──────────────────────────────────────┘
```

**NV08 · Box grid menu** · motion M34 · fit: studios, interiors, galleries · suggested motions: M34, M1 · avoid with: BN bento layouts right below
```
┌──────────────────┬────────┬─────────┐
│                  │ Studio │ Objects │
│   PROJECTS photo ├────────┤ [photo] │
│                  │ Journal│ from ₹  │
├────────┬─────────┴────────┼─────────┤
│Services│ contact · [Book] │ Follow  │
└────────┴──────────────────┴─────────┘
```

**NV09 · Fixed vertical side rail nav** · motion M23 · fit: hotels, galleries, editorial brands (shown: hill-house hotel) · suggested motions: M23, M6, M1 · avoid with: side index rails / any other vertical rail on the same page
```
┌────┬─────────────────────────────────┐
│ V  │ ┌──────────────┐  Rooms   Book  │
│ •R │ │              │  Eleven rooms… │
│  D │ │    photo     │  copy          │
│  S │ │   (drifts)   │  ─────────────│
│ EN │ └──────────────┘  ₹14,500 [Dates]│
└────┴─────────────────────────────────┘
```

**NV10 · Altitude scroll-progress rail** · motion M3 · fit: chaptered stories: coffee origin, expeditions, wine · suggested motions: M3, M23, M20 · avoid with: another side rail or a progress-bar nav
```
┌──────────────────────────────────────┐
│ KODAI RIDGE              [Shop beans]│
├──────────────────────────────────────┤
│ 1,620 m            ┌──────┐ Estate ─┤
│ Shade first…       │ pic  │ Picking ◆│
│ copy               └──────┘ Drying ─┤
│                             Roastery┤
└──────────────────────────────────────┘
```

**NV11 · Three-island navbar** · motion M18 · fit: tech, audio, modern D2C (shown: kombucha cans) · suggested motions: M18, M71, M6 · avoid with: floating pill navs, notched headers
```
████████████████████████████████████████
 ╲(logo)╱    ╲Shop Flav Sub Sto╱  ╲Bag [Try]╱
                                         
│ Fizz, without      (   product   )   │
│ the fuss. ₹540         glow          │
│ [Shop] [Mix]                          │
└──────────────────────────────────────┘
```

**NV12 · Inline sentence menu with preview panel** · motion M13 · fit: studios, editorial, fashion (shown: linen atelier) · suggested motions: M13, M23, M6 · avoid with: other overlays / full-screen menus on the same page
```
┌──────────────────────────────────────┐
│ Atelier Noon          Search Bag Close│
├────────────────────────┬─────────────┤
│ Womenswear / Menswear /│ ┌───┐┌───┐  │
│ THE LINEN EDIT / Foot- │ └───┘└───┘  │
│ wear / Atelier / Jour- │ ┌───┐┌───┐  │
│ nal / Stores           │ Linen edit →│
└────────────────────────┴─────────────┘
```

## FT · Features

**FT01 · Hairline feature row** · motion M18 · fit: coffee, tea, craft food: a calm "why us" row · avoid with: card grids right after (FT09)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Why it tastes like this.        copy │  │ Headline     │
├─────────┬─────────┬─────────┬────────┤  │ copy         │
│ ⌇ icon  │ ☼ icon  │ ◷ icon  │ ▢ icon │  │ ⌇ Grown...   │
│ Title   │ Title   │ Title   │ Title  │  ├──────────────┤
│ copy    │ copy    │ copy    │ copy   │  │ ☼ Sun-dried  │
└─────────┴─────────┴─────────┴────────┘  └──────────────┘
```
**FT02 · Sticky title, cards scroll past** · motion M23 · fit: skincare, supplements, ingredient/feature lists · avoid with: another sticky or pinned section next to it
```
desktop                                   phone
┌────────────────┬─────────────────────┐  ┌──────────────┐
│ A serum that   │ ┌ icon Title  pic ┐ │  │ Headline     │
│ does less,     │ └─────────────────┘ │  │ [Shop ₹1,190]│
│ better.(sticky)│ ┌ icon Title  pic ┐ │  │ ┌ card ────┐ │
│ [Shop ₹1,190]  │ └─ … 4 cards … ───┘ │  │ └──────────┘ │
└────────────────┴─────────────────────┘  └──────────────┘
```
**FT03 · Tabbed features + swapping media** · motion M6 · fit: audio, tech, appliances with several distinct features · avoid with: other auto-cycling sections (HR07, PS03) next to it
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Built for the long listen.           │  │ Headline     │
├────────────────┬─────────────────────┤  │ ─ Tab 1 ──── │
│ ━ Tab 1 (open) │                     │  │   copy       │
│ ─ Tab 2        │   media panel 4:3   │  │ ─ Tab 2, 3, 4│
│ ─ Tab 3, 4     │   (swaps)           │  │ [ media ]    │
└────────────────┴─────────────────────┘  └──────────────┘
```
**FT04 · Product with callout lines** · motion M12 · fit: energy drinks, supplements, gadgets with an ingredient/spec story · avoid with: HR04 / HR10 (another centred product)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│          WHAT'S IN THE CAN           │  │ WHAT'S IN    │
│ Caffeine ───●   ▐█▌   ●─── Salts     │  │  ( product ) │
│ Zero sug ───●   ▐█▌   ●─── Fruit     │  │ Caff. │ Zero │
│ B-vits   ───●   ▐█▌   ●─── Recycle   │  │ B-vit │ Salt │
└──────────────────────────────────────┘  └──────────────┘
```
**FT05 · Alternating image/text rows (exactly 2)** · motion M1 · fit: linen fashion, furniture, craft brands with two process points · avoid with: HR03 collage, SY sections built the same way
```
desktop                                   phone
┌───────────────────────┬──────────────┐  ┌──────────────┐
│      photo 5:4        │ Headline     │  │ photo        │
│                       │ copy [Shop]  │  │ Headline     │
├──────────────┬────────┴──────────────┤  │ copy [Shop]  │
│ Headline     │      photo 5:4        │  │ photo        │
│ copy [Shop]  │                       │  │ Headline ... │
└──────────────┴───────────────────────┘  └──────────────┘
```
**FT06 · How it works (3 joined steps)** · motion M23 · fit: subscriptions (tea, coffee, meal kits), services · avoid with: HR09 chapter numbers, CT05
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│       Fresh tea in three steps.      │  │ Headline     │
│      (1)──────────(2)──────────(3)   │  │ (1) Pick     │
│     Pick       Blend       Steep     │  │  │  copy     │
│     copy       copy        copy      │  │ (2) Blend    │
│              [Start your plan]       │  │ (3) Steep    │
└──────────────────────────────────────┘  └──────────────┘
```
**FT07 · Before / after cards** · motion M18 · fit: furniture, sustainable goods replacing a cheaper habit · avoid with: comparison/pricing tables right after
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Furniture, the long way.        copy │  │ Headline     │
├ - - - - - - - - -┬───────────────────┤  │ ┆ usual way ┆│
│ ✕ usual way      │ ✓ our way         │  │ ┆ ✕ ✕ ✕ ✕   ┆│
│ ✕ (struck)       │ ✓ (bold)          │  │ ┌ our way ─┐ │
│ ✕                │ ✓  [See table]    │  │ │ ✓ ✓ ✓ ✓  │ │
└──────────────────┴───────────────────┘  └──────────────┘
```
**FT08 · Big stat in the copy + checklist** · motion M3 · fit: chocolate, coffee, craft food: a slow-process claim with one number · avoid with: ST sections or HR10's spec bar nearby
```
desktop                                   phone
┌───────────────────────┬──────────────┐  ┌──────────────┐
│ Each bar takes  96    │ ✓ item       │  │ Each bar     │
│ hours from cracked    │ ✓ item       │  │ takes 96     │
│ bean to wrapped bar…  │ ✓ item       │  │ hours ...    │
│ [Shop ₹240] [link]    │ ✓ item ✓ ... │  │ [Shop]       │
└───────────────────────┴──────────────┘  │ ✓ ✓ ✓ list   │
                                          └──────────────┘
```
**FT09 · Colour-band icon grid** · motion M34 · fit: linen fashion, outdoor gear, drinks: a deliberate colour break mid-page · avoid with: another accent band (CT01) on the same page
```
desktop  (accent band)                    phone
┌──────────────┬───────────────────────┐  ┌──────────────┐
│ Linen that   │ ☵ Title  │ ◊ Title    │  │ Headline     │
│ works in May.│ ⌇ Title  │ ⛨ Title    │  │ copy [Shop]  │
│ copy [Shop]  │ ☼ Title  │ ▢ Title    │  │ ☵ T │ ◊ T    │
│              │ (2 × 3 hairline grid) │  │ ⌇ T │ ⛨ T    │
└──────────────┴───────────────────────┘  └──────────────┘
```
**FT10 · Opposite marquees around a statement** · motion M44 · fit: sneakers, streetwear, energy drinks: a loud feature-tag break · avoid with: other marquees (CT02, FO08) or HR04 nearby
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ ← VEGAN SUEDE ✦ RECYCLED SOLE ✦ CORK │  │ ← TAG ✦ TAG  │
│    One shoe, made to last a decade.  │  │ One shoe,    │
│      copy   [Shop the Field Runner]  │  │ made to last │
│ BREATHABLE ✦ WIDE FITS ✦ REPAIR →    │  │ [Shop]       │
└──────────────────────────────────────┘  │ TAG ✦ TAG →  │
                                          └──────────────┘
```

**FT11 · Pinned horizontal chapter track** · motion M42 · fit: coffee origins, craft process, watches · suggested motions: M42, M41, M23 · avoid with: GL horizontal galleries
```
┌──────────────────────────────────────┐
│ From cherry to cup.      ━━━━──── 2/5│
│ 01          ┌──────┐ 02          ┌── │
│ Title       │ img  │ Title       │ im│
│ copy        │ ⇄par │ copy        │   │
│ fact        └──────┘ fact        └── │
└──────────────── track ← ─────────────┘
```

**FT12 · Stacked pinned card pile** · motion M40 · fit: skincare routines, supplements, product pillars · suggested motions: M40, M13 · avoid with: FT02 sticky title
```
┌──────────────────────────────────────┐
│ Four steps, ten minutes.   ₹ copy    │
│  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ (pile edges) ▔▔▔▔   │
│ ┌──────────────┬───────────────────┐ │
│ │ Step 2 · name│      image        │ │
│ │ copy [Add ₹] │                   │ │
│ └──────────────┴───────────────────┘ │
└──────────────────────────────────────┘
```

**FT13 · Headline orbited by floating cards** · motion M31 · fit: energy drinks, supplements, problem/solution stories · suggested motions: M31, M6, M34 · avoid with: ST03 orbit
```
┌──────────────────────────────────────┐
│ [160 mg]                     [0 g]   │
│          FOCUS THAT OUTLASTS         │
│ [6 h]     FOUR O'CLOCK.      [+4]    │
│          copy  ₹  [Shop]             │
│ [12 kcal]                    [120%]  │
└──────────────────────────────────────┘
```

**FT14 · Image + tag-pill marquee rows** · motion M13 · fit: sneakers, streetwear, snacks with many claims · suggested motions: M13, M44 · avoid with: FT10 marquees
```
┌─────────────┬────────────────────────┐
│  [ image ]  │ Built for the long run │
│             │ (pill)(pill)(pill) →   │
│             │ ← (pill)(pill)(pill)   │
├─────────────┴──────┬─────────────────┤
│ Made to be worn    │   [ image ]     │
│ ← (pill)(pill) →   │                 │
└────────────────────┴─────────────────┘
```

**FT15 · Numbered features flanking a tall image** · motion M23 · fit: perfume, skincare, watches, one hero product · suggested motions: M23, M13 · avoid with: FT04 callout lines
```
┌──────────────────────────────────────┐
│        Jasmine Attar No. 7           │
├─────────┬──────────────┬─────────────┤
│   01 ttl│              │03 title     │
│    text │  tall image  │  text       │
│ ────────│   (sweep)    │─────────    │
│   02 ttl│              │04 title     │
└─────────┴──────────────┴─────────────┘
```

**FT16 · Triptych images + checklist** · motion M1 · fit: coffee, linen, ceramics, craft goods · suggested motions: M1, M23 · avoid with: SY06 process
```
┌────┬───┬──────┬──────────────────────┐
│ img│img│ img  │ From one hillside,   │
│    │   │      │ copy                 │
│    │   │      │ ✓ promise (lit)      │
│    │   │      │ ✓ promise            │
│    │   │      │ ✓ promise  [Shop]    │
└────┴───┴──────┴──────────────────────┘
```

## BN · Bento

**BN01 · Classic bento** · motion M34 · fit: skincare / beauty hero product with proof · avoid with: another bento or 2×2 grid right next to it
```
desktop                                   phone
┌───────────────────┬─────────┬────────┐  ┌──────────────┐
│                   │  image  │ +41%   │  │ photo        │
│  photo + title    │         │ stat   │  │ title [Add]  │
│  [Add ₹1,450]     ├─────────┴────────┤  │ image        │
│                   │ "quote"  ◯ name  │  │ +41% stat    │
└───────────────────┴──────────────────┘  │ "quote"      │
                                          └──────────────┘
```

**BN02 · Product / stat / review / CTA bento** · motion M18 · fit: energy drink, launch or offer page · avoid with: PS04 spotlight (both are product-plus-proof)
```
desktop                                   phone
┌────────────┬────────────┬────────────┐  ┌──────────────┐
│  ( can )   │ 9  kcal    │ ★★★★★      │  │ ( can )      │
│   glow     │            │ "review"   │  │ 9 kcal       │
│  Volt Lime ├────────────┴────────────┤  │ ★ review     │
│            │ ACCENT  First crate [→] │  │ ACCENT CTA   │
└────────────┴─────────────────────────┘  └──────────────┘
```

**BN03 · Asymmetric rows 8/4** · motion M31 · fit: furniture, interiors, crafted goods · avoid with: HR03 collage or another big-photo grid
```
desktop                                   phone
┌─────────────────────────┬────────────┐  ┌──────────────┐
│        photo (8)        │ name ₹ [→] │  │ photo        │
├────────────┬────────────┴────────────┤  │ name ₹       │
│ "quote"    │        photo (8)        │  │ photo        │
│ 25yr  6wk  │                         │  │ "quote"      │
└────────────┴─────────────────────────┘  └──────────────┘
```

**BN04 · Launch countdown bento** · motion M3 · fit: sneaker / product drops, pre-orders · avoid with: ST01 or ST05 (number-heavy next to number-heavy)
```
desktop                                   phone
┌──────────────────────────┬───────────┐  ┌──────────────┐
│ Runner 02 drops soon.    │  photo    │  │ Title        │
│ [12][07][41][26]         │           │  │ [12][07][41] │
├────────┬─────────┬───────┴───────────┤  │ photo        │
│ 2,400  │ 48 hr   │ ₹0 (accent)       │  │ 2,400 / 48 / │
└────────┴─────────┴───────────────────┘  │ ₹0  [Join]   │
 [Join the drop list]  ₹14,999            └──────────────┘
```

**BN05 · Photo mosaic** · motion M32 · fit: fashion / linen, lookbooks, lifestyle · avoid with: gallery sections or another image wall
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Worn in, from day one.    copy [→]   │  │ Title        │
│ ┌──────┐ ┌──────┐ ┌──────┐           │  │ ┌────┐┌────┐ │
│ │ pic  │ │      │ │ pic  │ ← drift   │  │ │pic ││    │ │
│ │▒cap▒ │ │ pic  │ │▒cap▒ │           │  │ │▒cap││pic │ │
│ ├──────┤ │▒cap▒ │ ├──────┤           │  │ ├────┤│▒cap│ │
└──────────────────────────────────────┘  └──────────────┘
```

**BN06 · Flavour bento** · motion M34 · fit: drinks / snacks with colour variants · avoid with: PS03 variant switcher (same story twice)
```
desktop                                   phone
┌──────────────────┬───────────────────┐  ┌──────────────┐
│ YUZU GREEN       │ Hibiscus    (can) │  │ YUZU (green) │
│ (green)          ├─────────┬─────────┤  │   ( can )    │
│    ( can )       │ Peach   │ Blue    │  │ Hibiscus can │
│                  │  (can)  │  (can)  │  │ Peach    can │
└──────────────────┴─────────┴─────────┘  └──────────────┘
```

**BN07 · Headline bento** · motion M12 · fit: chocolate, craft food, bold brand statements · avoid with: other huge-headline sections (CTA, statement)
```
desktop                                   phone
┌──────────────────┬─────────┬─────────┐  ┌──────────────┐
│ BEAN TO          │ 72%     │ photo   │  │ BEAN TO BAR, │
│ BAR, IN          ├─────────┼─────────┤  │ IN ONE ROOM. │
│ ONE ROOM.        │ notes   │ ₹340    │  │ [Shop]       │
│ copy  [Shop]     │         │ accent  │  │ 72% | photo  │
└──────────────────┴─────────┴─────────┘  └──────────────┘
```

**BN08 · Dark glass bento + border sheen** · motion M49 · fit: audio, tech, premium electronics · avoid with: other shine/glow effects (ShineText, LightRays) on the same page
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Silence, tuned to you. (shine)       │  │ Title shine  │
│ ┌~~~~~~~~~~~~~~~~~~~~~~┐┌~~~~~~~~┐   │  │ ┌~~~~~~~~~~┐ │
│ │ Halo One  [photo]    ││ 60 hr  │   │  │ │photo  ₹  │ │
│ │ ₹24,990 [Pre-order]  │├~~~~~~~~┤   │  │ ├~~~~~~~~~~┤ │
│ └~~~~~~~~~~~~~~~~~~~~~~┘│spatial │   │  │ │60hr│spat.│ │
│ ● lossless ● multipoint ● 38 g       │  │ ● perks      │
└──────────────────────────────────────┘  └──────────────┘
```

**BN09 · Pillar bento with staggered seams** · motion M34 · fit: furniture, skincare, multi-line food brands (built: teak furniture workshop) · suggested motions: M34, M18 · avoid with: BN03 asymmetric rows
```
┌──────────────────────────────────────┐
│ Rooms, built in teak.   copy [Shop]  │
├───────────┬────────────┬─────────────┤
│ Lounge    │            │ Lamps       │
│ chairs    │  Bookcase  ├─────────────┤
├───────────┤  (pillar)  │ Sofas       │
│ Side tbl  │            │             │
└───────────┴────────────┴─────────────┘
```

**BN10 · Living-widget bento** · motion M34 · fit: apps, subscriptions, tech-led D2C (demo: coffee subscription) · suggested motions: M34, M44, M18 · avoid with: BN08 glass bento on the same page
```
┌────────────┬─────────────────────────┐
│ ▤ feed     │ ▭▭▭ marquee ▭▭▭▭        │
│ Title      │ Title  (CTA slides up)  │
├────────────┴────────────┬────────────┤
│ ○──beam──○──beam──○     │ ▦ calendar │
│ Title  (CTA)            │ Title      │
└─────────────────────────┴────────────┘
```

## PS · Product showcase

**PS01 · Product row** · motion M34 · fit: coffee, drinks, any small range of 3 SKUs · avoid with: PS05 shelf (both are card rows)
```
desktop                                   phone
┌─────────┬─────────┬─────────┬────────┐  ┌──────────────┐
│ Cold    │ ( can ) │ ( can ) │ ( can )│  │ Title        │
│ brew,   │ name  ₹ │ name  ₹ │ name  ₹│  │ ( can )      │
│ 3 moods │ notes   │ notes   │ notes  │  │ name ₹ [Add] │
│ All →   │ [Add]   │ [Add]   │ [Add]  │  │ ( can ) ...  │
└─────────┴─────────┴─────────┴────────┘  └──────────────┘
```

**PS02 · Editorial product index** · motion M23 · fit: perfume, jewellery, wine, anything premium with few SKUs · avoid with: FAQ or other list-type sections
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ The fragrance index.          copy   │  │ Title        │
│ Vetiver Monsoon ········ ₹6,400      │  │  [preview]   │
│ NIGHT JASMINE ·········· ₹5,900 [img]│  │ Vetiver ··₹  │
│ Oud & Smoke ············ ₹8,200      │  │ NIGHT J ··₹  │
│ Saffron Leather ········ ₹7,600      │  │ Oud ······₹  │
└──────────────────────────────────────┘  └──────────────┘
```

**PS03 · Variant switcher** · motion M6 · fit: energy drinks, colourways, flavours · avoid with: BN06 flavour bento
```
desktop                                   phone
┌──────────────────┬───────────────────┐  ┌──────────────┐
│ Pick your charge.│                   │  │   ( can )    │
│ copy             │     ( can )       │  │    glow      │
│ Arctic Berry  ₹  │      glow         │  │ Title        │
│ ● ● ● ●          │  (swaps colour)   │  │ Name ₹       │
│ [Add 6] [Mixed]  │                   │  │ ● ● ● ●      │
└──────────────────┴───────────────────┘  └──────────────┘
```

**PS04 · Spotlight + buy box** · motion M3 · fit: kombucha, single hero SKU, D2C product page · avoid with: BN02 (also a product with a CTA)
```
desktop                                   phone
┌──────────────┬───────────────────────┐  ┌──────────────┐
│              │ ★★★★★ Tulsi Ginger    │  │  ( can )     │
│   ( can )    │ copy                  │  │ Title        │
│   on disc    │ Volume  330ml│ Qty -4+│  │ spec table   │
│              │ Strains 12   │ ₹720   │  │ ┌buy box───┐ │
│              │ Sugar  3.2 g │ [Add]  │  │ │-4+ ₹ Add │ │
└──────────────┴───────────────────────┘  └──────────────┘
```

**PS05 · Shelf (bending drift)** · motion M44 · fit: sneakers, catalogues with many SKUs · avoid with: BendMarquee or any other marquee on the page
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ THE WHOLE SHELF,         copy [Shop] │  │ THE WHOLE    │
│ MOVING.                              │  │ SHELF.  copy │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ← │  │ ┌────┐┌───   │
│ │pic │ │pic │ │pic │ │pic │ │pic │   │  │ │pic ││pi ←  │
│ │nm ₹│ │nm ₹│ │nm ₹│ │nm ₹│ │nm ₹│   │  │ │nm ₹││nm    │
└──────────────────────────────────────┘  └──────────────┘
```

**PS06 · Pack-size selector** · motion M3 · fit: drinks, consumables, subscriptions · avoid with: pricing tables (same job)
```
desktop                                   phone
┌──────────────────┬───────────────────┐  ┌──────────────┐
│                  │ Stock the fridge  │  │ (can)(CAN)(c)│
│  (c) (CAN) (c)   │ [Single|6-pk|12]  │  │ Title        │
│   on a shelf     │ ₹540  ₹90/can -9% │  │ [1 | 6 | 12] │
│                  │ [Add to cart]     │  │ ₹540 ₹90/can │
│                  │ 1,200 · 0 · 14    │  │ [Add]        │
└──────────────────┴───────────────────┘  └──────────────┘
```

**PS07 · Three-step configurator** · motion M18 · fit: furniture, made-to-order, bikes, custom goods · avoid with: process/steps or "how it works" sections
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Build your chair, in 3 steps.  copy  │  │ Title        │
│ ┌─────────┐   ┌─────────┐   ┌──────┐ │  │ [chair chair]│
│ │ /┐ ┌┐ ⌒ │ → │ ● ● ●   │ → │ Ira  │ │  │      ↓       │
│ │ models  │   │ walnut  │   │₹42.5k│ │  │ [● ● ●]      │
│ └─────────┘   └─────────┘   └[Res]─┘ │  │      ↓       │
└──────────────────────────────────────┘  │ [order ₹ ]   │
                                          └──────────────┘
```

**PS08 · Shop the look** · motion M1 · fit: fashion / linen, home decor, outfits · avoid with: BN05 mosaic or another big-photo section
```
desktop                                   phone
┌──────────────────────┬───────────────┐  ┌──────────────┐
│     photo            │ Shop the look │  │ photo  (1)   │
│      (1)             │ ① [p] shirt ₹ │  │   (3)  (2)   │
│  (3)     (2)         │ ② [p] trous ₹ │  │ Title        │
│                      │ ③ [p] tote  ₹ │  │ ① shirt  ₹   │
│                      │ [Add the look]│  │ ② ③ [Add]    │
└──────────────────────┴───────────────┘  └──────────────┘
```

**PS09 · Product finder quiz** · motion M34 · fit: skincare, coffee, perfume, supplements (built: serum finder) · suggested motions: M34, M6, M18 · avoid with: PS07 configurator
```
┌──────────────────────────────────────┐
│      Find your serum in a minute.    │
│   ┌──────────────────────────────┐   │
│   │ ● ● ○ ○          Question 2/3│   │
│   │ What would you change first? │   │
│   │ [ Dull tone ] [ Pores ✓ ]    │   │
│   │ [ Lines     ] [ Spots   ]    │   │
│   └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

**PS10 · Mix-your-case builder** · motion M3 · fit: energy drinks, kombucha, beer, snacks (built: 24-can energy drink case) · suggested motions: M3, M34, M18 · avoid with: PS06 pack-size
```
┌──────────────────────┬───────────────┐
│ ● ● ● ● ● ●          │ 17 / 24       │
│ ● ● ● ● ● ●          │ ▓▓▓▓▓▓░░░     │
│ ● ● ● ● ○ ○          │ ● Orange - 5 +│
│ ○ ○ ○ ○ ○ ○          │ ● Lime   - 4 +│
│ Case price ₹2,160    │ [Add case]    │
└──────────────────────┴───────────────┘
```

**PS11 · Wheel label picker + crossfade image** · motion M6 · fit: flavours, perfumes, colourways (built: 7 perfumes) · suggested motions: M6, M13, M23 · avoid with: PS03 variant switcher
```
┌────────────┬─────────────────────────┐
│ Seven      │      big image          │
│   Jasmine  │     (crossfades)        │
│ ─Smoked Oud│                         │
│   Neroli   ├─────────────────────────┤
│            │ Smoked Oud  ₹4,900 [Add]│
└────────────┴─────────────────────────┘
```

**PS12 · Rotating product cube** · motion M31 · fit: sneakers, packaging-led drinks, gadgets (built: 4 sneaker colourways) · suggested motions: M31, M33, M51 · avoid with: other 3D sections (GL10 ring)
```
┌──────────────────────────────────────┐
│     One last, four ways to wear it.  │
│ Ember Red     ┌──┐╲      Weight 268 g│
│ Lattice Trail │  │ │     Lugs  4.5 mm│
│ ₹9,290 [Shop] └──┘╱      Upper knit  │
└──────────────────────────────────────┘
```

**PS13 · Magnifier inspection card** · motion M23 · fit: watches, leather, textiles, jewellery (built: handmade leather derby) · suggested motions: M23, M13 · avoid with: PS04 spotlight
```
┌───────────────────────┬──────────────┐
│                       │ Look closer. │
│    big image   (◎)    │ ● detail 1   │
│        lens glides    │ ○ detail 2   │
│                       │ ○ detail 3   │
│                       │ ₹14,900 [Buy]│
└───────────────────────┴──────────────┘
```

**PS14 · Shop-by-category tile grid** · motion M13 · fit: fashion, home, grocery (built: linen fashion) · suggested motions: M13, M34 · avoid with: BN05 mosaic
```
┌──────────────────────────────────────┐
│ Shop by category       [All cats]    │
├─────────────────┬────────┬───────────┤
│  FEATURED 2x2   │ Shirts │ Dresses   │
│  New in · 64    ├────────┼───────────┤
│                 │ Trouser│ Kurtas    │
├────────┬────────┼────────┼───────────┤
│ Knits  │ Bags   │ Scarves│ Home linen│
└────────┴────────┴────────┴───────────┘
```

**PS15 · Filter sidebar + product grid** · motion M34 · fit: catalogues (fashion, homeware, wine) (demo: linen clothing) · suggested motions: M34, M23 · avoid with: LS finder layouts
```
┌─────────┬────────────────────────────┐
│Category │ 6 of 48 [Shirts ×]  Sort ▾ │
│☑ ☐ ☐    ├────────┬────────┬──────────┤
│Price ━● │  img   │  img   │  img     │
│● ● ● ●  │  img   │  img   │  img     │
│★★★★★    │     [Load 12 more]         │
└─────────┴────────────────────────────┘
```

**PS16 · List/grid view toggle catalogue** · motion M23 · fit: wine, books, perfume, art prints (demo: Indian wines) · suggested motions: M23, M34 · avoid with: PS02 index
```
┌──────────────────────────────────────┐
│ Headline               [List|Grid]   │
│ ▪ Name ........ Type  Region 2019 ₹  │
│ ▪ Name ........ Type  Region 2023 ₹  │
│   ⇄ flips to 4 × img grid ⇄          │
│ copy ........................ [Case] │
└──────────────────────────────────────┘
```

## ST · Stats / ingredients

**ST01 · Big numbers row** · motion M3 · fit: audio/tech specs, company facts · avoid with: ST05 or BN04 (number rows back to back)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Numbers you can hear.     [Compare]  │  │ Title        │
├─────────┬─────────┬─────────┬────────┤  ├──────┬───────┤
│ 60 hr   │ 32 ms   │ 6 mics  │ 4.8 ★  │  │ 60hr │ 32ms  │
│ battery │ latency │ calls   │ review │  ├──────┼───────┤
└─────────┴─────────┴─────────┴────────┘  │ 6mic │ 4.8★  │
                                          └──────┴───────┘
```

**ST02 · Ingredient dossier** · motion M18 · fit: skincare, supplements, clean-label food · avoid with: ST03 orbit or ST04 label (all are ingredient stories)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Four actives, on the record.  copy   │  │ Title        │
│ ┌SPEC A-14┐┌SPEC B-02┐┌C-31┐┌D-07┐   │  │ ┌SPEC A-14─┐ │
│ │Centella ││Rice fer.││Niac││Turm│   │  │ │Centella  │ │
│ │ role    ││ role    ││    ││    │   │  │ │role 2.0% │ │
│ │ dose 2% ││ 8.5%    ││4.0%││0.5%│   │  │ └──────────┘ │
└──────────────────────────────────────┘  └──────────────┘
```

**ST03 · Ingredient orbit** · motion M33 · fit: energy drinks, supplements, formulas · avoid with: ST02 and any other loop-heavy section nearby
```
desktop                                   phone
┌──────────────┬───────────────────────┐  ┌──────────────┐
│ SIX THINGS   │    [chip]   [chip]    │  │ SIX THINGS   │
│ INSIDE.      │ [chip]  ( can )  [chip│  │ INSIDE.      │
│ copy         │    [chip]   [chip]    │  │   ( can )    │
│ [See label]  │     (slow ring)       │  │ [chip][chip]←│
└──────────────┴───────────────────────┘  └──────────────┘
```

**ST04 · Nutrition label** · motion M23 · fit: chocolate, snacks, drinks, honest-label food · avoid with: ST02 dossier
```
desktop                                   phone
┌──────────────────┬───────────────────┐  ┌──────────────┐
│ Less sugar than  │ ┌Nutrition Facts┐ │  │ Title        │
│ an apple.        │ │ Calories   58 │ │  │ copy         │
│ copy             │ │ Fat 12.4g 16% │ │  │ [p] bar ₹340 │
│ [p] 72% bar ₹340 │ │ Sugars 6.1g   │ │  │ ┌Nutrition─┐ │
│                  │ └───────────────┘ │  │ │ facts... │ │
└──────────────────┴───────────────────┘  └──────────────┘
```

**ST05 · Accent stats band** · motion M3 · fit: tea, origin brands, company milestones · avoid with: other full-colour bands or marquee lines nearby
```
desktop                                   phone
┌██████████████████████████████████████┐  ┌██████████████┐
│ A tea company, by the numbers.       │  │ Title        │
│ 86          1,200        48          │  │ 86           │
│ gardens     metres       hours       │  │ 1,200        │
├──────────────────────────────────────┤  │ 48           │
│ FIRST FLUSH ✦ HAND-ROLLED ✦ ...  ←   │  │ FIRST FLU ←  │
└██████████████████████████████████████┘  └██████████████┘
```

**ST06 · Comparison bars** · motion M3 · fit: coffee, better-for-you swaps, any "ours vs theirs" claim · avoid with: pricing comparison tables
```
desktop                                   phone
┌──────────────┬───────────────────────┐  ┌──────────────┐
│ Ours vs. the │ Caffeine          mg  │  │ Title        │
│ regular can. │ ██████████████  210   │  │ ■ ours ■ reg │
│ copy         │ ██████          95    │  │ Caffeine     │
│ ■ ours ■ reg │ Sugar              g  │  │ ██████  210  │
│              │ ▏               0     │  │ ███     95   │
└──────────────┴───────────────────────┘  └──────────────┘
```

**ST07 · Proportion bar** · motion M18 · fit: blends (coffee, tea, perfume notes), ingredient splits (built: coffee house blend) · suggested motions: M18, M3 · avoid with: ST06 comparison bars
```
┌──────────────────────────────────────┐
│ Inside House Blend No. 4    copy ₹780│
│ ████████████▓▓▓▓▓▓▓▒▒▒▒▒░░░░··       │
│ 38%         24%    18%  12% 8%       │
│ Coorg       Chikm. Araku Wyd Mal.    │
├──────────────────────────────────────┤
│ notes · roast      [Add] [Subscribe] │
└──────────────────────────────────────┘
```

**ST08 · Provenance ledger** · motion M23 · fit: clean-label food, coffee, chocolate (built: 70% chocolate bar) · suggested motions: M23, M3 · avoid with: ST02 dossier
```
┌──────────────────────────────────────┐
│ Every ingredient, traced.     copy   │
├────────┬─────────┬────────┬────┬─────┤
│ Cacao  │ Varkey  │ Idukki │412 │━━─  │
│ Sugar  │ co-op   │ Mandya │118 │━─   │
│ Salt   │ Agariya │ Kutch  │1520│━━━━ │
├────────┴─────────┴────────┴────┴─────┤
│ avg 413 km           ₹240 [Shop]     │
└──────────────────────────────────────┘
```

**ST09 · Ring gauge row** · motion M3 · fit: skincare results, nutrition, performance (demo: serum study) · suggested motions: M3, M18 · avoid with: ST01
```
┌──────────────────────────────────────┐
│ Headline            intro copy       │
│  ( 94 )   ( 87 )   ( 72 )   ( 98 )   │
│  label    label    label    label    │
│  line     line     line     line     │
│ footnote ................... [Shop]  │
└──────────────────────────────────────┘
```

**ST10 · Ring chart composition** · motion M23 · fit: blends, macros, materials (demo: masala chai blend) · suggested motions: M23, M3 · avoid with: ST04
```
┌──────────────────┬───────────────────┐
│    ╭──────╮      │ Headline          │
│   │  52%   │     │ ● Assam ..... 52% │
│   │ ASSAM  │     │ ● Ginger .... 14% │
│    ╰──────╯      │ ● ...             │
│   (donut spins)  │ [Buy]             │
└──────────────────┴───────────────────┘
```

## PD · Process / steps

**PD01 · Many-to-one beam convergence diagram** · motion M61 · fit: coffee/tea sourcing, supplements, multi-ingredient drinks · suggested motions: M61, M23, M8 · avoid with: ST03 orbit
```
┌──────────────┬───────────────────────┐
│ Headline     │ o─╮                   │
│ • bullet     │ o─┼─╲                 │
│ • bullet     │ o─┼──( HUB )────( ☕ ) │
│ • bullet     │ o─┼─╱                 │
│ [Shop] ₹620  │ o─╯                   │
└──────────────┴───────────────────────┘
```

**PD02 · One object travels across waypoints** · motion M23 · fit: drinks, skincare, sneakers (one product, 3–4 steps) · suggested motions: M23, M35, M42 · avoid with: travelling-object heroes (F1–F8)
```
┌──────────────────────────────────────┐
│ Headline                     copy    │
├──────────────────────────────────────┤
│  (bottle)        Step 1  text        │
│  Step 2 text          ↘ (bottle)     │
│  (bottle) ↙      Step 3  text        │
│  Step 4 text            (bottle)     │
└──────────────────────────────────────┘
```

**PD03 · Auto-advancing steps with progress bars** · motion M6 · fit: subscriptions, kits, apps (shown: coffee subscription) · suggested motions: M6, M18 · avoid with: FT03 tabs
```
┌──────────────────────────────────────┐
│ Headline                    copy     │
├──────────────┬───────────────────────┤
│ Step 1 ▬▬▬── │                       │
│  desc        │   photo (swaps per    │
│ Step 2 ───── │   step)    (chip)     │
│ Step 3/4 ─── │                       │
│ [Start] ₹780 │                       │
└──────────────┴───────────────────────┘
```

**PD04 · Self-typing step log** · motion M6 · fit: coffee brewing, cocktails, recipes, tech · suggested motions: M6, M49, M22 · avoid with: code-like / terminal sections
```
         Brew it like the bar does.
   ┌● ● ● v60-recipe.log ──── 4/6 steps┐
   │ ✓ weigh 18 g · Kodai Ridge…       │
   │ ✓ grind medium-fine · 22 clicks   │
   │ > bloom 30 s · 40 m█              │
   └▬▬▬▬▬▬▬▬▬▬▬▬ timer bar ────────────┘
   18 g │ 250 ml │ 3:15     [Kit ₹2,450]
```

## CP · Comparison / before-after

**CP01 · Full-width drag before/after** · motion M13 · fit: skincare, cleaning, furniture restoration, renovation · suggested motions: M13, M18, M46 · avoid with: FT07 before/after cards
```
┌──────────────────────────────────────┐
│ Headline                     copy    │
│ ┌BEFORE─────────┃──────────AFTER┐    │
│ │ dull / aged   ⇆   restored    │    │
│ └───────────────┃───────────────┘    │
│ piece · hours · price      [Book]    │
└──────────────────────────────────────┘
```

**CP02 · Size line-up on a baseline** · motion M34 · fit: perfume, drinks, candles, bags sold in several sizes · suggested motions: M34, M3, M48 · avoid with: PS06 pack-size selector
```
┌──────────────────────────────────────┐
│ Headline                  copy       │
│                          ▐█▌         │
│              ▐█▌   ▐█▌   ███         │
│   ▐▌   ▐█▌   ███   ███   ███         │
│ ──10ml──30ml──50ml──100ml─────────── │
│        [Add Classic 50 ml]           │
└──────────────────────────────────────┘
```

**CP03 · Colour pairing suggestions** · motion M34 · fit: sneakers, apparel, ceramics, furniture finishes · suggested motions: M34, M6, M18 · avoid with: PS03 variant switcher
```
┌──────────────────────┬───────────────┐
│ Lattice Runner·Clay ₹│ Pairs well with│
│                      │ ●[shoe] Moss ⇄│
│     ( main shoe )    │ ●[shoe] Ink  ⇄│
│                      │ ●[shoe] Chalk⇄│
│ ● ● ● ●     [Add]    │ save ₹1,500   │
└──────────────────────┴───────────────┘
```

## SY · Story / about

**SY01 · Split sticky story** · motion M20 · fit: estate/origin brands (tea, coffee, wine) with a 3-part story · avoid with: another sticky or pinned section right next to it
```
desktop                                   phone
┌───────────────┬──────────────────────┐  ┌──────────────┐
│ Three chapters│ [ photo chapter 1  ] │  │ Three        │
│ in every tin. │ The slope · copy     │  │ chapters...  │
│ ─ 01 slope  ● │ [ photo chapter 2  ] │  │ [ photo 1  ] │
│ ─ 02 pluck    │ The plucking · copy  │  │ title / copy │
│ ─ 03 cup      │ [ photo chapter 3  ] │  │ [ photo 2  ] │
│ (sticky)      │ The cup · copy       │  │ ...          │
└───────────────┴──────────────────────┘  └──────────────┘
```

**SY02 · Timeline strip** · motion M23 · fit: young brands with a growth story (sneakers, D2C) · avoid with: STATS counters next to it (both are number-led)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Eight years, one good shoe.   copy   │  │ Eight years, │
│ 2019 2020 2021 2022 2023 2024 25 26  │  │ one good shoe│
│ ●|||||||||●||||||||||●|||||||||●|||| │  │ [pic] 2019   │
│ [pic 2019][pic 2021][pic 2023][p 25] │  │  title/copy  │
│  title     title     title    title  │  │ [pic] 2021   │
└──────────────────────────────────────┘  │ [pic] 2023.. │
                                          └──────────────┘
```

**SY03 · Founder letter** · motion M23 · fit: craft/family brands (chocolate, ceramics, small-batch food) · avoid with: SP03 (also portrait + big serif text)
```
desktop                                   phone
┌────────┬─────────────────────────────┐  ┌──────────────┐
│[portr.]│ Dear friend, it started     │  │[por] Ira M.  │
│ Ira M. │ with one cocoa pod.         │  │      Founder │
│ Founder│ para · para · para          │  │ Dear friend, │
│        │ ~~signature~~  KOCHI, MARCH │  │ it started.. │
└────────┴─────────────────────────────┘  │ paras        │
                                          │ ~~sig~~      │
                                          └──────────────┘
```

**SY04 · Manifesto** · motion M20 · fit: bold, opinionated brands (energy drink, fitness, tech) · avoid with: SY01 (also M20); a busy gallery right after
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ WE MAKE ENERGY FOR PEOPLE WHO BUILD  │  │ WE MAKE      │
│ THINGS. NO NEON SUGAR CRASH, NO FAKE │  │ ENERGY FOR   │
│ FRUIT ... LEAVE ON THE DESK.         │  │ PEOPLE WHO   │
│──────────────────────────────────────│  │ BUILD ...    │
│ 120 mg · 0 g sugar        [Try pack] │  │ copy         │
└──────────────────────────────────────┘  │ [Try pack]   │
                                          └──────────────┘
```

**SY05 · Heritage chapter** · motion M13 · fit: old houses, perfume, spirits, textiles · avoid with: HR02 (also a full-bleed photo opening on scroll)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ DISTILLED IN KANNAUJ      two lines  │  │ DISTILLED IN │
│ SINCE 1962                of copy    │  │ KANNAUJ ...  │
│██████████ full-bleed image ██████████│  │ copy         │
│██████████████████████████████████████│  │██████████████│
│████████ [ VISIT THE HOUSE ] █████████│  │██ 72svh img ██│
└──────────────────────────────────────┘  │[VISIT HOUSE] │
                                          └──────────────┘
```

**SY06 · Process** · motion M1 · fit: coffee, food, any product with visible craft steps · avoid with: HR03 (also M1 picture curtains)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ From cherry to cup in    copy        │  │ From cherry  │
│ four steps.                          │  │ to cup...    │
│ [pic ] [    ] [pic ] [    ]          │  │ [pic] [pic]  │
│ 01Harv [pic ] 03Rest [pic ]          │  │ 01Har 02Rst  │
│ copy   02Roas copy   04Pour          │  │ [pic] [pic]  │
└──────────────────────────────────────┘  │ 03Res 04Pour │
                                          └──────────────┘
```

**SY07 · Statement with inline image chips** · motion M20 · fit: perfume, fashion, food, any premium story (built: monsoon attar) · suggested motions: M20, M13 · avoid with: SY04 manifesto
```
┌─────────────────────────────┬────────┐
│ We bottle (▭) the hour after│┌──────┐│
│ rain, (▭) smoke from a      ││ big  ││
│ temple lamp and (▭) jasmine ││ prev.││
│ ..., then (▭) let it rest.  │└──────┘│
│ [Discover · ₹3,400]         │ note   │
└─────────────────────────────┴────────┘
```

**SY08 · Fixed title that swaps per chapter** · motion M12 · fit: chaptered stories: origins, collections (built: four tea gardens) · suggested motions: M12, M32 · avoid with: SY01
```
┌──────────────────────────────────────┐
│ copy                    [Shop tin]   │
│  ┌─────┐                             │
│  │ img │  D A R J E E L I N G  ┌────┐│
│  └─────┘   02 / 04 · 2,100 m   │img ││
│        ┌─────┐  (title fixed)  └────┘│
└──────────────────────────────────────┘
```

**SY09 · Sticky image chapters with copy beneath** · motion M13 · fit: hotels, estates, craft brands (demo: hill hotel) · suggested motions: M13, M23 · avoid with: SY01
```
┌──────────────────────────────────────┐
│╭────────── sticky image ───────────╮ │
││ THE HOUSE                 1 of 3  │ │
│╰───────────────────────────────────╯ │
│ Heading          │ copy · price [Btn]│
│ (× 3 chapters, copy slides under)    │
└──────────────────────────────────────┘
```

**SY10 · Sticky-date timeline with scroll beam** · motion M23 · fit: heritage brands, family businesses (demo: bean-to-bar chocolate) · suggested motions: M23, M13 · avoid with: SY02
```
┌──────────────────────────────────────┐
│ HEADLINE              intro [Visit]  │
│ ┃● 1962 (sticky) │ Title / copy      │
│ ┃                │ ▢ ▢               │
│ ┃ beam fills     │ ▢ ▢               │
│ ┃● 1988          │ ...               │
└──────────────────────────────────────┘
```

## TM · Team

**TM01 · Staggered portraits + synced member list** · motion M32 · fit: studios, restaurants, ateliers · suggested motions: M32, M23, M6 · avoid with: GL masonry galleries
```
┌───────────────────────┬──────────────┐
│ ▢     ▢     ▢         │ Headline     │
│ ▢  ▢(colour)▢         │ ● Ira Menon  │
│ ▢     ▢     ▢         │   Kabir Shah │
│       ▢               │   … 8 names  │
└───────────────────────┴──────────────┘
```

**TM02 · Staff directory rows with cursor portrait** · motion M23 · fit: agencies, galleries, studios · suggested motions: M23, M13, M6 · avoid with: PS02, other hover-image lists on the same page
```
┌──────────────────────────────────────┐
│ Headline                     copy    │
├──────────────────────────────────────┤
│ Name          Role     City    Work →│
│ Mira F.       Creative ┌────┐  Work →│
│ Arjun B.      Type     │ ☺  │  Work →│
│ …                      └────┘        │
└──────────────────────────────────────┘
```

**TM03 · Rotating founders wheel** · motion M33 · fit: founder-led brands with 2–3 founders (shown: bean-to-bar chocolate) · suggested motions: M33, M6 · avoid with: ST03 orbit
```
┌──────────────────────────────────────┐
│ Headline              ( portrait )   │
│ ROLE · Name        (o)          (o)  │
│ bio + quote      ╭──────────────╮    │
│ [Story] ₹1,250  ╱   wheel turns  ╲   │
│ ● ○ ○          ╱  (pinned 200svh) ╲  │
└──────────────────────────────────────┘
```

**TM04 · Hover-reveal bio portrait cards** · motion M13 · fit: chefs, makers, therapists (shown: chef's counter restaurant) · suggested motions: M13, M23 · avoid with: GL focus grid
```
┌──────────────────────────────────────┐
│ Headline                    copy     │
├────────┬────────┬────────┬───────── ┤
│ photo  │ photo  │ photo  │ photo    │
│        │ bio ↑  │        │          │
│ ROLE   │ ROLE   │ ROLE   │ ROLE     │
│ Name   │ Name   │ Name   │ Name     │
├────────┴────────┴────────┴──────────┤
│ Chef's counter · ₹6,500     [Book]  │
└──────────────────────────────────────┘
```

**TM05 · Ruled label, split intro, 4-up portraits** · motion M23 · fit: any brand with a small team (shown: furniture workshop) · suggested motions: M23, M18, M1 · avoid with: SY03
```
TEAM ─────────────────────── Jodhpur
┌──────────────────┬───────────────────┐
│ Four pairs of    │ copy              │
│ hands per chair. │ [Visit] Hiring →  │
├────────┬────────┬────────┬──────────┤
│⌜ pic  ⌝│  pic   │  pic   │  pic     │
│ Ira M. │ Kabir  │ Meera  │ Arjun    │
└────────┴────────┴────────┴──────────┘
```

**TM06 · Colour band with overlapping portrait cards** · motion M13 · fit: hotels, clinics, schools (shown: Goa guesthouse) · suggested motions: M13, M34, M31 · avoid with: SP overlapping slider
```
████████████ accent band ██████████████
██  The people who learn your name.  ██
██          intro copy               ██
██ ┌────────┐ ┌────────┐ ┌────────┐  ██
───│  pic   │─│  pic   │─│  pic   │────
   │ name   │ │ name   │ │ name   │
   └────────┘ └────────┘ └────────┘
```

## GL · Gallery

**GL01 · Masonry drift gallery** · motion M32 · fit: fashion and lifestyle lookbooks · avoid with: SP02 (also M32 columns)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ The summer linen lookbook.  copy →   │  │ The summer   │
│ [tall ] [     ] [tall ]              │  │ linen ...    │
│ [     ] [tall ] [     ]              │  │ [tall][    ] │
│ [sq   ] [     ] [sq   ]              │  │ [    ][tall] │
│   ↑ cols drift up/down ↓             │  │ [sq  ][    ] │
└──────────────────────────────────────┘  └──────────────┘
```

**GL02 · Filmstrip drift** · motion M44 · fit: product drops (sneakers, apparel, gear) with names + prices · avoid with: SP01 (also an M44 sideways row)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ FRESH OFF THE LAST.   copy [View all]│  │ FRESH OFF    │
│ ← [pic][pic][pic][pic][pic][pic] ←   │  │ THE LAST.    │
│   name ₹ name ₹ name ₹ name ₹        │  │ copy [View]  │
└──────────────────────────────────────┘  │←[pic][pic]←  │
                                          │ name ₹  name │
                                          └──────────────┘
```

**GL03 · Main image + thumbnail strip** · motion M13 · fit: furniture, interiors, single hero items with variants · avoid with: SY05 (also M13 big image)
```
desktop                                   phone
┌─────────────────────────┬────────────┐  ┌──────────────┐
│                         │ Rooms that │  │ [ main 4:5 ] │
│   [ main image, auto    │ slow you   │  │ [ swaps    ] │
│     cross-fades ]       │ name / ₹   │  │ Rooms that.. │
│                         │ [t][t][t][t]│ │ name / ₹     │
│                         │ [Shop room]│  │ [t][t][t][t] │
└─────────────────────────┴────────────┘  └──────────────┘
```

**GL04 · Social grid** · motion M34 · fit: skincare, beauty, community-led D2C · avoid with: PR01 (also M34 snap-in tiles)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Your skin, unfiltered. (dl)@handle   │  │ Your skin,   │
│ copy                     48.2k[Follow]│ │ unfiltered.  │
│   [ sq ]  [ sq ]  [ sq ]             │  │ (dl)@handle  │
│   [ sq ]  [ sq ]  [ sq ]             │  │ [Follow]     │
└──────────────────────────────────────┘  │ [sq][sq][sq] │
                                          │ [sq][sq][sq] │
                                          └──────────────┘
```

**GL05 · Polaroid scatter** · motion M31 · fit: warm, personal brands (tea, travel, bakeries) · avoid with: PR04 (also M31 tilt-in)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│      Postcards from the estate.      │  │ Postcards    │
│               copy                   │  │ from the...  │
│ ┌──┐  ┌──┐ ┌──┐  ┌──┐ ┌──┐ (tilted)  │  │ ┌──┐  ┌──┐   │
│ │  │  │  │ │  │  │  │ │  │           │  │ └──┘  └──┘   │
│ └cap ┘ └cap┘ └cap┘ └cap┘ └cap┘       │  │ ┌──┐  ┌──┐   │
└──────────────────────────────────────┘  │    ┌──┐      │
                                          └──────────────┘
```

**GL06 · Split opposite scroll** · motion M42 · fit: tech and audio brands with lots of lifestyle shots · avoid with: GL01 (both are photo columns moving with scroll)
```
desktop                                   phone
┌───────────────┬──────────────────────┐  ┌──────────────┐
│ Sound you     │ [img] ↑   [img] ↓    │  │ Sound you    │
│ can see.      │ [img] ↑   [img] ↓    │  │ can see.     │
│ copy          │ [img] ↑   [img] ↓    │  │ [Shop] ₹     │
│ [Shop] from ₹ │ (columns opposite)   │  │ [img]↑[img]↓ │
└───────────────┴──────────────────────┘  │ [img]↑[img]↓ │
                                          └──────────────┘
```

**GL07 · Pinned wordmark under a scrolling 5-column grid** · motion M32 · fit: fashion, sneakers, lookbooks (built: handloom lookbook) · suggested motions: M32, M12, M49 · avoid with: HR04 giant wordmark
```
┌──────────────────────────────────────┐
│ copy                [Shop] [Fitting] │
│ ▢     ▢           ▢                  │
│ ▢  S A A N J H  (pinned)  ▢     ▢    │
│ ▢     ▢     ▢     ▢       ▢   ↑ grid │
└──────────────────────────────────────┘
```

**GL08 · Full-screen image shrinks into a thumbnail row** · motion M13 · fit: hotels, furniture, collections with 5 hero shots (built: 5-room river hotel) · suggested motions: M13, M34 · avoid with: any portal/expanding section; never as the hero
```
┌──────────────────────────────────────┐
│ Five rooms by the river.  copy [Date]│
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ │img◄│ │    │ │    │ │    │ │    │   │
│ └────┘ └────┘ └────┘ └────┘ └────┘   │
│ Suite  Garden Loft   Tower  Villa  ₹ │
└──────────────────────────────────────┘
```

**GL09 · Horizontal image accordion** · motion M18 · fit: menus, hotel rooms, product lines with 5-6 items (built: 6-course tasting menu) · suggested motions: M18, M23, M1 · avoid with: PS03 variant switcher, ExpandingPanels
```
┌──────────────────────────────────────┐
│ Six courses, one long evening.  [Res]│
│ ┌─┐┌─┐┌──────────────────┐┌─┐┌─┐┌─┐ │
│ │A││B││ Kerala crab      ││F││G││S│ │
│ │ ││ ││ copy             ││ ││ ││ │ │
│ └─┘└─┘└──────────────────┘└─┘└─┘└─┘ │
└──────────────────────────────────────┘
```

**GL10 · 3D ring carousel** · motion M33 · fit: perfume, jewellery, sneakers, collections (built: gold jewellery edit) · suggested motions: M33, M31 · avoid with: ST03 orbit, PS12 cube
```
┌──────────────────────────────────────┐
│       The monsoon gold edit.         │
│   ▯   ▭   ┌────┐   ▭   ▯             │
│           │ ▣  │  (ring turns)       │
│           └────┘                     │
│     Lotus Ring · ₹52,300 [View]      │
└──────────────────────────────────────┘
```

**GL11 · Zoom parallax cluster** · motion M13 · fit: hotels, travel, architecture (mid-page only) (built: backwater hotel) · suggested motions: M13, M42 · avoid with: any other expanding moment on the page
```
┌──────────────────────────────────────┐
│ Seven rooms on one lagoon.  copy     │
│   ┌──┐   ┌────────┐                  │
│   │  │   └────────┘                  │
│   │  │   ┌──────┐   ┌─────┐          │
│   └──┘   │centre│   └─────┘  → zoom  │
│ ┌──────┐ └──────┘ ┌───┐  ┌─┐  to full│
└──────────────────────────────────────┘
```

**GL12 · Rotating image sphere beside copy** · motion M33 · fit: flavour ranges, community photos, ingredients (built: 30-flavour energy drink) · suggested motions: M33, M6 · avoid with: ST03 orbit
```
┌────────────────┬─────────────────────┐
│ Thirty         │      ·  o  ·        │
│ flavours, one  │   o   (O) (O)  o    │
│ fridge.  copy  │  · (O) (O) (O) ·    │
│ [Build case]   │   o  (O) (O)  o     │
│ ₹1,440         │      ·  o  ·        │
└────────────────┴─────────────────────┘
```

**GL13 · Pinned horizontal gallery with counter** · motion M41 (row skews with scroll speed; counter rolls) · fit: interiors, hotels, fashion lookbooks (built: restored Kochi house) · suggested motions: M41, M42, M3 · avoid with: GL02 filmstrip
```
┌──────────────────────────────────────┐
│ The Kochi house, room by room.  copy │
│ ┌──────┐┌───┐┌─────┐┌────────┐┌──   │
│ │      ││   ││     ││        ││  ←  │
│ └──────┘└───┘└─────┘└────────┘└──   │
│ Entry   Hall Living Courtyard        │
│                            03 / 12   │
└──────────────────────────────────────┘
```

**GL14 · Grid that morphs into a slideshow** · motion M34 (entry) + FLIP grid⇄slide auto-morph · fit: furniture, ceramics, product details (built: wood-fired stoneware) · suggested motions: M34, M13, M54 · avoid with: GL03 main image + thumbs
```
┌──────────────────────────────────────┐   ┌──────────────────────────────────────┐
│ Stoneware, glazed by hand.   copy    │   │      ┌──────────────────────┐        │
│ ┌────┐┌────┐┌────┐┌────┐             │ ⇄ │      │   big slide  ₹4,200  │        │
│ └────┘└────┘└────┘└────┘             │   │      └──────────────────────┘        │
│ ┌────┐┌────┐┌────┐┌────┐             │   │ ▭ ▭ ▭ ▭ ▭ ▭ ▭  (thumbnail row)       │
└──────────────────────────────────────┘   └──────────────────────────────────────┘
```

**GL15 · Grid tiles that expand in place** · motion M18 · fit: hotels, restaurants, travel (demo: restaurant rooms) · suggested motions: M18, M34 · avoid with: CD make-way grid
```
┌──────────────────────────────────────┐
│ Headline                copy [Book]  │
│ ┌──── wide ─────┬─ nar ─┐            │
│ ├─ nar ─┬──── wide ─────┤            │
│ (one tile grows to cover the grid    │
│  with title + text, others dim)      │
└──────────────────────────────────────┘
```

**GL16 · Four-quadrant converge** · motion M13 · fit: fashion, interiors (mid-page) (demo: khadi edit) · suggested motions: M13, M42 · avoid with: other converging/expanding sections
```
┌──────────────────────────────────────┐
│ ▢                                 ▢  │
│        → ▢▢ ←   (scroll)             │
│        → ▢▢ ←                        │
│ ▢                                 ▢  │
│ then one fills the screen + caption  │
└──────────────────────────────────────┘
```

**GL17 · Perspective floor grid flying toward you** · motion M31 · fit: architecture, sneakers, tech (demo: sneaker wall) · suggested motions: M31, M32 · avoid with: tilted heroes
```
┌──────────────────────────────────────┐
│        EVERY PAIR, ON THE FLOOR      │
│        copy  [Shop] [New]            │
│      ▫ ▫ ▫ ▫ ▫ ▫ ▫  (horizon)        │
│    ▢  ▢  ▢  ▢  ▢  ▢                  │
│  ▣   ▣   ▣   ▣   ▣  (rolls toward)   │
└──────────────────────────────────────┘
```

**GL18 · Twin orbit roll** · motion M33 · fit: collections with names (perfume, wine, drops) (demo: perfumes) · suggested motions: M33, M42 · avoid with: other orbit sections
```
┌──────────────────────────────────────┐
│ Headline             copy            │
│  ╲ Rose Attar             ▢ ╱        │
│ ( MONSOON OUD   ·    [ IMG ] )       │
│  ╱ Neroli Ghat            ▢ ╲        │
│        notes · ₹4,200 [Add]          │
└──────────────────────────────────────┘
```

## VD · Video feature

**VD01 · Pinned frame-scrub with segment cards** · motion M13 · fit: drinks, sneakers, cars, any filmed product · suggested motions: M13, M6 · avoid with: any other pinned scrub (one per site)
```
┌──────────────────────────────────────┐
│ Inside one     [glass card 1]        │
│ orange can.          ( product )     │
│ [glass card 3]  scrubs with scroll   │
│                       [glass card 4] │
│ FRAME 041/144 ━━━━━━──────── ₹120    │
└──────────────────────────────────────┘
```

**VD02 · Scroll-expanding media window (mid-page)** · motion M42 · fit: hotels, cars, launches (never as the hero) · suggested motions: M42, M18 · avoid with: any other expanding/portal moment; never as the hero
```
┌──────────────────────────────────────┐
│                                      │
│ Arrive  ┌──────────┐  unhurried      │
│         │  film ▶  │  (card grows    │
│         └──────────┘   to full)      │
│                     ₹14,500 [Dates]  │
└──────────────────────────────────────┘
```

**VD03 · Sticky video chapters** · motion M23 · fit: origins, process, hospitality · suggested motions: M23, M13 · avoid with: SY01 split sticky story
```
┌──────────────────────────────────────┐
│ ░░ sticky full-screen film ░░░░░░░░░ │
│ Chapter 2 (place)   ░ crossfades ░░░ │
│ Rested for 18 h.    ░ per chapter ░░ │
│ copy …              ░░░░░░░░░░░░░░░░ │
│                     ● Now playing    │
└──────────────────────────────────────┘
```

**VD04 · Vertical video track + synced titles** · motion M42 · fit: recipe brands, studios, collections, course creators · suggested motions: M42, M23 · avoid with: GL06 (another column of scrolling media)
```
┌──────────────┬───────────────────────┐
│ Cook along…  │ ┌───────────────────┐ │
│ Fish curry ◀ │ │ ▶ video tile      │ │
│ Naan         │ └───────────────────┘ │
│ Corn chaat   │ ┌───────────────────┐ │
│ Coffee flan  │ │ ▶ video tile  ↑   │ │
│ [Recipe box] │ (track scrolls, pinned)│
└──────────────┴───────────────────────┘
```

**VD05 · Showreel on an object's screen** · motion M31 · fit: audio, TVs, home cinema, studios, hotels · suggested motions: M31, M13 · avoid with: tilted-screen heroes (two device mock-ups)
```
┌──────────────────────────────────────┐
│ The room is the speaker.        copy │
├─────────────────────────┬────────────┤
│ ▌▌  ┌────────────┐  ▌▌  │ Rain…  2:14│
│ ▌▌  │ ▶ clip     │  ▌▌  │ ▬▬▬▬▬      │
│ ▌▌  └────────────┘  ▌▌  │ Live…  3:40│
│    ▬▬▬▬ console ▬▬▬▬    │ ₹ [Book]   │
└─────────────────────────┴────────────┘
```

**VD06 · Video-to-colour fade banner** · motion M64 · fit: any brand with a loop clip (built for an energy drink) · suggested motions: M64, M13, M12 · avoid with: CT03 and other full-colour CTA bands
```
┌──────────────────────────────────────┐
│█ SOLID BRAND ████▓▓▒▒░░  video loop  │
│█ RUN HOT.     ███▓▓▒▒░░  (muted,     │
│█ STAY SHARP.  ███▓▓▒▒░░   pushing in)│
│█ copy         ███▓▓▒▒░░              │
│█ [✦ Shop 12-pack] ₹120 ░░  ● caption │
└──────────────────────────────────────┘
```

**VD07 · Full-screen video with play cursor** · motion M13 · fit: fashion films, hotels, music, brand films · suggested motions: M13, M71, M1 · avoid with: other full-screen video sections / video heroes
```
┌──────────────────────────────────────┐
│          full-viewport loop          │
│                    ( ▶ PLAY )        │
│                     ↖ follows cursor │
│ A film · 1:48                        │
│ Monsoon, in linen.     [Shop edit]   │
└──────────────────────────────────────┘
```

## SP · Social proof (fake names only)

**SP01 · Two-row review marquee** · motion M44 · fit: high-volume consumer products (drinks, snacks) · avoid with: GL02 (also an M44 drift row)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ 40,000 desks can't be wrong. ★★★★★4.8│  │ 40,000 desks │
│ ░[review][review][review][review] →░ │  │ can't be...  │
│ ░← [review][review][review][review]░ │  │ ★★★★★ 4.8    │
└──────────────────────────────────────┘  │░[rev][rev]→░ │
                                          │░←[rev][rev]░ │
                                          └──────────────┘
```

**SP02 · Three-column review wall** · motion M32 · fit: skincare and wellness, where many short reviews build trust · avoid with: GL01 (also M32)
```
desktop                                   phone
┌─────────────┬────────────────────────┐  ┌──────────────┐
│ Skin people │░[rev] [rev] [rev]     ░│  │ Skin people  │
│ talk about. │ [rev] [rev] [rev]      │  │ talk about.  │
│ copy        │ [rev] [rev] [rev]      │  │ 4.9 ★★★★★    │
│ 4.9 ★★★★★   │ [rev] [rev] [rev]      │  │ [Read all]   │
│ [Read all]  │░(cols drift, faded)   ░│  │░[review]    ░│
└─────────────┴────────────────────────┘  │░[review]    ░│
                                          └──────────────┘
```

**SP03 · Large quote + portrait** · motion M23 · fit: considered purchases (furniture, mattresses, cars) · avoid with: SY03 (also portrait + big serif text)
```
desktop                                   phone
┌──────────────┬───────────────────────┐  ┌──────────────┐
│              │ "                     │  │ [ portrait ] │
│ [ portrait ] │ The sofa outlived two │  │ "            │
│              │ apartments and ...    │  │ The sofa     │
│              │───────────────────────│  │ outlived ... │
│              │ Kabir S. ★★★★★ See →  │  │ Kabir ★★★★★  │
└──────────────┴───────────────────────┘  └──────────────┘
```

**SP04 · Press wall** · motion M6 · fit: luxury and beauty (perfume, fashion, hospitality) · avoid with: PR06 (also M6 with big serif rows)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ "A perfume that smells like   MORNING│  │ "A perfume   │
│  rain on hot stone."          LEDGER │  │ that smells" │
│──────────────────────────────────────│  │ MORNING LDGR │
│ ATELIER   "Quietly the most beautiful│  │──────────────│
│ WEEKLY     bottle on the shelf."     │  │ "Quietly..." │
│──────────────────────────────────────│  │ ATELIER WKLY │
│ "It lasts until dinner..."  SALT&SIG │  │──────────────│
└──────────────────────────────────────┘  └──────────────┘
```

**SP05 · Rating summary** · motion M3 · fit: electronics and gadgets with many reviews · avoid with: STATS/PR02 (also M3 counters)
```
desktop                                   phone
┌─────────────┬────────────────────────┐  ┌──────────────┐
│ Rated by    │ [review] [review]      │  │ Rated by ... │
│ people...   │          [review] [rev]│  │ 4.9 ★★★★★    │
│ 4.9 ★★★★★   │                        │  │ 5★ ████████  │
│ 5★ ████████ │                        │  │ 4★ █         │
│ 4★ █  ...   │ [Write a review]       │  │ [review] x3  │
└─────────────┴────────────────────────┘  └──────────────┘
```

**SP06 · Trust strip** · motion M18 · fit: B2B-leaning or ethical brands (coffee, food, sustainable goods) · avoid with: PR03 (also M18 corner unfold)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Poured in 380 cafés.        copy     │  │ Poured in    │
│──────────────────────────────────────│  │ 380 cafés.   │
│ logo  logo  logo  logo  logo  logo   │  │ logo logo .. │
│──────────────────────────────────────│  │ [380 cafés ] │
│ [380 cafés] [42 farms] [96 h door]   │  │ [42 farms  ] │
│ (✓)Fair Farm (✓)Carbon (✓)Small Batch│  │ (✓)badge x3  │
└──────────────────────────────────────┘  └──────────────┘
```

**SP07 · Counter-scrolling portrait reel** · motion M42 · fit: skincare, fitness, community brands (built as a skincare before/after reel) · suggested motions: M42, M12, M32 · avoid with: GL06 split scroll or any other opposite-scroll column section
```
┌──────────────────────────┬───────────┐
│ Skin, seen up close.     │ copy ★4.8 │
├────────┬────────┬────────┴───────────┤
│ ▼ pic  │ ▲ pic  │ ▼ pic   (fade edges)│
│ ▼ pic  │ ▲ pic  │ ▼ pic              │
├────────┴────────┴────────────────────┤
│   "quote rising letter by letter"    │
│        (av) Name · product   ━ ─ ─   │
└──────────────────────────────────────┘
```

**SP08 · Vertical counter-scrolling review columns** · motion M32 · fit: drinks, snacks, beauty with many reviews (built for a roasted-makhana snack) · suggested motions: M32, M44, M3 · avoid with: SP01 horizontal marquee (two moving review walls)
```
┌──────────────────────────────────────┐
│     Twelve thousand crunchy opinions │
│        copy · ★★★★★ 4.9 · 12,480     │
├────────┬────────┬────────┬───────────┤
│ ▲card  │ ▼card  │ ▲card  │ ▼card     │
│ ▲card  │ ▼card  │ ▲card  │ ▼card     │ 500px, faded
├────────┴────────┴────────┴───────────┤
│       [Try the tin] [Read all]       │
└──────────────────────────────────────┘
```

**SP09 · Inline-name testimonials paragraph** · motion M20 · fit: perfume, fashion, editorial brands (built for an eau de parfum) · suggested motions: M20, M6 · avoid with: SY04 manifesto or any other big-paragraph statement
```
┌──────────────────────────────────────┐
│ Nocturne No. 7 was made for one      │
│ winter. _Anaya Rao_ calls it rain…   │
│   ┌─(av) ★★★★★ "quote"─┐ _Zoya_ …    │
│   └────────────────────┘  _Kabir_ …  │
├──────────────────────────────────────┤
│ product line          ₹3,850 [Add]   │
└──────────────────────────────────────┘
```

**SP10 · Auto-cycling stacked review cards** · motion M40 · fit: D2C stores, skincare, haircare, anything with many short reviews · suggested motions: M40, M3, M6 · avoid with: an HR card-stack hero or another deck/stack section on the same page
```
┌──────────────┬───────────────────────┐
│ Headline     │      ┌──────────┐┐┐    │
│ 4.9 ★★★★★    │      │ "quote"  │││    │
│ ▬▬▬▬ bars    │      │ ◯ name   │││    │
│ [Read all]   │      └──────────┘┘┘    │
└──────────────┴───────────────────────┘
```

**SP11 · Live order feed** · motion M3 · fit: drinks, snacks, restaurants, launches and drops · suggested motions: M3, M6, M23 · avoid with: SP05 or any other ticker/marquee proof right next to it
```
┌──────────────┬───────────────────────┐
│ Headline     │  ┌ ◯ Ananya · 3× … now┐│
│ ● LIVE       │  ┌ ◯ Vikram · 2× … 1m ┐│
│ 2,184        │  ┌ ◯ Nisha  · 4× … 2m ┐│
│ orders today │  ┌ ◯ Farhan ·    … 4m ┐│
│ [Order]      │     ░░ fades out ░░    │
└──────────────┴───────────────────────┘
```

**SP12 · Quote cloud with focus blur** · motion M6 · fit: perfume, tea, slow/craft brands, hospitality · suggested motions: M6, M20, M23 · avoid with: SP02 review wall or another big-type statement section next to it
```
┌──────────────────────────────────────┐
│ Headline                   short copy│
│ ░"quote"░ ░"quote"░ "SHARP QUOTE"    │
│ ░"quote"░ ░"quote"░ ░"quote"░ ░"q"░  │
│ ░"quote"░ ░"quote"░                  │
├──────────────────────────────────────┤
│ ★★★★★ 4.9            from ₹540 [Shop]│
└──────────────────────────────────────┘
```

## LG · Logos / press

**LG01 · Flip rolodex logo slots** · motion M6 · fit: stockist-led food, drinks, beauty · suggested motions: M6, M48, M12 · avoid with: SP06 trust strip, LG02
```
┌──────────────────────────────────────┐
│        Found on the best shelves.    │
│              copy                    │
├───────┬───────┬───────┬───────┬──────┤
│ logo  │ ⟲logo │ logo  │ logo  │ logo │
└───────┴───────┴───────┴───────┴──────┘
```

**LG02 · Split headline + vertical logo ticker** · motion M23 · fit: cafés stocking, wholesale, B2B-leaning brands · suggested motions: M23, M44, M6 · avoid with: SP marquees, LG01
```
┌──────────────────┬───────────────────┐
│ Headline         │     ┊ ░fade░ ┊    │
│ copy             │     ┊ Café A ┊ ↑  │
│ [Wholesale]      │     ┊ Café B ┊ ↑  │
│                  │     ┊ ░fade░ ┊    │
└──────────────────┴───────────────────┘
```

**LG03 · Endless logo strip with edge fades** · motion M44 · fit: any brand with stockists or press · suggested motions: M44, M6 · avoid with: SP01 marquee
```
┌──────────────────────────────────────┐
│     STOCKED BY 300 SHOPS · AS SEEN IN │
│ ░ Mark   Mark   Mark   Mark   Mark ░ │
│   ← drifts forever, bends on scroll  │
└──────────────────────────────────────┘
```

**LG04 · Logo grid with merged CTA cell** · motion M3 · fit: coffee, wholesale, venues · suggested motions: M3, M34 · avoid with: SP04 press wall
```
┌──────────────────────────────────────┐
│ Headline                    copy     │
├─────────────────┬────────┬───────────┤
│ Trusted by 2,000│  logo  │   logo    │
│ cafés  [Open →] │        │           │
├────────┬────────┼────────┼───────────┤
│ logo   │ logo   │ logo   │ logo      │
├────────┼────────┼────────┼───────────┤
│ logo   │ logo   │ logo   │ logo      │
└────────┴────────┴────────┴───────────┘
```

**LG05 · Ruler carousel of logos** · motion M48 · fit: watches, tools, precise brands · suggested motions: M48, M44, M3 · avoid with: other marquees / logo strips
```
┌──────────────────────────────────────┐
│ Trusted on the bench.      1,240     │
│              ▼                       │
│  Kessel  HOURMARK  Orrery  Tock      │
│ |||||||||||||┃||||||||||||||||||||||| │
│   20 mm    30 mm    40 mm            │
│ copy                  [Stockist]     │
└──────────────────────────────────────┘
```

## PR · Pricing / shop

**PR01 · Three tiers, raised middle** · motion M34 · fit: subscriptions (coffee, meal kits, software) · avoid with: GL04 (also M34)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│       Fresh beans, on repeat.        │  │ Fresh beans, │
│ ┌───────┐ ┏━━━━━━━━┓ ┌───────┐       │  │ on repeat.   │
│ │Drip   │ ┃Roaster ┃ │Café   │       │  │ [Drip ₹899 ] │
│ │₹899   │ ┃₹1,499  ┃ │₹2,399 │       │  │ [■Roaster  ■]│
│ │✓✓✓    │ ┃• • • • ┃ │✓✓✓    │       │  │ [Café ₹2399] │
│ └[Pick]─┘ ┗[Start]━┛ └[Pick]─┘       │  └──────────────┘
└──────────────────────────────────────┘
```

**PR02 · Subscribe vs one-time toggle** · motion M3 · fit: consumables bought monthly (drinks, supplements, pet food) · avoid with: SP05 (also M3)
```
desktop                                   phone
┌──────────────────┬───────────────────┐  ┌──────────────┐
│                  │ The 24-can case.  │  │  (cans glow) │
│   ( two cans     │ copy              │  │ The 24-can   │
│     on glow )    │ (●Subscribe|One)  │  │ case. copy   │
│                  │ ₹1,199 [save ₹300]│  │ (Sub|One)    │
│                  │ [Subscribe] 18,400│  │ ₹1,199 [save]│
└──────────────────┴───────────────────┘  │ [Subscribe]  │
                                          └──────────────┘
```

**PR03 · Two bundle cards** · motion M18 · fit: apparel and footwear, gift sets · avoid with: SP06 (also M18)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ BETTER IN PAIRS.          copy       │  │ BETTER IN    │
│ ┌─────────────────┐┌─────────────────┐│ │ PAIRS. copy  │
│ │[big ][sm]       ││[big ][sm]       ││ │ [big][sm]    │
│ │[pic ][sm]       ││[pic ][sm]       ││ │ Daily Pair   │
│ │Daily Pair [save]││Weekender [save] ││ │ [save ₹1798] │
│ │₹9,499 ₹11k [Add]││₹14,999   [Add]  ││ │ ₹ [Add]      │
│ └─────────────────┘└─────────────────┘│ │ (card 2)     │
└──────────────────────────────────────┘  └──────────────┘
```

**PR04 · Pricing bento** · motion M31 · fit: premium sets with extras (perfume, skincare, gifting) · avoid with: GL05 (also M31)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Build your scent wardrobe.           │  │ Build your   │
│ ┌──────────────────┐┌──────┐┌──────┐ │  │ scent ...    │
│ │ Flagship  (img)  ││atomi.││engrav│ │  │ [ Flagship ] │
│ │ The Full Wardrobe│└──────┘└──────┘ │  │ [ ₹18,900  ] │
│ │ ₹18,900 [Reserve]│┌──────┐┌──────┐ │  │ [add][add]   │
│ │                  ││refill││wrap  │ │  │ [add][add]   │
│ └──────────────────┘└──────┘└──────┘ │  └──────────────┘
└──────────────────────────────────────┘
```

**PR05 · Comparison table, sticky header** · motion M23 · fit: electronics and tiered products with specs · avoid with: SY02/SY03 (also M23); FAQ accordion right after (also a row list)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Pick the pair that fits your day.    │  │ Pick the pair│
│        │ Halo  │ Halo One │ Studio   │◄ │     │H │H1│S│◄
│ Battery│ 30 h  │ 40 h     │ 60 h     │  │ Batt│30│40│6│
│ ANC    │  —    │  ✓       │  ✓       │  │ ANC │— │✓ │✓│
│ ... 8 rows                           │  │ ...8 rows    │
│        │ Buy → │ [Buy]    │ Buy →    │  │     │B │B │B│
└──────────────────────────────────────┘  └──────────────┘
```

**PR06 · Stockist ledger** · motion M6 · fit: retail-distributed brands (tea, food, wine, books) · avoid with: SP04 (also M6 serif rows)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Find our tea on a shelf  [Stockist]  │  │ Find our tea │
│══════════════════════════════════════│  │ [Stockist]   │
│ Mumbai       Second Shelf  Bandra  → │  │ Mumbai       │
│              Pantry Room   Colaba  → │  │ shop  area → │
│ Bengaluru    Common Store  Indira. → │  │ Bengaluru    │
│ (Pune)       COMING SOON · Mar 2027  │  │ shop  area → │
│ (Kochi)      COMING SOON · May 2027  │  │ (Pune) soon  │
└──────────────────────────────────────┘  └──────────────┘
```

**PR07 · Build-your-box add-ons + sticky total** · motion M34 · fit: coffee, snacks, skincare kits, gift boxes (built as a coffee subscription box) · suggested motions: M34, M3 · avoid with: PS07 configurator (two builders on one page)
```
┌───────────────────────┬──────────────┐
│ Build the box…  copy  │┌────────────┐│
│ [▢] Base box   ₹1,200 ││ ₹3,390     ││
│ [▢] Add-on  +₹540 (●○)││ base       ││
│ [▢] Add-on +₹2,400(○●)││ + add-ons  ││
│ [▢] Add-on  +₹890 (●○)││ [Checkout] ││ sticky
│ …                     │└────────────┘│
└───────────────────────┴──────────────┘
```

**PR08 · Savings calculator** · motion M48 · fit: subscriptions, refills, coffee/energy drinks vs café spend, utilities · suggested motions: M48, M3 · avoid with: an ST counters/stats section right before or after
```
┌──────────────────┬───────────────────┐
│ Headline         │ You keep / year   │
│ copy             │ ₹1,44,540 (rolls) │
│ Cups/day      2  │ café      ₹1,89,800│
│ ●━━━━○─────────  │ refills   ₹45,260 │
│ [café price ₹260]│ free months  76 [→]│
└──────────────────┴───────────────────┘
```

**PR09 · Single centred offer card** · motion M18 · fit: single-SKU D2C, pre-orders, launch boxes, limited runs · suggested motions: M18, M64, M31 · avoid with: PR03 bundles or another centred card CTA nearby
```
┌──────────────────────────────────────┐
│          ONE CRATE. HEADLINE         │
│          ┌──────────────┐            │
│          │  ( product ) │            │
│          │ ₹2,880 ₹3,360│            │
│          │ ✓✓✓✓✓✓       │            │
│          │[✦ Pre-order ]│            │
│          │ ↺   🚚   🔒  │            │
│          └──────────────┘            │
└──────────────────────────────────────┘
```

## MN · Menu / price list

**MN01 · Two-column course menu with dotted leaders** · motion M23 · fit: restaurants, cafés, bars, supper clubs · suggested motions: M23, M6, M20 · avoid with: PR06 ledger (two leader/ledger lists on one page)
```
┌──────────────────────────────────────┐
│        Supper at the long table.     │
├──────────────────┬───────────────────┤
│ Starters         │ Desserts          │
│ Dish ······ ₹380 │ Dish ······ ₹420  │
│ Mains            │ Drinks            │
│ Dish ····· ₹1,180│ Dish ······ ₹320  │
└──────────────────┴───────────────────┘
```

**MN02 · Tasting menu sequence** · motion M13 · fit: fine dining, omakase, tasting rooms, chef's tables · suggested motions: M13, M23, M1 · avoid with: SY04 (another long single-column scroll story)
```
┌──────────────────────────────────────┐
│      Twelve courses, one evening.    │
│          01 dish · pairing           │
│          …04                         │
│▓▓▓▓▓▓▓▓▓▓ full-bleed photo ▓▓▓▓▓▓▓▓▓▓│
│          05 … 08 · photo · 09 … 12   │
│          ₹9,500 per guest            │
└──────────────────────────────────────┘
```

**MN03 · Menu index + sticky service card** · motion M23 · fit: restaurants, wine bars, cafés with several menus · suggested motions: M23, M6 · avoid with: an FQ ledger / accordion list right after (two big row lists in a row)
```
┌───────────────────────┬──────────────┐
│ Five menus, one table │ ● Open now   │
│ À la carte        (→) │ Service hours│
│ Bar lunch         (→) │ Lunch  12–15 │
│ Desserts          (→) │ Booking rules│
│ Drinks / Wine     (→) │ Corkage [Book]│
└───────────────────────┴──────────────┘
```

**MN04 · Two-half menu split by a rule** · motion M1 · fit: cafés (brunch + coffee), bakeries · suggested motions: M1, M23, M6 · avoid with: FT05
```
Morrow, all day.                  copy
──────────────────┬──────────────────
 ◎ Brunch 8–15    │ ☕ Coffee 7:30–18
 copy             │ copy
 ┌──┐┌──┐┌──┐┌──┐→│ Brewing … ₹260
 └──┘└──┘└──┘└──┘ │ Not coffee … ₹140
──────────────────┴──────────────────
```

## BK · Booking / reservation

**BK01 · Hero-docked availability bar** · motion M18 · fit: hotels, villas, restaurants, spas · suggested motions: M18, M71, M13 · avoid with: another bar-style strip right below the hero
```
┌──────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓ full-bleed photo ▓▓▓▓▓▓▓▓▓▓ │
│ A quiet house                        │
│ by the sea.                          │
│┌─────┬──────┬─────────┬────────┬────┐│
││Arriv│Depart│Adults -2+│Kids -0+│Rate││
│└─────┴──────┴─────────┴────────┴────┘│
└──────────────────────────────────────┘
```

**BK02 · Detail page with sticky booking card** · motion M3 · fit: yacht charters, villas, rooms, private dining · suggested motions: M3, M13, M23 · avoid with: PS04 spotlight + buy box on the same page
```
┌────────────────────────────┬─────────┐
│ Saira, a slow yacht…       │┌───────┐│
│ ▓▓▓▓▓ gallery ▓▓▓▓▓  2/4   ││₹4,80,000│
│ ▢ ▢ ▢ ▢ thumbs             ││dates  ││
│ Length · Cabins · Guests   ││guests ││
│ description · amenities    ││[Req.] ││
│                            │└sticky─┘│
└────────────────────────────┴─────────┘
```

**BK03 · Two-month range picker + stay summary** · motion M3 · fit: hotels, cabins, retreats, villa rentals · suggested motions: M3, M34 · avoid with: another calendar (EV month grid) on the same page
```
┌──────────────────────────┬───────────┐
│ Pick your nights...      │ copy      │
├────────────┬─────────────┼───────────┤
│ Dec 2026   │ Jan 2027    │ In · Out  │
│ ▢▢▢▢▢▢▢    │ ▢▢▢▢▢▢▢     │ 5 nights  │
│ ▢▢▢●━━━━   │ ━●▢▢▢▢▢     │ ₹ total   │
│ legend                   │ [Reserve] │
└────────────┴─────────────┴───────────┘
```

**BK04 · Table booking split: contact + form** · motion M23 · fit: restaurants, bars, supper clubs (built for a coastal supper club) · suggested motions: M23, M64, M6 · avoid with: CC split contact forms on the same page
```
┌────────────┬──────────────────────────┐
│ Headline   │ Reserve a table   ₹ note │
│ Phone ──   │ [Name    ] [Email     ]  │
│ Email ──   │ [Phone   ] [Guests ▾  ]  │
│ Hours ──   │ [Date ▾  ] [Time ▾    ]  │
│ ● 3 left   │ [ note for the kitchen ] │
│ (glow)     │ [≈≈≈ Reserve (shimmer) ≈]│
└────────────┴──────────────────────────┘
```

## LS · Listings / rooms / property

**LS01 · Property cards with photo carousel + metrics** · motion M34 · fit: real estate, villas, rentals, farm stays · suggested motions: M34, M13, M31 · avoid with: PS01 (another 3-col card grid)
```
┌──────────────────────────────────────┐
│ Homes with land around them.  copy   │
│┌────────┐ ┌────────┐ ┌────────┐      │
││ photo ●○○○│ photo │ │ photo  │      │
│└────────┘ └────────┘ └────────┘      │
│ ⌂m² ▭ha ▬4 ◡5 · title · town · ₹Cr   │
│           ← 1 2 3 4 … 9 →            │
└──────────────────────────────────────┘
```

**LS02 · Finder: filters + results + map toggle** · motion M23 · fit: villa groups, hotel groups, real estate, rentals · suggested motions: M23, M34, M18 · avoid with: PS filter grids
```
┌──────────────────────────────────────┐
│ 48 villas · dates   Sort ▾ [List|Map]│
├────────┬─────────────────────────────┤
│ Dates  │ ┌────┐ ┌────┐ ┌────┐        │
│ Price ═│ │card│ │card│ │card│        │
│ Guests │ └────┘ └────┘ └────┘        │
│ Chips  │ (Map: list rows | pin map)  │
│ Clear  │       [Load more]           │
└────────┴─────────────────────────────┘
```

**LS03 · Residence carousel with status chips** · motion M34 · fit: hotel groups, developments, property openings · suggested motions: M34, M44 · avoid with: LS card grids (same property cards twice)
```
┌──────────────────────────────────────┐
│ Six houses, opening...   01—06 (←)(→)│
├───────────┬───────────┬──────────────┤
│[Opening27]│[Now open] │[Opening │    │
│  photo    │  photo    │  photo  │    │
│ Name      │ Name      │ Name    │    │
│ 8 suites·…│ 12 suites │         │    │
├───────────┴───────────┴──────────────┤
│ founding note           [Join list]  │
└──────────────────────────────────────┘
```

## MP · Locations / map

**MP01 · City list synced with a pin map** · motion M3 · fit: café chains, stores, stockists, clinics · suggested motions: M3, M23, M18 · avoid with: PR06 stockist ledger
```
┌────────────┬─────────────────────────┐
│ Find a café│   · · · dotted · · ·    │
│ 64 in 6    │  · · ◉ Delhi · · ·      │
│ ▌Delhi   14│   · · · · ● · ·         │
│  Mumbai  18│  ● · · · · · ·          │
│  Bengaluru │ [Open now: Delhi]       │
└────────────┴─────────────────────────┘
```

**MP02 · Rising globe under a giant word** · motion M33 · fit: exporters, travel, global D2C brands, shipping · suggested motions: M33, M12, M61 · avoid with: CC globe (two globes on a page)
```
┌──────────────────────────────────────┐
│            EVERYWHERE.               │
│   copy · Mumbai London Dubai …       │
│          .·´ ˙ • ˙ `·.               │
│       .´ · dotted globe · `.         │
│▁▁▁▁▁▁▁ cropped + radial shade ▁▁▁▁▁▁▁│
└──────────────────────────────────────┘
```

**MP03 · Scroll-zoom region map** · motion M13 · fit: tea, coffee, wine origins, travel and tourism · suggested motions: M13, M23 · avoid with: SY01 (another pinned scroll story next to it)
```
┌──────────────┬───────────────────────┐
│ Up into the  │        ╭─╮            │
│ tea hills.   │      ╭╯   ╰╮  ◉ Uva   │
│┌────────────┐│     │ ◉Dimbula│ (zoom) │
││Region 2/3  ││      ╰╮ ◉  ╭╯         │
││Uva · ₹680  ││        ╰──╯           │
│└────────────┘│   pinned ≤200vh       │
└──────────────┴───────────────────────┘
```

**MP04 · Full-bleed map with floating location card** · motion M18 · fit: restaurant groups, bakeries, boutiques, studios with several branches · suggested motions: M18, M13 · avoid with: a CC contact section with a map backdrop
```
┌──────────────────────────────────────┐
│┌──────────┐ ═══╪════╪═══  ◉ Indira.  │
││Four ovens│    │ ~~river~~ │         │
││address   │ ═══╪════╪═══╪═══         │
││• loc 1 → │  ◉ Malles.   ◉ White.    │
││• loc 2   │ (map flies to the pin)   │
│└──────────┘                          │
└──────────────────────────────────────┘
```

**MP05 · Dotted world map with flight arcs** · motion M6 · fit: exporters, travel, coffee/spice sourcing (built for a coffee estate) · suggested motions: M6, M33, M23 · avoid with: other map sections
```
┌──────────────────────────────────────┐
│            Bean routes.              │
│        short paragraph               │
│ ·:·:::·  ·::::·  ╭──╮ ·::::::·       │
│  ·:::·╭───────── ● home ──╮·::·      │
│   ·:·   ·::·      ·:·    ●  ·::·     │
├────────┬─────────┬─────────┬─────────┤
│ 5 ports│ 21 days │ 1,250 m │ ₹980/kg │
└────────┴─────────┴─────────┴─────────┘
```

**MP06 · Illustrated map with numbered pins + legend** · motion M34 · fit: hotel neighbourhoods, resorts, festivals, campuses · suggested motions: M34, M23, M18 · avoid with: other map sections
```
┌────────────────────────────┬─────────┐
│ Around the creek.     copy │         │
├────────────────────────────┼─────────┤
│  ~creek~  ②    ③   ⑦      │ ① Hotel │
│ ⑤  ═road══════════        │▓② Ferry▓│
│      ①       ④    fields  │ ③ Market│
│  fields       ~~sea~~ ⑥   │ ④ …   → │
└────────────────────────────┴─────────┘
```

## EV · Events / schedule

**EV01 · Agenda list grouped by day** · motion M6 · fit: festivals, conferences, hotels' weekly programmes, retreats · suggested motions: M6, M23, M20 · avoid with: PR06 stockist ledger
```
┌──────────────────────────────────────┐
│ THREE DAYS BY THE LAKE.   copy [Pass]│
├─────────┬────────────────────────────┤
│ FRI 14  │ 5:30 pm  Title   Place  Tag│
│         │ 7:00 pm  Title   Place  Tag│
├─────────┼────────────────────────────┤
│ SAT 15  │ 7:00 am  Title   Place  Tag│
└─────────┴────────────────────────────┘
```

**EV02 · Ticket cards with sold-out state** · motion M18 · fit: events, supper clubs, launch parties, festivals · suggested motions: M18, M34, M3 · avoid with: PR01 tier cards on the same page
```
┌──────────────────────────────────────┐
│        Passes for the weekend.       │
│┌──────────┐┌──────────┐┌──────────┐  │
││Early ₹̶4̶5̶ ││Student   ││Regular   │  │
││ SOLD OUT ││ ₹3,200   ││ ₹6,000   │  │
│(- - - - -)(- - - - - -)(- - - - - -) │
│ perk · perk · perk / perk · perk     │
└──────────────────────────────────────┘
```

**EV03 · 'Happening now' mixed-card carousel** · motion M44 · fit: galleries, museums, venues, hotels with an events programme · suggested motions: M44, M34 · avoid with: GL02 filmstrip (two sideways strips)
```
┌──────────────────────────────────────┐
│ Happening!                    (←)(→) │
├───────┬──────┬────────┬──────┬───────┤
│[Now on│[Oct21│[Opens  │(tour)│[Oct31 │
│ image]│  21  │ image] │ (○)  │  31   │
│ title │ title│ title  │ title│ title │
│   → drifts sideways, bends on scroll │
└──────────────────────────────────────┘
```

**EV04 · Day-part triptych** · motion M1 · fit: resorts, cafés, wellness, tea estates (mornings / afternoons / evenings) · suggested motions: M1, M23, M13 · avoid with: other three-panel rows (EV/GL triptychs)
```
┌──────────────────────────────────────┐
│ A day on the estate.     copy        │
├───────────┬────────────┬─────────────┤
│Mornings 6a│Afternoons 1│Evenings  6p │
│  (photo)  │  (photo)   │  (photo)    │
│ ── one-   │ ── one-    │ ── one-line │
├───────────┴────────────┴─────────────┤
│ check-in note            [Book stay] │
└──────────────────────────────────────┘
```

## AP · App download

**AP01 · Centre phone flanked by feature callouts** · motion M31 · fit: food delivery, coffee subscriptions, loyalty apps · suggested motions: M31, M6 · avoid with: FT04 product with callout lines
```
┌──────────────────────────────────────┐
│     Your coffee, in your pocket.     │
│ callout 1    ┌──────┐                │
│              │phone │     callout 2  │
│  callout 3   │feed ↑│                │
│              └──────┘    callout 4   │
│          [iOS app] [Android]         │
└──────────────────────────────────────┘
```

**AP02 · Three fanned phones beside copy** · motion M34 · fit: apps with several key screens (ordering, rewards, tracking) · suggested motions: M34, M31 · avoid with: HR05 image fan right before
```
┌──────────────┬───────────────────────┐
│ Headline     │  ┌──┐┌────┐           │
│ copy         │  │tr││drop│┌──┐       │
│ 4.8 2min ₹0  │  └──┘│    ││pt│       │
│ [iOS][Andr.] │      └────┘└──┘       │
└──────────────┴───────────────────────┘
```

**AP03 · QR card + benefits split** · motion M18 · fit: cafés, gyms, retail brands with an in-store app or loyalty club · suggested motions: M18, M6 · avoid with: NL02 split signup right after (two split sign-up blocks)
```
┌──────────────────┬───────────────────┐
│ YOUR COFFEE,     │┌─────────────────┐│
│ ONE SCAN AWAY.   ││ ▣▣▣▣  │ ┌─────┐ ││
│ ✓ Order ahead    ││ ▣QR▣  │ │phone│ ││
│ ✓ 9th cup free   ││ ▣▣▣▣  │ │card │ ││
│ ✓ Beans…         ││ Club  │ └─────┘ ││
│ [iPhone][Android]│└─────────────────┘│
└──────────────────┴───────────────────┘
```

**AP04 · Platform download cards row** · motion M34 · fit: apps on several platforms (iOS, Android, web, desktop) · suggested motions: M34, M51, M18 · avoid with: PR01 tier cards right after
```
┌──────────────────────────────────────┐
│ Sleep sounds, on every     copy ₹249 │
│ screen.                              │
├────────┬─────────┬─────────┬─────────┤
│ [📱]   │ [▭]     │ [⌸]     │ [💻]    │
│ iPhone │ Android │ Web     │ Mac/Win │
│ [Get ↓]│ [Get ↓] │ [Open ↓]│ [Get ↓] │
└────────┴─────────┴─────────┴─────────┘
```

## JR · Journal / blog

**JR01 · Featured post + filter pills + grid** · motion M13 · fit: coffee, food, skincare brands with a journal · suggested motions: M13, M34 · avoid with: PS filter grids
```
┌─────────────────────┬────────────────┐
│ [ featured image ]  │ Headline       │
│                     │ copy  Read →   │
├─────────────────────┴────────────────┤
│ From the journal  (Latest)(Brew)(…)  │
│ [post]      [post]      [post]       │
└──────────────────────────────────────┘
```

**JR02 · Dated news ledger** · motion M23 · fit: hotels, restaurants, galleries · suggested motions: M23, M13 · avoid with: PR06 ledger
```
┌──────────────────────────────────────┐
│ News from the house.      [All news] │
├──────────────────────────────────────┤
│ 02 OCT  Autumn tasting menu…  [▢] →  │
│ 24 SEP  Chef joins the kitchen [▢] → │
│ 11 SEP  Two new rooms…        [▢] →  │
└──────────────────────────────────────┘
```

**JR03 · Split featured image + divider list** · motion M13 · fit: perfume, fashion, editorial and lifestyle brands · suggested motions: M13, M23 · avoid with: SY01 (two big image + text splits in a row)
```
┌──────────────────────────────────────┐
│ Notes from the atelier.  All stories→│
├──────────────────┬───────────────────┤
│                  │ intro line        │
│   featured       │ Cat · date     (→)│
│   image          │ Title ─────────── │
│ Cover story      │ Title ─────────── │
│ Title            │ Title ─────────── │
└──────────────────┴───────────────────┘
```

**JR04 · Fluid importance grid** · motion M34 · fit: magazines, design and furniture brands, studios with a journal · suggested motions: M34, M32 · avoid with: BN05 mosaic (two irregular grids)
```
┌──────────────────────────────────────┐
│ The Kaaru Journal.              copy │
├───────────────────────┬──────────────┤
│                       │ “ quote ”    │
│   lead image (4×2)    ├──────────────┤
│                       │ small image  │
├──────────────────┬────┴──────────────┤
│ essay (text)     │ image             │
├────────────┬─────┴───────────────────┤
│ short reads│ wide image + title      │
└────────────┴─────────────────────────┘
```

**JR05 · Magazine spread with page flip** · motion M1 · fit: fashion, travel, print-loving brands (built for a linen label's journal) · suggested motions: M1, M6, M23 · avoid with: SY05
```
┌──────────────────────────────────────┐
│ The Linen Journal.  Spread 1/3 (←)(→)│
├──────────────────┬───────────────────┤
│                  ║ By Ira Menon      │
│    (photo)       ║ “pull quote”      │
│ Jaipur           ║ D·text  │ text    │
│ Before noon…  14 ║ Issue 07       15 │
└──────────────────┴───────────────────┘
```

**JR06 · Long-read with sticky side rail** · motion M23 · fit: coffee, wine, craft brands' stories, recipes · suggested motions: M23, M6, M20 · avoid with: SY01
```
┌─────────────────────────┬────────────┐
│ meta · 8 min            │▒ Contents ▒│
│ The monsoon coffee      │▒ ▓2.Ninety▒│
│ (lead picture)          │▒ author   ▒│
│ ## sub · paragraphs     │▒ promo ₹  ▒│
├─────────────────────────┴────────────┤
│ [pic]   Related post title  →        │
│ [pic]   Related post title  →        │
└──────────────────────────────────────┘
```

**JR07 · Numbered guide with bookable experiences** · motion M34 · fit: hotels, travel, tours, city guides · suggested motions: M34, M23, M6 · avoid with: LS listing cards on the same page
```
┌──────────────────────────────────────┐
│     Nine slow things to do…          │
│     (wide 21:9 picture)              │
│     1 subhead / text  … 9            │
├────────┬─────────┬─────────┬─────────┤
│ exp ₹  │ exp ₹   │ exp ₹   │ exp ₹   │
│[Reserve│[Reserve]│[Reserve]│[Reserve]│
├────────┴─────────┴─────────┴─────────┤
│ [card] [card] [card] [card] → drift  │
└──────────────────────────────────────┘
```

## FQ · FAQ

**FQ01 · Two-column FAQ, self-opening accordion** · motion M23 · fit: tea, coffee, any calm premium brand with real questions · avoid with: FO07 or CT05 next to it (also M23, also line-led)
```
desktop                                   phone
┌───────────────┬──────────────────────┐  ┌──────────────┐
│ Good          │ Question one     (–) │  │ Good         │
│ questions,    │   answer text…       │  │ questions…   │
│ steeped…      │ Question two     (+) │  │ copy · mail  │
│ copy          │ Question three   (+) │  │ Q one    (–) │
│ hello@… line  │ Question four    (+) │  │  answer…     │
└───────────────┴──────────────────────┘  │ Q two    (+) │
                                          └──────────────┘
```

**FQ02 · Centred accordion with auto-cycling tabs** · motion M6 · fit: sneakers, fashion, D2C stores with many question types · avoid with: NL01 or FO03 directly after (also M6)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│        Before you lace up.           │  │ Before you   │
│   (Orders)(Sizing)(Returns)(Care)    │  │ lace up.     │
│   ─ Question one ────────────── (–)  │  │ (Ord)(Size)  │
│     answer…                          │  │ (Ret)(Care)  │
│   ─ Question two ────────────── (+)  │  │ Q one    (–) │
└──────────────────────────────────────┘  │ Q two    (+) │
                                          └──────────────┘
```

**FQ03 · FAQ cards grid** · motion M18 · fit: energy drinks, snacks, products with short, punchy answers · avoid with: CT06, NL04, FO04 (also M18); next to other 3-column card grids
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ STRAIGHT ANSWERS.        short copy  │  │ STRAIGHT     │
│ ┌────────┐ ┌▓▓▓▓▓▓▓▓┐ ┌────────┐     │  │ ANSWERS.     │
│ │Q  ans  │ │Q accent│ │Q  ans  │     │  │ ┌──────────┐ │
│ └────────┘ └▓▓▓▓▓▓▓▓┘ └────────┘     │  │ │Q   ans   │ │
│ ┌────────┐ ┌────────┐ ┌────────┐     │  │ └──────────┘ │
│ │Q  ans  │ │Q  ans  │ │Q  ans  │     │  │ ┌▓▓▓▓▓▓▓▓▓▓┐ │
└──────────────────────────────────────┘  └──────────────┘
```

**FQ04 · FAQ + help card split** · motion M1 · fit: skincare, wellness, anything with an advisor or booking · avoid with: NL02 or FO06 (also M1 photo uncover)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Your skin, your questions.           │  │ Your skin,   │
│ Q one          (–) ┌───────────────┐ │  │ your Qs.     │
│   answer…          │   [ photo ]   │ │  │ Q one    (–) │
│ Q two          (+) │ Still curious?│ │  │ Q two    (+) │
│ Q three        (+) │ [Book a call] │ │  │ ┌──────────┐ │
└────────────────────┴───────────────┘─┘  │ │ photo    │ │
                                          │ │[Book]    │ │
                                          └──────────────┘
```

**FQ05 · Chat-bubble FAQ** · motion M6 · fit: apps, skincare, playful D2C (built for a skincare brand's skin team) · suggested motions: M6, M34 · avoid with: other chat / notification sections
```
┌──────────────┬───────────────────────┐
│ Ask us like  │ (av) Skin team ● online│
│ you'd ask a  │        ( question ? ) │
│ friend.      │ ( • • • / answer )    │
│ copy         │        ( question ? ) │
│ [Chat] link  │        ( question ? ) │
└──────────────┴───────────────────────┘
```

**FQ06 · Ledger FAQ (question left, answer right)** · motion M23 · fit: wine, perfume, editorial brands (built for a small-lot winery) · suggested motions: M23, M6 · avoid with: PR06 ledger (two ruled ledgers)
```
┌───────────────────────┬──────────────┐
│ Questions, poured     │ [pic] copy   │
│ plainly.              │       link → │
├━━━━━━━━━━━━┯━━━━━━━━━━┷━━━━━━━━━━━━━━┤
│ Question?  │ Answer text, two lines  │
├────────────┼─────────────────────────┤
│▓Question?▓▓│▓Answer (cycling tint)▓▓▓│
├────────────┼─────────────────────────┤
│ Question?  │ Answer text             │
└────────────┴─────────────────────────┘
```

**FQ07 · Category rail + filtered accordion** · motion M23 · fit: D2C stores with many question types (furniture, electronics, fashion) · suggested motions: M23, M6 · avoid with: FQ02 tabbed accordion on the same page
```
┌──────────────────────────────────────┐
│ Headline                   short copy│
├─────────┬────────────────────────────┤
│[Orders▓]│ Question one             ⊕ │
│ Delivery│   answer text…             │
│ Material│ Question two             + │
│ Returns │ Question three           + │
└─────────┴────────────────────────────┘
```

## CT · CTA band

**CT01 · Accent band, giant CTA line** · motion M12 · fit: energy drinks, sports, loud launch brands · avoid with: NL03 or FO01 (also M12 giant letters)
```
desktop                                   phone
┌▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓┐  ┌▓▓▓▓▓▓▓▓▓▓▓▓▓▓┐
│ CHARGE THE                           │  │ CHARGE THE   │
│ WHOLE DAY.                           │  │ WHOLE DAY.   │
│ ──────────────────────────────────── │  │ ──────────── │
│ offer line ₹1,140    [Get the box →] │  │ offer line   │
└▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓┘  │ [Get box →]  │
                                          └▓▓▓▓▓▓▓▓▓▓▓▓▓▓┘
```

**CT02 · CTA card over a bending marquee** · motion M44 · fit: audio, fashion, brands with a strong word list · avoid with: FO08 (same BendMarquee) or any other marquee on the page
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ ~Studio sound ✦ Open b┌──────────┐~~~ │  │~Studio so~~~ │
│ ~~Forty hours ✦ Walnut│Hear the  │~~~ │  │┌────────────┐│
│                       │room again│    │  ││Hear the    ││
│                       │[Order]   │    │  ││room. [Ord] ││
│                       └──────────┘    │  │└────────────┘│
└──────────────────────────────────────┘  │~~Forty hou~~ │
                                          └──────────────┘
```

**CT03 · Photo with frosted glass CTA card** · motion M13 · fit: furniture, hotels, lifestyle with one strong photo · avoid with: another full-bleed photo section right before or after (e.g. HR02)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ ░░░░░░░░░░░ photo ░░░░░░░░░░░░░░░░░░ │  │ ░░ photo ░░░ │
│ ┌──────────────┐░░░░░░░░░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░ │
│ │Sit a little  │░░░░░░░░░░░░░░░░░░░░ │  │┌────────────┐│
│ │longer. copy  │░░░░░░░░░░░░░░░░░░░░ │  ││Sit a little││
│ │[Reserve] ₹68k│░░░░░░░░░░░░░░░░░░░░ │  ││[Reserve]   ││
│ └──────────────┘░░░░░░░░░░░░░░░░░░░░ │  │└────────────┘│
└──────────────────────────────────────┘  └──────────────┘
```

**CT04 · Countdown launch banner** · motion M3 · fit: sneaker drops, limited editions, event launches · avoid with: a stats section next to it (also M3 counters)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ The Volt 2 drops Friday.  ┌────────┐ │  │ The Volt 2   │
│ copy                      │ glow   │ │  │ drops Friday │
│ [06][14][32][08]          │ photo  │ │  │ [06][14][32] │
│ Days Hrs Min Sec          │        │ │  │ [08]  4 cols │
│ [Get early access] ₹11,499└────────┘ │  │ [Get access] │
└──────────────────────────────────────┘  │ ( photo )    │
                                          └──────────────┘
```

**CT05 · Three steps ending in the CTA** · motion M23 · fit: coffee or tea subscriptions, onboarding, anything that takes a few steps · avoid with: FQ01, FO02, FO07 (also M23); a "how it works" section with numbered steps
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Fresh beans in three steps.          │  │ Fresh beans  │
│ ┌────────┐ ┌────────┐ ┌▓▓▓▓▓▓▓▓┐     │  │ ┌──────────┐ │
│ │1       │ │2       │ │3       │     │  │ │1  Pick   │ │
│ │Pick    │ │Choose  │ │Start  →│     │  │ └──────────┘ │
│ │roast   │ │rhythm  │ │₹399    │     │  │ ┌──────────┐ │
│ └────────┘ └────────┘ └▓▓▓▓▓▓▓▓┘     │  │ │2 Choose  │ │
└──────────────────────────────────────┘  │ ┌▓▓▓▓▓▓▓▓▓▓┐ │
                                          └──────────────┘
```

**CT06 · Split choice: shop online / find a store** · motion M18 · fit: perfume, beauty, retail with physical stores · avoid with: FQ03, NL04, FO04 (also M18); next to other two-half splits
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Two ways to smell it first.          │  │ Two ways to  │
│ ┌█████████████████┐┌░░░░░░░░░░░░░░░┐ │  │ smell it.    │
│ │Shop online      ││Find a store   │ │  │ ┌██████████┐ │
│ │copy    (bottle) ││░░ photo ░░░░░ │ │  │ │Shop  (bt)│ │
│ │[Order →]        ││[See stores →] │ │  │ │[Order →] │ │
│ └█████████████████┘└░░░░░░░░░░░░░░░┘ │  │ ┌░░░░░░░░░░┐ │
└──────────────────────────────────────┘  │ │Find a st.│ │
                                          └──────────────┘
```

**CT07 · Scroll-drawn lines converging on a CTA** · motion M71 · fit: launches, sneakers, energy drinks, music (built as a sneaker drop) · suggested motions: M71, M23 · avoid with: CT02 marquee CTA; any other long sticky stage next to it (180vh)
```
┌──────────────────────────────────────┐
│~~╮     Five cities. One drop.     ╭~~│
│~~~╲    copy · 600 pairs ₹9,490   ╱~~~│
│~~~~╲   [Join the drop list] →   ╱~~~ │
│     ╲╲╲_______ glow ______╱╱        │
│              ││││                    │
│     Friday 10:00 IST · one pair      │
└──────────────────────────────────────┘
```

**CT08 · CTA card in a perspective tunnel** · motion M60 · fit: tech, audio, nightlife, launch teasers, gaming · suggested motions: M60, M18, M61 · avoid with: NL04 flickering grid card or another dark grid/tech background next to it
```
┌──────────────────────────────────────┐
│ ╲    ╲   ┊   ╱    ╱  beams →         │
│   ╲ ┌──────────────┐ ╱               │
│ ━━━ │ Hear it first│ ━━━              │
│   ╱ │ [Join list]  │ ╲               │
│ ╱    └─────────────┘   ╲             │
└──────────────────────────────────────┘
```

## NL · Newsletter

**NL01 · Inline single-row signup** · motion M6 · fit: chocolate, food, any brand that needs a quiet signup between sections · avoid with: FQ02 or FO03 next to it (also M6); a footer that already has a signup strip
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ ──────────────────────────────────── │  │ One good     │
│ One good letter  (you@email [Subscr])│  │ letter…      │
│ a month. copy     privacy line       │  │ ( email    ) │
│ ──────────────────────────────────── │  │ [ Subscribe ]│
└──────────────────────────────────────┘  │ privacy line │
                                          └──────────────┘
```

**NL02 · Split: image + form with perks** · motion M1 · fit: linen and fashion, lifestyle with a strong photo · avoid with: FQ04 or FO06 (also M1); another image-left split right before
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ ┌──────────┐  Join the linen list.   │  │ ┌──────────┐ │
│ │          │  • 10% off first order  │  │ │  photo   │ │
│ │  photo   │  • Early access         │  │ └──────────┘ │
│ │          │  • The care letter      │  │ Join the     │
│ └──────────┘  (email      )[Sign up] │  │ linen list.  │
└──────────────────────────────────────┘  │ • perks ×3   │
                                          │ (email)[Sign]│
                                          └──────────────┘
```

**NL03 · Big type with underline input** · motion M12 · fit: sneakers, streetwear, drop-led brands · avoid with: CT01 or FO01 (also M12 giant type)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ GET THE                              │  │ GET THE      │
│ NEXT DROP.  (accent)                 │  │ NEXT DROP.   │
│ copy        Email address ______ (→) │  │ copy         │
│             no-spam line             │  │ Email ___(→) │
└──────────────────────────────────────┘  └──────────────┘
```

**NL04 · Card over a flickering grid** · motion M18 · fit: audio, tech, dark premium brands · avoid with: FQ03, CT06, FO04 (also M18); another canvas background on the same page
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ · · · ·  ┌──────────────────┐ · · ·  │  │ · ┌────────┐·│
│ · · · ·  │ Tuned in, first. │ · · ·  │  │ · │Tuned in│·│
│ · · · ·  │ (perk)(perk)(perk)│ · · · │  │ · │(perks) │·│
│ · · · ·  │ (email)  [Join]  │ · · ·  │  │ · │(email) │·│
│ · · · ·  └──────────────────┘ · · ·  │  │ · │[Join]  │·│
└──────────────────────────────────────┘  │ · └────────┘·│
                                          └──────────────┘
```


## CC · Contact

**CC01 · Channels list + big form card** · motion M18 · fit: studios, hotels, B2B-leaning brands (furniture, trade) · suggested motions: M18, M23 · avoid with: BK table-booking split
```
┌──────────────────────────────────────┐
│ Let's make a room together.          │
├────────────┬─────────────────────────┤
│ Trade      │ [name]      [email]     │
│ Press      │ [topic ⌄]   [budget ⌄]  │
│ Showroom   │ [message … typing|]     │
│ Care       │           [Send enquiry]│
└────────────┴─────────────────────────┘
```

**CC02 · Giant email across an image** · motion M12 · fit: fashion, studios, perfume houses, editorial brands · suggested motions: M12, M13 · avoid with: FO01 giant wordmark right after
```
┌──────────────────────────────────────┐
│ Maison Vetiver      ┌──────┐  Appts  │
│                     │photo │         │
│ hello@maisonvetiver.in (huge, over)  │
│                     └──────┘         │
│ Letters Journal       from ₹38,000   │
└──────────────────────────────────────┘
```

**CC03 · Map backdrop + floating form card** · motion M18 · fit: cafés, showrooms, clinics with one address · suggested motions: M18, M13, M6 · avoid with: MP map sections on the same page
```
┌──────────────────────────────────────┐
│ ░ streets ░ blocks ░ ┌─────────────┐ │
│ ░░ ●pin [Café·open]  │ Come by…    │ │
│ ░ route - - - ░ park │ [email]     │ │
│ ░░ ░░ river ~~~~ ░░  │ [message]   │ │
│ ░ ░░ ░ ░░ ░ ░░ ░ ░░  │ [Send] note │ │
└──────────────────────┴─────────────┴─┘
```

**CC04 · Globe + contact form split** · motion M33 · fit: exporters, travel, global D2C · suggested motions: M33, M6 · avoid with: MP globe sections
```
┌───────────────────┬──────────────────┐
│     .-~~~-.       │ Headline         │
│   /  arcs   \     │ copy             │
│  |  ● ─ ● ─● |    │ desk | samples | │
│   \  spin   /     │ [form: 3 fields] │
│     '-~~~-'       │ [Quote]   note   │
└───────────────────┴──────────────────┘
```

**CC05 · Narrow form with topic chips** · motion M34 · fit: bakeries, caterers, wholesale-minded food brands · suggested motions: M34, M6 · avoid with: other chip rows on the same page
```
┌────────┬──────────────────┬────────────┐
│        │ Order ahead, or  │            │
│        │  [Name.........] │            │
│        │ [Phone] [Email ] │ Hearth&Co  │
│        │ (Catering)(Whole)│ address    │
│        │ [Message......|] │ hours      │
│        │ [Send]           │ email      │
└────────┴──────────────────┴────────────┘
```

**CC06 · Centred form + support link cards** · motion M18 · fit: D2C stores with help content (tea, skincare, gadgets) · suggested motions: M18, M34 · avoid with: FQ04 FAQ + help card
```
┌──────────────────────────────────────┐
│       Questions about your tea?      │
│     ┌────────────────────────────┐   │
│     │ [First] [Last] [Email][Ph] │   │
│     │ [Details.........] [Send]  │   │
│     └────────────────────────────┘   │
│  [Help centre →][FAQ →][Sales →]     │
└──────────────────────────────────────┘
```

## FO · Footer

**FO01 · Giant cropped wordmark + 3 link columns** · motion M12 · fit: energy drinks, sports, loud brands with a short name · avoid with: CT01 or NL03 just before (also M12); brand names longer than about 9 letters
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ one-line pitch   Shop  Brand  Help   │  │ pitch line   │
│                  link  link   link   │  │ Shop  Brand  │
│ © Voltline · Concept…    socials     │  │ Help         │
│ V O L T L I N E  (accent, huge)      │  │ © … Concept… │
└▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀┘  │ VOLTLINE     │
                                          └▀▀▀▀▀▀▀▀▀▀▀▀▀▀┘
```

**FO02 · Mega sitemap, 5 columns + legal row** · motion M23 · fit: furniture, big catalogues, multi-category stores · avoid with: CT05 or FQ01 before it (also M23)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Hallow & Teak            short line  │  │ Hallow &     │
│ ──────────────────────────────────── │  │ Teak · line  │
│ Living │Dining │Bedroom│Studio │Serv │  │ Living Dining│
│ links  │links  │links  │links  │links│  │ Bedrm  Studio│
│ ──────────────────────────────────── │  │ Service      │
│ © … Concept…   Privacy Terms INR     │  │ © … legal    │
└──────────────────────────────────────┘  └──────────────┘
```

**FO03 · Newsletter strip + columns + socials** · motion M6 · fit: tea, food, content-led brands · avoid with: any newsletter section on the same page (NL01–NL04); FQ02 before it (also M6)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ ┌▓▓ Tea notes, monthly ▓(email)[Sub]┐│  │┌▓▓▓▓▓▓▓▓▓▓▓▓┐│
│ └▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓┘│  ││Tea notes   ││
│ Leaf & Lantern  Teas Learn Help  (In)│  ││(email)[Sub]││
│ line            link link  link  (Yo)│  │└▓▓▓▓▓▓▓▓▓▓▓▓┘│
│ © … Concept…                         │  │ name · cols  │
└──────────────────────────────────────┘  │ socials · ©  │
                                          └──────────────┘
```

**FO04 · Minimal two-column footer** · motion M18 · fit: perfume, luxury, quiet brands · avoid with: CT06, FQ03, NL04 (also M18); a page that needs a lot of navigation
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ ──────────────────────────────────── │  │ Maison Ombre │
│ Maison Ombre       Fragrances  Set   │  │ one line     │
│ one line           Stores Journal …  │  │ links wrap   │
│ © Maison Ombre · Concept…            │  │ © … Concept… │
└──────────────────────────────────────┘  └──────────────┘
```

**FO05 · Big statement footer** · motion M20 · fit: sneakers, craft or "built to last" brands · avoid with: a scroll-lit manifesto/story section on the same page (also M20)
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Good shoes should last               │  │ Good shoes   │
│ longer than the trend. (lights up)   │  │ should last  │
│ [Shop the Court Low] [Book a resole] │  │ longer…      │
│                                      │  │ [Shop][Book] │
│ ──────────────────────────────────── │  │ Fieldmark    │
│ Fieldmark          Men Women Care …  │  │ links · ©    │
│ © … Concept…                         │  └──────────────┘
└──────────────────────────────────────┘
```

**FO06 · Footer with 3 image cards** · motion M1 · fit: coffee, cafés, brands with stores and a journal · avoid with: NL02 or FQ04 (also M1); a gallery section right before
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Keep exploring.                      │  │ Keep explor. │
│ ┌──────────┐┌──────────┐┌──────────┐ │  │ ┌──────────┐ │
│ │ photo    ││ photo    ││ photo    │ │  │ │Our story→│ │
│ │Our story→││Stores   →││Journal  →│ │  │ └──────────┘ │
│ └──────────┘└──────────┘└──────────┘ │  │ ┌──────────┐ │
│ Roastwell       links …   © Concept… │  │ │Stores  → │ │
└──────────────────────────────────────┘  │ links · ©    │
                                          └──────────────┘
```

**FO07 · Info footer: address, hours, stockists, map** · motion M23 · fit: chocolate shops, cafés, studios with a place to visit · avoid with: FQ01, CT05, FO02-style pages (also M23); brands that only sell online
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ Studio   Open     Stock. ┌─────────┐ │  │ Studio addr  │
│ addr     hours    cities │ ┼ map ┼ │ │  │ Open hours   │
│ Bean to bar, two streets │   📍    │ │  │ Stockists    │
│ away. copy               │ ┼  ┼  ┼ │ │  │ Bean to bar… │
│ ──────────────────────── └─────────┘ │  │ ┌──────────┐ │
│ © … Concept…     socials  email      │  │ │ map  pin │ │
└──────────────────────────────────────┘  │ © … Concept… │
                                          └──────────────┘
```

**FO08 · Marquee footer + socials + legal** · motion M44 · fit: skincare, beauty, fashion with short brand phrases · avoid with: CT02 (same BendMarquee) or any other marquee on the page
```
desktop                                   phone
┌──────────────────────────────────────┐  ┌──────────────┐
│ ──────────────────────────────────── │  │ ──────────── │
│ ~Glow Theory ✦ Serums ✦ Spf daily ✦~ │  │ ~Glow Theo~~ │
│ ──────────────────────────────────── │  │ ──────────── │
│ one line         Instagram↗ YouTube↗ │  │ one line     │
│ © Glow Theory · Concept…  Privacy    │  │ socials ↗    │
└──────────────────────────────────────┘  │ © … Concept… │
                                          └──────────────┘
```

**FO09 · Curtain-reveal footer** · motion M12 · fit: any premium brand; perfume, fashion, hotels (built for a lake hotel) · suggested motions: M12, M1 · avoid with: FO01 wordmark footer (pick one)
```
┌──────────────────────────────────────┐
│ Stay a little longer.  [Check dates] │  ← last panel (curtain)
╰──────────────────────────────────────╯
│ newsletter [Sub]  Stay Dine House pic│  ← footer waits underneath
│        H A V E L I   N E E L         │
│ © … Concept website      links       │
└──────────────────────────────────────┘
```

**FO10 · Physics pile footer** · motion M12 · fit: candies, cans, sneakers, toys, playful brands · suggested motions: M12, M71 · avoid with: any heavy 3D/WebGL section right before
```
┌──────────────────────────────────────┐
│ copy [email][Join]   Shop Visit Help │
│ PEBBLE & POP (letters pop)           │
│ © credit            grab a sweet ↓   │
│   ◎     ◉  ◎                         │
│ ◉◎◉◎◉◎◉◉◎◉◎◉◎◉◉◎◉◎ (draggable pile)   │
└──────────────────────────────────────┘
```

**FO11 · Full-screen photo footer** · motion M13 · fit: hotels, coffee estates, travel, outdoor · suggested motions: M13, M20 · avoid with: an HR02-style full-bleed photo hero repeated, or a photo CTA band just before
```
┌──────────────────────────────────────┐
│   (full-bleed photo, dark overlay)   │
│        Come up to the hills.         │
│        copy  [Plan a stay]           │
├────────────┬─────────────────────────┤
│ Brand      │ Stay   Coffee   House   │
│ © credit · concept           socials │
└────────────┴─────────────────────────┘
```

## AN · Announcement / promo bar

**AN01 · Slim top bar with pill label** · motion M49 · fit: any launch or seasonal offer; drinks, sneakers, skincare · suggested motions: M49, M6 · avoid with: a CT band directly under the hero
```
┌──────────────────────────────────────┐
│ (NEW) SPF 50 is here, 20% off  →   × │
├──────────────────────────────────────┤
│ logo     Face Body Sun Sets    Bag   │
│ Headline            [ image ]        │
└──────────────────────────────────────┘
```

**AN02 · Three-part sale strip with code chip** · motion M12 · fit: fashion, sneakers, D2C sales weeks · suggested motions: M12, M64 · avoid with: CT04 countdown on the same page
```
┌──────────────────────────────────────┐
│░UP TO 50%  │ free shipping, │ [Shop ░│
│░OFF        │ code [LINEN50] │  sale]░│
└──────────────────────────────────────┘
```

**AN03 · Floating bottom promo pill** · motion M18 · fit: perfume, beauty, any page that keeps a quiet offer in view · suggested motions: M18, M71 · avoid with: a bottom dock nav (NV) on the same page
```
┌─────────────────┬────────────────────┐
│ [ image ]       │ Three scents …     │
│                 │ Saffron Dusk ₹4,200│
│                 │ Monsoon V.   ₹3,600│
│   ( ● free 10 ml spray  Choose  × )  │
└──────────────────────────────────────┘
```

## PL · Poll / vote

**PL01 · Vote poll with live result bars** · motion M3 · fit: drinks/snacks/chocolate picking the next flavour, cafés choosing a seasonal special · suggested motions: M3, M34, M26 · avoid with: ST06 comparison bars on the same page
```
┌────────────────────────┬─────────────┐
│ You pick the next bar. │             │
│ line of copy           │   [ photo ] │
│ (o) Cardamom ████ 41%  │   drifting  │
│ ( ) Kokum    ███  33%  │             │
│ ( ) Coffee   ██   26%  │             │
│ 3,567 votes · closes … │             │
└────────────────────────┴─────────────┘
```

## CR · Careers

**CR01 · Job cards + split application form** · motion M34 · fit: restaurants, hotels, cafés, studios that are hiring · suggested motions: M34, M23, M18 · avoid with: CC contact forms on the same page
```
┌──────────────────────────────────────┐
│ Come cook with us.        copy line  │
│ ┌ Line cook ──────┐ ┌ Head barista ─┐│
│ │sched · pay · exp│ │ … [Applying↓] ││
│ ┌ Floor host ─────┐ ┌ Pastry asst. ─┐│
├────────────────┬─────────────────────┤
│ Tell us… copy  │ name   | email      │
│ [ photo ]      │ phone  | position ▾ │
│                │ [ drop CV ] [Send]  │
└────────────────┴─────────────────────┘
```

## ER · Error / 404

**ER01 · Oversized-numeral 404** · motion M12 (+ M71 magnetic buttons) · fit: every site (branded not-found page) · suggested motions: M12, M71, M37 · avoid with: nothing (stand-alone page)
```
┌──────────────────────────────────────┐
│ BRAND                 Error 404      │
│      ███   ┌───┐   ███               │
│      4     │ 0 │    4   (huge)       │
├──────────────────────────────────────┤
│ This page went for a walk. [Home][Shop]
└──────────────────────────────────────┘
```
