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
      const currentAction = plan.actions.find((a) => a.id === actionId);
      if (currentAction) {
        await onUpdateAction(actionId, {
          status: newStatus,
          deadline: currentAction.deadline,
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

    const action = plan.actions.find((a) => a.id === actionId);
    if (action && tempDeadline === timestampToDatetimeLocal(action.deadline)) {
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
      setTempDeadlines((prev) => {
        const newState = { ...prev };
        delete newState[actionId];
        return newState;
      });
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, actionId: string) => {
    e.dataTransfer.setData("actionId", actionId);
    e.currentTarget.classList.add("opacity-50");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-blue-50");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-blue-50");
  };

  const handleDrop = async (e: React.DragEvent, newStatus: Action["status"]) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-blue-50");

    const actionId = e.dataTransfer.getData("actionId");
    if (actionId) {
      await handleStatusChange(actionId, newStatus);
    }
  };

  // Agrupar ações por status
  const actionsByStatus = useMemo(() => {
    const grouped = {
      "A Fazer": [] as Action[],
      "Fazendo": [] as Action[],
      "Feita": [] as Action[],
    };

    plan.actions.forEach((action) => {
      if (grouped[action.status]) {
        grouped[action.status].push(action);
      }
    });

    return grouped;
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

  const getColumnStyle = (status: Action["status"]) => {
    switch (status) {
      case "A Fazer":
        return "border-gray-300";
      case "Fazendo":
        return "border-yellow-300";
      case "Feita":
        return "border-green-300";
      default:
        return "border-gray-300";
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

      {/* Board Kanban */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Board de Ações ({plan.actions.length})
          </h3>
        </CardHeader>
        <CardContent>
          {plan.actions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhuma ação cadastrada para este plano.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["A Fazer", "Fazendo", "Feita"] as Action["status"][]).map((status) => (
                <div
                  key={status}
                  className={`border-2 border-dashed rounded-lg p-4 min-h-[200px] ${getColumnStyle(status)}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg">{status}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusVariant(status)}`}>
                      {actionsByStatus[status]?.length || 0}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {actionsByStatus[status]?.map((action) => (
                      <div
                        key={action.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, action.id)}
                        onDragEnd={handleDragEnd}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-move transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex flex-col space-y-2">
                          <p className="font-medium text-sm">{action.description}</p>
                          <p className="text-xs text-gray-600">
                            Prazo: {formatTimestampForDisplay(action.deadline)}
                          </p>

                          <div className="flex items-center justify-between pt-2">
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
                                //onKeyPress={(e) => handleDeadlineKeyPress(action.id, e)}
                                disabled={updatingActions[action.id]}
                                className={`text-xs p-1 border rounded w-32 ${
                                  updatingActions[action.id] ? "opacity-50" : ""
                                }`}
                              />
                              {updatingActions[action.id] && (
                                <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!actionsByStatus[status] || actionsByStatus[status].length === 0) && (
                      <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                        Arraste ações para aqui
                      </div>
                    )}
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
