import { chromium } from 'playwright'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ headless: true, channel: 'msedge' })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
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
    ['Change Intelligence', 'What changed between these dates?'],
    ['Multimodal Fusion', 'Do optical and SAR agree?'],
    ['Geo Intelligence', 'What can be measured here?'],
  ]) {
    await page.getByRole('button', { name: new RegExp(`^${name}`) }).click()
    await page.getByRole('heading', { name: heading }).waitFor()
    assert.equal(await page.locator('.workbench').count(), 1)
  }
  await page.screenshot({ path: 'output/geo-workspace.png' })

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
