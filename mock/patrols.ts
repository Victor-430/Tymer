import type * as Requests from "@/models/api-request";
import type * as Responses from "@/models/api-response";
import { createSeed, MOCK_DATE, MOCK_TIMESTAMP, MOCK_UTC_OFFSET, success, type MockSeed } from "./shared";

export function createPatrolMocks(seed: MockSeed = createSeed()) {
  const orgId = seed.organization.OrganizationID;
  const checkpoints: Responses.Checkpoint[] = seed.locations.slice(0, 2).map((loc, index) => ({
    CheckpointID: 201 + index, CheckpointName: `${loc.LocationName} checkpoint`, Description: "Inspect the entrance and scan the tag.",
    TagUID: `MOCK-NFC-${index + 1}`, IsActive: true, CreatedAt: "2026-10-01T08:00:00+01:00",
    LocationID: loc.LocationID, LocationName: loc.LocationName, LocationCode: loc.LocationCode, Address: loc.Address, PatrolCount: 1,
  }));
  const patrol: Responses.PatrolSummary = { PatrolID: 301, PatrolName: "Office perimeter", PatrolCode: "PATROL-001",
    Description: "Head office and main gate inspection", CheckpointCount: checkpoints.length, IsActive: true,
    CreatedAt: "2026-10-01T08:00:00+01:00", InstanceCount: 2 };
  const detailCheckpoints: Responses.PatrolDetailCheckpoint[] = checkpoints.map((cp, index) => ({
    CheckpointID: cp.CheckpointID, CheckpointName: cp.CheckpointName, TagUID: cp.TagUID, LocationID: cp.LocationID,
    LocationName: cp.LocationName, CheckpointOrder: index + 1, IsOptional: false,
  }));
  const instances: Responses.PatrolInstance[] = ["Morning round", "Evening round"].map((name, index) => ({
    InstanceID: 310 + index, InstanceName: name, StartTime: index === 0 ? "08:00:00" : "17:30:00",
    EndTime: index === 0 ? "08:30:00" : "18:30:00", Description: null, IsActive: true,
    CreatedAt: patrol.CreatedAt, PatrolID: patrol.PatrolID, PatrolName: patrol.PatrolName, CheckpointCount: checkpoints.length,
    TodaySessionID: 3001 + index, TodayStatus: index === 0 ? "COMPLETED" : "IN_PROGRESS",
    TodayCompletedCheckpoints: index === 0 ? 2 : 1,
    TodayStartedAt: `${MOCK_DATE}T${index === 0 ? "08:00" : "17:35"}:00+01:00`,
    CurrentStatus: index === 0 ? "COMPLETED" : "IN_PROGRESS",
  }));
  const statuses: Responses.PatrolSessionStatus[] = ["COMPLETED", "IN_PROGRESS", "MISSED"];
  const sessions: Responses.PatrolSession[] = statuses.map((status, index) => {
    const instance = instances[index === 1 ? 1 : 0];
    const employee = seed.employees[index + 1];
    return { SessionID: 3001 + index, PatrolDate: index === 2 ? "2026-10-12" : MOCK_DATE,
      StartedAt: index === 2 ? null : instance.TodayStartedAt, CompletedAt: index === 0 ? `${MOCK_DATE}T08:30:00+01:00` : null,
      Status: status, TotalCheckpoints: checkpoints.length, CompletedCheckpoints: [2, 1, 0][index], CompletionPercentage: ["100.00", "50.00", "0.00"][index],
      InstanceID: instance.InstanceID, InstanceName: instance.InstanceName, ScheduledStartTime: instance.StartTime, ScheduledEndTime: instance.EndTime,
      PatrolID: patrol.PatrolID, PatrolName: patrol.PatrolName, PatrolCode: patrol.PatrolCode,
      EmployeeID: employee.EmployeeID, EmployeeCode: employee.EmployeeCode, FirstName: employee.FirstName, LastName: employee.LastName,
      DurationMinutes: index === 0 ? "30.00" : null, TimelinessStatus: index === 2 ? null : index === 0 ? "ON_TIME" : "LATE" };
  });
  const history: Responses.PatrolHistoryRecord[] = sessions.map((s) => ({
    session_id: s.SessionID, patrol_date: s.PatrolDate, started_at: s.StartedAt, completed_at: s.CompletedAt, status: s.Status,
    progress: { completed: s.CompletedCheckpoints, total: s.TotalCheckpoints, percentage: Number(s.CompletionPercentage) },
    instance: { instance_id: s.InstanceID, instance_name: s.InstanceName, scheduled_start: s.ScheduledStartTime!, scheduled_end: s.ScheduledEndTime! },
    patrol: { patrol_id: patrol.PatrolID, patrol_name: patrol.PatrolName, patrol_code: patrol.PatrolCode },
    employee: { employee_id: s.EmployeeID!, employee_code: s.EmployeeCode!, name: `${s.FirstName} ${s.LastName}` },
    duration_minutes: s.DurationMinutes ?? "0.00", timeliness: s.TimelinessStatus,
  }));
  const exports: Responses.PatrolHistoryExportRecord[] = sessions.map((s) => ({
    session_id: s.SessionID, patrol_date: s.PatrolDate, started_at: s.StartedAt, completed_at: s.CompletedAt, status: s.Status,
    total_checkpoints: s.TotalCheckpoints, completed_checkpoints: s.CompletedCheckpoints, completion_percentage: Number(s.CompletionPercentage),
    duration_minutes: s.DurationMinutes, scheduled_start: s.ScheduledStartTime, scheduled_end: s.ScheduledEndTime,
    patrol_id: patrol.PatrolID, patrol_name: patrol.PatrolName, patrol_code: patrol.PatrolCode,
    instance_id: s.InstanceID, instance_name: s.InstanceName, employee_id: s.EmployeeID, employee_code: s.EmployeeCode,
    employee_name: `${s.FirstName} ${s.LastName}`, employee_email: seed.employees.find((e) => e.EmployeeID === s.EmployeeID)!.Email, organization_id: orgId,
  }));
  const today = sessions.filter((s) => s.PatrolDate === MOCK_DATE);
  const completed = sessions.filter((s) => s.Status === "COMPLETED");
  const averageCompletion = sessions.reduce((total, s) => total + Number(s.CompletionPercentage), 0) / sessions.length;
  const report: Responses.PatrolReport = { ReportID: 3201, IncidentType: "MAINTENANCE", ReportText: "Main gate light needs replacement.",
    ImageS3URL: null, VideoS3URL: null, CreatedAt: `${MOCK_DATE}T08:20:00+01:00`, SessionID: sessions[0].SessionID,
    PatrolDate: MOCK_DATE, EmployeeID: seed.employees[1].EmployeeID, EmployeeCode: seed.employees[1].EmployeeCode,
    FirstName: seed.employees[1].FirstName, LastName: seed.employees[1].LastName, PatrolName: patrol.PatrolName,
    CheckpointName: checkpoints[1].CheckpointName, LocationName: checkpoints[1].LocationName };
  const orgRequest = { organization_id: orgId, utc_offset: MOCK_UTC_OFFSET };
  const historyRequest = { ...orgRequest, start_date: "2026-10-12", end_date: MOCK_DATE, limit: 20, offset: 0 };
  function exportData(records: Responses.PatrolHistoryExportRecord[], start: string): Responses.PatrolHistoryExportData {
    return { summary: { total_records: records.length, returned_records: records.length,
      filters_applied: { start_date: start, end_date: MOCK_DATE } }, history: records };
  }
  const first = instances[0];
  return {
    requests: {
      bulkCreatePatrols: [{ patrol_name: patrol.PatrolName, description: patrol.Description, checkpoint_names: checkpoints.map((cp) => cp.CheckpointName), organization_id: orgId }] satisfies Requests.BulkCreatePatrolsRequest,
      bulkCreateCheckpoints: checkpoints.map((cp, i) => ({ checkpoint_name: cp.CheckpointName, location_code: cp.LocationCode, tag_id: `TAG-${i + 1}`, organization_id: orgId })) satisfies Requests.BulkCreateCheckpointsRequest,
      createCheckpoint: { location_id: checkpoints[0].LocationID, tag_uid: checkpoints[0].TagUID, checkpoint_name: checkpoints[0].CheckpointName, organization_id: orgId } satisfies Requests.CreateCheckpointRequest,
      getCheckpoints: { ...orgRequest } satisfies Requests.GetCheckpointsRequest,
      verifyNfcTag: { ...orgRequest, tag_uid: checkpoints[0].TagUID } satisfies Requests.VerifyNfcTagRequest,
      updateCheckpoint: { path: { checkpoint_id: checkpoints[0].CheckpointID }, query: { utc_offset: MOCK_UTC_OFFSET }, body: { checkpoint_name: checkpoints[0].CheckpointName } } satisfies Requests.UpdateCheckpointRequest,
      deleteCheckpoint: { checkpoint_id: checkpoints[0].CheckpointID } satisfies Requests.DeleteCheckpointRequest,
      createPatrol: { patrol_name: patrol.PatrolName, patrol_code: patrol.PatrolCode, organization_id: orgId, description: patrol.Description, checkpoint_ids: checkpoints.map((cp) => cp.CheckpointID) } satisfies Requests.CreatePatrolRequest,
      getPatrols: { ...orgRequest } satisfies Requests.GetPatrolsRequest,
      getPatrolAdmin: { patrol_id: patrol.PatrolID } satisfies Requests.GetPatrolAdminRequest,
      updatePatrol: { path: { patrol_id: patrol.PatrolID }, body: { patrol_name: patrol.PatrolName, checkpoint_ids: checkpoints.map((cp) => cp.CheckpointID) } } satisfies Requests.UpdatePatrolRequest,
      deletePatrol: { patrol_id: patrol.PatrolID } satisfies Requests.DeletePatrolRequest,
      createInstance: { patrol_id: patrol.PatrolID, instance_name: first.InstanceName, start_time: first.StartTime, end_time: first.EndTime, utc_offset: MOCK_UTC_OFFSET } satisfies Requests.CreateInstanceRequest,
      bulkCreateInstances: instances.map((i) => ({ patrol_code: patrol.PatrolCode, instance_name: i.InstanceName, start_time: i.StartTime, end_time: i.EndTime, utc_offset: MOCK_UTC_OFFSET })) satisfies Requests.BulkCreateInstancesRequest,
      getInstance: { path: { instance_id: first.InstanceID }, query: { utc_offset: MOCK_UTC_OFFSET } } satisfies Requests.GetInstanceRequest,
      updateInstance: { path: { instance_id: first.InstanceID }, body: { instance_name: first.InstanceName } } satisfies Requests.UpdateInstanceRequest,
      deleteInstance: { instance_id: first.InstanceID } satisfies Requests.DeleteInstanceRequest,
      getPatrolInstances: { path: { patrol_id: patrol.PatrolID }, query: { utc_offset: MOCK_UTC_OFFSET } } satisfies Requests.GetPatrolInstancesRequest,
      getAllSessions: { ...historyRequest } satisfies Requests.GetAllSessionsRequest,
      getSessionAdmin: { path: { session_id: sessions[0].SessionID }, query: { utc_offset: MOCK_UTC_OFFSET } } satisfies Requests.GetSessionAdminRequest,
      getDashboardOverview: { ...orgRequest } satisfies Requests.GetDashboardOverviewRequest,
      getOrganizationPatrols: { ...orgRequest } satisfies Requests.GetOrganizationPatrolsRequest,
      getPatrolDetails: { path: { patrol_id: patrol.PatrolID }, query: { utc_offset: MOCK_UTC_OFFSET } } satisfies Requests.GetPatrolDetailsRequest,
      getPatrolHistory: { ...historyRequest } satisfies Requests.GetPatrolHistoryRequest,
      getPatrolStatistics: { organization_id: orgId, days: 7 } satisfies Requests.GetPatrolStatisticsRequest,
      getPatrolReports: { ...orgRequest, limit: 20, offset: 0 } satisfies Requests.GetPatrolReportsRequest,
      getPatrolHistoryExport: { ...historyRequest, sort_by: "PatrolDate", sort_order: "ASC" } satisfies Requests.GetPatrolHistoryExportRequest,
      getCsvHeaders: undefined satisfies Requests.GetCsvHeadersRequest,
      getTodayHistory: { ...orgRequest } satisfies Requests.GetTodayHistoryRequest,
      getThisWeekHistory: { ...orgRequest } satisfies Requests.GetThisWeekHistoryRequest,
      getThisMonthHistory: { ...orgRequest } satisfies Requests.GetThisMonthHistoryRequest,
      dashGetCheckpoints: { ...orgRequest } satisfies Requests.DashGetCheckpointsRequest,
      dashGetPatrols: { ...orgRequest } satisfies Requests.DashGetPatrolsRequest,
      dashGetPatrolInstances: { path: { patrol_id: patrol.PatrolID }, query: { utc_offset: MOCK_UTC_OFFSET } } satisfies Requests.DashGetPatrolInstancesRequest,
    },
    responses: {
      bulkCreatePatrols: success({ success_count: 1, failure_count: 0, failures: [], created: [{ index: 0, patrol_id: patrol.PatrolID, patrol_code: patrol.PatrolCode }] }) satisfies Responses.BulkCreatePatrolsResponse,
      bulkCreateCheckpoints: success({ success_count: checkpoints.length, failure_count: 0, failures: [] }) satisfies Responses.BulkCreateCheckpointsResponse,
      createCheckpoint: success({ checkpoint_id: checkpoints[0].CheckpointID }) satisfies Responses.CreateCheckpointResponse,
      getCheckpoints: success({ total: checkpoints.length, checkpoints }) satisfies Responses.GetCheckpointsResponse,
      verifyNfcTag: success({ is_onboarded: true, tag_info: { TagID: "TAG-1", TagUID: checkpoints[0].TagUID, IsActive: true, CreatedAt: patrol.CreatedAt,
        LastScannedAt: `${MOCK_DATE}T17:40:00+01:00`, LocationID: checkpoints[0].LocationID, LocationName: checkpoints[0].LocationName,
        LocationCode: checkpoints[0].LocationCode, Address: checkpoints[0].Address, OrganizationID: orgId,
        OrganizationName: seed.organization.OrganizationName, OrganizationCode: seed.organization.OrganizationCode, CheckpointCount: 1 } }) satisfies Responses.VerifyNfcTagResponse,
      updateCheckpoint: success({ CheckpointID: checkpoints[0].CheckpointID, CheckpointName: checkpoints[0].CheckpointName, Description: checkpoints[0].Description,
        TagUID: checkpoints[0].TagUID, IsActive: true, CreatedAt: checkpoints[0].CreatedAt, LocationID: checkpoints[0].LocationID }) satisfies Responses.UpdateCheckpointResponse,
      deleteCheckpoint: success(null) satisfies Responses.DeleteCheckpointResponse,
      createPatrol: success({ patrol_id: patrol.PatrolID, checkpoint_count: checkpoints.length,
        checkpoints: detailCheckpoints.map((cp) => ({ CheckpointID: cp.CheckpointID, CheckpointName: cp.CheckpointName, CheckpointOrder: cp.CheckpointOrder, IsOptional: cp.IsOptional })) }) satisfies Responses.CreatePatrolResponse,
      getPatrols: success({ total: 1, patrols: [patrol] }) satisfies Responses.GetPatrolsResponse,
      getPatrolAdmin: success({ PatrolID: patrol.PatrolID, PatrolName: patrol.PatrolName, PatrolCode: patrol.PatrolCode,
        Description: patrol.Description, CheckpointCount: checkpoints.length, OrganizationID: orgId, IsActive: true, checkpoints: detailCheckpoints }) satisfies Responses.GetPatrolAdminResponse,
      updatePatrol: success({ PatrolID: patrol.PatrolID, PatrolName: patrol.PatrolName, checkpoints: detailCheckpoints.map((cp) => ({ CheckpointID: cp.CheckpointID, CheckpointOrder: cp.CheckpointOrder })) }) satisfies Responses.UpdatePatrolResponse,
      deletePatrol: success({ patrol_id: patrol.PatrolID }) satisfies Responses.DeletePatrolResponse,
      createInstance: success({ instance_id: first.InstanceID }) satisfies Responses.CreateInstanceResponse,
      bulkCreateInstances: success({ success_count: instances.length, failure_count: 0, failures: [] }) satisfies Responses.BulkCreateInstancesResponse,
      getInstance: success({ InstanceID: first.InstanceID, InstanceName: first.InstanceName, StartTime: first.StartTime, EndTime: first.EndTime,
        Description: first.Description, IsActive: first.IsActive, PatrolID: first.PatrolID, PatrolName: first.PatrolName,
        PatrolCode: patrol.PatrolCode, CheckpointCount: checkpoints.length, OrganizationID: orgId }) satisfies Responses.GetInstanceResponse,
      updateInstance: success(null) satisfies Responses.UpdateInstanceResponse,
      deleteInstance: success(null) satisfies Responses.DeleteInstanceResponse,
      getPatrolInstances: success({ total: instances.length, instances }) satisfies Responses.GetPatrolInstancesResponse,
      getAllSessions: success({ total: sessions.length, total_count: sessions.length, limit: 20, offset: 0, sessions }) satisfies Responses.GetAllSessionsResponse,
      getSessionAdmin: success({ session: { session_id: history[0].session_id, patrol_date: MOCK_DATE, started_at: history[0].started_at,
        completed_at: history[0].completed_at, status: history[0].status, progress: history[0].progress },
        instance: { instance_name: first.InstanceName, scheduled_start: first.StartTime, scheduled_end: first.EndTime },
        patrol: history[0].patrol, employee: { employee_code: seed.employees[1].EmployeeCode, name: `${seed.employees[1].FirstName} ${seed.employees[1].LastName}` },
        checkpoints: checkpoints.map((cp, i) => ({ checkpoint_id: cp.CheckpointID, checkpoint_name: cp.CheckpointName, tag_uid: cp.TagUID,
          location_name: cp.LocationName, address: cp.Address, expected_order: i + 1, is_optional: false, status: "COMPLETED",
          scanned_at: `${MOCK_DATE}T08:${i === 0 ? "10" : "20"}:00+01:00`, actual_order: i + 1 })),
        summary: { total: checkpoints.length, completed: checkpoints.length, pending: 0 } }) satisfies Responses.GetSessionAdminResponse,
      getDashboardOverview: success({ employees: { TotalEmployees: seed.employees.length, ActiveEmployees: seed.employees.filter((e) => e.IsActive).length },
        patrols: { TotalPatrols: 1, ActivePatrols: 1 }, today: { TodaySessions: today.length,
          Completed: today.filter((s) => s.Status === "COMPLETED").length, InProgress: today.filter((s) => s.Status === "IN_PROGRESS").length,
          AvgCompletion: today.reduce((total, s) => total + Number(s.CompletionPercentage), 0) / today.length },
        alerts: { overdue_instances: 0 }, timestamp: MOCK_TIMESTAMP }) satisfies Responses.GetDashboardOverviewResponse,
      getOrganizationPatrols: success({ total_patrols: 1, patrols: [{ patrol_id: patrol.PatrolID, patrol_name: patrol.PatrolName,
        patrol_code: patrol.PatrolCode, description: patrol.Description, checkpoint_count: checkpoints.length, is_active: true,
        instance_count: instances.length, instances: instances.map((i) => ({ instance_id: i.InstanceID, instance_name: i.InstanceName,
          start_time: i.StartTime, end_time: i.EndTime, current_status: i.CurrentStatus, today_session_id: i.TodaySessionID, today_completed: i.TodayCompletedCheckpoints })) }] }) satisfies Responses.GetOrganizationPatrolsResponse,
      getPatrolDetails: success({ PatrolID: patrol.PatrolID, PatrolName: patrol.PatrolName, PatrolCode: patrol.PatrolCode,
        CheckpointCount: checkpoints.length, OrganizationID: orgId, IsActive: true,
        instances: instances.map((i) => ({ InstanceID: i.InstanceID, InstanceName: i.InstanceName, StartTime: i.StartTime, EndTime: i.EndTime, CurrentStatus: i.CurrentStatus })), checkpoints: detailCheckpoints }) satisfies Responses.GetPatrolDetailsResponse,
      getPatrolHistory: success({ total_records: history.length, total_count: history.length, limit: 20, offset: 0, history }) satisfies Responses.GetPatrolHistoryResponse,
      getPatrolStatistics: success({ TotalSessions: sessions.length, CompletedSessions: completed.length,
        InProgressSessions: sessions.filter((s) => s.Status === "IN_PROGRESS").length, MissedSessions: sessions.filter((s) => s.Status === "MISSED").length,
        AvgCompletionRate: averageCompletion.toFixed(2), AvgDurationMinutes: "30.00",
        UniqueEmployees: new Set(sessions.map((s) => s.EmployeeID)).size, UniqueInstances: instances.length,
        TodaySessions: today.length, TodayCompleted: today.filter((s) => s.Status === "COMPLETED").length,
        CompletionRate: Math.round(completed.length / sessions.length * 10_000) / 100 }) satisfies Responses.GetPatrolStatisticsResponse,
      getPatrolReports: success({ total_reports: 1, total_count: 1, limit: 20, offset: 0, reports: [report] }) satisfies Responses.GetPatrolReportsResponse,
      getPatrolHistoryExport: success(exportData(exports, "2026-10-12")) satisfies Responses.GetPatrolHistoryExportResponse,
      getCsvHeaders: success({ field_names: ["session_id", "patrol_date", "status", "employee_name", "completion_percentage"], friendly_headers: ["Session", "Date", "Status", "Employee", "Completion (%)"] }) satisfies Responses.GetCsvHeadersResponse,
      getTodayHistory: success(exportData(exports.filter((r) => r.patrol_date === MOCK_DATE), MOCK_DATE)) satisfies Responses.GetTodayHistoryResponse,
      getThisWeekHistory: success(exportData(exports, "2026-10-12")) satisfies Responses.GetThisWeekHistoryResponse,
      getThisMonthHistory: success(exportData(exports, "2026-10-01")) satisfies Responses.GetThisMonthHistoryResponse,
      dashGetCheckpoints: success({ total: checkpoints.length, checkpoints: checkpoints.map((cp) => ({ CheckpointID: cp.CheckpointID,
        CheckpointName: cp.CheckpointName, TagUID: cp.TagUID, IsActive: true, LocationID: cp.LocationID, LocationName: cp.LocationName, PatrolCount: cp.PatrolCount })) }) satisfies Responses.DashGetCheckpointsResponse,
      dashGetPatrols: success({ total: 1, patrols: [{ PatrolID: patrol.PatrolID, PatrolName: patrol.PatrolName, PatrolCode: patrol.PatrolCode,
        CheckpointCount: checkpoints.length, IsActive: true, InstanceCount: instances.length }] }) satisfies Responses.DashGetPatrolsResponse,
      dashGetPatrolInstances: success({ total: instances.length, instances }) satisfies Responses.DashGetPatrolInstancesResponse,
    },
    empty: { getPatrols: success({ total: 0, patrols: [] }) satisfies Responses.GetPatrolsResponse,
      getAllSessions: success({ total: 0, total_count: 0, limit: 20, offset: 0, sessions: [] }) satisfies Responses.GetAllSessionsResponse },
  };
}
