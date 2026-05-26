import { useEffect } from 'react'
import { EditorContent } from '@tiptap/react'
import {
  injectFontFaces,
  resolveMessages,
  resolveToolbarItems,
  type PlumeOptions,
} from '@useplume/core'
import { usePlumeEditor } from './usePlumeEditor'
import { Toolbar } from './Toolbar'
import { PasteModal } from './PasteModal'

export interface PlumeEditorProps extends PlumeOptions {
  /** Extra class name(s) added to the editor root element. */
  className?: string
  /**
   * Force edge-to-edge content (drop any `--plume-content-max-width`). The
   * editor is already edge-to-edge by default, so this only matters when an
   * ancestor has opted into a centered reading column. Equivalent to adding the
   * `plume--fluid` class.
   */
  fluid?: boolean
}

/**
 * Drop-in rich text editor: a toolbar plus the editable surface.
 *
 * For full control, compose {@link usePlumeEditor}, {@link Toolbar} and
 * tiptap's `EditorContent` yourself.
 */
export function PlumeEditor({ className, fluid, ...options }: PlumeEditorProps) {
  const editor = usePlumeEditor(options)

  useEffect(() => {
    injectFontFaces(options.fonts)
  }, [options.fonts])

  if (!editor) return null

  return (
    <div className={['plume', fluid && 'plume--fluid', className].filter(Boolean).join(' ')}>
      {options.toolbar !== false && (
        <Toolbar
          editor={editor}
          ariaLabel={resolveMessages(options.locale).toolbarLabel}
          items={resolveToolbarItems(options.toolbar, {
            fonts: options.fonts,
            colors: options.colors,
            locale: options.locale,
            blockquotes: options.blockquotes,
            items: options.toolbarItems,
          })}
        />
      )}
      <EditorContent editor={editor} className="plume-editor" />
      {options.pasteManager && <PasteModal editor={editor} locale={options.locale} />}
    </div>
  )
}
