import { useTranslation } from "react-i18next";
import type { ActionPlan } from "../../types";
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
  selectedPlan: ActionPlan | null | undefined;
  onCreatePlan: (
    data: Omit<ActionPlan, "id" | "createdAt" | "actions">,
  ) => Promise<void>;
  onEditPlan: (
    data: Omit<ActionPlan, "id" | "createdAt" | "actions">,
  ) => Promise<void>;
  isCreatingPlan: boolean;
  isUpdatingPlan: boolean;
}

export const ModalManager = ({
  createModal,
  editModal,
  selectedPlan,
  onCreatePlan,
  onEditPlan,
  isCreatingPlan,
  isUpdatingPlan,
}: ModalManagerProps) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Create Plan Modal */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title={t("plans.modal.create_title")}
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
        title={t("plans.modal.edit_title")}
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
    </>
  );
};
