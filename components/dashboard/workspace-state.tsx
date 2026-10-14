"use client";

import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiError } from "@/service/httpclient/errors";

export function WorkspaceState({ loading, error, retry, children }: { loading: boolean; error: unknown; retry: () => void; children: ReactNode }) {
  if (error) return <div role="alert" className="rounded-2xl border bg-card p-8"><AlertCircle className="mb-4 size-6 text-destructive" aria-hidden="true" /><h2 className="font-semibold">Workspace data is unavailable</h2><p className="mt-2 text-sm text-muted-foreground">{getApiError(error).message}</p><Button variant="outline" className="mt-5" onClick={retry}>Retry</Button></div>;
  if (loading) return <div role="status" aria-label="Loading workspace records" className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div><Skeleton className="h-80 rounded-2xl" /><span className="sr-only">Loading workspace records…</span></div>;
  return children;
}
