#!/usr/bin/env python3
"""
Render a labelled contact sheet of every code point in a legacy Tibetan font.

This is the tool for COMPLETING the Sanskrit font tables in src/fonts.js.
The TibetanChogyal Sanskrit companion fonts (Skt1..5) and TibetanMachineWeb
reuse the same 8-bit codes as the body font for different stacked glyphs, and
the .ttf files carry no semantic glyph names — so each glyph must be identified
visually, once. This script lays them out in a grid, each cell labelled with its
byte code, so you (or anyone who reads Tibetan) can read off the stack and add
`{ encoded: <char>, tibetan: <unicode> }` entries to src/fonts.js.

Usage:
    pip install fonttools pillow
    python scripts/font-contact-sheet.py fonts/TibetanChogyalSkt2.ttf out.png
    # then identify each glyph and extend src/fonts.js

The byte code shown (e.g. 0x56) is the character to put in `encoded`
(String.fromCharCode(0x56) === "V").
"""
import sys
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont


def build_sheet(font_path, out_path, glyph_pt=40, cols=10, cell=78):
    ttf = TTFont(font_path)
    cmap = ttf.getBestCmap()
    codes = [c for c in range(0x20, 0x100) if c in cmap and c != 0x20]
    pf = ImageFont.truetype(font_path, glyph_pt)
    lf = ImageFont.load_default()
    rows = (len(codes) + cols - 1) // cols
    img = Image.new("RGB", (cols * cell, rows * cell), "white")
    d = ImageDraw.Draw(img)
    for i, c in enumerate(codes):
        x, y = (i % cols) * cell, (i // cols) * cell
        d.rectangle([x, y, x + cell, y + cell], outline="#cccccc")
        d.text((x + 3, y + 2), f"0x{c:02X}", fill="red", font=lf)
        try:
            d.text((x + 12, y + 22), chr(c), fill="black", font=pf)
        except Exception:
            pass
    img.save(out_path)
    print(f"{font_path}: {len(codes)} glyphs -> {out_path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    src = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else "contact-sheet.png"
    build_sheet(src, out)
