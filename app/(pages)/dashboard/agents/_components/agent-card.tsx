"use client"

import { Agent } from "@/types/agents"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { 
  Bot, 
  MessageSquare, 
  Star, 
  MoreVertical, 
  Pencil,
  Play,
  Pause,
  Trash,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AgentCardProps {
  agent: Agent
  onStatusChange?: (id: string, status: 'active' | 'paused') => void
  onDelete?: (id: string) => void
}

const statusConfig = {
  active: { label: "Ativo", class: "bg-green-500/10 text-green-500" },
  inactive: { label: "Inativo", class: "bg-gray-500/10 text-gray-500" },
  paused: { label: "Pausado", class: "bg-yellow-500/10 text-yellow-500" },
}

export function AgentCard({ agent, onStatusChange, onDelete }: AgentCardProps) {
  const status = statusConfig[agent.status]
  const isActive = agent.status === 'active'

  // Formatar data de última atualização
  const lastUpdate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(agent.updatedAt)

  return (
    <Card className="group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar>
                <AvatarFallback className="bg-primary/10">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
                isActive ? "bg-green-500" : "bg-gray-500"
              )} />
            </div>
            <div>
              <h3 className="font-semibold">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">{agent.template}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={cn(status.class)}>
              {status.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange?.(agent.id, isActive ? 'paused' : 'active')}>
                  {isActive ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Ativar
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => onDelete?.(agent.id)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span>{agent.metrics.conversations}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span>{agent.metrics.satisfaction.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Última atualização: {lastUpdate}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 