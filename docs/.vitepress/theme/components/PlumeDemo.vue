<script setup lang="ts">
/**
 * Interactive Plume demo embedded in the docs.
 *
 * Flips real `<PlumeEditor>` props (toolbar preset, locale, base font) and
 * CSS variables (brand color, dark theme) live, and mirrors every choice into
 * a copy-paste code snippet — so visitors feel how little it takes to
 * configure Plume before they install anything.
 *
 * It mounts the actual `@useplume/vue` adapter, so what you see here is the
 * shipped editor, not a mockup. Always rendered inside `<ClientOnly>` by the
 * callers (the editor is browser-only).
 */
import { computed, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import { PlumeEditor } from '@useplume/vue'
import '@useplume/core/styles.css'

const props = withDefaults(
  defineProps<{
    /** Trimmed-down layout for the homepage hero (no code panel, fewer knobs). */
    compact?: boolean
    /** Initial UI language; follows the docs locale on the homepage. */
    locale?: 'tr' | 'en'
  }>(),
  { compact: false, locale: 'en' },
)

// ---- UI strings (the demo chrome only; the editor localizes itself) --------
const t = computed(() => (locale.value === 'tr' ? tr : en))
const en = {
  preset: 'Toolbar',
  theme: 'Theme',
  brand: 'Brand color',
  font: 'Font',
  language: 'Language',
  light: 'Light',
  dark: 'Dark',
  presets: { full: 'Full', blog: 'Blog', comment: 'Comment', minimal: 'Minimal' },
  fonts: { system: 'System', inter: 'Inter', serif: 'Serif', mono: 'Mono' },
}
const tr = {
  preset: 'Araç çubuğu',
  theme: 'Tema',
  brand: 'Marka rengi',
  font: 'Yazı tipi',
  language: 'Dil',
  light: 'Açık',
  dark: 'Koyu',
  presets: { full: 'Tam', blog: 'Blog', comment: 'Yorum', minimal: 'Minimal' },
  fonts: { system: 'Sistem', inter: 'Inter', serif: 'Serif', mono: 'Mono' },
}

// ---- Live state ------------------------------------------------------------
// Follow the docs' own light/dark theme so the embedded editor never clashes
// with the page it sits on; the in-demo Theme buttons can still override it,
// and flipping the site theme re-syncs the editor.
const { isDark } = useData()
const locale = ref<'tr' | 'en'>(props.locale)
const preset = ref<'full' | 'blog' | 'comment' | 'minimal'>(props.compact ? 'blog' : 'full')
const theme = ref<'light' | 'dark'>(isDark.value ? 'dark' : 'light')
watch(isDark, (v) => (theme.value = v ? 'dark' : 'light'))
const brand = ref('#6c5ce7')
const fontKey = ref<'system' | 'inter' | 'serif' | 'mono'>('system')

const brandSwatches = ['#6c5ce7', '#e11d48', '#2563eb', '#16a34a', '#d97706', '#0ea5e9']

const fontStacks = {
  system: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, Cambria, 'Times New Roman', serif",
  mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
} as const

// Toolbar layouts wired to the `toolbar` prop. These are the exact arrays a
// consumer would pass — the code panel below prints whichever is active.
const presets = {
  full: [
    'fontFamily',
    '|',
    'bold',
    'italic',
    'underline',
    'strike',
    'highlight',
    'code',
    '|',
    'heading1',
    'heading2',
    'bulletList',
    'orderedList',
    'blockquote',
    'codeBlock',
    '|',
    'link',
    'image',
    'footnote',
    '|',
    'undo',
    'redo',
  ],
  blog: [
    'heading1',
    'heading2',
    '|',
    'bold',
    'italic',
    'strike',
    'highlight',
    '|',
    'bulletList',
    'orderedList',
    'blockquote',
    '|',
    'link',
    'image',
  ],
  comment: ['bold', 'italic', 'code', '|', 'link'],
  minimal: ['bold', 'italic', '|', 'link'],
} as const

// Fonts for the in-toolbar font-family dropdown (only shown in the Full preset).
const fonts = [
  { label: 'Default', value: null },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Serif', value: "Georgia, 'Times New Roman', serif" },
  { label: 'Mono', value: 'ui-monospace, Menlo, monospace' },
]

const toolbar = computed(() => [...presets[preset.value]])
const currentFont = computed(() => fontStacks[fontKey.value])

// A local public asset, so it loads offline and respects the deployed base.
const cover = withBase('/sunrise.svg')

/* --- Sample document -------------------------------------------------------
 * Built as a ProseMirror JSON document rather than an HTML string. tiptap's
 * footnote `<li>` requires an `id` its HTML parser never supplies, so seeding a
 * footnote from HTML throws; JSON sets node attributes directly and sidesteps
 * that. The structure is written once in `buildDoc`; each locale only fills in
 * the text. It happens to exercise every feature — all headings, every inline
 * mark, colored text, super/subscript, both list kinds, a quote, a divider, a
 * code block, an image and a footnote.
 */
type Node = Record<string, unknown>
const txt = (text: string, marks?: Node[]): Node => (marks ? { type: 'text', text, marks } : { type: 'text', text })
const b = (t: string) => txt(t, [{ type: 'bold' }])
const it = (t: string) => txt(t, [{ type: 'italic' }])
const u = (t: string) => txt(t, [{ type: 'underline' }])
const strike = (t: string) => txt(t, [{ type: 'strike' }])
const hl = (t: string) => txt(t, [{ type: 'highlight' }])
const code = (t: string) => txt(t, [{ type: 'code' }])
const sup = (t: string) => txt(t, [{ type: 'superscript' }])
const sub = (t: string) => txt(t, [{ type: 'subscript' }])
const colored = (t: string, c: string) => txt(t, [{ type: 'textStyle', attrs: { color: c } }])
const link = (t: string, href: string) => txt(t, [{ type: 'link', attrs: { href } }])
const fnRef = (n: number, id: string): Node => ({
  type: 'footnoteReference',
  attrs: { 'data-id': id, referenceNumber: String(n), class: 'footnote-ref', href: `#fn:${n}` },
})

const heading = (level: number, ...content: Node[]): Node => ({ type: 'heading', attrs: { level }, content })
const para = (...content: Node[]): Node => ({ type: 'paragraph', content: content.length ? content : undefined })
const li = (...content: Node[]): Node => ({ type: 'listItem', content: [para(...content)] })
const bulletList = (...items: Node[]): Node => ({ type: 'bulletList', content: items })
const orderedList = (...items: Node[]): Node => ({ type: 'orderedList', content: items })

interface Strings {
  title: string
  lead: [string, string, string, string, string, string, string] // text, bold, text, em, text, underline, text
  figAlt: string
  figCap: string
  ritual: string
  para2: [string, string, string, string, string] // text, link, text, highlight, text
  linkHref: string
  bullets: [string, [string, string], [string, string]] // plain, [text,colored], [text,underline]
  rules: string
  ol: [[string, string, string], string, [string, string, string]]
  quote: [string, string]
  curious: [string, string, string, string, string, string, string, string] // text, sub, text, code, text, sup, strike, text
  codeBlock: string
  footnote: string
}

function buildDoc(s: Strings): Node {
  const [l0, l1, l2, l3, l4, l5, l6] = s.lead
  const [p0, p1, p2, p3, p4] = s.para2
  const [bl0, [bl1a, bl1b], [bl2a, bl2b]] = s.bullets
  const [[o0a, o0b, o0c], o1, [o2a, o2b, o2c]] = s.ol
  const [c0, c1, c2, c3, c4, c5, c6, c7] = s.curious
  return {
    type: 'doc',
    content: [
      heading(1, txt(s.title)),
      para(txt(l0), b(l1), txt(l2), it(l3), txt(l4), u(l5), txt(l6)),
      { type: 'image', attrs: { src: cover, alt: s.figAlt, caption: s.figCap, width: 640, align: 'center' } },
      heading(2, txt(s.ritual)),
      para(txt(p0), link(p1, s.linkHref), fnRef(1, 'fn-coffee'), txt(p2), hl(p3), txt(p4)),
      bulletList(li(txt(bl0)), li(txt(bl1a), colored(bl1b, '#6c5ce7')), li(txt(bl2a), u(bl2b))),
      heading(3, txt(s.rules)),
      orderedList(li(txt(o0a), b(o0b), txt(o0c)), li(txt(o1)), li(txt(o2a), it(o2b), txt(o2c))),
      { type: 'blockquote', content: [para(txt(s.quote[0]), it(s.quote[1]))] },
      { type: 'horizontalRule' },
      para(txt(c0), sub(c1), txt(c2), code(c3), txt(c4), sup(c5), strike(c6), txt(c7)),
      { type: 'codeBlock', content: [txt(s.codeBlock)] },
      {
        type: 'footnotes',
        content: [
          { type: 'footnote', attrs: { id: 'fn:1', 'data-id': 'fn-coffee' }, content: [para(txt(s.footnote))] },
        ],
      },
    ],
  }
}

const enDoc: Strings = {
  title: 'Notes on a Slow Morning',
  lead: [
    'There is a kind of quiet that belongs only to ',
    'early mornings',
    ' — before the inbox wakes, before the world asks anything of you. It is, I think, the ',
    'finest',
    ' hour of the day, and the easiest one to ',
    'protect',
    '.',
  ],
  figAlt: 'A calm sunrise over layered hills',
  figCap: 'Sunrise over the hills — the day, before it begins.',
  ritual: 'A small ritual',
  para2: [
    'Mine begins with ',
    'a good cup of coffee',
    ' — ground by hand, brewed slowly. I read a few pages, ',
    'highlight',
    ' a line worth keeping, and write down whatever stayed with me overnight.',
  ],
  linkHref: 'https://en.wikipedia.org/wiki/Coffee',
  bullets: ['Open the window — let the room breathe', ['Water first, then ', 'coffee'], ['No screens for the first ', 'twenty minutes']],
  rules: 'Three rules I try to keep',
  ol: [['Start with the ', 'hardest', ' thing'], 'Leave the phone in another room', ['Write ', 'before', ' you read the news']],
  quote: ['“The morning steals upon the night, melting the darkness.” — ', 'Shakespeare'],
  curious: [
    'For the curious: clean water (H',
    '2',
    'O) at about ',
    '92°C',
    ', and the jump a good roast makes feels exponential — closer to 2',
    'n',
    ' — skip it',
    ' and savour it instead. ✨',
  ],
  codeBlock: 'morning = coffee + silence + a blank page',
  footnote:
    'Coffee is said to have been discovered in Ethiopia, when a herder noticed his goats dancing after eating the bright red cherries.',
}

const trDoc: Strings = {
  title: 'Yavaş Bir Sabahın Notları',
  lead: [
    'Başka hiçbir saate benzemeyen bir sessizlik vardır: ',
    'erken sabahlar',
    ' — gelen kutusu uyanmadan, dünya senden bir şey istemeden önce. Bence günün ',
    'en güzel',
    ' saati ve ',
    'korunması',
    ' en kolay olanı.',
  ],
  figAlt: 'Tepelerin üzerinde sakin bir gün doğumu',
  figCap: 'Tepelerin üzerinde gün doğumu — gün, başlamadan önce.',
  ritual: 'Küçük bir ritüel',
  para2: [
    'Benimki ',
    'güzel bir fincan kahveyle',
    ' başlar — elle çekilmiş, ağır ağır demlenmiş. Birkaç sayfa okur, ',
    'saklanmaya değer',
    ' bir cümleyi işaretler ve gece aklımda kalan ne varsa yazarım.',
  ],
  linkHref: 'https://tr.wikipedia.org/wiki/Kahve',
  bullets: ['Pencereyi aç — oda nefes alsın', ['Önce su, sonra ', 'kahve'], ['İlk ', 'yirmi dakika ekran yok']],
  rules: 'Tutmaya çalıştığım üç kural',
  ol: [['En ', 'zor', ' işle başla'], 'Telefonu başka odada bırak', ['Haberleri okumadan ', 'önce', ' yaz']],
  quote: ['“Sabah, geceyi usulca çalar; karanlığı eritir.” — ', 'Shakespeare'],
  curious: [
    'Meraklısına: temiz su (H',
    '2',
    'O) yaklaşık ',
    '92°C',
    "'de; iyi bir kavurmanın yarattığı fark neredeyse üstel — 2",
    'n',
    ' — atla geç',
    ' ve bunun yerine tadını çıkar. ✨',
  ],
  codeBlock: 'sabah = kahve + sessizlik + boş bir sayfa',
  footnote:
    'Kahvenin Etiyopya’da keşfedildiği söylenir; bir çobanın, parlak kırmızı meyveleri yedikten sonra dans eden keçilerini fark etmesiyle.',
}

// Build once so each locale keeps a stable object identity (the unedited-check
// in setLocale relies on it).
const docs = { en: buildDoc(enDoc), tr: buildDoc(trDoc) }
const html = ref<unknown>(docs[locale.value])

function setLocale(next: 'tr' | 'en') {
  if (next === locale.value) return
  // Swap to the matching sample only if the user hasn't edited the default.
  if (html.value === docs[locale.value]) html.value = docs[next]
  locale.value = next
}
</script>

<template>
  <section class="demo" :class="{ 'demo--compact': compact }">
    <!-- Controls -->
    <div class="demo__controls">
      <div class="demo__group">
        <span class="demo__label">{{ t.preset }}</span>
        <div class="demo__segmented" role="group">
          <button
            v-for="(label, key) in t.presets"
            :key="key"
            type="button"
            class="demo__chip"
            :class="{ 'demo__chip--on': preset === key }"
            @click="preset = key as typeof preset"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <template v-if="!compact">
        <div class="demo__group">
          <span class="demo__label">{{ t.theme }}</span>
          <div class="demo__segmented" role="group">
            <button
              type="button"
              class="demo__chip"
              :class="{ 'demo__chip--on': theme === 'light' }"
              @click="theme = 'light'"
            >
              {{ t.light }}
            </button>
            <button
              type="button"
              class="demo__chip"
              :class="{ 'demo__chip--on': theme === 'dark' }"
              @click="theme = 'dark'"
            >
              {{ t.dark }}
            </button>
          </div>
        </div>

        <div class="demo__group">
          <span class="demo__label">{{ t.brand }}</span>
          <div class="demo__swatches">
            <button
              v-for="c in brandSwatches"
              :key="c"
              type="button"
              class="demo__swatch"
              :class="{ 'demo__swatch--on': brand === c }"
              :style="{ background: c }"
              :aria-label="c"
              @click="brand = c"
            />
            <label class="demo__picker" :title="t.brand">
              <input type="color" v-model="brand" aria-label="brand color" />
            </label>
          </div>
        </div>

        <div class="demo__group">
          <span class="demo__label">{{ t.font }}</span>
          <div class="demo__segmented" role="group">
            <button
              v-for="(label, key) in t.fonts"
              :key="key"
              type="button"
              class="demo__chip"
              :class="{ 'demo__chip--on': fontKey === key }"
              @click="fontKey = key as typeof fontKey"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <div class="demo__group">
          <span class="demo__label">{{ t.language }}</span>
          <div class="demo__segmented" role="group">
            <button
              type="button"
              class="demo__chip"
              :class="{ 'demo__chip--on': locale === 'en' }"
              @click="setLocale('en')"
            >
              EN
            </button>
            <button
              type="button"
              class="demo__chip"
              :class="{ 'demo__chip--on': locale === 'tr' }"
              @click="setLocale('tr')"
            >
              TR
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Editor -->
    <div class="demo__editor" :data-theme="theme === 'dark' ? 'dark' : undefined">
      <PlumeEditor
        :key="locale"
        v-model:content="html"
        :toolbar="toolbar"
        :fonts="fonts"
        :locale="locale"
      />
    </div>

  </section>
</template>

<style scoped>
.demo {
  --demo-brand: v-bind(brand);
  --demo-font: v-bind(currentFont);
  display: grid;
  gap: 16px;
  margin: 8px 0 4px;
}

/* Controls --------------------------------------------------------------- */
.demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
}
.demo__group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.demo__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}
.demo__segmented {
  display: inline-flex;
  padding: 4px;
  gap: 2px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
}
.demo__chip {
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  padding: 7px 15px;
  border-radius: 999px;
  color: var(--vp-c-text-2);
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}
.demo__chip:hover {
  color: var(--vp-c-text-1);
}
/* Active segment: a neutral, "elevated" pill (tiptap-style) rather than a brand
   fill. `--vp-c-bg-soft` is lighter than the `--vp-c-bg` track in dark mode and
   a soft grey on white in light mode, so it reads as selected in both themes. */
