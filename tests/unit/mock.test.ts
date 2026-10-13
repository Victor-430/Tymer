import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { createMockData, DEMO_EMAIL, DEMO_PASSWORD, MOCK_DATE } from "@/mock";
import { authApi } from "@/service/api/auth.api";
import { baseApi } from "@/service/api/base.api";
import { baseQuery } from "@/service/httpclient/base-query";
import { getApiError } from "@/service/httpclient/errors";
import { makeStore } from "@/store";
import { logout, setCredentials } from "@/slice/auth.slice";

describe("related mock fixtures", () => {
  it("provides matched request/response examples and academic requests only", () => {
    const mocks = createMockData();
    for (const [domain, fixtures] of Object.entries(mocks)) {
      if (domain === "academic") continue;
      expect(Object.keys(fixtures.requests).sort()).toEqual(Object.keys((fixtures as { responses: object }).responses).sort());
    }
    expect(mocks.academic).not.toHaveProperty("responses");
    expect(mocks.employees.responses.viewEmployees.data.employees).toHaveLength(6);
    expect(mocks.locations.responses.viewLocations.data.locations).toHaveLength(3);
    expect(mocks.locations.responses.generateQrCode.responseCode).toBe("01");
  });

  it("returns fresh records, arrays, and upload blobs on each call", () => {
    const first = createMockData();
    const next = createMockData();
    first.employees.responses.viewEmployees.data.employees[0].FirstName = "Changed";
    first.auth.responses.adminLogin.data.employee.active_modules.push("CHANGED");
    first.locations.responses.viewLocations.data.locations.pop();
    expect(next.employees.responses.viewEmployees.data.employees[0].FirstName).toBe("Demo");
    expect(next.auth.responses.adminLogin.data.employee.active_modules).not.toContain("CHANGED");
    expect(next.locations.responses.viewLocations.data.locations).toHaveLength(3);
    expect(first.employees.requests.createEmployee.passport).toBeInstanceOf(Blob);
    expect(first.employees.requests.createEmployee.passport).not.toBe(next.employees.requests.createEmployee.passport);
    expect(next.employees.empty.viewEmployees.data).toMatchObject({ total_records: 0, employees: [] });
  });

  it("links authentication, organization, employees, access, and NFC locations", () => {
    const mocks = createMockData();
    const org = mocks.organization.responses.getMyOrganizationProfile.data;
    const admin = mocks.auth.responses.adminLogin.data.employee;
    const employees = mocks.employees.responses.viewEmployees.data.employees;
    const locations = mocks.locations.responses.viewLocations.data.locations;
    expect(admin.organization_id).toBe(org.OrganizationID);
    expect(admin.organization_name).toBe(org.OrganizationName);
    expect(admin.organization_code).toBe(org.OrganizationCode);
    expect(employees.find((e) => e.EmployeeID === admin.employee_id)?.Email).toBe(admin.email);
    for (const employee of employees) expect(employee.OrganizationID).toBe(org.OrganizationID);
    for (const access of mocks.locations.responses.viewEmployeeAccess.data.employee_access) {
      expect(employees.some((e) => e.EmployeeCode === access.EmployeeCode && e.Email === access.Email)).toBe(true);
      expect(locations.some((loc) => loc.LocationCode === access.LocationCode && loc.LocationName === access.LocationName)).toBe(true);
    }
    for (const tag of mocks.locations.responses.viewNfcTags.data.nfc_tags) {
      expect(tag.OrganizationID).toBe(org.OrganizationID);
      expect(locations.some((loc) => loc.LocationID === tag.LocationID && loc.LocationName === tag.LocationName)).toBe(true);
    }
    expect(mocks.organization.responses.getMyOrganizationSubscriptions.data.map((s) => s.ModuleName)).toEqual(admin.active_modules);
  });

  it("keeps attendance outcomes, pagination, and employee summaries consistent", () => {
    const mocks = createMockData();
    const records = mocks.attendance.responses.getAdminAttendanceHistory.data;
    const employees = mocks.employees.responses.viewEmployees.data.employees;
    const locations = mocks.locations.responses.viewLocations.data.locations;
    expect(records.total_records).toBe(records.attendance_history.length);
    expect(records.total_count).toBe(records.total_records);
    for (const row of records.attendance_history) {
      expect(employees.some((e) => e.EmployeeID === row.EmployeeID && e.FirstName === row.FirstName)).toBe(true);
      expect(locations.some((loc) => loc.LocationCode === row.LocationCode)).toBe(true);
    }
    const exportData = mocks.attendance.responses.getTodayAttendance.data;
    expect(exportData.pagination.total_records).toBe(exportData.attendance_records.length);
    const checkIns = exportData.attendance_records.filter((r) => r.AttendanceType === "CHECK_IN");
    expect(mocks.attendance.responses.orgEarlyStaffByDate.data.count).toBe(checkIns.filter((r) => r.PunctualityStatus === "EARLY").length);
    expect(mocks.attendance.responses.orgLateStaffByDate.data.count).toBe(checkIns.filter((r) => r.PunctualityStatus === "LATE").length);
    expect(mocks.attendance.responses.orgAbsentStaff.data.count + checkIns.length).toBe(employees.filter((e) => e.IsActive).length);
    const myLogs = mocks.attendance.responses.getAttendanceLogs.data.attendance_logs;
    const summary = mocks.attendance.responses.getAttendanceSummary.data.summary;
    expect(summary.TotalCheckIns).toBe(myLogs.filter((r) => r.AttendanceType === "CHECK_IN").length);
    expect(summary.TotalCheckOuts).toBe(myLogs.filter((r) => r.AttendanceType === "CHECK_OUT").length);
    expect(myLogs.every((r) => r.EmployeeID === mocks.auth.responses.adminLogin.data.employee.employee_id)).toBe(true);
  });

  it("links patrol checkpoints, sessions, instances, reports, and statistics", () => {
    const mocks = createMockData();
    const fixtures = mocks.patrols.responses;
    const checkpoints = fixtures.getCheckpoints.data.checkpoints;
    const tags = mocks.locations.responses.viewNfcTags.data.nfc_tags;
    for (const cp of checkpoints) expect(tags.some((tag) => tag.TagUID === cp.TagUID && tag.LocationID === cp.LocationID)).toBe(true);
    const sessions = fixtures.getAllSessions.data.sessions;
    const instances = fixtures.getPatrolInstances.data.instances;
    expect(fixtures.getAllSessions.data.total).toBe(sessions.length);
    for (const instance of instances) {
      const session = sessions.find((s) => s.SessionID === instance.TodaySessionID)!;
      expect(session.InstanceID).toBe(instance.InstanceID);
      expect(session.Status).toBe(instance.CurrentStatus);
      expect(session.CompletedCheckpoints).toBe(instance.TodayCompletedCheckpoints);
    }
    for (const session of sessions) {
      expect(Number(session.CompletionPercentage)).toBe(session.CompletedCheckpoints / session.TotalCheckpoints * 100);
      expect(mocks.employees.responses.viewEmployees.data.employees.some((e) => e.EmployeeID === session.EmployeeID)).toBe(true);
    }
    const today = sessions.filter((s) => s.PatrolDate === MOCK_DATE);
    expect(fixtures.getDashboardOverview.data.today.TodaySessions).toBe(today.length);
    expect(fixtures.getPatrolStatistics.data.CompletedSessions).toBe(sessions.filter((s) => s.Status === "COMPLETED").length);
    expect(Number(fixtures.getPatrolStatistics.data.AvgCompletionRate)).toBeCloseTo(sessions.reduce((sum, s) => sum + Number(s.CompletionPercentage), 0) / sessions.length);
    expect(fixtures.getSessionAdmin.data.summary.completed).toBe(fixtures.getSessionAdmin.data.checkpoints.filter((cp) => cp.status === "COMPLETED").length);
    const report = fixtures.getPatrolReports.data.reports[0];
    expect(sessions.find((s) => s.SessionID === report.SessionID)?.EmployeeID).toBe(report.EmployeeID);
  });

  it("derives task summaries, trends, exports, and evidence from sessions", () => {
    const mocks = createMockData();
    const fixtures = mocks.tasks.responses;
    const sessions = fixtures.adminAllSessions.data.sessions;
    const task = fixtures.adminTaskDetails.data;
    for (const session of sessions) {
      expect(session.task_code).toBe(task.task_code);
      expect(session.total_subtask_count).toBe(task.subtasks.length);
      expect(mocks.employees.responses.viewEmployees.data.employees.some((e) => e.EmployeeID === session.employee_id)).toBe(true);
    }
    const completed = sessions.filter((s) => s.Status === "COMPLETED").length;
    expect(fixtures.adminDashboardOverview.data.total_sessions).toBe(sessions.length);
    expect(fixtures.adminDashboardOverview.data.completed_sessions).toBe(completed);
    expect(fixtures.adminDashboardOverview.data.completion_rate).toBeCloseTo(completed / sessions.length * 100);
    expect(fixtures.adminTaskAnalytics.data.daily_trends.reduce((sum, day) => sum + day.total_sessions, 0)).toBe(sessions.length);
    const todayRecords = fixtures.adminTodayHistory.data.records;
    expect(todayRecords.every((r) => r.created_at.startsWith(MOCK_DATE))).toBe(true);
    expect(fixtures.adminTodayHistory.data.total).toBe(sessions.filter((s) => s.session_date === MOCK_DATE).length);
    for (const evidence of fixtures.adminGetEvidences.data.evidences) {
      expect(sessions.find((s) => s.session_id === evidence.session_id)?.employee_id).toBe(evidence.employee_id);
    }
  });

  it("matches visitor summaries and academic request relationships", () => {
    const mocks = createMockData();
    const visitors = mocks.visitors.responses.getVisitorLogs.data.visitors;
    const summary = mocks.visitors.responses.getTodaySummary.data;
    expect(summary.total_today).toBe(visitors.length);
    expect(summary.currently_inside).toBe(visitors.filter((v) => v.Status === "CHECKED_IN").length);
    expect(summary.checked_out_today + summary.currently_inside).toBe(summary.total_today);
    expect(visitors.find((v) => v.VisitID === mocks.visitors.requests.getSingleVisit.path.visit_id)?.Status).toBe(mocks.visitors.responses.getSingleVisit.data.Status);
    const academic = mocks.academic.requests;
    expect(academic.createSchedule.location_id).toBe(mocks.locations.responses.viewLocations.data.locations[0].LocationID);
    expect(academic.createSchedule.course_id).toBe(academic.getCourseDetail.path.course_id);
    expect(academic.createStudent.department_id).toBe(academic.updateDepartment.path.department_id);
  });
});

