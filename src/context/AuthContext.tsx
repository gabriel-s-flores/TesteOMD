/* eslint-disable react-refresh/only-export-components */

import { useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { queryKeys } from "../hooks/queryKeys";
import { authService } from "../services/authService";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ token?: string }>;
  resetPassword: (input: {
    email: string;
    token: string;
    newPassword: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUserSync();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const result = await authService.login(input);
      setUser(result.user);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.actionPlansRoot,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.plansRoot });
    },
    [queryClient],
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const result = await authService.register(input);
      setUser(result.user);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.actionPlansRoot,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.plansRoot });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const requestPasswordReset = useCallback(async (email: string) => {
    return authService.requestPasswordReset(email);
  }, []);

  const resetPassword = useCallback(
    async (input: { email: string; token: string; newPassword: string }) => {
      return authService.resetPassword(input);
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
    }),
    [
      user,
      isLoading,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
};
