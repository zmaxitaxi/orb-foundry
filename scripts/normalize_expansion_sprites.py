from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "assets/generated/orb-foundry-expansion-pixel-set"
FINAL = BASE / "final"
REVIEW = BASE / "review"

ASSETS = {
    "echo-resonance-blade.png": (192, 96),
    "forge-temper-hammer.png": (192, 96),
    "static-charge-spike.png": (192, 96),
    "mirage-decoy-orb.png": (96, 96),
    "echo-replay-impact.png": (96, 96),
    "forge-heat-drop.png": (96, 96),
    "static-chain-zap.png": (96, 96),
    "shade-shadow-hood.png": (128, 96),
}


def alpha_bbox(image):
    return image.getchannel("A").getbbox()


def normalize(path, canvas_size):
    image = Image.open(path).convert("RGBA")
    bbox = alpha_bbox(image)
    if not bbox:
      return None
    crop = image.crop(bbox)
    max_w = canvas_size[0] - 16
    max_h = canvas_size[1] - 16
    scale = min(max_w / crop.width, max_h / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(size, Image.Resampling.NEAREST)
    output = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    x = 8
    if canvas_size[0] <= 128:
        x = (canvas_size[0] - size[0]) // 2
    y = (canvas_size[1] - size[1]) // 2
    output.alpha_composite(crop, (x, y))

    alpha = output.getchannel("A")
    mask = alpha.point(lambda value: 255 if value >= 96 else 0)
    output.putalpha(mask)
    output.save(path)
    return alpha_bbox(output)


def make_contact_sheet(metrics):
    REVIEW.mkdir(parents=True, exist_ok=True)
    tile_w, tile_h = 220, 150
    names = list(ASSETS)
    sheet = Image.new("RGBA", (tile_w * 4, tile_h * 2), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for index, name in enumerate(names):
        x = (index % 4) * tile_w
        y = (index // 4) * tile_h
        draw.rectangle((x, y, x + tile_w - 1, y + tile_h - 1), outline=(0, 0, 0), width=1)
        sprite = Image.open(FINAL / name).convert("RGBA")
        scale = min((tile_w - 44) / sprite.width, (tile_h - 52) / sprite.height)
        preview = sprite.resize((round(sprite.width * scale), round(sprite.height * scale)), Image.Resampling.NEAREST)
        sheet.alpha_composite(preview, (x + (tile_w - preview.width) // 2, y + 18))
        draw.text((x + 8, y + tile_h - 28), name.replace(".png", ""), fill=(0, 0, 0), font=font)
        draw.text((x + 8, y + tile_h - 14), f"bbox {metrics[name]}", fill=(80, 80, 80), font=font)
    sheet.convert("RGB").save(REVIEW / "orb-foundry-expansion-sprite-contact-sheet.png")


def main():
    metrics = {}
    for name, size in ASSETS.items():
        metrics[name] = normalize(FINAL / name, size)
    make_contact_sheet(metrics)
    for name, bbox in metrics.items():
        print(f"{name}: {bbox}")


if __name__ == "__main__":
    main()
