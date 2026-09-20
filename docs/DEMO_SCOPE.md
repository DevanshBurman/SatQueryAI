# SatQuery: today's demo scope

20 September 2026. This is the current proposed recording scope. Older root handoffs are planning history. The research architecture remains in SATQUERY_PRD.md, whose September 10 presentation assumptions are outdated.

## Positioning and findings

“Ask a question about a place. SatQuery checks the observations, chooses an appropriate analysis, and connects the answer to evidence you can inspect.”

Map discovery lowers the barrier to obtaining inputs. The central contribution is validated, query-driven execution across single images, dates and sensors. Submission counts do not let us predict judge rankings. Prioritize mandatory PS capabilities and a complete, understandable interaction.

Fetched GitHub main is 9149f1a. The other branch, main2, last changed on September 16; no newer teammate Nova implementation was found on these branches. AWS account access is untested.

Current main has a static plan, cosmetic Edit buttons, a second upload screen, and static Results that discard the actual water-change response. Chooser uploads retain names instead of File objects. All job choices reach the same water-change runner. These are verified product wiring defects.

The Bedrock adapter exists but accepts an explicit task; it is not an automatic planner. Browser integration must validate the Supabase user on the server without exposing its temporary private token.

## One Analysis workspace

- Left: actual selected observations with thumbnails, source, date, sensor, readiness and remove/replace actions. Upload and Discover are entry points here.
- Center: large image/map viewer, source switching, before/after comparison and generated overlays.
- Right: prominent question composer, example prompts, answer, evidence links and follow-ups.

Keep the run-screen concept and preload chosen assets. Never ask for the same files twice. Replace the mandatory large job-choice screen with small example actions near the question. Natural language is primary.

Make “How this will run” a collapsible plan panel. Default users edit the question and inputs. Advanced users can change AOI, before/after ordering, confirmed band mappings and allowed thresholds. Edits must trigger validation and affect execution. No arbitrary tools, editable safety checks or cosmetic Saved buttons. Save the executed plan in the trace.

## PS coverage

| Requirement | Demonstration | Current gap |
| --- | --- | --- |
| Single-image VQA | Ask a specific question about visible land cover/water | Connect actual image and question to the model |
| Captioning OR grounding | Ask for scene description | Captioning covers the additional mandatory task; water highlighting adds visual strength |
| Temporal understanding | Ask what changed across two dates | Carry both observations, measured supported changes and interpretation into Results |
| Optical–SAR analysis | Ask what radar adds to optical evidence | Obtain a registered pair and show sensor-specific evidence; generic dual-image input alone is not validated fusion |
| Automatic orchestration | Change the question and show a different appropriate tool sequence | Intent routing, registry, input checks and execution trace |
| Remote-sensing adaptation | Show a trained checkpoint and measured evaluation when available | Absent today; Nova does not satisfy this requirement |

The supplied PS contains a placeholder instead of the judging table. Do not invent scoring weights.

## Grounding, masks and built-up change

Scope today's highlight feature to water extraction from original green/NIR bands with valid-data masking and a documented NDWI threshold. Let the user identify a connected water region by selection/reference. This is spectral extraction plus spatial selection; arbitrary text-to-mask segmentation remains a separate capability. Preserve numeric source bands; do not compute spectral indices from colored screenshots.

Precise grounding requires a locator or segmentation tool, not a VLM paragraph or guessed polygon. Show the actual tool overlay aligned to its source.

For “Has built-up area increased?”, prefer a suitable approved CDVQA pair if Sentinel resolution is insufficient. A qualitative answer demonstrates change VQA. Building-area measurements need a validated detector or reference labels. Show reference masks as reference, never as predictions. NDBI alone is not a verified building mask.

## Recording (proposed 4:30, adapt to the submission limit)

| Time | Action | Message |
| --- | --- | --- |
| 0:00–0:20 | Landing and introduction | Ordinary users can ask spatial questions |
| 0:20–0:50 | Search a place, select dated observations | Inputs retain time, source and location |
| 0:50–1:25 | Single-image VQA, description, supported water highlight | Language connected to visible evidence |
| 1:25–2:20 | Ask about two dates; compare and inspect change | Main temporal capability |
| 2:20–3:00 | Optical–SAR pair and complementary evidence | Main cross-modal capability |
| 3:00–3:25 | Incompatible-input example | Controller requests missing evidence instead of blindly running |
| 3:25–3:45 | Execution trace and downloaded report | Reviewability and reproducibility |
| 3:45–4:15 | HTML architecture animation | Query → intent → checks → selected model/GIS tools → answer and evidence |
| 4:15–4:30 | Adaptation/evaluation roadmap | BigEarthNet.txt, VRSBench/RSVQA, CDVQA and held-out ISRO sensor transfer |

