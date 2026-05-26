import { useEffect, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { applyLink, getLinkState, removeLink, resolveMessages, type ToolbarItem } from '@useplume/core'

export interface ToolbarLinkProps {
  editor: Editor
  item: ToolbarItem
}

const wrapIcon = (inner: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`

/**
 * The link control: a toolbar button that opens an anchored popover with a URL
 * field (plus a "visible text" field when nothing is selected) and Apply /
 * Remove actions. Editing an existing link prefills its URL and exposes Remove.
 */
export function ToolbarLink({ editor, item }: ToolbarLinkProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const urlField = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  // Whether to offer a separate "visible text" field — snapshotted on open so it
  // doesn't flip while the editor loses focus to the popover inputs.
  const [needsText, setNeedsText] = useState(false)

  const labels = item.linkLabels ?? resolveMessages().link
  const active = item.isActive?.(editor) ?? false

  const openPanel = () => {
    const state = getLinkState(editor)
    setUrl(state.href)
    setText('')
    setNeedsText(!state.isActive && !state.hasSelection)
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    urlField.current?.focus()
    urlField.current?.select()
    const onPointerDown = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const submit = () => {
    if (applyLink(editor, url, needsText ? text : undefined)) setOpen(false)
  }

  const remove = () => {
    removeLink(editor)
    setOpen(false)
  }

  return (
    <div className="plume-toolbar__dropdown" ref={root}>
      <button
        type="button"
        className="plume-toolbar__button"
        data-tooltip={item.title}
        aria-label={item.title}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-active={active ? '' : undefined}
        // Keep the editor selection when opening — the popover reads it on open.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => (open ? setOpen(false) : openPanel())}
        dangerouslySetInnerHTML={item.icon ? { __html: wrapIcon(item.icon) } : undefined}
      />
      {open && (
        <form
          className="plume-toolbar__link-panel"
          role="dialog"
          aria-label={item.title}
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          {needsText && (
            <input
              type="text"
              className="plume-toolbar__link-input"
              value={text}
              placeholder={labels.textPlaceholder}
              onChange={(event) => setText(event.target.value)}
            />
          )}
          <input
            ref={urlField}
            type="text"
            className="plume-toolbar__link-input"
            value={url}
            placeholder={labels.urlPlaceholder}
            inputMode="url"
            onChange={(event) => setUrl(event.target.value)}
          />
          <div className="plume-toolbar__link-actions">
            {active && (
              <button type="button" className="plume-toolbar__link-remove" onClick={remove}>
                {labels.remove}
              </button>
            )}
            <button type="submit" className="plume-toolbar__link-apply" disabled={!url.trim()}>
              {labels.apply}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
