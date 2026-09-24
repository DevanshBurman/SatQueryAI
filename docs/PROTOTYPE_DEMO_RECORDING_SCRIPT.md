# SatQuery AI — modular prototype recording script for Dimple

Record each numbered screen clip separately at 1920 × 1080. Dimple should record each matching voice-over paragraph as a separate clean WAV take, with two seconds of silence at both ends. The suggested assembled prototype section is about 3½–4 minutes; this is an editing target, not a claimed SIH time limit. It can sit after a problem introduction and before Agrani's architecture section. Do not read clip titles, UI instructions, or editor notes aloud.

Use the actual production site only after checking one successful visual answer, water result, and PDF export. Keep each original screen take, even if the final edit shortens a wait. Do not replace a failed request with an answer from another run. For a shortened wait, show a small `Processing time shortened` caption. Keep source dates and measured units visible.

## 01 — Enter the investigation

Save screen as `SQ_DEMO_01_workspace.mp4`; Dimple's audio as `SQ_VO_01_workspace.wav`.

**Screen:** Open workspace. Let the SatQuery introduction play briefly, then close it. End on the empty Analysis Studio with the evidence canvas and question box visible. Record this clip without clicking a suggested question.

**Dimple reads:** “This is SatQuery AI's investigation workspace. The idea is simple: choose the observations, ask in ordinary language, and keep the answer beside the evidence. Let me show one Upper Lake investigation from start to finish.”

## 02 — Discover real source imagery

Save `SQ_DEMO_02_discover.mp4` and `SQ_VO_02_discover.wav`.

**Screen:** Click **Data**. Enter `23.26, 77.30` in the coordinate field and submit. Briefly open **Dates & filters** and show the optical/SAR choices. Use **Upper Lake rasters ready** and **Search this map area**. Scroll enough to show the five raster-ready observations, select the prepared observations, and click **Continue**. Keep the “Prepared collection” label legible.

**Dimple reads:** “I can begin on the map, search by coordinates, and narrow the view by date and sensor. Here I open a prepared collection of real Sentinel observations around Upper Lake. These are source rasters, not just map thumbnails, so I can bring the selected imagery into the investigation.”

**Editor note:** Do not present the prepared collection as a live global raster download. The live catalogue path supplies previews and metadata; this shot uses the prepared Upper Lake source pack.

## 03 — Bring in a GeoTIFF from the computer

Save `SQ_DEMO_03_drop_geotiff.mp4` and `SQ_VO_03_drop_geotiff.wav`.

**Screen:** Record this as an independent insert from a fresh, empty Analysis Studio. In Windows Downloads, show `SatQuery_UpperLake_S2_2021-11-02_4band.tif` clearly. Drag it onto the evidence canvas. Hold on the drop target, the processing state, and the resulting image. Open **Inputs** and show the uploaded filename. Return to the canvas. A file-picker fallback is available through **Add observations → Upload observations**.

**Dimple reads:** “The map is not the only way in. I can also drop a GeoTIFF from my computer directly into the evidence canvas. SatQuery reads its bands and spatial metadata, then keeps the original file attached to the observation. TIFF, PNG and JPEG uploads are supported too; ordinary images support visual questions, while spectral calculations need the appropriate raster bands.”

**Editor note:** This file is a copy of the November Sentinel-2 Upper Lake crop in the prepared collection. It is real satellite data, but do not imply that it is a separate study site or an independently acquired source.

## 04 — Choose among multiple observations

Save `SQ_DEMO_04_inputs.mp4` and `SQ_VO_04_inputs.wav`.

**Screen:** Return to the main take from clip 02. Open **Inputs**. Show all five observations in the tray, their dates and modality controls. Select one November optical landscape view, then briefly select the two matching shoreline dates, and finally leave the November landscape view as the single selected input. The count in **Inputs** is the number available in the workspace; the attached chips identify the one or two selected for the current question.

**Dimple reads:** “Several observations can stay in the same workspace. I choose which one—or which compatible pair—answers each question. The attached source, date and sensor remain visible, so a response is never detached from the imagery it used.”

## 05 — Type a natural-language question and show the actual answer

Save `SQ_DEMO_05_visual_answer.mp4` and `SQ_VO_05_visual_answer.wav`.

**Screen:** With only the November optical landscape image selected, type the question manually: `Describe the land cover and major visible features in this image.` Click **Analyse**. Hold on the real returned answer, its source chip, and the relevant image. Open **Quality & limitations** briefly. The expanded conversation now has no example-question cards.

**Dimple reads:** “Here is a question a non-specialist can type: ‘Describe the land cover and major visible features in this image.’ SatQuery examines the selected observation and returns a description we can check against the image. The source and the interpretation's limitations remain available in the same view.”

**Editor note:** Before recording the voice-over, check the actual answer and pick a crop that shows two features it really mentions. If visual answering fails, fix that service first; do not build this scene from a fabricated reply.

## 06 — Inspect the spectral views

Save `SQ_DEMO_06_band_views.mp4` and `SQ_VO_06_band_views.wav`.

