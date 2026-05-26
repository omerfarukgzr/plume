import { describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { PASTE_EVENT } from '@useplume/core'
import { PlumeEditor } from './PlumeEditor'

/** Simulates the PasteManager handing a payload to the modal. */
function dispatchPaste(container: HTMLElement) {
  const dom = container.querySelector('.plume-editor__content')!
  act(() => {
    dom.dispatchEvent(
      new CustomEvent(PASTE_EVENT, {
        detail: { html: '<b>hi</b>', text: 'hi' },
        bubbles: true,
      }),
    )
  })
}

describe('<PlumeEditor>', () => {
  it('renders a Turkish toolbar by default', () => {
    render(<PlumeEditor content="<p>Hello Plume</p>" />)
    expect(screen.getByRole('toolbar', { name: 'Biçimlendirme' })).toBeTruthy()
    expect(screen.getByLabelText('Kalın')).toBeTruthy()
    expect(screen.getByLabelText('Bağlantı')).toBeTruthy()
  })

  it('renders an English toolbar when locale is "en"', () => {
    render(<PlumeEditor content="<p>Hello Plume</p>" locale="en" />)
    expect(screen.getByRole('toolbar', { name: 'Formatting' })).toBeTruthy()
    expect(screen.getByLabelText('Bold')).toBeTruthy()
    expect(screen.getByLabelText('Link')).toBeTruthy()
  })

  it('hides the toolbar when disabled', () => {
    render(<PlumeEditor content="<p>x</p>" toolbar={false} />)
    expect(screen.queryByRole('toolbar')).toBeNull()
  })

  it('opens the paste chooser on a paste event when pasteManager is on', () => {
    const { container } = render(<PlumeEditor content="<p>x</p>" pasteManager />)
    expect(screen.queryByRole('dialog')).toBeNull()
    dispatchPaste(container)
    const dialog = screen.getByRole('dialog', { name: 'Yapıştırma seçeneği' })
    expect(dialog).toBeTruthy()
    expect(screen.getByText('Sadece metin')).toBeTruthy()
    expect(screen.getByText('Biçimli')).toBeTruthy()
  })

  it('ignores paste events when pasteManager is off', () => {
    const { container } = render(<PlumeEditor content="<p>x</p>" />)
    dispatchPaste(container)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
