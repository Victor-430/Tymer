import type * as Requests from "@/models/api-request";
import type * as Responses from "@/models/api-response";
import { createSeed, createUploadBlob, MOCK_DATE, MOCK_UTC_OFFSET, success, type MockSeed } from "./shared";

export function createOrganizationMocks(seed: MockSeed = createSeed()) {
  const org = seed.organization;
  const modules: Responses.SignupModule[] = ["ATTENDANCE", "PATROL", "TASK", "VISITOR"].map((name, index) => ({
    ModuleID: index + 1, ModuleName: name, Description: `${name.toLowerCase()} management`,
  }));
  const subscriptions: Responses.OrganizationSubscription[] = modules.map((module) => ({
    ...module, SubscriptionID: module.ModuleID, OrganizationID: org.OrganizationID, IsActive: true,
    StartsAt: `${MOCK_DATE}T00:00:00+01:00`, ExpiresAt: null, CreatedAt: `${MOCK_DATE}T00:00:00+01:00`,
  }));
  return {
    requests: {
      getSignupModules: undefined satisfies Requests.GetSignupModulesRequest,
      signupOrganization: { organization_name: org.OrganizationName, contact_name: "Demo Admin", contact_email: seed.employees[0].Email, modules: modules.map((m) => m.ModuleName), timezone: org.Timezone } satisfies Requests.SignupOrganizationRequest,
      getMyOrganizationSubscriptions: { utc_offset: MOCK_UTC_OFFSET } satisfies Requests.GetMyOrganizationSubscriptionsRequest,
      updateMyOrganizationLogo: { logo: createUploadBlob() } satisfies Requests.UpdateMyOrganizationLogoRequest,
      getMyOrganizationProfile: { utc_offset: MOCK_UTC_OFFSET } satisfies Requests.GetMyOrganizationProfileRequest,
      updateMyOrganizationProfile: { organization_name: org.OrganizationName, sign_in_time: org.SignInTime, sign_out_time: org.SignOutTime, timezone: org.Timezone, utc_offset: MOCK_UTC_OFFSET } satisfies Requests.UpdateMyOrganizationProfileRequest,
    },
    responses: {
      getSignupModules: success(modules) satisfies Responses.GetSignupModulesResponse,
      signupOrganization: success({ organization_code: org.OrganizationCode, organization_name: org.OrganizationName, modules: modules.map((m) => m.ModuleName), trial_expires_at: "2026-11-12T00:00:00+01:00" }) satisfies Responses.SignupOrganizationResponse,
      getMyOrganizationSubscriptions: success(subscriptions) satisfies Responses.GetMyOrganizationSubscriptionsResponse,
      updateMyOrganizationLogo: success({ organization_id: org.OrganizationID, logo_s3_path: "mock/organization/logo.svg" }) satisfies Responses.UpdateMyOrganizationLogoResponse,
      getMyOrganizationProfile: success(org) satisfies Responses.GetMyOrganizationProfileResponse,
      updateMyOrganizationProfile: success({ organization_id: org.OrganizationID }) satisfies Responses.UpdateMyOrganizationProfileResponse,
    },
    empty: { getMyOrganizationSubscriptions: success([]) satisfies Responses.GetMyOrganizationSubscriptionsResponse },
  };
}
