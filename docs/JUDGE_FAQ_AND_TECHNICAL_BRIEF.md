# SatQuery AI — Judge FAQ and Technical Brief

Use the **bold sentence** as the first spoken answer. The rest is backup if a judge asks a follow-up. Never claim a measured accuracy, trained adapter, public deployment, or sensor support that the team has not yet verified.

## 30-second opening answer

**SatQuery AI turns a natural-language Earth-observation question into a validated geospatial workflow, then returns an answer linked to evidence: maps, masks, polygons, measurements, warnings, and an execution trace.**

It is not one model. A planner selects only the tools the request needs; GIS handles coordinates and measurements; specialist models interpret imagery; and an evidence layer ties the conclusion to the source scenes and limitations.

## Product and problem

### 1. What exactly are you building?

**A satellite-analysis workspace where a user can ask a question about one or more scenes and receive a geographically grounded result, not just a text answer.**

For example, a user can compare two valid Sentinel-2 scenes over an AOI, obtain vegetation-index change, a change layer, area statistics, the excluded cloud/no-data coverage, and a trace of how the answer was produced.

### 2. What problem are you solving?

**Satellite analysis is powerful but expert-first: the user must understand imagery, bands, GIS tools, coordinate systems, and model limitations before getting an answer.**

Existing tools are fragmented—one tool for image interpretation, one for change detection, another for GIS measurement. SatQuery joins them through a controlled workflow while retaining scientific checks.

### 3. Who uses it?

**Disaster-response officers, agriculture analysts, urban planners, environmental teams, and GIS/remote-sensing specialists.**

The first users are not being promised a replacement for experts. The system lowers the time needed to reach an inspectable first analysis and gives experts a reproducible starting point.

### 4. Give a simple real-world use case.

**After heavy rainfall, an officer asks, “Show candidate flood change in this village between these dates.”**

SatQuery checks the dates, coverage, alignment, sensor product, and cloud/no-data conditions; chooses the appropriate optical/SAR and change workflow; generates an overlay or mask when supported; calculates area using GIS; and reports what evidence supports or limits the conclusion.

### 5. Why not just use Google Earth Engine, QGIS, or an existing chatbot?

**Those are valuable tools, but they do not by themselves provide a natural-language, evidence-linked, validated end-to-end workflow for this use case.**

SatQuery can call standard geospatial operations conceptually, but contributes the typed plan, sensor-aware validation, model/GIS coordination, traceability, and evaluation of the adapted component. We do not claim the field is empty.

### 6. What is novel here if you use pretrained models?

**Our contribution is the integration and validation layer: adapted remote-sensing dialogue, sensor-aware ingestion, deterministic spatial evidence, tool routing, and measured evaluation.**

Borrowed foundation models are credited. The innovation is not pretending that a pretrained VLM magically understands arbitrary geospatial data; it is making model outputs operationally and spatially accountable.

### 7. Is this an AI chatbot or a GIS product?

**It is a geospatial intelligence workspace with an AI interface—not a generic chatbot.**

The language interface makes the request easier. It cannot replace CRS validation, image alignment, spectral-index computation, or area measurement.

### 8. What will the user finally see?

**A plain-language answer plus the evidence behind it: original views, layers, masks or polygons where supported, measurements, warnings, and a concise execution trace.**

The answer can say “vegetation-index decline was detected” rather than make an unsupported claim about crop health or cause.

## Architecture and workflow

### 9. Explain the architecture in one sentence.

**Ask → validate imagery → understand intent → build the smallest valid plan → run GIS/models → cross-check evidence → return an auditable result.**

### 10. What are the seven layers?

**The layers are UI, ingestion/validation, query understanding, planner/executor, analysis branches, evidence engine, and answer/trace.**

1. **UI:** upload scenes, label date/sensor, select AOI, ask a question.
2. **Ingestion and validation:** read CRS, bands, bounds, pixel size, units, dates, no-data, overlap, and quality.
3. **Query understanding:** turn the request into structured intent: task, modalities, time requirement, AOI, outputs.
4. **Planner and executor:** create the smallest valid dependency graph and enforce schemas, budgets, timeouts, and registered tools.
5. **Analysis branches:** GIS processing plus VLM/change/segmentation/fusion components as required.
6. **Evidence engine:** compare outputs, record coverage/conflicts, and stop unsupported claims.
7. **Answer and trace:** return explanation, artifacts, measurements, exports, and observable job history.