.demo__chip--on {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  box-shadow: 0 1px 2px rgb(0 0 0 / 12%);
}

/* Compact (home page): strip the chrome down to a single, centered pill —
   tiptap-style. No surrounding box, no labels, no theme/brand/font/language
   groups (those live on the full /demo page). */
.demo--compact .demo__controls {
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
}
.demo--compact .demo__label {
  display: none;
}
.demo--compact .demo__chip {
  padding: 9px 20px;
  font-size: 14px;
}

.demo__swatches {
  display: inline-flex;
  gap: 6px;
}
.demo__swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  box-shadow: 0 0 0 1px var(--vp-c-divider) inset;
  transition: transform 0.12s ease;
}
.demo__swatch:hover {
  transform: scale(1.12);
}
.demo__swatch--on {
  border-color: var(--vp-c-bg);
  box-shadow: 0 0 0 2px var(--demo-brand);
}
/* Free color picker: a swatch-sized chip wrapping a native <input type=color>. */
.demo__picker {
  position: relative;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 0 1px var(--vp-c-divider) inset;
  background-image: conic-gradient(
    from 0deg,
    #f87171,
    #fbbf24,
    #34d399,
    #60a5fa,
    #a78bfa,
    #f87171
  );
  display: inline-flex;
}
.demo__picker input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  border: 0;
  padding: 0;
}

