from __future__ import annotations

import base64
import io
import math
import tempfile
from pathlib import Path
from typing import Any

import httpx
import numpy as np
import tifffile
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
EARTH_RADIUS_M = 6_371_008.8

app = FastAPI(
    title="SatQueryAI Geospatial API",
    version="0.2.0",
    description="Transparent GIS utilities and prepared demonstration endpoints for SIH 26167.",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
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


def _spherical_polygon_metrics(coordinates: list[tuple[float, float]]) -> tuple[float, float]:
    """Return approximate area and perimeter on a WGS84-sized sphere."""
    area_sum = 0.0
    perimeter = 0.0
    for (lon_a, lat_a), (lon_b, lat_b) in zip(coordinates, coordinates[1:]):
        lon_1, lat_1 = math.radians(lon_a), math.radians(lat_a)
        lon_2, lat_2 = math.radians(lon_b), math.radians(lat_b)
        delta_lon = (lon_2 - lon_1 + math.pi) % (2 * math.pi) - math.pi
        delta_lat = lat_2 - lat_1
        haversine = math.sin(delta_lat / 2) ** 2 + math.cos(lat_1) * math.cos(lat_2) * math.sin(delta_lon / 2) ** 2
        perimeter += 2 * EARTH_RADIUS_M * math.asin(min(1.0, math.sqrt(haversine)))
        area_sum += delta_lon * (2 + math.sin(lat_1) + math.sin(lat_2))
    return abs(area_sum) * EARTH_RADIUS_M**2 / 2, perimeter


def _trace(label: str, detail: str, status: str = "complete") -> dict[str, str]:
    return {"label": label, "detail": detail, "status": status}


def _fallback_scenes(bbox: list[float]) -> list[dict[str, Any]]:
    return [
        {"id": "S2_PRE_FLOOD_20240718", "source": "Sentinel-2 L2A", "date": "2024-07-18", "cloud": 6.2, "resolution_m": 10, "mode": "optical", "thumbnail": None, "bbox": bbox},
        {"id": "S2_POST_FLOOD_20240827", "source": "Sentinel-2 L2A", "date": "2024-08-27", "cloud": 3.8, "resolution_m": 10, "mode": "optical", "thumbnail": None, "bbox": bbox},
        {"id": "S1_POST_FLOOD_20240829", "source": "Sentinel-1 GRD", "date": "2024-08-29", "cloud": None, "resolution_m": 10, "mode": "sar", "thumbnail": None, "bbox": bbox},
    ]


@app.get("/api/health", tags=["System"])
def health() -> dict[str, Any]:
    return {"status": "ok", "service": "SatQueryAI", "engine": f"tifffile {tifffile.__version__}"}


@app.get("/api/scenarios", tags=["Demonstration"])
def scenarios() -> list[dict[str, str]]:
    return [{"id": "assam-flood", "title": "Assam flood extent", "location": "Dhemaji, Assam", "dates": "18 Jul → 27 Aug 2024", "status": "prepared"}]


@app.post("/api/catalog/search", tags=["Imagery"])
async def catalog_search(request: CatalogRequest) -> dict[str, Any]:
    base_payload = {
        "bbox": request.bbox,
        "datetime": f"{request.date_from}T00:00:00Z/{request.date_to}T23:59:59Z",
        "limit": request.limit,
    }
    try:
        features: list[dict[str, Any]] = []
        async with httpx.AsyncClient(timeout=8) as client:
            # Cloud cover is an optical property. Searching optical and SAR in one
            # request with this filter silently removes valid Sentinel-1 scenes.
            for source in request.sources:
                payload = {**base_payload, "collections": [source]}
                if "sentinel-2" in source:
                    payload["query"] = {"eo:cloud_cover": {"lte": request.max_cloud}}
                response = await client.post("https://earth-search.aws.element84.com/v1/search", json=payload)
                response.raise_for_status()
                features.extend(response.json().get("features", []))
        items = []
        for feature in features:
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
                "bbox": feature.get("bbox"),
            })
        if items:
            items.sort(key=lambda item: item["date"], reverse=True)
            return {"provider": "Element 84 Earth Search STAC", "live": True, "scenes": items[:request.limit]}
    except Exception:
        pass
    requested_modes = {"sar" if "sentinel-1" in source else "optical" for source in request.sources}
    return {"provider": "curated offline catalogue", "live": False, "scenes": [scene for scene in _fallback_scenes(request.bbox) if scene["mode"] in requested_modes]}


