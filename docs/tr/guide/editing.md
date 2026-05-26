---
description: 'İçerik yazarlarının Plume editöründe yapabilecekleri: biçimlendirme, klavye kısayolları, görseller, dipnotlar, alıntı kutuları, bağlantılar ve yapıştırma davranışı.'
---

# Yazım (içerik yazarları için)

Bu sayfa editöre **yazı yazan** kişiler içindir; editörü gömen geliştiriciler için
değil. Buradaki her şey Plume'un varsayılan kurulumunda mevcuttur — uygulamanızın
geliştiricisi bazı kontrolleri gizlemiş olabilir (bkz.
[Özelleştirme](/tr/guide/customization)).

## Yazım alanı

Editör, üstünde bir toolbar bulunan tek bir belge alanıdır. İmleci yerleştirmek için
herhangi bir yere tıklayın ve yazmaya başlayın. Metni seçtiğinizde aktif
biçimlendirmesi toolbar'da görünür (örneğin **Kalın** düğmesi kalın metnin içinde
yanar).

## Klavye kısayolları

Aşağıdakiler varsayılan kısayollardır. macOS'te tabloda <kbd>Ctrl</kbd> yazan yerde
<kbd>⌘</kbd> kullanın.

| Eylem                            | Windows / Linux                                                              | macOS                                            |
| -------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| Kalın                            | <kbd>Ctrl</kbd> <kbd>B</kbd>                                                 | <kbd>⌘</kbd> <kbd>B</kbd>                        |
| İtalik                           | <kbd>Ctrl</kbd> <kbd>I</kbd>                                                 | <kbd>⌘</kbd> <kbd>I</kbd>                        |
| Altı çizili                      | <kbd>Ctrl</kbd> <kbd>U</kbd>                                                 | <kbd>⌘</kbd> <kbd>U</kbd>                        |
| Üstü çizili                      | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>S</kbd>                                | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>S</kbd>       |
| Satır içi kod                    | <kbd>Ctrl</kbd> <kbd>E</kbd>                                                 | <kbd>⌘</kbd> <kbd>E</kbd>                        |
| Vurgu                            | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>H</kbd>                                | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>H</kbd>       |
| Başlık 1 / 2 / 3                 | <kbd>Ctrl</kbd> <kbd>Alt</kbd> <kbd>1/2/3</kbd>                              | <kbd>⌘</kbd> <kbd>⌥</kbd> <kbd>1/2/3</kbd>       |
| Madde işaretli liste             | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>8</kbd>                                | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>8</kbd>       |
| Numaralı liste                   | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>7</kbd>                                | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>7</kbd>       |
| Alıntı                           | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>B</kbd>                                | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>B</kbd>       |
| Kod bloğu                        | <kbd>Ctrl</kbd> <kbd>Alt</kbd> <kbd>C</kbd>                                  | <kbd>⌘</kbd> <kbd>⌥</kbd> <kbd>C</kbd>           |
| Üst simge                        | <kbd>Ctrl</kbd> <kbd>.</kbd>                                                 | <kbd>⌘</kbd> <kbd>.</kbd>                        |
| Alt simge                        | <kbd>Ctrl</kbd> <kbd>,</kbd>                                                 | <kbd>⌘</kbd> <kbd>,</kbd>                        |
| Sola/ortala/sağa/iki yana hizala | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>L/E/R/J</kbd>                          | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>L/E/R/J</kbd> |
| Geri al                          | <kbd>Ctrl</kbd> <kbd>Z</kbd>                                                 | <kbd>⌘</kbd> <kbd>Z</kbd>                        |
| Yinele                           | <kbd>Ctrl</kbd> <kbd>Y</kbd> / <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Z</kbd> | <kbd>⌘</kbd> <kbd>Shift</kbd> <kbd>Z</kbd>       |

::: tip
Yukarıdaki kısayollar tiptap/ProseMirror'dan gelir. Toolbar'dan gizlenmiş düğmeler
bile kısayollarına yanıt verir; çünkü alttaki komut, düğme gösterilse de
gösterilmese de editörün bir parçasıdır.
:::

## Markdown tarzı yazım kuralları

Toolbar'a uzanmadan, doğrudan yazarak yapı oluşturabilirsiniz:

