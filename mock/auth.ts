import type * as Requests from "@/models/api-request";
import type * as Responses from "@/models/api-response";
import type { LoginResponse } from "@/types/auth";
import { createSeed, DEMO_EMAIL, DEMO_PASSWORD, success, type MockSeed } from "./shared";

export function createAuthMocks(seed: MockSeed = createSeed()) {
  const admin = seed.employees[0];
  const adminLogin = success({
    access_token: "mock-tymer-access-token", token_type: "bearer" as const,
    employee: {
      employee_id: admin.EmployeeID, employee_code: admin.EmployeeCode, email: admin.Email,
      first_name: admin.FirstName, last_name: admin.LastName, role: admin.Role,
      organization_id: seed.organization.OrganizationID,
      organization_name: seed.organization.OrganizationName, organization_code: seed.organization.OrganizationCode,
      active_modules: ["ATTENDANCE", "PATROL", "TASK", "VISITOR"],
    },
  }, "Admin login successful") satisfies Responses.AdminLoginResponse & LoginResponse;
  return {
    requests: { adminLogin: { email: DEMO_EMAIL, password: DEMO_PASSWORD } satisfies Requests.AdminLoginRequest },
    responses: { adminLogin },
    errors: {
      invalidCredentials: { responseCode: "01", responseMessage: "The email or password is incorrect.", data: null } satisfies Responses.AdminLoginResponse,
      validation: { detail: [{ loc: ["body", "email"], msg: "Enter a valid email address.", type: "value_error" }] } satisfies Responses.HTTPValidationError,
    },
  };
}
