import React from "react";
import { useForm } from "react-hook-form";
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
          Título
        </label>
        <input
          type="text"
          id="title"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          {...register("title", {
            required: "Título é obrigatório",
            minLength: { value: 3, message: "Mínimo 3 caracteres" },
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
          Objetivo
        </label>
        <textarea
          id="objective"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          {...register("objective", {
            required: "Objetivo é obrigatório",
            minLength: { value: 10, message: "Mínimo 10 caracteres" },
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
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? "Atualizar" : "Criar"} Plano
        </Button>
      </div>
    </form>
  );
};
