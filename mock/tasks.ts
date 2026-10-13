import type * as Requests from "@/models/api-request";
import type * as Responses from "@/models/api-response";
import { createSeed, MOCK_DATE, MOCK_UTC_OFFSET, success, type MockSeed } from "./shared";

export function createTaskMocks(seed: MockSeed = createSeed()) {
  const taskId = 401;
  const taskCode = "TASK-001";
  const dateRange = { start: "2026-10-07", end: MOCK_DATE };
  const subtasks: Responses.Subtask[] = ["Inspect reception", "Check emergency exits"].map((name, index) => ({
    subtask_id: 410 + index, Name: name, task_id: taskId, created_at: `${MOCK_DATE}T09:00:00+01:00`,
  }));
  const task: Responses.TaskSummary = {
    task_code: taskCode, Name: "Daily safety inspection", Description: "Inspect the head office before closing.",
    task_level_evidence: true, subtask_level_evidence: false, organization_id: seed.organization.OrganizationID,
    frequency: "DAILY", days_of_week: null, start_time: "10:00:00", end_time: "19:00:00",
    start_date: "2026-10-01", end_date: "2026-12-31", created_at: "2026-10-01T09:00:00+01:00",
    updated_at: `${MOCK_DATE}T09:00:00+01:00`, subtask_count: subtasks.length,
  };
  const statuses: Responses.TaskSessionStatus[] = ["COMPLETED", "IN_PROGRESS", "PENDING", "NOT_COMPLETED", "AWAITING_TASK_EVIDENCE", "AWAITING_FACIAL_VERIFICATION"];
  const sessions: Responses.TaskSession[] = statuses.map((status, index) => {
    const employee = seed.employees[index % 5];
    const date = status === "NOT_COMPLETED" ? "2026-10-12" : MOCK_DATE;
    return { session_id: 4001 + index, task_code: taskCode, employee_id: employee.EmployeeID, Status: status,
      completed_subtask_count: [2, 1, 0, 0, 2, 2][index], total_subtask_count: subtasks.length,
      session_date: date, created_at: `${date}T10:00:00+01:00`, task_name: task.Name,
      employee_code: employee.EmployeeCode, first_name: employee.FirstName, last_name: employee.LastName,
      organization_id: seed.organization.OrganizationID };
  });
  const completed = sessions.filter((s) => s.Status === "COMPLETED");
  const completionRate = Math.round(completed.length / sessions.length * 10_000) / 100;
  const records: Responses.TaskHistoryExportRecord[] = sessions.map((s) => ({
    session_id: s.session_id, task_code: s.task_code, task_name: s.task_name, employee_id: s.employee_id,
    employee_code: s.employee_code, first_name: s.first_name, last_name: s.last_name, Status: s.Status,
    completed_subtask_count: s.completed_subtask_count, total_subtask_count: s.total_subtask_count,
    completion_pct: s.completed_subtask_count / s.total_subtask_count * 100, created_at: s.created_at, organization_id: s.organization_id,
  }));
  const trend = ["2026-10-12", MOCK_DATE].map((date) => ({ session_date: date,
    total_sessions: sessions.filter((s) => s.session_date === date).length,
    completed_sessions: completed.filter((s) => s.session_date === date).length }));
  const createTask = { name: task.Name, description: task.Description, task_level_evidence: true,
    subtask_level_evidence: false, frequency: "DAILY", days_of_week: null, start_time: task.start_time,
    end_time: task.end_time, start_date: task.start_date, end_date: task.end_date,
    subtasks: subtasks.map((s) => s.Name), utc_offset: MOCK_UTC_OFFSET } satisfies Requests.AdminCreateTaskRequest;
  const reportRequest = { organization_id: seed.organization.OrganizationID, utc_offset: MOCK_UTC_OFFSET };
  const analyticsRequest = { days: 7, utc_offset: MOCK_UTC_OFFSET };
  const todayRecords = records.filter((r) => r.created_at.startsWith(MOCK_DATE));
  return {
    requests: {
      adminCreateTask: createTask,
      adminBulkCreateTasks: { tasks: [{ ...createTask }] } satisfies Requests.AdminBulkCreateTasksRequest,
      adminListTasks: { organization_id: seed.organization.OrganizationID, limit: 20, offset: 0, utc_offset: MOCK_UTC_OFFSET } satisfies Requests.AdminListTasksRequest,
      adminTaskDetails: { path: { task_code: taskCode }, query: { utc_offset: MOCK_UTC_OFFSET } } satisfies Requests.AdminTaskDetailsRequest,
      adminUpdateTask: { path: { task_code: taskCode }, body: { name: task.Name, description: task.Description } } satisfies Requests.AdminUpdateTaskRequest,
      adminDeleteTask: { task_code: taskCode } satisfies Requests.AdminDeleteTaskRequest,
      adminCreateSubtask: { path: { task_code: taskCode }, body: { name: subtasks[0].Name } } satisfies Requests.AdminCreateSubtaskRequest,
      adminBulkCreateSubtasks: { path: { task_code: taskCode }, body: { subtasks: subtasks.map((s) => ({ name: s.Name })) } } satisfies Requests.AdminBulkCreateSubtasksRequest,
      adminListSubtasks: { path: { task_code: taskCode }, query: { limit: 20, offset: 0, utc_offset: MOCK_UTC_OFFSET } } satisfies Requests.AdminListSubtasksRequest,
      adminUpdateSubtask: { path: { task_code: taskCode, subtask_id: subtasks[0].subtask_id }, body: { name: subtasks[0].Name } } satisfies Requests.AdminUpdateSubtaskRequest,
      adminDeleteSubtask: { task_code: taskCode, subtask_id: subtasks[0].subtask_id } satisfies Requests.AdminDeleteSubtaskRequest,
      adminAllSessions: { start_date: "2026-10-12", end_date: MOCK_DATE, limit: 20, offset: 0, utc_offset: MOCK_UTC_OFFSET } satisfies Requests.AdminAllSessionsRequest,
      adminDashboardOverview: { ...analyticsRequest } satisfies Requests.AdminDashboardOverviewRequest,
      adminTaskAnalytics: { ...analyticsRequest } satisfies Requests.AdminTaskAnalyticsRequest,
      adminCompletionRates: { ...analyticsRequest } satisfies Requests.AdminCompletionRatesRequest,
      adminPeakActivity: { ...analyticsRequest } satisfies Requests.AdminPeakActivityRequest,
      adminSessionDuration: { ...analyticsRequest } satisfies Requests.AdminSessionDurationRequest,
      adminGetEvidences: { organization_id: seed.organization.OrganizationID, task_code: taskCode, limit: 20, offset: 0, utc_offset: MOCK_UTC_OFFSET } satisfies Requests.AdminGetEvidencesRequest,
      adminTaskHistoryExport: { ...reportRequest, start_date: "2026-10-12", end_date: MOCK_DATE, limit: 20, offset: 0, sort_by: "created_at", sort_order: "ASC" } satisfies Requests.AdminTaskHistoryExportRequest,
      adminCsvHeaders: undefined satisfies Requests.AdminCsvHeadersRequest,
      adminTodayHistory: { ...reportRequest } satisfies Requests.AdminTodayHistoryRequest,
      adminThisWeekHistory: { ...reportRequest } satisfies Requests.AdminThisWeekHistoryRequest,
      adminThisMonthHistory: { ...reportRequest } satisfies Requests.AdminThisMonthHistoryRequest,
    },
    responses: {
      adminCreateTask: success({ task_id: taskId, task_code: taskCode }) satisfies Responses.AdminCreateTaskResponse,
      adminBulkCreateTasks: success({ success_count: 1, failure_count: 0, failures: [] }) satisfies Responses.AdminBulkCreateTasksResponse,
      adminListTasks: success({ total: 1, tasks: [task] }) satisfies Responses.AdminListTasksResponse,
      adminTaskDetails: success({ task_id: taskId, task_code: task.task_code, Name: task.Name, Description: task.Description,
        task_level_evidence: task.task_level_evidence, subtask_level_evidence: task.subtask_level_evidence,
        organization_id: task.organization_id, frequency: task.frequency, days_of_week: task.days_of_week,
        start_time: task.start_time, end_time: task.end_time, start_date: task.start_date, end_date: task.end_date,
        created_at: task.created_at, updated_at: task.updated_at, subtasks }) satisfies Responses.AdminTaskDetailsResponse,
      adminUpdateTask: success(null) satisfies Responses.AdminUpdateTaskResponse,
      adminDeleteTask: success(null) satisfies Responses.AdminDeleteTaskResponse,
      adminCreateSubtask: success({ subtask_id: subtasks[0].subtask_id }) satisfies Responses.AdminCreateSubtaskResponse,
      adminBulkCreateSubtasks: success({ success_count: subtasks.length, failure_count: 0, failures: [] }) satisfies Responses.AdminBulkCreateSubtasksResponse<Responses.BulkNamedFailure>,
      adminListSubtasks: success({ total: subtasks.length, subtasks }) satisfies Responses.AdminListSubtasksResponse,
      adminUpdateSubtask: success(null) satisfies Responses.AdminUpdateSubtaskResponse,
      adminDeleteSubtask: success(null) satisfies Responses.AdminDeleteSubtaskResponse,
      adminAllSessions: success({ total: sessions.length, sessions }) satisfies Responses.AdminAllSessionsResponse,
      adminDashboardOverview: success({ total_tasks: 1, active_tasks: 1, total_sessions: sessions.length,
        completed_sessions: completed.length, in_progress_sessions: sessions.filter((s) => s.Status === "IN_PROGRESS").length,
        failed_sessions: sessions.filter((s) => s.Status === "NOT_COMPLETED").length, completion_rate: completionRate, date_range: { ...dateRange } }) satisfies Responses.AdminDashboardOverviewResponse,
      adminTaskAnalytics: success({ daily_trends: trend,
        tasks_today: [{ Id: taskId, TaskName: task.Name, StartTime: task.start_time, EndTime: task.end_time,
          CompletedSessions: completed.length, CompletedBy: completed.map((s) => `${s.first_name} ${s.last_name}`).join(", "), Status: "IN_PROGRESS" }], date_range: { ...dateRange } }) satisfies Responses.AdminTaskAnalyticsResponse,
      adminCompletionRates: success({ completion_rates: trend.map((day) => ({ SessionDate: day.session_date,
        total_sessions: day.total_sessions, completed_sessions: day.completed_sessions,
        completion_rate: Math.round(day.completed_sessions / day.total_sessions * 10_000) / 100 })), date_range: { ...dateRange } }) satisfies Responses.AdminCompletionRatesResponse,
      adminPeakActivity: success({ peak_hours: [{ hour: 10, session_count: sessions.length }],
        peak_days: [{ day_name: "Monday", day_number: 1, session_count: trend[0].total_sessions },
          { day_name: "Tuesday", day_number: 2, session_count: trend[1].total_sessions }], date_range: { ...dateRange } }) satisfies Responses.AdminPeakActivityResponse,
      adminSessionDuration: success({ task_durations: [{ task_name: task.Name, total_sessions: completed.length, avg_duration_minutes: "30.00", min_duration_minutes: "30.00", max_duration_minutes: "30.00" }],
        overall_stats: { total_completed_sessions: completed.length, overall_avg_duration: "30.00", overall_min_duration: "30.00", overall_max_duration: "30.00" }, date_range: { ...dateRange } }) satisfies Responses.AdminSessionDurationResponse,
      adminGetEvidences: success({ total: 1, evidences: [{ log_id: 4401, session_id: completed[0].session_id,
        employee_id: completed[0].employee_id, created_at: `${MOCK_DATE}T10:30:00+01:00`, evidence_data: "mock:evidence:safety-inspection",
        task_code: taskCode, task_name: task.Name, employee_code: completed[0].employee_code,
        first_name: completed[0].first_name, last_name: completed[0].last_name, organization_id: seed.organization.OrganizationID }] }) satisfies Responses.AdminGetEvidencesResponse,
      adminTaskHistoryExport: success({ total: records.length, records }) satisfies Responses.AdminTaskHistoryExportResponse,
      adminCsvHeaders: success({ headers: ["session_id", "task_code", "task_name", "employee_code", "Status", "completion_pct", "created_at"] }) satisfies Responses.AdminCsvHeadersResponse,
      adminTodayHistory: success({ total: todayRecords.length, records: todayRecords }) satisfies Responses.AdminTodayHistoryResponse,
      adminThisWeekHistory: success({ total: records.length, records }) satisfies Responses.AdminThisWeekHistoryResponse,
      adminThisMonthHistory: success({ total: records.length, records }) satisfies Responses.AdminThisMonthHistoryResponse,
    },
    empty: { adminListTasks: success({ total: 0, tasks: [] }) satisfies Responses.AdminListTasksResponse,
      adminAllSessions: success({ total: 0, sessions: [] }) satisfies Responses.AdminAllSessionsResponse },
  };
}
