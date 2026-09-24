# SatQuery AI — SIH26167 demo strategy and team handoff

Research and repository audit: 19 September 2026. Planning document; no application changes made in this task.

## 1. Decision

Build a question-driven remote-sensing workspace, not a catalogue with a chatbot attached.

Pitch: **Ask a question about Earth observations. SatQuery validates the inputs, selects the appropriate specialists, and returns an answer with inspectable evidence.**

Discovery is an excellent supporting capability: it closes the gap between finding observations and analysing them. It is not, by itself, the novelty required by this PS. The differentiator should be the connection between user intent, sensor-aware validation, specialist execution, and evidence.

The full architecture can be presented confidently. Separate what the screening build executes, what a prepared scenario illustrates, and what the final implementation will deliver. A small run-source indicator and a clear closing engineering slide are sufficient; do not clutter every screen with warnings. Never attach a prepared measurement to unrelated uploaded files.

This recommendation replaces the older NDVI-only screening narrative and seven-workspace UI recommendation for the next proposed iteration. Retain the PRD's longer-term architecture. Preserve the landing page.

## 2. Source of requirements

The user supplied the SIH26167 statement during this research. It agrees with the public transcription inspected earlier. The official website could not be fetched successfully. The supplied statement itself contains “Add 'Evaluation/Judging Criteria' table here”; scoring weights are therefore unknown. Submission deadline is still needed.

Use the supplied statement as the requirements baseline, not assumptions about competing submissions.

| Requirement | Minimum credible demonstration | Final engineering obligation |
| --- | --- | --- |
| Remote-sensing adaptation | Explain the selected adaptation experiment and show actual artefacts if available | At least one visual/VLM component adapted using BigEarthNet.txt or other open training data |
| Single-image VQA | A user asks a question about an attached image and gets relevant evidence | Evaluate on prescribed public splits |
| Additional single-image task | Scene description is the lowest-complexity starting choice | Captioning OR text-guided grounding; not necessarily both |
| Bi-temporal understanding | Before/after observations, a change question, a corresponding answer | Change description or change VQA; do not reduce this to a palette change |
| Optical–SAR joint analysis | Registered paired inputs with separate evidence and a combined conclusion | Both modalities must contribute; two thumbnails are not fusion |
| Agentic orchestration | Different questions produce different valid tool selections and executions | Validate inputs, use a permitted registry, combine outputs, expose execution summary |
| Evidence and reporting | Source images, applicable overlays, limitations, downloadable run report | Traceable outputs with confidence information |

GeoTIFF/TIFF are the main input formats. The PS permits PNG/JPEG for prescribed benchmark datasets; arbitrary PNG/JPEG upload can be an extra convenience mode, but does not replace geospatial support.

The final ISRO/SAC data will include pre-georeferenced, co-registered Cartosat-2S optical and RISAT SAR pairs. Design sensor metadata and preprocessing adapters accordingly; do not assume a Sentinel-trained system automatically generalises to those sensors.

## 3. Current implementation: what exists and what must change

Reviewed relevant sections of SATQUERY_PRD.md, SATQUERY_ARCHITECTURE_HANDOUT.md, FINAL_PROTOTYPE_AND_5MIN_VIDEO_PLAN.md, NEXT_CHAT_HANDOFF.md / continuation material, real-imagery notes, video assets notes, src/AnalysisWorkspace.tsx, and backend/main.py. Older documents disagree about demo scope and implementation status. Check actual code before following old handoffs.

The frontend is currently mostly a scripted presentation flow. The backend already contains useful raster inspection, catalogue search, polygon measurement, and NDWI water-change functions. No working adapted VLM, TEOChat inference, or learned optical–SAR fusion was found in the inspected path.

Specific problems in src/AnalysisWorkspace.tsx:

- ChooseAnalysis keeps the question and selected job locally, but its choose callback carries no request payload into planning.
- Upload handling retains filenames rather than usable imagery assets.
- The three analysis choices converge onto the same fixed plan and water-change runner.
- Plan editing toggles an edited/saved flag; it does not edit an executable configuration.
- ResultsPage uses fixed results instead of the completed runner's output. Follow-up questions are not connected to execution.
- Discovery uses a fixed bounding box/date range. Map search is not wired. The Landsat selection is not included in the request.
- The map has a static illustrative imagery overlay; this is not a geographically registered scene layer.
- Colour presets are display filters on illustrative imagery, not computed indices or real SAR channels.
- Real raster previews/masks returned by the backend are not carried through into the result screen.

