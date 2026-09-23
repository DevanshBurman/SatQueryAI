# SatQuery submission video — story-led master

This is the current full-video script. It supersedes the spoken script in FINAL_VIDEO_PLAYBOOK.md and uses the short Agrani narration below instead of the 135-second architecture narration. Keep the longer architecture animation as supporting material; its current timing does not match this short narration.

## Message to the speakers

Dimple: record the product sections below as separate takes. Agrani: record only the technical section in this document. Use a clear conversational delivery, with a short pause between paragraphs. Send clean audio without music, preferably WAV. Do not read scene titles or recording instructions. The editor will fit the footage to the delivery.

## Story

One investigation: inspect Upper Lake, understand an observation, locate water candidates, compare two dates, and export the evidence. Optional optical–SAR analysis demonstrates a second sensor path after the main investigation is complete. Budget roughly four to five minutes, with results given more screen time than navigation.

## 1. Opening — Dimple

**Picture:** Start on the two actual dated observations. Slowly move the comparison slider, then cut to the natural-language composer. A brief on-camera introduction is optional.

**Read:**

These two satellite observations show the same part of Upper Lake in Bhopal. What changed between them? And how can we inspect the evidence behind the answer?

SatQuery AI brings the imagery, the question and the analysis into one workspace. Let us follow one investigation, from choosing the observations to exporting the result.

**Editor:** Show the source dates. Do not call the difference a flood or claim a measured direction of change before examining the actual result. Use the brand introduction for a brief transition into the workspace.

## 2. Choose the evidence — Dimple

**Picture:** Open Data, enter `23.26, 77.30`, briefly expose date and sensor filters, then load the prepared collection and import observations. Show the resulting Inputs tray.

**Read:**

We begin with the location. SatQuery provides a map-based discovery interface, date and sensor filters, and direct uploads. For this investigation, we use the prepared Upper Lake collection of Sentinel observations.

Several observations can stay in the workspace. For each question, we choose exactly which images to analyse. Their dates and sensor types remain visible beside the question.

**Editor:** Keep the prepared-collection label readable. Only show live catalogue search returning results if that search actually succeeds. A catalogue thumbnail is not proof that its source raster was imported.

## 3. Ask a normal question — Dimple

**Picture:** Select only `Upper Lake · landscape view`, 2021-11-02. Keep true colour selected. Type the following question manually and submit it:

> Describe the land cover and major visible features in this image.

**Read:**

First, I select one optical image and ask a question in ordinary language: describe the land cover and major visible features in this image.

The selected observation stays beside the response, so we can compare the description with the actual scene. We can also inspect the source and the limitations of the interpretation.

**Editor:** Capture the real response before recording this section. Hold on two concrete observations it actually makes, alongside the relevant parts of the image. Do not record an error screen and replace its answer in the edit. No model name or fine-tuning badge should be added to the application footage.

## 4. Turn the question into spatial evidence — Dimple

**Picture:** Select the November closer optical crop. Type or choose `Highlight the water body in this image.` Show the returned overlay, toggle it once, and reveal its executed parameters.

**Read:**

Next, I ask it to highlight the water body. This question produces a spatial result: a mask calculated from the source raster's green and near-infrared bands.

We can switch the overlay off and on, and inspect the index threshold used to create it. These are water candidates under the selected method, with cloud and shadow limitations retained in the result.

**Optional five-second picture:** True colour → false colour → true colour. If used, read: “Band views let us inspect different aspects of the same multispectral observation.”

## 5. Compare the dates — Dimple

**Picture:** Attach the matching closer optical crops dated 2021-05-06 and 2021-11-02, in that order. Show both attachment chips. Submit:

> What changed in water extent between these two dates?

**Read:**

Now I select two observations of the same area, taken on different dates, and ask what changed in water extent.

The analysis compares the rasters on their common grid. We can inspect the before-and-after measurements and the newly detected water candidates, then compare the output with both original observations.

The method, parameters and valid coverage travel with the result. That makes the change estimate something another person can review.

