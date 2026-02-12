import { useTranslation } from "react-i18next";
import type { ActionPlan } from "../../types";
import { Card, CardContent } from "../ui/Card";
import { PlanCard } from "./PlanCard";

interface PlanListProps {
  plans: ActionPlan[];
  onEditPlan: (plan: ActionPlan) => void;
  onDeletePlan: (planId: string) => void;
  isDeleting: boolean;
  deletingPlanId: string | null;
}

export const PlanList = ({
  plans,
  onEditPlan,
  onDeletePlan,
  isDeleting,
  deletingPlanId,
}: PlanListProps) => {
  const { t } = useTranslation();

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500 text-lg">{t("plans.list.empty")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onEdit={onEditPlan}
          onDelete={onDeletePlan}
          isDeleting={isDeleting}
          deletingPlanId={deletingPlanId}
        />
      ))}
    </div>
  );
};
