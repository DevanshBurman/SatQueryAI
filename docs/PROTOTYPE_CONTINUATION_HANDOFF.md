# SatQueryAI prototype continuation handout

> Historical handoff. This describes an earlier UI baseline; use the current code and [recording readiness](RECORDING_READY.md) for present capabilities. Frontend source now lives under `frontend/src/`.

## Purpose of this handout

This repository is a frontend-first satellite-imagery and geospatial-analysis prototype for **SatQuery AI**. It is intended to make the problem statement easy to understand in a demo while showing a credible path to real imagery, deterministic GIS tools, and later VLM-powered answers.

This is the authoritative continuation context for a new agent. Read this file, `AGENTS.md`, and `AGENT_EXECUTION.md` before changing the project.

## Current repository state

- Repository: `https://github.com/DevanshBurman/SatQueryAI.git`
- Current committed UI baseline: `9c3c764 Rebuild SatQuery product workspace`
- Main frontend entry: `src/App.tsx`
- Product workspace implementation: `src/AnalysisWorkspace.tsx`
- Workspace styling: `src/analysis-workspace.css`
- Backend: `backend/main.py` (FastAPI)
- Frontend command: `npm run dev`
- Frontend URL: `http://127.0.0.1:5173`
- Build command: `npm run build`
- Browser verification script: `node scripts/check-requested-ui.mjs`

Do not leave implementation changes uncommitted. Do not push without an explicit user request.

## Design direction that is fixed

Do not replace the product shell with a generic chatbot, neon landing page, large onboarding modal, or oversized marketing typography.

The agreed product direction is a compact, professional Earth-observation interface inspired by the information density and restraint of EOS LandViewer and Planet:

- Dark charcoal/grey primary interface, with restrained blue/teal as the interactive accent.
- A light mode in Settings; dark is the default.
- Small readable product typography, dense but not cramped panels, fine borders, and calm spacing.
- A left navigation rail that is icon-only when idle and expands **on hover/focus** over the workspace. It should not push the canvas sideways while expanding.
- Profile and Settings belong at the bottom of the navigation.
- The dashboard is the overview/home, not the map workspace.
- The reusable job layout is: **asset/history panel → map or image canvas → evidence/chat/status panel**.
- Map selection is for catalog or georeferenced imagery. Plain JPG/PNG can be viewed and masked in an image canvas without pretending it has coordinates.
- All prepared, illustrative, or synthetic inputs/results must be labelled honestly. Do not invent a “live VLM answer,” confidence score, satellite telemetry, or observed change.

## The product information architecture

The sidebar should contain these main sections. The current shell has all of them and should be evolved, not re-invented.

1. **Dashboard** — recent projects, saved imagery, saved AOIs, analysis run status, reports, quick-start actions.
2. **SatQuery Copilot** — one image, an optional mask/region, then a grounded question and answer with evidence.
3. **Change Intelligence** — two acquisitions, compatibility/alignment, swipe/opacity/blink comparison, derived change mask and measurement.
4. **Multimodal Fusion** — optical and SAR inputs, synchronized inspection and separate sensor evidence; fusion only when a real implementation exists.
5. **Geo Intelligence** — upload GeoTIFF, inspect metadata, measure polygon/area, compute reproducible raster/index results.
6. **Intelligence Reports** — saved runs, evidence briefs and exports.
7. **Settings** — appearance, layer defaults, local-session preferences.

## What currently works in the frontend

`src/AnalysisWorkspace.tsx` currently provides:

- Dashboard, four tool workspaces, reports and settings screens.
- Hover-expanding/focusable navigation rail.
- Dark/light appearance saved in local storage.
- Per-workflow visual states and prepared-status disclosure.
- Local file picker and browser object-URL preview for image uploads.
- Mask-tool selection UI in Copilot/Geo Intelligence.
- A draggable before/after divider in Change Intelligence.
- Optical/SAR blend illustration in Fusion.
- Local-only question composer state and analysis trace states.
- Playwright verification for dashboard, nav hover, all four workspaces, and light mode.

These are **frontend interactions**, not proof that real imagery or models are being used.

## What already works in the backend, but needs reconnecting

`backend/main.py` already contains meaningful capabilities:

| Endpoint | Current capability | Frontend follow-up |
|---|---|---|
| `GET /api/health` | API/rasterio health | Show a real service indicator, not fake telemetry. |
| `POST /api/catalog/search` | Queries Element 84 Earth Search STAC for Sentinel-1/2 and falls back to curated scenes | Build the map/AOI/date/source filter flow and render returned scene cards. |
| `POST /api/measure-area` | WGS84 polygon area and perimeter | Connect this to a drawn map AOI and display units transparently. |
| `POST /api/raster/inspect` | Reads uploaded GeoTIFF dimensions, bands, CRS, bounds and band stats | Use it in Geo Intelligence immediately after upload. |
| `POST /api/analysis/water-change` | Reprojects/aligned pair, calculates NDWI change mask and hectares | Use only for compatible GeoTIFF pairs; render returned mask, trace and quantities. |
| `GET /api/demo/analysis` | Prepared scenario using bundled synthetic GeoTIFFs with explicit disclosure | Keep only as a clearly labelled fallback/demo. |

