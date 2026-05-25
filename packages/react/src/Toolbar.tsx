import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { resolveMessages, type ToolbarItem } from '@plume/core'
import { ToolbarButton } from './ToolbarButton'
import { ToolbarDropdown } from './ToolbarDropdown'
import { ToolbarLink } from './ToolbarLink'

export interface ToolbarProps {
  editor: Editor
  items: ToolbarItem[]
  className?: string
  /** `aria-label` for the toolbar. Defaults to the Turkish label. */
  ariaLabel?: string
}

/** Serialize every button's active/disabled flags into a comparable signature. */
function toolbarSignature(editor: Editor, items: ToolbarItem[]): string {
  // Lead with editability so locking/unlocking re-renders (and toggles the
  // dimmed `data-disabled` state) even when no button's active flag changed.
  let signature = `${editor.isEditable ? '1' : '0'}|`
  for (const item of items) {
    if (item.type === 'separator') continue
    signature += `${item.isActive?.(editor) ? '1' : '0'}${item.isDisabled?.(editor) ? '1' : '0'}|`
    // Fold in each dropdown option's active state so switching between two
    // options that both leave the dropdown "active" (e.g. two non-default fonts)
    // still re-renders the trigger label and the option checkmarks.
    if (item.type === 'dropdown' && item.options) {
      for (const option of item.options) signature += option.isActive?.(editor) ? '1' : '0'
      signature += '|'
    }
  }
  return signature
}

/**
 * Renders a row of formatting controls. Subscribes to editor updates but only
 * re-renders when a button's active/disabled state actually changes — so plain
 * typing (which rarely changes formatting) never thrashes the toolbar.
 */
export function Toolbar({ editor, items, className, ariaLabel }: ToolbarProps) {
  const [, setSignature] = useState(() => toolbarSignature(editor, items))

  useEffect(() => {
    const update = () => {
      const next = toolbarSignature(editor, items)
      // Returning the same reference makes React bail out of re-rendering.
      setSignature((previous) => (previous === next ? previous : next))
    }
    update()
    editor.on('transaction', update)
    editor.on('selectionUpdate', update)
    editor.on('focus', update)
    editor.on('blur', update)
    // `setEditable` emits `update` (not `transaction`), so the read-only toggle's
    // active state only reflects back through this listener.
    editor.on('update', update)
    return () => {
      editor.off('transaction', update)
      editor.off('selectionUpdate', update)
      editor.off('focus', update)
      editor.off('blur', update)
      editor.off('update', update)
    }
  }, [editor, items])

  return (
    <div
      className={['plume-toolbar', className].filter(Boolean).join(' ')}
      role="toolbar"
      aria-label={ariaLabel ?? resolveMessages().toolbarLabel}
      // Dimmed + non-interactive while the editor is locked (read-only).
      data-disabled={editor.isEditable ? undefined : ''}
      aria-disabled={editor.isEditable ? undefined : true}
    >
      {items.map((item) =>
        item.type === 'separator' ? (
          <span key={item.name} className="plume-toolbar__separator" aria-hidden="true" />
        ) : item.type === 'dropdown' ? (
          <ToolbarDropdown key={item.name} editor={editor} item={item} />
        ) : item.type === 'link' ? (
          <ToolbarLink key={item.name} editor={editor} item={item} />
        ) : (
          <ToolbarButton key={item.name} editor={editor} item={item} />
        ),
      )}
    </div>
  )
}
