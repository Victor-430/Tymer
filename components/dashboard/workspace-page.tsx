"use client";

import { useId, useState } from "react";
import { useFormik } from "formik";
import { MOCK_DATE } from "@/mock";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { dateRangeSchema } from "@/schema/dashboard";
import { HISTORY_START, useWorkspaceData } from "./use-workspace-data";
import { WorkspaceState } from "./workspace-state";
import { EmployeesView, LocationsView, AttendanceView, PatrolsView, TasksView, VisitorsView, OrganizationView } from "./domain-views";

const pages = {
  employees: { title: "Employees", description: "Your team, their roles, and activity across the workspace.", component: EmployeesView },
  locations: { title: "Locations", description: "Work sites, linked NFC tags, and available access records.", component: LocationsView },
  attendance: { title: "Attendance", description: "Check-ins, punctuality, and daily attendance records.", component: AttendanceView },
  patrols: { title: "Patrols", description: "Rounds, checkpoints, session progress, and incident reports.", component: PatrolsView },
  tasks: { title: "Tasks", description: "Scheduled work, session outcomes, and completion evidence.", component: TasksView },
  visitors: { title: "Visitors", description: "Visits, hosts, current presence, and flagged records.", component: VisitorsView },
  organization: { title: "Organization", description: "Workspace profile, working hours, and active subscriptions.", component: OrganizationView },
};
export type WorkspacePageName = keyof typeof pages;

export function WorkspacePage({ page }: { page: WorkspacePageName }) {
  const rangeId = useId();
  const [range, setRange] = useState({ start_date: HISTORY_START, end_date: MOCK_DATE });
  const data = useWorkspaceData(range.start_date, range.end_date);
  const { title, description, component: View } = pages[page];
  const history = ["attendance", "patrols", "tasks", "visitors"].includes(page);
  const formik = useFormik({ initialValues: range, validationSchema: dateRangeSchema, onSubmit: async (values) => { setRange(values); } });
  return <>
    <div><p className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">Workspace</p><h1 className="text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{description}</p></div>
    {history && <form noValidate aria-label="Date range" onSubmit={formik.handleSubmit} className="flex flex-wrap items-start gap-4 rounded-2xl border bg-card p-4"><FormField name="start_date" id={`${rangeId}-start`} label="From" type="date" formik={formik} className="h-10!" /><FormField name="end_date" id={`${rangeId}-end`} label="To" type="date" formik={formik} className="h-10!" /><Button type="submit" variant="outline" disabled={formik.isSubmitting} className="mt-7 rounded-lg">Apply dates</Button><p className="self-end pb-2 text-xs text-muted-foreground">Applied: {range.start_date} — {range.end_date} · Lagos</p></form>}
    <WorkspaceState loading={data.isLoading} error={data.error} retry={data.retry}><View data={data} end={range.end_date} start={range.start_date} /></WorkspaceState>
  </>;
}
