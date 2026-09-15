# SatQuery AI Product Requirements Document

Version: **0.1.0**  
Last updated: **2026-09-09**  
Status: **Initial implementation baseline for team review**  
Product owner: Team lead; individual owner assignments pending  
Audience: SatQuery teammates, mentors, presentation authors, and implementation agents  
Context: SIH 2026 internal idea presentation on September 10; working demo optional, as confirmed by the team lead

## 1. Purpose and current status

This document defines what SatQuery AI will do, how its components work together, what the team should build first, and how progress will be measured. It consolidates the planning conversation, architecture handout, team build guide, and master reference. It supersedes conflicting architecture and delivery assumptions in those earlier documents.

The product is currently in the idea and architecture phase. A documented design is not evidence of a working implementation. Model inference, adaptation, dataset access, hardware capacity, and end-to-end accuracy still require experiments. No accuracy, training duration, sensor generalisation, or deployment integration is claimed as achieved by this PRD.

The architecture is the agreed direction. Specific model checkpoints and newly specified engineering defaults are implementation baselines subject to the evaluation gates below. Open decisions are recorded explicitly so development can proceed without inventing answers.

### Reading paths

- Teammates learning the project: sections 2–8, 15, and 19.
- Engineers and AI implementation agents: sections 6–14, 16–18, and 20.
- Presentation authors: sections 2–5, 15, 19, and 21.
- Anyone changing scope or architecture: sections 17, 18, and 22.

## 2. Product definition

SatQuery AI converts natural-language Earth-observation questions into validated analysis workflows across optical, SAR, and temporal satellite imagery. It prepares the imagery, selects suitable models and geospatial tools, combines their evidence, and returns answers linked to map locations, overlays, measurements, and an execution record.

The user can ask what is visible, where a feature is, what changed between dates, or whether two sensors support the same interpretation. The system handles the technical steps while exposing enough evidence for a user or analyst to review the conclusion.

### Product statement for presentations

> SatQuery AI is an agentic geospatial intelligence system that translates natural-language objectives into verifiable analysis workflows. It combines remote-sensing vision-language models, temporal analysis, optical–SAR evidence, and GIS measurements to produce answers grounded in maps, masks, polygons, and traceable observations.

### Target users

| User | Need | Expected outcome |
|---|---|---|
| Disaster management officer | Understand possible flood expansion or visible damage | Candidate affected regions, measurements, supporting observations, limitations |
| Agriculture officer | Compare vegetation patterns across dates | Index differences and spatial summaries with seasonal caveats |
| Urban planner | Inspect built-up change | Candidate construction/change polygons where resolution permits |
| Forest or water analyst | Monitor cover and water extent | Georeferenced change evidence and exportable layers |
| GIS or remote-sensing specialist | Inspect and reproduce automated analysis | Parameters, source scenes, model versions, masks, and execution records |

SatQuery supports expert review. Satellite evidence alone cannot establish every physical condition, event cause, or operational decision.

## 3. Problem scope and SIH alignment

The supplied team references identify the problem as **SIH26167, ISRO / Space Applications Centre**, and describe the capability set below. The exact official statement and evaluator contract must be archived and checked under OPEN-001 before claiming formal compliance. The supplied references are planning sources, not a substitute for the official requirements.

| ID | Capability described in the references | Product commitment |
|---|---|---|
| CAP-001 | Single-image visual question answering | Answer supported questions about optical or SAR scenes within validated sensor/task coverage |
| CAP-002 | Additional single-image task | Captioning is the initial additional task; text grounding is also a product goal |
| CAP-003 | Multitemporal analysis | Compare ordered observations, describe supported changes, and localise them where the pipeline supports it |
| CAP-004 | Cross-modal analysis | Use optical and SAR observations together; expose disagreements and missing evidence |
| CAP-005 | Agentic orchestration | Interpret intent, validate inputs, select and execute tools, and provide an observable trace |
| CAP-006 | Remote-sensing adaptation | Perform and document at least one team-owned adaptation of a visual or vision-language component |
| CAP-007 | Evidence and uncertainty | Link conclusions to artifacts and distinguish measured scores from uncalibrated indicators |

Masks and polygons are deliberate SatQuery product commitments for supported spatial workflows. Do not assume every mask type is an official SIH requirement or that every question requires a mask.

### Delivery stages

| Stage | Objective | Exit condition |
|---|---|---|
| P0 — Internal idea round | Explain the product, architecture, research plan, and feasibility | Presentation and team understanding; demo optional |
| P1 — First working vertical slice | One real upload-to-answer workflow with geospatial evidence | Optical ingestion, VQA/caption, one measured GIS workflow, visible trace, and reproducible exports |
| P2 — Integrated SIH build | Cover the capability matrix with measured performance | Adapted VLM, temporal analysis, optical–SAR analysis, spatial outputs, and evaluation reports |
| P3 — Advanced research and deployment | Improve fusion, sensor transfer, scale, and institutional integration | Separate experiments and integration approvals demonstrate readiness |

Phases preserve the full ambition while establishing an executable order. Completion of P1 does not mean completion of the final SIH scope.

### Outside the initial implementation

- Training a foundation model from scratch.
- Automatic interpretation of arbitrary undocumented sensors or raw radar products.
- Guaranteed bridge-collapse, crop-disease, or disaster-cause identification from insufficient imagery.
- Automatic Bhoonidhi/Bhuvan integration before access and interfaces are verified.
- An operational emergency decision system or autonomous dispatch workflow.
- A universal accuracy percentage across unrelated sensors and tasks.

## 4. Existing solutions and intended contribution

Remote-sensing VLMs, temporal assistants, GIS tools, and agentic research systems already exist. GeoChat provides remote-sensing image dialogue and grounding; TEOChat addresses temporal Earth-observation conversations. Their official repositories provide relevant starting points [S3, S4]. The earlier team documents also identify RS-Agent and GeoPilot as prior art; a formal comparison remains OPEN-009.

A capable general AI with file tools, code execution, and geospatial libraries can perform parts of this workflow. SatQuery's contribution is therefore not that other AI systems are categorically unable to analyse satellite data. The intended contribution is a repeatable product workflow with explicit sensor support, task-specific adaptation, spatially correct artifacts, bounded tool execution, and measured performance.

Proposed differentiators to demonstrate:

1. Preserve original bands and geographic metadata throughout analysis.
2. Compile natural-language requests into validated, inspectable tool plans.
3. Combine optical, SAR, and temporal evidence using explicit modality labels and quality checks.
4. Connect language claims to spatial artifacts and deterministic measurements.
5. Report conflicts and unsupported areas instead of silently treating missing evidence as negative evidence.
6. Show the team's adaptation through reproducible before/after evaluation.

These are product hypotheses and engineering commitments. Claims such as “the world's only solution,” “no competitor has this,” or measured superiority require evidence.

## 5. Representative workflows

### WF-001 — Describe and question one scene

Input: one supported scene, optional area of interest, and a question such as “Describe the major land-cover patterns.”

Execution: validate the file; extract metadata; generate suitable overview/crop representations; pass visual inputs and explicit metadata to the VLM; validate the response structure; attach scene or region references.

Output: caption or answer, source scene reference, relevant crop/box when available, limitations, and trace. A caption may reference the whole scene without inventing an object box.

### WF-002 — Measure vegetation-index change

Input: two optical scenes with known dates and valid Red/NIR bands covering the same area.

Execution: validate radiometry, dates, overlap, and alignment; choose a common analysis grid; exclude invalid/cloud-covered pixels; compute NDVI at each date; compare valid pixels; calculate statistics and configured threshold regions; explain the results.

Output: two index layers, difference layer, valid-area coverage, region statistics, optional polygons, and explanation. Describe the observed index change; do not automatically equate it to crop disease or deforestation.

### WF-003 — Describe and localise structural change

Input: two sufficiently resolved, aligned scenes at different dates.

Execution: validate comparability; run an appropriate change detector; inspect original before/after crops together with candidate change masks; assign supported semantic descriptions; convert accepted regions into geographic artifacts; measure them.

Output: change mask, candidate regions, before/after views, area measurements, and explanations. A binary change mask alone cannot identify the cause or semantic class of a change.