| Şunu yazın…              | …şunu elde edersiniz |
| ------------------------ | -------------------- |
| `# ` (sonra boşluk)      | Başlık 1             |
| `## ` / `### `           | Başlık 2 / 3         |
| `- ` ya da `* `          | Madde işaretli liste |
| `1. `                    | Numaralı liste       |
| `> `                     | Alıntı               |
| ` ``` `                  | Kod bloğu            |
| `---`                    | Yatay ayraç          |
| `**kalın**` / `*italik*` | Kalın / italik       |
| `` `kod` ``              | Satır içi kod        |

## Toolbar kontrolleri

| Kontrol                                        | Ne yapar                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| **Kalın / İtalik / Altı çizili / Üstü çizili** | Seçimde satır içi işareti açıp kapatır.                                    |
| **Satır içi kod**                              | Seçimi `tek aralıklı kod` olarak işaretler.                                |
| **Vurgu**                                      | Seçime fosforlu kalem arka planı uygular.                                  |
| **Başlık 1 / 2 / 3**                           | Mevcut bloğu başlığa çevirir.                                              |
| **Madde işaretli / Numaralı liste**            | Seçili satırları listeye sarar. İç içe için <kbd>Tab</kbd>.                |
| **Alıntı**                                     | Bloğu alıntı olarak girintiler.                                            |
| **Kod bloğu**                                  | Tek aralıklı, çerçeveli bir kod bloğu.                                     |
| **Ayraç**                                      | Bloklar arasına yatay çizgi ekler.                                         |
| **Üst simge / Alt simge**                      | Seçili metni yükseltir veya alçaltır (örn. `x²`, `H₂O`).                   |
| **Yazı tipi**                                  | Seçim için açılır menüden bir font ailesi seçer.                           |
| **Metin rengi**                                | Seçim için bir renk örneği seçer; son giriş rengi temizler.                |
| **Harf düzeni**                                | Seçimi yeniden yazar: Cümle düzeni, küçük, BÜYÜK, Her Sözcük, bÜYÜK/kÜÇÜK. |
| **Sola/ortala/sağa/iki yana hizala**           | Başlık ve paragrafların hizalamasını ayarlar.                              |
| **Bağlantı**                                   | Bağlantı ekleyip düzenlemek için açılır panel (aşağıya bakın).             |
| **Görsel**                                     | Eklemek için bir görsel dosyası seçer (aşağıya bakın).                     |
| **Dipnot**                                     | İmleç konumuna numaralı bir dipnot ekler (aşağıya bakın).                  |
| **Geri al / Yinele**                           | Düzenleme geçmişinde gezinir.                                              |

Bunlardan hangilerinin görüneceği ve hangi sırada olacağı, editörü yapılandıran
geliştiriciye bağlıdır. Açılır menüler (Yazı tipi, Metin rengi) ve özel alıntı
düğmeleri yalnızca uygulama seçeneklerini sağladığında görünür.

## Bağlantılar

**Bağlantı**'ya tıklayın (ya da önce bağlanacak metni seçin) ve açılır panel açılsın.
Bir URL yapıştırın veya yazın; hiçbir şey seçmediyseniz ikinci bir alan görünen metni
yazmanızı sağlar. Plume URL'yi normalize eder (sade bir `example.com`,
`https://example.com` olur). Mevcut bir bağlantıyı düzenlemek için üzerine tıklayın
ya da paneldeki **Kaldır** ile bağlantıyı sökün.

Bağlantılar _editörün içinde_ tıklayınca açılmaz (böylece düzenleyebilirsiniz) —
içerik yayımlandığında normal şekilde açılırlar.

## Görseller

Görsel eklemenin, hepsi aynı işlem hattından geçen üç yolu var:

1. **Toolbar** — **Görsel**'e tıklayıp bir dosya seçin.
2. **Yapıştırma** — panodan bir görsel yapıştırın.
3. **Sürükle-bırak** — editörün üzerine bir görsel dosyası bırakın.

Eklendikten sonra görseli seçerek şunları yapabilirsiniz:

- **Yeniden boyutlandırma** — köşe tutamacını sürükleyin. Asla büzülmemesi için bir
  minimum genişlik vardır.
- **Hizalama** — seçim balon menüsünden sola, ortaya veya sağa.
- **Açıklama** — görselin hemen altında satır içi düzenlenen bir açıklama ekleyin.
- **Silme** — balon menüden kaldırın (ya da seçip <kbd>Backspace</kbd>'e basın).

Büyük görsellerin yüklenmesi biraz sürebilir; bu sırada bir yer tutucu görünür,
ardından son görselle değişir.

## Dipnotlar

İmleci referansın görüneceği yere koyun ve **Dipnot**'a tıklayın. Plume numaralı bir
işaret ekler ve belgenin altındaki dipnotlar bölümünde eşleşen girişi oluşturur (ya da
ona odaklanır). Notun metnini orada yazarsınız.

- Numaralandırma otomatiktir; dipnot ekledikçe veya kaldırdıkça kendini yeniden sıralar.
- İşarete tıklayarak notuna gidin; notun numarasına tıklayarak işarete geri dönün.

## Alıntı kutuları (özel alıntılar)

Geliştirici özel alıntı çeşitlerini etkinleştirdiyse, ek alıntı tarzı düğmeler
görürsünüz (örneğin **Not** veya **Uyarı**). Bunlar mevcut bloğu renkli bir kutuya
sarar. Alıntılar iç içe geçmez — biri açıkken diğerini açmaya çalışmak bir şey yapmaz,
böylece kutular temiz kalır.

## İçerik yapıştırma

Varsayılan olarak yapıştırma, editörün şemasından geçebilen biçimlendirmeyi (kalın,
bağlantılar, listeler…) korur, gerisini atar.

Uygulama **yapıştırma yöneticisi**ni açtıysa, her yapıştırma önce nasıl eklemek
istediğinizi sorar:

- **Sadece metin** — tüm biçimlendirmeyi atar, yalnızca metni ekler.
- **Biçimli** — kaynak biçimlendirmesini korur.

Modalı <kbd>Esc</kbd>, dışına tıklayarak veya bir seçenek seçerek kapatın.

## Sonraki

Yazarların neler yapabileceğini yapılandıran geliştiriciler
[Özelleştirme](/tr/guide/customization) ve [PlumeOptions](/tr/api/options)
referansına geçebilir.
