# Section menu — a layout code for every section

`DESIGN-MENU.md` picks the look, `MOTION-MENU.md` how each section moves. **This menu picks how each section is laid out.** In Round 0, give every section **one layout code** from here **and** one motion code (each entry lists motion codes that suit it). Every layout is live, as a real designed section, at **`/lab/sections/<category>`** (e.g. `/lab/sections/hr`; index at `/lab/sections`; each build batch also at `/lab/sections/b<N>`). Code: `components/sections/` (first set `<type>.tsx`, later batches `<cat>-b<N>.tsx`), building blocks `kit.tsx`, motion hook `motion.ts`. Where each layout came from: `docs/SECTION-LOG.md`.

**Rules**
- **No layout code twice on a site, and none used by any of the last 3 sites** (SITES-LOG → Layouts column).
- Copy the layout into `site/components/`, rename it for the brand, and restyle it (content, fonts, colours, proportions): two sites using the same code must still not look alike.
- The layout's listed motion is a suggestion; the Motion map decides (no motion code twice per site).
- Desktop first (1440×900, 1920×1080). The first 90 layouts also have phone wireframes; later entries are desktop-only (basic stacking in code, not tuned for phones).
- Sources: every layout was rebuilt from scratch after studying 21st.dev (look-and-learn only), Tailark, shadcn/ui, Magic UI, Aceternity (look-and-learn only), HyperUI, Preline, Flowbite, Meraki UI, Tailblocks, Mamba UI, Float UI, Codrops and award galleries (Awwwards, SiteInspire); **no code was copied**. See `docs/SOURCES.md` and `docs/SECTION-LOG.md`.

Codes (31 categories): **HR** hero ×18 · **NV** navbar / menu ×3 · **FT** features ×10 · **BN** bento ×8 · **PS** product showcase ×12 · **ST** stats / ingredients ×6 · **PD** process / steps ×2 · **CP** comparison / before-after ×2 · **SY** story / about ×6 · **TM** team ×2 · **GL** gallery ×10 · **VD** video feature ×3 · **SP** social proof ×6 · **LG** logos / press ×2 · **PR** pricing / shop ×6 · **MN** menu / price list ×2 · **BK** booking / reservation ×2 · **LS** listings / rooms / property ×2 · **MP** locations / map ×2 · **EV** events / schedule ×2 · **AP** app download ×2 · **JR** journal / blog ×2 · **FQ** faq ×4 · **CT** cta band ×6 · **NL** newsletter ×4 · **CC** contact ×2 · **FO** footer ×8 · **AN** announcement / promo bar ×3 · **PL** poll / vote ×1 · **CR** careers ×1 · **ER** error / 404 ×1 (140 layouts).

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
