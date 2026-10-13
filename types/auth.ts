import type { LoginValues } from "@/schema/login.schema";

export type LoginRequest = LoginValues;

export interface Employee {
  employee_id: number;
  email: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  organization_id: number;
  role: string;
  active_modules: string[];
  organization_name: string;
  organization_code: string;
}

export interface LoginData {
  access_token: string;
  token_type: "bearer";
  employee: Employee;
}

export interface LoginResponse {
  responseCode: string;
  responseMessage: string;
  data?: LoginData;
}
