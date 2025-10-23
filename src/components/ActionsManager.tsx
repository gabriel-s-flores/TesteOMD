import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { Action, ActionPlan } from "../types";
import {
  createFutureTimestamp,
  datetimeLocalToTimestamp,
  formatTimestampForDisplay,
  timestampToDatetimeLocal,
} from "../utils/dateUtils";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader } from "./ui/Card";

interface ActionsManagerProps {
  plan: ActionPlan;
  onAddAction: (action: Omit<Action, "id">) => Promise<void>;
  onUpdateAction: (
    actionId: string,
    updates: { deadline?: number; status?: Action["status"] },
  ) => Promise<void>;
  isLoading?: boolean;
}

interface ActionFormData {
  description: string;
  deadline: string;
}

export const ActionsManager: React.FC<ActionsManagerProps> = ({
  plan,
  onAddAction,
  onUpdateAction,
}) => {
  const defaultDeadline = timestampToDatetimeLocal(createFutureTimestamp());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActionFormData>({
    defaultValues: {
      deadline: defaultDeadline,
    },
  });

  const [updatingActions, setUpdatingActions] = useState<
    Record<string, boolean>
  >({});
  const [tempDeadlines, setTempDeadlines] = useState<Record<string, string>>(
    {},
  );

  const handleAddAction = async (data: ActionFormData) => {
    try {
      const deadlineTimestamp = datetimeLocalToTimestamp(data.deadline);

      await onAddAction({
        description: data.description,
        deadline: deadlineTimestamp,
        status: "A Fazer",
        actions: function (): unknown {
          throw new Error("Function not implemented.");
        }
      });
      reset({
        description: "",
        deadline: defaultDeadline,
      });
    } catch (error) {
      console.error("Erro ao adicionar ação:", error);
    }
  };

  const handleStatusChange = async (
    actionId: string,
    newStatus: Action["status"],
  ) => {
    setUpdatingActions((prev) => ({ ...prev, [actionId]: true }));
    try {
      // Buscar a ação atual para preservar o deadline
      const currentAction = plan.actions.find((a) => a.id === actionId);
      if (currentAction) {
        await onUpdateAction(actionId, {
          status: newStatus,
          deadline: currentAction.deadline, // Manter o deadline atual
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setUpdatingActions((prev) => ({ ...prev, [actionId]: false }));
    }
  };

  const handleDeadlineChange = (actionId: string, newDeadline: string) => {
    setTempDeadlines((prev) => ({
      ...prev,
      [actionId]: newDeadline,
    }));
  };

  const handleDeadlineBlur = async (actionId: string) => {
    const tempDeadline = tempDeadlines[actionId];

    if (!tempDeadline) return;

    // Verificar se a data realmente mudou
    const action = plan.actions.find((a) => a.id === actionId);
    if (action && tempDeadline === timestampToDatetimeLocal(action.deadline)) {
      // Limpar o valor temporário se não houve mudança
      setTempDeadlines((prev) => {
        const newState = { ...prev };
        delete newState[actionId];
        return newState;
      });
      return;
    }

    setUpdatingActions((prev) => ({ ...prev, [actionId]: true }));
    try {
      const deadlineTimestamp = datetimeLocalToTimestamp(tempDeadline);
      await onUpdateAction(actionId, { deadline: deadlineTimestamp });
    } catch (error) {
      console.error("Erro ao atualizar prazo:", error);
    } finally {
      setUpdatingActions((prev) => ({ ...prev, [actionId]: false }));
      // Limpar o valor temporário após salvar
      setTempDeadlines((prev) => {
        const newState = { ...prev };
        delete newState[actionId];
        return newState;
      });
    }
  };

  const handleDeadlineKeyPress = (_actionId: string, e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const statusOrder = { "A Fazer": 1, Fazendo: 2, Feita: 3 };
  const sortedActions = useMemo(() => {
    return [...plan.actions].sort(
      (a, b) => statusOrder[a.status] - statusOrder[b.status],
    );
  }, [plan.actions]);

  const getStatusVariant = (status: Action["status"]) => {
    switch (status) {
      case "A Fazer":
        return "bg-gray-100 text-gray-800";
      case "Fazendo":
        return "bg-yellow-100 text-yellow-800";
      case "Feita":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário para adicionar ação */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Adicionar Nova Ação</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleAddAction)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Descrição da Ação
                </label>
                <input
                  type="text"
                  id="description"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  {...register("description", {
                    required: "Descrição é obrigatória",
                    minLength: { value: 3, message: "Mínimo 3 caracteres" },
                  })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-700"
                >
                  Prazo
                </label>
                <input
                  type="datetime-local"
                  id="deadline"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  {...register("deadline", {
                    required: "Prazo é obrigatório",
                    validate: (value) => {
                      const selectedTimestamp = datetimeLocalToTimestamp(value);
                      return (
                        selectedTimestamp > Date.now() ||
                        "Prazo deve ser futuro"
                      );
                    },
                  })}
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.deadline.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Adicionar Ação
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Ações */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Ações do Plano ({plan.actions.length})
          </h3>
        </CardHeader>
        <CardContent>
          {sortedActions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhuma ação cadastrada para este plano.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{action.description}</p>
                    <p className="text-sm text-gray-600">
                      Prazo: {formatTimestampForDisplay(action.deadline)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={action.status}
                      onChange={(e) =>
                        handleStatusChange(
                          action.id,
                          e.target.value as Action["status"],
                        )
                      }
                      disabled={updatingActions[action.id]}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusVariant(action.status)} border-0 focus:ring-2 focus:ring-blue-500 ${
                        updatingActions[action.id] ? "opacity-50" : ""
                      }`}
                    >
                      <option value="A Fazer">A Fazer</option>
                      <option value="Fazendo">Fazendo</option>
                      <option value="Feita">Feita</option>
                    </select>

                    <div className="relative">
                      <input
                        type="datetime-local"
                        value={
                          tempDeadlines[action.id] ||
                          timestampToDatetimeLocal(action.deadline)
                        }
                        onChange={(e) =>
                          handleDeadlineChange(action.id, e.target.value)
                        }
                        onBlur={() => handleDeadlineBlur(action.id)}
                        onKeyPress={(e) => handleDeadlineKeyPress(action.id, e)}
                        disabled={updatingActions[action.id]}
                        className={`text-sm p-1 border rounded ${
                          updatingActions[action.id] ? "opacity-50" : ""
                        }`}
                      />
                      {updatingActions[action.id] && (
                        <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
