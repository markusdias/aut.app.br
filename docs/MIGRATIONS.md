# Processo de Migrações do Banco de Dados

## Visão Geral
Este documento descreve o processo de gerenciamento de migrações do banco de dados no projeto AtendChat.

## Estrutura
- As migrações são armazenadas em `/db/migrations`
- Cada migração deve ter um nome único e sequencial
- O controle é feito pela tabela `drizzle_migrations`
- O schema `drizzle` contém as tabelas de controle

## Comandos Disponíveis

### Gerenciamento de Banco de Dados

```bash
# Mostra todos os comandos disponíveis e suas descrições
npm run db

# Verifica o estado atual das migrações
# Útil para identificar discrepâncias entre arquivos locais e banco
# Use antes de executar migrações para garantir consistência
npm run db:check

# Reseta e reexecuta todas as migrações
# Útil quando há problemas com o estado das migrações
# ⚠️ Requer confirmação e backup prévio em produção
npm run db:reset --confirm

# Limpa dados específicos do banco (metadados e flags)
# Útil para limpar dados de teste ou resetar estados
# ⚠️ Requer confirmação em produção
npm run db:clean --confirm

# Corrige nomes das migrações no banco
# Útil quando há inconsistências nos nomes das migrações
# ⚠️ Requer confirmação pois modifica registros
npm run db:fix --confirm

# Verifica a estrutura de uma tabela específica
# Útil para debug e verificação de schema
npm run db:check-table <nome_tabela>

# Executa migrações pendentes em desenvolvimento
# Use durante desenvolvimento para aplicar novas migrações
npm run db:migrate

# Executa migrações em produção
# Requer variável CONFIRM_PRODUCTION_MIGRATION
# ⚠️ Sempre faça backup antes
npm run db:migrate:prod

# Inicializa o estado das migrações
# Use apenas uma vez ao configurar um novo ambiente
npm run db:init

# Remove migrações específicas do banco
# Útil para limpar migrações problemáticas
# Use com cautela pois pode causar inconsistências
npm run db:clean-migrations <padrão>

# Remove a tabela de controle de migrações
# Útil em casos de corrupção da tabela
npm run db:drop-migrations-table

# Remove todas as tabelas do banco
# ⚠️ Requer confirmação pois é destrutivo
npm run db:drop-all --confirm

# Remove o schema drizzle e suas tabelas
# ⚠️ Remove todo o controle de migrações
npm run db:drop-schema
```

### Sincronização com Stripe

```bash
# Sincroniza planos do Stripe com o banco local
# Use após fazer alterações nos produtos/preços no Stripe
npm run db:sync-plans
```

## Fluxos Comuns

### Configurando Novo Ambiente
1. `npm run db:init` - Inicializa o estado
2. `npm run db:migrate` - Aplica todas as migrações
3. `npm run db:check` - Verifica consistência

### Atualizando Ambiente Existente
1. `npm run db:check` - Verifica estado atual
2. `npm run db:migrate` - Aplica migrações pendentes
3. `npm run db:check` - Confirma consistência

### Corrigindo Problemas
1. `npm run db:check` - Identifica problemas
2. `npm run db:fix --confirm` - Corrige nomes se necessário
3. `npm run db:reset --confirm` - Reseta estado se necessário
4. `npm run db:migrate` - Reaplica migrações

### Resetando Completamente o Banco
1. Faça backup se necessário
2. `npm run db drop-schema` - Remove schema drizzle
3. `npm run db drop-all --confirm` - Remove todas as tabelas
4. `npm run db:init` - Reinicializa o estado
5. `npm run db:migrate` - Reaplica migrações

### Ambiente de Produção
1. Faça backup do banco
2. `npm run db:check` - Verifica estado
3. Configure `CONFIRM_PRODUCTION_MIGRATION`
4. `npm run db:migrate:prod` - Executa migrações
5. Verifique logs e estado final

