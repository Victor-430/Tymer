import type {
  GetPatrolsRequest,
  GetCheckpointsRequest,
  DashGetPatrolInstancesRequest,
  GetAllSessionsRequest,
  GetPatrolReportsRequest,
} from "@/models/api-request";
import type {
  GetPatrolsResponse,
  GetCheckpointsResponse,
  DashGetPatrolInstancesResponse,
  GetAllSessionsResponse,
  GetPatrolReportsResponse,
} from "@/models/api-response";
import { baseApi } from "./base.api";
import { fixtureQuery, belongsToOrganization, inDateRange, pageRecords } from "@/service/httpclient/dashboard-mocks";

export const patrolsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    dashboardPatrols: builder.query<GetPatrolsResponse, GetPatrolsRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.patrols.responses.getPatrols;
        const rows = belongsToOrganization(m, q.organization_id) ? response.data.patrols : [];
        return { ...response, data: { ...response.data, total: rows.length, patrols: rows } };
      }),
    }),
    dashboardCheckpoints: builder.query<GetCheckpointsResponse, GetCheckpointsRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.patrols.responses.getCheckpoints;
        const rows = belongsToOrganization(m, q.organization_id) ? response.data.checkpoints : [];
        return { ...response, data: { ...response.data, total: rows.length, checkpoints: rows } };
      }),
    }),
    dashboardInstances: builder.query<DashGetPatrolInstancesResponse, DashGetPatrolInstancesRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.patrols.responses.dashGetPatrolInstances;
        const rows = q.path.patrol_id === m.patrols.responses.getPatrols.data.patrols[0]?.PatrolID ? response.data.instances : [];
        return { ...response, data: { ...response.data, total: rows.length, instances: rows } };
      }),
    }),
    dashboardPatrolSessions: builder.query<GetAllSessionsResponse, GetAllSessionsRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.patrols.responses.getAllSessions;
        const rows = response.data.sessions.filter((r) => belongsToOrganization(m, q.organization_id) && inDateRange(r.PatrolDate, q.start_date, q.end_date)
          && (!q.status || r.Status === q.status));
        return { ...response, data: { ...response.data, total: rows.length, total_count: rows.length, sessions: pageRecords(rows, q.limit, q.offset), limit: q.limit ?? 20, offset: q.offset ?? 0 } };
      }),
    }),
    dashboardPatrolReports: builder.query<GetPatrolReportsResponse, GetPatrolReportsRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.patrols.responses.getPatrolReports;
        const location = m.locations.responses.viewLocations.data.locations.find((l) => l.LocationID === q.location_id);
        const rows = response.data.reports.filter((r) => belongsToOrganization(m, q.organization_id) && (!q.incident_type || r.IncidentType === q.incident_type) && (q.location_id == null || r.LocationName === location?.LocationName));
        return { ...response, data: { ...response.data, total_reports: rows.length, total_count: rows.length, reports: pageRecords(rows, q.limit, q.offset), limit: q.limit ?? 20, offset: q.offset ?? 0 } };
      }),
    }),
  }),
});

export const {
  useDashboardPatrolsQuery,
  useDashboardCheckpointsQuery,
  useDashboardInstancesQuery,
  useDashboardPatrolSessionsQuery,
  useDashboardPatrolReportsQuery,
} = patrolsApi;
