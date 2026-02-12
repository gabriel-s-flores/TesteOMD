import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useActionPlans } from "../../hooks/useActionPlans";
import { useModal } from "../../hooks/useModal";
import { useToast } from "../../hooks/useToast";
import type { ActionPlan } from "../../types"; // Remove Action import
import { ModalManager } from "../modals/ModalManager";
import { PlanList } from "../plans/PlanList";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ToastContainer } from "../ui/ToastContainer";

export function IndexComponent() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    plans,
    isLoading,
    createPlan,
    updatePlan,
    deletePlan,
    // Remove addAction and updateAction since they're now handled on the page
    isCreatingPlan,
    isUpdatingPlan,
    isDeletingPlan,
  } = useActionPlans();

  const createModal = useModal();
  const editModal = useModal();
  // REMOVED: actionsModal
  const { toasts, addToast, removeToast } = useToast();

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  // REMOVED: handleAddAction function

  // REMOVED: handleUpdateAction function

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

  // REMOVED: openActionsModal function

  const closeEditModal = () => {
    editModal.close();
    setSelectedPlanId(null);
  };

  // REMOVED: closeActionsModal function

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate({ to: "/login" });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Planos de Ação</h1>
            <p className="text-gray-600 mt-1">
              Logado como <span className="font-medium">{user?.name}</span> (
              {user?.email})
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleLogout}
              isLoading={isLoggingOut}
            >
              Sair
            </Button>
            <Button variant="primary" size="lg" onClick={createModal.open}>
              Novo Plano
            </Button>
          </div>
        </div>

        <PlanList
          plans={plans}
          onEditPlan={openEditModal}
          onDeletePlan={handleDeletePlan}
          isDeleting={isDeletingPlan}
          deletingPlanId={deletingPlanId}
        />
      </div>

      <ModalManager
        createModal={createModal}
        editModal={{ ...editModal, close: closeEditModal }}
        selectedPlan={selectedPlan}
        onCreatePlan={handleCreatePlan}
        onEditPlan={handleEditPlan}
        isCreatingPlan={isCreatingPlan}
        isUpdatingPlan={isUpdatingPlan}
      />
    </div>
  );
}
