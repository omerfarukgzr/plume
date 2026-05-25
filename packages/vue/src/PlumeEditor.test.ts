import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/vue'
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
})
