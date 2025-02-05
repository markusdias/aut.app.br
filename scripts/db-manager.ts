import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { subscriptionPlans } from "@/db/schema";
import fs from "fs";
import path from "path";
import Stripe from "stripe";
import { sql } from "drizzle-orm";
import * as schema from '../db/schema';

// Carrega variáveis de ambiente
config({ path: '.env' });

export class DatabaseManager {
  private sql: postgres.Sql;
  private db: ReturnType<typeof drizzle>;
  private stripe: Stripe;

  constructor() {
    // Para migrações, devemos usar DIRECT_URL para garantir uma conexão direta
    const dbUrl = process.env.DIRECT_URL;
    if (!dbUrl) {
      throw new Error("DIRECT_URL não está definida. Migrações requerem uma conexão direta com o banco.");
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY não está definida");
    }

    this.sql = postgres(dbUrl, {
      max: 1,
      ssl: "require",
      connect_timeout: 30,
      idle_timeout: 30,
      max_lifetime: 60 * 30
    });

    this.db = drizzle(this.sql, { schema });
    this.stripe = new Stripe(stripeKey);
  }

  private async checkPermissions() {
    try {
      // Verifica se temos permissão para alterar tabelas
      await this.sql`
        DO $$ 
        BEGIN
          -- Verifica se o usuário tem permissão para alterar tabelas
          IF NOT EXISTS (
            SELECT 1 FROM pg_roles 
            WHERE rolname = current_user 
            AND rolcreatedb
          ) THEN
            RAISE NOTICE 'Usuário % não tem permissão para criar/alterar tabelas', current_user;
          END IF;
        END $$;
      `;
      return true;
    } catch (error) {
      console.error("❌ Erro ao verificar permissões:", error);
      return false;
    }
  }

