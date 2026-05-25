import { Node as TiptapNode, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey, NodeSelection, TextSelection } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import type { Editor } from '@tiptap/core'
import { icons } from './toolbar/icons'
import { base64UploadHandler, validateImageFile, type FileValidationOptions } from './upload'

export type ImageAlign = 'left' | 'center' | 'right'

/** Result an upload handler must resolve to. */
export interface ImageUploadResult {
  src: string
  alt?: string
  width?: number
}

/** Labels for the image bubble menu and caption, so apps can localize them. */
export interface ImageLabels {
  alignLeft: string
  alignCenter: string
  alignRight: string
  caption: string
  delete: string
  /** Placeholder shown in an empty caption. */
  captionPlaceholder: string
}

const defaultLabels: ImageLabels = {
  alignLeft: 'Align left',
  alignCenter: 'Align center',
  alignRight: 'Align right',
  caption: 'Caption',
  delete: 'Delete',
  captionPlaceholder: 'Add a caption…',
}

export interface ResizableImageOptions {
  /** Extra attributes applied to the rendered `<img>`. */
  HTMLAttributes: Record<string, unknown>
  /**
   * Async handler that uploads a picked `File` and returns its URL. When
   * omitted, files are embedded inline as base64 data URLs (zero-config
   * default). Use `createUploadHandler` to POST to your own server instead.
   */
  uploadHandler?: (file: File) => Promise<ImageUploadResult>
  /** Accepted file types (the `<input accept>` syntax). Defaults to `'image/*'`. */
  accept: string
  /** Maximum file size in bytes. Files above this are rejected before upload. */
  maxSize?: number
  /** Minimum render width in pixels while resizing. */
  minWidth: number
  /** Localizable labels for the bubble menu and caption placeholder. */
  labels: Partial<ImageLabels>
  /** Render the selection bubble menu (align/caption/delete). Defaults to `true`. */
  bubbleMenu: boolean
  /** Called when a file is rejected or an upload fails. */
  onError?: (error: Error) => void
}

export interface SetImageOptions {
  src: string
  alt?: string | null
  title?: string | null
  width?: number | null
  align?: ImageAlign
  caption?: string | null
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      /** Insert a resizable image. */
      setImage: (options: SetImageOptions) => ReturnType
      /** Set the alignment of the selected image. */
      setImageAlign: (align: ImageAlign) => ReturnType
      /** Set the caption of the selected image. */
      setImageCaption: (caption: string) => ReturnType
    }
  }
}

function pxAttr(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : parseInt(String(value), 10)
  return Number.isFinite(n) ? n : null
}

let uploadCounter = 0

/**
 * Validates, inserts an optimistic placeholder, then resolves the upload and
 * swaps in the final URL — shared by the toolbar button, paste and drop. The
 * placeholder is located by its `uploadId` so the right node is updated even if
 * positions shifted while the upload was in flight. On failure the placeholder
 * is removed and {@link ResizableImageOptions.onError} is called.
 */
export function insertImageFromFile(editor: Editor, file: File): boolean {
  const ext = editor.extensionManager.extensions.find((x) => x.name === 'image')
  const options = (ext?.options ?? {}) as ResizableImageOptions
  const reportError = (error: Error) => options.onError?.(error)

  const validation = validateImageFile(file, {
    accept: options.accept,
    maxSize: options.maxSize,
  } satisfies FileValidationOptions)
  if (validation) {
    reportError(new Error(validation))
    return false
  }

  const upload = options.uploadHandler ?? base64UploadHandler
  const uploadId = `plume-upload-${++uploadCounter}`
  const preview = URL.createObjectURL(file)

  editor
    .chain()
    .focus()
    .insertContent({
      type: 'image',
      attrs: { src: preview, uploadId, uploading: true },
    })
    .run()

  const finish = (mutate: (pos: number, attrs: Record<string, unknown>) => void) => {
    let found = -1
    let attrs: Record<string, unknown> | null = null
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'image' && node.attrs.uploadId === uploadId) {
        found = pos
        attrs = node.attrs
        return false
      }
      return undefined
    })
    if (found >= 0 && attrs) mutate(found, attrs)
    URL.revokeObjectURL(preview)
  }

  void Promise.resolve(upload(file))
    .then((result) => {
      finish((pos, attrs) => {
        editor.view.dispatch(
          editor.view.state.tr.setNodeMarkup(pos, undefined, {
            ...attrs,
            src: result.src,
            alt: result.alt ?? attrs.alt ?? null,
            width: result.width ?? attrs.width ?? null,
            uploadId: null,
            uploading: false,
          }),
        )
      })
    })
    .catch((error: unknown) => {
      finish((pos) => {
        const tr = editor.view.state.tr.delete(pos, pos + 1)
        editor.view.dispatch(tr)
      })
      reportError(error instanceof Error ? error : new Error(String(error)))
    })

  return true
}

