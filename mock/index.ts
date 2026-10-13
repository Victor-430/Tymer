import { createAcademicMocks } from "./academic";
import { createAttendanceMocks } from "./attendance";
import { createAuthMocks } from "./auth";
import { createEmployeeMocks } from "./employees";
import { createLocationMocks } from "./locations";
import { createOrganizationMocks } from "./organization";
import { createPatrolMocks } from "./patrols";
import { createSeed } from "./shared";
import { createTaskMocks } from "./tasks";
import { createVisitorMocks } from "./visitors";

export { DEMO_EMAIL, DEMO_PASSWORD, MOCK_DATE, MOCK_TIMESTAMP, MOCK_UTC_OFFSET } from "./shared";

/** Importable examples only; creating fixtures never calls an API or executes a mutation. */
export function createMockData() {
  const seed = createSeed();
  return {
    auth: createAuthMocks(seed),
    organization: createOrganizationMocks(seed),
    employees: createEmployeeMocks(seed),
    locations: createLocationMocks(seed),
    attendance: createAttendanceMocks(seed),
    patrols: createPatrolMocks(seed),
    tasks: createTaskMocks(seed),
    visitors: createVisitorMocks(seed),
    academic: createAcademicMocks(seed),
  };
}

export type MockData = ReturnType<typeof createMockData>;
