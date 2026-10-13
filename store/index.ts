import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/slice/auth.slice";
import { baseApi } from "@/service/api/base.api";

export function makeStore() {
  return configureStore({
    reducer: { auth: authReducer, [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
      .concat(baseApi.middleware),
    // Authentication data must not be retained in production DevTools history.
    devTools: process.env.NODE_ENV !== "production",
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
