from __future__ import annotations

import base64
import io
import math
import tempfile
from pathlib import Path
from typing import Any

import httpx
import numpy as np
import rasterio
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image
from pydantic import BaseModel, Field
from pyproj import Geod
from rasterio.warp import Resampling, reproject

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"

app = FastAPI(
    title="SatQueryAI Geospatial API",
    version="0.2.0",
    description="Transparent GIS utilities and prepared demonstration endpoints for SIH 26167.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class CatalogRequest(BaseModel):
    bbox: list[float] = Field(default=[78.8, 26.6, 79.4, 27.1], min_length=4, max_length=4)
    date_from: str = "2024-07-01"
    date_to: str = "2024-09-30"
    sources: list[str] = ["sentinel-2-l2a", "sentinel-1-grd"]
    max_cloud: float = Field(default=30, ge=0, le=100)
    limit: int = Field(default=12, ge=1, le=50)


class AreaRequest(BaseModel):
    coordinates: list[list[float]]


def _trace(label: str, detail: str, status: str = "complete") -> dict[str, str]:
    return {"label": label, "detail": detail, "status": status}


def _fallback_scenes() -> list[dict[str, Any]]:
    return [
        {"id": "S2_PRE_FLOOD_20240718", "source": "Sentinel-2 L2A", "date": "2024-07-18", "cloud": 6.2, "resolution_m": 10, "mode": "optical", "thumbnail": None},
        {"id": "S2_POST_FLOOD_20240827", "source": "Sentinel-2 L2A", "date": "2024-08-27", "cloud": 3.8, "resolution_m": 10, "mode": "optical", "thumbnail": None},
        {"id": "S1_POST_FLOOD_20240829", "source": "Sentinel-1 GRD", "date": "2024-08-29", "cloud": None, "resolution_m": 10, "mode": "sar", "thumbnail": None},
    ]


@app.get("/api/health", tags=["System"])
def health() -> dict[str, Any]:
    return {"status": "ok", "service": "SatQueryAI", "rasterio": rasterio.__version__}


@app.get("/api/scenarios", tags=["Demonstration"])
def scenarios() -> list[dict[str, str]]:
    return [{"id": "assam-flood", "title": "Assam flood extent", "location": "Dhemaji, Assam", "dates": "18 Jul → 27 Aug 2024", "status": "prepared"}]


@app.post("/api/catalog/search", tags=["Imagery"])
async def catalog_search(request: CatalogRequest) -> dict[str, Any]:
    payload = {
        "bbox": request.bbox,
        "datetime": f"{request.date_from}T00:00:00Z/{request.date_to}T23:59:59Z",
        "collections": request.sources,
        "limit": request.limit,
        "query": {"eo:cloud_cover": {"lte": request.max_cloud}},
    }
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.post("https://earth-search.aws.element84.com/v1/search", json=payload)
            response.raise_for_status()
        items = []
        for feature in response.json().get("features", []):
            props, assets = feature.get("properties", {}), feature.get("assets", {})
            collection = feature.get("collection", "")
            items.append({
                "id": feature.get("id"),
                "source": collection,
                "date": (props.get("datetime") or "")[:10],
                "cloud": props.get("eo:cloud_cover"),
                "resolution_m": 10,
                "mode": "sar" if "sentinel-1" in collection else "optical",
                "thumbnail": (assets.get("thumbnail") or {}).get("href"),
            })
        if items:
            return {"provider": "Element 84 Earth Search STAC", "live": True, "scenes": items}
    except Exception:
        pass
    return {"provider": "curated offline catalogue", "live": False, "scenes": _fallback_scenes()}


@app.post("/api/measure-area", tags=["GIS"])
def measure_area(request: AreaRequest) -> dict[str, float]:
    if len(request.coordinates) < 3:
        raise HTTPException(422, "A polygon needs at least three coordinates")
    ring = request.coordinates + ([request.coordinates[0]] if request.coordinates[-1] != request.coordinates[0] else [])
    lons, lats = zip(*ring)
    area, perimeter = Geod(ellps="WGS84").polygon_area_perimeter(lons, lats)
    return {"area_hectares": round(abs(area) / 10000, 3), "perimeter_km": round(perimeter / 1000, 3)}


async def _save_upload(upload: UploadFile) -> Path:
    suffix = Path(upload.filename or "upload.tif").suffix or ".tif"
    handle = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    handle.write(await upload.read())
    handle.close()
    return Path(handle.name)


@app.post("/api/raster/inspect", tags=["GeoTIFF"])
async def inspect_raster(file: UploadFile = File(...)) -> dict[str, Any]:
    path = await _save_upload(file)
    try:
        with rasterio.open(path) as src:
            samples = []
            for index in range(1, min(src.count, 6) + 1):
                band = src.read(index, masked=True)
                samples.append({"band": index, "min": round(float(band.min()), 4), "max": round(float(band.max()), 4), "mean": round(float(band.mean()), 4)})
            return {"filename": file.filename, "width": src.width, "height": src.height, "bands": src.count, "dtype": src.dtypes[0], "crs": str(src.crs), "bounds": list(src.bounds), "nodata": src.nodata, "statistics": samples}
    except rasterio.errors.RasterioIOError as exc:
        raise HTTPException(400, f"Not a readable raster: {exc}") from exc
    finally:
        path.unlink(missing_ok=True)


def _mask_png(mask: np.ndarray) -> str:
    rgba = np.zeros((*mask.shape, 4), dtype=np.uint8)
    rgba[mask] = [31, 211, 210, 150]
    image = Image.fromarray(rgba, "RGBA")
    image.thumbnail((720, 720))
    buf = io.BytesIO()
    image.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def _analyze_paths(before_path: Path, after_path: Path, green_band: int = 2, nir_band: int = 4, threshold: float = 0.08) -> dict[str, Any]:
    with rasterio.open(before_path) as before, rasterio.open(after_path) as after:
        if max(green_band, nir_band) > min(before.count, after.count):
            raise HTTPException(422, "Selected band is missing from one raster")
        green_a = before.read(green_band).astype("float32")
        nir_a = before.read(nir_band).astype("float32")
        green_b = np.empty_like(green_a)
        nir_b = np.empty_like(nir_a)
        for destination, band in ((green_b, green_band), (nir_b, nir_band)):
            reproject(
                source=rasterio.band(after, band), destination=destination,
                src_transform=after.transform, src_crs=after.crs,
                dst_transform=before.transform, dst_crs=before.crs,
                resampling=Resampling.bilinear,
            )
        ndwi_a = (green_a - nir_a) / (green_a + nir_a + 1e-6)
        ndwi_b = (green_b - nir_b) / (green_b + nir_b + 1e-6)
        water_a, water_b = ndwi_a > threshold, ndwi_b > threshold
        expansion = water_b & ~water_a
        pixel_area = abs(before.transform.a * before.transform.e)
        if not before.crs or before.crs.is_geographic:
            pixel_area = 100.0
        before_ha = float(water_a.sum() * pixel_area / 10000)
        after_ha = float(water_b.sum() * pixel_area / 10000)
        expanded_ha = float(expansion.sum() * pixel_area / 10000)
        change_pct = ((after_ha - before_ha) / before_ha * 100) if before_ha else 0
        return {
            "mode": "deterministic GIS calculation",
            "summary": f"Surface-water extent increased by {max(change_pct, 0):.1f}% across the aligned scene pair.",
            "beforeWaterHa": round(before_ha, 2), "afterWaterHa": round(after_ha, 2),
            "expandedAreaHa": round(expanded_ha, 2), "changePercent": round(change_pct, 1),
            "threshold": threshold, "crs": str(before.crs), "maskPng": _mask_png(expansion),
            "trace": [
                _trace("Inputs validated", f"Two {before.width}×{before.height} rasters; CRS {before.crs}"),
                _trace("Scenes aligned", "After scene reprojected to the before-scene grid"),
                _trace("Water index computed", f"NDWI threshold {threshold:.2f}; bands {green_band}/{nir_band}"),
                _trace("Change measured", f"{expanded_ha:.2f} ha newly detected water"),
            ],
        }


@app.post("/api/analysis/water-change", tags=["Analysis"])
async def water_change(
    before: UploadFile = File(...), after: UploadFile = File(...),
    green_band: int = Form(2), nir_band: int = Form(4), threshold: float = Form(0.08),
) -> dict[str, Any]:
    paths = [await _save_upload(before), await _save_upload(after)]
    try:
        return _analyze_paths(paths[0], paths[1], green_band, nir_band, threshold)
    finally:
        for path in paths:
            path.unlink(missing_ok=True)


@app.get("/api/demo/analysis", tags=["Demonstration"])
def demo_analysis() -> dict[str, Any]:
    before, after = DATA / "demo_before.tif", DATA / "demo_after.tif"
    if not before.exists() or not after.exists():
        raise HTTPException(503, "Run backend/generate_demo_data.py first")
    result = _analyze_paths(before, after)
    result.update({
        "scenario": "Prepared Assam flood demonstration",
        "disclosure": "Prepared scenario; quantitative values are calculated live from bundled GeoTIFFs.",
        "answer": "The selected river corridor shows substantial lateral expansion into low-lying agricultural parcels. Prioritise verification near the eastern embankment and the two road crossings visible inside the selected area.",
        "evidence": ["Sentinel-2-style optical pair", "NDWI change mask", "Georeferenced area measurement"],
    })
    return result


@app.get("/api/demo/files/{scene}", tags=["Demonstration"])
def demo_file(scene: str) -> FileResponse:
    if scene not in {"before", "after"}:
        raise HTTPException(404, "Scene must be before or after")
    path = DATA / f"demo_{scene}.tif"
    return FileResponse(path, filename=path.name, media_type="image/tiff")
