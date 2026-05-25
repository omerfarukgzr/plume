import { describe, expect, it } from 'vitest'
import { injectFontFaces, primaryFontFamily } from './fonts'

describe('primaryFontFamily', () => {
  it('returns the first family in a stack without quotes', () => {
    expect(primaryFontFamily('"Inter", sans-serif')).toBe('Inter')
    expect(primaryFontFamily("'Open Sans', Georgia, serif")).toBe('Open Sans')
    expect(primaryFontFamily('Roboto')).toBe('Roboto')
  })
})

describe('injectFontFaces', () => {
  it('is a no-op without a document (SSR)', () => {
    expect(typeof document).toBe('undefined')
    expect(
      injectFontFaces([{ label: 'Inter', value: 'Inter', src: '/fonts/Inter.woff2' }]),
    ).toEqual([])
  })

  it('returns an empty list when given no fonts', () => {
    expect(injectFontFaces(undefined)).toEqual([])
  })
})
