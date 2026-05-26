# @useplume/vue

Vue 3 adapter for **Plume** — a customizable rich text editor built on [tiptap](https://tiptap.dev).

## Install

```bash
npm install @useplume/vue @useplume/core
# or: pnpm add @useplume/vue @useplume/core
```

`vue` and `@useplume/core` are peer dependencies, so install them alongside.

## Usage

```vue
<script setup lang="ts">
import { PlumeEditor } from '@useplume/vue'
import '@useplume/core/styles.css'
</script>

<template>
  <PlumeEditor content="<p>Hello Plume 🪶</p>" @update="(editor) => console.log(editor.getHTML())" />
</template>
```

Need lower-level control? Use the `usePlumeEditor` composable together with `Toolbar`, `ToolbarDropdown`, and `ToolbarLink`.

## License

MIT © Ömer Faruk Gezer
