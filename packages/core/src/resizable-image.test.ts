// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Editor } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { resolveEditorOptions } from './options'
import {
  collectImageAssetIds,
  insertImageFromFile,
  type ImageUploadResult,
  type UploadContext,
} from './resizable-image'

const png = () => new File([new Uint8Array([1, 2, 3])], 'pic.png', { type: 'image/png' })

/** First `image` node in the document, or null. */
function imageNode(editor: Editor): ProseMirrorNode | null {
  let found: ProseMirrorNode | null = null
  editor.state.doc.descendants((node) => {
    if (!found && node.type.name === 'image') found = node
    return found ? false : undefined
  })
  return found
}

function imagePos(editor: Editor): number {
  let pos = -1
  editor.state.doc.descendants((node, p) => {
    if (pos < 0 && node.type.name === 'image') pos = p
    return pos < 0 ? undefined : false
  })
  return pos
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

/**
 * Minimal `FileReader` stand-in for the zero-config base64 path. jsdom's real
 * `readAsDataURL` resolves asynchronously and, in some environments, throws from
 * its internal base64 step after the test has torn down — surfacing as an
 * unhandled error. The base64 assertion here only cares about the synchronous
 * node attributes, so a deterministic stub keeps it from leaking a dangling read.
 */
class StubFileReader {
  result: string | null = null
  error: unknown = null
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  readAsDataURL() {
    this.result = 'data:image/png;base64,AQID'
    queueMicrotask(() => this.onload?.())
  }
}

describe('ResizableImage commands & serialization', () => {
  let editor: Editor | undefined

  const make = (content = '') => {
    editor = new Editor({
      element: document.createElement('div'),
      ...resolveEditorOptions({ content }),
    })
    return editor
  }

  afterEach(() => {
    editor?.destroy()
    editor = undefined
  })

  it('setImage inserts a figure-wrapped image', () => {
    const ed = make()
    ed.commands.setImage({ src: 'x.png', alt: 'a cat' })
    const html = ed.getHTML()
    expect(html).toContain('<figure data-type="plume-image"')
    expect(html).toContain('src="x.png"')
    expect(html).toContain('alt="a cat"')
  })

  it('serializes align, width and caption', () => {
    const ed = make()
    ed.commands.setImage({ src: 'x.png', align: 'left', width: 300, caption: 'A view' })
    const html = ed.getHTML()
    expect(html).toContain('data-align="left"')
    expect(html).toContain('width="300"')
    expect(html).toContain('<figcaption>A view</figcaption>')
  })

  it('parses a serialized figure back into node attributes', () => {
    const ed = make(
      '<figure data-type="plume-image" data-align="right"><img src="a.png" width="200"><figcaption>Hi</figcaption></figure>',
    )
    const node = imageNode(ed)
    expect(node?.attrs.src).toBe('a.png')
    expect(node?.attrs.width).toBe(200)
    expect(node?.attrs.align).toBe('right')
    expect(node?.attrs.caption).toBe('Hi')
  })

  it('serializes assetId as data-asset-id on the figure', () => {
    const ed = make()
    ed.commands.setImage({ src: 'x.png', assetId: 'asset-123' })
    expect(ed.getHTML()).toContain('data-asset-id="asset-123"')
  })

  it('parses data-asset-id back into the assetId attribute', () => {
    const ed = make(
      '<figure data-type="plume-image" data-asset-id="asset-123"><img src="x.png"></figure>',
    )
    expect(imageNode(ed)?.attrs.assetId).toBe('asset-123')
  })

  it('omits data-asset-id when there is no assetId', () => {
    const ed = make()
    ed.commands.setImage({ src: 'x.png' })
    expect(ed.getHTML()).not.toContain('data-asset-id')
  })

  it('collectImageAssetIds returns the used ids, de-duplicated and skipping id-less images', () => {
    const ed = make(
      '<figure data-type="plume-image" data-asset-id="a"><img src="1.png"></figure>' +
        '<figure data-type="plume-image" data-asset-id="b"><img src="2.png"></figure>' +
        '<figure data-type="plume-image" data-asset-id="a"><img src="3.png"></figure>' +
        '<figure data-type="plume-image"><img src="ext.png"></figure>',
    )
    expect(collectImageAssetIds(ed).sort()).toEqual(['a', 'b'])
  })

  it('collectImageAssetIds is empty for a document with no images', () => {
    const ed = make('<p>just text</p>')
    expect(collectImageAssetIds(ed)).toEqual([])
  })

  it('setImageAlign / setImageCaption update the selected image', () => {
    const ed = make()
    ed.commands.setImage({ src: 'x.png' })
    ed.commands.setNodeSelection(imagePos(ed))
    ed.commands.setImageAlign('right')
    ed.commands.setImageCaption('Caption text')
    const node = imageNode(ed)
    expect(node?.attrs.align).toBe('right')
    expect(node?.attrs.caption).toBe('Caption text')
  })

  it('clears the caption when set to an empty string', () => {
    const ed = make()
    ed.commands.setImage({ src: 'x.png', caption: 'something' })
    ed.commands.setNodeSelection(imagePos(ed))
    ed.commands.setImageCaption('')
    expect(imageNode(ed)?.attrs.caption).toBeNull()
  })
})

describe('insertImageFromFile pipeline', () => {
  let editor: Editor | undefined

  beforeEach(() => {
    // jsdom has no object-URL support; the pipeline only needs a preview string.
    ;(URL as unknown as { createObjectURL: unknown }).createObjectURL = vi.fn(() => 'blob:mock')
    ;(URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn()
  })

  const make = (image: NonNullable<Parameters<typeof resolveEditorOptions>[0]>['image']) => {
    editor = new Editor({
      element: document.createElement('div'),
      ...resolveEditorOptions({ content: '<p></p>', image }),
    })
    return editor
  }

  afterEach(() => {
    editor?.destroy()
    editor = undefined
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('inserts an optimistic placeholder, then swaps in the uploaded URL', async () => {
    const uploadHandler = vi.fn(
      async (): Promise<ImageUploadResult> => ({ src: 'https://cdn/final.png', width: 120 }),
    )
    const ed = make({ uploadHandler })

    expect(insertImageFromFile(ed, png())).toBe(true)

    // Synchronous placeholder: blob preview, uploading flag set.
    const placeholder = imageNode(ed)
    expect(placeholder?.attrs.src).toBe('blob:mock')
    expect(placeholder?.attrs.uploading).toBe(true)

    await flush()

    const final = imageNode(ed)
    expect(uploadHandler).toHaveBeenCalledOnce()
    expect(final?.attrs.src).toBe('https://cdn/final.png')
    expect(final?.attrs.width).toBe(120)
    expect(final?.attrs.uploading).toBe(false)
    expect(final?.attrs.uploadId).toBeNull()
  })

  it('removes the placeholder and reports the error when the upload fails', async () => {
    const onError = vi.fn()
    const uploadHandler = vi.fn(async (): Promise<ImageUploadResult> => {
      throw new Error('boom')
    })
    const ed = make({ uploadHandler, onError })

    insertImageFromFile(ed, png())
    expect(imageNode(ed)).not.toBeNull() // placeholder present

    await flush()

    expect(imageNode(ed)).toBeNull() // rolled back
    expect(onError).toHaveBeenCalledOnce()
    expect(onError.mock.calls[0]![0]).toBeInstanceOf(Error)
    expect(onError.mock.calls[0]![0].message).toBe('boom')
  })

  it('generates an assetId, passes it to the handler and serializes it', async () => {
    const uploadHandler = vi.fn(
      async (_file: File, _ctx: UploadContext): Promise<ImageUploadResult> => ({
        src: 'https://cdn/final.png',
      }),
    )
    const ed = make({ uploadHandler })

    insertImageFromFile(ed, png())
    const assetId = imageNode(ed)?.attrs.assetId as string
    expect(assetId).toEqual(expect.any(String))
    expect(assetId.length).toBeGreaterThan(0)

    await flush()

    // The handler received the same id Plume stamped on the node…
    expect(uploadHandler.mock.calls[0]![1]).toEqual({ assetId })
    // …and it survives onto the final node and the serialized HTML.
    expect(imageNode(ed)?.attrs.assetId).toBe(assetId)
    expect(ed.getHTML()).toContain(`data-asset-id="${assetId}"`)
  })

  it('lets a server-returned id override the client-generated one', async () => {
    const uploadHandler = vi.fn(
      async (): Promise<ImageUploadResult> => ({ src: 'https://cdn/final.png', id: 'server-id' }),
    )
    const ed = make({ uploadHandler })

    insertImageFromFile(ed, png())
    await flush()

    expect(imageNode(ed)?.attrs.assetId).toBe('server-id')
  })

  it('does not stamp an assetId for the zero-config base64 default', async () => {
    vi.stubGlobal('FileReader', StubFileReader)
    const ed = make({}) // no uploadHandler → base64, nothing on a server to track
    insertImageFromFile(ed, png())
    expect(imageNode(ed)?.attrs.assetId).toBeNull()
    await flush() // drain the base64 read so it completes inside the test
  })

  it('rejects an invalid file before inserting anything', () => {
    const onError = vi.fn()
    const uploadHandler = vi.fn()
    const ed = make({ uploadHandler, onError, accept: 'image/*' })

    const pdf = new File([new Uint8Array([1])], 'doc.pdf', { type: 'application/pdf' })
    expect(insertImageFromFile(ed, pdf)).toBe(false)
    expect(imageNode(ed)).toBeNull()
    expect(uploadHandler).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledOnce()
  })
})
