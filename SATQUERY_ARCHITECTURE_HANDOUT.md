# SatQuery AI Architecture Handout

## Purpose

This handout explains what SatQuery AI is building, why a generic image chatbot is insufficient, and how the major remote-sensing terms fit together. It is written for BTech AIML teammates and can later be adapted into the PRD.

## The Product in One Sentence

SatQuery AI is a sensor-aware, agentic geospatial assistant. A user uploads satellite imagery, asks a question in natural language, and SatQuery validates the files, selects the right remote-sensing workflow, runs specialist analysis, and returns an answer with visual evidence and an execution trace.

It is not simply:

```text
Satellite screenshot -> chatbot answer
```

It is:

```text
GeoTIFF/TIFF + user question
  -> validate sensor, location, bands, dates, and alignment
  -> choose a valid specialist workflow
  -> run GIS tools and AI models
  -> return text, map evidence, uncertainty, and trace
```

## What the SIH Problem Requires

The final system must cover these capabilities:

1. Single-image visual question answering (VQA).
2. One additional single-image task: captioning/scene description or text-guided grounding.
3. Multitemporal change understanding from images of the same place at different dates.
4. Cross-modal analysis of a co-registered optical/multispectral image and SAR image.
5. Agentic orchestration: automatically select, sequence, and execute the appropriate tools/models.
6. Remote-sensing adaptation or fine-tuning of at least one visual or vision-language component.
7. Evidence, confidence information, and an observable execution summary.

The official problem statement identifies BigEarthNet.txt as the primary data source for multisensor image-text adaptation, alongside VRSBench, RSVQA, and CDVQA for evaluation.

## Essential Vocabulary

### GeoTIFF

A GeoTIFF is not just an image. It is a satellite raster file with geographic and sensor metadata attached.

It can contain information such as:

- where on Earth the pixels belong;
- when the image was acquired;
- pixel resolution, for example one pixel equals two metres on the ground;
- sensor bands, such as Red, Green, Blue, and Near Infrared;
- coordinate system and map transform;
- missing-data pixels.

### Optical and multispectral imagery

Optical imagery is camera-like imagery based on reflected sunlight. Multispectral imagery contains additional channels beyond ordinary RGB, for example Near Infrared (NIR). Those bands enable calculations such as vegetation and water indices.

### SAR

SAR means Synthetic Aperture Radar. It is active sensing: the satellite transmits microwave energy and measures what returns.

- It can operate at night and through cloud cover.
- Its bright and dark values describe radar backscatter, not ordinary colour.
- A SAR image should not be treated as a normal greyscale photograph.

### Co-registered images

Two images are co-registered when the same pixel location refers to the same real-world location in both images. This is essential for valid optical-SAR comparison and before/after change analysis.

### VLM

A Vision-Language Model receives an image and text, then produces text or structured visual-language output.

```text
image + question -> answer
```

### VQA

Visual Question Answering means answering a question about an image.

Example:

```text
Question: Is this region mostly urban or agricultural?
Answer: Predominantly agricultural, with scattered built-up patches.
```

Remote-sensing VQA is VQA trained or adapted for overhead imagery, remote-sensing terms, land-cover patterns, and possibly SAR or multispectral data.

### Captioning

Captioning describes an entire image.

```text
This scene contains agricultural fields, a river corridor, and dense urban development in the west.
```

### Grounding

Grounding locates an object or region named by the user.

```text
Question: Highlight the water body in the northeast.
Output: Text answer plus a bounding box, polygon, or mask overlay.
```

### Segmentation

Segmentation labels relevant pixels.

```text
Question: Show flooded areas.
Output: A flood mask whose pixels identify likely flooded land.
```

### Feature extraction and fusion

Feature extraction converts imagery into numerical representations useful for models.

```text
Optical image -> colour, vegetation, land-cover features
SAR image     -> backscatter, texture, structure features
```

Fusion combines evidence or learned features from both sensors.

