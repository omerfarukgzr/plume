---
layout: home
description: 'Plume is a customizable, framework-agnostic rich text editor built on tiptap. One core, thin React and Vue adapters; Svelte, Solid and vanilla without rewriting the editor.'

hero:
  name: Plume
  text: One editor core, every framework.
  tagline: A customizable, framework-agnostic rich text editor built on tiptap. React and Vue today — Svelte, Solid and vanilla without rewriting the editor.
  image:
    light: /logo.svg
    dark: /logo-dark.svg
    alt: Plume
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Live demo
      link: /demo
    - theme: alt
      text: What is Plume?
      link: /guide/
---

## What is Plume?

Plume is a customizable rich text editor built on [tiptap](https://tiptap.dev).
All editor logic — extensions, toolbar, image pipeline, theme — lives in one
framework-agnostic core (`@useplume/core`), with thin adapters per framework.
Today: **React** and **Vue 3**.

## Quick start

Install the adapter for your framework plus the core (npm, pnpm or yarn):

```sh
npm install @useplume/react @useplume/core   # React
npm install @useplume/vue @useplume/core     # Vue 3
```

Then render the editor — toolbar, theme and default extensions work out of the box:

```tsx
// React
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export function App() {
  return <PlumeEditor content="<p>Hello Plume 🪶</p>" />
}
```

```vue
<!-- Vue 3 -->
<script setup lang="ts">
import { ref } from 'vue'
import { PlumeEditor } from '@useplume/vue'
import '@useplume/core/styles.css'

const html = ref('<p>Hello Plume 🪶</p>')
</script>

<template>
  <PlumeEditor v-model:content="html" />
</template>
```

> Plume requires **tiptap v3**. `@tiptap/core` and `@tiptap/pm` are peer
> dependencies, so your app and Plume share a single tiptap instance.

## Highlights

- **Batteries included** — toolbar, theming, resizable images with upload,
  custom fonts, footnotes, paste manager and i18n (Turkish & English built in).
- **Drop-in or composable** — use `<PlumeEditor>` for a ready editor, or
  `usePlumeEditor()` + `<EditorContent>` for full control over layout.
- **Themeable** — every value is a `--plume-*` CSS variable; ships a dark theme,
  or go fully unstyled.
- **Vue-native** — `v-model:content` (HTML or JSON) and reactive content for
  async data.
- **Edge-to-edge by default** — content fills its container with tight padding;
  opt into a centered reading column (or any padding) with one CSS variable.

Read the [getting-started guide](/guide/getting-started) or browse
[examples & recipes](/examples).
