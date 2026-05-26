---
description: 'Plume’un varsayılan eklenti seti ve birlikte gelen eklentiler — ChangeCase, AutoCapitalize, dipnotlar, özel alıntılar, yeniden boyutlandırılabilir görsel düğümü ve yapıştırma yöneticisi — ayrıca kendi tiptap eklentilerinizi ekleme veya sıfırdan set kurma.'
---

# Eklentiler

Plume'un altında tiptap vardır; yani editör aslında bir **eklenti** listesidir
(düğümler, işaretler ve davranışlar). Plume özenle seçilmiş bir varsayılan set sunar;
buna ekleme yapmanıza, parçaları değiştirmenize ya da sıfırdan başlamanıza izin verir.

## Varsayılan set

`defaultExtensions` açık bırakıldığında (varsayılan), her editör şunları içerir:

| Kaynak                | Eklentiler                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| tiptap **StarterKit** | Kalın, İtalik, Altı çizili, Üstü çizili, Kod, Başlık (h1–h3), Madde/Numaralı liste, ListItem, Alıntı, Kod bloğu, Yatay çizgi, HardBreak, **Bağlantı**, ListKeymap, geri/yinele |
| Plume ekler           | Vurgu, Üst simge, Alt simge, TextAlign, Placeholder, TextStyle + FontFamily + Color, **ChangeCase**, **ResizableImage**, dipnotlar                                             |
| İsteğe bağlı (opt-in) | **AutoCapitalize**, **PasteManager**, **özel alıntılar**                                                                                                                       |

Bazı varsayılanlar önceden ayarlıdır: başlıklar 1–3 seviyeleriyle sınırlıdır ve
bağlantılar `openOnClick: false`, `rel="noopener noreferrer nofollow"` ve autolink
açık şekilde gelir.

```ts
import { defaultExtensions } from '@useplume/core'

// Plume'un içeride kurduğu dizinin aynısı — tiptap'i doğrudan sürüyorsanız işe yarar.
const extensions = defaultExtensions({ locale: 'tr', placeholder: 'Yaz…' })
```

## Kendi tiptap eklentinizi ekleme

tiptap ekosisteminden gelen (ya da sizin yazdığınız) her şey `extensions`'a girer;
varsayılanlardan **sonra** çalışır.

```tsx
import { Mention } from '@tiptap/extension-mention'
;<PlumeEditor
  extensions={[
    Mention.configure({
      /* … */
    }),
  ]}
/>
```

## Sıfırdan başlama

Minimal bir editörü kendiniz kurmak için varsayılanları kapatın. Plume kendi
eklentilerini yeniden dışa aktarır, böylece yalnızca istediklerinizi seçebilirsiniz.

```tsx
import StarterKit from '@tiptap/starter-kit'
import { ResizableImage, ChangeCase } from '@useplume/core'
;<PlumeEditor
  defaultExtensions={false}
  extensions={[StarterKit, ResizableImage, ChangeCase]}
  toolbar={['bold', 'italic', 'image', 'changeCase']}
/>
```

::: warning Dipnotlar özel bir Document ister
Dipnotlar, sonda bir dipnotlar bölümüne izin veren bir Document düğümüne ihtiyaç
duyar. Kendi setinizi kurup dipnot da istiyorsanız, StarterKit'in varsayılan
Document'ı yerine `PlumeDocument`'ı `footnoteExtensions()` yardımcısıyla birlikte
kullanın.
:::

## Plume'un kendi eklentileri

Bunların hepsi `@useplume/core`'dan hem hazır eklenti olarak hem de `<PlumeEditor>`
üzerindeki `image` / `footnote` / `autoCapitalize` / `blockquotes` / `pasteManager`
seçenekleriyle dışa aktarılır.

### ResizableImage

Yeniden boyutlandırılabilir, hizalanabilir, açıklamalı görsel düğümü. `image`
seçeneğiyle yapılandırın (bkz. [Görseller & yükleme](/tr/guide/images)) veya doğrudan
kullanın:

