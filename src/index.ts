type JsonRecord = Record<string, unknown>;
type BinaryBody = ArrayBuffer | ArrayBufferView | Blob | FormData | URLSearchParams;

export type MetabaseExportFormat = string;

export interface MetabaseRequestOptions<Body = unknown> {
  body?: Body | undefined;
  contentType?: string | undefined;
  headers?: HeadersInit | undefined;
  pathParams?: Record<string, unknown> | undefined;
  query?: Record<string, unknown> | undefined;
  signal?: AbortSignal | undefined;
}

export interface CreateMetabaseClientOptions {
  apiKey: string;
  baseUrl: string;
  fetch?: typeof fetch;
  userAgent?: string;
}

export interface MetabaseRawResponse<Data = unknown> {
  data: Data;
  headers: Headers;
  response: Response;
  status: number;
  url: string;
}

export interface MetabaseSessionProperties extends JsonRecord {
  version?: JsonRecord & {
    date?: string;
    hash?: string;
    tag?: string;
  };
}

export interface MetabaseUser extends JsonRecord {
  common_name?: string;
  email?: string;
  group_ids?: number[];
  id?: number;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface MetabaseQueryColumn extends JsonRecord {
  base_type?: string;
  display_name?: string;
  effective_type?: string;
  field_ref?: unknown[];
  id?: number | string;
  name?: string;
  source?: string;
}

export interface MetabaseQueryResult extends JsonRecord {
  data?: JsonRecord & {
    cols?: MetabaseQueryColumn[];
    native_form?: JsonRecord;
    results_metadata?: {
      columns?: MetabaseQueryColumn[];
    };
    rows?: unknown[][];
  };
  row_count?: number;
  running_time?: number;
  status?: string;
}

export interface MetabaseField extends JsonRecord {
  base_type?: string;
  display_name?: string;
  effective_type?: string;
  fk_target_field_id?: number | null;
  has_field_values?: string;
  id?: number;
  name?: string;
  semantic_type?: string | null;
  table_id?: number;
}

export interface MetabaseTable extends JsonRecord {
  db_id?: number;
  fields?: MetabaseField[];
  id?: number;
  name?: string;
  schema?: string | null;
}

export interface MetabaseDatabase extends JsonRecord {
  engine?: string;
  id?: number;
  is_sample?: boolean;
  name?: string;
  tables?: MetabaseTable[];
}

export interface MetabaseFieldValues extends JsonRecord {
  field_id?: number;
  has_more_values?: boolean;
  values?: unknown[];
}

export type MetabaseFieldSummary = unknown[];
export type MetabaseJsonRow = Record<string, unknown>;

export interface MetabaseCollection extends JsonRecord {
  can_write?: boolean;
  id?: number | string;
  is_personal?: boolean;
  name?: string;
}

export interface MetabaseCollectionItem extends JsonRecord {
  collection_id?: number | null;
  database_id?: number | null;
  id?: number | string;
  model?: string;
  name?: string;
}

export interface MetabaseCard extends JsonRecord {
  collection_id?: number | null;
  database_id?: number;
  dataset_query?: JsonRecord;
  display?: string;
  id?: number;
  name?: string;
  result_metadata?: MetabaseQueryColumn[];
}

export interface MetabaseDashboard extends JsonRecord {
  collection_id?: number | null;
  id?: number;
  name?: string;
  parameters?: Array<JsonRecord & { id?: string }>;
}

export interface MetabaseSearchItem extends JsonRecord {
  collection?: JsonRecord | null;
  database_id?: number | null;
  id?: number;
  model?: string;
  name?: string;
  table_id?: number | null;
}

export interface MetabaseListResponse<T> extends JsonRecord {
  data: T[];
  total?: number;
}

export interface MetabaseDatasetRequest extends JsonRecord {
  constraints?: JsonRecord;
  database?: number;
  middleware?: JsonRecord;
  native?: JsonRecord & {
    query?: string;
  };
  parameters?: unknown[];
  query?: JsonRecord;
  type?: string;
}

export interface MetabaseQueryExportRequest extends JsonRecord {
  format_rows?: boolean;
  parameters?: unknown[];
  pivot_results?: boolean;
  query?: JsonRecord;
  visualization_settings?: JsonRecord;
}

export interface MetabaseCardQueryRequest extends JsonRecord {
  collection_preview?: boolean;
  dashboard_id?: number;
  ignore_cache?: boolean;
}

export interface MetabaseDashboardCardQueryRequest extends JsonRecord {
  dashboard_load_id?: string;
  parameters?: Array<JsonRecord & { id: string }>;
}

export class MetabaseApiError extends Error {
  readonly data: unknown;
  readonly headers: Headers;
  readonly method: string;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;

