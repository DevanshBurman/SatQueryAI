# SatQuery AI — Final Prototype and 5-Minute Video Plan

Date: 2026-09-14  
Decision status: recommended P1 build scope; team approval still required  
Source of truth: `SATQUERY_PRD.md`

## 1. Executive decision

Build one real workflow and make it the centre of the submission:

> **A user asks where vegetation greenness decreased between two Sentinel-2 Level-2A observations; SatQuery validates the scenes, excludes invalid/cloud pixels, computes NDVI change, measures candidate-decrease regions with GIS, and returns a map, warnings, exports, and a reproducible execution trace.**

Do not make flood detection, SAR fusion, building detection, an unrestricted satellite chatbot, or model fine-tuning the hero of the final prototype unless those capabilities are independently implemented and evaluated before recording.

Current repository status: planning documents and visual assets exist; no prototype implementation is present in the inspected workspace. Therefore every software capability is currently **planned**, not implemented.

## 2. Strict SIH judge assessment

### Three convincing elements

1. **The evidence-linked product claim is defensible.** The answer is connected to source scenes, map layers, measurements, warnings, and a trace rather than being only generated prose.
2. **The architecture separates interpretation from measurement.** Models may interpret observations, while deterministic GIS performs band math, coordinates, areas, and exports.
3. **The staged scope is technically mature.** Starting with a narrow optical workflow and treating SAR/fusion/adaptation as gated later work reduces the risk of a polished but scientifically empty demo.

### Three dangerous weak points

1. **There is no working prototype yet.** A diagram-heavy presentation cannot prove the central claim. The live vertical slice must exist before slide polishing.
2. **The proposed scope can still explode.** VQA, captioning, temporal change detection, SAR, fusion, segmentation, training, and arbitrary uploads cannot all be made credible at once by a student team on a short deadline.
3. **The differentiation is easy to overstate.** Planet, EOSDA LandViewer, Google Earth Engine, and Mapflow already support imagery discovery, processing, comparison, exports, or guided/agentic mapping. SatQuery must compete on constrained natural-language intent, preflight validation, source-linked evidence, explicit limitations, and reproducibility—not on “all satellite tools in one place” or “first satellite AI.”

## 3. What to borrow from existing products

| Product | Proven pattern to borrow | What SatQuery must not claim |
|---|---|---|
| Planet Insights Platform | AOI/time selection, compare views, indices, statistics, time series, and export | Planet imagery access, daily monitoring, or Planet-scale infrastructure unless licensed and integrated |
| EOSDA LandViewer | Map-first AOI, dated scene cards, cloud filters, band/index controls, comparison slider, metadata visibility | A large live imagery catalogue or instant global processing |
| Mapflow AI Agent | Conversation gathers task/AOI/input, recommends a bounded workflow, shows parameters, and asks for confirmation before execution | That conversational geospatial orchestration itself is novel |
| Google Earth Engine | Reproducible geospatial processing over typed image bands and projections | Planetary-scale compute or a replacement for Earth Engine |

Research references:

- Planet analysis documentation: https://docs.planet.com/platform/get-started/analyze-data/
- Planet Browser comparison and statistics: https://docs.planet.com/platform/get-started/analyze-data/analyze-imagery-in-browser/
- Mapflow AI Agent workflow: https://docs.mapflow.ai/userguides/mapflow_agent.html
- EOSDA LandViewer guide: https://eos.com/user-guide/landviewer/
- Google Earth Engine overview: https://developers.google.com/earth-engine
- Copernicus Sentinel-2 L2A bands and scene classification: https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Data/S2L2A.html

Planet is a useful benchmark and possible future data source, not the P1 dependency. Use prepared, licence-compatible Sentinel-2 L2A fixtures for the recorded prototype.

## 4. Exact P1 user journey

### Supported user request

Primary demo query:

> “Where did vegetation greenness decrease inside this area between 12 March 2025 and 17 March 2026?”

