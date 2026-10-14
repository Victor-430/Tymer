"use client";

import type { ReactNode } from "react";
import type { TableColumn } from "@/components/shared/data-table";
import type { AttendanceExportRecord, Checkpoint, EmployeeSummary, NfcTag, OrganizationLocation, OrganizationSubscription, PatrolSummary, PatrolSession, PatrolReport, DashGetPatrolInstancesInstance, TaskSummary, TaskSession, TaskEvidence, Subtask, VisitorSummary, EmployeeLocationAccess } from "@/models/api-response";
import { useDashboardEmployeeAccessQuery } from "@/service/api/locations.api";
import { inDateRange } from "@/service/httpclient/dashboard-mocks";
import { MOCK_DATE } from "@/mock";
import { WorkspaceState } from "./workspace-state";
import type { WorkspaceData } from "./use-workspace-data";
import { attendanceMetrics, sessionMetrics } from "./metrics";
import { Panel, Metric, RecordTable, DatasetTabs, SessionChart, AttendanceChart, Status, time } from "./presentation";

type ViewProps = { data: WorkspaceData; start: string; end: string };
function field<T>(key: keyof T & string, label: string, render?: (row: T) => ReactNode): TableColumn<T> {
  return { key, label, render, value: (row) => { const value: unknown = row[key]; return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? value : null; } };
}
const active = (row: { IsActive: boolean }) => row.IsActive ? "ACTIVE" : "INACTIVE";
const statusColumn = <T extends { Status: string }>(): TableColumn<T> => field("Status", "Status", (r) => <Status value={r.Status} />);
const activeColumn = <T extends { IsActive: boolean }>(): TableColumn<T> => ({ key: "IsActive", label: "Status", value: active, render: (r) => <Status value={active(r)} /> });
const fullName = (e: EmployeeSummary) => `${e.FirstName} ${e.LastName}`;
function rate(value: number | null) { return value === null ? "—" : `${value.toFixed(1).replace(/\.0$/, "")}%`; }

function RelatedList({ title, items }: { title: string; items: string[] }) {
  return <section><h3 className="mb-3 text-sm font-semibold">{title}</h3>{items.length ? <ul className="space-y-2 text-sm">{items.map((item, i) => <li className="rounded-lg bg-muted/50 p-3" key={`${i}-${item}`}>{item}</li>)}</ul> : <p className="text-sm text-muted-foreground">No records available.</p>}</section>;
}

function EmployeeAccess({ employee }: { employee: EmployeeSummary }) {
  const query = useDashboardEmployeeAccessQuery({ employee_id: employee.EmployeeID, limit: 1000 });
  return <WorkspaceState loading={query.isLoading} error={query.error} retry={() => { void query.refetch(); }}><RelatedList title="Recorded location access" items={(query.data?.data?.employee_access ?? []).map((r) => `${r.LocationName} · ${r.AccessType} · ${r.IsActive ? "Active" : "Inactive"}`)} /></WorkspaceState>;
}

export function EmployeesView({ data }: ViewProps) {
  return <><div className="grid gap-4 sm:grid-cols-3"><Metric title="Team members" value={data.employees.length} detail="Across the organization" /><Metric title="Active employees" value={data.employees.filter((r) => r.IsActive).length} detail="Included in attendance metrics" /><Metric title="Inactive employees" value={data.employees.filter((r) => !r.IsActive).length} detail="Excluded from attendance metrics" /></div>
    <RecordTable title="Employee directory" data={data.employees} rowKey={(r) => r.EmployeeID} status={active} columns={[
      { key: "name", label: "Employee", value: (r) => `${fullName(r)} ${r.Email}`, render: (r) => <div><p className="font-medium">{fullName(r)}</p><p className="mt-1 text-xs text-muted-foreground">{r.Email}</p></div> },
      field<EmployeeSummary>("EmployeeCode", "Code"), field<EmployeeSummary>("Role", "Role"), activeColumn<EmployeeSummary>(),
    ]} details={(employee) => <><RelatedList title="Attendance" items={data.attendance.filter((r) => r.EmployeeID === employee.EmployeeID).map((r) => `${r.attendance_date} ${r.attendance_time} · ${r.AttendanceType === "CHECK_IN" ? "Checked in" : "Checked out"} · ${r.LocationName}`)} /><RelatedList title="Patrol sessions" items={data.patrolSessions.filter((r) => r.EmployeeID === employee.EmployeeID).map((r) => `${r.InstanceName} · ${r.Status} · ${r.PatrolDate}`)} /><RelatedList title="Task sessions" items={data.taskSessions.filter((r) => r.employee_id === employee.EmployeeID).map((r) => `${r.task_name} · ${r.Status} · ${r.session_date}`)} /><EmployeeAccess employee={employee} /></>} />
  </>;
}

