# SatQuery AI — Prototype + Final Presentation Handoff

## Situation

The team has **passed its college internal SIH round** for the SIH 2026 problem statement `SIH26167` (ISRO/SAC). The next submission needs:

- A clear **5-minute video**.
- A concise final **PPT/PDF** for the SIH portal.
- Ideally a convincing working prototype or proof of the key workflow.

Act as a demanding SIH evaluator, product-design lead, and technical presentation coach. Be honest: do not invent accuracy numbers, a trained adapter, model results, sensor support, deployment, or data access that the team has not verified.

## Product: SatQuery AI

### One-sentence description

SatQuery AI turns natural-language Earth-observation questions into **validated geospatial workflows**, then returns answers linked to maps, masks, polygons, measurements, warnings, and an execution trace.

### Strongest USP

> From question to geospatially verified evidence—not just an AI-generated answer.

SatQuery is not merely a satellite-image chatbot. Before analysis it validates bands, CRS, dates, overlap, alignment, no-data/cloud coverage, and—where relevant—SAR product conditions. Models interpret imagery; GIS calculates coordinates, areas, indices, and map-aligned artifacts. The final answer cites evidence and limits rather than inventing confidence.

### Non-negotiable wording / scientific guardrails

- Do **not** say this is the first satellite AI, the first geospatial agent, or that there are no existing solutions.
- Do **not** say that the team trained a foundation model.
- One primary VLM **adapter fine-tuning experiment is planned**, not completed unless independently verified.
- Do **not** show a made-up accuracy or “78% confidence.” Show coverage, warnings, evidence agreement, and explicitly labelled model scores until calibration exists.
- A GeoTIFF does not guarantee a sensor, number of bands, dates, valid CRS, or alignment.
- Multi-image VLM ≠ native multispectral model. Feed labelled renderings to VLMs; preserve raw arrays for GIS/specialist tools.
- SAR does not automatically prove flooding; dark SAR can have multiple causes.
- Satellite resolution limits object-level claims. Do not imply Sentinel-2 can inspect every bridge or building.

## Architecture — seven clear layers

```text
Question + satellite files
        ↓
1. UI: upload scenes, labels, AOI, natural-language query
2. Ingestion: validate CRS, bands, dates, units, quality, alignment
3. Query understanding: create structured task intent
4. Planner/executor: smallest valid, bounded tool workflow
5. Analysis: GIS + VLM/change/segmentation branches as required
6. Evidence engine: cross-check, coverage, conflicts, uncertainty
7. Answer/trace: explanation + layers + measurements + audit trail
```

Key phrase: **“Models interpret evidence; GIS performs coordinate and measurement calculations.”**

## Current model / dataset baseline

| Role | Candidate / tool | Exact role and status |
|---|---|---|
| Primary VLM | `Qwen/Qwen3-VL-8B-Instruct` | Preferred multi-image visual dialogue candidate; planned parameter-efficient remote-sensing instruction adaptation |
| Alternate VLM | InternVL3.5-8B | Compare only if primary fails gate |
| Remote-sensing baseline | GeoChat | Single-image dialogue/grounding comparison baseline |
| Temporal candidate | TEOChat | Integrate/evaluate first; adaptation only if justified |
| Change detection | BIT or task-matched detector | Pixel-level change mask candidate; exact checkpoint/dataset not fixed |
| Segmentation | SAM-family optical baseline or task-specific segmenter | Produce masks when suitable; do not assume SAR competence |
| Optional similarity | RemoteCLIP | Retrieval/similarity signal, never answer-correctness probability |
| Fusion | Evidence fusion first; learned task head later | See below |

Data candidates: BigEarthNet.txt + BigEarthNet v2 for paired Sentinel-1/Sentinel-2; VRSBench and RSVQA for VQA/captioning/grounding; CDVQA for temporal QA; task-specific masks for change/segmentation.

## Fusion explanation

### Practical first version: evidence fusion

```text
Optical: RGB/false colour, NDVI/NDWI, cloud/no-data mask ─┐
                                                          ├─ evidence composer ─ final answer + map + warnings
SAR: calibrated VV/VH, SAR-specific change evidence ─────┘
                       ↓
            GIS common grid, polygons, area, coverage
```

The system does not blindly concatenate pixels. It validates whether scenes can be compared, then keeps each sensor’s evidence separate and reports agreement/conflict. Example: “Optical and SAR evidence agree over X% of valid area; cloud pixels were excluded.”

### Research extension: learned fusion

```text
Optical encoder ─┐
                 ├─ projector/cross-attention/small fusion head ─ task mask/class
SAR encoder ─────┘
```

Only introduce this after paired-data evaluation. Prove actual SAR use with optical-only vs SAR-only vs correctly paired vs shuffled/missing-SAR tests.

## What competitors / prior SIH presentations demonstrate

Two YouTube references seen in the prior task:

