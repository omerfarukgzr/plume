import type { Editor } from '@tiptap/react'
import type { ToolbarItem } from '@useplume/core'

export interface ToolbarButtonProps {
  editor: Editor
  item: ToolbarItem
}

const wrapIcon = (inner: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`

export function ToolbarButton({ editor, item }: ToolbarButtonProps) {
  const active = item.isActive?.(editor) ?? false
  const disabled = item.isDisabled?.(editor) ?? false

  return (
    <button
      type="button"
      className="plume-toolbar__button"
      data-tooltip={item.title}
      aria-label={item.title}
      aria-pressed={active}
      data-active={active ? '' : undefined}
      disabled={disabled}
      // Prevent the editor from losing its selection when a button is pressed.
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => item.run?.(editor)}
      dangerouslySetInnerHTML={item.icon ? { __html: wrapIcon(item.icon) } : undefined}
    />
  )
}