/* Editor ----------------------------------------------------------------- */
.demo__editor {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  overflow: hidden;
}
/* Brand color + base font reach the editor's own `.plume` root, beating the
   built-in dark-theme defaults (which only have single-class specificity). */
.demo__editor :deep(.plume) {
  --plume-color-primary: var(--demo-brand);
  --plume-color-active-text: var(--demo-brand);
  --plume-color-active-bg: color-mix(in srgb, var(--demo-brand) 12%, transparent);
  --plume-color-selection: color-mix(in srgb, var(--demo-brand) 18%, transparent);
  --plume-font: var(--demo-font);
  --plume-content-max-width: none;
  --plume-content-padding: 1.25rem 1.5rem 2rem;
}
.demo__editor :deep(.plume-editor) {
  min-height: 320px;
  max-height: 460px;
  overflow-y: auto;
}
.demo--compact .demo__editor :deep(.plume-editor) {
  min-height: 420px;
  max-height: 560px;
}

/* The editor lives inside `.vp-doc`, whose typography (heading top-borders and
   outsized margins, paragraph/link spacing) bleeds in and beats Plume's
   deliberately low-specificity `:where()` rules. Re-assert the editor's own
   look here, scoped to the demo, so the embed matches a real app. The footnote
   double-marker is handled in the core stylesheet instead. */
