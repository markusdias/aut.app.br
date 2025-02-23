"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCallback } from "react"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"

interface StatusFilterProps {
  className?: string
}

type Status = "all" | "active" | "paused"

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "active", label: "Ativos" },
  { value: "paused", label: "Pausados" },
] as const

export function StatusFilter({ className }: StatusFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get("status") || "all"

  const handleStatusChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === "all") {
        params.delete("status")
      } else {
        params.set("status", value)
      }
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder="Filtrar por status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 