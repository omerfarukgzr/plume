import { describe, expect, it } from 'vitest'
import { injectFontFaces, primaryFontFamily, resolveFontValue } from './fonts'

describe('resolveFontValue', () => {
  it('uses an explicit value, including null to clear the font', () => {
    expect(resolveFontValue({ label: 'Serif', value: 'Georgia, serif' })).toBe('Georgia, serif')
    expect(resolveFontValue({ label: 'Default', value: null })).toBeNull()
  })

  it('derives the family from the label when only a src is given', () => {
    expect(resolveFontValue({ label: 'Ekalem', src: '/fonts/ekalem.ttf' })).toBe('Ekalem')
  })

  it('prefers an explicit value over the label even with a src', () => {
    expect(resolveFontValue({ label: 'Display', value: 'Inter', src: '/fonts/Inter.woff2' })).toBe(
      'Inter',
    )
  })

  it('resolves to null when neither value nor src is given', () => {
    expect(resolveFontValue({ label: 'Orphan' })).toBeNull()
  })
})

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
