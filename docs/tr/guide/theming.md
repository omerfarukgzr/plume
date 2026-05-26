---
description: 'Plume editörünü --plume-* önekli CSS değişkenleriyle temalandırın, varsayılan görünümü değiştirin veya tamamen stilsiz bir editör kullanın.'
---

# Tema

Plume'un görünümü baştan sona `--plume-` ön ekli CSS değişkenleriyle yönetilir.
Varsayılan görünümü almak için stil dosyasını içe aktarın, sonra istediğiniz değişkeni
kendi CSS'inizde değiştirin. Dilerseniz stil dosyasını hiç eklemeyip editörü tamamen
kendi stilinizle de giydirebilirsiniz.

```ts
import '@useplume/core/styles.css'
```

## Değişkenleri değiştirmek

Editörü yeniden temalamak için `--plume-` değişkenlerini editörün herhangi bir üst
öğesinde (ya da `:root`'ta) tanımlayın:

```css
.plume {
  --plume-color-primary: #7c3aed;
  --plume-color-text: #1f2937;
  --plume-radius: 8px;
  --plume-font: 'Inter', sans-serif;
}
```

### Değişken referansı

Çoğu uygulamanın dokunduğu değişkenler bunlardır. Tam set için `styles.css`'e bakın
(araç ipucu, seçim ve kod-bloğu renkleri de orada).

**Yerleşim & tipografi**

| Değişken                    | Varsayılan                      | Neyi yönetir                        |
| --------------------------- | ------------------------------- | ----------------------------------- |
| `--plume-font`              | Inter, system-ui, …             | Editör arayüzü + içerik font yığını |
| `--plume-font-mono`         | JetBrains Mono, ui-monospace, … | Kod / kod-bloğu fontu               |
| `--plume-font-size`         | `1rem`                          | Temel içerik font boyutu            |
| `--plume-line-height`       | `1.7`                           | İçerik satır yüksekliği             |
| `--plume-content-max-width` | `680px`                         | Yazım sütununun maksimum genişliği  |
| `--plume-content-padding`   | `3rem 1.5rem 6rem`              | İçerik etrafındaki iç boşluk        |
| `--plume-radius`            | `16px`                          | Editör çerçevesi köşe yarıçapı      |
| `--plume-radius-sm`         | `8px`                           | Düğmeler, açılır menüler, alanlar   |
| `--plume-gap`               | `2px`                           | Toolbar düğmeleri arası boşluk      |

**Renkler**

| Değişken                        | Varsayılan | Neyi yönetir                     |
| ------------------------------- | ---------- | -------------------------------- |
| `--plume-color-bg`              | `#ffffff`  | Editör arka planı                |
| `--plume-color-text`            | `#1a1a1a`  | Gövde metni                      |
| `--plume-color-muted`           | `#6b7280`  | Açıklamalar, yer tutucular       |
| `--plume-color-border`          | `#e6e6e8`  | Çerçeve + ayraçlar               |
| `--plume-color-primary`         | `#6c5ce7`  | Odak halkaları, vurgular         |
| `--plume-color-toolbar-bg`      | `#ffffff`  | Toolbar arka planı               |
| `--plume-color-button`          | `#5c5c66`  | Toolbar ikon rengi               |
| `--plume-color-button-hover-bg` | `#f1f1f3`  | Toolbar düğmesi hover arka planı |
| `--plume-color-button-hover`    | `#1a1a1a`  | Hover'da toolbar ikon rengi      |
| `--plume-color-active-bg`       | `#eef0ff`  | Aktif (açık) düğme arka planı    |
| `--plume-color-active-text`     | `#5b4ddb`  | Aktif düğme ikon rengi           |
| `--plume-color-highlight-bg`    | `#fef3a3`  | Vurgu işareti arka planı         |

### Marka örneği

Birkaç değişkeni `.plume` kökünde geçersiz kılarak tüm editörü yeniden temalandırın:

```css
.plume {
  --plume-color-primary: #e11d48;
  --plume-color-active-bg: #ffe4e6;
  --plume-color-active-text: #be123c;
  --plume-radius: 10px;
  --plume-font: 'Inter', system-ui, sans-serif;
}
```

## Gömülü / tam genişlik editörler

Varsayılan içerik, ortalanmış bir okuma sütunu (`max-width: 680px`) ve cömert
makale iç boşluğu kullanır — blog ve belge düzenleme için ideal, ancak bir form
alanı veya admin panelinin içinde genelde fazla dar kalır.

Tam genişlik (edge-to-edge) bir editör için **`fluid`** prop'unu geçin (ya da
`plume--fluid` class'ını ekleyin). Bu, max-width'i kaldırır ve iç boşluğu
daraltır:

::: code-group

```tsx [React]
<PlumeEditor fluid content="<p>Kapsayıcısını doldurur</p>" />
```

```vue [Vue]
<PlumeEditor fluid content="<p>Kapsayıcısını doldurur</p>" />
```

:::

Tamamen akışkan yapmak yerine ince ayar için iki düzen değişkenini geçersiz
kılın:

```css
.plume {
  --plume-content-max-width: 100%; /* veya örn. 920px */
  --plume-content-padding: 0.75rem 1rem; /* kompakt */
}
```

## Koyu tema

Plume hazır bir koyu tema ile gelir. Açmak için editörün herhangi bir üst öğesine
`data-theme="dark"` ekleyin:

```html
<div data-theme="dark">
  <PlumeEditor />
</div>
```

Bunu bir düğmeye bağlamak birkaç satır sürer — bkz.
[karanlık mod düğmesi tarifi](/tr/examples#karanlık-mod-düğmesi).

## Stilsiz kullanım

Tüm stili kendiniz yazmak isterseniz `@useplume/core/styles.css`'i hiç eklemeyin. Editör yine
sorunsuz çalışır; sadece Plume'un hazır teması olmadan gelir. Böylece `.plume` ile
başlayan sınıf adlarını sıfırdan kendiniz biçimlendirebilirsiniz.
