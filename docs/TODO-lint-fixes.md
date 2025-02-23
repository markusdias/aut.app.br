# Plano de Correção de Problemas de Linting

## Contexto
Este documento descreve o plano de ação para corrigir os problemas de linting identificados durante o build do projeto. O objetivo é retornar todas as regras para seu estado original de "error" após as correções.

## Problemas Identificados

### 1. Variáveis Não Utilizadas (@typescript-eslint/no-unused-vars)
#### Arquivos Afetados:
- `app/(pages)/blog/layout.tsx`: 'inter'
- `app/(pages)/dashboard/_components/dashboard-side-bar.tsx`: 'CustomLink'
- `app/(pages)/dashboard/agents/_components/sort-select.tsx`: 'SortOption'
- `app/(pages)/dashboard/settings/components/LogsView.tsx`: Múltiplas variáveis
- `components/homepage/pricing.tsx`: Múltiplas importações

#### Ação:
1. Remover variáveis não utilizadas
2. Documentar casos onde a variável é necessária para tipagem
3. Usar prefixo _ para variáveis intencionalmente não utilizadas

### 2. Hooks React (react-hooks/exhaustive-deps)
#### Arquivos Afetados:
- `app/(pages)/dashboard/settings/components/LogsView.tsx`
- `components/video-player.tsx`

#### Ação:
1. Revisar dependências dos useEffect
2. Adicionar todas as dependências necessárias
3. Usar useCallback onde apropriado
4. Documentar casos onde dependências são intencionalmente omitidas

### 3. Tipos TypeScript Any (@typescript-eslint/no-explicit-any)
#### Arquivos Afetados:
- `app/api/payments/webhook/route.ts`
- `lib/webhooks/logger/webhook-logger.ts`

#### Ação:
1. Criar interfaces específicas para payloads de webhook
2. Tipar corretamente funções de callback
3. Usar tipos genéricos onde apropriado

### 4. Non-null Assertions em Optional Chaining (@typescript-eslint/no-non-null-asserted-optional-chain)
#### Arquivos Afetados:
- `app/(pages)/dashboard/layout.tsx`
- `app/(pages)/dashboard/settings/page.tsx`

#### Ação:
1. Implementar verificações de nulidade adequadas
2. Usar operadores de coalescência nula (??)
3. Adicionar tratamento de erro para casos undefined

### 5. Interfaces Vazias (@typescript-eslint/no-empty-interface)
#### Arquivos Afetados:
- `components/ui/command.tsx`
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`

#### Ação:
1. Remover interfaces vazias desnecessárias
2. Adicionar propriedades necessárias
3. Usar type quando apropriado

### 6. Display Names (react/display-name)
#### Arquivos Afetados:
- `app/components/ui/date-picker.tsx`
- `components/ui/date-picker.tsx`

#### Ação:
1. Adicionar displayName aos componentes
2. Converter arrow functions para function declarations onde apropriado

## Priorização

1. **Alta Prioridade** (Sprint 1):
   - Correção de non-null assertions (risco de runtime errors)
   - Remoção de any types em webhooks (segurança)
   - Correção de dependências de hooks (possíveis memory leaks)

2. **Média Prioridade** (Sprint 2):
   - Remoção de variáveis não utilizadas
   - Correção de display names
   - Limpeza de imports não utilizados

3. **Baixa Prioridade** (Sprint 3):
   - Refatoração de interfaces vazias
   - Melhorias de tipagem geral
   - Otimizações de código

## Processo de Correção

1. **Para cada categoria:**
   - Criar branch específica
   - Corrigir problemas relacionados
   - Testar localmente
   - Criar PR com descrição detalhada
   - Revisar impactos

2. **Após cada sprint:**
   - Reverter regra específica para "error" no ESLint
   - Verificar se build continua passando
   - Atualizar documentação

## Monitoramento

- Criar GitHub Actions para verificar linting
- Adicionar husky para pre-commit hooks
- Implementar relatórios de qualidade de código

## Próximos Passos Imediatos

1. Aguardar resultado do build atual
2. Criar branches para correções de alta prioridade
3. Iniciar correções da Sprint 1
4. Agendar review das correções

## Observações
- Manter registro de decisões técnicas (ADRs)
- Documentar exceções necessárias
- Atualizar guia de estilo do projeto 