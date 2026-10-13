"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuthLoading } from "./auth-loading";
import { useAppSelector } from "@/store/hooks";

export function AuthBoundary({ mode, children }: { mode: "guest" | "protected"; children: ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  const router = useRouter();
  const allowed = mode === "protected" ? Boolean(token) : !token;

  useEffect(() => {
    if (!allowed) router.replace(mode === "protected" ? "/login" : "/dashboard");
  }, [allowed, mode, router]);

  if (!allowed) return <AuthLoading />;
  return children;
}
