import { useEditor, type Editor } from '@tiptap/vue-3'
import { resolveEditorOptions, type PlumeOptions } from '@useplume/core'
import type { Ref } from 'vue'

/**
 * Creates a Plume-configured tiptap editor bound to Vue's reactivity.
 * The returned ref holds `undefined` until the editor is ready (e.g. SSR).
 */
export function usePlumeEditor(options: PlumeOptions = {}): Ref<Editor | undefined> {
  // tiptap's Vue integration always creates the editor on mount; the
  // `immediatelyRender` option is React-only and is intentionally ignored here.
  return useEditor(resolveEditorOptions(options))
}
