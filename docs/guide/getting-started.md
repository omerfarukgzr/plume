---
description: 'Install Plume’s React or Vue adapter, import the stylesheet, and render a fully featured tiptap-based rich text editor in a few lines.'
---

# Getting started

## Installation

Install the adapter for your framework. Each adapter pulls in `@useplume/core` and the
matching tiptap packages as dependencies.

::: code-group

```sh [React]
pnpm add @useplume/react
```

```sh [Vue]
pnpm add @useplume/vue
```

:::

## Quick start

Import the component and the stylesheet, then render it. The default extension set,
toolbar and theme work out of the box.

::: code-group

```tsx [React]
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export function App() {
  return <PlumeEditor content="<p>Hello Plume 🪶</p>" />
}
```

```vue [Vue]
<script setup lang="ts">
import { PlumeEditor } from '@useplume/vue'
import '@useplume/core/styles.css'
</script>

<template>
  <PlumeEditor content="<p>Hello Plume 🪶</p>" />
</template>
```

:::

## Reading and reacting to changes

Pass `onUpdate` to be notified after the document changes. It receives the underlying
tiptap `Editor`, so you can serialize with `editor.getHTML()` or `editor.getJSON()`.
The callback is debounced (300 ms by default) so serialization doesn't run on every
keystroke — pass `updateDelay={0}` to fire synchronously.

::: code-group

```tsx [React]
<PlumeEditor content="<p>Edit me</p>" onUpdate={(editor) => console.log(editor.getHTML())} />
```

```vue [Vue]
<PlumeEditor content="<p>Edit me</p>" :on-update="(editor) => console.log(editor.getHTML())" />
```

:::

## Accessing the editor instance

For full control, drive the editor with the hook/composable and render
`<EditorContent>` yourself.

::: code-group

```tsx [React]
import { usePlumeEditor, EditorContent, Toolbar } from '@useplume/react'
import '@useplume/core/styles.css'

export function MyEditor() {
  const editor = usePlumeEditor({ content: '<p>Hello</p>' })
  return (
    <div className="plume">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
```

```vue [Vue]
<script setup lang="ts">
import { usePlumeEditor, EditorContent, Toolbar } from '@useplume/vue'
import '@useplume/core/styles.css'

const editor = usePlumeEditor({ content: '<p>Hello</p>' })
</script>

<template>
  <div class="plume">
    <Toolbar :editor="editor" />
    <EditorContent :editor="editor" />
  </div>
</template>
```

:::

## Read-only mode

To display stored content without editing, pass `editable={false}` and hide the
toolbar. The same component renders both your editor and your published view.

```tsx
<PlumeEditor content={savedHtml} editable={false} toolbar={false} />
```

## Server-side rendering

The editor mounts on the client. The two adapters differ slightly:

- **React** — pass `immediatelyRender={false}` so the first paint doesn't run
  synchronously on the server, which would cause a hydration mismatch.

  ```tsx
  // Next.js App Router — mark the file 'use client'
  ;<PlumeEditor content="<p>…</p>" immediatelyRender={false} />
  ```

- **Vue / Nuxt** — the Vue adapter always creates the editor in `onMounted`, so
  `immediatelyRender` is ignored. Wrap the component in `<ClientOnly>` (Nuxt) so
  it isn't rendered during SSR.

See the [SSR recipes](/examples#ssr-next-js-app-router) for full snippets.

## Which API should I use?

| Need                                      | Use                                                              |
| ----------------------------------------- | ---------------------------------------------------------------- |
| A drop-in editor with toolbar + theme     | `<PlumeEditor>`                                                  |
| Custom layout, your own toolbar placement | `usePlumeEditor` + `<EditorContent>` + `<Toolbar>`               |
| Read/serialize content, run commands      | the `Editor` from the hook — see [Editor API](/guide/editor-api) |

Next: [customize the toolbar, fonts and extensions](/guide/customization), or
browse [Examples & recipes](/examples).