  async checkMigrations() {
    try {
      console.log("🔍 Verificando estado das migrações...\n");

      // Busca migrações executadas no banco
      const result = await this.sql`
        SELECT * FROM drizzle_migrations 
        ORDER BY id ASC
      `;

      // Busca arquivos de migração locais
      const migrationsDir = path.join(process.cwd(), "db", "migrations");
      const localMigrations = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith(".sql"))
        .sort();

      console.log("📊 Migrações no Banco de Dados:");
      result.forEach((migration: any) => {
        console.log(`  ✓ ${migration.hash} (${new Date(migration.created_at).toLocaleString()})`);
      });

      console.log("\n📁 Arquivos de Migração Locais:");
      localMigrations.forEach(file => {
        console.log(`  - ${file}`);
      });

      // Verifica discrepâncias
      const dbMigrations = result.map((m: any) => m.hash);
      const localNames = localMigrations.map(file => file.replace(".sql", ""));

      console.log("\n🔄 Análise de Discrepâncias:");
      
      // Migrações no banco mas sem arquivo local
      const missingLocal = dbMigrations.filter(name => !localNames.includes(name));
      if (missingLocal.length > 0) {
        console.log("\n⚠️  Migrações executadas sem arquivo local:");
        missingLocal.forEach(name => console.log(`  - ${name}`));
      }

      // Arquivos locais não executados no banco
      const notExecuted = localNames.filter(name => !dbMigrations.includes(name));
      if (notExecuted.length > 0) {
        console.log("\n⚠️  Arquivos locais não executados no banco:");
        notExecuted.forEach(name => console.log(`  - ${name}`));
      }

      if (missingLocal.length === 0 && notExecuted.length === 0) {
        console.log("✅ Tudo sincronizado! Não há discrepâncias.");
      }

      return { missingLocal, notExecuted };
    } catch (error) {
      console.error("❌ Erro ao verificar migrações:", error);
      throw error;
    }
  }

  async resetMigrations() {
    try {
      console.log("🔄 Iniciando reset das migrações...\n");

      // Faz backup da tabela atual
      console.log("📦 Fazendo backup da tabela de migrações...");
      await this.sql`
        CREATE TABLE IF NOT EXISTS drizzle_migrations_backup AS
        SELECT * FROM drizzle_migrations;
      `;
      console.log("✅ Backup criado com sucesso!");

      // Limpa a tabela de migrações
      console.log("\n🧹 Limpando tabela de migrações...");
      await this.sql`TRUNCATE TABLE drizzle_migrations;`;
      console.log("✅ Tabela limpa com sucesso!");

      // Reexecuta todas as migrações
      console.log("\n🚀 Reexecutando todas as migrações...");
      await migrate(this.db, {
        migrationsFolder: "db/migrations",
        migrationsTable: "drizzle_migrations",
      });
      console.log("✅ Migrações reexecutadas com sucesso!");
    } catch (error) {
      console.error("\n❌ Erro ao resetar migrações:", error);
      throw error;
    }
  }

  async cleanDatabase() {
    try {
      console.log("🧹 Iniciando limpeza do banco de dados...");

      // Limpa todos os metadados
      await this.db
        .update(subscriptionPlans)
        .set({ 
          metadata: null,
          active: false 
        });

      console.log("✅ Banco de dados limpo com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao limpar banco de dados:", error);
      throw error;
    }
  }

  async fixMigrations() {
    try {
      console.log("🔧 Iniciando correção das migrações...\n");

      // Busca migrações no banco
      const result = await this.sql`
        SELECT * FROM drizzle_migrations 
        ORDER BY id ASC
      `;

      // Busca arquivos de migração locais
      const migrationsDir = path.join(process.cwd(), "db", "migrations");
      const localMigrations = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith(".sql"))
        .sort();

      console.log("📊 Estado atual das migrações:");
      result.forEach((migration: any) => {
        console.log(`  - ID ${migration.id}: ${migration.hash || 'undefined'}`);
      });

      // Atualiza cada migração com o nome correto
      console.log("\n🔄 Atualizando nomes das migrações...");
      for (let i = 0; i < result.length; i++) {
        const migration = result[i];
        const fileName = localMigrations[i];
        if (fileName) {
          const migrationName = fileName.replace(".sql", "");
          await this.sql`
            UPDATE drizzle_migrations 
            SET hash = ${migrationName}
            WHERE id = ${migration.id}
          `;
          console.log(`  ✓ Migração ${migration.id} atualizada para: ${migrationName}`);
        }
      }

      // Verifica resultado
      const updatedResult = await this.sql`
        SELECT * FROM drizzle_migrations 
        ORDER BY id ASC
      `;

      console.log("\n📊 Estado final das migrações:");
      updatedResult.forEach((migration: any) => {
        console.log(`  - ID ${migration.id}: ${migration.hash}`);
      });

      console.log("\n✨ Processo concluído com sucesso!");
    } catch (error) {
      console.error("\n❌ Erro ao corrigir migrações:", error);
      throw error;
    }
  }

  async checkTable(tableName: string) {
    try {
      console.log(`🔍 Verificando estrutura da tabela ${tableName}...\n`);

      // Busca estrutura da tabela
      const result = await this.sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position;
      `;

      console.log(`📊 Estrutura da tabela ${tableName}:`);
      result.forEach((column: any) => {
        console.log(`  - ${column.column_name}: ${column.data_type} (${column.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });

      return result;
    } catch (error) {
      console.error(`\n❌ Erro ao verificar tabela ${tableName}:`, error);
      throw error;
    }
  }

  private async executeMigration(sql: string, hash: string): Promise<void> {
    console.log(`\n📦 Aplicando migração ${hash}...`);
    
    // Primeiro separa o SQL do rollback
    const [migrationSql] = sql.split('---- ROLLBACK ----');
    
    // Remove comentários
    const cleanSql = migrationSql
      .split('\n')
      .filter(line => !line.trim().startsWith('--')) // Remove comentários
      .join('\n')
      .trim();
    
    // Split SQL into statements using statement-breakpoint
    const statements = cleanSql
      .split('--> statement-breakpoint')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
      .flatMap(stmt => stmt.split(';').map(s => s.trim()).filter(s => s.length > 0))
      .map(stmt => stmt + ';');
    
    console.log(`\n📝 Encontrados ${statements.length} statements para executar:\n`);
    
    // Log each statement
    statements.forEach((stmt, index) => {
      console.log(`🔹 Statement ${index + 1}:\n${stmt}\n`);
    });

    // Execute each statement separately
    for (const statement of statements) {
      try {
        console.log(`🔄 Executando statement:\n${statement}`);
        await this.sql.unsafe(statement);
        console.log('✅ Statement executado com sucesso\n');
      } catch (error) {
        console.error(`❌ Erro ao executar statement:\n${error}`);
        throw error;
      }
    }

    // Registra a migração
    await this.sql`
      INSERT INTO drizzle_migrations (hash)
      VALUES (${hash})
    `;

    console.log(`✅ Migração ${hash} aplicada com sucesso!`);
  }

  private getLocalMigrations(): string[] {
    const migrationsDir = path.join(process.cwd(), "db", "migrations");
    return fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith(".sql"))
      .sort();
  }

  private getHashFromFilename(filename: string): string {
    return filename.replace(".sql", "");
  }

  async migrate(isProd = false) {
    console.log('\n🚀 Iniciando migração...');
    console.log(`📊 Ambiente: ${isProd ? 'production' : 'development'}`);

    // Verifica permissões
    console.log('🔑 Verificando permissões...');
    await this.checkPermissions();
    console.log('✅ Permissões verificadas\n');

    // Se for produção, verifica confirmação
    if (isProd && process.env.CONFIRM_PRODUCTION_MIGRATION !== 'YES_I_KNOW_WHAT_I_AM_DOING') {
      throw new Error('❌ ATENÇÃO: Tentativa de migração em produção sem confirmação explícita. Para executar em produção, defina CONFIRM_PRODUCTION_MIGRATION=\'YES_I_KNOW_WHAT_I_AM_DOING\'');
    }

    try {
      // Obtém estado inicial das migrações
      const initialState = await this.sql<{ hash: string }[]>`
        SELECT hash FROM drizzle_migrations
      `;

      // Identifica migrações pendentes
      const pendingMigrations = this.getLocalMigrations()
        .filter(file => !initialState.some(row => row.hash === this.getHashFromFilename(file)));

      if (pendingMigrations.length > 0) {
        console.log('📦 Migrações pendentes detectadas:', pendingMigrations);
        console.log('🔄 Executando migrações manualmente...');

        // Lista todas as migrações locais
        const allMigrations = this.getLocalMigrations();
        for (const migrationFile of allMigrations) {
          const hash = this.getHashFromFilename(migrationFile);
          
          if (pendingMigrations.includes(migrationFile)) {
            const migrationsDir = path.join(process.cwd(), "db", "migrations");
            const sqlContent = fs.readFileSync(path.join(migrationsDir, migrationFile), 'utf8');
            
            // Aplica a migração
            await this.executeMigration(sqlContent, hash);
          } else {
            console.log(`ℹ️  Migração ${migrationFile} já aplicada.`);
          }
        }

        // Verifica estado final das migrações
        const finalState = await this.sql<{ hash: string }[]>`
          SELECT hash FROM drizzle_migrations
        `;

        console.log('\n✅ Novas migrações aplicadas:');
        pendingMigrations.forEach(file => {
          console.log(`  - ${this.getHashFromFilename(file)}`);
        });

        console.log('\n✅ Todas as migrações foram aplicadas com sucesso!');
      } else {
        console.log('✅ Nenhuma migração pendente encontrada.');
      }

      console.log('\n✨ Processo concluído com sucesso!');
    } catch (error) {
      console.error('\n❌ Erro durante a migração:', error);
      throw error;
    } finally {
      await this.sql.end();
    }
  }

  async initMigrations() {
    try {
      console.log("🚀 Inicializando estado das migrações...");

      // Cria schema se não existir
      await this.sql`
        CREATE SCHEMA IF NOT EXISTS drizzle;
      `;

      // Cria tabela de migrações se não existir
      await this.sql`
        CREATE TABLE IF NOT EXISTS drizzle_migrations (
          id SERIAL PRIMARY KEY,
          hash text NOT NULL,
          created_at timestamp with time zone DEFAULT now()
        );
      `;

      console.log("✅ Estado das migrações inicializado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao inicializar migrações:", error);
      throw error;
    }
  }

  async close() {
    await this.sql.end();
  }

  async syncStripePlans() {
    try {
      console.log("🔄 Iniciando sincronização de planos...");
      
      // Limpa o cache local primeiro
      await this.db
        .update(subscriptionPlans)
        .set({ 
          metadata: null,
          active: false 
        });
      console.log("🧹 Cache local limpo");
      
      const dbPlans = await this.db.select().from(subscriptionPlans);
      console.log(`📊 Encontrados ${dbPlans.length} planos no banco de dados`);
      
      // Busca produtos com seus preços expandidos
      const products = await this.stripe.products.list({
        active: true,
        expand: ['data.default_price'],
      }, {
        maxNetworkRetries: 2
      });
      console.log(`📦 Encontrados ${products.data.length} produtos ativos no Stripe`);

      // Para cada produto
      for (const product of products.data) {
        console.log(`\n💰 Produto "${product.name}" (${product.id})`);
        
        // Busca o produto atualizado
        const freshProduct = await this.stripe.products.retrieve(product.id, {
          expand: ['default_price']
        });
        
        // Busca todos os preços do produto
        const prices = await this.stripe.prices.list({
          product: freshProduct.id,
          active: true,
          expand: ['data.product']
        }, {
          maxNetworkRetries: 2
        });
        console.log(`   ${prices.data.length} preços ativos`);

        // Para cada preço do produto
        for (const price of prices.data) {
          console.log(`   💵 Processando preço ${price.id}`);
          
          // Busca o preço atualizado para garantir metadados mais recentes
          const freshPrice = await this.stripe.prices.retrieve(price.id, {
            expand: ['product']
          });

          // Verifica metadados do produto e do preço
          const productMetadata = freshProduct.metadata || {};
          const priceMetadata = freshPrice.metadata || {};
          
          console.log(`   📝 Metadados do produto:`, Object.keys(productMetadata).length > 0 ? productMetadata : 'nenhum');
          console.log(`   📝 Metadados do preço:`, Object.keys(priceMetadata).length > 0 ? priceMetadata : 'nenhum');

          // Combina os metadados (preço tem prioridade)
          const combinedMetadata = {
            ...productMetadata,
            ...priceMetadata
          };

          const hasMetadata = Object.keys(combinedMetadata).length > 0;
          console.log(`   📦 Metadados combinados:`, hasMetadata ? combinedMetadata : 'nenhum');

          // Atualiza ou insere no banco
          const result = await this.db
            .insert(subscriptionPlans)
            .values({
              planId: freshPrice.id,
              name: freshProduct.name,
              description: freshProduct.description || "",
              amount: String(freshPrice.unit_amount! / 100),
              currency: freshPrice.currency,
              interval: freshPrice.type === "recurring" ? freshPrice.recurring?.interval || "month" : "one_time",
              active: freshProduct.active && freshPrice.active,
              metadata: hasMetadata ? combinedMetadata : null
            })
            .onConflictDoUpdate({
              target: [subscriptionPlans.planId],
              set: {
                name: freshProduct.name,
                description: freshProduct.description || "",
                amount: String(freshPrice.unit_amount! / 100),
                currency: freshPrice.currency,
                interval: freshPrice.type === "recurring" ? freshPrice.recurring?.interval || "month" : "one_time",
                active: freshProduct.active && freshPrice.active,
                metadata: hasMetadata ? combinedMetadata : null
              },
            })
            .returning();

          console.log(`   ✓ ${result[0].name} (${freshPrice.id}): atualizado com metadados:`, result[0].metadata);
        }
      }

      // Verifica produtos que não existem mais no Stripe
      const stripePriceIds = (await Promise.all(
        products.data.map(product => 
          this.stripe.prices.list({ product: product.id, active: true })
        )
      )).flatMap(prices => prices.data.map(price => price.id));

      if (stripePriceIds.length > 0) {
        const result = await this.db
          .update(subscriptionPlans)
          .set({ 
            active: false,
            metadata: null
          })
          .where(
            sql`${subscriptionPlans.planId} NOT IN (${sql.join(stripePriceIds, sql`, `)})`
          )
          .returning();

        if (result.length > 0) {
          console.log(`\n🔄 ${result.length} planos marcados como inativos e metadados removidos`);
        }
      }

      // Verifica estado final
      const finalPlans = await this.db
        .select()
        .from(subscriptionPlans)
        .where(sql`metadata IS NOT NULL`);
      
      console.log("\n📊 Estado final - Planos com metadados:");
      finalPlans.forEach(plan => {
        console.log(`   - ${plan.name} (${plan.planId}):`, plan.metadata);
      });

      console.log("\n✅ Planos sincronizados com sucesso!");
    } catch (error) {
      console.error("\n❌ Erro ao sincronizar planos:", error);
      throw error;
    }
  }

  async dropSchema() {
    console.log('🗑️  Removendo schema drizzle...');
    
    try {
      await this.sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`;
      console.log('✅ Schema removido com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao remover schema:', error);
      throw error;
    }
  }

  async dropAllTables() {
    console.log('🗑️  Removendo todas as tabelas...');
    
    try {
      await this.sql`
        DROP TABLE IF EXISTS 
          drizzle_migrations,
          users,
          subscriptions,
          subscriptions_plans,
          invoices
        CASCADE;
      `;
      console.log('✅ Tabelas removidas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao remover tabelas:', error);
      throw error;
    }
  }

  async dropMigrationsTable() {
    console.log('🗑️  Removendo tabela drizzle_migrations...');
    
    try {
      await this.sql`DROP TABLE IF EXISTS drizzle_migrations;`;
      console.log('✅ Tabela removida com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao remover tabela:', error);
      throw error;
    }
  }

  async cleanMigrations(pattern: string) {
    console.log(`🧹 Limpando migrações que correspondem ao padrão: ${pattern}`);
    
    try {
      const migrations = await this.sql`
        SELECT * FROM drizzle_migrations 
        WHERE hash LIKE ${`%${pattern}%`}
      `;
      
      console.log('\n📋 Migrações encontradas:');
      console.log(migrations);
      
      await this.sql`
        DELETE FROM drizzle_migrations 
        WHERE hash LIKE ${`%${pattern}%`}
      `;
      
      console.log('\n✅ Migrações removidas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao limpar migrações:', error);
      throw error;
    }
  }
}

async function cleanMigrations(pattern: string) {
  console.log(`🧹 Limpando migrações que correspondem ao padrão: ${pattern}`);
  
  try {
    const db = await getDb();
    
    // Listar migrações atuais
    const migrations = await db.execute(
      sql`SELECT * FROM drizzle_migrations WHERE hash LIKE ${`%${pattern}%`}`
    );
    
    console.log('\n📋 Migrações encontradas:');
    console.log(migrations);
    
    // Remover migrações que correspondem ao padrão
    await db.execute(
      sql`DELETE FROM drizzle_migrations WHERE hash LIKE ${`%${pattern}%`}`
    );
    
    console.log('\n✅ Migrações removidas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar migrações:', error);
    process.exit(1);
  }
}

async function getDb() {
  const connectionString = process.env.DIRECT_URL;
  if (!connectionString) {
    throw new Error('DIRECT_URL não encontrada no arquivo .env');
  }
  
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

async function dropMigrationsTable() {
  console.log('🗑️  Removendo tabela drizzle_migrations...');
  
  try {
    const db = await getDb();
    
    await db.execute(
      sql`DROP TABLE IF EXISTS drizzle_migrations;`
    );
    
    console.log('✅ Tabela removida com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao remover tabela:', error);
    process.exit(1);
  }
}

async function dropAllTables() {
  console.log('🗑️  Removendo todas as tabelas...');
  
  try {
    const db = await getDb();
    
    await db.execute(sql`
      DROP TABLE IF EXISTS 
        drizzle_migrations,
        users,
        subscriptions,
        subscriptions_plans,
        invoices
      CASCADE;
    `);
    
    console.log('✅ Tabelas removidas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao remover tabelas:', error);
    process.exit(1);
  }
}

async function dropSchema() {
  console.log('🗑️  Removendo schema drizzle...');
  
  try {
    const db = await getDb();
    
    await db.execute(
      sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`
    );
    
    console.log('✅ Schema removido com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao remover schema:', error);
    process.exit(1);
  }
}