.demo__editor :deep(.plume-editor__content :is(h1, h2, h3, h4, h5, h6)) {
  border-top: 0;
  padding-top: 0;
  margin: 1.6em 0 0.6em;
  line-height: 1.2;
  letter-spacing: -0.01em;
}
.demo__editor :deep(.plume-editor__content h1) {
  font-size: 1.9em;
}
.demo__editor :deep(.plume-editor__content h2) {
  font-size: 1.5em;
}
.demo__editor :deep(.plume-editor__content h3) {
  font-size: 1.2em;
}

/* On phones the fixed-width segmented pills (e.g. "Full Blog Comment Minimal")
   don't fit beside their label and force the controls box wider than the
   viewport — pushing everything right and clipping the color picker. Stack the
   label above a full-width pill whose chips share the row equally, so each group
   always fits and the panel stays centered. */
@media (max-width: 640px) {
  .demo__controls {
    gap: 12px;
  }
  .demo__group {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
  .demo__segmented {
    width: 100%;
  }
  .demo__chip {
    flex: 1;
    text-align: center;
    padding: 8px 4px;
  }
  /* The compact hero demo keeps its larger chip padding by default; on phones
     that overflows the narrow column, so let its chips shrink and share the
     pill like the full demo's do. */
  .demo--compact .demo__chip {
    padding: 9px 6px;
    font-size: 13px;
  }
}
</style>