### WF-004 — Joint optical and SAR assessment

Input: optical and SAR scenes with known spatial overlap, acquisition times, and supported preprocessing levels.

Execution: validate pairing; prepare each modality separately; run modality-specific analysis; compare compatible evidence; optionally run a validated learned fusion component; report agreement and conflict by region.

Output: joint answer, modality-specific evidence, relevant overlays, and limitations. Close acquisition times are recorded; spatial pairing does not imply identical observation time.

### WF-005 — Candidate flood expansion near agriculture

Input: suitable observations before and after an event, with optical and/or SAR data and an agricultural land-cover source.

Execution: estimate water evidence at each date; exclude invalid areas; compare extent; distinguish persistent water from newly observed water; cross-check available radar and optical evidence; intersect candidate expansion with the land-cover source; calculate area.

Output: candidate expansion mask, agricultural overlap, measurements, coverage, and supporting observations. Without a valid baseline, report current water evidence rather than confirmed flood expansion. Low SAR backscatter alone is insufficient proof of flooding.

## 6. System architecture

```text
Chat / presets / map region / uploaded scenes
                     |
                     v
          Metadata inspection and intent resolution
                     |
                     v
          Typed plan and deterministic validation
                     |
                     v
          Workflow executor and tool registry
                     |
        +------------+-------------+
        |                          |
        v                          v
 Geospatial processing       Specialist model services
 bands, alignment, indices   VLM, change, segmentation,
 measurements, coordinates   modality encoders and fusion
        |                          |
        +------------+-------------+
                     v
       Evidence checks and answer composition
                     |
                     v
       Text / layers / masks / polygons / exports

Shared: scene catalog, artifact store, job state, trace,
        model registry, dataset manifests, evaluations
```

### Architectural rules

- Capability count does not equal model count. VQA, captioning, and some grounding may share one VLM.
- The orchestrator selects tools and interprets requests. Ordinary application code enforces schemas, dependencies, resource budgets, and sensor constraints.
- Models see representations appropriate to their documented inputs. Original numerical arrays remain available to GIS and specialist analysis.
- Temporal comparison uses imagery and/or derived arrays plus suitable models. It is not a numerical-data-only language model.
- Segmentation and change detection produce pixel masks. The VLM may propose regions or prompts and explain outputs; it is not assumed to produce precise masks by itself.
- Measurements come from GIS calculations over georeferenced artifacts.
- A workflow is a dependency graph. Independent branches may run in parallel if resources permit; dependent steps wait for their inputs. “Always sequential” is superseded.
- Request-specific tool selection avoids unnecessary model calls. RemoteCLIP is optional, not an obligatory last step.
- The trace records observable actions, parameters, status, and concise decision summaries. It does not require hidden chain-of-thought.

### Component responsibilities

| Component | Receives | Produces | Does not own |
|---|---|---|---|
| Workspace UI | User intent, uploads, region selection | API requests and visual controls | Scientific calculations |
| Ingestion engine | Files and supplied metadata | Validated scene records and quality findings | Guessing missing band identities |
| Planner | Query, scene metadata, available tools | Typed plan or clarification | Arbitrary unrestricted code execution |
| Executor | Validated plan | Tool runs, job state, artifacts | Inventing missing inputs |
| GIS engine | Numerical rasters, masks, transforms | Indices, alignment, statistics, geographic artifacts | Language-based area estimation |
| RS VLM | Labelled image views, query, evidence | Captions, answers, candidate grounding | Guaranteed spectral physics or calibrated certainty |
| Temporal component | Ordered compatible scenes/features | Change evidence and optional semantic output | Guaranteed cause attribution |
| Fusion component | Compatible optical/SAR evidence or features | Joint evidence or learned predictions | Treating any two images as a valid pair |
| Segmentation component | Supported image representation and prompts | Pixel masks and optional model scores | Geographic coordinate conversion |
| Evidence composer | Structured tool outputs | Referenced claims, limitations, final answer | Fabricating metrics |

## 7. Geospatial ingestion and processing

### Input support

P1 supports georeferenced optical GeoTIFF files with declared band mapping and compatible radiometric metadata. The initial validated optical profile is Sentinel-2 Level-2A reflectance, including sidecar metadata when required. PNG/JPEG can support visual-only benchmark mode; geographic measurements are disabled unless valid georeferencing is supplied separately.

P2 adds calibrated, terrain-corrected Sentinel-1 backscatter products with explicit polarisation, units, acquisition time, and processing history. Raw SAFE/GRD/SLC processing is a separately enabled adapter requiring a validated SAR preprocessing chain. A GeoTIFF extension alone does not prove that a product is calibrated or terrain corrected.

Cartosat/RISAT support is an extension target. Their exact evaluator product formats and metadata are unresolved. Generic GeoTIFF readability does not establish scientific sensor support.

### Required scene fields

Scene ID; source checksum; file references; width/height; band count; data type; CRS; affine transform; bounds; pixel size; no-data value; modality; sensor/product identity when known; acquisition time when known; band names; units; scale/offset; processing level; provenance of user-supplied metadata; and quality findings.

Acquisition date, sensor identity, and band names are not guaranteed to exist inside every GeoTIFF. The UI must allow explicit supplementation. Unknown values remain unknown until supplied or reliably parsed.

### Processing requirements

| ID | Requirement | Acceptance condition |
|---|---|---|
| GEO-001 | Preserve source files and checksums | Derived products reference immutable source IDs and processing versions |
| GEO-002 | Validate band identities and units | Missing Red/NIR blocks NDVI with a named missing-band error |
| GEO-003 | Validate spatial overlap | Non-overlapping scenes cannot enter pixel-level comparison |
| GEO-004 | Check registration separately from CRS | Matching CRS alone never marks scenes co-registered |
| GEO-005 | Track every crop, resize, tile, and transform | A predicted tile box can be mapped back to source and map coordinates |
| GEO-006 | Handle no-data, clouds, and invalid pixels | Excluded pixels do not count as unchanged, dry, or zero-valued observations |
| GEO-007 | Use valid resampling rules | Class masks use nearest-neighbour; continuous values use an explicitly configured method |
| GEO-008 | Preserve analysis versus display products | Display stretches never replace physical arrays used for quantitative comparison |
| GEO-009 | Measure area in suitable coordinates | No area calculation treats square longitude/latitude degrees as square metres |
| GEO-010 | Record quality and coverage | Every measurement includes analysed area and excluded coverage |
| GEO-011 | Bound memory and work | Large rasters are processed in windows/tiles with configured size limits |
| GEO-012 | Avoid repeated calibration | Product processing history controls calibration, dB conversion, and filtering steps |

### Optical representations

- RGB and NIR false-colour composites are labelled with the actual band recipe.
- NDVI uses `(NIR - Red) / (NIR + Red)` after valid scale/offset handling.
- The selected water-index implementation is explicitly named; Green/NIR NDWI uses `(Green - NIR) / (Green + NIR)`.
- NBR requires NIR and SWIR2. It is enabled only for profiles containing those bands.
- Near-zero denominators and invalid pixels are masked. Thresholds are workflow parameters, not universal scientific truths.
- Temporal visualisation uses consistent stretches where practical; separate per-image stretches can create misleading apparent change.

### SAR representations

Maintain physically meaningful calibrated backscatter separately from display images. Record whether values are amplitude, power, linear backscatter, or dB. Power-to-dB uses `10 * log10(power)` for valid positive values; amplitude handling is different and must follow the product definition. Do not apply conversions by guessing.

Display VV, VH, or declared composites according to available polarisations. Record speckle filtering and terrain correction. Radar geometry, roughness, moisture, vegetation, shadow, layover, and incidence angle can affect interpretation. Clouds are less obstructive to radar than optical imagery, but SAR flood mapping is not infallible.

## 8. Models and adaptation plan

### Model selection baseline

