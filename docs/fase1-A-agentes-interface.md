# Plano de Implementação: Fase 1-A - Interface e Navegação de Agentes

## 0. Sequência de Implementação e Checkpoints

### Etapa 1: Navegação Básica [✓]
1. [✓] Adicionar item "Agentes" no menu principal
2. [✓] Criar estrutura base de rotas
3. [✓] Implementar breadcrumbs
**Checkpoint**: [✓] Navegação funcionando sem quebrar o menu existente

### Etapa 2: Lista de Agentes (Dados Mockados) [✓]
1. [✓] Criar dados mockados de agentes
2. [✓] Implementar grid/lista básica
3. [✓] Adicionar card simples do agente
**Checkpoint**: [✓] Lista exibindo dados mockados corretamente

### Etapa 3: Detalhes do Card [✓]
1. [✓] Expandir card com mais informações
2. [✓] Adicionar estados (online/offline)
3. [✓] Implementar ações básicas
**Checkpoint**: [✓] Cards interativos funcionando

### Lições Aprendidas - Validação de Implementação
1. **Erro de Validação**:
   - Afirmamos conclusão sem validar build
   - Não seguimos checklist de validação
   - Não testamos em todos os ambientes

2. **Problemas Identificados**:
   - Erro de hidratação na página principal
   - Uso incorreto de hooks em server component
   - Necessidade de refatoração para melhor arquitetura

3. **Checklist de Validação**:
   - [ ] Executar build completo
   - [ ] Verificar console de erros
   - [ ] Testar em ambiente limpo
   - [ ] Validar SSR e hidratação
   - [ ] Documentar decisões arquiteturais

4. **Próximos Passos**:
   - Refatorar página para melhor separação client/server
   - Implementar testes de hidratação
   - Validar performance após mudanças
   - Atualizar documentação técnica

### Lições Aprendidas - Validação em Desenvolvimento

1. **Validação Contínua**:
   - Priorizar validação em ambiente de desenvolvimento (npm run dev)
   - Observar erros em tempo real durante o desenvolvimento
   - Corrigir problemas assim que aparecem
   - Não esperar o build final para descobrir problemas

2. **Checklist de Desenvolvimento**:
   ```markdown
   Antes de cada commit:
   - [ ] Verificar console do navegador
   - [ ] Testar funcionalidade após cada mudança
   - [ ] Validar hidratação em desenvolvimento
   - [ ] Documentar aprendizados imediatamente
   ```

3. **Garantia de Consistência**:
   - Sempre consultar lições aprendidas antes de implementações similares
   - Manter documentação atualizada durante o desenvolvimento
   - Criar padrões baseados em experiências anteriores
   - Revisar documentação periodicamente

4. **Processo de Documentação**:
   - Documentar problemas e soluções em tempo real
   - Categorizar aprendizados para fácil consulta
   - Manter exemplos práticos e concretos
   - Referenciar arquivos e componentes específicos

### Decisões Arquiteturais - Refatoração da Página de Agentes

1. **Separação de Responsabilidades**:
   - Página principal (`page.tsx`) como server component
   - Componente `AgentList` como client component
   - Componente `AgentCard` mantido como client component

2. **Motivações**:
   - Melhor performance inicial com SSR
   - Isolamento de lógica interativa
   - Redução de JavaScript no cliente
   - Melhor manutenibilidade

3. **Estrutura de Arquivos**:
   ```
   /agents/
   ├── page.tsx                 # Server Component
   └── _components/
       ├── agent-list.tsx       # Client Component
       └── agent-card.tsx       # Client Component
   ```

4. **Fluxo de Dados**:
   - Dados mockados carregados no servidor
   - Props passadas para componentes client
   - Interações gerenciadas em componentes client
   - Feedback via toast no cliente

5. **Próximos Passos**:
   - [ ] Implementar testes de hidratação
   - [ ] Validar performance
   - [ ] Documentar padrões estabelecidos
   - [ ] Criar guia de boas práticas

### Etapa 4: Filtros e Busca [✓]
1. [✓] Adicionar barra de busca
2. [✓] Implementar filtros básicos
3. [✓] Adicionar ordenação
**Checkpoint**: [✓] Filtros funcionando com dados mockados

