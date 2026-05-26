import { describe, expect, it } from 'vitest'
import { messages, resolveLocale, resolveMessages } from './i18n'

describe('resolveLocale', () => {
  it('selects English only for an explicit en tag', () => {
    expect(resolveLocale('en')).toBe('en')
    expect(resolveLocale('en-US')).toBe('en')
    expect(resolveLocale('EN')).toBe('en') // case-insensitive
  })

  it('falls back to Turkish for undefined or unrecognized locales', () => {
    expect(resolveLocale(undefined)).toBe('tr')
    expect(resolveLocale('tr')).toBe('tr')
    expect(resolveLocale('tr-TR')).toBe('tr')
    expect(resolveLocale('fr')).toBe('tr')
    expect(resolveLocale('')).toBe('tr')
  })
})

describe('resolveMessages', () => {
  it('returns the matching catalog (Turkish by default)', () => {
    expect(resolveMessages('en')).toBe(messages.en)
    expect(resolveMessages('tr')).toBe(messages.tr)
    expect(resolveMessages(undefined)).toBe(messages.tr)
    expect(resolveMessages('de')).toBe(messages.tr)
  })
})

describe('message catalogs', () => {
  // Collects every leaf key path so a forgotten translation in one locale fails loudly.
  const leafPaths = (obj: Record<string, unknown>, prefix = ''): string[] =>
    Object.entries(obj)
      .flatMap(([key, value]) =>
        value && typeof value === 'object' && !Array.isArray(value)
          ? leafPaths(value as Record<string, unknown>, `${prefix}${key}.`)
          : [`${prefix}${key}`],
      )
      .sort()

  it('tr and en expose an identical key structure', () => {
    expect(leafPaths(messages.en as unknown as Record<string, unknown>)).toEqual(
      leafPaths(messages.tr as unknown as Record<string, unknown>),
    )
  })

  it('formats the footnote backref label per locale', () => {
    expect(messages.tr.footnote.backref(3)).toBe('3. referansa dön')
    expect(messages.en.footnote.backref(3)).toBe('Back to reference 3')
  })
})
