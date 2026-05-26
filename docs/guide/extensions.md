---
description: 'Plume’s default extension set and the extensions it ships — ChangeCase, AutoCapitalize, footnotes, custom blockquotes, the resizable image node and the paste manager — plus how to add your own tiptap extensions or build a set from scratch.'
---

# Extensions

Plume is tiptap underneath, so the editor is just a list of **extensions** (nodes,
marks and behaviours). Plume ships a curated default set and lets you add to it,
swap pieces out, or start from nothing.

## The default set

With `defaultExtensions` left on (the default), every editor includes:

| From                  | Extensions                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| tiptap **StarterKit** | Bold, Italic, Underline, Strike, Code, Heading (h1–h3), Bullet/Ordered list, ListItem, Blockquote, CodeBlock, HorizontalRule, HardBreak, **Link**, ListKeymap, undo/redo |
| Plume adds            | Highlight, Superscript, Subscript, TextAlign, Placeholder, TextStyle + FontFamily + Color, **ChangeCase**, **ResizableImage**, footnotes                                 |
| Opt-in                | **AutoCapitalize**, **PasteManager**, **custom blockquotes**                                                                                                             |

A few defaults are pre-configured: headings are limited to levels 1–3, and links
are `openOnClick: false` with `rel="noopener noreferrer nofollow"` and autolink on.

```ts
import { defaultExtensions } from '@useplume/core'

// The same array Plume builds internally — useful if you drive tiptap directly.
const extensions = defaultExtensions({ locale: 'en', placeholder: 'Write…' })
```

## Adding your own tiptap extension

Anything from the tiptap ecosystem (or your own) goes in `extensions`; it runs
**after** the defaults.

```tsx
import { Mention } from '@tiptap/extension-mention'
;<PlumeEditor
  extensions={[
    Mention.configure({
      /* … */
    }),
  ]}
/>
```

## Starting from scratch

Turn the defaults off to assemble a minimal editor yourself. Plume re-exports its
own extensions so you can pick just the ones you want.

```tsx
import StarterKit from '@tiptap/starter-kit'
import { ResizableImage, ChangeCase } from '@useplume/core'
;<PlumeEditor
  defaultExtensions={false}
  extensions={[StarterKit, ResizableImage, ChangeCase]}
  toolbar={['bold', 'italic', 'image', 'changeCase']}
/>
```

::: warning Footnotes need a custom document
Footnotes require a Document node that allows a trailing footnotes section. When
you build your own set and want footnotes, use `PlumeDocument` together with the
`footnoteExtensions()` helper instead of StarterKit's default Document.
:::

## Plume's own extensions

All of these are exported from `@useplume/core`, both as ready-made extensions
and through the `image` / `footnote` / `autoCapitalize` / `blockquotes` /
`pasteManager` options on `<PlumeEditor>`.

### ResizableImage

The resizable, alignable, captioned image node. Configure it through the `image`
option (see [Images & uploads](/guide/images)) or compose it directly:

```ts
import { ResizableImage, createUploadHandler } from '@useplume/core'

ResizableImage.configure({
  uploadHandler: createUploadHandler({ url: '/api/upload' }),
  accept: 'image/png,image/jpeg',
  maxSize: 5 * 1024 * 1024,
  minWidth: 80,
  bubbleMenu: true,
  onError: (e) => console.error(e),
})
```

It adds the `setImage`, `setImageAlign` and `setImageCaption` commands.

### ChangeCase

Adds `setChangeCase(type)` where `type` is one of `'sentence' | 'lower' | 'upper'
| 'capitalize' | 'toggle'`. It rewrites the **selected text** while preserving
inline marks (bold, links…), and is locale-aware — pass `locale: 'tr'` so the
Turkish dotted/dotless `i ↔ İ`, `ı ↔ I` map correctly. Surfaced as the
`changeCase` toolbar dropdown.

```ts
editor.chain().focus().setChangeCase('upper').run()
```

### AutoCapitalize

**Opt-in.** Capitalizes the first letter typed at the start of a block or right
after `.` `!` `?`. Pressing <kbd>Backspace</kbd> once undoes an individual
auto-capitalization. Enable via the option (it's not in the default set because
automatic edits can surprise users):

```tsx
<PlumeEditor autoCapitalize />
<PlumeEditor autoCapitalize={{ locale: 'tr' }} />
```

### Footnotes

Numbered footnotes with two-way navigation (marker ↔ note). Enabled by default;
configure the heading label and back-link behaviour:

```tsx
<PlumeEditor footnote={{ label: 'Notes', backref: true }} />
<PlumeEditor footnote={false} /> // disable entirely
```

`footnote.backref` (default `true`) makes each note's number a clickable link
back to its marker in the body. See [editing](/guide/editing#footnotes) for the
author-facing behaviour.

### Custom blockquotes (callouts)

Define styled blockquote variants. Each spec becomes a `<blockquote>` node plus a
matching toolbar button (referenced by `name`), and adds the
`toggleCustomBlockquote(name)` command.

```tsx
<PlumeEditor
  toolbar={['blockquote', 'note', 'warning']}
  blockquotes={[
    { name: 'note', label: 'Note', color: '#2563eb' },
    { name: 'warning', label: 'Warning', color: '#d97706' },
  ]}
/>
```

Each spec accepts `name`, `label`, and optionally `color` (accent border + tint),
`class` (defaults to `plume-quote-<name>`) and `icon` (inner SVG markup). Variants
never nest or mix with plain blockquotes.

### PasteManager

**Opt-in.** Intercepts paste and lets the user choose plain text vs. keeping
formatting, via a modal the React/Vue `<PlumeEditor>` renders automatically.

```tsx
<PlumeEditor pasteManager />
```

For full control without the modal, add the `PasteManager` extension yourself
with an `onPaste` handler and insert captured content with `insertPaste`:

```ts
import { PasteManager, insertPaste } from '@useplume/core'

PasteManager.configure({
  onPaste: (editor, data) => {
    insertPaste(editor, data, 'plainText') // or 'styled'
    return true // we handled it; return false to let tiptap proceed
  },
})
```

## Reference

The full list of extension-related options lives in
[PlumeOptions → Extensions / Features](/api/options#extensions). Every extension
above is also exported individually from `@useplume/core` for composing custom
sets.
