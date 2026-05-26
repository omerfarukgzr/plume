/**
 * Micro-benchmarks for pure hot paths that run frequently (often per render or
 * per transaction). Run with `pnpm --filter @useplume/core bench`.
 *
 * Editor-dependent paths (e.g. the toolbar signature, which needs a live tiptap
 * instance with `isActive` callbacks) are measured in the browser harness
 * instead — see `bench/run.mjs` / the typing burst.
 */
import { bench, describe } from 'vitest'
import { resolveToolbarItems } from '../toolbar/items'
import { generateDocHtml } from './generate'

describe('resolveToolbarItems', () => {
  // Rebuilt on every Vue render (computed) and on React mount; should be cheap.
  bench('default layout', () => {
    resolveToolbarItems()
  })

  bench('with fonts + colors', () => {
    resolveToolbarItems(undefined, {
      fonts: [
        { label: 'Inter', value: 'Inter' },
        { label: 'Serif', value: 'Georgia, serif' },
        { label: 'Mono', value: 'monospace' },
      ],
      colors: ['#000', '#e11', '#1a1', '#11e', '#ec0'],
    })
  })
})

describe('generateDocHtml', () => {
  bench('10k words', () => {
    generateDocHtml({ words: 10000, images: 5 })
  })
})
