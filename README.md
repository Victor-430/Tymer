# Tymer admin workspace

Tymer provides an admin login, an operations overview, and protected pages for employees, locations, attendance, patrols, tasks, visitors, and organization. See [PLAN.md](./PLAN.md) for scope and verification notes.

## Project guidance

Before starting project or feature work, read [intent.md](./intent.md) for product goals and design direction, [spec.md](./spec.md) for engineering rules (including `useFormik` and reusable form adapters), and [PLAN.md](./PLAN.md) for the relevant scope and progress. [AGENTS.md](./AGENTS.md) records these reading requirements and the installed Next.js guidance.

The mock dashboard uses teal/neutral tokens, IBM Plex Sans, Lucide, shadcn table/sheet/tab primitives, and Arc donut/waffle charts. `PLAN.md` remains the progress tracker, separate from lasting intent and specifications.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:3000. `/` redirects to `/login`; successful admin login opens `/dashboard`.

The app defaults to mock data and does not call the backend. Sign in with:

- Email: `admin@example.com`
- Password: `TymerDemo123!`

Email is trimmed; the password must match exactly. Incorrect credentials display a login error. Login opens the operations overview. Use the sidebar or mobile navigation to browse all seven domains. Tables support search, status filters, sorting, ten-row pagination, and accessible record details. Authentication remains in memory, so refreshing requires signing in again. Records are read-only and reset to the same fixture defaults on reload.

Copy `.env.example` to `.env.local` if you want explicit configuration. `NEXT_PUBLIC_DATA_SOURCE=mock` uses mock login; only `NEXT_PUBLIC_DATA_SOURCE=api` enables HTTP requests using `NEXT_PUBLIC_API_BASE_URL`. Missing or unrecognized data-source values use mocks. Unknown mock operations return an error without contacting the backend. Restart development after changing these variables; production requires a new build because public variables are compiled into the browser bundle. When API mode is enabled, the backend must allow your application's origin through CORS.

IBM Plex Sans is downloaded at build time by `next/font/google` and served locally to browsers. The first build needs access to Google Fonts.

## Structure

- `schema`: shared Yup credential rules and reusable auth/login schemas.
- `service/api`: the shared `baseApi` instance and feature APIs such as `authApi`, which inject their endpoints.
- `service/httpclient`: shared mock/HTTP base queries and form error handling.
- `mock`: typed request/response examples grouped by domain, plus related fictional records.
- `slice`: in-memory token and employee state with `setCredentials` and `logout`.
- `store`: store factory, inferred types, typed hooks, and client provider.
- `components/forms`: reusable Formik fields used with `useFormik`.

Login uses the normal `query` pattern through the base query in `service/httpclient`, which selects mock or HTTP transport. Workspace reads are grouped into seven modules in `service/api`: `employees.api.ts`, `locations.api.ts`, `attendance.api.ts`, `patrols.api.ts`, `tasks.api.ts`, `visitors.api.ts`, and `organization.api.ts`. Each exports its domain API and generated hooks, using typed mock-only `queryFn` handlers injected into the same API instance. Components import hooks directly from their owning module. The handlers preserve envelopes, return fresh fixtures, and handle supported identities, dates, filters, and pagination. They never contact HTTP transport; explicit API mode produces a clear unsupported-operation error on these pages. In API mode, login's `fetchBaseQuery` configures the API URL, attaches bearer headers for protected HTTP operations, and validates HTTP success plus `responseCode: "00"`. HTTP 422 login errors are mapped to matching fields.

`baseApi` calls `createApi` once with an empty endpoint list. Each feature module imports `baseApi`, calls `baseApi.injectEndpoints({ endpoints: (builder) => ({ ... }), overrideExisting: false })`, and exports hooks from the returned API. For example, `auth.api.ts` exports `authApi` and `useLoginMutation`. Importing a feature API or one of its hooks registers that module's endpoints; the shared instance does not import feature modules. The store registers only `baseApi.reducer` and `baseApi.middleware`, with the shared cache under `state.api`. Adding another feature module requires no changes to `createApi` or the store.

