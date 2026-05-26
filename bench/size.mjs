/**
 * Bundle-size regression guard (Aşama 3).
 *
 * Plume's published packages stay small because tsup keeps the heavy runtime
 * deps (@tiptap/*, prosemirror-*, tiptap-footnotes, the framework) EXTERNAL —
 * the dist is just Plume's own glue code. This guard locks that in:
 *
 *   - gzip size of each package's ESM entry must stay under its ceiling
 *     (bench/thresholds.json → bundle); a heavy dep getting inlined would
 *     blow past it.
 *   - the deps that must stay external must still appear as import sources in
 *     the dist. If externalization breaks (dep inlined), the import string
 *     disappears — caught here even before the size ceiling trips.
 *
 * Assumes packages are already built (run `pnpm build` first; CI does).
 * Exits non-zero on any violation.
 *
 * Usage:  node bench/size.mjs
 */
import { readFileSync, existsSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const { bundle } = JSON.parse(readFileSync(join(HERE, 'thresholds.json'), 'utf8'))
const round = (n) => Math.round(n * 100) / 100

const failures = []
const rows = []

for (const cfg of bundle) {
  const dist = join(ROOT, 'packages', cfg.pkg, 'dist', 'index.js')
  if (!existsSync(dist)) {
    failures.push(`@useplume/${cfg.pkg}: dist/index.js missing — run \`pnpm build\` first`)
    continue
  }
  const source = readFileSync(dist, 'utf8')
  const rawKB = statSync(dist).size / 1024
  const gzipKB = gzipSync(source).length / 1024

  // A dep is external iff it still appears as a quoted import/require specifier.
  const inlined = cfg.mustExternalize.filter(
    (dep) => !source.includes(`'${dep}`) && !source.includes(`"${dep}`),
  )
  const sizeBad = gzipKB > cfg.maxGzipKB

  rows.push({
    pkg: `@useplume/${cfg.pkg}`,
    'raw KB': round(rawKB),
    'gzip KB': round(gzipKB),
    'ceiling KB': cfg.maxGzipKB,
    external: inlined.length === 0 ? 'ok' : `INLINED: ${inlined.join(', ')}`,
    status: sizeBad || inlined.length ? 'FAIL' : 'PASS',
  })

  if (sizeBad)
    failures.push(`@useplume/${cfg.pkg} gzip ${round(gzipKB)}KB > ${cfg.maxGzipKB}KB ceiling`)
  if (inlined.length)
    failures.push(`@useplume/${cfg.pkg} bundled deps that must stay external: ${inlined.join(', ')}`)
}

console.log('\nBundle size guard (gzip; tiptap/prosemirror/framework are external)\n')
console.table(rows)

if (failures.length) {
  console.error('\n✖ bundle regression:\n  - ' + failures.join('\n  - '))
  process.exitCode = 1
} else {
  console.log('\n✓ all bundle guards passed')
}
