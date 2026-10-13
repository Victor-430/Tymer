import { createApi } from "@reduxjs/toolkit/query/react";
import type { LoginRequest, LoginResponse } from "@/types/auth";
import { baseQuery } from "@/service/httpclient/base-query";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({ url: "/admin/login", method: "POST", body: credentials }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
