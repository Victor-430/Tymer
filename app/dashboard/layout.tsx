import type { ReactNode } from "react";
import { AuthBoundary } from "@/components/auth/auth-boundary";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AuthBoundary mode="protected">{children}</AuthBoundary>;
}
