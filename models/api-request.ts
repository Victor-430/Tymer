export interface LoginRequest {
  email: string;
  password: string;
}

export interface OrganizationSignupRequest {
  organization_name: string;
  contact_name: string;
  contact_email: string;
  modules: Array<string>;
  timezone?: string;
}

export interface UpdateMyOrganizationLogoBody {
  logo: Blob;
}

export interface UpdateMyOrganizationProfileBody {
  organization_name?: string | null;
  sign_in_time?: string | null;
  sign_out_time?: string | null;
  utc_offset?: number;
  timezone?: string | null;
  logo?: Blob;
}

export type AdminLoginRequest = LoginRequest;

export type GetSignupModulesRequest = void;

export type SignupOrganizationRequest = OrganizationSignupRequest;

export interface GetMyOrganizationSubscriptionsRequest {
  utc_offset?: number;
}

export type UpdateMyOrganizationLogoRequest = UpdateMyOrganizationLogoBody;

export interface GetMyOrganizationProfileRequest {
  utc_offset?: number;
}

export type UpdateMyOrganizationProfileRequest =
  | UpdateMyOrganizationProfileBody
  | undefined;

export interface ResetEmployeeCredentialRequest {
  employee_id: number;
}

export interface CreateEmployeeBody {
  employee_code: string;
  email: string;
  first_name: string;
  last_name: string;
  organization_id?: number;
  passport: Blob;
  location_ids?: string | null;
  access_type?: string;
}

export interface UpdateEmployeeBody {
  employee_id: number;
  employee_code?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  role?: string | null;
  is_active?: boolean | null;
  file?: Blob;
}

export interface BulkEmployeeItem {
  employee_code: string;
  email: string;
  first_name: string;
  last_name: string;
  organization_id?: number | null;
  face_image_base64?: string | null;
}

export type ResetEmployeeCredentialsRequest = ResetEmployeeCredentialRequest;

export interface GetEmployeeDetailRequest {
  email: string;
}

export type CreateEmployeeRequest = CreateEmployeeBody;

export interface ViewEmployeesRequest {
  organization_id?: number | null;
  limit?: number;
  offset?: number;
}

export type UpdateEmployeeRequest = UpdateEmployeeBody;

export interface ReactivateEmployeeRequest {
  employee_id: number;
}

export interface DeactivateEmployeeRequest {
  employee_id: number;
}

export type BulkCreateEmployeesRequest = Array<BulkEmployeeItem>;

export interface GrantLocationAccessBody {
  employee_id: number;
  location_ids: Array<number>;
  access_type?: string;
}

export interface RevokeLocationAccessBody {
  employee_id: number;
  location_ids: Array<number>;
}

