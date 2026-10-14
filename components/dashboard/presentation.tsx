"use client";

import { useState, type ReactNode } from "react";
import { ArrowUpRight, Circle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable, type TableColumn } from "@/components/shared/data-table";
import { DonutChart } from "@/components/arc/donut-chart/donut-chart";
import { WaffleChart } from "@/components/arc/waffle-chart/waffle-chart";
import { cn } from "@/lib/utils";
import type { attendanceMetrics } from "./metrics";

export function humanize(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function time(value: string | null | undefined) {
  if (!value) return "Not available";
  if (!value.includes("T")) return value.slice(0, 5);
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function Status({ value }: { value: string }) {
  const good = ["COMPLETED", "ACTIVE", "EARLY", "VERIFIED", "CHECKED_OUT"].includes(value);
  const attention = ["MISSED", "NOT_COMPLETED", "LATE", "FLAGGED", "ABANDONED"].includes(value);
  return <Badge variant="outline" className={cn("gap-1.5 whitespace-nowrap rounded-md px-2 py-1 font-normal", good ? "border-primary/15 bg-primary/5 text-primary" : attention ? "border-warning/25 bg-warning/10 text-warning-foreground" : "border-border bg-muted/40 text-muted-foreground")}><Circle aria-hidden="true" className="size-1.5 fill-current" />{humanize(value)}</Badge>;
}

export function Panel({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return <section className={cn("min-w-0 rounded-2xl border bg-card p-5 sm:p-6", className)}><h2 className="font-semibold">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}<div className="mt-6">{children}</div></section>;
}

export function Metric({ title, value, detail, href, icon }: { title: string; value: string | number; detail: string; href?: string; icon?: ReactNode }) {
  const content = <><div className="flex items-center justify-between text-muted-foreground"><span className="text-sm">{title}</span>{icon}</div><p className="mt-5 text-3xl font-semibold tracking-tight">{value}</p><div className="mt-3 flex items-center justify-between gap-2"><p className="text-xs text-muted-foreground">{detail}</p>{href && <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground" />}</div></>;
  return href ? <Link href={href} className="block rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-ring" aria-label={`${title}: ${value}. ${detail}`}>{content}</Link> : <div className="rounded-2xl border bg-card p-5">{content}</div>;
}

export function RecordDetails({ record }: { record: object }) {
  return <dl className="space-y-4">{Object.entries(record).map(([key, value]: [string, unknown]) => <div key={key} className="border-b pb-3 last:border-0"><dt className="text-xs text-muted-foreground">{humanize(key)}</dt><dd className="mt-1 break-words text-sm">{value == null ? "Not available" : typeof value === "boolean" ? value ? "Yes" : "No" : typeof value === "string" || typeof value === "number" ? String(value) : Array.isArray(value) ? `${value.length} related records` : "Related information available"}</dd></div>)}</dl>;
}

export function RecordTable<T extends object>({ title, data, columns, rowKey, status, details }: {
  title: string; data: T[]; columns: TableColumn<T>[]; rowKey: (row: T) => number | string;
  status?: (row: T) => string; details?: (row: T) => ReactNode;
}) {
  const [selected, setSelected] = useState<T | null>(null);
  return <><DataTable title={title} data={data} columns={columns} rowKey={rowKey} status={status} onInspect={setSelected} />
    <Sheet open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl"><SheetHeader><SheetTitle>{title} details</SheetTitle><SheetDescription>Record {selected ? rowKey(selected) : ""}. Times are shown in Africa/Lagos.</SheetDescription></SheetHeader>{selected && <div className="space-y-8 px-6 pb-8"><RecordDetails record={selected} />{details?.(selected)}</div>}</SheetContent>
    </Sheet>
  </>;
}

export function DatasetTabs({ items }: { items: Array<{ label: string; content: ReactNode }> }) {
  return <Tabs defaultValue={items[0].label} className="gap-5"><div className="max-w-full overflow-x-auto pb-1"><TabsList className="h-11" aria-label="Related datasets">{items.map((item) => <TabsTrigger key={item.label} value={item.label}>{item.label}</TabsTrigger>)}</TabsList></div>{items.map((item) => <TabsContent key={item.label} value={item.label}>{item.content}</TabsContent>)}</Tabs>;
}

const STATUS_ORDER = ["COMPLETED", "IN_PROGRESS", "PENDING", "AWAITING_TASK_EVIDENCE", "AWAITING_FACIAL_VERIFICATION", "NOT_COMPLETED", "MISSED", "INCOMPLETE", "ABANDONED"];
const STATUS_COLORS: Record<string, string> = { COMPLETED: "--chart-1", IN_PROGRESS: "--chart-2", PENDING: "--chart-5", AWAITING_TASK_EVIDENCE: "--chart-3", AWAITING_FACIAL_VERIFICATION: "--chart-5", NOT_COMPLETED: "--chart-4", MISSED: "--chart-4", INCOMPLETE: "--chart-3", ABANDONED: "--chart-4" };
export function SessionChart({ sessions, label }: { sessions: Array<{ Status: string }>; label: string }) {
  const categories = STATUS_ORDER.filter((s) => sessions.some((r) => r.Status === s)).map((s) => ({ key: s, label: humanize(s), value: sessions.filter((r) => r.Status === s).length, color: `var(${STATUS_COLORS[s]})` }));
  return <DonutChart data={categories} label={label} unit="sessions" groupBelow={0} maxSegments={9} legendAction="select" size={172} thickness={20} />;
}

export function AttendanceChart({ metrics }: { metrics: ReturnType<typeof attendanceMetrics> }) {
  return <WaffleChart label="Employee attendance" unit="employees" rows={5} columns={10} data={[
    { key: "early", label: "Early / on time", value: metrics.early, color: "var(--chart-1)" },
    { key: "late", label: "Late", value: metrics.late, color: "var(--chart-3)" },
    { key: "absent", label: "Absent", value: metrics.absent.length, color: "var(--chart-5)" },
    { key: "undisclosed", label: "Punctuality unavailable", value: metrics.undisclosed, color: "var(--chart-4)" },
  ]} />;
}