Backend concerns:

- Catalogue failure/empty results can become prepared results. Return explicit live/cache/prepared/error state instead.
- Do not apply an optical cloud-cover constraint to SAR results.
- Read resolution, bands and modality from provider metadata rather than hardcoding all scenes as 10 m.
- Preserve the existing useful GIS functions, but validate band identity and spatial compatibility before interpreting results.

The existing hero floodplain is documented as AI-generated. Existing demo TIFFs are synthetic. They can illustrate the interface, but must not be presented as Sentinel acquisitions from Wayanad.

## 4. Simpler UX

### Default workspace

Open directly to Analysis. Show a meaningful question composer, attached observations, and three vertically stacked example jobs: visual query, temporal change, optical–SAR analysis. Clicking an example fills an editable question; it is not a substitute for free-text input.

Offer three ways to attach evidence: Upload files, Discover imagery, From library. Library is reusable storage for observations and derived assets, not a compulsory extra step. A batch is a collection of assets with validation status, not just a folder name.

After submission:

1. Interpret the question and inspect inputs.
2. Ask a focused clarification only when necessary: missing later image, unspecified target, absent SAR pair, incompatible coverage.
3. Show a short proposed action summary. Allow Run and optional Advanced details.
4. Execute, showing actual tool statuses.
5. Present answer, evidence and follow-up composer in the same workspace.

Advanced plan editing is for technical users. Changing a parameter must create a new validated plan revision; it must not silently alter an already completed run.

### Discovery mode

- Large map; one compact left drawer for search/results.
- Place or coordinates, draw/upload area, dates, optical/SAR source filters.
- Search current area uses actual viewport/AOI coordinates, with sensible limits at world scale.
- Selecting a scene loads its real footprint and georeferenced preview.
- Display presets appear only after scene selection, in a small toolbar or drawer.
- Use proper band combinations and computed indices when the underlying bands exist. Disable unavailable products with an explanation.
- Add selected observations returns to the analysis question with inputs preserved.
- Keep a full chat panel closed during discovery unless explicitly opened. Do not permanently show filters, palettes, layers and chat all together.

### Navigation and sizing

Keep the approved light workspace and dark slim rail. Centre icons in their hit targets; expand labels on hover AND keyboard focus, with a pin option for touch/accessibility. Primary destinations: Projects, Analysis, Data, Runs/Results. Library lives within Data. Advanced settings and activity can be secondary.

Design and verify at browser 100%, including 1280×720 and 1366×768 CSS viewports. Do not solve layout with global CSS zoom. Use responsive panels and scrolling where needed, not microscopic typography. Physical screen inches alone do not determine the browser viewport.

## 5. Smallest useful architecture

Question + asset IDs + area -> input validator -> constrained planner -> tool registry -> execution -> evidence-backed answer.

The planner may use a hosted language model to produce a structured proposal. Server-side code validates the schema, allowable tools, task prerequisites and bounded parameters. The model does not execute arbitrary code or invent tool results.

Three specialist routes remain a reasonable architecture:

1. Remote-sensing-adapted VLM: VQA and scene description. Start with an available inference baseline, then a measured adaptation experiment.
2. Temporal specialist: evaluate the published TEOChat checkpoint before considering additional training. Temporal text answers and pixel-level change masks are separate capabilities.
3. Optical–SAR specialist: begin with explicit modality-specific processing and evidence combination; evaluate a learned fusion component as a distinct experiment.

Supporting tools are normal engineering, not three more foundation models: GeoTIFF decoding, band mapping, resampling, reprojection, clipping, quality masks, index calculation and report export. A “GeoTIFF encoder” should not be pitched as a magic reader of every sensor or band arrangement.

Do not equate CSS recolouring with NDVI/NDWI, greyscale optical imagery with SAR, or concatenated generic descriptions with validated fusion. A VLM can receive a rendered view with its legend and metadata, but numerical indices and area should come from the raster tools.

## 6. Demonstration modes

Use live interaction wherever it is cheap and reliable: question entry, validation, catalogue requests, upload, plan generation, tools that already work, report export.

For GPU-dependent specialists, choose between actual inference, cached output from an actual recorded run, or a curated illustrative scenario. Store that distinction per step. Do not relabel a prepared response as an executed checkpoint.

