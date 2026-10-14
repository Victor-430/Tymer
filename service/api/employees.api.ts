import type { ViewEmployeesRequest } from "@/models/api-request";
import type { ViewEmployeesResponse } from "@/models/api-response";
import { baseApi } from "./base.api";
import { fixtureQuery, belongsToOrganization, pageRecords } from "@/service/httpclient/dashboard-mocks";

export const employeesApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    dashboardEmployees: builder.query<ViewEmployeesResponse, ViewEmployeesRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.employees.responses.viewEmployees;
        const rows = belongsToOrganization(m, q.organization_id) ? response.data.employees : [];
        return { ...response, data: { ...response.data, total_records: rows.length, employees: pageRecords(rows, q.limit, q.offset), limit: q.limit ?? 20, offset: q.offset ?? 0 } };
      }),
    }),
  }),
});

export const {
  useDashboardEmployeesQuery,
} = employeesApi;
