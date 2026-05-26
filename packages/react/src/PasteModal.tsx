import { useEffect, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  insertPaste,
  PASTE_EVENT,
  resolveMessages,
  type PasteMode,
  type PendingPaste,
} from '@useplume/core'

export interface PasteModalProps {
  editor: Editor
  /** Locale for the modal labels. */
  locale?: string
}

/**
 * The paste-mode chooser. Listens for the `plume:paste` event the
 * {@link PasteManager} extension dispatches and opens a modal offering plain
 * text vs. formatted paste. Rendered automatically by {@link PlumeEditor} when
 * `pasteManager` is enabled. Closes on Escape, on backdrop click, or after a
 * choice is made.
 */
export function PasteModal({ editor, locale }: PasteModalProps) {
  const [pending, setPending] = useState<PendingPaste | null>(null)
  const styledButton = useRef<HTMLButtonElement>(null)
  const labels = resolveMessages(locale).paste

  useEffect(() => {
    // The event bubbles to `document`; scope it to this editor so multiple
    // editors on a page don't all open. Reading `view.dom` is safe here because
    // a real paste only fires once the editor is mounted.
    const onPaste = (event: Event) => {
      const target = event.target as Node | null
      const dom = editor.isDestroyed ? null : editor.view.dom
      if (!dom || !target || !(target === dom || dom.contains(target))) return
      setPending((event as CustomEvent<PendingPaste>).detail)
    }
    document.addEventListener(PASTE_EVENT, onPaste)
    return () => document.removeEventListener(PASTE_EVENT, onPaste)
  }, [editor])

  useEffect(() => {
    if (!pending) return
    styledButton.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPending(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [pending])

  if (!pending) return null

  const choose = (mode: PasteMode) => {
    insertPaste(editor, pending, mode)
    setPending(null)
  }

  return (
    <div className="plume-paste-modal" role="presentation" onPointerDown={() => setPending(null)}>
      <div
        className="plume-paste-modal__card"
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <h2 className="plume-paste-modal__title">{labels.title}</h2>
        <p className="plume-paste-modal__description">{labels.description}</p>
        <div className="plume-paste-modal__actions">
          <button
            type="button"
            className="plume-paste-modal__button plume-paste-modal__button--ghost"
            onClick={() => setPending(null)}
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            className="plume-paste-modal__button plume-paste-modal__button--secondary"
            onClick={() => choose('clean')}
          >
            {labels.plainText}
          </button>
          <button
            ref={styledButton}
            type="button"
            className="plume-paste-modal__button plume-paste-modal__button--primary"
            onClick={() => choose('styled')}
          >
            {labels.styled}
          </button>
        </div>
      </div>
    </div>
  )
}
