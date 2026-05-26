---
description: 'Full reference for PlumeOptions — every prop accepted by Plume’s React and Vue editors, covering content, behaviour, toolbar, images and more.'
---

# PlumeOptions

Every adapter accepts the same options, exposed as props on `<PlumeEditor>` and as the
argument to `usePlumeEditor`. The type is exported from `@useplume/core` as `PlumeOptions`.

## Content & behaviour

| Option              | Type                                    | Default | Description                                                  |
| ------------------- | --------------------------------------- | ------- | ------------------------------------------------------------ |
| `content`           | `string \| object \| null`              | `''`    | Initial content as an HTML string or a tiptap JSON document. |
| `editable`          | `boolean`                               | `true`  | Whether the document can be edited.                          |
| `placeholder`       | `string`                                | —       | Placeholder shown while the document is empty.               |
| `autofocus`         | `boolean \| 'start' \| 'end' \| number` | `false` | Autofocus behaviour on mount.                                |
| `editorClass`       | `string`                                | —       | Extra class name(s) added to the editable content element.   |
| `immediatelyRender` | `boolean`                               | `true`  | Render synchronously on first paint. Set `false` for SSR.    |

## Toolbar

| Option         | Type                                  | Default     | Description                                                     |
| -------------- | ------------------------------------- | ----------- | --------------------------------------------------------------- |
| `toolbar`      | `ToolbarConfig` (`string[] \| false`) | default set | Ordered list of item names, or `false` to hide the toolbar.     |
| `toolbarItems` | `ToolbarItem[]`                       | —           | Custom controls / overrides, referenced by `name` in `toolbar`. |

See [Toolbar items](/api/toolbar) for the built-in names.

## Extensions

| Option              | Type         | Default | Description                                           |
| ------------------- | ------------ | ------- | ----------------------------------------------------- |
| `extensions`        | `Extensions` | `[]`    | Additional tiptap extensions appended after defaults. |
| `defaultExtensions` | `boolean`    | `true`  | Include Plume's default extension set.                |

## Features

| Option           | Type                                        | Default | Description                                                    |
| ---------------- | ------------------------------------------- | ------- | -------------------------------------------------------------- |
| `fonts`          | `FontOption[]`                              | —       | Fonts offered by the font-family dropdown.                     |
| `colors`         | `string[]`                                  | —       | Hex colors offered by the text-color dropdown.                 |
| `locale`         | `string`                                    | `'tr'`  | BCP-47 locale for UI strings and case features.                |
| `autoCapitalize` | `boolean \| { locale?: string }`            | `false` | Enable automatic sentence capitalization.                      |
| `image`          | `boolean \| Partial<ResizableImageOptions>` | enabled | Configure the resizable image node, or `false` to omit it.     |
| `footnote`       | `boolean \| FootnoteExtensionOptions`       | enabled | Configure footnotes, or `false` to omit them.                  |
| `blockquotes`    | `CustomBlockquoteSpec[]`                    | —       | Custom blockquote variants (callouts).                         |
| `pasteManager`   | `boolean`                                   | `false` | Ask how to paste (plain text vs. keep formatting) via a modal. |

### Paste manager

With `pasteManager` enabled, Plume intercepts every paste (`Ctrl`/`Cmd`+`V`,
the context menu, …) and opens a modal asking how to insert the clipboard:

- **Plain text** — strips all formatting and pastes the text only.
- **Keep formatting** — preserves the source HTML (bold, links, lists …),
  parsed through the editor's own schema so only marks Plume understands survive.

The modal closes on <kbd>Esc</kbd>, on a backdrop click, or after a choice. The
React and Vue `<PlumeEditor>` render it automatically; its labels follow `locale`.

```tsx
<PlumeEditor content="<p></p>" pasteManager />
```

For full control over paste without the modal, add the `PasteManager` extension
yourself and pass an `onPaste` handler — return `true` to take over the paste,
`false` to let tiptap proceed. Insert captured content with the shared
`insertPaste(editor, data, mode)` helper. Both are exported from `@useplume/core`.

## Change handling

| Option        | Type                       | Default | Description                                                             |
| ------------- | -------------------------- | ------- | ----------------------------------------------------------------------- |
| `onUpdate`    | `(editor: Editor) => void` | —       | Called after the document changes (debounced by `updateDelay`).         |
| `updateDelay` | `number`                   | `300`   | Debounce in ms for `onUpdate`. `0` fires synchronously on every change. |

::: tip
`onUpdate` receives the underlying tiptap `Editor`, so serialize with
`editor.getHTML()` or `editor.getJSON()`. The debounce matters because that
serialization is the dominant per-edit cost on large documents.
:::

## Adapter props

These props live on `<PlumeEditor>` itself (not in `PlumeOptions`), so they're
available only on the component, not via `usePlumeEditor`.

| Prop        | Adapter | Type               | Default  | Description                                                                                                          |
| ----------- | ------- | ------------------ | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `fluid`     | both    | `boolean`          | `false`  | Force edge-to-edge content (drops any `--plume-content-max-width`). Content is edge-to-edge by default, so this only matters when an ancestor sets a reading column. See [theming](/guide/theming#content-width-padding). |
| `className` | React   | `string`           | —        | Extra class name(s) on the editor root (`.plume`) element.                                                           |
| `output`    | Vue     | `'html' \| 'json'` | `'html'` | Value format emitted by `v-model:content` / `update:content`.                                                        |

### `v-model:content` (Vue)

The Vue adapter supports two-way binding. The bound value is HTML by default, or
the tiptap JSON document with `output="json"`. Updates are debounced by
`updateDelay`. The `content` prop is reactive on its own too, which covers
async/late-loaded data.

```vue
<PlumeEditor v-model:content="html" />
<PlumeEditor v-model:content="doc" output="json" />
```

## A fully configured editor

Every option is independent and optional — this shows them together so you can
see how far the config reaches in one place.

```tsx
import { PlumeEditor } from '@useplume/react'
import { createUploadHandler } from '@useplume/core'
;<PlumeEditor
  // content & behaviour
  content="<p>Start here…</p>"
  editable
  placeholder="Write something…"
  autofocus="end"
  editorClass="my-prose"
  immediatelyRender={false}
  // toolbar
  toolbar={['bold', 'italic', '|', 'note', 'image', 'footnote', 'changeCase']}
  toolbarItems={[
    {
      name: 'note', // also a custom blockquote below — could be a button instead
      type: 'button',
      title: 'Clear formatting',
      run: (e) => e.chain().focus().unsetAllMarks().run(),
    },
  ]}
  // features
  locale="en"
  autoCapitalize={{ locale: 'en' }}
  fonts={[
    { label: 'Default', value: null },
    { label: 'Inter', value: 'Inter', src: '/fonts/Inter.woff2' },
  ]}
  colors={['#111827', '#dc2626', '#2563eb']}
  image={{ uploadHandler: createUploadHandler({ url: '/api/upload' }), maxSize: 5_000_000 }}
  footnote={{ label: 'Notes' }}
  blockquotes={[{ name: 'note', label: 'Note', color: '#2563eb' }]}
  pasteManager
  // extensions
  extensions={[]}
  defaultExtensions
  // change handling
  onUpdate={(editor) => console.log(editor.getHTML())}
  updateDelay={500}
/>
```

See [Examples & recipes](/examples) for task-focused, copy-paste versions.