#### Detalhes da Implementação
1. **Componentes Criados**:
   - `SearchBar`: Barra de busca com debounce e limpar
   - `StatusFilter`: Filtro de status (Todos, Ativos, Pausados)
   - `SortSelect`: Ordenação por nome, status e data
   - `FilterGroup`: Container responsivo para os filtros

2. **Funcionalidades**:
   - Busca por nome com debounce de 300ms
   - Filtro por status (Todos, Ativos, Pausados)
   - Ordenação por nome, status e última atualização
   - Persistência dos filtros na URL
   - Layout responsivo
   - Estado vazio para resultados não encontrados

3. **Tecnologias Utilizadas**:
   - `nuqs` para gerenciamento de estado na URL
   - `useDebounce` hook customizado
   - Componentes Shadcn UI (Select, Input)
   - Tailwind CSS para estilos e responsividade

4. **Decisões Técnicas**:
   - Uso de `useQueryState` para sincronização com URL
   - Memoização de filtros com `useMemo`
   - Componentes client-side para interatividade
   - Feedback visual para estados de filtro

5. **Próximos Passos**:
   - Integrar com API real
   - Adicionar testes
   - Implementar paginação
   - Melhorar performance se necessário

### Etapa 5: Formulário de Criação [ ]
1. [ ] Criar wizard básico
2. [ ] Implementar steps de navegação
3. [ ] Adicionar validações client-side
**Checkpoint**: Wizard funcionando com dados mockados

### Etapa 6: Página de Detalhes [ ]
1. [ ] Criar layout de tabs
2. [ ] Implementar visão geral
3. [ ] Adicionar seções básicas
**Checkpoint**: Navegação entre tabs funcionando

### Etapa 7: Responsividade [ ]
1. [ ] Adaptar lista para mobile
2. [ ] Ajustar formulários
3. [ ] Testar breakpoints
**Checkpoint**: Interface responsiva em todos dispositivos

### Etapa 8: Feedback e UX [ ]
1. [ ] Adicionar loading states
2. [ ] Implementar mensagens de feedback
3. [ ] Melhorar transições
**Checkpoint**: Experiência fluida e com feedback adequado

### Etapa 9: Testes e Refinamentos [ ]
1. [ ] Testes de componentes básicos
2. [ ] Validar acessibilidade
3. [ ] Ajustes finais de UI
**Checkpoint**: Testes passando e interface polida

### Observações para Implementação:
- Cada etapa será implementada com dados mockados
- Checkpoints devem ser validados antes de prosseguir
- Foco em não quebrar funcionalidades existentes
- Commits pequenos e frequentes
- [IMPORTANTE] Ao final da implementação, remover todos os dados mockados:
  - Remover arquivo `_data/mock-data.ts`
  - Substituir por chamadas reais à API
  - Atualizar componentes para usar dados reais
  - Validar funcionamento após remoção

## 1. Análise do Startkit UI

### 1.1 Componentes UI Existentes
- **Layout Base**: Estrutura principal do dashboard
- **Navegação**: Sistema de menu e breadcrumbs
- **Componentes Shadcn/UI**: 
  ```
  /components/ui/
  ├── button.tsx
  ├── card.tsx
  ├── dialog.tsx
  ├── dropdown-menu.tsx
  ├── form.tsx
  ├── input.tsx
  ├── select.tsx
  ├── tabs.tsx
  └── toast.tsx
  ```

### 1.2 Temas e Estilos
- Cores do sistema
- Tipografia
- Espaçamentos
- Breakpoints responsivos

### 1.3 Arquivos de Layout Existentes
```
/app/layout.tsx                 # Layout principal
/app/(authenticated)/layout.tsx # Layout autenticado
/components/layout/            # Componentes de layout
```

## 2. Estrutura de Navegação

### 2.1 Menu Principal
```
Dashboard/
└── Agentes/                # Nova seção
    ├── Meus Agentes       # Lista principal
    ├── Templates         # Biblioteca de templates
    ├── Configurações    # Configurações gerais
    └── Métricas        # Dashboard de métricas
```

