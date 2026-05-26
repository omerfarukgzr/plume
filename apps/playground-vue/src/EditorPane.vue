<script setup lang="ts">
import { computed, ref } from 'vue'
import { EditorContent, PasteModal, Toolbar, usePlumeEditor } from '@useplume/vue'
import { resolveToolbarItems, type CustomBlockquoteSpec, type ToolbarConfig } from '@useplume/core'

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

const html = ref(props.initialHtml)

// The composable API: drive the editor yourself. `<PlumeEditor />` wraps all of
// this in a single component if you don't need the editor instance.
//
// `onUpdate` is debounced by Plume (default 300ms), so the live preview
// serializes the document only after you pause typing — no hand-rolled timer.
// Each refresh is lifted up so <App> can re-seed the editor on a language switch.
const editor = usePlumeEditor({
  content: props.initialHtml,
  placeholder: placeholders[props.lang],
  locale: props.lang,
  autoCapitalize: true,
  blockquotes: props.blockquotes,
  // Intercept paste and ask plain-text vs. keep-formatting via a modal.
  pasteManager: true,
  // No `uploadHandler` → images embed as base64 (zero config). The bubble-menu/
  // caption labels follow `locale` automatically.
  onUpdate: (instance) => {
    html.value = instance.getHTML()
    emit('update:html', html.value)
  },
})

const items = computed(() =>
  resolveToolbarItems(props.toolbar, { locale: props.lang, blockquotes: props.blockquotes }),
)
</script>

<template>
  <div v-if="editor" class="plume" :data-theme="dark ? 'dark' : undefined">
    <Toolbar :editor="editor" :items="items" />
    <EditorContent :editor="editor" class="plume-editor" />
    <!-- `<PlumeEditor />` renders this for you; with the composable API we add
         the paste chooser ourselves since `pasteManager` is enabled. -->
    <PasteModal :editor="editor" :locale="lang" />
  </div>

  <details class="output">
    <summary>HTML output</summary>
    <pre>{{ html }}</pre>
  </details>
</template>
