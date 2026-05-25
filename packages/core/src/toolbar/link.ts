import type { Editor } from '@tiptap/core'

/** A snapshot of the link state at the current selection. */
export interface LinkState {
  /** The `href` of the link under the cursor, or `''` when there is none. */
  href: string
  /** Whether the selection currently sits inside a link mark. */
  isActive: boolean
  /** Whether the selection covers any text (vs. an empty caret). */
  hasSelection: boolean
}

/**
 * Reads the link-related state at the current selection. Adapters call this
 * when opening the link popover to prefill the URL and decide whether to show a
 * "visible text" field (only when nothing is selected and no link is present).
 */
export function getLinkState(editor: Editor): LinkState {
  return {
    href: (editor.getAttributes('link').href as string | undefined) ?? '',
    isActive: editor.isActive('link'),
    hasSelection: !editor.state.selection.empty,
  }
}

/**
 * Coerces user input into a usable href. A bare domain gains `https://`, an
 * email becomes a `mailto:` link, and explicit schemes / anchors / root-relative
 * paths are left untouched. Returns `''` for blank input.
 */
export function normalizeLinkHref(input: string): string {
  const href = input.trim()
  if (!href) return ''
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(href)) return href
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href)) return `mailto:${href}`
  return `https://${href}`
}

/**
 * Applies a link from the popover. When `text` is given and there is no
 * selection or existing link, it inserts that text as a freshly linked run;
 * otherwise it links the current selection (extending to cover a link the caret
 * merely sits inside). Returns `false` for an empty/blank URL.
 */
export function applyLink(editor: Editor, url: string, text?: string): boolean {
  const href = normalizeLinkHref(url)
  if (!href) return false

  const { isActive, hasSelection } = getLinkState(editor)
  const chain = editor.chain().focus()

  if (text && text.trim() && !hasSelection && !isActive) {
    return chain
      .insertContent({ type: 'text', text, marks: [{ type: 'link', attrs: { href } }] })
      .run()
  }
  return chain.extendMarkRange('link').setLink({ href }).run()
}

/** Removes the link at the current selection (extending to the whole mark). */
export function removeLink(editor: Editor): boolean {
  return editor.chain().focus().extendMarkRange('link').unsetLink().run()
}
