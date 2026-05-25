// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/core'
import { resolveEditorOptions } from './options'

describe('ChangeCase setChangeCase command', () => {
  let editor: Editor | undefined

  const make = (content: string, locale?: string) => {
    editor = new Editor({
      element: document.createElement('div'),
      ...resolveEditorOptions({ content, locale }),
    })
    return editor
  }

  afterEach(() => {
    editor?.destroy()
    editor = undefined
  })

  it('upper/lower/capitalize/sentence/toggle the whole selection', () => {
    const cases: [string, Parameters<Editor['commands']['setChangeCase']>[0], string][] = [
      ['<p>hello world</p>', 'upper', 'HELLO WORLD'],
      ['<p>HELLO</p>', 'lower', 'hello'],
      ['<p>hello world</p>', 'capitalize', 'Hello World'],
      ['<p>hello. world! foo</p>', 'sentence', 'Hello. World! Foo'],
      ['<p>Hello</p>', 'toggle', 'hELLO'],
    ]
    for (const [content, type, expected] of cases) {
      const ed = make(content)
      ed.commands.selectAll()
      expect(ed.commands.setChangeCase(type)).toBe(true)
      expect(ed.getText()).toBe(expected)
      ed.destroy()
      editor = undefined
    }
  })

  it('uses the configured locale (Turkish dotted/dotless i)', () => {
    const ed = make('<p>iyi</p>', 'tr')
    ed.commands.selectAll()
    ed.commands.setChangeCase('upper')
    expect(ed.getText()).toBe('İYİ')
  })

  it('preserves inline marks across the transformation', () => {
    const ed = make('<p>aa <strong>bb</strong></p>')
    ed.commands.selectAll()
    ed.commands.setChangeCase('upper')
    const html = ed.getHTML()
    expect(html).toContain('<strong>BB</strong>')
    expect(html).toContain('AA')
  })

  it('is a no-op (returns false) on an empty selection', () => {
    const ed = make('<p>hello</p>')
    ed.commands.setTextSelection(1)
    expect(ed.commands.setChangeCase('upper')).toBe(false)
    expect(ed.getText()).toBe('hello')
  })
})