/**
 * A block image node that stores width/alignment/caption as attributes and
 * renders with a drag-to-resize handle, an editable caption and a selection
 * bubble menu (align / caption / delete). Pure-DOM NodeView + plugin, so it
 * works unchanged in every framework adapter. The serialized HTML is a
 * `<figure data-type="plume-image">` containing the `<img>` and an optional
 * `<figcaption>`.
 */
export const ResizableImage = TiptapNode.create<ResizableImageOptions>({
  name: 'image',
  group: 'block',
  draggable: true,
  selectable: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      uploadHandler: undefined,
      accept: 'image/*',
      maxSize: undefined,
      minWidth: 48,
      labels: {},
      bubbleMenu: true,
      onError: undefined,
    }
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      caption: {
        default: null,
        parseHTML: (element) => element.querySelector?.('figcaption')?.textContent || null,
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const img = element instanceof HTMLImageElement ? element : element.querySelector('img')
          return pxAttr(img?.getAttribute('width') ?? img?.style.width ?? null)
        },
      },
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') ?? 'center',
      },
      // Transient state while an upload is in flight; never serialized.
      uploadId: { default: null, rendered: false },
      uploading: { default: false, rendered: false },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="plume-image"]',
        getAttrs: (element) => {
          const img = element.querySelector('img')
          const caption = element.querySelector('figcaption')
          return {
            src: img?.getAttribute('src') ?? null,
            alt: img?.getAttribute('alt') || null,
            title: img?.getAttribute('title') ?? null,
            caption: caption?.textContent || null,
            width: pxAttr(img?.getAttribute('width') ?? img?.style.width ?? null),
            align: element.getAttribute('data-align') ?? 'center',
          }
        },
      },
      { tag: 'img[src]' },
    ]
  },

  renderHTML({ node }) {
    const { src, alt, title, caption, width, align } = node.attrs as {
      src: string
      alt: string | null
      title: string | null
      caption: string | null
      width: number | null
      align: ImageAlign
    }
    const imgAttrs = mergeAttributes(this.options.HTMLAttributes, {
      src,
      alt,
      title,
      ...(width ? { width: String(width) } : {}),
    })
    const figure: [string, Record<string, string>, ...unknown[]] = [
      'figure',
      { 'data-type': 'plume-image', 'data-align': align ?? 'center', class: 'plume-image' },
      ['img', imgAttrs],
    ]
    if (caption) figure.push(['figcaption', {}, caption])
    return figure
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const minWidth = this.options.minWidth
      const labels = { ...defaultLabels, ...this.options.labels }

      const figure = document.createElement('figure')
      figure.className = 'plume-image'
      figure.dataset.type = 'plume-image'

      const frame = document.createElement('div')
      frame.className = 'plume-image__frame'

      const img = document.createElement('img')

      // A drag handle in each corner. The corner only decides which way the
      // pointer must move to grow the image (see `onPointerDown`); the resize
      // itself is width-only.
      const corners = ['nw', 'ne', 'sw', 'se'] as const
      const handles = corners.map((corner) => {
        const h = document.createElement('span')
        h.className = 'plume-image__handle'
        h.dataset.corner = corner
        h.setAttribute('aria-hidden', 'true')
        return h
      })

      const caption = document.createElement('figcaption')
      caption.setAttribute('data-placeholder', labels.captionPlaceholder)

      frame.append(img, ...handles)
      figure.append(frame, caption)

      // The caption is hidden until it has text or the user opens it from the
      // menu — so a freshly inserted image doesn't show an empty caption field.
      // An image that already has a caption starts open.
      let captionOpen = !!node.attrs.caption

      const render = (attrs: Record<string, unknown>) => {
        figure.dataset.align = (attrs.align as string) ?? 'center'
        figure.dataset.uploading = attrs.uploading ? 'true' : 'false'
        img.src = (attrs.src as string) ?? ''
        img.alt = (attrs.alt as string) ?? ''
        if (attrs.title) img.title = attrs.title as string
        const w = pxAttr(attrs.width)
        img.style.width = w ? `${w}px` : ''
        const cap = (attrs.caption as string) ?? ''
        // Avoid clobbering the caret while the user is typing in the caption.
        if (document.activeElement !== caption && caption.textContent !== cap) {
          caption.textContent = cap
        }
        caption.dataset.empty = cap ? 'false' : 'true'
        caption.contentEditable = editor.isEditable ? 'true' : 'false'
        figure.dataset.captionOpen = cap || captionOpen ? 'true' : 'false'
      }
      render(node.attrs)

      const placeCaret = () => {
        caption.focus()
        const range = document.createRange()
        range.selectNodeContents(caption)
        range.collapse(false)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
      }

      // Persist caption edits back to the node.
      const onCaptionInput = () => {
        const pos = typeof getPos === 'function' ? getPos() : null
        if (pos == null) return
        const value = caption.textContent ?? ''
        caption.dataset.empty = value ? 'false' : 'true'
        const current = editor.view.state.doc.nodeAt(pos)
        if (!current) return
        editor.view.dispatch(
          editor.view.state.tr.setNodeMarkup(pos, undefined, {
            ...current.attrs,
            caption: value || null,
          }),
        )
      }
      const onCaptionKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          caption.blur()
        }
      }
      // Collapse the caption again when the user leaves it empty.
      const onCaptionBlur = () => {
        if (!caption.textContent) {
          captionOpen = false
          figure.dataset.captionOpen = 'false'
        }
      }
      // The menu's caption button toggles the caption: open + focus when closed,
      // or close (and clear any text) when already open.
      const onToggleCaption = () => {
        if (!editor.isEditable) return
        const pos = typeof getPos === 'function' ? getPos() : null
        const current = pos != null ? editor.view.state.doc.nodeAt(pos) : null
        const hasText = !!current?.attrs.caption
        if (captionOpen || hasText) {
          captionOpen = false
          caption.blur()
          if (hasText && pos != null && current) {
            editor.view.dispatch(
              editor.view.state.tr.setNodeMarkup(pos, undefined, {
                ...current.attrs,
                caption: null,
              }),
            )
          } else {
            caption.textContent = ''
            caption.dataset.empty = 'true'
            figure.dataset.captionOpen = 'false'
          }
        } else {
          captionOpen = true
          figure.dataset.captionOpen = 'true'
          placeCaret()
        }
      }
      caption.addEventListener('input', onCaptionInput)
      caption.addEventListener('keydown', onCaptionKeydown)
      caption.addEventListener('blur', onCaptionBlur)
      figure.addEventListener('plume:toggle-caption', onToggleCaption)

      // Removes the in-flight drag's window listeners. Set while a resize is
      // active so `destroy()` can tear them down if the node is removed mid-drag.
      let endDrag: (() => void) | null = null

      // Drag-to-resize from any corner handle.
      const onPointerDown = (event: PointerEvent) => {
        if (!editor.isEditable) return
        event.preventDefault()
        event.stopPropagation()
        // Left-side handles grow the image as the pointer moves left, so flip
        // the horizontal delta for them; right-side handles grow rightward.
        const corner = (event.currentTarget as HTMLElement).dataset.corner ?? 'se'
        const dir = corner === 'nw' || corner === 'sw' ? -1 : 1
        // Suspend the node's native drag so the gesture resizes instead of moving it.
        const wasDraggable = figure.draggable
        figure.draggable = false
        const startX = event.clientX
        const startWidth = img.getBoundingClientRect().width
        // Cap at the editor's content-box width (the figure itself is
        // `fit-content`, so measuring it would trap the image at its shrunk size).
        const container = figure.parentElement
        let maxWidth = Infinity
        if (container) {
          const cs = getComputedStyle(container)
          maxWidth =
            container.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
        }

        const onMove = (move: PointerEvent) => {
          const next = Math.max(
            minWidth,
            Math.min(maxWidth, startWidth + dir * (move.clientX - startX)),
          )
          img.style.width = `${Math.round(next)}px`
        }
        const stopListening = () => {
          window.removeEventListener('pointermove', onMove)
          window.removeEventListener('pointerup', onUp)
          endDrag = null
        }
        const onUp = () => {
          stopListening()
          figure.draggable = wasDraggable
          const pos = typeof getPos === 'function' ? getPos() : null
          if (pos == null) return
          const width = Math.round(img.getBoundingClientRect().width)
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, {
              ...editor.view.state.doc.nodeAt(pos)?.attrs,
              width,
            }),
          )
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        endDrag = stopListening
      }
      handles.forEach((h) => h.addEventListener('pointerdown', onPointerDown))

      return {
        dom: figure,
        // This is a fully self-managed atom view (resize handle + contentEditable
        // caption island), so ProseMirror must ignore every internal mutation —
        // otherwise it redraws the node mid-resize and reverts the inline width.
        ignoreMutation: () => true,
        // Let the caption process its own keyboard/input events.
        stopEvent: (event) => event.target instanceof Node && caption.contains(event.target),
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) return false
          render(updatedNode.attrs)
          return true
        },
        destroy: () => {
          // Clean up an active resize drag (e.g. node deleted mid-gesture).
          endDrag?.()
          handles.forEach((h) => h.removeEventListener('pointerdown', onPointerDown))
          caption.removeEventListener('input', onCaptionInput)
          caption.removeEventListener('keydown', onCaptionKeydown)
          caption.removeEventListener('blur', onCaptionBlur)
          figure.removeEventListener('plume:toggle-caption', onToggleCaption)
        },
      }
    }
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
      setImageAlign:
        (align) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { align }),
      setImageCaption:
        (caption) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { caption: caption || null }),
    }
  },

  addProseMirrorPlugins() {
    const plugins: Plugin[] = [imageDropPastePlugin(this.editor)]
    if (this.options.bubbleMenu) {
      plugins.push(imageBubbleMenuPlugin(this.editor, { ...defaultLabels, ...this.options.labels }))
    }
    return plugins
  },
})

