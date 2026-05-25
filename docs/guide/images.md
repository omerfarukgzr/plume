# Images & uploads

Images are resizable (drag the corner handle), alignable, captioned and deletable. A
selection bubble menu exposes align / caption / delete, and the caption is edited
inline. The toolbar button, paste and drag-and-drop all run through the same pipeline:
validation → optimistic placeholder → final URL.

## Zero-config default

With no `uploadHandler`, picked, pasted and dropped images are embedded inline as
**base64 data URLs**, so it works with no setup. That's convenient for demos and apps
that store the HTML as-is, but it bloats the serialized document — for production,
upload to your own server instead.

## Uploading to your server

`createUploadHandler` is the standard implementation: it POSTs the file as
`multipart/form-data` and reads the result from the JSON response.

```tsx
import { createUploadHandler } from '@plume/core'
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

For full control (S3 presigned URLs, tRPC, …), pass any async handler:

```ts
uploadHandler: (file: File) => Promise<{ src: string; width?: number; alt?: string }>
```

## Server contract

Whoever builds the backend only needs to satisfy this:

- **Request:** `POST <url>`, `Content-Type: multipart/form-data`, the file in the
  `file` field (configurable via `fieldName`).
- **Response:** `200` with JSON `{ "src": "https://…", "width"?: number, "alt"?: string }`.
- **Error:** any non-2xx status; optionally `{ "error": "message" }` so the message
  surfaces in `onError`.

### Express (with `multer`)

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

### Go (standard library)

```go
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
	dst, _ := os.Create(filepath.Join("uploads", name))
	defer dst.Close()
	io.Copy(dst, file)

	json.NewEncoder(w).Encode(map[string]string{"src": "/uploads/" + name})
}
```

## Cleaning up orphaned uploads

Once images live on your server, you hit a classic problem: a user uploads an
image, then deletes it from the document — or never saves the document at all.
The file is still on your server, but nothing references it. Over time these
**orphans** pile up.

::: tip Don't need this?
If you're fine with every uploaded file staying on your server forever, you can
**skip this entire section**. Plume still attaches an id to each upload, but you
can simply ignore it — nothing else changes, and uploads keep working.
:::

### Why "delete the file when the node is removed" doesn't work

The tempting fix — fire a `DELETE` request whenever an image node leaves the
document — is unreliable in both directions:

- **Undo/redo:** the user deletes an image (file gone), then hits undo — the node
  is back but the file is already deleted. Now the `src` is broken.
- **Cut & paste:** cutting is _delete then re-insert_; the file would be deleted
  mid-move.
- **Multiple references:** if the same image is copied to two places, deleting
  one shouldn't remove a file the other still points at.
- **Closed tab / crash:** the delete signal may never fire — so this approach
  doesn't even catch every orphan.

It both **over-deletes** (undo, shared files) and **under-deletes** (closed tab).

### The reliable approach: reconcile on save

Don't track deletes in real time. Instead, at **save time**, compare what the
document actually references against what you've stored, and clean up the rest.
Plume makes this work with a stable **asset id** per upload:

1. When a file is uploaded to your server (i.e. you set an `uploadHandler`),
   Plume generates a client-side id (`crypto.randomUUID()`).
2. That id is sent to your upload endpoint in the **`assetId`** form field, so
   you can store the file under it.
3. The same id is written onto the saved HTML as **`data-asset-id`** on the
   `<figure>`:

   ```html
   <figure data-type="plume-image" data-asset-id="9f1c…" data-align="center">
     <img src="https://cdn.example.com/9f1c….jpg" />
   </figure>
   ```

So your backend only needs two things:

- **On upload:** read the `assetId` field and store the file under it (mark it
  `pending` / unreferenced for now).
- **On save:** parse the `data-asset-id` values out of the HTML you're about to
  persist — that's the set of assets still in use. Any uploaded asset _not_ in
  that set is an orphan: flag it for deletion and let a periodic job (a cron)
  sweep the flagged files.

```js
// On save: which assets does this document still reference?
const used = new Set([...html.matchAll(/data-asset-id="([^"]+)"/g)].map((m) => m[1]))

// Anything you stored for this document but isn't in `used` is an orphan.
await db.assets.update({ documentId, id: { notIn: [...used] } }, { pendingDelete: true })
// A cron later deletes files where pendingDelete = true (after a grace period).
```

#### Sending the list from the client instead

If you'd rather not parse HTML on the server, `collectImageAssetIds` walks the
editor and hands you the used ids directly — send them alongside your save:

```ts
import { collectImageAssetIds } from '@plume/core'

async function save(editor) {
  await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html: editor.getHTML(),
      usedAssetIds: collectImageAssetIds(editor), // e.g. ['9f1c…', 'a2b…']
    }),
  })
}
```

It returns a de-duplicated array and skips id-less images (base64 or externally
pasted ones), so the list is exactly the set of uploads your server owns and
should keep. The backend logic is the same as above — just with `usedAssetIds`
instead of a regex over the HTML.

Because this only looks at the document's final state, it's automatically
correct for every tricky case:

| Scenario                                          | Result                                       |
| ------------------------------------------------- | -------------------------------------------- |
| Image deleted, then **undo**                      | id is back in the doc → kept ✅              |
| **Cut & paste** / move                            | id still present at save → kept ✅           |
| Same image **copied** to two spots                | id referenced at least once → kept ✅        |
| **External** image pasted in (no `data-asset-id`) | not your asset → ignored ✅                  |
| Image uploaded but **document never saved**       | id never reported as used → swept by cron ✅ |

### Server generates the id instead?

By default the id is client-generated, but if your storage layer mints its own
id (an S3 key, a database row id…), return it from the handler and it overrides
the client one — it still lands in `data-asset-id`:

```ts
uploadHandler: async (file, { assetId }) => {
  const stored = await uploadToS3(file) // your storage returns a key
  return { src: stored.url, id: stored.key } // `id` wins over the client id
}
```

You can also change or disable the form field name with `assetIdFieldName`
(default `'assetId'`; pass `null` to omit it entirely).
