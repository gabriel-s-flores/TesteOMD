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
import { Modal } from "./ui/Modal";

interface ActionsManagerProps {
  plan: ActionPlan;
  onAddAction: (actionData: Omit<Action, "id">) => Promise<void>;
  onUpdateAction: (
    actionId: string,
    updates: { status?: Action["status"]; deadline?: number },
  ) => Promise<Action | void>;
  onEditAction: (
    actionId: string,
    updates: { description: string; deadline: number },
  ) => Promise<void>;
  onDeleteAction: (actionId: string) => Promise<void>;
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
  onEditAction,
  onDeleteAction,
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
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);

  // Add optimistic state for instant updates
  const [optimisticActions, setOptimisticActions] = useState<Action[]>(
    plan.actions,
  );

  // Update optimistic actions when plan.actions changes
  React.useEffect(() => {
    setOptimisticActions(plan.actions);
  }, [plan.actions]);

  const handleAddAction = async (data: ActionFormData) => {
    try {
      const deadlineTimestamp = datetimeLocalToTimestamp(data.deadline);

      await onAddAction({
        description: data.description,
        deadline: deadlineTimestamp,
        status: "A Fazer",
        actions: function (): unknown {
          throw new Error("Function not implemented.");
        },
      });
      reset({
        description: "",
        deadline: defaultDeadline,
      });
      setIsActionModalOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar ação:", error);
    }
  };

  const handleEditAction = async (data: ActionFormData) => {
    if (!editingAction) return;

    try {
      const deadlineTimestamp = datetimeLocalToTimestamp(data.deadline);

      await onEditAction(editingAction.id, {
        description: data.description,
        deadline: deadlineTimestamp,
      });

      setIsActionModalOpen(false);
      setEditingAction(null);
    } catch (error) {
      console.error("Erro ao editar ação:", error);
    }
  };

  const openAddActionModal = () => {
    setEditingAction(null);
    reset({
      description: "",
      deadline: defaultDeadline,
    });
    setIsActionModalOpen(true);
  };

  const openEditActionModal = (action: Action) => {
    setEditingAction(action);
    reset({
      description: action.description,
      deadline: timestampToDatetimeLocal(action.deadline),
    });
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setEditingAction(null);
    reset({
      description: "",
      deadline: defaultDeadline,
    });
  };

  const handleStatusChange = async (
    actionId: string,
    newStatus: Action["status"],
  ) => {
    // Optimistically update the UI immediately
    setOptimisticActions((prev) =>
      prev.map((action) =>
        action.id === actionId ? { ...action, status: newStatus } : action,
      ),
    );

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
      // Revert optimistic update on error
      setOptimisticActions(plan.actions);
    } finally {
      setUpdatingActions((prev) => ({ ...prev, [actionId]: false }));
    }
  };

  // Função para excluir ação
  const handleDeleteAction = async (actionId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta ação?")) {
      return;
    }

    setUpdatingActions((prev) => ({ ...prev, [actionId]: true }));
    try {
      await onDeleteAction(actionId);
    } catch (error) {
      console.error("Erro ao excluir ação:", error);
    } finally {
      setUpdatingActions((prev) => ({ ...prev, [actionId]: false }));
    }
  };

  // Improved Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, actionId: string) => {
    e.dataTransfer.setData("text/plain", actionId);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      e.currentTarget.classList.add("opacity-30", "scale-95");
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-30", "scale-95");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (e.dataTransfer.types.includes("text/plain")) {
      e.currentTarget.classList.add("bg-blue-50", "border-blue-300");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as Node;
    if (!e.currentTarget.contains(relatedTarget)) {
      e.currentTarget.classList.remove("bg-blue-50", "border-blue-300");
    }
  };

  const handleDrop = async (
    e: React.DragEvent,
    newStatus: Action["status"],
  ) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-blue-50", "border-blue-300");

    const actionId = e.dataTransfer.getData("text/plain");
    if (actionId) {
      handleStatusChange(actionId, newStatus);
    }
  };

  // Use optimisticActions instead of plan.actions
  const actionsByStatus = useMemo(() => {
    const grouped = {
      "A Fazer": [] as Action[],
      Fazendo: [] as Action[],
      Feita: [] as Action[],
    };

    optimisticActions.forEach((action) => {
      if (grouped[action.status]) {
        grouped[action.status].push(action);
      }
    });

    return grouped;
  }, [optimisticActions]);

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
        return "border-gray-300 bg-gray-50/50";
      case "Fazendo":
        return "border-yellow-300 bg-yellow-50/50";
      case "Feita":
        return "border-green-300 bg-green-50/50";
      default:
        return "border-gray-300 bg-gray-50/50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Botão para adicionar nova ação */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Ações do Plano</h3>
              <p className="text-gray-600 text-sm">
                Total de {optimisticActions.length} ações
              </p>
            </div>
            <Button variant="primary" onClick={openAddActionModal}>
              Adicionar Nova Ação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal para adicionar/editar ação */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={closeActionModal}
        title={editingAction ? "Editar Ação" : "Adicionar Nova Ação"}
        size="md"
      >
        <form
          onSubmit={
            editingAction
              ? handleSubmit(handleEditAction)
              : handleSubmit(handleAddAction)
          }
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4">
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
                      selectedTimestamp > Date.now() || "Prazo deve ser futuro"
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

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeActionModal}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingAction ? "Salvar Alterações" : "Adicionar Ação"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Board Kanban */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Board de Ações ({optimisticActions.length})
          </h3>
        </CardHeader>
        <CardContent>
          {optimisticActions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhuma ação cadastrada para este plano.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["A Fazer", "Fazendo", "Feita"] as Action["status"][]).map(
                (status) => (
                  <div
                    key={status}
                    className={`border-2 border-dashed rounded-lg p-4 min-h-[200px] transition-colors duration-200 ${getColumnStyle(status)}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">{status}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusVariant(status)}`}
                      >
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
                          className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-move transition-all duration-200 hover:shadow-md active:shadow-lg"
                        >
                          <div className="flex flex-col space-y-2">
                            <p className="font-medium text-sm">
                              {action.description}
                            </p>
                            <p className="text-xs text-gray-600">
                              Prazo:{" "}
                              {formatTimestampForDisplay(action.deadline)}
                            </p>

                            {/* Botões de Ação - Removida a caixa de data */}
                            <div className="flex items-center justify-end pt-2 space-x-1">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => openEditActionModal(action)}
                                disabled={updatingActions[action.id]}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteAction(action.id)}
                                isLoading={updatingActions[action.id]}
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {(!actionsByStatus[status] ||
                        actionsByStatus[status].length === 0) && (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg transition-colors duration-200">
                          Arraste ações para aqui
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
