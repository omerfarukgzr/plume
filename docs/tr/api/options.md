# PlumeOptions

Her iki adaptör de aynı seçenekleri kabul eder. Bunları `<PlumeEditor>` üzerinde prop
olarak, `usePlumeEditor`'a ise bir nesne olarak verirsiniz. Tipin adı `PlumeOptions` ve
`@plume/core`'dan dışa aktarılır.

## İçerik ve davranış

| Seçenek             | Tip                                             | Varsayılan | Ne yapar                                                           |
| ------------------- | ----------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| `content`           | `string \| object \| null`                      | `''`       | Başlangıç içeriği: HTML metni ya da tiptap JSON belgesi.           |
| `editable`          | `boolean`                                       | `true`     | Belge düzenlenebilir mi.                                          |
| `placeholder`       | `string`                                        | —          | Belge boşken görünen ipucu metni.                                 |
| `autofocus`         | `boolean \| 'start' \| 'end' \| number`         | `false`    | Açılışta imlecin otomatik konumlanması.                          |
| `editorClass`       | `string`                                        | —          | Yazı alanına eklenecek ek sınıf adı/adları.                       |
| `immediatelyRender` | `boolean`                                       | `true`     | İlk karede senkron çizim. SSR kullanıyorsanız `false` yapın.       |

## Toolbar

| Seçenek        | Tip                                   | Varsayılan     | Ne yapar                                                      |
| -------------- | ------------------------------------- | -------------- | ------------------------------------------------------------- |
| `toolbar`      | `ToolbarConfig` (`string[] \| false`) | varsayılan set | Öğe adlarından oluşan liste; gizlemek için `false`.           |
| `toolbarItems` | `ToolbarItem[]`                       | —              | Kendi düğmeleriniz / üzerine yazmalar; `toolbar`'da `name` ile çağrılır. |

Hazır adların listesi için [Toolbar öğeleri](/tr/api/toolbar) sayfasına bakın.

## Eklentiler

| Seçenek             | Tip          | Varsayılan | Ne yapar                                                  |
| ------------------- | ------------ | ---------- | --------------------------------------------------------- |
| `extensions`        | `Extensions` | `[]`       | Varsayılanların ardına eklenecek ek tiptap eklentileri.   |
| `defaultExtensions` | `boolean`    | `true`     | Plume'un hazır eklenti setini dahil et.                   |

## Özellikler

| Seçenek          | Tip                                         | Varsayılan | Ne yapar                                                    |
| ---------------- | ------------------------------------------- | ---------- | ----------------------------------------------------------- |
| `fonts`          | `FontOption[]`                              | —          | Font menüsündeki seçenekler.                                |
| `colors`         | `string[]`                                  | —          | Renk menüsündeki hex renkler.                               |
| `locale`         | `string`                                    | `'tr'`     | Arayüz metinleri ve harf düzeni için dil (BCP-47).          |
| `autoCapitalize` | `boolean \| { locale?: string }`            | `false`    | Cümle başlarını otomatik büyütme.                          |
| `image`          | `boolean \| Partial<ResizableImageOptions>` | açık       | Görsel node'unu ayarla; kaldırmak için `false`.             |
| `footnote`       | `boolean \| FootnoteExtensionOptions`       | açık       | Dipnotları ayarla; kaldırmak için `false`.                  |
| `blockquotes`    | `CustomBlockquoteSpec[]`                    | —          | Özel alıntı türleri (callout).                              |

## Değişiklik yönetimi

| Seçenek       | Tip                        | Varsayılan | Ne yapar                                                              |
| ------------- | -------------------------- | ---------- | -------------------------------------------------------------------- |
| `onUpdate`    | `(editor: Editor) => void` | —          | Belge değiştikçe çağrılır (`updateDelay` kadar geciktirilir).         |
| `updateDelay` | `number`                   | `300`      | `onUpdate` için gecikme (ms). `0` verirseniz her değişiklikte anında. |

::: tip
`onUpdate`, alttaki tiptap `Editor`'ını alır; içeriği `editor.getHTML()` veya
`editor.getJSON()` ile alabilirsiniz. Gecikme boşuna değil: büyük belgelerde içeriği
serileştirmek, düzenleme başına en pahalı iştir; bu yüzden onu her tuşa bastığınızda
değil, ara ara çalıştırırız.
:::
