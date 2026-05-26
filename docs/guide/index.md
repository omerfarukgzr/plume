---
description: 'Plume is a customizable, framework-agnostic rich text (WYSIWYG) editor built on tiptap and ProseMirror — one shared core with thin React and Vue adapters.'
---

# What is Plume?

Plume is a customizable, framework-agnostic rich text (WYSIWYG) editor built on
[tiptap](https://tiptap.dev) (which itself is built on ProseMirror). It keeps all
editor logic in one place — `@useplume/core` — and ships thin adapters for each UI
framework. Today: **React** and **Vue 3**. Tomorrow: Svelte, Solid, vanilla —
without rewriting the editor.

## Why not just use tiptap directly?

tiptap gives you the engine, but you still assemble everything around it: pick and
version-match a set of extensions, build a toolbar with active states, wire up image
upload, theming, fonts, and do it separately for each framework. Plume makes those
decisions for you and packages them behind a single component:

```tsx
<PlumeEditor toolbar={['bold', 'italic', '|', 'link']} />
```

- **Batteries included** — toolbar, icons, dropdowns, link/font menus, a resizable
  image pipeline, footnotes and a CSS-variable theme all ship in the box.
- **One API across frameworks** — the same `<PlumeEditor>` surface in React and Vue,
  so behaviour is written once in the core, not re-implemented per adapter.
- **Still fully tiptap** — append your own tiptap extensions and reach the underlying
  `Editor` instance whenever you need to.

## Packages

| Package           | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `@useplume/core`  | Framework-agnostic core: tiptap config, extensions, toolbar, CSS. |
| `@useplume/react` | React adapter — `<PlumeEditor />` + `usePlumeEditor()`.           |
| `@useplume/vue`   | Vue 3 adapter — `<PlumeEditor />` + `usePlumeEditor()`.           |

## Who does what

Plume touches a few different roles. The docs are organized so each can jump
straight to what they need:

| You are…              | You care about…                                               | Start here                                                                                                          |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **App developer**     | Embedding the editor, picking a toolbar, saving content       | [Getting started](/guide/getting-started) · [Customization](/guide/customization) · [Editor API](/guide/editor-api) |
| **Backend developer** | The upload endpoint, the server contract, cleaning up orphans | [Images & uploads](/guide/images)                                                                                   |
| **Content author**    | Writing in the editor: shortcuts, images, footnotes, callouts | [Editing](/guide/editing)                                                                                           |
| **Designer**          | Matching brand: colors, radius, fonts, dark mode, unstyled    | [Theming](/guide/theming)                                                                                           |

Prefer to learn by copying? Jump to [Examples & recipes](/examples).

Continue to [Getting started](/guide/getting-started) to install and render your
first editor.
