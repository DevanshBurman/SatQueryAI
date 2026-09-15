# SatQuery AI Classification and Confidence Handout

Version: **0.1.0**  
Last updated: **2026-09-09**  
Status: **Technical baseline for team discussion and implementation**  
Companion document: [SatQuery AI Product Requirements Document](./SATQUERY_PRD.md)

## 1. Why this handout exists

SatQuery needs to answer two different questions:

1. **What does the model predict?** For example, which land-cover classes appear in a scene?
2. **How much should a user trust that result?** For example, is the prediction calibrated, is the input valid, and do the available sensors support it?

These questions cannot be represented responsibly by one unexplained percentage. A classifier score, RemoteCLIP similarity, cloud coverage, optical-SAR agreement, segmentation probability, and confidence in an open-ended VQA answer all have different meanings.

This handout establishes the calculation, evaluation, UI, and explanation rules for SatQuery. It is written so teammates can defend the design in a presentation and an implementation agent can build it without inventing a confidence formula.

## 2. The decision

SatQuery will initially show a **confidence report**, not one universal confidence score.

The report has four independent parts:

| Part | Question answered | Example |
|---|---|---|
| Classification probability | How frequently is this class correct at this model score, within its validated domain? | `water present: 0.86, calibrated` |
| Input quality | Was the relevant part of the scene actually usable? | `valid optical coverage: 71%` |
| Evidence agreement | Do independent modality/tool outputs support or conflict with the claim? | `optical and SAR agree on 78% of the candidate region` |
| Claim support status | Does the final language answer have traceable evidence? | `supported`, `uncertain`, or `insufficient evidence` |

Only the first item may be displayed as a probability, and only after calibration on held-out labelled data representing the intended task and sensor domain.

For an open-ended answer such as “Flooding appears to have expanded near agricultural fields,” SatQuery should display the supporting measurements, quality limitations, and claim status. It should not turn the entire sentence into a percentage unless a separately evaluated answer-correctness model is built.

## 3. Classification in SatQuery

### 3.1 Single-label and multi-label classification

A **single-label** task assumes exactly one class is correct. Example:

```text
Scene type = {urban, agricultural, forest, water}
Choose exactly one.
```

A **multi-label** task allows several classes at once. A satellite patch can contain agriculture, forest, roads, and water simultaneously. BigEarthNet land-cover classification is multi-label, so SatQuery must not force those labels through an exactly-one-class assumption.

| Task | Output activation | Decision form |
|---|---|---|
| Single-label | Softmax over mutually exclusive classes | Select one class or abstain |
| Multi-label | Independent sigmoid probability per class | Select every class whose probability passes its class threshold |

For class `c`, a classifier produces a raw logit `z_c`. A multi-label model converts it to a raw probability-like score:

```text
p_raw(c) = sigmoid(z_c) = 1 / (1 + exp(-z_c))
```

This raw number is not automatically calibrated.

For a single-label model with `K` mutually exclusive classes:

```text
p_raw(c) = exp(z_c) / sum(exp(z_k) for k = 1..K)
```

A softmax value can also be overconfident. Normalising values to sum to one does not prove that they represent real-world correctness frequencies.

### 3.2 What classification component should we use?

SatQuery can evaluate three routes:

| Route | Use | Strength | Limitation |
|---|---|---|---|
| Dedicated supervised classifier | Supported closed label set | Clean logits, efficient inference, straightforward evaluation | Cannot answer arbitrary questions |
| RemoteCLIP or another image-text encoder | Zero-shot or few-shot label retrieval/classification baseline | Flexible text prompts and remote-sensing representations | Similarity is not a probability; prompt-sensitive |
| SatQuery VLM with structured class output | Classification within conversation | Shares visual reasoning and language interface | Generated text and token likelihood are harder to calibrate; may violate label format |

For land-cover probability, the preferred production path is a dedicated multi-label head built on a suitable optical/SAR encoder, or a calibrated linear probe on frozen embeddings. RemoteCLIP is valuable as a baseline and retrieval signal. The VLM can explain classifications and answer open questions, but it should not be the only source of a numerical probability until evaluated for that use.

