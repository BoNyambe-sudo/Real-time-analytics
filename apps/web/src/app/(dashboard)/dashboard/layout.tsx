'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMain,
  SidebarHeader,
  useSidebarContext,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  List,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { RealtimeProvider } from '@/components/RealtimeProvider';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Logs', href: '/dashboard/logs', icon: List },
  { name: 'Alerts', href: '/dashboard/alerts', icon: AlertTriangle },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function SidebarNav() {
  const pathname = usePathname();
  const { collapsed } = useSidebarContext();

  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-16 items-center px-4 border-b">
              <Link href="/dashboard" className="font-bold text-xl">
                {collapsed ? null : 'Analytics'}
              </Link>
            </div>
          </SidebarMenuItem>
          {navigation.map(item => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'transition-colors',
                    pathname === item.href && 'bg-primary text-primary-foreground'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

function SidebarHeaderWithTrigger() {
  const { collapsed, toggle } = useSidebarContext();
  return (
    <SidebarHeader>
      <div className="flex items-center justify-between w-full">
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </SidebarHeader>
  );
}

function DashboardInner({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const { open, setOpen } = useSidebarContext();

  return (
    <>
      <Sidebar className="lg:translate-x-0">
        <SidebarContent>
          <SidebarHeaderWithTrigger />
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarMain>
        <SidebarHeader>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold truncate flex-1 text-center lg:text-left">
            {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
          </h1>
          <div className="lg:hidden w-10" />
        </SidebarHeader>
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </SidebarMain>
      {!open && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black/50" onClick={() => setOpen(false)} />
      )}
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RealtimeProvider>
      <SidebarProvider defaultOpen={true} collapsible="icon">
        <DashboardInner pathname={pathname} children={children} />
      </SidebarProvider>
    </RealtimeProvider>
  );
}