@app.post("/api/measure-area", tags=["GIS"])
def measure_area(request: AreaRequest) -> dict[str, float]:
    if len(request.coordinates) < 3:
        raise HTTPException(422, "A polygon needs at least three coordinates")
    ring = request.coordinates + ([request.coordinates[0]] if request.coordinates[-1] != request.coordinates[0] else [])
    area, perimeter = _spherical_polygon_metrics([(float(lon), float(lat)) for lon, lat in ring])
    return {"area_hectares": round(area / 10000, 3), "perimeter_km": round(perimeter / 1000, 3)}


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
        bands, metadata = _read_tiff(path)
        samples = []
        for index, band in enumerate(bands[:6], start=1):
            valid = band[np.isfinite(band)]
            samples.append({"band": index, "min": round(float(valid.min()), 4), "max": round(float(valid.max()), 4), "mean": round(float(valid.mean()), 4)})
        return {"filename": file.filename, "width": metadata["width"], "height": metadata["height"], "bands": len(bands), "dtype": str(bands.dtype), "crs": metadata["crs"], "bounds": metadata["bounds"], "nodata": metadata["nodata"], "statistics": samples}
    except (tifffile.TiffFileError, ValueError, OSError) as exc:
        raise HTTPException(400, f"Not a readable raster: {exc}") from exc
    finally:
        path.unlink(missing_ok=True)


def _geokeys(values: tuple[int, ...] | None) -> dict[int, int]:
    if not values or len(values) < 4:
        return {}
    keys: dict[int, int] = {}
    for offset in range(4, len(values), 4):
        if offset + 3 >= len(values):
            break
        key_id, location, count, value = values[offset:offset + 4]
        if location == 0 and count == 1:
            keys[int(key_id)] = int(value)
    return keys


def _read_tiff(path: Path) -> tuple[np.ndarray, dict[str, Any]]:
    with tifffile.TiffFile(path) as tif:
        page = tif.pages[0]
        data = np.asarray(tif.asarray())
        if data.ndim == 2:
            bands = data[np.newaxis, ...]
        elif data.ndim == 3 and data.shape[-1] <= 16 and data.shape[0] > 16 and data.shape[1] > 16:
            bands = np.moveaxis(data, -1, 0)
        elif data.ndim == 3:
            bands = data
        else:
            raise ValueError("Only single-image, two- or three-dimensional TIFFs are supported")
        tags = page.tags
        scale = tuple(float(value) for value in tags[33550].value) if 33550 in tags else None
        tiepoint = tuple(float(value) for value in tags[33922].value) if 33922 in tags else None
        keys = _geokeys(tuple(int(value) for value in tags[34735].value) if 34735 in tags else None)
        epsg = keys.get(3072) or keys.get(2048)
        crs = f"EPSG:{epsg}" if epsg and epsg != 32767 else None
        nodata = None
        if 42113 in tags:
            try:
                nodata = float(str(tags[42113].value).strip("\x00"))
            except ValueError:
                pass
        width, height = int(page.imagewidth), int(page.imagelength)
        bounds: list[float] = [0.0, 0.0, float(width), float(height)]
        if scale and tiepoint and len(scale) >= 2 and len(tiepoint) >= 6:
            left = tiepoint[3] - tiepoint[0] * scale[0]
            top = tiepoint[4] + tiepoint[1] * scale[1]
            bounds = [left, top - height * scale[1], left + width * scale[0], top]
        return bands, {"width": width, "height": height, "crs": crs, "bounds": bounds, "nodata": nodata, "scale": scale, "tiepoint": tiepoint, "geokeys": keys}


