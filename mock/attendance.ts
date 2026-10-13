import type * as Requests from "@/models/api-request";
import type * as Responses from "@/models/api-response";
import { createSeed, MOCK_DATE, MOCK_UTC_OFFSET, success, type MockSeed } from "./shared";

export function createAttendanceMocks(seed: MockSeed = createSeed()) {
  const orgId = seed.organization.OrganizationID;
  const location = seed.locations[0];
  const checkInTimes = ["08:40:00", "08:50:00", "09:10:00", "09:20:00"];
  const records: Responses.AttendanceRecord[] = seed.employees.slice(0, 4).map((employee, index) => ({
    LogID: 1001 + index, EmployeeID: employee.EmployeeID, FirstName: employee.FirstName, LastName: employee.LastName,
    NFCScannedAt: `${MOCK_DATE}T${checkInTimes[index]}+01:00`, FaceVerifiedAt: `${MOCK_DATE}T${checkInTimes[index]}+01:00`,
    VerificationStatus: "VERIFIED", ConfidenceScore: "99.50", VerificationMethod: "NFC_FACE",
    AttendanceType: "CHECK_IN", LocationName: location.LocationName, LocationCode: location.LocationCode,
  }));
  records.push({ ...records[0], LogID: 1005, AttendanceType: "CHECK_OUT", NFCScannedAt: `${MOCK_DATE}T17:00:00+01:00`, FaceVerifiedAt: `${MOCK_DATE}T17:00:00+01:00` });
  const exportRecords: Responses.AttendanceExportRecord[] = records.map((record) => {
    const employee = seed.employees.find((e) => e.EmployeeID === record.EmployeeID)!;
    return {
      LogID: record.LogID, AttendanceType: record.AttendanceType, VerificationStatus: record.VerificationStatus,
      PunctualityStatus: record.AttendanceType === "CHECK_OUT" ? null : record.NFCScannedAt.slice(11, 19) <= "09:00:00" ? "EARLY" : "LATE",
      EmployeeID: employee.EmployeeID, EmployeeCode: employee.EmployeeCode,
      employee_name: `${employee.FirstName} ${employee.LastName}`, employee_email: employee.Email,
      LocationID: location.LocationID, LocationName: location.LocationName, LocationCode: location.LocationCode,
      location_address: location.Address, attendance_date: MOCK_DATE, attendance_time: record.NFCScannedAt.slice(11, 19),
    };
  });
  const history = { attendance_history: records, total_count: records.length, total_records: records.length, limit: 20, offset: 0,
    filters: { start_date: MOCK_DATE, end_date: MOCK_DATE, attendance_type: null, limit: 20, utc_offset: MOCK_UTC_OFFSET } } satisfies Responses.AttendanceHistoryData;
  function exportData(start: string): Responses.AttendanceExportData {
    return { attendance_records: exportRecords,
      pagination: { current_page: 1, total_pages: 1, total_records: exportRecords.length, records_per_page: 20, has_next: false, has_prev: false },
      filters: { organization_id: orgId, start_date: start, end_date: MOCK_DATE, employee_code: null, location_code: null, punctuality_status: null, sort_by: "LogID", sort_order: "ASC" } };
  }
  function employeeLog(index: number): Responses.EmployeePunctualityLog {
    return { EmployeeID: records[index].EmployeeID, LocationID: location.LocationID, LocationName: location.LocationName, TimeStamp: records[index].NFCScannedAt };
  }
  function staffLogs(indices: number[]): Responses.StaffPunctualityData {
    const logs = indices.map((index) => ({ firstname: records[index].FirstName, lastname: records[index].LastName,
      email: seed.employees[index].Email, TimeStamp: records[index].NFCScannedAt, attendancetype: "CHECK_IN" }));
    return { count: logs.length, logs };
  }
  const myRecords = records.filter((r) => r.EmployeeID === seed.employees[0].EmployeeID);
  const todayRequest = { organization_id: orgId, utc_offset: MOCK_UTC_OFFSET };
  const orgDayRequest = { org_id: orgId, check_date: MOCK_DATE, utc_offset: MOCK_UTC_OFFSET };
  const absent = seed.employees.filter((e) => e.IsActive && !records.some((r) => r.EmployeeID === e.EmployeeID)).map((e) => ({ firstname: e.FirstName, lastname: e.LastName, email: e.Email }));
  return {
    requests: {
      getAdminAttendanceHistory: { start_date: MOCK_DATE, end_date: MOCK_DATE, limit: 20, offset: 0, utc_offset: MOCK_UTC_OFFSET } satisfies Requests.GetAdminAttendanceHistoryRequest,
      getAdminAttendanceHistoryExport: { organization_id: orgId, start_date: MOCK_DATE, end_date: MOCK_DATE, page: 1, limit: 20, utc_offset: MOCK_UTC_OFFSET } satisfies Requests.GetAdminAttendanceHistoryExportRequest,
      getAttendanceCsvHeaders: undefined satisfies Requests.GetAttendanceCsvHeadersRequest,
      getTodayAttendance: { ...todayRequest } satisfies Requests.GetTodayAttendanceRequest,
      getWeekAttendance: { ...todayRequest } satisfies Requests.GetWeekAttendanceRequest,
      getMonthAttendance: { ...todayRequest } satisfies Requests.GetMonthAttendanceRequest,
      employeeEarlyLogs: { first_name: seed.employees[1].FirstName, last_name: seed.employees[1].LastName, lastndate: 1, utc_offset: MOCK_UTC_OFFSET } satisfies Requests.EmployeeEarlyLogsRequest,
      employeeLateLogs: { first_name: seed.employees[2].FirstName, last_name: seed.employees[2].LastName, lastndate: 1, utc_offset: MOCK_UTC_OFFSET } satisfies Requests.EmployeeLateLogsRequest,
      employeeNoRecordCount: { first_name: seed.employees[4].FirstName, last_name: seed.employees[4].LastName, lastndate: 1, utc_offset: MOCK_UTC_OFFSET } satisfies Requests.EmployeeNoRecordCountRequest,
      orgEarlyStaffByDate: { ...orgDayRequest } satisfies Requests.OrgEarlyStaffByDateRequest,
      orgLateStaffByDate: { ...orgDayRequest } satisfies Requests.OrgLateStaffByDateRequest,
      orgAbsentStaff: { ...orgDayRequest } satisfies Requests.OrgAbsentStaffRequest,
      orgDailyAvgCheckin: { org_id: orgId, lastndate: 1, utc_offset: MOCK_UTC_OFFSET } satisfies Requests.OrgDailyAvgCheckinRequest,
      getAttendanceSummary: { days: 1, timezone_offset: MOCK_UTC_OFFSET } satisfies Requests.GetAttendanceSummaryRequest,
      getAttendanceLogs: { start_date: MOCK_DATE, end_date: MOCK_DATE, limit: 20, offset: 0, timezone_offset: MOCK_UTC_OFFSET } satisfies Requests.GetAttendanceLogsRequest,
    },
    responses: {
      getAdminAttendanceHistory: success(history) satisfies Responses.GetAdminAttendanceHistoryResponse,
      getAdminAttendanceHistoryExport: success(exportData(MOCK_DATE)) satisfies Responses.GetAdminAttendanceHistoryExportResponse,
      getAttendanceCsvHeaders: success({ field_names: ["EmployeeCode", "employee_name", "AttendanceType", "attendance_date", "attendance_time"], friendly_headers: ["Employee code", "Employee name", "Attendance type", "Date", "Time"] }) satisfies Responses.GetAttendanceCsvHeadersResponse,
      getTodayAttendance: success(exportData(MOCK_DATE)) satisfies Responses.GetTodayAttendanceResponse,
      getWeekAttendance: success(exportData("2026-10-12")) satisfies Responses.GetWeekAttendanceResponse,
      getMonthAttendance: success(exportData("2026-10-01")) satisfies Responses.GetMonthAttendanceResponse,
      employeeEarlyLogs: success({ count: 1, logs: [employeeLog(1)] }) satisfies Responses.EmployeeEarlyLogsResponse,
      employeeLateLogs: success({ count: 1, logs: [employeeLog(2)] }) satisfies Responses.EmployeeLateLogsResponse,
      employeeNoRecordCount: success({ no_record_days: 1 }) satisfies Responses.EmployeeNoRecordCountResponse,
      orgEarlyStaffByDate: success(staffLogs([0, 1])) satisfies Responses.OrgEarlyStaffByDateResponse,
      orgLateStaffByDate: success(staffLogs([2, 3])) satisfies Responses.OrgLateStaffByDateResponse,
      orgAbsentStaff: success({ count: absent.length, logs: absent }) satisfies Responses.OrgAbsentStaffResponse,
      orgDailyAvgCheckin: success([{ CheckDate: MOCK_DATE, AvgCheckInTime: "09:00:00" }]) satisfies Responses.OrgDailyAvgCheckinResponse,
      getAttendanceSummary: success({ summary: { TotalDaysLogged: 1, TotalCheckIns: myRecords.filter((r) => r.AttendanceType === "CHECK_IN").length, TotalCheckOuts: myRecords.filter((r) => r.AttendanceType === "CHECK_OUT").length, FullDaysPresent: 1, PartialDays: 0, AttendanceRate: 100 }, timezone_offset: MOCK_UTC_OFFSET }) satisfies Responses.GetAttendanceSummaryResponse,
      getAttendanceLogs: success({ attendance_logs: myRecords, total_count: myRecords.length, total_records: myRecords.length, limit: 20, offset: 0, filters: { start_date: MOCK_DATE, end_date: MOCK_DATE, attendance_type: null, limit: 20, timezone_offset: MOCK_UTC_OFFSET } }) satisfies Responses.GetAttendanceLogsResponse,
    },
    empty: {
      getAdminAttendanceHistory: success({ ...history, attendance_history: [], total_count: 0, total_records: 0 }) satisfies Responses.GetAdminAttendanceHistoryResponse,
    },
  };
}
