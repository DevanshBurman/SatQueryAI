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
  await page.getByText('Connected GIS tools', { exact: true }).waitFor()
  await page.getByText('GIS API connected', { exact: true }).waitFor()
  assert.equal(await page.getByText('78%', { exact: true }).count(), 0)
  assert.ok(await page.locator('.dashboard').evaluate(element => element.scrollHeight > element.clientHeight))
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

  await geoInput.setInputFiles('frontend/public/hero-floodplain.png')
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

  await page.getByRole('button', { name: /^Geo Intelligence/ }).click()
  await page.getByRole('button', { name: 'Catalogue' }).click()
  await page.getByRole('heading', { name: 'Search the Earth, then bring evidence in.' }).waitFor()
  await page.getByText(/scenes found/).waitFor()
  assert.equal(await page.locator('.catalog-map .maplibregl-canvas').count(), 1)
  assert.ok((await page.locator('.scene-results article').count()) > 0)
  await page.screenshot({ path: 'output/catalog-aoi.png' })
  await page.getByRole('button', { name: 'Add', exact: true }).first().click()
  const selectedScene = await page.locator('.scene-results article').first().locator('.scene-copy > b').getAttribute('title')
  assert.ok(selectedScene)
  await page.getByRole('button', { name: 'Close catalog' }).click()
  await page.getByText(selectedScene, { exact: true }).first().waitFor()
  await page.screenshot({ path: 'output/catalog-connected.png' })
  console.log('PASS: MapLibre AOI and STAC catalog workflow')

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
