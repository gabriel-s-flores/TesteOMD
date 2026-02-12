import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const fallbackMap: Record<string, string> = {
        "common.status.loading": "Carregando...",
        "plans.form.title": "Título",
        "plans.form.objective": "Objetivo",
        "plans.form.submit_create": "Criar Plano",
        "plans.form.submit_update": "Atualizar Plano",
        "common.buttons.cancel": "Cancelar",
        "plans.form.errors.title_required": "Título é obrigatório",
        "plans.form.errors.objective_required": "Objetivo é obrigatório",
      };
      return fallbackMap[key] ?? key;
    },
    i18n: {
      language: "pt-BR",
      resolvedLanguage: "pt-BR",
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock of IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock of ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
