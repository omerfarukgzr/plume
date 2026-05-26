import { defineComponent, h, onBeforeUnmount, ref, type PropType } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { resolveMessages, type ToolbarItem } from '@useplume/core'
import { ToolbarDropdown } from './ToolbarDropdown'
import { ToolbarLink } from './ToolbarLink'

const wrapIcon = (inner: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`

/** Serialize every control's active/disabled flags into a comparable signature. */
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
 * Renders a row of formatting controls. Only re-renders when a button's
 * active/disabled state actually changes — so plain typing (which rarely
 * changes formatting) never thrashes the toolbar.
 */
export const Toolbar = defineComponent({
  name: 'PlumeToolbar',
  props: {
    editor: { type: Object as PropType<Editor>, required: true },
    items: { type: Array as PropType<ToolbarItem[]>, required: true },
    /** `aria-label` for the toolbar. Defaults to the Turkish label. */
    ariaLabel: { type: String as PropType<string | undefined>, default: undefined },
  },
  setup(props) {
    const signature = ref(toolbarSignature(props.editor, props.items))
    const update = () => {
      const next = toolbarSignature(props.editor, props.items)
      if (next !== signature.value) signature.value = next
    }
    props.editor.on('transaction', update)
    props.editor.on('selectionUpdate', update)
    props.editor.on('focus', update)
    props.editor.on('blur', update)
    // `setEditable` emits `update` (not `transaction`), so the read-only toggle's
    // active state only reflects back through this listener.
    props.editor.on('update', update)
    onBeforeUnmount(() => {
      props.editor.off('transaction', update)
      props.editor.off('selectionUpdate', update)
      props.editor.off('focus', update)
      props.editor.off('blur', update)
      props.editor.off('update', update)
    })

    return () => {
      // Reading the signature ties this render to formatting-state changes only.
      void signature.value
      return h(
        'div',
        {
          class: 'plume-toolbar',
          role: 'toolbar',
          'aria-label': props.ariaLabel ?? resolveMessages().toolbarLabel,
          // Dimmed + non-interactive while the editor is locked (read-only).
          'data-disabled': props.editor.isEditable ? undefined : '',
          'aria-disabled': props.editor.isEditable ? undefined : 'true',
        },
        props.items.map((item) =>
          item.type === 'separator'
            ? h('span', {
                key: item.name,
                class: 'plume-toolbar__separator',
                'aria-hidden': 'true',
              })
            : item.type === 'dropdown'
              ? h(ToolbarDropdown, { key: item.name, editor: props.editor, item })
              : item.type === 'link'
                ? h(ToolbarLink, { key: item.name, editor: props.editor, item })
                : h('button', {
                    key: item.name,
                    type: 'button',
                    class: 'plume-toolbar__button',
                    'data-tooltip': item.title,
                    'aria-label': item.title,
                    'aria-pressed': item.isActive?.(props.editor) ?? false,
                    'data-active': item.isActive?.(props.editor) ? '' : undefined,
                    disabled: item.isDisabled?.(props.editor) ?? false,
                    onMousedown: (event: MouseEvent) => event.preventDefault(),
                    onClick: () => item.run?.(props.editor),
                    innerHTML: item.icon ? wrapIcon(item.icon) : undefined,
                  }),
        ),
      )
    }
  },
})
