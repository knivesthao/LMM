#!/usr/bin/env python3
"""
LMM Content Packaging Script

Runs on the Paperspace GPU machine after UE5 finishes rendering.
Takes rendered images, compresses to WebP, generates manifest, uploads to R2.

Usage:
    python package_content.py \\
        --input ./render_output/ \\
        --title "The Brave Buffalo" \\
        --language lao \\
        --reading-level beginner \\
        --price 5000 \\
        --creator "Somsack"

Requires: pip install Pillow boto3 requests
"""

import argparse
import json
import os
import sys
from pathlib import Path

MAX_WIDTH = 800
WEBP_QUALITY = 75
TARGET_TOTAL_MB = 5

R2_ACCESS_KEY = os.environ.get("R2_ACCESS_KEY", "")
R2_SECRET_KEY = os.environ.get("R2_SECRET_KEY", "")
R2_ENDPOINT = os.environ.get("R2_ENDPOINT", "")
R2_BUCKET = os.environ.get("R2_BUCKET", "lmm-content")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")


def compress(input_path: str, output_path: str) -> int:
    from PIL import Image
    img = Image.open(input_path)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGBA")
    if img.width > MAX_WIDTH:
        ratio = MAX_WIDTH / img.width
        img = img.resize((MAX_WIDTH, int(img.height * ratio)), Image.Resampling.LANCZOS)
    img.save(output_path, "WEBP", quality=WEBP_QUALITY)
    return os.path.getsize(output_path)


def upload(key: str, path: str) -> str:
    import boto3
    s3 = boto3.client("s3", endpoint_url=R2_ENDPOINT,
                       aws_access_key_id=R2_ACCESS_KEY,
                       aws_secret_access_key=R2_SECRET_KEY,
                       region_name="auto")
    s3.upload_file(path, R2_BUCKET, key)
    return f"{R2_ENDPOINT}/{R2_BUCKET}/{key}"


def insert_metadata(meta: dict) -> str:
    import requests
    resp = requests.post(f"{SUPABASE_URL}/rest/v1/content",
                         headers={"apikey": SUPABASE_KEY,
                                  "Authorization": f"Bearer {SUPABASE_KEY}",
                                  "Content-Type": "application/json",
                                  "Prefer": "return=representation"},
                         json=meta)
    resp.raise_for_status()
    return resp.json()[0]["id"]


def main():
    parser = argparse.ArgumentParser(description="Package LMM content")
    parser.add_argument("--input", required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--language", required=True, choices=["lao", "english"])
    parser.add_argument("--reading-level", required=True, dest="reading_level",
                        choices=["beginner", "intermediate", "advanced"])
    parser.add_argument("--price", required=True, type=int)
    parser.add_argument("--creator", required=True)
    parser.add_argument("--description", default="")
    parser.add_argument("--out", default="./packaged")
    args = parser.parse_args()

    input_dir = Path(args.input)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    images = sorted(input_dir.glob("*.png")) + sorted(input_dir.glob("*.jpg"))

    if not images:
        print("Error: No images found", file=sys.stderr)
        sys.exit(1)

    print(f"Packaging {len(images)} scenes...")

    scenes = []
    total = 0

    for i, img in enumerate(images):
        n = i + 1
        out = out_dir / f"scene_{n:02d}.webp"
        size = compress(str(img), str(out))
        total += size
        scenes.append({"number": n, "url": f"/content/temp/scene_{n:02d}.webp", "size_bytes": size})
        print(f"  Scene {n}: {size:,} bytes ({size / 1024:.1f} KB)")

    print(f"Total: {total / (1024 * 1024):.1f} MB / {TARGET_TOTAL_MB} MB target")

    # Manifest
    manifest = {"total_scenes": len(scenes), "total_size_bytes": total, "scenes": scenes}
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))

    # Upload to Supabase if configured
    content_id = None
    if SUPABASE_URL:
        content_id = insert_metadata({
            "title": args.title, "language": args.language,
            "reading_level": args.reading_level, "price_kip": args.price,
            "creator_name": args.creator, "description": args.description,
            "cover_image_url": scenes[0]["url"] if scenes else "",
        })
        print(f"Content ID: {content_id}")

    # Upload to R2 if configured
    if R2_ACCESS_KEY and content_id:
        for i, img in enumerate(images):
            n = i + 1
            out = out_dir / f"scene_{n:02d}.webp"
            key = f"content/{content_id}/scene_{n:02d}.webp"
            upload(key, str(out))
        upload(f"content/{content_id}/manifest.json", str(out_dir / "manifest.json"))
        print("Uploaded to R2")

    print("Done.")


if __name__ == "__main__":
    main()
