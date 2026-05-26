---
description: 'Plume’un React veya Vue adaptörünü kurun, stil dosyasını içe aktarın ve birkaç satırda tiptap tabanlı zengin metin editörünü ekranda görün.'
---

# Hemen başla

## Kurulum

Kullandığınız framework'ün adaptörünü, `@useplume/core`'u ve iki tiptap peer'ini
kurun. Plume **tiptap v3** üzerine kuruludur: `@tiptap/core` ve `@tiptap/pm`
`peerDependencies` olarak tanımlıdır; böylece uygulamanız ve Plume **tek** bir
tiptap örneğini paylaşır — çift kopya yok, bundle şişmesi yok. Paket
yöneticinizin auto-install-peers davranışına güvenmek yerine bunları `^3` ile
**kendiniz kurun**.

**React:**

::: code-group

```sh [npm]
npm install @useplume/react @useplume/core @tiptap/core@^3 @tiptap/pm@^3
```

```sh [pnpm]
pnpm add @useplume/react @useplume/core @tiptap/core@^3 @tiptap/pm@^3
```

```sh [yarn]
yarn add @useplume/react @useplume/core @tiptap/core@^3 @tiptap/pm@^3
```

:::

**Vue 3:**

::: code-group

```sh [npm]
npm install @useplume/vue @useplume/core @tiptap/core@^3 @tiptap/pm@^3
```

```sh [pnpm]
pnpm add @useplume/vue @useplume/core @tiptap/core@^3 @tiptap/pm@^3
```

```sh [yarn]
yarn add @useplume/vue @useplume/core @tiptap/core@^3 @tiptap/pm@^3
```

:::

::: tip Peer'leri neden kendiniz kuruyorsunuz?
Çoğu paket yöneticisi (npm 7+, pnpm, yarn) peer'leri otomatik kurabilir, ama bu
davranış yapılandırılabilir ve kolayca kapatılabilir. `@tiptap/core@^3` ve
`@tiptap/pm@^3`'ü kendi `dependencies`'inize eklemek gereksinimi açık ve çözümü
deterministik kılar.
:::

### Zaten tiptap v2 mi kullanıyorsunuz?

Plume tiptap **v3** gerektirir. Durumlar:

- **v3'tesiniz ya da henüz tiptap kullanmıyorsunuz** → yukarıdaki kurulum yeterli.
  Yapılacak başka bir şey yok.
- **Uygulamanın başka yerinde hâlâ tiptap v2 var** → zor kısım bu ve Plume'a özgü
  değil: hiçbir paket yöneticisi aynı import grafiğinde aynı paketin iki major
  sürümünü temiz biçimde çalıştıramaz. `peerDependencies` de bunu çözemez — Plume
  v3 ister, uygulamanız v2 verir. İki seçeneğiniz var.

**Seçenek A — tiptap v3'e geçin (önerilen).** Kendi `@tiptap/*` paketlerinizi
v3'e yükseltip tiptap'in
[v2 → v3 geçiş rehberini](https://tiptap.dev/docs/resources/upgrade-tiptap-v2-to-v3)
izleyin. Böylece her şey tek bir v3 örneğini paylaşır ve düz kurulum çalışır.

**Seçenek B — Plume'u v3'te izole edin (pnpm).** Henüz geçemiyorsanız, repo
kökünüze bir `.pnpmfile.cjs` koyup tiptap v3 ailesini Plume alt ağacına sabitleyin
ve peer de-duplication'ı kapatın ki pnpm Plume'un bağımlılıklarını uygulamanızın
v2'sine geri çekmesin:

```js
// .pnpmfile.cjs
// Uygulamanın geri kalanı tiptap v2'de olsa bile @useplume/* (ve onların çektiği
// tiptap paketleri) tiptap v3'te kalsın.
const V3 = '^3'
const TIPTAP_V3 = new Set([
  '@tiptap/core',
  '@tiptap/pm',
  '@tiptap/extensions',
  '@tiptap/extension-list',
  '@tiptap/extension-list-item',
])

function readPackage(pkg) {
  if (pkg.name?.startsWith('@useplume/')) {
    for (const field of ['dependencies', 'peerDependencies']) {
      for (const dep of Object.keys(pkg[field] ?? {})) {
        if (TIPTAP_V3.has(dep)) pkg[field][dep] = V3
      }
    }
  }
  return pkg
}

module.exports = { hooks: { readPackage } }
```

```ini
# .npmrc
auto-install-peers=true
dedupe-peer-dependents=false
```

Sonra yeniden kurun (`pnpm install`). Bu, mevcut v2 kodunuz çalışmaya devam
ederken Plume'u kendi v3 tiptap kopyasında tutar. İki major'ı bir arada
yaşatmanın geçici çözümüdür — temiz son nokta yine v3'e geçmektir (Seçenek A).

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
