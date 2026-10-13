import { DashboardShell } from "@/components/dashboard/dashboard-shell";

// The layout deliberately withholds this segment from unauthenticated users.
export const instant = false;

export default function DashboardPage() {
  return <DashboardShell />;
}
