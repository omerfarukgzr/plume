import { Extension } from '@tiptap/core'
import type { Editor, JSONContent } from '@tiptap/core'
import { DOMParser as ProseMirrorDOMParser } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/** Clipboard payload captured when a paste is intercepted. */
export interface PendingPaste {
  /** The `text/html` flavor of the clipboard, if any. */
  html: string
  /** The `text/plain` flavor of the clipboard. */
  text: string
}

/**
 * How intercepted clipboard content is inserted:
 * - `'clean'` strips all formatting and pastes plain text.
 * - `'styled'` keeps the source HTML formatting (links, bold, lists …).
 */
export type PasteMode = 'clean' | 'styled'

/**
 * DOM event dispatched (bubbling) from the editor's content element when a
 * paste is intercepted and no `onPaste` handler is configured. Adapters listen
 * for it — typically on `document` — to open the paste-mode chooser, scoping by
 * whether the event originated inside their editor. `event.detail` is a
 * {@link PendingPaste}.
 */
export const PASTE_EVENT = 'plume:paste'

export interface PasteManagerOptions {
  /**
   * Custom paste hook. Return `true` to prevent tiptap's default paste, `false`
   * to let it proceed. When omitted (the default), the manager dispatches a
   * {@link PASTE_EVENT} `CustomEvent` on the editor DOM and prevents the default
   * paste, leaving the adapter's modal to insert the content via
   * {@link insertPaste}.
   */
  onPaste?: ((data: PendingPaste) => boolean) | null
}

/**
 * Intercepts paste so the app can ask the user how to insert clipboard content
 * (plain text vs. formatted). It only captures the clipboard and hands it off —
 * the actual insertion happens through {@link insertPaste}, so the React and Vue
 * adapters share the exact same content-processing logic.
 *
 * Enable it through `pasteManager: true` on the editor (off by default), or add
 * the extension directly and pass your own {@link PasteManagerOptions.onPaste}.
 */
export const PasteManager = Extension.create<PasteManagerOptions>({
  name: 'pasteManager',

  addOptions() {
    return {
      onPaste: null,
    }
  },

  addProseMirrorPlugins() {
    const { onPaste } = this.options
    return [
      new Plugin({
        key: new PluginKey('plumePasteManager'),
        props: {
          handlePaste: (view, event) => {
            const clipboard = (event as ClipboardEvent).clipboardData
            if (!clipboard) return false

            const html = clipboard.getData('text/html')
            const text = clipboard.getData('text/plain')

            // Nothing useful on the clipboard (e.g. an image-only paste): let
            // tiptap's own handlers deal with it.
            if (!html && !text) return false

            const data: PendingPaste = { html, text }

            if (onPaste) {
              if (onPaste(data)) {
                event.preventDefault()
                return true
              }
              return false
            }

            // Default behaviour: hand the payload to the adapter's modal. The
            // event bubbles so adapters can listen on `document` rather than the
            // (sometimes not-yet-mounted) editor view.
            view.dom.dispatchEvent(new CustomEvent(PASTE_EVENT, { detail: data, bubbles: true }))
            event.preventDefault()
            return true
          },
        },
      }),
    ]
  },
})

/** Matches a line that is, on its own, a single http(s) URL. */
const URL_LINE = /^(https?:\/\/[^\s]+)$/i

/**
 * Parses clipboard HTML into tiptap JSON nodes using the editor's own schema,
 * so only marks/nodes the editor understands survive. We strip the markup most
 * likely to break the parse (`<meta>`/`<script>`/`<style>` and inline
 * `font-family` declarations) but deliberately leave `<a>` intact so links are
 * preserved.
 *
 * If the result is a single paragraph, its inline content is returned instead of
 * the paragraph itself, so the paste merges into the current line rather than
 * forcing a new block.
 */
function parseHtmlContent(editor: Editor, html: string): JSONContent[] {
  if (!html) return []

  const sanitized = html
    .replace(/<(meta|script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/font-family:[^;]+;?/gi, '')

  const container = document.createElement('div')
  container.innerHTML = sanitized

  try {
    const parsed = ProseMirrorDOMParser.fromSchema(editor.schema).parse(container).toJSON()
    const content: JSONContent[] = parsed?.content ?? []

    const only = content.length === 1 ? content[0] : undefined
    if (only?.type === 'paragraph') {
      return only.content ?? []
    }
    return content
  } catch {
    return []
  }
}

/**
 * Converts plain text to tiptap JSON nodes. Newlines become hard breaks (so a
 * multi-line clipboard stays on separate lines without opening new paragraphs),
 * and when `detectLinks` is set, lines that are bare URLs become links.
 */
function convertTextToJson(text: string, detectLinks: boolean): JSONContent[] {
  const lines = text.split(/\r?\n/)
  const content: JSONContent[] = []

  lines.forEach((line, index) => {
    if (line) {
      if (detectLinks && URL_LINE.test(line.trim())) {
        content.push({
          type: 'text',
          text: line,
          marks: [{ type: 'link', attrs: { href: line.trim(), target: '_blank' } }],
        })
      } else {
        content.push({ type: 'text', text: line })
      }
    }
    // A hard break after every line but the last.
    if (index < lines.length - 1) content.push({ type: 'hardBreak' })
  })

  return content
}

/**
 * Builds the JSON to insert for the chosen mode. `'styled'` uses the clipboard
 * HTML when present (falling back to text-with-link-detection when it isn't),
 * while `'clean'` always produces plain text.
 */
function processContent(editor: Editor, mode: PasteMode, data: PendingPaste): JSONContent[] {
  const useHtml = mode === 'styled' && data.html.trim().length > 0
  if (useHtml) return parseHtmlContent(editor, data.html)
  return convertTextToJson(data.text, mode === 'styled')
}

/**
 * Inserts captured clipboard content at the current selection in the requested
 * {@link PasteMode}. Shared by the React and Vue paste modals so both insert
 * identically. Falls back to inserting the raw text if HTML parsing yields
 * nothing.
 */
export function insertPaste(editor: Editor, data: PendingPaste, mode: PasteMode): void {
  const content = processContent(editor, mode, data)
  const chain = editor.chain().focus()
  if (content.length > 0) {
    chain.insertContent(content).run()
  } else {
    chain.insertContent(data.text).run()
  }
}
