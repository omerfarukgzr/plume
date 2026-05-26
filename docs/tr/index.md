---
layout: home
description: 'Plume; tiptap üzerine kurulu, özelleştirilebilir, framework’ten bağımsız bir zengin metin editörüdür. Tek çekirdek; ince React ve Vue adaptörleri.'

hero:
  name: Plume
  text: Tek çekirdek, her framework.
  tagline: tiptap üzerine kurulu, istediğiniz gibi şekillendirebileceğiniz, framework'ten bağımsız bir zengin metin editörü. Bugün React ve Vue'da çalışır; yarın Svelte, Solid ve vanilla'ya da editörü baştan yazmadan açılır.
  image:
    light: /logo.svg
    dark: /logo-dark.svg
    alt: Plume
  actions:
    - theme: brand
      text: Hemen başla
      link: /tr/guide/getting-started
    - theme: alt
      text: Canlı demo
      link: /tr/demo
    - theme: alt
      text: Plume nedir?
      link: /tr/guide/
---

## Plume nedir?

Plume, [tiptap](https://tiptap.dev) üzerine kurulu, özelleştirilebilir bir
zengin metin editörüdür. Editörün tüm mantığı — eklentiler, toolbar, görsel
yükleme, tema — framework'ten bağımsız tek bir çekirdekte (`@useplume/core`)
yaşar; her framework için ince birer adaptör vardır. Bugün: **React** ve **Vue 3**.

## Hızlı başlangıç

Framework adaptörünü çekirdekle birlikte kurun (npm, pnpm ya da yarn):

```sh
npm install @useplume/react @useplume/core   # React
npm install @useplume/vue @useplume/core     # Vue 3
```

Sonra editörü ekleyin — toolbar, tema ve varsayılan eklentiler hazır gelir:

```tsx
// React
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export function App() {
  return <PlumeEditor content="<p>Merhaba Plume 🪶</p>" />
}
```

```vue
<!-- Vue 3 -->
<script setup lang="ts">
import { ref } from 'vue'
import { PlumeEditor } from '@useplume/vue'
import '@useplume/core/styles.css'

const html = ref('<p>Merhaba Plume 🪶</p>')
</script>

<template>
  <PlumeEditor v-model:content="html" />
</template>
```

> Plume **tiptap v3** gerektirir. `@tiptap/core` ve `@tiptap/pm` peer
> bağımlılıktır; böylece uygulamanız ve Plume tek bir tiptap örneğini paylaşır.

## Öne çıkanlar

- **Her şey hazır** — toolbar, tema, yüklemeli yeniden boyutlanabilir görseller,
  özel fontlar, dipnotlar, yapıştırma yöneticisi ve i18n (Türkçe & İngilizce gömülü).
- **Hazır veya kompoze** — hazır editör için `<PlumeEditor>`, yerleşim üzerinde
  tam kontrol için `usePlumeEditor()` + `<EditorContent>`.
- **Temalanabilir** — her değer bir `--plume-*` CSS değişkeni; koyu tema gelir,
  ya da tamamen stilsiz kullanın.
- **Vue-yerlisi** — `v-model:content` (HTML veya JSON) ve async veri için
  reaktif içerik.
- **Varsayılan tam genişlik** — içerik kapsayıcısını dar bir iç boşlukla
  doldurur; tek bir CSS değişkeniyle ortalanmış okuma sütununa (veya istediğiniz
  iç boşluğa) geçin.

[Hemen başla rehberini](/tr/guide/getting-started) okuyun ya da
[örnekler & tariflere](/tr/examples) göz atın.