export function LocationsView({ data }: ViewProps) {
  const recordedEmployee = data.employees.find((e) => e.Role === "SECURITY");
  const query = useDashboardEmployeeAccessQuery({ employee_id: recordedEmployee?.EmployeeID ?? 0, limit: 1000 }, { skip: !recordedEmployee });
  return <><div className="grid gap-4 sm:grid-cols-3"><Metric title="Locations" value={data.locations.length} detail="Organization sites" /><Metric title="Active sites" value={data.locations.filter((r) => r.IsActive).length} detail="Available work locations" /><Metric title="NFC tags" value={data.tags.length} detail={`${data.tags.filter((t) => t.IsActive).length} active tags`} /></div>
    <DatasetTabs items={[
      { label: "Locations", content: <RecordTable title="Work locations" data={data.locations} rowKey={(r) => r.LocationID} status={active} columns={[field<OrganizationLocation>("LocationName", "Location"), field<OrganizationLocation>("LocationCode", "Code"), field<OrganizationLocation>("Address", "Address"), activeColumn<OrganizationLocation>()]} details={(location) => <RelatedList title="Linked NFC tags" items={data.tags.filter((t) => t.LocationID === location.LocationID).map((t) => `${t.TagID} · ${t.TagUID} · ${t.IsActive ? "Active" : "Inactive"}`)} />} /> },
      { label: "NFC tags", content: <RecordTable title="NFC tags" data={data.tags} rowKey={(r) => r.TagID} status={active} columns={[field<NfcTag>("TagID", "Tag"), field<NfcTag>("TagUID", "UID"), field<NfcTag>("LocationName", "Location"), activeColumn<NfcTag>()]} /> },
      { label: "Recorded access", content: <WorkspaceState loading={query.isLoading} error={query.error} retry={() => { void query.refetch(); }}><p className="mb-4 text-sm text-muted-foreground">Available access records{recordedEmployee ? ` for ${fullName(recordedEmployee)}` : ""}.</p><RecordTable title="Location access" data={query.data?.data?.employee_access ?? []} rowKey={(r) => `${r.EmployeeCode}-${r.LocationCode}`} status={active} columns={[field<EmployeeLocationAccess>("employeename", "Employee"), field<EmployeeLocationAccess>("LocationName", "Location"), field<EmployeeLocationAccess>("AccessType", "Access"), activeColumn<EmployeeLocationAccess>()]} /></WorkspaceState> },
    ]} />
  </>;
}

export function AttendanceView({ data, end }: ViewProps) {
  const metrics = attendanceMetrics(data.employees, data.attendance, end);
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Employees present" value={`${metrics.present}/${metrics.active}`} detail={`On ${end} · Active employees`} /><Metric title="Early / on time" value={metrics.early} detail={`On ${end}`} /><Metric title="Late arrivals" value={metrics.late} detail={`On ${end}`} /><Metric title="Average check-in" value={metrics.average ?? "—"} detail={`On ${end} · Lagos local time`} /></div>
    <div className="grid gap-5 xl:grid-cols-[1fr_2fr]"><Panel title="Attendance breakdown" description={`On ${end} · Active employees only`}><AttendanceChart metrics={metrics} /></Panel><Panel title="Absent employees" description={`No recorded check-in on ${end}`}><RelatedList title={`${metrics.absent.length} employees`} items={metrics.absent.map(fullName)} /></Panel></div>
    <RecordTable title="Attendance records" data={data.attendance} rowKey={(r) => r.LogID} status={(r) => r.PunctualityStatus ?? "CHECK_OUT"} columns={[
      field<AttendanceExportRecord>("employee_name", "Employee"), field<AttendanceExportRecord>("attendance_date", "Date"), field<AttendanceExportRecord>("attendance_time", "Time"), field<AttendanceExportRecord>("LocationName", "Location"), field<AttendanceExportRecord>("AttendanceType", "Event", (r) => <Status value={r.AttendanceType} />), field<AttendanceExportRecord>("PunctualityStatus", "Punctuality", (r) => r.PunctualityStatus ? <Status value={r.PunctualityStatus} /> : <span className="text-muted-foreground">Not applicable</span>),
    ]} />
  </>;
}

