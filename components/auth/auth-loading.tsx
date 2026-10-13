import { Loader2 } from "lucide-react";

export function AuthLoading() {
  return (
    <div role="status" className="flex min-h-svh items-center justify-center gap-3 text-sm text-muted-foreground">
      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
      Loading…
    </div>
  );
}
