#!/usr/bin/env python3
"""Normalize approved World Cup moodboard art and downloaded flags for runtime use."""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
MOODBOARD = ROOT / "outputs/moodboards/orb-foundry-world-cup/generated"
OUTPUT = ROOT / "assets/generated/world-cup"

FLAG_SOURCES = {
    "france": Path("/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/browser-use/assets/492db869-1962-4bbd-a400-c2e145ed5962/c34c186faeee13ff.png"),
    "sweden": Path("/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/browser-use/assets/492db869-1962-4bbd-a400-c2e145ed5962/4d72e900da6aa859.png"),
    "usa": Path("/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/browser-use/assets/492db869-1962-4bbd-a400-c2e145ed5962/3f8c161fcefdf79b.png"),
    "bosnia": Path("/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/browser-use/assets/492db869-1962-4bbd-a400-c2e145ed5962/ee8e9d501329bf61.png"),
    "england": Path("/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/browser-use/assets/7b573016-c61c-421a-be45-c817cb6b6abf/289786111330fe85.png"),
    "congo-dr": Path("/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/browser-use/assets/492db869-1962-4bbd-a400-c2e145ed5962/91ea52620a483fb8.png"),
    "brazil": Path("/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/browser-use/assets/492db869-1962-4bbd-a400-c2e145ed5962/3ace08d2d33d0d1d.png"),
    "japan": Path("/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/browser-use/assets/492db869-1962-4bbd-a400-c2e145ed5962/02691563df8960e1.png"),
    "argentina": OUTPUT / "flags/argentina.png",
    "cabo-verde": OUTPUT / "flags/cabo-verde.png",
    "netherlands": OUTPUT / "flags/netherlands.png",
    "morocco": OUTPUT / "flags/morocco.png",
    "portugal": OUTPUT / "flags/portugal.png",
    "croatia": OUTPUT / "flags/croatia.png",
    "germany": OUTPUT / "flags/germany.png",
    "paraguay": OUTPUT / "flags/paraguay.png",
    "norway": OUTPUT / "flags/norway.png",
    "ivory-coast": OUTPUT / "flags/ivory-coast.png",
    "mexico": OUTPUT / "flags/mexico.png",
    "ecuador": OUTPUT / "flags/ecuador.png",
    "belgium": OUTPUT / "flags/belgium.png",
    "senegal": OUTPUT / "flags/senegal.png",
    "spain": OUTPUT / "flags/spain.png",
    "austria": OUTPUT / "flags/austria.png",
    "australia": OUTPUT / "flags/australia.png",
    "egypt": OUTPUT / "flags/egypt.png",
    "switzerland": OUTPUT / "flags/switzerland.png",
    "algeria": OUTPUT / "flags/algeria.png",
    "colombia": OUTPUT / "flags/colombia.png",
    "ghana": OUTPUT / "flags/ghana.png",
    "canada": OUTPUT / "flags/canada.png",
}

SPRITE_SOURCES = {
    "heart": "b84789af83d69bbce0deb49ccc869c4c.png",
    "red-energy-drink": "dc5685645c568905d3c423b0c805c6be.png",
    "green-energy-drink": "cd63465f312f8f7aa778dec118ec3f66.png",
    "shin-guards": "e3781c7ae43b2cb57a6fd2d5c3027abd.png",
    "soccer-ball": "7f7c90cf78dd0a91b31410c29e0777d4.png",
    "yellow-card": "26a51a557f19e5a8adfcf3a98714e271.png",
    "red-card": "402702d91af5738a7b1705a66cd0f5bb.png",
}

