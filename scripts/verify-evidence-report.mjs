import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ts from 'typescript'

const require = createRequire(import.meta.url)
await mkdir('tmp/pdfs', { recursive: true })
await mkdir('output/pdf', { recursive: true })
const bundled = resolve('tmp/pdfs/evidence-report-builder.cjs')
const sourceCode = await readFile('frontend/src/evidenceReport.ts', 'utf8')
await writeFile(bundled, ts.transpileModule(sourceCode, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)
const { createEvidenceReport } = require(bundled)
const sources = JSON.parse(await readFile('backend/samples/manifest.json', 'utf8'))
const source = sources.find(item => item.id === 'wide-after')
const image = JSON.parse(execFileSync('python', ['-c', 'import json; from backend.studio import samples; print(json.dumps(next(item["image"] for item in samples() if item["id"] == "wide-after")))'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }))
const pdf = createEvidenceReport({
  query: 'Describe the land cover and major visible features in this image.',
  answer: 'LAYOUT PREVIEW ONLY - NO MODEL RESPONSE. This page demonstrates the report format with a prepared Upper Lake source image. It must not be presented as an analysed result.',
  mode: 'Illustrative layout preview', task: 'single-image', elapsedSeconds: 1.2,
  evidenceImages: [{ label: source.label, date: source.date, image }],
  sources: [source],
  limitations: [
    'This sample PDF is a layout preview, not an AI interpretation or measured result.',
    'The 10 m crop cannot resolve features smaller than mixed pixels; no crop cloud mask was applied.',
    'This wider landscape footprint must not be compared pixel by pixel with the shoreline crop.',
    'Pagination check: the source scene cloud-cover value does not describe cloud or shadow in this crop. A rendered preview cannot verify the boundary of a mixed pixel, and a source-level cloud estimate must not be treated as a crop mask. The larger landscape footprint also cannot be registered against the smaller shoreline crop by appearance alone. This complete caution is intentionally long so the layout test checks that a paragraph moves together to the next page.',
  ],
  trace: [{ tool: 'report-layout-preview', detail: 'Formatting verification only; no Bedrock invocation', status: 'illustrative' }],
})
const destination = resolve('output/pdf/SatQuery-evidence-report-layout-sample.pdf')
pdf.save(destination)
console.log(destination)
