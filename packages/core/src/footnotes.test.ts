// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { resolveEditorOptions } from './options'

/** True when the resolved position sits anywhere inside a `footnote` node. */
function inFootnote(doc: ProseMirrorNode, pos: number): boolean {
  const $pos = doc.resolve(pos)
  for (let depth = $pos.depth; depth >= 0; depth--) {
    if ($pos.node(depth).type.name === 'footnote') return true
  }
  return false
}

describe('footnote caret placement', () => {
  let editor: Editor | undefined

  afterEach(() => {
    editor?.destroy()
    editor = undefined
  })

  it('moves the caret into the new footnote so typing continues there', () => {
    editor = new Editor({
      element: document.createElement('div'),
      ...resolveEditorOptions({ content: '<p>Hello</p>' }),
    })

    // Caret in the body, then add a footnote via the same command the toolbar uses.
    editor.commands.setTextSelection(3)
    editor.commands.addFootnote()

    // The package appends the footnote `<li>`; grab its id (matches the marker).
    let id: string | undefined
    editor.state.doc.descendants((node) => {
      if (id) return false
      if (node.type.name === 'footnote') id = node.attrs['data-id'] as string
      return undefined
    })
    expect(id).toBeTruthy()

    editor.commands.focusFootnote(id!)

    // The off-by-one bug left the caret in the body, so typing jumped back up.
    const { from } = editor.state.selection
    expect(inFootnote(editor.state.doc, from)).toBe(true)
  })

  it('clicking a marker cancels the native anchor jump and navigates smoothly', () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({ element, ...resolveEditorOptions({ content: '<p>Hello</p>' }) })

    editor.commands.setTextSelection(3)
    editor.commands.addFootnote()
    // Put the caret back in the body so we can prove the click moves it.
    editor.commands.setTextSelection(2)

    // The marker renders as `<a class="footnote-ref" href="#fn:N">`; a real click
    // would trigger the browser's instant anchor jump. Our plugin must cancel it.
    const marker = element.querySelector<HTMLAnchorElement>('a.footnote-ref')
    expect(marker).toBeTruthy()

    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    marker!.dispatchEvent(event)

    // Default prevented (no native #fn jump) and the caret landed in the footnote.
    expect(event.defaultPrevented).toBe(true)
    expect(inFootnote(editor.state.doc, editor.state.selection.from)).toBe(true)

    element.remove()
  })
})
