# SatQuery AI - final submission video playbook

This is the record-ready plan for the SIH26167 prototype video. It is designed to show one coherent investigation, not a catalogue of screens.

## Core story

**Ask Earth. Get evidence.** SatQuery AI lets a user discover or upload satellite observations, ask a normal-language question, and receive an answer tied to the selected imagery, source metadata, executed tools, and limitations.

The public problem statement emphasizes single-image understanding, multi-temporal comparison, optical-SAR analysis, query-driven specialist selection, and evidence-grounded outputs. The video should visibly demonstrate those ideas in that order.

## Recommended finished cut: 4:30 to 5:15

Do not rush the narration. Speed up loading screens in the edit, but keep mouse movement and the final answer readable at normal speed.

| Cut | Screen action | Speaker | Target |
| --- | --- | --- | --- |
| 1 | Landing hero and Open workspace | Dimple | 0:00-0:18 |
| 2 | SatQuery intro animation | Dimple | 0:18-0:35 |
| 3 | Map discovery and five-source import | Dimple | 0:35-1:05 |
| 4 | Select one wide optical image and type the question manually | Dimple | 1:05-1:45 |
| 5 | Show true colour, then a quick false-colour cutaway | Dimple | 1:45-2:08 |
| 6 | Water mask and source-linked answer | Dimple | 2:08-2:42 |
| 7 | Two dates, compare view, measured water change | Dimple | 2:42-3:25 |
| 8 | Optical plus SAR selection and complementary evidence | Dimple | 3:25-3:52 |
| 9 | Architecture overlay or clean motion graphic | Agrani | 3:52-4:42 |
| 10 | PDF report, project/results, closing hero | Dimple | 4:42-5:05 |

## Recording preparation

1. Use a 1920 x 1080 browser window at 100% zoom. Hide bookmarks, downloads, notifications, desktop icons, and personal tabs.
2. Sign in and warm one visual-answer request before recording. Keep a second clean browser window for the actual take.
3. Use the prepared Upper Lake pack. It contains five real cropped raster observations: two wide optical views, two closer optical views, and one radar view.
4. Select only the inputs required by the current question. The input tray can hold five sources, while the controller attaches one or two to a particular analysis.
5. Record each scene as a separate clip with five seconds of stillness before and after. Do not attempt a single continuous take.
6. Capture a clean fallback of every final state: answer, mask, comparison, optical-SAR pair, execution details, and PDF.

## Exact screen choreography

### 1. Hook

- Begin on the landing page with the river image fully visible.
- Hold for two seconds.
- Move once to **Open workspace** and click.
- Let the logo animation breathe; do not wave the cursor around it.

### 2. Discover real observations

- Open **Data**.
- Enter `23.26, 77.30`.
- Show the date filters and optical/radar choices for one beat.
- Choose **Use example data** or the prepared collection.
- Select all five observations and click **Continue**.
- During file processing, keep the loading state on screen for two seconds, then time-compress the rest to 250-350%.

Narrative point: discovery and ingestion happen inside the product, and original raster files remain linked to the workspace.

### 3. Prove natural-language interaction

- Choose **Single**. Confirm the attached chip says one optical image and shows its date.
- Click in the composer and manually type, at a natural pace:

> Describe the land cover, water, vegetation, and major human-made features visible in this image. Separate direct visual evidence from uncertainty.

- Click **Analyse**.
- Show the answer and its evidence/limitations panel. Do not scroll quickly.

This is the one question that must visibly be typed. Suggested prompts can be clicked later.

### 4. Show spectral context without derailing the story

- Return to the image.
- Keep **True colour** as the baseline view.
- Click **False colour** for a 4-6 second cutaway. Add an editor caption: `NIR / red / green`.
- Do not ask a second visual question here. Return to true colour before continuing.

Why include it: it shows that SatQuery works with multispectral raster bands. Why keep it short: false colour is a representation, not a separate answer or an automatic accuracy boost.

### 5. Produce spatial evidence

- With one optical GeoTIFF selected, enter:

> Highlight the water body in this image.

- Show the cyan water-candidate overlay.
- Toggle **Water overlay** off and on once.
- Briefly expand **Executed tools & parameters** to show NDWI bands and threshold.

Narrative point: SatQuery does not answer every question with prose. It can route a spatial request to a pixel-level raster operation and keep the parameters inspectable.

### 6. Compare two dates

- Open Inputs and click **Two dates**.
- Confirm that the attached chips show two optical observations with different dates.
- Use the Compare control for a short before/after reveal.
- Ask:

> What changed in water extent between these two dates?

- Show the before, after, and newly detected water-candidate measurements and the overlay.

Use absolute measured areas on screen. Do not make a causal claim such as flood, drought, or disaster unless independent event data supports it.

### 7. Combine complementary sensors

- Open Inputs and choose **Optical + SAR**.
- Confirm one optical and one SAR chip before analysing.
- Ask:

> Use the optical and SAR observations together to describe water-covered and built-up regions. What does each sensor contribute?

- Show the answer and selected input labels.

Narrative point: optical imagery contributes spectral and visual context; radar contributes complementary structural/backscatter evidence. The controller checks that paired inputs cover the same place.

### 8. Finish on evidence, not settings

- Download the **PDF evidence report**.
- Open it briefly on the title, question, answer, visual evidence, limitations, and execution record.
- Cut to Results or the project overview for two seconds.
- End on the landing hero with logo and URL.

