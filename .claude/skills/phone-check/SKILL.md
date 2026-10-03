---
name: phone-check
description: Screenshot every section at 360×640 and 390×844 and check that the main subject (product, person) is fully visible with nothing overlapping it, no sideways scroll, nothing cut, text ≥ 12px; fix any problem. Use at the end of every round and whenever layouts, crops or videos change.
---

# Phone check (screenshots only)

Clients open the link on their phones, but nobody films phones. Read `docs/LESSONS.md` → "Phones".

1. Production server running. `npm run phone-shots` (another page: `PAGE=/lab npm run phone-shots`).
   → `recordings/phone-shots/360x640/` and `/390x844/`: one shot per section; pinned/tall sections at start, middle and end (`-a/-b/-c`), plus a contact sheet per size.
2. Look at **every** shot (shrink the sheets into a grid if needed). For each section:
   - the main subject is **whole** (no cut can, no missing head), centred in its free area
   - **nothing on top of it** (cards, text, buttons, nav)
   - text readable, ≥ 12px, not overlapping other text
   - no sideways page scroll; quick check: `scrollWidth === innerWidth` at 375 and 360
3. Fix with placement, never a fixed crop: videos use `fit: { box, area }` (lib/film.ts) measured from the page layout; resize the window across 768px → the phone frame set must load (usePhone).
4. Re-run the shots for the sizes you changed and show the user the before/after when it was visible to them.