### 3.3 RemoteCLIP calculation

RemoteCLIP maps an image and text into the same embedding space. Let:

```text
u = image_encoder(image) / ||image_encoder(image)||
v_c = text_encoder(prompt_for_class_c) / ||text_encoder(prompt_for_class_c)||
s_c = dot(u, v_c)
```

`s_c` is cosine similarity. It is useful for ranking prompts, retrieval, zero-shot classification, or as an input feature to another model. It is not “probability the answer is correct.” The official RemoteCLIP repository describes normalised embeddings and dot-product similarity for retrieval and supports zero-shot and linear-probe classification [R1].

Prompt ensembles can reduce wording sensitivity:

```text
"a satellite image containing water bodies"
"remote-sensing imagery of an open water region"
"an overhead scene with rivers, lakes, or reservoirs"
```

Encode all approved prompts for a class, normalise them, and average their embeddings before normalising again. Freeze the prompt templates before the final evaluation.

For mutually exclusive zero-shot classes, scaled similarities can be passed through softmax as a ranking distribution. For multi-label land cover, ordinary softmax is inappropriate because increasing the water score would mechanically reduce the forest score even when both are present. Use an independently trained/calibrated one-versus-rest mapping for each class, or a supervised multi-label head.

### 3.4 From logit to calibrated probability

Calibration asks whether predictions with probability near `0.8` are correct approximately 80% of the time on similar held-out data. It does not guarantee that any specific prediction is correct.

A simple binary temperature transformation is:

```text
p_cal(c) = sigmoid(z_c / T)
```

`T` is fitted on a calibration set by minimising negative log-likelihood. A more flexible per-class logistic calibration is:

```text
p_cal(c) = sigmoid(a_c * z_c + b_c)
```

The parameters `a_c` and `b_c` are fitted using calibration examples for class `c`. This is useful for multi-label predictions where classes have different prevalence and score distributions. Isotonic regression is another option when enough calibration data exists, but it can overfit small datasets.

Temperature scaling is a strong baseline for neural-network calibration, but its suitability must be tested rather than assumed. Modern networks are often miscalibrated even when their accuracy is good [R2].

### 3.5 Thresholds are decisions, not confidence

A calibrated probability must still be converted into a decision when SatQuery needs a label:

```text
predict class c as present if p_cal(c) >= threshold_c
```

Use a per-class threshold because “water” and “industrial area” may have different prevalence, label quality, and consequences. Choose thresholds on a validation set according to the intended objective:

- Maximise macro-F1 when treating all classes equally.
- Maximise micro-F1 when overall example-level performance matters more.
- Require a minimum precision where false alarms are expensive.
- Require a minimum recall where missing a candidate is more costly.
- Use explicit operational costs when stakeholders supply them.

Record the selected metric, dataset, class, threshold, and date. Do not tune thresholds on the final test set.

### 3.6 Class imbalance

Remote-sensing labels are often imbalanced. A model can achieve attractive aggregate accuracy by learning common classes and failing rare ones.

Report:

- Per-class precision, recall, F1, prevalence, and sample count.
- Macro-F1, which weights each class equally.
- Micro-F1, which aggregates decisions across all examples/classes.
- Mean average precision when supported by the benchmark.
- A confusion matrix for single-label tasks.
- False-positive and false-negative examples by sensor, geography, and season.

Never present only “overall accuracy” for a multi-label classifier.

## 4. Data splits required for honest confidence

Use four conceptually separate roles:

| Split | Used for |
|---|---|
| Training | Learn model parameters |
| Validation | Select architecture, hyperparameters, prompts, and thresholds |
| Calibration | Fit probability calibration after the model is frozen |
| Test | Report final untouched performance |

If data is limited, validation and calibration may be carefully subdivided or handled through cross-validation. The final test set remains untouched.

Split by geographic scene/group before producing crops or multiple Q&A records. Otherwise, near-identical neighbouring patches or alternate questions about the same scene may leak across splits and make both accuracy and calibration look stronger than they are.

