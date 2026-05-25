import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface AutoCapitalizeOptions {
  /**
   * BCP-47 locale used for the uppercase mapping (e.g. `'tr'` so that `i`
   * becomes `İ` rather than `I`). Defaults to the runtime locale.
   */
  locale?: string
}

/**
 * Automatically capitalizes the first letter typed at the start of a block or
 * right after sentence-ending punctuation (`. ! ?`). Pressing Backspace once
 * suppresses the next auto-capitalization at that position, so users can opt
 * out of an individual correction. Opt-in: include it explicitly.
 */
export const AutoCapitalize = Extension.create<AutoCapitalizeOptions>({
  name: 'autoCapitalize',

  addOptions() {
    return { locale: undefined }
  },

  addProseMirrorPlugins() {
    const { locale } = this.options
    // Position at which a just-pressed Backspace should suppress the next
    // auto-capitalization (lets the user undo an automatic uppercase).
    let suppressAt: number | null = null

    return [
      new Plugin({
        key: new PluginKey('plumeAutoCapitalize'),
        props: {
          handleTextInput(view, from, to, text) {
            if (text.length !== 1) return false

            const lower = text.toLocaleLowerCase(locale)
            const upper = text.toLocaleUpperCase(locale)
            // Only act on lowercase letters (a char whose upper/lower differ
            // and that currently equals its lowercase form).
            if (upper === lower || text !== lower) return false

            if (suppressAt === from) {
              suppressAt = null
              return false
            }

            const { state } = view
            const $from = state.doc.resolve(from)
            let shouldCapitalize = $from.parentOffset === 0
            if (!shouldCapitalize) {
              const before = state.doc.textBetween(Math.max(0, from - 12), from, undefined, ' ')
              shouldCapitalize = /[.!?]\s+$/.test(before)
            }
            if (!shouldCapitalize) return false

            view.dispatch(state.tr.insertText(upper, from, to))
            return true
          },
          handleKeyDown(view, event) {
            if (event.key === 'Backspace') {
              // Where the caret lands after the delete: one back for a collapsed
              // selection (deletes the char before it), or the range start when a
              // selection is removed. That's where the re-typed char will arrive.
              const sel = view.state.selection
              suppressAt = sel.empty ? sel.from - 1 : sel.from
            }
            return false
          },
        },
      }),
    ]
  },
})
