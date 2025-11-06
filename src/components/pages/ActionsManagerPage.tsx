import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useParams, useRouter } from "@tanstack/react-router";
import React from "react";
import { mockApi } from "../../services/mockApi";
import type { Action } from "../../types";
import { ActionsManager } from "../ActionsManager";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";

export const ActionsManagerPage: React.FC = () => {
  const { id: planId } = useParams({ from: "/plans/$id/actions" });
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch the plan data
  const {
    data: plan,
    isLoading,
    error,
  } = useSuspenseQuery({
    queryKey: ["plan", planId],
    queryFn: () => mockApi.getActionPlan(planId),
  });

  // Mutation for adding action
  const addActionMutation = useMutation({
    mutationFn: (action: Omit<Action, "id">) =>
      mockApi.addAction(planId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan", planId] });
      queryClient.invalidateQueries({ queryKey: ["actionPlans"] });
    },
  });

  // Mutation for updating action
  const updateActionMutation = useMutation({
    mutationFn: ({
      actionId,
      updates,
    }: {
      actionId: string;
      updates: { deadline?: number; status?: Action["status"] };
    }) => mockApi.updateAction(planId, actionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan", planId] });
      queryClient.invalidateQueries({ queryKey: ["actionPlans"] });
    },
  });

  const handleAddAction = async (action: Omit<Action, "id">) => {
    await addActionMutation.mutateAsync(action);
  };

  const handleUpdateAction = async (
    actionId: string,
    updates: { deadline?: number; status?: Action["status"] },
  ) => {
    await updateActionMutation.mutateAsync({ actionId, updates });
  };

  const handleGoBack = () => {
    router.navigate({ to: "/" });
  };

  const editActionMutation = useMutation({
    mutationFn: ({
      actionId,
      updates,
    }: {
      actionId: string;
      updates: { description: string; deadline: number };
    }) =>
      mockApi.updateActionDescriptionAndDeadline(planId, actionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan", planId] });
      queryClient.invalidateQueries({ queryKey: ["actionPlans"] });
    },
  });

  // Mutation to delete action
  const deleteActionMutation = useMutation({
    mutationFn: (actionId: string) => mockApi.deleteAction(planId, actionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan", planId] });
      queryClient.invalidateQueries({ queryKey: ["actionPlans"] });
    },
  });

  const handleEditAction = async (
    actionId: string,
    updates: { description: string; deadline: number },
  ) => {
    await editActionMutation.mutateAsync({ actionId, updates });
  };

  const handleDeleteAction = async (actionId: string) => {
    return await deleteActionMutation.mutateAsync(actionId);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
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
        isLoading={
          addActionMutation.isPending ||
          updateActionMutation.isPending ||
          editActionMutation.isPending ||
          deleteActionMutation.isPending
        }
      />
    </div>
  );
};