### 11. Why seven layers instead of one agent that decides everything?

**Because unrestricted agents can invent operations; satellite analysis needs deterministic validation and measurement.**

The planner may interpret ambiguous language, but ordinary code validates sensor constraints and executes only registered tools. It cannot run arbitrary shell commands or use a vague text description instead of a real artifact.

### 12. Does every model run on every request?

**No. The plan invokes only what the request needs.**

For instance, an NDVI comparison does not need a SAR model; a visual caption does not automatically need change detection. This reduces cost, latency, and opportunities for contradictory outputs.

### 13. How do you make area calculations trustworthy?

**Models may identify candidate regions, but GIS performs coordinate conversion and measurement on georeferenced artifacts.**

The system keeps the raster transform, CRS, crop/tile history, valid coverage, and units. It never calculates area by treating longitude/latitude degrees as square metres.

### 14. What happens if imagery is invalid or not comparable?

**The system stops or requests clarification instead of manufacturing an answer.**

Examples: missing Red/NIR blocks NDVI; non-overlapping scenes cannot undergo pixel comparison; matching CRS alone does not prove alignment; invalid SAR units cannot enter the SAR workflow.

### 15. How do you handle a huge GeoTIFF?

**We inspect metadata first and process large rasters in bounded windows or tiles.**

Full raw imagery is not blindly placed into a VLM. Display views are generated for model use while original numerical arrays remain available for GIS calculations.

### 16. What is the execution trace?

**It is a user-visible record of what ran, with inputs, tool/model versions, parameters, status, artifacts, warnings, and timings.**

It is not hidden chain-of-thought. It makes the scientific workflow inspectable and helps reproduce an analysis.

## Data, sensors, and geospatial correctness

### 17. Which imagery do you support first?

**P1 is Sentinel-2 Level-2A optical GeoTIFF imagery with declared band mapping and compatible radiometric metadata.**

P2 adds calibrated, terrain-corrected Sentinel-1 backscatter with explicit polarisation, units, acquisition time, and processing history. Cartosat/RISAT are extension targets, not claimed ready support.

### 18. What is a GeoTIFF, and does it always have 12 bands?

**GeoTIFF is a georeferenced raster format; it does not guarantee any specific band count, sensor, date, units, or processing level.**

That is why ingestion reads metadata and asks for missing information rather than assuming “GeoTIFF means Sentinel-2.”

### 19. What do you validate in an upload?

**We validate file readability, checksum, dimensions, band count/identity, CRS, affine transform, bounds, pixel size, no-data, modality, date, units, processing level, overlap, and quality findings.**

The exact available fields depend on the source file; unknown information remains unknown until the user supplies it or it is reliably parsed.

### 20. What is NDVI, and can it prove crop health?

**NDVI is a vegetation-related spectral index, calculated as `(NIR − Red) / (NIR + Red)`; it is not a universal crop-health diagnosis.**

We report vegetation-index change and its coverage/limitations unless additional evidence supports a stronger conclusion.

### 21. Why is spatial alignment such a big issue?

**A small shift between before/after scenes can create false change everywhere.**

The system checks overlap and registration separately from CRS. “Both images are WGS84” is not sufficient proof that the pixels refer to the same ground location.

### 22. Does SAR solve the cloud problem perfectly?

**No. SAR is less obstructed by clouds, but radar interpretation has its own failure modes: geometry, speckle, roughness, moisture, vegetation, shadow, layover, and incidence angle.**

For this reason, dark SAR does not automatically mean water or flooding. The system preserves product metadata and cross-checks evidence.

### 23. Can you detect every building, bridge, or object from Sentinel imagery?

**No. Analysis is limited by image resolution, the actual sensor product, and the task model. Upsampling cannot create missing information.**

High-resolution object-level claims need appropriate imagery and a validated task model.

### 24. Can a Sentinel-trained model automatically work on Cartosat or RISAT?

