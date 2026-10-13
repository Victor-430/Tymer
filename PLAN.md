# Phase-one authentication and plan tracker

Status: **Complete — mock data enabled by default**

## Project guidance

Read [intent.md](./intent.md) for product/design direction and [spec.md](./spec.md) for architecture and implementation conventions before feature work. [AGENTS.md](./AGENTS.md) requires this reading; [README.md](./README.md) contains setup and verification commands. Keep feature scope, decisions, progress, and verification here, separate from lasting intent and specifications.

The requested preset, shell references, charts, and future shared Formik adapters are documented preferences. They are not installed or implemented by this documentation phase. The phase-one preservation notes below describe the completed implementation, not a prohibition on future UI changes requested by the user.

## Temporary mock data phase

- Default to mock transport; only explicit `NEXT_PUBLIC_DATA_SOURCE=api` enables the existing HTTP implementation.
- Connect the existing login/dashboard flow using `admin@example.com` / `TymerDemo123!` and synthetic credentials. Unsupported operations return mock errors without HTTP fallback.
- Provide fresh, typed requests/responses across non-academic modules and academic request examples only through `createMockData()`.
- Keep authentication and fixtures in memory. No new screens, dependencies, feature endpoints, or mock CRUD in this phase.
- Preserve the HTTP regression suite in explicit API mode; add fixture consistency, mock transport, and browser checks.

The phase-one notes below describe the retained authentication architecture and historical verification.

Verification: lint, TypeScript checking, all 34 unit checks, and the production build passed. The production-browser mock check passed for invalid/demo login, dashboard display, client navigation, logout, refresh, empty browser storage, and no backend requests or runtime/hydration errors. All 150 API operations have examples (academic operations are request-only). The HTTP unit suite passed in explicit API mode; its original browser suite was preserved but not rerun. The Windows browser test server required explicit cleanup after the test completed.

## Current plan

Keep the existing folders, reusable Yup schemas, Formik login, dashboard, and IBM Plex Sans theme. Store the token and employee only in Redux memory. Refreshing the app requires login again. The previous browser-storage and JWT-lifecycle design is superseded.

Use one shared `baseApi` instance with empty endpoints and `reducerPath: "api"`. Feature modules import it, call `injectEndpoints`, and export their typed APIs and generated hooks. Importing a feature module registers its endpoints; new feature modules require no changes to `createApi` or store registration. Logout resets the shared API cache.

## Confirmed API contract

- Send `{ email, password }` to `POST /admin/login`.
- HTTP 200 requires `responseCode === "00"` before accepting authentication.
- HTTP 422 validation errors appear on matching fields when available, otherwise at form level.
- Return the API response directly; read `data.access_token` and `data.employee` after checking required login data.
- Centralize bearer headers and response-code checking in `fetchBaseQuery` options. Never persist passwords or include real tokens in source or fixtures.

## Simplification checklist

- [x] Keep the existing folder structure and the base query in `service/httpclient`.
- [x] Export `fetchBaseQuery` directly with API URL configuration, `prepareHeaders`, and success validation.
- [x] Define `baseApi` once with `createApi`; inject the login mutation through `authApi`, register the shared reducer/middleware, and reset all feature caches on logout.
- [x] Keep `makeStore()` creating a fresh store for each provider, inferred types, typed hooks, lazy provider initialization, and the Next.js Suspense boundary.
- [x] Simplify auth state to token and employee with `setCredentials` and `logout`.
- [x] Remove session helpers/types/schemas, storage access, restoration, listener middleware, expiry timers, JWT decoding, and automatic HTTP-401 invalidation.
- [x] Update the login, token-based route guard, generic loading UI, dashboard selectors, and explicit logout/cache clearing.
- [x] Preserve Yup/useFormik, email trimming, exact password submission, duplicate-submit prevention, accessible errors, the existing UI, font, and theme.
- [x] Replace persistence/expiry tests with memory-only behavior and update README.

## Verification checklist

