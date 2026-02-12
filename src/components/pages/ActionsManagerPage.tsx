import { useRouter } from "@tanstack/react-router";
import React from "react";
import { usePlanActions } from "../../hooks/usePlanActions";
import type { Action } from "../../types";
import { ActionsManager } from "../ActionsManager";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";

export const ActionsManagerPage: React.FC = () => {
  const router = useRouter();
  const { plan, addAction, updateAction, editAction, deleteAction, isLoading } =
    usePlanActions();

  const handleAddAction = async (action: Omit<Action, "id">) => {
    await addAction(action);
  };

  const handleUpdateAction = async (
    actionId: string,
    updates: { deadline?: number; status?: Action["status"] },
  ) => {
    await updateAction({ actionId, updates });
  };

  const handleGoBack = () => {
    router.navigate({ to: "/" });
  };

  const handleEditAction = async (
    actionId: string,
    updates: { description: string; deadline: number },
  ) => {
    await editAction({ actionId, updates });
  };

  const handleDeleteAction = async (actionId: string) => {
    return await deleteAction(actionId);
  };

  if (!plan) return <div>Plan not found</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Ações</h1>
              <p className="text-gray-600 mt-1">{plan.title}</p>
              {plan.objective && (
                <p className="text-gray-500 text-sm mt-1">{plan.objective}</p>
              )}
            </div>
            <Button variant="secondary" onClick={handleGoBack}>
              Voltar para Planos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions Manager */}
      <ActionsManager
        plan={plan}
        onAddAction={handleAddAction}
        onUpdateAction={handleUpdateAction}
        onEditAction={handleEditAction} // Agora recebe description E deadline
        onDeleteAction={handleDeleteAction}
        isLoading={isLoading}
      />
    </div>
  );
};
