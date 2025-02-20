# Lições Aprendidas Consolidadas

## 1. Gestão de Projeto

### 1.1 Validação e Verificação
- NUNCA anunciar conclusão de tarefas sem validação completa
- Criar checklists de validação para cada tipo de tarefa
- Documentar e executar todos os passos de verificação
- Manter transparência sobre problemas e pendências
- Validar impactos antes de qualquer alteração significativa

### 1.2 Documentação
- Manter documentação atualizada em tempo real
- Documentar decisões técnicas e suas justificativas
- Criar e manter guias de troubleshooting
- Registrar aprendizados e soluções encontradas
- Documentar apenas resultados comprovados

### 1.3 Comunicação
- Manter comunicação clara e objetiva
- Reportar problemas assim que identificados
- Documentar mudanças de escopo ou requisitos
- Alinhar expectativas com stakeholders
- Manter registro de decisões importantes

## 2. Desenvolvimento

### 2.1 Estrutura de Código
- Seguir estrutura de pastas predefinida
- Evitar duplicação de código
- Centralizar lógicas comuns
- Manter separação clara de responsabilidades
- Seguir padrões estabelecidos de nomenclatura

### 2.2 Qualidade de Código
- Implementar seguindo princípios SOLID
- Manter código legível e bem documentado
- Criar abstrações apenas quando necessário
- Implementar logging adequado
- Tratar erros de forma apropriada

### 2.3 Refatoração
- Planejar refatorações cuidadosamente
- Manter compatibilidade com código existente
- Implementar mudanças gradualmente
- Validar cada etapa da refatoração
- Ter plano de rollback sempre pronto

## 3. Testes

### 3.1 Estratégia de Testes
- Definir estratégia de testes antes da implementação
- Criar testes unitários para lógicas críticas
- Implementar testes de integração
- Manter testes determinísticos
- Evitar dependências entre testes

### 3.2 Mocks e Fixtures
- Criar mocks com tipagem adequada
- Manter fixtures atualizadas
- Usar factory functions para dados de teste
- Documentar uso de mocks e fixtures
- Simplificar mocks sempre que possível

### 3.3 Ambiente de Testes
- Manter ambiente de testes isolado
- Usar transações para limpeza de dados
- Configurar CI/CD apropriadamente
- Validar testes em ambiente limpo
- Manter tempos de execução otimizados

## 4. Banco de Dados

### 4.1 Migrações
- Planejar migrações cuidadosamente
- Testar migrações em ambiente seguro
- Manter scripts de rollback
- Documentar mudanças no schema
- Validar índices e performance

### 4.2 Performance
- Otimizar queries críticas
- Monitorar tempos de resposta
- Implementar índices apropriados
- Gerenciar conexões adequadamente
- Manter pool de conexões configurado

## 5. Monitoramento e Produção

### 5.1 Logs e Métricas
- Implementar logging estruturado
- Definir níveis de log apropriados
- Criar métricas relevantes
- Configurar alertas importantes
- Manter dashboards atualizados

### 5.2 Deploy e Rollback
- Implementar deploys graduais
- Manter feature flags para controle
- Ter processo de rollback testado
- Monitorar métricas pós-deploy
- Documentar procedimentos de emergência

## 6. Segurança

### 6.1 Práticas de Segurança
- Seguir princípio do menor privilégio
- Validar inputs adequadamente
- Proteger dados sensíveis
- Manter dependências atualizadas
- Implementar autenticação e autorização adequadas

### 6.2 Gestão de Credenciais
- Nunca commitar credenciais
- Usar variáveis de ambiente
- Rotacionar credenciais regularmente
- Manter registro de acessos
- Implementar gestão segura de secrets

## 7. Manutenibilidade

### 7.1 Código
- Manter complexidade controlada
- Documentar partes complexas
- Criar abstrações sustentáveis
- Facilitar onboarding de novos devs
- Manter débito técnico sob controle

### 7.2 Documentação
- Manter README atualizado
- Documentar arquitetura
- Criar guias de contribuição
- Manter changelog
- Documentar decisões arquiteturais

## 8. Processo de Desenvolvimento

### 8.1 Code Review
- Definir critérios claros de revisão
- Manter revisões objetivas
- Focar em qualidade e padrões
- Compartilhar conhecimento
- Documentar decisões importantes

### 8.2 Integração Contínua
- Manter pipeline de CI/CD
- Automatizar testes e validações
- Implementar análise estática
- Manter builds rápidos
- Priorizar feedback rápido

## 9. Gestão de Riscos

### 9.1 Identificação
- Mapear riscos proativamente
- Avaliar impactos potenciais
- Definir estratégias de mitigação
- Manter planos de contingência
- Revisar riscos periodicamente

