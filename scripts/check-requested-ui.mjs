import { chromium } from 'playwright'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ headless: true, channel: 'msedge' })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.setDefaultTimeout(15000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Open workspace', exact: true }).first().click()
  await page.getByRole('heading', { name: 'Good evening, Devansh.' }).waitFor()
  await page.screenshot({ path: 'output/product-dashboard.png', fullPage: true })

  const rail = page.locator('.app-rail')
  assert.equal(Math.round((await rail.boundingBox()).width), 64)
  await rail.hover()
  await page.waitForTimeout(300)
  assert.ok((await rail.boundingBox()).width > 230)

  for (const [name, heading] of [
    ['SatQuery Copilot', 'What is inside the selected region?'],
    ['Change Intelligence', 'What changed between these rasters?'],
    ['Multimodal Fusion', 'Do optical and SAR agree?'],
    ['Geo Intelligence', 'What can be measured here?'],
  ]) {
    await page.getByRole('button', { name: new RegExp(`^${name}`) }).click()
    await page.getByRole('heading', { name: heading }).waitFor()
    assert.equal(await page.locator('.workbench').count(), 1)
  }
  await page.screenshot({ path: 'output/geo-workspace.png' })
  console.log('PASS: core workspace navigation')

  const geoInput = page.locator('.upload-tile input')
  await geoInput.setInputFiles('backend/data/demo_before.tif')
  await page.getByRole('heading', { name: 'Verified file metadata' }).waitFor()
  await page.getByText('EPSG:32644', { exact: true }).first().waitFor()
  assert.equal(await page.getByText('640 × 640 px · 4 bands · uint16', { exact: true }).count(), 1)
  assert.ok((await page.getByText('Computed live', { exact: true }).count()) > 0)
  await page.screenshot({ path: 'output/geo-connected.png' })

  await geoInput.setInputFiles('public/hero-floodplain.png')
  await page.getByRole('heading', { name: 'Non-georeferenced image' }).waitFor()
  await page.getByText('visual inspection only', { exact: true }).waitFor()
  console.log('PASS: connected GeoTIFF and non-georeferenced image workflows')

  await page.getByRole('button', { name: /^Change Intelligence/ }).click()
  await page.mouse.move(700, 400)
  const pairInputs = page.locator('.pair-slot input')
  await pairInputs.nth(0).setInputFiles('backend/data/demo_before.tif')
  await pairInputs.nth(1).setInputFiles('backend/data/demo_after.tif')
  await page.getByRole('button', { name: 'Run water-change analysis' }).click()
  await page.getByRole('heading', { name: 'Measured from connected inputs' }).waitFor()
  await page.getByText('Surface-water extent increased by 236.2%', { exact: false }).waitFor()
  assert.equal(await page.locator('img.change-mask').count(), 0)
  await page.getByRole('button', { name: 'Change mask' }).click()
  assert.equal(await page.locator('img.change-mask').count(), 1)
  await page.getByAltText('Newly detected water mask returned by the analysis API').waitFor()
  await page.screenshot({ path: 'output/change-connected.png' })
  console.log('PASS: connected water-change workflow')

  await page.getByRole('button', { name: /^Settings/ }).click()
  await page.getByRole('button', { name: /Light Bright office environments/ }).click()
  assert.equal(await page.locator('.product-shell').getAttribute('data-theme'), 'light')
  await page.screenshot({ path: 'output/settings-light.png' })
  assert.equal(await page.locator('.vite-error-overlay').count(), 0)
  assert.deepEqual(errors, [])
  console.log('PASS: dashboard, hover rail, four purpose-built workspaces, and persistent light theme render without runtime errors.')
} finally {
  await browser.close()
}
