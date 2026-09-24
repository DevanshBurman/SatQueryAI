# Agrani's motion graphic

> SUPERSEDED: Do not record the narration below. Use `AGRANI_FINAL_SCRIPT.md` and `AGRANI_FINAL_RECORDING.md`. This document remains only as an archived reference.

Open `frontend/public/agrani-motion.html` directly in Chrome or serve the project and open `/agrani-motion.html`. Keep `satquery-mark.svg` beside the HTML if sharing the files separately. The page has no external font, library, or API dependency.

The editable HTML/CSS/SVG sequence is composed at 1920 x 1080. It uses the existing SatQuery mark, white, navy, and teal. All raster tiles, checkmarks and reports in this sequence are schematic architecture illustrations, not recorded analysis outputs.

## Record

1. Open the page in Chrome or Edge and choose a 1920 x 1080 capture area in your recorder.
2. Press Play once to rehearse. The starting duration is 64 seconds; adjust it after hearing Agrani's delivery.
3. Optional: choose **Load Agrani's voice**, then **Fit to voice**. The audio stays local. This scales all chapter timings proportionally; use your editor for precise sentence-by-sentence timing.
4. For the clean take, press **Record view · 3s**. The canvas enters fullscreen and counts down. Start your screen recording before clicking it, then trim the countdown.
5. Use 30 or 60 fps. Disable the recorder's cursor capture if possible. The page also hides its cursor in Record view.
6. Add the original voice file in the editor for the best audio quality. If recording browser audio instead, avoid adding it twice.
7. Leave a one-second hold on the final diagram before cutting back to the product report.

**Space** toggles playback; **R** restarts; **left/right arrows** move two seconds; **Escape** exits fullscreen. The page pauses if the browser tab becomes hidden, so keep the recording tab visible during capture.

The page does not generate a video file itself. Use a screen recorder, then overlay the voice take in the editor.

## Voice direction

Warm, clear technical explanation. Aim for about 135 words per minute and small breaths at the chapter boundaries. Read NDWI as “N-D-W-I”; read SAR as “sar” or “S-A-R,” consistently. No need to rush to an exact duration: the animation can be stretched to fit her take.

| Default cue | Visual | Spoken text |
| --- | --- | --- |
| 00:00–00:07 | Typed question and SatQuery mark | Behind the interface, SatQuery AI uses a query-driven controller rather than sending every request through one generic path. |
| 00:07–00:15 | Raster stack and metadata | First, the ingestion layer reads raster previews and metadata while preserving the original files. |
| 00:15–00:24 | Five validation checks | The validator checks the number of observations, acquisition dates, sensor modalities, coordinate system, and geographic coverage. |
| 00:24–00:40 | Four routed analysis paths | The controller then routes the question to the appropriate capability: visual interpretation for open-ended questions, multispectral calculations such as NDWI for spatial water evidence, aligned raster comparison for temporal change, or paired optical-radar reasoning for complementary analysis. |
| 00:40–00:47 | Execution record | Each capability returns both an answer and an execution record. |
| 00:47–00:56 | Source, method and limitations assemble into a report | The evidence composer links that result back to its source observations, parameters, and limitations, which is what makes the final response reviewable. |
| 00:56–01:04 | Complete modular workflow | The architecture is modular, so additional remote-sensing specialists can be trained, evaluated, and added without redesigning the user experience. |

Timings are starting points. If Agrani reads individual sections with different pacing, record separate clips using the chapter buttons and retime those clips in the editor. Keep text reveals at normal speed whenever possible; extend the still hold at the end of a scene.

## Links and editing

- `/agrani-motion.html`: preview with transport controls and the narration.
- `/agrani-motion.html?clean=1`: canvas only; press Space to start.
- `/agrani-motion.html?clean=1&autoplay=1&duration=64`: clean autoplay.
- `/agrani-motion.html?clean=1&t=34`: paused routing scene at 34 seconds.

Change the `chapters` array for narration and timeline boundaries. Boundaries use a 64-second base timeline; the Duration control scales that timeline. Diagram content is in the seven `.scene` sections. Each `data-in` value controls an element's reveal delay within its scene. All motion uses the same seekable clock, so pausing and seeking also pause and seek the graphics.

There is no fabricated benchmark score in the animation. The closing specialist block is explicitly an extension step: train, evaluate, integrate.
