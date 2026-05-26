---
description: 'Kopyala-yapıştır Plume tarifleri: blog editörü, yorum kutusu, salt-okunur görüntüleyici, API’ye kaydetme, karanlık mod düğmesi, özel toolbar düğmesi, etiketleme (mention), stilsiz mod ve Next.js/Nuxt ile SSR.'
---

# Örnekler & tarifler

Kendi kendine yeten, kopyala-yapıştır tarifler. Her biri tamdır — yapıştırın ve
ayarlayın. Arkalarındaki seçenek ayrıntıları için bkz. [PlumeOptions](/tr/api/options).

[[toc]]

## Minimal editör

İşe yarayan en küçük şey — varsayılan toolbar, tema ve eklentiler.

```tsx
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export const App = () => <PlumeEditor content="<p>Merhaba 🪶</p>" />
```

## Blog yazısı editörü

Odaklı bir toolbar, yer tutucu, autofocus ve sunucu destekli görsel yüklemeleri.

```tsx
import { PlumeEditor } from '@useplume/react'
import { createUploadHandler } from '@useplume/core'
import '@useplume/core/styles.css'

export function PostEditor({ initialHtml, onChange }) {
  return (
    <PlumeEditor
      content={initialHtml}
      placeholder="Hikâyeni anlat…"
      autofocus="end"
      toolbar={[
        'heading1',
        'heading2',
        '|',
        'bold',
        'italic',
        'strike',
        'highlight',
        '|',
        'bulletList',
        'orderedList',
        'blockquote',
        'codeBlock',
        '|',
        'link',
        'image',
        'footnote',
        '|',
        'undo',
        'redo',
      ]}
      image={{ uploadHandler: createUploadHandler({ url: '/api/upload' }) }}
      onUpdate={(editor) => onChange(editor.getHTML())}
    />
  )
}
```

## Kompakt yorum kutusu

Minik bir toolbar, görsel yok, dipnot yok — sadece satır içi işaretler ve bir bağlantı.

```tsx
<PlumeEditor
  placeholder="Yorum ekle…"
  toolbar={['bold', 'italic', 'code', '|', 'link']}
  image={false}
  footnote={false}
  onUpdate={(editor) => setDraft(editor.getHTML())}
/>
```

## Salt-okunur görüntüleyici

Saklanan içeriği toolbar olmadan ve düzenlenemez şekilde render edin.

```tsx
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export const ArticleView = ({ html }) => (
  <PlumeEditor content={html} editable={false} toolbar={false} />
)
```

## API'ye kaydetme

`onUpdate` ile debounce'lu otomatik kayıt; ayrıca hangi yüklenen varlıkların hâlâ
kullanıldığını da bildiren açık bir kaydetme (sahipsiz temizliği için):

```tsx
import { usePlumeEditor, EditorContent, Toolbar } from '@useplume/react'
import { collectImageAssetIds } from '@useplume/core'

export function Editor({ docId, initialHtml }) {
  const editor = usePlumeEditor({
    content: initialHtml,
    updateDelay: 800,
    onUpdate: (e) => autosave(docId, e.getHTML()),
  })

  async function saveNow() {
    if (!editor) return
    await fetch(`/api/docs/${docId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: editor.getHTML(),
        usedAssetIds: collectImageAssetIds(editor),
      }),
    })
  }

  return (
    <div className="plume">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <button onClick={saveNow}>Kaydet</button>
    </div>
  )
}
```

HTML yerine JSON mu saklıyorsunuz? `editor.getHTML()` yerine `editor.getJSON()`
kullanın — ikisi de `content` üzerinden gidip gelir.

## Karanlık mod düğmesi

Plume herhangi bir üst öğeden `data-theme="dark"` okur; dolayısıyla bir sarmalayıcı
özniteliğini değiştirmek yeterlidir.

```tsx
import { useState } from 'react'
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export function ThemedEditor() {
  const [dark, setDark] = useState(false)
  return (
    <div data-theme={dark ? 'dark' : undefined}>
      <button onClick={() => setDark((d) => !d)}>Temayı değiştir</button>
      <PlumeEditor content="<p>Temalı 🪶</p>" />
    </div>
  )
}
```

## Marka teması

`.plume` kökünde `--plume-*` değişkenlerini geçersiz kılın (tam liste için bkz.
[Tema](/tr/guide/theming)).

```css
.plume {
  --plume-color-primary: #e11d48;
  --plume-color-active-bg: #ffe4e6;
  --plume-color-active-text: #be123c;
  --plume-radius: 10px;
  --plume-font: 'Inter', system-ui, sans-serif;
  --plume-content-max-width: 720px;
}
```

## Özel toolbar düğmesi

Kontrolü `toolbarItems` ile kaydedin, ardından `name`'ini `toolbar`'a koyun.

```tsx
<PlumeEditor
  toolbar={['bold', 'italic', '|', 'clearFormat']}
  toolbarItems={[
    {
      name: 'clearFormat',
      type: 'button',
      title: 'Biçimlendirmeyi temizle',
      run: (editor) => editor.chain().focus().unsetAllMarks().clearNodes().run(),
    },
  ]}
