import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlumeEditor } from './PlumeEditor'

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
})
