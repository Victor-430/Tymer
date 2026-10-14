import { MOCK_DATE } from "@/mock";
import type {
  AdminListTasksRequest,
  AdminTaskDetailsRequest,
  AdminAllSessionsRequest,
  AdminGetEvidencesRequest,
  AdminSessionDurationRequest,
} from "@/models/api-request";
import type {
  AdminListTasksResponse,
  AdminTaskDetailsResponse,
  AdminAllSessionsResponse,
  AdminGetEvidencesResponse,
  AdminSessionDurationResponse,
} from "@/models/api-response";
import { baseApi } from "./base.api";
import { fixtureQuery, belongsToOrganization, inDateRange, pageRecords } from "@/service/httpclient/dashboard-mocks";

export const tasksApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    dashboardTasks: builder.query<AdminListTasksResponse, AdminListTasksRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.tasks.responses.adminListTasks;
        const rows = response.data.tasks.filter((r) => belongsToOrganization(m, q.organization_id) && (!q.start_date || r.end_date >= q.start_date) && (!q.end_date || r.start_date <= q.end_date));
        return { ...response, data: { ...response.data, total: rows.length, tasks: pageRecords(rows, q.limit, q.offset) } };
      }),
    }),
    dashboardTaskDetail: builder.query<AdminTaskDetailsResponse, AdminTaskDetailsRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.tasks.responses.adminTaskDetails;
        return { ...response, data: q.path.task_code === response.data.task_code ? response.data : null };
      }),
    }),
    dashboardTaskSessions: builder.query<AdminAllSessionsResponse, AdminAllSessionsRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.tasks.responses.adminAllSessions;
        const rows = response.data.sessions.filter((r) => inDateRange(r.session_date, q.start_date, q.end_date) && (!q.status || r.Status === q.status));
        return { ...response, data: { ...response.data, total: rows.length, sessions: pageRecords(rows, q.limit, q.offset) } };
      }),
    }),
    dashboardTaskEvidence: builder.query<AdminGetEvidencesResponse, AdminGetEvidencesRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.tasks.responses.adminGetEvidences;
        const rows = response.data.evidences.filter((r) => belongsToOrganization(m, q.organization_id) && (!q.task_code || r.task_code === q.task_code) && (!q.employee_id || r.employee_id === q.employee_id) && inDateRange(r.created_at, q.start_date, q.end_date));
        return { ...response, data: { ...response.data, total: rows.length, evidences: pageRecords(rows, q.limit, q.offset) } };
      }),
    }),
    dashboardTaskDurations: builder.query<AdminSessionDurationResponse, AdminSessionDurationRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.tasks.responses.adminSessionDuration;
        const days = q.days ?? 7;
        if (!Number.isInteger(days) || days < 1 || days > 366) return { responseCode: "01", responseMessage: "Choose a duration window between 1 and 366 days.", data: null };
        const start = new Date(`${MOCK_DATE}T00:00:00Z`);
        start.setUTCDate(start.getUTCDate() - days + 1);
        const startDay = start.toISOString().slice(0, 10);
        const completed = m.tasks.responses.adminAllSessions.data.sessions.filter((s) => s.Status === "COMPLETED" && inDateRange(s.session_date, startDay, MOCK_DATE));
        return { ...response, data: completed.length ? { ...response.data, date_range: { start: startDay, end: MOCK_DATE } } : null };
      }),
    }),
  }),
});

export const {
  useDashboardTasksQuery,
  useDashboardTaskDetailQuery,
  useDashboardTaskSessionsQuery,
  useDashboardTaskEvidenceQuery,
  useDashboardTaskDurationsQuery,
} = tasksApi;