```text
Optical says: possible water, but clouds obscure the scene.
SAR says: low backscatter consistent with standing water.
Fusion says: water is likely; SAR is the stronger evidence in cloudy areas.
```

## Why Generic Flagship Models Are Not the Whole System

A strong frontier VLM can often describe an RGB satellite preview, compare visible images, understand the user question, write code, and choose tools. It is useful as an orchestrator and explanation layer.

However, a generic VLM alone does not reliably:

- read GeoTIFF coordinates, sensor metadata, or original band values;
- preserve NIR, SWIR, raw SAR, and other non-RGB signals;
- align images before measuring change;
- produce a reliable geospatial mask, polygon, or area statistic;
- provide calibrated scientific confidence;
- guarantee accurate fine-grained spatial localization;
- create a reproducible evidence trail.

SatQuery makes a powerful language model useful for remote sensing by connecting it to the specialist tools that actually inspect and measure imagery.

## The SatQuery Architecture

```text
User interface
  -> Geospatial ingestion and validation
  -> Query-to-workflow controller
  -> Specialist model and GIS tool registry
  -> Evidence fusion and confidence estimation
  -> Answer, overlays, report, and execution trace
```

### 1. User interface

The user uploads imagery, confirms dates/sensors when needed, asks a question, and views:

- result text;
- image/map overlays;
- masks or bounding boxes;
- before/after comparison;
- confidence and warnings;
- a live execution trace;
- downloadable report.

Suggested stack: React, TypeScript, Tailwind CSS, MapLibre or Leaflet, and Server-Sent Events for live trace updates.

### 2. Geospatial ingestion and validation

Before running models, SatQuery reads and validates:

| Check | Plain-English reason |
|---|---|
| CRS / coordinate reference system | Knows how pixels map to real locations on Earth. |
| Affine transform | Converts pixel positions to map coordinates. |
| Geographic bounds | Confirms which area each image covers. |
| Pixel resolution | Knows the ground size represented by a pixel. |
| Band identities | Knows whether a file contains RGB, NIR, SAR, and so on. |
| NoData values | Avoids analysing blank/corrupt/missing pixels. |
| Acquisition date | Needed for before/after questions. |
| Sensor/modality | Distinguishes optical, multispectral, and SAR workflows. |
| Overlap and alignment | Prevents false change detection from unrelated or shifted images. |

The preprocessing stage may perform reprojection, resampling, co-registration, cloud masking, SAR backscatter calibration, speckle filtering, preview creation, band normalization, and sensor-valid derived indices.

Important: indices must be sensor-aware. For example, Cartosat-2S MX has four bands, not every possible multispectral band. Do not promise an index that needs a band unavailable on the input sensor.

Suggested stack: Rasterio, GDAL, NumPy, Xarray/Rioxarray, PyProj, OpenCV, GeoPandas, and Shapely.

### 3. Query-to-workflow controller

The controller turns a natural-language request into a valid typed plan.

Simple cases can use deterministic routing:

```text
One image + "describe this image" -> captioning
One image + "highlight water" -> grounding or segmentation
Two dates + "what changed?" -> temporal-change workflow
```

Complex or ambiguous requests should use a strong LLM API to return structured output, not free-form internal reasoning.

Example query:

> The optical image is cloudy. Has flooding expanded near settlements since the earlier date? Use radar wherever optical evidence is unreliable.

Example plan:

```json
{
  "intent": "temporal_cross_modal_flood_assessment",
  "inputs_required": ["optical_t1", "sar_t1", "optical_t2", "sar_t2"],
  "subtasks": [
    "validate_alignment",
    "measure_optical_cloud_coverage",
    "estimate_water_extent_t1",
    "estimate_water_extent_t2",
    "compare_water_extent",
    "cross_validate_with_sar",
    "intersect_with_settlements"
  ],
  "outputs": ["flood_mask", "changed_area", "plain_language_answer"],
  "uncertainty_policy": "flag_optical_cloud_conflict"
}
```

Normal application code validates that this plan is allowed before executing it.

