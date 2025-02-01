import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "dotenv";

// Carrega variáveis de ambiente do arquivo .env
config();

// Função para validar ambiente
function validateEnvironment() {
  // Verifica se temos uma URL de banco de dados
  if (!process.env.DIRECT_URL && !process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL ou DIRECT_URL não está definida");
  }

  // Em produção, exige confirmação explícita
  if (process.env.NODE_ENV === "production") {
    const confirmation = process.env.CONFIRM_PRODUCTION_MIGRATION;
    if (confirmation !== "YES_I_KNOW_WHAT_I_AM_DOING") {
      throw new Error(
        "❌ ATENÇÃO: Tentativa de migração em produção sem confirmação explícita. " +
        "Para executar em produção, defina CONFIRM_PRODUCTION_MIGRATION='YES_I_KNOW_WHAT_I_AM_DOING'"
      );
    }
  }
}

async function executeMigration() {
  try {
    // Valida ambiente antes de qualquer operação
    validateEnvironment();

    // Usa DIRECT_URL para migrações para evitar problemas com connection pooling
    const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
    
    // Conecta ao banco com configurações específicas para migração
    const sql = postgres(dbUrl!, { 
      max: 1,
      ssl: "require",
      connect_timeout: 10
    });

    const db = drizzle(sql);

    // Log início
    console.log("🚀 Iniciando migração...");
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || "development"}`);

    // Executa migrações de forma evolutiva
    await migrate(db, {
      migrationsFolder: "db/migrations",
      migrationsTable: "drizzle_migrations",
    });

    console.log("✅ Migração concluída com sucesso!");
    
    // Fecha a conexão após a migração
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro durante a migração:", error);
    process.exit(1);
  }
}

// Executa
executeMigration(); 