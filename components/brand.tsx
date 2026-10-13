import Link from "next/link";
import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return <Link href="/" aria-label="Tymer home" className={cn("inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}>
    <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Clock3 aria-hidden="true" className="size-5" /></span>
    <span className="text-xl font-semibold tracking-tight">tymer<span className="text-muted-foreground">.</span></span>
  </Link>;
}
