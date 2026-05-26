import Document from '@tiptap/extension-document'
import { mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import type { Selection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Footnote, FootnoteReference, Footnotes } from 'tiptap-footnotes'
import type { Editor, Extensions } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

export interface FootnoteExtensionOptions {
  /** Heading shown above the footnotes list. Defaults to `'Footnotes'`. */
  label?: string
  /**
   * Make each footnote's number a clickable back-link to its marker in the body
   * (the footnote → reference half of two-way navigation; clicking a marker
   * already scrolls to its footnote). When `true` the rendered number replaces
   * the native list marker. Defaults to `true`.
   */
  backref?: boolean
  /**
   * Builds the `aria-label` for each back-link, given its number. Defaults to
   * an English label; Plume's editor supplies a locale-aware one.
   */
  backrefLabel?: (number: number) => string
}

/**
 * Document node that allows an optional trailing `footnotes` section, as
 * required by `tiptap-footnotes`. Replaces StarterKit's default Document when
 * footnotes are enabled.
 */
export const PlumeDocument = Document.extend({
  content: 'block+ footnotes?',
})

/** Finds the first node of `typeName` whose `data-id` matches `id`. */
function findNodeById(
  doc: ProseMirrorNode,
  typeName: string,
  id: string,
): { pos: number; node: ProseMirrorNode } | null {
  let match: { pos: number; node: ProseMirrorNode } | null = null
  doc.descendants((node, pos) => {
    if (match) return false
    if (node.type.name === typeName && node.attrs['data-id'] === id) {
      match = { pos, node }
      return false
    }
    return undefined
  })
  return match
}

/**
 * Computes where the caret should land when navigating to a footnote/marker,
 * resolved against `doc`. Returns the selection plus the position of the target
 * node (for scrolling). `null` when the target no longer exists.
 *
 * - `caret` → end of the footnote's content, ready to type there. `target.pos`
 *   is the position *before* the footnote `<li>`, so `target.pos + content.size`
 *   lands on the last text position inside its paragraph — the same spot
 *   tiptap-footnotes' own `focusFootnote` targets via `$node.from + content.size`.
 *   (Stepping inside with the usual extra +1 overshoots to the `<li>`'s closing
 *   boundary, which isn't a valid text caret; `TextSelection.near` then snapped
 *   past the footnote's `isolating` edge.) Bias backward so we resolve *into*
 *   the content, not out of it.
 * - `marker` → just after the inline reference in the body.
 */
function targetSelection(
  doc: ProseMirrorNode,
  typeName: string,
  id: string,
  mode: 'marker' | 'caret',
): { selection: Selection; targetPos: number } | null {
  const target = findNodeById(doc, typeName, id)
  if (!target) return null
  const wanted =
    mode === 'caret'
      ? target.pos + target.node.content.size
      : target.pos + target.node.nodeSize
  const bias = mode === 'caret' ? -1 : 1
  let selection: Selection
  try {
    selection = TextSelection.near(doc.resolve(wanted), bias)
  } catch {
    selection = TextSelection.near(doc.resolve(target.pos))
  }
  return { selection, targetPos: target.pos }
}

/** The nearest ancestor of `el` that actually scrolls (the editor's own scroll
 * area, when the host caps its height), or `null` for a free-growing editor. */
function scrollableAncestor(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement
  while (node) {
    const overflowY = getComputedStyle(node).overflowY
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node
    }
    node = node.parentElement
  }
  return null
}

/**
 * Smoothly brings `element` to the centre of the view. When the editor has its
 * own scroll area (the host capped its height), scroll *only that container* —
 * never the page. `element.scrollIntoView()` would scroll every scrollable
 * ancestor, so footnote navigation would drag the surrounding page along with
 * the editor, and the two simultaneous animations read as a jump. With no inner
 * scroll area (a full-page editor) we fall back to scrolling the page itself.
 */
function smoothScrollToCenter(element: HTMLElement): void {
  const scroller = scrollableAncestor(element)
  if (!scroller) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  const el = element.getBoundingClientRect()
  const box = scroller.getBoundingClientRect()
  const delta = el.top + el.height / 2 - (box.top + box.height / 2)
  scroller.scrollBy({ top: delta, behavior: 'smooth' })
}

