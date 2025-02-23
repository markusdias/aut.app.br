"use client"

import { cn } from "@/lib/utils"

interface FilterGroupProps {
  children: React.ReactNode
  className?: string
}

export function FilterGroup({ children, className }: FilterGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6",
        className
      )}
    >
      {children}
    </div>
  )
} 