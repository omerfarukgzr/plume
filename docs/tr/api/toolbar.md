---
description: 'Plume’un hazır toolbar öğe adları (ToolbarItemName) referansı; sıralayın, çıkarın veya kendi özel düğmelerinizle birleştirin.'
---

# Toolbar öğeleri

`toolbar` seçeneği, öğe adlarından oluşan sıralı bir liste alır. Aşağıda hazır
`ToolbarItemName` değerlerini bulacaksınız. Listeye başka herhangi bir metin de
yazabilirsiniz; böylece `toolbarItems` ile tanımladığınız kendi düğmelerinizi ya da özel
alıntı türlerinizi adlarıyla çağırabilirsiniz.

## Hazır adlar

| Kategori      | Adlar                                                                    |
| ------------- | ------------------------------------------------------------------------ | --- |
| Biçimler      | `bold`, `italic`, `underline`, `strike`, `code`, `highlight`             |
| Başlıklar     | `heading1`, `heading2`, `heading3`                                       |
| Bloklar       | `bulletList`, `orderedList`, `blockquote`, `codeBlock`, `horizontalRule` |
| Ekleme        | `link`, `image`, `footnote`                                              |
| Üst/alt simge | `superscript`, `subscript`                                               |
| Açılır menü   | `fontFamily`, `textColor`, `changeCase`                                  |
| Hizalama      | `alignLeft`, `alignCenter`, `alignRight`, `alignJustify`                 |
| Geçmiş        | `undo`, `redo`                                                           |
| Ayraç         | `'                                                                       | '`  |

## Örnek

```tsx
<PlumeEditor
  toolbar={[
    'bold',
    'italic',
    'underline',
    '|',
    'heading1',
    'heading2',
    '|',
    'bulletList',
    'orderedList',
    '|',
    'link',
    'image',
    '|',
    'undo',
    'redo',
  ]}
/>
```

## Öğeleri elle oluşturmak

Tamamen kendi toolbar arayüzünüzü kuracaksanız, adaptörlerin kullandığı yardımcıları
`@useplume/core` doğrudan dışa aktarır:

- `defaultToolbar` — varsayılan ad listesi.
- `resolveToolbarItems(toolbar, config)` — bir `ToolbarConfig`'i hazır `ToolbarItem[]`
  haline getirir (düğmeler, ayraçlar, açılır menüler, link paneli).
- `defaultToolbarItems`, `createToolbarItems`, `defaultFonts`, `defaultColors`.

```ts
import { resolveToolbarItems } from '@useplume/core'

const items = resolveToolbarItems(['bold', 'italic', '|', 'link'], { locale: 'tr' })
```
