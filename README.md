# Sistema de Gerenciamento de Planos de Ação

## Descrição

Desenvolvi um sistema frontend completo para gerenciamento de planos de ação utilizando React e TypeScript. A aplicação permite criar, visualizar, editar e excluir planos de ação, além de gerenciar as ações individuais de cada plano com transição automática de status.

## Tecnologias e Justificativas

Escolhi React como framework principal pela sua maturidade e ecossistema robusto. Optei por TypeScript para garantir type safety e melhor manutenibilidade do código.

Utilizei @tanstack/react-router para roteamento devido à sua abordagem type-safe e performance superior com lazy loading nativo. Para gerenciamento de estado, implementei @tanstack/react-query que oferece cache inteligente e tratamento automático de estados de loading e erro.

Para estilização, selecionei Tailwind CSS pela abordagem utility-first que permite desenvolvimento rápido e consistente. Adotei React Hook Form para formulários pela sua performance superior com renderizações mínimas.

Como build tool, escolhi Vite pelo desenvolvimento rápido com HMR instantâneo e excelente performance de build.

Utilizei Bun como gerenciador de pacotes principal devido à sua velocidade superior e compatibilidade com o ecossistema npm.

## Arquitetura

Estruturei o projeto seguindo princípios de Atomic Design para criar uma hierarquia clara de componentes:

- Componentes UI base (Button, Input, Card, Modal)
- Componentes de formulário reutilizáveis
- Componentes de layout complexos

Implementei uma arquitetura baseada em hooks customizados para gerenciamento de estado, separando claramente as responsabilidades entre UI, lógica de negócio e comunicação com API.

Para performance, utilizei React.memo em componentes puros e implementei lazy loading para componentes pesados. Desenvolvi um sistema de cache com atualizações otimistas para melhor experiência do usuário.

## Funcionalidades
Implementei a gestão completa de planos de ação com:

+ Criação, edição e exclusão de planos

+ Adição e gestão de ações individuais

+ Transição de status das ações

+ Cálculo automático do status do plano baseado nas ações

+ Validação de formulários

+ Interface responsiva e moderna

+ Feedback visual para todas as operações

+ Tratamento de erros

## Decisões de Design

Criei um sistema de design consistente com cores semânticas e tipografia hierárquica. Implementei padrões de interação como modais contextuais e edição inline para melhor experiência do usuário.

Para tratamento de datas, desenvolvi um sistema baseado em timestamps para evitar problemas de fuso horário e garantir consistência nos dados.

As decisões técnicas foram tomadas visando escalabilidade, performance e manutenibilidade do código. Priorizei a criação de componentes reutilizáveis e uma arquitetura que facilite futuras expansões.

## Como Executar

Para executar o projeto:

```bash
bun install
bun run dev