| Role | Baseline choice | Adaptation plan | Decision status |
|---|---|---|---|
| Primary visual dialogue | `Qwen/Qwen3-VL-8B-Instruct` | Parameter-efficient remote-sensing instruction tuning | Preferred experimental base; hardware and benchmark gate pending |
| Alternate visual dialogue | InternVL3.5-8B | Compare only if primary gate fails or a targeted comparison is justified | Candidate, not simultaneous mandatory integration |
| RS single-image reference | GeoChat | Initially evaluate existing checkpoint | Baseline for comparison [S3] |
| Temporal language specialist | TEOChat | Integrate first; adapt only if evaluation warrants it | Candidate with separate environment/licence review [S4] |
| Spatial change detection | BIT first integration candidate; other task-matched detector if needed | Fine-tune if training domain does not match the chosen workflow | Exact checkpoint and dataset unresolved |
| Promptable segmentation | SAM-family optical baseline or task-specific segmenter | Integrate first; benchmark suitability | Exact checkpoint unresolved; no assumed SAR competence |
| Optical–SAR learned fusion | Compatible modality encoders and small fusion/task head | Train paired task objective; validate against single-modality baselines | P2 experiment / P3 extension depending on evidence |
| Semantic compatibility | RemoteCLIP | Optional experiment | Similarity/retrieval signal, not answer-correctness probability |
| Planning and explanation | Provider-independent LLM adapter plus deterministic routing | No fine-tuning initially | Provider selection pending budget and data policy |

Qwen3-VL supports multi-image inputs [S1]. The proposed baseline supplies ordinary model-compatible image representations; multiple images do not make its vision encoder a native arbitrary-band GeoTIFF reader. Pin checkpoint revision, processor, chat template, preprocessing recipe, and dependency versions after the first successful experiment.

### Main VLM training data path

```text
Paired satellite files + annotation records
            |
            v
Dataset loader and preprocessing recipe
            |
            v
Labelled optical / false-colour / SAR views + question
            |
            v
Base VLM predicts reference caption, answer, or coordinates
            |
            v
Supervised loss updates selected adapters/trainable modules
```

The first adaptation run freezes the base model and vision tower where supported and trains selected language-side LoRA modules. Quantisation, LoRA targets, and optional projector/vision updates must be verified against the chosen implementation. Record the actual trainable parameter count; do not assume LoRA always means exactly one percent.

Freeze the preprocessing recipe across training and evaluation. If visual features do not represent SAR adequately, language-side LoRA alone may not solve the problem. Escalate to suitable encoder adaptation or an explicit multisensor projector experiment based on measured failures.

### Dataset roles

| Dataset | Planned use | Guardrail |
|---|---|---|
| BigEarthNet.txt | Primary paired optical/SAR image-text adaptation and task evaluation | Text annotations reference imagery; archive version, manifests, and official splits [S2] |
| BigEarthNet v2 | Underlying sensor imagery, land-cover labels, relevant supervised experiments | Keep its version/count distinct from BigEarthNet.txt and v1 [S5] |
| VRSBench | Captioning, VQA, referring-expression evaluation and allowed training data | Use prescribed splits and official evaluation code [S6] |
| RSVQA | Additional VQA evaluation and permitted training data | Separate low/high-resolution settings and follow official task definitions |
| CDVQA | Temporal question answering | Inspect actual annotations; QA pairs are not automatically pixel-mask labels |
| TEOChatlas | Optional temporal instruction adaptation | Check overlap with evaluation sets and all inherited licences |
| Task-specific change/segmentation data | Masks for supported change, water, or object tasks | Match sensor/resolution and label semantics; select under OPEN-005 |
| Indian sensor evaluation samples | Domain-transfer testing if legitimately available | No hidden evaluation data in training; record product differences |

BigEarthNet.txt includes paired Sentinel-1/Sentinel-2 imagery and captions, VQA, and referring-expression annotations. It is not text-only [S2]. The official BigEarthNet v2 site reports 549,488 pairs; the older 590,326 count belongs to v1. Dataset counts must remain attached to versions [S5].

### Training record contract

The following is an application-level example, not a promise that upstream datasets use this exact JSON format:

```json
{
  "sample_id": "example-001",
  "dataset_version": "pinned-release",
  "split": "train",
  "scene_group_id": "location-group-001",
  "views": [
    {"path": "s2_rgb.png", "modality": "optical", "recipe": "s2-rgb-v1"},
    {"path": "s1_vv_vh.png", "modality": "sar", "recipe": "s1-display-v1"}
  ],
  "question": "Describe the land-cover evidence in these observations.",
  "target_answer": "Reference answer from the curated annotation.",
  "task": "paired_vqa",
  "annotation_provenance": "dataset-record-id"
}
```

The loader opens images and the processor converts them to visual tokens. Text targets supervise generated answers. Input/padding tokens must be masked from supervised answer loss as required by the training framework. Image order and modality labels must remain consistent. Image augmentation must also transform grounding labels.

Split by scene/location before making crops or multiple question records. Hold out geographic groups where possible. Avoid training on sibling crops or alternate questions from evaluation scenes. Location/season questions may depend on metadata rather than visible imagery; label that evidence source and avoid presenting metadata lookup as visual reasoning.

### Fusion levels

1. **Evidence fusion:** independent tools produce structured observations; application logic and the composer combine them. This is the initial inspectable baseline.
2. **Multi-image reasoning:** the VLM receives labelled optical/SAR views together. Paired instruction tuning teaches associations, but genuine dependence on both inputs must be tested.
3. **Learned feature fusion:** compatible optical/SAR encoders feed a trained task head or projector. A head that predicts land-cover labels does not automatically generate masks or fluent answers.

Feeding learned soft embeddings into a language model requires control of that model's input interface and an implemented projector. Do not assume an ordinary hosted text/image API accepts arbitrary embedding tensors. Begin with structured evidence handoff; treat direct feature injection as a separate local-model experiment.

### How many models do we train

The committed first adaptation is **one primary VLM adapter**. The integrated build may add **one change detector adaptation** and **one fusion/task head** if tests justify them. Segmentation and TEOChat start as integrations; they become additional training efforts only after a recorded decision. Calibration may fit a small statistical model if labelled validation data supports it.

Thus, the planning baseline is one required adaptation plus up to two planned specialist experiments, not three giant models trained from scratch. The final count depends on checkpoint suitability and measured gaps.

### Compute and training duration

GPU availability, budget, and sample volume are unresolved. An 8B QLoRA run must be profiled with the actual image count, visual-token budget, sequence length, precision, optimizer, and trainable modules. A 24–48 GB GPU class is a feasibility investigation range, not a promised fit. Multiple large images can exhaust memory even when quantised weights fit.

Run a small representative smoke experiment, then a steady-state throughput benchmark. Estimate:

```text
optimizer_steps = ceil(training_examples / effective_batch_size) * epochs
estimated_wall_time = optimizer_steps * measured_seconds_per_step
                    + validation + checkpointing + preprocessing overhead
```

Illustration only: 10,000 examples, effective batch 16, and two epochs produce 1,250 optimizer steps. At a measured 4–12 seconds per optimizer step, training computation would be approximately 1.4–4.2 hours, before overhead. Those step times are hypothetical, not SatQuery results. Data preparation, debugging, evaluation, and repeat experiments often dominate calendar time.

## 9. User interface requirements

The UI is a resizable geospatial workspace. Its main regions are a scene/layer panel, central map or image canvas, chat/results panel, and expandable execution/evidence panel. Provide a simpler default view and reveal technical controls when needed.

| ID | Requirement | Phase | Acceptance condition |
|---|---|---|---|
| UI-001 | Upload and scene inventory | P1 | User sees ingestion state, sensor/date where known, errors, and preview |
| UI-002 | Layer controls | P1 | Toggle, reorder, adjust opacity, inspect legend, and select active layer |
| UI-003 | Chat and preset actions | P1 | Preset and equivalent natural-language query share the same intent contract |
| UI-004 | Region selection | P1 | Bounding box or polygon is attached to a query and shown on the map |
| UI-005 | Source-linked answers | P1 | Clicking an evidence item focuses its scene or region |
| UI-006 | Live job trace | P1 | Show real step status, concise purpose, timings, warnings, and cancellation |
| UI-007 | Temporal comparison | P2 | Before/after views remain geographically synchronised |
| UI-008 | Masks and geometry | P2 | Overlay meaning, class colours, valid coverage, and source date are visible |
| UI-009 | Evidence and uncertainty | P1 | Show missing/contradictory evidence and score type without fake percentages |
| UI-010 | Export | P1/P2 | Download result JSON and supported artifacts with provenance |
| UI-011 | Plan inspection | P2 | User can review selected scenes, operations, and expensive-step estimates |
| UI-012 | Failure and partial states | P1 | Empty, unsupported, waiting, failed, cancelled, and partial states are distinct |
| UI-013 | Accessibility | P1 | Keyboard navigation, readable contrast, labelled controls, non-colour status cues |

