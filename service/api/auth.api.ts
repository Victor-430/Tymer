import type { LoginRequest, LoginResponse } from "@/types/auth";
import { baseApi } from "@/service/api/base.api";

export const authApi = baseApi.injectEndpoints({
  // overrideExisting: false,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({ url: "/admin/login", method: "POST", body: credentials }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
