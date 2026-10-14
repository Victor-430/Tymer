"use client";

import {
  useDashboardEmployeesQuery,
} from "@/service/api/employees.api";
import {
  useDashboardLocationsQuery,
  useDashboardNfcTagsQuery,
} from "@/service/api/locations.api";
import {
  useDashboardAttendanceQuery,
} from "@/service/api/attendance.api";
import {
  useDashboardPatrolsQuery,
  useDashboardCheckpointsQuery,
  useDashboardInstancesQuery,
  useDashboardPatrolSessionsQuery,
  useDashboardPatrolReportsQuery,
} from "@/service/api/patrols.api";
import {
  useDashboardTasksQuery,
  useDashboardTaskDetailQuery,
  useDashboardTaskSessionsQuery,
  useDashboardTaskEvidenceQuery,
  useDashboardTaskDurationsQuery,
} from "@/service/api/tasks.api";
import {
  useDashboardVisitorsQuery,
} from "@/service/api/visitors.api";
import {
  useDashboardOrganizationQuery,
  useDashboardSubscriptionsQuery,
} from "@/service/api/organization.api";
import { useAppSelector } from "@/store/hooks";
import { MOCK_DATE, MOCK_UTC_OFFSET } from "@/mock";

export const HISTORY_START = "2026-10-07";

export function useWorkspaceData(start = HISTORY_START, end = MOCK_DATE) {
  const employee = useAppSelector((state) => state.auth.employee);
  const token = useAppSelector((state) => state.auth.token);
  const options = { skip: !token || !employee };
  const org = { organization_id: employee?.organization_id ?? 0, utc_offset: MOCK_UTC_OFFSET, limit: 1000 };
  const range = { start_date: start, end_date: end, utc_offset: MOCK_UTC_OFFSET, limit: 1000 };
  const employees = useDashboardEmployeesQuery(org, options);
  const locations = useDashboardLocationsQuery(org, options);
  const tags = useDashboardNfcTagsQuery(org, options);
  const attendance = useDashboardAttendanceQuery({ ...org, ...range }, options);
  const patrols = useDashboardPatrolsQuery(org, options);
  const checkpoints = useDashboardCheckpointsQuery(org, options);
  const instances = useDashboardInstancesQuery({ path: { patrol_id: patrols.data?.data?.patrols[0]?.PatrolID ?? 0 } }, { skip: options.skip || !patrols.data?.data?.patrols.length });
  const patrolSessions = useDashboardPatrolSessionsQuery({ ...org, ...range }, options);
  const reports = useDashboardPatrolReportsQuery(org, options);
  const tasks = useDashboardTasksQuery(org, options);
  const taskDetail = useDashboardTaskDetailQuery({ path: { task_code: tasks.data?.data?.tasks[0]?.task_code ?? "" } }, { skip: options.skip || !tasks.data?.data?.tasks.length });
  const taskSessions = useDashboardTaskSessionsQuery(range, options);
  const evidence = useDashboardTaskEvidenceQuery({ ...org, ...range }, options);
  const durations = useDashboardTaskDurationsQuery({ days: 7, utc_offset: MOCK_UTC_OFFSET }, options);
  const visitors = useDashboardVisitorsQuery(range, options);
  const organization = useDashboardOrganizationQuery({ utc_offset: MOCK_UTC_OFFSET }, options);
  const subscriptions = useDashboardSubscriptionsQuery({ utc_offset: MOCK_UTC_OFFSET }, options);
  const queries = [employees, locations, tags, attendance, patrols, checkpoints, instances, patrolSessions, reports, tasks, taskDetail, taskSessions, evidence, durations, visitors, organization, subscriptions];
  return {
    employee,
    employees: employees.currentData?.data?.employees ?? [],
    locations: locations.currentData?.data?.locations ?? [],
    tags: tags.currentData?.data?.nfc_tags ?? [],
    attendance: attendance.currentData?.data?.attendance_records ?? [],
    patrols: patrols.currentData?.data?.patrols ?? [],
    checkpoints: checkpoints.currentData?.data?.checkpoints ?? [],
    instances: instances.currentData?.data?.instances ?? [],
    patrolSessions: patrolSessions.currentData?.data?.sessions ?? [],
    reports: reports.currentData?.data?.reports ?? [],
    tasks: tasks.currentData?.data?.tasks ?? [],
    taskDetail: taskDetail.currentData?.data,
    taskSessions: taskSessions.currentData?.data?.sessions ?? [],
    evidence: evidence.currentData?.data?.evidences ?? [],
    durations: durations.currentData?.data,
    visitors: visitors.currentData?.data?.visitors ?? [],
    organization: organization.currentData?.data,
    subscriptions: subscriptions.currentData?.data ?? [],
    isLoading: queries.some((q) => q.isLoading || q.isFetching),
    error: queries.find((q) => q.isError)?.error,
    retry: () => { for (const q of queries) if (!q.isUninitialized) void q.refetch(); },
  };
}

export type WorkspaceData = ReturnType<typeof useWorkspaceData>;
