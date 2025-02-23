// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/ui/breadcrumb"

// Icons
import { Plus } from "lucide-react"

// Page Components
import { AgentList } from "@/app/(pages)/dashboard/agents/_components/agent-list"
import { FilterGroup } from "@/app/(pages)/dashboard/agents/_components/filter-group"
import { SearchBar } from "@/app/(pages)/dashboard/agents/_components/search-bar"
import { StatusFilter } from "@/app/(pages)/dashboard/agents/_components/status-filter"
import { SortSelect } from "@/app/(pages)/dashboard/agents/_components/sort-select"

// Data
import { mockAgents } from "@/app/(pages)/dashboard/agents/_data/mock-data"

export default function AgentsPage() {
  const totalAgents = mockAgents.length
  const activeAgents = mockAgents.filter(agent => agent.status === "active").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Agentes</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agente
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <FilterGroup>
              <SearchBar className="flex-1" />
              <StatusFilter />
              <SortSelect />
            </FilterGroup>
          </CardContent>
        </Card>
      </div>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <Breadcrumb
              items={[
                {
                  href: "/dashboard/agents",
                  label: "Agentes",
                  active: true,
                },
              ]}
            />
            <h2 className="text-3xl font-bold tracking-tight mt-2">Agentes</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Agentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAgents}</div>
              <p className="text-xs text-muted-foreground">
                {activeAgents} agentes ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Agentes */}
        <AgentList />
      </div>
    </div>
  )
} 