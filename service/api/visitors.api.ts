import type { GetVisitorLogsRequest } from "@/models/api-request";
import type { GetVisitorLogsResponse } from "@/models/api-response";
import { baseApi } from "./base.api";
import { fixtureQuery, inDateRange, pageRecords } from "@/service/httpclient/dashboard-mocks";

export const visitorsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    dashboardVisitors: builder.query<GetVisitorLogsResponse, GetVisitorLogsRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.visitors.responses.getVisitorLogs;
        const location = m.locations.responses.viewLocations.data.locations.find((l) => l.LocationID === q.location_id);
        const rows = response.data.visitors.filter((r) => (q.location_id == null || r.LocationCode === location?.LocationCode) && inDateRange(r.CheckedInAt, q.start_date, q.end_date) && (!q.status || r.Status === q.status) && (q.is_flagged == null || r.IsFlagged === q.is_flagged));
        return { ...response, data: { ...response.data, total: rows.length, visitors: pageRecords(rows, q.limit, q.skip), limit: q.limit ?? 20, offset: q.skip ?? 0 } };
      }),
    }),
  }),
});

export const {
  useDashboardVisitorsQuery,
} = visitorsApi;