**No. Different sensors have different resolutions, bands, radiometry, and preprocessing histories; transfer must be tested.**

Sensor adapters and domain-transfer evaluation are explicit future work, not an assumption.

## ML model specification sheet

### 25. What is your primary model?

**Our primary experimental visual-dialogue baseline is `Qwen/Qwen3-VL-8B-Instruct`, an approximately 8-billion-parameter vision-language model with multi-image input capability.**

Role: captioning, visual question answering, evidence-aware explanation, and candidate grounding over labelled image views. It does not directly receive arbitrary raw multispectral tensors as if they were ordinary RGB images.

Status: preferred candidate, subject to hardware, compatibility, licence, and held-out benchmark gates.

### 26. Why choose an 8B VLM?

**It is a practical middle ground: adaptable and capable of multi-image reasoning, while still feasible to profile and fine-tune with QLoRA on rented 24–48 GB GPUs.**

“8B” is parameter scale, not a performance claim or a promise that it will fit every image/token configuration.

### 27. How will you fine-tune it?

**We use parameter-efficient supervised instruction tuning: freeze the base model/vision tower where supported and train selected LoRA adapter modules.**

Stack: PyTorch, Hugging Face Transformers, PEFT, Accelerate, and a compatibility-tested quantisation backend. The trainable parameter count, LoRA targets, precision, visual-token limit, and final recipe are recorded only after the smoke test.

### 28. Are you training a model from scratch?

**No. We are adapting one existing VLM with a lightweight adapter, not training a foundation model.**

The first committed training effort is one primary VLM adapter. A change-detector adaptation and a small fusion/task head are conditional experiments only if evaluation justifies them.

### 29. What is InternVL3.5-8B doing?

**It is the alternate VLM candidate, not a second mandatory model.**

We compare it only if Qwen fails a predefined capability, hardware, or benchmark gate, or if a targeted comparison is justified.

### 30. What is GeoChat doing?

**GeoChat is a remote-sensing single-image dialogue and grounding reference baseline.**

It is useful for comparison because it is remote-sensing oriented. It is not dismissed simply because of the name of a dataset; it must be assessed by supported input representation, tasks, adaptation path, and held-out performance.

### 31. What is TEOChat doing?

**TEOChat is a temporal language specialist candidate for ordered, multi-date remote-sensing questions.**

We first integrate/evaluate it. Adaptation is considered only if the evaluation and licence/compatibility review justify it.

### 32. What is BIT?

**BIT is the first candidate for bitemporal remote-sensing change detection, producing a pixel-level change mask rather than a prose explanation.**

It is a PyTorch implementation of a transformer-based remote-sensing change-detection approach. It will be benchmarked against the selected sensor profile and label definition; a different task-matched detector may replace it.

### 33. What is the segmentation component?

**A SAM-family optical baseline or a task-specific segmenter produces masks where the input representation and task support it.**

We do not assume a promptable segmentation model is SAR-capable. GIS converts a valid pixel mask to map coordinates and area.

### 34. What is RemoteCLIP doing?

**RemoteCLIP is optional image-text similarity or retrieval evidence; it is never presented as “the probability that the answer is correct.”**

Similarity can be informative but cannot verify spatial arithmetic, date alignment, or all factual claims.

### 35. What is optical–SAR fusion in your project?

**The initial version is evidence fusion: each valid branch produces structured observations and the system compares them.**

Later, a small learned fusion head may combine compatible optical/SAR features for a defined task. Directly injecting arbitrary learned embeddings into an LLM requires a controlled projector experiment and is not assumed to work.

### 36. Is multi-image VLM the same as native multispectral analysis?

**No. Multi-image capability means the VLM can receive multiple rendered views; raw multispectral arrays have physical band meanings that must be preserved.**

We provide labelled RGB/false-colour/SAR views to models while retaining original band arrays for deterministic geospatial processing.

## Training data and evaluation

### 37. What data will you use?

**Our main paired optical/SAR adaptation and evaluation route is BigEarthNet.txt and BigEarthNet v2, supplemented by VRSBench, RSVQA, CDVQA, and task-matched mask/change datasets.**

Dataset roles:

