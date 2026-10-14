import type { AttendanceExportRecord, EmployeeSummary, PatrolSession, TaskSession, VisitorSummary } from "@/models/api-response";
import { MOCK_DATE } from "@/mock";

export function attendanceMetrics(employees: EmployeeSummary[], records: AttendanceExportRecord[], day = MOCK_DATE) {
  const active = employees.filter((e) => e.IsActive);
  const firstCheckins = active.flatMap((employee) => {
    const record = records.filter((r) => r.EmployeeID === employee.EmployeeID && r.AttendanceType === "CHECK_IN" && r.attendance_date === day)
      .sort((a, b) => a.attendance_time.localeCompare(b.attendance_time))[0];
    return record ? [record] : [];
  });
  const absent = active.filter((e) => !firstCheckins.some((r) => r.EmployeeID === e.EmployeeID));
  const averageSeconds = firstCheckins.length ? firstCheckins.reduce((sum, r) => {
    const [h, m, s] = r.attendance_time.split(":").map(Number);
    return sum + h * 3600 + m * 60 + s;
  }, 0) / firstCheckins.length : null;
  const average = averageSeconds === null ? null : `${String(Math.floor(averageSeconds / 3600)).padStart(2, "0")}:${String(Math.floor(averageSeconds % 3600 / 60)).padStart(2, "0")}`;
  return { active: active.length, present: firstCheckins.length, early: firstCheckins.filter((r) => r.PunctualityStatus === "EARLY").length,
    late: firstCheckins.filter((r) => r.PunctualityStatus === "LATE").length,
    undisclosed: firstCheckins.filter((r) => r.PunctualityStatus == null).length, absent, average,
    rate: active.length ? firstCheckins.length / active.length * 100 : null };
}

export function sessionMetrics(sessions: Array<{ Status: string }>) {
  const completed = sessions.filter((s) => s.Status === "COMPLETED").length;
  return { total: sessions.length, completed, rate: sessions.length ? completed / sessions.length * 100 : null };
}

export function todayMetrics(employees: EmployeeSummary[], attendance: AttendanceExportRecord[], patrols: PatrolSession[], tasks: TaskSession[], visitors: VisitorSummary[]) {
  const visits = visitors.filter((v) => v.CheckedInAt.slice(0, 10) === MOCK_DATE);
  return { attendance: attendanceMetrics(employees, attendance), patrols: sessionMetrics(patrols.filter((s) => s.PatrolDate === MOCK_DATE)),
    tasks: sessionMetrics(tasks.filter((s) => s.session_date === MOCK_DATE)),
    visitors: { total: visits.length, inside: visits.filter((v) => v.Status === "CHECKED_IN").length } };
}
