#!/usr/bin/env python3
"""
Frame pipeline for this site (the kit's `npm run frames` can't do per-segment density, joins or colour matching).

  python3 site/tools/make_frames.py [clip …]        clips: hero pop flavours ice closing (default: all)

For every clip:
  1. ffmpeg: trim, paint out the Veo watermark (delogo), motion-interpolate to 48 fps → PNGs in a temp folder.
  2. Pick frames by VIDEO TIME: each clip lists segments (t0, t1, fps); slow/important parts get 48 fps.
  3. Per frame (PIL): clip-specific fixes (hero shrink, flavour join), then the page-black grade: the video's
     near-black is mapped onto the page background #05080f, so frames melt into the page with no box edge.
  4. WebP, desktop (wide) + phone (2:3 crop that follows the can), quality picked to fit the budget.
  5. manifest.json (kit format) + "times": the video second of every frame (players map scroll → video time).

Measured landmarks (seconds of the source videos) are documented in site/DESIGN.md → "Video plan".
"""
import io, json, os, shutil, subprocess, sys, tempfile
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "raw"
OUT = ROOT / "public" / "frames"
TMP = Path(os.environ.get("FRAMES_TMP", tempfile.gettempdir())) / "surge-frames"
BG = np.array([5, 8, 15], dtype=np.float32)  # page background
SRC_FPS = 48
DELOGO = "delogo=x=1852:y=1032:w=56:h=32"  # Veo mark: x 1865–1895, y 1042–1055

# fmt: off
CLIPS = {
    # 0–6 s. Can sits at x≈480 of 1920 (left quarter). Shrunk to 90% on page black (headroom, never cropped).
    "hero": dict(src="hero-orbit.mp4", start=0, end=6.0,
                 segs=[(0, 3.0, 16), (3.0, 6.0, 24)], shrink=0.9,
                 desk=(1600, 6.0), phone=(540, 3.2), phone_cx=[(0, 528)]),
    # 0–6.5 s. Fast camera pan 1.8–2.5 s (smoothed: 48 fps), tab lifts 2.7–3.0, pop (first blue light) 3.042 s,
    # fizz 3.5–4.5 s (48 fps).
    "pop": dict(src="can-open.mp4", start=0, end=6.5,
                segs=[(0, 1.8, 16), (1.8, 2.6, 48), (2.6, 2.9, 24), (2.9, 4.6, 48), (4.6, 6.5, 16)],
                desk=(1440, 11.5), phone=(810, 6.0),
                phone_cx="track", phone_crop=1080),  # phone: square crop, the whole top of the can fits the width
    # flavour-1 0–4.0 s + flavour-2 0–4.0 s, cross-faded over 1/3 s (joined length 7.667 s). Ring colour changes:
    # gold at 2.60 s (flavour-1), cyan at 2.70 s of flavour-2 = 6.367 s joined.
    "flavours": dict(join=True, end=7.6667,
                     segs=[(0, 2.3, 24), (2.3, 2.9, 48), (2.9, 3.5, 24), (3.5, 4.2, 48), (4.2, 6.05, 24),
                           (6.05, 6.7, 48), (6.7, 7.6667, 24)],
                     desk=(1600, 9.0), phone=(540, 5.0), phone_cx=[(0, 958)]),
    # 0–3.5 s. Burst starts 1.33 s, peak 1.6–2.6 s (most frames).
    "ice": dict(src="ice-burst.mp4", start=0, end=3.5,
                segs=[(0, 1.25, 12), (1.25, 3.5, 36)],
                desk=(1280, 11.5), phone=(540, 5.8), phone_cx=[(0, 960)]),
    # 0–8 s. Can right (x≈1310). Rings start glowing 2.75 s, half 3.6 s, full ~4.75 s.
    "closing": dict(src="closing.mp4", start=0, end=8.0,
                    segs=[(0, 8.0, 18)],
                    desk=(1440, 9.5), phone=(600, 5.5), phone_cx=[(0, 1310)], phone_crop=1080),
}
# fmt: on


def sh(*args):
    subprocess.run(args, check=True)


def extract(src, start, end, name):
    """Source → 48 fps PNGs (interpolated), watermark painted out. Cached in TMP/<name>."""
    d = TMP / name
    if d.exists() and any(d.iterdir()):
        return d
    d.mkdir(parents=True, exist_ok=True)
    vf = f"{DELOGO},minterpolate=fps={SRC_FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
    sh("ffmpeg", "-v", "error", "-y", "-ss", str(start), "-to", str(end), "-i", str(RAW / src), "-vf", vf,
       "-q:v", "2", str(d / "f_%04d.jpg"))
    return d


def frame_times(segs):
    ts = []
    for t0, t1, fps in segs:
        n = max(1, round((t1 - t0) * fps))
        ts += [t0 + i * (t1 - t0) / n for i in range(n)]
    ts.append(segs[-1][1])
    return ts


