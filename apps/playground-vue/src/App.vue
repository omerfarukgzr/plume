<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { icons, type CustomBlockquoteSpec, type ToolbarConfig } from '@plume/core'
import EditorPane from './EditorPane.vue'
import '@plume/core/styles.css'
import './index.css'

type Lang = 'tr' | 'en'

// Custom blockquote variants — apps just give a name, label, color and (here)
// an icon; Plume builds the matching node + toolbar button. Reference each name
// in the toolbar layout below.
const quotes: CustomBlockquoteSpec[] = [
  { name: 'kuran', label: 'Kuran alıntısı', color: '#83214a', icon: icons.book },
  { name: 'hadis', label: 'Hadis alıntısı', color: '#19623e', icon: icons.quote },
]

// ── Toolbar test sahası ──────────────────────────────────────────────────────
// Toolbarın TAM öğe listesi, gruplara ayrılmış halde. Başlığın yanındaki
// "Toolbar öğeleri" panelinden her birini tıklayarak ekleyip kaldırabilirsin;
// gruplar arasındaki dikey ayraçlar (`'|'`) otomatik eklenir.
const toolbarGroups: { name: string; label: string }[][] = [
  [{ name: 'fontFamily', label: 'Yazı tipi' }],
  [
    { name: 'bold', label: 'Kalın' },
    { name: 'italic', label: 'İtalik' },
    { name: 'underline', label: 'Altı çizili' },
    { name: 'strike', label: 'Üstü çizili' },
    { name: 'changeCase', label: 'Harf değiştir' },
    { name: 'textColor', label: 'Yazı rengi' },
    { name: 'highlight', label: 'Vurgu' },
    { name: 'code', label: 'Kod' },
  ],
  [
    { name: 'alignLeft', label: 'Sola hizala' },
    { name: 'alignCenter', label: 'Ortala' },
    { name: 'alignRight', label: 'Sağa hizala' },
    { name: 'alignJustify', label: 'İki yana yasla' },
  ],
  [
    { name: 'heading1', label: 'Başlık 1' },
    { name: 'heading2', label: 'Başlık 2' },
    { name: 'heading3', label: 'Başlık 3' },
    { name: 'orderedList', label: 'Numaralı liste' },
    { name: 'bulletList', label: 'Madde liste' },
  ],
  [
    { name: 'blockquote', label: 'Alıntı' },
    { name: 'codeBlock', label: 'Kod bloğu' },
  ],
  [
    { name: 'link', label: 'Bağlantı' },
    { name: 'image', label: 'Görsel' },
    { name: 'footnote', label: 'Dipnot' },
    { name: 'superscript', label: 'Üst simge' },
    { name: 'subscript', label: 'Alt simge' },
    { name: 'horizontalRule', label: 'Yatay çizgi' },
  ],
  [
    { name: 'kuran', label: 'Kuran alıntısı' },
    { name: 'hadis', label: 'Hadis alıntısı' },
  ],
  [
    { name: 'undo', label: 'Geri al' },
    { name: 'redo', label: 'İleri al' },
  ],
]

// Her öğenin açık/kapalı durumu — hepsi başta açık. Paneldeki tıklamalar bunu
// değiştirir, `items` de anında yeniden hesaplanır. Durum localStorage'da
// saklanır, böylece sayfa yenilenince seçimler kaybolmaz.
const STORAGE_KEY = 'plume-playground:toolbar'

const enabled = reactive<Record<string, boolean>>(
  Object.fromEntries(toolbarGroups.flatMap((g) => g.map((i) => [i.name, true]))),
)

// Kayıtlı seçimleri yükle (yeni eklenen öğeler varsayılan olarak açık kalır).
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, boolean>
  for (const name of Object.keys(enabled)) {
    if (typeof saved[name] === 'boolean') enabled[name] = saved[name]
  }
} catch {
  // Bozuk/eksik veri varsa varsayılanlarla devam et.
}

// Her değişiklikte sakla.
watchEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled))
})