### 2.2 Hierarquia de Páginas
```
/agents/
├── /                    # Lista principal
├── new/                # Criar novo agente
├── templates/         # Biblioteca de templates
├── settings/         # Configurações
├── metrics/         # Métricas e analytics
└── [id]/           # Detalhes do agente
    ├── overview/   # Visão geral
    ├── edit/      # Edição
    ├── knowledge/ # Base de conhecimento
    └── metrics/  # Métricas individuais
```

## 3. Wireframes e Componentes

### 3.1 Lista Principal (Meus Agentes)
```typescript
// Componentes necessários
interface AgentListPage {
  header: {
    title: string
    actions: {
      newAgent: Button
      filters: FilterGroup
      search: SearchInput
    }
  }
  content: {
    list: {
      view: 'grid' | 'list'
      items: AgentCard[]
      pagination: Pagination
    }
    emptyState: EmptyState
  }
  sidebar: {
    filters: {
      status: MultiSelect
      template: MultiSelect
      date: DateRangePicker
    }
  }
}

// Estados e interações
interface AgentListStates {
  loading: boolean
  error: Error | null
  filters: FilterState
  pagination: {
    page: number
    perPage: number
    total: number
  }
  selection: {
    selected: string[]
    actions: BatchActions
  }
}
```

### 3.2 Card do Agente
```typescript
interface AgentCard {
  // Dados visuais
  avatar: {
    image?: string
    fallback: string
    status: 'online' | 'offline' | 'busy'
  }
  info: {
    name: string
    template: string
    status: AgentStatus
    metrics: {
      conversations: number
      satisfaction: number
    }
  }
  actions: {
    primary: 'edit' | 'view'
    secondary: string[]
    menu: DropdownMenu
  }
  
  // Estados
  states: {
    loading: boolean
    selected: boolean
    highlight: boolean
  }
}
```

### 3.3 Formulário de Criação/Edição
```typescript
interface AgentForm {
  // Seções do formulário
  sections: {
    basic: {
      name: TextInput
      description: Textarea
      avatar: ImageUpload
    }
    template: {
      selector: TemplateSelect
      customization: TemplateCustomization
    }
    knowledge: {
      sources: FileUpload
      faqs: FAQEditor
      responses: ResponseEditor
    }
    settings: {
      availability: ScheduleEditor
      handoff: HandoffSettings
      notifications: NotificationSettings
    }
  }

  // Navegação
  navigation: {
    progress: ProgressIndicator
    validation: ValidationSummary
    actions: {
      previous: Button
      next: Button
      save: Button
      cancel: Button
    }
  }
}
```

### 3.4 Página de Detalhes
```typescript
interface AgentDetails {
  header: {
    breadcrumb: Breadcrumb
    title: EditableTitle
    actions: ActionGroup
  }
  tabs: {
    overview: {
      status: StatusCard
      metrics: MetricCards
      activity: ActivityFeed
    }
    knowledge: {
      sources: SourceList
      editor: KnowledgeEditor
    }
    conversations: {
      list: ConversationList
      filters: FilterGroup
    }
    settings: {
      form: SettingsForm
      danger: DangerZone
    }
  }
}
```

## 4. Protótipos Interativos

### 4.1 Fluxos Principais
1. **Criar Novo Agente**
   ```
   Início
   └── Escolher Template
       └── Configuração Básica
           └── Base de Conhecimento
               └── Configurações
                   └── Revisão
                       └── Conclusão
   ```

2. **Gerenciar Agente**
   ```
   Lista
   └── Detalhes
       ├── Editar Informações
       ├── Atualizar Conhecimento
       ├── Ajustar Configurações
       └── Visualizar Métricas
   ```

### 4.2 Estados e Transições
```typescript
interface UIStates {
  // Estados globais
  authentication: {
    status: 'authenticated' | 'loading' | 'error'
    user: UserContext
  }
  
  // Estados de página
  page: {
    loading: boolean
    error: Error | null
    data: PageData
  }
  
  // Estados de formulário
  form: {
    dirty: boolean
    valid: boolean
    submitting: boolean
    errors: FormErrors
  }
  
  // Estados de navegação
  navigation: {
    current: Route
    previous: Route
    blocked: boolean
  }
}
```

