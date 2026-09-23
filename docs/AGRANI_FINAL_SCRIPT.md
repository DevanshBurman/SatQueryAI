# Agrani — current recording script

**Use only this script. All earlier Agrani scripts are superseded.**

## Message to send

> Hi Agrani! Please hold the previous script—we have changed the animation to a clean, dark sequence following a question and TIFF through the system. Record only the paragraphs below. Use a calm, clear technical voice, not a fast promotional read. Leave a short pause between sections. Send separate takes if possible, and a clean continuous WAV without music. We will match the animation to your delivery, so do not rush to a fixed duration.

## Delivery

Allow roughly 130–145 seconds at a comfortable pace. The animation defaults to 135 seconds and can be fitted to your voice take. Read headings silently. Qwen: “kwen”; VL: “vee el”; GeoTIFF: “geo tiff”; GIS: “gee eye ess”; SAR: “sar”; BigEarthNet.txt: “Big Earth Net dot text”. Retake the complete sentence if you stumble.

The first seven sections explain the architecture. The last is explicitly the adaptation plan, not a claim of completed training. No on-screen logo, watermark, version label or corner caption appears in the recorded animation.

## 1. Query + image

How does a question become an answer? Our architecture brings the user's natural-language request and satellite imagery into one evidence-driven workflow.

## 2. Ingestion + validation

The ingestion layer reads the GeoTIFF's numerical bands and geospatial metadata, preserving the original data. Validation checks sensor information, dates and usable coverage. Paired analysis additionally requires spatial compatibility; a shared coordinate system alone is not enough.

## 3. Query understanding

Query understanding identifies the requested task and required evidence. A scene-description question needs one observation. Change analysis needs two dates; cross-modal analysis needs a compatible optical and radar pair.

## 4. Planning + execution

The orchestrator uses the task and validated metadata to select a compatible model or tool from the capability registry. Here, scene description selects the visual-language model. It orders the required steps, checks their inputs and parameters, and passes each output to the next step.

## 5. Models + GIS

Models interpret the imagery, while geospatial tools calculate measurements when needed. For an area question, the system sums the ground areas of valid pixels inside a mask. On a ten-metre square grid, one hundred selected pixels represent one hectare. The result retains the mask, method and excluded regions.

## 6. Evidence engine

The evidence engine connects each claim to the observation and output that support it. It keeps usable coverage, model confidence and agreement between sensors as separate signals. Missing coverage or conflicting evidence is carried into the answer as a limitation.

## 7. Answer + trace

The user receives a plain-language answer, relevant visual evidence and an execution record: which observations, models, tools and parameters produced the result.

## 8. Model development

Our adaptation plan starts with Qwen three V L, an eight-billion-parameter backbone, using parameter-efficient tuning and BigEarthNet dot txt. Candidate versions are evaluated on held-out tasks, including base-versus-adapted and single-versus-paired comparisons. These development tests determine which versions enter the registry. At runtime, the orchestrator selects by task and sensor compatibility.