## Boas Práticas
1. Nunca modifique uma migração já executada
2. Sempre crie uma nova migração para fazer alterações
3. Evite executar alterações diretas no banco sem migração
4. Mantenha o versionamento sequencial das migrações
5. Faça backup antes de executar migrações em produção
6. Use `db:check` regularmente para identificar problemas
7. Sempre use `--confirm` em comandos destrutivos
8. Documente todas as alterações no banco

## Processo de Criação de Nova Migração
1. Use o drizzle-kit para gerar a migração
2. Revise o arquivo gerado
3. Teste a migração em ambiente de desenvolvimento
4. Commit apenas após testes bem sucedidos

## Resolução de Problemas
Se encontrar discrepâncias entre arquivos locais e estado do banco:
1. Verifique a tabela `drizzle_migrations`
2. Compare os arquivos locais com as migrações executadas
3. Use `db:check` para identificar problemas específicos
4. Em caso de corrupção, use `db:drop-schema` e reinicie
5. Em caso de dúvida, contate o time de desenvolvimento

## Lições Aprendidas

### Caso: Falha na Execução de Migrações pelo Drizzle

Em 02/02/2025, identificamos um problema onde o Drizzle não estava conseguindo executar as migrações automaticamente.
O problema se manifestava da seguinte forma:
1. O comando `npm run db:migrate` indicava sucesso
2. Porém, `npm run db:check` mostrava que as migrações não foram aplicadas
3. A tabela `drizzle_migrations` não registrava as novas migrações

Para resolver este problema, implementamos uma solução robusta que:
1. Verifica o estado atual das migrações no banco
2. Identifica migrações pendentes comparando com arquivos locais
3. Executa cada migração pendente manualmente dentro de uma transação
4. Registra cada migração na tabela `drizzle_migrations` após sucesso
5. Verifica o estado final para garantir que tudo foi aplicado

A solução foi implementada no arquivo `scripts/db-manager.ts` e inclui:
- Verificação de permissões antes da execução
- Execução transacional das migrações
- Tratamento adequado de erros
- Fechamento correto das conexões
- Logs detalhados do processo

### Medidas Preventivas

1. NUNCA faça alterações diretas no banco de produção
2. Sempre use migrações para mudanças estruturais
3. Documente todas as alterações no banco
4. Use verificações de existência em migrações que podem ter sido aplicadas manualmente
5. Execute `npm run db:check` regularmente para identificar discrepâncias

### Padrão para Migrações Seguras

Para adicionar colunas de forma segura, use o seguinte padrão:

```sql
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sua_tabela' 
        AND column_name = 'sua_coluna'
    ) THEN
        -- Sua alteração aqui
        ALTER TABLE "sua_tabela" ADD COLUMN "sua_coluna" seu_tipo;
    END IF;
END $$;
```

Este padrão garante que:
- A migração é idempotente (pode ser executada múltiplas vezes)
- Não falha se a coluna já existir
- Mantém a consistência entre ambientes

### Padrão para Execução Manual de Migrações

Se precisar executar uma migração manualmente, use o seguinte padrão:

```sql
BEGIN;
-- Seu SQL aqui
INSERT INTO drizzle_migrations (hash) VALUES ('nome_da_sua_migracao');
COMMIT;
```

Este padrão garante que:
- A migração e seu registro são atômicos
- Em caso de falha, nada é aplicado
- O estado do banco permanece consistente

### Troubleshooting de Migrações

Se encontrar problemas com migrações:

1. Verifique o estado atual:
   ```bash
   npm run db:check
   ```

2. Se houver discrepâncias:
   - Verifique se todas as migrações estão na pasta correta
   - Compare o conteúdo da tabela `drizzle_migrations`
   - Verifique os logs de erro

3. Para forçar a execução manual:
   - Use `sql.unsafe()` para executar o SQL diretamente
   - Registre a migração na tabela após sucesso
   - Verifique se a migração foi registrada