## 5. Componentes Mockados

### 5.1 Dados de Exemplo
```typescript
const mockAgents = [
  {
    id: 'agt_1',
    name: 'Assistente de Vendas',
    template: 'sales',
    status: 'active',
    metrics: {
      conversations: 150,
      satisfaction: 4.8
    }
  },
  // ... mais exemplos
];

const mockTemplates = [
  {
    id: 'tmpl_1',
    name: 'Vendedor Amigável',
    description: 'Ideal para e-commerce',
    category: 'sales'
  },
  // ... mais exemplos
];
```

### 5.2 Interações Simuladas
```typescript
interface MockedInteractions {
  // Delays simulados
  delays: {
    list: number
    save: number
    delete: number
  }
  
  // Respostas
  responses: {
    success: MockResponse
    validation: MockValidation
    error: MockError
  }
  
  // Estados
  states: {
    loading: boolean
    error: boolean
    empty: boolean
  }
}
```

## 6. Responsividade e Adaptação

### 6.1 Breakpoints
```typescript
const breakpoints = {
  mobile: 'max-width: 640px',
  tablet: 'max-width: 1024px',
  desktop: 'min-width: 1025px'
};

const layoutAdaptations = {
  mobile: {
    navigation: 'bottom',
    cards: 'list',
    actions: 'modal'
  },
  tablet: {
    navigation: 'collapsed',
    cards: 'grid',
    actions: 'dropdown'
  },
  desktop: {
    navigation: 'expanded',
    cards: 'grid',
    actions: 'inline'
  }
};
```

### 6.2 Componentes Responsivos
```typescript
interface ResponsiveComponents {
  // Layout
  navigation: {
    mobile: BottomNav
    tablet: SidebarCollapsed
    desktop: SidebarExpanded
  }
  
  // Conteúdo
  content: {
    mobile: StackedLayout
    tablet: GridLayout
    desktop: GridLayout
  }
  
  // Ações
  actions: {
    mobile: ActionSheet
    tablet: Dropdown
    desktop: ButtonGroup
  }
}
```

### Lições Aprendidas - Gerenciamento de Módulos

1. **Validação de Dependências**:
   - Sempre verificar a configuração de aliases no `tsconfig.json`
   - Validar se todos os caminhos de importação estão corretamente mapeados
   - Testar a build após qualquer alteração em configurações de módulos

2. **Análise de Impacto**:
   - Antes de qualquer alteração em estrutura de módulos:
     - Verificar todos os arquivos que importam o módulo
     - Documentar as dependências encontradas
     - Testar em ambiente de desenvolvimento
     - Validar a build completa

3. **Checklist de Alterações em Módulos**:
   ```markdown
   - [ ] Verificar uso atual do módulo (grep/search)
   - [ ] Documentar todos os arquivos dependentes
   - [ ] Validar configuração de aliases
   - [ ] Testar em desenvolvimento
   - [ ] Executar build completa
   - [ ] Atualizar documentação
   ```

4. **Boas Práticas**:
   - Manter consistência nos caminhos de importação
   - Documentar novos aliases adicionados
   - Validar build após alterações em configuração
   - Seguir padrões estabelecidos do projeto

### Problemas de Importação e Estratégia de Resolução

1. **Diagnóstico do Problema**:
   - Erro de importação do hook `useDebounce`
   - Erros generalizados de importações relativas
   - Configuração incompleta de aliases no `tsconfig.json`

2. **Impacto no Projeto**:
   - Build quebrada
   - Problemas de importação em múltiplos componentes
   - Necessidade de revisão da estrutura de importações

3. **Estratégia de Resolução**:
   a. **Análise Completa**:
      - Mapear todas as importações problemáticas
      - Identificar padrões de uso
      - Documentar dependências entre componentes

   b. **Plano de Correção**:
      - Revisar e atualizar configuração de aliases
      - Padronizar estrutura de importações
      - Implementar solução que mantenha compatibilidade

   c. **Validação**:
      - Testar em ambiente de desenvolvimento
      - Verificar build completa
      - Garantir que não há regressões

