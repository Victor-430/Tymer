import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";
import { isRecord } from "./errors";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: 20_000,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = (getState() as RootState).auth.token;
    if (token && endpoint !== "login") headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
  validateStatus: (response, body) => response.ok && isRecord(body) && body.responseCode === "00",
});
