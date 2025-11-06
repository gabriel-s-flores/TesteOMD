import { createFileRoute } from '@tanstack/react-router'
import { ActionsManagerPage } from '../../../components/pages/ActionsManagerPage'

export const Route = createFileRoute('/plans/$id/actions')({
  component: ActionsManagerPage,
})