| Dataset | Role |
|---|---|
| BigEarthNet.txt | Paired Sentinel-1/Sentinel-2 image-text: captions, VQA, referring expressions |
| BigEarthNet v2 | Underlying imagery and land-cover labels |
| VRSBench | Captioning, VQA, referring-expression evaluation/training where permitted |
| RSVQA | Additional VQA benchmark with distinct task settings |
| CDVQA | Temporal question-answering evaluation; not automatically a mask dataset |
| Task-matched change/segmentation data | Pixel masks for the particular selected task |

All dataset versions, licences, manifests, scene/location splits, and preprocessing recipes are pinned before experiments.

### 38. How will you avoid data leakage?

**We split by scene/location before creating crops or multiple question examples.**

Sibling crops, alternate questions, or seasonal duplicates from the same location must not appear across train and evaluation splits.

### 39. How do you prove fine-tuning helped?

**We compare the frozen base model and adapted model on identical held-out scenes, then promote only if the target task improves without unacceptable regressions.**

There is no promised percentage in advance. Numeric acceptance targets are set after a baseline is measured and before the final checkpoint is selected.

### 40. How do you prove the model uses SAR instead of ignoring it?

**We compare optical-only, SAR-only, correctly paired optical/SAR, and deliberately shuffled or missing SAR inputs.**

If pairing does not produce a defensible benefit, we do not claim learned cross-modal fusion works.

### 41. What metrics will you report?

**We report task-appropriate metrics, not a single marketing score.**

VQA: official accuracy/normalisation; grounding: box IoU and recall; segmentation/change: IoU, precision, recall, F1; measurements: error against reference geometry/statistics; reliability: failure/latency/resource use; evidence: unsupported-claim rate and wrong-scene references. Calibration, if enabled, uses reliability curves and Brier/ECE—not an invented confidence label.

### 42. How will you test temporal change robustly?

**We include unchanged, seasonal, shifted, cloud-obscured, and genuinely changed pairs.**

A detector cannot pass on visually attractive examples alone. It must survive alignment and no-data checks and be interpreted with the original before/after imagery.

### 43. How will you handle hallucination?

**The answer composer can only cite stored evidence, measurements, and artifacts; unsupported claims are explicitly limited or abstained.**

We track unsupported-claim rate, missing evidence, disagreement between branches, valid coverage, and warnings. A fluent sentence is not treated as scientific proof.

### 44. Can you display “78% confidence”?

**Only after it has a defined, calibrated meaning for a specific task and data domain; initially we show coverage, quality, evidence agreement, warnings, and labelled model scores instead.**

## Feasibility, cost, and delivery

### 45. How much does fine-tuning cost?

**This is adapter fine-tuning, not foundation-model training: one representative run is expected to cost only a few hundred rupees of rented GPU time after the actual speed is profiled.**

The PRD illustration is 1,250 steps at a hypothetical 4–12 seconds per step: 1.4–4.2 GPU hours before overhead. A 24–48 GB rented GPU is roughly ₹50/hour; a 3–6 hour practical run is therefore approximately ₹150–₹300. A student experiment budget including smoke tests/retries can be ₹2,000–₹5,000.

### 46. What hardware do you need?

**The first 8B QLoRA feasibility range is a 24–48 GB GPU, but actual fit depends on image count, visual tokens, sequence length, precision, optimizer, and trainable modules.**

We begin with a smoke experiment, measure steady-state seconds per step, then estimate time using `optimizer_steps × measured_seconds_per_step + validation/checkpoint/preprocessing overhead`.

### 47. Is a working demo ready now?

**For the internal idea round, the architecture and proposed workflow are the deliverable; completed model training and end-to-end accuracy are not being claimed.**

Our staged plan is: M1 data/model/hardware verification; M2 one real optical workflow; M3 adapted VLM plus held-out evaluation; M4 temporal/masks; M5 optical–SAR evidence; M6 hardening and rehearsal.

### 48. Why is this feasible for students?

**We reduce risk by starting with one narrow end-to-end optical workflow and one adapter fine-tune, while using open geospatial tools and existing research baselines.**

We do not need to create a new foundation model or buy a permanent GPU. Complex modules are added only after their acceptance tests pass.

### 49. What is your MVP?

