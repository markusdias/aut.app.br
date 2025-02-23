# TODO: Correção de Importações Relativas

## Problema
- Identificamos diversos erros de ESLint relacionados ao uso de importações relativas
- O projeto exige o uso de aliases (@/) ao invés de caminhos relativos (../)
- Vários componentes estão violando esta regra

## Análise
### Arquivos Afetados
1. Componentes UI
   - Todos os componentes em `components/ui/*`
   - Todos os componentes em `components/wrapper/*`
   - Componentes em `components/homepage/*`

2. Páginas e Layouts
   - Arquivos em `app/(pages)/*`
   - Layouts e páginas principais

3. APIs e Webhooks
   - Rotas de API em `app/api/*`
   - Serviços de webhook

### Configuração Atual
- Aliases configurados em `tsconfig.json`:
  - `@/components/*`
  - `@/lib/*`
  - `@/utils/*`
  - `@/types/*`
  - `@/styles/*`
  - `@/db/*`
  - `@/scripts/*`
  - `@/hooks/*`
  - `@/app/*`

## Plano de Correção

### Fase 1: Preparação
1. ✅ Documentar todos os arquivos afetados
2. ✅ Verificar configuração de aliases no tsconfig.json
3. ✅ Configurar ESLint para reconhecer aliases TypeScript

### Fase 2: Correção de Importações
1. Componentes UI
   - [ ] Atualizar importações em components/ui/*
   - [ ] Atualizar importações em components/wrapper/*
   - [ ] Atualizar importações em components/homepage/*

2. Páginas e Layouts
   - [ ] Corrigir importações em app/(pages)/*
   - [ ] Corrigir importações em layouts principais

3. APIs e Webhooks
   - [ ] Atualizar importações em app/api/*
   - [ ] Atualizar importações em serviços de webhook

### Fase 3: Validação
1. [ ] Executar build para verificar erros
2. [ ] Verificar funcionamento da aplicação
3. [ ] Documentar quaisquer problemas encontrados

## Próximos Passos
1. Começar pela correção dos componentes UI
2. Atualizar progressivamente cada seção
3. Validar após cada conjunto de alterações
4. Documentar problemas e soluções encontradas

## Observações
- Manter backup dos arquivos antes das alterações
- Testar cada conjunto de alterações antes de prosseguir
- Documentar quaisquer casos especiais ou exceções encontradas 