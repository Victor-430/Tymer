export interface ApiResponse<T> {
  responseCode: string;
  responseMessage: string;
  data?: T | null;
}

export interface HTTPValidationError<TInput = null> {
  detail?: Array<ValidationError<TInput>>;
}

export interface ValidationError<TInput = null> {
  loc: Array<string | number>;
  msg: string;
  type: string;
  input?: TInput;
}

export interface PaginationMetadata {
  total_count: number;
  limit: number;
  offset: number;
}

export interface BulkOperationData<TFailure> {
  success_count: number;
  failure_count: number;
  failures: Array<TFailure>;
}

export type PatrolSessionStatus = "IN_PROGRESS" | "INCOMPLETE" | "COMPLETED" | "MISSED" | "ABANDONED";

export type PatrolInstanceStatus = PatrolSessionStatus | "NOT_STARTED";

export type TaskFrequency = "DAILY" | "WEEKLY" | "CUSTOM";

export type TaskSessionStatus = "PENDING" | "IN_PROGRESS" | "AWAITING_TASK_EVIDENCE" | "AWAITING_FACIAL_VERIFICATION" | "COMPLETED" | "NOT_COMPLETED";

export type VisitorStatus = "CHECKED_IN" | "CHECKED_OUT";

export interface BulkNamedFailure {
  index: number;
  name: string;
  reason: string;
}

export interface BulkLocationFailure {
  index: number;
  location_code: string;
  reason: string;
}

export interface BulkInstanceFailure {
  index: number;
  instance_name: string;
  reason: string;
}

export interface AdminLoginEmployee {
  employee_id: number;
  email: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  organization_id: number;
  role: string;
  active_modules: Array<string>;
  organization_name: string;
  organization_code: string;
}

export interface AdminLoginData {
  access_token: string;
  token_type: "bearer";
  employee: AdminLoginEmployee;
}

export interface SignupModule {
  ModuleID: number;
  ModuleName: string;
  Description: string;
}

export interface OrganizationSignupData {
  organization_code: string;
  organization_name: string;
  modules: Array<string>;
  trial_expires_at: string;
}

export interface OrganizationSubscription {
  SubscriptionID: number;
  OrganizationID: number;
  ModuleID: number;
  ModuleName: string;
  Description: string;
  IsActive: boolean;
  StartsAt: string;
  ExpiresAt: string | null;
  CreatedAt: string;
}

export interface UpdateMyOrganizationLogoData {
  organization_id: number;
  logo_s3_path: string;
}

export interface OrganizationProfile {
  OrganizationID: number;
  OrganizationCode: string;
  OrganizationName: string;
  SignInTime: string;
  SignOutTime: string;
  IsActive: boolean;
  LogoS3Path: string | null;
  Timezone: string;
}

export interface UpdateMyOrganizationProfileData {
  organization_id: number;
}

export interface ResetEmployeeCredentialsData {
  employee_id: number;
  is_locked: boolean;
  failed_login_attempts: number;
  updated_at: string;
}

export interface EmployeeDetail {
  employee_id: number;
  employee_name: string;
  email: string;
  reference_face_image_s3_path: string | null;
  organization_id: number;
  is_active: boolean;
}

export interface CreateEmployeeData {
  employee_id: number;
  locations_granted: number;
}

export interface EmployeeSummary {
  EmployeeID: number;
  EmployeeCode: string;
  FirstName: string;
  LastName: string;
  Email: string;
  IsActive: boolean;
  Role: string;
  OrganizationID?: number;
}

export interface EmployeeListData {
  total_records: number;
  employees: Array<EmployeeSummary>;
  limit: number;
  offset: number;
}

export interface UpdateEmployeeData {
  EmployeeID: number;
  EmployeeCode: string;
  FirstName: string;
  LastName: string;
  Email: string;
  ReferenceFaceImageS3Path: string | null;
  IsActive: boolean;
  Role: string;
  OrganizationID: number;
}

export interface EmployeeIdentity {
  employee_id: number;
  employee_code: string;
  name: string;
}

export interface EmployeeLocationAccess {
  EmployeeCode: string;
  employeename: string;
  Email: string;
  LocationName: string;
  LocationCode: string;
  AccessType: string;
  ValidFrom: string;
  ValidUntil: string | null;
  IsActive: boolean;
}

export interface EmployeeAccessListData {
  total_records: number;
  employee_access: Array<EmployeeLocationAccess>;
  limit: number;
  offset: number;
}

export interface GrantLocationAccessData {
  employee_id: number;
  employee_name: string;
  locations_granted: number;
  total_locations_requested: number;
  access_type: string;
}

export interface RevokeLocationAccessData {
  employee_id: number;
  employee_name: string;
  locations_revoked: number;
  total_locations_requested: number;
}

export interface CreateLocationData {
  location_name: string;
  location_code: string;
  organization_id: number;
}

export interface UpdateLocationData {
  location_id: number;
}

export interface OrganizationLocation {
  LocationID: number;
  LocationCode: string;
  LocationName: string;
  Address: string;
  IsActive: boolean;
  Latitude: string | null;
  Longitude: string | null;
}

export interface LocationListData {
  total_records: number;
  locations: Array<OrganizationLocation>;
  limit: number;
  offset: number;
}

