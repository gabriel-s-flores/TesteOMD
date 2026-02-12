import type { ActionPlan, Session, User } from "../types";

export interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

export interface StoredActionPlan extends ActionPlan {
  userId: string;
}

export interface PasswordResetToken {
  id: string;
  email: string;
  tokenHash: string;
  expiresAt: number;
  used: boolean;
  createdAt: number;
}

interface DbSchema {
  users: StoredUser[];
  actionPlans: StoredActionPlan[];
  session: Session | null;
  passwordResetTokens: PasswordResetToken[];
}

const KEYS = {
  users: "omd_users",
  actionPlans: "omd_action_plans",
  session: "omd_session",
  passwordResetTokens: "omd_password_reset_tokens",
} as const;

const parseJSON = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const read = <T>(key: string, fallback: T) => {
  return parseJSON<T>(localStorage.getItem(key), fallback);
};

const write = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const mockDb = {
  getUsers(): StoredUser[] {
    return read<StoredUser[]>(KEYS.users, []);
  },

  saveUsers(users: StoredUser[]) {
    write(KEYS.users, users);
  },

  getActionPlans(): StoredActionPlan[] {
    return read<StoredActionPlan[]>(KEYS.actionPlans, []);
  },

  saveActionPlans(actionPlans: StoredActionPlan[]) {
    write(KEYS.actionPlans, actionPlans);
  },

  getSession(): Session | null {
    return read<Session | null>(KEYS.session, null);
  },

  saveSession(session: Session) {
    write(KEYS.session, session);
  },

  clearSession() {
    localStorage.removeItem(KEYS.session);
  },

  getPasswordResetTokens(): PasswordResetToken[] {
    return read<PasswordResetToken[]>(KEYS.passwordResetTokens, []);
  },

  savePasswordResetTokens(tokens: PasswordResetToken[]) {
    write(KEYS.passwordResetTokens, tokens);
  },

  exportSnapshot(): DbSchema {
    return {
      users: this.getUsers(),
      actionPlans: this.getActionPlans(),
      session: this.getSession(),
      passwordResetTokens: this.getPasswordResetTokens(),
    };
  },
};
