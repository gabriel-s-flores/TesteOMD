import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ActionsManager } from "../components/ActionsManager";
import { CreatePlanForm } from "../components/forms/CreatePlanForm";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { useActionPlans } from "../hooks/useActionPlans";
import { useModal } from "../hooks/useModal";
import type { Action, ActionPlan } from "../types";
import { formatTimestampForDisplay } from "../utils/dateUtils";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

export function IndexComponent() {
  const {
    plans,
    isLoading,
    createPlan,
    updatePlan,
    deletePlan,
    addAction,
    updateAction,
    isCreatingPlan,
    isUpdatingPlan,
    isDeletingPlan,
  } = useActionPlans();

  const createModal = useModal();
  const editModal = useModal();
  const actionsModal = useModal();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<
    Array<{ id: string; type: string; title: string; message?: string }>
  >([]);

  // Obter o plano selecionado dos dados em cache
  const selectedPlan = selectedPlanId
    ? plans.find((plan) => plan.id === selectedPlanId)
    : null;

  // Funções de toast
  const addToast = (toast: {
    type: string;
    title: string;
    message?: string;
  }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleCreatePlan = async (
    data: Omit<ActionPlan, "id" | "createdAt" | "actions">,
  ) => {
    try {
      await createPlan(data);
      createModal.close();
    } catch (error) {
      console.error(error);
      addToast({ type: "error", title: "Erro ao criar plano" });
    }
  };

  const handleEditPlan = async (
    data: Omit<ActionPlan, "id" | "createdAt" | "actions">,
  ) => {
    if (!selectedPlanId) return;

    try {
      await updatePlan({
        id: selectedPlanId,
        updates: { title: data.title, objective: data.objective },
      });
      editModal.close();
      setSelectedPlanId(null);
    } catch (error) {
      console.error(error);
      addToast({ type: "error", title: "Erro ao atualizar plano" });
    }
  };

  const handleAddAction = async (actionData: Omit<Action, "id">) => {
    if (!selectedPlanId) return;

    try {
      await addAction({ planId: selectedPlanId, action: actionData });
      // A atualização do cache é feita automaticamente no hook
    } catch (error) {
      console.error(error);
      addToast({ type: "error", title: "Erro ao adicionar ação" });
    }
  };

  const handleUpdateAction = async (
    actionId: string,
    updates: { deadline?: number; status?: Action["status"] },
  ) => {
    if (!selectedPlanId) return;

    try {
      // Convert number timestamp to Date object if deadline is provided
      const updatesWithDateDeadline = {
        ...updates,
        deadline: updates.deadline ? new Date(updates.deadline) : undefined,
      };

      await updateAction({
        planId: selectedPlanId,
        actionId,
        updates: updatesWithDateDeadline,
      });
    } catch (error) {
      console.error(error);
      addToast({ type: "error", title: "Erro ao atualizar ação" });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    setDeletingPlanId(planId);
    try {
      await deletePlan(planId);
    } catch (error) {
      console.error(error);
      addToast({ type: "error", title: "Erro ao excluir plano" });
    } finally {
      setDeletingPlanId(null);
    }
  };

  const openEditModal = (plan: ActionPlan) => {
    setSelectedPlanId(plan.id);
    editModal.open();
  };

  const openActionsModal = (plan: ActionPlan) => {
    setSelectedPlanId(plan.id);
    actionsModal.open();
  };

  const closeEditModal = () => {
    editModal.close();
    setSelectedPlanId(null);
  };

  const closeActionsModal = () => {
    actionsModal.close();
    setSelectedPlanId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando planos de ação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Toast Container Simplificado */}
      <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 mb-2 border rounded-lg shadow-sm ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : toast.type === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <span className="mr-3 text-lg">
              {toast.type === "success"
                ? "✅"
                : toast.type === "error"
                  ? "❌"
                  : "ℹ️"}
            </span>
            <div className="flex-1">
              <p className="font-medium">{toast.title}</p>
              {toast.message && (
                <p className="text-sm opacity-90">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Planos de Ação</h1>
          <Button variant="primary" size="lg" onClick={createModal.open}>
            Novo Plano
          </Button>
        </div>

        <div className="grid gap-6">
          {plans.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Nenhum plano de ação encontrado. Crie seu primeiro plano!
                </p>
              </CardContent>
            </Card>
          ) : (
            plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {plan.title}
                      </h2>
                      <p className="text-gray-600 mt-1">{plan.objective}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openEditModal(plan)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openActionsModal(plan)}
                      >
                        Gerenciar Ações ({plan.actions.length})
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        isLoading={isDeletingPlan && deletingPlanId === plan.id}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>
                        Criado em: {formatTimestampForDisplay(plan.createdAt)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          plan.status === "Não Iniciado"
                            ? "bg-gray-100 text-gray-800"
                            : plan.status === "Em Andamento"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          plan.actions.filter((a) => a.status === "A Fazer")
                            .length > 0
                            ? "bg-gray-100 text-gray-800"
                            : "text-gray-500"
                        }`}
                      >
                        A Fazer:{" "}
                        {
                          plan.actions.filter((a) => a.status === "A Fazer")
                            .length
                        }
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full ${
                          plan.actions.filter((a) => a.status === "Fazendo")
                            .length > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "text-gray-500"
                        }`}
                      >
                        Fazendo:{" "}
                        {
                          plan.actions.filter((a) => a.status === "Fazendo")
                            .length
                        }
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full ${
                          plan.actions.filter((a) => a.status === "Feita")
                            .length > 0
                            ? "bg-green-100 text-green-800"
                            : "text-gray-500"
                        }`}
                      >
                        Feita:{" "}
                        {
                          plan.actions.filter((a) => a.status === "Feita")
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal Criar Plano */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="Criar Plano de Ação"
      >
        <CreatePlanForm
          onSubmit={handleCreatePlan}
          onCancel={createModal.close}
          isLoading={isCreatingPlan}
        />
      </Modal>

      {/* Modal Editar Plano */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        title="Editar Plano de Ação"
      >
        {selectedPlan && (
          <CreatePlanForm
            onSubmit={handleEditPlan}
            onCancel={closeEditModal}
            initialData={selectedPlan}
            isLoading={isUpdatingPlan}
          />
        )}
      </Modal>

      {/* Modal Gerenciar Ações */}
      <Modal
        isOpen={actionsModal.isOpen}
        onClose={closeActionsModal}
        title={`Gerenciar Ações - ${selectedPlan?.title || ""}`}
        size="lg"
      >
        {selectedPlan && (
          <ActionsManager
            plan={selectedPlan}
            onAddAction={handleAddAction}
            onUpdateAction={handleUpdateAction}
            isLoading={false}
          />
        )}
      </Modal>
    </div>
  );
}
