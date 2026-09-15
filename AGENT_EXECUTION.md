# SatQueryAI Agent Execution Protocol

Every agent must read this file in full before inspecting, changing, testing, committing, or publishing work in this repository.

## Mandatory workflow

1. Read this protocol and inspect `git status --short` before making changes.
2. Read the relevant implementation before editing it. Preserve unrelated user work.
3. Keep changes focused and reversible. Do not replace or discard broad files merely to undo a narrow change.
4. Verify the affected flow with an appropriate build, test, or visual check.
5. Review `git diff --check` and the intended diff before finalising work.
6. Create a Git commit for every coherent, verified implementation change. Do not leave implementation changes uncommitted at the end of a task unless the user explicitly directs otherwise.
7. Never push, rewrite history, reset, delete broad content, or use external credentials without explicit user authorisation.
8. State clearly when UI content, model output, imagery, or calculations are illustrative or prepared demonstrations.

## Product guardrails

- Preserve the established dark-blue/cyan SatQuery design language and the draggable workspace navigation.
- Before/after displays must not imply a validated real-world result unless their imagery, overlays, and labels are verified together.
- Keep the frontend prototype useful without claiming that an unconnected model has generated an answer.
