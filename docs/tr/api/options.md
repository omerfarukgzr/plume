---
description: 'PlumeOptions tam referansı — Plume’un React ve Vue editörlerinin kabul ettiği tüm prop’lar: içerik, davranış, toolbar, görseller ve fazlası.'
---

# PlumeOptions

Her iki adaptör de aynı seçenekleri kabul eder. Bunları `<PlumeEditor>` üzerinde prop
olarak, `usePlumeEditor`'a ise bir nesne olarak verirsiniz. Tipin adı `PlumeOptions` ve
`@useplume/core`'dan dışa aktarılır.

## İçerik ve davranış

| Seçenek             | Tip                                     | Varsayılan | Ne yapar                                                     |
| ------------------- | --------------------------------------- | ---------- | ------------------------------------------------------------ |
| `content`           | `string \| object \| null`              | `''`       | Başlangıç içeriği: HTML metni ya da tiptap JSON belgesi.     |
| `editable`          | `boolean`                               | `true`     | Belge düzenlenebilir mi.                                     |
| `placeholder`       | `string`                                | —          | Belge boşken görünen ipucu metni.                            |
| `autofocus`         | `boolean \| 'start' \| 'end' \| number` | `false`    | Açılışta imlecin otomatik konumlanması.                      |
| `editorClass`       | `string`                                | —          | Yazı alanına eklenecek ek sınıf adı/adları.                  |
| `immediatelyRender` | `boolean`                               | `true`     | İlk karede senkron çizim. SSR kullanıyorsanız `false` yapın. |

## Toolbar

| Seçenek        | Tip                                   | Varsayılan     | Ne yapar                                                                 |
| -------------- | ------------------------------------- | -------------- | ------------------------------------------------------------------------ |
| `toolbar`      | `ToolbarConfig` (`string[] \| false`) | varsayılan set | Öğe adlarından oluşan liste; gizlemek için `false`.                      |
| `toolbarItems` | `ToolbarItem[]`                       | —              | Kendi düğmeleriniz / üzerine yazmalar; `toolbar`'da `name` ile çağrılır. |

Hazır adların listesi için [Toolbar öğeleri](/tr/api/toolbar) sayfasına bakın.

## Eklentiler

| Seçenek             | Tip          | Varsayılan | Ne yapar                                                |
| ------------------- | ------------ | ---------- | ------------------------------------------------------- |
| `extensions`        | `Extensions` | `[]`       | Varsayılanların ardına eklenecek ek tiptap eklentileri. |
| `defaultExtensions` | `boolean`    | `true`     | Plume'un hazır eklenti setini dahil et.                 |

## Özellikler

| Seçenek          | Tip                                         | Varsayılan | Ne yapar                                           |
| ---------------- | ------------------------------------------- | ---------- | -------------------------------------------------- |
| `fonts`          | `FontOption[]`                              | —          | Font menüsündeki seçenekler.                       |
| `colors`         | `string[]`                                  | —          | Renk menüsündeki hex renkler.                      |
| `locale`         | `string`                                    | `'tr'`     | Arayüz metinleri ve harf düzeni için dil (BCP-47). |
| `autoCapitalize` | `boolean \| { locale?: string }`            | `false`    | Cümle başlarını otomatik büyütme.                  |
| `image`          | `boolean \| Partial<ResizableImageOptions>` | açık       | Görsel node'unu ayarla; kaldırmak için `false`.    |
| `footnote`       | `boolean \| FootnoteExtensionOptions`       | açık       | Dipnotları ayarla; kaldırmak için `false`.         |
| `blockquotes`    | `CustomBlockquoteSpec[]`                    | —          | Özel alıntı türleri (callout).                     |
| `pasteManager`   | `boolean`                                   | `false`    | Yapıştırmayı sor (sadece metin / biçimli) — modal. |

### Yapıştırma yöneticisi

`pasteManager` açıkken Plume her yapıştırmayı (`Ctrl`/`Cmd`+`V`, sağ tık menüsü, …)
yakalar ve panodakini nasıl ekleyeceğinizi soran bir modal açar:

- **Sadece metin** — tüm biçimlendirmeyi atar, yalnızca metni yapıştırır.
- **Biçimli** — kaynak HTML'i korur (kalın, bağlantı, liste …); editörün kendi
  şeması üzerinden çözümlenir, böylece yalnızca Plume'un tanıdığı işaretler kalır.

Modal <kbd>Esc</kbd> ile, dışına tıklayınca veya bir seçim yapılınca kapanır.
React ve Vue `<PlumeEditor>` modalı otomatik gösterir; etiketleri `locale`'i izler.

```tsx
<PlumeEditor content="<p></p>" pasteManager />
```

