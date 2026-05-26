---
description: 'Install Plume’s React or Vue adapter, import the stylesheet, and render a fully featured tiptap-based rich text editor in a few lines.'
---

# Getting started

## Installation

Install the adapter for your framework, `@useplume/core`, and the two tiptap
peers. Plume builds on **tiptap v3**: `@tiptap/core` and `@tiptap/pm` are
declared as `peerDependencies` so your app and Plume share a **single** tiptap
instance — no duplicate copies, no bundle bloat. **Install them yourself** at
`^3` rather than relying on your package manager's auto-install-peers behavior.

**React:**

::: code-group

```sh [npm]
npm install @useplume/react @useplume/core @tiptap/core@^3 @tiptap/pm@^3
```

```sh [pnpm]
pnpm add @useplume/react @useplume/core @tiptap/core@^3 @tiptap/pm@^3
```

```sh [yarn]
yarn add @useplume/react @useplume/core @tiptap/core@^3 @tiptap/pm@^3
```

:::

**Vue 3:**

::: code-group

```sh [npm]
npm install @useplume/vue @useplume/core @tiptap/core@^3 @tiptap/pm@^3
```

```sh [pnpm]
pnpm add @useplume/vue @useplume/core @tiptap/core@^3 @tiptap/pm@^3
```

```sh [yarn]
yarn add @useplume/vue @useplume/core @tiptap/core@^3 @tiptap/pm@^3
```

:::

::: tip Why install the peers yourself?
Most package managers (npm 7+, pnpm, yarn) _can_ install peers automatically, but
the behavior is configurable and easy to disable. Adding `@tiptap/core@^3` and
`@tiptap/pm@^3` to your own `dependencies` makes the requirement explicit and the
resolution deterministic.
:::

### Already using tiptap v2?

Plume requires tiptap **v3**. The cases:

- **You're on tiptap v3, or don't use tiptap yet** → the install above is all you
  need. Nothing more to do.
- **You're still on tiptap v2 elsewhere in the app** → this is the hard part, and
  it isn't specific to Plume: no package manager can cleanly run two majors of the
  same package in one import graph. `peerDependencies` can't fix it either — Plume
  asks for v3, your app provides v2. You have two options.

**Option A — migrate to tiptap v3 (recommended).** Bump your own
`@tiptap/*` packages to v3 and follow tiptap's
[v2 → v3 migration guide](https://tiptap.dev/docs/resources/upgrade-tiptap-v2-to-v3).
Then everything shares one v3 instance and the plain install just works.

**Option B — isolate Plume on v3 (pnpm).** If you can't migrate yet, pin the
tiptap v3 family for the Plume subtree with a `.pnpmfile.cjs` at your repo root,
and turn off peer de-duplication so pnpm doesn't drag Plume's deps back onto your
app's v2:

```js
// .pnpmfile.cjs
// Keep @useplume/* (and the tiptap packages they pull in) on tiptap v3, even
// though the rest of the app is still on tiptap v2.
const V3 = '^3'
const TIPTAP_V3 = new Set([
  '@tiptap/core',
  '@tiptap/pm',
  '@tiptap/extensions',
  '@tiptap/extension-list',
  '@tiptap/extension-list-item',
])

function readPackage(pkg) {
  if (pkg.name?.startsWith('@useplume/')) {
    for (const field of ['dependencies', 'peerDependencies']) {
      for (const dep of Object.keys(pkg[field] ?? {})) {
        if (TIPTAP_V3.has(dep)) pkg[field][dep] = V3
      }
    }
  }
  return pkg
}

module.exports = { hooks: { readPackage } }
```

```ini
# .npmrc
auto-install-peers=true
dedupe-peer-dependents=false
```

Then reinstall (`pnpm install`). This keeps Plume on its own v3 copy of tiptap
while your existing v2 code keeps working. It's a workaround for living with two
majors at once — migrating to v3 (Option A) is still the clean end state.

## Quick start

Import the component and the stylesheet, then render it. The default extension set,
toolbar and theme work out of the box.

::: code-group

```tsx [React]
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export function App() {
  return <PlumeEditor content="<p>Hello Plume 🪶</p>" />
}
```

```vue [Vue]
<script setup lang="ts">
import { PlumeEditor } from '@useplume/vue'
import '@useplume/core/styles.css'
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
<PlumeEditor content="<p>Edit me</p>" onUpdate={(editor) => console.log(editor.getHTML())} />
```

```vue [Vue]
<PlumeEditor content="<p>Edit me</p>" :on-update="(editor) => console.log(editor.getHTML())" />
```

:::

### Two-way binding with `v-model` (Vue)

The Vue adapter supports `v-model:content`, so you can bind the document to a
ref. By default the bound value is HTML; pass `output="json"` to get the tiptap
JSON document instead. Emissions are debounced by `updateDelay` (300 ms), like
`onUpdate`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PlumeEditor } from '@useplume/vue'
import '@useplume/core/styles.css'

const html = ref('<p>Edit me</p>')
</script>

<template>
  <PlumeEditor v-model:content="html" />
  <!-- JSON instead of HTML: -->
  <!-- <PlumeEditor v-model:content="doc" output="json" /> -->
</template>
```

The `content` prop is reactive, so this also covers **async data** — render the
editor immediately and assign `content` (or the `v-model` ref) once your data
arrives; the document updates in place without remounting. Re-assigning the same
value the user just typed is a no-op, so the cursor isn't disturbed.

## Accessing the editor instance

For full control, drive the editor with the hook/composable and render
`<EditorContent>` yourself.

::: code-group

```tsx [React]
import { usePlumeEditor, EditorContent, Toolbar } from '@useplume/react'
import '@useplume/core/styles.css'

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
import { usePlumeEditor, EditorContent, Toolbar } from '@useplume/vue'
import '@useplume/core/styles.css'

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

## Read-only mode

To display stored content without editing, pass `editable={false}` and hide the
toolbar. The same component renders both your editor and your published view.

```tsx
<PlumeEditor content={savedHtml} editable={false} toolbar={false} />
```

## Server-side rendering

The editor mounts on the client. The two adapters differ slightly:

- **React** — pass `immediatelyRender={false}` so the first paint doesn't run
  synchronously on the server, which would cause a hydration mismatch.

  ```tsx
  // Next.js App Router — mark the file 'use client'
  ;<PlumeEditor content="<p>…</p>" immediatelyRender={false} />
  ```

- **Vue / Nuxt** — the Vue adapter always creates the editor in `onMounted`, so
  `immediatelyRender` is ignored. Wrap the component in `<ClientOnly>` (Nuxt) so
  it isn't rendered during SSR.

See the [SSR recipes](/examples#ssr-next-js-app-router) for full snippets.

## Which API should I use?

| Need                                      | Use                                                              |
| ----------------------------------------- | ---------------------------------------------------------------- |
| A drop-in editor with toolbar + theme     | `<PlumeEditor>`                                                  |
| Custom layout, your own toolbar placement | `usePlumeEditor` + `<EditorContent>` + `<Toolbar>`               |
| Read/serialize content, run commands      | the `Editor` from the hook — see [Editor API](/guide/editor-api) |

Next: [customize the toolbar, fonts and extensions](/guide/customization), or
browse [Examples & recipes](/examples).
