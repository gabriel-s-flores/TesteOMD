import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { mockApi } from "../services/mockApi";
import type { Action } from "../types";
import { queryKeys } from "./queryKeys";

export const usePlanActions = () => {
  const { id: planId } = useParams({ from: "/plans/$id/actions" });
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const userId = user?.id;

  const { data: plan } = useSuspenseQuery({
    queryKey: queryKeys.plan(userId, planId),
    queryFn: () => mockApi.getActionPlan(planId),
  });

  const invalidatePlanQueries = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.plan(userId, planId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.actionPlans(userId) });
  };

  const addActionMutation = useMutation({
    mutationFn: (action: Omit<Action, "id">) =>
      mockApi.addAction(planId, action),
    onSuccess: invalidatePlanQueries,
  });

  const updateActionMutation = useMutation({
    mutationFn: ({
      actionId,
      updates,
    }: {
      actionId: string;
      updates: { deadline?: number; status?: Action["status"] };
    }) => mockApi.updateAction(planId, actionId, updates),
    onSuccess: invalidatePlanQueries,
  });

  const editActionMutation = useMutation({
    mutationFn: ({
      actionId,
      updates,
    }: {
      actionId: string;
      updates: { description: string; deadline: number };
    }) => mockApi.updateActionDescriptionAndDeadline(planId, actionId, updates),
    onSuccess: invalidatePlanQueries,
  });

  const deleteActionMutation = useMutation({
    mutationFn: (actionId: string) => mockApi.deleteAction(planId, actionId),
    onSuccess: invalidatePlanQueries,
  });

  return {
    plan,
    addAction: addActionMutation.mutateAsync,
    updateAction: updateActionMutation.mutateAsync,
    editAction: editActionMutation.mutateAsync,
    deleteAction: deleteActionMutation.mutateAsync,
    isLoading:
      addActionMutation.isPending ||
      updateActionMutation.isPending ||
      editActionMutation.isPending ||
      deleteActionMutation.isPending,
  };
};
