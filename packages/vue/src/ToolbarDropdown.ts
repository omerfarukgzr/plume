import { defineComponent, h, onBeforeUnmount, ref, type PropType } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import type { ToolbarItem } from '@plume/core'

const wrapIcon = (inner: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`

/** Label shown on a `select` trigger: the active option, else the first one. */
function selectLabel(editor: Editor, item: ToolbarItem) {
  const active = item.options?.find((option) => option.isActive?.(editor))
  return (active ?? item.options?.[0])?.label ?? item.title ?? ''
}

/**
 * A toolbar control that opens a popup of options — the font picker
 * (`variant: 'select'`, a text field showing the active font), the color
 * palette (`variant: 'swatch'`) and case transforms (`variant: 'menu'`).
 */
export const ToolbarDropdown = defineComponent({
  name: 'PlumeToolbarDropdown',
  props: {
    editor: { type: Object as PropType<Editor>, required: true },
    item: { type: Object as PropType<ToolbarItem>, required: true },
  },
  setup(props) {
    const open = ref(false)
    const root = ref<HTMLElement | null>(null)

    const onPointerDown = (event: PointerEvent) => {
      if (root.value && !root.value.contains(event.target as Node)) open.value = false
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') open.value = false
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    onBeforeUnmount(() => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    })

    const choose = (run: (editor: Editor) => void) => {
      run(props.editor)
      open.value = false
    }

    return () => {
      const { item, editor } = props
      const isSwatch = item.variant === 'swatch'
      const isSelect = item.variant === 'select'
      const active = item.isActive?.(editor) ?? false

      const trigger = isSelect
        ? h(
            'button',
            {
              type: 'button',
              class: 'plume-toolbar__select',
              title: item.title,
              'aria-label': item.title,
              'aria-haspopup': 'menu',
              'aria-expanded': open.value,
              'data-active': active ? '' : undefined,
              onMousedown: (event: MouseEvent) => event.preventDefault(),
              onClick: () => (open.value = !open.value),
            },
            [
              h('span', { class: 'plume-toolbar__select-label' }, selectLabel(editor, item)),
              h('span', {
                class: 'plume-toolbar__select-caret',
                'aria-hidden': 'true',
                innerHTML: wrapIcon('<path d="m6 9 6 6 6-6" />'),
              }),
            ],
          )
        : h('button', {
            type: 'button',
            class: 'plume-toolbar__button',
            'data-tooltip': item.title,
            'aria-label': item.title,
            'aria-haspopup': 'menu',
            'aria-expanded': open.value,
            'data-active': active ? '' : undefined,
            onMousedown: (event: MouseEvent) => event.preventDefault(),
            onClick: () => (open.value = !open.value),
            innerHTML: item.icon ? wrapIcon(item.icon) : undefined,
          })

      const menu = open.value
        ? h(
            'div',
            {
              class: ['plume-toolbar__menu', isSwatch ? 'plume-toolbar__menu--swatch' : ''],
              role: 'menu',
            },
            (item.options ?? []).map((option, index) =>
              isSwatch && option.value
                ? h('button', {
                    key: option.value,
                    type: 'button',
                    role: 'menuitemradio',
                    'aria-checked': option.isActive?.(editor) ?? false,
                    class: 'plume-toolbar__swatch',
                    title: option.label,
                    'aria-label': option.label,
                    style: { background: option.value },
                    'data-active': option.isActive?.(editor) ? '' : undefined,
                    onMousedown: (event: MouseEvent) => event.preventDefault(),
                    onClick: () => choose(option.run),
                  })
                : h(
                    'button',
                    {
                      key: option.value ?? `${option.label}-${index}`,
                      type: 'button',
                      role: 'menuitem',
                      class: 'plume-toolbar__menu-item',
                      'data-active': option.isActive?.(editor) ? '' : undefined,
                      style: option.value && !isSwatch ? { fontFamily: option.value } : undefined,
                      onMousedown: (event: MouseEvent) => event.preventDefault(),
                      onClick: () => choose(option.run),
                    },
                    option.label,
                  ),
            ),
          )
        : null

      return h('div', { class: 'plume-toolbar__dropdown', ref: root }, [trigger, menu])
    }
  },
})