def grade(a):
    """Near-black → page background: crush the noise floor a little, then lift so 0 lands exactly on BG."""
    a = np.clip((a - 4.0) * (255.0 / 251.0), 0, 255)
    return BG + a * (255.0 - BG) / 255.0


def load(path):
    return np.asarray(Image.open(path).convert("RGB"), dtype=np.float32)


def can_width(a, cx=958):
    """Width of the can body at two body rows (strongest edges left/right of the centre)."""
    L = a.mean(2)
    ws = []
    for y in (300, 500):
        d = np.abs(np.diff(L[y]))
        l = cx - 380 + int(np.argmax(d[cx - 380:cx - 60]))
        r = cx + 60 + int(np.argmax(d[cx + 60:cx + 380]))
        ws.append(r - l)
    return float(np.median(ws))


def squeeze(a, sx, cx=958):
    """Horizontal scale about the can's centre (the can's height is the same in both clips; only its width differs)."""
    if abs(sx - 1) < 1e-3:
        return a
    h, w, _ = a.shape
    im = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    nw = round(w * sx)
    im = im.resize((nw, h), Image.LANCZOS)
    canvas = Image.new("RGB", (w, h), (0, 0, 0))
    canvas.paste(im, (round(cx - cx * sx), 0))
    return np.asarray(canvas, dtype=np.float32)


def build_flavours():
    """Joined flavour-1 (0–4 s) + flavour-2 (0–4 s). Flavour-1's can slowly gets wider (315 → 425 px) while flavour-2
    starts at 315 px with the same height, so around the join flavour-1 is squeezed and flavour-2 stretched towards
    one width, then both ease back to their natural shape; 1/3 s cross-fade between them."""
    d1 = extract("flavour-1.mp4", 0, 4.0, "flavour-1")
    d2 = extract("flavour-2.mp4", 0, 4.0, "flavour-2")
    f1 = sorted(d1.iterdir())
    f2 = sorted(d2.iterdir())
    JOIN, XF = 4.0 - 1 / 3, 1 / 3
    # natural widths (smoothed) of both cans around the join
    def widths(files, t_from, t_to):
        out = []
        for i, p in enumerate(files):
            t = i / SRC_FPS
            if t_from <= t <= t_to and i % 4 == 0:
                out.append((t, can_width(load(p))))
        ts, ws = np.array(out).T
        return np.poly1d(np.polyfit(ts, ws, 2))
    w1 = widths(f1, 2.9, 4.0)
    w2 = widths(f2, 0.0, 1.4)
    target = (w1(4.0 - XF / 2) + w2(XF / 2)) / 2  # meet in the middle of the cross-fade
    print(f"  flavour join: f1 width at join {w1(4.0):.0f}px, f2 at start {w2(0):.0f}px → both {target:.0f}px")

    def smooth(x):
        x = min(1, max(0, x))
        return x * x * (3 - 2 * x)

    def f1_frame(t):
        a = load(f1[min(len(f1) - 1, round(t * SRC_FPS))])
        k = smooth((t - 3.0) / (JOIN + XF / 2 - 3.0))  # 0 until 3.0 s, full at the cross-fade middle
        return squeeze(a, 1 + k * (target / w1(t) - 1))

    def f2_frame(t):
        a = load(f2[min(len(f2) - 1, round(t * SRC_FPS))])
        k = 1 - smooth((t - XF / 2) / 1.2)  # full at the cross-fade middle, back to natural by ~1.4 s
        return squeeze(a, 1 + k * (target / w2(t) - 1))

    def get(T):
        if T < JOIN:
            return f1_frame(T)
        if T < JOIN + XF:
            x = (T - JOIN) / XF
            return f1_frame(T) * (1 - x) + f2_frame(T - JOIN) * x
        return f2_frame(T - JOIN)

    return get


def build_simple(c, name):
    d = extract(c["src"], c["start"], c["end"], name)
    files = sorted(d.iterdir())
    shrink = c.get("shrink")

    def get(t):
        a = load(files[min(len(files) - 1, round(t * SRC_FPS))])
        if shrink:
            h, w, _ = a.shape
            im = Image.fromarray(a.astype(np.uint8)).resize((round(w * shrink), round(h * shrink)), Image.LANCZOS)
            small = np.asarray(im, dtype=np.float32)
            # wide, smooth fade of the shrunk frame into black : splash, fruit and
            # mist dissolve long before the frame edge, so no box line can ever show
            sh_, sw, _ = small.shape
            def ramp(n, f0, f1):
                i = np.arange(n, dtype=np.float32)
                x = np.minimum(i / (n * f0), (n - 1 - i) / (n * f1))
                x = np.clip(x, 0, 1)
                return (x * x * (3 - 2 * x)) ** 1.6
            # top 28% (fruit enters through the source's top edge), bottom 18%, sides 14%
            m = np.outer(ramp(sh_, 0.28, 0.18), ramp(sw, 0.14, 0.14))[..., None]
            out = np.zeros_like(a)
            y0, x0 = (h - sh_) // 2, (w - sw) // 2
            out[y0:y0 + sh_, x0:x0 + sw] = small * m
            a = out
        return a

    return get, files


