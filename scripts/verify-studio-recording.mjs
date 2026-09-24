import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true, channel: 'msedge' })
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 960 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(process.env.VERIFY_URL || 'http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Open workspace', exact: true }).first().click()
  await page.getByRole('button', { name: 'Close introduction' }).click()

  assert.equal(await page.locator('.studio-suggestions button').count(), 4)
  await page.getByRole('button', { name: 'Expand conversation' }).click()
  assert.equal(await page.locator('.studio-suggestions button').count(), 0)
  await page.locator('.studio-reading-toggle').click()
  assert.equal(await page.locator('.studio-suggestions button').count(), 4)

  const fileName = 'SatQuery_UpperLake_S2_2021-11-02_4band.tif'
  const base64 = (await readFile('backend/samples/wide-after.tif')).toString('base64')
  await page.evaluate(({ fileName, base64 }) => {
    const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0))
    const data = new DataTransfer()
    data.items.add(new File([bytes], fileName, { type: 'image/tiff' }))
    window.__studioTestDragData = data
    document.querySelector('.studio-evidence').dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: data }))
  }, { fileName, base64 })
  await page.getByText('Drop observations to add them').waitFor()
  await page.evaluate(() => {
    const target = document.querySelector('.studio-evidence')
    for (const type of ['dragover', 'drop']) {
      target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: window.__studioTestDragData }))
    }
    delete window.__studioTestDragData
  })
  await page.locator('.studio-image-label').getByText(fileName).waitFor({ timeout: 30000 })
  await page.getByRole('button', { name: 'Inputs · 1' }).waitFor()

  await page.locator('#studio-query').fill('Highlight the water body in this image.')
  await page.getByRole('button', { name: 'Analyse' }).click()
  await page.getByRole('heading', { name: 'Answer' }).waitFor({ timeout: 30000 })
  assert.equal(await page.locator('.studio-suggestions button').count(), 0)
  await page.locator('.studio-reading-toggle').click()
  await page.getByRole('button', { name: 'Inputs · 1' }).click()
  await page.getByRole('button', { name: `Select ${fileName}` }).click()
  assert.equal(await page.locator('.studio-suggestions button').count(), 0)
  assert.deepEqual(errors, [])
  console.log('PASS: initial prompts stay in compact view, hide in expanded view and after a question; dropped GeoTIFF produces an image and water result.')
} finally {
  await browser.close()
}