/** Pulls image files out of paste/drop events and routes them through upload. */
function imageDropPastePlugin(editor: Editor): Plugin {
  const imageFiles = (list: FileList | null | undefined): File[] =>
    Array.from(list ?? []).filter((f) => f.type.startsWith('image/'))

  return new Plugin({
    key: new PluginKey('plumeImageDropPaste'),
    props: {
      handlePaste: (_view, event) => {
        const files = imageFiles(event.clipboardData?.files)
        if (files.length === 0) return false
        event.preventDefault()
        files.forEach((file) => insertImageFromFile(editor, file))
        return true
      },
      handleDrop: (view, event) => {
        const files = imageFiles((event as DragEvent).dataTransfer?.files)
        if (files.length === 0) return false
        event.preventDefault()
        const coords = view.posAtCoords({
          left: (event as DragEvent).clientX,
          top: (event as DragEvent).clientY,
        })
        if (coords) {
          const { tr, doc } = view.state
          view.dispatch(tr.setSelection(TextSelection.near(doc.resolve(coords.pos))))
        }
        files.forEach((file) => insertImageFromFile(editor, file))
        return true
      },
    },
  })
}

/**
 * A floating toolbar shown when an image is selected: align left/center/right,
 * focus the caption, and delete. Implemented as a single fixed-position DOM
 * element so every framework adapter gets it for free.
 */
