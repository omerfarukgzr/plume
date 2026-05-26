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

En çok işinize yarayacak değişkenler: `--plume-color-bg`, `--plume-color-text`,
`--plume-color-primary`, `--plume-color-border`, `--plume-color-button`,
`--plume-radius`, `--plume-font`, `--plume-font-mono`, `--plume-font-size` ve
`--plume-content-max-width`. Tam listeyi `styles.css` içinde bulabilirsiniz.

## Koyu tema

Plume hazır bir koyu tema ile gelir. Açmak için editörün herhangi bir üst öğesine
`data-theme="dark"` ekleyin:

```html
<div data-theme="dark">
  <PlumeEditor />
</div>
```

## Stilsiz kullanım

Tüm stili kendiniz yazmak isterseniz `@useplume/core/styles.css`'i hiç eklemeyin. Editör yine
sorunsuz çalışır; sadece Plume'un hazır teması olmadan gelir. Böylece `.plume` ile
başlayan sınıf adlarını sıfırdan kendiniz biçimlendirebilirsiniz.
