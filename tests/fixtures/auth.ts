import type { LoginData, LoginResponse } from "../../types/auth";

export function loginResponse(): LoginResponse & { data: LoginData } {
  return {
    responseCode: "00",
    responseMessage: "Admin login successful",
    data: {
      // Opaque synthetic token: the client neither decodes nor persists it.
      access_token: "test-access-token",
      token_type: "bearer",
      employee: {
        employee_id: 7,
        email: "admin@example.com",
        first_name: "Test",
        last_name: "Admin",
        employee_code: "TEST-007",
        organization_id: 12,
        role: "ADMIN",
        active_modules: ["ATTENDANCE"],
        organization_name: "Example Organization",
        organization_code: "EXAMPLE",
      },
    },
  };
}