4. **Próximos Passos**:
   - [ ] Criar issue para tracking do problema
   - [ ] Implementar correções em fases
   - [ ] Validar cada fase antes de prosseguir
   - [ ] Atualizar documentação

5. **Lições Aprendidas**:
   - Importância de validação completa antes de marcar como concluído
   - Necessidade de análise de impacto antes de alterações
   - Valor de uma estrutura de importações bem definida

## Problema de Importações Relativas - Análise Detalhada

Durante a implementação, identificamos um problema crítico com as importações no projeto. O ESLint está reportando erros de "Relative imports from parent directories are not allowed" em diversos arquivos.

### Diagnóstico Detalhado

1. **Configuração Atual**:
   - O `tsconfig.json` tem aliases configurados corretamente (ex: `@/components/*`, `@/lib/*`, `@/hooks/*`, etc.)
   - A regra `principios` exige o uso de aliases em vez de importações relativas
   - O ESLint está configurado com a regra `import/no-relative-parent-imports`
   - O resolver do ESLint para TypeScript foi configurado mas não está funcionando como esperado

2. **Problemas Identificados**:
   - Múltiplos arquivos usando importações relativas (`../` ou `./`)
   - Violação das regras de importação definidas no projeto
   - Inconsistência no padrão de importações
   - O ESLint não está reconhecendo corretamente os aliases do TypeScript

3. **Impacto**:
   - Build quebrada devido a erros de importação
   - Dificuldade em manter um padrão consistente de importações
   - Possíveis problemas de refatoração futura

### Plano de Correção Revisado

1. **Primeira Fase - Configuração do ESLint**:
   - Revisar e ajustar a configuração do ESLint
   - Verificar se o plugin `eslint-import-resolver-typescript` está configurado corretamente
   - Considerar a possibilidade de ajustar ou desabilitar temporariamente a regra `import/no-relative-parent-imports`

2. **Segunda Fase - Mapeamento**:
   - Listar todos os arquivos com importações relativas
   - Identificar os aliases correspondentes para cada importação
   - Documentar as mudanças necessárias
   - Criar um script para automatizar a detecção de importações relativas

3. **Terceira Fase - Refatoração**:
   - Substituir importações relativas por aliases
   - Priorizar arquivos críticos e componentes principais
   - Testar cada mudança para garantir que não quebra funcionalidades
   - Implementar as mudanças em pequenos lotes para facilitar o rollback se necessário

4. **Quarta Fase - Validação**:
   - Executar build completo após cada conjunto de mudanças
   - Verificar se não há novos erros introduzidos
   - Documentar quaisquer problemas encontrados
   - Implementar testes para garantir que as importações estão funcionando corretamente

### Lições Aprendidas

1. **Padronização de Importações**:
   - Sempre usar aliases configurados no `tsconfig.json`
   - Evitar completamente importações relativas
   - Manter consistência em todo o projeto
   - Documentar claramente o padrão de importações a ser seguido

2. **Manutenção Preventiva**:
   - Revisar regularmente as configurações do ESLint
   - Manter documentação atualizada sobre padrões de importação
   - Implementar verificações automatizadas
   - Criar scripts de validação para detectar problemas de importação precocemente

3. **Boas Práticas**:
   - Sempre verificar a configuração do ESLint ao adicionar novas regras
   - Testar as regras em um subconjunto de arquivos antes de aplicar globalmente
   - Manter um registro de decisões sobre padrões de importação
   - Considerar o impacto em todo o projeto ao fazer mudanças nas regras de importação

### Próximos Passos

1. Criar uma issue para rastrear a refatoração das importações
2. Implementar as correções em fases para minimizar impacto
3. Atualizar a documentação com os novos padrões estabelecidos
4. Configurar verificações automatizadas para prevenir regressões
5. Criar um guia de migração para ajudar a equipe a adaptar o código existente
6. Estabelecer um processo de revisão de código que inclua verificação de padrões de importação

### Decisão Técnica

Após análise detalhada, decidimos:

