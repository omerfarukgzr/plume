import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  onMounted,
  watch,
  type PropType,
} from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import {
  injectFontFaces,
  resolveMessages,
  resolveToolbarItems,
  type Editor,
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
    /**
     * Force edge-to-edge content (drop any `--plume-content-max-width`). The
     * editor is already edge-to-edge by default, so this only matters when an
     * ancestor has opted into a centered reading column. Equivalent to adding
     * the `plume--fluid` class.
     */
    fluid: { type: Boolean, default: false },
    /**
     * Format emitted by `v-model:content` / `update:content`: `'html'`
     * (default, `editor.getHTML()`) or `'json'` (the tiptap document).
     */
    output: { type: String as PropType<'html' | 'json'>, default: 'html' },
    onUpdate: {
      type: Function as PropType<PlumeOptions['onUpdate']>,
      default: undefined,
    },
    updateDelay: { type: Number as PropType<number | undefined>, default: undefined },
  },
  // `update:content` powers `v-model:content`.
  emits: ['update:content'],
  setup(props, { emit }) {
    const serialize = (instance: Editor) =>
      props.output === 'json' ? instance.getJSON() : instance.getHTML()

    // Only attach an `onUpdate` (and pay the per-edit serialization cost) when
    // something actually consumes the change: a `v-model`/`update:content`
    // listener, or the `onUpdate` prop.
    const instance = getCurrentInstance()
    const hasModelListener = Boolean(instance?.vnode.props?.['onUpdate:content'])
    const onUpdate: PlumeOptions['onUpdate'] =
      hasModelListener || props.onUpdate
        ? (ed) => {
            if (hasModelListener) emit('update:content', serialize(ed))
            props.onUpdate?.(ed)
          }
        : undefined

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
      onUpdate,
      updateDelay: props.updateDelay,
    })

    onMounted(() => injectFontFaces(props.fonts))

    // Propagate later `:editable` changes to the live editor (the initial value
    // is applied at creation; this keeps the prop reactive after mount).
    watch(
      () => props.editable,
      (value) => editor.value?.setEditable(value),
    )

    // Keep `content` reactive (enables `v-model:content` and async/late data).
    // Skip when the incoming value already matches the document — that's the
    // echo from our own `update:content`, and re-setting would reset the cursor.
    watch(
      () => props.content,
      (value) => {
        const ed = editor.value
        if (!ed) return
        const incoming = value ?? (props.output === 'json' ? { type: 'doc', content: [] } : '')
        const current = serialize(ed)
        const same =
          props.output === 'json'
            ? JSON.stringify(incoming) === JSON.stringify(current)
            : incoming === current
        if (same) return
        ed.commands.setContent(incoming as Parameters<typeof ed.commands.setContent>[0], {
          emitUpdate: false,
        })
      },
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

    const rootClass = computed(() => ['plume', props.fluid && 'plume--fluid'].filter(Boolean))

    return () => {
      const ed = editor.value
      if (!ed) return null
      return h('div', { class: rootClass.value }, [
        showToolbar.value
          ? h(Toolbar, { editor: ed, items: items.value, ariaLabel: toolbarLabel.value })
          : null,
        h(EditorContent, { editor: ed, class: 'plume-editor' }),
        props.pasteManager ? h(PasteModal, { editor: ed, locale: props.locale }) : null,
      ])
    }
  },
})
