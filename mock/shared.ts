import type { ApiResponse, EmployeeSummary, OrganizationLocation, OrganizationProfile } from "@/models/api-response";

export const MOCK_DATE = "2026-10-13";
export const MOCK_TIMESTAMP = `${MOCK_DATE}T18:00:00+01:00`;
export const MOCK_UTC_OFFSET = 60;
export const DEMO_EMAIL = "admin@example.com";
export const DEMO_PASSWORD = "TymerDemo123!";

export function success<T>(data: T, responseMessage = "Mock request successful") {
  return { responseCode: "00", responseMessage, data } satisfies ApiResponse<T>;
}

// A harmless SVG upload placeholder, not a real face or production asset.
export function createUploadBlob() {
  return new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#ddd"/></svg>'], { type: "image/svg+xml" });
}

export function createSeed() {
  const organization = {
    OrganizationID: 12, OrganizationCode: "TYMER-DEMO", OrganizationName: "Tymer Demo Organization",
    SignInTime: "09:00:00", SignOutTime: "17:00:00", IsActive: true,
    LogoS3Path: null, Timezone: "Africa/Lagos",
  } satisfies OrganizationProfile;
  const employees: EmployeeSummary[] = [
    [1, "Demo", "Admin", DEMO_EMAIL, "ADMIN", true],
    [2, "Ada", "Okafor", "ada@example.com", "SECURITY", true],
    [3, "Tunde", "Bello", "tunde@example.com", "SECURITY", true],
    [4, "Maya", "Cole", "maya@example.com", "EMPLOYEE", true],
    [5, "Sam", "Reed", "sam@example.com", "EMPLOYEE", true],
    [6, "Zoe", "Lane", "zoe@example.com", "EMPLOYEE", false],
  ].map(([id, first, last, email, role, active]) => ({
    EmployeeID: id as number, EmployeeCode: `EMP-${String(id).padStart(3, "0")}`,
    FirstName: first as string, LastName: last as string, Email: email as string,
    Role: role as string, IsActive: active as boolean, OrganizationID: organization.OrganizationID,
  }));
  const locations: OrganizationLocation[] = [
    { LocationID: 101, LocationCode: "HQ", LocationName: "Head Office", Address: "10 Example Avenue, Lagos", IsActive: true, Latitude: "6.5244", Longitude: "3.3792" },
    { LocationID: 102, LocationCode: "GATE", LocationName: "Main Gate", Address: "12 Example Avenue, Lagos", IsActive: true, Latitude: "6.5250", Longitude: "3.3800" },
    { LocationID: 103, LocationCode: "ANNEX", LocationName: "Training Annex", Address: "14 Example Avenue, Lagos", IsActive: false, Latitude: null, Longitude: null },
  ];
  return { organization, employees, locations };
}

export type MockSeed = ReturnType<typeof createSeed>;
