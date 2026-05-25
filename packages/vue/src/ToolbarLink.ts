import { defineComponent, h, nextTick, onBeforeUnmount, ref, type PropType } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { applyLink, getLinkState, removeLink, resolveMessages, type ToolbarItem } from '@plume/core'

const wrapIcon = (inner: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`

/**
 * The link control: a toolbar button that opens an anchored popover with a URL
 * field (plus a "visible text" field when nothing is selected) and Apply /
 * Remove actions. Editing an existing link prefills its URL and exposes Remove.
 */
export const ToolbarLink = defineComponent({
  name: 'PlumeToolbarLink',
  props: {
    editor: { type: Object as PropType<Editor>, required: true },
    item: { type: Object as PropType<ToolbarItem>, required: true },
  },
  setup(props) {
    const open = ref(false)
    const root = ref<HTMLElement | null>(null)
    const urlField = ref<HTMLInputElement | null>(null)
    const url = ref('')
    const text = ref('')
    // Snapshotted on open so it doesn't flip while focus moves to the inputs.
    const needsText = ref(false)

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

    const openPanel = () => {
      const state = getLinkState(props.editor)
      url.value = state.href
      text.value = ''
      needsText.value = !state.isActive && !state.hasSelection
      open.value = true
      void nextTick(() => {
        urlField.value?.focus()
        urlField.value?.select()
      })
    }

    const submit = () => {
      if (applyLink(props.editor, url.value, needsText.value ? text.value : undefined)) {
        open.value = false
      }
    }

    const remove = () => {
      removeLink(props.editor)
      open.value = false
    }

    return () => {
      const { item, editor } = props
      const labels = item.linkLabels ?? resolveMessages().link
      const active = item.isActive?.(editor) ?? false

      const trigger = h('button', {
        type: 'button',
        class: 'plume-toolbar__button',
        'data-tooltip': item.title,
        'aria-label': item.title,
        'aria-haspopup': 'dialog',
        'aria-expanded': open.value,
        'data-active': active ? '' : undefined,
        onMousedown: (event: MouseEvent) => event.preventDefault(),
        onClick: () => (open.value ? (open.value = false) : openPanel()),
        innerHTML: item.icon ? wrapIcon(item.icon) : undefined,
      })

      const panel = open.value
        ? h(
            'form',
            {
              class: 'plume-toolbar__link-panel',
              role: 'dialog',
              'aria-label': item.title,
              onSubmit: (event: Event) => {
                event.preventDefault()
                submit()
              },
            },
            [
              needsText.value
                ? h('input', {
                    type: 'text',
                    class: 'plume-toolbar__link-input',
                    value: text.value,
                    placeholder: labels.textPlaceholder,
                    onInput: (event: Event) =>
                      (text.value = (event.target as HTMLInputElement).value),
                  })
                : null,
              h('input', {
                ref: urlField,
                type: 'text',
                class: 'plume-toolbar__link-input',
                value: url.value,
                placeholder: labels.urlPlaceholder,
                inputmode: 'url',
                onInput: (event: Event) => (url.value = (event.target as HTMLInputElement).value),
              }),
              h('div', { class: 'plume-toolbar__link-actions' }, [
                active
                  ? h(
                      'button',
                      { type: 'button', class: 'plume-toolbar__link-remove', onClick: remove },
                      labels.remove,
                    )
                  : null,
                h(
                  'button',
                  {
                    type: 'submit',
                    class: 'plume-toolbar__link-apply',
                    disabled: !url.value.trim(),
                  },
                  labels.apply,
                ),
              ]),
            ],
          )
        : null

      return h('div', { class: 'plume-toolbar__dropdown', ref: root }, [trigger, panel])
    }
  },
})
