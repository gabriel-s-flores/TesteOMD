import type { Action, ActionPlan } from "../../types";
import { ActionsManager } from "../ActionsManager";
import { CreatePlanForm } from "../forms/CreatePlanForm";
import { Modal } from "../ui/Modal";

interface ModalManagerProps {
  createModal: {
    isOpen: boolean;
    close: () => void;
  };
  editModal: {
    isOpen: boolean;
    close: () => void;
  };
  actionsModal: {
    isOpen: boolean;
    close: () => void;
  };
  selectedPlan: ActionPlan | null | undefined;
  onCreatePlan: (
    data: Omit<ActionPlan, "id" | "createdAt" | "actions">,
  ) => Promise<void>;
  onEditPlan: (
    data: Omit<ActionPlan, "id" | "createdAt" | "actions">,
  ) => Promise<void>;
  onAddAction: (actionData: Omit<Action, "id">) => Promise<void>;
  onUpdateAction: (
    actionId: string,
    updates: { deadline?: number; status?: Action["status"] },
  ) => Promise<void>;
  isCreatingPlan: boolean;
  isUpdatingPlan: boolean;
}

export const ModalManager = ({
  createModal,
  editModal,
  actionsModal,
  selectedPlan,
  onCreatePlan,
  onEditPlan,
  onAddAction,
  onUpdateAction,
  isCreatingPlan,
  isUpdatingPlan,
}: ModalManagerProps) => {
  return (
    <>
      {/* Create Plan Modal */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="Criar Plano de Ação"
      >
        <CreatePlanForm
          onSubmit={onCreatePlan}
          onCancel={createModal.close}
          isLoading={isCreatingPlan}
        />
      </Modal>

      {/* Edit Plan Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Editar Plano de Ação"
      >
        {selectedPlan && (
          <CreatePlanForm
            onSubmit={onEditPlan}
            onCancel={editModal.close}
            initialData={selectedPlan}
            isLoading={isUpdatingPlan}
          />
        )}
      </Modal>

      {/* Manage Actions Modal */}
      <Modal
        isOpen={actionsModal.isOpen}
        onClose={actionsModal.close}
        title={`Gerenciar Ações - ${selectedPlan?.title || ""}`}
        size="lg"
      >
        {selectedPlan && (
          <ActionsManager
            plan={selectedPlan}
            onAddAction={onAddAction}
            onUpdateAction={onUpdateAction}
            isLoading={false}
          />
        )}
      </Modal>
    </>
  );
};
