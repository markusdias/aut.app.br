# Plano: Configuração de Agentes

## Fases de Implementação

### Fase 1: Fundação e Estrutura Base
**Objetivo**: Estabelecer a estrutura básica para gerenciamento de agentes

1. **Estrutura de Dados Base**
   - Schema inicial do banco de dados
   - Tabelas principais: agents, agent_templates
   - Migrations iniciais

2. **Interface Básica de Gestão**
   - CRUD de agentes
   - Lista de agentes
   - Detalhes do agente
   - Templates básicos

3. **Segurança Fundamental**
   - Integração com auth existente
   - Permissionamento básico
   - Validações de acesso

**Entregáveis:**
- Sistema básico de gestão de agentes
- Templates pré-definidos
- Interface administrativa básica

### Fase 2: Integração n8n e Processamento
**Objetivo**: Implementar processamento de conhecimento e integração com n8n

1. **Estrutura n8n**
   - Sistema de credenciais
   - Webhooks e autenticação
   - Monitoramento básico

2. **Processamento de Conhecimento**
   - Upload de arquivos
   - Integração com MinIO
   - Processamento básico via n8n

3. **Feedback e Monitoramento**
   - Logs de processamento
   - Notificações de status
   - Dashboard básico

**Entregáveis:**
- Sistema de processamento de arquivos
- Integração completa com n8n
- Interface de acompanhamento

### Fase 3: Métricas e Analytics
**Objetivo**: Implementar sistema completo de métricas e análise

1. **Estrutura de Métricas**
   - Schema de métricas
   - Agregações e views
   - Sistema de retenção

2. **Dashboard Analítico**
   - Métricas por agente
   - Métricas por cliente
   - Gráficos e relatórios

3. **Performance e Otimização**
   - Índices otimizados
   - Caching de métricas
   - Agregações eficientes

**Entregáveis:**
- Sistema completo de métricas
- Dashboard analítico
- Relatórios automatizados

### Fase 4: Personalização e Features Avançadas
**Objetivo**: Adicionar funcionalidades avançadas e personalização

1. **Personalização Avançada**
   - Editor de templates
   - Configurações avançadas
   - Personalização de comportamento

2. **Features Avançadas**
   - Sistema de tags
   - Categorização automática
   - Análise de sentimento

3. **Integrações Externas**
   - APIs públicas
   - Webhooks customizados
   - Integrações de terceiros

**Entregáveis:**
- Sistema de personalização avançada
- Features premium
- Documentação de APIs

### Fase 5: Escalabilidade e Produção
**Objetivo**: Preparar sistema para escala e produção

1. **Otimização de Performance**
   - Otimização de queries
   - Caching distribuído
   - Load balancing

2. **Monitoramento Avançado**
   - APM completo
   - Alertas avançados
   - Dashboards operacionais

3. **Disaster Recovery**
   - Backup automático
   - Recuperação de falhas
   - Alta disponibilidade

**Entregáveis:**
- Sistema preparado para escala
- Monitoramento completo
- Documentação operacional

## Detalhamento da Fase 1

### 1. Estrutura de Dados Base

