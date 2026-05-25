# Plume

> Customizable, framework-agnostic rich text editor built on [tiptap](https://tiptap.dev).

Plume keeps all editor logic in one place (`@plume/core`) and ships thin
adapters for each UI framework. Today: **React** and **Vue 3**. Tomorrow:
Svelte, Solid, vanilla — without rewriting the editor.

## Packages

| Package         | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `@plume/core`   | Framework-agnostic core: tiptap config, extensions, toolbar, CSS. |
| `@plume/react`  | React adapter — `<PlumeEditor />` + `usePlumeEditor()`.           |
| `@plume/vue`    | Vue 3 adapter — `<PlumeEditor />` + `usePlumeEditor()`.           |

## Quick start (React)

```tsx
import { PlumeEditor } from '@plume/react'
import '@plume/core/styles.css'

export function App() {
  return <PlumeEditor content="<p>Hello Plume 🪶</p>" />
}
```

## Quick start (Vue)

```vue
<script setup lang="ts">
import { PlumeEditor } from '@plume/vue'
import '@plume/core/styles.css'
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
import { createUploadHandler } from '@plume/core'

<PlumeEditor
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

- **Request:** `POST <url>`, `Content-Type: multipart/form-data`, the file in the `file` field (configurable via `fieldName`).
- **Response:** `200` with JSON `{ "src": "https://…", "width"?: number, "alt"?: string }`.
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

## License

[MIT](./LICENSE)
