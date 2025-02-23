"use client"

import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"

interface SearchBarProps {
  className?: string
  placeholder?: string
}

export function SearchBar({ className, placeholder = "Buscar agentes..." }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Estado local para input imediato
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "")
  
  // Debounce do valor do input
  const debouncedValue = useDebounce(inputValue, 300)
  
  // Atualiza a URL quando o valor debounced muda
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedValue) {
      params.set("q", debouncedValue)
    } else {
      params.delete("q")
    }
    router.push(`?${params.toString()}`)
  }, [debouncedValue, router, searchParams])
  
  // Handler para limpar a busca
  const handleClear = useCallback(() => {
    setInputValue("")
  }, [])

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-9 pr-9"
        placeholder={placeholder}
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
} 