```ts
import { ResizableImage, createUploadHandler } from '@useplume/core'

ResizableImage.configure({
  uploadHandler: createUploadHandler({ url: '/api/upload' }),
  accept: 'image/png,image/jpeg',
  maxSize: 5 * 1024 * 1024,
  minWidth: 80,
  bubbleMenu: true,
  onError: (e) => console.error(e),
})
```

`setImage`, `setImageAlign` ve `setImageCaption` komutlarını ekler.

### ChangeCase

`setChangeCase(type)` komutunu ekler; `type` şunlardan biridir: `'sentence' | 'lower'
| 'upper' | 'capitalize' | 'toggle'`. **Seçili metni** satır içi işaretleri (kalın,
bağlantılar…) koruyarak yeniden yazar ve dile duyarlıdır — Türkçe noktalı/noktasız
`i ↔ İ`, `ı ↔ I` doğru eşlensin diye `locale: 'tr'` geçin. `changeCase` toolbar açılır
menüsü olarak sunulur.

```ts
editor.chain().focus().setChangeCase('upper').run()
```

### AutoCapitalize

**İsteğe bağlı.** Bir bloğun başında veya `.` `!` `?`'den hemen sonra yazılan ilk
harfi büyütür. Bir kez <kbd>Backspace</kbd>'e basmak tek bir otomatik büyütmeyi geri
alır. Seçenekle etkinleştirin (otomatik düzeltmeler kullanıcıyı şaşırtabileceği için
varsayılan sette yoktur):

```tsx
<PlumeEditor autoCapitalize />
<PlumeEditor autoCapitalize={{ locale: 'tr' }} />
```

### Dipnotlar

İki yönlü gezinmeli (işaret ↔ not) numaralı dipnotlar. Varsayılan olarak açıktır;
başlık etiketini ve geri-bağlantı davranışını ayarlayın:

```tsx
<PlumeEditor footnote={{ label: 'Notlar', backref: true }} />
<PlumeEditor footnote={false} /> // tamamen kapat
```

`footnote.backref` (varsayılan `true`) her notun numarasını, gövdedeki işaretine geri
götüren tıklanabilir bir bağlantı yapar. Yazar tarafındaki davranış için bkz.
[yazım](/tr/guide/editing#dipnotlar).

### Özel alıntılar (kutular)

Stilli alıntı çeşitleri tanımlayın. Her spec bir `<blockquote>` düğümüne ve `name` ile
referans verilen eşleşen bir toolbar düğmesine dönüşür; `toggleCustomBlockquote(name)`
komutunu ekler.

```tsx
<PlumeEditor
  toolbar={['blockquote', 'note', 'warning']}
  blockquotes={[
    { name: 'note', label: 'Not', color: '#2563eb' },
    { name: 'warning', label: 'Uyarı', color: '#d97706' },
  ]}
/>
```

Her spec `name`, `label` ve isteğe bağlı olarak `color` (vurgu kenarlığı + tonlama),
`class` (varsayılan `plume-quote-<name>`) ve `icon` (iç SVG işaretlemesi) kabul eder.
Çeşitler ne iç içe geçer ne de düz alıntılarla karışır.

### PasteManager

**İsteğe bağlı.** Yapıştırmayı keser ve kullanıcının sadece metin ile biçimi koruma
arasında seçim yapmasını sağlar; modalı React/Vue `<PlumeEditor>` otomatik render eder.

```tsx
<PlumeEditor pasteManager />
```

Modal olmadan tam kontrol için `PasteManager` eklentisini bir `onPaste` işleyiciyle
kendiniz ekleyin ve yakaladığınız içeriği `insertPaste` ile yerleştirin:

```ts
import { PasteManager, insertPaste } from '@useplume/core'

PasteManager.configure({
  onPaste: (editor, data) => {
    insertPaste(editor, data, 'plainText') // veya 'styled'
    return true // biz hallettik; tiptap devam etsin diye false döndürün
  },
})
```

## Referans

Eklentiyle ilgili tüm seçeneklerin tam listesi
[PlumeOptions → Eklentiler / Özellikler](/tr/api/options#eklentiler) altındadır.
Yukarıdaki her eklenti, özel setler kurmak için `@useplume/core`'dan tek tek de dışa
aktarılır.
