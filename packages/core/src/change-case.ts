import { Extension } from '@tiptap/core'
import type { Mark } from '@tiptap/pm/model'

/** The text-case transformations Plume supports. */
export type CaseType = 'sentence' | 'lower' | 'upper' | 'capitalize' | 'toggle'

export interface ChangeCaseOptions {
  /**
   * BCP-47 locale used for case mapping (e.g. `'tr'` so that `i ↔ İ` and
   * `ı ↔ I` behave correctly). Defaults to the runtime locale.
   */
  locale?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    changeCase: {
      /** Transform the selected text to the given case. */
      setChangeCase: (type: CaseType) => ReturnType
    }
  }
}

function transform(text: string, type: CaseType, locale?: string): string {
  switch (type) {
    case 'lower':
      return text.toLocaleLowerCase(locale)
    case 'upper':
      return text.toLocaleUpperCase(locale)
    case 'capitalize':
      return text.replace(
        /[\p{L}\p{M}]+/gu,
        (word) =>
          word.charAt(0).toLocaleUpperCase(locale) + word.slice(1).toLocaleLowerCase(locale),
      )
    case 'sentence': {
      const lowered = text.toLocaleLowerCase(locale)
      return lowered.replace(/(^\s*\p{L})|([.!?]\s+\p{L})/gu, (match) =>
        match.toLocaleUpperCase(locale),
      )
    }
    case 'toggle':
      return Array.from(text)
        .map((char) => {
          const upper = char.toLocaleUpperCase(locale)
          return char === upper ? char.toLocaleLowerCase(locale) : upper
        })
        .join('')
  }
}

/**
 * Adds a `setChangeCase` command that rewrites the selected text to a chosen
 * case while preserving inline marks (bold, links, …). Locale-aware so Turkish
 * dotted/dotless `i` is handled correctly.
 */
export const ChangeCase = Extension.create<ChangeCaseOptions>({
  name: 'changeCase',

  addOptions() {
    return { locale: undefined }
  },

  addCommands() {
    return {
      setChangeCase:
        (type) =>
        ({ state, tr, dispatch }) => {
          const { from, to, empty } = state.selection
          if (empty) return false

          const { locale } = this.options
          const edits: { from: number; to: number; text: string; marks: readonly Mark[] }[] = []

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!node.isText || !node.text) return
            const start = Math.max(pos, from)
            const end = Math.min(pos + node.nodeSize, to)
            const slice = node.text.slice(start - pos, end - pos)
            const next = transform(slice, type, locale)
            if (next !== slice) {
              edits.push({ from: start, to: end, text: next, marks: node.marks })
            }
          })

          if (edits.length === 0) return false
          if (dispatch) {
            // Apply right-to-left so earlier positions stay valid.
            edits
              .slice()
              .reverse()
              .forEach((edit) => {
                tr.replaceWith(edit.from, edit.to, state.schema.text(edit.text, [...edit.marks]))
              })
            dispatch(tr)
          }
          return true
        },
    }
  },
})
