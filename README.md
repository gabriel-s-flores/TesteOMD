# Sistema de Gerenciamento de Planos de Ação

## Descrição

Aplicação frontend em **React + TypeScript** para gestão de planos de ação com autenticação mock robusta, recuperação de senha simulada e isolamento de dados por usuário (multi-tenant).

Cada usuário possui seus próprios planos e ações. Ao trocar de conta, os dados exibidos mudam conforme o usuário autenticado.

---

## Stack Tecnológica

- **Framework:** React 19 + Vite
- **Roteamento:** TanStack Router (file-based)
- **Estado remoto/cache:** TanStack React Query
- **Formulários:** React Hook Form
- **Estilo:** Tailwind CSS
- **Persistência mock:** LocalStorage

---

## Funcionalidades

### Gestão de Planos

- Criar, editar e excluir planos de ação
- Criar, editar, excluir e mover ações no board
- Cálculo automático de status do plano

### Autenticação (Mock API)

- Cadastro com **nome, e-mail e senha**
- Login com e-mail e senha
- Logout com limpeza de sessão/cache
- Persistência de sessão no LocalStorage (token fictício)

### Recuperação de Senha (Simulada)

- Fluxo de “esqueci minha senha” gerando token mock
- Validação de token e redefinição de senha
- Expiração/uso único do token simulados

### Segurança Aplicada (mock com boas práticas)

- Senha nunca salva em texto puro
- Hash com `SHA-256` + salt por usuário
- Validação de formato de e-mail
- Validação de força da senha (8+, maiúscula, minúscula, número e símbolo)
- Erro genérico no login: **"Credenciais inválidas"**

### Multi-tenancy / Isolamento de Dados

- Cada plano é persistido com `userId`
- Consultas filtradas por usuário autenticado
- Proteção de acesso cruzado entre contas
- Query keys com escopo por usuário para evitar vazamento visual de cache

---

## Estrutura de Persistência Mock

No LocalStorage, a aplicação mantém “tabelas” simuladas:

- `omd_users`
- `omd_action_plans`
- `omd_session`
- `omd_password_reset_tokens`

---

## Rotas

### Públicas

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

### Privadas

- `/`
- `/plans/$id/actions`

Rotas privadas redirecionam para `/login` quando não há sessão válida.

---

## Como Executar

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
```
