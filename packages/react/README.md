# @useplume/react

React adapter for **Plume** — a customizable rich text editor built on [tiptap](https://tiptap.dev).

## Install

```bash
npm install @useplume/react @useplume/core
# or: pnpm add @useplume/react @useplume/core
```

`react`, `react-dom`, and `@useplume/core` are peer dependencies, so install them alongside.

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
