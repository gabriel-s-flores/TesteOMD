import type { ActionPlan } from "../../types";
import { formatTimestampForDisplay } from "../../utils/dateUtils";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";

interface PlanCardProps {
  plan: ActionPlan;
  onEdit: (plan: ActionPlan) => void;
  onManageActions: (plan: ActionPlan) => void;
  onDelete: (planId: string) => void;
  isDeleting: boolean;
  deletingPlanId: string | null;
}

export const PlanCard = ({
  plan,
  onEdit,
  onManageActions,
  onDelete,
  isDeleting,
  deletingPlanId,
}: PlanCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Não Iniciado":
        return "bg-gray-100 text-gray-800";
      case "Em Andamento":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getActionCountColor = (count: number) => {
    return count > 0 ? "text-gray-800" : "text-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {plan.title}
            </h2>
            <p className="text-gray-600 mt-1">{plan.objective}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => onEdit(plan)}>
              Editar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onManageActions(plan)}
            >
              Gerenciar Ações ({plan.actions.length})
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(plan.id)}
              isLoading={isDeleting && deletingPlanId === plan.id}
            >
              Excluir
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Criado em: {formatTimestampForDisplay(plan.createdAt)}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}
            >
              {plan.status}
            </span>
          </div>
          <div className="flex gap-2 text-sm">
            <span
              className={`px-2 py-1 rounded-full ${getActionCountColor(
                plan.actions.filter((a) => a.status === "A Fazer").length,
              )}`}
            >
              A Fazer:{" "}
              {plan.actions.filter((a) => a.status === "A Fazer").length}
            </span>
            <span
              className={`px-2 py-1 rounded-full ${getActionCountColor(
                plan.actions.filter((a) => a.status === "Fazendo").length,
              )}`}
            >
              Fazendo:{" "}
              {plan.actions.filter((a) => a.status === "Fazendo").length}
            </span>
            <span
              className={`px-2 py-1 rounded-full ${getActionCountColor(
                plan.actions.filter((a) => a.status === "Feita").length,
              )}`}
            >
              Feita: {plan.actions.filter((a) => a.status === "Feita").length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