/>
```

## Kutular (özel alıntılar)

Stilli alıntı çeşitleri tanımlayın ve toolbar düğmesi olarak sunun.

```tsx
<PlumeEditor
  toolbar={['blockquote', 'note', 'warning', 'tip']}
  blockquotes={[
    { name: 'note', label: 'Not', color: '#2563eb' },
    { name: 'warning', label: 'Uyarı', color: '#d97706' },
    { name: 'tip', label: 'İpucu', color: '#16a34a' },
  ]}
/>
```

## Yazı tipleri & renkler

`fontFamily` ve `textColor` açılır menülerini doldurun. `src`'li bir font sizin için
enjekte edilen bir `@font-face` ile yüklenir.

```tsx
<PlumeEditor
  toolbar={['fontFamily', 'textColor']}
  fonts={[
    { label: 'Varsayılan', value: null },
    { label: 'Inter', value: 'Inter', src: '/fonts/Inter.woff2' },
    { label: 'Serif', value: 'Georgia, serif' },
  ]}
  colors={['#111827', '#dc2626', '#2563eb', '#16a34a']}
/>
```

## Etiketleme — mention (üçüncü taraf tiptap eklentisi)

Herhangi bir tiptap eklentisi `extensions`'a girer.

```tsx
import Mention from '@tiptap/extension-mention'
;<PlumeEditor extensions={[Mention.configure({ suggestion: mySuggestion })]} />
```

## Tamamen stilsiz

Her şeyi kendiniz stillemek için stil dosyasını atlayın; editör yine de çalışır.

```tsx
import { PlumeEditor } from '@useplume/react'
// not: `import '@useplume/core/styles.css'` yok

export const App = () => <PlumeEditor content="<p>çıplak</p>" />
```

Sonra kendi CSS'inizden `.plume`, `.plume-toolbar`, `.plume-editor__content` vb. sınıf
adlarını hedefleyin.

## SSR — Next.js (App Router)

Editör bir istemci bileşenidir. İstemcide render edin ve hidrasyon uyuşmazlığını
önlemek için senkron ilk render'ı kapatın.

```tsx
'use client'
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export default function Editor() {
  return <PlumeEditor content="<p>SSR-güvenli</p>" immediatelyRender={false} />
}
```

Bir sunucu bileşeninden içe aktarıyorsanız `next/dynamic` ve `ssr: false` ile sarın.

## SSR — Nuxt

`<PlumeEditor>` Nuxt'ta yalnızca istemcidedir. En basit yol `.client` soneki ya da bir
`<ClientOnly>` sarmalayıcısıdır:

```vue
<script setup lang="ts">
import { PlumeEditor } from '@useplume/vue'
import '@useplume/core/styles.css'
</script>

<template>
  <ClientOnly>
    <PlumeEditor content="<p>SSR-güvenli</p>" />
  </ClientOnly>
</template>
```

## Yapıştırma yöneticisi

Yazarların her yapıştırmada sadece metin ile biçimi koruma arasında seçim yapmasını
sağlayın.

```tsx
<PlumeEditor content="<p></p>" pasteManager />
```

## Vue karşılıkları

Yukarıdaki her tarif Vue'da aynıdır — aynı seçenekler, şablonlarda kebab-case:

```vue
<script setup lang="ts">
import { PlumeEditor } from '@useplume/vue'
import { createUploadHandler } from '@useplume/core'
import '@useplume/core/styles.css'
</script>

<template>
  <PlumeEditor
    content="<p>Merhaba 🪶</p>"
    placeholder="Hikâyeni anlat…"
    :toolbar="['bold', 'italic', '|', 'link', 'image']"
    :image="{ uploadHandler: createUploadHandler({ url: '/api/upload' }) }"
    :on-update="(editor) => onChange(editor.getHTML())"
  />
</template>
```

Bunlardan herhangi birinde daha fazla kontrol mü gerek? Bkz.
[Editor örneği & komutlar](/tr/guide/editor-api).
