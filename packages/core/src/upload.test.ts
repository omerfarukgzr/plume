import { afterEach, describe, expect, it, vi } from 'vitest'
import { createUploadHandler, validateImageFile } from './upload'

const png = () => new File([new Uint8Array([1, 2, 3])], 'pic.png', { type: 'image/png' })

describe('validateImageFile', () => {
  it('accepts images under the default accept pattern', () => {
    expect(validateImageFile(png())).toBeNull()
  })

  it('rejects a type outside the accept list', () => {
    const pdf = new File([new Uint8Array([1])], 'doc.pdf', { type: 'application/pdf' })
    expect(validateImageFile(pdf, { accept: 'image/*' })).toMatch(/Unsupported/)
  })

  it('matches by extension when the MIME type is missing', () => {
    const file = new File([new Uint8Array([1])], 'pic.png', { type: '' })
    expect(validateImageFile(file, { accept: '.png' })).toBeNull()
  })

  it('rejects files above maxSize', () => {
    expect(validateImageFile(png(), { maxSize: 1 })).toMatch(/too large/)
  })
})

describe('createUploadHandler', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('POSTs multipart and reads { src } from the JSON response', async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        new Response(JSON.stringify({ src: 'https://cdn/x.png', width: 640 }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const upload = createUploadHandler({ url: '/api/upload' })
    const result = await upload(png())

    expect(result).toEqual({ src: 'https://cdn/x.png', width: 640 })
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/upload')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBeInstanceOf(FormData)
    expect((init?.body as FormData).get('file')).toBeInstanceOf(File)
  })

  it('sends the assetId from the upload context in the form', async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        new Response(JSON.stringify({ src: 'https://cdn/x.png' }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const upload = createUploadHandler({ url: '/api/upload' })
    await upload(png(), { assetId: 'asset-123' })

    const body = fetchMock.mock.calls[0]![1]?.body as FormData
    expect(body.get('assetId')).toBe('asset-123')
  })

  it('omits the assetId field when assetIdFieldName is null', async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        new Response(JSON.stringify({ src: 'https://cdn/x.png' }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const upload = createUploadHandler({ url: '/api/upload', assetIdFieldName: null })
    await upload(png(), { assetId: 'asset-123' })

    const body = fetchMock.mock.calls[0]![1]?.body as FormData
    expect(body.has('assetId')).toBe(false)
  })

  it('maps the response when parseResponse is provided', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () => new Response(JSON.stringify({ url: 'https://cdn/y.png' }), { status: 200 }),
      ),
    )
    const upload = createUploadHandler({
      url: '/up',
      parseResponse: (json) => ({ src: (json as { url: string }).url }),
    })
    expect(await upload(png())).toEqual({ src: 'https://cdn/y.png' })
  })

  it('throws with the server error message on a non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: 'too big' }), { status: 413 })),
    )
    await expect(createUploadHandler({ url: '/up' })(png())).rejects.toThrow('too big')
  })
})