Initial presets: Describe scene, Ask about selected region, Compare dates, Analyse vegetation, Inspect water evidence, and Compare optical and SAR. Disable or explain unavailable presets when input requirements are missing.

Do not place every model parameter in the primary user flow. Advanced settings expose validated options such as band recipe, threshold, region, and output resolution. A changed scientific parameter creates a new analysis run or revision.

## 10. Functional requirements

| ID | Requirement | Acceptance condition |
|---|---|---|
| FUN-001 | Resolve intent from query and selected scene roles | Compound and simple requests produce a supported intent or targeted clarification |
| FUN-002 | Validate every plan against tool capabilities | Invalid modality/band combinations are rejected before model execution |
| FUN-003 | Ask for consequential missing information | Missing temporal order or ambiguous target region is not silently guessed |
| FUN-004 | Support single-scene VQA and captioning | Return valid answer records with input references on the evaluation set |
| FUN-005 | Support grounding | Returned geometry uses declared coordinate conventions and maps to the right scene |
| FUN-006 | Produce precise masks through appropriate tools | Segmentation results are distinguishable from rough VLM boxes |
| FUN-007 | Support temporal reasoning | Original dated scenes accompany change evidence during interpretation |
| FUN-008 | Support optical–SAR analysis | Modality-specific evidence and disagreement survive answer composition |
| FUN-009 | Compute measurements deterministically | Numbers in the answer match stored tool results and units |
| FUN-010 | Abstain or qualify unsupported results | Missing evidence produces a structured limitation, not fabricated output |
| FUN-011 | Persist analysis state and artifacts | Refreshing the page can recover job state and completed results |
| FUN-012 | Cancel and retry safely | Cancelled jobs do not become successful; retries do not duplicate committed results |
| FUN-013 | Reproduce a run | Inputs, versions, recipes, parameters, and seeds where relevant are recorded |
| FUN-014 | Keep user corrections traceable | Corrected date/band/region metadata invalidates dependent cached results |
| FUN-015 | Export georeferenced results | GeoTIFF/GeoJSON exports align with the displayed artifacts |

### Evidence and uncertainty policy

Every substantive visual claim references one or more scene, region, or tool-output IDs. Every numeric measurement references a measurement record containing value, units, method, valid area, and source artifacts. Report supported observations separately from hypotheses and contextual interpretations.

Initially expose data quality, coverage, model scores with their original semantics, and explicit evidence agreement. A numeric answer-correctness probability is disabled until calibrated against labelled held-out examples for the relevant task/domain. A VLM's self-reported confidence, CLIP similarity, or agreement between correlated models is not a calibrated probability.

Agreement may support a conclusion; it is not proof that both sensors are correct. Conflicting dates, registration errors, missing coverage, or shared model bias can produce misleading agreement or disagreement.

## 11. Technical stack and deployment

The following are concrete engineering defaults for this PRD. Exact package versions are pinned after compatibility testing; this document does not claim every dependency combination has already been tested.

| Layer | Default | Reason |
|---|---|---|
| Web application | React, TypeScript, Vite | Familiar SPA workflow without requiring a server-rendering framework |
| Styling | Tailwind CSS | Reusable layout and panel styling |
| Map | MapLibre GL JS | Geographic layers, region interaction, synchronised maps |
| Client state | Lightweight local state plus query cache | Separate panel state from server job state |
| API | Python FastAPI and Pydantic | Typed request/response validation and generated OpenAPI |
| Workflow logic | Explicit Python DAG executor and tool registry | Inspectable dependencies, validation, bounded retries |
| Background work | Worker abstraction; Celery/Redis for multi-worker deployment | Keep long CPU/GPU work outside request handlers |
| Live updates | Server-Sent Events | Stream durable job events with reconnect support |
| Raster processing | Rasterio/GDAL and NumPy | Raster I/O, windows, transforms, arithmetic |
| Coordinate/geometry tools | PyProj and Shapely; GeoPandas where useful | Reprojection, polygon operations, measurements |
| Registration helpers | OpenCV plus validated geospatial methods | Image alignment diagnostics and selected registration steps |
| Raster serving | rio-tiler/TiTiler-compatible adapter | Serve display tiles without shipping full rasters to the browser |
| Training | PyTorch, Transformers, PEFT, Accelerate; compatible quantisation backend | Reproducible model adaptation |
| Inference | Transformers first; vLLM only after compatibility tests | Establish correctness before serving optimisation |
| Metadata persistence | SQLite for local P1; PostgreSQL for shared deployment | Durable projects, scenes, analyses, and event references |
| Artifacts | Local filesystem first; S3-compatible storage adapter later | Store large rasters independently of metadata database |
| Packaging | Docker for services; Linux GPU environment | Isolate model dependencies and geospatial native libraries |
| Tests | pytest and frontend unit tests; browser tests for core journeys | Verify spatial math, contracts, and real user flows |
| Experiment records | Versioned manifests and structured metrics; optional MLflow | Reproduce training and compare checkpoints |

Keep the API, CPU geospatial worker, and GPU model services logically separate. They may share one machine during development. Older model repositories may require incompatible environments; isolate them behind the same internal tool contract.

No cloud provider, free-tier quota, current price, or hosted checkpoint availability is assumed. Local development is the default; remote GPU procurement requires a team budget decision. P1 can use a configured remote model endpoint, but the final adaptation requirement still needs the team's own documented experiment.

## 12. Data contracts and API

All application contracts carry `schema_version`. Use opaque IDs for scenes and artifacts; do not expose arbitrary server filesystem paths. Timestamps use ISO 8601 with timezone. Geographic GeoJSON uses longitude/latitude order in WGS84; raster-native coordinates retain their CRS explicitly.

### Core records

| Record | Required content |
|---|---|
| Project | ID, name, created time, access context |
| Scene | ID, source assets/checksums, dimensions, bands, CRS/transform, dates, modality, quality, processing history |
| View | ID, source scene, crop/tile bounds, recipe, resize mapping, modality, display versus analysis designation |
| Plan | ID/version, intent, scene roles, AOI, steps, dependencies, output requests, resource budget |
| ToolRun | Tool/model version, validated inputs, parameters, status, timings, outputs, errors |
| Artifact | ID, type, source run, checksum, storage reference, CRS/grid where relevant, lineage |
| Measurement | ID, value, unit, method, source mask, valid area, exclusion information |
| Claim | Text, evidence IDs, spatial references, status, limitations |
| AnalysisResult | Plan/run references, answer, claims, measurements, artifacts, warnings, quality summary |

### Example plan

```json
{
  "schema_version": "1.0",
  "intent": "vegetation_change",
  "scene_roles": {"before": "scene-a", "after": "scene-b"},
  "aoi_id": "region-1",
  "steps": [
    {"id": "validate", "tool": "validate_temporal_pair", "depends_on": []},
    {"id": "prepare", "tool": "prepare_common_grid", "depends_on": ["validate"]},
    {"id": "ndvi_before", "tool": "compute_ndvi", "depends_on": ["prepare"], "scene_role": "before"},
    {"id": "ndvi_after", "tool": "compute_ndvi", "depends_on": ["prepare"], "scene_role": "after"},
    {"id": "compare", "tool": "compare_indices", "depends_on": ["ndvi_before", "ndvi_after"]},
    {"id": "compose", "tool": "compose_evidence_answer", "depends_on": ["compare"]}
  ],
  "requested_outputs": ["answer", "difference_raster", "statistics", "trace"]
}
```

The executor resolves named dependencies to artifact IDs. The planner cannot use a descriptive string as a substitute for a missing artifact.

### Example result

Illustrative values below are fixtures, not measured SatQuery results.