export function PatrolsView({ data, start, end }: ViewProps) {
  const metrics = sessionMetrics(data.patrolSessions);
  const reports = data.reports.filter((r) => inDateRange(r.CreatedAt, start, end));
  const completed = data.patrolSessions.filter((r) => r.Status === "COMPLETED" && r.DurationMinutes !== null);
  const avgDuration = completed.length ? completed.reduce((sum, r) => sum + Number(r.DurationMinutes), 0) / completed.length : null;
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Active patrols" value={data.patrols.filter((r) => r.IsActive).length} detail={`${data.checkpoints.length} checkpoints`} /><Metric title="Completed sessions" value={`${metrics.completed}/${metrics.total}`} detail={`${rate(metrics.rate)} completion in this period`} /><Metric title="Missed sessions" value={data.patrolSessions.filter((r) => r.Status === "MISSED").length} detail="Within the selected dates" /><Metric title="Average duration" value={avgDuration === null ? "—" : `${avgDuration.toFixed(0)} min`} detail="Completed sessions only" /></div>
    <div className="grid gap-5 xl:grid-cols-2"><Panel title="Patrol outcomes" description={`${start} — ${end}`}><SessionChart label="Patrol session outcomes" sessions={data.patrolSessions} /></Panel><Panel title="Scheduled rounds" description={`Fixture-day status · ${MOCK_DATE}`}><RelatedList title={`${data.instances.length} rounds`} items={data.instances.map((r) => `${r.InstanceName} · ${r.StartTime.slice(0, 5)}–${r.EndTime.slice(0, 5)} · ${r.CurrentStatus ?? "Status not available"}`)} /></Panel></div>
    <DatasetTabs items={[
      { label: "Sessions", content: <RecordTable title="Patrol sessions" data={data.patrolSessions} rowKey={(r) => r.SessionID} status={(r) => r.Status} columns={[field<PatrolSession>("InstanceName", "Round"), field<PatrolSession>("PatrolDate", "Date"), { key: "employee", label: "Employee", value: (r) => [r.FirstName, r.LastName].filter(Boolean).join(" ") || null }, statusColumn<PatrolSession>(), field<PatrolSession>("CompletionPercentage", "Completion", (r) => `${r.CompletionPercentage}%`), field<PatrolSession>("DurationMinutes", "Duration (min)")]} /> },
      { label: "Patrols", content: <RecordTable title="Patrol definitions" data={data.patrols} rowKey={(r) => r.PatrolID} status={active} columns={[field<PatrolSummary>("PatrolName", "Patrol"), field<PatrolSummary>("PatrolCode", "Code"), field<PatrolSummary>("CheckpointCount", "Checkpoints"), field<PatrolSummary>("InstanceCount", "Rounds"), activeColumn<PatrolSummary>()]} details={(r) => <RelatedList title="Scheduled instances" items={data.instances.filter((i) => i.PatrolID === r.PatrolID).map((i) => `${i.InstanceName} · ${i.StartTime}–${i.EndTime}`)} />} /> },
      { label: "Checkpoints", content: <RecordTable title="Checkpoints" data={data.checkpoints} rowKey={(r) => r.CheckpointID} status={active} columns={[field<Checkpoint>("CheckpointName", "Checkpoint"), field<Checkpoint>("LocationName", "Location"), field<Checkpoint>("TagUID", "NFC UID"), activeColumn<Checkpoint>()]} /> },
      { label: "Instances", content: <RecordTable title="Scheduled instances" data={data.instances} rowKey={(r) => r.InstanceID} status={active} columns={[field<DashGetPatrolInstancesInstance>("InstanceName", "Round"), field<DashGetPatrolInstancesInstance>("StartTime", "Start"), field<DashGetPatrolInstancesInstance>("EndTime", "End"), field<DashGetPatrolInstancesInstance>("CurrentStatus", `Status (${MOCK_DATE})`, (r) => r.CurrentStatus ? <Status value={r.CurrentStatus} /> : "Not available")]} /> },
      { label: "Reports", content: <RecordTable title="Incident reports" data={reports} rowKey={(r) => r.ReportID} status={(r) => r.IncidentType} columns={[field<PatrolReport>("IncidentType", "Type"), field<PatrolReport>("ReportText", "Report"), field<PatrolReport>("LocationName", "Location"), field<PatrolReport>("CreatedAt", "Reported", (r) => time(r.CreatedAt))]} /> },
    ]} />
  </>;
}

