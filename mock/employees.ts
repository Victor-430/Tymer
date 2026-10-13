import type * as Requests from "@/models/api-request";
import type * as Responses from "@/models/api-response";
import { createSeed, createUploadBlob, MOCK_TIMESTAMP, success, type MockSeed } from "./shared";

export function createEmployeeMocks(seed: MockSeed = createSeed()) {
  const employee = seed.employees[1];
  const identity = { employee_id: employee.EmployeeID, employee_code: employee.EmployeeCode, name: `${employee.FirstName} ${employee.LastName}` } satisfies Responses.EmployeeIdentity;
  const createEmployee = { employee_code: employee.EmployeeCode, email: employee.Email, first_name: employee.FirstName, last_name: employee.LastName, organization_id: seed.organization.OrganizationID, passport: createUploadBlob(), location_ids: "101,102", access_type: "ALL" } satisfies Requests.CreateEmployeeRequest;
  return {
    requests: {
      resetEmployeeCredentials: { employee_id: employee.EmployeeID } satisfies Requests.ResetEmployeeCredentialsRequest,
      getEmployeeDetail: { email: employee.Email } satisfies Requests.GetEmployeeDetailRequest,
      createEmployee,
      viewEmployees: { organization_id: seed.organization.OrganizationID, limit: 20, offset: 0 } satisfies Requests.ViewEmployeesRequest,
      updateEmployee: { employee_id: employee.EmployeeID, first_name: employee.FirstName, role: employee.Role } satisfies Requests.UpdateEmployeeRequest,
      reactivateEmployee: { employee_id: seed.employees[5].EmployeeID } satisfies Requests.ReactivateEmployeeRequest,
      deactivateEmployee: { employee_id: employee.EmployeeID } satisfies Requests.DeactivateEmployeeRequest,
      bulkCreateEmployees: [{ employee_code: employee.EmployeeCode, email: employee.Email, first_name: employee.FirstName, last_name: employee.LastName, organization_id: seed.organization.OrganizationID }] satisfies Requests.BulkCreateEmployeesRequest,
    },
    responses: {
      resetEmployeeCredentials: success({ employee_id: employee.EmployeeID, is_locked: false, failed_login_attempts: 0, updated_at: MOCK_TIMESTAMP }) satisfies Responses.ResetEmployeeCredentialsResponse,
      getEmployeeDetail: success({ employee_id: employee.EmployeeID, employee_name: identity.name, email: employee.Email, reference_face_image_s3_path: null, organization_id: seed.organization.OrganizationID, is_active: employee.IsActive }) satisfies Responses.GetEmployeeDetailResponse,
      createEmployee: success({ employee_id: employee.EmployeeID, locations_granted: 2 }) satisfies Responses.CreateEmployeeResponse,
      viewEmployees: success({ total_records: seed.employees.length, employees: seed.employees, limit: 20, offset: 0 }) satisfies Responses.ViewEmployeesResponse,
      updateEmployee: success({ ...employee, OrganizationID: seed.organization.OrganizationID, ReferenceFaceImageS3Path: null }) satisfies Responses.UpdateEmployeeResponse,
      reactivateEmployee: success({ employee_id: seed.employees[5].EmployeeID, employee_code: seed.employees[5].EmployeeCode, name: `${seed.employees[5].FirstName} ${seed.employees[5].LastName}` }) satisfies Responses.ReactivateEmployeeResponse,
      deactivateEmployee: success(identity) satisfies Responses.DeactivateEmployeeResponse,
      bulkCreateEmployees: success({ success_count: 1, failure_count: 0, failures: [] }) satisfies Responses.BulkCreateEmployeesResponse<Responses.BulkNamedFailure>,
    },
    empty: { viewEmployees: success({ total_records: 0, employees: [], limit: 20, offset: 0 }) satisfies Responses.ViewEmployeesResponse },
  };
}