  constructor(message: string, options: {
    data: unknown;
    headers: Headers;
    method: string;
    status: number;
    statusText: string;
    url: string;
  }) {
    super(message);
    this.name = "MetabaseApiError";
    this.data = options.data;
    this.headers = options.headers;
    this.method = options.method;
    this.status = options.status;
    this.statusText = options.statusText;
    this.url = options.url;
  }
}

export interface MetabaseClient {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly session: {
    properties(options?: { signal?: AbortSignal }): Promise<MetabaseSessionProperties>;
  };
  readonly user: {
    current(options?: { signal?: AbortSignal }): Promise<MetabaseUser>;
  };
  readonly database: {
    get(id: number, options?: { query?: Record<string, unknown>; signal?: AbortSignal }): Promise<MetabaseDatabase>;
    list(options?: { signal?: AbortSignal }): Promise<MetabaseListResponse<MetabaseDatabase>>;
    metadata(id: number, query?: Record<string, unknown>, options?: { signal?: AbortSignal }): Promise<MetabaseDatabase>;
  };
  readonly table: {
    get(id: number, options?: { signal?: AbortSignal }): Promise<MetabaseTable>;
    list(options?: { signal?: AbortSignal }): Promise<MetabaseTable[]>;
    fks(id: number, options?: { signal?: AbortSignal }): Promise<JsonRecord[]>;
    queryMetadata(id: number, options?: { signal?: AbortSignal }): Promise<MetabaseTable>;
  };
  readonly field: {
    get(id: number, options?: { signal?: AbortSignal }): Promise<MetabaseField>;
    summary(id: number, options?: { signal?: AbortSignal }): Promise<MetabaseFieldSummary>;
    values(id: number, options?: { signal?: AbortSignal }): Promise<MetabaseFieldValues>;
  };
  readonly search: {
    list(query?: Record<string, unknown>, options?: { signal?: AbortSignal }): Promise<MetabaseListResponse<MetabaseSearchItem>>;
  };
  readonly collection: {
    get(id: number | string, options?: { signal?: AbortSignal }): Promise<MetabaseCollection>;
    items(id: number | string, query?: Record<string, unknown>, options?: { signal?: AbortSignal }): Promise<MetabaseListResponse<MetabaseCollectionItem>>;
    list(options?: { signal?: AbortSignal }): Promise<MetabaseCollection[]>;
  };
  readonly card: {
    get(id: number, options?: { query?: Record<string, unknown>; signal?: AbortSignal }): Promise<MetabaseCard>;
    list(options?: { signal?: AbortSignal }): Promise<MetabaseCard[]>;
    query(id: number, body?: MetabaseCardQueryRequest, options?: { signal?: AbortSignal }): Promise<MetabaseQueryResult>;
    queryExport(id: number, format: MetabaseExportFormat, body?: MetabaseQueryExportRequest, options?: { signal?: AbortSignal }): Promise<MetabaseJsonRow[] | string | Uint8Array | undefined>;
    queryJson(id: number, body?: MetabaseCardQueryRequest, options?: { signal?: AbortSignal }): Promise<MetabaseJsonRow[]>;
  };
  readonly dashboard: {
    get(id: number, options?: { signal?: AbortSignal }): Promise<MetabaseDashboard>;
    list(options?: { signal?: AbortSignal }): Promise<MetabaseDashboard[]>;
    queryCard(dashboardId: number, dashcardId: number, cardId: number, body?: MetabaseDashboardCardQueryRequest, options?: { signal?: AbortSignal }): Promise<MetabaseQueryResult>;
    queryCardExport(dashboardId: number, dashcardId: number, cardId: number, format: MetabaseExportFormat, body?: MetabaseDashboardCardQueryRequest, options?: { signal?: AbortSignal }): Promise<MetabaseJsonRow[] | string | Uint8Array | undefined>;
  };
  readonly dataset: {
    export(format: MetabaseExportFormat, body: MetabaseDatasetRequest | MetabaseQueryExportRequest, options?: { signal?: AbortSignal }): Promise<MetabaseJsonRow[] | string | Uint8Array | undefined>;
    native(body: MetabaseDatasetRequest, options?: { signal?: AbortSignal }): Promise<unknown>;
    query(body: MetabaseDatasetRequest, options?: { signal?: AbortSignal }): Promise<MetabaseQueryResult>;
    queryMetadata(body: MetabaseDatasetRequest, options?: { signal?: AbortSignal }): Promise<JsonRecord>;
  };
  delete<Result = unknown>(path: string, options?: MetabaseRequestOptions): Promise<Result>;
  get<Result = unknown>(path: string, options?: MetabaseRequestOptions): Promise<Result>;
  post<Result = unknown, Body = unknown>(path: string, options?: MetabaseRequestOptions<Body>): Promise<Result>;
  put<Result = unknown, Body = unknown>(path: string, options?: MetabaseRequestOptions<Body>): Promise<Result>;
  request<Result = unknown, Body = unknown>(method: string, path: string, options?: MetabaseRequestOptions<Body>): Promise<Result>;
  requestRaw<Result = unknown, Body = unknown>(method: string, path: string, options?: MetabaseRequestOptions<Body>): Promise<MetabaseRawResponse<Result>>;
}

function isBinaryBody(value: unknown): value is BinaryBody {
  return value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams;
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");

  if (!trimmed) {
    throw new Error("Metabase baseUrl must not be empty.");
  }

  return trimmed;
}

function buildPath(pathTemplate: string, pathParams?: Record<string, unknown>): string {
  return pathTemplate.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = pathParams?.[key];

    if (value === undefined || value === null) {
      throw new Error(`Missing required path param "${key}" for ${pathTemplate}.`);
    }

    return encodeURIComponent(String(value));
  });
}

