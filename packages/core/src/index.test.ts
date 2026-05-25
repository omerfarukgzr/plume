import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Editor } from '@tiptap/core'
import { customBlockquoteExtensions } from './custom-blockquote'
import { defaultExtensions } from './extensions'
import { resolveEditorOptions } from './options'
import { defaultToolbar, resolveToolbarItems } from './toolbar/items'

describe('resolveEditorOptions', () => {
  it('includes the default extension set by default', () => {
    const options = resolveEditorOptions()
    expect(options.extensions?.length).toBeGreaterThan(0)
    expect(options.editable).toBe(true)
  })

  it('omits default extensions when disabled', () => {
    const options = resolveEditorOptions({ defaultExtensions: false })
    expect(options.extensions).toEqual([])
  })

  it('appends user extensions after the defaults', () => {
    const withDefaults = resolveEditorOptions().extensions ?? []
    const extra = defaultExtensions()[0]!
    const merged = resolveEditorOptions({ extensions: [extra] }).extensions ?? []
    expect(merged.length).toBe(withDefaults.length + 1)
  })

  it('adds the content element class', () => {
    const options = resolveEditorOptions({ editorClass: 'custom' })
    const attrs = options.editorProps?.attributes as Record<string, string>
    expect(attrs.class).toContain('plume-editor__content')
    expect(attrs.class).toContain('custom')
  })
})

describe('resolveEditorOptions onUpdate', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  // A minimal stand-in for the tiptap editor the handler receives.
  const fakeEditor = (isDestroyed = false) => ({ isDestroyed }) as unknown as Editor
  // tiptap calls onUpdate with `{ editor, transaction, ... }`; we only need editor.
  const fire = (
    handler: NonNullable<ReturnType<typeof resolveEditorOptions>['onUpdate']>,
    editor: Editor,
  ) => handler({ editor } as Parameters<typeof handler>[0])

  it('is omitted when no callback is provided', () => {
    expect(resolveEditorOptions().onUpdate).toBeUndefined()
  })

  it('fires synchronously on every change when updateDelay is 0', () => {
    const onUpdate = vi.fn()
    const handler = resolveEditorOptions({ onUpdate, updateDelay: 0 }).onUpdate!
    const editor = fakeEditor()
    fire(handler, editor)
    fire(handler, editor)
    expect(onUpdate).toHaveBeenCalledTimes(2)
    expect(onUpdate).toHaveBeenLastCalledWith(editor)
  })

  it('debounces rapid changes into a single trailing call (default 300ms)', () => {
    const onUpdate = vi.fn()
    const handler = resolveEditorOptions({ onUpdate }).onUpdate!
    const editor = fakeEditor()
    fire(handler, editor)
    vi.advanceTimersByTime(100)
    fire(handler, editor) // resets the timer
    vi.advanceTimersByTime(299)
    expect(onUpdate).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith(editor)
  })

  it('skips a trailing call once the editor is destroyed', () => {
    const onUpdate = vi.fn()
    const handler = resolveEditorOptions({ onUpdate }).onUpdate!
    const editor = fakeEditor(true) // torn down before the timer fires
    fire(handler, editor)
    vi.advanceTimersByTime(300)
    expect(onUpdate).not.toHaveBeenCalled()
  })
})

describe('resolveToolbarItems', () => {
  it('resolves the default toolbar with separators', () => {
    const items = resolveToolbarItems()
    expect(items.length).toBe(defaultToolbar.length)
    expect(items.some((item) => item.type === 'separator')).toBe(true)
    expect(items.find((item) => item.name === 'bold')?.type).toBe('button')
  })

  it('returns nothing when the toolbar is disabled', () => {
    expect(resolveToolbarItems(false)).toEqual([])
  })

  it('skips unknown item names', () => {
    const items = resolveToolbarItems(['bold', 'nope' as never])
    expect(items.map((item) => item.name)).toEqual(['bold'])
  })

  it('builds buttons for custom blockquote variants', () => {
    const items = resolveToolbarItems(['bold', 'kuran', 'hadis'], {
      blockquotes: [
        { name: 'kuran', label: 'Kuran alıntısı', color: '#83214a' },
        { name: 'hadis', label: 'Hadis alıntısı' },
      ],
    })
    const kuran = items.find((item) => item.name === 'kuran')
    expect(kuran?.type).toBe('button')
    expect(kuran?.title).toBe('Kuran alıntısı')
    expect(items.find((item) => item.name === 'hadis')?.type).toBe('button')
  })

  it('renders app-provided custom items referenced by name', () => {
    const items = resolveToolbarItems(['bold', 'clearFormat'], {
      items: [{ name: 'clearFormat', type: 'button', title: 'Clear', run: () => {} }],
    })
    expect(items.map((item) => item.name)).toEqual(['bold', 'clearFormat'])
    expect(items.find((item) => item.name === 'clearFormat')?.title).toBe('Clear')
  })

  it('lets a custom item override a built-in of the same name', () => {
    const run = () => {}
    const items = resolveToolbarItems(['bold'], {
      items: [{ name: 'bold', type: 'button', title: 'Custom bold', run }],
    })
    expect(items.find((item) => item.name === 'bold')?.title).toBe('Custom bold')
  })

  it('does not mutate the shared default registry', () => {
    resolveToolbarItems(['bold'], {
      items: [{ name: 'bold', type: 'button', title: 'Custom bold', run: () => {} }],
    })
    // A subsequent default resolution still sees the original built-in.
    expect(resolveToolbarItems(['bold']).find((item) => item.name === 'bold')?.title).not.toBe(
      'Custom bold',
    )
  })
})

describe('customBlockquoteExtensions', () => {
  it('returns an empty array without specs', () => {
    expect(customBlockquoteExtensions([])).toEqual([])
  })

  it('produces the shared command provider plus one node per variant', () => {
    const exts = customBlockquoteExtensions([
      { name: 'kuran', label: 'Kuran alıntısı', color: '#83214a' },
      { name: 'hadis', label: 'Hadis alıntısı' },
    ])
    expect(exts.map((e) => e.name)).toEqual(['customBlockquote', 'kuran', 'hadis'])
  })

  it('registers the variant nodes via the editor options', () => {
    const extensions = defaultExtensions({
      blockquotes: [{ name: 'kuran', label: 'Kuran alıntısı' }],
    })
    expect(extensions.some((e) => e.name === 'kuran')).toBe(true)
    expect(extensions.some((e) => e.name === 'customBlockquote')).toBe(true)
  })
})
