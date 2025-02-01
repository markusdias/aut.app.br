import { db } from "@/db/drizzle";
import { subscriptionPlans } from "@/db/schema";
import Stripe from "stripe";
import { sql } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Limpa os metadados de um produto no Stripe se necessário
 */
async function ensureStripeMetadata(product: Stripe.Product): Promise<Stripe.Product> {
  // Se não há metadados, retorna o produto como está
  if (!product.metadata || Object.keys(product.metadata).length === 0) {
    return product;
  }

  try {
    // Tenta limpar os metadados definindo um objeto vazio
    const updatedProduct = await stripe.products.update(product.id, {
      metadata: {}
    });

    console.log(`   🧹 Metadados limpos para "${product.name}"`);
    return updatedProduct;
  } catch (error) {
    console.error(`   ❌ Erro ao limpar metadados de "${product.name}":`, error);
    return product;
  }
}

export async function syncStripePlans() {
  try {
    console.log("🔄 Iniciando sincronização de planos...");
    
    // Primeiro, vamos buscar todos os planos no banco
    const dbPlans = await db.select().from(subscriptionPlans);
    console.log(`📊 Encontrados ${dbPlans.length} planos no banco de dados`);
    
    // Busca todos os produtos ativos no Stripe
    const products = await stripe.products.list({
      active: true,
    });
    console.log(`📦 Encontrados ${products.data.length} produtos ativos no Stripe`);

    // Busca os preços associados a cada produto
    for (const product of products.data) {
      console.log(`\n💰 Produto "${product.name}"`);
      
      // Verifica se há metadados no produto
      const hasMetadata = product.metadata && Object.keys(product.metadata).length > 0;
      console.log(`📝 Status: ${hasMetadata ? 'tem metadados' : 'não tem metadados'}`);

      // Se o produto não deveria ter metadados mas tem, limpa no Stripe
      const shouldHaveMetadata = product.name === "Basico 2"; // Apenas Basico 2 deve ter metadados
      const updatedProduct = shouldHaveMetadata ? product : await ensureStripeMetadata(product);
      
      if (hasMetadata) {
        console.log(`   Metadados:`, updatedProduct.metadata);
      }

      // Busca os preços do produto
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });
      console.log(`   ${prices.data.length} preços ativos`);

      for (const price of prices.data) {
        // Insere ou atualiza o plano no banco de dados
        const result = await db
          .insert(subscriptionPlans)
          .values({
            planId: price.id,
            name: updatedProduct.name,
            description: updatedProduct.description || "",
            amount: String(price.unit_amount! / 100),
            currency: price.currency,
            interval: price.type === "recurring" ? price.recurring?.interval || "month" : "one_time",
            active: updatedProduct.active,
            metadata: Object.keys(updatedProduct.metadata).length > 0 ? updatedProduct.metadata : null
          })
          .onConflictDoUpdate({
            target: [subscriptionPlans.planId],
            set: {
              name: updatedProduct.name,
              description: updatedProduct.description || "",
              amount: String(price.unit_amount! / 100),
              currency: price.currency,
              interval: price.type === "recurring" ? price.recurring?.interval || "month" : "one_time",
              active: updatedProduct.active,
              metadata: Object.keys(updatedProduct.metadata).length > 0 ? updatedProduct.metadata : null
            },
          })
          .returning();

        console.log(`   ✓ ${result[0].name} (${price.id}): atualizado`);
      }
    }

    // Marca como inativos os planos que não existem mais no Stripe
    const stripePriceIds = (await Promise.all(
      products.data.map(product => 
        stripe.prices.list({ product: product.id, active: true })
      )
    )).flatMap(prices => prices.data.map(price => price.id));

    if (stripePriceIds.length > 0) {
      const result = await db
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

    console.log("\n✅ Planos sincronizados com sucesso!");
  } catch (error) {
    console.error("\n❌ Erro ao sincronizar planos:", error);
    throw error;
  }
}

// Executa a sincronização apenas se o arquivo for executado diretamente
if (require.main === module) {
  syncStripePlans().catch(error => {
    console.error("❌ Falha na sincronização:", error);
    process.exit(1);
  });
} 