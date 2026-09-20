# SatQuery recording runbook

## Start

1. In one terminal: `python scripts/run_backend.py`. It loads ignored `backend/.env` and listens only on 127.0.0.1:8000.
2. In another terminal: `npm run dev`. Open http://127.0.0.1:5173 at 100% zoom. Keep the backend terminal open. Do not record your AWS console or environment files.
3. Landing → Open workspace → Try real Sentinel-2 data. The pack includes two actual optical crops and an actual radar crop; no new account is needed.

## Suggested 4-minute recording

1. **Opening (15s):** “SatQuery turns a natural-language question and satellite observations into a source-linked answer.” Show the landing page and enter the studio.
2. **Inputs (25s):** Load the sample. Point out acquisition dates, optical/SAR, CRS and source identity. Discovery is for public catalog search; catalog thumbnails are not silently treated as analysis-ready rasters.
3. **Single image (35s):** Click Single. Ask “Describe the land-cover and major objects visible in this image.” Run. The image is really sent to Nova Pro. Ask another question in your own words.
4. **Grounding (30s):** With Single still selected, ask “Highlight the water body in this image.” Show the cyan computed NDWI mask, toggle it off/on. Say “A spectral tool extracts water candidates; the result remains linked to the original raster.” Do not call this a trained grounding model.
5. **Two dates (40s):** Click Two dates. Use Compare and drag the slider. Ask “What changed between these two dates?” for live qualitative Nova change interpretation. Optionally ask “What changed in water extent between these dates?” for actual NDWI measurements. This is seasonal shoreline change, not a validated disaster/flood case. The tiny earlier NDWI baseline makes percentage growth misleading; use absolute measurements and the limitation note.
6. **Complementary sensors (40s):** Click Optical + SAR. Ask “Use the optical and SAR images together to identify water-covered and built-up regions. Explain the complementary evidence.” The actual two previews reach Nova. This demonstrates cross-modal visual interpretation, not a trained fusion network.
7. **Agent checks (20s):** Click Single and ask “What changed between these two dates?” Show the missing-input check. No fabricated answer is generated.
8. **Audit and architecture (35s):** Open executed tools/parameters, download the report, then How it works. Explain query → validation → specialist selection → evidence. State the next phase accurately: remote-sensing adaptation and benchmark evaluation using the prescribed datasets.

## What works now

- Real TIFF preview and metadata; files persist when changing workspace sections.
- Free-text Nova single/paired interpretation, input-dependent routing, model/tool trace.
- Actual spectral water masks and aligned-raster water change with band/threshold controls.
- Comparison slider; evidence report HTML (print to PDF) and execution JSON.
- Real optical and radar sample pack, with source/provenance manifest.
- Original accounts, projects and query-history integrations are retained.
- Browser layouts checked at 1024, 1366 and 1920 CSS pixels.

## Deployment configuration

Local recording does not require cloud-backend provisioning. Production cloud analysis requires server AWS_REGION, BEDROCK_MODEL_ID and AWS credentials/role, plus Supabase URL/publishable key and `SATQUERY_DEMO_EMAILS` (comma-separated approved team emails). The server verifies the signed-in user against Supabase. Do not put AWS keys or the private vision token in VITE variables. The local bypass is disabled on Vercel. A working AWS console does not automatically configure Vercel's environment.

## Still a development phase, not completed training

The connected Nova model is general-purpose, not remote-sensing-adapted. Learned grounding, trained optical–SAR fusion and prescribed benchmark/ISRO evaluation are not complete. The PS explicitly requires adaptation; present the live prototype and that model-development plan separately. No benchmark scores or trained checkpoints are invented.
