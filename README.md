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

### Comandos Disponíveis

O projeto utiliza um gerenciador unificado de banco de dados com os seguintes comandos:

- `npm run db` - Mostra todos os comandos disponíveis
- `npm run db:check` - Verifica o estado das migrações e identifica discrepâncias
- `npm run db:reset` - Reseta e reexecuta todas as migrações (requer --confirm)
- `npm run db:clean` - Limpa dados específicos do banco (requer --confirm)

### Verificando Estado das Migrações

Para verificar o estado atual das migrações e identificar possíveis problemas:

```bash
npm run db:check
```

Este comando irá:
1. Listar todas as migrações executadas no banco
2. Mostrar todos os arquivos de migração locais
3. Identificar discrepâncias entre banco e arquivos

### Resetando Migrações

Para resetar completamente o estado das migrações:

```bash
npm run db:reset -- --confirm
```

Este comando irá:
1. Fazer backup da tabela de migrações atual
2. Limpar o registro de migrações
3. Reexecutar todas as migrações em ordem

**⚠️ ATENÇÃO**: Use este comando com cautela! Em produção, sempre faça backup antes.

### Limpando Dados

Para limpar dados específicos do banco:

```bash
npm run db:clean -- --confirm
```

Este comando irá:
1. Limpar metadados de planos
2. Desativar planos inativos
3. Manter a estrutura do banco intacta

**Nota**: Diferente do reset, este comando não afeta a estrutura do banco, apenas dados específicos.

### Boas Práticas

1. Sempre verifique o estado com `db:check` antes de executar operações destrutivas
2. Use `--confirm` para comandos que podem causar perda de dados
3. Em produção, sempre faça backup antes de qualquer operação
4. Mantenha as migrações versionadas e nunca modifique migrações já executadas

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

## API Routes

### Autenticação (Clerk)

#### GET /sign-in
Página de login do sistema.

- **Descrição**: Interface de autenticação gerenciada pelo Clerk
- **Redirecionamento**: Após login bem-sucedido, redireciona para `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- **Middleware**: Protegido pelo middleware do Clerk
- **UI Components**: Utiliza componentes oficiais do Clerk para autenticação

#### GET /sign-up
Página de registro de novos usuários.

- **Descrição**: Interface de registro gerenciada pelo Clerk
- **Redirecionamento**: Após registro bem-sucedido, redireciona para `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- **Middleware**: Protegido pelo middleware do Clerk
- **UI Components**: Utiliza componentes oficiais do Clerk para registro

### Dashboard

#### GET /dashboard
Interface principal do usuário após autenticação.

- **Descrição**: Interface principal do usuário após autenticação
- **Autenticação**: Requerida
- **Middleware**: Protegido pelo middleware de autenticação
- **Features**:
  - Visão geral das estatísticas
  - Atividades recentes
  - Status da assinatura

#### GET /dashboard/settings
Configurações do usuário.

- **Descrição**: Interface para gerenciar configurações do usuário
- **Autenticação**: Requerida
- **Features**:
  - Perfil do usuário
  - Preferências
  - Configurações de notificação
  - Integrações

### Planos e Assinaturas

#### GET /api/plans
Retorna todos os planos de assinatura disponíveis.

- **Descrição**: Busca os planos de assinatura cadastrados e, se não encontrar nenhum, sincroniza automaticamente com o Stripe.
- **Autenticação**: Não requerida
- **Resposta de Sucesso**:
  ```json
  {
    "plans": [
      {
        "planId": "string",
        "name": "string",
        "description": "string",
        "amount": "string",
        "currency": "string",
        "interval": "month" | "year" | "one_time",
        "active": boolean,
        "metadata": object | null
      }
    ],
    "message": "Planos carregados com sucesso"
  }
  ```
- **Resposta de Erro**:
  ```json
  {
    "error": "Erro ao buscar planos de assinatura"
  }
  ```
- **Código de Status**: 
  - 200: Sucesso
  - 500: Erro interno

### Workspaces

#### GET /dashboard/workspaces
Lista todos os workspaces do usuário.

- **Descrição**: Interface para gerenciar workspaces
- **Autenticação**: Requerida
- **Features**:
  - Lista de workspaces
  - Criação de novo workspace
  - Gerenciamento de membros
  - Configurações do workspace

#### GET /dashboard/workspaces/[id]
Detalhes de um workspace específico.

- **Descrição**: Interface para gerenciar um workspace específico
- **Autenticação**: Requerida
- **Parâmetros**:
  - `id`: ID do workspace
- **Features**:
  - Detalhes do workspace
  - Membros
  - Atividades
  - Configurações

### Playground

#### GET /playground
Interface do playground de IA.

- **Descrição**: Ambiente para testar e interagir com IA
- **Autenticação**: Requerida
- **Features**:
  - Chat com IA
  - Histórico de conversas
  - Configurações de modelo
  - Exemplos predefinidos

### Marketing

#### GET /
Página inicial (Landing Page).

- **Descrição**: Página principal de marketing
- **Autenticação**: Não requerida
- **Features**:
  - Apresentação do produto
  - Planos e preços
  - Casos de uso
  - Formulário de contato

#### GET /pricing
Página de preços.

- **Descrição**: Exibe planos e preços disponíveis
- **Autenticação**: Não requerida
- **Features**:
  - Comparação de planos
  - Benefícios detalhados
  - Botões de ação para assinatura
  - FAQs sobre preços

### Proteção de Rotas

O sistema utiliza múltiplas camadas de proteção:

1. **Middleware de Autenticação**:
   - Protege rotas que requerem autenticação
   - Redireciona usuários não autenticados para login
   - Gerencia sessões e tokens

2. **Middleware de Autorização**:
   - Verifica permissões do usuário
   - Controla acesso baseado em roles
   - Protege recursos sensíveis

3. **Rate Limiting**:
   - Limita número de requisições por IP
   - Previne abusos e ataques
   - Configurável por rota

### Estrutura de URLs

```
/                           # Landing Page
├── /sign-in               # Login
├── /sign-up              # Registro
├── /pricing              # Preços
├── /dashboard            # Painel Principal
│   ├── /settings        # Configurações
│   └── /workspaces      # Workspaces
│       └── /[id]        # Workspace Específico
└── /playground          # Playground IA
```

### Boas Práticas para Rotas

1. **Nomenclatura**:
   - Use nomes descritivos e consistentes
   - Mantenha URLs em minúsculas
   - Use hífens para separar palavras

2. **Segurança**:
   - Implemente autenticação onde necessário
   - Valide todos os parâmetros de rota
   - Use HTTPS em produção

3. **Performance**:
   - Implemente cache quando possível
   - Otimize carregamento de dados
   - Use loading states apropriados

4. **UX**:
   - Mantenha URLs amigáveis
   - Implemente redirecionamentos apropriados
   - Forneça feedback claro de erros
