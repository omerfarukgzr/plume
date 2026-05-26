---
description: 'Copy-paste Plume recipes: a blog editor, a comment box, a read-only viewer, saving to an API, dark-mode toggle, a custom toolbar button, mentions, unstyled mode, and SSR with Next.js and Nuxt.'
---

# Examples & recipes

Self-contained, copy-paste recipes. Each one is complete — drop it in and adjust.
For the option details behind them, see [PlumeOptions](/api/options).

[[toc]]

## Minimal editor

The smallest thing that works — default toolbar, theme and extensions.

```tsx
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export const App = () => <PlumeEditor content="<p>Hello 🪶</p>" />
```

## A blog post editor

A focused toolbar, a placeholder, autofocus, and server-backed image uploads.

```tsx
import { PlumeEditor } from '@useplume/react'
import { createUploadHandler } from '@useplume/core'
import '@useplume/core/styles.css'

export function PostEditor({ initialHtml, onChange }) {
  return (
    <PlumeEditor
      content={initialHtml}
      placeholder="Tell your story…"
      autofocus="end"
      locale="en"
      toolbar={[
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
        'codeBlock',
        '|',
        'link',
        'image',
        'footnote',
        '|',
        'undo',
        'redo',
      ]}
      image={{ uploadHandler: createUploadHandler({ url: '/api/upload' }) }}
      onUpdate={(editor) => onChange(editor.getHTML())}
    />
  )
}
```

## A compact comment box

A tiny toolbar, no images, no footnotes — just inline marks and a link.

```tsx
<PlumeEditor
  placeholder="Add a comment…"
  toolbar={['bold', 'italic', 'code', '|', 'link']}
  image={false}
  footnote={false}
  onUpdate={(editor) => setDraft(editor.getHTML())}
/>
```

## Read-only viewer

Render stored content with no toolbar and no editing.

```tsx
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export const ArticleView = ({ html }) => (
  <PlumeEditor content={html} editable={false} toolbar={false} />
)
```

## Saving to an API

Debounced autosave via `onUpdate`, plus an explicit save that also reports which
uploaded assets are still in use (for orphan cleanup):

```tsx
import { usePlumeEditor, EditorContent, Toolbar } from '@useplume/react'
import { collectImageAssetIds } from '@useplume/core'

export function Editor({ docId, initialHtml }) {
  const editor = usePlumeEditor({
    content: initialHtml,
    updateDelay: 800,
    onUpdate: (e) => autosave(docId, e.getHTML()),
  })

  async function saveNow() {
    if (!editor) return
    await fetch(`/api/docs/${docId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: editor.getHTML(),
        usedAssetIds: collectImageAssetIds(editor),
      }),
    })
  }

  return (
    <div className="plume">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <button onClick={saveNow}>Save</button>
    </div>
  )
}
```

Storing JSON instead of HTML? Swap `editor.getHTML()` for `editor.getJSON()` —
both round-trip back through `content`.

## Dark-mode toggle

Plume reads `data-theme="dark"` from any ancestor, so toggling a wrapper attribute
is enough.

```tsx
import { useState } from 'react'
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export function ThemedEditor() {
  const [dark, setDark] = useState(false)
  return (
    <div data-theme={dark ? 'dark' : undefined}>
      <button onClick={() => setDark((d) => !d)}>Toggle theme</button>
      <PlumeEditor content="<p>Themed 🪶</p>" />
    </div>
  )
}
```

## Brand theming

Override `--plume-*` variables on the `.plume` root (see [Theming](/guide/theming)
for the full list).

```css
.plume {
  --plume-color-primary: #e11d48;
  --plume-color-active-bg: #ffe4e6;
  --plume-color-active-text: #be123c;
  --plume-radius: 10px;
  --plume-font: 'Inter', system-ui, sans-serif;
  --plume-content-max-width: 720px;
}
```

## A custom toolbar button

Register the control with `toolbarItems`, then place its `name` in `toolbar`.

```tsx
<PlumeEditor
  toolbar={['bold', 'italic', '|', 'clearFormat']}
  toolbarItems={[
    {
      name: 'clearFormat',
      type: 'button',
      title: 'Clear formatting',
      run: (editor) => editor.chain().focus().unsetAllMarks().clearNodes().run(),
    },
  ]}
/>
```

## Callouts (custom blockquotes)

Define styled quote variants and expose them as toolbar buttons.

```tsx
<PlumeEditor
  toolbar={['blockquote', 'note', 'warning', 'tip']}
  blockquotes={[
    { name: 'note', label: 'Note', color: '#2563eb' },
    { name: 'warning', label: 'Warning', color: '#d97706' },
    { name: 'tip', label: 'Tip', color: '#16a34a' },
  ]}
/>
```

## Fonts & colors

Populate the `fontFamily` and `textColor` dropdowns. A font with `src` is loaded
for you via an injected `@font-face`.

```tsx
<PlumeEditor
  toolbar={['fontFamily', 'textColor']}
  fonts={[
    { label: 'Default', value: null },
    { label: 'Inter', value: 'Inter', src: '/fonts/Inter.woff2' },
    { label: 'Serif', value: 'Georgia, serif' },
  ]}
  colors={['#111827', '#dc2626', '#2563eb', '#16a34a']}
/>
```

## Mentions (third-party tiptap extension)

Any tiptap extension drops into `extensions`.

```tsx
import Mention from '@tiptap/extension-mention'
;<PlumeEditor extensions={[Mention.configure({ suggestion: mySuggestion })]} />
```

## Fully unstyled

Skip the stylesheet to style everything yourself; the editor still works.

```tsx
import { PlumeEditor } from '@useplume/react'
// note: no `import '@useplume/core/styles.css'`

export const App = () => <PlumeEditor content="<p>bare</p>" />
```

Then target the `.plume`, `.plume-toolbar`, `.plume-editor__content`, etc. class
names from your own CSS.

## SSR — Next.js (App Router)

The editor is a client component. Render it on the client, and disable
synchronous first render to avoid hydration mismatches.

```tsx
'use client'
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export default function Editor() {
  return <PlumeEditor content="<p>SSR-safe</p>" immediatelyRender={false} />
}
```

If you import it from a server component, wrap it with `next/dynamic` and
`ssr: false`.

## SSR — Nuxt

`<PlumeEditor>` is client-only in Nuxt. The simplest path is the `.client`
suffix or a `<ClientOnly>` wrapper:

```vue
<script setup lang="ts">
import { PlumeEditor } from '@useplume/vue'
import '@useplume/core/styles.css'
</script>

<template>
  <ClientOnly>
    <PlumeEditor content="<p>SSR-safe</p>" />
  </ClientOnly>
</template>
```

## Paste manager

Let authors choose plain text vs. keeping formatting on every paste.

```tsx
<PlumeEditor content="<p></p>" pasteManager />
```

## Vue equivalents

Every recipe above is identical in Vue — same options, kebab-cased in templates:

```vue
<script setup lang="ts">
import { PlumeEditor } from '@useplume/vue'
import { createUploadHandler } from '@useplume/core'
import '@useplume/core/styles.css'
</script>

<template>
  <PlumeEditor
    content="<p>Hello 🪶</p>"
    placeholder="Tell your story…"
    :toolbar="['bold', 'italic', '|', 'link', 'image']"
    :image="{ uploadHandler: createUploadHandler({ url: '/api/upload' }) }"
    :on-update="(editor) => onChange(editor.getHTML())"
  />
</template>
```

Need more control in any of these? See [Editor instance & commands](/guide/editor-api).
