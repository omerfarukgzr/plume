<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/public/logo-dark.svg" />
    <img src="./docs/public/logo.svg" alt="Plume" width="96" height="96" />
  </picture>
</p>

<h1 align="center">Plume</h1>

<p align="center">Customizable, framework-agnostic rich text editor built on <a href="https://tiptap.dev">tiptap</a>.</p>

<p align="center">
  <a href="https://omerfarukgzr.github.io/plume/"><img src="https://img.shields.io/badge/docs-plume-6c5ce7.svg" alt="Documentation" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  <strong><a href="https://omerfarukgzr.github.io/plume/">Documentation</a></strong> ·
  <strong><a href="https://omerfarukgzr.github.io/plume/demo">Live demo</a></strong> ·
  <strong><a href="https://omerfarukgzr.github.io/plume/examples">Examples</a></strong>
</p>

Plume keeps all editor logic in one place (`@useplume/core`) and ships thin
adapters for each UI framework. Today: **React** and **Vue 3**. Tomorrow:
Svelte, Solid, vanilla — without rewriting the editor.

> 📚 **Full docs & an interactive, customizable editor** live at
> **[omerfarukgzr.github.io/plume](https://omerfarukgzr.github.io/plume/)** —
> try the [live demo](https://omerfarukgzr.github.io/plume/demo) to reshape the
> toolbar, theme and brand color in the browser.

## Packages

| Package           | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `@useplume/core`  | Framework-agnostic core: tiptap config, extensions, toolbar, CSS. |
| `@useplume/react` | React adapter — `<PlumeEditor />` + `usePlumeEditor()`.           |
| `@useplume/vue`   | Vue 3 adapter — `<PlumeEditor />` + `usePlumeEditor()`.           |

## Installation

Plume needs **tiptap v3** as a peer — `@tiptap/core` and `@tiptap/pm` are
`peerDependencies`, so your app and Plume always share a **single** tiptap
instance (no duplicate copies, no bundle bloat). **Install them explicitly**
(at `^3`) so you don't depend on your package manager's auto-install-peers
behavior:

**React:**

```sh
npm install @useplume/react @useplume/core @tiptap/core@^3 @tiptap/pm@^3   # npm
pnpm add @useplume/react @useplume/core @tiptap/core@^3 @tiptap/pm@^3       # pnpm
yarn add @useplume/react @useplume/core @tiptap/core@^3 @tiptap/pm@^3       # yarn
```

**Vue 3:**

```sh
npm install @useplume/vue @useplume/core @tiptap/core@^3 @tiptap/pm@^3   # npm
pnpm add @useplume/vue @useplume/core @tiptap/core@^3 @tiptap/pm@^3       # pnpm
yarn add @useplume/vue @useplume/core @tiptap/core@^3 @tiptap/pm@^3       # yarn
```

> [!IMPORTANT]
> Plume requires tiptap **v3**. If your project is on tiptap v3 (or doesn't use
> tiptap yet) the command above is all you need. If you're **still on tiptap v2**
> elsewhere in the app, see [Already using tiptap v2?](./docs/guide/getting-started.md#already-using-tiptap-v2)
> — that's a two-major coexistence problem (true of any package manager), and
> there's a `.pnpmfile.cjs` recipe to isolate Plume on v3.

## Quick start (React)

```tsx
import { PlumeEditor } from '@useplume/react'
import '@useplume/core/styles.css'

export function App() {
  return <PlumeEditor content="<p>Hello Plume 🪶</p>" />
}
```

## Quick start (Vue)

```vue
<script setup lang="ts">
import { PlumeEditor } from '@useplume/vue'
import '@useplume/core/styles.css'
</script>

<template>
  <PlumeEditor content="<p>Hello Plume 🪶</p>" />
</template>
```

## Customization

- **Toolbar** — pass an ordered list of items: `toolbar={['bold', 'italic', '|', 'link']}`, or `toolbar={false}` to hide it.
- **Fonts** — populate the font dropdown with `fonts={[...]}`. Each entry is `{ label, value }` where `value` is a CSS `font-family`. To load a custom font file, add `src` — a URL/path string or a `File`/`Blob`; Plume injects the `@font-face` for you:

  ```tsx
  <PlumeEditor
    fonts={[
      { label: 'Default', value: null },
      { label: 'Inter', value: 'Inter', src: '/fonts/Inter.woff2' },
      { label: 'My upload', value: 'Custom', src: uploadedFile },
    ]}
  />
  ```

- **Theme** — every value is a `--plume-*` CSS variable; set `data-theme="dark"` on any ancestor for dark mode, or skip the stylesheet entirely for an unstyled editor.
- **Extensions** — append your own tiptap extensions: `extensions={[MyExtension]}`, and toggle the defaults with `defaultExtensions={false}`.

## Images & uploads

Images are resizable (drag the corner handle), alignable, captioned and deletable. A selection bubble menu exposes align / caption / delete, and the caption is edited inline. The toolbar button, paste and drag-and-drop all run through the same pipeline (validation → optimistic placeholder → final URL).

By default — with no `uploadHandler` — picked, pasted and dropped images are embedded inline as **base64 data URLs**, so it works with zero configuration. That's convenient for demos and apps that store the HTML as-is, but it bloats the serialized document; for production, upload to your own server instead.

`createUploadHandler` is the standard implementation: it POSTs the file as `multipart/form-data` and reads the result from the JSON response.

```tsx
import { createUploadHandler } from '@useplume/core'
;<PlumeEditor
  image={{
    uploadHandler: createUploadHandler({
      url: '/api/upload',
      // fieldName: 'file',           // form field name (default 'file')
      // headers: { Authorization },  // extra request headers
      // maxSize: 5 * 1024 * 1024,    // reject larger files client-side
      // parseResponse: (json) => ({ src: json.url, width: json.width }),
    }),
    // accept, maxSize, labels (i18n), bubbleMenu and onError are configurable too.
  }}
/>
```

For full control (S3 presigned URLs, tRPC, …), pass any async `uploadHandler: (file: File) => Promise<{ src: string; width?: number; alt?: string }>`.

### Server contract

Whoever builds the backend only needs to satisfy this:

- **Request:** `POST <url>`, `Content-Type: multipart/form-data`, the file in the `file` field (configurable via `fieldName`), plus a client-generated id in the `assetId` field (see [cleanup](#cleaning-up-orphaned-uploads) below).
- **Response:** `200` with JSON `{ "src": "https://…", "width"?: number, "alt"?: string }`. You may echo back `{ "id": "…" }` to override the client id.
- **Error:** any non-2xx status; optionally `{ "error": "message" }` so the message surfaces in `onError`.

**Express** (with [`multer`](https://github.com/expressjs/multer)):

```js
import express from 'express'
import multer from 'multer'

const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } })
const app = express()

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  // Persist req.file wherever you like (disk, S3, …) and return its public URL.
  res.json({ src: `/uploads/${req.file.filename}` })
})

app.listen(3000)
```

**Go** (standard library):

```go
package main

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
)

func upload(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(5 << 20); err != nil { // 5 MiB
		writeErr(w, http.StatusBadRequest, "File too large")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeErr(w, http.StatusBadRequest, "No file uploaded")
		return
	}
	defer file.Close()

	name := filepath.Base(header.Filename)
	dst, err := os.Create(filepath.Join("uploads", name))
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not save file")
		return
	}
	defer dst.Close()
	if _, err := io.Copy(dst, file); err != nil {
		writeErr(w, http.StatusInternalServerError, "Could not save file")
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"src": "/uploads/" + name})
}

func writeErr(w http.ResponseWriter, code int, msg string) {
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func main() {
	http.HandleFunc("/api/upload", upload)
	http.ListenAndServe(":3000", nil)
}
```

### Cleaning up orphaned uploads

When an image is uploaded but then deleted from the document (or the document is never saved), the file is left orphaned on your server. Plume helps you reconcile this **at save time** rather than tracking deletes live (which breaks on undo, cut/paste, shared references and closed tabs).

Every server upload gets a client-generated id (`crypto.randomUUID()`). It's sent to your endpoint in the `assetId` form field, and written onto the saved HTML as `data-asset-id` on the `<figure>`:

```html
<figure data-type="plume-image" data-asset-id="9f1c…"><img src="https://cdn/9f1c….jpg" /></figure>
```

So your backend: **(1)** stores each file under its `assetId`, and **(2)** on save, parses the `data-asset-id` values out of the saved HTML and treats any stored-but-absent asset as an orphan to sweep (e.g. flag it and let a cron delete it). Because it only looks at the document's final state, undo/cut-paste/duplicate references all stay correct automatically.

Prefer not to parse HTML server-side? `collectImageAssetIds(editor)` returns the used ids directly (de-duplicated, id-less images skipped) so you can send them with your save request.

> Don't care about cleanup? Ignore the `assetId` — uploads work the same. Full walkthrough with edge-case table: **[docs › Images & uploads](./docs/guide/images.md#cleaning-up-orphaned-uploads)**.

## Development

This is a [pnpm](https://pnpm.io) + [Turborepo](https://turbo.build) monorepo.

```bash
pnpm install        # install everything
pnpm build          # build all packages (ESM + CJS + d.ts)
pnpm test           # run unit tests
pnpm typecheck      # type-check every package
pnpm lint           # lint
pnpm play:react     # run the React playground
pnpm play:vue       # run the Vue playground
```

### Releasing

Two ways to publish — both bump `@useplume/{core,react,vue}` together (they're a
changesets `fixed` group):

**1. Standard (CI).** Run `pnpm changeset` to record your change, commit, and push
to `main`. The Release workflow opens a "Version Packages" PR; merging it bumps
versions and publishes to npm with provenance via the `NPM_TOKEN` secret. Nothing
else to do.

**2. One command, locally (`pnpm ship`).** When you just want a change live —
or GitHub Actions is having a bad day — `pnpm ship` does the whole release
end-to-end: changeset → version bump → build → publish → commit → tag → push.

```bash
pnpm ship "Short summary of the change"        # patch bump (default)
pnpm ship "New v-model API" minor              # minor / major also accepted
```

Publishing needs an npm token that bypasses 2FA. Store one once in `~/.npmrc`
(`//registry.npmjs.org/:_authToken=npm_XXXX`), or pass it inline:
`NPM_TOKEN=npm_XXXX pnpm ship "msg"`. The script refuses to run on a dirty tree
and skips versions already on the registry, so re-running is safe.

> CI uses **corepack** (bundled with Node) instead of a marketplace action to set
> up pnpm, so releases don't break when the Actions marketplace/codeload is flaky.

## License

[MIT](./LICENSE) © Ömer Faruk Gezer