Calibration is valid only for a stated domain, for example:

```text
Model: satquery-landcover-v1
Task: BigEarthNet 19-class multi-label presence
Input profile: Sentinel-2 L2A RGB+NIR recipe v1
Geography: evaluation split defined in dataset manifest
Calibration set: manifest hash ...
Calibrator: per-class logistic v1
```

A calibrated Sentinel-2 probability is not automatically calibrated on Cartosat, RISAT, a different resolution, or a new label definition.

## 5. Confidence for optical and SAR evidence

### 5.1 Keep modality predictions separate

For a class or claim `c`, store:

```text
p_optical(c)  # calibrated only for the optical model/domain
p_sar(c)      # calibrated only for the SAR model/domain
q_optical     # explicit optical quality fields
q_sar         # explicit SAR quality fields
```

Do not average `p_optical` and `p_sar` by default. They can have different tasks, label semantics, calibration quality, and failure modes.

The evidence report can initially say:

```text
Optical evidence: supports water, calibrated probability 0.83
Optical quality: 42% cloud-obscured in the selected area
SAR evidence: supports smooth-surface/water candidate, calibrated probability 0.76
SAR quality: product calibration confirmed; 91% valid coverage
Relationship: agreement on most of the candidate region
Final claim status: supported with limitations
```

This is more defensible than computing `(0.83 + 0.76) / 2 = 79.5% confidence`.

### 5.2 Quality is not model confidence

Optical quality may include valid coverage, cloud/cloud-shadow coverage, saturation, haze indicators, spatial resolution, and temporal distance from the requested event.

SAR quality may include product level, known units, calibration status, terrain correction, valid coverage, incidence-angle coverage, layover/shadow masks when available, polarisation availability, and temporal distance.

Pair quality includes geographic overlap, residual alignment error, common valid area, acquisition-time difference, and compatible analysis scale.

Display these measurements directly. Avoid multiplying them into a single score until a labelled outcome model proves the combination meaningful.

### 5.3 Cross-modal agreement

Agreement is computed for compatible outputs over the common valid area. For binary masks `M_o` and `M_s`, one possible spatial agreement statistic is intersection over union:

```text
IoU(M_o, M_s) = area(M_o AND M_s) / area(M_o OR M_s)
```

Agreement can also be reported as overlap relative to one modality, since optical and SAR tools may describe different but related phenomena:

```text
optical_supported_by_sar = area(M_o AND M_s) / area(M_o)
```

These values describe overlap between outputs. They do not measure correctness unless compared with ground truth.

For scene-level labels, agreement can be categorical:

- `agree_present`
- `agree_absent`
- `conflict`
- `one_modality_unavailable`
- `not_comparable`

Agreement between two correlated models is weaker evidence than independent ground truth. Both may share label bias, training geography, or preprocessing errors.

### 5.4 Learned fusion probability

Once SatQuery has labelled paired optical/SAR validation data, it can train a small meta-model or fusion head. For class `c`, an illustrative logistic fusion model is:

```text
x_c = [
  optical_logit_c,
  sar_logit_c,
  optical_valid_fraction,
  sar_valid_fraction,
  cloud_fraction,
  registration_error,
  acquisition_time_gap,
  modality_available_flags
]

p_fused(c) = sigmoid(w_c . x_c + b_c)
```

Train this on paired labelled data, calibrate it on a separate calibration set, and compare it against optical-only and SAR-only baselines. Learned fusion is justified only if it improves the defined task or provides a documented robustness advantage.

The formula above is a design pattern, not a pretrained SatQuery equation or a claim that every quality feature should be used.

## 6. Confidence for masks and geographic regions

A segmentation or change model can output a probability per pixel:

```text
P[y_pixel = target | input]
```

A threshold converts this probability map into a binary mask. Choose and evaluate the threshold on held-out data. Report segmentation metrics such as IoU, precision, recall, and F1 over valid pixels.

