# Tymer admin workspace

Phase one provides an admin login and a protected dashboard shell. See [PLAN.md](./PLAN.md) for current decisions, completion status, and verification notes.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:3000. `/` redirects to `/login`; successful admin login opens `/dashboard`.

The API URL defaults to the supplied Tymer backend. Copy `.env.example` to `.env.local` to configure `NEXT_PUBLIC_API_BASE_URL` for another backend, then restart the server. Public environment variables are included in the browser bundle at build time. The API must allow requests from your application's origin through CORS.

IBM Plex Sans is downloaded at build time by `next/font/google` and served locally to browsers. The first build needs access to Google Fonts.

## Structure

- `schema`: shared Yup credential rules and reusable auth/login schemas.
- `service/api`: `authApi`, defined directly with `createApi` and a normal login mutation.
- `service/httpclient`: the shared `fetchBaseQuery` and form error handling.
- `slice`: in-memory token and employee state with `setCredentials` and `logout`.
- `store`: store factory, inferred types, typed hooks, and client provider.
- `components/forms`: reusable Formik fields used with `useFormik`.

Endpoints use the normal `query` pattern. The base query stays in `service/httpclient`; it configures the API URL, attaches the Redux bearer token through `prepareHeaders` (except for login), and validates HTTP success plus `responseCode: "00"`. The login mutation returns the API response directly. HTTP 422 validation details are mapped to matching form fields.

`makeStore()` creates a fresh store for each provider; the client provider initializes it once through `useState(makeStore)`. The root Suspense boundary is retained for the installed Next.js Cache Components configuration.

Authentication stays only in Redux memory. No browser storage, restoration, JWT decoding, expiry timers, or listener middleware is used. Refreshing or reopening the app requires login again. Client navigation keeps the existing store. Logout explicitly clears auth state and the auth API cache. HTTP 401 is an ordinary request error and does not automatically clear auth. The API must verify tokens and authorize protected requests.

The login schema trims email but preserves passwords exactly. Login checks for a nonempty access token and employee data before updating Redux.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Browser tests require a production build first. They use installed Google Chrome, start the production app on port 3100, and mock every login response with synthetic data. They never log in to the live backend. Screenshots and failure traces are written to the ignored `test-results` directory.

Registration, password recovery, token refresh, and live dashboard metrics remain outside phase one.
