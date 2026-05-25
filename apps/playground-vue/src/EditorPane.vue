<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { EditorContent, Toolbar, usePlumeEditor } from '@plume/vue'
import { resolveToolbarItems, type CustomBlockquoteSpec, type ToolbarConfig } from '@plume/core'

// The editor is created once on mount with the locale baked in (placeholder,
// change-case locale, image labels). <App> keys this component by `lang`, so a
// language switch remounts it and rebuilds the editor in the new locale; the
// current HTML is passed back in as `initialHtml` to preserve the document.
const props = defineProps<{
  lang: 'tr' | 'en'
  initialHtml: string
  toolbar: ToolbarConfig
  blockquotes: CustomBlockquoteSpec[]
  dark: boolean
}>()

const emit = defineEmits<{ (e: 'update:html', html: string): void }>()

const placeholders: Record<'tr' | 'en', string> = {
  tr: 'Bir şeyler yazın…',
  en: 'Start typing…',
}

// The composable API: drive the editor yourself. `<PlumeEditor />` wraps all of
// this in a single component if you don't need the editor instance.
const editor = usePlumeEditor({
  content: props.initialHtml,
  placeholder: placeholders[props.lang],
  locale: props.lang,
  autoCapitalize: true,
  blockquotes: props.blockquotes,
  // No `uploadHandler` → images embed as base64 (zero config). The bubble-menu/
  // caption labels follow `locale` automatically.
})

const items = computed(() =>
  resolveToolbarItems(props.toolbar, { locale: props.lang, blockquotes: props.blockquotes }),
)

const html = ref('')

// Debounced so the live preview never serializes the document on every
// keystroke — it refreshes ~200ms after you pause typing. Each refresh is also
// lifted up so <App> can re-seed the editor when the language changes.
watchEffect((onCleanup) => {
  const instance = editor.value
  if (!instance) return
  html.value = instance.getHTML()
  emit('update:html', html.value)
  let timer: ReturnType<typeof setTimeout> | undefined
  const sync = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      html.value = instance.getHTML()
      emit('update:html', html.value)
    }, 200)
  }
  instance.on('update', sync)
  onCleanup(() => {
    clearTimeout(timer)
    instance.off('update', sync)
  })
})
</script>

<template>
  <div v-if="editor" class="plume" :data-theme="dark ? 'dark' : undefined">
    <Toolbar :editor="editor" :items="items" />
    <EditorContent :editor="editor" class="plume-editor" />
  </div>

  <details class="output">
    <summary>HTML output</summary>
    <pre>{{ html }}</pre>
  </details>
</template>
