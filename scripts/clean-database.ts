import { db } from "@/db/drizzle";
import { subscriptionPlans } from "@/db/schema";

async function cleanDatabase() {
  try {
    console.log("🧹 Iniciando limpeza do banco de dados...");

    // Limpa todos os metadados
    await db
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

// Executa a limpeza apenas se o arquivo for executado diretamente
if (require.main === module) {
  cleanDatabase().catch(error => {
    console.error("❌ Falha na limpeza:", error);
    process.exit(1);
  });
} 