from __future__ import annotations

import json
import math
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(os.environ.get("PORTFOLIO_REPO_ROOT", Path(__file__).parents[1]))
SOURCE = ROOT / "assets" / "portfolio"
OUTPUT = Path(
    os.environ.get(
        "PORTFOLIO_REVIEW_OUTPUT",
        ROOT / "portfolio-photo-review" / "contact-sheets",
    )
)
IMAGE_SUFFIXES = {".webp", ".jpg", ".jpeg", ".png"}

COLS = 3
TILE_W = 640
IMAGE_H = 430
LABEL_H = 74
GAP = 20
MARGIN = 28
HEADER_H = 92


def load_font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


TITLE_FONT = load_font(28, bold=True)
LABEL_FONT = load_font(20, bold=True)
META_FONT = load_font(17)


def make_sheet(project_dir: Path) -> dict:
    files = sorted(
        path for path in project_dir.iterdir()
        if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES
    )
    rows = math.ceil(len(files) / COLS)
    sheet_w = MARGIN * 2 + COLS * TILE_W + (COLS - 1) * GAP
    sheet_h = MARGIN * 2 + HEADER_H + rows * (IMAGE_H + LABEL_H) + (rows - 1) * GAP
    sheet = Image.new("RGB", (sheet_w, sheet_h), "#151515")
    draw = ImageDraw.Draw(sheet)
    draw.text((MARGIN, MARGIN), project_dir.name, fill="#f3f0e8", font=TITLE_FONT)
    draw.text(
        (MARGIN, MARGIN + 42),
        f"{len(files)} photos • full-frame previews (no crop)",
        fill="#b9b3a7",
        font=META_FONT,
    )

    manifest_items = []
    for index, file_path in enumerate(files):
        row, col = divmod(index, COLS)
        x = MARGIN + col * (TILE_W + GAP)
        y = MARGIN + HEADER_H + row * (IMAGE_H + LABEL_H + GAP)
        with Image.open(file_path) as source:
            source = ImageOps.exif_transpose(source).convert("RGB")
            original_size = source.size
            preview = ImageOps.contain(source, (TILE_W, IMAGE_H), Image.Resampling.LANCZOS)
        frame = Image.new("RGB", (TILE_W, IMAGE_H), "#252525")
        px = (TILE_W - preview.width) // 2
        py = (IMAGE_H - preview.height) // 2
        frame.paste(preview, (px, py))
        sheet.paste(frame, (x, y))
        draw.rectangle((x, y + IMAGE_H, x + TILE_W, y + IMAGE_H + LABEL_H), fill="#202020")
        draw.text((x + 14, y + IMAGE_H + 9), file_path.name, fill="#ffffff", font=LABEL_FONT)
        draw.text(
            (x + 14, y + IMAGE_H + 39),
            f"{original_size[0]} × {original_size[1]} px",
            fill="#aaa49a",
            font=META_FONT,
        )
        manifest_items.append(
            {
                "filename": file_path.name,
                "width": original_size[0],
                "height": original_size[1],
            }
        )

    safe_name = f"{project_dir.name}.jpg"
    out_path = OUTPUT / safe_name
    sheet.save(out_path, "JPEG", quality=92, optimize=True)
    return {"project": project_dir.name, "sheet": str(out_path), "files": manifest_items}


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    projects = [path for path in sorted(SOURCE.iterdir()) if path.is_dir()]
    manifest = [make_sheet(project) for project in projects]
    manifest_path = OUTPUT.parent / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Created {len(manifest)} contact sheets for {sum(len(p['files']) for p in manifest)} photos")
    print(manifest_path)


if __name__ == "__main__":
    main()
