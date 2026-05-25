// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/core'
import { resolveEditorOptions } from '../options'
import { applyLink, getLinkState, normalizeLinkHref, removeLink } from './link'

function makeEditor(content = '<p>Hello world</p>') {
  return new Editor({
    element: document.createElement('div'),
    ...resolveEditorOptions({ content }),
  })
}

describe('normalizeLinkHref', () => {
  it('prepends https:// to a bare domain', () => {
    expect(normalizeLinkHref('example.com')).toBe('https://example.com')
  })
  it('leaves explicit schemes, anchors and relative paths untouched', () => {
    expect(normalizeLinkHref('http://x.dev')).toBe('http://x.dev')
    expect(normalizeLinkHref('mailto:a@b.com')).toBe('mailto:a@b.com')
    expect(normalizeLinkHref('#section')).toBe('#section')
    expect(normalizeLinkHref('/docs')).toBe('/docs')
  })
  it('turns a bare email into a mailto: link', () => {
    expect(normalizeLinkHref('a@b.com')).toBe('mailto:a@b.com')
  })
  it('returns empty string for blank input', () => {
    expect(normalizeLinkHref('   ')).toBe('')
  })
})

describe('link helpers', () => {
  let editor: Editor | undefined
  afterEach(() => {
    editor?.destroy()
    editor = undefined
  })

  it('links the current selection and reports its state', () => {
    editor = makeEditor()
    editor.commands.setTextSelection({ from: 1, to: 6 }) // "Hello"
    expect(getLinkState(editor).hasSelection).toBe(true)

    applyLink(editor, 'example.com')
    expect(editor.getHTML()).toContain('href="https://example.com"')

    editor.commands.setTextSelection(3)
    const state = getLinkState(editor)
    expect(state.isActive).toBe(true)
    expect(state.href).toBe('https://example.com')
  })

  it('inserts fresh linked text when nothing is selected', () => {
    editor = makeEditor('<p></p>')
    editor.commands.setTextSelection(1)
    applyLink(editor, 'example.com', 'Plume')
    const html = editor.getHTML()
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('>Plume<')
  })

  it('removes the link under the cursor', () => {
    editor = makeEditor()
    editor.commands.setTextSelection({ from: 1, to: 6 })
    applyLink(editor, 'example.com')
    removeLink(editor)
    expect(editor.getHTML()).not.toContain('href=')
  })

  it('refuses a blank URL', () => {
    editor = makeEditor()
    editor.commands.setTextSelection({ from: 1, to: 6 })
    expect(applyLink(editor, '   ')).toBe(false)
    expect(editor.getHTML()).not.toContain('href=')
  })
})