The dates above are placeholders until the team selects two real scenes. Use the actual acquisition dates in the final UI and narration.

### Input contract

- Two real Sentinel-2 L2A observations of the same AOI.
- Required analysis bands: B04 (red) and B08 (near infrared), both at 10 m.
- Required quality input: SCL or an explicitly documented alternative cloud/no-data mask.
- Known acquisition dates and scene identifiers.
- Valid CRS, affine transform, bounds, nodata handling, and band mapping.
- Prefer the same tile/orbit and comparable season; if not, show the limitation.

### Executed workflow

1. Ingest both scene packages or prepared multiband GeoTIFF fixtures.
2. Read and display metadata; never infer a sensor only from the `.tif` extension.
3. Validate dates, B04/B08 availability, CRS, overlap, pixel grid, nodata, and quality mask.
4. Resolve the typed query to the bounded intent `vegetation_change` and show the interpreted intent for confirmation.
5. Clip to the selected AOI and establish one common grid. Reject or explicitly resample misaligned inputs.
6. Exclude nodata, cloud, cloud shadow, saturated/defective, and other configured invalid SCL classes.
7. Compute `NDVI = (B08 - B04) / (B08 + B04)` for both dates, guarding zero/invalid denominators.
8. Compute `delta_ndvi = ndvi_after - ndvi_before` only over mutually valid pixels.
9. Summarise the distribution: valid coverage, mean/median change, percentiles, and valid area.
10. Create an explicitly parameterised candidate layer, for example `delta_ndvi <= -0.20`. This is a screening threshold, not confidence and not proof of disease, deforestation, or disaster.
11. Polygonise candidate regions, remove regions below a declared minimum mapping unit, and calculate area in a suitable projected CRS.
12. Produce the answer only from stored measurements and artifacts.

### Required outputs

- Synchronized before/after true-colour view.
- NDVI-before, NDVI-after, and NDVI-difference layers.
- Candidate vegetation-decrease polygons with legend and threshold.
- Valid-data/cloud-excluded coverage percentage.
- Candidate area in hectares and square kilometres.
- A plain-language conclusion that says “observed/candidate vegetation-index decrease,” not a causal claim.
- Warnings for seasonality, cloud cover, alignment, threshold sensitivity, and sensor resolution when applicable.
- Real execution trace with step names, parameters, durations, and artifact IDs.
- Downloads: difference GeoTIFF, candidate GeoJSON, statistics CSV, and `run.json` provenance record.

### One failure case to prove trust

Keep a small fixture with B08 missing or an AOI outside the common overlap. Show SatQuery stopping before analysis with a useful message. This 8–10 second proof is more persuasive than another architecture animation.

## 5. UI recommendation

### Entry screen

Do not start with a blank chat box. Show:

- `Try prepared case` — the reliable recorded demo.
- `Upload two observations` — real upload path.
- Three task cards: `Compare vegetation` (available), `Describe one scene` (only if implemented), and `Water/SAR assessment` (labelled “planned,” not clickable as if working).

Each card says what inputs it requires and what output it produces. This preserves the friend’s beginner-friendly selection idea without pretending the system supports arbitrary analysis.

### Main workspace

Use a three-panel map-first layout:

```text
+----------------------+--------------------------------+-------------------------+
| Scenes & layers      | Map / synchronized compare     | Ask & result            |
| Date A / Date B      | before | after | delta          | query                   |
| validation badges    | AOI + candidate polygons       | interpreted intent      |
| layer toggles        | legend + cursor values         | answer + measurements   |
| opacity              |                                | warnings + evidence     |
+----------------------+--------------------------------+-------------------------+
| Collapsible execution trace: validate → mask → NDVI → delta → polygons → area |
+-------------------------------------------------------------------------------+
```

### Visual hierarchy

