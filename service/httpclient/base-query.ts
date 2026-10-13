import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { RootState } from "@/store";
import { isRecord } from "./errors";
import { mockBaseQuery } from "./mock-base-query";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const httpBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: 20_000,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = (getState() as RootState).auth.token;
    if (token && endpoint !== "login") headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
  validateStatus: (response, body) => response.ok && isRecord(body) && body.responseCode === "00",
});

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = (args, api, extraOptions) => {
  // Public environment variables are compiled into the browser bundle by Next.js.
  // Missing or unrecognized values stay in mock mode, even with an API URL set.
  return process.env.NEXT_PUBLIC_DATA_SOURCE === "api"
    ? httpBaseQuery(args, api, extraOptions)
    : mockBaseQuery(args, api, extraOptions);
};
