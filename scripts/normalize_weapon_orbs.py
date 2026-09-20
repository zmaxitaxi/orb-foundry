from pathlib import Path
import json

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "assets/generated/orb-foundry-weapon-orbs"
SOURCE = BASE / "source"
FINAL = BASE / "final"
REVIEW = BASE / "review"
CANVAS = (192, 96)
ANCHOR = (88, 48)
NAMES = ("sword", "crossbow", "potion", "axe", "scythe", "staff")


def hard_alpha(image):
    alpha = image.getchannel("A").point(lambda value: 255 if value >= 128 else 0)
    image.putalpha(alpha)
    return alpha


def palette_cleanup(image):
    alpha = image.getchannel("A")
    rgb = Image.new("RGB", image.size, (0, 0, 0))
    rgb.paste(image.convert("RGB"), mask=alpha)
    quantized = rgb.quantize(colors=5, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    cleaned = quantized.convert("RGBA")
    cleaned.putalpha(alpha)
    return cleaned


def normalize_composite(path):
    source = Image.open(path).convert("RGBA")
    hard_alpha(source)
    bbox = source.getbbox()
    if not bbox:
        raise ValueError(f"No opaque pixels in {path}")
    crop = source.crop(bbox)
    max_width = CANVAS[0] - 16
    max_height = CANVAS[1] - 16
    scale = min(max_width / crop.width, max_height / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(size, Image.Resampling.NEAREST)
    output = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    output.paste(crop, (8, (CANVAS[1] - size[1]) // 2), crop)
    hard_alpha(output)
    return palette_cleanup(output)


def weapon_only(composite):
    output = composite.copy()
    pixels = output.load()
    for y in range(CANVAS[1]):
        for x in range(ANCHOR[0]):
            pixels[x, y] = (0, 0, 0, 0)
    return output


def visible_colors(image):
    return len({pixel[:3] for pixel in image.getdata() if pixel[3] > 0})


def make_contact_sheet(records):
    REVIEW.mkdir(parents=True, exist_ok=True)
    tile_width, tile_height = 320, 164
    sheet = Image.new("RGBA", (tile_width * 3, tile_height * 2), "#fffaf0")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for index, record in enumerate(records):
        x = (index % 3) * tile_width
        y = (index // 3) * tile_height
        draw.rectangle((x, y, x + tile_width - 1, y + tile_height - 1), outline="#171513", width=2)
        preview = record["compositeImage"].resize((288, 144), Image.Resampling.NEAREST)
        sheet.alpha_composite(preview, (x + 16, y + 2))
        draw.rectangle((x + 8, y + 132, x + tile_width - 8, y + tile_height - 8), fill="#fffaf0")
        draw.text((x + 14, y + 138), f"{record['name'].upper()} · 192×96 · {record['colors']} COLORS", fill="#171513", font=font)
    sheet.convert("RGB").save(REVIEW / "weapon-orb-contact-sheet.png")


def main():
    FINAL.mkdir(parents=True, exist_ok=True)
    records = []
    for name in NAMES:
        composite = normalize_composite(SOURCE / f"{name}-orb-cutout.png")
        weapon = weapon_only(composite)
        composite_path = FINAL / f"{name}-orb.png"
        weapon_path = FINAL / f"{name}.png"
        composite.save(composite_path)
        weapon.save(weapon_path)
        bbox = weapon.getchannel("A").getbbox()
        tip_x = bbox[2] if bbox else ANCHOR[0]
        record = {
            "name": name,
            "source": f"source/{name}-orb-chroma.png",
            "cutout": f"source/{name}-orb-cutout.png",
            "composite": f"final/{name}-orb.png",
            "weapon": f"final/{name}.png",
            "canvas": list(CANVAS),
            "attachmentAnchor": list(ANCHOR),
            "tipX": tip_x,
            "colors": visible_colors(composite),
            "resampling": "nearest-neighbor",
            "backgroundRemoval": "flat chroma-key #00ff00 via remove_chroma_key.py",
            "paletteCleanup": "deterministic MEDIANCUT, 5 colors, no dithering",
        }
        records.append({**record, "compositeImage": composite})

    make_contact_sheet(records)
    manifest = {
        "id": "orb-foundry-weapon-orbs",
        "version": "20260713-weapon-roster1",
        "workflow": [
            "GPT image generation",
            "bright #00ff00 chroma-key background",
            "background removal",
            "deterministic palette cleanup",
            "nearest-neighbor scaling",
            "shared 192x96 canvas normalization",
            "contact-sheet review",
        ],
        "sprites": [
            {key: value for key, value in record.items() if key != "compositeImage"}
            for record in records
        ],
        "review": "review/weapon-orb-contact-sheet.png",
    }
    (BASE / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    for record in records:
        print(f"{record['name']}: {record['colors']} colors, weapon bbox tip x={record['tipX']}")


if __name__ == "__main__":
    main()
