from pathlib import Path

import numpy as np
import rasterio
from rasterio.transform import from_origin

OUT = Path(__file__).resolve().parent / "data"
OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(26167)
h = w = 640
y, x = np.mgrid[0:h, 0:w]


def write(name: str, flooded: bool) -> None:
    center = 300 + 44 * np.sin(y / 72) + (16 if flooded else 0)
    width = (66 if flooded else 27) + 9 * np.sin(y / 51)
    water = np.abs(x - center) < width
    if flooded:
        water |= (((x - 395) / 105) ** 2 + ((y - 330) / 82) ** 2 < 1)
        water |= (((x - 190) / 70) ** 2 + ((y - 470) / 50) ** 2 < 1)
    texture = rng.normal(0, 120, (h, w))
    red = np.where(water, 700, 1800 + texture + 350 * np.sin(x / 28))
    green = np.where(water, 1700, 2800 + texture + 420 * np.cos(y / 31))
    blue = np.where(water, 1350, 1350 + texture)
    nir = np.where(water, 420, 4300 + texture + 500 * np.sin((x + y) / 36))
    stack = np.clip(np.stack([red, green, blue, nir]), 1, 10000).astype("uint16")
    with rasterio.open(
        OUT / name, "w", driver="GTiff", width=w, height=h, count=4, dtype="uint16",
        crs="EPSG:32644", transform=from_origin(480000, 3050000, 10, 10), compress="deflate",
    ) as dst:
        dst.write(stack)
        dst.update_tags(scene="after" if flooded else "before", description="Synthetic SatQueryAI flood demonstration raster")


write("demo_before.tif", False)
write("demo_after.tif", True)
print(f"Created demonstration GeoTIFFs in {OUT}")