**Upload a valid Sentinel-2 scene, inspect metadata, ask a supported visual question, run one GIS measurement or index workflow, view the result on a map, and download a traceable artifact.**

This is intentionally narrower than the full optical/SAR/temporal vision and is measurable.

### 50. What are the biggest technical risks?

**The leading risks are incorrect imagery metadata/units, misregistration causing false change, the VLM ignoring SAR, data/licence constraints, and GPU memory/runtime limits.**

Controls: validation before analysis; co-registration checks; correct-vs-shuffled SAR ablations; pinned dataset licences/manifests; early GPU profiling; modular fallback candidates; explicit failure messages.

## Trust, safety, privacy, and implementation

### 51. How do you protect users from a wrong answer?

**We expose evidence, coverage, warnings, and source lineage; the system can abstain or return “completed with warnings” instead of hiding uncertainty.**

It is decision support, not an autonomous authority for emergency, legal, or safety-critical decisions.

### 52. How do you protect uploaded imagery and data?

**The shared deployment design uses project access controls, keeps secrets server-side, validates file signatures/readability, and records whether previews or metadata can leave the deployment.**

Text in filenames, metadata, and images is treated as data, not instructions for the planner.

### 53. What prevents prompt injection or arbitrary code execution?

**The planner can choose only registered tools with typed input/output contracts; free-form user text does not become shell code.**

Uploads and model outputs are schema-validated before they move to downstream components.

### 54. What happens if a task fails halfway?

**Jobs have explicit states—queued, validating, needs input, running, completed with warnings, failed, cancelling, cancelled—and persisted events.**

The user sees which step failed or was skipped. A partial result is never silently presented as complete.

### 55. What makes the design reproducible?

**Every analysis records source checksums, dataset/model/tool versions, preprocessing recipe, parameters, AOI, artifacts, and metrics.**

Changing data metadata, a processing recipe, or a model version creates a new run rather than overwriting scientific provenance.

## Technical stack at a glance

| Concern | Baseline technology | Purpose |
|---|---|---|
| Web UI | React, TypeScript, Vite, Tailwind CSS | Interactive analyst workspace |
| Map | MapLibre GL JS | Map layers, AOI selection, overlays |
| API | FastAPI + Pydantic | Typed contracts and validation |
| Workflow | Explicit Python DAG executor + tool registry | Bounded, inspectable execution |
| Async jobs | Worker abstraction; Celery/Redis when multi-worker | Keep long GIS/GPU work off request path |
| Live progress | Server-Sent Events | Durable trace/progress updates |
| Raster/GIS | Rasterio, GDAL, NumPy, PyProj, Shapely, GeoPandas | Raster I/O, indices, reprojection, polygons, measurements |
| Alignment | OpenCV + validated geospatial methods | Registration diagnostics/helpers |
| Raster tiles | rio-tiler/TiTiler-compatible adapter | Render browser-ready map tiles |
| ML training | PyTorch, Transformers, PEFT, Accelerate, quantisation backend | Reproducible adapter training |
| Inference | Transformers first; vLLM only after tests | Correctness before serving optimisation |
| Storage | Local filesystem in P1; S3-compatible adapter later | Large rasters/artifacts separate from metadata |
| Metadata | SQLite in local P1; PostgreSQL in shared deployment | Projects, scenes, analyses, events |
| Packaging/testing | Docker, Linux GPU environment, pytest, frontend/browser tests | Reproducible services and verification |

## High-value closing line

**SatQuery AI does not ask a model to “guess the Earth.” It validates the data, selects an appropriate workflow, performs spatial calculations deterministically, and makes every final claim traceable to evidence.**

## References to cite if a judge asks

- [Qwen3-VL official repository](https://github.com/QwenLM/Qwen3-VL)
- [GeoChat project](https://github.com/mbzuai-oryx/GeoChat)
- [TEOChat project](https://github.com/ermongroup/TEOChat)
- [BIT change-detection implementation](https://github.com/justchenhao/BIT_CD)
- [BigEarthNet v2](https://bigearth.net/)
- [VRSBench](https://github.com/lx709/RS-LLaVA)
- [RSVQA](https://rsvqa.github.io/)