Do not call the mean pixel probability inside a predicted region “probability the whole region is correct.” A region can contain a high-confidence core and an inaccurate boundary.

For a region, store useful descriptors separately:

- Mean, median, and low quantile of pixel scores.
- Region area and perimeter.
- Fraction excluded by cloud/no-data/layover masks.
- Threshold used.
- Whether the region survives small threshold changes.
- Model/checkpoint and input profile.
- Overlap with supporting evidence.

If a region-level probability is needed, train and calibrate a region-level correctness model against region ground truth. Candidate inputs can include score distribution, size, shape, quality, and sensor agreement. The target must be defined, such as `IoU >= 0.5`, because “region correct” otherwise has no precise meaning.

Area is calculated from the georeferenced mask or polygon using GIS code. Model confidence does not calculate hectares.

## 7. Confidence for VQA and generated answers

### 7.1 Closed questions

For binary or multiple-choice VQA with a fixed answer set, SatQuery can evaluate class/token logits and calibrate the resulting answer probabilities on held-out examples. The exact answer extraction rules must be frozen before testing. BigEarthNet.txt evaluates binary VQA and MCQ using accuracy, demonstrating that instruction-following and extractable output are part of the problem [R3].

If an API does not expose complete stable logits for the candidate choices, do not invent a probability from the generated text. Use a separate structured classifier or report an uncalibrated model choice.

### 7.2 Open-ended questions

For answers such as:

> Vegetation appears reduced in the eastern fields, while the western area remains broadly stable.

one number is especially misleading. Decompose the answer into claims:

```json
[
  {
    "claim": "Vegetation-index decline is present in the eastern fields.",
    "type": "measured_observation",
    "evidence_ids": ["ndvi-difference-1", "region-statistics-1"],
    "status": "supported"
  },
  {
    "claim": "The decline was caused by drought.",
    "type": "causal_interpretation",
    "evidence_ids": [],
    "status": "insufficient_evidence"
  }
]
```

The final composer may include the first claim and either omit or clearly qualify the second. The useful trust mechanism is evidence coverage and claim status, not the VLM saying it feels 92% confident.

### 7.3 Claim support states

| State | Meaning | UI wording |
|---|---|---|
| `supported` | Required evidence exists, quality gates pass, and no critical conflict remains | Supported by the listed observations |
| `supported_with_limitations` | Evidence supports the claim, but coverage/quality limits its scope | Supported in valid areas; see limitations |
| `uncertain` | Some evidence exists but it is near threshold, conflicting, or weak | Uncertain; additional evidence recommended |
| `insufficient_evidence` | Required modality, baseline, resolution, or valid coverage is absent | Insufficient evidence for this conclusion |
| `unsupported` | Available evidence contradicts the claim | Not supported by the current analysis |

These are policy states, not calibrated probabilities. Define the required evidence by workflow. For example, “current water candidate” and “flood expansion” have different requirements; expansion needs a comparable baseline.

### 7.4 Answer consistency checks

Before returning an answer:

1. Verify every numeric value against a stored measurement.
2. Verify class names against the task taxonomy.
3. Verify scene/date/modality references.
4. Verify boxes/masks against artifact IDs and coordinate conventions.
5. Check that the wording does not strengthen an observation into unsupported cause.
6. Attach excluded coverage and relevant input limitations.
7. Mark claims that lack required evidence.

Language-model self-consistency, repeated sampling, or agreement among generated answers may be diagnostic. None becomes a correctness probability without a labelled calibration study.

## 8. The SatQuery confidence report

### 8.1 Proposed result contract

