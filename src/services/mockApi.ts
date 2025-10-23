import type { Action, ActionPlan } from "../types";
import { calculatePlanStatus } from "../utils/planStatusCalculator";

let actionPlans: ActionPlan[] = [];
let nextId = 1;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async getActionPlans(): Promise<ActionPlan[]> {
    await delay(500);
    return [...actionPlans];
  },

  async getActionPlan(id: string): Promise<ActionPlan | undefined> {
    await delay(500);
    const plan = actionPlans.find((plan) => plan.id === id);
    return plan ? { ...plan } : undefined;
  },

  async createActionPlan(
    plan: Omit<ActionPlan, "id" | "createdAt" | "actions">,
  ): Promise<ActionPlan> {
    await delay(500);
    const newPlan: ActionPlan = {
      ...plan,
      id: String(nextId++),
      createdAt: Date.now(), // timestamp atual
      actions: [],
    };
    actionPlans.push(newPlan);
    return { ...newPlan };
  },

  async updateActionPlan(
    id: string,
    updates: { title?: string; objective?: string },
  ): Promise<ActionPlan> {
    await delay(500);
    const planIndex = actionPlans.findIndex((p) => p.id === id);
    if (planIndex === -1) throw new Error("Plano não encontrado");

    actionPlans[planIndex] = {
      ...actionPlans[planIndex],
      ...updates,
    };

    return { ...actionPlans[planIndex] };
  },

  async deleteActionPlan(id: string): Promise<void> {
    await delay(500);
    actionPlans = actionPlans.filter((plan) => plan.id !== id);
  },

  async addAction(planId: string, action: Omit<Action, "id">): Promise<Action> {
    await delay(500);
    const planIndex = actionPlans.findIndex((p) => p.id === planId);
    if (planIndex === -1) throw new Error("Plano não encontrado");

    const newAction: Action = {
      ...action,
      id: String(nextId++),
    };

    // Atualiza o plano com a nova ação
    actionPlans[planIndex] = {
      ...actionPlans[planIndex],
      actions: [...actionPlans[planIndex].actions, newAction],
      status: calculatePlanStatus([
        ...actionPlans[planIndex].actions,
        newAction,
      ]),
    };

    return { ...newAction };
  },

  async updateAction(
    planId: string,
    actionId: string,
    updates: { deadline?: number; status?: Action["status"] },
  ): Promise<Action> {
    await delay(500);
    const planIndex = actionPlans.findIndex((p) => p.id === planId);
    if (planIndex === -1) throw new Error("Plano não encontrado");

    const actionIndex = actionPlans[planIndex].actions.findIndex(
      (a) => a.id === actionId,
    );
    if (actionIndex === -1) throw new Error("Ação não encontrada");

    // Atualiza apenas os campos fornecidos, mantendo os existentes
    const updatedActions = [...actionPlans[planIndex].actions];
    updatedActions[actionIndex] = {
      ...updatedActions[actionIndex], // Manter dados existentes
      ...updates, // Aplicar apenas as atualizações
    };

    // Atualiza o plano completo
    actionPlans[planIndex] = {
      ...actionPlans[planIndex],
      actions: updatedActions,
      status: calculatePlanStatus(updatedActions),
    };

    return { ...updatedActions[actionIndex] };
  },
};
