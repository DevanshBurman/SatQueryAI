# Agrani — architecture narration V2

**SUPERSEDED. Do not record this file. Use AGRANI_FINAL_SCRIPT.md instead.**

Message to send:

> Hi Agrani! We revised the animation to follow your explanation. Please use only this V2 script. Read naturally and confidently, with a short pause between sections. Do not rush to match a stopwatch; we will edit the visuals around your voice. Please send a clean WAV without music or effects. Separate takes for each section would help, plus a continuous take if convenient. Thank you!

Aim for approximately 103–120 seconds. Say Qwen as “kwen”, VL as “vee el”, SAR as “sar”, GIS as “gee eye ess”, and BigEarthNet.txt as “Big Earth Net dot text”. Leave one second of silence at each end. Read only the paragraphs below, not headings. The model-development paragraph is a plan; do not change it to a completed training claim or add accuracy percentages.

## 1. The question

SatQuery is designed around a simple distinction: language interprets the request, specialist models interpret imagery, and geospatial tools perform measurements. Consider a question about changing water extent.

## 2. Validate

First, the system checks acquisition dates, spectral bands, geographic overlap and alignment. Matching coordinate systems alone do not guarantee aligned pixels. Missing evidence triggers clarification.

## 3. Orchestrate

The orchestrator converts the request into a structured plan. It selects compatible capabilities from a predefined registry, while application code enforces input requirements, permitted parameters and execution order.

## 4. Execute

For this water example, the workflow extracts spectral water candidates, compares corresponding pixels and measures spatial change. Temporal specialists support semantic change questions; they do not replace numerical measurement.

## 5. Change the plan

Change the question to optical and radar analysis, and the workflow changes. Each sensor contributes its own evidence. The design checks agreement and exposes conflicts instead of assuming that two images mean reliable fusion.

## 6. Verify

The evidence engine connects conclusions to source observations, spatial outputs and execution parameters. Coverage and uncertainty remain visible. Confidence must be evaluated, not inferred from how fluent an answer sounds.

## 7. Adapt

Our model-development plan starts with Qwen three V L, an eight-billion-parameter backbone, using parameter-efficient remote-sensing adaptation. BigEarthNet dot txt supports paired optical and radar supervision. Temporal and segmentation specialists are evaluated separately, rather than training every component from scratch.

## 8. Evaluate

Candidate versions are compared on held-out tasks before entering the registry. Base-versus-adapted and single-versus-paired tests measure what each component contributes. At runtime, selection follows task and sensor compatibility.

## 9. Seven layers

Seven layers, one objective: turn a natural-language question into an inspectable chain of evidence.
