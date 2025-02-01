import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

// Carrega variáveis de ambiente
config();

async function initMigrations() {
  try {
    const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL ou DIRECT_URL não está definida");
    }

    const sql = postgres(dbUrl, { 
      max: 1,
      ssl: "require",
      connect_timeout: 10
    });

    console.log("🚀 Inicializando estado das migrações...");

    // Lê o journal para obter os hashes corretos
    const journalPath = join(process.cwd(), "db", "migrations", "meta", "_journal.json");
    const journal = JSON.parse(readFileSync(journalPath, "utf-8"));

    // Limpa a tabela de migrações
    await sql`DROP TABLE IF EXISTS drizzle_migrations`;
    
    // Cria a tabela de migrações
    await sql`
      CREATE TABLE drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL UNIQUE,
        created_at timestamptz DEFAULT now()
      );
    `;

    // Insere todas as migrações até a penúltima
    for (const entry of journal.entries.slice(0, -1)) {
      await sql`
        INSERT INTO drizzle_migrations (hash)
        VALUES (${entry.tag})
        ON CONFLICT (hash) DO NOTHING;
      `;
    }

    console.log("✅ Estado das migrações inicializado com sucesso!");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao inicializar migrações:", error);
    process.exit(1);
  }
}

initMigrations(); 