---
name: cover-check
description: Check a 9:16 Instagram Reel cover against Instagram's safe areas (3:4 profile-grid crop ≈13% top/bottom, Reels header and caption/button zones, right icon column) and our text rule (headline 15–40% from the top); say what is outside; optionally move the content into the safe area on a matching background. Use when the user shares or asks for a reel cover / thumbnail.
---

# Cover check

1. `python3 scripts/cover-check.py <cover.jpg>` → `<cover>-safe.jpg` (overlay) + a report.
   Zones: red = cut by the 3:4 grid crop (top/bottom 12.5%) · orange = Reels header (top 14%), caption + buttons (bottom 25%), icon column (right 14%, y 45–92%) · green box = **safe** (x 6–84%, y 15–72%) · blue lines = our **text band, 15–40% from the top**.
2. **Look at the overlay yourself** (the script finds content by colour difference; it can miss thin text). Say plainly: which text/product parts are outside and where.
   For an exact check of one element: `--box x0,y0,x1,y1` (fractions).
3. The cover must be **9:16** (1080×1920). If not, say so first.
4. Fix: `--fit` writes `<cover>-fit.jpg`: the content scaled/moved into the safe box on a gradient of the cover's own edge colours (no ghost of the old picture). Re-run the check on the fitted file. If the headline then sits outside 15–40%, move it in the source design instead (better than scaling everything).
5. Show the user the overlay and (if made) the fitted version side by side.
