# SatQueryAI — five-hour implementation handoff

Send this entire file to the teammate and his coding agent. The goal is a **recordable, believable end-to-end demonstration**, not a broad rebuild.

## What Astra already completed

The current `main` branch contains:

- Supabase authentication, accounts, projects and query history from the teammate's work.
- The professional Projects, Discovery and Analysis workspace already merged with that work.
- Live public imagery search through Element 84 Earth Search STAC, with Sentinel-2 optical and Sentinel-1 SAR kept separate.
- GeoTIFF inspection and deterministic NDWI water-change calculation.
- A prepared local GeoTIFF demonstration path whose quantitative values are calculated from the files.
- A new protected Amazon Bedrock vision adapter supporting:
  - one optical or SAR image;
  - a same-modality temporal pair in earlier/later order;
  - one optical plus one SAR rendered pair.
- Strict input validation, an observable execution trace, usage metadata and honest limitations.
- A command-line test client at `scripts/ask_vision.py`.
- Nine passing backend tests covering catalogue filtering and the Bedrock adapter.

Important commits:

- `daa438b` — merged authenticated product and geospatial workspace.
- `3b7f99a` — protected configurable Bedrock/Nova adapter and tests.

The Nova endpoint is implemented but deliberately disabled until AWS is configured. The browser UI is **not yet connected to Nova**. Do not say it is connected until a real request succeeds.

## Use the active five-hour window in this order

### 0:00–0:20 — synchronize and establish the baseline

1. Pull `main` from `https://github.com/DevanshBurman/SatQueryAI.git`.
2. Read `AGENTS.md` and `AGENT_EXECUTION.md` before changing code.
3. Run:

```powershell
npm install
python -m pip install -r backend/requirements.txt
python -m pytest tests/test_vision.py tests/test_catalog.py -q
npm run build
```

4. Confirm the tree is clean. Preserve working authentication, project persistence and Discovery.

### 0:20–1:05 — create AWS safely and test Nova in the console

