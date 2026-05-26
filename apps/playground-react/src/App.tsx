import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, Toolbar, usePlumeEditor, type Editor } from '@useplume/react'
import {
  icons,
  resolveToolbarItems,
  type CustomBlockquoteSpec,
  type ToolbarConfig,
} from '@useplume/core'
import '@useplume/core/styles.css'
import './index.css'

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
// gruplar arasındaki dikey ayraçlar (`'|'`) otomatik eklenir. Seçimler
// localStorage'da saklanır, sayfa yenilenince kaybolmaz.
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

const STORAGE_KEY = 'plume-playground:toolbar'

/** Tüm öğeler açık olan varsayılan durum. */
function defaultEnabled(): Record<string, boolean> {
  return Object.fromEntries(toolbarGroups.flatMap((g) => g.map((i) => [i.name, true])))
}

/** Kayıtlı seçimleri yükle; yeni eklenen öğeler varsayılan olarak açık kalır. */
function loadEnabled(): Record<string, boolean> {
  const base = defaultEnabled()
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, boolean>
    for (const name of Object.keys(base)) {
      if (typeof saved[name] === 'boolean') base[name] = saved[name]
    }
  } catch {
    // Bozuk/eksik veri varsa varsayılanlarla devam et.
  }
  return base
}

/** Açık öğelerden, grupları koruyarak toolbar düzenini kur. */
function buildToolbar(enabled: Record<string, boolean>): ToolbarConfig {
  const config: ToolbarConfig = []
  for (const group of toolbarGroups) {
    const on = group.filter((i) => enabled[i.name])
    if (on.length === 0) continue
    if (config.length > 0) config.push('|')
    for (const i of on) config.push(i.name)
  }
  return config
}

const initialContent = `
<h1>Getting started</h1>
<p>Welcome to <mark>Plume</mark> — a <strong>customizable</strong>, <em>framework-agnostic</em>
rich text editor built on <a href="https://tiptap.dev">tiptap</a> and licensed under <strong>MIT</strong>.</p>
<p>Type markdown like <code>**bold**</code> or use shortcuts such as <code>⌘B</code>
for <s>most</s> all common marks. ✨</p>
<pre><code>npm install @useplume/react @useplume/core</code></pre>
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

// Isolated + debounced so the live preview never re-renders the editor while
// you type — it refreshes ~200ms after you pause.
const HtmlOutput = memo(function HtmlOutput({ editor }: { editor: Editor }) {
  const [html, setHtml] = useState(() => editor.getHTML())

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const sync = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setHtml(editor.getHTML()), 200)
    }
    editor.on('update', sync)
    return () => {
      clearTimeout(timer)
      editor.off('update', sync)
    }
  }, [editor])

  return (
    <details className="output">
      <summary>HTML output</summary>
      <pre>{html}</pre>
    </details>
  )
})

/** Languages the editor ships strings for. */
type Lang = 'tr' | 'en'

const placeholders: Record<Lang, string> = {
  tr: 'Bir şeyler yazın…',
  en: 'Start typing…',
}

// The editor lives in its own component, keyed by `lang` in <App> so switching
// language remounts it — that's how the placeholder, change-case locale and
// image labels (all baked in at creation) pick up the new locale. The current
// HTML is lifted up and fed back in as the initial content, so the document
// survives the rebuild.
function EditorPane({
  lang,
  initialHtml,
  enabled,
  dark,
  locked,
  onHtmlChange,
}: {
  lang: Lang
  initialHtml: string
  enabled: Record<string, boolean>
  dark: boolean
  locked: boolean
  onHtmlChange: (html: string) => void
}) {
  // The composable API: drive the editor yourself. `<PlumeEditor />` wraps all
  // of this in a single component if you don't need the editor instance.
  const editor = usePlumeEditor({
    content: initialHtml,
    placeholder: placeholders[lang],
    locale: lang,
    autoCapitalize: true,
    blockquotes: quotes,
    // `usePlumeEditor` re-applies this live, so toggling the header lock button
    // flips the editor between editable and read-only.
    editable: !locked,
    // No `uploadHandler` → picked/pasted/dropped images embed as base64 (zero
    // config). To store on your own server instead, pass:
    //   uploadHandler: createUploadHandler({ url: '/api/upload' })
    // The bubble-menu/caption labels follow `locale` automatically.
  })
  const items = useMemo(
    () => resolveToolbarItems(buildToolbar(enabled), { locale: lang, blockquotes: quotes }),
    [enabled, lang],
  )

  useEffect(() => {
    if (!editor) return
    const sync = () => onHtmlChange(editor.getHTML())
    editor.on('update', sync)
    return () => {
      editor.off('update', sync)
    }
  }, [editor, onHtmlChange])

  if (!editor) return null
  return (
    <>
      <div className="plume" data-theme={dark ? 'dark' : undefined}>
        <Toolbar editor={editor} items={items} />
        <EditorContent editor={editor} className="plume-editor" />
      </div>
      <HtmlOutput editor={editor} />
    </>
  )
}

export function App() {
  const [dark, setDark] = useState(true)
  const [lang, setLang] = useState<Lang>('tr')
  const [locked, setLocked] = useState(false)
  const [enabled, setEnabled] = useState<Record<string, boolean>>(loadEnabled)
  // Latest HTML, so remounting the editor on a language switch keeps the content.
  const htmlRef = useRef(initialContent)

  // Her değişiklikte seçimleri sakla.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled))
  }, [enabled])

  const toggle = (name: string) =>
    setEnabled((prev) => ({ ...prev, [name]: !prev[name] }))
  const activeCount = Object.values(enabled).filter(Boolean).length

  const handleHtmlChange = useCallback((html: string) => {
    htmlRef.current = html
  }, [])

  return (
    <div className="page">
      <header className="page__bar">
        <h1>Plume · React playground</h1>
        <div className="page__controls">
          <details className="picker">
            <summary className="toggle">⚙︎ Toolbar öğeleri ({activeCount})</summary>
            <div className="picker__panel">
              {toolbarGroups.map((group, gi) => (
                <div key={gi} className="picker__group">
                  {group.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      className="picker__chip"
                      data-on={enabled[item.name] ? '' : undefined}
                      onClick={() => toggle(item.name)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </details>
          <button
            className="toggle"
            type="button"
            data-on={locked ? '' : undefined}
            aria-pressed={locked}
            onClick={() => setLocked((value) => !value)}
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${
                locked ? icons.lock : icons.unlock
              }</svg><span>${locked ? 'Kilitli' : 'Düzenle'}</span>`,
            }}
          />
          <button
            className="toggle"
            type="button"
            onClick={() => setLang((value) => (value === 'tr' ? 'en' : 'tr'))}
          >
            🌐 {lang === 'tr' ? 'Türkçe' : 'English'}
          </button>
          <button className="toggle" type="button" onClick={() => setDark((value) => !value)}>
            {dark ? '☀︎ Light' : '☾ Dark'}
          </button>
        </div>
      </header>

      <main className="page__main">
        <EditorPane
          key={lang}
          lang={lang}
          initialHtml={htmlRef.current}
          enabled={enabled}
          dark={dark}
          locked={locked}
          onHtmlChange={handleHtmlChange}
        />
      </main>
    </div>
  )
}
