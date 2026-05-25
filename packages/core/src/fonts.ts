import type { FontOption } from './types'

/**
 * Extracts the primary family name from a CSS `font-family` stack and strips
 * any surrounding quotes — e.g. `'"Inter", sans-serif'` → `Inter`. This is the
 * name an `@font-face` rule registers the loaded file under.
 */
export function primaryFontFamily(value: string): string {
  const first = value.split(',')[0]?.trim() ?? value
  return first.replace(/^['"]|['"]$/g, '')
}

/** Wraps a family name in quotes when it contains characters that need them. */
function cssFamily(family: string): string {
  return /^[A-Za-z][\w-]*$/.test(family) ? family : `"${family.replace(/"/g, '\\"')}"`
}

/** Tracks already-injected fonts so repeated mounts don't duplicate rules. */
const injected = new Set<string>()

/**
 * Loads the font files declared on {@link FontOption.src} by injecting an
 * `@font-face` rule into the document head, so the fonts render in the editor
 * without the host app declaring them. String sources are used as URLs;
 * `File`/`Blob` sources are turned into object URLs.
 *
 * Idempotent (each `src` is injected once) and a no-op when there is no
 * `document` (SSR). Returns the family names it registered.
 */
export function injectFontFaces(fonts: FontOption[] | undefined): string[] {
  if (!fonts || typeof document === 'undefined') return []

  const registered: string[] = []
  for (const font of fonts) {
    if (!font.src || !font.value) continue
    const family = primaryFontFamily(font.value)
    const key = `${family}::${typeof font.src === 'string' ? font.src : objectUrlKey(font.src)}`
    if (injected.has(key)) {
      registered.push(family)
      continue
    }

    const url = typeof font.src === 'string' ? font.src : URL.createObjectURL(font.src)
    const style = document.createElement('style')
    style.dataset.plumeFont = family
    style.textContent =
      `@font-face { font-family: ${cssFamily(family)}; ` +
      `src: url("${url}"); font-display: swap; }`
    document.head.appendChild(style)

    injected.add(key)
    registered.push(family)
  }
  return registered
}

/** A stable-per-instance key for Blob sources so the same Blob isn't re-injected. */
const blobKeys = new WeakMap<Blob, string>()
let blobCounter = 0
function objectUrlKey(blob: Blob): string {
  let key = blobKeys.get(blob)
  if (!key) {
    key = `blob:${blobCounter++}`
    blobKeys.set(blob, key)
  }
  return key
}