export interface CreateNfcTagData {
  tag_id: string;
  tag_uid: string;
  organization_id: number;
}

export interface NfcTag {
  TagID: string;
  TagUID: string;
  OrganizationID: number;
  LocationID: number | null;
  LocationName: string | null;
  Address: string | null;
  IsActive: boolean;
}

export interface NfcTagListData {
  total_records: number;
  nfc_tags: Array<NfcTag>;
  limit: number;
  offset: number;
}

export interface UpdateNfcTagData {
  TagID: string;
  TagUID: string;
  LocationID: number | null;
  IsActive: boolean;
  LastScannedAt: string | null;
  CreatedAt: string;
  LocationName: string | null;
  LocationCode: string | null;
  Address: string | null;
}

export interface LinkNfcTagToLocationData {
  tag_id: string;
  location_code: string;
  organization_id: number;
}

export interface AttendanceRecord {
  LogID: number;
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  NFCScannedAt: string;
  FaceVerifiedAt: string | null;
  VerificationStatus: string;
  ConfidenceScore: string | null;
  VerificationMethod: string;
  AttendanceType: string;
  LocationName: string;
  LocationCode: string;
}

export interface AttendanceHistoryFilters {
  start_date: string | null;
  end_date: string | null;
  attendance_type: string | null;
  limit: number;
  utc_offset: number;
}

export interface AttendanceHistoryData extends PaginationMetadata {
  attendance_history: Array<AttendanceRecord>;
  total_records: number;
  filters: AttendanceHistoryFilters;
}

export interface AttendanceExportRecord {
  LogID: number;
  AttendanceType: string;
  VerificationStatus: string;
  PunctualityStatus: string | null;
  EmployeeID: number;
  EmployeeCode: string;
  employee_name: string;
  employee_email: string;
  LocationID: number;
  LocationName: string;
  LocationCode: string;
  location_address: string;
  attendance_date: string;
  attendance_time: string;
}

