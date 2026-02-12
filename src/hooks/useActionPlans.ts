import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import i18n from "../i18n";
import { mockApi } from "../services/mockApi";
import type { Action, ActionPlan } from "../types";
import { queryKeys } from "./queryKeys";
import { useToast } from "./useToast";

export const useActionPlans = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const plansQuery = useQuery({
    queryKey: queryKeys.actionPlans(user?.id),
    queryFn: mockApi.getActionPlans,
    enabled: Boolean(user),
  });

  // Function to search for updated plan from API
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
      toast.error(message, i18n.t("common.errors.try_again_later"));
    },
    [toast],
  );

  const createPlanMutation = useMutation({
    mutationFn: mockApi.createActionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.actionPlans(user?.id),
      });
      onSuccess(i18n.t("dashboard.toasts.plan_created"));
    },
    onError: () => onError(i18n.t("dashboard.toasts.plan_create_error")),
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
        queryKeys.actionPlans(user?.id),
        (old: ActionPlan[] | undefined) => {
          if (!old) return [updatedPlan];
          return old.map((plan) =>
            plan.id === updatedPlan.id ? updatedPlan : plan,
          );
        },
      );
      onSuccess(i18n.t("dashboard.toasts.plan_updated"));
    },
    onError: () => onError(i18n.t("dashboard.toasts.plan_update_error")),
  });

  const deletePlanMutation = useMutation({
    mutationFn: mockApi.deleteActionPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.actionPlans(user?.id),
      });
      onSuccess(i18n.t("dashboard.toasts.plan_deleted"));
    },
    onError: () => onError(i18n.t("dashboard.toasts.plan_delete_error")),
  });

  const addActionMutation = useMutation({
    mutationFn: ({
      planId,
      action,
    }: {
      planId: string;
      action: Omit<Action, "id">;
    }) => mockApi.addAction(planId, action),
    onSuccess: (_, variables) => {
      // Search for updated plan from API to ensure consistency
      refreshPlan(variables.planId).then((updatedPlan) => {
        if (updatedPlan) {
          queryClient.setQueryData(
            queryKeys.actionPlans(user?.id),
            (old: ActionPlan[] | undefined) => {
              if (!old) return [updatedPlan];
              return old.map((plan) =>
                plan.id === variables.planId ? updatedPlan : plan,
              );
            },
          );
        }
      });
      onSuccess(i18n.t("actions.toasts.action_added"));
    },
    onError: () => onError(i18n.t("actions.toasts.action_add_error")),
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
    onSuccess: (_, variables) => {
      // Search for updated plan from API to ensure consistency
      refreshPlan(variables.planId).then((updatedPlan) => {
        if (updatedPlan) {
          queryClient.setQueryData(
            queryKeys.actionPlans(user?.id),
            (old: ActionPlan[] | undefined) => {
              if (!old) return [updatedPlan];
              return old.map((plan) =>
                plan.id === variables.planId ? updatedPlan : plan,
              );
            },
          );
        }
      });
      onSuccess(i18n.t("actions.toasts.action_updated"));
    },
    onError: () => onError(i18n.t("actions.toasts.action_update_error")),
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
