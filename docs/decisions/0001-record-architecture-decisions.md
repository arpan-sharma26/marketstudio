# 1. Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-07-19

## Context

Market Studio is a multi-tenant platform where architectural choices (especially around
authorization and multi-tenancy) have long-lived security implications. We need a
lightweight, durable record of significant decisions and their rationale.

## Decision

We will use Architecture Decision Records (ADRs) stored in `docs/decisions/`. Each ADR is
a numbered Markdown file with Context, Decision, and Consequences. ADRs are append-only:
to change a decision, add a new ADR that supersedes the old one.

## Consequences

- Contributors can understand *why* a structure exists, not just *what* it is.
- Reviewers can check new work against recorded decisions.
- The `.cursor/rules/market-studio.mdc` requirement to "identify the conflict before
  making a major architectural change" is supported by a written history.
