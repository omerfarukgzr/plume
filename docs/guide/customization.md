---
description: 'Customize the Plume editor through props: configure the toolbar, register custom toolbar items, and pass your own tiptap extensions.'
---

# Customization

All customization is driven by props on `<PlumeEditor>` (or the options object passed
to `usePlumeEditor`). The same options exist in both adapters — see
[PlumeOptions](/api/options) for the full list.

## Toolbar

Pass an ordered list of item names to choose which controls appear and in what order.
Use `'|'` to insert a separator, or `false` to hide the toolbar entirely.

```tsx
<PlumeEditor toolbar={['bold', 'italic', '|', 'heading1', 'bulletList', 'link']} />

<PlumeEditor toolbar={false} /> // no toolbar
```

See [Toolbar items](/api/toolbar) for every built-in name.

### Custom toolbar controls

Register your own buttons (or override a built-in of the same name) via
`toolbarItems`, then reference them by name in `toolbar`:

```tsx
<PlumeEditor
  toolbar={['bold', 'clearFormat']}
  toolbarItems={[
    {
      name: 'clearFormat',
      type: 'button',
      title: 'Clear formatting',
      run: (editor) => editor.chain().focus().unsetAllMarks().run(),
    },
  ]}
/>
```

## Fonts

Populate the font dropdown with `fonts`. Each entry is `{ label, value }` where
`value` is a CSS `font-family` (or `null` for the default). To load a custom font
file, add `src` — a URL/path string or a `File`/`Blob` — and Plume injects the
`@font-face` for you.

```tsx
<PlumeEditor
  toolbar={['fontFamily']}
  fonts={[
    { label: 'Default', value: null },
    { label: 'Inter', value: 'Inter', src: '/fonts/Inter.woff2' },
    { label: 'My upload', value: 'Custom', src: uploadedFile },
  ]}
/>
```

When `src` is set, the first family in `value` must match the name the font registers
under (e.g. `value: 'Inter'` with `src: '/fonts/Inter.woff2'`).

## Colors

Provide the swatches for the `textColor` dropdown with `colors` (an array of hex
strings):

```tsx
<PlumeEditor toolbar={['textColor']} colors={['#111827', '#dc2626', '#2563eb']} />
```

## Extensions

Append your own tiptap nodes, marks or extensions. They run after Plume's defaults.

```tsx
import { Mention } from '@tiptap/extension-mention'
;<PlumeEditor extensions={[Mention]} />
```

To start from a blank slate, turn off the defaults with `defaultExtensions={false}`
and supply your own set.

```tsx
<PlumeEditor
  defaultExtensions={false}
  extensions={
    [
      /* your extensions */
    ]
  }
/>
```

Plume also re-exports its own extensions from `@useplume/core` so you can compose them
selectively: `ResizableImage`, `ChangeCase`, `AutoCapitalize`, `CustomBlockquote`,
footnote extensions, and more.

## Custom blockquotes (callouts)

Define styled blockquote variants — e.g. a quote or citation callout — with
`blockquotes`. Each spec becomes a `<blockquote>` node and a matching toolbar button;
reference the variant's `name` in the toolbar layout.

```tsx
<PlumeEditor
  toolbar={['blockquote', 'note', 'warning']}
  blockquotes={[
    { name: 'note', label: 'Note', color: '#2563eb' },
    { name: 'warning', label: 'Warning', color: '#d97706' },
  ]}
/>
```

## Paste manager

Let users choose how pasted content lands. With `pasteManager`, every paste opens a
modal offering **plain text** (formatting stripped) or **keep formatting** (the source
HTML, parsed through the editor's schema). It's off by default.

```tsx
<PlumeEditor content="<p></p>" pasteManager />
```

The modal closes on <kbd>Esc</kbd>, a backdrop click, or after a choice, and its labels
follow `locale`. See [`pasteManager`](/api/options#paste-manager) for handling paste
yourself via the `PasteManager` extension and `insertPaste` helper.

## Locale

Plume ships Turkish (`tr`, default) and English (`en`) UI strings, and case features
(`changeCase`, `autoCapitalize`) are locale-aware. Set the locale with `locale`:

```tsx
<PlumeEditor locale="en" />
```

## Related

- [Extensions](/guide/extensions) — Plume's own extensions and adding your own.
- [Editor instance & commands](/guide/editor-api) — drive the editor in code.
- [Examples & recipes](/examples) — full copy-paste setups.
