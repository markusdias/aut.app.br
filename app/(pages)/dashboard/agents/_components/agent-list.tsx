"use client"

import { AgentCard } from "@/app/(pages)/dashboard/agents/_components/agent-card"
import { mockAgents } from "@/app/(pages)/dashboard/agents/_data/mock-data"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"

type Status = "all" | "active" | "paused"
type SortOption = "name" | "status" | "updatedAt"

export function AgentList() {
  const searchParams = useSearchParams()
  
  // Estados da URL
  const searchQuery = searchParams.get("q") || ""
  const status = (searchParams.get("status") || "all") as Status
  const sort = (searchParams.get("sort") || "updatedAt") as SortOption

  // Filtra e ordena os agentes
  const filteredAgents = useMemo(() => {
    let filtered = [...mockAgents]

    // Aplica filtro de busca
    if (searchQuery) {
      filtered = filtered.filter((agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Aplica filtro de status
    if (status && status !== "all") {
      filtered = filtered.filter((agent) => agent.status === status)
    }

    // Aplica ordenação
    if (sort) {
      filtered.sort((a, b) => {
        switch (sort) {
          case "name":
            return a.name.localeCompare(b.name)
          case "status":
            return a.status.localeCompare(b.status)
          case "updatedAt":
            return b.updatedAt.getTime() - a.updatedAt.getTime()
          default:
            return 0
        }
      })
    }

    return filtered
  }, [searchQuery, status, sort])

  if (filteredAgents.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h3 className="mt-4 text-lg font-semibold">Nenhum agente encontrado</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Não encontramos nenhum agente com os filtros selecionados. Tente ajustar seus critérios de busca.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredAgents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
} 