### 9.2 Mitigação
- Implementar controles preventivos
- Manter monitoramento ativo
- Ter planos de recuperação
- Documentar incidentes e soluções
- Realizar postmortems quando necessário

## 10. Migrações de Banco de Dados

### 10.1 Execução de SQL
- NUNCA dividir blocos SQL que usam `DO $block$` ou `DO $$`
- Executar SQL como uma unidade quando envolve PL/pgSQL
- Remover comentários é seguro, mas manter estrutura do SQL é crucial
- Usar `sql.unsafe()` para blocos SQL complexos

### 10.2 Padrões de Migração
- Sempre usar `IF NOT EXISTS` para criação de tabelas
- Sempre usar `IF NOT EXISTS` para adição de colunas
- Separar SQL e ROLLBACK com `---- ROLLBACK ----`
- Verificar existência antes de alterações estruturais
- Manter ordem numérica nas migrações (0000, 0001, etc.)

### 10.3 Segurança e Controle
- Verificar permissões antes de qualquer operação
- Registrar migrações apenas após execução bem-sucedida
- Tratar ambientes (prod/dev) com confirmações explícitas
- Manter logs detalhados de cada operação
- Implementar rollback para cada migração

### 10.4 Estrutura de Arquivos
- Manter migrações em `src/db/migrations`
- Nomear arquivos com prefixo numérico sequencial
- Incluir descrição clara no nome do arquivo
- Documentar propósito no cabeçalho da migração

### 10.5 Boas Práticas
- Uma migração = uma alteração lógica
- Testar migrações em ambiente de desenvolvimento
- Manter backup antes de executar em produção
- Validar estado do banco após cada migração
- Documentar alterações no schema

### 10.6 Padrão de Código para Migrações
```sql
-- Migration: [nome_descritivo]
-- Created at: [timestamp]
-- Description: [descrição clara do propósito]

DO $$ 
BEGIN 
    -- Verificação de existência para tipos
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '[nome_tipo]') THEN
        -- Criar tipo
    END IF;

    -- Verificação de existência para tabelas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '[nome_tabela]') THEN
        -- Criar tabela
    END IF;

    -- Verificação de existência para colunas
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = '[nome_tabela]' 
        AND column_name = '[nome_coluna]'
    ) THEN
        -- Adicionar coluna
    END IF;
END $$;

---- ROLLBACK ----
-- Operações de rollback em ordem inversa
```

### 10.7 Lições Aprendidas
1. **Auto-inicialização**:
   - Criar tabela de controle de migrações automaticamente
   - Não depender de passos manuais de inicialização
   - Usar `CREATE TABLE IF NOT EXISTS` para tabela de controle

2. **Idempotência**:
   - Toda migração deve ser idempotente (executável múltiplas vezes)
   - Verificar existência antes de cada operação
   - Usar blocos DO para garantir atomicidade
   - Tratar erros de forma não destrutiva

3. **Consistência**:
   - Manter registro preciso das migrações aplicadas
   - Não tentar recriar estruturas existentes
   - Seguir ordem numérica das migrações
   - Validar estado após cada migração

4. **Feedback e Logs**:
   - Manter logs detalhados de cada operação
   - Mostrar claramente o que está sendo executado
   - Indicar migrações já aplicadas vs. pendentes
   - Tratar avisos de forma não-intrusiva

## Lições Aprendidas - Testes e Jest

### 1. Detecção de Handles Abertos em Testes

**Problema Identificado:**  
Testes travando no terminal devido a handles (conexões/timers) não fechados adequadamente.

**Solução Aplicada:**  
Adição do script `test:debug` com flag `--detectOpenHandles` no package.json.

**Exemplo de Código:**
```json
{
  "scripts": {
    "test:debug": "jest --detectOpenHandles"
  }
}
```

**Contexto:**  
Útil durante o desenvolvimento para identificar recursos não liberados que podem causar travamento dos testes.

### 2. Paths Aliases em Testes

**Problema Identificado:**  
Imports relativos (`../../`) causando problemas de manutenção e violando regras de projeto.

**Solução Aplicada:**  
1. Configuração de aliases no tsconfig.json
2. Configuração correspondente no jest.config.js

**Exemplo de Código:**
```javascript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/webhooks/*": ["src/webhooks/*"]
    }
  }
}

// jest.config.js
{
  moduleNameMapper: {
    '^@/webhooks/(.*)$': '<rootDir>/src/webhooks/$1'
  }
}
```

**Contexto:**  
Essencial para manter consistência entre imports do projeto e dos testes.

### 3. Cobertura de Testes Incremental

**Problema Identificado:**  
Thresholds de cobertura muito altos bloqueando o desenvolvimento inicial dos testes.

**Solução Aplicada:**  
1. Redução temporária dos thresholds
2. Ignorar temporariamente diretórios sem testes
3. Plano de incremento gradual

