# Engineering specifications and conventions

Read this document before starting project or feature work, together with [intent.md](./intent.md) and the relevant scope in [PLAN.md](./PLAN.md). Follow the current user request and inspect the actual implementation before applying a convention. Keep the plan's progress and verification history separate from these lasting standards.

## Architecture and folder ownership

This project uses Next.js App Router, TypeScript, Redux Toolkit/RTK Query, Formik, Yup, and shadcn components. The `@/*` alias maps to the repository root. Read the relevant installed Next.js guides required by [AGENTS.md](./AGENTS.md) before writing Next.js code.

| Location | Responsibility |
| --- | --- |
| `app/` | Routes, layouts, metadata, and small compositions of feature components. |
| `components/ui/` | Presentation primitives and local interaction behavior; no Formik, Yup, Redux, RTK Query, or business/API logic. |
| `components/shared/` | Preferred location for new cross-feature adapters and reusable product components, introduced when feature work needs them. |
| `components/auth/`, `components/dashboard/` | Existing feature components and shells. Keep domain-specific behavior with its feature. |
| `components/forms/` | Existing reusable Formik field implementation. Reuse it when suitable; migrate only during explicitly scoped refactoring. |
| `schema/` | Shared Yup validators and domain schemas. |
| `models/api-request.ts` | Named mutation bodies, query parameters, and operation request contracts. |
| `models/api-response.ts` | Response envelopes, DTOs, pagination, and operation response contracts. |
| `types/auth.ts` | Existing login and authentication state types. |
| `service/api/` | The shared `baseApi` and injected feature endpoint modules. |
| `service/httpclient/` | Mock/HTTP transport selection and centralized error handling. |
| `mock/` | Typed, fresh, related request/response fixtures. |
| `slice/`, `store/` | Redux state, store creation, typed hooks, and the client provider. |
| `lib/` | Common low-level utilities such as `cn`. |

Keep dependencies directed toward reusable lower layers. UI primitives may use primitive libraries and common utilities. Shared components may use primitives, models, and form adapters, but must not import feature internals or route files. Features may compose shared components and use services. Services must not import components. API models remain types only. Move code shared by features into a shared component or common utility rather than importing another feature's internals.

Use existing folders first and create new folders only when they have a concrete responsibility. The `components/shared/` convention is a destination for future reusable work, not a requirement to move existing code immediately.

## Forms: useFormik and typed adapters

Initialize every Formik form with the **`useFormik` hook**. Pass its typed result to reusable input and select adapters through a `formik` prop. Use a native form's `onSubmit={formik.handleSubmit}`.

Target usage for adapters created in future feature work:

```tsx
const formik = useFormik<LoginValues>({
  initialValues: { email: "", password: "" },
  validationSchema: loginSchema,
  onSubmit: handleSubmit,
});

<form noValidate onSubmit={formik.handleSubmit}>
  <FormInput name="email" label="Email address" formik={formik} />
  <FormInput name="password" label="Password" type="password" formik={formik} />
  <button type="submit" disabled={formik.isSubmitting}>Sign in</button>
</form>
```

`FormInput` and `FormSelectField` are the preferred adapter names when those components are introduced. This document does not implement them; the current form uses `FormField` in `components/forms/`.

- Type adapters with the form's value type and the Formik methods/state they actually consume. Read values, change/blur handlers, touched state, and errors from the supplied `formik` prop.
- Use `getFieldProps` for compatible inputs and `setFieldValue`/`setFieldTouched` when adapting a select or other control with a different event interface. Handle nested paths and non-string errors safely when needed.
- Avoid `<Formik>`, `<Field>`, `useFormikContext`, and adapters that depend on a Formik context provider.
- Keep labels, IDs, error messages, `aria-invalid`, and error descriptions connected. Show validation errors appropriately after interaction/submission, and preserve disabled and submitting states.
- Reuse validators from `schema/fields.ts` and compose domain schemas in `schema/`. Add shared validators there when a rule is reused, with its business reason. Do not scatter repeated regular expressions or switch to Zod.
- Preserve existing login semantics: trim email, submit passwords exactly, and require a password without imposing signup-strength rules on login. Prevent duplicate submissions and handle request cancellation where relevant.

## Models, data, and API behavior