### 4. Specialist tool registry

The controller needs a catalog describing the tools it is allowed to call.

Each tool should declare:

- supported input modalities;
- required bands;
- supported tasks;
- model version;
- expected output schema;
- compute requirements;
- failure conditions;
- evaluation results.

Example:

```text
Tool: Flood segmentation model
Accepts: Optical image with Green and NIR bands
Does: Produces a water/flood mask
Returns: Mask, probability map, area statistic
Rejects: Missing NIR or excessive cloud cover
```

This prevents an LLM from selecting a tool that cannot validly process the uploaded image.

### 5. Specialist analysis components

The SIH scope describes four capability areas. They do not require exactly four separate models.

| Capability | Recommended internal approach |
|---|---|
| Single-image VQA, captioning, grounding | One RS-adapted VLM can cover several of these tasks. |
| Temporal change | Change detector for masks plus a temporal VLM/tool for semantic explanation. |
| Optical-SAR analysis | Separate optical and SAR encoders/tools plus evidence or feature fusion. |
| Orchestration | Strong LLM/controller plus deterministic validation and a tool registry. |

The recommended product experience is one unified assistant. Internally, it remains modular because different tasks need different evidence.

### 6. Evidence and confidence engine

Do not equate a single CLIP similarity score with probability that an answer is correct.

RemoteCLIP is useful for remote-sensing image-text similarity, retrieval, classification, and compatibility scoring. It is not itself a chat model, grounding model, temporal model, or fully calibrated confidence estimator.

A future SatQuery confidence score should combine:

```text
input quality
+ task-model score
+ spatial validity
+ optical/SAR agreement
+ temporal stability
+ image-answer semantic compatibility
```

The final score should be calibrated on held-out validation data. Until then, call a raw RemoteCLIP result a "semantic compatibility score," not a percentage probability of correctness.

### 7. Answer and trace composer

The final language model should explain structured evidence returned by the specialist tools. It must not invent measurements or causal explanations unsupported by the analysis.

Example evidence object:

```json
{
  "flooded_area_hectares": 42.7,
  "affected_regions": ["eastern floodplain"],
  "optical_evidence": "cloud-obscured in 31% of the target area",
  "sar_evidence": "low backscatter consistent with standing water",
  "agreement": "high",
  "warnings": ["optical-only result would be unreliable in cloud-covered pixels"]
}
```

The execution trace should show task selected, input checks, models/tools used, key parameters, warnings, timings, and produced artifacts.

## Current Model Candidates: What They Do and Do Not Do

| Candidate | Good for | Important limitation |
|---|---|---|
| BLIP-2 | Generic single-image captioning and VQA baseline | Usually expects standard RGB input; not natively a raw SAR, multispectral, temporal, or grounding solution. |
| GeoChat | Remote-sensing single-image VQA, captioning, region dialogue, and grounding | Original visual pipeline is built around standard visual encoder assumptions; do not claim it natively accepts raw multi-band GeoTIFF or calibrated SAR without adaptation and validation. |
| RemoteCLIP | RS image-text similarity, retrieval, zero-shot classification, compatibility signal | Does not generate full VQA answers, temporal explanations, or masks. |
| TEOChat | Temporal Earth-observation reasoning over ordered images | Strong candidate for change description/change-VQA; does not remove the need for explicit SAR/multispectral handling and fusion validation. |

## One VLM or Multiple Models?

### Baseline

One generic VLM can start the single-image demo:

```text
RGB preview + question -> answer
```

This is not enough for the final required scope.

### Recommended final architecture

```text
RS-adapted VLM
  -> single-image VQA, captioning, grounding

Temporal/change component
  -> T1/T2 masks and temporal explanation

Optical-SAR analysis component
  -> separate modality evidence and fusion

GIS/preprocessing tools
  -> bands, indices, metadata, alignment, measurements

Controller LLM
  -> query understanding, workflow planning, explanation
```

### Ambitious research direction

An eventual single unified multisensor VLM could use:

