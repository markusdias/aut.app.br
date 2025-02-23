export type AgentStatus = 'active' | 'inactive' | 'paused';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  avatar?: string;
  template: string;
  metrics: {
    conversations: number;
    satisfaction: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji?: string;
} 