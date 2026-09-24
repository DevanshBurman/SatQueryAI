# SatQueryAI real imagery and CapCut guide

## Recommended demonstration pair

Use one location observed on two dates, not two unrelated locations. A strong flood example is the lower Indus floodplain in Pakistan:

- AOI bbox: `68.4, 26.3, 69.4, 27.3` (west, south, east, north)
- Before: `S2B_42RWQ_20220627_0_L2A` — 27 June 2022
- After: `S2A_42RWQ_20220920_0_L2A` — 20 September 2022
- Collection: Sentinel-2 Level-2A
- Verified through the live Earth Search STAC endpoint on 15 September 2026; both searches reported effectively cloud-free scene metadata for this tile.

This is a candidate pair, not a pre-validated SatQuery result. Visually inspect both exports, confirm they overlap, and independently check the measured result before recording.

## Where to get the files

### Best manual route: Copernicus Browser

1. Open [Copernicus Browser](https://dataspace.copernicus.eu/browser/) and create a free account.
2. Search the scene IDs above or draw the AOI with the coordinates above.
3. Select Sentinel-2 L2A and the exact acquisition date.
4. Use the analytical download, not a screenshot.
5. Export raw `B02`, `B03`, `B04`, and `B08` at 10 m for the exact same AOI, CRS, dimensions, and resolution on both dates.
6. If the browser returns separate band files, combine them in QGIS: **Raster → Miscellaneous → Build Virtual Raster**, enable **Place each input file into a separate band**, order the inputs as `B02, B03, B04, B08`, then **Raster → Conversion → Translate** to GeoTIFF.
7. In SatQueryAI keep `Green band = 2`, `NIR band = 4`, and start with `Water threshold = 0.08`. Those defaults are correct only for that explicit band order.

The official [Copernicus Browser documentation](https://documentation.dataspace.copernicus.eu/Applications/Browser.html) covers AOI drawing, scene search, compare/timelapse tools, and analytical GeoTIFF download.

### Fast discovery route: SatQueryAI / Earth Search

The new **Catalogue** panel queries [Element 84 Earth Search](https://github.com/Element84/earth-search) through the local FastAPI service. It returns real scene IDs, dates, cloud metadata, resolution, and preview links when the service is online. Adding a result currently links its metadata and preview; it does not silently download or process the source COG bands.

Other trustworthy sources:

- [NASA Worldview](https://worldview.earthdata.nasa.gov/) for fast visual event discovery and GeoTIFF/JPEG/PNG snapshots.
- [USGS Landsat data access](https://www.usgs.gov/landsat-missions/landsat-data-access) and EarthExplorer for free Landsat products.
- Copernicus Data Space for Sentinel product downloads and APIs.

Do not use Google Images, unlabeled social-media images, or two screenshots with different crops as analytical inputs.

## Before recording

- Put both final GeoTIFFs in a dedicated demo folder and keep a text manifest with scene ID, date, source URL, CRS, band order, resolution, and checksum.
- Run Geo Intelligence on each file and capture the factual metadata.
- Run Change Intelligence and independently inspect the mask alignment at several zoom levels.
- Record the exact threshold and hectares returned by the API. Do not reuse the bundled synthetic result values for real scenes.
- If the catalog says **Offline fallback**, do not describe it as a live search.
- Keep the model/Copilot result labelled **Prepared** until a real model receives and persists the selected image and mask.

## Record the interface

Use CapCut Desktop's **Record screen** from the home screen, or use OBS/Windows Game Bar and import the recording. Record at 1920×1080, 30 fps, browser zoom 100%, with bookmarks and notifications hidden.

Record short clean clips rather than one fragile take:

1. Dashboard and hover navigation — 6–8 seconds.
2. Geo Intelligence: upload one real GeoTIFF and reveal CRS/bands/statistics — 12–15 seconds.
3. Change Intelligence: load the matched pair, show band mapping, and click the real analysis action — 18–25 seconds.
4. Source swipe, then the separate change-mask view and returned measurements — 15–20 seconds.
5. Catalogue: draw the AOI, search STAC, and add one real scene — 15–20 seconds.
6. Copilot: show the animated presence and the honest **Prepared / model not connected** trace — 6–8 seconds.

Do not stage a fake progress bar. If processing takes several seconds, cut the idle middle but preserve the real action before it and the real completed result after it.

## Edit in CapCut

1. Create a 16:9 project and place the screen clips in the order above.
2. Remove dead cursor travel and failed takes with split/delete edits.
3. Use hard cuts or a 4–6 frame dissolve. Avoid template transitions that make the GIS product feel like an advertisement.
4. For important details, select the clip and add two keyframes using the diamond beside **Scale/Position**: start at 100%, end near 112–118%, then ease in/out. Hold the zoom long enough to read the value.
5. Add small captions such as `LIVE GEOTIFF METADATA`, `ALIGNED NDWI`, `MASK SHOWN ON RESULT ONLY`, and `LIVE STAC`. Use the product's blue/teal and grey palette; never place “AI confidence” on screen.
6. Record one calm voiceover after the picture edit. Then use **Captions → Auto Captions**, select the spoken language, generate, and manually correct satellite IDs, CRS values, NDWI, and hectares.
7. Keep music optional and very low. Use only audio with an explicit reuse licence.
8. Export H.264 MP4 at 1080p, 30 fps, with a high/recommended bitrate. Watch the exported file once at normal speed and once muted to confirm all captions and numbers are readable.

CapCut's official guides document [screen recording](https://www.capcut.com/resource/hidden-screen-recorder), [keyframes](https://www.capcut.com/resource/how-to-add-keyframes-in-capcut), and [desktop auto captions](https://www.capcut.com/help/how-to-recognise-subtitles).

## High-value product steps after this milestone

1. Download selected STAC COG bands into a persisted project with checksums and provenance.
2. Add polygon editing with a maintained library such as Terra Draw or Mapbox GL Draw's MapLibre integration; keep the current dependency-free rectangle tool as the reliable baseline.
3. Add image-space polygon/brush masks for JPG/PNG and store mask pixels with the prompt.
4. Add automatic selection only through a named, evaluated segmentation model; show the mask as a suggestion requiring user confirmation.
5. Connect a VLM only after run persistence records the image, mask, prompt, model/version, response, and evidence references.

