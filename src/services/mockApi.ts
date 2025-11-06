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
      createdAt: Date.now(), // current timestamp
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

    // Update the plan with the new action
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

    // Update only the provided fields, keeping the existing ones
    const updatedActions = [...actionPlans[planIndex].actions];
    updatedActions[actionIndex] = {
      ...updatedActions[actionIndex], // Keep existing data
      ...updates, // Apply only the updates
    };

    // Update the entire plan
    actionPlans[planIndex] = {
      ...actionPlans[planIndex],
      actions: updatedActions,
      status: calculatePlanStatus(updatedActions),
    };

    return { ...updatedActions[actionIndex] };
  },

  async updateActionDescription(
    planId: string,
    actionId: string,
    description: string,
  ): Promise<Action> {
    await delay(500);
    const planIndex = actionPlans.findIndex((p) => p.id === planId);
    if (planIndex === -1) throw new Error("Plano não encontrado");

    const actionIndex = actionPlans[planIndex].actions.findIndex(
      (a) => a.id === actionId,
    );
    if (actionIndex === -1) throw new Error("Ação não encontrada");

    // Update the description
    const updatedActions = [...actionPlans[planIndex].actions];
    updatedActions[actionIndex] = {
      ...updatedActions[actionIndex],
      description,
    };

    // Update the entire plan
    actionPlans[planIndex] = {
      ...actionPlans[planIndex],
      actions: updatedActions,
    };

    return { ...updatedActions[actionIndex] };
  },

  async deleteAction(planId: string, actionId: string): Promise<void> {
    await delay(500);
    const planIndex = actionPlans.findIndex((p) => p.id === planId);
    if (planIndex === -1) throw new Error("Plano não encontrado");

    // Removes the action
    actionPlans[planIndex] = {
      ...actionPlans[planIndex],
      actions: actionPlans[planIndex].actions.filter((a) => a.id !== actionId),
      status: calculatePlanStatus(
        actionPlans[planIndex].actions.filter((a) => a.id !== actionId),
      ),
    };
  },

  async updateActionDescriptionAndDeadline(
    planId: string,
    actionId: string,
    updates: { description: string; deadline: number },
  ): Promise<Action> {
    await delay(500);
    const planIndex = actionPlans.findIndex((p) => p.id === planId);
    if (planIndex === -1) throw new Error("Plano não encontrado");

    const actionIndex = actionPlans[planIndex].actions.findIndex(
      (a) => a.id === actionId,
    );
    if (actionIndex === -1) throw new Error("Ação não encontrada");

    // Atualiza a descrição e o prazo
    const updatedActions = [...actionPlans[planIndex].actions];
    updatedActions[actionIndex] = {
      ...updatedActions[actionIndex],
      description: updates.description,
      deadline: updates.deadline,
    };

    // Atualiza o plano completo
    actionPlans[planIndex] = {
      ...actionPlans[planIndex],
      actions: updatedActions,
    };

    return { ...updatedActions[actionIndex] };
  },
};