**Editor:** Use only the values returned by this run. Leave those values and their units readable. The current tool reports newly detected candidates; do not label its overlay as a complete gain-and-loss map. Do not extrapolate the crop's result to the entire lake.

## 6. Complementary sensors — optional, Dimple

**Picture:** Select the aligned closer optical observation and SAR observation. Show both attachment chips. Submit:

> Use the optical and SAR images together to describe water and built-up regions.

**Read:**

For questions involving complementary sensors, we can attach an optical observation and an aligned radar observation. Both inputs remain visible, and the response can be reviewed against the pair.

**Editor:** Include this only after a successful paired response. Keep it brief. This footage demonstrates paired interpretation; it does not establish that a learned fusion model was trained.

## 7. How the system resolves the request — Agrani

**Picture:** Dark motion graphics. Show only the current stage and its immediate inputs or outputs. Use the existing animation's relevant scenes as individual clips and retime them to this take. Intercut the real mask and execution panel when mentioned.

**Read:**

The workflow starts with the question and its selected observations. Ingestion reads the raster bands and geospatial metadata. Validation checks whether those inputs support the requested task, including dates and spatial compatibility for paired analysis.

The controller routes the request to visual interpretation or a geospatial operation. For the water question you just saw, it calculates a spectral index and applies the selected threshold. For change, it compares corresponding valid pixels across two dates.

Measurements come from the raster geometry. On a ten-metre square ground grid, one hundred selected pixels cover one hectare. The answer retains its source observations, parameters and limitations, which can be inspected and exported.

Our next development step is to adapt a candidate vision-language model to remote-sensing tasks and compare it with its untuned baseline on held-out data. That evaluation will guide which model versions enter the wider specialist architecture.

**Editor:** Approximately 65–80 seconds at a clear technical pace. The 100-pixel example is an explanatory calculation, not a reported result from Upper Lake. The wider registry diagram illustrates the target modular architecture; the current controller routes between the implemented paths. Keep model-development narration at the end of this segment.

## 8. Export and close — Dimple

**Picture:** Download the report for the main investigation, open the actual PDF, and show the question, result, source images, method and limitations. Finish with Dimple on camera or a clean product frame and URL.

**Read:**

Finally, we export the investigation as an evidence report, bringing the question, result, source observations and execution details together.

From choosing the data to checking the answer, the investigation stays connected. SatQuery AI: ask a question, inspect the evidence.

## Recording priorities

1. Resolve the production access list and complete one successful visual-answer request before recording. The required SatQuery sign-in email belongs in the server's `SATQUERY_DEMO_EMAILS` setting, not in this public script.
2. Capture the single-image, water, temporal and optional paired runs separately. Keep each original take and its exported report.
3. Record the screen at 1920 × 1080. Keep source chips, dates, answers and measurements readable. Use full-screen product footage for the main demonstration.
4. Leave two seconds before and after each action for editing. Compress long processing intervals with a small “Processing time shortened” caption. Keep the actual result sequence intact.
5. Use one emphasis per shot: the typed question, selected inputs, overlay, measurement, or report. Avoid simultaneous narration, dense architecture labels and unrelated captions.
6. Put people on camera at the opening, speaker handoff or close if convenient. Record clean narration separately; a face should not cover the evidence.

## Architecture comparison and evaluation graphic

The supplied competitor chart reports classifier test accuracy for several ResNet/EfficientNet configurations at different image sizes. The screenshot does not specify the dataset, split, task labels, uncertainty, or a common resolution. It is evidence of reported classifier results, not enough to rank entire VQA/orchestration systems or verify their fine-tuning process.

For our video, a measured workflow test is useful once recorded: input configuration, question, actual output, runtime, and exported trace. Label this a functional workflow check; it is not model accuracy.

For a later model benchmark, compare the exact base and adapted checkpoint on the same held-out dataset and preprocessing. Use task-specific measures: VQA correctness, segmentation IoU/F1 against reference masks, and change-detection performance against change labels. Keep geographical leakage out of the split. Report sample size and latency alongside results. Cluster access alone predicts none of these scores. Until runs exist, use an evaluation-plan diagram without invented bars or percentages.
