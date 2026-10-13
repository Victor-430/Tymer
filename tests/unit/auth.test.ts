import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { loginSchema } from "@/schema/login.schema";
import { baseQuery } from "@/service/httpclient/base-query";
import { getApiError } from "@/service/httpclient/errors";
import { authApi } from "@/service/api/auth.api";
import { baseApi } from "@/service/api/base.api";
import { logout, setCredentials } from "@/slice/auth.slice";
import { makeStore } from "@/store";
import { loginResponse } from "../fixtures/auth";

function queryContext(store: ReturnType<typeof makeStore>, endpoint = "protected"): BaseQueryApi {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    abort: () => controller.abort(),
    dispatch: store.dispatch,
    getState: store.getState,
    extra: undefined,
    endpoint,
    type: "query",
  };
}

const stores: ReturnType<typeof makeStore>[] = [];
function newStore() {
  const store = makeStore();
  stores.push(store);
  return store;
}

const readStorage = vi.fn(() => { throw new Error("Authentication must not use browser storage"); });
beforeEach(() => {
  vi.stubGlobal("window", {
    get sessionStorage() { return readStorage(); },
    get localStorage() { return readStorage(); },
  });
});
afterEach(() => {
  stores.splice(0).forEach((store) => store.dispatch(baseApi.util.resetApiState()));
  expect(readStorage).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

describe("reusable login validation", () => {
  it("requires email and password", async () => {
    await expect(loginSchema.validate({ email: "", password: "" }, { abortEarly: false }))
      .rejects.toMatchObject({ errors: ["Email is required.", "Password is required."] });
  });

  it("rejects malformed emails", async () => {
    await expect(loginSchema.validate({ email: "not-an-email", password: "existing" }))
      .rejects.toThrow("Enter a valid email address.");
  });

  it("trims email and preserves existing passwords exactly", async () => {
    expect(await loginSchema.validate({ email: " admin@example.com ", password: " x " }))
      .toEqual({ email: "admin@example.com", password: " x " });
  });
});

describe("injected auth API and shared base query", () => {
  it("runs endpoints injected after store creation and clears all feature caches together", async () => {
    const store = newStore();
    const featureApi = baseApi.injectEndpoints({
      overrideExisting: false,
      endpoints: (builder) => ({
        testFeature: builder.query<{ responseCode: string; data: { name: string } }, void>({
          query: () => "/test-feature",
        }),
      }),
    });
    const loginFixture = loginResponse();
    const featureResponse = { responseCode: "00", data: { name: "Test feature" } };
    const fetch = vi.fn()
      .mockResolvedValueOnce(Response.json(loginFixture))
      .mockResolvedValueOnce(Response.json(featureResponse));
    vi.stubGlobal("fetch", fetch);

    await store.dispatch(authApi.endpoints.login.initiate({
      email: "admin@example.com", password: "test",
    })).unwrap();
    store.dispatch(setCredentials(loginFixture.data));
    const request = store.dispatch(featureApi.endpoints.testFeature.initiate());
    try {
      expect(await request.unwrap()).toEqual(featureResponse);
      const httpRequest = fetch.mock.calls[1][0] as Request;
      expect(httpRequest.url).toMatch(/\/test-feature$/);
      expect(httpRequest.method).toBe("GET");
      expect(httpRequest.headers.get("Authorization")).toBe("Bearer test-access-token");
      expect(Object.keys(store.getState().api.queries)).toHaveLength(1);
      expect(Object.keys(store.getState().api.mutations)).toHaveLength(1);

      store.dispatch(baseApi.util.resetApiState());
      expect(store.getState().api.queries).toEqual({});
      expect(store.getState().api.mutations).toEqual({});
    } finally {
      request.unsubscribe();
    }
  });

  it("posts credentials and returns the original response without updating auth automatically", async () => {
    const store = newStore();
    const response = loginResponse();
    const fetch = vi.fn().mockResolvedValue(Response.json(response));
    vi.stubGlobal("fetch", fetch);
    const result = await store.dispatch(authApi.endpoints.login.initiate({
      email: "admin@example.com", password: " existing password ",
    })).unwrap();
    const request = fetch.mock.calls[0][0] as Request;
    expect(request.url).toMatch(/\/admin\/login$/);
    expect(request.method).toBe("POST");
    expect(await request.json()).toEqual({ email: "admin@example.com", password: " existing password " });
    expect(request.headers.has("Authorization")).toBe(false);
    expect(result).toEqual(response);
    expect(store.getState().auth).toEqual({ token: null, employee: null });
  });

  it("attaches the Redux token to protected requests", async () => {
    const store = newStore();
    store.dispatch(setCredentials(loginResponse().data));
    const fetch = vi.fn().mockResolvedValue(Response.json({ responseCode: "00", data: {} }));
    vi.stubGlobal("fetch", fetch);
    await baseQuery("/protected", queryContext(store), {});
    expect((fetch.mock.calls[0][0] as Request).headers.get("Authorization"))
      .toBe("Bearer test-access-token");
  });

  it("omits authorization on login even when Redux already contains a token", async () => {
    const store = newStore();
    store.dispatch(setCredentials(loginResponse().data));
    const fetch = vi.fn().mockResolvedValue(Response.json(loginResponse()));
    vi.stubGlobal("fetch", fetch);
    await store.dispatch(authApi.endpoints.login.initiate({ email: "admin@example.com", password: "test" }));
    expect((fetch.mock.calls[0][0] as Request).headers.has("Authorization")).toBe(false);
  });

  it("rejects HTTP-200 business failures and displays the API message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      responseCode: "01", responseMessage: "Invalid credentials",
    })));
    const result = await baseQuery("/admin/login", queryContext(newStore(), "login"), {});
    expect(result.error?.status).toBe(200);
    expect(getApiError(result.error).message).toBe("Invalid credentials");
  });

  it.each([null, {}, { responseMessage: "Missing response code" }])("rejects an invalid response envelope (%j)", async (body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(body)));
    const result = await baseQuery("/admin/login", queryContext(newStore(), "login"), {});
    expect(result.error?.status).toBe(200);
  });

  it("maps HTTP 422 fields and unmatched errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ detail: [
      { loc: ["body", "email"], msg: "Invalid email" },
      { loc: ["body", "password"], msg: "Missing password" },
    ] }, { status: 422 })));
    const result = await baseQuery("/admin/login", queryContext(newStore(), "login"), {});
    expect(result.error?.status).toBe(422);
    expect(getApiError(result.error).fieldErrors).toEqual({ email: "Invalid email", password: "Missing password" });
    expect(getApiError({ status: 422, data: { detail: [
      { loc: ["body", "account"], msg: "Account unavailable" },
    ] } }).message).toBe("Account unavailable");
  });

  it("reports network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network unavailable")));
    const result = await baseQuery("/admin/login", queryContext(newStore(), "login"), {});
    expect(result.error?.status).toBe("FETCH_ERROR");
    expect(getApiError(result.error).message).toContain("Check your connection");
  });

  it("treats protected HTTP 401 as an ordinary error without clearing auth or cached data", async () => {
    const store = newStore();
    const credentials = loginResponse().data;
    store.dispatch(setCredentials(credentials));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(loginResponse())));
    await store.dispatch(authApi.endpoints.login.initiate({ email: "admin@example.com", password: "test" }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ detail: "Unauthorized" }, { status: 401 })));
    const result = await baseQuery("/protected", queryContext(store), {});
    expect(result.error?.status).toBe(401);
    expect(store.getState().auth).toEqual({ token: credentials.access_token, employee: credentials.employee });
    expect(Object.keys(store.getState().api.mutations)).toHaveLength(1);
  });
});

describe("memory-only store and logout", () => {
  it("creates a fresh unauthenticated store for each provider instance", () => {
    const first = newStore();
    first.dispatch(setCredentials(loginResponse().data));
    expect(first.getState().auth.token).toBe("test-access-token");
    const second = newStore();
    expect(first).not.toBe(second);
    expect(second.getState().auth).toEqual({ token: null, employee: null });
  });

  it("clears auth and cache through explicit logout actions", async () => {
    const store = newStore();
    const response = loginResponse();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(response)));
    await store.dispatch(authApi.endpoints.login.initiate({ email: "admin@example.com", password: "test" }));
    store.dispatch(setCredentials(response.data));
    expect(Object.keys(store.getState().api.mutations)).toHaveLength(1);
    store.dispatch(logout());
    store.dispatch(baseApi.util.resetApiState());
    expect(store.getState().auth).toEqual({ token: null, employee: null });
    expect(store.getState().api.mutations).toEqual({});
  });
});