```json
{
  "schema_version": "1.0",
  "claim_id": "claim-water-001",
  "claim": "A water body is present in the selected region.",
  "support_status": "supported_with_limitations",
  "classification": {
    "task": "landcover_presence",
    "class": "water",
    "decision": "present",
    "probability": 0.86,
    "calibrated": true,
    "calibration_domain": "sentinel2-l2a-profile-v1",
    "threshold": 0.63,
    "model_version": "satquery-optical-cls-v1"
  },
  "quality": {
    "valid_coverage_fraction": 0.71,
    "cloud_fraction": 0.29,
    "registration_status": "not_applicable"
  },
  "evidence": [
    {"artifact_id": "optical-water-mask", "role": "primary"},
    {"artifact_id": "sar-water-candidate-mask", "role": "corroborating"}
  ],
  "agreement": {
    "status": "agree_present",
    "metric": "optical_supported_by_sar",
    "value": 0.78,
    "is_correctness_probability": false
  },
  "limitations": [
    "Twenty-nine percent of the selected optical region was excluded by the cloud mask."
  ]
}
```

All values in this example are illustrative. They must never appear as hardcoded demo results.

### 8.2 When probability must be null

Set `probability: null` and `calibrated: false` when:

- The model output is a raw RemoteCLIP similarity.
- No held-out calibration set exists.
- The sensor/input profile differs materially from the calibration domain.
- The task or label meaning changed.
- The model/checkpoint or preprocessing recipe changed without recalibration.
- The answer is open-ended and no evaluated correctness model exists.
- The output was produced by a heuristic whose frequency interpretation is unknown.

### 8.3 UI design

Display a compact result first:

```text
Water: present
Estimated probability: 86% (calibrated for Sentinel-2 profile v1)
Evidence: optical + SAR agree over 78% of the optical candidate region
Coverage: 71% of selected optical area valid
Assessment: supported with limitations
```

Tooltips or the expanded evidence panel must explain:

- Probability meaning and calibration domain.
- Threshold and model version.
- Why pixels were excluded.
- Whether agreement is an overlap measure or a probability.
- Which artifacts support the claim.

If uncalibrated:

```text
Model signal: strong relative match
Probability: unavailable — this model/domain has not been calibrated
Assessment: uncertain
```

Avoid confidence progress bars for uncalibrated values. Their visual language strongly implies probability.

## 9. Implementation blueprint

### 9.1 Required stored artifacts

```text
configs/taxonomies/landcover-v1.yaml
configs/prompts/remoteclip-landcover-v1.yaml
configs/thresholds/model-version.json
evaluation/manifests/train.jsonl
evaluation/manifests/validation.jsonl
evaluation/manifests/calibration.jsonl
evaluation/manifests/test.jsonl
evaluation/calibration/calibrator-version.*
evaluation/reports/model-version.md
```

Every report records source hashes, dataset versions, geographic grouping, preprocessing recipe, checkpoint revision, calibration method, thresholds, and metrics.

### 9.2 Classification pipeline

```text
Validated scene / tile / AOI
            |
            v
Sensor-specific preprocessing recipe
            |
            v
Classifier or embedding model -> raw logits/similarities
            |
            v
Frozen calibrator -> per-class probabilities, when valid
            |
            v
Frozen per-class thresholds -> decisions
            |
            v
Quality + evidence + provenance report
```

### 9.3 Pseudocode

```python
def classify_landcover(scene, aoi, model, calibrator, thresholds):
    profile = validate_supported_profile(scene)
    prepared = preprocess(scene, aoi, recipe=profile.recipe_version)

    raw_logits = model.predict_logits(prepared.model_input)
    calibration_valid = calibrator.supports(
        model_version=model.version,
        recipe_version=profile.recipe_version,
        sensor_profile=profile.id,
        taxonomy_version=thresholds.taxonomy_version,
    )

    probabilities = (
        calibrator.transform(raw_logits)
        if calibration_valid
        else None
    )

    results = []
    for class_id in thresholds.class_ids:
        probability = probabilities[class_id] if probabilities else None
        decision = (
            probability >= thresholds[class_id]
            if probability is not None
            else None
        )
        results.append({
            "class_id": class_id,
            "raw_logit": raw_logits[class_id],
            "probability": probability,
            "calibrated": calibration_valid,
            "threshold": thresholds[class_id] if calibration_valid else None,
            "decision": decision,
        })

    return {
        "predictions": results,
        "quality": prepared.quality,
        "profile": profile.id,
        "model_version": model.version,
        "provenance": prepared.provenance,
    }
```

