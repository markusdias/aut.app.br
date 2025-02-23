"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, HomeIcon } from "lucide-react"

interface BreadcrumbItem {
  href: string
  label: string
  active?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  homeHref?: string
}

export function Breadcrumb({ items, homeHref = "/dashboard" }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href={homeHref}
            className="text-muted-foreground hover:text-foreground"
          >
            <HomeIcon className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link
              href={item.href}
              className={`ml-2 text-sm hover:text-foreground ${
                item.active ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
              aria-current={item.active ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
} 