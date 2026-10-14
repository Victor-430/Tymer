import type { ReactNode } from "react";
import { AuthBoundary } from "@/components/auth/auth-boundary";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

// Memory-only authentication withholds the dashboard shell during prerendering.
export const instant = false;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AuthBoundary mode="protected"><DashboardShell>{children}</DashboardShell></AuthBoundary>;
}
