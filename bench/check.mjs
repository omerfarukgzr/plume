/**
 * CI performance regression guard (Aşama 4).
 *
 * Boots the bench harness and enforces two kinds of check:
 *
 *   1. Deterministic invariants — machine-independent, so they never flake:
 *      the image resize drag must still coalesce pointermove writes to one per
 *      frame (Aşama 2). A regression here is a correctness/perf bug regardless
 *      of how fast the runner is.
 *
 *   2. Generous absolute ceilings (bench/thresholds.json) on typing and
 *      getHTML cost at a couple of document sizes. These are set several times
 *      above observed numbers to catch order-of-magnitude regressions (e.g. a
 *      lost debounce, whole-tree re-render, or O(n^2) serialization) without
 *      tripping on normal CI variance.
 *
 * Runs UNTHROTTLED for the widest headroom. Exits non-zero on any failure.
 *
 * Usage:  node bench/check.mjs [--headed]
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { chromium } from 'playwright'

const HERE = dirname(fileURLToPath(import.meta.url))
const PORT = 5199
const BASE = `http://localhost:${PORT}`
const headed = process.argv.includes('--headed')
const round = (n) => Math.round(n * 100) / 100

const { guards } = JSON.parse(readFileSync(join(HERE, 'thresholds.json'), 'utf8'))

async function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      /* not up yet */
    }
    await sleep(300)
  }
  throw new Error('Vite server did not start')
}

// Dispatch a synchronous burst of pointermove events on the resize handle and
// report how the drag reacted. Mirrors bench/resize-coalesce.mjs.
async function measureResizeCoalescing(page) {
  await page.goto(`${BASE}/bench.html?words=600&images=2&seed=1`, { waitUntil: 'load' })
  await page.waitForFunction('window.__plumeBench && window.__plumeBench.ready')
  await page.evaluate('window.__plumeBench.ready')
  return page.evaluate(async (n) => {
    const handle = document.querySelector('.plume-image__handle[data-corner="se"]')
    const img = handle?.closest('figure')?.querySelector('img')
    if (!handle || !img) return { error: 'no resizable image found on the page' }

    const realRaf = window.requestAnimationFrame.bind(window)
    let rafScheduled = 0
    window.requestAnimationFrame = (cb) => {
      rafScheduled++
      return realRaf(cb)
    }
    let writesInBurst = 0
    const observer = new MutationObserver((records) => {
      writesInBurst += records.length
    })

    const startX = img.getBoundingClientRect().right
    const widthBefore = img.style.width
    handle.dispatchEvent(new PointerEvent('pointerdown', { clientX: startX, bubbles: true }))
    observer.observe(img, { attributes: true, attributeFilter: ['style'] })
    for (let i = 1; i <= n; i++) {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: startX + i, bubbles: true }))
    }
    observer.takeRecords()
    const writes = writesInBurst
    await new Promise((r) => realRaf(() => r(undefined)))
    const widthAfterFrame = img.style.width
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    window.requestAnimationFrame = realRaf
    return {
      rafScheduled,
      writesInBurst: writes,
      appliedAfterFrame: widthAfterFrame !== widthBefore,
    }
  }, 60)
}

async function measureGuard(page, guard) {
  await page.goto(`${BASE}/bench.html?words=${guard.words}&images=${guard.images}&seed=1`, {
    waitUntil: 'load',
  })
  await page.waitForFunction('window.__plumeBench && window.__plumeBench.ready')
  await page.evaluate('window.__plumeBench.ready')
  const getHtmlMs = await page.evaluate('window.__plumeBench.getHtmlMs(7)')
  const typing = await page.evaluate('window.__plumeBench.typeBurst(200)')
  return { getHtmlMs, typeP50Ms: typing.p50Ms }
}

async function main() {
  const vite = spawn(
    'pnpm',
    ['--filter', '@plume/playground-react', 'exec', 'vite', '--port', String(PORT), '--strictPort'],
    { stdio: 'inherit' },
  )
  let browser
  const failures = []
  try {
    await waitForServer(`${BASE}/bench.html`)
    browser = await chromium.launch({ headless: !headed })
    const page = await browser.newPage()

    // 1. Deterministic: resize coalescing.
    const coalesce = await measureResizeCoalescing(page)
    if (coalesce.error) {
      failures.push(`resize coalescing: ${coalesce.error}`)
    } else {
      const ok =
        coalesce.rafScheduled === 1 && coalesce.writesInBurst === 0 && coalesce.appliedAfterFrame
      console.log(
        `resize coalescing: rafScheduled=${coalesce.rafScheduled} writesInBurst=${coalesce.writesInBurst} ` +
          `appliedAfterFrame=${coalesce.appliedAfterFrame} → ${ok ? 'PASS' : 'FAIL'}`,
      )
      if (!ok) {
        failures.push(
          'resize drag no longer coalesces pointermove writes to one per frame (Aşama 2 regression)',
        )
      }
    }

    // 2. Generous ceilings on typing + getHTML.
    for (const guard of guards) {
      const m = await measureGuard(page, guard)
      const getHtmlBad = m.getHtmlMs > guard.maxGetHtmlMs
      const typeBad = m.typeP50Ms > guard.maxTypeP50Ms
      console.log(
        `${guard.words} words: getHTML ${round(m.getHtmlMs)}ms (≤${guard.maxGetHtmlMs}) · ` +
          `type p50 ${round(m.typeP50Ms)}ms (≤${guard.maxTypeP50Ms}) → ` +
          `${getHtmlBad || typeBad ? 'FAIL' : 'PASS'}`,
      )
      if (getHtmlBad)
        failures.push(`${guard.words}w getHTML ${round(m.getHtmlMs)}ms > ${guard.maxGetHtmlMs}ms`)
      if (typeBad)
        failures.push(`${guard.words}w type p50 ${round(m.typeP50Ms)}ms > ${guard.maxTypeP50Ms}ms`)
    }
  } finally {
    if (browser) await browser.close()
    vite.kill('SIGTERM')
  }

  if (failures.length) {
    console.error('\n✖ performance regression:\n  - ' + failures.join('\n  - '))
    process.exitCode = 1
  } else {
    console.log('\n✓ all performance guards passed')
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