/**
 * Focuses the editor and *smoothly* scrolls the target node to centre. We scroll
 * the DOM node ourselves (rather than the transaction's instant `scrollIntoView`)
 * and focus without the browser's default jump so the animation isn't fought.
 * Deferred to the next frame so it runs after the selection transaction has been
 * applied and written to the DOM.
 *
 * Crucially, `view.focus()` (and the contenteditable focus underneath it) would
 * make the browser *instantly* scroll the caret into view — a hard jump that
 * fights our smooth scroll and, when the editor sits inside a scrollable page,
 * yanks the whole page to the caret before easing back. We focus the editor DOM
 * with `preventScroll` so only our own smooth scroll moves anything.
 */
function focusAndScroll(editor: Editor, targetPos: number): void {
  if (typeof requestAnimationFrame === 'undefined') {
    editor.view.dom.focus({ preventScroll: true })
    return
  }
  requestAnimationFrame(() => {
    // The editor may have unmounted between scheduling and this frame.
    if (editor.isDestroyed) return
    const { view } = editor
    view.dom.focus({ preventScroll: true })
    const dom = view.nodeDOM(targetPos)
    const element = dom instanceof HTMLElement ? dom : (dom?.parentElement ?? null)
    if (element) smoothScrollToCenter(element)
  })
}

/**
 * Navigates from outside a tiptap command (e.g. a DOM event handler), where
 * there is no shared command transaction to clobber us: dispatch the selection
 * directly, then focus + scroll.
 */
function navigateDirect(
  editor: Editor,
  typeName: string,
  id: string,
  mode: 'marker' | 'caret',
): boolean {
  const found = targetSelection(editor.state.doc, typeName, id, mode)
  if (!found) return false
  // Blur before writing the new selection: in a focused contenteditable the
  // browser instantly scrolls the caret into view when the DOM selection moves,
  // which hard-jumps a scrollable page to the far-away target before our smooth
  // scroll can run. With the editor blurred there is no focused selection to
  // chase; `focusAndScroll` re-focuses with `preventScroll` and does the one
  // smooth scroll itself.
  editor.view.dom.blur()
  editor.view.dispatch(editor.state.tr.setSelection(found.selection))
  focusAndScroll(editor, found.targetPos)
  return true
}

/**
 * Builds the clickable footnote numbers: a widget at the start of each footnote
 * showing its number (`1.`, `2.`, …) that jumps back to its marker. The default
 * list marker is hidden in CSS so this number stands in for it. Numbering
 * follows document order, which the package keeps in sync with the markers.
 */
function backrefDecorations(
  doc: ProseMirrorNode,
  editor: Editor,
  backrefLabel: (number: number) => string,
): DecorationSet {
  const decorations: Decoration[] = []
  let index = 0

  doc.descendants((node, pos) => {
    if (node.type.name !== 'footnote') return undefined
    const id = node.attrs['data-id'] as string | undefined
    if (!id) return undefined
    index += 1
    const number = index

    decorations.push(
      Decoration.widget(
        // Inside the footnote's first paragraph (pos+1 enters the <li>, +1 more
        // enters the paragraph) so the number sits inline before the text.
        pos + 2,
        () => {
          const link = document.createElement('a')
          link.className = 'footnote-backref'
          link.contentEditable = 'false'
          link.setAttribute('data-footnote-id', id)
          link.textContent = `${number}.`
          link.setAttribute('aria-label', backrefLabel(number))

          link.addEventListener('mousedown', (event) => {
            event.preventDefault()
            navigateDirect(editor, 'footnoteReference', id, 'marker')
          })
          return link
        },
        { side: -1, key: `plume-backref-${id}-${number}` },
      ),
    )
    return undefined
  })

  return DecorationSet.create(doc, decorations)
}

/**
 * Returns the extensions that power footnotes: the custom Document, a labeled
 * Footnotes list, the Footnote item and the inline FootnoteReference. The
 * `addFootnote()` command (used by the toolbar) lives on FootnoteReference;
 * clicking a marker smooth-scrolls to its footnote, and (when `backref` is on)
 * each footnote shows a link that smooth-scrolls back to its marker.
 */
