import assert from "node:assert/strict";
import test from "node:test";

import { MetabaseApiError, createMetabaseClient } from "../src/index.js";

test("creates URLs with path params, query params, and auth headers", async () => {
  let capturedUrl = "";
  let capturedHeaders = new Headers();

  const client = createMetabaseClient({
    apiKey: "mb_test",
    baseUrl: "https://example.com/root/",
    fetch: async (input, init) => {
      capturedUrl = String(input);
      capturedHeaders = new Headers(init?.headers);
      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          "content-type": "application/json"
        },
        status: 200
      });
    }
  });

  await client.get("/api/database/{id}/metadata", {
    pathParams: { id: 42 },
    query: {
      include_hidden: true,
      skip_fields: false
    }
  });

  assert.equal(capturedUrl, "https://example.com/root/api/database/42/metadata?include_hidden=true&skip_fields=false");
  assert.equal(capturedHeaders.get("x-api-key"), "mb_test");
  assert.match(capturedHeaders.get("accept") ?? "", /application\/json/);
});

test("serializes object bodies as JSON", async () => {
  let body = "";
  let contentType = "";

  const client = createMetabaseClient({
    apiKey: "mb_test",
    baseUrl: "https://example.com",
    fetch: async (_input, init) => {
      body = String(init?.body);
      contentType = new Headers(init?.headers).get("content-type") ?? "";
      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          "content-type": "application/json"
        },
        status: 200
      });
    }
  });

  await client.card.query(9, {
    ignore_cache: true
  });

  assert.equal(body, JSON.stringify({ ignore_cache: true }));
  assert.equal(contentType, "application/json");
});

test("parses text and binary responses", async () => {
  const responses = [
    new Response("a,b\n1,2\n", {
      headers: { "content-type": "text/csv" },
      status: 200
    }),
    new Response(new Uint8Array([1, 2, 3]), {
      headers: { "content-type": "application/octet-stream" },
      status: 200
    })
  ];

  const client = createMetabaseClient({
    apiKey: "mb_test",
    baseUrl: "https://example.com",
    fetch: async () => responses.shift() ?? new Response(null, { status: 500 })
  });

  const csv = await client.dataset.export("csv", {
    format_rows: true,
    pivot_results: false,
    query: { "source-table": 1 },
    visualization_settings: {}
  });
  const bytes = await client.dataset.export("xlsx", {
    format_rows: true,
    pivot_results: false,
    query: { "source-table": 1 },
    visualization_settings: {}
  });

  assert.equal(csv, "a,b\n1,2\n");
  assert.ok(bytes instanceof Uint8Array);
  assert.deepEqual(Array.from(bytes), [1, 2, 3]);
});

test("throws MetabaseApiError with parsed payload", async () => {
  const client = createMetabaseClient({
    apiKey: "mb_test",
    baseUrl: "https://example.com",
    fetch: async () =>
      new Response(JSON.stringify({ message: "bad request" }), {
        headers: {
          "content-type": "application/json"
        },
        status: 400,
        statusText: "Bad Request"
      })
  });

  await assert.rejects(
    client.search.list({ q: "orders" }),
    (error: unknown) => {
      assert.ok(error instanceof MetabaseApiError);
      assert.equal(error.status, 400);
      assert.deepEqual(error.data, { message: "bad request" });
      return true;
    }
  );
});