- Centre the map; it is the evidence, not decoration.
- Use green for vegetation, magenta/orange for decrease candidates, grey hatching for excluded/invalid pixels, and icons plus text for pass/warning/fail.
- Keep one primary action: `Validate & preview`, then `Run analysis` after the interpreted plan is visible.
- Put technical metadata in progressive disclosure, but show date, bands, CRS, resolution, overlap, and valid coverage without requiring a hidden debug screen.
- Clicking a measurement or evidence item must highlight its map layer/region.
- Never show an invented “AI confidence.” Show `valid coverage`, `threshold`, `evidence`, and `warnings`.

## 6. Implementation order

### Sprint A — scientific core

- Define scene, validation, run, measurement, artifact, and event schemas.
- Select and archive two real scenes plus one invalid fixture.
- Implement raster inspection, masks, NDVI, delta, polygonisation, and area calculation.
- Add unit tests for known arrays and spatial tests for grid/area correctness.

Exit: a command/API run produces correct GeoTIFF, GeoJSON, CSV, and run JSON without a UI.

### Sprint B — bounded orchestration and API

- Implement the `vegetation_change` intent and typed plan.
- Add a tool registry; free-form text must never become shell/code execution.
- Add FastAPI endpoints for upload/sample selection, validation, run status, results, and downloads.
- Persist run events locally (SQLite or JSON-backed local storage is acceptable for P1).

Exit: invalid plans fail before processing and a real trace can be replayed.

### Sprint C — judge-facing UI

- Build the entry task cards and prepared-case path.
- Build scene validation cards, MapLibre map, compare control, layers, result/evidence cards, and trace.
- Ensure all visible values come from the API artifacts, not hard-coded text.
- Add loading, warning, failure, and retry states.

Exit: a fresh local run completes end-to-end through the browser.

### Sprint D — verification and recording

- Independently verify a reported area from the output geometry.
- Test missing band, non-overlap, alignment mismatch, invalid denominator, and cloud/no-data exclusion.
- Freeze the demo fixture and record exact values for narration.
- Record a backup screen capture of the complete successful run.

Only after these sprints should the team consider adding a pretrained caption/VQA baseline. If added, label it `pretrained baseline`; it must cite the scene and must not generate numeric GIS results.

## 7. What is implemented versus planned

Use these labels in the deck and UI until the state changes:

| Capability | Status now | Final video rule |
|---|---|---|
| Architecture and requirements | Documented | May present as design |
| P1 optical validation/NDVI workflow | Planned | Show only after a real run is verified |
| Natural-language intent | Planned, constrained P1 target | Call it constrained intent resolution, not general geospatial intelligence |
| Pretrained VLM caption/VQA | Planned | Omit unless stable and source-linked |
| Team-trained VLM adapter | Planned experiment | Roadmap only until before/after evaluation exists |
| Temporal learned change detector | Planned | Roadmap only |
| SAR and optical–SAR evidence fusion | Planned | Roadmap only |
| Cartosat/RISAT support | Unverified | Do not claim support |
| Deployment at operational scale | Unverified | Do not claim production readiness |

## 8. Final presentation structure

Aim for six main slides plus an appendix. Respect the official portal template and page limit once the team archives the current rules.

1. **Problem through one user decision** — A forest/agriculture analyst has two dated scenes but needs a defensible answer, not more pixels. One sentence, one before/after visual, three pain points.
2. **SatQuery in one line** — Question → validated workflow → geospatial evidence. State the differentiator and show the P1 input/output.
3. **Working proof** — Large prototype screenshot with real scene IDs/dates, validation badges, candidate layer, measured area, coverage, and export artifacts. This should be the strongest slide.
4. **How it works** — The seven layers, visually simplified. Highlight the deterministic P1 path and grey out planned model/SAR branches.
5. **Trust and differentiation** — Small comparison against conventional GIS, catalogue/analysis platforms, and chat-only AI. Emphasise validation, traceability, abstention, and reproducibility; avoid unsupported “first” claims.
6. **Feasibility, impact, and roadmap** — What is implemented now; next gates for VLM adaptation, learned temporal analysis, and SAR evidence; named team ownership; close with the high-value line.