## Dimple - product walkthrough script

### Opening

“Satellite imagery holds critical evidence, but getting an answer usually means finding the right data, understanding sensors, and assembling a specialist GIS workflow. SatQuery AI turns that process into a conversation. Ask Earth. Get evidence.”

### Workspace introduction

“Inside one workspace, a user can begin with a single observation, compare two dates, combine optical and radar evidence, or inspect multispectral indices. The interface reveals one capability at a time, while the analysis remains connected to the original source.”

### Discovery

“We can upload our own GeoTIFFs, or discover observations by location, date, and sensor. Here I search Upper Lake in Bhopal and bring five prepared Sentinel observations into the same project. SatQuery preserves their dates, modality, coordinate system, and source identity.”

### Typed natural-language question

“I select one optical observation and ask in ordinary language: describe the land cover, water, vegetation, and major human-made features visible in this image. SatQuery validates the input, chooses the matching analysis path, and returns a concise answer with visible evidence and limitations.”

### Spectral view

“Because the source is multispectral, we can inspect more than an RGB picture. A false-colour view maps near-infrared, red, and green bands, making vegetation and water patterns easier to inspect while keeping the same source raster.”

### Water evidence

“Now I ask SatQuery to highlight the water body. This request is routed to a spectral water-index tool. The cyan overlay is computed on the raster pixels, and the exact band mapping and threshold remain visible for review.”

### Temporal change

“For a change question, I attach two optical observations from different dates. SatQuery checks their dates and common grid before comparing them. The result reports the measured water candidates before and after, highlights where the index changed, and retains the limitations needed for responsible interpretation.”

### Optical and SAR

“Some questions need complementary sensors. I pair an optical observation with a co-registered radar observation. SatQuery uses the optical scene for spectral and contextual detail, and radar for complementary structural evidence, then explains what the pair supports and what remains uncertain.”

### Report and close

“Every result can be exported as a source-linked PDF with the question, answer, evidence images, limitations, and executed parameters. SatQuery AI makes remote-sensing analysis easier to ask, easier to inspect, and easier to communicate. Ask Earth. Get evidence.”

## Agrani - technical architecture script, approximately 50 seconds

“Behind the interface, SatQuery AI uses a query-driven controller rather than sending every request through one generic path. First, the ingestion layer reads raster previews and metadata while preserving the original files. The validator checks the number of observations, acquisition dates, sensor modalities, coordinate system, and geographic coverage. The controller then routes the question to the appropriate capability: visual interpretation for open-ended questions, multispectral calculations such as NDWI for spatial water evidence, aligned raster comparison for temporal change, or paired optical-radar reasoning for complementary analysis. Each capability returns both an answer and an execution record. The evidence composer links that result back to its source observations, parameters, and limitations, which is what makes the final response reviewable. The architecture is modular, so additional remote-sensing specialists can be trained, evaluated, and added without redesigning the user experience.”

## Editor's cut sheet

### Visual language

- Use navy, white, and cyan graphics taken from the product. Avoid generic purple AI gradients.
- Use one typeface throughout. Inter or Manrope works; use semibold for labels and regular for captions.
- Keep UI footage full-frame wherever text must be read. Do not place it inside a fake laptop frame.
- Use 105-115% digital punches for details: selected input chips, sensor/date metadata, cyan mask, execution parameters, PDF pages.
- Animate the architecture as a clean horizontal flow: `Question -> Validate -> Route -> Analyse -> Evidence -> Report`.

### Pace and sound

- Dimple carries the product story. Agrani enters once for the technical section; do not alternate voices every sentence.
- Keep background music 18-22 dB below narration and remove vocals.
- Use subtle UI clicks only at major actions. No game-style whooshes, glitch effects, or typing sound on every letter.
- Use J-cuts: begin the next narration line 0.2-0.4 seconds before the visual transition.
- Time-compress actual loading, but preserve the first and last two seconds so the process feels real and understandable.

### Captions and callouts

Use no more than six callouts in the entire video:

1. `Natural-language satellite analysis`
2. `Source-linked GeoTIFFs`
3. `RGB -> False colour (NIR / red / green)`
4. `NDWI water candidates - pixel-level evidence`
5. `Two dates - common-grid comparison`
6. `Answer + evidence + execution record`

### Final quality checklist

- Names, notifications, passwords, tokens, consoles, and browser extensions are not visible.
- The recording shows exactly which one or two observations are attached before every question.
- At least one question is manually typed.
- No loading state is left unexplained or longer than three seconds in the final edit.
- The mouse is still while narration explains a result.
- All UI text is readable on a 1080p display and phone playback.
- No benchmark percentage, confidence score, disaster attribution, or training claim appears unless backed by a reproducible evaluation.
- Final card: `SatQuery AI | Ask Earth. Get evidence.` plus the live URL and team name.

## Evidence behind the story

- Problem statement mirror: https://github.com/aditya-kr86/sih2026/blob/main/ps_2026/SIH26167.md
- GeoChat: https://github.com/mbzuai-oryx/GeoChat
- TEOChat: https://github.com/ermongroup/TEOChat
- BigEarthNet.txt: https://txt.bigearth.net/
- A useful current industry demo pattern - natural-language Earth observation plus change detection: https://element84.com/machine-learning/queryable-earth-demo-update-now-with-change-detection/

