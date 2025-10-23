import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('should render children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when isLoading is true', () => {
    render(<Button isLoading>Click me</Button>)
    expect(screen.getByText('Carregando...')).toBeDisabled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByText('Click me')).toBeDisabled()
  })

  it('should apply correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    const button = screen.getByText('Primary')
    expect(button.className).toContain('bg-blue-600')

    rerender(<Button variant="danger">Danger</Button>)
    expect(button.className).toContain('bg-red-600')
  })

  it('should apply correct size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    const button = screen.getByText('Small')
    expect(button.className).toContain('px-3')

    rerender(<Button size="lg">Large</Button>)
    expect(button.className).toContain('px-6')
  })

  it('should merge custom className', () => {
    render(<Button className="custom-class">Button</Button>)
    const button = screen.getByText('Button')
    expect(button.className).toContain('custom-class')
  })
})
