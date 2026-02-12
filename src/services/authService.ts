import type { Session, User } from "../types";
import {
  generateFakeJwt,
  generateId,
  generateSalt,
  hashPassword,
  hashValue,
  isStrongPassword,
  isValidEmail,
} from "../utils/security";
import { mockDb } from "./mockDb";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface ResetPasswordInput {
  email: string;
  token: string;
  newPassword: string;
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 24;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 15;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeUser = (user: {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const createSession = (userId: string): Session => {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const token = generateFakeJwt({
    sub: userId,
    exp: Math.floor(expiresAt / 1000),
  });

  return {
    token,
    userId,
    expiresAt,
  };
};

const getValidSessionSync = () => {
  const session = mockDb.getSession();
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    mockDb.clearSession();
    return null;
  }

  return session;
};

const getCurrentUserSync = () => {
  const session = getValidSessionSync();
  if (!session) return null;

  const users = mockDb.getUsers();
  const user = users.find((item) => item.id === session.userId);
  return user ? sanitizeUser(user) : null;
};

export const authService = {
  async register(
    input: RegisterInput,
  ): Promise<{ user: User; session: Session }> {
    await delay(500);

    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();

    if (name.length < 2) {
      throw new Error("Nome deve ter ao menos 2 caracteres.");
    }

    if (!isValidEmail(email)) {
      throw new Error("Informe um e-mail válido.");
    }

    if (!isStrongPassword(input.password)) {
      throw new Error(
        "Senha fraca. Use ao menos 8 caracteres com maiúscula, minúscula, número e símbolo.",
      );
    }

    const users = mockDb.getUsers();
    const alreadyExists = users.some((user) => user.email === email);
    if (alreadyExists) {
      throw new Error("E-mail já cadastrado.");
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(input.password, salt);
    const user = {
      id: generateId(),
      name,
      email,
      passwordHash,
      salt,
      createdAt: Date.now(),
    };

    mockDb.saveUsers([...users, user]);

    const session = createSession(user.id);
    mockDb.saveSession(session);

    return {
      user: sanitizeUser(user),
      session,
    };
  },

  async login(input: LoginInput): Promise<{ user: User; session: Session }> {
    await delay(500);

    const email = input.email.trim().toLowerCase();
    const users = mockDb.getUsers();
    const user = users.find((item) => item.email === email);

    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    const candidateHash = await hashPassword(input.password, user.salt);
    if (candidateHash !== user.passwordHash) {
      throw new Error("Credenciais inválidas");
    }

    const session = createSession(user.id);
    mockDb.saveSession(session);

    return {
      user: sanitizeUser(user),
      session,
    };
  },

  async logout(): Promise<void> {
    await delay(500);
    mockDb.clearSession();
  },

  getCurrentUserSync,

  getValidSessionSync,

  async getCurrentUser(): Promise<User | null> {
    await delay(500);
    return getCurrentUserSync();
  },

  async requestPasswordReset(emailInput: string): Promise<{ token?: string }> {
    await delay(500);

    const email = emailInput.trim().toLowerCase();
    if (!isValidEmail(email)) {
      throw new Error("Informe um e-mail válido.");
    }

    const users = mockDb.getUsers();
    const userExists = users.some((user) => user.email === email);

    if (!userExists) {
      return {};
    }

    const rawToken = generateId().replace(/-/g, "").slice(0, 8).toUpperCase();
    const tokenHash = await hashValue(rawToken);

    const currentTokens = mockDb
      .getPasswordResetTokens()
      .filter((token) => token.email !== email || token.used);

    currentTokens.push({
      id: generateId(),
      email,
      tokenHash,
      createdAt: Date.now(),
      expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
      used: false,
    });

    mockDb.savePasswordResetTokens(currentTokens);

    return { token: rawToken };
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    await delay(500);

    const email = input.email.trim().toLowerCase();
    if (!isValidEmail(email)) {
      throw new Error("Informe um e-mail válido.");
    }

    if (!isStrongPassword(input.newPassword)) {
      throw new Error(
        "Senha fraca. Use ao menos 8 caracteres com maiúscula, minúscula, número e símbolo.",
      );
    }

    const users = mockDb.getUsers();
    const userIndex = users.findIndex((user) => user.email === email);
    if (userIndex === -1) {
      throw new Error("Token inválido ou expirado.");
    }

    const providedHash = await hashValue(input.token.trim().toUpperCase());
    const tokens = mockDb.getPasswordResetTokens();
    const tokenIndex = tokens.findIndex(
      (token) =>
        token.email === email &&
        token.tokenHash === providedHash &&
        !token.used &&
        token.expiresAt > Date.now(),
    );

    if (tokenIndex === -1) {
      throw new Error("Token inválido ou expirado.");
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(input.newPassword, salt);

    users[userIndex] = {
      ...users[userIndex],
      salt,
      passwordHash,
    };
    mockDb.saveUsers(users);

    const updatedTokens = [...tokens];
    updatedTokens[tokenIndex] = { ...updatedTokens[tokenIndex], used: true };
    mockDb.savePasswordResetTokens(updatedTokens);
  },

  getCurrentUserOrThrow(): User {
    const user = getCurrentUserSync();
    if (!user) {
      throw new Error("Sessão inválida. Faça login novamente.");
    }

    return user;
  },
};