- [x] Verify the direct API response, bearer headers, HTTP-200 failures, HTTP 422 mapping, network failures, and ordinary HTTP 401 behavior.
- [x] Verify isolated stores, explicit logout/cache clearing, and absence of browser storage access.
- [x] Verify login, employee display, client navigation, protected routes, logout, and refresh requiring login again.
- [x] Verify validation, malformed login data, duplicate submissions, mobile layout, keyboard access, and absence of hydration errors.
- [x] Run unit tests, lint, TypeScript checking, production build, and production-browser tests.

## Defaults and boundaries

- Authentication remains only in the current Redux store; no browser storage, cookie session, automatic logout on HTTP 401, expiry parsing, or token refresh.
- Registration, password recovery, live metrics, and new dashboard features remain deferred.
- The API authorizes protected requests; the frontend guard controls dashboard presentation.
- Google Fonts access is needed for the first build. Browser tests use installed Google Chrome and a production build on port 3100 with mocked login responses.

## Current progress notes

- 2026-10-13: Replaced feature-specific API creation with the shared `baseApi` and endpoint injection. Migrated the API cache from `state.authApi` to `state.api` and added coverage for endpoints injected after store creation and shared cache clearing. All 16 unit/API checks, lint, and TypeScript checking passed. Vitest uses a synthetic API URL so mocked requests work without local environment configuration. Production build and browser tests were not rerun for this refactor.

- 2026-10-13: Implemented the requested memory-only simplification. Verification is in progress; baseline UI and folder structure were preserved.

- Verified the memory-only implementation: 15 unit/API checks and 12 production-browser tests passed. Lint (without warnings), TypeScript checking, and the production build passed.
- Browser checks confirm that client navigation keeps auth, refreshing returns to login, logout clears auth, malformed login data stays on login, and browser storage remains unused. No runtime or hydration errors were recorded.
- Unit checks confirm direct API response handling, separate store instances, bearer headers, explicit logout/cache clearing, HTTP 422 mapping, business/network failures, and HTTP 401 leaving auth intact.
- Preserved the existing folder structure and current login/dashboard appearance. Session-specific files and the unused base API were removed; original progress notes remain archived below.
- Browser tests ran inside the sandbox. The test server required explicit cleanup after all cases passed; the runner then completed with exit code 0.
## Historical progress — superseded session design

The notes below describe the original implementation. Their test counts and persistence behavior are historical, not the current specification.
- 2026-10-13: Plan recorded before implementation. Existing Next.js, UI component, dependency, and stylesheet changes will be preserved.

- 2026-10-13: Implemented all phase-one tasks. Added reusable schemas, runtime response validation, centralized HTTP handling, normalized session persistence, guarded routes, and the login/dashboard UI.
- Verified `npm test`: 20 unit/API integration checks passed, covering credential rules, malformed and expired sessions, blocked storage, HTTP-200 failures, HTTP 422 mapping, bearer headers, logout/cache clearing, and late HTTP 401 responses.
- Verified `npm run test:e2e`: 11 production-browser tests passed with synthetic tokens and mocked login requests. Covered keyboard access, redirects, refresh persistence, logout, error messages, duplicate submission prevention, expiry, mobile overflow, and IBM Plex Sans. No runtime or hydration errors were recorded.
- Verified `npm run lint`, `npm run typecheck`, and `npm run build`: all passed. Reviewed desktop/mobile login screenshots; browser artifacts remain in ignored `test-results`.
- Kept Cache Components and Partial Prefetching enabled. The Redux provider uses Suspense to accommodate generated listener IDs; the auth boundary waits for its own hydration. The guarded dashboard page opts out of instant-navigation validation because its layout intentionally withholds content until session restoration.
- IBM Plex Sans requires Google Fonts access for the first build. Network-restricted build attempts were retried successfully with network access.
- Browser tests run against the production build to avoid development-server compilation delays; run `npm run build` before `npm run test:e2e`. An installed Google Chrome is used.
- The live backend was not authenticated during verification. Actual credentials and the supplied token were never added to source or fixtures. The API must allow the deployed application's origin through CORS and enforce authorization.
- Added setup, architecture, session behavior, and verification instructions to README.md. Original UI components, theme tokens, utilities, and dependency choices were retained; no commits or deployment were performed.

