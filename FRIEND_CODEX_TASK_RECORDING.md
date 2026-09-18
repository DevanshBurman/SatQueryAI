# Friend's Codex task — recording build, 20 September 2026

## Context and ownership

We are recording core features by tomorrow. Judges receive a video, not a demo URL. Keep a reliable hosted build for team access, but do not spend the night making a public production service. No model training is required for this recording milestone. An A40 with 48 GB VRAM may become available through college after screening; this is future capacity, not currently deployed inference.

Available planned baseline: AWS Bedrock Nova Pro, subject to confirming account region, model access and invocation permissions. Do not claim it is a fine-tuned Qwen, TEOChat or learned fusion checkpoint.

Your ownership: hosting + Supabase authentication/projects, then the server-side Bedrock adapter. The other Codex owns Data/Analysis UI and workflow integration. Do not redesign the landing page, navigation or DiscoveryPage.tsx. Read AGENT_EXECUTION.md and SIH26167_DEMO_STRATEGY_AND_TEAM_HANDOFF.md first. Use a separate branch and deliver commit IDs; do not overwrite the other owner's files.

## First deliverable: finish what you have started

1. Deploy the current Vite frontend. Preserve environment-specific API routing: Vite's local proxy does not exist in the deployed static bundle.
2. Configure Supabase auth and a minimal projects table: ID, owner user ID, title, created_at, updated_at. Add project-owned observations/runs only if needed for the agreed contract.
3. Enable row-level security. User A must not read/write User B's projects. Test this with two accounts. Browser gets only the publishable/anon key; no service-role key or AWS credentials.
4. Use one pre-created demo account. Verify sign-in, create project, rename, reopen after refresh and sign-out. Avoid spending video time on email verification or onboarding.
5. Provide frontend teammate with project/auth service functions or a narrow integration file, deployment URL, callback URL requirements, environment variable NAMES, and a short setup note. Do not send secrets through chat or Git.

## Second deliverable: small Nova Pro backend adapter

Use current AWS documentation for the account's region and supported Nova Pro model/inference-profile ID. Confirm image limits, supported formats, SDK request schema and model access with a minimal real request. Do not guess IDs or ship fake success when permissions fail.

Prefer adding to the existing FastAPI backend rather than creating an unrelated second backend. Keep AWS calls server-side. If using a separate service for speed, agree its URL/auth/CORS contract first. A frontend deployment alone cannot run the existing Python raster service.

Implement an authenticated, rate-limited endpoint for an image question. Accept the user's actual text and uploaded image bytes/references with project ownership checks. Validate size/type; convert geospatial inputs into appropriately labelled previews through the existing raster path, not by sending raw GeoTIFF bytes as JPEG. Return request ID, answer, provider/model ID, input IDs, limitations and execution mode. Start with a real single-image VQA/caption response.

Then implement structured planning only if time remains: question + asset metadata -> permitted task, input requirements, tool steps, bounded parameters, clarification if insufficient. Server validates the proposal against a registry. Do not let the model choose arbitrary executable code, URLs or file paths. Don't return fabricated measurements; numerical outputs belong to actual tools.

Shared proposed types from the main handout:

- Asset: ID, owner/project, stored reference, format, modality, sensor, acquisition time, CRS, bounds, bands, preview.
- Plan: ID/revision, original question, asset IDs, task, permitted steps/parameters, clarification requests.
- Run: ID, plan revision, status, step trace, answer, evidence references, limitations, execution mode.

Coordinate endpoint names before frontend integration. The main handout proposes /api/assets, /api/plans, /api/runs; do not independently invent a conflicting contract.

## Recording reliability

- Save three known scenario input sets: single image, temporal pair, optical–SAR pair. Do not claim a generic Nova response is validated specialist fusion.
- Cache actual completed responses against the precise question and asset IDs for replay, or use an explicitly prepared scenario. An arbitrary new question cannot silently receive the cached flood answer.
- Persist projects and lightweight run metadata; private imagery belongs in access-controlled storage, not a public bucket by default.
- Handle timeout, quota, missing access and unavailable service with a clear error. Avoid an endless spinner during recording.
- Keep the local frontend/backend path runnable if hosting integration delays recording. Public URL submission is not required.

## Acceptance / handback

- Hosted UI loads at 100% zoom; login and project persistence work.
- Cross-account project access is denied.
- A real Nova Pro image question returns a response; a different question affects the request and answer.
- No AWS/service-role secrets in frontend assets, logs or Git.
- Give the teammate: branch/commit IDs, tested endpoint contract, required env names, model region/access confirmation, setup commands and known limitations.
- Do not add payments, roles/teams, social-login providers, vector databases, model training or enterprise features tonight.

## Video wording

Present the full target architecture confidently. Describe the recording build as the interactive prototype, Nova Pro as its current baseline where used, and the adapted specialists as the next engineering milestone. “Actively benchmarking” needs actual recorded experiments; otherwise describe the planned benchmark programme. Keep this distinction on the architecture/status slide and run provenance, not as repeated interruptions throughout the video.
