import { defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, type PropType } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import {
  insertPaste,
  PASTE_EVENT,
  resolveMessages,
  type PasteMode,
  type PendingPaste,
} from '@useplume/core'

/**
 * The paste-mode chooser. Listens for the `plume:paste` event the
 * {@link PasteManager} extension dispatches and opens a modal offering plain
 * text vs. formatted paste. Rendered automatically by {@link PlumeEditor} when
 * `pasteManager` is enabled. Closes on Escape, on backdrop click, or after a
 * choice is made.
 */
export const PasteModal = defineComponent({
  name: 'PlumePasteModal',
  props: {
    editor: { type: Object as PropType<Editor>, required: true },
    locale: { type: String as PropType<string | undefined>, default: undefined },
  },
  setup(props) {
    const pending = ref<PendingPaste | null>(null)
    const styledButton = ref<HTMLButtonElement | null>(null)

    // The event bubbles to `document`; scope it to this editor so multiple
    // editors on a page don't all open. Reading `view.dom` is safe inside the
    // handler because a real paste only fires once the editor is mounted.
    const onPaste = (event: Event) => {
      const target = event.target as Node | null
      const dom = props.editor.isDestroyed ? null : props.editor.view.dom
      if (!dom || !target || !(target === dom || dom.contains(target))) return
      pending.value = (event as CustomEvent<PendingPaste>).detail
      void nextTick(() => styledButton.value?.focus())
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') pending.value = null
    }

    onMounted(() => {
      document.addEventListener(PASTE_EVENT, onPaste)
      document.addEventListener('keydown', onKeyDown)
    })
    onBeforeUnmount(() => {
      document.removeEventListener(PASTE_EVENT, onPaste)
      document.removeEventListener('keydown', onKeyDown)
    })

    const choose = (mode: PasteMode) => {
      if (pending.value) insertPaste(props.editor, pending.value, mode)
      pending.value = null
    }

    return () => {
      if (!pending.value) return null
      const labels = resolveMessages(props.locale).paste

      const card = h(
        'div',
        {
          class: 'plume-paste-modal__card',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': labels.title,
          onPointerdown: (event: PointerEvent) => event.stopPropagation(),
        },
        [
          h('h2', { class: 'plume-paste-modal__title' }, labels.title),
          h('p', { class: 'plume-paste-modal__description' }, labels.description),
          h('div', { class: 'plume-paste-modal__actions' }, [
            h(
              'button',
              {
                type: 'button',
                class: 'plume-paste-modal__button plume-paste-modal__button--ghost',
                onClick: () => (pending.value = null),
              },
              labels.cancel,
            ),
            h(
              'button',
              {
                type: 'button',
                class: 'plume-paste-modal__button plume-paste-modal__button--secondary',
                onClick: () => choose('clean'),
              },
              labels.plainText,
            ),
            h(
              'button',
              {
                ref: styledButton,
                type: 'button',
                class: 'plume-paste-modal__button plume-paste-modal__button--primary',
                onClick: () => choose('styled'),
              },
              labels.styled,
            ),
          ]),
        ],
      )

      return h(
        'div',
        {
          class: 'plume-paste-modal',
          role: 'presentation',
          onPointerdown: () => (pending.value = null),
        },
        [card],
      )
    }
  },
})
