/**
 * Verifies Aşama 2: the image resize drag coalesces pointermove writes to one
 * per animation frame instead of writing `img.style.width` (and forcing a
 * layout) on every event.
 *
 * It dispatches a burst of N pointermove events synchronously — before any
 * frame can run — then checks how the editor reacted:
 *
 *   - rafScheduled   : requestAnimationFrame calls during the burst (new: 1)
 *   - writesInBurst   : how many times the width changed during the burst (new: 0)
 *   - appliedAfterFrame: width changed once the frame ran (new: true)
 *
 * Before the change, N synchronous moves wrote the width N times (N forced
 * layouts) and rafScheduled was 0. After it, the N moves collapse into a single
 * deferred write on the next frame.
 *
 * Usage:  node bench/resize-coalesce.mjs [--moves 60] [--headed]
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { chromium } from 'playwright'

const PORT = 5199
const BASE = `http://localhost:${PORT}`
const args = process.argv.slice(2)
const moves = args.indexOf('--moves') >= 0 ? Number(args[args.indexOf('--moves') + 1]) : 60
const headed = args.includes('--headed')

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

async function main() {
  const vite = spawn(
    'pnpm',
    ['--filter', '@useplume/playground-react', 'exec', 'vite', '--port', String(PORT), '--strictPort'],
    { stdio: 'inherit' },
  )
  let browser
  try {
    await waitForServer(`${BASE}/bench.html`)
    browser = await chromium.launch({ headless: !headed })
    const page = await browser.newPage()
    await page.goto(`${BASE}/bench.html?words=600&images=2&seed=1`, { waitUntil: 'load' })
    await page.waitForFunction('window.__plumeBench && window.__plumeBench.ready')
    await page.evaluate('window.__plumeBench.ready')

    const result = await page.evaluate(async (n) => {
      const handle = document.querySelector('.plume-image__handle[data-corner="se"]')
      const img = handle?.closest('figure')?.querySelector('img')
      if (!handle || !img) return { error: 'no resizable image found on the page' }

      // Count rAF scheduling without breaking it.
      const realRaf = window.requestAnimationFrame.bind(window)
      let rafScheduled = 0
      window.requestAnimationFrame = (cb) => {
        rafScheduled++
        return realRaf(cb)
      }

      // Count actual width writes during the synchronous burst.
      let writesInBurst = 0
      const observer = new MutationObserver((records) => {
        writesInBurst += records.length
      })

      const rect = img.getBoundingClientRect()
      const startX = rect.right
      const widthBefore = img.style.width

      handle.dispatchEvent(new PointerEvent('pointerdown', { clientX: startX, bubbles: true }))
      observer.observe(img, { attributes: true, attributeFilter: ['style'] })

      // Fire N moves in one synchronous task — no frame runs in between.
      for (let i = 1; i <= n; i++) {
        window.dispatchEvent(
          new PointerEvent('pointermove', { clientX: startX + i, bubbles: true }),
        )
      }
      observer.takeRecords() // flush synchronously so the count reflects the burst
      const writesDuringBurst = writesInBurst
      const widthDuringBurst = img.style.width

      // Let exactly one frame run, then read again.
      await new Promise((r) => realRaf(() => r(undefined)))
      const widthAfterFrame = img.style.width

      window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
      window.requestAnimationFrame = realRaf

      return {
        moves: n,
        rafScheduled,
        writesInBurst: writesDuringBurst,
        widthBefore,
        widthDuringBurst,
        widthAfterFrame,
        appliedAfterFrame: widthAfterFrame !== widthBefore,
      }
    }, moves)

    console.log('\nResize pointermove coalescing (Aşama 2)\n')
    console.log(result)
    if (!result.error) {
      console.log(
        `\n→ ${result.moves} synchronous moves scheduled ${result.rafScheduled} frame(s); ` +
          `width written ${result.writesInBurst}× during the burst, ` +
          `then once on the next frame (${result.widthBefore || 'auto'} → ${result.widthAfterFrame}).`,
      )
    }
  } finally {
    if (browser) await browser.close()
    vite.kill('SIGTERM')
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
