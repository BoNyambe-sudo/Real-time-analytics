"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  children: React.ReactNode
  className?: string
  collapsible?: "none" | "icon"
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Sidebar({ children, className, collapsible, defaultOpen = true, onOpenChange }: SidebarProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [collapsed, setCollapsed] = React.useState(!defaultOpen)

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    if (collapsible === "icon") onOpenChange?.(next)
  }

  return (
    <div className={cn("group flex flex-col h-screen bg-card border-r transition-all duration-200", className, collapsed && collapsible === "icon" && "w-16")}>
      {children}
      {collapsible === "icon" && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full border"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      )}
    </div>
  )
}

export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col flex-1 overflow-y-auto", className)}>{children}</div>
}

export function SidebarFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col space-y-2 p-2", className)}>{children}</div>
}

export function SidebarGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col space-y-2 p-2", className)}>{children}</div>
}

export function SidebarMenu({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col space-y-1", className)}>{children}</div>
}

export function SidebarMenuItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("", className)}>{children}</div>
}

export function SidebarMenuButton({ children, className, asChild, ...props }: React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? React.Fragment : "button"
  return (
    <Comp className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring", className)} {...props}>
      {children}
    </Comp>
  )
}

export { Button }