### 9.4 Calibration procedure

1. Freeze the trained model, taxonomy, prompts, and preprocessing recipe.
2. Generate raw logits for the untouched calibration manifest.
3. Fit the chosen calibrator without updating the classifier.
4. Evaluate negative log-likelihood, Brier score, ECE/reliability diagrams, and discrimination metrics before and after calibration.
5. Select decision thresholds on the designated validation/calibration policy without using the final test labels.
6. Freeze and version calibrator plus thresholds.
7. Evaluate once on the final test manifest.
8. Inspect performance by class, sensor/profile, geography, season, quality bin, and probability bin.
9. Promote only if calibration improves without breaking the classification objective.

Expected Calibration Error is useful but depends on binning and can hide class-specific failures. Always include reliability diagrams and at least one proper scoring rule such as Brier score or negative log-likelihood.

### 9.5 Recalibration triggers

Recalibrate after changing:

- Model weights or classification head.
- Input composites, normalisation, tile size, or band recipe.
- Label taxonomy or prompt templates.
- Sensor/product profile.
- Geographic deployment domain when monitoring shows drift.
- Quality filters that materially change evaluated examples.

Recalibration does not repair a model that cannot discriminate classes. First check precision/recall, AUROC/mAP, and examples; calibration only maps scores to better probability estimates.

## 10. Evaluation gates

### CONF-GATE-001 — Basic classifier validity

- Dataset split has no known scene/location leakage.
- Multi-label task uses independent class outputs.
- Class frequencies and sample counts are reported.
- Per-class and macro/micro metrics are reproducible.
- Predictions reference a pinned model and preprocessing recipe.

### CONF-GATE-002 — Calibration validity

- Calibrator is fitted after the classifier is frozen.
- Calibration and final test data are separate.
- Reliability diagrams and proper scoring rules are reported.
- Calibration domain is explicit.
- Uncalibrated or out-of-domain runs return no probability.

### CONF-GATE-003 — Cross-modal validity

- Optical-only and SAR-only baselines are reported.
- Paired method is evaluated on the same examples.
- Missing and shuffled modality tests are included.
- Quality and registration effects are analysed.
- Agreement is labelled as agreement, not correctness probability.

### CONF-GATE-004 — Answer-support validity

- Numeric statements match stored measurements.
- Each substantive claim points to evidence.
- Unsupported causal claims are rejected or qualified.
- Invalid coverage and missing inputs affect claim status.
- Open-ended answer probability remains unavailable until separately evaluated.

## 11. Questions teammates and judges may ask

### Q1. What does a confidence score mean?

It has no useful meaning until we name the event and domain. “86%” may mean estimated probability that a class is present for a specific calibrated classifier. It does not mean the entire generated answer is 86% correct.

### Q2. Why can we not use the model's softmax or sigmoid directly?

Neural networks can be overconfident. Calibration tests whether score levels correspond to observed correctness frequencies on held-out data. The calibration literature shows that modern networks can be poorly calibrated even when accurate [R2].

### Q3. Is RemoteCLIP similarity our confidence score?

No. It measures alignment between image and text embeddings and supports retrieval and zero-shot classification [R1]. We can use it as a feature or relative compatibility signal. To call it a probability, we must fit and evaluate a mapping against labelled outcomes for a defined task.

### Q4. Can we convert cosine similarity to a percentage by multiplying by 100?

No. A cosine similarity of `0.81` is not automatically an 81% correctness probability. Even its range and distribution depend on the encoder, prompts, and data.

### Q5. Can we apply softmax to RemoteCLIP similarities?

For a mutually exclusive zero-shot label set it can create a relative distribution over the supplied prompts. It still needs calibration for probability language. For multi-label land cover, softmax is structurally wrong because several labels can be true simultaneously.

### Q6. How do we calculate multi-label classification?

Produce one logit per class, apply a sigmoid or calibrated one-versus-rest mapping, then compare each calibrated probability with its class-specific threshold.

### Q7. Why have different thresholds per class?

