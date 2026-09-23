# Architecture animation — editor handoff

## Use these files

- Narration: `AGRANI_FINAL_SCRIPT.md`. Every spoken paragraph is verified against the embedded browser script.
- Browser: `/agrani-motion.html` (redirects to the current implementation). Filenames may retain v2 internally; no version marks or branding appear in the frame.
- Standalone assets: `public/agrani-motion-v2.html`, `.css`, `.js` together in one folder. No external assets or network libraries required.

## Capture

Use 1920 × 1080, 30 or 60 fps. Record view provides a three-second countdown and hides all controls. Trim the countdown. Disable cursor capture. Captions default OFF. Keep the tab visible.

Space plays/pauses; R restarts; arrows seek; Escape leaves fullscreen. Local audio upload and Fit to voice scale the timeline. For precise sync, record chapters separately and extend still holds in the editor. Use Agrani's original audio, not doubled browser audio. No decorative labels or technical footnotes over the footage.

Clean link: `/agrani-motion-v2.html?clean=1&autoplay=1`. Pause at a cue with `?clean=1&t=38`. Overall duration can be changed with `&duration=115`.

## Cue sheet

| Base time | Focal action | PPT mapping |
|---|---|---|
| 0–9 | Short question types; TIFF joins it | Interface |
| 9–22 | File → ingestion → validation; metadata checks follow | Ingestion & validation |
| 22–32 | Question → task and required inputs | Query understanding |
| 32–46 | Orchestrator selects scene-description capability from registry | Planner & executor |
| 46–58 | Models interpret; a separate area-calculation example shows valid mask × pixel area | Models & GIS |
| 58–71 | Sources + outputs → evidence engine; coverage, agreement, uncertainty | Evidence engine |
| 71–80 | Abstract answer and auditable trace | Answer & trace |
| 80–103 | Candidate VLM + adaptation; evaluation gates registry entry | Model-development plan |

The area example illustrates how numerical evidence is calculated when requested; the opening scene-description question does not require an area measurement. Abstract rasters and answer lines are diagrams, not purported inference outputs. Use actual application footage for demonstrated results.

## Scientific points retained for discussion

- NDWI is a GIS operation within the analysis layer, not a separate mandated AI specialist. It is no longer the animation's main route.
- Original GeoTIFF arrays and metadata are preserved; display images do not replace physical measurements.
- Registry selection is constrained by task, sensor support and valid inputs. Model version selection happens through development evaluation, not online benchmarking per question.
- Coverage, sensor agreement and calibrated model confidence are distinct; no arbitrary global accuracy score is presented.
- PRD sections 6 and 8 define the target design. The current implementation's keyword routing and configured visual backend are not silently replaced by this animation.
- Qwen3-VL-8B remains a candidate for parameter-efficient adaptation. BigEarthNet.txt supports paired supervision. VRSBench/RSVQA and CDVQA are applicable evaluation resources. Preserve test splits and assess modality dependence with ablations. No completed training, superiority, or benchmark numbers are claimed.

Sources: SATQUERY_PRD.md; detailed seven-layer technical slide; https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct ; https://txt.bigearth.net/ .