export interface LocationCreateRequest {
  location_name: string;
  location_code: string;
  address?: string | null;
  organization_id?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface LocationUpdateRequest {
  location_id: number;
  location_name?: string | null;
  address?: string | null;
  is_active?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface BulkLocationItem {
  location_name: string;
  location_code: string;
  organization_id?: number | null;
}

export interface NFCTagCreateRequest {
  tagid: string;
  taguid: string;
  organization_id?: number | null;
  is_active?: boolean;
}

export interface NFCTagUpdateRequest {
  location_id?: number | null;
  is_active?: boolean | null;
  tag_id?: string | null;
  tag_uid?: string | null;
}

export interface LinkNfcTagToLocationBody {
  tag_id: string;
  location_code: string;
}

export interface ViewEmployeeAccessRequest {
  employee_id?: number | null;
  limit?: number;
  offset?: number;
}

export type GrantLocationAccessRequest = GrantLocationAccessBody;

export type RevokeLocationAccessRequest = RevokeLocationAccessBody;

export type CreateLocationRequest = LocationCreateRequest;

export type UpdateLocationRequest = LocationUpdateRequest;

export interface ViewLocationsRequest {
  organization_id?: number | null;
  limit?: number;
  offset?: number;
}

export interface DeleteLocationRequest {
  location_id: number;
}

export type BulkCreateLocationsRequest = Array<BulkLocationItem>;

export type CreateNfcTagRequest = NFCTagCreateRequest;

export interface ViewNfcTagsRequest {
  organization_id?: number | null;
  limit?: number;
  offset?: number;
}

export interface UpdateNfcTagRequest {
  path: {
    tag_id: string;
  };
  body: NFCTagUpdateRequest;
}

export interface DeleteNfcTagRequest {
  path: {
    tag_id: string;
  };
  query?: {
    confirm?: boolean;
  };
}

export interface GenerateQrCodeRequest {
  tag_uid: string;
}

export type LinkNfcTagToLocationRequest = LinkNfcTagToLocationBody;

export interface GetAdminAttendanceHistoryRequest {
  start_date?: string;
  end_date?: string;
  attendance_type?: string;
  employee_id?: number;
  limit?: number;
  utc_offset?: number;
  offset?: number;
}

export interface GetAdminAttendanceHistoryExportRequest {
  organization_id: number;
  start_date: string;
  end_date: string;
  employee_code?: string | null;
  location_code?: string | null;
  punctuality_status?: string | null;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
  utc_offset?: number;
}

export type GetAttendanceCsvHeadersRequest = void;

export interface GetTodayAttendanceRequest {
  organization_id: number;
  employee_code?: string | null;
  location_code?: string | null;
  punctuality_status?: string | null;
  utc_offset?: number;
}

export interface GetWeekAttendanceRequest {
  organization_id: number;
  employee_code?: string | null;
  location_code?: string | null;
  punctuality_status?: string | null;
  utc_offset?: number;
}

export interface GetMonthAttendanceRequest {
  organization_id: number;
  employee_code?: string | null;
  location_code?: string | null;
  punctuality_status?: string | null;
  utc_offset?: number;
}

export interface EmployeeEarlyLogsRequest {
  first_name: string;
  last_name: string;
  lastndate?: number;
  utc_offset?: number;
}

export interface EmployeeLateLogsRequest {
  first_name: string;
  last_name: string;
  lastndate?: number;
  utc_offset?: number;
}

export interface EmployeeNoRecordCountRequest {
  first_name: string;
  last_name: string;
  lastndate?: number;
  utc_offset?: number;
}

export interface OrgEarlyStaffByDateRequest {
  org_id?: number | null;
  check_date?: string;
  utc_offset?: number;
}

export interface OrgLateStaffByDateRequest {
  org_id?: number | null;
  check_date?: string;
  utc_offset?: number;
}

export interface OrgAbsentStaffRequest {
  org_id?: number | null;
  check_date?: string;
  utc_offset?: number;
}

export interface OrgDailyAvgCheckinRequest {
  org_id: number;
  lastndate?: number;
  utc_offset?: number;
}

export interface GetAttendanceSummaryRequest {
  days?: number;
  timezone_offset?: number;
}

export interface GetAttendanceLogsRequest {
  start_date?: string;
  end_date?: string;
  attendance_type?: string;
  limit?: number;
  timezone_offset?: number;
  offset?: number;
}

export interface BulkPatrolItem {
  patrol_name: string;
  description?: string | null;
  checkpoint_names: Array<string>;
  organization_id?: number | null;
}

export interface BulkCheckpointItem {
  checkpoint_name: string;
  location_code: string;
  tag_id: string;
  organization_id?: number | null;
}

export interface CheckpointCreateRequest {
  location_id: number;
  tag_uid: string;
  checkpoint_name: string;
  description?: string | null;
  organization_id: number;
}

export interface CheckpointUpdateRequest {
  checkpoint_name?: string | null;
  description?: string | null;
  location_id?: number | null;
  tag_uid?: string | null;
  is_active?: boolean | null;
}

export interface PatrolCreateRequest {
  patrol_name: string;
  patrol_code: string;
  organization_id: number;
  description?: string | null;
  checkpoint_ids: Array<number>;
}

export interface PatrolUpdateRequest {
  patrol_name?: string | null;
  description?: string | null;
  checkpoint_ids?: Array<number> | null;
  is_active?: boolean | null;
}

export interface InstanceCreateRequest {
  patrol_id: number;
  instance_name: string;
  start_time: string;
  end_time: string;
  description?: string | null;
  utc_offset?: number;
}

export interface BulkInstanceItem {
  patrol_code: string;
  instance_name: string;
  start_time: string;
  end_time: string;
  description?: string | null;
  utc_offset?: number;
}

export interface InstanceUpdateRequest {
  instance_name?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  description?: string | null;
  is_active?: boolean | null;
  utc_offset?: number;
}

export type PatrolStatusFilter =
  | "ALL"
  | "IN_PROGRESS"
  | "INCOMPLETE"
  | "COMPLETED"
  | "ABANDONED";

export type SortField =
  | "PatrolDate"
  | "EmployeeName"
  | "PatrolName"
  | "Status"
  | "CompletionPercentage"
  | "DurationMinutes";

export type SortOrder = "ASC" | "DESC";

export type BulkCreatePatrolsRequest = Array<BulkPatrolItem>;

export type BulkCreateCheckpointsRequest = Array<BulkCheckpointItem>;

export type CreateCheckpointRequest = CheckpointCreateRequest;

export interface GetCheckpointsRequest {
  organization_id: number;
  utc_offset?: number;
}

export interface VerifyNfcTagRequest {
  tag_uid: string;
  organization_id: number;
  utc_offset?: number;
}

export interface UpdateCheckpointRequest {
  path: {
    checkpoint_id: number;
  };
  query?: {
    utc_offset?: number;
  };
  body: CheckpointUpdateRequest;
}

export interface DeleteCheckpointRequest {
  checkpoint_id: number;
}

export type CreatePatrolRequest = PatrolCreateRequest;

export interface GetPatrolsRequest {
  organization_id: number;
  utc_offset?: number;
}

export interface GetPatrolAdminRequest {
  patrol_id: number;
}

export interface UpdatePatrolRequest {
  path: {
    patrol_id: number;
  };
  body: PatrolUpdateRequest;
}

export interface DeletePatrolRequest {
  patrol_id: number;
}

export type CreateInstanceRequest = InstanceCreateRequest;

export type BulkCreateInstancesRequest = Array<BulkInstanceItem>;

export interface GetInstanceRequest {
  path: {
    instance_id: number;
  };
  query?: {
    utc_offset?: number;
  };
}

export interface UpdateInstanceRequest {
  path: {
    instance_id: number;
  };
  body: InstanceUpdateRequest;
}

export interface DeleteInstanceRequest {
  instance_id: number;
}

export interface GetPatrolInstancesRequest {
  path: {
    patrol_id: number;
  };
  query?: {
    utc_offset?: number;
  };
}

export interface GetAllSessionsRequest {
  organization_id: number;
  limit?: number;
  status?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  utc_offset?: number;
  offset?: number;
}

export interface GetSessionAdminRequest {
  path: {
    session_id: number;
  };
  query?: {
    utc_offset?: number;
  };
}

export interface GetDashboardOverviewRequest {
  organization_id: number;
  utc_offset?: number;
}

export interface GetOrganizationPatrolsRequest {
  organization_id: number;
  utc_offset?: number;
}

export interface GetPatrolDetailsRequest {
  path: {
    patrol_id: number;
  };
  query?: {
    utc_offset?: number;
  };
}

export interface GetPatrolHistoryRequest {
  organization_id: number;
  limit?: number;
  start_date?: string | null;
  end_date?: string | null;
  utc_offset?: number;
  offset?: number;
}

export interface GetPatrolStatisticsRequest {
  organization_id: number;
  days?: number;
}

export interface GetPatrolReportsRequest {
  organization_id: number;
  limit?: number;
  incident_type?: string | null;
  location_id?: number | null;
  utc_offset?: number;
  offset?: number;
}

export interface GetPatrolHistoryExportRequest {
  organization_id: number;
  start_date?: string | null;
  end_date?: string | null;
  employee_id?: number | null;
  patrol_id?: number | null;
  instance_id?: number | null;
  location_id?: number | null;
  status?: PatrolStatusFilter | null;
  min_completion?: number | null;
  max_completion?: number | null;
  sort_by?: SortField | null;
  sort_order?: SortOrder | null;
  limit?: number;
  offset?: number;
  utc_offset?: number;
}

export type GetCsvHeadersRequest = void;

export interface GetTodayHistoryRequest {
  organization_id: number;
  employee_id?: number | null;
  status?: PatrolStatusFilter | null;
  utc_offset?: number;
}

export interface GetThisWeekHistoryRequest {
  organization_id: number;
  employee_id?: number | null;
  status?: PatrolStatusFilter | null;
  utc_offset?: number;
}

export interface GetThisMonthHistoryRequest {
  organization_id: number;
  employee_id?: number | null;
  status?: PatrolStatusFilter | null;
  utc_offset?: number;
}

export interface DashGetCheckpointsRequest {
  organization_id: number;
  utc_offset?: number;
}

export interface DashGetPatrolsRequest {
  organization_id: number;
  utc_offset?: number;
}

export interface DashGetPatrolInstancesRequest {
  path: {
    patrol_id: number;
  };
  query?: {
    utc_offset?: number;
  };
}

export interface TaskCreateRequest {
  name: string;
  description?: string | null;
  task_level_evidence?: boolean;
  subtask_level_evidence?: boolean;
  frequency?: FrequencyEnum;
  days_of_week?: Array<number> | null;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  subtasks?: Array<string> | null;
  utc_offset?: number;
}

export type FrequencyEnum = "DAILY" | "WEEKLY" | "CUSTOM";

export interface BulkTaskCreateRequest {
  tasks: Array<TaskCreateRequest>;
}

export interface TaskUpdateRequest {
  name?: string | null;
  description?: string | null;
  task_level_evidence?: boolean | null;
  subtask_level_evidence?: boolean | null;
  frequency?: FrequencyEnum | null;
  days_of_week?: Array<number> | null;
  start_time?: string | null;
  end_time?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  utc_offset?: number;
}

export interface SubtaskCreateRequest {
  name: string;
}

export interface BulkSubtaskCreateRequest {
  subtasks: Array<SubtaskCreateRequest>;
}

export interface SubtaskUpdateRequest {
  name?: string | null;
}

export type TaskStatusFilter =
  | "ALL"
  | "PENDING"
  | "IN_PROGRESS"
  | "AWAITING_TASK_EVIDENCE"
  | "AWAITING_FACIAL_VERIFICATION"
  | "COMPLETED"
  | "NOT_COMPLETED";

export type TaskSortField =
  | "created_at"
  | "last_name"
  | "task_name"
  | "status"
  | "completion_pct";

export type AdminCreateTaskRequest = TaskCreateRequest;

export type AdminBulkCreateTasksRequest = BulkTaskCreateRequest;

export interface AdminListTasksRequest {
  organization_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  utc_offset?: number;
  limit?: number;
  offset?: number;
}

export interface AdminTaskDetailsRequest {
  path: {
    task_code: string;
  };
  query?: {
    utc_offset?: number;
  };
}

export interface AdminUpdateTaskRequest {
  path: {
    task_code: string;
  };
  body: TaskUpdateRequest;
}

export interface AdminDeleteTaskRequest {
  task_code: string;
}

export interface AdminCreateSubtaskRequest {
  path: {
    task_code: string;
  };
  body: SubtaskCreateRequest;
}

export interface AdminBulkCreateSubtasksRequest {
  path: {
    task_code: string;
  };
  body: BulkSubtaskCreateRequest;
}

export interface AdminListSubtasksRequest {
  path: {
    task_code: string;
  };
  query?: {
    utc_offset?: number;
    limit?: number;
    offset?: number;
  };
}

export interface AdminUpdateSubtaskRequest {
  path: {
    task_code: string;
    subtask_id: number;
  };
  body: SubtaskUpdateRequest;
}

export interface AdminDeleteSubtaskRequest {
  task_code: string;
  subtask_id: number;
}

export interface AdminAllSessionsRequest {
  status?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  limit?: number;
  offset?: number;
  utc_offset?: number;
}

export interface AdminDashboardOverviewRequest {
  days?: number;
  utc_offset?: number;
}

export interface AdminTaskAnalyticsRequest {
  days?: number;
  utc_offset?: number;
}

export interface AdminCompletionRatesRequest {
  days?: number;
  utc_offset?: number;
}

export interface AdminPeakActivityRequest {
  days?: number;
  utc_offset?: number;
}

export interface AdminSessionDurationRequest {
  days?: number;
  utc_offset?: number;
}

export interface AdminGetEvidencesRequest {
  organization_id?: number | null;
  task_code?: string | null;
  employee_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  utc_offset?: number;
  limit?: number;
  offset?: number;
}

export interface AdminTaskHistoryExportRequest {
  organization_id: number;
  start_date?: string | null;
  end_date?: string | null;
  employee_id?: number | null;
  task_code?: string | null;
  status?: TaskStatusFilter | null;
  min_completion?: number | null;
  max_completion?: number | null;
  sort_by?: TaskSortField | null;
  sort_order?: SortOrder | null;
  limit?: number;
  offset?: number;
  utc_offset?: number;
}

export type AdminCsvHeadersRequest = void;

export interface AdminTodayHistoryRequest {
  organization_id: number;
  employee_id?: number | null;
  status?: TaskStatusFilter | null;
  utc_offset?: number;
}

export interface AdminThisWeekHistoryRequest {
  organization_id: number;
  employee_id?: number | null;
  status?: TaskStatusFilter | null;
  utc_offset?: number;
}

export interface AdminThisMonthHistoryRequest {
  organization_id: number;
  employee_id?: number | null;
  status?: TaskStatusFilter | null;
  utc_offset?: number;
}

export interface FlagVisitorBody {
  visit_id: number;
  is_flagged: boolean;
  flag_reason?: string | null;
}

export interface GetVisitorLogsRequest {
  location_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  is_flagged?: boolean | null;
  limit?: number;
  skip?: number;
  utc_offset?: number;
}

export type FlagVisitorRequest = FlagVisitorBody;

export interface GenerateVisitorTokenRequest {
  location_id: number;
}

export interface GetVisitorTokenRequest {
  location_id: number;
}

export interface GetTodaySummaryRequest {
  location_id?: number | null;
  utc_offset?: number;
}

export interface GetSingleVisitRequest {
  path: {
    visit_id: number;
  };
  query?: {
    utc_offset?: number;
  };
}

export interface FacultyCreateRequest {
  faculty_name: string;
  faculty_code: string;
}

export interface BulkFacultyItem {
  faculty_name: string;
  faculty_code: string;
}

export interface FacultyUpdateRequest {
  faculty_name?: string | null;
  faculty_code?: string | null;
  is_active?: boolean | null;
}

export interface DepartmentCreateRequest {
  faculty_id: number;
  department_name: string;
  department_code: string;
}

export interface BulkDepartmentItem {
  faculty_code: string;
  department_name: string;
  department_code: string;
}

export interface DepartmentUpdateRequest {
  faculty_id?: number | null;
  department_name?: string | null;
  department_code?: string | null;
  is_active?: boolean | null;
}

export interface CourseCreateRequest {
  level: number;
  semester: string;
  academic_year: string;
  course_code: string;
  course_title: string;
  credit_unit?: number | null;
  is_elective?: boolean;
}

export interface BulkCourseItem {
  level: number;
  semester: string;
  academic_year: string;
  course_code: string;
  course_title: string;
  credit_unit?: number | null;
  is_elective?: boolean;
}

export interface CourseUpdateRequest {
  level?: number | null;
  course_title?: string | null;
  credit_unit?: number | null;
  is_elective?: boolean | null;
  is_active?: boolean | null;
}

export interface CourseScheduleCreateRequest {
  course_id: number;
  location_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  grace_period_minutes?: number;
  utc_offset?: number;
  faculty_ids?: Array<number>;
  department_ids?: Array<number>;
}

export interface BulkCourseScheduleItem {
  course_code: string;
  academic_year: string;
  semester: string;
  location_code: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  grace_period_minutes?: number;
  utc_offset?: number;
  faculty_codes?: Array<string>;
  department_codes?: Array<string>;
}

export interface CourseScheduleUpdateRequest {
  location_id?: number | null;
  day_of_week?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  grace_period_minutes?: number | null;
  is_active?: boolean | null;
  utc_offset?: number;
  faculty_ids?: Array<number> | null;
  department_ids?: Array<number> | null;
}

export interface CreateStudentBody {
  matric_number: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: number;
  level: number;
  passport: Blob;
}

export interface BulkStudentItem {
  matric_number: string;
  first_name: string;
  last_name: string;
  email: string;
  department_code: string;
  level: number;
  face_image_base64?: string | null;
}

export interface CreateLecturerBody {
  first_name: string;
  last_name: string;
  email: string;
  staff_code?: string | null;
  department_id?: number | null;
  faculty_id?: number | null;
  passport: Blob;
}

export interface BulkLecturerItem {
  staff_code?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  department_code?: string | null;
  faculty_code?: string | null;
  face_image_base64?: string | null;
}

export interface UpdateMemberBody {
  first_name?: string | null;
  last_name?: string | null;
  department_id?: number | null;
  faculty_id?: number | null;
  level?: number | null;
  matric_number?: string | null;
  staff_code?: string | null;
  is_active?: boolean | null;
  file?: Blob;
}

export interface CourseOverrideCreateRequest {
  course_id: number;
  member_id: number;
  reason?: string | null;
}

export type CreateFacultyRequest = FacultyCreateRequest;

export interface GetFacultiesRequest {
  organization_id: number;
  limit?: number;
  offset?: number;
}

export type BulkCreateFacultiesRequest = Array<BulkFacultyItem>;

export interface UpdateFacultyRequest {
  path: {
    faculty_id: number;
  };
  body: FacultyUpdateRequest;
}

export type CreateDepartmentRequest = DepartmentCreateRequest;

export interface GetDepartmentsRequest {
  organization_id: number;
  faculty_id?: number | null;
  limit?: number;
  offset?: number;
}

export type BulkCreateDepartmentsRequest = Array<BulkDepartmentItem>;

export interface UpdateDepartmentRequest {
  path: {
    department_id: number;
  };
  body: DepartmentUpdateRequest;
}

export type CreateCourseRequest = CourseCreateRequest;

export interface GetCoursesRequest {
  organization_id: number;
  faculty_id?: number | null;
  department_id?: number | null;
  level?: number | null;
  semester?: string | null;
  academic_year?: string | null;
  limit?: number;
  offset?: number;
}

export type BulkCreateCoursesRequest = Array<BulkCourseItem>;

export interface GetCourseDetailRequest {
  path: {
    course_id: number;
  };
  query?: {
    utc_offset?: number;
  };
}

export interface UpdateCourseRequest {
  path: {
    course_id: number;
  };
  body: CourseUpdateRequest;
}

export interface DeleteCourseRequest {
  course_id: number;
}

export type CreateScheduleRequest = CourseScheduleCreateRequest;

export interface GetSchedulesRequest {
  course_id?: number | null;
  location_id?: number | null;
  utc_offset?: number;
  limit?: number;
  offset?: number;
}

export type BulkCreateSchedulesRequest = Array<BulkCourseScheduleItem>;

export interface UpdateScheduleRequest {
  path: {
    schedule_id: number;
  };
  body: CourseScheduleUpdateRequest;
}

export interface DeleteScheduleRequest {
  schedule_id: number;
}

export type CreateStudentRequest = CreateStudentBody;

export interface GetStudentsRequest {
  organization_id: number;
  department_id?: number | null;
  level?: number | null;
  search?: string | null;
  limit?: number;
  offset?: number;
}

export type BulkCreateStudentsRequest = Array<BulkStudentItem>;

export type CreateLecturerRequest = CreateLecturerBody;

export interface GetLecturersRequest {
  organization_id: number;
  department_id?: number | null;
  faculty_id?: number | null;
  search?: string | null;
  limit?: number;
  offset?: number;
}

export type BulkCreateLecturersRequest = Array<BulkLecturerItem>;

export interface GetMemberDetailRequest {
  member_id: number;
}

export interface UpdateMemberRequest {
  path: {
    member_id: number;
  };
  body?: UpdateMemberBody;
}

export interface ResetMemberPasswordRequest {
  member_id: number;
}

export interface DeactivateMemberRequest {
  member_id: number;
}

export interface ReactivateMemberRequest {
  member_id: number;
}

export type CreateCourseOverrideRequest = CourseOverrideCreateRequest;

export interface GetCourseOverridesRequest {
  course_id?: number | null;
  member_id?: number | null;
  limit?: number;
  offset?: number;
}

export interface DeleteCourseOverrideRequest {
  override_id: number;
}

export interface GetSessionsRequest {
  organization_id: number;
  course_id?: number | null;
  faculty_id?: number | null;
  department_id?: number | null;
  level?: number | null;
  semester?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  utc_offset?: number;
  limit?: number;
  offset?: number;
}

export interface GetSessionDetailRequest {
  path: {
    lecture_session_id: number;
  };
  query?: {
    utc_offset?: number;
  };
}

export interface GetAnomaliesRequest {
  organization_id: number;
  start_date?: string | null;
  end_date?: string | null;
  limit?: number;
  offset?: number;
}

export interface GetReportsRequest {
  organization_id: number;
  schedule_id?: number | null;
  course_id?: number | null;
  member_id?: number | null;
  reason?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  utc_offset?: number;
  limit?: number;
  offset?: number;
}

export interface GetAdminLectureAttendanceHistoryRequest {
  organization_id: number;
  course_id?: number | null;
  member_id?: number | null;
  faculty_id?: number | null;
  department_id?: number | null;
  level?: number | null;
  semester?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  role?: string | null;
  utc_offset?: number;
  limit?: number;
  offset?: number;
}

export interface GetAdminLectureAttendanceHistoryExportRequest {
  organization_id: number;
  course_id?: number | null;
  member_id?: number | null;
  faculty_id?: number | null;
  department_id?: number | null;
  level?: number | null;
  semester?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  role?: string | null;
  utc_offset?: number;
  limit?: number;
  offset?: number;
}

export type ExportCsvHeadersRequest = void;

export interface ExportTodayRequest {
  organization_id: number;
  course_id?: number | null;
  member_id?: number | null;
  faculty_id?: number | null;
  department_id?: number | null;
  level?: number | null;
  semester?: string | null;
  status?: string | null;
  role?: string | null;
  utc_offset?: number;
  limit?: number;
  offset?: number;
}

export interface ExportThisWeekRequest {
  organization_id: number;
  course_id?: number | null;
  member_id?: number | null;
  faculty_id?: number | null;
  department_id?: number | null;
  level?: number | null;
  semester?: string | null;
  status?: string | null;
  role?: string | null;
  utc_offset?: number;
  limit?: number;
  offset?: number;
}

export interface ExportThisMonthRequest {
  organization_id: number;
  course_id?: number | null;
  member_id?: number | null;
  faculty_id?: number | null;
  department_id?: number | null;
  level?: number | null;
  semester?: string | null;
  status?: string | null;
  role?: string | null;
  utc_offset?: number;
  limit?: number;
  offset?: number;
}
