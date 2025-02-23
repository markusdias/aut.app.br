"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowDownAZ, ArrowDownWideNarrow, Clock } from "lucide-react"
import { useCallback } from "react"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"

interface SortSelectProps {
  className?: string
}

type SortOption = "name" | "status" | "updatedAt"

const sortOptions = [
  {
    value: "name",
    label: "Nome",
    icon: ArrowDownAZ,
  },
  {
    value: "status",
    label: "Status",
    icon: ArrowDownWideNarrow,
  },
  {
    value: "updatedAt",
    label: "Última atualização",
    icon: Clock,
  },
] as const

export function SortSelect({ className }: SortSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "updatedAt"

  const handleSortChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === "updatedAt") {
        params.delete("sort")
      } else {
        params.set("sort", value)
      }
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  const selectedOption = sortOptions.find((option) => option.value === currentSort)

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className={cn("w-[200px]", className)}>
        <SelectValue>
          <div className="flex items-center gap-2">
            {selectedOption && (
              <>
                <selectedOption.icon className="h-4 w-4" />
                <span>{selectedOption.label}</span>
              </>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <option.icon className="h-4 w-4" />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 