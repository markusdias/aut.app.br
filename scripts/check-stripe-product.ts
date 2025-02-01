import { config } from "dotenv";
import Stripe from "stripe";

// Carrega variáveis de ambiente
config({ path: '.env' });

async function main() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY não está definida");
  }

  const stripe = new Stripe(stripeKey);

  try {
    // Lista todos os produtos
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price']
    });

    console.log("🔍 Produtos encontrados:", products.data.length);

    for (const product of products.data) {
      console.log(`\n📦 Produto: ${product.name} (${product.id})`);
      
      // Busca o produto individualmente
      const freshProduct = await stripe.products.retrieve(product.id, {
        expand: ['default_price']
      });

      console.log("Metadados:", JSON.stringify(freshProduct.metadata, null, 2));
      console.log("Dados completos:", JSON.stringify(freshProduct, null, 2));
    }

  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

// Executa
if (require.main === module) {
  main();
} 