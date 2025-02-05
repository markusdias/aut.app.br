# Padrão de Migrações

Este documento descreve o padrão para criação e execução de migrações no projeto.

## Estrutura do Arquivo de Migração

Os arquivos de migração devem seguir a seguinte estrutura:

```sql
-- Migration: [nome da migração]
-- Created at: [data de criação]
-- Description: [descrição detalhada do que a migração faz]

-- Comandos SQL da migração
[comando 1];
--> statement-breakpoint
[comando 2];
--> statement-breakpoint
[comando 3];

---- ROLLBACK ----
[comandos de rollback em ordem reversa];
```

### Regras Importantes

1. **Cabeçalho**
   - Todo arquivo deve começar com os comentários de identificação
   - A data deve estar no formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
   - A descrição deve ser clara e explicativa

2. **Comandos SQL**
   - Cada comando SQL deve terminar com ponto e vírgula (;)
   - Use `--> statement-breakpoint` para separar comandos que devem ser executados separadamente
   - Mantenha os comandos organizados e identados para melhor legibilidade

3. **Rollback**
   - A seção de rollback deve começar com `---- ROLLBACK ----`
   - Os comandos de rollback devem estar em ordem reversa aos comandos da migração
   - Inclua todos os comandos necessários para desfazer completamente a migração

4. **Nomenclatura**
   - Os arquivos devem ser nomeados seguindo o padrão: `XXXX_nome_descritivo.sql`
   - XXXX é um número sequencial com 4 dígitos (ex: 0001, 0002, etc)
   - Use snake_case para o nome descritivo

## Exemplos

### Criando uma Nova Coluna
```sql
-- Migration: add_user_email
-- Created at: 2024-02-03T10:00:00.000Z
-- Description: Adiciona coluna de email na tabela users

ALTER TABLE "users" ADD COLUMN "email" text NOT NULL;

---- ROLLBACK ----
ALTER TABLE "users" DROP COLUMN IF EXISTS "email";
```

### Criando um Tipo Enum e Colunas
```sql
-- Migration: add_user_status
-- Created at: 2024-02-03T10:00:00.000Z
-- Description: Adiciona tipo enum e campos de status do usuário

CREATE TYPE "public"."user_status" AS ENUM('active', 'blocked', 'banned', 'deleted');
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active" boolean DEFAULT true NOT NULL;

---- ROLLBACK ----
ALTER TABLE "users" DROP COLUMN IF EXISTS "status";
ALTER TABLE "users" DROP COLUMN IF EXISTS "active";
DROP TYPE IF EXISTS "public"."user_status";
```

## Boas Práticas

1. **Atomicidade**
   - Cada migração deve fazer uma única alteração lógica
   - Se precisar fazer várias alterações relacionadas, agrupe-as na mesma migração
   - Se as alterações não são relacionadas, crie migrações separadas

2. **Idempotência**
   - Use comandos que podem ser executados múltiplas vezes sem erro
   - Exemplo: `CREATE TABLE IF NOT EXISTS`, `DROP TABLE IF EXISTS`
   - Evite comandos que podem falhar se executados mais de uma vez

3. **Segurança**
   - Sempre teste o rollback antes de fazer commit da migração
   - Faça backup do banco antes de executar migrações em produção
   - Use constraints e defaults apropriados para garantir integridade dos dados

4. **Documentação**
   - Mantenha a descrição da migração clara e detalhada
   - Documente qualquer decisão importante nos comentários
   - Se a migração for complexa, adicione comentários explicando cada parte

## Executando Migrações

Para executar as migrações, use os seguintes comandos:

```bash
# Executa todas as migrações pendentes
npm run db:migrate

# Limpa uma migração específica
npm run db:clean-migrations XXXX

# Verifica o estado das migrações
npm run db:check-migrations
```

## Troubleshooting

1. **Erro na Execução**
   - Verifique se todos os comandos terminam com ponto e vírgula
   - Confirme se os statement-breakpoints estão no lugar correto
   - Verifique se não há comandos de rollback sendo executados junto

2. **Erro no Rollback**
   - Certifique-se que a seção de rollback está após a linha `---- ROLLBACK ----`
   - Verifique se os comandos estão na ordem reversa correta
   - Teste o rollback em um ambiente de desenvolvimento 