# Getting started

## Installation

Install the adapter for your framework. Each adapter pulls in `@plume/core` and the
matching tiptap packages as dependencies.

::: code-group

```sh [React]
pnpm add @plume/react
```

```sh [Vue]
pnpm add @plume/vue
```

:::

## Quick start

Import the component and the stylesheet, then render it. The default extension set,
toolbar and theme work out of the box.

::: code-group

```tsx [React]
import { PlumeEditor } from '@plume/react'
import '@plume/core/styles.css'

export function App() {
  return <PlumeEditor content="<p>Hello Plume 🪶</p>" />
}
```

```vue [Vue]
<script setup lang="ts">
import { PlumeEditor } from '@plume/vue'
import '@plume/core/styles.css'
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
<PlumeEditor
  content="<p>Edit me</p>"
  onUpdate={(editor) => console.log(editor.getHTML())}
/>
```

```vue [Vue]
<PlumeEditor
  content="<p>Edit me</p>"
  :on-update="(editor) => console.log(editor.getHTML())"
/>
```

:::

## Accessing the editor instance

For full control, drive the editor with the hook/composable and render
`<EditorContent>` yourself.

::: code-group

```tsx [React]
import { usePlumeEditor, EditorContent, Toolbar } from '@plume/react'
import '@plume/core/styles.css'

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
import { usePlumeEditor, EditorContent, Toolbar } from '@plume/vue'
import '@plume/core/styles.css'

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

Next: [customize the toolbar, fonts and extensions](/guide/customization).
