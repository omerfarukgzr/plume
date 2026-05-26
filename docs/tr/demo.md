---
description: 'Plume’u tarayıcıda canlı dene — araç çubuğu preset’lerini, temayı, marka rengini, fontu ve dili değiştir; seçtiklerine göre güncellenen hazır kodu gör.'
aside: false
outline: false
---

# Canlı demo

Bu, gerçek `@useplume/vue` editörü — ekran görüntüsü değil. İçine yaz, görselin
köşesini sürükle, sonra kontrolleri kullanarak araç çubuğunu yeniden şekillendir,
temayı değiştir, marka rengi ve font seç ya da arayüz dilini değiştir. Hepsi tek
bir bileşen ve birkaç prop — hangileri olduğunu aşağıdaki bölüm gösteriyor.

<ClientOnly>
  <PlumeDemo locale="tr" />
</ClientOnly>

## Bunlar prop’lara nasıl karşılık geliyor?

Yukarıdaki her şey sade `<PlumeEditor>` yapılandırması:

- **Araç çubuğu** — preset butonları yalnızca `toolbar` dizisini değiştiriyor.
  Sıralı herhangi bir [öğe adı](/tr/api/toolbar) listesi geç, ayraç için `'|'`
  kullan ya da tamamen gizlemek için `toolbar={false}` ver.
- **Marka rengi & font** — `.plume` kökündeki `--plume-*` CSS değişkenleri. JS
  yok, yeniden derleme yok; tüm token listesi için [Tema](/tr/guide/theming).
- **Koyu tema** — herhangi bir üst öğeye `data-theme="dark"` ekle. Tüm geçiş bu
  kadar.
- **Dil** — `locale` prop’u (`"en"` ya da `"tr"`) tüm etiketleri, ipuçlarını ve
  pencereleri yerelleştirir.

Daha fazlası mı? Kendi araç çubuğu butonların, bilgi kutusu blockquote’ların ya
da herhangi bir üçüncü parti tiptap eklentin — her biri tek bir prop. Hepsinin
kopyala-yapıştır tarifleri [Örnekler & tarifler](/tr/examples) sayfasında;
kurulum için [Başlangıç](/tr/guide/getting-started) sayfasından başla.