```json
{
  "schema_version": "1.0",
  "analysis_id": "analysis-example",
  "status": "completed_with_warnings",
  "answer": "Vegetation-index decline was detected within the analysed region; the cause is unresolved.",
  "claims": [
    {"id": "claim-1", "evidence_ids": ["measurement-1", "artifact-difference"], "status": "supported_observation"}
  ],
  "measurements": [
    {"id": "measurement-1", "name": "candidate_decline_area", "value": 18.4, "unit": "ha", "method": "thresholded_ndvi_difference", "source_artifact_id": "artifact-mask"}
  ],
  "quality": {"valid_coverage_fraction": 0.82, "answer_probability": null, "calibration_status": "not_calibrated"},
  "warnings": ["Cloud-obscured pixels were excluded.", "Index change does not establish its cause."],
  "artifact_ids": ["artifact-difference", "artifact-mask"],
  "trace_id": "trace-example"
}
```

### Endpoints

| Method and route | Purpose | Response behaviour |
|---|---|---|
| `POST /api/v1/projects` | Create workspace project | Project record |
| `POST /api/v1/scenes` | Upload/register supported files and metadata | Scene ID and ingestion job |
| `GET /api/v1/scenes/{id}` | Inspect readiness and metadata | Scene record and validation findings |
| `POST /api/v1/analyses` | Submit query, scene roles, AOI, options | `202` with analysis ID or structured clarification |
| `GET /api/v1/analyses/{id}` | Retrieve state and result | Durable analysis record |
| `GET /api/v1/analyses/{id}/events` | Stream status updates | SSE with monotonically ordered event IDs |
| `POST /api/v1/analyses/{id}/cancel` | Request cancellation | Cancellation state |
| `GET /api/v1/artifacts/{id}` | Get metadata or authorised download | Artifact metadata/download |
| `GET /api/v1/layers/{id}/tiles/{z}/{x}/{y}` | Render display tile | Tile with declared style/legend contract |
| `GET /api/v1/tools` | List enabled capabilities | Capability summary |
| `GET /health` | Process health | Basic health; readiness handled separately |

Version the generated OpenAPI contract. Add idempotency support to analysis submission. Errors include code, user-facing explanation, failed requirement, and recoverable next step.

### Tool contract

Every tool declares its input/output schema, required bands/modalities, accepted processing levels, compatible CRS/grid requirements, model/checkpoint version, estimated resource class, timeout, deterministic/nondeterministic behaviour, and failure modes. Model output is schema-validated before downstream use.

### State and events

Analysis states: `queued`, `validating`, `needs_input`, `running`, `completed`, `completed_with_warnings`, `failed`, `cancelling`, `cancelled`.

Event types: `analysis.created`, `plan.ready`, `step.started`, `step.progress`, `step.completed`, `step.failed`, `artifact.created`, `warning.raised`, `analysis.completed`, `analysis.cancelled`.

Persist events before streaming. Reconnect uses the last event ID. A partial result identifies failed/skipped steps and unavailable outputs. Cache keys include source checksums, metadata revisions, AOI, recipe, tool/model versions, and parameters.

## 13. Reliability and security requirements

| ID | Requirement | Acceptance condition |
|---|---|---|
| NFR-001 | Bound processing | Configured file, dimension, tile, GPU-token, runtime, and concurrency limits are enforced |
| NFR-002 | Validate uploads | Check signatures and raster readability; reject malformed files without crashing the API |
| NFR-003 | Restrict tool execution | Only registered operations execute; user text and image metadata cannot become shell commands |
| NFR-004 | Protect project data | Shared deployment enforces project access; API secrets stay server-side |
| NFR-005 | Handle untrusted content | Text in images, filenames, and metadata is data, not an instruction to the planner |
| NFR-006 | Control external transmission | Provider configuration states which previews/metadata may leave the deployment |
| NFR-007 | Preserve provenance | Scientific outputs include source, tool, recipe, and model references |
| NFR-008 | Recover from interruption | Restart can recover persisted jobs or mark them interrupted; no silent success |
| NFR-009 | Observe performance | Record queue, preprocessing, inference, export time, and peak resource use |
| NFR-010 | Keep UI responsive | Long work runs asynchronously; uploaded inputs remain inspectable during processing |
| NFR-011 | Isolate mock results | Fixtures are labelled in development and presentation; production analyses never return them as inference |

Initial engineering targets, to be measured on named hardware: analysis acknowledgement within two seconds after valid submission, visible status at least every five seconds during active long steps, and prompt cancellation acknowledgement. Full-scene completion time is not fixed until profiling establishes scene-size and model budgets.

## 14. Evaluation and release gates

### Baselines and ablations

- Base VLM versus adapted VLM on identical held-out tasks.
- RGB-only versus additional informative views.
- Optical-only, SAR-only, and paired inputs.
- Paired model with correct SAR versus shuffled/missing SAR to test dependence on the second modality.
- GIS-only index comparison versus added learned change analysis for the task where applicable.
- Temporal specialist versus primary multi-image VLM with the same evidence.
- Deterministic routing versus planner routing on a fixed intent test set.

### Metrics

| Area | Metrics and review |
|---|---|
| VQA | Official benchmark accuracy and normalisation; task-wise breakdown |
| Captioning | Official caption metrics plus manual factuality/evidence review |
| Grounding | Box IoU and benchmark-defined recall/accuracy |
| Segmentation/change | IoU, precision, recall, F1; exclude invalid pixels |
| Quantitative measurements | Error against reference geometry/statistics with units and coverage |
| Fusion | Task performance against both single-modality baselines; missing/shuffled modality sensitivity |
| Planning | Intent correctness, valid-plan rate, tool selection, successful workflow completion |
| Reliability | Failure rate, cancellation behaviour, latency, resource use |
| Evidence | Unsupported-claim rate, wrong-scene references, number consistency |
| Calibration if enabled | Reliability curves, Brier score/ECE where appropriate, abstention performance |

Use official benchmark definitions rather than mixing similarly named metrics. Caption fluency is not a substitute for factual correctness. Report sample counts, sensor profiles, split versions, and uncertainty where feasible.

### Release gates

**GATE-001 — P1 functional readiness:** WF-001 and WF-002 run on real fixtures; exports align; unsupported inputs produce explicit errors; trace and cancellation work.

**GATE-002 — Spatial correctness:** known-coordinate fixtures survive crop/resize/tile/reprojection round trips; area calculations match independent reference calculations within a declared numerical tolerance. Document tolerance based on resolution and transformation method.

**GATE-003 — Adaptation acceptance:** compare base and adapted VLM on held-out scenes. Promote only when the designated primary task improves without unacceptable regressions on other required tasks. Set numeric task targets after the baseline, before selecting the final checkpoint.

**GATE-004 — Temporal readiness:** evaluate unchanged, seasonal, shifted, cloud-obscured, and genuinely changed pairs. A detector must not pass solely on attractive examples.

**GATE-005 — Cross-modal readiness:** evaluate both single-modality baselines, paired inputs, disagreement, missing modalities, and date mismatch. Learned fusion is promoted only with demonstrated task benefit or a documented robustness tradeoff.

**GATE-006 — P2 acceptance:** all CAP requirements have demonstrable workflows, adaptation records exist, licensing checks pass, metrics are reproducible, and unsupported sensor profiles fail clearly.

### Essential test cases

Valid optical upload; missing CRS; missing acquisition date; wrong band mapping; corrupt raster; zero/invalid denominator; cloud/no-data exclusion; non-overlapping pair; same CRS but shifted pixels; reversed dates; SAR already in dB; unsupported raw SAR; AOI outside image; tiny-object request beyond resolution; VLM malformed coordinates; model timeout; cancelled GPU job; SSE reconnect; changed metadata invalidating cache; measurement consistency; and export overlay alignment.

## 15. Delivery plan and ownership

Use milestone gates rather than assuming an unconfirmed finale date. The internal round on September 10 is an idea presentation. A conceptual walkthrough may illustrate planned behaviour if labelled accordingly.

