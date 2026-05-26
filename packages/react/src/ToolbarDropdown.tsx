import { useEffect, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import type { ToolbarItem } from '@useplume/core'

export interface ToolbarDropdownProps {
  editor: Editor
  item: ToolbarItem
}

const wrapIcon = (inner: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`

/** Label shown on a `select` trigger: the active option, else the first one. */
function selectLabel(editor: Editor, item: ToolbarItem) {
  const active = item.options?.find((option) => option.isActive?.(editor))
  return (active ?? item.options?.[0])?.label ?? item.title ?? ''
}

/**
 * A toolbar control that opens a popup of options — used for the font picker
 * (`variant: 'select'`, a text field showing the active font), the color
 * palette (`variant: 'swatch'`) and case transforms (`variant: 'menu'`).
 */
export function ToolbarDropdown({ editor, item }: ToolbarDropdownProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const active = item.isActive?.(editor) ?? false
  const isSelect = item.variant === 'select'

  useEffect(() => {
    if (!open) return
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

  const choose = (run: (editor: Editor) => void) => {
    run(editor)
    setOpen(false)
  }

  const isSwatch = item.variant === 'swatch'

  return (
    <div className="plume-toolbar__dropdown" ref={root}>
      {isSelect ? (
        <button
          type="button"
          className="plume-toolbar__select"
          title={item.title}
          aria-label={item.title}
          aria-haspopup="menu"
          aria-expanded={open}
          data-active={active ? '' : undefined}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="plume-toolbar__select-label">{selectLabel(editor, item)}</span>
          <span
            className="plume-toolbar__select-caret"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: wrapIcon('<path d="m6 9 6 6 6-6" />') }}
          />
        </button>
      ) : (
        <button
          type="button"
          className="plume-toolbar__button"
          data-tooltip={item.title}
          aria-label={item.title}
          aria-haspopup="menu"
          aria-expanded={open}
          data-active={active ? '' : undefined}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((value) => !value)}
          dangerouslySetInnerHTML={item.icon ? { __html: wrapIcon(item.icon) } : undefined}
        />
      )}
      {open && (
        <div
          className={['plume-toolbar__menu', isSwatch ? 'plume-toolbar__menu--swatch' : '']
            .filter(Boolean)
            .join(' ')}
          role="menu"
        >
          {item.options?.map((option, index) =>
            isSwatch && option.value ? (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={option.isActive?.(editor) ?? false}
                className="plume-toolbar__swatch"
                title={option.label}
                aria-label={option.label}
                style={{ background: option.value }}
                data-active={option.isActive?.(editor) ? '' : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option.run)}
              />
            ) : (
              <button
                key={option.value ?? `${option.label}-${index}`}
                type="button"
                role="menuitem"
                className="plume-toolbar__menu-item"
                data-active={option.isActive?.(editor) ? '' : undefined}
                style={option.value && !isSwatch ? { fontFamily: option.value } : undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option.run)}
              >
                {option.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