1. Open the official [AWS Free Tier page](https://aws.amazon.com/free/) and create a **new** AWS account.
2. Choose the **Free plan**, not Paid, if it allows Amazon Bedrock/Nova in the account. AWS currently says the Free plan gives new customers USD 100 immediately and up to USD 100 more through activities; it ends after six months or when credits are exhausted. New-customer eligibility applies only once.
3. Complete identity/payment verification if AWS requests it. For an AWS India account, supported methods include cards and UPI; UPI AutoPay may be used as an e-mandate.
4. After verification, check **Billing → Account plan** and confirm it still says Free. Do not join AWS Organizations or configure Control Tower; AWS says those actions automatically upgrade a Free-plan account.
5. If UPI/card AutoPay was enabled, it can be disabled under **Billing → Payment preferences → Disable AutoPay**. Also cancel the AWS e-mandate in the bank/UPI app if desired and verify the AWS console shows AutoPay disabled.
6. Do not promise “nothing can ever be charged.” The correct rule is:
   - Free plan: AWS says no usage charges unless the account is upgraded.
   - Paid plan: credits apply first, but usage beyond eligible credits is billable; disabling AutoPay does not cancel amounts owed.
7. In **Billing → Budgets**, create small email alerts (for example USD 1 and USD 5) and enable Free Tier/credit notifications before invoking models.
8. Open Amazon Bedrock in `us-east-1` (N. Virginia). Use the Chat/Text playground and select Amazon Nova Pro. Run one tiny text prompt, then one small image prompt. Record the exact working region and model/inference-profile ID shown by the console.
9. Prefer Amazon Nova during setup. Do not spend the five-hour window troubleshooting third-party model-provider access.

Likely values to test, then confirm in the account:

```text
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0
```

If the in-region ID is rejected, try the US geo inference profile shown by Bedrock:

```text
BEDROCK_MODEL_ID=us.amazon.nova-pro-v1:0
```

Do not guess in production; retain the identifier that actually succeeds in that account.

### 1:05–1:45 — connect the implemented backend locally

Use a least-privilege IAM user/role or the AWS CLI credential chain. Do not send credentials through chat and do not put them in Git, frontend code, `VITE_*`, screenshots or the recording.

Set these only in the local server process or an ignored local environment file:

```text
SATQUERY_VISION_ENABLED=true
AWS_REGION=<verified region>
BEDROCK_MODEL_ID=<verified Nova model or inference-profile ID>
SATQUERY_VISION_TOKEN=<random private value of at least 32 characters>
```

AWS credentials use the standard credential chain (`aws configure`, an AWS profile/role, or server-only `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN` when temporary).

Start the backend:

```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Check `http://127.0.0.1:8000/api/vision/status`. It should report `configured: true` without disclosing any secret or model identifier. Then render a small permitted PNG/JPEG and run:

```powershell
python scripts/ask_vision.py --image observation.png --modality optical --query "Describe the land cover and identify visible water."
```

Test one temporal pair and one optical–SAR pair using the examples in `BEDROCK_HANDOFF.md`. Save the real outputs and trace for later UI verification. Do not substitute canned answers if a call fails.

### 1:45–3:35 — connect the real product flow

This is the highest-value engineering task:

1. Carry the user's typed query, selected job and selected observations into a single workflow state owned by `AnalysisWorkspace`.
2. Make `Build analysis plan` generate a deterministic, editable plan based on the input configuration:
   - one image → visual VQA/description or grounding;
   - two same-modality dated images → temporal change;
   - one optical plus one SAR image → cross-modal analysis;
   - incompatible inputs → clear validation message, not a fake plan.
3. Preserve actual uploaded `File` objects. The current analysis chooser records uploaded filenames; fix this before claiming uploaded images are analyzed.
4. Let technical users edit only allowed parameters. Changes must affect the run; a button that merely says “Saved” is insufficient.
5. Route quantitative GeoTIFF water-change questions to the deterministic raster endpoint. Route qualitative rendered-image questions to the Nova adapter.
6. Do not put `SATQUERY_VISION_TOKEN` in browser JavaScript. Replace the temporary trusted-client token with server-side verification of the signed-in Supabase user, or add an authenticated server proxy that owns the private token.
7. Pass the **actual** result and execution trace into Results. Remove the current fixed `12.4 km²` result from ordinary runs. Prepared sample runs must remain visibly labelled “Prepared demonstration; values calculated from bundled GeoTIFFs.”
8. Make errors visible and recoverable: wrong file type, mismatched modality/count, missing model configuration, provider timeout and failed run.

For UI-specific composition, density, responsive behavior and screenshot matching, assign the task to **Astra**. Ask Astra to preserve the established white workspace, dark-blue/cyan rail, centered top workflow navigation, compact observation cards and 100% browser zoom on a 14-inch laptop. Do not redesign authentication or Discovery unless a tested bug blocks the recording.

### 3:35–4:25 — verify the complete story

Run the existing browser verification plus one new real workflow test:

1. Sign in.
2. Open/create a project.
3. Discover imagery or select a prepared sample.
4. Type a query.
5. Confirm the generated plan changes with job/input type.
6. Edit a permitted parameter and confirm execution uses it.
7. Run analysis and ensure Results displays the returned answer, visual evidence, limitations and execution trace.
8. Refresh and verify project/query history survives.
9. Test at 1440×900 and 1920×1080 at browser zoom 100%.
10. Run `python -m pytest -q`, `npm run build` and `git diff --check`.

No placeholder button, dead control or static fake result may appear in the recorded path. Features outside the recorded path may be labelled “Planned” or hidden.

### 4:25–5:00 — deploy, warm and prepare recording

1. Commit each verified coherent change. Push only after tests and build pass.
2. Put secrets only in Vercel server environment variables; never in `.env.example` values or `VITE_*` variables.
3. Redeploy, then warm the backend by completing one analysis before recording. Serverless cold starts have previously been slower than the warmed flow.
4. Run the exact recording path once against the public Vercel alias.
5. Capture a fallback local recording only if deployment blocks the core story.

## What the demo should claim

Safe, strong wording:

- “SatQuery turns a natural-language question and selected observations into a validated, editable execution plan.”
- “The prototype discovers public Sentinel imagery, validates input modality and count, routes to deterministic geospatial tools or a multimodal reasoning endpoint, and returns evidence plus an auditable trace.”
- “This build demonstrates the orchestration and product workflow; remote-sensing specialist fine-tuning and prescribed-benchmark evaluation are the next A40 phase.”

Do not describe Nova as the required remote-sensing-adapted model. It is the temporary general-purpose multimodal reasoning layer. The SIH requirement for domain adaptation and specialist benchmark results still needs the A40 training/evaluation phase.

## Paste this into the coding agent

> Continue SatQueryAI from `main`. First read `AGENTS.md`, `AGENT_EXECUTION.md`, `FRIEND_5_HOUR_HANDOFF.md`, and `BEDROCK_HANDOFF.md`; inspect the current implementation and Git status. Preserve the working Supabase auth/projects/history and Discovery UI. Use the active window only for the recorded end-to-end path: make the typed query and actual observations generate a validated editable workflow; preserve uploaded File objects; route quantitative GeoTIFF work to the deterministic endpoint and qualitative visual work to the protected Bedrock adapter; replace the temporary shared token with server-side Supabase-user authorization; carry actual outputs/trace into Results; remove static results from ordinary runs; add clear failure states. Use Astra for UI-specific composition and responsive polish. Verify single-image, temporal, optical–SAR and invalid-input paths; run backend tests, production build, browser verification at 100% zoom, `git diff --check`, then commit. Do not expose AWS secrets, invent model outputs, or rewrite unrelated working code. Report exactly what is real, prepared, or still pending.

## Official references checked for this handoff

- AWS Free Tier: https://aws.amazon.com/free/
- Plan behavior and limits: https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html
- India card/UPI and AutoPay controls: https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/edit-aispl-payment-method.html
- Nova Pro IDs and regional availability: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-pro.html
- Nova image request examples: https://docs.aws.amazon.com/nova/latest/userguide/modalities-image-examples.html