| Milestone | Work | Deliverable |
|---|---|---|
| M0 | Align team, presentation, and source requirements | This PRD, architecture narrative, open-decision list |
| M1 | Verify data samples, hardware, and model loading | Dataset manifests, baseline inference, measured resource profile |
| M2 | Implement one end-to-end optical workflow | Upload, validated scene, VQA/caption, trace, GIS measurement, export |
| M3 | Adapt main VLM and evaluate | Training recipe, checkpoint/adapter, held-out comparison |
| M4 | Add temporal evidence and spatial masks | Change workflow, original-scene interpretation, mask/geometry tests |
| M5 | Integrate optical–SAR analysis | Evidence-fusion baseline, paired-input experiment, ablations |
| M6 | Harden, evaluate, and rehearse | Capability matrix, reproducible report, complete UI journeys |
| M7 | Advance learned fusion and sensor adapters | Research results and deployment-specific extensions |

M4 and M5 experiments can proceed alongside M3 when teammates and compute permit. SAR format investigation begins at M1, not at the end of the project.

### Suggested workstreams

| Workstream | Responsibilities | Integration deliverable |
|---|---|---|
| Product and orchestration | Requirements, intent contracts, planner, executor, presentation | Validated analysis jobs and trace |
| Geospatial data | Sensor adapters, metadata, alignment, indices, geometry | Scene and artifact contracts with fixtures |
| VLM and datasets | Dataset manifests, preprocessing views, baseline/adaptation, VQA eval | Versioned model adapter service |
| Temporal and segmentation | Change evidence, masks, semantic interpretation tests | Spatial tool outputs |
| SAR and fusion | SAR preprocessing, paired data, modality evidence, fusion experiments | Validated cross-modal tool |
| Frontend and integration QA | Panels, map, SSE, results, exports, end-to-end tests | Reviewable user journeys |

These are roles, not assumed teammate identities or a requirement for six dedicated people. Assign actual names under OPEN-008.

## 16. Implementation instructions for AI agents

This PRD authorises implementation only when the user asks the agent to build. Reading it alone is not permission to purchase GPUs, deploy publicly, contact third parties, download entire datasets, or change external accounts.

When implementation is requested:

1. Read this PRD, the repository instructions, and the existing code. Preserve unrelated work.
2. Identify the targeted milestone and requirement IDs. Implement M1/M2 foundations before speculative fusion research unless explicitly directed otherwise.
3. Define shared schemas and a small real fixture set before integrating models.
4. Implement a tool adapter with deterministic test doubles, then connect the real implementation. Clearly label fixtures and mocks.
5. Keep GIS calculations in tested code. Keep model interfaces replaceable.
6. Record versions and preprocessing recipes. Do not silently replace a checkpoint, sensor profile, or dataset split.
7. Validate spatial mappings and measurement units before UI polish.
8. Run the relevant contract, spatial, and user-flow checks. Report actual outcomes and limitations.
9. Update requirement status and changelog for material changes. Do not mark planned features as implemented because an interface exists.
10. Resolve routine coding choices within the baseline. Record major architecture changes as change requests.

### Proposed repository layout

```text
SATQUERY_PRD.md
apps/web/                    # React workspace
services/api/                # FastAPI routes and schemas
services/worker/             # Background execution
packages/contracts/         # Schemas and generated client types
packages/geospatial/        # Ingestion, grids, indices, geometry
packages/orchestration/      # Planner, validator, executor, registry
packages/model_adapters/    # VLM, change, segmentation, fusion interfaces
training/                   # Dataset loaders and adaptation recipes
evaluation/                 # Benchmarks, ablations, reports
configs/                    # Sensor profiles and enabled tools
tests/fixtures/             # Small licensed/synthetic spatial fixtures
docs/decisions/              # Architecture decisions and change requests
docs/releases/              # PRD release snapshots when needed
```

Do not commit full datasets, model weights, secrets, or generated large rasters. Add download manifests and local storage conventions instead. This is a proposed layout, not a claim these directories already exist.

### Initial build backlog

| ID | Task | Depends on | Done when |
|---|---|---|---|
| BUILD-001 | Establish contracts and fixture scenes | None | Scene, plan, event, artifact, and result schemas validate |
| BUILD-002 | Optical ingestion and metadata confirmation | BUILD-001 | GEO-001/002/005/006 pass |
| BUILD-003 | NDVI and area tools | BUILD-002 | Numeric and spatial fixture checks pass |
| BUILD-004 | Tool registry and executor | BUILD-001 | Valid plan runs, invalid plan rejects, state persists |
| BUILD-005 | Primary VLM adapter and baseline | BUILD-002 | Real caption/VQA works with source references |
| BUILD-006 | UI upload, map, chat, trace, export | BUILD-004/005 | WF-001 and WF-002 complete through UI |
| BUILD-007 | Dataset and training pilot | BUILD-005 | Reproducible adapter and baseline comparison exist |
| BUILD-008 | Temporal grid and detector integration | BUILD-002/004 | WF-003 passes spatial and negative-case tests |
| BUILD-009 | SAR profile and evidence tools | BUILD-001/002 | Units/processing history validated; real SAR fixtures pass |
| BUILD-010 | Paired reasoning and fusion evaluation | BUILD-007/009 | WF-004 and ablations documented |
| BUILD-011 | Supported segmentation workflows | BUILD-005/008 | Mask-to-map and measurement checks pass |
| BUILD-012 | Final capability audit | BUILD-006 through BUILD-011 | GATE-006 and traceability matrix completed |

## 17. Decision log

| ID | Decision | Rationale | Status |
|---|---|---|---|
| DEC-001 | Preserve full optical, temporal, SAR, and agentic vision | Matches the intended product ambition | Accepted direction |
| DEC-002 | September 10 is idea phase; demo optional | Explicit team-lead clarification | Accepted |
| DEC-003 | Use capability modules rather than exactly three/four models | Different tasks share models and deterministic tools | Accepted |
| DEC-004 | Begin with Qwen3-VL-8B-Instruct as the main VLM experiment | Concrete multi-image candidate from discussion [S1] | Conditional on GATE-003 and hardware |
| DEC-005 | Keep raw arrays alongside model-compatible visual views | Avoid losing non-visible sensor information | Accepted |
| DEC-006 | Main VLM adapter is the first adaptation target | Adapt the component doing primary visual dialogue | Accepted direction |
| DEC-007 | Measurements belong to GIS; masks to suitable spatial tools | Separate language from pixel and coordinate computation | Accepted |
| DEC-008 | Start fusion with evidence and paired views | Establish a measurable baseline before custom feature injection | Accepted |
| DEC-009 | Learned fusion remains an explicit experiment | Needs suitable encoders, targets, and ablation evidence | Conditional |
| DEC-010 | Confidence requires labelled calibration | Similarity and agreement alone are insufficient | Accepted |
| DEC-011 | Plans execute as bounded dependency graphs | Permit valid parallelism and enforce input dependencies | Accepted |
| DEC-012 | Use captioning as the initial extra single-image task | Delivers clear early coverage while grounding develops | Accepted baseline |
| DEC-013 | Use React/Vite, FastAPI, Python tools, and isolated model services | Concrete implementation defaults consistent with team stack | Baseline for review |
| DEC-014 | Treat exact SIH compliance as pending source verification | Official statement was not independently retrieved during drafting | Open verification |

## 18. Risks and open decisions

| ID | Risk | Mitigation / trigger |
|---|---|---|
| RISK-001 | Wrong SAR units or product processing | Explicit product profiles, fixtures, no guessed calibration |
| RISK-002 | Misregistration creates false change | Alignment diagnostics and spatial tests before inference |
| RISK-003 | VLM ignores SAR | Single-modality and shuffled-pair ablations |
| RISK-004 | Fine-tuning overfits annotation language | Geographic splits, factuality review, held-out task tests |
| RISK-005 | GPU/token budget exceeds resources | Profile early; reduce view/token budget or select alternative through decision log |
| RISK-006 | Segmentation fails on target sensor | Use task-matched segmenter; disable unsupported profile |
| RISK-007 | Sentinel results fail on Cartosat/RISAT | Separate transfer tests; never treat parser support as validated analysis |
| RISK-008 | Dataset/model licence limits use | Archive licences before training/distribution; track inherited restrictions |
| RISK-009 | Attractive UI obscures weak evidence | Require source-linked claims and benchmark gates |
| RISK-010 | Scope consumes all implementation time | Deliver complete workflows by milestone while retaining research roadmap |
| RISK-011 | Prior documents revive incorrect claims | This PRD and correction log are the current architecture authority |

