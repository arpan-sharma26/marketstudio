# 4. Testing framework: Vitest

- **Status:** Accepted
- **Date:** 2026-07-19

## Context

The Cursor rules require unit and integration tests for high-risk logic (tenant
isolation, role permissions, validation). We need a fast, TypeScript-native test runner
that integrates cleanly with a Next.js + TypeScript project.

## Decision

Use **Vitest** as the unit/integration test framework, with the following conventions:

- Test files live next to the code they cover (`*.test.ts`) or under `src/**/__tests__`.
- Pure authorization and validation logic is tested directly with fixtures.
- RLS policies are documented and reviewable, and can be exercised against a local
  Supabase instance; database-backed integration tests are added as features land.

## Consequences

- Fast feedback loop with native ESM + TypeScript support.
- `npm run test` runs the whole suite; CI can run the same command.
- End-to-end browser testing (Playwright) can be added later if needed but is not part of
  the foundation.
