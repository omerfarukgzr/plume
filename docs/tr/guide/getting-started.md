---
description: 'Plume’un React veya Vue adaptörünü kurun, stil dosyasını içe aktarın ve birkaç satırda tiptap tabanlı zengin metin editörünü ekranda görün.'
---

# Hemen başla

## Kurulum

Kullandığınız framework'ün adaptörünü `@useplume/core` ile birlikte kurun.

**React:**

::: code-group

```sh [npm]
npm install @useplume/react @useplume/core
```

```sh [pnpm]
pnpm add @useplume/react @useplume/core
```

```sh [yarn]
yarn add @useplume/react @useplume/core
```

:::

**Vue 3:**

::: code-group

```sh [npm]
npm install @useplume/vue @useplume/core
```

```sh [pnpm]
pnpm add @useplume/vue @useplume/core
```

```sh [yarn]
yarn add @useplume/vue @useplume/core
```

:::

### tiptap bir peer bağımlılıktır

Plume **tiptap v3** üzerine kuruludur. `@tiptap/core` ve `@tiptap/pm`
`peerDependencies` olarak tanımlıdır; böylece uygulamanız ve Plume **tek** bir
tiptap örneğini paylaşır — çift kopya yok, bundle şişmesi yok. Çoğu paket
yöneticisi (npm 7+, pnpm, yarn) peer'leri otomatik kurar; sizinki kurmuyorsa
elle ekleyin:

```sh
npm install @tiptap/core @tiptap/pm
```

::: warning tiptap v2 çakışması
Plume tiptap **v3** gerektirir ve aynı uygulamada tiptap **v2** ile bir arada
çalışamaz — karışık v2/v3 bağımlılık ağacı çalışma zamanında kırılır. Projeniz
zaten tiptap kullanıyorsa, Plume eklemeden önce v3'te olduğundan emin olun.
:::

## Hızlı başlangıç

Bileşeni ve stil dosyasını içe aktarıp ekrana koymanız yeterli. Varsayılan eklentiler,
toolbar ve tema hiçbir ayar yapmadan çalışır.

::: code-group

```tsx [React]
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export function App() {
  return <PlumeEditor content="<p>Merhaba Plume 🪶</p>" />
}
```

```vue [Vue]
<script setup lang="ts">
import { PlumeEditor } from '@useplume/vue'
import '@useplume/core/styles.css'
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
<PlumeEditor content="<p>Beni düzenle</p>" onUpdate={(editor) => console.log(editor.getHTML())} />
```

```vue [Vue]
<PlumeEditor content="<p>Beni düzenle</p>" :on-update="(editor) => console.log(editor.getHTML())" />
```

:::

### `v-model` ile çift yönlü bağlama (Vue)

Vue adaptörü `v-model:content`'i destekler; belgeyi bir ref'e bağlayabilirsiniz.
Bağlanan değer varsayılan olarak HTML'dir; tiptap JSON belgesi için
`output="json"` geçin. Yayınlar, `onUpdate` gibi `updateDelay` (300 ms) ile
debounce edilir.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PlumeEditor } from '@useplume/vue'
import '@useplume/core/styles.css'

const html = ref('<p>Beni düzenle</p>')
</script>

<template>
  <PlumeEditor v-model:content="html" />
  <!-- HTML yerine JSON: -->
  <!-- <PlumeEditor v-model:content="doc" output="json" /> -->
</template>
```

`content` prop'u reaktiftir, dolayısıyla bu **async veri** durumunu da kapsar:
editörü hemen render edin, veri geldiğinde `content`'i (ya da `v-model` ref'ini)
atayın; belge yeniden mount edilmeden yerinde güncellenir. Kullanıcının az önce
yazdığı değeri tekrar atamak işlemsizdir, imleç bozulmaz.

## Editöre doğrudan erişmek

Her şeyi kendiniz yönetmek isterseniz editörü hook/composable ile oluşturup
`<EditorContent>`'i kendiniz yerleştirebilirsiniz.

::: code-group

```tsx [React]
import { usePlumeEditor, EditorContent, Toolbar } from '@useplume/react'
import '@useplume/core/styles.css'

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
import { usePlumeEditor, EditorContent, Toolbar } from '@useplume/vue'
import '@useplume/core/styles.css'

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

## Salt-okunur mod

Saklanan içeriği düzenlemeden göstermek için `editable={false}` geçin ve toolbar'ı
gizleyin. Aynı bileşen hem editörünüzü hem de yayımlanmış görünümünüzü render eder.

```tsx
<PlumeEditor content={savedHtml} editable={false} toolbar={false} />
```

## Sunucu tarafı render (SSR)

Editör istemcide mount edilir. İki adaptör biraz farklıdır:

- **React** — ilk paint sunucuda senkron çalışmasın diye `immediatelyRender={false}`
  geçin; aksi halde hidrasyon uyuşmazlığı oluşur.

  ```tsx
  // Next.js App Router — dosyayı 'use client' olarak işaretleyin
  ;<PlumeEditor content="<p>…</p>" immediatelyRender={false} />
  ```

- **Vue / Nuxt** — Vue adaptörü editörü her zaman `onMounted` içinde oluşturur,
  dolayısıyla `immediatelyRender` yok sayılır. Bileşeni `<ClientOnly>` ile sarın
  (Nuxt) ki SSR sırasında render edilmesin.

Tam parçacıklar için [SSR tarifleri](/tr/examples#ssr-next-js-app-router)'ne bakın.

## Hangi API'yi kullanmalıyım?

| İhtiyaç                                         | Kullanın                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| Toolbar + temalı hazır editör                   | `<PlumeEditor>`                                                   |
| Özel yerleşim, kendi toolbar konumunuz          | `usePlumeEditor` + `<EditorContent>` + `<Toolbar>`                |
| İçeriği okumak/serileştirmek, komut çalıştırmak | hook'tan dönen `Editor` — bkz. [Editor API](/tr/guide/editor-api) |

Sırada: [toolbar'ı, fontları ve eklentileri özelleştirmek](/tr/guide/customization)
ya da [Örnekler & tarifler](/tr/examples)'e göz atın.
