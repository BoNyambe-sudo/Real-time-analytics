"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { LayoutDashboard, List, AlertTriangle, Settings, Menu, X, ChevronRight, ChevronLeft, LogOut } from "lucide-react"
import { RealtimeProvider } from "@/components/RealtimeProvider"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Logs", href: "/dashboard/logs", icon: List },
  { name: "Alerts", href: "/dashboard/alerts", icon: AlertTriangle },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <RealtimeProvider>
      <Sidebar className="h-screen" collapsible="icon" defaultOpen={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex h-16 items-center px-4 border-b">
                  <Link href="/dashboard" className="font-bold text-xl">Analytics</Link>
                </div>
              </SidebarMenuItem>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarFooter>
            <Button variant="ghost" className="w-full justify-start" onClick={() => signOut({ callbackUrl: "/login" })} >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </SidebarFooter>
        </SidebarContent>
        <div className={cn("transition-all duration-200", mobileOpen ? "translate-x-0" : "-translate-x-full", "lg:translate-x-0")}>
          <div className="flex h-screen flex-1 flex-col">
            <header className="h-16 border-b bg-card px-4 flex items-center justify-between">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold truncate flex-1">Dashboard</h1>
            </header>
            <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
          </div>
          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
              <div className="absolute inset-0 bg-black/50" />
            </div>
          )}
        </div>
      </Sidebar>
    </RealtimeProvider>
  )
}