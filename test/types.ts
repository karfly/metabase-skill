import { createMetabaseClient } from "../src/index.js";
import type {
  MetabaseAvailableMethod,
  MetabasePathParams,
  MetabaseQueryParams,
  MetabaseSpecRequestBody
} from "../src/index.js";

const pathParams: MetabasePathParams<"/api/database/{id}/metadata", "get"> = {
  id: 1
};

const searchQuery: MetabaseQueryParams<"/api/search/", "get"> = {
  models: ["table", "card"],
  q: "orders"
};

const cardBody: MetabaseSpecRequestBody<"/api/card/{card-id}/query", "post"> = {
  ignore_cache: true
};

const datasetBody: MetabaseSpecRequestBody<"/api/dataset/", "post"> = {
  database: 1
};

const method: MetabaseAvailableMethod<"/api/card/{card-id}/query"> = "post";

const client = createMetabaseClient({
  apiKey: "mb_test",
  baseUrl: "https://example.com"
});

void client.get("/api/database/{id}/metadata", { pathParams });
void client.get("/api/search/", { query: searchQuery });
void client.post("/api/card/{card-id}/query", {
  body: cardBody,
  pathParams: { "card-id": 7 }
});
void client.post("/api/dataset/", { body: datasetBody });
void method;

