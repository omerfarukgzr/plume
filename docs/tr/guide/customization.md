# Özelleştirme

Özelleştirmenin tamamı `<PlumeEditor>` üzerindeki prop'larla (ya da `usePlumeEditor`'a
verdiğiniz ayar nesnesiyle) yapılır. Aynı seçenekler her iki adaptörde de geçerlidir;
tam liste için [PlumeOptions](/tr/api/options) sayfasına bakın.

## Toolbar

Hangi düğmelerin hangi sırada görüneceğini belirlemek için öğe adlarından oluşan bir
liste verin. Araya ayraç koymak için `'|'` kullanın; toolbar'ı tamamen kaldırmak
isterseniz `false` geçin.

```tsx
<PlumeEditor toolbar={['bold', 'italic', '|', 'heading1', 'bulletList', 'link']} />

<PlumeEditor toolbar={false} /> // toolbar görünmez
```

Kullanabileceğiniz tüm hazır adlar için [Toolbar öğeleri](/tr/api/toolbar) sayfasına
göz atın.

### Kendi düğmeleriniz

`toolbarItems` ile kendi düğmelerinizi tanımlayabilir, hatta aynı adı vererek hazır bir
düğmenin yerine geçebilirsiniz. Sonra bu düğmeye `toolbar` listesinde adıyla yer verin:

```tsx
<PlumeEditor
  toolbar={['bold', 'clearFormat']}
  toolbarItems={[
    {
      name: 'clearFormat',
      type: 'button',
      title: 'Biçimi temizle',
      run: (editor) => editor.chain().focus().unsetAllMarks().run(),
    },
  ]}
/>
```

## Fontlar

Font menüsünü `fonts` ile doldurun. Her giriş `{ label, value }` biçimindedir; buradaki
`value` bir CSS `font-family` değeridir (fontu sıfırlamak, yani varsayılana dönmek için
`null` verin). Kendi font dosyanızı yüklemek isterseniz `src` ekleyin — bir URL/yol
metni ya da bir `File`/`Blob` olabilir. Plume gerekli `@font-face` tanımını sizin
yerinize ekler.

```tsx
<PlumeEditor
  toolbar={['fontFamily']}
  fonts={[
    { label: 'Varsayılan', value: null },
    { label: 'Inter', value: 'Inter', src: '/fonts/Inter.woff2' },
    { label: 'Yüklediğim font', value: 'Custom', src: uploadedFile },
  ]}
/>
```

`src` verdiğinizde, `value`'daki ilk font adı, dosyanın kaydolacağı adla aynı olmalıdır
(örneğin `src: '/fonts/Inter.woff2'` ile birlikte `value: 'Inter'`).

## Renkler

`textColor` menüsünde çıkacak renkleri `colors` ile, hex değerlerden oluşan bir dizi
olarak verin:

```tsx
<PlumeEditor toolbar={['textColor']} colors={['#111827', '#dc2626', '#2563eb']} />
```

## Eklentiler

Kendi tiptap node, mark ya da eklentilerinizi ekleyebilirsiniz. Bunlar Plume'un
varsayılanlarının ardından devreye girer.

```tsx
import { Mention } from '@tiptap/extension-mention'

<PlumeEditor extensions={[Mention]} />
```

Sıfırdan, boş bir editörle başlamak isterseniz `defaultExtensions={false}` ile
varsayılanları kapatıp kendi setinizi verin.

```tsx
<PlumeEditor defaultExtensions={false} extensions={[/* eklentileriniz */]} />
```

Plume kendi eklentilerini de `@plume/core`'dan dışa aktarır; böylece istediklerinizi tek
tek seçip kullanabilirsiniz: `ResizableImage`, `ChangeCase`, `AutoCapitalize`,
`CustomBlockquote`, dipnot eklentileri ve daha fazlası.

## Özel alıntılar (callout)

`blockquotes` ile kendi alıntı türlerinizi tanımlayabilirsiniz; örneğin bir "not" ya da
"uyarı" kutusu. Verdiğiniz her tanım hem bir `<blockquote>` node'una hem de ona karşılık
gelen bir toolbar düğmesine dönüşür. Tek yapmanız gereken, türün `name` değerini toolbar
listesinde de kullanmak:

```tsx
<PlumeEditor
  toolbar={['blockquote', 'note', 'warning']}
  blockquotes={[
    { name: 'note', label: 'Not', color: '#2563eb' },
    { name: 'warning', label: 'Uyarı', color: '#d97706' },
  ]}
/>
```

## Dil (locale)

Plume, arayüz metinlerini Türkçe (`tr`, varsayılan) ve İngilizce (`en`) olarak sunar;
harf düzeniyle ilgili özellikler (`changeCase`, `autoCapitalize`) de seçtiğiniz dile göre
davranır. Dili `locale` ile belirleyin:

```tsx
<PlumeEditor locale="en" />
```