export interface AttendanceExportPagination {
  current_page: number;
  total_pages: number;
  total_records: number;
  records_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AttendanceExportFilters {
  organization_id: number;
  start_date: string;
  end_date: string;
  employee_code: string | null;
  location_code: string | null;
  punctuality_status: string | null;
  sort_by: string;
  sort_order: string;
}

export interface AttendanceExportData {
  attendance_records: Array<AttendanceExportRecord>;
  pagination: AttendanceExportPagination;
  filters: AttendanceExportFilters;
}

export interface ExportHeadersData {
  field_names: Array<string>;
  friendly_headers: Array<string>;
}

export interface EmployeePunctualityLog {
  EmployeeID: number;
  LocationID: number;
  LocationName: string;
  TimeStamp: string;
}

export interface EmployeePunctualityData {
  count: number;
  logs: Array<EmployeePunctualityLog>;
}

export interface EmployeeNoRecordCountData {
  no_record_days: number;
}

export interface StaffPunctualityLog {
  firstname: string;
  lastname: string;
  email: string;
  TimeStamp: string;
  attendancetype: string;
}

export interface StaffPunctualityData {
  count: number;
  logs: Array<StaffPunctualityLog>;
}

export interface OrgAbsentStaffLog {
  firstname: string;
  lastname: string;
  email: string;
}

export interface OrgAbsentStaffData {
  count: number;
  logs: Array<OrgAbsentStaffLog>;
}

export interface DailyAverageCheckin {
  CheckDate: string;
  AvgCheckInTime: string | null;
}

export interface BulkCreatePatrolsCreatedPatrol {
  index: number;
  patrol_id: number;
  patrol_code: string;
}

export interface BulkCreatePatrolsData extends BulkOperationData<BulkNamedFailure> {
  created: Array<BulkCreatePatrolsCreatedPatrol>;
}

export interface CreateCheckpointData {
  checkpoint_id: number;
}

export interface Checkpoint {
  CheckpointID: number;
  CheckpointName: string;
  Description: string | null;
  TagUID: string;
  IsActive: boolean;
  CreatedAt: string;
  LocationID: number;
  LocationName: string;
  LocationCode: string;
  Address: string;
  PatrolCount: number;
}

export interface CheckpointListData {
  total: number;
  checkpoints: Array<Checkpoint>;
}

export interface VerifyNfcTagTagInfo {
  TagID: string;
  TagUID: string;
  IsActive: boolean;
  CreatedAt: string;
  LastScannedAt: string | null;
  LocationID: number | null;
  LocationName: string | null;
  LocationCode: string | null;
  Address: string | null;
  OrganizationID: number;
  OrganizationName: string;
  OrganizationCode: string;
  CheckpointCount: number;
}

export interface VerifyNfcTagData {
  is_onboarded: boolean;
  tag_info?: VerifyNfcTagTagInfo;
}

export interface UpdateCheckpointData {
  CheckpointID: number;
  CheckpointName: string;
  Description: string | null;
  TagUID: string;
  IsActive: boolean;
  CreatedAt: string;
  LocationID: number;
}

export interface CreatePatrolCheckpoint {
  CheckpointID: number;
  CheckpointName: string;
  CheckpointOrder: number;
  IsOptional: boolean;
}

export interface CreatePatrolData {
  patrol_id: number;
  checkpoint_count: number;
  checkpoints: Array<CreatePatrolCheckpoint>;
}

export interface PatrolSummary {
  PatrolID: number;
  PatrolName: string;
  PatrolCode: string;
  Description: string | null;
  CheckpointCount: number;
  IsActive: boolean;
  CreatedAt: string;
  InstanceCount: number;
}

export interface PatrolListData {
  total: number;
  patrols: Array<PatrolSummary>;
}

export interface PatrolDetailCheckpoint {
  CheckpointID: number;
  CheckpointName: string;
  TagUID: string;
  LocationID: number;
  LocationName: string;
  CheckpointOrder: number;
  IsOptional: boolean;
}

export interface PatrolDetail {
  PatrolID: number;
  PatrolName: string;
  PatrolCode: string;
  Description: string | null;
  CheckpointCount: number;
  OrganizationID: number;
  IsActive: boolean;
  checkpoints: Array<PatrolDetailCheckpoint>;
}

export interface UpdatePatrolCheckpoint {
  CheckpointID: number;
  CheckpointOrder: number;
}

export interface UpdatePatrolData {
  PatrolID: number;
  PatrolName: string;
  checkpoints: Array<UpdatePatrolCheckpoint>;
}

export interface DeletePatrolData {
  patrol_id: number;
}

export interface CreateInstanceData {
  instance_id: number;
}

export interface GetInstanceData {
  InstanceID: number;
  InstanceName: string;
  StartTime: string;
  EndTime: string;
  Description: string | null;
  IsActive: boolean;
  PatrolID: number;
  PatrolName: string;
  PatrolCode: string;
  CheckpointCount: number;
  OrganizationID: number;
}

export interface PatrolInstance {
  InstanceID: number;
  InstanceName: string;
  StartTime: string;
  EndTime: string;
  Description: string | null;
  IsActive: boolean;
  CreatedAt: string;
  PatrolID: number;
  PatrolName: string;
  CheckpointCount: number;
  TodaySessionID: number | null;
  TodayStatus: PatrolSessionStatus | null;
  TodayCompletedCheckpoints: number | null;
  TodayStartedAt: string | null;
  CurrentStatus: PatrolInstanceStatus;
}

export interface PatrolInstanceListData {
  total: number;
  instances: Array<PatrolInstance>;
}

export interface PatrolSession {
  SessionID: number;
  PatrolDate: string;
  StartedAt: string | null;
  CompletedAt: string | null;
  Status: PatrolSessionStatus;
  TotalCheckpoints: number;
  CompletedCheckpoints: number;
  CompletionPercentage: string;
  InstanceID: number;
  InstanceName: string;
  ScheduledStartTime?: string;
  ScheduledEndTime?: string;
  PatrolID?: number;
  PatrolName?: string;
  PatrolCode?: string;
  EmployeeID?: number | null;
  EmployeeCode?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  DurationMinutes: string | null;
  TimelinessStatus: string | null;
}

export interface PatrolSessionListData extends PaginationMetadata {
  total: number;
  sessions: Array<PatrolSession>;
}

export interface PatrolProgress {
  completed: number;
  total: number;
  percentage: number;
}

export interface PatrolSessionDetailSession {
  session_id: number;
  patrol_date: string;
  started_at: string | null;
  completed_at: string | null;
  status: PatrolSessionStatus;
  progress: PatrolProgress;
}

export interface PatrolSessionDetailInstance {
  instance_name: string;
  scheduled_start: string;
  scheduled_end: string;
}

export interface PatrolSessionDetailPatrol {
  patrol_id: number;
  patrol_name: string;
  patrol_code: string;
}

export interface PatrolSessionDetailEmployee {
  employee_code: string;
  name: string;
}

export interface PatrolSessionDetailCheckpoint {
  checkpoint_id: number;
  checkpoint_name: string;
  tag_uid: string;
  location_name: string;
  address: string;
  expected_order: number;
  is_optional: boolean;
  status: string;
  scanned_at: string | null;
  actual_order: number | null;
}

export interface PatrolSessionDetailSummary {
  total: number;
  completed: number;
  pending: number;
}

export interface PatrolSessionDetail {
  session: PatrolSessionDetailSession;
  instance: PatrolSessionDetailInstance;
  patrol: PatrolSessionDetailPatrol;
  employee: PatrolSessionDetailEmployee | null;
  checkpoints: Array<PatrolSessionDetailCheckpoint>;
  summary: PatrolSessionDetailSummary;
}

export interface PatrolDashboardOverviewEmployees {
  TotalEmployees: number;
  ActiveEmployees: number;
}

export interface PatrolDashboardOverviewPatrols {
  TotalPatrols: number;
  ActivePatrols: number;
}

export interface PatrolDashboardOverviewToday {
  TodaySessions: number;
  Completed: number | null;
  InProgress: number | null;
  AvgCompletion: number | string | null;
}

export interface PatrolDashboardOverviewAlerts {
  overdue_instances: number;
}

export interface PatrolDashboardOverviewData {
  employees: PatrolDashboardOverviewEmployees;
  patrols: PatrolDashboardOverviewPatrols;
  today: PatrolDashboardOverviewToday;
  alerts: PatrolDashboardOverviewAlerts;
  timestamp: string;
}

export interface OrganizationPatrolListPatrolInstance {
  instance_id: number;
  instance_name: string;
  start_time: string;
  end_time: string;
  current_status: PatrolInstanceStatus;
  today_session_id?: number | null;
  today_completed?: number | null;
}

export interface OrganizationPatrolListPatrol {
  patrol_id: number;
  patrol_name: string;
  patrol_code: string;
  description?: string | null;
  checkpoint_count?: number;
  is_active?: boolean;
  instance_count: number;
  instances: Array<OrganizationPatrolListPatrolInstance>;
}

export interface OrganizationPatrolListData {
  total_patrols: number;
  patrols: Array<OrganizationPatrolListPatrol>;
}

export interface GetPatrolDetailsInstance {
  InstanceID: number;
  InstanceName: string;
  StartTime: string;
  EndTime: string;
  CurrentStatus: PatrolInstanceStatus;
}

export interface GetPatrolDetailsData {
  PatrolID: number;
  PatrolName: string;
  PatrolCode: string;
  CheckpointCount: number;
  OrganizationID: number;
  IsActive: boolean;
  instances: Array<GetPatrolDetailsInstance>;
  checkpoints: Array<PatrolDetailCheckpoint>;
}

export interface PatrolHistoryRecordInstance {
  instance_id: number;
  instance_name: string;
  scheduled_start: string;
  scheduled_end: string;
}

export interface PatrolHistoryRecord {
  session_id: number;
  patrol_date: string;
  started_at: string | null;
  completed_at: string | null;
  status: PatrolSessionStatus;
  progress: PatrolProgress;
  instance: PatrolHistoryRecordInstance;
  patrol: PatrolSessionDetailPatrol;
  employee: EmployeeIdentity | null;
  duration_minutes: string;
  timeliness: string | null;
}

export interface PatrolHistoryData extends PaginationMetadata {
  total_records: number;
  history: Array<PatrolHistoryRecord>;
}

export interface PatrolStatisticsData {
  TotalSessions: number;
  CompletedSessions: number;
  InProgressSessions: number;
  MissedSessions: number;
  AvgCompletionRate: string;
  AvgDurationMinutes: string;
  UniqueEmployees: number;
  UniqueInstances: number;
  TodaySessions: number;
  TodayCompleted: number;
  CompletionRate: number;
}

export interface PatrolReport {
  ReportID: number;
  IncidentType: string;
  ReportText: string;
  ImageS3URL: string | null;
  VideoS3URL: string | null;
  CreatedAt: string;
  SessionID: number;
  PatrolDate: string;
  EmployeeID: number;
  EmployeeCode: string;
  FirstName: string;
  LastName: string;
  PatrolName: string;
  CheckpointName: string | null;
  LocationName: string | null;
}

export interface PatrolReportListData extends PaginationMetadata {
  total_reports: number;
  reports: Array<PatrolReport>;
}

export interface PatrolHistoryExportSummaryFiltersApplied {
  start_date: string | null;
  end_date: string | null;
  employee_id?: number | null;
  patrol_id?: number | null;
  instance_id?: number | null;
  location_id?: number | null;
  status?: string | null;
  min_completion?: number | null;
  max_completion?: number | null;
}

export interface PatrolHistoryExportSummaryStatistics {
  completed_count: number;
  in_progress_count: number;
  abandoned_count: number;
  average_completion_percentage: number;
  average_duration_minutes: number | string | null;
  on_time_starts: number;
  on_time_completions: number;
  incomplete_count: number;
}

export interface PatrolHistoryExportSummary {
  total_records: number;
  returned_records: number;
  filters_applied: PatrolHistoryExportSummaryFiltersApplied;
  statistics?: PatrolHistoryExportSummaryStatistics;
}

export interface PatrolHistoryExportRecord {
  session_id: number;
  patrol_date: string;
  started_at?: string | null;
  completed_at?: string | null;
  status: PatrolSessionStatus;
  total_checkpoints?: number;
  completed_checkpoints?: number;
  completion_percentage?: number;
  duration_minutes?: string | null;
  scheduled_start?: string;
  scheduled_end?: string;
  started_on_time?: boolean;
  completed_on_time?: boolean;
  patrol_id: number;
  patrol_name?: string;
  patrol_code?: string;
  instance_id: number;
  instance_name?: string;
  employee_id?: number | null;
  employee_code?: string | null;
  employee_name?: string | null;
  employee_email?: string | null;
  organization_id?: number;
}

export interface PatrolHistoryExportData {
  summary: PatrolHistoryExportSummary;
  history: Array<PatrolHistoryExportRecord>;
}

export interface AttendanceSummarySummary {
  TotalDaysLogged: number;
  TotalCheckIns: number;
  TotalCheckOuts: number;
  FullDaysPresent: number;
  PartialDays: number;
  AttendanceRate: number;
}

export interface AttendanceSummaryData {
  summary: AttendanceSummarySummary;
  timezone_offset: number;
}

export interface AttendanceLogsRecord {
  LogID: number;
  EmployeeID: number;
  FirstName?: string;
  LastName?: string;
  NFCScannedAt: string;
  FaceVerifiedAt: string | null;
  VerificationStatus: string;
  ConfidenceScore: string | null;
  VerificationMethod: string;
  LocationName?: string;
  LocationCode?: string;
  AttendanceType: string;
}

export interface AttendanceLogsFilters {
  start_date: string | null;
  end_date: string | null;
  attendance_type: string | null;
  limit: number;
  timezone_offset: number;
}

export interface AttendanceLogsData extends PaginationMetadata {
  attendance_logs: Array<AttendanceLogsRecord>;
  total_records: number;
  filters: AttendanceLogsFilters;
}

export interface DashGetCheckpointsCheckpoint {
  CheckpointID: number;
  CheckpointName: string;
  TagUID: string;
  IsActive: boolean;
  LocationID: number;
  LocationName: string;
  PatrolCount: number;
}

export interface DashGetCheckpointsData {
  total: number;
  checkpoints: Array<DashGetCheckpointsCheckpoint>;
}

export interface DashGetPatrolsPatrol {
  PatrolID: number;
  PatrolName: string;
  PatrolCode: string;
  CheckpointCount: number;
  IsActive: boolean;
  InstanceCount: number;
}

export interface DashGetPatrolsData {
  total: number;
  patrols: Array<DashGetPatrolsPatrol>;
}

export interface DashGetPatrolInstancesInstance {
  InstanceID: number;
  InstanceName: string;
  StartTime: string;
  EndTime: string;
  Description: string | null;
  IsActive: boolean;
  PatrolID: number;
  PatrolName: string;
  CheckpointCount: number;
  TodaySessionID?: number | null;
  TodayStatus?: PatrolSessionStatus | null;
  TodayCompletedCheckpoints?: number | null;
  TodayStartedAt?: string | null;
  CurrentStatus?: PatrolInstanceStatus;
}

export interface DashGetPatrolInstancesData {
  total: number;
  instances: Array<DashGetPatrolInstancesInstance>;
}

export interface AdminCreateTaskData {
  task_code: string;
  task_id: number;
}

export interface TaskSummary {
  task_code: string;
  Name: string;
  Description: string | null;
  task_level_evidence: boolean;
  subtask_level_evidence: boolean;
  organization_id: number;
  frequency: TaskFrequency;
  days_of_week: Array<number> | null;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  subtask_count: number;
}

export interface TaskListData {
  total: number;
  tasks: Array<TaskSummary>;
}

export interface Subtask {
  subtask_id: number;
  Name: string;
  task_id: number;
  created_at: string;
}

export interface TaskDetail {
  task_id: number;
  task_code: string;
  Name: string;
  Description: string | null;
  task_level_evidence: boolean;
  subtask_level_evidence: boolean;
  organization_id: number;
  frequency: TaskFrequency;
  days_of_week: Array<number> | null;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  subtasks: Array<Subtask>;
}

export interface AdminCreateSubtaskData {
  subtask_id: number;
}

export interface SubtaskListData {
  total: number;
  subtasks: Array<Subtask>;
}

export interface TaskSession {
  session_id: number;
  task_code: string;
  employee_id: number;
  Status: TaskSessionStatus;
  completed_subtask_count: number;
  total_subtask_count: number;
  session_date: string;
  created_at: string;
  task_name: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  organization_id: number;
}

export interface TaskSessionListData {
  total: number;
  sessions: Array<TaskSession>;
}

export interface TaskDashboardOverviewDateRange {
  start: string;
  end: string;
}

export interface TaskDashboardOverviewData {
  total_tasks: number;
  active_tasks: number;
  total_sessions: number;
  completed_sessions: number;
  in_progress_sessions: number;
  failed_sessions: number;
  completion_rate: number;
  date_range: TaskDashboardOverviewDateRange;
}

export interface TaskAnalyticsDailyTrend {
  session_date: string;
  total_sessions: number;
  completed_sessions: number;
}

export interface TaskAnalyticsTodayTask {
  Id: number;
  TaskName: string;
  StartTime: string;
  EndTime: string;
  CompletedSessions: number;
  CompletedBy: string;
  Status: string;
}

export interface TaskAnalyticsData {
  daily_trends: Array<TaskAnalyticsDailyTrend>;
  tasks_today: Array<TaskAnalyticsTodayTask>;
  date_range: TaskDashboardOverviewDateRange;
}

export interface TaskCompletionRatesCompletionRate {
  SessionDate: string;
  total_sessions: number;
  completed_sessions: number;
  completion_rate: number;
}

export interface TaskCompletionRatesData {
  completion_rates: Array<TaskCompletionRatesCompletionRate>;
  date_range: TaskDashboardOverviewDateRange;
}

export interface TaskPeakActivityPeakHour {
  hour: number;
  session_count: number;
}

export interface TaskPeakActivityPeakDay {
  day_name: string;
  day_number: number;
  session_count: number;
}

export interface TaskPeakActivityData {
  peak_hours: Array<TaskPeakActivityPeakHour>;
  peak_days: Array<TaskPeakActivityPeakDay>;
  date_range: TaskDashboardOverviewDateRange;
}

export interface TaskSessionDurationTaskDuration {
  task_name: string;
  total_sessions: number;
  avg_duration_minutes: string;
  min_duration_minutes: string;
  max_duration_minutes: string;
}

export interface TaskSessionDurationOverallStats {
  total_completed_sessions: number;
  overall_avg_duration: string;
  overall_min_duration: string;
  overall_max_duration: string;
}

export interface TaskSessionDurationData {
  task_durations: Array<TaskSessionDurationTaskDuration>;
  overall_stats: TaskSessionDurationOverallStats;
  date_range: TaskDashboardOverviewDateRange;
}

export interface TaskEvidence {
  log_id: number;
  session_id: number;
  employee_id: number;
  created_at: string;
  evidence_data: string;
  task_code: string;
  task_name: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  organization_id: number;
}

export interface TaskEvidenceListData {
  total: number;
  evidences: Array<TaskEvidence>;
}

export interface TaskHistoryExportRecord {
  session_id: number;
  task_code: string;
  task_name: string;
  employee_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  Status: TaskSessionStatus;
  completed_subtask_count: number;
  total_subtask_count: number;
  completion_pct: number;
  created_at: string;
  organization_id: number;
}

export interface TaskHistoryExportData {
  total: number;
  records: Array<TaskHistoryExportRecord>;
}

export interface AdminCsvHeadersData {
  headers: Array<string>;
}

export interface VisitorSummary {
  VisitID: number;
  FullName: string;
  PhoneNumber: string;
  Email: string | null;
  PurposeOfVisit: string;
  HostName: string;
  HostUnitNumber: string | null;
  HostDepartment: string | null;
  Company: string | null;
  PhotoS3URL: string | null;
  photo_url: string | null;
  Status: VisitorStatus;
  CheckedInAt: string;
  CheckedOutAt: string | null;
  IsFlagged: boolean;
  FlagReason: string | null;
  FlaggedAt: string | null;
  LocationName: string;
  LocationCode: string;
  OrganizationName: string;
}

export interface VisitorListData {
  total: number;
  limit: number;
  offset: number;
  visitors: Array<VisitorSummary>;
}

export interface VisitorTokenData {
  location_id: number;
  visitor_token: string;
  qr_value: string;
}

export interface GetTodaySummaryData {
  total_today: number;
  currently_inside: number;
  checked_out_today: number;
}

export interface VisitorDetail {
  VisitID: number;
  TokenID: number;
  LocationID: number;
  OrganizationID: number;
  FullName: string;
  PhoneNumber: string;
  Email: string | null;
  PurposeOfVisit: string;
  HostName: string;
  HostUnitNumber: string | null;
  HostDepartment: string | null;
  Company: string | null;
  PhotoS3URL: string | null;
  Status: VisitorStatus;
  CheckedInAt: string;
  CheckedOutAt: string | null;
  IsFlagged: boolean;
  FlagReason: string | null;
  FlaggedAt: string | null;
  FlaggedBy: number | null;
  CreatedAt: string;
  photo_url: string | null;
}

export type AdminLoginResponse = ApiResponse<AdminLoginData>;

export type GetSignupModulesResponse = ApiResponse<Array<SignupModule>>;

export type SignupOrganizationResponse = ApiResponse<OrganizationSignupData>;

export type GetMyOrganizationSubscriptionsResponse = ApiResponse<Array<OrganizationSubscription>>;

export type UpdateMyOrganizationLogoResponse = ApiResponse<UpdateMyOrganizationLogoData>;

export type GetMyOrganizationProfileResponse = ApiResponse<OrganizationProfile>;

export type UpdateMyOrganizationProfileResponse = ApiResponse<UpdateMyOrganizationProfileData>;

export type ResetEmployeeCredentialsResponse = ApiResponse<ResetEmployeeCredentialsData>;

export type GetEmployeeDetailResponse = ApiResponse<EmployeeDetail>;

export type CreateEmployeeResponse = ApiResponse<CreateEmployeeData>;

export type ViewEmployeesResponse = ApiResponse<EmployeeListData>;

export type UpdateEmployeeResponse = ApiResponse<UpdateEmployeeData>;

export type ReactivateEmployeeResponse = ApiResponse<EmployeeIdentity>;

export type DeactivateEmployeeResponse = ApiResponse<EmployeeIdentity>;

export type ViewEmployeeAccessResponse = ApiResponse<EmployeeAccessListData>;

export type GrantLocationAccessResponse = ApiResponse<GrantLocationAccessData>;

export type RevokeLocationAccessResponse = ApiResponse<RevokeLocationAccessData>;

export type CreateLocationResponse = ApiResponse<CreateLocationData>;

export type UpdateLocationResponse = ApiResponse<UpdateLocationData>;

export type ViewLocationsResponse = ApiResponse<LocationListData>;

export type DeleteLocationResponse = ApiResponse<null>;

export type BulkCreateLocationsResponse = ApiResponse<BulkOperationData<BulkLocationFailure>>;

export type CreateNfcTagResponse = ApiResponse<CreateNfcTagData>;

export type ViewNfcTagsResponse = ApiResponse<NfcTagListData>;

export type UpdateNfcTagResponse = ApiResponse<UpdateNfcTagData>;

export type DeleteNfcTagResponse = ApiResponse<null>;

export type GenerateQrCodeResponse = Blob | ApiResponse<null>;

export type LinkNfcTagToLocationResponse = ApiResponse<LinkNfcTagToLocationData>;

export type GetAdminAttendanceHistoryResponse = ApiResponse<AttendanceHistoryData>;

export type GetAdminAttendanceHistoryExportResponse = ApiResponse<AttendanceExportData>;

export type GetAttendanceCsvHeadersResponse = ApiResponse<ExportHeadersData>;

export type GetTodayAttendanceResponse = ApiResponse<AttendanceExportData>;

export type GetWeekAttendanceResponse = ApiResponse<AttendanceExportData>;

export type GetMonthAttendanceResponse = ApiResponse<AttendanceExportData>;

export type EmployeeEarlyLogsResponse = ApiResponse<EmployeePunctualityData>;

export type EmployeeLateLogsResponse = ApiResponse<EmployeePunctualityData>;

export type EmployeeNoRecordCountResponse = ApiResponse<EmployeeNoRecordCountData>;

export type OrgEarlyStaffByDateResponse = ApiResponse<StaffPunctualityData>;

export type OrgLateStaffByDateResponse = ApiResponse<StaffPunctualityData>;

export type OrgAbsentStaffResponse = ApiResponse<OrgAbsentStaffData>;

export type OrgDailyAvgCheckinResponse = ApiResponse<Array<DailyAverageCheckin>>;

export type BulkCreatePatrolsResponse = ApiResponse<BulkCreatePatrolsData>;

export type BulkCreateCheckpointsResponse = ApiResponse<BulkOperationData<BulkNamedFailure>>;

export type BulkCreateEmployeesResponse<TFailure> = ApiResponse<BulkOperationData<TFailure>>;

export type CreateCheckpointResponse = ApiResponse<CreateCheckpointData>;

export type GetCheckpointsResponse = ApiResponse<CheckpointListData>;

export type VerifyNfcTagResponse = ApiResponse<VerifyNfcTagData>;

export type UpdateCheckpointResponse = ApiResponse<UpdateCheckpointData>;

export type DeleteCheckpointResponse = ApiResponse<null>;

export type CreatePatrolResponse = ApiResponse<CreatePatrolData>;

export type GetPatrolsResponse = ApiResponse<PatrolListData>;

export type GetPatrolAdminResponse = ApiResponse<PatrolDetail>;

export type UpdatePatrolResponse = ApiResponse<UpdatePatrolData>;

export type DeletePatrolResponse = ApiResponse<DeletePatrolData>;

export type CreateInstanceResponse = ApiResponse<CreateInstanceData>;

export type BulkCreateInstancesResponse = ApiResponse<BulkOperationData<BulkInstanceFailure>>;

export type GetInstanceResponse = ApiResponse<GetInstanceData>;

export type UpdateInstanceResponse = ApiResponse<null>;

export type DeleteInstanceResponse = ApiResponse<null>;

export type GetPatrolInstancesResponse = ApiResponse<PatrolInstanceListData>;

export type GetAllSessionsResponse = ApiResponse<PatrolSessionListData>;

export type GetSessionAdminResponse = ApiResponse<PatrolSessionDetail>;

export type GetDashboardOverviewResponse = ApiResponse<PatrolDashboardOverviewData>;

export type GetOrganizationPatrolsResponse = ApiResponse<OrganizationPatrolListData>;

export type GetPatrolDetailsResponse = ApiResponse<GetPatrolDetailsData>;

export type GetPatrolHistoryResponse = ApiResponse<PatrolHistoryData>;

export type GetPatrolStatisticsResponse = ApiResponse<PatrolStatisticsData>;

export type GetPatrolReportsResponse = ApiResponse<PatrolReportListData>;

export type GetPatrolHistoryExportResponse = ApiResponse<PatrolHistoryExportData>;

export type GetCsvHeadersResponse = ApiResponse<ExportHeadersData>;

export type GetTodayHistoryResponse = ApiResponse<PatrolHistoryExportData>;

export type GetThisWeekHistoryResponse = ApiResponse<PatrolHistoryExportData>;

export type GetThisMonthHistoryResponse = ApiResponse<PatrolHistoryExportData>;

export type GetAttendanceSummaryResponse = ApiResponse<AttendanceSummaryData>;

export type GetAttendanceLogsResponse = ApiResponse<AttendanceLogsData>;

export type DashGetCheckpointsResponse = ApiResponse<DashGetCheckpointsData>;

export type DashGetPatrolsResponse = ApiResponse<DashGetPatrolsData>;

export type DashGetPatrolInstancesResponse = ApiResponse<DashGetPatrolInstancesData>;

export type AdminCreateTaskResponse = ApiResponse<AdminCreateTaskData>;

export type AdminBulkCreateTasksResponse = ApiResponse<BulkOperationData<BulkNamedFailure>>;

export type AdminListTasksResponse = ApiResponse<TaskListData>;

export type AdminTaskDetailsResponse = ApiResponse<TaskDetail>;

export type AdminUpdateTaskResponse = ApiResponse<null>;

export type AdminDeleteTaskResponse = ApiResponse<null>;

export type AdminCreateSubtaskResponse = ApiResponse<AdminCreateSubtaskData>;

export type AdminBulkCreateSubtasksResponse<TFailure> = ApiResponse<BulkOperationData<TFailure>>;

export type AdminListSubtasksResponse = ApiResponse<SubtaskListData>;

export type AdminUpdateSubtaskResponse = ApiResponse<null>;

export type AdminDeleteSubtaskResponse = ApiResponse<null>;

export type AdminAllSessionsResponse = ApiResponse<TaskSessionListData>;

export type AdminDashboardOverviewResponse = ApiResponse<TaskDashboardOverviewData>;

export type AdminTaskAnalyticsResponse = ApiResponse<TaskAnalyticsData>;

export type AdminCompletionRatesResponse = ApiResponse<TaskCompletionRatesData>;

export type AdminPeakActivityResponse = ApiResponse<TaskPeakActivityData>;

export type AdminSessionDurationResponse = ApiResponse<TaskSessionDurationData>;

export type AdminGetEvidencesResponse = ApiResponse<TaskEvidenceListData>;

export type AdminTaskHistoryExportResponse = ApiResponse<TaskHistoryExportData>;

export type AdminCsvHeadersResponse = ApiResponse<AdminCsvHeadersData>;

export type AdminTodayHistoryResponse = ApiResponse<TaskHistoryExportData>;

export type AdminThisWeekHistoryResponse = ApiResponse<TaskHistoryExportData>;

export type AdminThisMonthHistoryResponse = ApiResponse<TaskHistoryExportData>;

export type GetVisitorLogsResponse = ApiResponse<VisitorListData>;

export type FlagVisitorResponse = ApiResponse<null>;

export type GenerateVisitorTokenResponse = ApiResponse<VisitorTokenData>;

export type GetVisitorTokenResponse = ApiResponse<VisitorTokenData>;

export type GetTodaySummaryResponse = ApiResponse<GetTodaySummaryData>;

export type GetSingleVisitResponse = ApiResponse<VisitorDetail>;

export type CreateFacultyResponse<T> = ApiResponse<T>;

export type GetFacultiesResponse<T> = ApiResponse<T>;

export type BulkCreateFacultiesResponse<T> = ApiResponse<T>;

export type UpdateFacultyResponse<T> = ApiResponse<T>;

export type CreateDepartmentResponse<T> = ApiResponse<T>;

export type GetDepartmentsResponse<T> = ApiResponse<T>;

export type BulkCreateDepartmentsResponse<T> = ApiResponse<T>;

export type UpdateDepartmentResponse<T> = ApiResponse<T>;

export type CreateCourseResponse<T> = ApiResponse<T>;

export type GetCoursesResponse<T> = ApiResponse<T>;

export type BulkCreateCoursesResponse<T> = ApiResponse<T>;

export type GetCourseDetailResponse<T> = ApiResponse<T>;

export type UpdateCourseResponse<T> = ApiResponse<T>;

export type DeleteCourseResponse<T> = ApiResponse<T>;

export type CreateScheduleResponse<T> = ApiResponse<T>;

export type GetSchedulesResponse<T> = ApiResponse<T>;

export type BulkCreateSchedulesResponse<T> = ApiResponse<T>;

export type UpdateScheduleResponse<T> = ApiResponse<T>;

export type DeleteScheduleResponse<T> = ApiResponse<T>;

export type CreateStudentResponse<T> = ApiResponse<T>;

export type GetStudentsResponse<T> = ApiResponse<T>;

export type BulkCreateStudentsResponse<T> = ApiResponse<T>;

export type CreateLecturerResponse<T> = ApiResponse<T>;

export type GetLecturersResponse<T> = ApiResponse<T>;

export type BulkCreateLecturersResponse<T> = ApiResponse<T>;

export type GetMemberDetailResponse<T> = ApiResponse<T>;

export type UpdateMemberResponse<T> = ApiResponse<T>;

export type ResetMemberPasswordResponse<T> = ApiResponse<T>;

export type DeactivateMemberResponse<T> = ApiResponse<T>;

export type ReactivateMemberResponse<T> = ApiResponse<T>;

export type CreateCourseOverrideResponse<T> = ApiResponse<T>;

export type GetCourseOverridesResponse<T> = ApiResponse<T>;

export type DeleteCourseOverrideResponse<T> = ApiResponse<T>;

export type GetSessionsResponse<T> = ApiResponse<T>;

export type GetSessionDetailResponse<T> = ApiResponse<T>;

export type GetAnomaliesResponse<T> = ApiResponse<T>;

export type GetReportsResponse<T> = ApiResponse<T>;

export type GetAdminLectureAttendanceHistoryResponse<T> = ApiResponse<T>;

export type GetAdminLectureAttendanceHistoryExportResponse<T> = ApiResponse<T>;

export type ExportCsvHeadersResponse<T> = ApiResponse<T>;

export type ExportTodayResponse<T> = ApiResponse<T>;

export type ExportThisWeekResponse<T> = ApiResponse<T>;

export type ExportThisMonthResponse<T> = ApiResponse<T>;
