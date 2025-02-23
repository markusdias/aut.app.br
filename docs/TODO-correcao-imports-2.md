# Plano de Correção de Imports - Fase 2

## Problema
Após a primeira fase de correções, ainda existem vários arquivos com problemas de importação relativa que precisam ser corrigidos para usar aliases (@/).

## Análise
Os erros de importação estão concentrados em:

1. Arquivos em `app/(pages)/**/*` importando de:
   - `@/components/ui/*`
   - `@/components/wrapper/*`
   - `@/config`
   - `@/lib/utils`
   - `@/utils/*`

2. Arquivos em `app/api/**/*` importando de:
   - `@/db/drizzle`
   - `@/db/schema`
   - `@/utils/*`
   - `@/lib/webhooks/*`

3. Arquivos em `components/**/*` importando de:
   - `@/lib/utils`
   - `@/components/ui/*`
   - `@/config`
   - `@/utils/*`

## Configuração Atual
Aliases configurados em tsconfig.json:
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

## Plano de Correção

### Fase 1: Preparação
1. Verificar se todos os arquivos estão nos diretórios corretos conforme a estrutura do projeto
2. Identificar todos os arquivos que precisam ser corrigidos
3. Fazer backup dos arquivos antes das alterações

### Fase 2: Correção dos Imports
1. Corrigir imports em `app/(pages)/**/*`:
   - Substituir imports relativos por aliases
   - Verificar e corrigir dependências circulares
   - Testar cada arquivo após a correção

2. Corrigir imports em `app/api/**/*`:
   - Substituir imports relativos por aliases
   - Verificar e corrigir dependências circulares
   - Testar cada arquivo após a correção

3. Corrigir imports em `components/**/*`:
   - Substituir imports relativos por aliases
   - Verificar e corrigir dependências circulares
   - Testar cada arquivo após a correção

### Fase 3: Validação
1. Executar `npm run build` para verificar erros
2. Corrigir quaisquer erros encontrados
3. Testar a aplicação para garantir que tudo funciona corretamente

## Arquivos a Serem Corrigidos

### app/(pages)
- `app/(pages)/(auth)/user-profile/[[...user-profile]]/page.tsx`
- `app/(pages)/blog/layout.tsx`
- `app/(pages)/cancel/page.tsx`
- `app/(pages)/dashboard/_components/dashboard-side-bar.tsx`
- `app/(pages)/dashboard/_components/dashbord-top-nav.tsx`
- `app/(pages)/dashboard/agents/_components/agent-card.tsx`
- `app/(pages)/dashboard/agents/_components/agent-list.tsx`
- `app/(pages)/dashboard/agents/_components/filter-group.tsx`
- `app/(pages)/dashboard/agents/_components/search-bar.tsx`
- `app/(pages)/dashboard/agents/_components/sort-select.tsx`
- `app/(pages)/dashboard/agents/_components/status-filter.tsx`
- `app/(pages)/dashboard/agents/page.tsx`
- `app/(pages)/dashboard/finance/page.tsx`
- `app/(pages)/dashboard/layout.tsx`
- `app/(pages)/dashboard/page.tsx`
- `app/(pages)/dashboard/projects/page.tsx`
- `app/(pages)/dashboard/settings/components/LogsView.tsx`
- `app/(pages)/dashboard/settings/components/PaymentHistory.tsx`
- `app/(pages)/dashboard/settings/components/SubscriptionCard.tsx`
- `app/(pages)/dashboard/settings/components/SubscriptionHistory.tsx`
- `app/(pages)/dashboard/settings/page.tsx`
- `app/(pages)/marketing/page.tsx`
- `app/(pages)/not-subscriber/page.tsx`
- `app/(pages)/playground/_components/playground-chat.tsx`
- `app/(pages)/playground/_components/playground-message.tsx`
- `app/(pages)/playground/page.tsx`
- `app/(pages)/pricing/page.tsx`
- `app/(pages)/success/page.tsx`

### app/api
- `app/api/auth/webhook/route.ts`
- `app/api/chat/route.ts`
- `app/api/logs/webhooks/[id]/route.ts`
- `app/api/logs/webhooks/route.ts`
- `app/api/payments/create-checkout-session/route.ts`
- `app/api/payments/webhook/route.ts`
- `app/api/plans/route.ts`
- `app/api/user/payments/history/route.ts`
- `app/api/user/subscription/cancel/route.ts`
- `app/api/user/subscription/history/route.ts`
- `app/api/user/subscription/revert-cancel/route.ts`
- `app/api/user/subscription/route.ts`

### components
- `components/custom-link.tsx`
- `components/homepage/accordion-component.tsx`
- `components/homepage/faq.tsx`
- `components/homepage/hero-section.tsx`
- `components/homepage/pricing-card.tsx`
- `components/homepage/pricing.tsx`
- `components/magicui/border-beam.tsx`
- `components/magicui/orbiting-circles.tsx`
- `components/ui/accordion.tsx`
- `components/ui/avatar.tsx`
- `components/ui/badge.tsx`
- `components/ui/button.tsx`
- `components/ui/calendar.tsx`
- `components/ui/card.tsx`
- `components/ui/chart.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/command.tsx`
- `components/ui/date-picker.tsx`
- `components/ui/dialog.tsx`
- `components/ui/dropdown-menu.tsx`
- `components/ui/form.tsx`
- `components/ui/input.tsx`
- `components/ui/label.tsx`
- `components/ui/navigation-menu.tsx`
- `components/ui/popover.tsx`
- `components/ui/progress.tsx`
- `components/ui/scroll-area.tsx`
- `components/ui/select.tsx`
- `components/ui/separator.tsx`
- `components/ui/sheet.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/slider.tsx`
- `components/ui/switch.tsx`
- `components/ui/table.tsx`
- `components/ui/tabs.tsx`
- `components/ui/textarea.tsx`
- `components/ui/toast.tsx`
- `components/upgrade-plan-modal.tsx`
- `components/user-profile.tsx`
- `components/wrapper/auth-wrapper.tsx`
- `components/wrapper/footer.tsx`
- `components/wrapper/navbar.tsx`

### lib
- `lib/webhooks/logger/webhook-logger.ts`

### src
- `src/webhooks/services/user-resolution.service.ts`

## Observações
- Alguns arquivos podem ter dependências circulares que precisarão ser resolvidas
- Alguns arquivos podem precisar ser movidos para diretórios mais apropriados
- Será necessário testar cada arquivo após as correções para garantir que tudo funciona corretamente 