describe("mock app transport", () => {
  const fetchSpy = vi.fn(() => { throw new Error("Mock mode must not call fetch"); });
  const stores: ReturnType<typeof makeStore>[] = [];
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_DATA_SOURCE", undefined);
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://configured-backend.example.test");
    vi.stubGlobal("fetch", fetchSpy);
  });
  afterEach(() => {
    expect(fetchSpy).not.toHaveBeenCalled();
    stores.splice(0).forEach((store) => store.dispatch(baseApi.util.resetApiState()));
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  function store() {
    const instance = makeStore();
    stores.push(instance);
    return instance;
  }
  function context(endpoint: string, signal = new AbortController().signal): BaseQueryApi {
    const instance = store();
    return { endpoint, signal, abort: () => {}, dispatch: instance.dispatch, getState: instance.getState, extra: undefined, type: "mutation" };
  }

  it.each([undefined, "mock", "", "API", "unknown"])("defaults to mock login for data source %s", async (source) => {
    vi.stubEnv("NEXT_PUBLIC_DATA_SOURCE", source);
    const instance = store();
    const response = await instance.dispatch(authApi.endpoints.login.initiate({ email: ` ${DEMO_EMAIL} `, password: DEMO_PASSWORD })).unwrap();
    expect(response.data?.employee.email).toBe(DEMO_EMAIL);
    expect(instance.getState().auth.token).toBeNull();
    instance.dispatch(setCredentials(response.data!));
    expect(instance.getState().auth.token).toBe("mock-tymer-access-token");
    instance.dispatch(logout());
    instance.dispatch(baseApi.util.resetApiState());
    expect(instance.getState().auth).toEqual({ token: null, employee: null });
    expect(instance.getState().api.mutations).toEqual({});
    expect(store().getState().auth.token).toBeNull();
  });

  it.each([
    { email: DEMO_EMAIL, password: "incorrect" },
    { email: "other@example.com", password: DEMO_PASSWORD },
    { email: DEMO_EMAIL, password: ` ${DEMO_PASSWORD} ` },
  ])("rejects incorrect credentials and preserves passwords exactly", async (credentials) => {
    const result = await baseQuery({ url: "/admin/login", method: "POST", body: credentials }, context("login"), {});
    expect(result.error?.status).toBe(401);
    expect(getApiError(result.error).message).toBe("The email or password is incorrect.");
  });

  it("returns a validation error for missing credentials", async () => {
    const result = await baseQuery({ url: "/admin/login", method: "POST", body: {} }, context("login"), {});
    expect(result.error?.status).toBe(422);
    expect(getApiError(result.error).message).toBe("Email and password are required.");
  });

  it("rejects unsupported operations by endpoint name without HTTP fallback", async () => {
    const result = await baseQuery({ url: "/admin/login", method: "POST", body: { email: DEMO_EMAIL, password: DEMO_PASSWORD } }, context("futureFeature"), {});
    expect(result.error?.status).toBe("CUSTOM_ERROR");
    expect(getApiError(result.error).message).toContain('No mock handler for endpoint "futureFeature"');
  });

  it("returns an error for an already aborted request", async () => {
    const controller = new AbortController();
    controller.abort();
    const result = await baseQuery({ url: "/admin/login", body: { email: DEMO_EMAIL, password: DEMO_PASSWORD } }, context("login", controller.signal), {});
    expect(result.error?.status).toBe("CUSTOM_ERROR");
    expect(result.data).toBeUndefined();
  });
});
