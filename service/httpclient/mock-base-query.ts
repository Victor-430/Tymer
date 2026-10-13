import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createAuthMocks } from "@/mock/auth";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/mock/shared";
import { isRecord } from "./errors";

export const mockBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api) => {
  if (api.signal.aborted) {
    return { error: { status: "CUSTOM_ERROR", error: "Mock request aborted." } };
  }
  // Dispatch by operation name. An unknown operation must never reach the backend.
  if (api.endpoint !== "login") {
    return { error: { status: "CUSTOM_ERROR", error: `No mock handler for endpoint "${api.endpoint}".`,
      data: { responseCode: "01", responseMessage: `No mock handler for endpoint "${api.endpoint}".` } } };
  }
  const body: unknown = typeof args === "string" ? undefined : args.body;
  const fixtures = createAuthMocks();
  if (!isRecord(body) || typeof body.email !== "string" || typeof body.password !== "string") {
    return { error: { status: 422, data: { detail: [{ loc: ["body"], msg: "Email and password are required.", type: "value_error" }] } } };
  }
  if (body.email.trim() !== DEMO_EMAIL || body.password !== DEMO_PASSWORD) {
    return { error: { status: 401, data: fixtures.errors.invalidCredentials } };
  }
  return { data: fixtures.responses.adminLogin };
};