- Use named request and response types from the existing model files, with specific imports. Do not define API body/parameter/response shapes inline inside endpoints, components, or hooks. Local presentation props and view models may be defined where appropriate.
- Preserve exact API field casing, enum values, nullability, decimal-string values, and domain-specific list properties. Read the actual type; do not assume every list uses `items` or that all pagination envelopes are the same.
- The existing envelope is `ApiResponse<T>` with `responseCode`, `responseMessage`, and optional/nullable `data`. Preserve it at the service boundary. Components may read `.data` after appropriate checks; do not automatically add `transformResponse` unwrapping.
- Academic response aliases leave the payload generic. Keep their mocks request-only until actual response shapes are supplied; do not invent DTOs or currency/business rules from another project.
- Call `createApi` once in `service/api/base.api.ts`. Feature modules inject endpoints into that instance and export generated hooks. Keep endpoint names unique; never resolve collisions with `overrideExisting: true`.
- Importing a feature API or hook registers its endpoints. The store registers the shared API reducer and middleware once. Do not assume an endpoint-registration barrel exists or introduce a second API slice.
- Use actual endpoint contracts and paths, such as `/admin/login`. This project has no universal `/api/v1/` prefix requirement. Centralize repeated route/asset paths when introduced without assuming nonexistent utilities already exist.
- Use centralized error handling from `service/httpclient/`, including `getApiError` for the current login flow. Extend its behavior when new domains require it; do not expose stacks or unprocessed internal errors to users.

## Mock mode and authentication

Backend integration requires an explicit user request. Keep `NEXT_PUBLIC_DATA_SOURCE` in mock mode during current feature development; only the exact value `api` selects HTTP transport. Missing or unrecognized values use mocks. Public environment changes require a development restart or a production rebuild.

Mock dispatch uses the RTK Query endpoint name. Only `login` currently has a handler. Unsupported operations return a clear error with no HTTP fallback. When a future feature requires another operation, add its mock behavior within that feature's scope and verify that it never calls the backend.

Use `createMockData()` from `mock/index.ts` for related fixture examples. Each call returns fresh records, arrays, and upload blobs. Keep fixtures in memory and reset to defaults on reload. Importing a request example does not execute a mutation. Preserve consistent identities and derive summaries from their records. Demo credentials/tokens are synthetic; upload placeholders are not real biometric images, and QR generation currently supplies an error example.

Authentication lives only in Redux memory. Read the token from `state.auth.token`; do not add local/session storage, cookies, restoration, expiry parsing, token refresh, or automatic HTTP-401 logout without a requested change. Client navigation retains the store; refreshing requires login again. Logout clears authentication and all shared API caches. Retain required login-data checks before setting credentials.

## Code, UI, and verification

- Use TypeScript without `any`; use `unknown` and narrow when data is uncertain. Prefer precise types and avoid assertions that conceal mismatches.
- Export components in PascalCase from kebab-case files. Retain Next.js route naming, existing `.api.ts`/`.slice.ts` conventions, named `<Operation>Request`/`<Operation>Response` contracts, and `use*` hook names.
- Keep route files small and compose feature components. Declare `"use client"` at the boundary that needs hooks or browser interaction; keep static composition and metadata on the server where possible. Provide the required Suspense boundary when using `useSearchParams`.
- Apply design tokens from `app/globals.css` and the selected preset; avoid scattered raw color values. Do not impose zero radius or introduce a theme policy that conflicts with [intent.md](./intent.md).
- Build reusable charts with clear data props; keep data retrieval/aggregation outside presentation primitives. Provide readable empty/error/loading states and accessible summaries. Prefer the requested chart references when suitable.
- Keep rendered controls functional and layouts responsive. If a reusable table or component owns its loading/empty states, avoid duplicating that presentation around it. Do not assume unimplemented helpers, tables, toasters, or modal systems exist.
- Run verification appropriate to the change. Behavior changes normally require lint, TypeScript checks, relevant unit tests, and browser/build checks where warranted. Test outcomes and failure cases rather than merely repeating the implementation.
- In mock mode, verify absence of backend requests alongside the feature's behavior. Run existing HTTP regression tests in their explicit API-mode configuration; browser configuration must match the production build's data source.
- For documentation-only changes, check links, file references, and agreement with the implementation; application tests are unnecessary. Record material decisions and actual verification in [PLAN.md](./PLAN.md).

Consult [intent.md](./intent.md) for product/design decisions and [README.md](./README.md) for setup, demo credentials, fixture usage, and test commands.