SOURCE_URLS = {
    "france": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Flag_of_France.svg/500px-Flag_of_France.svg.png",
    "sweden": "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Flag_of_Sweden.svg/500px-Flag_of_Sweden.svg.png",
    "usa": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Flag_of_the_United_States_%28DDD-F-416E_specifications%29.svg/500px-Flag_of_the_United_States_%28DDD-F-416E_specifications%29.svg.png",
    "bosnia": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Flag_of_Bosnia_and_Herzegovina.svg/500px-Flag_of_Bosnia_and_Herzegovina.svg.png",
    "england": "https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Flag_of_England.svg/250px-Flag_of_England.svg.png",
    "congo-dr": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/500px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png",
    "brazil": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Flag_of_Brazil.svg/500px-Flag_of_Brazil.svg.png",
    "japan": "https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Flag_of_Japan.svg/500px-Flag_of_Japan.svg.png",
    "argentina": "https://flagcdn.com/w320/ar.png",
    "cabo-verde": "https://flagcdn.com/w320/cv.png",
    "netherlands": "https://flagcdn.com/w320/nl.png",
    "morocco": "https://flagcdn.com/w320/ma.png",
    "portugal": "https://flagcdn.com/w320/pt.png",
    "croatia": "https://flagcdn.com/w320/hr.png",
    "germany": "https://flagcdn.com/w320/de.png",
    "paraguay": "https://flagcdn.com/w320/py.png",
    "norway": "https://flagcdn.com/w320/no.png",
    "ivory-coast": "https://flagcdn.com/w320/ci.png",
    "mexico": "https://flagcdn.com/w320/mx.png",
    "ecuador": "https://flagcdn.com/w320/ec.png",
    "belgium": "https://flagcdn.com/w320/be.png",
    "senegal": "https://flagcdn.com/w320/sn.png",
    "spain": "https://flagcdn.com/w320/es.png",
    "austria": "https://flagcdn.com/w320/at.png",
    "australia": "https://flagcdn.com/w320/au.png",
    "egypt": "https://flagcdn.com/w320/eg.png",
    "switzerland": "https://flagcdn.com/w320/ch.png",
    "algeria": "https://flagcdn.com/w320/dz.png",
    "colombia": "https://flagcdn.com/w320/co.png",
    "ghana": "https://flagcdn.com/w320/gh.png",
    "canada": "https://flagcdn.com/w320/ca.png",
}


def remove_border_background(image: Image.Image, tolerance: int = 30) -> Image.Image:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    corners = [pixels[0, 0], pixels[width - 1, 0], pixels[0, height - 1], pixels[width - 1, height - 1]]
    key = tuple(sum(color[index] for color in corners) // 4 for index in range(3))
    visited = bytearray(width * height)
    queue = deque()
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        offset = y * width + x
        if visited[offset]:
            continue
        visited[offset] = 1
        red, green, blue, _ = pixels[x, y]
        distance = max(abs(red - key[0]), abs(green - key[1]), abs(blue - key[2]))
        if distance > tolerance:
            continue
        pixels[x, y] = (red, green, blue, 0)
        if x > 0:
            queue.append((x - 1, y))
        if x + 1 < width:
            queue.append((x + 1, y))
        if y > 0:
            queue.append((x, y - 1))
        if y + 1 < height:
            queue.append((x, y + 1))
    return rgba


def normalize_sprite(source: Path, destination: Path, size: int = 64) -> None:
    image = remove_border_background(Image.open(source))
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    if not bounds:
        raise ValueError(f"No visible sprite pixels in {source}")
    image = image.crop(bounds)
    inset = max(4, round(size * 0.08))
    target = size - inset * 2
    scale = min(target / image.width, target / image.height)
    resized = image.resize(
        (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
        Image.Resampling.NEAREST,
    )
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((size - resized.width) // 2, (size - resized.height) // 2))
    destination.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(destination, optimize=True)


def normalize_flag(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGBA")
    # Preserve every flag's official ratio; runtime circular clipping handles the medallion.
    image.thumbnail((256, 160), Image.Resampling.LANCZOS)
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, optimize=True)


def prepare_field() -> None:
    source = MOODBOARD / "e77470e4065fda7e7b69d3d359b75d50.png"
    image = Image.open(source).convert("RGB")
    image.thumbnail((1440, 960), Image.Resampling.LANCZOS)
    (OUTPUT / "arena").mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT / "arena/sunlit-striped-pitch.jpg", quality=88, optimize=True)


def main() -> None:
    for country_id, source in FLAG_SOURCES.items():
        if not source.exists():
            raise FileNotFoundError(source)
        normalize_flag(source, OUTPUT / "flags" / f"{country_id}.png")

    for sprite_id, filename in SPRITE_SOURCES.items():
        normalize_sprite(MOODBOARD / filename, OUTPUT / "sprites" / f"{sprite_id}.png")

    prepare_field()
    manifest = {
        "visualDirection": "Modern polished pixel art with emerald stripes, warm chalk, crisp dark outlines, and compact cyan/red/yellow feedback.",
        "flags": {country_id: {"file": f"flags/{country_id}.png", "source": SOURCE_URLS[country_id]} for country_id in FLAG_SOURCES},
        "sprites": {sprite_id: f"sprites/{sprite_id}.png" for sprite_id in SPRITE_SOURCES},
        "arena": "arena/sunlit-striped-pitch.jpg",
        "notes": "Flag images were browser-downloaded from Wikimedia-rendered files, while later World Cup country expansions use Flagcdn PNGs. Pixel sprites and arena reference were generated in the approved Creative Production moodboard and normalized with nearest-neighbor scaling.",
    }
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")


if __name__ == "__main__":
    main()