#### 1.1 Tabelas Iniciais
```sql
-- Apenas tabelas essenciais para início
CREATE TABLE agents (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 1.2 Interfaces TypeScript
```typescript
interface Agent {
  id: string;
  userId: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

interface AgentTemplate {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}
```

### 2. Interface Básica

#### 2.1 Rotas Iniciais
```typescript
const initialRoutes = {
  '/agents': 'Lista de Agentes',
  '/agents/new': 'Criar Agente',
  '/agents/[id]': 'Detalhes do Agente'
};
```

#### 2.2 Componentes Base
```typescript
// Lista de componentes essenciais
const baseComponents = {
  AgentList: 'Lista principal de agentes',
  AgentForm: 'Formulário de criação/edição',
  AgentCard: 'Card de visualização',
  TemplateSelector: 'Seletor de templates'
};
```

### 3. Segurança Inicial

#### 3.1 Permissões
```typescript
const basePermissions = {
  'agent.view': 'Ver agentes',
  'agent.create': 'Criar agentes',
  'agent.edit': 'Editar agentes',
  'agent.delete': 'Remover agentes'
};
```

#### 3.2 Middleware de Autenticação
```typescript
const validateAgentAccess = (req: Request, res: Response, next: NextFunction) => {
  // Validação básica de acesso
  const { user, agentId } = req;
  // Implementar lógica de validação
};
```

### 4. Planejamento de Implementação

1. **Preparação (2 dias)**
   - Setup do ambiente
   - Criação de branches
   - Configuração inicial

2. **Banco de Dados (3 dias)**
   - Criação de migrations
   - Implementação de models
   - Testes de schema

3. **Backend Base (5 dias)**
   - Endpoints CRUD
   - Validações
   - Testes unitários

4. **Frontend Base (5 dias)**
   - Componentes base
   - Integração com API
   - Testes de interface

5. **Revisão e Ajustes (3 dias)**
   - Code review
   - Ajustes de feedback
   - Documentação inicial

**Total Estimado: 18 dias úteis**

### 5. Critérios de Aceitação

1. **Funcional**
   - CRUD completo de agentes
   - Lista funcional com paginação
   - Templates básicos funcionando
   - Permissionamento funcionando

2. **Técnico**
   - Cobertura de testes > 80%
   - Tempo de resposta < 300ms
   - Zero vulnerabilidades críticas
   - Documentação atualizada

3. **UX/UI**
   - Interface responsiva
   - Feedback claro de ações
   - Navegação intuitiva
   - Mensagens de erro claras

## Visão Geral
Interface simplificada para configuração de agentes automatizados, focando em experiência do usuário e facilidade de uso.

## Estrutura de Templates
Templates pré-configurados para início rápido:
- 🛍️ Vendedor Amigável
- 🔧 Suporte Técnico
- 👔 Atendente Formal
- 😊 Assistente Descontraído

## Estrutura de Navegação

### Menu Principal
```
├── Dashboard           # Visão geral do sistema (já existente)
│   ├── Métricas gerais
│   ├── Gráficos de desempenho
│   └── Atualizações recentes
│
└── Agents (Seção de agentes)
    ├── Meus Agentes       # Lista detalhada
    ├── Novo Agente        # Wizard de criação
    └── Detalhes do Agente # Configuração individual
```

### Rotas e Páginas

1. **Dashboard** (`/dashboard`)
   - Mantém a estrutura existente do startkit
   - Adaptado para incluir métricas de agentes:
     - Total de agentes ativos
     - Conversas em andamento
     - Taxa de sucesso geral
     - Tendências de uso

2. **Meus Agentes** (`/agents`)
   - Lista em cards dos agentes
   - Filtros avançados
     - Por status
     - Por template
     - Por performance
   - Ordenação customizável
   - Ações em lote
   - Busca por nome/ID

3. **Detalhes do Agente** (`/agents/[id]`)
   - Informações básicas
   - Métricas individuais
   - Tabs de configuração:
     - `/agents/[id]/profile`    # Perfil e personalidade
     - `/agents/[id]/knowledge`  # Base de conhecimento
     - `/agents/[id]/settings`   # Configurações
     - `/agents/[id]/metrics`    # Métricas detalhadas
     - `/agents/[id]/history`    # Histórico de conversas

4. **Novo Agente** (`/agents/new`)
   - Wizard em etapas:
     - `/agents/new/template`    # Escolha do template
     - `/agents/new/basic`       # Informações básicas
     - `/agents/new/personality` # Personalização
     - `/agents/new/knowledge`   # Base de conhecimento
     - `/agents/new/review`      # Revisão final

### Navegação Mobile

1. **Menu Inferior**
   - Home/Dashboard
   - Lista de Agentes
   - Criar Novo
   - Configurações

2. **Gestos**
   - Swipe entre tabs
   - Pull to refresh
   - Ações rápidas com long press

### Breadcrumbs
Exemplo de hierarquia:
```typescript
const breadcrumbsMap = {
  '/agents': ['Agentes'],
  '/agents/new': ['Agentes', 'Novo Agente'],
  '/agents/[id]': ['Agentes', 'Nome do Agente'],
  '/agents/[id]/knowledge': ['Agentes', 'Nome do Agente', 'Conhecimento'],
  '/agents/settings': ['Agentes', 'Configurações']
};
```

### Atalhos de Teclado
```typescript
const keyboardShortcuts = {
  'ctrl+n': 'Novo Agente',
  'ctrl+f': 'Buscar Agentes',
  'ctrl+s': 'Salvar Alterações',
  'esc': 'Fechar Modal/Cancelar',
  'ctrl+h': 'Voltar para Dashboard'
};
```

### Permissões e Rotas Protegidas
```typescript
const routePermissions = {
  '/agents/dashboard': ['view_dashboard'],
  '/agents/new': ['create_agent'],
  '/agents/[id]/settings': ['edit_agent'],
  '/agents/settings': ['manage_settings'],
  '/agents/metrics': ['view_metrics']
};
```

### Estrutura de Arquivos
```
src/
└── features/
    └── agents/                    # Feature principal
        ├── components/
        │   ├── AgentCard.tsx     # Card de agente existente
        │   ├── TemplateCard.tsx  # Card de template
        │   └── wizard/           # Componentes do wizard
        └── pages/
            ├── agents/
            │   ├── page.tsx      # Lista de "Meus Agentes"
            │   ├── new/          # Página "Novo Agente"
            │   └── [id]/         # Edição de agente
```

## Fluxo de Configuração
### 1. Escolha Rápida
- Cards visuais de templates
- Preview de comportamento
- Opção "Criar do zero"

### 2. Personalização Básica
- Nome do agente
- Ajuste de tom (Formal → Casual)
- Upload de avatar (opcional)

### 3. Conhecimento Base
- Perguntas/respostas essenciais
- Importação posterior opcional

## Interface
- Preview em tempo real
- Chat simulado
- Atualização instantânea

## Dados Base
```typescript
interface Agent {
  id: string;
  name: string;
  avatar?: string;
  personality: {
    tone: 'formal' | 'friendly' | 'technical';
    useEmojis: boolean;
    useSlang: boolean;
  };
  baseResponses: {
    greeting: string;
    [key: string]: string;
  };
}
```

## Templates Exemplo
```typescript
const AgentTemplates = {
  friendlySales: {
    name: "Vendedor Amigável",
    emoji: "🛍️",
    personality: {
      tone: "friendly",
      useEmojis: true,
      useSlang: true,
    },
    baseResponses: {
      greeting: "Oi! Que bom ter você aqui! 😊 Como posso ajudar?",
      pricing: "Claro! Vou te mostrar as melhores opções que temos 🏷️",
      farewell: "Obrigado pelo contato! Volte sempre! 👋",
    }
  }
  // ... outros templates
}
```

## Estrutura de Dados do Agente

### Dados Gerados Após Configuração
```typescript
interface Agent {
  // Identificação
  id: string;
  userId: string;        // ID do usuário/empresa dona do agente
  name: string;          // Nome do agente
  avatar?: string;       // URL do avatar
  createdAt: Date;
  updatedAt: Date;
  
  // Status e Controle
  status: 'active' | 'inactive' | 'paused';
  isOnline: boolean;
  lastActive: Date;

  // Personalidade e Comportamento
  personality: {
    tone: 'formal' | 'friendly' | 'technical';
    useEmojis: boolean;
    useSlang: boolean;
    baseTemplate?: string;  // ID do template usado como base
  };

  // Respostas e Conhecimento
  knowledge: {
    baseResponses: {
      greeting: string;
      farewell: string;
      fallback: string;   // Resposta para quando não sabe algo
      [key: string]: string;
    };
    faqs: Array<{
      question: string;
      answer: string;
      category?: string;
    }>;
  };

