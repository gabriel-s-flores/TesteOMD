import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { ActionPlan } from "../../types";
import { Button } from "../ui/Button";

interface CreatePlanFormProps {
  onSubmit: (data: Omit<ActionPlan, "id" | "createdAt" | "actions">) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<ActionPlan>;
}

interface FormData {
  title: string;
  objective: string;
}

export const CreatePlanForm: React.FC<CreatePlanFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: initialData?.title || "",
      objective: initialData?.objective || "",
    },
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      title: data.title,
      objective: data.objective,
      status: "Não Iniciado",
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          {t("plans.form.title")}
        </label>
        <input
          type="text"
          id="title"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          {...register("title", {
            required: t("plans.form.errors.title_required"),
            minLength: { value: 3, message: t("plans.form.errors.title_min") },
          })}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="objective"
          className="block text-sm font-medium text-gray-700"
        >
          {t("plans.form.objective")}
        </label>
        <textarea
          id="objective"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          {...register("objective", {
            required: t("plans.form.errors.objective_required"),
            minLength: {
              value: 10,
              message: t("plans.form.errors.objective_min"),
            },
          })}
        />
        {errors.objective && (
          <p className="mt-1 text-sm text-red-600">
            {errors.objective.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t("common.buttons.cancel")}
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData
            ? t("plans.form.submit_update")
            : t("plans.form.submit_create")}
        </Button>
      </div>
    </form>
  );
};
