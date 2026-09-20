from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "assets/generated/orb-foundry-impact-frames"
FINAL = BASE / "final"
REVIEW = BASE / "review"

ASSETS = {
    "impact-regular.png": {
        "canvas": (96, 96),
        "padding": 8,
        "palette": [(16, 17, 17), (255, 126, 18), (255, 219, 28), (255, 246, 126), (255, 255, 255)],
    },
    "impact-critical.png": {
        "canvas": (128, 128),
        "padding": 8,
        "palette": [(15, 13, 15), (103, 12, 35), (255, 39, 19), (255, 224, 24), (255, 255, 255)],
    },
    "impact-collision.png": {
        "canvas": (128, 96),
        "padding": 8,
        "palette": [(12, 16, 18), (0, 148, 179), (16, 218, 232), (165, 244, 249), (255, 255, 255)],
    },
}


def nearest_color(pixel, palette):
    red, green, blue = pixel
    return min(
        palette,
        key=lambda color: (red - color[0]) ** 2 + (green - color[1]) ** 2 + (blue - color[2]) ** 2,
    )


def normalize(path, spec):
    image = Image.open(path).convert("RGBA")
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise ValueError(f"{path.name} has no visible pixels")

    crop = image.crop(bbox)
    canvas_width, canvas_height = spec["canvas"]
    max_width = canvas_width - spec["padding"] * 2
    max_height = canvas_height - spec["padding"] * 2
    scale = min(max_width / crop.width, max_height / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(size, Image.Resampling.NEAREST)

    pixels = crop.load()
    for y in range(crop.height):
        for x in range(crop.width):
            red, green, blue, alpha_value = pixels[x, y]
            if alpha_value < 96:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                color = nearest_color((red, green, blue), spec["palette"])
                pixels[x, y] = (*color, 255)

    output = Image.new("RGBA", spec["canvas"], (0, 0, 0, 0))
    offset = ((canvas_width - crop.width) // 2, (canvas_height - crop.height) // 2)
    output.alpha_composite(crop, offset)
    output.save(path)
    return output.getchannel("A").getbbox()


def make_contact_sheet(metrics):
    REVIEW.mkdir(parents=True, exist_ok=True)
    tile_width, tile_height = 260, 190
    sheet = Image.new("RGB", (tile_width * len(ASSETS), tile_height), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    for index, name in enumerate(ASSETS):
        x = index * tile_width
        sprite = Image.open(FINAL / name).convert("RGBA")
        scale = min((tile_width - 52) / sprite.width, (tile_height - 58) / sprite.height)
        preview = sprite.resize(
            (round(sprite.width * scale), round(sprite.height * scale)),
            Image.Resampling.NEAREST,
        )
        draw.rectangle((x, 0, x + tile_width - 1, tile_height - 1), outline=(8, 8, 8), width=1)
        sheet.paste(preview, (x + (tile_width - preview.width) // 2, 14), preview)
        draw.text((x + 10, tile_height - 34), name.removesuffix(".png"), fill=(0, 0, 0), font=font)
        draw.text((x + 10, tile_height - 19), f"bbox {metrics[name]}", fill=(80, 80, 80), font=font)

    sheet.save(REVIEW / "orb-foundry-impact-frames-contact-sheet.png")


def main():
    metrics = {name: normalize(FINAL / name, spec) for name, spec in ASSETS.items()}
    make_contact_sheet(metrics)
    for name, bbox in metrics.items():
        print(f"{name}: {bbox}")


if __name__ == "__main__":
    main()
