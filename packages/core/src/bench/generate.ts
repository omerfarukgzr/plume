/**
 * Deterministic large-document generator for performance benchmarks.
 *
 * Produces realistic editor HTML — headings, paragraphs with inline marks,
 * lists, blockquotes, code blocks and images — sized to a target word count.
 * Deterministic (seeded) so every run measures the same document, and dev-only:
 * intentionally NOT re-exported from the package entry point.
 */

export interface GenerateDocOptions {
  /** Approximate number of words in the document body. */
  words: number
  /** How many images to scatter through the document. Default `0`. */
  images?: number
  /** RNG seed, so a given size always yields the same document. Default `1`. */
  seed?: number
}

/** Tiny deterministic PRNG (mulberry32) — no dependencies, stable across runs. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'labore',
  'magna',
  'aliqua',
  'enim',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'aliquip',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'proident',
  'sunt',
  'culpa',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'laborum',
  'editor',
]

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Build an HTML document string roughly `words` long. The structure repeats a
 * realistic rhythm (heading → paragraphs → occasional list / quote / code /
 * image) so the document stresses multiple node types, not just plain text.
 */
export function generateDocHtml(options: GenerateDocOptions): string {
  const { words, images = 0, seed = 1 } = options
  const rand = mulberry32(seed)
  const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]!
  const word = () => pick(WORDS)

  // Insert an image roughly every `imageEvery` words, spread evenly.
  const imageEvery = images > 0 ? Math.max(1, Math.floor(words / images)) : Infinity

  const out: string[] = []
  let emitted = 0 // words emitted so far
  let nextImageAt = imageEvery
  let imagesLeft = images

  const sentence = (len: number): string => {
    const parts: string[] = []
    for (let i = 0; i < len; i++) {
      let w = word()
      // Sprinkle inline marks so each transaction touches mark processing.
      const roll = rand()
      if (roll < 0.04) w = `<strong>${w}</strong>`
      else if (roll < 0.08) w = `<em>${w}</em>`
      else if (roll < 0.1) w = `<code>${escapeHtml(w)}</code>`
      else if (roll < 0.12) w = `<mark>${w}</mark>`
      parts.push(w)
    }
    const text = parts.join(' ')
    return text.charAt(0).toUpperCase() + text.slice(1) + '.'
  }

  const paragraph = () => {
    const len = 30 + Math.floor(rand() * 40)
    emitted += len
    out.push(`<p>${sentence(len)}</p>`)
  }

  out.push(`<h1>Benchmark document (${words} words)</h1>`)

  let block = 0
  while (emitted < words) {
    const kind = rand()
    if (block % 6 === 0) {
      const level = 2 + (block % 2)
      out.push(`<h${level}>${sentence(4)}</h${level}>`)
      emitted += 4
    } else if (kind < 0.62) {
      paragraph()
    } else if (kind < 0.78) {
      const itemCount = 3 + Math.floor(rand() * 4)
      const items: string[] = []
      for (let i = 0; i < itemCount; i++) {
        const len = 6 + Math.floor(rand() * 10)
        emitted += len
        items.push(`<li>${sentence(len)}</li>`)
      }
      out.push(`<ul>${items.join('')}</ul>`)
    } else if (kind < 0.9) {
      out.push(`<blockquote><p>${sentence(20)}</p></blockquote>`)
      emitted += 20
    } else {
      out.push(`<pre><code>${escapeHtml(`function f${block}() { return ${block} }`)}</code></pre>`)
      emitted += 8
    }

    if (imagesLeft > 0 && emitted >= nextImageAt) {
      const w = 320 + Math.floor(rand() * 320)
      out.push(
        `<figure data-type="plume-image" data-align="center">` +
          `<img src="https://picsum.photos/seed/bench${imagesLeft}/${w}/${Math.round(w * 0.6)}" ` +
          `alt="benchmark image" width="${Math.round(w * 0.75)}">` +
          `<figcaption>Figure ${images - imagesLeft + 1}</figcaption>` +
          `</figure>`,
      )
      imagesLeft--
      nextImageAt += imageEvery
    }
    block++
  }

  return out.join('\n')
}
