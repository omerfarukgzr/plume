---
description: 'Drive the Plume editor programmatically: reach the tiptap Editor instance, read and serialize content, run commands, toggle read-only, and use Plume’s link/image/paste helpers.'
---

# Editor instance & commands

`<PlumeEditor>` covers most apps, but when you need to read content, run commands
from your own buttons, or build a fully custom layout, reach the underlying
tiptap `Editor`.

## Getting the instance

Use the hook/composable and render the pieces yourself:

::: code-group

```tsx [React]
import { usePlumeEditor, EditorContent, Toolbar } from '@useplume/react'
import '@useplume/core/styles.css'

export function MyEditor() {
  const editor = usePlumeEditor({ content: '<p>Hello</p>' })
  // `editor` is null until ready; guard before using it.
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

// A Ref<Editor | undefined> — undefined until mounted.
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

::: tip React vs Vue
In React the hook returns `Editor | null` and re-renders for you. In Vue it
returns `Ref<Editor | undefined>` — read `editor.value`. Either way it's the same
tiptap `Editor`, so every command and getter below is identical.
:::

## Reading content

```ts
editor.getHTML() // '<p>Hello</p>'  — string, ready to store/render
editor.getJSON() // ProseMirror document — round-trips losslessly
editor.getText() // plain text only
editor.isEmpty // true when the document has no content
```

Both `getHTML()` and `getJSON()` are valid `content` values, so you can store
either and pass it straight back in.

## Reacting to changes

Prefer the `onUpdate` option over polling — it's debounced (300 ms default) so
serialization doesn't run on every keystroke:

```tsx
<PlumeEditor
  onUpdate={(editor) => save(editor.getHTML())}
  updateDelay={500} // or 0 to fire synchronously
/>
```

`onUpdate` receives the `Editor`, so serialize with whichever format you store.
On large documents that serialization is the dominant per-edit cost — keep the
debounce unless you truly need every change.

## Running commands

tiptap commands are chainable. `focus()` first so the editor keeps the selection,
and `run()` to execute:

```ts
editor.chain().focus().toggleBold().run()
editor.chain().focus().toggleHeading({ level: 2 }).run()
editor.chain().focus().setTextAlign('center').run()
editor.chain().focus().unsetAllMarks().clearNodes().run() // clear formatting
```

Plume's own commands work the same way:

```ts
editor.chain().focus().setImage({ src: '/cat.png', align: 'center' }).run()
editor.chain().focus().setChangeCase('upper').run()
editor.chain().focus().toggleCustomBlockquote('note').run()
```

### Reading editor state

```ts
editor.isActive('bold') // is the selection bold?
editor.isActive('heading', { level: 2 }) // is it an h2?
editor.can().toggleBold() // would the command run right now?
```

This is exactly what the toolbar uses to light up active buttons and disable
unavailable ones.

## Read-only / view mode

Toggle `editable` to switch between editing and a clean read-only view (no
toolbar needed):

```tsx
<PlumeEditor content={html} editable={false} toolbar={false} />
```

Or imperatively on a live instance:

```ts
editor.setEditable(false)
```

In Vue, the `<PlumeEditor>` watches `:editable` and forwards changes to the live
editor automatically.

## Plume helpers

`@useplume/core` exports the helpers the toolbar uses, so a custom UI doesn't have
to reverse-engineer them.

### Links

```ts
import { applyLink, getLinkState, removeLink, normalizeLinkHref } from '@useplume/core'

getLinkState(editor) // { isActive, href, ... } for the current selection
applyLink(editor, 'example.com') // normalizes to https://example.com
applyLink(editor, 'https://x.com', 'visible text') // also inserts the text
removeLink(editor)
normalizeLinkHref('example.com') // 'https://example.com'
```

### Images

```ts
import { insertImageFromFile, collectImageAssetIds } from '@useplume/core'

insertImageFromFile(editor, file) // run a File through the upload pipeline
collectImageAssetIds(editor) // ['9f1c…'] — uploads still referenced; for cleanup
```

`collectImageAssetIds` is the basis of orphaned-upload reconciliation — see
[Images & uploads](/guide/images#cleaning-up-orphaned-uploads).

### Paste

```ts
import { insertPaste } from '@useplume/core'

insertPaste(editor, { html, text }, 'styled') // or 'plainText'
```

## Custom toolbar buttons that run commands

Register a control via `toolbarItems` and reference it by `name`. The `run`
callback receives the `Editor`; `isActive` / `isDisabled` drive its visual state:

```tsx
<PlumeEditor
  toolbar={['bold', 'clearFormat']}
  toolbarItems={[
    {
      name: 'clearFormat',
      type: 'button',
      title: 'Clear formatting',
      icon: '<path d="…"/>', // inner SVG markup
      run: (editor) => editor.chain().focus().unsetAllMarks().clearNodes().run(),
      isActive: () => false,
      isDisabled: (editor) => editor.isEmpty,
    },
  ]}
/>
```

See [Toolbar items](/api/toolbar) for the `ToolbarItem` shape and the
`resolveToolbarItems` helper if you render the toolbar entirely yourself.

## Cleanup

The React hook and Vue composable destroy the editor on unmount for you. If you
ever construct a tiptap `Editor` directly, call `editor.destroy()` when you're
done.