`makeStore()` creates a fresh store for each provider; the client provider initializes it once through `useState(makeStore)`. The root Suspense boundary is retained for the installed Next.js Cache Components configuration.

Authentication stays only in Redux memory. No browser storage, restoration, JWT decoding, expiry timers, or listener middleware is used. Refreshing or reopening the app requires login again. Client navigation keeps the existing store. Logout explicitly clears auth state and every injected endpoint's cache through `baseApi.util.resetApiState()`. HTTP 401 is an ordinary request error and does not automatically clear auth. The API must verify tokens and authorize protected requests.

The login schema trims email but preserves passwords exactly. Login checks for a nonempty access token and employee data before updating Redux.

## Importing mock data

```ts
import { createMockData } from "@/mock";

const mocks = createMockData();
const credentials = mocks.auth.requests.adminLogin;
const employeeListResponse = mocks.employees.responses.viewEmployees;
const employees = employeeListResponse.data.employees;
const emptyEmployeeList = mocks.employees.empty.viewEmployees;
const loginError = mocks.auth.errors.invalidCredentials;
```

Domains are `auth`, `organization`, `employees`, `locations` (including location access and NFC), `attendance`, `patrols`, `tasks`, `visitors`, and `academic`. Operation keys match their API type names with a lowercase first letter and without the `Request`/`Response` suffix. Academic fixtures provide `requests` only because their response payloads are still unspecified. Other domains provide `requests`, `responses`, and representative `empty` lists; auth also provides business and validation `errors`.

Fixtures preserve API field casing, nullable values, pagination, and enum values. Records share one fictional organization, six employees, and three locations, with dates anchored to October 13, 2026 in `Africa/Lagos` (UTC offset 60 minutes). Totals and summaries match the related records. Demo tokens are synthetic and cannot authenticate against the backend. Upload examples use a harmless SVG `Blob`; no biometric image is provided. QR generation supplies the defined error-response example until a valid QR asset is available.

Each `createMockData()` call creates fresh objects, arrays, and upload blobs. Workspace read queries use fresh snapshots with deterministic shared identities. Creating or importing fixtures never executes mutations. Request examples, mutation receipts, upload blobs, synthetic tokens, and academic request-only records remain fixture resources rather than dashboard content.

The overview is anchored to October 13, 2026 in Lagos, rather than the machine's current date. History pages default to October 7–13 and validate date ranges before applying them. Attendance counts distinct active employees; the overview shows 4/5 present, 1/2 patrol sessions complete, 1/5 task sessions complete, and 1 visitor inside among 2 visits. Task-duration statistics and scheduled-round status explicitly label their own fixture dates. Available records are sparse; the dashboard does not invent trends or assume undisclosed values are zero.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The default production build and browser test command check mock login, overview metrics and styled charts, every domain route, search/status filters/sorting, details and dataset tabs, date validation/filtering, mobile layouts, safe errors/retry, logout, refresh, unused browser storage, and absence of backend requests. Browser tests use installed Google Chrome and start the production app on port 3100. Traces and dashboard screenshots are written to the ignored `test-results` directory. On Windows, if the test runner waits after reporting all test outcomes, stop only the test server process it launched on port 3100; do not terminate unrelated Node processes.

Existing HTTP unit tests explicitly use API mode while stubbing `fetch`; mock transport tests verify that `fetch` is never called, including with a configured API URL. The original request-interception browser suite remains available for API-mode regression checks. Both its build and test commands must use API mode. In PowerShell:

```powershell
$env:NEXT_PUBLIC_DATA_SOURCE = "api"
$env:NEXT_PUBLIC_API_BASE_URL = "https://api.example.test"
npm.cmd run build
npm.cmd run test:e2e
Remove-Item Env:NEXT_PUBLIC_DATA_SOURCE
Remove-Item Env:NEXT_PUBLIC_API_BASE_URL
```

That suite intercepts login requests and never authenticates against the live backend. Rebuild in mock mode before continuing ordinary development or running the default mock browser check.

Registration, password recovery, token refresh, record mutations, academic pages, and live backend integration remain deferred.