A prepared scenario must be keyed to known assets and a supported question/task. An unrelated question should trigger genuine planning, clarification, or an explicit unsupported response—not the same flood answer.

If using a hosted generic VLM now, it provides an interactive baseline. It does not satisfy the final adaptation requirement. Prefer one real adapted component with a small reproducible evaluation over claiming three trained models without artefacts.

Suggested adaptation experiment: select a manageable labelled training subset, keep the prescribed test split untouched, compare baseline and adapter on the same held-out development examples, and record checkpoint, dataset version, sample counts, task metrics, runtime and representative failures. Dataset subset size and training configuration depend on available hardware. No accuracy uplift should be specified in advance.

## 7. Provider access and resources

| Resource | Practical use | Action needed |
| --- | --- | --- |
| Copernicus Data Space STAC | Sentinel scene metadata search | Use current documented STAC endpoint; verify collection IDs |
| CDSE Sentinel Hub processing | Render selected scene/band products over an AOI | Create CDSE account and OAuth client; backend-only Client ID/Secret; subject to free quotas |
| Bhoonidhi | Indian/foreign EO search and data access | Register; request API access from bhoonidhi@nrsc.gov.in; some products are open and others priced |
| MOSDAC | Optional INSAT meteorological context | Search supports dataset/time/bbox; downloads require approved MOSDAC account |
| MapLibre + permitted basemap tiles | Map navigation and overlays | Existing renderer can remain; comply with tile provider terms and attribution |
| Hosted vision/language API | Interactive baseline and structured planning | Provider/account availability and budget; secrets configured locally |
| GPU runtime | TEOChat and adaptation experiments | Exact GPU, VRAM, available hours, storage and environment access |

Google Maps credentials are not required for satellite analysis. Basemaps supply geographic context, catalogues find acquisitions, processing services prepare pixels, and specialist models analyse them. They are separate layers.

CDSE currently documents free general-user Sentinel Hub quotas; this is not unlimited processing. Catalogue access is not equivalent to full imagery download/rendering. Never put provider secrets in frontend VITE variables or commit them.

Bhoonidhi is a portal, not a sensor. INSAT is a mission family, and MOSDAC is a relevant access route. INSAT weather context is an optional extension, not a replacement for optical–SAR paired analysis. Mention ISRO connectors in the architecture; do not block the screening prototype on API approval. Approved downloaded files can enter through the same upload path.

## 8. Two-person implementation handoff

Agree on the API contract first. Recommended ownership:

**This workspace / frontend owner:** simplify Analysis and Discovery; capture questions and file uploads; manage selected assets; render plan/run/result state; georeferenced map layers; report download; browser acceptance tests. Preserve landing page.

**Friend's Codex / backend and model owner:** assets and metadata validation; constrained planner; registry; provider connector; real raster outputs; model adapters; scenario fixtures; run persistence and report payload. Work in a separate branch/checkout and avoid editing frontend layout files.

Neither owner should independently redefine shared request/response types. Share this handout and the supplied PS, not only screenshots.

Proposed endpoints (new contract, not a claim these exist):

- POST /api/assets: actual file upload -> asset ID, metadata, validation findings.
- POST /api/plans: question, asset IDs, AOI, optional task hint -> plan ID, revision, tasks, clarification requests and permitted parameters.
- PATCH /api/plans/{id}: advanced edits -> new validated revision.
- POST /api/runs: plan ID + revision -> run ID and status.
- GET /api/runs/{id}: step statuses, output assets, answer, limitations and provenance.
- GET /api/runs/{id}/report: export the same run, not a separate canned narrative.

Asset fields: ID, original filename/provider scene ID, actual stored location, acquisition time, modality, sensor, CRS, bounds, bands, resolution, quality flags and preview reference.

Step fields: tool ID/version, validated parameters, input IDs, status, output IDs, duration and execution mode (live/cached-real/prepared). Model steps additionally record checkpoint/version. Confidence must identify its basis; don't render invented percentages as calibrated probabilities.

Run identity must survive navigation. A follow-up can reference the prior run but changed inputs invalidate incompatible results. Save lightweight run state; do not make persistence of huge uploads a prerequisite for the first milestone.

### Priority order

P0: carry question and real assets through planning and results; remove dead controls and canned result substitution; implement distinct routes and explicit execution modes.

P1: one functioning single-image baseline, real temporal evidence, paired optical/SAR scenario; integrate existing raster outputs; source-aware report and trace.