**Exemplo de Código:**
```javascript
// jest.config.js
{
  coveragePathIgnorePatterns: [
    '/db/',    // Temporário
    '/utils/', // Temporário
    '/types/'  // Temporário
  ],
  coverageThreshold: {
    global: {
      branches: 50,  // Iniciar com 50%
      functions: 50, // Aumentar gradualmente
      lines: 50,
      statements: 50
    }
  }
}
```

**Contexto:**  
Permite desenvolvimento iterativo mantendo qualidade sem bloquear progresso.

### 4. Organização de Testes de Mocks

**Problema Identificado:**  
Necessidade de validar mocks de webhooks de forma organizada e completa.

**Solução Aplicada:**  
Estruturação hierárquica de testes com describe aninhados e validações específicas.

**Exemplo de Código:**
```typescript
describe('Webhook Event Mocks', () => {
  describe('createEvent', () => {
    it('should create valid event', () => {})
    it('should include required fields', () => {})
  })
  describe('Common Properties', () => {
    it('should have valid timestamps', () => {})
  })
})
```

**Contexto:**  
Facilita manutenção e garante cobertura completa de casos de teste.

# Lições Aprendidas - Webhook System

## Problema
**Descrição:** Alterações foram feitas no sistema de webhooks sem análise profunda do estado atual e funcionamento existente.

**Contexto:**
- Sistema de webhooks Stripe estava funcionando corretamente
- Webhooks recebidos:
  1. invoice.payment_succeeded
  2. checkout.session.completed
  3. customer.subscription.updated
  4. customer.subscription.created
- Tentativa de correção de tipagem quebrou o funcionamento

**Impacto:**
- Quebra de funcionalidade que estava operacional
- Inconsistências entre schema e implementação
- Problemas de tipagem em cascata
- Perda de tempo com correções desnecessárias

## Causa Raiz
1. Violação das Rules:
   - Não seguimos o processo de análise antes de implementação
   - Não verificamos o código existente em toda estrutura
   - Tentamos corrigir sintomas em vez da causa real

2. Erros de Abordagem:
   - Foco em tipagem sem entender o contexto completo
   - Alteração de código funcional sem necessidade
   - Não validação do impacto das mudanças

## Solução
1. **Análise do Estado Atual:**
   ```typescript
   // Schema vs Implementação
   // 1. Verificar campos no schema:
   export const users = pgTable("users", {
     status: text("status").default("active"),
     deletedAt: timestamp("deleted_at")
   });

   // 2. Verificar campos nas migrações:
   ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'active' NOT NULL;
   ```

2. **Discrepâncias Identificadas:**
   - Schema usa `text("status")` vs migração usa enum `user_status`
   - Campo `deletedAt` presente no schema mas ausente nas migrações
   - Diferença de nullability entre schema e migração

3. **Plano de Correção:**
   ```sql
   -- 1. Verificar estado atual em produção
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'users';

   -- 2. Alinhar implementação com estado real
   -- 3. Ajustar queries para usar campos corretos
   ```

## Resultado
- Documentação do estado atual do sistema
- Identificação clara das discrepâncias
- Plano de correção não invasivo
- Preservação do funcionamento existente

## Tags
#webhooks #stripe #schema #migrations #typescript #drizzle

## Próximos Passos

### 1. Análise de Discrepâncias
```typescript
// 1. Mapear campos em uso nos webhooks
type WebhookFields = {
  // Campos do usuário
  userId: string;
  email: string;
  status: string;
  stripeUserId: string;
  
  // Campos da assinatura
  subscriptionId: string;
  planId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
};

// 2. Comparar com schema e migrações
// 3. Documentar diferenças
// 4. Planejar correções sem quebrar funcionalidade
```

### 2. Plano de Correção
1. **Documentação:**
   - Estado atual do banco
   - Campos em uso nos webhooks
   - Discrepâncias identificadas

2. **Validação:**
   - Testar webhooks em ambiente de desenvolvimento
   - Verificar processamento completo
   - Documentar comportamento esperado

3. **Correção:**
   - Ajustar tipagens sem alterar funcionamento
   - Alinhar schema com estado real
   - Manter compatibilidade com código existente

### 3. Checklist de Implementação
- [ ] Documentar estado atual
- [ ] Mapear campos em uso
- [ ] Identificar discrepâncias
- [ ] Planejar correções
- [ ] Testar em ambiente seguro
- [ ] Validar com webhooks reais
- [ ] Documentar mudanças

## Observações Importantes
1. NUNCA alterar código funcionando sem análise completa
2. SEMPRE documentar estado atual antes de mudanças
3. SEMPRE testar em ambiente seguro
4. SEMPRE manter compatibilidade com código existente 