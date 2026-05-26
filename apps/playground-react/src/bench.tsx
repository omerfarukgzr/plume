/**
 * Performance bench harness page (dev-only, not part of the shipped playground).
 *
 * Renders a real Plume editor — toolbar included, so the toolbar's per-transaction
 * subscription cost is measured too — over a generated large document. The size
 * comes from the URL: `/bench.html?words=50000&images=20&seed=1`.
 *
 * It exposes `window.__plumeBench` so the Playwright runner (or a human in the
 * devtools console) can drive measurements:
 *
 *   await window.__plumeBench.ready
 *   window.__plumeBench.info()          // doc size + mount time
 *   window.__plumeBench.getHtmlMs()     // serialize cost
 *   window.__plumeBench.typeBurst(200)  // per-edit main-thread cost + long tasks
 */
import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import { EditorContent, Toolbar, usePlumeEditor, type Editor } from '@useplume/react'
import { resolveMessages, resolveToolbarItems } from '@useplume/core'
import '@useplume/core/styles.css'
// Dev-only generator, imported straight from core source (not from the package
// entry point, which intentionally doesn't export it).
import { generateDocHtml } from '../../../packages/core/src/bench/generate'

// Marked as early as possible so "mount time" spans the full React + tiptap init.
const START = performance.now()

interface BenchStats {
  count: number
  meanMs: number
  p50Ms: number
  p95Ms: number
  maxMs: number
}

interface PlumeBenchApi {
  ready: Promise<void>
  info(): {
    words: number
    images: number
    seed: number
    docChars: number
    nodeCount: number
    mountMs: number
    serialize: number | null
    mirrorChars: number
  }
  getHtmlMs(iterations?: number): number
  typeBurst(count?: number): BenchStats & { longTasks: number; longTaskMs: number }
}

declare global {
  interface Window {
    __plumeEditor?: Editor
    __plumeBench: PlumeBenchApi
  }
}

const params = new URLSearchParams(location.search)
const words = Number(params.get('words') ?? 10000)
const images = Number(params.get('images') ?? 0)
const seed = Number(params.get('seed') ?? 1)
const content = generateDocHtml({ words, images, seed })
// `?serialize=<ms>` attaches a getHTML-on-update handler (simulating a consumer
// keeping a live HTML mirror) debounced by that many ms. `serialize=0` is the
// naive "serialize on every keystroke" case; omit it for no handler at all.
const serializeParam = params.get('serialize')
const serialize = serializeParam === null ? null : Number(serializeParam)
// Sink for the serialized HTML so the getHTML() call can't be optimized away.
let mirror = ''

// Accumulate long tasks (>50ms blocking the main thread) across the session.
const longTasks: number[] = []
try {
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) longTasks.push(entry.duration)
  }).observe({ entryTypes: ['longtask'] })
} catch {
  // longtask not supported — leave the array empty.
}

function stats(samples: number[]): BenchStats {
  const sorted = [...samples].sort((a, b) => a - b)
  const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]
  const sum = sorted.reduce((a, b) => a + b, 0)
  return {
    count: sorted.length,
    meanMs: sum / sorted.length,
    p50Ms: at(0.5),
    p95Ms: at(0.95),
    maxMs: sorted[sorted.length - 1],
  }
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

function Bench() {
  const editor = usePlumeEditor({
    content,
    ...(serialize !== null
      ? {
          // Mimic a consumer that mirrors the document as HTML on every change.
          onUpdate: (ed) => {
            mirror = ed.getHTML()
          },
          updateDelay: serialize,
        }
      : {}),
  })

  useEffect(() => {
    if (!editor) return
    window.__plumeEditor = editor

    let mountMs = 0
    void editor // referenced for clarity

    window.__plumeBench = {
      // Resolve after the initial document has actually painted.
      ready: nextFrame()
        .then(nextFrame)
        .then(() => {
          mountMs = performance.now() - START
        }),

      info() {
        let nodeCount = 0
        editor.state.doc.descendants(() => {
          nodeCount++
          return true
        })
        return {
          words,
          images,
          seed,
          docChars: editor.state.doc.content.size,
          nodeCount,
          mountMs,
          serialize,
          mirrorChars: mirror.length,
        }
      },

      getHtmlMs(iterations = 5) {
        const samples: number[] = []
        for (let i = 0; i < iterations; i++) {
          const t0 = performance.now()
          editor.getHTML()
          samples.push(performance.now() - t0)
        }
        return stats(samples).p50Ms
      },

      typeBurst(count = 200) {
        editor.commands.focus('end')
        const longBefore = longTasks.length
        const longSumBefore = longTasks.reduce((a, b) => a + b, 0)
        const samples: number[] = []
        for (let i = 0; i < count; i++) {
          // insertContent drives the real transaction pipeline: plugins,
          // decorations, the toolbar's transaction listener and React's
          // bailout check all run — same main-thread work as a keystroke.
          const t0 = performance.now()
          editor.commands.insertContent('x')
          samples.push(performance.now() - t0)
        }
        const longSumAfter = longTasks.reduce((a, b) => a + b, 0)
        return {
          ...stats(samples),
          longTasks: longTasks.length - longBefore,
          longTaskMs: longSumAfter - longSumBefore,
        }
      },
    }
  }, [editor])

  if (!editor) return null
  return (
    <div className="plume">
      <Toolbar
        editor={editor}
        ariaLabel={resolveMessages().toolbarLabel}
        items={resolveToolbarItems()}
      />
      <EditorContent editor={editor} className="plume-editor" />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Bench />)
