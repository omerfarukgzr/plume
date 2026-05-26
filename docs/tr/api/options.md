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