1. [TerraQuery (SatQuery AI) | SIH26167 | Team HEXEON](https://youtu.be/zQSg6CavVhU?si=P9Pyv4R8a5yqUIX9)
   - A ~5:55 SIH-template pitch/demo.
   - Strong on a continuous dashboard/UI story, agentic workflow, VQA/change/multimodal/GIS explanation, tech stack, feasibility, impact and sources.
   - Looks stronger because it shows an apparently functional product and a consistent story.

2. [SatQuery AI – SIH 2026 Working Prototype](https://youtu.be/4ls2ynt7FZc?si=bvrPsABc4Iyk1Bea)
   - A ~2-minute working-UI demo.
   - Shows analyst query panel, map, detection layers, comparison, evidence matrix, reports and activity.

Lessons to take—not copy:

- Start with a human decision/problem, not a list of models.
- Use one uninterrupted user journey rather than unrelated screen tours.
- Show output on a map and make the evidence easy to see.
- Use diagrams and readable UI labels; avoid dense paragraphs and a dark “code demo” feeling.
- Be more scientifically careful than them: say what is real, what is planned, and what the system cannot conclude.

## Existing solutions: honest positioning

- Google Earth Engine, QGIS and ArcGIS already provide strong data, GIS, analysis and ML capabilities.
- GeoChat and related remote-sensing VLMs already support image dialogue/grounding.
- OpenEarthAgent is a close research precedent for tool-augmented geospatial agents.

Do not claim SatQuery replaces those. Say:

> “SatQuery packages a constrained, sensor-aware, evidence-linked workflow around the gap between expert GIS tools and fluent but ungrounded AI interpretation.”

## Prototype recommendation — do this, not a UI-only mockup

Build **one genuinely working vertical slice**. A UI-only prototype will look polished but will not prove the core claim.

### Minimum credible demo: P1 optical workflow

1. Upload/select two prepared, real Sentinel-2 Level-2A GeoTIFF scenes of the same AOI and different dates.
2. Show actual metadata inspection: scene/date/bands/CRS/validity.
3. Ask a constrained query: “Compare vegetation-index change in this region between these dates.”
4. Run real deterministic processing: validation → common grid/alignment check → NDVI calculation → difference raster / thresholded candidate area → GIS area/coverage calculation.
5. Show map layer, before/after comparison, actual output values, warnings, and execution trace.
6. Offer a PDF/GeoJSON/CSV style export or a visible artifact list if time permits.

This proves the product’s real USP better than an unverified fine-tuned model.

### Add exactly one real model only if it is stable

Use a pretrained VLM only for a constrained, clearly-labelled task such as “Describe the observable land-cover evidence in this image.” Label it as a **baseline/pretrained model**—not as the team’s fine-tuned remote-sensing model.

Do not let an unstable model become the centre of the video. The real GIS workflow should be the hero. If the model integration is not robust, show it as a separate “research validation in progress” screen and do not fake its output.

### Best video narrative (about 5 minutes)

| Time | Story beat |
|---|---|
| 0:00–0:25 | Decision-maker problem: imagery exists but valid answers require specialist knowledge and disconnected tools. |
| 0:25–0:45 | One-line solution + USP: question to validated geospatial evidence. |
| 0:45–3:25 | Live vertical-slice workflow: upload → validation → query → plan/trace → actual map result → measurement/warning. |
| 3:25–4:05 | Explain why it is trustworthy: models interpret; GIS measures; evidence and limits are visible. |
| 4:05–4:35 | Show architecture, optical/SAR/temporal roadmap and evidence-fusion strategy. |
| 4:35–5:00 | Impact, feasibility, why now, and a strong close. |

## Existing final visual assets

Use these as source material or reference images; do not blindly embed every image into the final PPT. The official final submission should remain readable, consistent, and editable where possible.

### Preferred detailed slide visuals

- `C:\Users\makew\OneDrive\Desktop\SatQueryAI\output\sih2026_slide_images_v2_detailed\01_proposed_solution_detailed.png`
- `C:\Users\makew\OneDrive\Desktop\SatQueryAI\output\sih2026_slide_images_v2_detailed\02_technical_approach_7_layers.png`
- `C:\Users\makew\OneDrive\Desktop\SatQueryAI\output\sih2026_slide_images_v2_detailed\03_feasibility_viability_detailed.png`
- `C:\Users\makew\OneDrive\Desktop\SatQueryAI\output\sih2026_slide_images_v2_detailed\04_impact_benefits_detailed.png`
- `C:\Users\makew\OneDrive\Desktop\SatQueryAI\output\sih2026_slide_images_v2_detailed\05_research_references_detailed.png`

### Earlier cleaner set

- `C:\Users\makew\OneDrive\Desktop\SatQueryAI\output\sih2026_slide_images\01_proposed_solution.png`
- `C:\Users\makew\OneDrive\Desktop\SatQueryAI\output\sih2026_slide_images\02_technical_approach.png`
- `C:\Users\makew\OneDrive\Desktop\SatQueryAI\output\sih2026_slide_images\03_feasibility_viability.png`
- `C:\Users\makew\OneDrive\Desktop\SatQueryAI\output\sih2026_slide_images\04_impact_benefits.png`
- `C:\Users\makew\OneDrive\Desktop\SatQueryAI\output\sih2026_slide_images\05_research_references.png`

## Existing supporting documents

- Product requirements / source of truth: `C:\Users\makew\OneDrive\Desktop\SatQueryAI\SATQUERY_PRD.md`
- Architecture handout: `C:\Users\makew\OneDrive\Desktop\SatQueryAI\SATQUERY_ARCHITECTURE_HANDOUT.md`
- Judge FAQ and technical brief: `C:\Users\makew\OneDrive\Desktop\SatQueryAI\JUDGE_FAQ_AND_TECHNICAL_BRIEF.md`

## Ask for the new conversation

Read the three documents above before proposing changes. First act as a strict SIH judge: identify the three most convincing elements and the three dangerous weak points in the current plan. Then propose a detailed, buildable P1 prototype plan that demonstrates a real optical workflow; favour real GeoTIFF validation and GIS results over fake AI. After that, help create a 5-minute video storyboard and an official, concise final presentation. Clearly label every planned versus implemented capability.
