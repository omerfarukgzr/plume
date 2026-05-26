# @useplume/react

React adapter for **Plume** — a customizable rich text editor built on [tiptap](https://tiptap.dev).

## Install

Plume builds on **tiptap v3** — install the `@tiptap/core` and `@tiptap/pm` peers explicitly at `^3`:

```bash
npm install @useplume/react @useplume/core @tiptap/core@^3 @tiptap/pm@^3
# or: pnpm add @useplume/react @useplume/core @tiptap/core@^3 @tiptap/pm@^3
```

`react`, `react-dom`, `@useplume/core`, `@tiptap/core` and `@tiptap/pm` are peer dependencies, so install them alongside.

> **Already on tiptap v2 elsewhere?** Plume needs v3. Either migrate, or isolate Plume on v3 — see [Already using tiptap v2?](https://github.com/omerfarukgzr/plume/blob/main/docs/guide/getting-started.md#already-using-tiptap-v2).

## Usage

```tsx
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export function App() {
  return (
    <PlumeEditor
      content="<p>Hello Plume 🪶</p>"
      onUpdate={(editor) => console.log(editor.getHTML())}
    />
  )
}
```

Need lower-level control? Use the `usePlumeEditor` hook together with `Toolbar`, `ToolbarButton`, `ToolbarDropdown`, and `ToolbarLink`.

## License

MIT © Ömer Faruk Gezer