Classes differ in prevalence, visual difficulty, label noise, and false-positive/false-negative cost. One threshold can severely hurt rare or difficult classes.

### Q8. Who decides the threshold?

The team declares an optimisation policy before final testing. For research benchmarks this may maximise macro-F1. An operational stakeholder may instead require minimum precision or recall. The final test set never selects thresholds.

### Q9. What does calibrated 80% mean?

Across similar held-out cases that receive predictions around 0.8, approximately 80% should be correct for the defined event. It remains possible for the current case to be wrong.

### Q10. Is probability valid for every satellite?

No. It is valid only within the evaluated domain. A Sentinel-2 calibration should not be relabelled as a RISAT or Cartosat calibration.

### Q11. What happens on an unknown sensor?

SatQuery can still ingest metadata or produce a visual preview where safe, but it marks classification probability unavailable unless a supported profile and calibration domain match. The UI explains the unsupported condition.

### Q12. How do optical and SAR probabilities combine?

Initially they do not collapse into one number. Show each prediction, quality, and agreement. Later, train and calibrate a fusion model using paired labelled data, and compare it against both single-modality baselines.

### Q13. Why not average them?

Their errors, meanings, and calibrations can differ. Averaging assumes comparable probabilities and equal relevance. It also ignores cloud coverage, radar processing, alignment, and missing modalities.

### Q14. If optical and SAR agree, is confidence high?

Agreement is useful corroboration, but it is not proof. Both can be wrong or their outputs may represent related but different physical properties. We report agreement and evaluate whether it improves predictions.

### Q15. How is agreement calculated?

For masks, use a declared spatial overlap statistic such as IoU over the common valid area. For class decisions, record agreement, conflict, missing, or not-comparable states. Neither is automatically a probability.

### Q16. How is cloud cover reflected?

Cloud-obscured pixels are excluded from affected optical computations and valid coverage is reported. Cloud fraction is a quality field. It does not simply subtract a fixed percentage from model confidence.

### Q17. How is change-detection confidence calculated?

The detector can provide pixel scores and a thresholded mask. We evaluate those outputs against reference masks using IoU, precision, recall, and F1. Region-level probability requires a separately defined and calibrated correctness target.

### Q18. Is the average probability inside a mask its confidence?

It describes the model scores inside that mask, not the probability that its boundary or entire region is correct. Store score distribution and validate region quality against reference geometry.

### Q19. Can the VLM tell us its own confidence?

It can express uncertainty in language, but self-reported confidence is not a calibrated measurement. For closed answers we can evaluate logits when available; for open answers we use evidence-linked claim states.

### Q20. Can token probability give answer confidence?

Token probabilities measure how likely the model considered a sequence under its language model. Fluent wrong answers can have high likelihood. Any conversion to factual correctness needs an evaluated answer-level model.

### Q21. How do we score an open-ended answer?

Break it into claims, verify measurements and references, attach evidence, and assign support states. Offline evaluation can also use benchmark metrics and human factuality review. The user-facing system does not need a fake universal percentage.

### Q22. What makes the system explainable?

It records the sensor profile, preprocessing, model, calibrator, thresholds, quality, evidence artifacts, measurements, and claims. A user can see why a conclusion was made and where its limits lie.

### Q23. What makes this better than “confidence: high”?

Every displayed value has a defined calculation and domain. Unsupported probability is omitted. The report separates the model's prediction from input quality and evidence agreement.

### Q24. How do we prove fine-tuning improved confidence?

Compare the base and adapted models on the same held-out test set. Report classification metrics and calibration metrics. Fine-tuning may improve accuracy while worsening calibration, so both must be measured.

### Q25. Can calibration fix a bad classifier?

No. It adjusts the mapping between scores and observed frequencies. It cannot recover visual information, repair wrong labels, or make an indiscriminate model accurate.

### Q26. What about rare classes?

Report their sample counts and per-class metrics, use suitable training strategies, and avoid probability claims when calibration data is insufficient. A rare class may need wider uncertainty estimates or an abstention policy.

