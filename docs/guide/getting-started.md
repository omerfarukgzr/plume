---
description: 'Install Plume’s React or Vue adapter, import the stylesheet, and render a fully featured tiptap-based rich text editor in a few lines.'
---

# Getting started

## Installation

Install the adapter for your framework along with `@useplume/core`.

**React:**

::: code-group

```sh [npm]
npm install @useplume/react @useplume/core
```

```sh [pnpm]
pnpm add @useplume/react @useplume/core
```

```sh [yarn]
yarn add @useplume/react @useplume/core
```

:::

**Vue 3:**

::: code-group

```sh [npm]
npm install @useplume/vue @useplume/core
```

```sh [pnpm]
pnpm add @useplume/vue @useplume/core
```

```sh [yarn]
yarn add @useplume/vue @useplume/core
```

:::

### tiptap is a peer dependency

Plume builds on **tiptap v3**. `@tiptap/core` and `@tiptap/pm` are declared as
`peerDependencies`, so your app and Plume always share a **single** tiptap
instance — no duplicate copies, no bundle bloat. Most package managers (npm 7+,
pnpm, yarn) install peers automatically; if yours doesn't, add them explicitly:

```sh
npm install @tiptap/core @tiptap/pm
```

::: warning tiptap v2 conflict
Plume requires tiptap **v3** and cannot coexist with tiptap **v2** in the same
app — a mixed v2/v3 dependency tree breaks at runtime. If your project already
uses tiptap, make sure it's on v3 before adding Plume.
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

### Two-way binding with `v-model` (Vue)

The Vue adapter supports `v-model:content`, so you can bind the document to a
ref. By default the bound value is HTML; pass `output="json"` to get the tiptap
JSON document instead. Emissions are debounced by `updateDelay` (300 ms), like
`onUpdate`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PlumeEditor } from '@useplume/vue'
import '@useplume/core/styles.css'

const html = ref('<p>Edit me</p>')
</script>

<template>
  <PlumeEditor v-model:content="html" />
  <!-- JSON instead of HTML: -->
  <!-- <PlumeEditor v-model:content="doc" output="json" /> -->
</template>
```

The `content` prop is reactive, so this also covers **async data** — render the
editor immediately and assign `content` (or the `v-model` ref) once your data
arrives; the document updates in place without remounting. Re-assigning the same
value the user just typed is a no-op, so the cursor isn't disturbed.

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