async function main() {
  const manager = new DatabaseManager();
  
  try {
    const command = process.argv[2];
    const param = process.argv[3];
    const hasConfirmFlag = process.argv.includes('--confirm');

    switch (command) {
      case "check":
        await manager.checkMigrations();
        break;

      case "reset":
        if (!hasConfirmFlag) {
          console.log("⚠️  ATENÇÃO: Este comando irá resetar todas as migrações!");
          console.log("Para confirmar, execute: npm run db:reset --confirm");
          process.exit(0);
        }
        await manager.resetMigrations();
        break;

      case "clean":
        if (!hasConfirmFlag) {
          console.log("⚠️  ATENÇÃO: Este comando irá limpar dados do banco!");
          console.log("Para confirmar, execute: npm run db:clean --confirm");
          process.exit(0);
        }
        await manager.cleanDatabase();
        break;

      case "fix":
        if (!hasConfirmFlag) {
          console.log("⚠️  ATENÇÃO: Este comando irá atualizar os nomes das migrações!");
          console.log("Para confirmar, execute: npm run db:fix --confirm");
          process.exit(0);
        }
        await manager.fixMigrations();
        break;

      case "check-table":
        if (!param) {
          console.log("⚠️  Nome da tabela é obrigatório!");
          console.log("Uso: npm run db check-table <nome_tabela>");
          process.exit(1);
        }
        await manager.checkTable(param);
        break;

      case "migrate":
        const isProd = param === "prod";
        await manager.migrate(isProd);
        break;

      case "init":
        await manager.initMigrations();
        break;

      case "sync-plans":
        await manager.syncStripePlans();
        break;

      case 'clean-migrations':
        if (!param) {
          console.error('❌ Por favor, forneça um padrão para limpar as migrações.');
          console.log('Exemplo: npm run db clean-migrations 0006');
          process.exit(1);
        }
        await manager.cleanMigrations(param);
        break;

      case 'drop-migrations-table':
        await manager.dropMigrationsTable();
        break;

      case 'drop-all':
        if (!hasConfirmFlag) {
          console.log("⚠️  ATENÇÃO: Este comando irá remover todas as tabelas!");
          console.log("Para confirmar, execute: npm run db drop-all --confirm");
          process.exit(0);
        }
        await manager.dropAllTables();
        break;

      case 'drop-schema':
        await manager.dropSchema();
        break;

      default:
        console.log("Comandos disponíveis:");
        console.log("  check       - Verifica estado das migrações");
        console.log("  reset       - Reseta e reexecuta migrações (requer --confirm)");
        console.log("  clean       - Limpa dados do banco (requer --confirm)");
        console.log("  fix         - Corrige nomes das migrações (requer --confirm)");
        console.log("  check-table - Verifica estrutura de uma tabela (requer nome da tabela)");
        console.log("  migrate     - Executa migrações pendentes (use 'prod' para produção)");
        console.log("  init        - Inicializa estado das migrações");
        console.log("  sync-plans  - Sincroniza planos do Stripe com o banco");
        console.log("  clean-migrations - Limpa migrações que correspondem ao padrão (requer padrão)");
        console.log("  drop-migrations-table - Remove a tabela drizzle_migrations");
        console.log("  drop-all      - Remove todas as tabelas");
        console.log("  drop-schema   - Remove o schema drizzle");
        process.exit(1);
    }

    console.log("\n✨ Processo concluído com sucesso!");
  } catch (error) {
    console.error("\n❌ Erro:", error);
    process.exit(1);
  } finally {
    await manager.close();
  }
}

// Executa
if (require.main === module) {
  main();
} 