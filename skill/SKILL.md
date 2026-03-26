---
name: metabase
description: Research Metabase databases, inspect schema, run saved questions, and execute ad-hoc MBQL or SQL through the Metabase API without MCP. Use when a project can provide METABASE_BASE_URL and METABASE_API_KEY and this installed metabase-skill folder is available.
---

# Metabase API Skill

Use this skill when you need Metabase-backed research or analytics through the installed self-contained `metabase-skill` bundle.

## Fast Start

- Get `METABASE_BASE_URL` and `METABASE_API_KEY` from the user or the project configuration.
- This installed skill folder is self-contained. The transport layer is bundled at `sdk/metabase-client.mjs`.
- Import `createMetabaseClient` from that bundled module.
- Example:
  ```js
  const { createMetabaseClient } = await import("/absolute/path/to/.../skills/metabase-skill/sdk/metabase-client.mjs");
  const client = createMetabaseClient({ baseUrl, apiKey });
  ```
- Create one client with `createMetabaseClient({ baseUrl, apiKey })`.
- Use the transport helpers from that client instance, for example `client.database.list()` or `client.dataset.query(...)`.
- Prefer helper namespaces over ad-hoc endpoints:
  - `session.properties()`, `user.current()`
  - `database.list()`, `database.metadata(id)`
  - `table.queryMetadata(id)`, `field.summary(id)`, `field.values(id)`
  - `search.list({ q })`
  - `card.list()`, `card.get(id)`, `card.query(id)`
  - `dashboard.get(id)`, `dashboard.queryCard(...)`
  - `dataset.query(...)` for ad-hoc MBQL or native SQL

## Recommended Workflow

1. Confirm access with `session.properties()` and `user.current()`.
2. Discover databases with `database.list()` and detailed schema with `database.metadata(id)`.
3. Narrow quickly with `search.list({ q })`.
4. For saved content, inspect `collection`, `card`, and `dashboard` helpers first.
5. For ad-hoc analysis, use `dataset.query(...)`.

## Guidance

- If you need the actual transport functions, load them from this skill folder's `sdk/metabase-client.mjs`, not from the repo being analyzed.
- Prefer metadata and saved questions before writing native SQL from scratch.
- Use `card.queryJson(...)` when you want ready-to-consume row objects.
- Use `dataset.export(...)`, `card.queryExport(...)`, or `dashboard.queryCardExport(...)` for CSV/XLSX/JSON downloads.
- Fall back to raw `client.get/post/put/delete` only when a helper does not cover the endpoint.
- The bundled client is intentionally small and helper-first. Prefer those helpers over building large custom abstractions in the repo you are analyzing.
