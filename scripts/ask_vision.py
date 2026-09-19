"""Trusted local test client; prints the actual answer and execution metadata."""
import argparse
import base64
import json
import os
from pathlib import Path

import httpx


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:8000")
    parser.add_argument("--task", choices=["single-image", "temporal", "cross-modal"], default="single-image")
    parser.add_argument("--query", required=True)
    parser.add_argument("--image", action="append", required=True, help="Repeat for pairs; temporal order is earlier then later")
    parser.add_argument("--modality", action="append", choices=["optical", "sar"], required=True)
    args = parser.parse_args()
    if len(args.image) != len(args.modality):
        parser.error("Supply one --modality for every --image")
    token = os.getenv("SATQUERY_VISION_TOKEN")
    if not token:
        parser.error("Set SATQUERY_VISION_TOKEN in this terminal; never pass secrets as CLI arguments")
    observations = []
    for filename, modality in zip(args.image, args.modality):
        path = Path(filename)
        if path.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
            parser.error("Use a rendered PNG/JPEG view, not raw multispectral TIFF bytes")
        if path.stat().st_size > 2_000_000:
            parser.error("Each rendered image must be under 2 MB")
        mime = "png" if path.suffix.lower() == ".png" else "jpeg"
        observations.append({"label": path.name, "modality": modality,
                             "image": f"data:image/{mime};base64," + base64.b64encode(path.read_bytes()).decode()})
    response = httpx.post(args.url.rstrip("/") + "/api/vision/answer",
                          headers={"Authorization": "Bearer " + token},
                          json={"query": args.query, "task": args.task, "observations": observations}, timeout=60)
    if response.is_error:
        raise SystemExit(f"Request failed ({response.status_code}): {response.text}")
    print(json.dumps(response.json(), indent=2))


if __name__ == "__main__":
    main()
