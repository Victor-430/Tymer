import { Overview } from "@/components/dashboard/overview";

// The layout deliberately withholds this segment from unauthenticated users.
export const instant = false;

export default function DashboardPage() {
  return <Overview />;
}
