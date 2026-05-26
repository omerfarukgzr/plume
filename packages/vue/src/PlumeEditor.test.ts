import { describe, expect, it } from 'vitest'
import { render, waitFor } from '@testing-library/vue'
import { PASTE_EVENT } from '@useplume/core'
import { PlumeEditor } from './PlumeEditor'

// tiptap's Vue editor is created in onMounted, so the toolbar and content
// appear after the initial render — use the async `findBy*` queries.

describe('PlumeEditor (vue)', () => {
  it('renders a Turkish toolbar by default', async () => {
    const { findByRole, findByLabelText } = render(PlumeEditor, {
      props: { content: '<p>Hello Plume</p>' },
    })
    expect(await findByRole('toolbar', { name: 'Biçimlendirme' })).toBeTruthy()
    expect(await findByLabelText('Kalın')).toBeTruthy()
  })

  it('renders an English toolbar when locale is "en"', async () => {
    const { findByRole, findByLabelText } = render(PlumeEditor, {
      props: { content: '<p>Hello Plume</p>', locale: 'en' },
    })
    expect(await findByRole('toolbar', { name: 'Formatting' })).toBeTruthy()
    expect(await findByLabelText('Bold')).toBeTruthy()
  })

  it('hides the toolbar when disabled', async () => {
    const { findByRole, queryByRole } = render(PlumeEditor, {
      props: { content: '<p>x</p>', toolbar: false },
    })
    // Wait until the editor has mounted (the editable region has role=textbox).
    await findByRole('textbox')
    expect(queryByRole('toolbar')).toBeNull()
  })

  it('opens the paste chooser on a paste event when pasteManager is on', async () => {
    const { container, findByRole, getByText } = render(PlumeEditor, {
      props: { content: '<p>x</p>', pasteManager: true },
    })
    // Wait for the editor to mount, then simulate the PasteManager hand-off.
    await findByRole('textbox')
    const dom = container.querySelector('.plume-editor__content')!
    dom.dispatchEvent(
      new CustomEvent(PASTE_EVENT, { detail: { html: '<b>hi</b>', text: 'hi' }, bubbles: true }),
    )
    const dialog = await findByRole('dialog', { name: 'Yapıştırma seçeneği' })
    expect(dialog).toBeTruthy()
    expect(getByText('Sadece metin')).toBeTruthy()
  })

  it('ignores paste events when pasteManager is off', async () => {
    const { container, findByRole, queryByRole } = render(PlumeEditor, {
      props: { content: '<p>x</p>' },
    })
    await findByRole('textbox')
    container
      .querySelector('.plume-editor__content')!
      .dispatchEvent(
        new CustomEvent(PASTE_EVENT, { detail: { html: '', text: 'hi' }, bubbles: true }),
      )
    await waitFor(() => expect(queryByRole('dialog')).toBeNull())
  })

  it('reacts to later `content` prop changes (enables v-model / async data)', async () => {
    const { container, findByText, rerender } = render(PlumeEditor, {
      props: { content: '<p>first</p>' },
    })
    await findByText('first')
    await rerender({ content: '<p>second</p>' })
    await waitFor(() => {
      const text = container.querySelector('.plume-editor__content')!.textContent
      expect(text).toContain('second')
      expect(text).not.toContain('first')
    })
  })

  it('adds the fluid modifier class when `fluid` is set', async () => {
    const { container, findByRole } = render(PlumeEditor, {
      props: { content: '<p>x</p>', fluid: true },
    })
    await findByRole('textbox')
    expect(container.querySelector('.plume')!.classList.contains('plume--fluid')).toBe(true)
  })

  it('does not add the fluid class by default', async () => {
    const { container, findByRole } = render(PlumeEditor, {
      props: { content: '<p>x</p>' },
    })
    await findByRole('textbox')
    expect(container.querySelector('.plume')!.classList.contains('plume--fluid')).toBe(false)
  })
})