Appendix: technical stack, validation checklist, output schema, test cases, model/dataset plan, risks, citations, and judge FAQ. Do not force this material into the six main slides.

## 9. Five-minute video storyboard

Target recorded duration: **4:40–4:55**, leaving portal/player margin.

| Time | Visual | Spoken purpose |
|---|---|---|
| 0:00–0:18 | One real before/after AOI; presenter briefly on camera or voice-over | “An analyst can see two observations, but a defensible answer requires correct bands, dates, cloud handling, alignment, measurement, and traceability.” |
| 0:18–0:35 | Product title and one-line flow | Introduce SatQuery as question-to-validated-evidence, not as the first satellite AI. |
| 0:35–0:55 | Prepared case selection and real scene cards | State sensor, actual dates, AOI, and question. |
| 0:55–1:25 | Validation run | Show bands, CRS, 10 m grid, overlap, cloud/no-data checks. Briefly show the invalid fixture being rejected if it fits smoothly. |
| 1:25–1:50 | Type the natural-language question; interpreted intent and plan appear | Explain that P1 supports a bounded vegetation-change intent and exposes the plan before execution. |
| 1:50–3:05 | Real processing trace and map layers | Show mask → NDVI A/B → delta → thresholded candidates → GIS measurement. Avoid sped-up fake status; edit out idle waiting if necessary. |
| 3:05–3:40 | Compare slider, candidate polygons, coverage, area, warning | Read the exact measured result and limitation. Say that the threshold identifies candidates and does not establish cause. |
| 3:40–4:05 | Click evidence and download artifacts | Prove source-linking, trace, and reproducibility. |
| 4:05–4:28 | Simplified architecture | “Models interpret evidence; GIS performs coordinate and measurement calculations.” Show planned branches in grey. |
| 4:28–4:45 | Roadmap/status matrix | Implemented P1 versus planned VLM adaptation, temporal detector, and SAR fusion. |
| 4:45–4:55 | Team/title close | “SatQuery does not ask a model to guess the Earth. It validates the data and makes every claim traceable to evidence.” |

### Recording rules

- Use one narrator; avoid a 30–45 second acted office scene.
- Record at 1080p, enlarge browser text, hide bookmarks/notifications, and keep the cursor deliberate.
- Use captions and short callouts, not paragraph overlays.
- Do not show code unless answering a technical judge question.
- Do not fake waiting animations, API calls, measurements, confidence, or model outputs.
- If a step is prerecorded because processing is slow, say “recorded run” and preserve the real trace/timestamps.
- Rehearse to 4:45 and keep one clean continuous demo take plus a safely edited final cut.

## 10. Submission package

- Final PPT and exported PDF.
- 5-minute MP4 and a compressed backup copy.
- Runnable repository with README and exact local start commands.
- Two small lawful demo fixtures or a download manifest with checksums.
- One invalid fixture for validation proof.
- Saved successful `run.json` plus generated GeoTIFF, GeoJSON, and CSV.
- Test report showing scientific/spatial checks.
- Capability matrix with `implemented`, `prototype`, `planned`, and `unsupported` labels.
- Source/licence manifest and acknowledgements.
- Backup screenshots and screen recording in case the live demo fails.

## 11. Go/no-go gate before recording

Do not record the final submission until all answers are “yes”:

- Can a clean machine reproduce the prepared case?
- Are every date, band name, area, coverage value, and threshold read from real artifacts?
- Does the candidate overlay align when zoomed in?
- Does the invalid fixture stop before analysis with a correct reason?
- Can one teammate independently reproduce the reported area?
- Are planned VLM/SAR/fusion features visually and verbally labelled as planned?
- Does the complete story finish within 4:55 without rushing?