export function TasksView({ data, start, end }: ViewProps) {
  const metrics = sessionMetrics(data.taskSessions);
  const days = [...new Set(data.taskSessions.map((r) => r.session_date))].sort().map((day) => {
    const m = sessionMetrics(data.taskSessions.filter((r) => r.session_date === day));
    return { day, sessions: m.total, completed: m.completed, completion: rate(m.rate) };
  });
  const peak = [...new Set(data.taskSessions.map((r) => r.created_at.slice(11, 13)))].sort().map((hour) => ({ hour: `${hour}:00`, sessions: data.taskSessions.filter((r) => r.created_at.slice(11, 13) === hour).length }));
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Task definitions" value={data.tasks.length} detail="Scheduled organization tasks" /><Metric title="Completed sessions" value={`${metrics.completed}/${metrics.total}`} detail={`${rate(metrics.rate)} completion in this period`} /><Metric title="Awaiting evidence" value={data.taskSessions.filter((r) => r.Status === "AWAITING_TASK_EVIDENCE").length} detail="Task evidence required" /><Metric title="Awaiting verification" value={data.taskSessions.filter((r) => r.Status === "AWAITING_FACIAL_VERIFICATION").length} detail="Facial verification required" /></div>
    <div className="grid gap-5 xl:grid-cols-2"><Panel title="Task session outcomes" description={`${start} — ${end}`}><SessionChart label="Task session outcomes" sessions={data.taskSessions} /></Panel><Panel title="Session duration" description={`Available duration statistics · ${data.durations?.date_range.start ?? "—"} — ${data.durations?.date_range.end ?? "—"}`}><div className="grid grid-cols-2 gap-6"><div><p className="text-xs text-muted-foreground">Average duration</p><p className="mt-2 text-3xl font-semibold">{data.durations?.overall_stats.overall_avg_duration ?? "—"}<span className="ml-1 text-sm font-normal">min</span></p></div><div><p className="text-xs text-muted-foreground">Completed sessions</p><p className="mt-2 text-3xl font-semibold">{data.durations?.overall_stats.total_completed_sessions ?? "—"}</p></div></div><p className="mt-6 text-xs text-muted-foreground">Min: {data.durations?.overall_stats.overall_min_duration ?? "—"} min · Max: {data.durations?.overall_stats.overall_max_duration ?? "—"} min</p></Panel></div>
    <DatasetTabs items={[
      { label: "Sessions", content: <RecordTable title="Task sessions" data={data.taskSessions} rowKey={(r) => r.session_id} status={(r) => r.Status} columns={[field<TaskSession>("task_name", "Task"), { key: "employee", label: "Employee", value: (r) => `${r.first_name} ${r.last_name}` }, field<TaskSession>("session_date", "Date"), statusColumn<TaskSession>(), { key: "progress", label: "Subtasks", value: (r) => `${r.completed_subtask_count}/${r.total_subtask_count}` }]} details={(r) => <RelatedList title="Available evidence" items={data.evidence.filter((e) => e.session_id === r.session_id).map((e) => `Reference ${e.log_id} · ${time(e.created_at)} · Media preview unavailable`)} />} /> },
      { label: "Tasks", content: <RecordTable title="Task definitions" data={data.tasks} rowKey={(r) => r.task_code} status={(r) => r.frequency} columns={[field<TaskSummary>("Name", "Task"), field<TaskSummary>("task_code", "Code"), field<TaskSummary>("frequency", "Frequency"), field<TaskSummary>("start_time", "Start"), field<TaskSummary>("end_time", "End"), field<TaskSummary>("subtask_count", "Subtasks")]} details={(r) => <RelatedList title="Subtasks" items={data.taskDetail?.task_code === r.task_code ? data.taskDetail.subtasks.map((s) => s.Name) : []} />} /> },
      { label: "Subtasks", content: <RecordTable title="Subtasks" data={data.taskDetail?.subtasks ?? []} rowKey={(r) => r.subtask_id} columns={[field<Subtask>("Name", "Subtask"), field<Subtask>("task_id", "Task ID"), field<Subtask>("created_at", "Created", (r) => time(r.created_at))]} /> },
      { label: "Analytics", content: <div className="space-y-5"><RecordTable title="Daily task analytics" data={days} rowKey={(r) => r.day} columns={[field("day", "Date"), field("sessions", "Sessions"), field("completed", "Completed"), field("completion", "Completion rate")]} /><RecordTable title="Activity by hour" data={peak} rowKey={(r) => r.hour} columns={[field("hour", "Hour (Lagos)"), field("sessions", "Session count")]} /></div> },
      { label: "Evidence", content: <RecordTable title="Evidence metadata" data={data.evidence} rowKey={(r) => r.log_id} columns={[field<TaskEvidence>("task_name", "Task"), field<TaskEvidence>("session_id", "Session"), field<TaskEvidence>("employee_code", "Employee"), field<TaskEvidence>("created_at", "Submitted", (r) => time(r.created_at))]} details={() => <p className="text-sm text-muted-foreground">Media preview unavailable for this evidence reference.</p>} /> },
    ]} />
  </>;
}

