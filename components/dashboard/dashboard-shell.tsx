"use client";

import {
  Building2,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { logout } from "@/slice/auth.slice";
import { authApi } from "@/service/api/auth.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function DashboardShell() {
  const dispatch = useAppDispatch();
  const employee = useAppSelector((state) => state.auth.employee);
  if (!employee) return null;
  const name =
    [employee.first_name, employee.last_name].filter(Boolean).join(" ") ||
    employee.email;

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-10">
          <Brand />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {employee.organization_name}
            </span>
            <Button
              variant="outline"
              onClick={() => {
                dispatch(logout());
                dispatch(authApi.util.resetApiState());
              }}
            >
              <LogOut aria-hidden="true" className="size-4" />
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10 sm:px-10 sm:py-14">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <LayoutDashboard aria-hidden="true" className="size-4" />
          Workspace / Overview
        </div>
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Your dashboard
          </p>
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Welcome, {employee.first_name || name}.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            You&apos;re signed in to {employee.organization_name}. This is your
            team&apos;s workspace.
          </p>
        </section>
        <section
          aria-label="Account overview"
          className="grid gap-5 md:grid-cols-3"
        >
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="space-y-4">
              <UserRound
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
              <div>
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="mt-1 text-lg font-medium">{name}</p>
                <p className="mt-1 break-all text-sm text-muted-foreground">
                  {employee.email}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="space-y-4">
              <Building2
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
              <div>
                <p className="text-xs text-muted-foreground">Organization</p>
                <p className="mt-1 text-lg font-medium">
                  {employee.organization_name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {employee.organization_code}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="space-y-4">
              <ShieldCheck
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
              <div>
                <p className="text-xs text-muted-foreground">Account role</p>
                <p className="mt-1 text-lg font-medium">{employee.role}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Employee {employee.employee_code}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
       
      </main>
    </div>
  );
}
