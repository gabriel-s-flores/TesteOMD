# rules.md

## System Instructions — Projeto TesteOMD

### 1) Tech Stack (versões exatas)

#### Runtime / Linguagem

- **TypeScript**: `~5.9.3`
- **JavaScript ESM** (`"type": "module"`)
- **Node + npm/bun** (há `package-lock.json` e `bun.lock` no repositório)

#### Frontend

- **React**: `^19.1.1`
- **React DOM**: `^19.1.1`
- **Vite**: `npm:rolldown-vite@7.1.14` (via `overrides`)
- **@vitejs/plugin-react**: `^5.0.4`
- **Tailwind CSS**: `^4.1.14`
- **@tailwindcss/vite**: `^4.1.14`

#### Roteamento e Data Layer

- **@tanstack/react-router**: `^1.133.3`
- **@tanstack/react-query**: `^5.90.4`
- **@tanstack/react-query-devtools**: `^5.90.2`
- **@tanstack/react-router-devtools**: `^1.133.3`

#### Forms

- **react-hook-form**: `^7.65.0`

#### Qualidade / Testes

- **ESLint**: `^9.36.0`
- **Prettier**: `^3.6.2`
- **Vitest**: `^4.0.1`
- **Testing Library**: `@testing-library/react ^16.3.0`, `@testing-library/jest-dom ^6.9.1`, `@testing-library/user-event ^14.6.1`
- **jsdom**: `^27.0.1`

---

### 2) Arquitetura do Projeto

## Padrão arquitetural observado

Este projeto segue uma **arquitetura frontend em camadas por responsabilidade + organização por domínio de UI**, com influência de **MVC adaptado para React** e separação de concerns próxima de **Clean (UI ↔ hooks/use-cases ↔ services ↔ model/types)**.

Não é um MVC clássico de backend; aqui:

- **Model** = contratos de dados e tipos (`src/types`)
- **Controller/Presenter de página** = componentes de página/rota que orquestram carregamento, mutações e navegação (`src/components/pages`, `src/routes`)
- **Service/Use-case** = acesso a dados e regras transacionais (`src/services`, `src/hooks`)

## Convenção de pastas (obrigatória)

- `src/types/` → **modelos de domínio e tipos compartilhados**.
- `src/services/` → **integração de dados** (API/mock/local storage), sem código de UI.
- `src/hooks/` → **use-cases de frontend** (orquestra query/mutation, cache, toast, regras de fluxo).
- `src/routes/` → definição de rotas com TanStack Router (file-based routing).
- `src/components/pages/` → componentes de página (camada controladora da tela).
- `src/components/forms/` → componentes de formulário.
- `src/components/ui/` → componentes visuais reutilizáveis e puros.
- `src/components/modals/` → composição e gerenciamento de modais.
- `src/utils/` → utilitários puros e funções determinísticas.
- `src/test/` + `*.test.tsx` → setup e testes.

## Regras de dependência

- `components/ui` **não** depende de `services`.
- `components/pages` pode usar `hooks` e componentes de UI.
- `hooks` podem usar `services`, `types`, `utils` e libs de estado/cache.
- `services` podem usar `types` e `utils`, mas **não** podem importar componentes React.
- `types` deve ser o mais estável e livre de dependências possível.

---

### 3) Padrões de Código

## Nomenclatura

- **Componentes React**: `PascalCase` (ex.: `ActionsManagerPage.tsx`, `PlanCard.tsx`).
- **Hooks customizados**: `camelCase` com prefixo `use` (ex.: `useActionPlans.ts`).
- **Funções/variáveis**: `camelCase`.
- **Tipos/interfaces/type aliases**: `PascalCase` (`Action`, `ActionPlan`).
- **Rotas TanStack file-based**: seguir convenção do router (ex.: `plans/$id/actions.tsx`).

## Tipagem

- Usar TypeScript em todas as camadas.
- Evitar `any`; preferir `unknown` + narrowing quando necessário.
- Centralizar contratos em `src/types`.
- Para payloads de entrada/atualização, usar `Omit<>`, `Pick<>`, unions literais e tipos específicos (como já ocorre em `mockApi`).
- Em mutações/query functions, declarar explicitamente parâmetros e retornos.

## Tratamento de erros (padrão do projeto)

- `services` devem lançar `Error` com mensagem semântica de domínio (ex.: “Plano não encontrado”).
- `hooks/use-cases` devem capturar efeitos de erro e traduzir em feedback de UX (toast e estado de erro).
- `pages/controllers` devem renderizar fallback de erro/loading de forma explícita.
- Nunca silenciar erro com `catch` vazio.

## Estado e cache

- Toda leitura assíncrona via `@tanstack/react-query` (`useQuery`/`useSuspenseQuery`).
- Toda escrita via `useMutation` com atualização de cache por `invalidateQueries` e/ou `setQueryData`.
- Chaves de query devem ser consistentes e padronizadas (`["actionPlans"]`, `["plan", planId]`).

---

### 4) Bibliotecas Preferidas (evitar novas libs sem necessidade)

Para manter consistência, **preferir sempre as libs já adotadas**:

- **Data fetching / cache / mutations**: `@tanstack/react-query`
- **Roteamento**: `@tanstack/react-router`
- **Formulários**: `react-hook-form`
- **Estilização**: `tailwindcss` + componentes locais (`src/components/ui`)
- **Testes unitários/integrados**: `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event`
- **Lint/format**: `eslint` + `prettier`

### Política de adoção de novas dependências

Só adicionar nova biblioteca quando:

1. houver lacuna real não coberta pelo stack atual;
2. houver ganho técnico claro (manutenibilidade/performance);
3. impacto em bundle e complexidade for justificado;
4. a decisão for documentada em PR.

---

### 5) O que NÃO fazer

- **Não colocar lógica de negócio em componentes de UI** (`src/components/ui`).
- **Não acoplar página diretamente a detalhes de infraestrutura** quando houver hook/use-case para isso.
- **Não manipular estado remoto manualmente com `useState` se já é caso de React Query**.
- **Não criar contratos de dados duplicados fora de `src/types`**.
- **Não usar `any` sem justificativa técnica explícita**.
- **Não tratar erro apenas com `console.log`**; sempre refletir em UX (toast/fallback).
- **Não quebrar padrão de query keys**.
- **Não introduzir nova lib de formulário, roteamento, fetch, testes ou styling sem aprovação**.
- **Não misturar responsabilidade de rota, regra de negócio e componente visual no mesmo arquivo**.

---

### 6) Exemplo de mapeamento (referência deste projeto)

- **Model**: `src/types/index.ts`
- **Controller de página/rota**: `src/components/pages/ActionsManagerPage.tsx` + `src/routes/plans/$id/actions.tsx`
- **Service / Use-case**: `src/services/mockApi.ts` e `src/hooks/useActionPlans.ts`

> Ao gerar código novo, respeitar este mapeamento e as regras acima como instruções de sistema do projeto.
