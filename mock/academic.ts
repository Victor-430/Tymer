import type * as Requests from "@/models/api-request";
import { createSeed, createUploadBlob, MOCK_DATE, MOCK_UTC_OFFSET, type MockSeed } from "./shared";

// Responses deliberately omitted: the academic response aliases leave their data generic.
export function createAcademicMocks(seed: MockSeed = createSeed()) {
  const faculty = { faculty_name: "Faculty of Science", faculty_code: "SCI" } satisfies Requests.CreateFacultyRequest;
  const department = { faculty_id: 501, department_name: "Computer Science", department_code: "CSC" } satisfies Requests.CreateDepartmentRequest;
  const course = { level: 100, semester: "FIRST", academic_year: "2026/2027", course_code: "CSC101", course_title: "Introduction to Computing", credit_unit: 3, is_elective: false } satisfies Requests.CreateCourseRequest;
  const schedule = { course_id: 503, location_id: seed.locations[0].LocationID, day_of_week: 2, start_time: "11:00:00", end_time: "12:00:00", grace_period_minutes: 10, utc_offset: MOCK_UTC_OFFSET, faculty_ids: [501], department_ids: [502] } satisfies Requests.CreateScheduleRequest;
  const student = { matric_number: "SCI/2026/001", first_name: "Lina", last_name: "Gray", email: "lina@example.com", department_id: 502, level: 100, passport: createUploadBlob() } satisfies Requests.CreateStudentRequest;
  const lecturer = { first_name: "Chris", last_name: "West", email: "chris@example.com", staff_code: "LECT-001", department_id: 502, faculty_id: 501, passport: createUploadBlob() } satisfies Requests.CreateLecturerRequest;
  const orgRequest = { organization_id: seed.organization.OrganizationID, limit: 20, offset: 0 };
  const historyRequest = { ...orgRequest, course_id: 503, start_date: MOCK_DATE, end_date: MOCK_DATE, utc_offset: MOCK_UTC_OFFSET };
  const exportRequest = { ...orgRequest, course_id: 503, utc_offset: MOCK_UTC_OFFSET };
  return {
    requests: {
      createFaculty: faculty,
      getFaculties: { ...orgRequest } satisfies Requests.GetFacultiesRequest,
      bulkCreateFaculties: [{ ...faculty }] satisfies Requests.BulkCreateFacultiesRequest,
      updateFaculty: { path: { faculty_id: 501 }, body: { faculty_name: faculty.faculty_name, is_active: true } } satisfies Requests.UpdateFacultyRequest,
      createDepartment: department,
      getDepartments: { ...orgRequest, faculty_id: 501 } satisfies Requests.GetDepartmentsRequest,
      bulkCreateDepartments: [{ faculty_code: faculty.faculty_code, department_name: department.department_name, department_code: department.department_code }] satisfies Requests.BulkCreateDepartmentsRequest,
      updateDepartment: { path: { department_id: 502 }, body: { department_name: department.department_name, faculty_id: 501 } } satisfies Requests.UpdateDepartmentRequest,
      createCourse: course,
      getCourses: { ...orgRequest, department_id: 502, level: course.level, semester: course.semester, academic_year: course.academic_year } satisfies Requests.GetCoursesRequest,
      bulkCreateCourses: [{ ...course }] satisfies Requests.BulkCreateCoursesRequest,
      getCourseDetail: { path: { course_id: 503 }, query: { utc_offset: MOCK_UTC_OFFSET } } satisfies Requests.GetCourseDetailRequest,
      updateCourse: { path: { course_id: 503 }, body: { course_title: course.course_title, credit_unit: 3 } } satisfies Requests.UpdateCourseRequest,
      deleteCourse: { course_id: 503 } satisfies Requests.DeleteCourseRequest,
      createSchedule: schedule,
      getSchedules: { course_id: 503, location_id: schedule.location_id, utc_offset: MOCK_UTC_OFFSET, limit: 20, offset: 0 } satisfies Requests.GetSchedulesRequest,
      bulkCreateSchedules: [{ course_code: course.course_code, academic_year: course.academic_year, semester: course.semester,
        location_code: seed.locations[0].LocationCode, day_of_week: "TUESDAY", start_time: schedule.start_time, end_time: schedule.end_time,
        grace_period_minutes: 10, utc_offset: MOCK_UTC_OFFSET, faculty_codes: [faculty.faculty_code], department_codes: [department.department_code] }] satisfies Requests.BulkCreateSchedulesRequest,
      updateSchedule: { path: { schedule_id: 504 }, body: { start_time: schedule.start_time, end_time: schedule.end_time } } satisfies Requests.UpdateScheduleRequest,
      deleteSchedule: { schedule_id: 504 } satisfies Requests.DeleteScheduleRequest,
      createStudent: student,
      getStudents: { ...orgRequest, department_id: 502, level: 100 } satisfies Requests.GetStudentsRequest,
      bulkCreateStudents: [{ matric_number: student.matric_number, first_name: student.first_name, last_name: student.last_name, email: student.email, department_code: department.department_code, level: 100 }] satisfies Requests.BulkCreateStudentsRequest,
      createLecturer: lecturer,
      getLecturers: { ...orgRequest, department_id: 502, faculty_id: 501 } satisfies Requests.GetLecturersRequest,
      bulkCreateLecturers: [{ staff_code: lecturer.staff_code, first_name: lecturer.first_name, last_name: lecturer.last_name, email: lecturer.email, department_code: department.department_code, faculty_code: faculty.faculty_code }] satisfies Requests.BulkCreateLecturersRequest,
      getMemberDetail: { member_id: 505 } satisfies Requests.GetMemberDetailRequest,
      updateMember: { path: { member_id: 505 }, body: { first_name: student.first_name, last_name: student.last_name, level: 100 } } satisfies Requests.UpdateMemberRequest,
      resetMemberPassword: { member_id: 505 } satisfies Requests.ResetMemberPasswordRequest,
      deactivateMember: { member_id: 505 } satisfies Requests.DeactivateMemberRequest,
      reactivateMember: { member_id: 505 } satisfies Requests.ReactivateMemberRequest,
      createCourseOverride: { course_id: 503, member_id: 505, reason: "Demo enrollment override" } satisfies Requests.CreateCourseOverrideRequest,
      getCourseOverrides: { course_id: 503, member_id: 505, limit: 20, offset: 0 } satisfies Requests.GetCourseOverridesRequest,
      deleteCourseOverride: { override_id: 506 } satisfies Requests.DeleteCourseOverrideRequest,
      getSessions: { ...historyRequest } satisfies Requests.GetSessionsRequest,
      getSessionDetail: { path: { lecture_session_id: 507 }, query: { utc_offset: MOCK_UTC_OFFSET } } satisfies Requests.GetSessionDetailRequest,
      getAnomalies: { ...orgRequest, start_date: MOCK_DATE, end_date: MOCK_DATE } satisfies Requests.GetAnomaliesRequest,
      getReports: { ...historyRequest, schedule_id: 504 } satisfies Requests.GetReportsRequest,
      getAdminLectureAttendanceHistory: { ...historyRequest } satisfies Requests.GetAdminLectureAttendanceHistoryRequest,
      getAdminLectureAttendanceHistoryExport: { ...historyRequest } satisfies Requests.GetAdminLectureAttendanceHistoryExportRequest,
      exportCsvHeaders: undefined satisfies Requests.ExportCsvHeadersRequest,
      exportToday: { ...exportRequest } satisfies Requests.ExportTodayRequest,
      exportThisWeek: { ...exportRequest } satisfies Requests.ExportThisWeekRequest,
      exportThisMonth: { ...exportRequest } satisfies Requests.ExportThisMonthRequest,
    },
  };
}
