# SatQuery AI video assets

You do not need to supply all visual assets. The prototype includes a generated floodplain background, tricolour identity, vector map overlays, motion sections and a guided tour.

## Most useful assets from the team

- Final team name, logo, member names and college name.
- A recorded voiceover, or approval of a final narration script before recording.
- One validated, openly licensed before/after satellite pair for the same area. Include acquisition dates, sensor, bands, CRS, resolution and original source links. This replaces illustrative imagery in the scientific demonstration.
- An optical/SAR pair only if that workflow will actually be demonstrated.
- The official submission requirements and confirmed video duration.

## Asset labels

- `public/hero-floodplain.png`: AI-generated illustration. Do not present it as a real Sentinel observation.
- `backend/data/demo_before.tif` and `demo_after.tif`: synthetic georeferenced test data. Quantitative calculations operate on these files, not the landing-page background.
- Current landing overlays, dates and places illustrate the proposed experience. They are not verified flood observations.
- Current workspace narrative is prepared output. An adapted remote-sensing VLM is not connected yet.

## Recording approach

Record at 1920 × 1080 with browser zoom at 100%. Start on the landing page, spend a few seconds on the India identity, scroll through the product story, then open the workspace. Show scene selection, the analysis action, the execution trace and Swagger API documentation. Use only a short landing montage; reserve most of the video for the officer's task, evidence and current implementation.

Use original narration and either no music or music with an explicit reuse licence. Retain source URLs and licence terms for every third-party image or audio file; watermark-free does not by itself mean reusable.

No finished narrated video is included in this build.