4. Em último caso:
   - Faça backup do banco
   - Use `npm run db:reset --confirm`
   - Reaplique todas as migrações

### Boas Práticas Adicionais

1. Mantenha logs detalhados das execuções de migração
2. Use transações para garantir atomicidade
3. Sempre verifique o estado antes e depois
4. Documente qualquer execução manual
5. Mantenha backups antes de executar migrações
6. Use o padrão de verificação de existência em migrações críticas

### Caso: Problema com Snapshots e Recriação de Migrações

Em 02/02/2024, identificamos um problema onde arquivos de migração eram recriados automaticamente.
O problema se manifestava da seguinte forma:
1. Ao criar uma nova migração manualmente (ex: `0002_add_plan_change_tracking.sql`)
2. Um arquivo adicional era criado automaticamente (ex: `0003_add_plan_change_tracking.sql`)
3. Mesmo após deletar o arquivo extra, ele era recriado

A causa raiz foi identificada:
1. O drizzle-kit gera snapshots automaticamente em `db/migrations/meta/`
2. Cada snapshot (`0001_snapshot.json`, `0002_snapshot.json`, etc.) representa um estado do banco
3. Quando há discrepância entre snapshots e estado atual, o sistema tenta recriar arquivos

Para resolver este problema:
1. Mantenha apenas o snapshot inicial (`0000_snapshot.json`)
2. Remova snapshots intermediários
3. Mantenha o `_journal.json` atualizado com todas as migrações

Exemplo de estrutura correta:
```
db/migrations/
├── 0000_mature_black_panther.sql
├── 0001_add_subscription_invoice_fields.sql
├── 0002_add_plan_change_tracking.sql
└── meta/
    ├── _journal.json
    └── 0000_snapshot.json
```

Se o problema ocorrer:
1. Pare o servidor Next.js (que pode estar observando alterações)
2. Remova os arquivos de migração duplicados
3. Remova snapshots intermediários (`0001_snapshot.json`, `0002_snapshot.json`, etc.)
4. Mantenha apenas o snapshot inicial
5. Verifique se o `_journal.json` está correto
6. Reinicie o servidor

Para prevenir o problema:
1. Use `npm run db:check` antes de criar novas migrações
2. Evite criar migrações manualmente, use o drizzle-kit quando possível
3. Se precisar criar manualmente, siga o padrão de migração segura
4. Mantenha apenas um snapshot inicial
5. Monitore o diretório `meta/` para snapshots indesejados

Este problema está relacionado à forma como o drizzle-kit tenta manter o estado do banco sincronizado através de snapshots. 
Ao limitar os snapshots ao inicial, evitamos que o sistema tente recriar estados intermediários.

## Migrações Duplicadas (02/02/2024)

### Problema
- Ao criar uma nova migração, às vezes o drizzle-kit pode gerar um arquivo duplicado com o mesmo propósito
- Por exemplo: `0002_add_plan_change_tracking.sql` e `0003_add_plan_change_tracking.sql`
- O arquivo duplicado geralmente está vazio e pode ser recriado automaticamente

### Solução
1. **NÃO** exclua os dados do banco ou force o reset das migrações
2. Verifique qual arquivo contém as alterações reais (geralmente o primeiro)
3. Remova apenas o arquivo vazio que está causando a duplicação
4. Execute a migração pendente usando `npm run db:migrate`
5. Verifique se tudo está sincronizado com `npm run db:check`

### Prevenção
- Sempre verifique se já existe uma migração com o mesmo propósito antes de criar uma nova
- Use nomes descritivos e únicos para cada migração
- Mantenha o controle de versão das migrações organizado
- Execute `npm run db:check` regularmente para identificar problemas

### Importante
- Nunca exclua migrações que já foram aplicadas no banco
- Mantenha o arquivo `_journal.json` sincronizado
- Em caso de dúvida, use `npm run db:check` para verificar o estado das migrações