import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

await fs.mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ headless: true, channel: 'msedge' })
try {
  for (const [width, height] of [[1280, 720], [1366, 768], [1600, 900], [1024, 768]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('http://127.0.0.1:5173/')
    await page.getByRole('button', { name: 'Open workspace', exact: true }).first().click()
    await page.getByRole('heading', { name: 'Choose an analysis' }).waitFor()
    const geometry = await page.evaluate(() => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON()
      const rail = rect('.workspace-sidebar'), icon = rect('.workspace-sidebar nav button svg')
      const body = document.querySelector('.analysis-job-main')
      return { rail, icon, footer: rect('.analysis-builder'), lastJob: rect('.job-row:last-child'),
        overflowX: document.documentElement.scrollWidth > innerWidth,
        jobOverflow: body.scrollHeight > body.clientHeight + 1,
        font: getComputedStyle(document.querySelector('.job-copy b')).fontFamily }
    })
    assert.ok(Math.abs(geometry.icon.x + geometry.icon.width / 2 - geometry.rail.width / 2) < 1, 'Rail icon must be centred')
    assert.equal(geometry.overflowX, false, 'No horizontal page overflow')
    assert.equal(geometry.jobOverflow, false, 'Three jobs must fit without scrolling at laptop sizes')
    assert.ok(geometry.lastJob.bottom <= geometry.footer.y, 'Action bar must not cover the third job')
    assert.ok(geometry.footer.bottom <= height + 1, 'Action must remain visible')
    assert.match(geometry.font, /Segoe UI/)
    await page.getByRole('button', { name: /^Visual query/ }).click()
    assert.equal(await page.getByRole('button', { name: /^Visual query/ }).getAttribute('aria-pressed'), 'true')
    await page.screenshot({ path: `test-results/analysis-${width}.png` })
    await page.locator('.workspace-sidebar').hover()
    await page.waitForTimeout(250)
    assert.ok((await page.locator('.workspace-sidebar').boundingBox()).width > 200)
    await page.getByRole('button', { name: 'Home', exact: true }).click()
    await page.mouse.move(width / 2, 100)
    await page.waitForTimeout(250)
    assert.ok((await page.locator('.workspace-sidebar').boundingBox()).width < 90, 'Rail collapses after mouse leaves even after clicking')
    await page.screenshot({ path: `test-results/projects-${width}.png` })
    assert.equal(await page.locator('.crumb').evaluate(e => getComputedStyle(e).backgroundColor), 'rgba(0, 0, 0, 0)')
    if (width === 1280) {
      await page.getByRole('button', { name: 'Open project' }).click()
      await page.getByRole('heading', { name: 'Find observations' }).waitFor()
      await page.screenshot({ path: 'test-results/data-1280.png' })
      await page.getByRole('button', { name: /Add 3 layers to project/ }).click()
      await page.getByRole('button', { name: 'Build analysis plan' }).click()
      await page.getByRole('heading', { name: 'Review analysis plan' }).waitFor()
      await page.screenshot({ path: 'test-results/plan-1280.png' })
      assert.ok((await page.getByRole('button', { name: 'Run analysis', exact: true }).boundingBox()).y < height - 30)
    }
    assert.deepEqual(errors, [])
    console.log(`PASS ${width}x${height}: centred rail, no overflow, visible jobs/action, selection, hover navigation, project layout`)
    await page.close()
  }
} finally { await browser.close() }
