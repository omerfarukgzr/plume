/**
 * Demonstrates the win from Plume's debounced `onUpdate` (Aşama 1).
 *
 * On a large document, measures per-edit main-thread cost under three consumer
 * patterns — all hitting the same editor, only the update handling differs:
 *
 *   none       : no onUpdate handler at all (editor's own cost)
 *   every-edit : getHTML on every change (updateDelay: 0) — the naive consumer
 *   debounced  : getHTML via Plume's default 300ms debounce
 *
 * The gap between `every-edit` and `debounced` is the lag the API removes.
 *
 * Usage:  node bench/compare-serialize.mjs [--words 100000] [--throttle 4] [--headed]
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { chromium } from 'playwright'

const PORT = 5199
const BASE = `http://localhost:${PORT}`
const args = process.argv.slice(2)
const arg = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? Number(args[i + 1]) : def
}
const words = arg('words', 100000)
const images = arg('images', 40)
const throttle = arg('throttle', 4)
const headed = args.includes('--headed')

const SCENARIOS = [
  { label: 'none', query: '' },
  { label: 'every-edit (updateDelay:0)', query: '&serialize=0' },
  { label: 'debounced (Plume default 300ms)', query: '&serialize=300' },
]

const round = (n) => Math.round(n * 100) / 100

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
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle })

    const rows = []
    for (const s of SCENARIOS) {
      const url = `${BASE}/bench.html?words=${words}&images=${images}&seed=1${s.query}`
      await page.goto(url, { waitUntil: 'load' })
      await page.waitForFunction('window.__plumeBench && window.__plumeBench.ready')
      await page.evaluate('window.__plumeBench.ready')
      const typing = await page.evaluate('window.__plumeBench.typeBurst(200)')
      rows.push({
        scenario: s.label,
        'type p50': round(typing.p50Ms),
        'type p95': round(typing.p95Ms),
        'type max': round(typing.maxMs),
        longTasks: typing.longTasks,
        'longTask ms': round(typing.longTaskMs),
      })
    }

    console.log(
      `\n${words} words / ${images} images · CPU throttle ${throttle}x · (lower = better)\n`,
    )
    console.table(rows)
  } finally {
    if (browser) await browser.close()
    vite.kill('SIGTERM')
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