Use rehearsed scenarios and edit waiting time. Prepared result replay should retain its actual source and method. Explain architecture ambition confidently, without inventing trained checkpoints, scores or successful model calls. The animation should distinguish the prototype runtime from the planned A40 specialist stage.

## Today's order

1. Diagnose one Nova request. Limit first AWS troubleshooting to about 30 minutes; deterministic tools remain usable if blocked.
2. Obtain a small licensed sample pack: optical scene, corresponding temporal pair, registered optical–SAR pair, optional CDVQA built-up case. Keep IDs, dates, bands, CRS, preprocessing, licences and links in a manifest. Do not download whole datasets.
3. Fix shared observation/query/result state and the single Analysis workspace. Preserve working accounts and Discovery.
4. Implement query routing, actual execution/result handoff and supported water highlighting. Validate grid, bounds, CRS, band identity, scaling and NoData. Equal image dimensions do not prove registration.
5. Fix landing layout and load performance. Verify the full recording path and one report download.
6. Build a short HTML architecture animation and record. Broader PRD rewriting follows the working interaction.

Defer bulk datasets, a separate support chatbot, terrain/night catalog expansion, new cloud hosting, generic segmentation and sweeping training work today. Adaptation is still mandatory for the solution; the demo deadline does not remove it.

## Landing performance

The hero PNG is about 3 MB and appears in CSS and SVG. Optimize to a modern format, version its URL, preload the hero, lazy-load lower content and cache versioned public assets. Keep HTML revalidating and private API responses uncached. Fix hero/inset dimensions separately: caching cannot fix layout. Verify cold and warm loads. No service worker is needed for the recording.

## Owner's AWS steps

Services needed now: Amazon Bedrock, IAM and a billing alert. Keep Supabase and Vercel. Local FastAPI can serve the recording. No EC2, SageMaker, S3 bucket, Bedrock Agent, Knowledge Base or Google Maps key is required for this path.

1. In Bedrock choose N. Virginia (`us-east-1`), select Nova Pro and run a small playground test with your existing console identity.
2. IAM → Users → Create user `satquery-demo`, without console access. Attach the custom policy from `docs/aws-nova-policy.json`. This permits only Nova Pro invocation in Virginia. Do not create root access keys or grant AdministratorAccess to the app.
3. User → Security credentials → Create access key. Select the appropriate CLI/local use case. Copy key and secret directly into `backend/.env`, already created locally and ignored by Git. Do not paste credentials into chat.
4. The file contains `AWS_REGION=us-east-1`, `BEDROCK_MODEL_ID=amazon.nova-pro-v1:0`, and empty key/secret fields. Leave `AWS_SESSION_TOKEN` empty for ordinary IAM keys; temporary credentials require it.
5. Install backend requirements, then run `python scripts/check_bedrock.py` for a local presence check; `python scripts/check_bedrock.py --invoke` sends one small billable request. It reports AWS error codes without printing credentials. Existing process environment variables take precedence over the file.
6. If an inference profile is needed, diagnose and extend IAM to that profile and every destination model region. Do not merely change the ID under the single-region policy.
7. Start with `python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --env-file backend/.env`. Enable the private adapter using `SATQUERY_VISION_ENABLED=true` and a random `SATQUERY_VISION_TOKEN`. Authenticated UI wiring remains to be implemented.

Billing alerts notify; they are not hard spending limits. This project is inside OneDrive: an AWS profile outside the synced directory is preferable if credentials should not synchronize. Only nonsecret region/model identifiers belong in chat.

Nova is not sold through the third-party Marketplace subscription path. UPI alone does not explain a failed Nova call; inspect the error code, IAM, region and account/model availability.

## Workspace cleanup

Use this file as the current decision entry point and retain the PRD as the research reference. After the recording path is stable, archive superseded root handoffs and design iterations with links updated. Keep code, tests, migrations and source assets intact. Inventory generated logs/build output before removal. No files were deleted in this planning pass.

## Sources

- Supplied SIH26167 text and screenshots; judging-weight table absent.
- https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-pro.html
- https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html
- https://docs.aws.amazon.com/IAM/latest/UserGuide/access-key-self-managed.html
- https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-prereq.html
- https://earth-search.aws.element84.com/v1
- https://github.com/lx709/VRSBench
- https://github.com/YZHJessica/CDVQA
- https://txt.bigearth.net/
