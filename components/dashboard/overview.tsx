"use client";

import Link from "next/link";
import { CalendarDays, ClipboardCheck, Footprints, UserRoundCheck, Users, ArrowUpRight, CircleAlert } from "lucide-react";
import { MOCK_DATE } from "@/mock";
import { useWorkspaceData } from "./use-workspace-data";
import { todayMetrics } from "./metrics";
import { Panel, Metric, SessionChart, AttendanceChart, Status, time } from "./presentation";
import { WorkspaceState } from "./workspace-state";

export function Overview() {
  const data = useWorkspaceData();
  const metrics = todayMetrics(data.employees, data.attendance, data.patrolSessions, data.taskSessions, data.visitors);
  const recent = [
    ...data.attendance.map((r) => ({ id: `attendance-${r.LogID}`, title: `${r.employee_name} · ${r.AttendanceType === "CHECK_IN" ? "Checked in" : "Checked out"}`, timestamp: `${r.attendance_date}T${r.attendance_time}+01:00`, detail: r.LocationName, href: "/dashboard/attendance", status: r.VerificationStatus })),
    ...data.patrolSessions.filter((r) => r.StartedAt).map((r) => ({ id: `patrol-${r.SessionID}`, title: r.InstanceName, timestamp: r.CompletedAt ?? r.StartedAt ?? "", detail: `${r.FirstName ?? ""} ${r.LastName ?? ""} · ${r.PatrolName ?? "Patrol"}`, href: "/dashboard/patrols", status: r.Status })),
    ...data.visitors.map((r) => ({ id: `visitor-${r.VisitID}`, title: `${r.FullName} · Visitor`, timestamp: r.CheckedOutAt ?? r.CheckedInAt, detail: `${r.PurposeOfVisit} · ${r.LocationName}`, href: "/dashboard/visitors", status: r.Status })),
    ...data.taskSessions.map((r) => ({ id: `task-${r.session_id}`, title: r.task_name, timestamp: r.created_at, detail: `${r.first_name} ${r.last_name}`, href: "/dashboard/tasks", status: r.Status })),
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 6);
  const attention = [
    ...data.reports.map((r) => ({ id: `report-${r.ReportID}`, title: r.ReportText, detail: `${r.LocationName} · ${time(r.CreatedAt)}`, href: "/dashboard/patrols" })),
    ...data.patrolSessions.filter((r) => ["MISSED", "ABANDONED", "INCOMPLETE"].includes(r.Status)).map((r) => ({ id: `missed-${r.SessionID}`, title: `${r.InstanceName} · ${r.Status.toLowerCase()}`, detail: `${r.PatrolDate} · ${r.PatrolName}`, href: "/dashboard/patrols" })),
    ...data.visitors.filter((r) => r.IsFlagged).map((r) => ({ id: `flag-${r.VisitID}`, title: `Flagged visit: ${r.FullName}`, detail: r.FlagReason ?? "Flag reason not available", href: "/dashboard/visitors" })),
    ...data.taskSessions.filter((r) => ["NOT_COMPLETED", "AWAITING_TASK_EVIDENCE", "AWAITING_FACIAL_VERIFICATION"].includes(r.Status)).map((r) => ({ id: `task-${r.session_id}`, title: `${r.task_name} · ${r.Status === "NOT_COMPLETED" ? "Not completed" : r.Status === "AWAITING_TASK_EVIDENCE" ? "Evidence needed" : "Verification needed"}`, detail: `${r.first_name} ${r.last_name} · ${r.session_date}`, href: "/dashboard/tasks" })),
  ];
  return <>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">Operations overview</p><h1 className="text-3xl font-semibold tracking-tight">Welcome, {data.employee?.first_name ?? "Admin"}.</h1><p className="mt-2 text-sm text-muted-foreground">Here&apos;s how your workspace is doing today.</p></div><div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-xs text-muted-foreground"><CalendarDays className="size-4" aria-hidden="true" /><time dateTime={MOCK_DATE}>Tuesday, 13 October 2026</time><span className="border-l pl-2">Lagos</span></div></div>
    <WorkspaceState loading={data.isLoading} error={data.error} retry={data.retry}>
      <section aria-label="Today’s operations" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Attendance today" value={`${metrics.attendance.present}/${metrics.attendance.active}`} detail={`${metrics.attendance.rate?.toFixed(0) ?? "—"}% of active employees checked in`} href="/dashboard/attendance" icon={<UserRoundCheck className="size-5" />} />
        <Metric title="Patrols completed" value={`${metrics.patrols.completed}/${metrics.patrols.total}`} detail="Today’s patrol sessions" href="/dashboard/patrols" icon={<Footprints className="size-5" />} />
        <Metric title="Tasks completed" value={`${metrics.tasks.completed}/${metrics.tasks.total}`} detail="Today’s task sessions" href="/dashboard/tasks" icon={<ClipboardCheck className="size-5" />} />
        <Metric title="Visitors inside" value={metrics.visitors.inside} detail={`${metrics.visitors.total} visits today`} href="/dashboard/visitors" icon={<Users className="size-5" />} />
      </section>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Attendance at a glance" description="Today · Active employees only"><AttendanceChart metrics={metrics.attendance} /><p className="mt-5 text-xs text-muted-foreground">{metrics.attendance.present} present · {metrics.attendance.absent.length} absent · {metrics.attendance.active} active employees</p></Panel>
        <Panel title="Patrol progress" description="Today · Session outcomes"><SessionChart sessions={data.patrolSessions.filter((s) => s.PatrolDate === MOCK_DATE)} label="Today’s patrol sessions" /></Panel>
        <Panel title="Task progress" description="Today · Completion requires evidence and verification"><SessionChart sessions={data.taskSessions.filter((s) => s.session_date === MOCK_DATE)} label="Today’s task sessions" /></Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <Panel title="Recent activity" description="Latest recorded events across your workspace">
          {recent.length ? <ul className="divide-y">{recent.map((r) => <li key={r.id}><Link href={r.href} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 focus-visible:outline-ring"><div className="min-w-0"><p className="text-sm font-medium">{r.title}</p><p className="mt-1 text-xs text-muted-foreground">{r.detail} · {time(r.timestamp)}</p></div><Status value={r.status} /></Link></li>)}</ul> : <p className="text-sm text-muted-foreground">No activity recorded.</p>}
        </Panel>
        <Panel title="Needs attention" description={`${attention.length} items across the last seven days`}>
          {attention.length ? <ul className="space-y-3">{attention.map((r) => <li key={r.id}><Link href={r.href} className="flex items-start gap-3 rounded-xl border bg-muted/20 p-3 transition-colors hover:border-primary/30 focus-visible:outline-ring"><CircleAlert className="mt-0.5 size-4 shrink-0 text-warning-foreground" aria-hidden="true" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{r.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{r.detail}</p></div><ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /></Link></li>)}</ul> : <p className="text-sm text-muted-foreground">No items need attention.</p>}
        </Panel>
      </div>
      <div className="grid gap-4 sm:grid-cols-3"><Metric title="Team members" value={data.employees.length} detail={`${data.employees.filter((e) => e.IsActive).length} active · ${data.employees.filter((e) => !e.IsActive).length} inactive`} href="/dashboard/employees" /><Metric title="Locations" value={data.locations.length} detail={`${data.locations.filter((l) => l.IsActive).length} active locations`} href="/dashboard/locations" /><Metric title="Workspace modules" value={data.subscriptions.filter((s) => s.IsActive).length} detail="Active organization subscriptions" href="/dashboard/organization" /></div>
    </WorkspaceState>
  </>;
}