| ID | Unresolved question | Owner role | Resolution evidence | Blocks |
|---|---|---|---|---|
| OPEN-001 | Exact official SIH statement, formats, metrics, deadlines | Product lead | Archived official source and capability mapping | Formal compliance claim |
| OPEN-002 | Available GPU, runtime budget, storage | Team lead / ML | Named hardware and approved budget | Training scale |
| OPEN-003 | Dataset download manifests, splits, licences | Dataset lead | Sample load and licence registry | Full training |
| OPEN-004 | Primary checkpoint and dependency compatibility | VLM lead | Multi-image inference plus adaptation smoke test | VLM promotion |
| OPEN-005 | Change and segmentation checkpoints/datasets | Temporal lead | Domain-matched baseline and licence review | Precise target masks |
| OPEN-006 | SAR product levels and RISAT evaluator format | SAR lead | Product documentation and sample validation | Sensor-specific support |
| OPEN-007 | Hosted planner provider and data transmission policy | Backend lead | Configured interface, limits, data policy | Hosted production use |
| OPEN-008 | Individual workstream assignments | Team lead | Named owners | Delivery accountability |
| OPEN-009 | Prior-art comparison and final differentiation | Product/research | Feature/evidence matrix against named systems | Novelty claims |
| OPEN-010 | Task-specific thresholds and performance targets | Evaluation lead | Baseline report and predeclared targets | Final release promotion |

Open decisions do not prevent writing code against stable interfaces. They do prevent silently claiming readiness of the dependent capability.

## 19. Team questions and answers

### Q1. What are we actually building

A satellite-analysis workspace where users ask questions and the system constructs a valid workflow, runs appropriate models and GIS tools, and returns geographically linked evidence. The trained model is one part of the product.

### Q2. Why is it harder than connecting pretrained models

The models have incompatible inputs and outputs. Sensors differ in bands, units, resolution, and processing levels. Predictions must survive tiling and resizing while remaining correctly located on Earth. Training data and evaluation must match the tasks. Orchestration is useful only when those underlying operations work.

### Q3. Is ambition being reduced

The full objective includes optical, SAR, temporal reasoning, spatial outputs, and an agentic UI. Milestones establish the order of implementation and the evidence needed to claim each capability. They do not remove the long-term objective.

### Q4. Do we need a working demo on September 10

No. The team lead confirmed that this is an internal idea round and a demo is optional. Explain the intended experience and architecture clearly. Label conceptual examples and mockups as such.

### Q5. Are there really no existing solutions

There are existing models and agentic research systems. SatQuery must demonstrate the value of its integrated workflow, adaptation, spatial correctness, and evidence handling. Do not claim the field is empty.

### Q6. Can a flagship model do this

A strong general model can inspect images, plan operations, write analysis code, and use external tools. Given the same infrastructure it may perform many of these tasks. SatQuery packages and validates that infrastructure for specific Earth-observation workflows. Its usefulness must be measured against strong baselines.

### Q7. Why select an 8B VLM

Qwen3-VL-8B-Instruct is the chosen first experiment because it provides multi-image input in an adaptable model family [S1]. Eight billion describes parameter scale, not guaranteed capability or memory use. Hardware feasibility and held-out results decide whether it stays.

### Q8. Are we rejecting GeoChat because it was not trained on BigEarthNet

No. Dataset name alone is not the issue. The relevant questions are input representation, supported tasks, sensor domain, multi-image behaviour, available adaptation code, and performance on our tests. GeoChat remains a useful remote-sensing baseline [S3].

### Q9. Is a multi-image model a multispectral model

No. It can receive multiple ordinary visual inputs. A raw multispectral tensor contains separate spectral channels whose physical meaning must be preserved. We provide useful composites to the VLM and original bands to numerical tools; native learned band ingestion is a later encoder/projector experiment.

### Q10. Does GeoTIFF always mean twelve bands

No. GeoTIFF is a raster format with georeferencing support. Band counts, band identities, units, and metadata vary. Even acquisition time may require a sidecar file or user confirmation.

### Q11. What does the converter do

It is an ingestion and preprocessing engine: validate metadata, preserve arrays, prepare grids, align scenes, generate views, compute indices, and track transformations. It creates several representations while preserving their source lineage.

### Q12. Is BigEarthNet.txt only text

No. It associates satellite imagery with text supervision, including captions, questions/answers, and referring expressions [S2]. The loader opens the corresponding imagery and uses the annotations as training targets.

### Q13. Will fine-tuning make the VLM effective

It can improve tasks represented by the data, but success depends on representation, labels, task coverage, and the base model. RGB caption tuning does not establish raw SAR competence, precise segmentation, or temporal causality. Evaluate each capability separately.

### Q14. How many models are we training

One primary VLM adaptation is the first commitment. A change detector and a fusion head may add two specialist training efforts. Other models begin as integrations. We are not committing to training three large foundation models from scratch.

### Q15. How long will training take

There is no measured SatQuery training duration yet. Run the actual preprocessing and training configuration on available hardware, measure step time, then estimate using the formula in section 8. The earlier “two to three hours on a free GPU” statement is not a commitment.

### Q16. Does the comparison model receive only numerical data

No. A detector may compare image tensors or learned features; GIS tools compare index arrays and calculate statistics; a temporal VLM sees ordered original views plus evidence. The tools have different roles within one temporal workflow.

### Q17. Can we send a change mask alone to the VLM

A mask shows where a detector found change, but usually not what the change means. Send original before/after crops with dates and the mask as additional evidence.

### Q18. Will the VLM caption, ground, and mask everything

It can generate language and candidate locations. Precise masks require segmentation or change tools. GIS code maps their pixels to coordinates and measures area. The user receives a unified answer, while the internal responsibilities remain explicit.

### Q19. How do SAR and optical encoders become a joint answer

Initially each branch produces structured evidence and/or labelled views for the VLM. A learned fusion head later combines compatible features for a defined task. Directly conditioning a language model on fused embeddings additionally requires a trained projector and control of its input interface.

### Q20. Are two ImageNet encoders already adequate optical and SAR experts

No. Generic pretrained weights can initialise a model, but SAR has a different signal distribution. Encoder suitability and adaptation must be tested. Freezing both encoders and training only a fusion head is an experiment, not an established solution.

### Q21. Why have an LLM planner when buttons can select actions

Buttons provide common workflows. Natural language lets users combine objectives, choose regions, specify conditions, and ask follow-ups. Both produce the same typed intent and use the same validator and executor. Simple cases may route deterministically.

### Q22. Does every model run for every request

No. The validated plan selects the needed tools. Independent branches may run concurrently when resources permit. A vegetation calculation does not require a SAR encoder when no radar evidence is relevant.

### Q23. Is RemoteCLIP confidence

RemoteCLIP provides image-text compatibility signals useful for retrieval or evaluation experiments. Its raw similarity is not a probability that a complete answer is correct. It cannot verify area arithmetic or every spatial claim.

### Q24. Can we show 78 percent confidence

Only when the number has a defined, evaluated meaning. Until calibration exists, show quality, coverage, agreement, warnings, and explicitly labelled model scores. The earlier example confidence number was illustrative and must not become a default UI value.

### Q25. Does dark SAR prove water

No. Smooth surfaces and radar shadow can also appear dark, while some flooded settings can produce complex or strong returns. Use temporal/contextual evidence and validated tools. A current water observation also does not prove that flooding expanded.

### Q26. Does NDVI directly measure crop health

NDVI is a vegetation-related spectral index. Its interpretation depends on vegetation type, season, background, acquisition conditions, and other evidence. Use “vegetation-index change” unless the stronger health inference is supported.

### Q27. Can Sentinel-2 show a collapsed bridge or every new building

Only features supported by the image resolution and task model can be analysed. Object-level requests may require much higher-resolution data. Upsampling does not create missing ground detail.

### Q28. Will Sentinel training guarantee RISAT and Cartosat performance

No. Sensor transfer needs appropriate preprocessing and evaluation. A common GeoTIFF container does not erase sensor, resolution, or radiometric differences.

### Q29. What exactly is our contribution if we use pretrained models

