---
description: 'Plume editörünü programatik olarak sürün: tiptap Editor örneğine erişin, içeriği okuyup serileştirin, komut çalıştırın, salt-okunur moda geçin ve Plume’un bağlantı/görsel/yapıştırma yardımcılarını kullanın.'
---

# Editor örneği & komutlar

`<PlumeEditor>` çoğu uygulamayı karşılar; ama içeriği okumanız, kendi düğmelerinizden
komut çalıştırmanız ya da tamamen özel bir yerleşim kurmanız gerektiğinde alttaki
tiptap `Editor`'üne ulaşın.

## Örneğe erişme

Hook/composable kullanıp parçaları kendiniz render edin:

::: code-group

```tsx [React]
import { usePlumeEditor, EditorContent, Toolbar } from '@useplume/react'
import '@useplume/core/styles.css'

export function MyEditor() {
  const editor = usePlumeEditor({ content: '<p>Merhaba</p>' })
  // `editor` hazır olana dek null; kullanmadan önce kontrol edin.
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

// Ref<Editor | undefined> — mount edilene dek undefined.
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

::: tip React ve Vue
React'ta hook `Editor | null` döndürür ve sizin için yeniden render eder. Vue'da
`Ref<Editor | undefined>` döndürür — `editor.value`'yu okuyun. Her iki durumda da aynı
tiptap `Editor`'üdür; aşağıdaki tüm komut ve getter'lar aynıdır.
:::

## İçeriği okuma

```ts
editor.getHTML() // '<p>Merhaba</p>' — saklamaya/render etmeye hazır string
editor.getJSON() // ProseMirror belgesi — kayıpsız gidip gelir
editor.getText() // yalnızca düz metin
editor.isEmpty // belge boşsa true
```

Hem `getHTML()` hem `getJSON()` geçerli birer `content` değeridir; ikisinden birini
saklayıp doğrudan geri verebilirsiniz.

## Değişikliklere tepki verme

Poll etmek yerine `onUpdate` seçeneğini tercih edin — debounce'ludur (varsayılan
300 ms), böylece serileştirme her tuş vuruşunda çalışmaz:

```tsx
<PlumeEditor
  onUpdate={(editor) => save(editor.getHTML())}
  updateDelay={500} // ya da senkron için 0
/>
```

`onUpdate`, `Editor`'ü alır; sakladığınız biçimle serileştirin. Büyük belgelerde bu
serileştirme, düzenleme başına en baskın maliyettir — gerçekten her değişiklik
gerekmiyorsa debounce'u koruyun.

## Komut çalıştırma

tiptap komutları zincirlenebilir. Editörün seçimi korusun diye önce `focus()`,
çalıştırmak için de `run()` çağırın:

```ts
editor.chain().focus().toggleBold().run()
editor.chain().focus().toggleHeading({ level: 2 }).run()
editor.chain().focus().setTextAlign('center').run()
editor.chain().focus().unsetAllMarks().clearNodes().run() // biçimi temizle
```

Plume'un kendi komutları da aynı şekilde çalışır:

```ts
editor.chain().focus().setImage({ src: '/kedi.png', align: 'center' }).run()
editor.chain().focus().setChangeCase('upper').run()
editor.chain().focus().toggleCustomBlockquote('note').run()
```

### Editör durumunu okuma

```ts
editor.isActive('bold') // seçim kalın mı?
editor.isActive('heading', { level: 2 }) // h2 mi?
editor.can().toggleBold() // komut şu an çalışır mıydı?
```

Toolbar'ın aktif düğmeleri yakması ve kullanılamayanları devre dışı bırakması da tam
olarak bunu kullanır.

## Salt-okunur / görüntüleme modu

Düzenleme ile temiz bir salt-okunur görünüm arasında geçiş için `editable`'ı açıp
kapatın (toolbar'a gerek yok):

```tsx
<PlumeEditor content={html} editable={false} toolbar={false} />
```

Ya da canlı bir örnek üzerinde imperatif olarak:

```ts
editor.setEditable(false)
```

Vue'da `<PlumeEditor>`, `:editable`'ı izler ve değişiklikleri canlı editöre otomatik
iletir.

## Plume yardımcıları

`@useplume/core`, toolbar'ın kullandığı yardımcıları dışa aktarır; böylece özel bir
arayüz bunları tersine mühendislikle çözmek zorunda kalmaz.

### Bağlantılar

```ts
import { applyLink, getLinkState, removeLink, normalizeLinkHref } from '@useplume/core'

getLinkState(editor) // mevcut seçim için { isActive, href, ... }
applyLink(editor, 'example.com') // https://example.com'a normalize eder
applyLink(editor, 'https://x.com', 'görünen metin') // metni de ekler
removeLink(editor)
normalizeLinkHref('example.com') // 'https://example.com'
```

### Görseller

```ts
import { insertImageFromFile, collectImageAssetIds } from '@useplume/core'

insertImageFromFile(editor, file) // bir File'ı yükleme hattından geçirir
collectImageAssetIds(editor) // ['9f1c…'] — hâlâ referans verilen yüklemeler; temizlik için
```

`collectImageAssetIds`, sahipsiz yükleme uzlaştırmasının temelidir — bkz.
[Görseller & yükleme](/tr/guide/images#sahipsiz-yüklemeleri-temizleme).

### Yapıştırma

```ts
import { insertPaste } from '@useplume/core'

insertPaste(editor, { html, text }, 'styled') // veya 'plainText'
```

## Komut çalıştıran özel toolbar düğmeleri

`toolbarItems` ile bir kontrol kaydedin ve `name` ile referans verin. `run` geri
çağrısı `Editor`'ü alır; `isActive` / `isDisabled` görsel durumunu yönetir:

```tsx
<PlumeEditor
  toolbar={['bold', 'clearFormat']}
  toolbarItems={[
    {
      name: 'clearFormat',
      type: 'button',
      title: 'Biçimlendirmeyi temizle',
      icon: '<path d="…"/>', // iç SVG işaretlemesi
      run: (editor) => editor.chain().focus().unsetAllMarks().clearNodes().run(),
      isActive: () => false,
      isDisabled: (editor) => editor.isEmpty,
    },
  ]}
/>
```

`ToolbarItem` şekli ve toolbar'ı tamamen kendiniz render ettiğinizde işe yarayan
`resolveToolbarItems` yardımcısı için bkz. [Toolbar öğeleri](/tr/api/toolbar).

## Temizlik

React hook'u ve Vue composable'ı, editörü unmount'ta sizin için yok eder. Bir gün
doğrudan bir tiptap `Editor` kurarsanız, işiniz bitince `editor.destroy()` çağırın.
