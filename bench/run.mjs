/**
 * Plume performance baseline runner.
 *
 * Boots the React playground's Vite dev server, opens the bench harness page
 * (`bench.html`) at several document sizes in real Chromium, and measures:
 *
 *   - mountMs      : React + tiptap init through first paint of the document
 *   - getHtmlMs    : cost of one editor.getHTML() (consumers often call this per keystroke)
 *   - type p50/p95 : per-edit main-thread cost — the number that turns into "lag"
 *   - longTasks    : >50ms main-thread blocks during a 200-edit burst
 *
 * CPU is throttled (default 4x) to approximate a mid-tier laptop/phone, so the
 * "kasma" we're chasing actually shows up instead of being hidden by a fast Mac.
 *
 * Usage:  node bench/run.mjs [--throttle 4] [--headed]
 * Output: bench/baseline.json  (+ a table on stdout)
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { chromium } from 'playwright'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const PORT = 5199
const BASE = `http://localhost:${PORT}`

const args = process.argv.slice(2)
const throttle = Number(args[args.indexOf('--throttle') + 1]) || 4
const headed = args.includes('--headed')

const SIZES = [
  { words: 2000, images: 0 },
  { words: 10000, images: 5 },
  { words: 50000, images: 20 },
  { words: 100000, images: 40 },
]

async function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      // not up yet
    }
    await sleep(300)
  }
  throw new Error(`Vite server did not start within ${timeoutMs}ms`)
}

function startVite() {
  const child = spawn(
    'pnpm',
    ['--filter', '@plume/playground-react', 'exec', 'vite', '--port', String(PORT), '--strictPort'],
    { cwd: ROOT, stdio: 'inherit' },
  )
  return child
}

async function measure(page, size) {
  const url = `${BASE}/bench.html?words=${size.words}&images=${size.images}&seed=1`
  await page.goto(url, { waitUntil: 'load' })
  await page.waitForFunction('window.__plumeBench && window.__plumeBench.ready')
  await page.evaluate('window.__plumeBench.ready')

  const info = await page.evaluate('window.__plumeBench.info()')
  const getHtmlMs = await page.evaluate('window.__plumeBench.getHtmlMs(7)')
  const typing = await page.evaluate('window.__plumeBench.typeBurst(200)')

  return {
    words: size.words,
    images: size.images,
    docChars: info.docChars,
    nodeCount: info.nodeCount,
    mountMs: round(info.mountMs),
    getHtmlMs: round(getHtmlMs),
    typeMeanMs: round(typing.meanMs),
    typeP50Ms: round(typing.p50Ms),
    typeP95Ms: round(typing.p95Ms),
    typeMaxMs: round(typing.maxMs),
    longTasks: typing.longTasks,
    longTaskMs: round(typing.longTaskMs),
  }
}

const round = (n) => Math.round(n * 100) / 100

async function main() {
  const vite = startVite()
  let browser
  try {
    await waitForServer(`${BASE}/bench.html`)
    browser = await chromium.launch({ headless: !headed })
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await context.newPage()

    // Throttle CPU to emulate a mid-tier device so jank is observable.
    const cdp = await context.newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle })

    const results = []
    for (const size of SIZES) {
      process.stdout.write(`measuring ${size.words} words / ${size.images} images … `)
      results.push(await measure(page, size))
      process.stdout.write('done\n')
    }

    const baseline = {
      generatedAt: new Date().toISOString(),
      cpuThrottle: throttle,
      results,
    }
    const outPath = join(HERE, 'baseline.json')
    writeFileSync(outPath, JSON.stringify(baseline, null, 2) + '\n')

    console.log(`\nCPU throttle: ${throttle}x   (lower ms = better)\n`)
    console.table(
      results.map((r) => ({
        words: r.words,
        imgs: r.images,
        'mount ms': r.mountMs,
        'getHTML ms': r.getHtmlMs,
        'type p50': r.typeP50Ms,
        'type p95': r.typeP95Ms,
        'type max': r.typeMaxMs,
        longTasks: r.longTasks,
      })),
    )
    console.log(`\nbaseline written to ${outPath}`)
  } finally {
    if (browser) await browser.close()
    vite.kill('SIGTERM')
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
