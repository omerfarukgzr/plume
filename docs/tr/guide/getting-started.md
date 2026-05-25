# Hemen başla

## Kurulum

Kullandığınız framework'ün adaptörünü kurun. Adaptör, `@plume/core`'u ve gerekli tiptap
paketlerini kendisi getirir; siz onlarla ayrıca uğraşmazsınız.

::: code-group

```sh [React]
pnpm add @plume/react
```

```sh [Vue]
pnpm add @plume/vue
```

:::

## Hızlı başlangıç

Bileşeni ve stil dosyasını içe aktarıp ekrana koymanız yeterli. Varsayılan eklentiler,
toolbar ve tema hiçbir ayar yapmadan çalışır.

::: code-group

```tsx [React]
import { PlumeEditor } from '@plume/react'
import '@plume/core/styles.css'

export function App() {
  return <PlumeEditor content="<p>Merhaba Plume 🪶</p>" />
}
```

```vue [Vue]
<script setup lang="ts">
import { PlumeEditor } from '@plume/vue'
import '@plume/core/styles.css'
</script>

<template>
  <PlumeEditor content="<p>Merhaba Plume 🪶</p>" />
</template>
```

:::

## Değişiklikleri yakalamak

Belge her değiştiğinde haberdar olmak için `onUpdate` verin. Geri çağrı, alttaki tiptap
`Editor`'ını alır; içeriği `editor.getHTML()` ya da `editor.getJSON()` ile dışa
aktarabilirsiniz. Varsayılan olarak 300 ms'lik bir gecikmeyle (debounce) çalışır, böylece
her tuşa bastığınızda yeniden serileştirme yapılmaz. Her değişiklikte anında çalışmasını
isterseniz `updateDelay={0}` verin.

::: code-group

```tsx [React]
<PlumeEditor
  content="<p>Beni düzenle</p>"
  onUpdate={(editor) => console.log(editor.getHTML())}
/>
```

```vue [Vue]
<PlumeEditor
  content="<p>Beni düzenle</p>"
  :on-update="(editor) => console.log(editor.getHTML())"
/>
```

:::

## Editöre doğrudan erişmek

Her şeyi kendiniz yönetmek isterseniz editörü hook/composable ile oluşturup
`<EditorContent>`'i kendiniz yerleştirebilirsiniz.

::: code-group

```tsx [React]
import { usePlumeEditor, EditorContent, Toolbar } from '@plume/react'
import '@plume/core/styles.css'

export function MyEditor() {
  const editor = usePlumeEditor({ content: '<p>Merhaba</p>' })
  return (
    <div className="plume">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
```

```vue [Vue]
<script setup lang="ts">
import { usePlumeEditor, EditorContent, Toolbar } from '@plume/vue'
import '@plume/core/styles.css'

const editor = usePlumeEditor({ content: '<p>Merhaba</p>' })
</script>

<template>
  <div class="plume">
    <Toolbar :editor="editor" />
    <EditorContent :editor="editor" />
  </div>
</template>
```

:::

Sırada: [toolbar'ı, fontları ve eklentileri özelleştirmek](/tr/guide/customization).
