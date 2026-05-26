---
description: 'Plume; tiptap ve ProseMirror üzerine kurulu, özelleştirilebilir, framework’ten bağımsız bir zengin metin (WYSIWYG) editörüdür. Tek çekirdek, ince React ve Vue adaptörleri.'
---

# Plume nedir?

Plume, [tiptap](https://tiptap.dev) üzerine kurulu bir zengin metin (WYSIWYG)
editörüdür; tiptap da ProseMirror'ın üzerine oturur. İşin püf noktası şu: editörün tüm
mantığı tek bir pakette, `@useplume/core`'da toplanır. Her framework içinse yalnızca ince
bir adaptör yazılır. Şimdilik **React** ve **Vue 3** var; ileride Svelte, Solid ve
vanilla da editörü yeniden yazmaya gerek kalmadan eklenebilir.

## Neden doğrudan tiptap kullanmıyorum?

tiptap size motoru verir, gerisini siz kurarsınız: uyumlu bir eklenti seti seçmek,
aktif durumları takip eden bir toolbar yazmak, görsel yüklemeyi, temayı ve fontları
bağlamak… üstelik bunları her framework için ayrı ayrı. Plume tüm bu kararları sizin
yerinize vermiş ve hepsini tek bir bileşenin arkasına koymuştur:

```tsx
<PlumeEditor toolbar={['bold', 'italic', '|', 'link']} />
```

- **Her şey hazır gelir.** Toolbar, ikonlar, açılır menüler, link ve font panelleri,
  yeniden boyutlandırılabilir görsel desteği, dipnotlar ve CSS değişkenlerine dayalı bir
  tema kurulumun içinde gelir.
- **Tek API, tüm frameworkler.** React'ta da Vue'da da aynı `<PlumeEditor>` ile
  çalışırsınız. Davranışı her adaptörde tekrar yazmak yerine bir kez çekirdekte
  yazarsınız.
- **Yine de tamamen tiptap.** Kendi tiptap eklentilerinizi ekleyebilir, gerektiğinde
  alttaki `Editor` örneğine doğrudan ulaşabilirsiniz.

## Paketler

| Paket             | Ne işe yarar                                                                |
| ----------------- | --------------------------------------------------------------------------- |
| `@useplume/core`  | Framework'ten bağımsız çekirdek: tiptap ayarları, eklentiler, toolbar, CSS. |
| `@useplume/react` | React adaptörü — `<PlumeEditor />` ve `usePlumeEditor()`.                   |
| `@useplume/vue`   | Vue 3 adaptörü — `<PlumeEditor />` ve `usePlumeEditor()`.                   |

## Kim ne yapar

Plume birkaç farklı role dokunur. Dokümanlar, her birinin ihtiyacı olana hızlıca
ulaşabilmesi için düzenlenmiştir:

| Siz…                       | Şununla ilgilenirsiniz…                                          | Buradan başlayın                                                                                                      |
| -------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Uygulama geliştiricisi** | Editörü gömmek, toolbar seçmek, içeriği kaydetmek                | [Başlangıç](/tr/guide/getting-started) · [Özelleştirme](/tr/guide/customization) · [Editor API](/tr/guide/editor-api) |
| **Backend geliştiricisi**  | Yükleme endpoint'i, sunucu kontratı, sahipsizleri temizleme      | [Görseller & yükleme](/tr/guide/images)                                                                               |
| **İçerik yazarı**          | Editörde yazmak: kısayollar, görseller, dipnotlar, kutular       | [Yazım](/tr/guide/editing)                                                                                            |
| **Tasarımcı**              | Markaya uyum: renkler, köşe yarıçapı, fontlar, koyu mod, stilsiz | [Tema](/tr/guide/theming)                                                                                             |

Kopyalayarak öğrenmeyi mi seversiniz? [Örnekler & tarifler](/tr/examples)'e geçin.

İlk editörünüzü kurup ekrana getirmek için [Hemen başla](/tr/guide/getting-started)
sayfasına geçin.
