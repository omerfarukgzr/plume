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

export interface PlumeEditorProps extends PlumeOptions {
  /** Extra class name(s) added to the editor root element. */
  className?: string
}

/**
 * Drop-in rich text editor: a toolbar plus the editable surface.
 *
 * For full control, compose {@link usePlumeEditor}, {@link Toolbar} and
 * tiptap's `EditorContent` yourself.
 */
export function PlumeEditor({ className, ...options }: PlumeEditorProps) {
  const editor = usePlumeEditor(options)

  useEffect(() => {
    injectFontFaces(options.fonts)
  }, [options.fonts])

  if (!editor) return null

  return (
    <div className={['plume', className].filter(Boolean).join(' ')}>
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
    </div>
  )
}
