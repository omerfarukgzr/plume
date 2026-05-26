# @useplume/core

Framework-agnostic core for **Plume** — a customizable, framework-agnostic rich text editor built on [tiptap](https://tiptap.dev).

This package contains the editor extensions, options, i18n, toolbar logic, and styles shared across all framework adapters. If you use React or Vue, install the matching adapter (`@useplume/react` / `@useplume/vue`) instead — they re-export what you need from here.

## Install

```bash
npm install @useplume/core
# or: pnpm add @useplume/core
```

## Usage

```ts
import { Editor } from '@tiptap/core'
import { resolveEditorOptions } from '@useplume/core'
import '@useplume/core/styles.css'

const editor = new Editor(
  resolveEditorOptions({
    element: document.querySelector('#editor')!,
    content: '<p>Hello Plume 🪶</p>',
  }),
)
```

## What's inside

- `resolveEditorOptions` / `PlumeEditorOptions` — ready-to-use tiptap options
- `defaultExtensions` — the default extension set
- Extensions: `AutoCapitalize`, `ChangeCase`, `ResizableImage`, footnotes, custom blockquote
- Image upload helpers (`createUploadHandler`, `validateImageFile`, …)
- i18n (`messages`, `resolveLocale`) and toolbar icons/link helpers

## License

MIT © Ömer Faruk Gezer