def track_cx(files, times):
    """Horizontal centre of the can over time (bright-pixel centroid in the middle band, heavily smoothed)."""
    pts = []
    for t in np.arange(0, times[-1] + 1e-6, 0.25):
        a = load(files[min(len(files) - 1, round(t * SRC_FPS))]).mean(2)
        band = a[150:900]
        ys, xs = np.where(band > 60)
        pts.append((t, float(np.median(xs)) if len(xs) > 200 else 960.0))
    ts, xs = np.array(pts).T
    # moving average then linear interpolation
    xs = np.convolve(np.pad(xs, 2, mode="edge"), np.ones(5) / 5, mode="valid")
    return list(zip(ts, xs))


def interp(keys, t):
    ts = [k[0] for k in keys]
    xs = [k[1] for k in keys]
    return float(np.interp(t, ts, xs))


def encode(job):
    arr, path, q = job
    Image.fromarray(arr).save(path, "WEBP", quality=q, method=5)
    return os.path.getsize(path)


def render(name, c):
    print(f"▶ {name}")
    times = frame_times(c["segs"])
    files = None
    if c.get("join"):
        get = build_flavours()
    else:
        get, files = build_simple(c, name)
    cx_keys = c.get("phone_cx")
    if cx_keys == "track":
        cx_keys = track_cx(files, times)
        print("  phone crop centre:", ", ".join(f"{t:.2f}s→{x:.0f}" for t, x in cx_keys[::4]))

    dw, desk_mb = c["desk"]
    pw, phone_mb = c["phone"]
    crop_w = c.get("phone_crop", 720)  # 720 = a 2:3 crop; 1080 = square (the closing: whole can, street to the sides)
    ph = round(pw * 1080 / crop_w)
    desk, phone = [], []
    for t in times:
        a = get(t)
        if c.get("grade", True):
            a = grade(a)
        a8 = a.clip(0, 255).astype(np.uint8)
        im = Image.fromarray(a8)
        if not PHONE_ONLY:
            desk.append(np.asarray(im.resize((dw, round(dw * 9 / 16)), Image.LANCZOS)))
        cx = interp(cx_keys, t)
        x0 = int(min(1920 - crop_w, max(0, cx - crop_w / 2)))
        phone.append(np.asarray(im.crop((x0, 0, x0 + crop_w, 1080)).resize((pw, ph), Image.LANCZOS)))

    outs = (("", desk, desk_mb), ("-m", phone, phone_mb))
    if PHONE_ONLY:
        outs = outs[1:]
    for suffix, frames, budget in outs:
        folder = OUT / f"surge-{name}{suffix}"
        if folder.exists():
            shutil.rmtree(folder)
        folder.mkdir(parents=True)
        # pick the quality from a sample, then encode everything once (re-encode lower if still over)
        q = 72
        sample = frames[:: max(1, len(frames) // 12)]
        while q > 40:
            size = sum(len(_bytes(f, q)) for f in sample) * len(frames) / len(sample)
            if size / 1e6 <= budget * 0.95:
                break
            q -= 4
        while True:
            jobs = [(f, folder / f"frame_{i + 1:04d}.webp", q) for i, f in enumerate(frames)]
            with ProcessPoolExecutor() as ex:
                total = sum(ex.map(encode, jobs, chunksize=4))
            if total / 1e6 <= budget or q <= 40:
                break
            q -= 4
        h, w = frames[0].shape[:2]
        manifest = dict(count=len(frames), ext="webp", width=w, height=h, pad=4, prefix="frame_",
                        times=[round(t, 4) for t in times])
        (folder / "manifest.json").write_text(json.dumps(manifest))
        print(f"  ✓ surge-{name}{suffix}: {len(frames)} frames {w}×{h} q{q} = {total / 1e6:.1f} MB")


def _bytes(arr, q):
    b = io.BytesIO()
    Image.fromarray(arr).save(b, "WEBP", quality=q, method=5)
    return b.getvalue()


PHONE_ONLY = "--phone-only" in sys.argv

if __name__ == "__main__":
    names = [a for a in sys.argv[1:] if not a.startswith("--")] or list(CLIPS)
    for n in names:
        render(n, CLIPS[n])
    # the 48 fps intermediates are big: never leave them behind
    shutil.rmtree(TMP, ignore_errors=True)
