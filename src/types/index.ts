export interface Action {
  actions(actions: unknown): unknown;
  id: string;
  description: string;
  status: "A Fazer" | "Fazendo" | "Feita";
  deadline: number; // timestamp em milissegundos
}

export interface ActionPlan {
  id: string;
  title: string;
  objective: string;
  createdAt: number; // timestamp em milissegundos
  status: "Não Iniciado" | "Em Andamento" | "Concluído";
  actions: Action[];
}

export type ActionStatus = Action["status"];
export type PlanStatus = ActionPlan["status"];