export function footnoteExtensions(options: FootnoteExtensionOptions = {}): Extensions {
  const label = options.label ?? 'Footnotes'
  const backref = options.backref ?? true
  const backrefLabel = options.backrefLabel ?? ((number: number) => `Back to reference ${number}`)

  const LabeledFootnotes = Footnotes.extend({
    renderHTML({ HTMLAttributes }) {
      return [
        'div',
        { class: 'plume-footnotes' },
        ['div', { class: 'plume-footnotes__label', contenteditable: 'false' }, label],
        [
          'ol',
          mergeAttributes(HTMLAttributes, {
            // When numbers are clickable back-links, hide the native marker.
            class: backref ? 'footnotes footnotes--linked' : 'footnotes',
          }),
          0,
        ],
      ]
    },
    parseHTML() {
      return [
        {
          tag: 'div.plume-footnotes',
          priority: 1001,
          contentElement: (node) =>
            (node as HTMLElement).querySelector('ol.footnotes') ?? (node as HTMLElement),
        },
        { tag: 'ol.footnotes', priority: 1001 },
      ]
    },
  })

  // Footnote item: smooth forward navigation (marker → footnote) always, plus a
  // back-reference widget (footnote → marker) when enabled.
  const EnhancedFootnote = Footnote.extend({
    addCommands() {
      return {
        ...this.parent?.(),
        // Override the package's instant scroll with a smooth, centered one.
        focusFootnote:
          (id: string) =>
          ({ editor, tr, dispatch }) => {
            const found = targetSelection(tr.doc, 'footnote', id, 'caret')
            // During a dry-run (`can()`) report availability honestly: the
            // command is only runnable if the target footnote actually exists.
            if (!found) return false
            if (dispatch) {
              // Set the caret on the command's *own* transaction so tiptap's
              // dispatch carries it. (Dispatching our own transaction here would
              // be overwritten when tiptap dispatches this `tr` with the original
              // selection — that clobber is why the caret never moved.) Focus and
              // smooth-scroll happen next frame, after this is applied.
              tr.setSelection(found.selection)
              focusAndScroll(editor, found.targetPos)
            }
            return true
          },
      }
    },
    addProseMirrorPlugins() {
      const editor = this.editor
      const plugins = [...(this.parent?.() ?? [])]

      // Marker (reference) → footnote navigation, routed through the same smooth
      // path as everything else. The native `href="#fn:N"` jump is removed at the
      // source (see QuietFootnoteReference below) — inside a contenteditable that
      // fragment jump fires even when the click is `preventDefault`-ed, so the
      // only reliable fix is not rendering the href. We still preventDefault to
      // suppress the atom node's default click handling.
      plugins.push(
        new Plugin({
          key: new PluginKey('plumeFootnoteMarkerNav'),
          props: {
            handleDOMEvents: {
              click(_view, event) {
                const target = event.target as HTMLElement | null
                const link = target?.closest('a.footnote-ref') as HTMLElement | null
                const id = link?.getAttribute('data-id')
                if (!id) return false
                event.preventDefault()
                return navigateDirect(editor, 'footnote', id, 'caret')
              },
            },
          },
        }),
      )

      if (backref) {
        const key = new PluginKey('plumeFootnoteBackref')
        plugins.push(
          new Plugin({
            key,
            state: {
              init: (_, state) => backrefDecorations(state.doc, editor, backrefLabel),
              // Recompute only when the document changes, so typing stays cheap.
              apply: (tr, value) =>
                tr.docChanged ? backrefDecorations(tr.doc, editor, backrefLabel) : value,
            },
            props: {
              decorations(state) {
                return key.getState(state) as DecorationSet | undefined
              },
            },
          }),
        )
      }
      return plugins
    },
  })

  // The package renders each marker as `<a href="#fn:N">`. Inside a
  // contenteditable, that fragment link's native jump fires even when the click
  // is `preventDefault`-ed (a Chromium quirk), instantly yanking a scrollable
  // page to the footnote before our smooth scroll runs. The only reliable fix is
  // to not render the href: the marker stays a clickable `a.footnote-ref` (the
  // plugin above drives navigation) but no longer triggers a native jump. The
  // footnote item keeps its `id`, so deep links and no-JS readers still reach it.
  const QuietFootnoteReference = FootnoteReference.extend({
    addAttributes() {
      const attrs = (this.parent?.() ?? {}) as Record<string, object>
      return {
        ...attrs,
        href: { ...attrs.href, renderHTML: () => ({}) },
      }
    },
  })

  return [PlumeDocument, LabeledFootnotes, EnhancedFootnote, QuietFootnoteReference]
}
