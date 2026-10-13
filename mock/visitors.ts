import type * as Requests from "@/models/api-request";
import type * as Responses from "@/models/api-response";
import { createSeed, MOCK_DATE, MOCK_UTC_OFFSET, success, type MockSeed } from "./shared";

export function createVisitorMocks(seed: MockSeed = createSeed()) {
  const location = seed.locations[0];
  const visitors: Responses.VisitorSummary[] = ["CHECKED_IN", "CHECKED_OUT"].map((status, index) => ({
    VisitID: 5001 + index, FullName: index === 0 ? "Alex Morgan" : "Robin Blake", PhoneNumber: `+234000000000${index}`,
    Email: index === 0 ? "alex@example.com" : null, PurposeOfVisit: index === 0 ? "Project meeting" : "Delivery",
    HostName: `${seed.employees[0].FirstName} ${seed.employees[0].LastName}`, HostUnitNumber: null, HostDepartment: "Administration",
    Company: index === 0 ? "Example Partners" : null, PhotoS3URL: null, photo_url: null,
    Status: status as Responses.VisitorStatus, CheckedInAt: `${MOCK_DATE}T${index === 0 ? "16:30" : "10:00"}:00+01:00`,
    CheckedOutAt: index === 0 ? null : `${MOCK_DATE}T10:30:00+01:00`, IsFlagged: index === 1,
    FlagReason: index === 0 ? null : "Demo flag: delivery requires review", FlaggedAt: index === 0 ? null : `${MOCK_DATE}T10:15:00+01:00`,
    LocationName: location.LocationName, LocationCode: location.LocationCode, OrganizationName: seed.organization.OrganizationName,
  }));
  const token = { location_id: location.LocationID, visitor_token: "mock-visitor-token", qr_value: "mock:visitor:101" } satisfies Responses.VisitorTokenData;
  const visit = visitors[0];
  const detail: Responses.VisitorDetail = {
    VisitID: visit.VisitID, TokenID: 1, LocationID: location.LocationID, OrganizationID: seed.organization.OrganizationID,
    FullName: visit.FullName, PhoneNumber: visit.PhoneNumber, Email: visit.Email, PurposeOfVisit: visit.PurposeOfVisit,
    HostName: visit.HostName, HostUnitNumber: visit.HostUnitNumber, HostDepartment: visit.HostDepartment, Company: visit.Company,
    PhotoS3URL: visit.PhotoS3URL, photo_url: visit.photo_url, Status: visit.Status, CheckedInAt: visit.CheckedInAt,
    CheckedOutAt: visit.CheckedOutAt, IsFlagged: visit.IsFlagged, FlagReason: visit.FlagReason, FlaggedAt: visit.FlaggedAt,
    FlaggedBy: null, CreatedAt: visit.CheckedInAt,
  };
  return {
    requests: {
      getVisitorLogs: { location_id: location.LocationID, start_date: MOCK_DATE, end_date: MOCK_DATE, limit: 20, skip: 0, utc_offset: MOCK_UTC_OFFSET } satisfies Requests.GetVisitorLogsRequest,
      flagVisitor: { visit_id: visitors[1].VisitID, is_flagged: true, flag_reason: visitors[1].FlagReason } satisfies Requests.FlagVisitorRequest,
      generateVisitorToken: { location_id: location.LocationID } satisfies Requests.GenerateVisitorTokenRequest,
      getVisitorToken: { location_id: location.LocationID } satisfies Requests.GetVisitorTokenRequest,
      getTodaySummary: { location_id: location.LocationID, utc_offset: MOCK_UTC_OFFSET } satisfies Requests.GetTodaySummaryRequest,
      getSingleVisit: { path: { visit_id: visit.VisitID }, query: { utc_offset: MOCK_UTC_OFFSET } } satisfies Requests.GetSingleVisitRequest,
    },
    responses: {
      getVisitorLogs: success({ total: visitors.length, limit: 20, offset: 0, visitors }) satisfies Responses.GetVisitorLogsResponse,
      flagVisitor: success(null) satisfies Responses.FlagVisitorResponse,
      generateVisitorToken: success({ ...token }) satisfies Responses.GenerateVisitorTokenResponse,
      getVisitorToken: success({ ...token }) satisfies Responses.GetVisitorTokenResponse,
      getTodaySummary: success({ total_today: visitors.length, currently_inside: visitors.filter((v) => v.Status === "CHECKED_IN").length, checked_out_today: visitors.filter((v) => v.Status === "CHECKED_OUT").length }) satisfies Responses.GetTodaySummaryResponse,
      getSingleVisit: success(detail) satisfies Responses.GetSingleVisitResponse,
    },
    empty: { getVisitorLogs: success({ total: 0, limit: 20, offset: 0, visitors: [] }) satisfies Responses.GetVisitorLogsResponse },
  };
}