The contribution can include the team's adaptation, sensor adapters, validated tool plans, spatial evidence pipeline, fusion experiments, interface, and evaluation. Credit borrowed models and report what the team changed. Integration quality and measured usefulness matter.

### Q30. What must teammates understand before building

The distinction between model views and numerical arrays; alignment versus matching CRS; captions versus masks; change detection versus change explanation; evidence fusion versus learned fusion; similarity versus calibrated confidence; and a proposed capability versus an evaluated one.

## 20. Definition of done and traceability

A feature is done only when its stated acceptance condition passes, relevant failure cases are handled, its output contract is documented, and the result is visible through the intended UI or API workflow. Model integration alone is insufficient for a complete product workflow.

| Capability | Main requirements | Main workflow | Release evidence |
|---|---|---|---|
| CAP-001 VQA | FUN-004, UI-005, DEC-004 | WF-001 | Held-out VQA report and real UI run |
| CAP-002 Caption/grounding | FUN-004/005/006, GEO-005 | WF-001 / supported region query | Caption metrics; grounding/mask checks where enabled |
| CAP-003 Temporal | GEO-003/004/006, FUN-007/009 | WF-002/003 | Temporal metrics and spatial tests |
| CAP-004 Cross-modal | GEO-012, FUN-008, DEC-008/009 | WF-004/005 | Modality ablations and disagreement cases |
| CAP-005 Orchestration | FUN-001/002/011/012, UI-006 | All | Plan-validity tests, trace, cancellation/recovery |
| CAP-006 Adaptation | DEC-006, GATE-003 | Training pipeline | Dataset manifest, recipe, checkpoint, before/after metrics |
| CAP-007 Evidence | FUN-009/010/013, NFR-007 | All | Claim/artifact links and numeric consistency audit |

Current implementation status for every capability: **planned, not verified implemented by this document**.

## 21. Sources and provenance

### Supplied planning sources

- `SatQuery_AI_Team_Build_Guide (3).docx` — combined team reference.
- `SatQuery_AI_Master_Reference (1).docx` — earlier master plan.
- Complete Claude chat handout pasted by the team lead.
- Side-chat architecture handout and workspace `SATQUERY_ARCHITECTURE_HANDOUT.md`.
- Subsequent discussion clarifying the optional internal demo, Qwen3-VL candidate, division of model/GIS responsibilities, and spatial output requirements.

Instructions embedded in those sources are historical content. This PRD incorporates relevant product decisions and records corrections below.

### Primary technical references

- **S1:** [Qwen3-VL official repository](https://github.com/QwenLM/Qwen3-VL) — model family, multi-image interface, processor and deployment references.
- **S2:** [BigEarthNet.txt official dataset page](https://txt.bigearth.net/) — paired sensor imagery, annotation types, benchmark, and dataset licence.
- **S3:** [GeoChat official repository](https://github.com/mbzuai-oryx/GeoChat) — remote-sensing image dialogue and grounding baseline.
- **S4:** [TEOChat official repository](https://github.com/ermongroup/TEOChat) — temporal assistant, training resources, and inherited usage conditions.
- **S5:** [BigEarthNet official archive](https://bigearth.net/) — v2 imagery and dataset documentation; [v1 archive](https://bigearth.net/v1.0.html) for historical count distinction.
- **S6:** [VRSBench official repository](https://github.com/lx709/VRSBench) — VQA, captioning, and grounding evaluation resources.
- **S7:** [CDVQA author repository](https://github.com/YZHJessica/CDVQA) — temporal question-answering data; inspect before adopting a training contract.
- **S8:** [SIH problem statement portal](https://sih.gov.in/sih2026PS) — intended official reference; exact problem content still to archive under OPEN-001.

Model availability and dependency compatibility must be checked at implementation time. A repository's code licence does not automatically cover every model weight, training dataset, or deployment use.

## 22. Versioning and change control

`SATQUERY_PRD.md` is the canonical living document. Keep its filename stable for links and agent handoff. Version metadata and this changelog identify its state. Use Git history when available; if no version control is configured, preserve the prior released document in `docs/releases/SATQUERY_PRD_vX.Y.Z.md` before a material edit.

### Version meanings

- **Patch** (`0.1.0` → `0.1.1`): clarification, typo, source correction, or acceptance-detail fix without a scope/architecture change.
- **Minor** (`0.1.0` → `0.2.0`): added capability, changed model strategy, changed delivery baseline, or significant requirement revision.
- **Major** (`0.x` → `1.0.0`): team-approved stable product baseline; later major increments represent incompatible product/contract changes.

Never reuse a requirement or decision ID for a different meaning. Mark removed items superseded and point to replacements. Document version and API/schema version are related but distinct.

### Required change record

```text
Change ID: CHG-YYYY-NNN
Document version: old -> new
Date and author:
Affected requirement/decision IDs:
Problem discovered:
Previous behaviour or assumption:
New decision or correction:
Reason and supporting evidence:
Implementation impact:
Tests/evaluation affected:
Migration or compatibility impact:
Status: proposed / accepted / implemented / verified / rejected
Approver for material scope changes:
```

Fix a discovered factual or internal-consistency error in the document and record it. Material changes to the product direction, external commitments, or budget require team-owner approval; implementation agents must not silently relabel an unresolved research question as an accepted result.

### Initial correction register

| Change ID | Earlier assumption | Version 0.1.0 correction |
|---|---|---|
| CHG-2026-001 | Internal round requires a working two-model demo | Demo optional; idea presentation is the immediate deliverable |
| CHG-2026-002 | Exactly four runtime jobs and always sequential execution | Capability modules with dependency-graph execution and optional parallel branches |
| CHG-2026-003 | BLIP-2 then GeoChat is the fixed VQA path | Qwen3-VL-8B is the preferred experiment; alternatives remain benchmark candidates |
| CHG-2026-004 | RemoteCLIP fine-tuning is the mandatory chosen adaptation | Primary VLM adaptation is the first team training commitment |
| CHG-2026-005 | RemoteCLIP similarity is calibrated confidence | Similarity is a compatibility signal; correctness probability requires calibration |
| CHG-2026-006 | VLM produces every precise mask and measurement | Segmentation/change tools produce masks; GIS performs coordinates and measurements |
| CHG-2026-007 | A converted RGB image preserves all sensor information | Retain numerical bands and metadata alongside labelled visual representations |
| CHG-2026-008 | Generic optical/SAR encoders need no adaptation | Encoder suitability and freezing strategy require task-specific experiments |
| CHG-2026-009 | Hosted LLM APIs accept arbitrary fused soft embeddings | Feature injection requires a supported interface and trained projector under model control |
| CHG-2026-010 | Feed only a change mask into VQA | Interpret original dated scenes together with spatial change evidence |
| CHG-2026-011 | BigEarthNet.txt is text-only or equivalent to every BigEarthNet release | Image-linked text dataset; version counts and manifests remain distinct |
| CHG-2026-012 | Two-to-three-hour training, fixed GPU fit, and example score improvements are established | Profile actual configurations; illustrative numbers are not measured results |
| CHG-2026-013 | SAR always proves floods; NDVI directly diagnoses vegetation health | Record sensor/task limitations and distinguish observations from stronger inferences |
| CHG-2026-014 | GeoTIFF guarantees date, twelve bands, and sensor competence | Metadata may be incomplete; sensor profiles and validation define supported analysis |
| CHG-2026-015 | No existing solution and all general models cannot perform the workflow | Acknowledge prior art and compare against capable tool-using baselines |
| CHG-2026-016 | Example 0.78 confidence is a valid output default | Keep answer probability null until calibrated; show measured quality and coverage |
| CHG-2026-017 | Matching CRS establishes co-registration | Registration and compatible analysis grids require separate checks |
| CHG-2026-018 | Final sensor support and official compliance are already secured | Track exact official/evaluator contracts and sensor validation as open gates |

### Changelog

| Version | Date | Changes | Validation |
|---|---|---|---|
| 0.1.0 | 2026-09-09 | Initial consolidated PRD; product scope, architecture, sensor pipeline, model/data plan, UI, contracts, requirements, evaluation, backlog, Q&A, risk register, and change control | Reviewed for consistency against the planning discussion; implementation and model performance remain unverified |

