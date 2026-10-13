<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Required project guidance

Before starting any project or feature work in this repository, read:

1. [intent.md](./intent.md) for product goals, design references, and user experience expectations.
2. [spec.md](./spec.md) for architecture, engineering conventions, and the required `useFormik` form pattern.
3. [PLAN.md](./PLAN.md) for the relevant feature scope, decisions, progress, and verification history. Historical sections describe superseded behavior; inspect the current implementation.

Use [README.md](./README.md) for setup and verification commands. Follow the user's current instructions and authorized scope. Design references describe future preferences and do not independently authorize installations, new screens, folder migrations, or backend integration.

Keep product intent in `intent.md`, lasting technical conventions in `spec.md`, and feature-specific scope/progress in `PLAN.md`. Resolve consequential product/design uncertainty with the user after inspecting existing patterns. Preserve the Next.js guidance above and read the relevant installed guide before writing Next.js code.
