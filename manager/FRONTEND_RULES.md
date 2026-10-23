# Guia de Projeto Frontend — React + TypeScript (Estrutura + Padrões de Código)

Este documento define os padrões oficiais de desenvolvimento para o frontend do **Evolution Go** baseado no princípio de **Componentização Extrema** e arquitetura limpa em camadas (adaptado da mentalidade Nuxt para React + Vite).

---

## 1) Estrutura de Pastas (React + Vite)

Sempre respeitar rigorosamente a estrutura abaixo ao criar novos arquivos e pastas no frontend (`manager/`):

```text
manager/
├── src/
│   ├── assets/          # Fontes, ícones SVG, imagens processadas, CSS global
│   ├── components/      # Componentes de UI puros (pequenos, atômicos, sem chamadas de API)
│   │   ├── ui/          # Primitivos genéricos de base (Button, Card, Badge, Modal, Input)
│   │   ├── dashboard/   # Componentes específicos do Dashboard (MetricCard, SystemStatusCard)
│   │   └── instances/   # Componentes específicos de Instâncias (InstanceCard, QrCodeModal)
│   ├── hooks/           # "Composables" - Funções de domínio, estado e regras de negócio (useX)
│   ├── layouts/         # Layouts estruturais (DefaultLayout.tsx, AuthLayout.tsx)
│   ├── guards/          # Middlewares de rota e proteção (AuthGuard.tsx)
│   ├── pages/           # Páginas de rota em minúsculas (dashboard.tsx, instances.tsx, login.tsx)
│   ├── services/        # Camada de dados / Clientes HTTP (apiClient.ts, instancesService.ts)
│   ├── types/           # Tipos globais e DTOs TypeScript (InstanceDTO.ts, ServerStatusDTO.ts)
│   ├── utils/           # Funções puras e helpers sem estado (formatDate.ts, maskApiKey.ts)
│   ├── constants/       # Enums, constantes globais e chaves de configuração
│   ├── App.tsx          # Shell / Root do app com providers
│   └── main.tsx         # Ponto de entrada do React
├── public/              # Arquivos estáticos servidos na raiz (favicon, assets raw)
├── index.html           # Template HTML do Vite
├── tailwind.config.ts   # Tema e design tokens
├── vite.config.ts       # Configuração de build (output direto para manager/dist)
├── package.json
└── tsconfig.json
```

---

## 2) Princípios de Arquitetura

1. **Componentização Extrema**
   - Componentes pequenos, coesos, previsíveis e reusáveis.
   - **Nada de lógica de dados (`fetch`, `axios`) ou regras de negócio dentro de componentes de UI.**
   - Todo componente deve ter IDs fixos/únicos e props bem definidas para garantir estabilidade e testes visuais.

2. **Hooks como "Composables" para Lógica de Domínio**
   - `/src/hooks/useX.ts` gerenciam: busca de dados, estado local/global, regras de negócio e orquestração.
   - O componente apenas consome o hook e repassa dados para renderização.

3. **Responsabilidade Única (Single Responsibility)**
   - Um arquivo faz **uma única coisa bem feita**. Se um componente ultrapassar 150-200 linhas, quebre em sub-componentes.

4. **Tipagem Estrita (Zero `any`)**
   - Sempre tipar explicitamente props, retornos, estados e contratos de API.
   - Todo retorno de endpoint backend deve ter seu DTO correspondente em `src/types/`.

5. **Sempre TypeScript**
   - Todos os arquivos com JSX devem ser `.tsx`, e lógica pura `.ts`.
   - Tipos explícitos e sem inferências arriscadas.

6. **Padrão de Camadas (Fluxo Unidirecional)**
   - **UI (`components` / `pages`)** ➡️ **Hooks / Composables (`hooks`)** ➡️ **Acesso a Dados (`services`)** ➡️ **Backend Go**.

7. **Imports Explícitos**
   - Sempre utilize imports explícitos em cada arquivo.
   - Evitar auto-imports ou variáveis globais mágicas.

---

## 3) Regras de Nomenclatura

- **Componentes React (`src/components/`)** ➡️ **PascalCase.tsx**  
  Ex.: `UserCard.tsx`, `MetricCard.tsx`, `InstanceRow.tsx`

- **Páginas (`src/pages/`)** ➡️ **minúsculas sem traços**, usando subpastas se necessário  
  Ex.: `dashboard.tsx`, `instances.tsx`, `login.tsx`  
  Se precisar separar por contexto:
  - `src/pages/instances/create.tsx`
  - `src/pages/instances/details.tsx`

- **Layouts (`src/layouts/`)** ➡️ **PascalCase.tsx**  
  Ex.: `DefaultLayout.tsx`, `AuthLayout.tsx`

- **Hooks / Composables (`src/hooks/`)** ➡️ prefixo `use` + **PascalCase.ts**  
  Ex.: `useInstances.ts`, `useAuth.ts`, `useServerHealth.ts`

- **Guards / Middlewares (`src/guards/`)** ➡️ **PascalCase.tsx** ou **camelCase.ts**  
  Ex.: `AuthGuard.tsx`, `guestGuard.ts`

- **Utils (`src/utils/`)** ➡️ **camelCase.ts**  
  Ex.: `formatDate.ts`, `maskApiKey.ts`, `calculateTotal.ts`

- **Serviços de API (`src/services/`)** ➡️ **camelCase.ts**  
  Ex.: `instancesService.ts`, `authService.ts`

- **Tipos e DTOs (`src/types/`)** ➡️ **PascalCase.ts**  
  Ex.: `InstanceDTO.ts`, `ServerStatusDTO.ts`, `AuthDTO.ts`
