import type { GetAdminAttendanceHistoryExportRequest } from "@/models/api-request";
import type { GetAdminAttendanceHistoryExportResponse } from "@/models/api-response";
import { baseApi } from "./base.api";
import { fixtureQuery, belongsToOrganization, inDateRange, pageRecords } from "@/service/httpclient/dashboard-mocks";

export const attendanceApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    dashboardAttendance: builder.query<GetAdminAttendanceHistoryExportResponse, GetAdminAttendanceHistoryExportRequest>({
      queryFn: fixtureQuery((m, q) => {
        const response = m.attendance.responses.getAdminAttendanceHistoryExport;
        const rows = response.data.attendance_records.filter((r) => belongsToOrganization(m, q.organization_id) && inDateRange(r.attendance_date, q.start_date, q.end_date)
          && (!q.employee_code || r.EmployeeCode === q.employee_code) && (!q.location_code || r.LocationCode === q.location_code)
          && (!q.punctuality_status || r.PunctualityStatus === q.punctuality_status));
        const limit = q.limit ?? 20;
        const page = q.page ?? 1;
        return { ...response, data: { ...response.data, attendance_records: pageRecords(rows, limit, (page - 1) * limit),
          pagination: { current_page: page, total_pages: limit ? Math.ceil(rows.length / limit) : 0, total_records: rows.length, records_per_page: limit, has_next: page * limit < rows.length, has_prev: page > 1 },
          filters: { ...response.data.filters, start_date: q.start_date ?? null, end_date: q.end_date ?? null } } };
      }),
    }),
  }),
});

export const {
  useDashboardAttendanceQuery,
} = attendanceApi;
