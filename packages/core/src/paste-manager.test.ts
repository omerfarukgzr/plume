// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Editor } from '@tiptap/core'
import { resolveEditorOptions } from './options'
import { insertPaste, PASTE_EVENT, PasteManager, type PendingPaste } from './paste-manager'

let editor: Editor | undefined

afterEach(() => {
  editor?.destroy()
  editor = undefined
})

function makeEditor(content = '<p></p>') {
  return new Editor({
    element: document.createElement('div'),
    ...resolveEditorOptions({ content, pasteManager: true }),
  })
}

/** Builds a paste event carrying the given clipboard flavors. */
function pasteEvent(data: Partial<PendingPaste>) {
  const event = new Event('paste', { bubbles: true, cancelable: true }) as Event & {
    clipboardData: Pick<DataTransfer, 'getData'>
  }
  event.clipboardData = {
    getData: (type: string) =>
      type === 'text/html' ? (data.html ?? '') : (data.text ?? ''),
  } as DataTransfer
  return event
}

describe('PasteManager extension', () => {
  it('is added to the default set only when pasteManager is enabled', () => {
    const off = resolveEditorOptions().extensions ?? []
    const on = resolveEditorOptions({ pasteManager: true }).extensions ?? []
    expect(off.some((e) => e.name === 'pasteManager')).toBe(false)
    expect(on.some((e) => e.name === 'pasteManager')).toBe(true)
  })

  it('dispatches a plume:paste event and prevents the default paste', () => {
    editor = makeEditor()
    const detail = vi.fn()
    editor.view.dom.addEventListener(PASTE_EVENT, (e) => detail((e as CustomEvent).detail))

    const event = pasteEvent({ html: '<b>hi</b>', text: 'hi' })
    editor.view.dom.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(detail).toHaveBeenCalledWith({ html: '<b>hi</b>', text: 'hi' })
  })

  it('ignores a paste with no html or text', () => {
    editor = makeEditor()
    const detail = vi.fn()
    editor.view.dom.addEventListener(PASTE_EVENT, detail)

    editor.view.dom.dispatchEvent(pasteEvent({}))
    expect(detail).not.toHaveBeenCalled()
  })

  it('defers to an onPaste handler when one is configured', () => {
    const onPaste = vi.fn().mockReturnValue(true)
    // Use the default schema (so `doc` exists) plus our own configured manager.
    editor = new Editor({
      element: document.createElement('div'),
      ...resolveEditorOptions({ extensions: [PasteManager.configure({ onPaste })] }),
    })
    const fired = vi.fn()
    editor.view.dom.addEventListener(PASTE_EVENT, fired)

    const event = pasteEvent({ text: 'hello' })
    editor.view.dom.dispatchEvent(event)

    expect(onPaste).toHaveBeenCalledWith({ html: '', text: 'hello' })
    expect(event.defaultPrevented).toBe(true)
    // The custom event is not dispatched when a handler takes over.
    expect(fired).not.toHaveBeenCalled()
  })
})

describe('insertPaste', () => {
  it('keeps formatting in styled mode', () => {
    editor = makeEditor()
    insertPaste(editor, { html: '<p>Hello <strong>world</strong></p>', text: 'Hello world' }, 'styled')
    const html = editor.getHTML()
    expect(html).toContain('<strong>world</strong>')
  })

  it('strips formatting in clean mode', () => {
    editor = makeEditor()
    insertPaste(editor, { html: '<p>Hello <strong>world</strong></p>', text: 'Hello world' }, 'clean')
    const html = editor.getHTML()
    expect(html).not.toContain('<strong>')
    expect(editor.getText()).toContain('Hello world')
  })

  it('turns newlines into hard breaks in clean mode', () => {
    editor = makeEditor()
    insertPaste(editor, { html: '', text: 'line one\nline two' }, 'clean')
    expect(editor.getHTML()).toContain('<br>')
  })

  it('detects bare-URL lines as links in styled mode', () => {
    editor = makeEditor()
    insertPaste(editor, { html: '', text: 'https://example.com' }, 'styled')
    const html = editor.getHTML()
    expect(html).toContain('href="https://example.com"')
  })
})
