import type { Action, ActionPlan } from "../types";
import { calculatePlanStatus } from "../utils/planStatusCalculator";
import { authService } from "./authService";
import { mockDb } from "./mockDb";

const generateEntityId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getCurrentUserId = () => authService.getCurrentUserOrThrow().id;

const readPlansForCurrentUser = () => {
  const userId = getCurrentUserId();
  const plans = mockDb.getActionPlans();
  return plans.filter((plan) => plan.userId === userId);
};

const toPublicPlan = (plan: { userId: string } & ActionPlan): ActionPlan => {
  const publicPlan = { ...plan };
  delete (publicPlan as { userId?: string }).userId;
  return publicPlan;
};

const saveUpdatedPlan = (updatedPlan: ActionPlan) => {
  const allPlans = mockDb.getActionPlans();
  const index = allPlans.findIndex((plan) => plan.id === updatedPlan.id);

  if (index === -1) {
    throw new Error("Plano não encontrado");
  }

  allPlans[index] = {
    ...allPlans[index],
    ...updatedPlan,
  };

  mockDb.saveActionPlans(allPlans);
};

export const mockApi = {
  async getActionPlans(): Promise<ActionPlan[]> {
    await delay(500);
    return readPlansForCurrentUser().map((plan) => toPublicPlan(plan));
  },

  async getActionPlan(id: string): Promise<ActionPlan | undefined> {
    await delay(500);
    const plan = readPlansForCurrentUser().find((plan) => plan.id === id);
    if (!plan) return undefined;

    return toPublicPlan(plan);
  },

  async createActionPlan(
    plan: Omit<ActionPlan, "id" | "createdAt" | "actions">,
  ): Promise<ActionPlan> {
    await delay(500);
    const userId = getCurrentUserId();

    const newPlan: ActionPlan = {
      ...plan,
      id: generateEntityId(),
      createdAt: Date.now(),
      actions: [],
    };

    const currentPlans = mockDb.getActionPlans();
    currentPlans.push({ ...newPlan, userId });
    mockDb.saveActionPlans(currentPlans);

    return { ...newPlan };
  },

  async updateActionPlan(
    id: string,
    updates: { title?: string; objective?: string },
  ): Promise<ActionPlan> {
    await delay(500);
    const plan = readPlansForCurrentUser().find((item) => item.id === id);
    if (!plan) throw new Error("Plano não encontrado");

    const updatedPlan = {
      ...plan,
      ...updates,
    };

    saveUpdatedPlan(updatedPlan);

    return toPublicPlan(updatedPlan);
  },

  async deleteActionPlan(id: string): Promise<void> {
    await delay(500);

    const userId = getCurrentUserId();
    const currentPlans = mockDb.getActionPlans();

    const updatedPlans = currentPlans.filter(
      (plan) => !(plan.id === id && plan.userId === userId),
    );

    mockDb.saveActionPlans(updatedPlans);
  },

  async addAction(planId: string, action: Omit<Action, "id">): Promise<Action> {
    await delay(500);
    const plan = readPlansForCurrentUser().find((item) => item.id === planId);
    if (!plan) throw new Error("Plano não encontrado");

    const newAction: Action = {
      ...action,
      id: generateEntityId(),
    };

    const updatedActions = [...plan.actions, newAction];

    const updatedPlan = {
      ...plan,
      actions: updatedActions,
      status: calculatePlanStatus(updatedActions),
    };

    saveUpdatedPlan(updatedPlan);

    return { ...newAction };
  },

  async updateAction(
    planId: string,
    actionId: string,
    updates: { deadline?: number; status?: Action["status"] },
  ): Promise<Action> {
    await delay(500);
    const plan = readPlansForCurrentUser().find((item) => item.id === planId);
    if (!plan) throw new Error("Plano não encontrado");

    const actionIndex = plan.actions.findIndex((a) => a.id === actionId);
    if (actionIndex === -1) throw new Error("Ação não encontrada");

    const updatedActions = [...plan.actions];
    updatedActions[actionIndex] = {
      ...updatedActions[actionIndex],
      ...updates,
    };

    const updatedPlan = {
      ...plan,
      actions: updatedActions,
      status: calculatePlanStatus(updatedActions),
    };

    saveUpdatedPlan(updatedPlan);

    return { ...updatedActions[actionIndex] };
  },

  async updateActionDescription(
    planId: string,
    actionId: string,
    description: string,
  ): Promise<Action> {
    await delay(500);
    const plan = readPlansForCurrentUser().find((item) => item.id === planId);
    if (!plan) throw new Error("Plano não encontrado");

    const actionIndex = plan.actions.findIndex((a) => a.id === actionId);
    if (actionIndex === -1) throw new Error("Ação não encontrada");

    const updatedActions = [...plan.actions];
    updatedActions[actionIndex] = {
      ...updatedActions[actionIndex],
      description,
    };

    const updatedPlan = {
      ...plan,
      actions: updatedActions,
    };

    saveUpdatedPlan(updatedPlan);

    return { ...updatedActions[actionIndex] };
  },

  async deleteAction(planId: string, actionId: string): Promise<void> {
    await delay(500);
    const plan = readPlansForCurrentUser().find((item) => item.id === planId);
    if (!plan) throw new Error("Plano não encontrado");

    const filteredActions = plan.actions.filter((a) => a.id !== actionId);

    const updatedPlan = {
      ...plan,
      actions: filteredActions,
      status: calculatePlanStatus(filteredActions),
    };

    saveUpdatedPlan(updatedPlan);
  },

  async updateActionDescriptionAndDeadline(
    planId: string,
    actionId: string,
    updates: { description: string; deadline: number },
  ): Promise<Action> {
    await delay(500);
    const plan = readPlansForCurrentUser().find((item) => item.id === planId);
    if (!plan) throw new Error("Plano não encontrado");

    const actionIndex = plan.actions.findIndex((a) => a.id === actionId);
    if (actionIndex === -1) throw new Error("Ação não encontrada");

    const updatedActions = [...plan.actions];
    updatedActions[actionIndex] = {
      ...updatedActions[actionIndex],
      description: updates.description,
      deadline: updates.deadline,
    };

    const updatedPlan = {
      ...plan,
      actions: updatedActions,
    };

    saveUpdatedPlan(updatedPlan);

    return { ...updatedActions[actionIndex] };
  },
};