P2: real scene discovery with geographic preview and return-to-analysis; responsive simplification.

P3: adaptation evidence, model comparison, robustness and replay preparation according to available time. Adaptation remains required for final compliance even if the screening build presents it as an ongoing experiment.

Defer: general-purpose batch masking, many satellite families, arbitrary custom indices, enterprise library features and polished settings. Batch masking needs a defined target and a suitable segmentation method; an agent alone does not supply that capability.

## 9. Five-minute video proposal

Adjust to the actual screening time limit when confirmed. Reuse the team's existing short introduction footage if suitable.

| Time | What viewers see |
| --- | --- |
| 0:00–0:20 | Team and concrete problem: non-experts should not need to select models/GIS pipelines |
| 0:20–0:50 | Upload/attach one scene; type a real VQA question, then request scene description |
| 0:50–1:25 | Discover a location/date on the map, select a real scene, attach it |
| 1:25–2:20 | Ask a temporal question; validate paired inputs, run the selected route, show before/after evidence |
| 2:20–3:15 | Ask a paired optical–SAR question; show complementary contributions and combined answer |
| 3:15–3:45 | Change the question or omit an input; show rerouting/clarification and actual execution summary |
| 3:45–4:10 | Open evidence, limitations and downloadable run report |
| 4:10–5:00 | Architecture, actual model status, adaptation/evaluation plan, ISRO data compatibility and next milestone |

Pick known, compatible observations and questions that those observations can answer. Do not force a dramatic Wayanad flood metric onto unrelated river imagery. Preload approved scenario data for reliability; show which parts are live or replayed without making that the entire narrative.

Closing message: SatQuery brings data, sensor-aware specialists and inspectable answers into one query-driven workflow. Model adaptation and evaluation are measurable engineering work packages—not a list of fashionable model names.

## 10. Acceptance checks before recording

- Two meaningfully different questions produce appropriate distinct plans; unsupported tasks do not run a default flood workflow.
- An absent second date/SAR input leads to an actionable clarification.
- Uploaded bytes are available to the backend; filenames alone are not accepted as completed upload.
- Sensor, bands, dates and overlap are checked; incompatible inputs cannot produce an apparently successful measurement.
- A map search changes the actual query area; selected scene footprints and previews correspond to source metadata.
- SAR results are not excluded by optical cloud filtering.
- A computed result, on-screen answer, evidence overlay and exported report share the same run and assets.
- Prepared scenarios cannot be silently applied to arbitrary uploads.
- Advanced plan edits modify validated values, not only button text.
- Controls work at 100% browser zoom and keyboard focus; no accidental full-screen oversized panels.
- Model evaluation claims link to actual artefacts. Run trace lists executed tools, not simulated internal reasoning.

## 11. Immediate questions for the team

1. Exact screening deadline and video duration limit?
2. Available GPU/VRAM or cloud runtime, and hours/budget?
3. Which hosted vision/LLM provider account is already available?
4. Can you create the CDSE account and OAuth client? Say when ready; configure secrets locally, not in chat.
5. Which task will the friend own under the shared contract above?

Bhoonidhi/MOSDAC access is optional for the immediate build. No Google Maps key is needed to proceed.

## Sources

- Official PS location, with requirement text supplied by the user: https://sih.gov.in/sih2026PS
- Public transcription used before receiving the supplied text: https://github.com/aditya-kr86/sih2026/blob/main/ps_2026/SIH26167.md
- CDSE STAC: https://documentation.dataspace.copernicus.eu/APIs/STAC.html
- CDSE account/OAuth guide: https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/UserGuides/BeginnersGuide.html
- CDSE processing: https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Process.html
- CDSE quotas: https://documentation.dataspace.copernicus.eu/Quotas.html
- Bhoonidhi API/access notice: https://bhoonidhi.nrsc.gov.in/bhoonidhi/home.html
- Bhoonidhi registration/access policy: https://bhoonidhi.nrsc.gov.in/bhoonidhi/registration.html
- MOSDAC download API manual: https://mosdac.gov.in/downloadapi-manual
- TEOChat official implementation/checkpoint instructions: https://github.com/ermongroup/TEOChat
- Qwen baseline model card: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- BigEarthNet.txt: https://txt.bigearth.net/

Research establishes documented availability, not successful integration or measured model performance. No model training or benchmarking was executed during this audit.
