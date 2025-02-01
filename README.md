# Next.js 15 Starter Kit

A modern, feature-rich starter template for building production-ready applications with Next.js 15, Tailwind CSS, and TypeScript.

![Next Starter Kit](https://dwdwn8b5ye.ufs.sh/f/MD2AM9SEY8GucGJl7b5qyE7FjNDKYduLOG2QHWh3f5RgSi0c)

## Features

### Core Technologies
- ⚡ **Next.js 15** - The latest version with App Router
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📘 **TypeScript** - Type-safe code
- 🔒 **Authentication** - Clerk integration with persistent authorization toggle
- 🎭 **Shadcn/ui** - Beautiful and accessible components
- 🖼️ **SVG Support** - Native SVG rendering with image fallbacks

### Performance Optimizations
- 🚀 **Route Prefetching** - Instant page transitions for dashboard, playground, and auth pages
- 🖼️ **Optimized Images** - Eager loading for critical images
- 🌓 **Dark/Light Mode** - System-aware theme switching with custom gradients
- 📱 **Responsive Design** - Mobile-first approach
- 💾 **State Persistence** - Local storage for user preferences

### Developer Experience
- 🧩 **Component Library** - Pre-built, customizable components
- 🎮 **AI Playground** - Built-in AI chat interface
- 📊 **Dashboard Template** - Ready-to-use admin interface
- 🔍 **SEO Optimized** - Meta tags and sitemap generation

### Additional Features
- 🎬 **Custom Video Player** - Built-in video playback component
- 📝 **Blog Support** - Ready for content creation
- 🔄 **State Management** - Clean and efficient
- 🌐 **API Integration** - Ready for backend services

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/michaelshimeles/nextjs14-starter-template.git
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables:
```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Database
DATABASE_URL=

# Frontend
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional: AI Integration
OPENAI_API_KEY=
```

5. Run the development server:
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## Project Structure

```
├── app/
│   ├── (auth)/         # Authentication routes
│   ├── (marketing)/    # Marketing pages
│   ├── api/           # API routes
│   ├── dashboard/     # Dashboard pages
│   └── playground/    # AI Playground
├── components/
│   ├── homepage/     # Landing page components
│   ├── shared/       # Shared UI components
│   └── wrapper/      # Layout wrappers and navigation
├── config/           # Configuration files
├── lib/             # Utility functions
├── public/          # Static assets
│   ├── images/      # Image assets
│   └── svg/         # SVG assets
└── styles/          # Global styles
```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this template helpful, please give it a ⭐️ on GitHub!

## Gerenciamento do Banco de Dados

### Scripts Disponíveis

- `npm run db:clean`: Limpa o banco de dados, removendo todas as tabelas existentes
- `npm run migrate:init`: Inicializa o estado das migrações
- `npm run migrate`: Executa as migrações pendentes

### Resetando o Banco de Dados

Para resetar completamente o banco de dados e aplicar todas as migrações:

```bash
npm run db:clean && npm run migrate:init && npm run migrate
```

Este comando irá:
1. Remover todas as tabelas existentes
2. Inicializar o estado das migrações
3. Recriar todas as tabelas com a estrutura mais recente

**Atenção**: Use o comando de reset apenas em ambiente de desenvolvimento. Nunca use em produção, pois todos os dados serão perdidos.

## Gerenciamento de Benefícios dos Produtos

### Configurando Benefícios no Stripe

Para adicionar benefícios a um produto no Stripe, você precisa configurar os metadados do produto. Siga os passos:

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
2. Vá para Products > Selecione o produto
3. Na seção "Metadata", adicione:

   - Key: `benefits`
   - Value: Array JSON com os benefícios, exemplo:
   ```json
   [
     {"name":"Five workspaces","included":true,"order":1},
     {"name":"Email support","included":true,"order":2},
     {"name":"30 day data retention","included":true,"order":3},
     {"name":"Custom roles","included":true,"order":4},
     {"name":"Priority support","included":true,"order":5},
     {"name":"SSO","included":true,"order":6}
   ]
   ```

   - Key: `userDescription`
   - Value: Descrição do público-alvo, exemplo: `"Best for 5-50 users"`

### Estrutura dos Benefícios

Cada benefício no array deve ter:
- `name`: Nome do benefício
- `included`: Boolean indicando se está incluso (`true`) ou não (`false`)
- `order`: Número inteiro para ordenação na exibição

### Sincronização com o Banco de Dados

Após fazer alterações nos produtos ou metadados no Stripe, execute:

```bash
npm run sync:plans
```

Este comando irá:
1. Sincronizar todos os produtos ativos do Stripe
2. Atualizar preços e metadados no banco de dados
3. Marcar produtos removidos como inativos

> **Nota**: Os benefícios são exibidos automaticamente na página de pricing para produtos que possuem metadados configurados.
