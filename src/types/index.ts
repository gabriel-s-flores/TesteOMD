export interface Action {
  id: string;
  description: string;
  status: "A Fazer" | "Fazendo" | "Feita";
  deadline: number; // timestamp in milliseconds
}

export interface ActionPlan {
  id: string;
  title: string;
  objective: string;
  createdAt: number; // timestamp in milliseconds
  status: "Não Iniciado" | "Em Andamento" | "Concluído";
  actions: Action[];
}

export type ActionStatus = Action["status"];
export type PlanStatus = ActionPlan["status"];

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
}
