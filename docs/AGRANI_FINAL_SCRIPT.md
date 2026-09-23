# Agrani — current recording script

**Use only this script. All earlier Agrani scripts are superseded.**

## Message to send

> Hi Agrani! Please hold the previous script—we have changed the animation to a clean, dark sequence following a question and TIFF through the system. Record only the paragraphs below. Use a calm, clear technical voice, not a fast promotional read. Leave a short pause between sections. Send separate takes if possible, and a clean continuous WAV without music. We will match the animation to your delivery, so do not rush to a fixed duration.

## Delivery

Allow roughly 105–125 seconds at a comfortable pace. Read headings silently. Qwen: “kwen”; VL: “vee el”; GeoTIFF: “geo tiff”; GIS: “gee eye ess”; SAR: “sar”; BigEarthNet.txt: “Big Earth Net dot text”. Retake the complete sentence if you stumble.

The first seven sections explain the architecture. The last is explicitly the adaptation plan, not a claim of completed training. No on-screen logo, watermark, version label or corner caption appears in the recorded animation.

## 1. Query + image

How does a question become an answer? Our architecture brings the user's natural-language request and satellite imagery into one evidence-driven workflow.

## 2. Ingestion + validation

The ingestion layer reads the GeoTIFF's numerical bands and geospatial metadata, preserving the original data. Validation checks sensor information, dates and usable coverage. Paired analysis additionally requires spatial compatibility; a shared coordinate system alone is not enough.

## 3. Query understanding

Query understanding identifies the requested task and required evidence. A scene-description question needs one observation. Change analysis needs two dates; cross-modal analysis needs a compatible optical and radar pair.

## 4. Planning + execution

The orchestrator matches those requirements to a registry of specialist models and geospatial tools. It builds the smallest valid workflow. Application code checks allowed parameters and dependencies, while missing inputs trigger clarification rather than an unsupported analysis.

## 5. Models + GIS

Specialist models provide visual and semantic interpretation. GIS tools handle numerical operations. For example, an area estimate comes from a georeferenced mask and valid pixel areas, not from a language model guessing a number.

## 6. Evidence engine

The evidence engine links each conclusion to its source and supporting output. It checks coverage and records conflicting sensor evidence. Model confidence, data quality and agreement are distinct signals; they are not combined into an arbitrary accuracy percentage.

## 7. Answer + trace

The user receives a plain-language answer, relevant visual evidence and an execution record: which observations, models, tools and parameters produced the result.

## 8. Model development

Our adaptation plan starts with Qwen three V L, an eight-billion-parameter backbone, using parameter-efficient tuning and BigEarthNet dot txt. Candidate versions are evaluated on held-out tasks, including base-versus-adapted and single-versus-paired comparisons. These development tests determine which versions enter the registry. At runtime, the orchestrator selects by task and sensor compatibility.

