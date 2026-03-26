# metabase-skill

Reusable Metabase API transport layer plus a local AI skill for Codex and Claude Code.

## Install Locally

Canonical flow:

```bash
git clone <public-metabase-skill-repo>
cd <metabase-agent>
node ../metabase-skill/bin/install-local.mjs
```

The installer configures:

- local `file:` dependency on `../metabase-skill`
- `.env.example` and optional `.env`
- `AGENTS.md` and `CLAUDE.md`
- Codex and Claude local skill symlinks
- a smoke-check script for Metabase access

## Library

```ts
import { createMetabaseClient } from "metabase-skill";

const client = createMetabaseClient({
  baseUrl: process.env.METABASE_BASE_URL!,
  apiKey: process.env.METABASE_API_KEY!
});

const databases = await client.database.list();
const metadata = await client.database.metadata(databases.data[0].id!);
const rows = await client.card.queryJson(19, { ignore_cache: true });
```

Use helper namespaces first:

- `session`, `user`
- `database`, `table`, `field`, `search`
- `collection`, `card`, `dashboard`
- `dataset`

## Development

```bash
npm install
npm run sync:spec
npm run typecheck
npm test
```
