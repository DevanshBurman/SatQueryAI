# SatQuery AI UI reference set

These generated images define the proposed visual direction for the prototype. They are design references, not screenshots of implemented functionality.

## Screens

1. `01-landing-page.png` — cinematic public landing page.
2. `02-guided-start.png` — first-time task selection and tutorial entry.
3. `03-temporal-analysis-workspace.png` — primary disaster-officer workflow.
4. `03b-temporal-workspace-collapsible-nav.png` — revised workspace with a compact, expandable application rail.
5. `04-add-imagery.png` — GeoTIFF upload, catalogue search, prepared scenarios and map AOI selection.

## Design system

- Near-black navy shell with deep-slate panels.
- Cyan for selections, evidence and primary actions.
- Amber only for warnings or secondary emphasis.
- Satellite imagery is the primary visual surface.
- Execution trace is observable workflow metadata, never hidden chain-of-thought.
- Public marketing navigation is used only on the landing page. The authenticated workspace uses a compact left rail that expands to reveal ordered destinations and nested workflows.
- The experience should remain implementable with React/Next.js, MapLibre GL and ordinary accessible web controls.

## Status language

Until a workflow is connected to live inference, label its result as an illustrative or prepared demonstration output. Do not present these references as proof of implementation.