**Screen:** On the same optical GeoTIFF, return to imagery. Click **True colour**, **False colour**, **NDVI**, and **NDWI**, pausing on each rendered result and the note under the controls. End on true colour or false colour. Do not imply these are four different source scenes.

**Dimple reads:** “The same multispectral file can be viewed in true colour, false colour, and vegetation and water indices. These views help us inspect different properties of the scene. They are derived from the source bands; they are not four new satellite observations.”

## 07 — Ask for a water-candidate overlay

Save `SQ_DEMO_07_water_overlay.mp4` and `SQ_VO_07_water_overlay.wav`.

**Screen:** In the main take, select only the November **shoreline** optical crop, not the wider landscape view. Type `Highlight the water body in this image.` Submit. Show the actual mask, toggle **Water overlay** off and on, and open **Executed tools & parameters**. Keep the original image and candidate overlay identifiable.

**Dimple reads:** “Now I ask for a water highlight. For this question, SatQuery reads the green and near-infrared raster bands, calculates a water index, and applies the selected threshold. The overlay shows water candidates on this crop. I can switch it off to inspect the source image and open the executed parameters to see how it was produced.”

**Editor note:** Do not call the mask a validated flood map. Cloud and shadow masking is not applied to this prepared crop.

## 08 — Compare matching dates

Save `SQ_DEMO_08_two_dates.mp4` and `SQ_VO_08_two_dates.wav`.

**Screen:** Select the matching **shoreline** optical crops dated `2021-05-06` and `2021-11-02`, in that order. Show both attached chips. Type `What changed in water extent between these two dates?` Submit. Hold on the actual before/after values and units, then show the comparison slider and result limitations. Use the same footprint pair; do not pair a shoreline crop with a wider landscape crop.

**Dimple reads:** “For change, I attach two corresponding observations and ask what happened to water extent between the dates. The raster workflow checks their common grid and compares valid pixels. The result reports the before-and-after measurements and newly detected water candidates, with the source dates and method still open for review.”

**Editor note:** Display only the values from the recorded run. This crop is not the whole lake, and newly detected candidates are not a full gain-and-loss or flood-ground-truth map.

## 09 — Optional optical and radar interpretation

Save `SQ_DEMO_09_optical_sar_OPTIONAL.mp4` and `SQ_VO_09_optical_sar_OPTIONAL.wav`.

**Screen:** Select one May shoreline optical image and the May SAR image. Ask `Use the optical and SAR images together to describe water and built-up regions.` Hold on the two source chips and the actual returned answer. Include this clip only if the paired request succeeds during the recording check.

**Dimple reads:** “The workspace can also bring optical and radar observations into one question. Their different sensing properties provide complementary context, while the answer stays tied to both selected inputs.”

**Editor note:** This is paired visual interpretation, not evidence that a learned fusion model has been trained.

## 10 — Export the evidence

Save `SQ_DEMO_10_report.mp4` and `SQ_VO_10_report.wav`.

**Screen:** From a successful answer, click **Download PDF evidence report**. Open the new PDF and pan through its question, answer, source observation, method, and limitations. If the optional optical/SAR shot is omitted, export the water or temporal result. Do not show an older downloaded PDF.

**Dimple reads:** “The investigation does not end with a paragraph. I can export an evidence report with the question, answer, source observation, processing method and limitations together. That gives someone else a practical starting point to review the result.”

## 11 — Project context and clean handoff

Save `SQ_DEMO_11_projects_handoff.mp4` and `SQ_VO_11_projects_handoff.wav`.

**Screen:** Briefly show the **Home** project view and, only if a real saved query appears under your signed-in account, the **History** view. Finish on the Analysis Studio's successful result or a clean SatQuery product frame. Leave two seconds with no voice for the later Agrani handoff.

**Dimple reads:** “SatQuery also gives the investigation a project context, with data, analysis and results in one workspace. That is the prototype experience: bring the evidence, ask a question, inspect the output, and carry the report forward.”

**Editor note:** Unsigned project cards are illustrative UI, not proof that this particular investigation was persisted. Do not call the Results tab a separate saved-results dashboard; it currently shares the Analysis Studio view. Clip 11 can be shortened or dropped without harming the core investigation.

## Recording order and continuity

1. Run one end-to-end check on the production site. The single-image and optional optical/SAR answers require the configured model service. The water and temporal paths use raster calculations.
2. Record clips 01, 02, 04–08, and 10 as the main investigation. Record 03 as a separate upload cutaway. Record 09 only after a successful paired answer. Record 11 last.
3. Capture the cursor, typed question, attached chips, result and PDF clearly. Avoid browser downloads covering the app; use full-screen capture and sensible zoom.
4. Keep UI waits in the raw clips. The editor may accelerate them with the explicit processing caption, but should not alter the question/result sequence or insert a different answer.
5. Dimple's voice should sound curious and precise, not like an ad: a short pause after each question, and slower delivery on source dates, measurements and limitations. Record no background music in the voice files.
