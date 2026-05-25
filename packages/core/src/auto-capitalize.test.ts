// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/core'
import type { Plugin } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { resolveEditorOptions } from './options'

/**
 * The behaviour lives in a ProseMirror plugin's `handleTextInput` /
 * `handleKeyDown` props. We grab our plugin by its key and call those props
 * directly — calling through `view.someProp` would let StarterKit's keymap
 * swallow Backspace before our handler runs, so the suppression test needs the
 * isolated handler.
 */
describe('AutoCapitalize plugin', () => {
  let editor: Editor | undefined

  const make = (content: string, locale = 'tr') => {
    editor = new Editor({
      element: document.createElement('div'),
      ...resolveEditorOptions({ content, locale, autoCapitalize: true }),
    })
    return editor
  }

  const plugin = (ed: Editor): Plugin => {
    const found = ed.view.state.plugins.find((p) =>
      (p as { key?: string }).key?.startsWith('plumeAutoCapitalize'),
    )
    if (!found) throw new Error('AutoCapitalize plugin not registered')
    return found
  }

  const typeChar = (ed: Editor, from: number, text: string) =>
    plugin(ed).props.handleTextInput!(ed.view as EditorView, from, from, text)

  const pressBackspace = (ed: Editor) =>
    plugin(ed).props.handleKeyDown!(
      ed.view as EditorView,
      new KeyboardEvent('keydown', { key: 'Backspace' }),
    )

  afterEach(() => {
    editor?.destroy()
    editor = undefined
  })

  it('capitalizes the first letter at the start of a block', () => {
    const ed = make('<p></p>')
    expect(typeChar(ed, 1, 'i')).toBe(true) // tr locale: i -> İ
    expect(ed.getText()).toBe('İ')
  })

  it('capitalizes after sentence-ending punctuation', () => {
    const ed = make('<p>Hi.</p>')
    ed.commands.insertContentAt(4, ' ') // -> "Hi. ", caret-ready at pos 5
    expect(typeChar(ed, 5, 'w')).toBe(true)
    expect(ed.getText()).toBe('Hi. W')
  })

  it('leaves mid-word typing untouched', () => {
    const ed = make('<p>hello</p>')
    expect(typeChar(ed, 3, 'x')).toBe(false)
    expect(ed.getText()).toBe('hello')
  })

  it('only acts on a single lowercase letter', () => {
    const ed = make('<p></p>')
    expect(typeChar(ed, 1, 'I')).toBe(false) // already uppercase
    expect(typeChar(ed, 1, 'ab')).toBe(false) // not a single char
    expect(typeChar(ed, 1, '1')).toBe(false) // no case mapping
    expect(ed.getText()).toBe('')
  })

  it('suppresses the next capitalization after a Backspace at that spot', () => {
    const ed = make('<p>a</p>')
    ed.commands.setTextSelection(2) // collapsed caret after "a"
    pressBackspace(ed) // marks pos 1 as suppressed
    expect(typeChar(ed, 1, 'i')).toBe(false) // would otherwise capitalize
    // …and the suppression is one-shot: the next attempt capitalizes again.
    expect(typeChar(ed, 1, 'i')).toBe(true)
  })
})