function imageBubbleMenuPlugin(editor: Editor, labels: ImageLabels): Plugin {
  return new Plugin({
    key: new PluginKey('plumeImageBubbleMenu'),
    view: (view) => new ImageBubbleMenu(view, editor, labels),
  })
}

class ImageBubbleMenu {
  private menu: HTMLElement
  private scrollTimer: ReturnType<typeof setTimeout> | null = null
  // Repositioning a `fixed` menu on every scroll event lags a frame behind the
  // native (compositor) scroll, so the menu visibly jitters against the image.
  // Instead hide it the instant scrolling starts and snap it back into place
  // once scrolling settles.
  private onScroll = () => {
    this.setVisible(false)
    if (this.scrollTimer) clearTimeout(this.scrollTimer)
    this.scrollTimer = setTimeout(() => {
      this.scrollTimer = null
      this.position()
    }, 150)
  }
  // A resize isn't a continuous stream the way scrolling is, so tracking it live
  // is fine and avoids a flash on window/layout changes.
  private onResize = () => this.position()

  constructor(
    private view: EditorView,
    private editor: Editor,
    labels: ImageLabels,
  ) {
    this.menu = document.createElement('div')
    this.menu.className = 'plume-image-menu'
    this.menu.setAttribute('role', 'toolbar')
    this.setVisible(false)

    const align = (value: ImageAlign, icon: string, title: string) =>
      this.button(
        icon,
        title,
        () => this.applyAlign(value),
        () => this.isAlign(value),
      )

    const trash = this.button(icons.trash, labels.delete, () => this.deleteImage())
    trash.dataset.variant = 'danger'

    this.menu.append(
      align('left', icons.imageLeft, labels.alignLeft),
      align('center', icons.imageCenter, labels.alignCenter),
      align('right', icons.imageRight, labels.alignRight),
      this.separator(),
      this.button(
        icons.caption,
        labels.caption,
        () => this.toggleCaption(),
        () => this.captionActive(),
      ),
      trash,
    )

    // Mount inside the `.plume` root (falling back to body) so the menu inherits
    // the editor's CSS variables and dark-mode theme. Fixed positioning keeps it
    // unclipped regardless of the container's overflow.
    const container = (view.dom.closest('.plume') as HTMLElement | null) ?? document.body
    container.appendChild(this.menu)
    window.addEventListener('scroll', this.onScroll, true)
    window.addEventListener('resize', this.onResize)
  }

