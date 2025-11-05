import { useState } from "react";
import { PlanList } from "../plans/PlanList";
import { ModalManager } from "../modals/ModalManager";
import { ToastContainer } from "../ui/ToastContainer";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Button } from "../ui/Button";
import { useActionPlans } from "../../hooks/useActionPlans";
import { useModal } from "../../hooks/useModal";
import { useToast } from "../../hooks/useToast";
import type { Action, ActionPlan } from "../../types";

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
  const { toasts, addToast, removeToast } = useToast();

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const selectedPlan = selectedPlanId
    ? plans.find((plan) => plan.id === selectedPlanId)
    : null;

  const handleCreatePlan = async (
    data: Omit<ActionPlan, "id" | "createdAt" | "actions">,
  ) => {
    try {
      await createPlan(data);
      createModal.close();
      addToast({ type: "success", title: "Plano criado com sucesso!" });
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
      addToast({ type: "success", title: "Plano atualizado com sucesso!" });
    } catch (error) {
      console.error(error);
      addToast({ type: "error", title: "Erro ao atualizar plano" });
    }
  };

  const handleAddAction = async (actionData: Omit<Action, "id">) => {
    if (!selectedPlanId) return;

    try {
      await addAction({ planId: selectedPlanId, action: actionData });
      addToast({ type: "success", title: "Ação adicionada com sucesso!" });
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
      addToast({ type: "success", title: "Plano excluído com sucesso!" });
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
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Planos de Ação</h1>
          <Button variant="primary" size="lg" onClick={createModal.open}>
            Novo Plano
          </Button>
        </div>

        <PlanList
          plans={plans}
          onEditPlan={openEditModal}
          onManageActions={openActionsModal}
          onDeletePlan={handleDeletePlan}
          isDeleting={isDeletingPlan}
          deletingPlanId={deletingPlanId}
        />
      </div>

      <ModalManager
        createModal={createModal}
        editModal={{ ...editModal, close: closeEditModal }}
        actionsModal={{ ...actionsModal, close: closeActionsModal }}
        selectedPlan={selectedPlan}
        onCreatePlan={handleCreatePlan}
        onEditPlan={handleEditPlan}
        onAddAction={handleAddAction}
        onUpdateAction={handleUpdateAction}
        isCreatingPlan={isCreatingPlan}
        isUpdatingPlan={isUpdatingPlan}
      />
    </div>
  );
}
