import { defaultExtensions } from './extensions'
import type { Editor, EditorOptions, Extensions } from '@tiptap/core'
import type { PlumeOptions } from './types'

/** The subset of tiptap editor options that Plume's core resolves. */
export type PlumeEditorOptions = Pick<
  EditorOptions,
  'content' | 'editable' | 'autofocus' | 'extensions' | 'editorProps'
> & {
  // tiptap declares `onUpdate` as required (with a default no-op); we only emit
  // it when the user supplies a callback, so it must be optional here.
  onUpdate?: EditorOptions['onUpdate']
}

/** Default debounce for {@link PlumeOptions.onUpdate}, in milliseconds. */
export const DEFAULT_UPDATE_DELAY = 300

/**
 * Wraps a user `onUpdate` callback in a tiptap `onUpdate` handler, debounced by
 * `delay` ms. The debounce is what keeps typing smooth when the handler
 * serializes the document (`getHTML`/`getJSON`), since that cost grows with
 * document size. `delay <= 0` fires synchronously on every change.
 */
function makeOnUpdate(
  onUpdate: (editor: Editor) => void,
  delay: number,
): NonNullable<EditorOptions['onUpdate']> {
  if (delay <= 0) return ({ editor }) => onUpdate(editor)
  let timer: ReturnType<typeof setTimeout> | undefined
  return ({ editor }) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      // Guard against a trailing timer firing after the editor was torn down.
      if (!editor.isDestroyed) onUpdate(editor)
    }, delay)
  }
}

/**
 * Translates framework-agnostic {@link PlumeOptions} into a tiptap editor
 * configuration. Adapters spread the result into their framework's `useEditor`
 * and add framework-specific bits (e.g. `immediatelyRender`).
 */
export function resolveEditorOptions(options: PlumeOptions = {}): PlumeEditorOptions {
  const {
    content = '',
    editable = true,
    placeholder,
    extensions = [],
    defaultExtensions: useDefaults = true,
    autofocus = false,
    editorClass,
    locale,
    autoCapitalize,
    image,
    footnote,
    blockquotes,
    onUpdate,
    updateDelay = DEFAULT_UPDATE_DELAY,
  } = options

  const base: Extensions = useDefaults
    ? defaultExtensions({ placeholder, locale, autoCapitalize, image, footnote, blockquotes })
    : []
  const className = ['plume-editor__content', editorClass].filter(Boolean).join(' ')

  return {
    content: (content ?? '') as EditorOptions['content'],
    editable,
    autofocus,
    extensions: [...base, ...extensions],
    editorProps: {
      attributes: {
        class: className,
        role: 'textbox',
        'aria-multiline': 'true',
        spellcheck: 'true',
      },
    },
    ...(onUpdate ? { onUpdate: makeOnUpdate(onUpdate, updateDelay) } : {}),
  }
}
