import { computed, defineComponent, h, onMounted, watch, type PropType } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import {
  injectFontFaces,
  resolveMessages,
  resolveToolbarItems,
  type FontOption,
  type PlumeOptions,
  type ToolbarConfig,
} from '@useplume/core'
import { usePlumeEditor } from './usePlumeEditor'
import { Toolbar } from './Toolbar'
import { PasteModal } from './PasteModal'

/**
 * Drop-in rich text editor: a toolbar plus the editable surface.
 *
 * For full control, compose {@link usePlumeEditor}, {@link Toolbar} and
 * tiptap's `EditorContent` yourself.
 */
export const PlumeEditor = defineComponent({
  name: 'PlumeEditor',
  props: {
    content: {
      type: [String, Object] as PropType<PlumeOptions['content']>,
      default: '',
    },
    editable: { type: Boolean, default: true },
    placeholder: { type: String as PropType<string | undefined>, default: undefined },
    toolbar: {
      type: [Array, Boolean] as PropType<ToolbarConfig>,
      default: undefined,
    },
    extensions: {
      type: Array as PropType<PlumeOptions['extensions']>,
      default: undefined,
    },
    defaultExtensions: { type: Boolean, default: true },
    autofocus: {
      type: [Boolean, String, Number] as PropType<PlumeOptions['autofocus']>,
      default: false,
    },
    editorClass: { type: String as PropType<string | undefined>, default: undefined },
    immediatelyRender: { type: Boolean, default: true },
    fonts: { type: Array as PropType<FontOption[] | undefined>, default: undefined },
    colors: { type: Array as PropType<string[] | undefined>, default: undefined },
    locale: { type: String as PropType<string | undefined>, default: undefined },
    autoCapitalize: {
      type: [Boolean, Object] as PropType<PlumeOptions['autoCapitalize']>,
      default: false,
    },
    image: {
      type: [Boolean, Object] as PropType<PlumeOptions['image']>,
      default: undefined,
    },
    blockquotes: {
      type: Array as PropType<PlumeOptions['blockquotes']>,
      default: undefined,
    },
    pasteManager: { type: Boolean, default: false },
    toolbarItems: {
      type: Array as PropType<PlumeOptions['toolbarItems']>,
      default: undefined,
    },
    onUpdate: {
      type: Function as PropType<PlumeOptions['onUpdate']>,
      default: undefined,
    },
    updateDelay: { type: Number as PropType<number | undefined>, default: undefined },
  },
  setup(props) {
    const editor = usePlumeEditor({
      content: props.content,
      editable: props.editable,
      placeholder: props.placeholder,
      toolbar: props.toolbar,
      extensions: props.extensions,
      defaultExtensions: props.defaultExtensions,
      autofocus: props.autofocus,
      editorClass: props.editorClass,
      immediatelyRender: props.immediatelyRender,
      locale: props.locale,
      autoCapitalize: props.autoCapitalize,
      image: props.image,
      blockquotes: props.blockquotes,
      pasteManager: props.pasteManager,
      onUpdate: props.onUpdate,
      updateDelay: props.updateDelay,
    })

    onMounted(() => injectFontFaces(props.fonts))

    // Propagate later `:editable` changes to the live editor (the initial value
    // is applied at creation; this keeps the prop reactive after mount).
    watch(
      () => props.editable,
      (value) => editor.value?.setEditable(value),
    )

    const items = computed(() =>
      resolveToolbarItems(props.toolbar, {
        fonts: props.fonts,
        colors: props.colors,
        locale: props.locale,
        blockquotes: props.blockquotes,
        items: props.toolbarItems,
      }),
    )
    const showToolbar = computed(() => props.toolbar !== false)
    const toolbarLabel = computed(() => resolveMessages(props.locale).toolbarLabel)

    return () => {
      const instance = editor.value
      if (!instance) return null
      return h('div', { class: 'plume' }, [
        showToolbar.value
          ? h(Toolbar, { editor: instance, items: items.value, ariaLabel: toolbarLabel.value })
          : null,
        h(EditorContent, { editor: instance, class: 'plume-editor' }),
        props.pasteManager
          ? h(PasteModal, { editor: instance, locale: props.locale })
          : null,
      ])
    }
  },
})
