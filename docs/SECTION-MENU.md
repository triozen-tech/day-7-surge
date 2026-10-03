# Section menu — a layout code for every section

`DESIGN-MENU.md` picks the look, `MOTION-MENU.md` how each section moves. **This menu picks how each section is laid out.** In Round 0, give every section **one layout code** from here **and** one motion code (each entry lists motion codes that suit it). Every layout is live, as a real designed section, at **`/lab/sections`** (code: `components/sections/<type>.tsx`, building blocks `kit.tsx`, motion hook `motion.ts`).

**Rules**
- **No layout code twice on a site, and none used by any of the last 3 sites** (SITES-LOG → Layouts column).
- Copy the layout into `site/components/`, rename it for the brand, and restyle it (content, fonts, colours, proportions): two sites using the same code must still not look alike.
- The layout's listed motion is a suggestion; the Motion map decides (no motion code twice per site).
- Phones: every layout already stacks for 360–390 px; keep the subject whole and nothing on top of it (`npm run phone-shots`).
- Sources: layouts were rebuilt from scratch after studying 21st.dev (look-and-learn only), Tailark, HyperUI, Magic UI (MIT), Preline (MIT + fair use), Flowbite (free blocks, ideas only) and award-winning brand sites; no code was copied. See `docs/SOURCES.md`.

Codes: **HR** hero ×12 · **FT** features ×10 · **BN** bento ×8 · **PS** product showcase ×8 · **ST** stats/ingredients ×6 · **SY** story/about ×6 · **GL** gallery ×6 · **SP** social proof ×6 · **PR** pricing/shop ×6 · **FQ** FAQ ×4 · **CT** CTA band ×6 · **NL** newsletter ×4 · **FO** footer ×8 (90 layouts).

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
