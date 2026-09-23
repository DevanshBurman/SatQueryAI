# V2 recording and technical handoff

> SUPERSEDED: use AGRANI_FINAL_RECORDING.md and AGRANI_FINAL_SCRIPT.md. This is an archived reference.

Send `AGRANI_SEND_THIS_V2.md` to Agrani. Open `/agrani-motion-v2.html`; the original `/agrani-motion.html` redirects here. This is the proposed architecture explainer, not a recording of executed model calls. No production routing code was changed.

## Recording

Capture 1920 × 1080 at 30 or 60 fps. Use **Record view · 3s** for fullscreen without controls. Trim the countdown; disable cursor capture. Space toggles playback, R restarts, arrows seek, Escape leaves fullscreen. Keep the tab visible.

Optional local voice upload and **Fit to voice** scale the 103-second timeline. For exact timing, record chapters separately and extend their still holds in the editor. Use the original WAV in the edit; do not double browser audio. Captions are off by default. Quiet music, no distracting sound effects.

Clean view: `/agrani-motion-v2.html?clean=1`. Autoplay: `?clean=1&autoplay=1&duration=103`. Paused example: `?t=28`.

| Cue | Visual focus |
|---|---|
| 0–10 | Typed question and earlier/later rasters |
| 10–20 | Dates, bands, overlap and alignment |
| 20–33 | Orchestrator selects a registry capability; constraints appear |
| 33–44 | Water candidates → pixel comparison → GIS measurement |
| 44–55 | Optical–SAR inputs activate a different workflow |
| 55–66 | Spatial outputs, sources, method and uncertainty |
| 66–83 | Candidate Qwen3-VL-8B, adapters and paired supervision |
| 83–95 | Offline evaluation versus runtime selection |
| 95–103 | Seven-layer overview |

## Technical answers for the team

- Architecture matches PRD sections 6 and 8 and the detailed seven-layer PPT image. Capability count is not model count.
- Planner proposes structured plans; code enforces input schemas, dependencies and allowed parameters. No arbitrary generated-code execution is implied.
- Development evaluates versions; runtime chooses approved task/sensor-compatible capabilities. Runtime does not benchmark every model again.
- Original arrays support numerical calculations; visual representations feed models. Matching CRS does not establish co-registration.
- Qwen3-VL-8B is the primary adaptation candidate. Profile LoRA/QLoRA before promising A40 throughput. GeoChat is a reference; TEOChat and suitable segmentation/change models are separate candidates, not all claimed integrated.
- BigEarthNet.txt supports paired adaptation. VRSBench/RSVQA and CDVQA cover applicable single-image and temporal tasks. Keep prescribed test splits untouched; guard against location/crop leakage.
- Test base/adapted, optical-only/SAR-only/paired, and shuffled pairs. Report task metrics, sample counts, latency and memory. Similarity is not calibrated accuracy.
- The current code still uses keyword routing, one configured visual model and GIS paths. This film communicates the design, not completion of every layer. Water shapes are explicitly schematic; use real application footage for actual results.

Sources: `SATQUERY_PRD.md`; https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct ; https://txt.bigearth.net/ ; https://github.com/ermongroup/TEOChat .