def _mask_png(mask: np.ndarray) -> str:
    rgba = np.zeros((*mask.shape, 4), dtype=np.uint8)
    rgba[mask] = [31, 211, 210, 150]
    image = Image.fromarray(rgba, "RGBA")
    image.thumbnail((720, 720))
    buf = io.BytesIO()
    image.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def _raster_preview(bands: np.ndarray) -> str:
    indexes = [2, 1, 0] if len(bands) >= 3 else [0, 0, 0]
    data = bands[indexes].astype("float32")
    rgb = np.zeros(data.shape, dtype=np.uint8)
    for index in range(3):
        band = data[index]
        valid = band[np.isfinite(band)]
        if not valid.size:
            continue
        low, high = np.percentile(valid, (2, 98))
        stretched = np.clip((np.nan_to_num(band, nan=low) - low) / max(high - low, 1e-6), 0, 1)
        rgb[index] = (stretched * 255).astype(np.uint8)
    image = Image.fromarray(np.moveaxis(rgb, 0, -1), "RGB")
    image.thumbnail((960, 960))
    buf = io.BytesIO()
    image.save(buf, "JPEG", quality=88, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def _pixel_area(metadata: dict[str, Any]) -> tuple[float, float, str, str]:
    scale = metadata["scale"]
    if not scale or len(scale) < 2:
        return 1.0, 1.0, "pixels", "Pixel-count comparison; GeoTIFF pixel scale unavailable"
    if 3072 in metadata["geokeys"]:
        return abs(scale[0] * scale[1]), 10_000.0, "ha", "Projected GeoTIFF pixel size"
    bounds = metadata["bounds"]
    centre_lon = (bounds[0] + bounds[2]) / 2
    centre_lat = (bounds[1] + bounds[3]) / 2
    corners = [(centre_lon, centre_lat), (centre_lon + scale[0], centre_lat), (centre_lon + scale[0], centre_lat + scale[1]), (centre_lon, centre_lat + scale[1]), (centre_lon, centre_lat)]
    area, _ = _spherical_polygon_metrics(corners)
    return area, 10_000.0, "ha", "Spherical pixel area estimated at raster centre"


def _analyze_paths(before_path: Path, after_path: Path, green_band: int = 2, nir_band: int = 4, threshold: float = 0.08) -> dict[str, Any]:
    before, before_meta = _read_tiff(before_path)
    after, after_meta = _read_tiff(after_path)
    if before.shape[1:] != after.shape[1:]:
        raise HTTPException(422, "The two rasters must already use the same pixel grid and dimensions")
    if max(green_band, nir_band) > min(len(before), len(after)):
        raise HTTPException(422, "Selected band is missing from one raster")
    green_a, nir_a = before[green_band - 1].astype("float32"), before[nir_band - 1].astype("float32")
    green_b, nir_b = after[green_band - 1].astype("float32"), after[nir_band - 1].astype("float32")
    ndwi_a = (green_a - nir_a) / (green_a + nir_a + 1e-6)
    ndwi_b = (green_b - nir_b) / (green_b + nir_b + 1e-6)
    water_a, water_b = ndwi_a > threshold, ndwi_b > threshold
    expansion = water_b & ~water_a
    pixel_area, divisor, area_unit, area_method = _pixel_area(before_meta)
    before_ha = float(water_a.sum() * pixel_area / divisor)
    after_ha = float(water_b.sum() * pixel_area / divisor)
    expanded_ha = float(expansion.sum() * pixel_area / divisor)
    change_pct = ((after_ha - before_ha) / before_ha * 100) if before_ha else 0
    direction = "increased" if change_pct >= 0 else "decreased"
    return {
            "mode": "deterministic GIS calculation",
            "summary": f"Surface-water extent {direction} by {abs(change_pct):.1f}% across the aligned scene pair.",
            "beforeWaterHa": round(before_ha, 2), "afterWaterHa": round(after_ha, 2),
            "expandedAreaHa": round(expanded_ha, 2), "changePercent": round(change_pct, 1),
            "threshold": threshold, "crs": before_meta["crs"] or "unreferenced grid", "areaMethod": area_method, "areaUnit": area_unit,
            "beforePreviewPng": _raster_preview(before), "afterPreviewPng": _raster_preview(after),
            "maskPng": _mask_png(expansion),
            "trace": [
                _trace("Inputs validated", f"Two {before_meta['width']}×{before_meta['height']} rasters; CRS {before_meta['crs'] or 'not declared'}"),
                _trace("Grids validated", "The uploaded rasters share the same pixel dimensions"),
                _trace("Water index computed", f"NDWI threshold {threshold:.2f}; bands {green_band}/{nir_band}"),
                _trace("Change measured", f"{expanded_ha:.2f} {area_unit} newly detected water"),
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
