# Requirements

These are the baseline requirements satisfied by this template. A team adopting the
template inherits everything below as **Verified**, then appends their own project
requirements as new rows.

## 1. Requirement Matrix

Use the matrix below to track requirements throughout the project lifecycle.

- **Category:** Functional (REQ-F), Non-Functional (REQ-NF)
- **Status:** Backlog, In-progress, Verified, Deferred, Deprecated
- **Mapping:** baseline requirements map to the source that implements them; project
  requirements you add should map to a GitHub issue.

| ID        | Description                                                                                      | Status   | Target Semester | Mapping (source / issue)                     |
| --------- | ------------------------------------------------------------------------------------------------ | -------- | --------------- | -------------------------------------------- |
| REQ-F-01  | Passwordless sign-in via email OTP (Better Auth + Nodemailer); OTP emailed to an existing user   | Verified | 2026F           | `server/utils/auth.ts`, `app/pages/auth.vue` |
| REQ-F-02  | Server API gateway rejects unauthenticated requests to non-public routes with HTTP 401           | Verified | 2026F           | `server/middleware/auth.ts`                  |
| REQ-F-03  | Client route guard redirects signed-out users to `/auth` and signed-in users away from `/auth`   | Verified | 2026F           | `app/middleware/auth.global.ts`              |
| REQ-F-04  | Authenticated user can upload a profile image, stored per-user under the configured storage path | Verified | 2026F           | `server/api/users/upload.post.ts`            |
| REQ-F-05  | Profile image is served with its `Content-Type` detected from file contents (magic bytes)        | Verified | 2026F           | `server/api/users/[id]/profile.get.ts`       |
| REQ-F-06  | User-list endpoint returns only non-sensitive fields and never leaks image storage paths         | Verified | 2026F           | `server/api/users/index.get.ts`              |
| REQ-F-07  | Unauthenticated `/api/health` endpoint returns HTTP 200 for load-balancer probes                 | Verified | 2026F           | `server/api/health.ts`                       |
| REQ-NF-01 | Persistence is type-safe: Drizzle ORM schema with generated Zod select/insert schemas            | Verified | 2026F           | `server/db/schema.ts`                        |
| REQ-NF-02 | CI runs lint, type-check, and the Vitest suite on every PR and on `dev`/`stage`/`prod` pushes    | Verified | 2026F           | `.github/workflows/test.yml`                 |
| REQ-NF-03 | Deploy pipeline order is build → migrate → push → deploy, so a failed migration never ships       | Verified | 2026F           | `.github/workflows/deploy.yml`               |
| REQ-NF-04 | `stage`/`prod` auto-deploy to AWS ECS via GitHub OIDC — no static AWS keys stored                | Verified | 2026F           | `.github/workflows/{stage,prod}.yml`         |
| REQ-NF-05 | App ships as a container image with the toolchain to compile native modules in the builder       | Verified | 2026F           | `Dockerfile`                                 |
| REQ-NF-06 | Test baseline runs with no `.env`, database, email, or browser (`pnpm test` works on clone)      | Verified | 2026F           | `vitest.config.ts`, `tests/`                 |
| REQ-NF-07 | Dependency versions are pinned for reproducible, deploy-safe builds                              | Verified | 2026F           | `package.json`                               |

## 2. Change Log

Track major changes, additions, or deprecations to the project scope.

| Date       | Requirement ID | Change Description                                                                   | Author      | Approved By |
| ---------- | -------------- | ------------------------------------------------------------------------------------ | ----------- | ----------- |
| 2026-08-23 | REQ-F/NF-\*    | Established the initial requirements register from the template baseline             | @TusharW4ni | —           |
| 2026-08-23 | REQ-NF-07      | Pinned `better-auth@1.6.23` and `better-sqlite3@12.11.1` to keep the deploy build and migration Lambda working | @TusharW4ni | —           |
| 2026-08-23 | REQ-NF-05      | Added `python3`/`make`/`g++` to the Docker builder so native modules compile         | @TusharW4ni | —           |