1. Manter a regra `import/no-relative-parent-imports` ativa
2. Usar exclusivamente aliases do TypeScript para importações
3. Criar um processo de migração gradual para evitar impacto no desenvolvimento
4. Implementar verificações automatizadas no processo de CI/CD

Esta decisão está alinhada com as melhores práticas de desenvolvimento e facilitará a manutenção do código a longo prazo.

## Estrutura Atual do Projeto

### Organização de Arquivos
```
app/
├── (pages)/
│   └── dashboard/
│       └── agents/
│           ├── page.tsx              # Página principal
│           ├── _components/          # Componentes específicos
│           │   ├── agent-list.tsx    # Lista de agentes
│           │   ├── agent-card.tsx    # Card do agente
│           │   ├── search-bar.tsx    # Barra de busca
│           │   ├── status-filter.tsx # Filtro de status
│           │   ├── sort-select.tsx   # Seletor de ordenação
│           │   └── filter-group.tsx  # Grupo de filtros
│           └── _data/               # Dados mockados
│               └── mock-data.ts     # Dados de exemplo
lib/
├── hooks/                          # Hooks globais
│   └── use-debounce.ts            # Hook de debounce
types/
└── agents.ts                      # Tipos relacionados a agentes

```

### Decisões Arquiteturais
1. **Componentes Específicos de Página**:
   - Mantidos próximos à página que os utiliza
   - Facilita a manutenção e o contexto
   - Evita poluição do diretório global de componentes

2. **Hooks Globais**:
   - Localizados em `lib/hooks`
   - Podem ser reutilizados em diferentes partes do projeto
   - Seguem padrão estabelecido do projeto

3. **Tipos Globais**:
   - Centralizados em `types/`
   - Podem ser importados por qualquer parte do projeto
   - Mantém consistência nas definições de tipos

### Padrões de Importação
1. **Aliases Configurados**:
   ```typescript
   // Componentes UI
   import { Button } from "@/components/ui/button"
   
   // Hooks
   import { useDebounce } from "@/lib/hooks/use-debounce"
   
   // Tipos
   import { Agent } from "@/types/agents"
   ```

2. **Importações Locais**:
   - Componentes específicos da página usam importações relativas
   - Mantém o escopo claro e evita confusão com componentes globais

Esta estrutura foi estabelecida considerando:
- Facilidade de manutenção
- Clareza na organização
- Reutilização quando apropriado
- Consistência com o projeto existente

## Padrões de Importação Revisados

### Problema Atual
Identificamos que o ESLint está reportando erros de importações relativas, mesmo em casos onde a estrutura do projeto sugere seu uso (componentes específicos de página).

### Solução Proposta
Em vez de fazer mudanças estruturais grandes, vamos ajustar nosso padrão de importações:

1. **Importações de Componentes de Página**:
   ```typescript
   // ❌ Evitar
   import { AgentCard } from "../_components/agent-card"
   
   // ✅ Usar
   import { AgentCard } from "@/app/(pages)/dashboard/agents/_components/agent-card"
   ```

2. **Importações de Componentes UI**:
   ```typescript
   // ✓ Manter como está
   import { Button } from "@/components/ui/button"
   ```

3. **Importações de Hooks**:
   ```typescript
   // ✓ Manter como está
   import { useDebounce } from "@/lib/hooks/use-debounce"
   ```

4. **Importações de Tipos**:
   ```typescript
   // ✓ Manter como está
   import { Agent } from "@/types/agents"
   ```

### Benefícios desta Abordagem
1. Mantém a estrutura de arquivos atual
2. Resolve os erros do ESLint
3. Mantém a clareza das importações
4. Facilita refatorações futuras
5. Segue o padrão de aliases do projeto

### Próximos Passos
1. Atualizar importações nos componentes existentes
2. Validar que as mudanças resolvem os erros do ESLint
3. Documentar o novo padrão para referência futura
4. Criar script para automatizar conversões similares

### Observações Importantes
- Esta mudança é apenas no padrão de importação, não na estrutura
- Mantém a organização atual dos arquivos
- Facilita a manutenção a longo prazo
- Segue as regras do ESLint sem comprometer a organização