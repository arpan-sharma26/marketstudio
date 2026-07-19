# 2. Multi-tenant authorization model

- **Status:** Accepted
- **Date:** 2026-07-19

## Context

The product brief, database design, and Cursor rules all require strict multi-tenant
isolation: a client (daycare business) must never access another client's data. The
database design explicitly warns that `profiles.platform_role` alone must not be used for
client-level authorization, and that a browser-provided `client_id` must never be trusted.

## Decision

Authorization is resolved from the authenticated user's **memberships**, enforced at two
layers:

1. **Application layer** — centralized helpers in `lib/permissions` and `lib/auth`
   resolve the profile, client membership, client role, and location access, and expose a
   named-permission checker `can(permission, context)`.
2. **Database layer** — Row Level Security on every client-owned table, backed by
   `SECURITY DEFINER` helper functions to avoid recursive policy evaluation.

Access is granted when the user has an active `client_memberships` row with a sufficient
role, **or** holds an authorized platform role (super_admin / market_studio_admin, or an
account_manager assigned to that client). Location-restricted users additionally require a
`location_memberships` row for the target location.

## Consequences

- No raw role comparisons in components; all checks go through helpers.
- A bug in a query cannot leak data because RLS is a second, independent gate.
- Helper functions are `SECURITY DEFINER` and reference `auth.uid()`; they must be written
  carefully to avoid privilege escalation and infinite policy recursion.
- Cross-client access is prevented by `assertSameClient` plus RLS.
