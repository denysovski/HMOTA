"""
Render the hero's stand-in stills: the 3D scene alone (no text) at 11 points of the scroll,
for desktop and phone. They show while the 3D is still loading, so the hero is never empty.

Run after a static build is served at http://localhost:3200/HMOTA/ :
    python3 scripts/hero-frames.py
Re-run whenever the hero scene changes.
"""
import asyncio
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright

OUT = Path(__file__).resolve().parent.parent / "public" / "hero"
ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
HIDE = """
.site-header, .hero-stage > :not(.hero-canvas), .hero-frame, .hero-ring { visibility: hidden !important; }
"""
SIZES = {"d": (1600, 1000), "m": (430, 900)}


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=ARGS)
        for key, (w, h) in SIZES.items():
            pg = await b.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
            await pg.goto("http://localhost:3200/HMOTA/", wait_until="networkidle")
            await pg.add_style_tag(content=HIDE)
            await pg.wait_for_timeout(2500)
            span = await pg.evaluate("document.querySelector('.hero').offsetHeight - innerHeight")
            for i in range(11):
                await pg.evaluate(f"window.scrollTo(0, {int(span * i / 10)})")
                await pg.wait_for_timeout(2600)
                png = OUT / f"{key}{i:02d}.png"
                await pg.screenshot(path=str(png))
                Image.open(png).convert("RGB").save(OUT / f"{key}{i:02d}.webp", quality=72, method=6)
                png.unlink()
            await pg.close()
        await b.close()


asyncio.run(main())
