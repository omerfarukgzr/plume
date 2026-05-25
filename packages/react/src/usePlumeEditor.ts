import { useEffect } from 'react'
import { useEditor, type Editor } from '@tiptap/react'
import { resolveEditorOptions, type PlumeOptions } from '@plume/core'

/**
 * Creates a Plume-configured tiptap editor bound to React's lifecycle.
 * Returns `null` until the editor is ready (e.g. during SSR before hydration).
 */
export function usePlumeEditor(options: PlumeOptions = {}): Editor | null {
  const editor = useEditor({
    ...resolveEditorOptions(options),
    immediatelyRender: options.immediatelyRender ?? true,
    shouldRerenderOnTransaction: false,
  })

  useEffect(() => {
    if (editor && typeof options.editable === 'boolean') {
      editor.setEditable(options.editable)
    }
  }, [editor, options.editable])

  return editor
}
