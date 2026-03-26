import assert from "node:assert/strict";
import test from "node:test";

import { config as loadDotEnv } from "dotenv";

import { createMetabaseClient } from "../src/index.js";

loadDotEnv();

const shouldRunLive =
  process.env.METABASE_LIVE_TEST === "1" &&
  Boolean(process.env.METABASE_BASE_URL) &&
  Boolean(process.env.METABASE_API_KEY);

const maybeTest = shouldRunLive ? test : test.skip;

maybeTest("live: session, discovery, search, dataset, and saved card queries work", async () => {
  const client = createMetabaseClient({
    apiKey: process.env.METABASE_API_KEY!,
    baseUrl: process.env.METABASE_BASE_URL!
  });

  const session = await client.session.properties();
  const currentUser = await client.user.current();
  const databases = await client.database.list();

  assert.ok(session.version?.tag);
  assert.ok(currentUser.id);
  assert.ok(databases.data.length > 0);

  const database = databases.data[0];
  assert.ok(database?.id);

  const metadata = await client.database.metadata(database.id);

  assert.ok(Array.isArray(metadata.tables));
  assert.ok((metadata.tables?.length ?? 0) > 0);

  const table = metadata.tables?.[0];
  assert.ok(table?.id);

  const search = await client.search.list({ q: String(table.name ?? "").toLowerCase() });

  assert.ok(Array.isArray(search.data));

  const mbqlResult = await client.dataset.query({
    database: database.id,
    query: {
      limit: 1,
      "source-table": table.id
    },
    type: "query"
  });

  assert.ok(Array.isArray(mbqlResult.data?.rows));

  const nativeResult = await client.dataset.query({
    database: database.id,
    native: {
      query: "select 1 as value"
    },
    parameters: [],
    type: "native"
  });

  assert.ok(Array.isArray(nativeResult.data?.rows));

  const cards = await client.card.list();

  if (cards.length > 0 && typeof cards[0]?.id === "number") {
    const cardId = cards[0].id;
    const cardResult = await client.card.query(cardId, {
      ignore_cache: true
    });

    assert.ok(Array.isArray(cardResult.data?.rows));
  }
});