function appendQuery(url: URL, query?: Record<string, unknown>): void {
  if (!query) {
    return;
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, serializeQueryValue(item));
      }
      continue;
    }

    url.searchParams.append(key, serializeQueryValue(value));
  }
}

function serializeQueryValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }

  return JSON.stringify(value);
}

function encodeBody(body: unknown, headers: Headers, contentType?: string): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (isBinaryBody(body)) {
    if (contentType) {
      headers.set("content-type", contentType);
    }
    return body as BodyInit;
  }

  if (typeof body === "string") {
    headers.set("content-type", contentType ?? "text/plain; charset=utf-8");
    return body;
  }

  headers.set("content-type", contentType ?? "application/json");
  return JSON.stringify(body);
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json") || contentType.includes("+json")) {
    const text = await response.text();
    return text ? JSON.parse(text) : undefined;
  }

  if (contentType.startsWith("text/") || contentType.includes("csv") || contentType.includes("xml") || contentType.includes("yaml")) {
    return response.text();
  }

  const arrayBuffer = await response.arrayBuffer();
  return arrayBuffer.byteLength > 0 ? new Uint8Array(arrayBuffer) : undefined;
}

export function createMetabaseClient(options: CreateMetabaseClientOptions): MetabaseClient {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const fetchImpl = options.fetch ?? globalThis.fetch;

  if (!fetchImpl) {
    throw new Error("No fetch implementation available. Pass one explicitly in createMetabaseClient({ fetch }).");
  }

  async function requestRaw<Result = unknown, Body = unknown>(
    method: string,
    path: string,
    requestOptions: MetabaseRequestOptions<Body> = {}
  ): Promise<MetabaseRawResponse<Result>> {
    const url = new URL(`${baseUrl}${buildPath(path, requestOptions.pathParams)}`);
    appendQuery(url, requestOptions.query);

    const headers = new Headers(requestOptions.headers);
    headers.set("x-api-key", options.apiKey);
    headers.set("accept", headers.get("accept") ?? "application/json, text/plain;q=0.9, */*;q=0.8");

    if (options.userAgent) {
      headers.set("user-agent", options.userAgent);
    }

    const body = encodeBody(requestOptions.body, headers, requestOptions.contentType);
    const init: RequestInit = {
      headers,
      method: method.toUpperCase()
    };

    if (body !== undefined) {
      init.body = body;
    }

    if (requestOptions.signal) {
      init.signal = requestOptions.signal;
    }

    const response = await fetchImpl(url, init);
    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new MetabaseApiError(`${method.toUpperCase()} ${url} failed with ${response.status} ${response.statusText}`, {
        data,
        headers: response.headers,
        method: method.toUpperCase(),
        status: response.status,
        statusText: response.statusText,
        url: url.toString()
      });
    }

    return {
      data: data as Result,
      headers: response.headers,
      response,
      status: response.status,
      url: url.toString()
    };
  }

  async function request<Result = unknown, Body = unknown>(
    method: string,
    path: string,
    requestOptions: MetabaseRequestOptions<Body> = {}
  ): Promise<Result> {
    const response = await requestRaw<Result, Body>(method, path, requestOptions);
    return response.data;
  }

  const client: MetabaseClient = {
    apiKey: options.apiKey,
    baseUrl,
    get(path, requestOptions) {
      return request("GET", path, requestOptions);
    },
    post(path, requestOptions) {
      return request("POST", path, requestOptions);
    },
    put(path, requestOptions) {
      return request("PUT", path, requestOptions);
    },
    delete(path, requestOptions) {
      return request("DELETE", path, requestOptions);
    },
    request,
    requestRaw,
    session: {
      properties(options) {
        return request("GET", "/api/session/properties", options);
      }
    },
    user: {
      current(options) {
        return request("GET", "/api/user/current", options);
      }
    },
    database: {
      list(options) {
        return request("GET", "/api/database/", options);
      },
      get(id, options) {
        return request("GET", "/api/database/{id}", {
          pathParams: { id },
          query: options?.query,
          signal: options?.signal
        });
      },
      metadata(id, query, options) {
        return request("GET", "/api/database/{id}/metadata", {
          pathParams: { id },
          query,
          signal: options?.signal
        });
      }
    },
    table: {
      list(options) {
        return request("GET", "/api/table/", options);
      },
      get(id, options) {
        return request("GET", "/api/table/{id}", {
          pathParams: { id },
          signal: options?.signal
        });
      },
      queryMetadata(id, options) {
        return request("GET", "/api/table/{id}/query_metadata", {
          pathParams: { id },
          signal: options?.signal
        });
      },
      fks(id, options) {
        return request("GET", "/api/table/{id}/fks", {
          pathParams: { id },
          signal: options?.signal
        });
      }
    },
    field: {
      get(id, options) {
        return request("GET", "/api/field/{id}", {
          pathParams: { id },
          signal: options?.signal
        });
      },
      summary(id, options) {
        return request("GET", "/api/field/{id}/summary", {
          pathParams: { id },
          signal: options?.signal
        });
      },
      values(id, options) {
        return request("GET", "/api/field/{id}/values", {
          pathParams: { id },
          signal: options?.signal
        });
      }
    },
    search: {
      list(query, options) {
        return request("GET", "/api/search/", {
          query,
          signal: options?.signal
        });
      }
    },
    collection: {
      list(options) {
        return request("GET", "/api/collection/", options);
      },
      get(id, options) {
        return request("GET", "/api/collection/{id}", {
          pathParams: { id },
          signal: options?.signal
        });
      },
      items(id, query, options) {
        return request("GET", "/api/collection/{id}/items", {
          pathParams: { id },
          query,
          signal: options?.signal
        });
      }
    },
    card: {
      list(options) {
        return request("GET", "/api/card/", options);
      },
      get(id, options) {
        return request("GET", "/api/card/{id}", {
          pathParams: { id },
          query: options?.query,
          signal: options?.signal
        });
      },
      query(id, body = {}, options) {
        return request("POST", "/api/card/{card-id}/query", {
          body: {
            ignore_cache: false,
            ...body
          },
          pathParams: { "card-id": id },
          signal: options?.signal
        });
      },
      queryJson(id, body = {}, options) {
        return request("POST", "/api/card/{card-id}/query/json", {
          body: {
            ignore_cache: false,
            ...body
          },
          pathParams: { "card-id": id },
          signal: options?.signal
        });
      },
      queryExport(id, format, body = {}, options) {
        return request("POST", "/api/card/{card-id}/query/{export-format}", {
          body,
          pathParams: {
            "card-id": id,
            "export-format": format
          },
          signal: options?.signal
        });
      }
    },
    dashboard: {
      list(options) {
        return request("GET", "/api/dashboard/", options);
      },
      get(id, options) {
        return request("GET", "/api/dashboard/{id}", {
          pathParams: { id },
          signal: options?.signal
        });
      },
      queryCard(dashboardId, dashcardId, cardId, body = {}, options) {
        return request("POST", "/api/dashboard/{dashboard-id}/dashcard/{dashcard-id}/card/{card-id}/query", {
          body,
          pathParams: {
            "card-id": cardId,
            "dashboard-id": dashboardId,
            "dashcard-id": dashcardId
          },
          signal: options?.signal
        });
      },
      queryCardExport(dashboardId, dashcardId, cardId, format, body = {}, options) {
        return request("POST", "/api/dashboard/{dashboard-id}/dashcard/{dashcard-id}/card/{card-id}/query/{export-format}", {
          body,
          pathParams: {
            "card-id": cardId,
            "dashboard-id": dashboardId,
            "dashcard-id": dashcardId,
            "export-format": format
          },
          signal: options?.signal
        });
      }
    },
    dataset: {
      query(body, options) {
        return request("POST", "/api/dataset/", {
          body,
          signal: options?.signal
        });
      },
      native(body, options) {
        return request("POST", "/api/dataset/native", {
          body,
          signal: options?.signal
        });
      },
      queryMetadata(body, options) {
        return request("POST", "/api/dataset/query_metadata", {
          body,
          signal: options?.signal
        });
      },
      export(format, body, options) {
        return request("POST", "/api/dataset/{export-format}", {
          body,
          pathParams: { "export-format": format },
          signal: options?.signal
        });
      }
    }
  };

  return client;
}