```text
Optical/multispectral encoder --+
                              +-> fusion adapter -> language model
SAR encoder ------------------+
                              +-> temporal memory / grounding head
```

This is an excellent long-term target, but it requires substantial paired data, model design, and evaluation. It should be presented as the advanced evolution of the modular system, not as a trivial prompt-engineering change.

## BigEarthNet.txt: Why It Matters

BigEarthNet.txt is a remote-sensing image-text dataset, not a single ordinary text file. It contains co-registered Sentinel-1 SAR imagery, Sentinel-2 multispectral imagery, and diverse text annotations.

It helps teach a model associations such as:

```text
optical pattern + SAR pattern + text
-> agricultural land
-> dense urban area
-> water body
-> vegetation in a named region
```

For the final system, the preferred adaptation approach is:

```text
capable base VLM
+ BigEarthNet.txt samples
+ LoRA / QLoRA adaptation
-> SatQuery RS-adapted VLM
```

This does not mean training a model from zero. It means parameter-efficiently adapting a capable existing model to the remote-sensing domain.

## Common Questions and Direct Answers

### Is SatQuery claiming that no solution exists?

No. Existing work includes GeoChat, TEOChat, RS-Agent, GeoPilot, and commercial geospatial AI systems. SatQuery's claim should be that it integrates the specific SIH-required capabilities into one auditable, sensor-aware workflow for the stated evaluation setting.

### Can a flagship general AI do this alone?

It can understand requests, inspect visible RGB previews, plan workflows, write code, and explain outputs. It cannot by itself replace raw geospatial processing, sensor-aware measurement, change masks, original-band analysis, calibrated confidence, and reproducible spatial evidence. SatQuery turns a strong LLM into a useful EO assistant by connecting it to those specialist capabilities.

### Is a few-billion-parameter model enough for routing?

For a narrow, trained intent classifier with a fixed label set, often yes. For ambiguous, compound, high-stakes user requests, use a strong LLM API initially and require structured output. The controller call is comparatively cheap because it does not perform the heavy pixel-level analysis.

### What is the difference between a change detector and change-VQA?

A change detector identifies where pixels changed. Change-VQA explains what changed in language. A good SatQuery workflow uses spatial change evidence plus semantic interpretation; a mask alone cannot reliably tell the user whether a building, vegetation, flood boundary, or seasonal pattern caused the difference.

### Why not simply convert every image to RGB?

RGB previews are useful for human viewing and generic VLM baselines, but they discard non-visible information. NIR enables vegetation/water analysis, SWIR enables other indices, and SAR contains radar backscatter information. SatQuery should retain raw sensor data for GIS and specialist models even if it creates an RGB preview for the UI.

## PRD-Ready Positioning

Use this as a strong but defensible product statement:

> SatQuery AI is an agentic remote-sensing assistant that converts natural-language questions into validated, sensor-aware workflows across optical, SAR, and temporal imagery. Instead of relying on one generic vision-language model, it selects specialist models and geospatial tools, combines their evidence, and returns an explainable answer with visual overlays, uncertainty indicators, and an auditable execution trace.

Avoid unsupported claims such as:

- "the only solution in the world";
- invented accuracy or confidence percentages;
- unmeasured latency, GPU, or fine-tuning claims;
- claiming raw multispectral/SAR support before it is implemented and tested.

Use ambitious future-tense claims instead:

- "Our goal is to reduce multi-tool satellite-analysis workflows from days to minutes.";
- "SatQuery will expose cross-sensor disagreement rather than hide uncertainty.";
- "We are building an agentic control plane for Earth-observation intelligence.".

## Primary References

- SIH 2026 SatQuery AI problem statement: https://sih.gov.in/sih2026PS
- GeoChat: https://github.com/mbzuai-oryx/GeoChat
- TEOChat: https://github.com/ermongroup/TEOChat
- RemoteCLIP: https://github.com/ChenDelong1999/RemoteCLIP
- BigEarthNet.txt: https://txt.bigearth.net/
