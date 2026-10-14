# Product intent and design direction

Read this document before starting project or feature work, together with [spec.md](./spec.md) and the relevant scope in [PLAN.md](./PLAN.md). It records lasting product preferences; the current user request determines what to implement.

## Product goal

Build a modern, polished, coherent Tymer admin dashboard from login through daily workspace operations. Use clear typography, generous spacing, balanced layouts, cohesive navigation, informative charts, and refined interaction feedback. Approach decisions with the judgment of an experienced software and product/UI/UX engineer: understand the user's task, make information easy to scan, and keep interactions clear and consistent.

Use the existing API models and related mock records to understand the product's entities, relationships, statuses, and workflows. Choose meaningful metrics and charts that help administrators understand their organization and decide what to do next.

## Preferred design references

The mock dashboard implements the selected direction below. The October 13, 2026 dashboard request replaces the earlier violet preset preference with teal and neutral surfaces, retaining IBM Plex Sans and Lucide.

| Area | Reference | Intended use |
| --- | --- | --- |
| Visual foundation | Teal accents, neutral surfaces, Luma primitives | Share theme tokens across login, dashboard, tables, and charts. Retain IBM Plex Sans, Lucide, and the existing radius scale. |
| Dashboard shell | shadcn `sidebar-07` | Inspiration for workspace navigation, sidebar, and dashboard composition. |
| Login shell | shadcn `login-03` | Inspiration for the login layout and presentation. |
| Donut visualization | `@uiarc/donut-chart` | Prefer for part-to-whole data when it communicates the metric clearly. |
| Waffle visualization | `@uiarc/waffle-chart` | Prefer for suitable proportions, progress, or counts with an understandable scale. |

Use **npm** as the project's package manager and **npx** to run CLI tools. The reference commands are:

```sh
npx shadcn@latest add sidebar-07
npx shadcn@latest add login-03
npx shadcn@latest add @uiarc/donut-chart
npx shadcn@latest add @uiarc/waffle-chart
```

These commands identify the requested references. Inspect the preset/registry requirements when UI implementation is in scope.

Use the installed Tailwind palette through shared CSS tokens: teal-700 primary, teal-50 selection backgrounds, white cards, and neutral surfaces/text/borders. Adapt the shell references to Tymer's content and workflows. Retain the existing radius scale.

## User experience expectations

- Build responsive layouts that remain readable and usable on mobile and desktop. Keep navigation, hierarchy, spacing, and interaction patterns consistent.
- Keep table presentation consistent across features by reusing shadcn Table primitives and shared table behavior where appropriate. Make rows, columns, and actions easy to scan and operate; follow the reuse rules in [spec.md](./spec.md).
- Make charts informative: use clear titles, labels, units, legends where needed, and a readable summary or accessible equivalent. Preserve the meaning of zero, missing, and undisclosed data; choose the visualization to fit the question.
- Provide visible labels, keyboard access, focus states, accessible names, and readable feedback. Do not rely on color alone to convey status.
- Give lists, forms, and charts meaningful loading, empty, error, and success states. Prevent duplicate submissions and make recovery clear.
- Every visible control must have a defined behavior. Implement it within the requested scope or omit it until its behavior is available.
- Ask the user about consequential, unresolved design choices, such as a feature's primary workflow, important metrics, or competing layout directions. Inspect existing patterns first and resolve routine details consistently.

## Current phase and future work

The app has an admin login, an operations overview, and protected employee, location, attendance, patrol, task, visitor, and organization pages. Mock mode is the default, authentication stays in memory, and typed RTK Query reads connect the response-backed fixture domains. Academic fixtures remain request-only because response payloads are unspecified.

The workspace supports browsing, searching, sorting, filtering, pagination, and record inspection. Record mutations, academic screens, and backend integration require further scope. The overview uses the fixture day and Africa/Lagos time; do not fabricate historical trends or hide pending evidence/verification states. Consult [PLAN.md](./PLAN.md) for progress and [spec.md](./spec.md) for implementation rules.