### Q27. How do we handle class names with vague boundaries?

Version the taxonomy and annotation rules. “Urban fabric,” “settlement,” and “built-up area” are not automatically interchangeable. Probability is attached to the exact class definition used in training and evaluation.

### Q28. Why split data by geography?

Random crop-level splitting can place nearly identical locations in training and testing. Geographic grouping better tests transfer and prevents inflated confidence.

### Q29. What do we show in tomorrow's idea presentation?

Explain the confidence report design and state that probabilities will be calibrated on held-out data. Use clearly labelled illustrative UI values if needed. Do not claim that calibration experiments have already been completed.

### Q30. What should our strongest claim be?

> SatQuery separates predictions from trust evidence. It calibrates class probabilities within tested sensor domains, reports input quality and cross-sensor agreement independently, and connects generated conclusions to measurable spatial evidence.

## 12. Statements to avoid and replacements

| Avoid | Use instead |
|---|---|
| “RemoteCLIP gives real confidence from 0 to 1.” | “RemoteCLIP provides an image-text compatibility signal; probability requires supervised calibration.” |
| “The answer is 92% correct.” | “The water classifier estimates 92% probability within its validated Sentinel-2 domain; the broader explanation has listed evidence and limitations.” |
| “Optical and SAR agree, so it is definitely a flood.” | “Both modalities support a water/flood candidate in the region; final interpretation depends on temporal baseline and context.” |
| “Cloud cover reduces confidence by 30%.” | “Thirty percent of optical coverage was excluded; results apply to the remaining valid area.” |
| “Average model probability is mask confidence.” | “The predicted region has this pixel-score distribution; geometric accuracy is evaluated separately.” |
| “Fine-tuning raised confidence from 43% to 81%.” | “On the named held-out test set, the adapted model changed the named accuracy and calibration metrics from X to Y.” |
| “A confidence bar proves explainability.” | “The evidence panel records the calculation, domain, sources, limitations, and spatial artifacts.” |

## 13. Recommended build sequence

1. Finalise one versioned label taxonomy and scene profile.
2. Create geographic train, validation, calibration, and test manifests.
3. Implement an optical multi-label baseline with reproducible logits.
4. Report per-class classification metrics before adding confidence UI.
5. Fit and evaluate a simple calibrator.
6. Freeze per-class thresholds and produce a versioned calibration report.
7. Add quality fields and support states to the result schema.
8. Integrate RemoteCLIP as a comparison/retrieval baseline, labelled as similarity unless calibrated.
9. Add SAR-only classification/evidence with its own profile and evaluation.
10. Implement agreement reporting.
11. Test a learned fusion model only after both single-modality baselines work.
12. Add claim-level support for VQA answers and prevent unverified probabilities.

## 14. Sources

- **R1:** [RemoteCLIP official repository](https://github.com/ChenDelong1999/RemoteCLIP) — normalised image/text embeddings, dot-product retrieval, and downstream classification uses.
- **R2:** [On Calibration of Modern Neural Networks](https://proceedings.mlr.press/v70/guo17a.html) — calibration definition and temperature-scaling baseline.
- **R3:** [BigEarthNet.txt official site and benchmark](https://txt.bigearth.net/) — paired Sentinel-1/Sentinel-2 text data and task metrics.
- **R4:** [BigEarthNet v2 official archive](https://bigearth.net/) — multi-label land-cover dataset description.
- **R5:** [SatQuery AI PRD](./SATQUERY_PRD.md) — product architecture, model responsibilities, evidence policy, and release gates.

## 15. Versioning and change log

Use semantic document versions:

- Patch: clarifications or corrected calculations without changing the system contract.
- Minor: new confidence type, calibration method, schema field, or decision policy.
- Major: incompatible meaning of a user-visible probability or evidence state.

Any future change to probability meaning must record the affected model, taxonomy, sensor profile, calibration dataset, UI label, API schema, and migration requirement.

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-09-09 | Initial classification, calibration, cross-modal agreement, segmentation, VQA support, UI, implementation, and Q&A baseline |

