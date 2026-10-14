import type { BaseQueryApi, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { createMockData, type MockData } from "@/mock";
import { isRecord } from "./errors";

export function belongsToOrganization(mocks: MockData, organization?: number | null) {
  return organization == null || organization === mocks.organization.responses.getMyOrganizationProfile.data.OrganizationID;
}

/** New workspace operations intentionally have no HTTP route until backend integration. */
export function fixtureQuery<Request, Response>(read: (fixtures: MockData, request: Request) => Response) {
  return async (request: Request, api: BaseQueryApi): Promise<{ data: Response } | { error: FetchBaseQueryError }> => {
    const message = api.signal.aborted ? "Mock request aborted."
      : process.env.NEXT_PUBLIC_DATA_SOURCE === "api" ? "This workspace operation is available in mock mode only."
      : null;
    if (message) return { error: { status: "CUSTOM_ERROR", error: message, data: { responseCode: "01", responseMessage: message } } };
    try {
      const response = read(createMockData(), request);
      if (isRecord(response) && typeof response.responseCode === "string" && response.responseCode !== "00") {
        const message = typeof response.responseMessage === "string" ? response.responseMessage : "Unable to load workspace records.";
        return { error: { status: "CUSTOM_ERROR", error: message, data: response } };
      }
      return { data: response };
    } catch {
      const message = "Unable to load workspace records. Please try again.";
      return { error: { status: "CUSTOM_ERROR", error: message, data: { responseCode: "01", responseMessage: message } } };
    }
  };
}

export function inDateRange(date: string | null, start?: string | null, end?: string | null) {
  if (!date) return !start && !end;
  const day = date.slice(0, 10);
  return (!start || day >= start) && (!end || day <= end);
}

export function pageRecords<T>(records: T[], limit = 20, offset = 0) {
  return records.slice(Math.max(0, offset), Math.max(0, offset) + Math.max(0, limit));
}
