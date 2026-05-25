import { defaultExtensions } from './extensions'
import type { EditorOptions, Extensions } from '@tiptap/core'
import type { PlumeOptions } from './types'

/** The subset of tiptap editor options that Plume's core resolves. */
export type PlumeEditorOptions = Pick<
  EditorOptions,
  'content' | 'editable' | 'autofocus' | 'extensions' | 'editorProps'
>

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
  }
}
