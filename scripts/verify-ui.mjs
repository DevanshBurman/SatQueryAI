import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

await fs.mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ headless: true, channel: 'msedge' })
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 960 }, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Open workspace', exact: true }).first().click()
  await page.getByRole('heading', { name: 'Projects', exact: true }).waitFor()
  await page.screenshot({ path: 'test-results/01-projects.png', fullPage: true })

  await page.getByRole('button', { name: 'Open project' }).click()
  await page.getByRole('heading', { name: 'Find observations' }).waitFor()
  assert.equal(await page.locator('.maplibregl-canvas').count(), 1)
  await page.screenshot({ path: 'test-results/02-data.png', fullPage: true })

  await page.getByRole('button', { name: /Add 3 layers to project/ }).click()
  await page.getByRole('heading', { name: 'What do you want to learn?' }).waitFor()
  await page.screenshot({ path: 'test-results/03-choose-analysis.png', fullPage: true })

  await page.getByRole('button', { name: 'Build analysis plan' }).first().click()
  await page.getByRole('heading', { name: 'Review analysis plan' }).waitFor()
  await page.getByRole('button', { name: 'Edit' }).first().click()
  await page.getByRole('button', { name: 'Saved' }).waitFor()
  await page.screenshot({ path: 'test-results/04-plan.png', fullPage: true })

  await page.getByRole('button', { name: /Run analysis/ }).click()
  await page.getByRole('heading', { name: 'Temporal water-change analysis' }).waitFor()
  const rasterInputs = page.locator('.upload-pair input')
  await rasterInputs.nth(0).setInputFiles('backend/data/demo_before.tif')
  await rasterInputs.nth(1).setInputFiles('backend/data/demo_after.tif')
  await page.getByRole('button', { name: 'Run measured analysis' }).click()
  await page.getByText('Analysis complete', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Open result' }).waitFor()
  await page.screenshot({ path: 'test-results/05-connected-run.png', fullPage: true })
  await page.getByRole('button', { name: 'Open result' }).click()
  await page.getByRole('heading', { name: /Flood extent result/ }).waitFor()
  await page.getByRole('button', { name: 'SAR evidence' }).click()
  await page.screenshot({ path: 'test-results/06-results.png', fullPage: true })

  await page.getByRole('button', { name: 'Activity' }).click()
  await page.getByRole('heading', { name: 'Activity & reports' }).waitFor()
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('heading', { name: 'Workspace settings' }).waitFor()
  assert.deepEqual(errors, [])
  console.log('PASS: Projects → Data → Choose analysis → Plan → Results, secondary navigation, and MapLibre rendered without runtime errors.')
} finally {
  await browser.close()
}
