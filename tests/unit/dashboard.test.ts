import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { createMockData, MOCK_DATE } from "@/mock";
import { makeStore } from "@/store";
import { baseApi } from "@/service/api/base.api";
import { employeesApi } from "@/service/api/employees.api";
import { locationsApi } from "@/service/api/locations.api";
import { attendanceApi } from "@/service/api/attendance.api";
import { patrolsApi } from "@/service/api/patrols.api";
import { tasksApi } from "@/service/api/tasks.api";
import { visitorsApi } from "@/service/api/visitors.api";
import { organizationApi } from "@/service/api/organization.api";
import { fixtureQuery } from "@/service/httpclient/dashboard-mocks";
import { todayMetrics, attendanceMetrics, sessionMetrics } from "@/components/dashboard/metrics";
import { dateRangeSchema } from "@/schema/dashboard";
import { selectTablePage } from "@/components/shared/table-data";

const stores: ReturnType<typeof makeStore>[] = [];
const fetchSpy = vi.fn(() => { throw new Error("Mock dashboard must never call fetch"); });
function store() { const result = makeStore(); stores.push(result); return result; }
beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_DATA_SOURCE", "mock"); vi.stubGlobal("fetch", fetchSpy); });
afterEach(() => { stores.splice(0).forEach((s) => s.dispatch(baseApi.util.resetApiState())); expect(fetchSpy).not.toHaveBeenCalled(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function workspaceReads(s: ReturnType<typeof makeStore>, m: ReturnType<typeof createMockData>) {
  return [
    s.dispatch(employeesApi.endpoints.dashboardEmployees.initiate(m.employees.requests.viewEmployees)).unwrap(),
    s.dispatch(locationsApi.endpoints.dashboardLocations.initiate(m.locations.requests.viewLocations)).unwrap(),
    s.dispatch(locationsApi.endpoints.dashboardNfcTags.initiate(m.locations.requests.viewNfcTags)).unwrap(),
    s.dispatch(locationsApi.endpoints.dashboardEmployeeAccess.initiate(m.locations.requests.viewEmployeeAccess)).unwrap(),
    s.dispatch(attendanceApi.endpoints.dashboardAttendance.initiate(m.attendance.requests.getAdminAttendanceHistoryExport)).unwrap(),
    s.dispatch(patrolsApi.endpoints.dashboardPatrols.initiate(m.patrols.requests.getPatrols)).unwrap(),
    s.dispatch(patrolsApi.endpoints.dashboardCheckpoints.initiate(m.patrols.requests.getCheckpoints)).unwrap(),
    s.dispatch(patrolsApi.endpoints.dashboardInstances.initiate({ path: { patrol_id: 301 } })).unwrap(),
    s.dispatch(patrolsApi.endpoints.dashboardPatrolSessions.initiate(m.patrols.requests.getAllSessions)).unwrap(),
    s.dispatch(patrolsApi.endpoints.dashboardPatrolReports.initiate(m.patrols.requests.getPatrolReports)).unwrap(),
    s.dispatch(tasksApi.endpoints.dashboardTasks.initiate(m.tasks.requests.adminListTasks)).unwrap(),
    s.dispatch(tasksApi.endpoints.dashboardTaskDetail.initiate(m.tasks.requests.adminTaskDetails)).unwrap(),
    s.dispatch(tasksApi.endpoints.dashboardTaskSessions.initiate(m.tasks.requests.adminAllSessions)).unwrap(),
    s.dispatch(tasksApi.endpoints.dashboardTaskEvidence.initiate(m.tasks.requests.adminGetEvidences)).unwrap(),
    s.dispatch(tasksApi.endpoints.dashboardTaskDurations.initiate(m.tasks.requests.adminSessionDuration)).unwrap(),
    s.dispatch(visitorsApi.endpoints.dashboardVisitors.initiate(m.visitors.requests.getVisitorLogs)).unwrap(),
    s.dispatch(organizationApi.endpoints.dashboardOrganization.initiate(m.organization.requests.getMyOrganizationProfile)).unwrap(),
    s.dispatch(organizationApi.endpoints.dashboardSubscriptions.initiate(m.organization.requests.getMyOrganizationSubscriptions)).unwrap(),
  ];
}

describe("mock workspace reads", () => {
  it("loads every dashboard dataset with the shared API envelopes", async () => {
    const s = store(), m = createMockData();
    const results = await Promise.all(workspaceReads(s, m));
    for (const api of [employeesApi, locationsApi, attendanceApi, patrolsApi, tasksApi, visitorsApi, organizationApi]) expect(api).toBe(baseApi);
    expect(results).toHaveLength(18);
    for (const result of results) { expect(result.responseCode).toBe("00"); expect(result.data).toBeTruthy(); }
    expect(Object.keys(s.getState().api.queries)).toHaveLength(18);
    s.dispatch(baseApi.util.resetApiState());
    expect(s.getState().api.queries).toEqual({});
  });

  it("does not substitute other records for unknown organizations, locations, employees, tasks or patrols", async () => {
    const s = store();
    expect((await s.dispatch(employeesApi.endpoints.dashboardEmployees.initiate({ organization_id: 999 })).unwrap()).data?.employees).toEqual([]);
    expect((await s.dispatch(visitorsApi.endpoints.dashboardVisitors.initiate({ location_id: 999 })).unwrap()).data?.visitors).toEqual([]);
    expect((await s.dispatch(locationsApi.endpoints.dashboardEmployeeAccess.initiate({ employee_id: 3 })).unwrap()).data?.employee_access).toEqual([]);
    expect((await s.dispatch(tasksApi.endpoints.dashboardTaskDetail.initiate({ path: { task_code: "UNKNOWN" } })).unwrap()).data).toBeNull();
    expect((await s.dispatch(patrolsApi.endpoints.dashboardInstances.initiate({ path: { patrol_id: 999 } })).unwrap()).data?.instances).toEqual([]);
  });

  it("filters actual dates and statuses and returns accurate pagination totals", async () => {
    const s = store();
    const yesterday = await s.dispatch(tasksApi.endpoints.dashboardTaskSessions.initiate({ start_date: "2026-10-12", end_date: "2026-10-12" })).unwrap();
    expect(yesterday.data?.sessions.map((r) => r.Status)).toEqual(["NOT_COMPLETED"]);
    const missing = await s.dispatch(attendanceApi.endpoints.dashboardAttendance.initiate({ organization_id: 12, start_date: "2026-10-14", end_date: "2026-10-14" })).unwrap();
    expect(missing.data?.attendance_records).toEqual([]);
    expect(missing.data?.pagination.total_records).toBe(0);
    const page = await s.dispatch(employeesApi.endpoints.dashboardEmployees.initiate({ limit: 2, offset: 4 })).unwrap();
    expect(page.data?.total_records).toBe(6);
    expect(page.data?.employees.map((r) => r.EmployeeID)).toEqual([5, 6]);
    const flagged = await s.dispatch(visitorsApi.endpoints.dashboardVisitors.initiate({ is_flagged: true, status: "CHECKED_OUT" })).unwrap();
    expect(flagged.data?.visitors.map((r) => r.FullName)).toEqual(["Robin Blake"]);
  });

  it("rejects explicit API mode without contacting HTTP transport", async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_SOURCE", "api");
    const results = await Promise.allSettled(workspaceReads(store(), createMockData()));
    expect(results).toHaveLength(18);
    for (const result of results) {
      expect(result.status).toBe("rejected");
      if (result.status === "rejected") {
        const error: unknown = result.reason;
        expect(error).toMatchObject({ status: "CUSTOM_ERROR", data: { responseMessage: "This workspace operation is available in mock mode only." } });
      }
    }
  });

  it("keeps duration statistics aligned with the requested fixture-day window", async () => {
    const s = store(), endpoint = tasksApi.endpoints.dashboardTaskDurations;
    const result = await s.dispatch(endpoint.initiate({ days: 1 })).unwrap();
    expect(result.data?.date_range).toEqual({ start: MOCK_DATE, end: MOCK_DATE });
    expect(result.data?.overall_stats.total_completed_sessions).toBe(1);
    await expect(s.dispatch(endpoint.initiate({ days: 0 })).unwrap()).rejects.toMatchObject({ data: { responseCode: "01", responseMessage: "Choose a duration window between 1 and 366 days." } });
  });

  it("uses fresh fixtures, honours cancellation, and sanitizes exceptions and business errors", async () => {
    const s = store(), controller = new AbortController();
    const context: BaseQueryApi = { signal: controller.signal, abort: () => controller.abort(), dispatch: s.dispatch, getState: s.getState, extra: undefined, endpoint: "dashboardEmployees", type: "query" };
    const read = fixtureQuery((m) => { const original = m.employees.responses.viewEmployees.data.employees[0].FirstName; m.employees.responses.viewEmployees.data.employees[0].FirstName = "Changed"; return original; });
    expect(await read(undefined, context)).toEqual({ data: "Demo" });
    expect(await read(undefined, context)).toEqual({ data: "Demo" });
    const failing = fixtureQuery(() => { throw new Error("private internal details"); });
    expect(await failing(undefined, context)).toMatchObject({ error: { data: { responseMessage: "Unable to load workspace records. Please try again." } } });
    const business = fixtureQuery((m) => m.locations.responses.generateQrCode);
    expect(await business(undefined, context)).toMatchObject({ error: { data: { responseCode: "01" } } });
    controller.abort();
    expect(await read(undefined, context)).toMatchObject({ error: { error: "Mock request aborted." } });
  });
});

describe("operational metrics", () => {
  it("agrees with the fixture records for today and preserves all task states", () => {
    const m = createMockData();
    const metrics = todayMetrics(m.employees.responses.viewEmployees.data.employees, m.attendance.responses.getTodayAttendance.data.attendance_records, m.patrols.responses.getAllSessions.data.sessions, m.tasks.responses.adminAllSessions.data.sessions, m.visitors.responses.getVisitorLogs.data.visitors);
    expect(metrics.attendance).toMatchObject({ present: 4, active: 5, early: 2, late: 2, rate: 80, average: "09:00" });
    expect(metrics.attendance.absent.map((e) => e.FirstName)).toEqual(["Sam"]);
    expect(metrics.patrols).toMatchObject({ completed: 1, total: 2, rate: 50 });
    expect(metrics.tasks).toMatchObject({ completed: 1, total: 5, rate: 20 });
    expect(metrics.visitors).toEqual({ total: 2, inside: 1 });
    expect(new Set(m.tasks.responses.adminAllSessions.data.sessions.map((s) => s.Status)).size).toBe(6);
  });

  it("counts distinct employees, uses their first check-in, and preserves unknown and empty values", () => {
    const m = createMockData(), employees = m.employees.responses.viewEmployees.data.employees;
    const records = m.attendance.responses.getTodayAttendance.data.attendance_records;
    const duplicate = { ...records[0], attendance_time: "10:00:00", PunctualityStatus: "LATE" };
    expect(attendanceMetrics(employees, [...records, duplicate])).toMatchObject({ present: 4, early: 2, average: "09:00" });
    expect(attendanceMetrics([], [])).toMatchObject({ rate: null, average: null, present: 0 });
    expect(attendanceMetrics(employees, [{ ...records[0], PunctualityStatus: null }], MOCK_DATE)).toMatchObject({ present: 1, early: 0, late: 0, undisclosed: 1 });
    expect(sessionMetrics([]).rate).toBeNull();
  });
});

it("sorts before pagination, searches case-insensitively, filters statuses, and clamps pages without mutating records", () => {
  const records = Array.from({ length: 23 }, (_, i) => ({ name: `Person ${i}`, count: i, status: i % 2 ? "ACTIVE" : "INACTIVE" }));
  const columns = [{ key: "name", value: (r: typeof records[number]) => r.name }, { key: "count", value: (r: typeof records[number]) => r.count }];
  const options = { search: "", filter: "", status: (r: typeof records[number]) => r.status, sort: { key: "count", descending: true }, page: 1 };
  const result = selectTablePage(records, columns, options);
  expect(result.rows.map((r) => r.count)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
  expect(result.pageCount).toBe(3);
  expect(records[0].count).toBe(0);
  const filtered = selectTablePage(records, columns, { ...options, filter: "ACTIVE", search: "PERSON 1", page: 9 });
  expect(filtered.rows.map((r) => r.count)).toEqual([19, 17, 15, 13, 11, 1]);
  expect(filtered.currentPage).toBe(0);
  expect(selectTablePage(records, columns, { ...options, search: "unknown" }).rows).toEqual([]);
});

it("validates date ranges before changing queries", async () => {
  await expect(dateRangeSchema.validate({ start_date: "2026-10-13", end_date: "2026-10-12" })).rejects.toThrow("End date must be on or after the start date.");
  await expect(dateRangeSchema.validate({ start_date: "", end_date: MOCK_DATE })).rejects.toThrow();
  await expect(dateRangeSchema.validate({ start_date: MOCK_DATE, end_date: MOCK_DATE })).resolves.toBeTruthy();
});
