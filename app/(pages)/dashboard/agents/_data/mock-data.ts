// Definição dos tipos
export interface Agent {
  id: string
  name: string
  status: "active" | "paused"
  template: string
  metrics: {
    conversations: number
    satisfaction: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface AgentTemplate {
  id: string
  name: string
  description: string
  category: string
  emoji: string
}

// Dados mockados
export const mockAgents: Agent[] = [
  {
    id: "agt_1",
    name: "Assistente de Vendas",
    status: "active",
    template: "sales",
    metrics: {
      conversations: 150,
      satisfaction: 4.8
    },
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-03-20T10:00:00Z")
  },
  {
    id: "agt_2",
    name: "Suporte Técnico",
    status: "paused",
    template: "support",
    metrics: {
      conversations: 89,
      satisfaction: 4.5
    },
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-03-19T15:30:00Z")
  },
  {
    id: "agt_3",
    name: "Atendimento ao Cliente",
    status: "active",
    template: "customer-service",
    metrics: {
      conversations: 234,
      satisfaction: 4.9
    },
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-03-20T09:15:00Z")
  },
  {
    id: "agt_4",
    name: "FAQ Bot",
    status: "paused",
    template: "faq",
    metrics: {
      conversations: 567,
      satisfaction: 4.2
    },
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-03-18T11:45:00Z")
  },
  {
    id: "agt_5",
    name: "Agendamento",
    status: "active",
    template: "scheduling",
    metrics: {
      conversations: 78,
      satisfaction: 4.7
    },
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-03-20T08:00:00Z")
  }
]

export const mockTemplates: AgentTemplate[] = [
  {
    id: "tmpl_sales",
    name: "Vendedor Amigável",
    description: "Template otimizado para vendas e conversão",
    category: "sales",
    emoji: "🛍️"
  },
  {
    id: "tmpl_support",
    name: "Suporte Técnico",
    description: "Especializado em resolver problemas técnicos",
    category: "support",
    emoji: "🔧"
  },
  {
    id: "tmpl_service",
    name: "Atendimento ao Cliente",
    description: "Focado em atendimento geral e SAC",
    category: "service",
    emoji: "💬"
  }
] 