import type { ImageUploadResult } from './resizable-image'

/**
 * Reads a picked `File` into a base64 data URL and embeds it directly in the
 * document — no server required. This is Plume's zero-config default: pass
 * `image: true` and image upload works out of the box.
 *
 * Caveat: data URLs are stored inline in the document, so large images bloat
 * the serialized HTML/JSON. For production apps that persist content, prefer a
 * real backend via {@link createUploadHandler} or a custom `uploadHandler`.
 */
export function base64UploadHandler(file: File): Promise<ImageUploadResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ src: reader.result as string })
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/** Configuration for the standard multipart upload handler. */
export interface UploadHandlerConfig {
  /** Endpoint that receives the `multipart/form-data` POST. */
  url: string
  /** HTTP method. Defaults to `'POST'`. */
  method?: string
  /** Form field name the file is sent under. Defaults to `'file'`. */
  fieldName?: string
  /** Extra headers (e.g. `Authorization`). Do not set `Content-Type` — the
   * browser sets the multipart boundary automatically. */
  headers?: Record<string, string>
  /** Send cookies with the request (`credentials: 'include'`). */
  withCredentials?: boolean
  /**
   * Maps the server's JSON response onto an {@link ImageUploadResult}. Defaults
   * to expecting `{ src, width?, alt? }`. Override when your API differs.
   */
  parseResponse?: (
    json: unknown,
    response: Response,
  ) => ImageUploadResult | Promise<ImageUploadResult>
}

/**
 * Builds an `uploadHandler` that POSTs the file as `multipart/form-data` and
 * reads an {@link ImageUploadResult} from the JSON response. This is the
 * "standard implementation" for apps storing images on their own server.
 *
 * **Server contract** (document this for whoever builds the backend):
 * - **Request:** `POST <url>`, `Content-Type: multipart/form-data`, the file in
 *   the `file` field (configurable via {@link UploadHandlerConfig.fieldName}).
 * - **Response:** `200` with JSON `{ "src": "https://…", "width"?: number, "alt"?: string }`.
 * - **Error:** any non-2xx status; optionally `{ "error": "message" }` so the
 *   message can be surfaced.
 *
 * @example
 * ```ts
 * image: {
 *   uploadHandler: createUploadHandler({ url: '/api/upload' }),
 * }
 * ```
 */
export function createUploadHandler(config: UploadHandlerConfig) {
  const {
    url,
    method = 'POST',
    fieldName = 'file',
    headers,
    withCredentials = false,
    parseResponse = (json) => json as ImageUploadResult,
  } = config

  return async function uploadHandler(file: File): Promise<ImageUploadResult> {
    const body = new FormData()
    body.append(fieldName, file, file.name)

    const response = await fetch(url, {
      method,
      body,
      headers,
      credentials: withCredentials ? 'include' : 'same-origin',
    })

    if (!response.ok) {
      let message = `Upload failed (${response.status})`
      try {
        const data = (await response.clone().json()) as { error?: string }
        if (data?.error) message = data.error
      } catch {
        // Response wasn't JSON; keep the status-based message.
      }
      throw new Error(message)
    }

    return parseResponse(await response.json(), response)
  }
}

/** Limits applied to a picked file before upload. */
export interface FileValidationOptions {
  /** Accepted MIME types/patterns (the `<input accept>` syntax). */
  accept?: string
  /** Maximum file size in bytes. */
  maxSize?: number
}

/**
 * Validates a file against the configured `accept`/`maxSize` limits.
 * Returns an error message when the file is rejected, or `null` when it passes.
 */
export function validateImageFile(file: File, options: FileValidationOptions = {}): string | null {
  const { accept = 'image/*', maxSize } = options

  if (accept && !matchesAccept(file, accept)) {
    return `Unsupported file type: ${file.type || 'unknown'}`
  }
  if (maxSize != null && file.size > maxSize) {
    return `File is too large (max ${Math.round(maxSize / 1024)} KB)`
  }
  return null
}

function matchesAccept(file: File, accept: string): boolean {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  return accept
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .some((pattern) => {
      if (pattern.startsWith('.')) return name.endsWith(pattern)
      if (pattern.endsWith('/*')) return type.startsWith(pattern.slice(0, -1))
      return type === pattern
    })
}
