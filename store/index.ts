import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/slice/auth.slice";
import { authApi } from "@/service/api/auth.api";

export function makeStore() {
  return configureStore({
    reducer: { auth: authReducer, [authApi.reducerPath]: authApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
      .concat(authApi.middleware),
    // Authentication data must not be retained in production DevTools history.
    devTools: process.env.NODE_ENV !== "production",
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