const toggle = (name: string) => {
  enabled[name] = !enabled[name]
}
const activeCount = computed(() => Object.values(enabled).filter(Boolean).length)

const initialContent = `
<h1>Getting started</h1>
<p>Welcome to <mark>Plume</mark> — a <strong>customizable</strong>, <em>framework-agnostic</em>
rich text editor built on <a href="https://tiptap.dev">tiptap</a> and licensed under <strong>MIT</strong>.</p>
<p>Type markdown like <code>**bold**</code> or use shortcuts such as <code>⌘B</code>
for <s>most</s> all common marks. ✨</p>
<pre><code>npm install @plume/vue @plume/core</code></pre>
<h2>Features</h2>
<blockquote><p>A responsive rich text editor with one shared core and a thin adapter
per framework — React and Vue today.</p></blockquote>
<blockquote class="plume-blockquote plume-quote-kuran" data-quote="kuran" style="--plume-quote-color: #83214a"><p>"Hiç bilenlerle bilmeyenler bir olur mu?" <em>(Zümer, 9)</em></p></blockquote>
<blockquote class="plume-blockquote plume-quote-hadis" data-quote="hadis" style="--plume-quote-color: #19623e"><p>"İlim öğrenmek her Müslüman'a farzdır." <em>(İbn Mâce)</em></p></blockquote>
<ul>
  <li>Headings, lists, blockquotes and code blocks</li>
  <li>Bold, italic, underline, strike, <mark>highlight</mark> and links</li>
  <li>Font family, <span style="color: #958DF1">text color</span>, case tools and resizable images</li>
  <li>Superscript (E = mc<sup>2</sup>), subscript (H<sub>2</sub>O) and text alignment</li>
</ul>
<figure data-type="plume-image" data-align="center">
  <img src="https://picsum.photos/seed/plume/640/360" alt="Hover the image, then drag the corner handle to resize." width="480">
  <figcaption>Hover the image, then drag the corner handle to resize.</figcaption>
</figure>
`

const dark = ref(true)
const lang = ref<Lang>('tr')
// Latest HTML, so remounting <EditorPane> on a language switch keeps the content.
const liveHtml = ref(initialContent)

// Açık olan öğelerden, grupları koruyarak toolbar düzenini kur. Bir grupta açık
// öğe kaldıysa öncesine ayraç koyar; tamamen kapalı gruplar atlanır. Dile göre
// yeniden çözülmesi için <EditorPane>'e iletilir.
const toolbarConfig = computed<ToolbarConfig>(() => {
  const config: ToolbarConfig = []
  for (const group of toolbarGroups) {
    const on = group.filter((i) => enabled[i.name])
    if (on.length === 0) continue
    if (config.length > 0) config.push('|')
    for (const i of on) config.push(i.name)
  }
  return config
})

const toggleLang = () => {
  lang.value = lang.value === 'tr' ? 'en' : 'tr'
}
</script>

<template>
  <div class="page">
    <header class="page__bar">
      <h1>Plume · Vue playground</h1>
      <div class="page__controls">
        <details class="picker">
          <summary class="toggle">⚙︎ Toolbar öğeleri ({{ activeCount }})</summary>
          <div class="picker__panel">
            <div v-for="(group, gi) in toolbarGroups" :key="gi" class="picker__group">
              <button
                v-for="item in group"
                :key="item.name"
                type="button"
                class="picker__chip"
                :data-on="enabled[item.name] ? '' : undefined"
                @click="toggle(item.name)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
        </details>
        <button class="toggle" type="button" @click="toggleLang">
          🌐 {{ lang === 'tr' ? 'Türkçe' : 'English' }}
        </button>
        <button class="toggle" type="button" @click="dark = !dark">
          {{ dark ? '☀︎ Light' : '☾ Dark' }}
        </button>
      </div>
    </header>

    <main class="page__main">
      <EditorPane
        :key="lang"
        :lang="lang"
        :initial-html="liveHtml"
        :toolbar="toolbarConfig"
        :blockquotes="quotes"
        :dark="dark"
        @update:html="liveHtml = $event"
      />
    </main>
  </div>
</template>
