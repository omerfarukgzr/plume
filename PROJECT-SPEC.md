# Plume — Proje Şartnamesi

> Özelleştirilebilir, framework-agnostic bir zengin metin editörü kütüphanesi.
> Çekirdek saf TypeScript + tiptap üzerine kuruludur; React ve Vue adaptörleriyle dağıtılır.

**Durum:** Planlama (kod henüz yazılmadı)
**Tarih:** 2026-05-25

---

## 1. Vizyon

Plume; geliştiricilerin kendi uygulamalarına kolayca gömebileceği, derinlemesine
özelleştirilebilir bir zengin metin (WYSIWYG) editörüdür. Editör mantığı bir kez
yazılır (`@plume/core`), her framework için ince bir adaptör katmanı sunulur.
Bugün React ve Vue, yarın Svelte/Solid/vanilla kolayca eklenebilir.

**Tasarım ilkeleri**
- **Tek çekirdek, çok framework** — iş mantığı adaptörlerde tekrarlanmaz.
- **Özelleştirilebilirlik birinci sınıf** — toolbar, tema ve eklentiler config ile yönetilir.
- **Hafif ve bağımsız** — gereksiz bağımlılık yok; stil tamamen override edilebilir.
- **Tip güvenli** — her şey TypeScript, kullanıcıya tam `.d.ts` sunulur.

---

## 2. Alınan Kararlar

| Konu | Karar |
|------|-------|
| Editör tipi | Zengin metin (Rich Text / WYSIWYG) |
| Arka plan motoru | tiptap (ProseMirror üzerine) |
| Mimari | Framework-agnostic çekirdek + adaptörler (monorepo) |
| Hedef frameworkler | React ve Vue (ilk etapta) |
| Özelleştirme | Toolbar/menü config + Tema/stil + Extension API |
| Dil | TypeScript, tam tipli |
| Stil | CSS değişkenleri + düz CSS (dark mode dahil) |
| Lisans | MIT |
| İsim / npm scope | `@plume/*` |

---

## 3. Mimari

### Paketler (monorepo)

```
@plume/core    → Saf TS. tiptap konfigürasyonu, extension kayıt sistemi,
                 toolbar komut tanımları, varsayılan extension seti, tema değişkenleri.
                 Framework bilmez.

@plume/react   → React adaptörü. <PlumeEditor /> bileşeni + usePlumeEditor() hook'u.
                 core'u sarar, React render döngüsüne bağlar.

@plume/vue     → Vue adaptörü. <PlumeEditor /> bileşeni + usePlumeEditor() composable.
                 core'u sarar, Vue reaktivitesine bağlar.

@plume/styles  → (opsiyonel ayrı paket veya core içinde) CSS değişkenleri + temel tema.
```

Adaptörlerin görevi minimumdur: yaşam döngüsü (mount/unmount), reaktivite köprüsü ve
UI render. Tüm editör davranışı `core`'dadır.

### Bağımlılık yönü

```
@plume/react ─┐
              ├─→ @plume/core ─→ @tiptap/* , prosemirror-*
@plume/vue  ──┘
```

`@plume/core` adaptörlerin `peerDependency`'sidir. React/Vue ise ilgili adaptörün
`peerDependency`'sidir (kullanıcının sürümüyle çakışmasın diye).

---

## 4. Özelleştirme Modeli

1. **Toolbar / menü yapılandırması**
   - Hangi butonların görüneceği, sırası ve gruplanması config ile belirlenir.
   - Örn: `toolbar: ['bold', 'italic', '|', 'heading', 'bulletList', 'link']`
   - Kullanıcı kendi buton/komutunu da kaydedebilir.

2. **Tema / stil**
   - Tüm görsel değerler CSS değişkenleriyle (`--plume-*`) tanımlanır.
   - Dark mode bir attribute/class ile açılır.
   - Kullanıcı kendi CSS'iyle override edebilir; istemezse hiç stil import etmez (unstyled mod mümkün).

3. **Extension API**
   - Kullanıcı kendi tiptap node/mark/extension'ını editöre verebilir.
   - `extensions: [...defaults, myCustomExtension]` gibi.
   - Varsayılan set kapatılabilir / seçmeli açılabilir.

---

## 5. Tooling

| Amaç | Araç |
|------|------|
| Paket yönetimi | **pnpm workspaces** |
| Görev/build orkestrasyonu | **Turborepo** |
| Paket build (ESM + CJS + d.ts) | **tsup** |
| Playground / demo | **Vite** (React ve Vue app'leri) |
| Test | **Vitest** + Testing Library |
| Dokümantasyon | **VitePress** |
| Sürüm & yayınlama | **Changesets** + **GitHub Actions** |
| Lint / format | ESLint + Prettier |

---

## 6. Repo İskeleti (hedef)

```
plume/
├─ packages/
│  ├─ core/          # @plume/core
│  ├─ react/         # @plume/react
│  └─ vue/           # @plume/vue
├─ apps/
│  ├─ playground-react/   # Vite + React canlı deneme
│  └─ playground-vue/     # Vite + Vue canlı deneme
├─ docs/             # VitePress dokümantasyon sitesi
├─ .github/
│  └─ workflows/     # CI + release (Changesets)
├─ .changeset/
├─ package.json      # workspace kökü
├─ pnpm-workspace.yaml
├─ turbo.json
├─ tsconfig.base.json
└─ README.md
```

---

## 7. Yol Haritası (öneri)

- **M0 — İskelet:** monorepo, tooling, boş paketler, çalışan iki playground, CI.
- **M1 — Çekirdek MVP:** `@plume/core` temel rich-text (bold, italic, heading, list, link),
  varsayılan extension seti, tema değişkenleri.
- **M2 — Adaptörler:** `@plume/react` ve `@plume/vue` ile çalışan editör + toolbar.
- **M3 — Özelleştirme:** toolbar config API, tema override, kullanıcı extension'ları.
- **M4 — Olgunlaşma:** dokümantasyon, testler, ilk npm yayını (`0.1.0`).

---

## 8. Açık / Sonraya Bırakılan Konular

- Görsel yükleme stratejisi (base64 / URL / kullanıcı handler'ı).
- İşbirlikçi (collaborative) düzenleme — ileride Yjs ile eklenebilir.
- Mobil/dokunmatik davranışlar.
- i18n (toolbar etiketleri, erişilebilirlik metinleri).
- İlerideki ek adaptörler (Svelte, Solid, vanilla JS).
