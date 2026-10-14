import type {
  GetMyOrganizationProfileRequest,
  GetMyOrganizationSubscriptionsRequest,
} from "@/models/api-request";
import type {
  GetMyOrganizationProfileResponse,
  GetMyOrganizationSubscriptionsResponse,
} from "@/models/api-response";
import { baseApi } from "./base.api";
import { fixtureQuery } from "@/service/httpclient/dashboard-mocks";

export const organizationApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    dashboardOrganization: builder.query<GetMyOrganizationProfileResponse, GetMyOrganizationProfileRequest>({
      queryFn: fixtureQuery((m) => m.organization.responses.getMyOrganizationProfile),
    }),
    dashboardSubscriptions: builder.query<GetMyOrganizationSubscriptionsResponse, GetMyOrganizationSubscriptionsRequest>({
      queryFn: fixtureQuery((m) => m.organization.responses.getMyOrganizationSubscriptions),
    }),
  }),
});

export const {
  useDashboardOrganizationQuery,
  useDashboardSubscriptionsQuery,
} = organizationApi;
