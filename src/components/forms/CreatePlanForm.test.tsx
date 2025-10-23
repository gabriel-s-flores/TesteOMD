import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreatePlanForm } from './CreatePlanForm'

describe('CreatePlanForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render form fields', () => {
    render(<CreatePlanForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/objetivo/i)).toBeInTheDocument()
    expect(screen.getByText('Criar Plano')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('should show validation errors when submitting empty form', async () => {
    render(<CreatePlanForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    fireEvent.click(screen.getByText('Criar Plano'))

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
      expect(screen.getByText(/objetivo é obrigatório/i)).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    render(<CreatePlanForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Meu Plano de Teste' }
    })
    fireEvent.change(screen.getByLabelText(/objetivo/i), {
      target: { value: 'Descrição detalhada do objetivo do plano' }
    })
    fireEvent.click(screen.getByText('Criar Plano'))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Meu Plano de Teste',
        objective: 'Descrição detalhada do objetivo do plano',
        status: 'Não Iniciado',
      })
    })
  })

  it('should call onCancel when cancel button is clicked', () => {
    render(<CreatePlanForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    fireEvent.click(screen.getByText('Cancelar'))

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should show initial data when editing', () => {
    const initialData = {
      title: 'Plano Existente',
      objective: 'Objetivo Existente',
    }

    render(
      <CreatePlanForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        initialData={initialData}
      />
    )

    expect(screen.getByLabelText(/título/i)).toHaveValue('Plano Existente')
    expect(screen.getByLabelText(/objetivo/i)).toHaveValue('Objetivo Existente')
    expect(screen.getByText('Atualizar Plano')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(
      <CreatePlanForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    )

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeDisabled()
  })
})