  // Configurações
  settings: {
    workingHours?: {
      start: string;     // "09:00"
      end: string;       // "18:00"
      timezone: string;  // "America/Sao_Paulo"
      daysOfWeek: number[];  // [1,2,3,4,5] (seg-sex)
    };
    autoReply: boolean;
    transferTo?: string;  // ID/email do atendente humano
  };

  // Métricas
  metrics?: {
    totalConversations: number;
    averageResponseTime: number;
    successRate: number;
    lastMetricsUpdate: Date;
  };
}

// Exemplo de um agente configurado
const configuredAgent = {
  id: "agt_123456",
  userId: "usr_789012",
  name: "Ana da Loja Tech",
  avatar: "https://storage.../avatar.png",
  createdAt: "2024-03-21T10:00:00Z",
  updatedAt: "2024-03-21T10:00:00Z",
  
  status: "active",
  isOnline: true,
  lastActive: "2024-03-21T10:00:00Z",

  personality: {
    tone: "friendly",
    useEmojis: true,
    useSlang: false,
    baseTemplate: "tmpl_friendlySales"
  },

  knowledge: {
    baseResponses: {
      greeting: "Oi! Sou a Ana da Loja Tech! 😊 Como posso ajudar?",
      farewell: "Obrigada pelo contato! Volte sempre! 👋",
      fallback: "Desculpe, não entendi. Pode reformular?",
      pricing: "Vou te mostrar as melhores opções que temos 🏷️"
    },
    faqs: [
      {
        question: "Qual o prazo de entrega?",
        answer: "Nosso prazo é de 5 dias úteis para todo o Brasil! 📦",
        category: "shipping"
      }
    ]
  },

  settings: {
    workingHours: {
      start: "09:00",
      end: "18:00",
      timezone: "America/Sao_Paulo",
      daysOfWeek: [1, 2, 3, 4, 5]
    },
    autoReply: true,
    transferTo: "suporte@loja.com"
  },

  metrics: {
    totalConversations: 0,
    averageResponseTime: 0,
    successRate: 0,
    lastMetricsUpdate: "2024-03-21T10:00:00Z"
  }
};
```

Esta estrutura de dados:
1. Mantém todas as configurações do agente
2. Permite monitoramento de status
3. Armazena conhecimento base
4. Registra métricas de uso
5. Flexível para expansões futuras

## Estrutura do Banco de Dados

```sql
-- Tabela principal de agentes
CREATE TABLE agents (
    id VARCHAR(50) PRIMARY KEY,      -- agt_123456
    user_id VARCHAR(50) NOT NULL,    -- Referência ao usuário/empresa
    name VARCHAR(100) NOT NULL,      -- Nome do agente
    avatar_url TEXT,                 -- URL do avatar
    status VARCHAR(20) NOT NULL,     -- active, inactive, paused
    is_online BOOLEAN DEFAULT false,
    last_active TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Personalidade (campos frequentemente acessados)
    tone VARCHAR(20) NOT NULL,       -- formal, friendly, technical
    use_emojis BOOLEAN DEFAULT false,
    use_slang BOOLEAN DEFAULT false,
    base_template_id VARCHAR(50),    -- Referência ao template usado
    
    -- Configurações básicas
    auto_reply BOOLEAN DEFAULT true,
    transfer_to VARCHAR(100),        -- Email/ID para transferência
    
    -- Horário de funcionamento
    working_hours_start TIME,
    working_hours_end TIME,
    working_hours_timezone VARCHAR(50),
    working_days INTEGER[]           -- Array de dias da semana [1,2,3,4,5]
);

-- Respostas base do agente
CREATE TABLE agent_responses (
    id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL REFERENCES agents(id),
    response_type VARCHAR(50) NOT NULL,  -- greeting, farewell, fallback, etc
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAQs do agente
CREATE TABLE agent_faqs (
    id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL REFERENCES agents(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50),
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gatilhos de transferência
CREATE TABLE agent_transfer_triggers (
    id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL REFERENCES agents(id),
    trigger_word VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Métricas do agente
CREATE TABLE agent_metrics (
    id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL REFERENCES agents(id),
    total_conversations INTEGER DEFAULT 0,
    average_response_time INTEGER DEFAULT 0,  -- em segundos
    success_rate DECIMAL(5,2) DEFAULT 0,     -- 0 a 100%
    last_metrics_update TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Métricas por categoria
CREATE TABLE agent_category_metrics (
    id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL REFERENCES agents(id),
    category VARCHAR(50) NOT NULL,
    total_handled INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Templates disponíveis
CREATE TABLE agent_templates (
    id VARCHAR(50) PRIMARY KEY,      -- tmpl_123456
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10),
    description TEXT,
    tone VARCHAR(20) NOT NULL,
    use_emojis BOOLEAN DEFAULT false,
    use_slang BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Respostas padrão dos templates
CREATE TABLE template_responses (
    id VARCHAR(50) PRIMARY KEY,
    template_id VARCHAR(50) NOT NULL REFERENCES agent_templates(id),
    response_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices importantes
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agent_responses_type ON agent_responses(agent_id, response_type);
CREATE INDEX idx_agent_faqs_category ON agent_faqs(agent_id, category);
```

### Observações sobre a Estrutura:

1. **Normalização**:
   - Dados principais do agente na tabela `agents`
   - Respostas, FAQs e métricas em tabelas separadas
   - Templates e suas respostas padrão separados

2. **Campos Estratégicos**:
   - Campos mais acessados na tabela principal
   - Métricas separadas para facilitar atualizações frequentes
   - Índices nas colunas mais consultadas

3. **Relacionamentos**:
   - Chaves estrangeiras para integridade referencial
   - Índices para otimizar consultas de relacionamento
   - Estrutura permite expansão futura

4. **Tipos de Dados**:
   - VARCHAR para identificadores e textos curtos
   - TEXT para conteúdos longos
   - TIMESTAMP para controle temporal
   - BOOLEAN para flags
   - Arrays para dias da semana

5. **Auditoria**:
   - created_at e updated_at em todas as tabelas
   - Registro de alterações de status
   - Controle de métricas com timestamps

## Estratégia de Retenção de Dados

### Estrutura de Armazenamento e Retenção

```sql
-- 1. Tabela principal de conversas (mantém dados recentes)
CREATE TABLE conversations (
    id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(50),
    created_at TIMESTAMP,
    -- Outros campos básicos
) PARTITION BY RANGE (created_at);

-- 2. Tabela de mensagens com política de retenção
CREATE TABLE conversation_messages (
    id VARCHAR(50) PRIMARY KEY,
    conversation_id VARCHAR(50),
    timestamp TIMESTAMP,
    content TEXT,
    sentiment_score DECIMAL(3,2),
    is_agent BOOLEAN
) PARTITION BY RANGE (timestamp);

-- 3. Tabela de insights agregados (mantém histórico longo)
CREATE TABLE conversation_insights (
    id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(50),
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    total_conversations INTEGER,
    avg_sentiment DECIMAL(3,2),
    common_topics JSONB,
    successful_patterns JSONB,
    compressed_learnings TEXT
);
```

### Políticas de Retenção

1. **Dados Completos (30 dias)**
   - Mantém todas as conversas e mensagens
   - Permite análise detalhada recente
   - Base para agregação de insights

2. **Amostragem Inteligente (90 dias)**
   - Mantém casos importantes:
     - Conversas muito positivas (sentiment_score > 0.8)
     - Problemas significativos (sentiment_score < -0.5)
     - Casos únicos ou especiais
     - Respostas com alto sucesso (success_rate > 0.9)
   - Limite de 1000 amostras por agente

3. **Métricas Agregadas (Permanente)**
   - Estatísticas mensais
   - Padrões de sucesso
   - Insights comprimidos
   - Base para melhorias contínuas

### Uso em Prompts

```typescript
async function buildPromptWithHistory(agentConfig, context) {
  // Busca exemplos relevantes
  const relevantExamples = await db.query(`
    SELECT content, success_rate
    FROM conversation_samples
    WHERE 
      agent_id = $1
      AND context_topic = $2
      AND success_rate > 0.8
    ORDER BY success_rate DESC
    LIMIT 3
  `, [agentConfig.id, context.topic]);

  // Busca métricas históricas
  const metrics = await db.query(`
    SELECT compressed_insights
    FROM agent_historical_metrics
    WHERE agent_id = $1
    ORDER BY period DESC
    LIMIT 1
  `, [agentConfig.id]);

  return `
    ${buildBasePrompt(agentConfig)}

    Exemplos de sucesso anteriores:
    ${relevantExamples.map(ex => ex.content).join('\n')}

    Aprendizados históricos:
    ${metrics.compressed_insights}
  `;
}
```

### Benefícios da Estratégia
1. Mantém o banco de dados em tamanho gerenciável
2. Preserva dados importantes para aprendizado
3. Permite análise histórica através de agregações
4. Otimiza uso de armazenamento
5. Automatiza limpeza e manutenção

## Importação de Conhecimento Base

### Estrutura de Armazenamento

```sql
-- Tabela para controle de arquivos de conhecimento
CREATE TABLE knowledge_files (
    id VARCHAR(50) PRIMARY KEY,      -- kf_123456
    agent_id VARCHAR(50) NOT NULL REFERENCES agents(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,  -- pdf, csv, etc
    file_size BIGINT NOT NULL,       -- tamanho em bytes
    minio_path TEXT NOT NULL,        -- caminho no minio
    status VARCHAR(20) NOT NULL,     -- pending, processing, completed, error
    processing_metadata JSONB,       -- metadados do processamento (chunks, tokens, etc)
    vectorization_status VARCHAR(20), -- pending, completed, error
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para controle de processamento
CREATE TABLE knowledge_processing_queue (
    id VARCHAR(50) PRIMARY KEY,
    knowledge_file_id VARCHAR(50) NOT NULL REFERENCES knowledge_files(id),
    n8n_webhook_id VARCHAR(100),     -- ID do webhook no n8n
    status VARCHAR(20) NOT NULL,     -- queued, processing, completed, error
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_knowledge_files_agent ON knowledge_files(agent_id);
CREATE INDEX idx_knowledge_files_status ON knowledge_files(status);
CREATE INDEX idx_knowledge_queue_status ON knowledge_processing_queue(status);
```

### Interface TypeScript

```typescript
interface KnowledgeFile {
    id: string;
    agentId: string;
    fileName: string;
    fileType: 'pdf' | 'csv' | 'txt' | 'doc' | 'docx';
    fileSize: number;
    minioPath: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    processingMetadata?: {
        chunks?: number;
        tokens?: number;
        pages?: number;
        vectorized?: boolean;
    };
    vectorizationStatus?: 'pending' | 'completed' | 'error';
    createdAt: Date;
    updatedAt: Date;
}

interface KnowledgeProcessingQueue {
    id: string;
    knowledgeFileId: string;
    n8nWebhookId?: string;
    status: 'queued' | 'processing' | 'completed' | 'error';
    attempts: number;
    lastAttemptAt?: Date;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}
```

### Fluxo de Upload e Processamento via Webhooks

1. **Upload e Registro**
   ```typescript
   async function handleKnowledgeFileUpload(file: File, agentId: string) {
     // 1. Upload para MinIO
     const minioPath = await uploadToMinio(file);
     
     // 2. Registro na base
     const knowledgeFile = await db.knowledge_files.create({
       id: generateId('kf'),
       agentId,
       fileName: file.name,
       fileType: getFileType(file.name),
       fileSize: file.size,
       minioPath,
       status: 'pending'
     });
     
     // 3. Dispara webhook para N8N processar
     await axios.post('URL_DO_N8N_WEBHOOK', {
       fileInfo: {
         taskId: knowledgeFile.id,
         minioPath,
         fileType: file.type
       },
       // URL que o N8N vai chamar quando terminar
       webhookUrl: 'https://seu-saas.com/api/webhooks/processamento-concluido'
     });
     
     return knowledgeFile;
   }
   ```

2. **Webhook de Retorno**
   ```typescript
   // Endpoint que recebe o aviso do N8N quando terminar
   app.post('/api/webhooks/processamento-concluido', async (req, res) => {
     const { 
       taskId,    // ID do arquivo
       status,    // 'completed' ou 'error'
       metadata   // dados do processamento
     } = req.body;

     // Atualiza status do arquivo
     await db.knowledge_files.update({
       status,
       processingMetadata: metadata
     }).where({ id: taskId });

     // Notifica o frontend (opcional, via WebSocket)
     websocket.emit('file-processed', { taskId, status });

     res.json({ success: true });
   });
   ```

### Segurança dos Webhooks

1. **Autenticação**
   - Token no header do webhook
   - Validação de origem
   - Chaves de API

2. **Validação**
   - Verificação de payload
   - Validação de taskId
   - Rate limiting

3. **Monitoramento**
   - Logs de chamadas
   - Alertas de falha
   - Métricas de sucesso

### Interface do Usuário

1. **Componente de Upload**
   - Drag & drop de arquivos
   - Lista de formatos suportados
   - Indicador de progresso
   - Preview de arquivos quando possível

2. **Lista de Conhecimento**
   - Status de processamento
   - Progresso de vetorização
   - Ações (remover, reprocessar)
   - Metadados (tamanho, data, etc)

3. **Feedback de Processamento**
   - Notificações de status
   - Indicadores de progresso
   - Mensagens de erro amigáveis
   - Opções de retry em caso de falha

### Considerações de Segurança

1. **Validação de Arquivos**
   - Limite de tamanho (ex: 50MB)
   - Tipos permitidos
   - Scan de malware (opcional)
   - Rate limiting por usuário

2. **Acesso ao MinIO**
   - Credenciais seguras
   - URLs pré-assinadas
   - Tempo de expiração
   - Políticas de acesso

3. **Webhooks**
   - Autenticação mútua
   - Validação de payload
   - Retry com backoff
   - Logs de auditoria

### Monitoramento

1. **Métricas**
   - Taxa de sucesso/erro
   - Tempo de processamento
   - Uso de armazenamento
   - Performance de vetorização

2. **Alertas**
   - Falhas consecutivas
   - Gargalos de processamento
   - Limites de armazenamento
   - Erros críticos

## Componentes da Interface

### Componentes Base (Shadcn/UI)
Utilizaremos os seguintes componentes do startkit:

1. **Estrutura e Layout**
   - `Card`: Cards de agentes e templates
   - `Dialog`: Modais e confirmações
   - `Tabs`: Navegação do wizard
   - `ScrollArea`: Áreas de rolagem
   - `Form`: Formulários estruturados

2. **Elementos de Input**
   - `Input`: Campos de texto
   - `Select`: Seleções e dropdowns
   - `Switch`: Toggles de status
   - `Checkbox`: Opções múltiplas
   - `Button`: Ações e interações

3. **Feedback e Status**
   - `Progress`: Barras de progresso
   - `Toast`: Notificações
   - `Badge`: Status e labels
   - `Skeleton`: Loading states

### Componentes Customizados

1. **AgentCard**
   ```typescript
   interface AgentCardProps {
     agent: Agent;
     onStatusChange: (status: string) => void;
     onEdit: () => void;
   }

   const AgentCard = ({ agent, onStatusChange, onEdit }: AgentCardProps) => (
     <Card>
       <CardHeader>
         <div className="flex items-center gap-4">
           <Avatar>
             <AvatarImage src={agent.avatar} />
             <AvatarFallback>{agent.name[0]}</AvatarFallback>
           </Avatar>
           <div>
             <CardTitle>{agent.name}</CardTitle>
             <CardDescription>Template: {agent.personality.baseTemplate}</CardDescription>
           </div>
         </div>
       </CardHeader>
       {/* Status, métricas e ações */}
     </Card>
   );
   ```

2. **AgentWizard**
   ```typescript
   const AgentWizard = () => (
     <Tabs defaultValue="template">
       <TabsList>
         <TabsTrigger value="template">Template</TabsTrigger>
         <TabsTrigger value="basic">Básico</TabsTrigger>
         <TabsTrigger value="knowledge">Conhecimento</TabsTrigger>
       </TabsList>
       
       <Form>
         {/* Etapas do wizard */}
       </Form>
     </Tabs>
   );
   ```

3. **KnowledgeUpload**
   ```typescript
   const KnowledgeUpload = () => (
     <div className="space-y-4">
       {/* Área de upload */}
       <div className="border-2 border-dashed rounded-lg p-8">
         {/* Interface de upload */}
       </div>

       {/* Lista de arquivos */}
       <ScrollArea className="h-[300px]">
         {/* Lista de arquivos com status */}
       </ScrollArea>
     </div>
   );
   ```

4. **ChatPreview**
   ```typescript
   const ChatPreview = () => (
     <div className="border rounded-lg h-[500px] flex flex-col">
       <div className="p-4 border-b">
         <h3>Preview do Chat</h3>
       </div>
       
       <ScrollArea className="flex-1 p-4">
         {/* Mensagens */}
       </ScrollArea>

       <div className="p-4 border-t">
         {/* Input de mensagem */}
       </div>
     </div>
   );
   ```

### Feedback e Notificações

1. **Processamento de Arquivos**
   ```typescript
   // Sistema de notificações para upload
   const ProcessingFeedback = () => {
     useEffect(() => {
       socket.on('file-processed', ({ status, fileName }) => {
         if (status === 'completed') {
           toast.success(`${fileName} processado com sucesso!`);
         } else {
           toast.error(`Erro ao processar ${fileName}`);
         }
       });
     }, []);

     return <Toaster />;
   };
   ```

2. **Estados de Loading**
   ```typescript
   const LoadingState = () => (
     <div className="space-y-4">
       <Skeleton className="h-12 w-full" />
       <Skeleton className="h-4 w-3/4" />
       <Skeleton className="h-4 w-1/2" />
     </div>
   );
   ```

### Temas e Estilos

1. **Variantes de Cards**
   ```typescript
   const cardVariants = {
     active: "border-green-500",
     inactive: "border-gray-200",
     error: "border-red-500"
   };
   ```

2. **Temas por Tipo de Agente**
   ```typescript
   const agentThemes = {
     sales: {
       primary: "blue",
       accent: "indigo"
     },
     support: {
       primary: "green",
       accent: "emerald"
     },
     formal: {
       primary: "gray",
       accent: "slate"
     }
   };
   ```

### Responsividade

1. **Breakpoints**
   ```typescript
   const layoutBreakpoints = {
     cards: {
       sm: "grid-cols-1",
       md: "grid-cols-2",
       lg: "grid-cols-3"
     },
     preview: {
       sm: "h-[300px]",
       md: "h-[400px]",
       lg: "h-[500px]"
     }
   };
   ```

2. **Adaptações Mobile**
   ```typescript
   const MobileNav = () => (
     <Sheet>
       <SheetTrigger asChild>
         <Button variant="ghost" size="icon">
           <MenuIcon />
         </Button>
       </SheetTrigger>
       <SheetContent>
         {/* Navegação mobile */}
       </SheetContent>
     </Sheet>
   );
   ```

### Acessibilidade

1. **Labels e Descrições**
   ```typescript
   const a11yLabels = {
     uploadButton: "Clique ou arraste arquivos",
     statusToggle: "Ativar ou desativar agente",
     chatInput: "Digite sua mensagem"
   };
   ```

2. **Keyboard Navigation**
   ```typescript
   const KeyboardNav = () => {
     useEffect(() => {
       // Handlers para navegação por teclado
     }, []);
   };
   ```

## Próximos Passos
1. Definir estrutura de navegação
2. Implementar templates visuais
3. Criar fluxo simplificado
4. Desenvolver preview em tempo real
5. Adicionar opções avançadas (posterior) 

## Métricas e Agregações do Dashboard

### Contexto de Visualização
Todas as métricas e agregações DEVEM ser contextualizadas pelo `user_id` (empresa/cliente), garantindo que cada cliente visualize apenas seus próprios dados.

### Queries de Agregação por Cliente

1. **Métricas Gerais do Cliente**
```sql
-- Visão geral dos agentes do cliente
SELECT 
  COUNT(*) FILTER (WHERE status = 'active') as active_agents,
  COUNT(*) FILTER (WHERE is_online) as online_agents,
  AVG(metrics.success_rate) as avg_success_rate,
  AVG(metrics.average_response_time) as avg_response_time
FROM agents
LEFT JOIN agent_metrics ON agents.id = agent_metrics.agent_id
WHERE agents.user_id = :current_user_id;  -- Contexto do cliente atual

-- Conversas ativas do cliente
SELECT COUNT(*) as active_conversations
FROM conversations c
JOIN agents a ON c.agent_id = a.id
WHERE a.user_id = :current_user_id  -- Contexto do cliente atual
  AND c.status = 'active'
  AND c.created_at > NOW() - INTERVAL '24 hours';

-- Distribuição por categoria para o cliente
SELECT 
  acm.category,
  COUNT(*) as total,
  AVG(acm.success_rate) as category_success_rate
FROM agent_category_metrics acm
JOIN agents a ON acm.agent_id = a.id
WHERE a.user_id = :current_user_id  -- Contexto do cliente atual
GROUP BY acm.category
ORDER BY total DESC
LIMIT 5;
```

2. **Agregações Temporais por Cliente**
```sql
-- Métricas por hora do cliente
SELECT 
  DATE_TRUNC('hour', c.created_at) as hour,
  COUNT(*) as conversation_count,
  AVG(c.response_time) as avg_response_time
FROM conversations c
JOIN agents a ON c.agent_id = a.id
WHERE a.user_id = :current_user_id  -- Contexto do cliente atual
  AND c.created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', c.created_at)
ORDER BY conversation_count DESC;

-- Tendências mensais do cliente
SELECT 
  DATE_TRUNC('month', ci.created_at) as month,
  COUNT(DISTINCT ci.agent_id) as active_agents,
  COUNT(*) as total_conversations,
  AVG(ci.success_rate) as avg_success_rate
FROM conversation_insights ci
JOIN agents a ON ci.agent_id = a.id
WHERE a.user_id = :current_user_id  -- Contexto do cliente atual
GROUP BY DATE_TRUNC('month', ci.created_at)
ORDER BY month;
```

### Views Materializadas por Cliente

```sql
-- View materializada de métricas diárias por cliente
CREATE MATERIALIZED VIEW client_agent_daily_metrics AS
SELECT 
  DATE_TRUNC('day', c.created_at) as day,
  a.user_id,  -- ID do cliente
  c.agent_id,
  COUNT(*) as total_conversations,
  AVG(c.success_rate) as success_rate,
  AVG(c.response_time) as avg_response_time
FROM conversations c
JOIN agents a ON c.agent_id = a.id
GROUP BY 
  DATE_TRUNC('day', c.created_at),
  a.user_id,
  c.agent_id;

-- Índice para performance
CREATE INDEX idx_client_daily_metrics ON client_agent_daily_metrics(user_id, day);
```

### Considerações de Segurança e Performance

1. **Segurança**
   - Todas as queries DEVEM incluir filtro por `user_id`
   - Validação de acesso em nível de aplicação
   - Auditoria de acessos às métricas

2. **Performance**
   - Views materializadas particionadas por cliente
   - Índices específicos por cliente
   - Cache de métricas frequentes por cliente

3. **Atualizações**
   - Refresh de views em horários específicos por cliente
   - Rate limiting por cliente
   - Priorização de clientes por plano

## Segurança na Integração com N8N

### Autenticação Mútua

1. **Chaves de API Dedicadas**
```typescript
interface N8nConfig {
  apiKey: string;        // Chave para autenticar no n8n
  webhookSecret: string; // Chave para n8n autenticar em nosso sistema
}

// Exemplo de uso
const n8nConfig = {
  apiKey: process.env.N8N_API_KEY,
  webhookSecret: process.env.N8N_WEBHOOK_SECRET
};
```

2. **Headers de Autenticação**
```typescript
// Chamada para o n8n
async function callN8nWebhook(data: any) {
  return axios.post('N8N_WEBHOOK_URL', data, {
    headers: {
      'X-API-KEY': n8nConfig.apiKey,
      'X-Client-ID': 'seu-saas-id',
      'X-Request-Timestamp': Date.now().toString()
    }
  });
}

// Validação de chamadas do n8n
function validateN8nRequest(req: Request) {
  const webhookSecret = req.headers['x-webhook-secret'];
  const timestamp = req.headers['x-request-timestamp'];
  
  // Validação de tempo para prevenir replay attacks
  const isTimestampValid = Date.now() - parseInt(timestamp) < 5 * 60 * 1000; // 5 minutos
  
  return webhookSecret === n8nConfig.webhookSecret && isTimestampValid;
}
```

3. **Restrição de IP**
```typescript
const ALLOWED_N8N_IPS = ['IP_DO_N8N_1', 'IP_DO_N8N_2'];

function validateN8nIP(req: Request) {
  const clientIP = req.ip;
  return ALLOWED_N8N_IPS.includes(clientIP);
}
```

### Configuração no N8N

1. **Webhook Node Configuration**
```json
{
  "authentication": "headerAuth",
  "headerParameters": {
    "X-Webhook-Secret": "{{$node.config.webhookSecret}}",
    "X-Request-Timestamp": "={{Date.now()}}"
  }
}
```

2. **Ambiente Isolado**
- N8N deve estar em rede privada
- Acesso apenas via VPN ou IP fixo
- Firewall configurado para aceitar apenas nosso SaaS

### Implementação no SaaS

```typescript
// Middleware de validação
const validateN8nMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. Validação de IP
  if (!validateN8nIP(req)) {
    logger.warn('Tentativa de acesso de IP não autorizado', { ip: req.ip });
    return res.status(403).json({ error: 'IP não autorizado' });
  }

  // 2. Validação de autenticação
  if (!validateN8nRequest(req)) {
    logger.warn('Falha na autenticação do n8n');
    return res.status(401).json({ error: 'Não autorizado' });
  }

  // 3. Rate limiting
  if (!checkRateLimit(req)) {
    logger.warn('Rate limit excedido para chamadas do n8n');
    return res.status(429).json({ error: 'Muitas requisições' });
  }

  next();
};

// Uso no endpoint
app.post('/api/webhooks/n8n', validateN8nMiddleware, async (req, res) => {
  try {
    // Processamento do webhook
    const result = await processN8nWebhook(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Erro no processamento do webhook', { error });
    res.status(500).json({ error: 'Erro interno' });
  }
});
```

### Monitoramento e Logs

```typescript
interface N8nWebhookLog {
  timestamp: Date;
  ip: string;
  endpoint: string;
  status: 'success' | 'failed';
  errorType?: string;
  responseTime: number;
}

// Sistema de logging específico para n8n
const n8nLogger = {
  logRequest: (log: N8nWebhookLog) => {
    logger.info('N8n webhook request', {
      ...log,
      environment: process.env.NODE_ENV
    });
  }
};
```

### Alertas e Notificações

```typescript
const n8nAlertThresholds = {
  errorRate: 0.1,           // 10% de erros
  responseTime: 5000,       // 5 segundos
  failedAttempts: 3         // 3 tentativas falhas seguidas
};

// Monitor de saúde da integração
async function monitorN8nHealth() {
  const metrics = await getN8nMetrics();
  
  if (metrics.errorRate > n8nAlertThresholds.errorRate) {
    notifyTeam('Alta taxa de erros na integração com n8n');
  }
  
  if (metrics.avgResponseTime > n8nAlertThresholds.responseTime) {
    notifyTeam('Latência alta na integração com n8n');
  }
}
```

### Recuperação de Falhas

```typescript
interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  maxBackoffMs: number;
}

const n8nRetryConfig: RetryConfig = {
  maxAttempts: 3,
  backoffMs: 1000,
  maxBackoffMs: 10000
};

async function retryN8nWebhook(webhookData: any, config: RetryConfig) {
  let attempt = 0;
  let lastError;

  while (attempt < config.maxAttempts) {
    try {
      return await callN8nWebhook(webhookData);
    } catch (error) {
      lastError = error;
      attempt++;
      
      if (attempt < config.maxAttempts) {
        const backoff = Math.min(
          config.backoffMs * Math.pow(2, attempt - 1),
          config.maxBackoffMs
        );
        await sleep(backoff);
      }
    }
  }

  throw new Error(`Falha após ${attempt} tentativas: ${lastError.message}`);
}
```

## Credenciais e Configuração do N8N

### Estrutura de Credenciais

```sql
-- Tabela de credenciais do n8n
CREATE TABLE n8n_credentials (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    webhook_secret_hash VARCHAR(255) NOT NULL,
    client_id VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
);

-- Índices para performance
CREATE INDEX idx_n8n_credentials_user ON n8n_credentials(user_id);
CREATE INDEX idx_n8n_credentials_client ON n8n_credentials(client_id);
```

### Implementação no SaaS

```typescript
// Interface de credenciais
interface N8nCredentials {
  apiKey: string;
  webhookSecret: string;
  clientId: string;
}

// Gerador de credenciais
async function generateN8nCredentials(userId: string): Promise<N8nCredentials> {
  const apiKey = generateSecureToken();
  const webhookSecret = generateSecureToken();
  const clientId = `saas_${userId}`;
  
  await db.n8n_credentials.create({
    id: generateId('n8n_cred'),
    userId,
    apiKeyHash: hashToken(apiKey),
    webhookSecretHash: hashToken(webhookSecret),
    clientId,
    isActive: true
  });

  return {
    apiKey,
    webhookSecret,
    clientId
  };
}

// Componente de gerenciamento
const N8nCredentialsManager = () => {
  const [credentials, setCredentials] = useState<N8nCredentials | null>(null);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Credenciais n8n</CardTitle>
        <CardDescription>
          Gerencie suas credenciais de integração com n8n
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Interface de gerenciamento */}
      </CardContent>
    </Card>
  );
};
```

### Manual de Configuração

#### 1. No SaaS (Nosso Sistema)

1. Acesse o painel de administração
2. Navegue até "Integrações > n8n"
3. Clique em "Gerar Novas Credenciais"
4. Guarde as credenciais geradas:
   - API Key
   - Webhook Secret
   - Client ID
   
**IMPORTANTE**: Estas credenciais só serão mostradas uma vez!

#### 2. No n8n

1. Acesse seu ambiente n8n
2. No menu lateral, clique em "Credentials"
3. Clique em "+ Add Credential"
4. Selecione "Custom API Authentication"
5. Preencha os campos:
   ```json
   {
     "name": "SaaS Integration",
     "type": "customApi",
     "properties": {
       "apiKey": "sua-api-key-gerada",
       "webhookSecret": "seu-webhook-secret-gerado",
       "clientId": "seu-client-id"
     }
   }
   ```
6. Clique em "Save"

#### 3. Configurando um Workflow

1. Crie um novo workflow
2. Adicione um nó HTTP Request ou Webhook
3. Em "Authentication":
   - Selecione "Generic Credential Type"
   - Escolha a credencial criada anteriormente
4. O n8n automaticamente incluirá os headers:
   ```typescript
   {
     "X-API-KEY": "sua-api-key",
     "X-Client-ID": "seu-client-id",
     "X-Request-Timestamp": "timestamp-atual"
   }
   ```

#### 4. Verificação

Para verificar se a configuração está correta:

1. No n8n:
   - Crie um workflow de teste
   - Use um nó HTTP Request
   - Aponte para uma URL de teste do SaaS

2. No SaaS:
   - Verifique os logs de requisição
   - Confirme se os headers estão corretos
   - Valide se a autenticação está funcionando

### Boas Práticas de Segurança

1. **Rotação de Credenciais**
   - Implemente um sistema de rotação periódica
   - Mantenha histórico de credenciais antigas
   - Permita período de graceful shutdown

2. **Monitoramento**
   - Registre todas as tentativas de autenticação
   - Alerte sobre padrões suspeitos
   - Monitore uso por workflow

3. **Limitações**
   - Rate limiting por credencial
   - Timeout em credenciais não utilizadas
   - Escopo de acesso limitado

### Troubleshooting

Problemas comuns e soluções:

1. **Erro de Autenticação**
   - Verifique se as credenciais foram copiadas corretamente
   - Confirme se não há espaços extras
   - Valide o timestamp da requisição

2. **Webhook não Recebido**
   - Verifique as configurações de rede/firewall
   - Confirme se os IPs do n8n estão liberados
   - Valide os logs de ambos os lados

3. **Credenciais Expiradas**
   - Gere novas credenciais
   - Atualize em todos os workflows
   - Mantenha um registro de onde as credenciais são usadas

### Exemplos de Uso

1. **Processamento de Arquivos**
```typescript
// No workflow do n8n
{
  "node": "HTTP Request",
  "parameters": {
    "url": "https://seu-saas.com/api/process-file",
    "method": "POST",
    "authentication": "genericCredentialType",
    "body": {
      "fileId": "{{$json.fileId}}",
      "processType": "knowledge-base"
    }
  }
}
```

2. **Webhook de Retorno**
```typescript
// No workflow do n8n
{
  "node": "Webhook",
  "parameters": {
    "url": "https://seu-saas.com/api/webhooks/n8n",
    "authentication": "genericCredentialType",
    "responseMode": "responseNode"
  }
}
```

### Manutenção e Suporte

1. **Monitoramento Regular**
   - Verifique logs diariamente
   - Monitore taxa de sucesso
   - Acompanhe uso de recursos

2. **Backup de Configurações**
   - Exporte workflows regularmente
   - Documente todas as integrações
   - Mantenha registro de alterações

3. **Plano de Contingência**
   - Tenha credenciais de backup
   - Defina processo de fallback
   - Mantenha contatos de suporte

## Considerações Técnicas e Lições Aprendidas

### Arquitetura React e Next.js

#### Server vs Client Components
Na implementação da interface dos agentes, adotamos uma abordagem cuidadosa na separação entre server e client components:

1. **Páginas como Server Components**
   - Mantemos páginas como server components por padrão
   - Melhor performance de renderização inicial
   - Redução de JavaScript enviado ao cliente

2. **Componentes Interativos**
   - Isolamos lógica client-side em componentes específicos
   - Uso criterioso da diretiva "use client"
   - Componentes reutilizáveis mantidos em `/components/ui`

3. **Boas Práticas Estabelecidas**
   - Análise prévia de necessidade de interatividade
   - Documentação de decisões arquiteturais
   - Testes de hidratação e renderização

4. **Checklist de Implementação**
   ```markdown
   - [ ] Avaliar necessidade de interatividade
   - [ ] Verificar dependências (hooks, bibliotecas)
   - [ ] Documentar decisões técnicas
   - [ ] Testar renderização e hidratação
   - [ ] Validar performance
   ```

Para mais detalhes sobre lições específicas da implementação, consulte:
- [Fase 1A - Interface de Agentes](./fase1-A-agentes-interface.md)
- [Lições Aprendidas](./.cursor/learning/lessons-learned.md) 