export function VisitorsView({ data }: ViewProps) {
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Visits in period" value={data.visitors.length} detail="Visits checked in within the selected dates" /><Metric title="Currently inside" value={data.visitors.filter((r) => r.Status === "CHECKED_IN").length} detail="Among visits in this period" /><Metric title="Checked out" value={data.visitors.filter((r) => r.Status === "CHECKED_OUT").length} detail="Among visits in this period" /><Metric title="Flagged visits" value={data.visitors.filter((r) => r.IsFlagged).length} detail="Recorded visits requiring review" /></div>
    <RecordTable title="Visitor logs" data={data.visitors} rowKey={(r) => r.VisitID} status={(r) => r.Status} columns={[field<VisitorSummary>("FullName", "Visitor"), field<VisitorSummary>("PurposeOfVisit", "Purpose"), field<VisitorSummary>("HostName", "Host"), field<VisitorSummary>("LocationName", "Location"), field<VisitorSummary>("CheckedInAt", "Check-in", (r) => time(r.CheckedInAt)), statusColumn<VisitorSummary>(), field<VisitorSummary>("IsFlagged", "Review", (r) => r.IsFlagged ? <Status value="FLAGGED" /> : "—")]} />
  </>;
}

export function OrganizationView({ data }: ViewProps) {
  const org = data.organization;
  return <><div className="grid gap-4 sm:grid-cols-3"><Metric title="Organization code" value={org?.OrganizationCode ?? "—"} detail="Workspace identifier" /><Metric title="Timezone" value={org?.Timezone ?? "—"} detail="Local operating timezone" /><Metric title="Active subscriptions" value={data.subscriptions.filter((s) => s.IsActive).length} detail="Enabled workspace modules" /></div>
    <Panel title="Organization profile" description={org?.OrganizationName}><dl className="grid gap-6 sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Organization name</dt><dd className="mt-2 font-medium">{org?.OrganizationName ?? "Not available"}</dd></div><div><dt className="text-xs text-muted-foreground">Status</dt><dd className="mt-2">{org ? <Status value={active(org)} /> : "Not available"}</dd></div><div><dt className="text-xs text-muted-foreground">Sign-in time</dt><dd className="mt-2 font-medium">{time(org?.SignInTime)}</dd></div><div><dt className="text-xs text-muted-foreground">Sign-out time</dt><dd className="mt-2 font-medium">{time(org?.SignOutTime)}</dd></div><div><dt className="text-xs text-muted-foreground">Organization logo</dt><dd className="mt-2 text-sm">{org?.LogoS3Path ?? "No logo available"}</dd></div></dl></Panel>
    <RecordTable title="Module subscriptions" data={data.subscriptions} rowKey={(r) => r.SubscriptionID} status={active} columns={[field<OrganizationSubscription>("ModuleName", "Module"), field<OrganizationSubscription>("Description", "Description"), field<OrganizationSubscription>("StartsAt", "Starts", (r) => time(r.StartsAt)), field<OrganizationSubscription>("ExpiresAt", "Expires", (r) => r.ExpiresAt ? time(r.ExpiresAt) : "Not specified"), activeColumn<OrganizationSubscription>()]} />
  </>;
}
