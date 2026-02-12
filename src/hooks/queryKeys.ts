export const queryKeys = {
  actionPlansRoot: ["actionPlans"] as const,
  plansRoot: ["plan"] as const,
  actionPlans: (userId?: string) => ["actionPlans", userId] as const,
  plan: (userId: string | undefined, planId: string) =>
    ["plan", userId, planId] as const,
};
