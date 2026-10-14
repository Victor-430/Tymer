import type {
  ViewLocationsRequest,
  ViewNfcTagsRequest,
  ViewEmployeeAccessRequest,
} from "@/models/api-request";
import type {
  ViewLocationsResponse,
  ViewNfcTagsResponse,
  ViewEmployeeAccessResponse,
} from "@/models/api-response";
import { baseApi } from "./base.api";
import { fixtureQuery, belongsToOrganization, pageRecords } from "@/service/httpclient/dashboard-mocks";

export const locationsApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    dashboardLocations: builder.query<ViewLocationsResponse, ViewLocationsRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.locations.responses.viewLocations;
        const rows = belongsToOrganization(m, q.organization_id) ? response.data.locations : [];
        return { ...response, data: { ...response.data, total_records: rows.length, locations: pageRecords(rows, q.limit, q.offset), limit: q.limit ?? 20, offset: q.offset ?? 0 } };
      }),
    }),
    dashboardNfcTags: builder.query<ViewNfcTagsResponse, ViewNfcTagsRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.locations.responses.viewNfcTags;
        const rows = belongsToOrganization(m, q.organization_id) ? response.data.nfc_tags : [];
        return { ...response, data: { ...response.data, total_records: rows.length, nfc_tags: pageRecords(rows, q.limit, q.offset), limit: q.limit ?? 20, offset: q.offset ?? 0 } };
      }),
    }),
    dashboardEmployeeAccess: builder.query<ViewEmployeeAccessResponse, ViewEmployeeAccessRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.locations.responses.viewEmployeeAccess;
        const employee = m.employees.responses.viewEmployees.data.employees.find((e) => e.EmployeeID === q.employee_id);
        const rows = response.data.employee_access.filter((r) => r.EmployeeCode === employee?.EmployeeCode);
        return { ...response, data: { ...response.data, total_records: rows.length, employee_access: pageRecords(rows, q.limit, q.offset), limit: q.limit ?? 20, offset: q.offset ?? 0 } };
      }),
    }),
  }),
});

export const {
  useDashboardLocationsQuery,
  useDashboardNfcTagsQuery,
  useDashboardEmployeeAccessQuery,
} = locationsApi;
