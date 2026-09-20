# SatQuery recording handout

## Recommended story: 4–5 minutes

Check the actual screening duration limit before recording. This is a suggested edit, not an official SIH limit.

**Opening line:** “SatQuery turns a remote-sensing question into a reviewable workflow: choose the observations, ask naturally, and inspect the evidence.”

1. **0:00–0:20 — Landing and welcome.** Show the animated landing, open the workspace, and show the four-capability introduction. Do not spend time signing in on camera.
2. **0:20–0:55 — Real data discovery.** Open Data. Click **Explore Upper Lake collection**. Paste **23.26, 77.30**, press the location arrow, and click **Search this map area**. The prepared collection contains real Sentinel crops; it is not a live global raster-download service. Select **Upper Lake · landscape view**, 6 May 2021, and Continue.
3. **0:55–1:40 — Single-image VQA and spectral context.** Ask “Describe the land cover and major features visible in this image. Separate clear observations from uncertain interpretations.” Close the expanded reader with Escape. Switch to **False colour** and ask “This view maps near-infrared, red and green bands to RGB. Explain the vegetation and water patterns visible here, and the limitations of interpreting this rendering.” The rendered image really is sent to the vision endpoint. False colour changes the evidence representation; it does not automatically improve model accuracy.
4. **1:40–2:15 — Spatial water evidence.** Ask “Highlight the water body in this image.” Close the reader to show the cyan candidate mask. Explain that green/NIR NDWI is computed on source raster pixels, with a visible threshold and source metadata. This is water extraction, not general text-grounding by a trained model. The output area is measured, not validation accuracy.
5. **2:15–2:55 — Temporal analysis.** For the easiest reliable setup, Inputs → Try real Sentinel-2 data → Two dates. Ask “What changed in water extent between these two dates?” Show the dates, mask, measurements and execution parameters. This is seasonal water-index comparison, not evidence of a particular flood disaster. Cloud/shadow masking is not applied.
6. **2:55–3:30 — Complementary sensors.** Inputs → Optical + SAR. Ask “Use both sensors together to describe water and developed regions. What does each sensor contribute, and what remains uncertain?” This uses the matching shoreline crop and radar crop, not the wider landscape crop. Explain qualitative paired interpretation, not trained feature-level fusion or validated building segmentation.
7. **3:30–4:10 — System design.** Open `/architecture.html`. Use Next layer or let the animation play: Acquire → Validate → Prepare → Route → Execute → Check → Explain. It shows implemented components and planned specialist adaptation distinctly. The recording shows observable execution records, not internal chain-of-thought.
8. **4:10–4:30 — Closing.** “Our prototype connects real source imagery, query-driven routing, spectral calculations and evidence reports. The next milestone is remote-sensing adaptation and held-out evaluation of the specialist models.” Show the downloadable report.

## Practical checks

- Start `npm run dev` and `python scripts/run_backend.py`. AWS credentials stay in ignored backend/.env, never in the browser or Git.
- Warm one model call before recording. Record actual processing; edit dead air in the video if necessary rather than adding artificial delays.
- Reload and enter from the landing page to show the introduction again.
- The new wide samples are 512×512 crops at 10 m from the **same two Sentinel-2 acquisitions** as the original shoreline pair. They are not extra acquisition dates.
- For real prepared raster discovery use the Upper Lake collection toggle. The separate live catalogue path returns scene metadata/previews and still needs the matching raster uploaded for analysis.
- RGB and false-colour use display stretching. NDVI/NDWI are derived from stored surface-reflectance bands. The supplied optical band order is blue, green, red, NIR; confirm it for other uploaded files.
- NDWI/NDVI colour gradients run from low to high index, not from low to high model confidence.
- Never use the 10 m resampled SAR grid as a claim of 10 m native radar resolution. Independent optical–SAR co-registration validation remains outstanding.

## What to say about model research

GeoChat is a grounded remote-sensing VLM candidate for single-image work. TEOChat is a temporal remote-sensing VLM candidate; its official project describes TEOChatlas, not a SatQuery fine-tune on BigEarthNet.txt. BigEarthNet.txt is a paired multisensor image–text adaptation resource. Our current connected vision backend is Nova, with deterministic raster tools. No new training or SatQuery benchmark run is demonstrated by this UI work.

Sources: [GeoChat official repository](https://github.com/mbzuai-oryx/GeoChat), [TEOChat official repository](https://github.com/ermongroup/TEOChat), [BigEarthNet.txt project](https://txt.bigearth.net/).

## Benchmark plan — before publishing any scores

1. Freeze model checkpoint, preprocessing, prompt, dataset version and official splits.
2. Adapt on training data only. Avoid overlap with held-out evaluation areas/dates.
3. Evaluate the PS-prescribed VRSBench/RSVQA and CDVQA tasks using their official evaluation scripts and splits; use the eventual ISRO test specification when available.
4. For water/change masks, obtain independent reference masks and report IoU/F1, reference provenance, sample count and failures. NDWI area is not IoU.
5. Compare generic vision, RS-adapted single-image, temporal, and optical–SAR variants under the same protocol. Report inference latency separately from predictive quality.
6. Calibrate any confidence indicator on held-out data. Until then show evidence quality and limitations, not invented per-answer percentages.

The PS explicitly requires at least one remote-sensing-adapted component. The current prototype does **not** yet satisfy that training requirement; keep it a concrete next milestone rather than a completed claim. No strategy guarantees a top-20 result.