Modal olmadan tam denetim için `PasteManager` eklentisini kendiniz ekleyip bir
`onPaste` geri çağrısı verin — yapıştırmayı üstlenmek için `true`, tiptap'ın devam
etmesi için `false` döndürün. Yakalanan içeriği `insertPaste(editor, data, mode)`
yardımcısıyla ekleyin. İkisi de `@useplume/core`'dan dışa aktarılır.

## Değişiklik yönetimi

| Seçenek       | Tip                        | Varsayılan | Ne yapar                                                              |
| ------------- | -------------------------- | ---------- | --------------------------------------------------------------------- |
| `onUpdate`    | `(editor: Editor) => void` | —          | Belge değiştikçe çağrılır (`updateDelay` kadar geciktirilir).         |
| `updateDelay` | `number`                   | `300`      | `onUpdate` için gecikme (ms). `0` verirseniz her değişiklikte anında. |

::: tip
`onUpdate`, alttaki tiptap `Editor`'ını alır; içeriği `editor.getHTML()` veya
`editor.getJSON()` ile alabilirsiniz. Gecikme boşuna değil: büyük belgelerde içeriği
serileştirmek, düzenleme başına en pahalı iştir; bu yüzden onu her tuşa bastığınızda
değil, ara ara çalıştırırız.
:::

## Adaptör propları

Bu proplar `PlumeOptions`'ta değil doğrudan `<PlumeEditor>` üzerinde bulunur;
dolayısıyla yalnızca bileşende vardır, `usePlumeEditor` ile kullanılamaz.

| Prop        | Adaptör | Tip                | Varsayılan | Ne yapar                                                                                                                |
| ----------- | ------- | ------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| `fluid`     | her iki | `boolean`          | `false`    | Edge-to-edge içeriği zorlar (her `--plume-content-max-width`'i kaldırır). İçerik zaten varsayılan olarak tam genişliktir; bu yalnızca bir üst öğe okuma sütunu tanımladığında işe yarar. Bkz. [tema](/tr/guide/theming#icerik-genisligi-ic-bosluk). |
| `className` | React   | `string`           | —          | Editör kök (`.plume`) elemanına ek class.                                                                               |
| `output`    | Vue     | `'html' \| 'json'` | `'html'`   | `v-model:content` / `update:content`'in yayınladığı değer formatı.                                                      |

### `v-model:content` (Vue)

Vue adaptörü çift yönlü bağlamayı destekler. Bağlanan değer varsayılan olarak
HTML, `output="json"` ile tiptap JSON belgesidir. Güncellemeler `updateDelay`
ile debounce edilir. `content` prop'u tek başına da reaktiftir; bu, async/geç
gelen veriyi kapsar.

```vue
<PlumeEditor v-model:content="html" />
<PlumeEditor v-model:content="doc" output="json" />
```

## Tam yapılandırılmış bir editör

Her seçenek bağımsız ve isteğe bağlıdır — config'in ne kadar derine indiğini tek
yerde görün diye hepsini bir arada gösteriyoruz.

```tsx
import { PlumeEditor } from '@useplume/react'
import { createUploadHandler } from '@useplume/core'
;<PlumeEditor
  // içerik & davranış
  content="<p>Buradan başla…</p>"
  editable
  placeholder="Bir şeyler yaz…"
  autofocus="end"
  editorClass="my-prose"
  immediatelyRender={false}
  // toolbar
  toolbar={['bold', 'italic', '|', 'note', 'image', 'footnote', 'changeCase']}
  toolbarItems={[
    {
      name: 'note',
      type: 'button',
      title: 'Biçimlendirmeyi temizle',
      run: (e) => e.chain().focus().unsetAllMarks().run(),
    },
  ]}
  // özellikler
  locale="tr"
  autoCapitalize={{ locale: 'tr' }}
  fonts={[
    { label: 'Varsayılan', value: null }, // sistem varsayılanı; value zorunlu
    { label: 'Serif', value: 'Georgia, serif' }, // sistem fontu; value zorunlu
    { label: 'Ekalem', src: '/fonts/ekalem.ttf' }, // özel font; aile adı label'dan türetilir
    { label: 'Inter', value: 'Inter', src: '/fonts/Inter.woff2' }, // özel font, açık aile adıyla
  ]}
  colors={['#111827', '#dc2626', '#2563eb']}
  image={{ uploadHandler: createUploadHandler({ url: '/api/upload' }), maxSize: 5_000_000 }}
  footnote={{ label: 'Notlar' }}
  blockquotes={[{ name: 'note', label: 'Not', color: '#2563eb' }]}
  pasteManager
  // eklentiler
  extensions={[]}
  defaultExtensions
  // değişiklik yönetimi
  onUpdate={(editor) => console.log(editor.getHTML())}
  updateDelay={500}
/>
```

Göreve odaklı, kopyala-yapıştır sürümler için bkz. [Örnekler & tarifler](/tr/examples).