The frontend rewrite at `9c3c764` deliberately focused on the product shell and does **not** call these endpoints yet. Reconnecting these endpoints is the next priority.

## Critical integrity rules

- A before/after slider must only compare genuinely different, matched source assets. Do not use a darkened copy of the same image and present it as temporal change.
- A change mask must appear only on the relevant derived/result view, not on the “before” image.
- For demo data, name it `Prepared`, `Illustrative`, or `Synthetic`; explain exactly what is calculated live versus written narrative.
- User-uploaded PNG/JPG images are not automatically map data. Keep them in the image workflow unless they include valid georeferencing.
- A mask can improve the relevance of a model query by narrowing the image region, but it does not guarantee model accuracy. Preserve the selected mask as evidence with the request.
- Do not claim a VLM has answered until it is connected and the actual response, source files, and prompt are persisted.

## Recommended implementation order

This sequence is deliberately narrow. Complete and verify each stage before broadening the UI.

### Stage 1 — Make Geo Intelligence genuinely useful

1. Start FastAPI locally (`python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000`).
2. Configure the Vite dev proxy or a small typed API client so frontend calls reach `http://127.0.0.1:8000`.
3. In Geo Intelligence upload, call `/api/raster/inspect` for TIFF files.
4. Show filename, size, dimensions, CRS, bounds, bands and statistics in the right evidence panel.
5. Keep normal PNG/JPG upload preview, but label it “non-georeferenced image.”
6. Add a visible job sequence: `queued → validating → inspecting → ready/failed`.

### Stage 2 — Make Change Intelligence real

1. Require two GeoTIFF uploads for deterministic water-change analysis.
2. Validate compatible band availability and show an actionable error if they are not compatible.
3. Send both files to `/api/analysis/water-change`.
4. Render returned `maskPng` only on the after/result side or in a dedicated “change mask” layer.
5. Show returned water areas, change percent, threshold, CRS and trace exactly as returned.
6. Preserve the slider as a visual inspection control; do not use it as the calculation itself.

### Stage 3 — Add real public imagery discovery

1. Use a map library already listed in `package.json` (`maplibre-gl`).
2. Let users draw/select an AOI, choose date range, cloud cover and optical/SAR source.
3. Call `/api/catalog/search`, display scene metadata/date/cloud/source cards, and let users add selected scenes to a project.
4. Start with STAC metadata and valid previews; do not promise full hosted raster rendering until signed/available asset URLs are handled correctly.
5. Treat Bhoonidhi/ISRO sources as a later integration because access/authentication and terms need to be confirmed.

### Stage 4 — Add persistence and actual model integration

1. Persist project, assets, AOI/mask, run state, prompt, response, model/version and evidence references in a real storage layer.
2. Connect the RS VLM only after an explicit model/runtime decision. It must receive the selected image(s) and optional mask/crop, not just generic prompt text.
3. Display a job lifecycle in the UI: `uploading → preprocessing → aligning/indexing → inference → GIS → evidence ready`.
4. Store results and create reports from stored run data—not fabricated cards.

## Assets needed from the user

To make the prototype demonstrably real, request a small, coherent data pack rather than random screenshots:

- One real before/after pair of the **same AOI**, ideally cloud-light Sentinel-2 GeoTIFFs or GeoTIFF exports with acquisition dates and source metadata.
- Optionally, a matching Sentinel-1 SAR acquisition for the same AOI/date range.
- A compact AOI GeoJSON/polygon or named coordinates.
- One or two normal PNG/JPG satellite images for the single-image Copilot flow.
- Any approved branding/logo/font assets and the exact team/member display name.
- Permission/source URLs for each public asset, so its provenance can appear in the UI and video.

Avoid using unverified Google-image screenshots as analytical evidence.

## Verification and commit discipline

For every implementation change:

1. Read `AGENT_EXECUTION.md` and `git status --short` first.
2. Run `npm run build`.
3. Run `node scripts/check-requested-ui.mjs`; expand it as new functionality is added.
4. If backend behavior changed, test the relevant endpoint with actual sample input.
5. Run `git diff --check` and inspect the diff.
6. Commit the coherent verified change. Do not push unless the user explicitly asks.

## Definition of a credible prototype milestone

The next credible milestone is **not** “a working AI chatbot.” It is:

- a user can upload a real GeoTIFF and see factual metadata;
- a user can upload two compatible GeoTIFFs and see a reproducible NDWI water-change calculation and overlay;
- catalog search returns real Sentinel metadata for a selected AOI/date;
- every result has a source, status and clear disclosure;
- prepared demo material is visually strong but never confused with live inference.
