import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { mockApi } from "../services/mockApi";
import type { Action, ActionPlan } from "../types";
import { useToast } from "./useToast";

export const useActionPlans = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const plansQuery = useQuery({
    queryKey: ["actionPlans"],
    queryFn: mockApi.getActionPlans,
  });

  // Função para buscar plano atualizado da API
  const refreshPlan = useCallback(async (planId: string) => {
    return await mockApi.getActionPlan(planId);
  }, []);

  const onSuccess = useCallback(
    (message: string) => {
      toast.success(message);
    },
    [toast],
  );

  const onError = useCallback(
    (message: string) => {
      toast.error(message, "Tente novamente mais tarde.");
    },
    [toast],
  );

  const createPlanMutation = useMutation({
    mutationFn: mockApi.createActionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actionPlans"] });
      onSuccess("Plano criado com sucesso!");
    },
    onError: () => onError("Erro ao criar plano"),
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { title?: string; objective?: string };
    }) => mockApi.updateActionPlan(id, updates),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(
        ["actionPlans"],
        (old: ActionPlan[] | undefined) => {
          if (!old) return [updatedPlan];
          return old.map((plan) =>
            plan.id === updatedPlan.id ? updatedPlan : plan,
          );
        },
      );
      onSuccess("Plano atualizado com sucesso!");
    },
    onError: () => onError("Erro ao atualizar plano"),
  });

  const deletePlanMutation = useMutation({
    mutationFn: mockApi.deleteActionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actionPlans"] });
      onSuccess("Plano excluído com sucesso!");
    },
    onError: () => onError("Erro ao excluir plano"),
  });

  const addActionMutation = useMutation({
    mutationFn: ({
      planId,
      action,
    }: {
      planId: string;
      action: Omit<Action, "id">;
    }) => mockApi.addAction(planId, action),
    onSuccess: (newAction, variables) => {
      // Busca o plano atualizado da API para garantir consistência
      refreshPlan(variables.planId).then((updatedPlan) => {
        if (updatedPlan) {
          queryClient.setQueryData(
            ["actionPlans"],
            (old: ActionPlan[] | undefined) => {
              if (!old) return [updatedPlan];
              return old.map((plan) =>
                plan.id === variables.planId ? updatedPlan : plan,
              );
            },
          );
        }
      });
      onSuccess("Ação adicionada com sucesso!");
    },
    onError: () => onError("Erro ao adicionar ação"),
  });

  const updateActionMutation = useMutation({
    mutationFn: ({
      planId,
      actionId,
      updates,
    }: {
      planId: string;
      actionId: string;
      updates: {
        deadline?: Date;
        status?: Action["status"];
      };
    }) => {
      // Convert Date to timestamp before sending to API
      const apiUpdates = {
        ...updates,
        deadline: updates.deadline?.getTime(), // Convert Date to timestamp
      };
      return mockApi.updateAction(planId, actionId, apiUpdates);
    },
    onSuccess: (updatedAction, variables) => {
      // Busca o plano atualizado da API para garantir consistência
      refreshPlan(variables.planId).then((updatedPlan) => {
        if (updatedPlan) {
          queryClient.setQueryData(
            ["actionPlans"],
            (old: ActionPlan[] | undefined) => {
              if (!old) return [updatedPlan];
              return old.map((plan) =>
                plan.id === variables.planId ? updatedPlan : plan,
              );
            },
          );
        }
      });
      onSuccess("Ação atualizada com sucesso!");
    },
    onError: () => onError("Erro ao atualizar ação"),
  });

  return {
    plans: plansQuery.data || [],
    isLoading: plansQuery.isLoading,
    error: plansQuery.error,
    createPlan: createPlanMutation.mutateAsync,
    isCreatingPlan: createPlanMutation.isPending,
    updatePlan: updatePlanMutation.mutateAsync,
    isUpdatingPlan: updatePlanMutation.isPending,
    deletePlan: deletePlanMutation.mutateAsync,
    isDeletingPlan: deletePlanMutation.isPending,
    addAction: addActionMutation.mutateAsync,
    isAddingAction: addActionMutation.isPending,
    updateAction: updateActionMutation.mutateAsync,
    isUpdatingAction: updateActionMutation.isPending,
    refreshPlan,
  };
};
