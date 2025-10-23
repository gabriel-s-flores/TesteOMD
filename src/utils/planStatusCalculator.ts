import type { Action, ActionPlan } from "../types";

export const calculatePlanStatus = (
  actions: Action[],
): ActionPlan["status"] => {
  if (actions.length === 0) {
    return "Não Iniciado";
  }

  const allDone = actions.every((action) => action.status === "Feita");
  const anyInProgress = actions.some((action) => action.status === "Fazendo");
  const anyDone = actions.some((action) => action.status === "Feita");

  if (allDone) {
    return "Concluído";
  }

  if (anyInProgress || anyDone) {
    return "Em Andamento";
  }

  return "Não Iniciado";
};
