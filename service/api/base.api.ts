import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/service/httpclient/base-query";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  endpoints: () => ({}),
});
