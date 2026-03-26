# metabase-skill

Minimal Metabase API transport layer plus a self-contained local AI skill for Codex and Claude Code.

## Install Locally

Canonical flow:

```bash
git clone <public-metabase-skill-repo>
cd <metabase-agent>
node ../metabase-skill/bin/install-local.mjs
```

To uninstall the skill:

```bash
node ../metabase-skill/bin/uninstall-local.mjs
```

The installer configures:

- `.agents/skills/metabase-skill`
- optional `.claude/skills/metabase-skill` symlink
- only the self-contained skill folder, with no `package.json`, `.env`, `gitignore`, or repo scaffolding changes

## Library

```ts
const { createMetabaseClient } = await import(
  "/absolute/path/to/.agents/skills/metabase-skill/sdk/metabase-client.mjs"
);

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
npm run build
npm run typecheck
npm test
```
