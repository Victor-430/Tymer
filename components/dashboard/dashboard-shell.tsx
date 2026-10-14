"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ClipboardCheck, Footprints, LayoutDashboard, LogOut, MapPin, Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck, Users, UserRoundCheck, ChevronRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { logout } from "@/slice/auth.slice";
import { baseApi } from "@/service/api/base.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", path: "/dashboard/employees", icon: Users },
  { label: "Locations", path: "/dashboard/locations", icon: MapPin },
  { label: "Attendance", path: "/dashboard/attendance", icon: UserRoundCheck },
  { label: "Patrols", path: "/dashboard/patrols", icon: Footprints },
  { label: "Tasks", path: "/dashboard/tasks", icon: ClipboardCheck },
  { label: "Visitors", path: "/dashboard/visitors", icon: ShieldCheck },
  { label: "Organization", path: "/dashboard/organization", icon: Building2 },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const employee = useAppSelector((state) => state.auth.employee);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  if (!employee) return null;
  const name = [employee.first_name, employee.last_name].filter(Boolean).join(" ") || employee.email;
  const current = navigation.find((n) => n.path === pathname)?.label ?? "Workspace";
  function signOut() { dispatch(logout()); dispatch(baseApi.util.resetApiState()); }
  function nav(compact = false) {
    return <nav aria-label="Workspace navigation" className="space-y-1.5">{navigation.map(({ label, path, icon: Icon }) => <Link key={path} href={path} onClick={() => setMobileOpen(false)} aria-current={pathname === path ? "page" : undefined} aria-label={label} title={compact ? label : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors focus-visible:outline-ring", pathname === path ? "bg-sidebar-accent font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground", compact && "justify-center")}><Icon className="size-[18px] shrink-0" aria-hidden="true" />{!compact && label}</Link>)}</nav>;
  }
  const account = <div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{employee.first_name?.[0]}{employee.last_name?.[0]}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{name}</p><p className="truncate text-xs text-muted-foreground">{employee.email}</p></div></div>;
  return <div className="min-h-svh bg-workspace">
    <a href="#workspace-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:p-3">Skip to content</a>
    <aside className={cn("fixed inset-y-0 left-0 z-30 hidden flex-col border-r bg-sidebar px-4 py-6 lg:flex", collapsed ? "w-20" : "w-64")}>
      <div className="mb-10 px-2">{collapsed ? <Link href="/dashboard" aria-label="Tymer home" className="flex justify-center text-xl font-semibold text-primary">t.</Link> : <Brand />}</div>
      {!collapsed && <div className="mb-6 rounded-xl border bg-background p-3"><p className="truncate text-sm font-medium">{employee.organization_name}</p><p className="mt-1 text-xs text-muted-foreground">{employee.organization_code}</p></div>}
      {!collapsed && <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Workspace</p>}{nav(collapsed)}
      <div className="mt-auto space-y-4 border-t pt-5">{!collapsed && account}<Button variant="ghost" className="w-full justify-start rounded-lg" aria-label="Log out" onClick={signOut}><LogOut className="size-4" aria-hidden="true" />{!collapsed && "Log out"}</Button></div>
    </aside>
    <div className={cn("min-w-0", collapsed ? "lg:pl-20" : "lg:pl-64")}>
      <header className="sticky top-0 z-20 flex h-18 items-center justify-between gap-4 border-b bg-background/95 px-5 backdrop-blur sm:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu className="size-5" /></Button>
          <Button variant="ghost" size="icon" className="hidden lg:inline-flex" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}</Button>
          <div aria-label="Breadcrumb" className="flex items-center gap-2 text-sm"><span className="hidden text-muted-foreground sm:inline">Workspace</span><ChevronRight className="hidden size-3 text-muted-foreground sm:inline" aria-hidden="true" /><span className="font-medium">{current}</span></div>
        </div>
        <div className="flex items-center gap-3"><span className="hidden rounded-full border px-3 py-1 text-xs text-muted-foreground sm:inline">{employee.role}</span><span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary" aria-label={`Signed in as ${name}`}>{employee.first_name?.[0]}{employee.last_name?.[0]}</span><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Log out" onClick={signOut}><LogOut className="size-4" /></Button></div>
      </header>
      <main id="workspace-content" className="mx-auto max-w-[1600px] space-y-7 px-5 py-8 sm:px-8 lg:px-10">{children}</main>
      <footer className="px-5 py-6 text-xs text-muted-foreground sm:px-8 lg:px-10">Tymer workspace · Times shown in Africa/Lagos</footer>
    </div>
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetContent side="left" className="w-[min(320px,90vw)]"><SheetHeader><SheetTitle>Tymer workspace</SheetTitle><SheetDescription>{employee.organization_name}</SheetDescription></SheetHeader><div className="flex flex-1 flex-col px-5 pb-5">{nav()}<div className="mt-auto border-t pt-5">{account}<Button className="mt-4 w-full" variant="outline" onClick={signOut}>Log out</Button></div></div></SheetContent></Sheet>
  </div>;
}