  private button(icon: string, title: string, run: () => void, isActive?: () => boolean) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'plume-image-menu__btn'
    btn.title = title
    btn.setAttribute('aria-label', title)
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>`
    btn.addEventListener('mousedown', (e) => {
      // Keep the node selection; act on click without stealing focus first.
      e.preventDefault()
      run()
      this.position()
    })
    if (isActive) btn.dataset.active = 'false'
    btn.dataset.role = isActive ? 'toggle' : 'action'
    ;(btn as HTMLButtonElement & { _isActive?: () => boolean })._isActive = isActive
    return btn
  }

  private setVisible(visible: boolean) {
    this.menu.dataset.visible = visible ? 'true' : 'false'
    // Keep the hidden floating toolbar out of the accessibility tree.
    if (visible) this.menu.removeAttribute('aria-hidden')
    else this.menu.setAttribute('aria-hidden', 'true')
  }

  private separator() {
    const sep = document.createElement('span')
    sep.className = 'plume-image-menu__sep'
    return sep
  }

  private isAlign(value: ImageAlign): boolean {
    const node = this.selectedImage()
    return !!node && (node.attrs.align ?? 'center') === value
  }

  private selectedImage() {
    const { selection } = this.view.state
    if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
      return selection.node
    }
    return null
  }

  // Act directly on the selected node's position via the view, so the menu never
  // depends on editor focus and never nests inside another command's dispatch.
  private applyAlign(value: ImageAlign) {
    const selection = this.view.state.selection
    if (!(selection instanceof NodeSelection) || selection.node.type.name !== 'image') return
    const { tr } = this.view.state
    this.view.dispatch(
      tr.setNodeMarkup(selection.from, undefined, { ...selection.node.attrs, align: value }),
    )
    this.view.focus()
  }

  private deleteImage() {
    const selection = this.view.state.selection
    if (!(selection instanceof NodeSelection)) return
    this.view.dispatch(this.view.state.tr.delete(selection.from, selection.to))
    this.view.focus()
  }

  private imageDOM(): HTMLElement | null {
    const selection = this.view.state.selection
    if (!(selection instanceof NodeSelection)) return null
    return this.view.nodeDOM(selection.from) as HTMLElement | null
  }

  private toggleCaption() {
    // The NodeView owns the caption's open/close/focus logic; ask it to toggle.
    this.imageDOM()?.dispatchEvent(new CustomEvent('plume:toggle-caption'))
  }

  private captionActive(): boolean {
    const node = this.selectedImage()
    if (!node) return false
    if (node.attrs.caption) return true
    return this.imageDOM()?.dataset.captionOpen === 'true'
  }

  private position() {
    const node = this.selectedImage()
    if (!node || !this.editor.isEditable) {
      this.setVisible(false)
      return
    }
    const from = (this.view.state.selection as NodeSelection).from
    const dom = this.view.nodeDOM(from) as HTMLElement | null
    const img = dom?.querySelector('img') ?? dom
    if (!img) {
      this.setVisible(false)
      return
    }
    const rect = (img as HTMLElement).getBoundingClientRect()
    // Resolve the scroll container lazily: at plugin-init time the editor DOM may
    // not be attached under `.plume-editor` yet, so `closest` would miss it.
    const scroller = (this.view.dom.closest('.plume-editor') as HTMLElement | null) ?? this.view.dom
    const editorRect = scroller.getBoundingClientRect()
    const gap = 8

    // The visible band is where the editor and the window viewport overlap — the
    // menu must stay inside it whether the editor scrolls internally or the whole
    // page scrolls.
    const top0 = Math.max(editorRect.top, 0)
    const bottom0 = Math.min(editorRect.bottom, window.innerHeight)
    const left0 = Math.max(editorRect.left, 0)
    const right0 = Math.min(editorRect.right, window.innerWidth)

    // Hide once the image scrolls out of that band.
    if (rect.bottom < top0 || rect.top > bottom0 || bottom0 - top0 < 1) {
      this.setVisible(false)
      return
    }

    this.setVisible(true)
    // Refresh toggle (active) states.
    this.menu.querySelectorAll<HTMLButtonElement>('[data-role="toggle"]').forEach((btn) => {
      const fn = (btn as HTMLButtonElement & { _isActive?: () => boolean })._isActive
      if (fn) btn.dataset.active = fn() ? 'true' : 'false'
    })
    const menuRect = this.menu.getBoundingClientRect()
    // Prefer sitting just above the image; if there's no room above, drop just
    // below its top edge — always clamped to the visible band.
    let top = rect.top - menuRect.height - gap
    if (top < top0 + gap) top = rect.top + gap
    top = Math.max(top0 + gap, Math.min(top, bottom0 - menuRect.height - gap))
    const left = Math.max(
      left0 + gap,
      Math.min(rect.right - menuRect.width, right0 - menuRect.width - gap),
    )
    this.menu.style.top = `${top}px`
    this.menu.style.left = `${left}px`
  }

  update() {
    this.position()
  }

  destroy() {
    if (this.scrollTimer) clearTimeout(this.scrollTimer)
    window.removeEventListener('scroll', this.onScroll, true)
    window.removeEventListener('resize', this.onResize)
    this.menu.remove()
  }
}
