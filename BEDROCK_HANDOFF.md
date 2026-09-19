# Optional Nova vision connection

Implemented: a protected Python Bedrock Converse adapter, input validation, actual query/image forwarding, provider answer, usage and observable execution trace. It supports one rendered observation, two same-modality observations in temporal order, or an optical–SAR pair. This is not a trained remote-sensing specialist, automatic registration, segmentation, or quantitative fusion. The existing frontend is not yet wired to this endpoint.

## Your friend's setup task

1. In AWS Bedrock, choose the region where your account can invoke Nova Pro. Copy its model or inference-profile ID. Do not guess these values from another account.
2. Set server variables `AWS_REGION`, `BEDROCK_MODEL_ID`, `SATQUERY_VISION_ENABLED=true`, and a private random `SATQUERY_VISION_TOKEN` of at least 32 characters. Provide AWS credentials through the standard AWS credential chain (local profile/role preferred; otherwise server-only access key and secret, plus session token for temporary credentials). Grant only the required Bedrock invocation permissions for your chosen profile/model.
3. Install `backend/requirements.txt`, export variables into the server process, and start `python -m uvicorn backend.main:app --port 8000`. Python does not automatically load the frontend's `.env.local`. On Vercel, set these in server environment settings and redeploy. Never prefix AWS settings or the demo token with `VITE_`.
4. GET `/api/vision/status` checks variable presence only. It does **not** verify permissions or model availability. The first authorized request does.
5. In a trusted terminal with `SATQUERY_VISION_TOKEN` set, run:

```powershell
python scripts/ask_vision.py --image observation.png --modality optical --query "Describe the land cover and identify visible water."
python scripts/ask_vision.py --task temporal --image earlier.png --modality optical --image later.png --modality optical --query "What changed between these observations?"
python scripts/ask_vision.py --task cross-modal --image optical.png --modality optical --image radar.png --modality sar --query "What complementary evidence supports water identification?"
```

Use prescribed benchmark images or previews rendered from licensed GeoTIFFs. PNG/JPEG here are model transport views, not a relaxation of the PS upload requirements. Dates, georegistration and modality labels must be verified upstream. Do not send private imagery without permission. Requests incur normal AWS charges once enabled.

## Next integration step

Connect the authenticated application backend to this adapter; do not embed the private token in the browser. Before enabling broad access, add per-user authorization, quotas and rate limiting. The current token gate is for trusted recording/testing clients only. Persist the actual answer/trace with the project and show a clear failure state rather than substituting a canned answer.

The deterministic GeoTIFF measurement path remains independent and works without Bedrock. Keep numeric measurements from that path separate from qualitative VLM descriptions. Training/adaptation, specialist benchmarks and confidence calibration remain separate work items for the A40 phase.

Reference: https://docs.aws.amazon.com/nova/latest/userguide/modalities-image-examples.html
