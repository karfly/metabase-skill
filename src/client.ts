import type { components, operations, paths } from "./generated/openapi.js";

export type MetabasePaths = paths;
export type MetabaseOperations = operations;
export type MetabaseExportFormat = components["schemas"]["metabase.query-processor.schema.export-format"];
export type MetabaseHttpMethod = "get" | "post" | "put" | "delete" | "patch" | "head" | "options" | "trace";
export type MetabasePathKey = keyof paths & string;

type JsonRecord = Record<string, unknown>;
type BinaryBody = ArrayBuffer | ArrayBufferView | Blob | FormData | URLSearchParams;
type SuccessStatus = `${2}${string}` | "2XX";
type NonUndefined<T> = T extends undefined ? never : T;
type ParsedFromSpec<T> = [T] extends [never] ? unknown : T;
type MethodsForPath<Path extends MetabasePathKey> = {
  [Method in MetabaseHttpMethod]-?: NonNullable<paths[Path][Method]> extends never ? never : Method;
}[MetabaseHttpMethod];
type PathsForMethod<Method extends MetabaseHttpMethod> = {
  [Path in MetabasePathKey]: Method extends MethodsForPath<Path> ? Path : never;
}[MetabasePathKey];
type OperationFor<Path extends MetabasePathKey, Method extends MethodsForPath<Path>> = NonNullable<paths[Path][Method]>;
type ParametersFor<Operation> = Operation extends { parameters?: infer Parameters } ? NonUndefined<Parameters> : never;
type RequestBodyForOperation<Operation> = Operation extends { requestBody?: infer RequestBody }
  ? NonUndefined<RequestBody> extends { content: infer Content }
    ? NonUndefined<Content> extends Record<string, unknown>
      ? "application/json" extends keyof Content
        ? Content["application/json"]
        : Content[keyof Content]
      : never
    : never
  : never;
type ResponseForOperation<Operation> = Operation extends { responses: infer Responses }
  ? {
      [Status in keyof Responses & string]: Status extends SuccessStatus
        ? Responses[Status] extends { content: infer Content }
          ? NonUndefined<Content> extends Record<string, unknown>
            ? "application/json" extends keyof Content
              ? Content["application/json"]
              : "text/plain" extends keyof Content
                ? Content["text/plain"]
                : "text/csv" extends keyof Content
                  ? Content["text/csv"]
                  : Content[keyof Content]
            : never
          : never
        : never;
    }[keyof Responses & string]
  : never;

export type MetabaseAvailableMethod<Path extends MetabasePathKey> = MethodsForPath<Path>;
export type MetabaseSpecRequestBody<Path extends MetabasePathKey, Method extends MetabaseHttpMethod> =
  Method extends MethodsForPath<Path> ? RequestBodyForOperation<OperationFor<Path, Method>> : never;
export type MetabaseSpecResponse<Path extends MetabasePathKey, Method extends MetabaseHttpMethod> =
  Method extends MethodsForPath<Path> ? ParsedFromSpec<ResponseForOperation<OperationFor<Path, Method>>> : never;
export type MetabasePathParams<Path extends MetabasePathKey, Method extends MetabaseHttpMethod> =
  Method extends MethodsForPath<Path>
    ? ParametersFor<OperationFor<Path, Method>> extends { path?: infer PathParams }
      ? NonUndefined<PathParams>
      : never
    : never;
export type MetabaseQueryParams<Path extends MetabasePathKey, Method extends MetabaseHttpMethod> =
  Method extends MethodsForPath<Path>
    ? ParametersFor<OperationFor<Path, Method>> extends { query?: infer Query }
      ? NonUndefined<Query>
      : never
    : never;

export interface MetabaseRequestOptions<
  Path extends MetabasePathKey,
  Method extends MetabaseHttpMethod,
  Body = MetabaseSpecRequestBody<Path, Method>
> {
  body?: Body;
  contentType?: string;
  headers?: HeadersInit;
  pathParams?: MetabasePathParams<Path, Method>;
  query?: MetabaseQueryParams<Path, Method>;
  signal?: AbortSignal;
}

interface InternalRequestOptions<Body = unknown> {
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

export interface MetabaseSessionVersion extends JsonRecord {
  date?: string;
  hash?: string;
  tag?: string;
}

export interface MetabaseSessionProperties extends JsonRecord {
  version?: MetabaseSessionVersion;
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
  data?: {
    cols?: MetabaseQueryColumn[];
    native_form?: JsonRecord;
    results_metadata?: {
      columns?: MetabaseQueryColumn[];
    };
    rows?: unknown[][];
  } & JsonRecord;
  row_count?: number;
  running_time?: number;
  status?: string;
}

export interface MetabaseDatabase extends JsonRecord {
  engine?: string;
  id?: number;
  is_sample?: boolean;
  name?: string;
  tables?: MetabaseTable[];
}

export interface MetabaseTable extends JsonRecord {
  db_id?: number;
  fields?: MetabaseField[];
  id?: number;
  name?: string;
  schema?: string | null;
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

export interface MetabaseFieldValues extends JsonRecord {
  field_id?: number;
  has_more_values?: boolean;
  values?: unknown[];
}

export type MetabaseFieldSummary = unknown[];

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

export type MetabaseJsonRow = Record<string, unknown>;

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
  readonly card: {
    get(id: number, options?: { query?: MetabaseQueryParams<"/api/card/{id}", "get">; signal?: AbortSignal }): Promise<MetabaseCard>;
    list(options?: { signal?: AbortSignal }): Promise<MetabaseCard[]>;
    query(id: number, body?: MetabaseCardQueryRequest, options?: { signal?: AbortSignal }): Promise<MetabaseQueryResult>;
    queryExport(id: number, format: string, body?: MetabaseQueryExportRequest, options?: { signal?: AbortSignal }): Promise<MetabaseJsonRow[] | string | Uint8Array | undefined>;
    queryJson(id: number, body?: MetabaseCardQueryRequest, options?: { signal?: AbortSignal }): Promise<MetabaseJsonRow[]>;
  };
  readonly collection: {
    get(id: number | string, options?: { signal?: AbortSignal }): Promise<MetabaseCollection>;
    items(id: number | string, query?: MetabaseQueryParams<"/api/collection/{id}/items", "get">, options?: { signal?: AbortSignal }): Promise<MetabaseListResponse<MetabaseCollectionItem>>;
    list(options?: { signal?: AbortSignal }): Promise<MetabaseCollection[]>;
  };
  readonly database: {
    get(id: number, options?: {
      query?: MetabaseQueryParams<"/api/database/{id}", "get">;
      signal?: AbortSignal;
    }): Promise<MetabaseDatabase>;
    list(options?: { signal?: AbortSignal }): Promise<MetabaseListResponse<MetabaseDatabase>>;
    metadata(id: number, query?: MetabaseQueryParams<"/api/database/{id}/metadata", "get">, options?: { signal?: AbortSignal }): Promise<MetabaseDatabase>;
  };
  readonly dataset: {
    export(format: string, body: MetabaseDatasetRequest | MetabaseQueryExportRequest, options?: { signal?: AbortSignal }): Promise<MetabaseJsonRow[] | string | Uint8Array | undefined>;
    native(body: MetabaseDatasetRequest, options?: { signal?: AbortSignal }): Promise<unknown>;
    query(body: MetabaseDatasetRequest, options?: { signal?: AbortSignal }): Promise<MetabaseQueryResult>;
    queryMetadata(body: MetabaseDatasetRequest, options?: { signal?: AbortSignal }): Promise<JsonRecord>;
  };
  readonly dashboard: {
    get(id: number, options?: { signal?: AbortSignal }): Promise<MetabaseDashboard>;
    list(options?: { signal?: AbortSignal }): Promise<MetabaseDashboard[]>;
    queryCard(
      dashboardId: number,
      dashcardId: number,
      cardId: number,
      body?: MetabaseDashboardCardQueryRequest,
      options?: { signal?: AbortSignal }
    ): Promise<MetabaseQueryResult>;
    queryCardExport(
      dashboardId: number,
      dashcardId: number,
      cardId: number,
      format: string,
      body?: MetabaseDashboardCardQueryRequest,
      options?: { signal?: AbortSignal }
    ): Promise<MetabaseJsonRow[] | string | Uint8Array | undefined>;
  };
  readonly field: {
    get(id: number, options?: { signal?: AbortSignal }): Promise<MetabaseField>;
    summary(id: number, options?: { signal?: AbortSignal }): Promise<MetabaseFieldSummary>;
    values(id: number, options?: { signal?: AbortSignal }): Promise<MetabaseFieldValues>;
  };
  readonly search: {
    list(query?: MetabaseQueryParams<"/api/search/", "get">, options?: { signal?: AbortSignal }): Promise<MetabaseListResponse<MetabaseSearchItem>>;
  };
  readonly session: {
    properties(options?: { signal?: AbortSignal }): Promise<MetabaseSessionProperties>;
  };
  readonly table: {
    get(id: number, options?: { signal?: AbortSignal }): Promise<MetabaseTable>;
    list(options?: { signal?: AbortSignal }): Promise<MetabaseTable[]>;
    fks(id: number, options?: { signal?: AbortSignal }): Promise<JsonRecord[]>;
    queryMetadata(id: number, options?: { signal?: AbortSignal }): Promise<MetabaseTable>;
  };
  readonly user: {
    current(options?: { signal?: AbortSignal }): Promise<MetabaseUser>;
  };
  delete<Path extends PathsForMethod<"delete">>(path: Path, options?: MetabaseRequestOptions<Path, "delete">): Promise<MetabaseSpecResponse<Path, "delete">>;
  get<Path extends PathsForMethod<"get">>(path: Path, options?: MetabaseRequestOptions<Path, "get">): Promise<MetabaseSpecResponse<Path, "get">>;
  post<Path extends PathsForMethod<"post">, Body = MetabaseSpecRequestBody<Path, "post">>(
    path: Path,
    options?: MetabaseRequestOptions<Path, "post", Body>
  ): Promise<MetabaseSpecResponse<Path, "post">>;
  put<Path extends PathsForMethod<"put">, Body = MetabaseSpecRequestBody<Path, "put">>(
    path: Path,
    options?: MetabaseRequestOptions<Path, "put", Body>
  ): Promise<MetabaseSpecResponse<Path, "put">>;
  request<Path extends MetabasePathKey, Method extends MethodsForPath<Path>, Body = MetabaseSpecRequestBody<Path, Method>>(
    method: Method,
    path: Path,
    options?: MetabaseRequestOptions<Path, Method, Body>
  ): Promise<MetabaseSpecResponse<Path, Method>>;
  requestRaw<Path extends MetabasePathKey, Method extends MethodsForPath<Path>, Body = MetabaseSpecRequestBody<Path, Method>>(
    method: Method,
    path: Path,
    options?: MetabaseRequestOptions<Path, Method, Body>
  ): Promise<MetabaseRawResponse<MetabaseSpecResponse<Path, Method>>>;
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

  if (arrayBuffer.byteLength === 0) {
    return undefined;
  }

  return new Uint8Array(arrayBuffer);
}

export function createMetabaseClient(options: CreateMetabaseClientOptions): MetabaseClient {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const apiKey = options.apiKey;
  const userAgent = options.userAgent;

  if (!fetchImpl) {
    throw new Error("No fetch implementation available. Pass one explicitly in createMetabaseClient({ fetch }).");
  }

  async function requestInternal<Result = unknown, Body = unknown>(
    method: string,
    path: string,
    requestOptions: InternalRequestOptions<Body> = {}
  ): Promise<MetabaseRawResponse<Result>> {
    const url = new URL(`${baseUrl}${buildPath(path, requestOptions.pathParams)}`);
    appendQuery(url, requestOptions.query);

    const headers = new Headers(requestOptions.headers);
    headers.set("x-api-key", apiKey);
    headers.set("accept", headers.get("accept") ?? "application/json, text/plain;q=0.9, */*;q=0.8");

    if (userAgent) {
      headers.set("user-agent", userAgent);
    }

    const body = encodeBody(requestOptions.body, headers, requestOptions.contentType);
    const init: RequestInit = {
      headers,
      method
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
      throw new MetabaseApiError(`${method} ${url} failed with ${response.status} ${response.statusText}`, {
        data,
        headers: response.headers,
        method,
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

  async function request<Path extends MetabasePathKey, Method extends MethodsForPath<Path>, Body = MetabaseSpecRequestBody<Path, Method>>(
    method: Method,
    path: Path,
    options: MetabaseRequestOptions<Path, Method, Body> = {}
  ): Promise<MetabaseSpecResponse<Path, Method>> {
    const result = await requestInternal<MetabaseSpecResponse<Path, Method>, Body>(
      method.toUpperCase(),
      path,
      options as InternalRequestOptions<Body>
    );

    return result.data;
  }

  async function requestRaw<Path extends MetabasePathKey, Method extends MethodsForPath<Path>, Body = MetabaseSpecRequestBody<Path, Method>>(
    method: Method,
    path: Path,
    options: MetabaseRequestOptions<Path, Method, Body> = {}
  ): Promise<MetabaseRawResponse<MetabaseSpecResponse<Path, Method>>> {
    return requestInternal<MetabaseSpecResponse<Path, Method>, Body>(
      method.toUpperCase(),
      path,
      options as InternalRequestOptions<Body>
    );
  }

  async function requestAny<Result = unknown, Body = unknown>(
    method: string,
    path: string,
    options: InternalRequestOptions<Body> = {}
  ): Promise<Result> {
    const result = await requestInternal<Result, Body>(method, path, options);

    return result.data;
  }

  const client = {
    apiKey: options.apiKey,
    baseUrl,
    get(path, requestOptions) {
      return requestInternal<MetabaseSpecResponse<typeof path, "get">>(
        "GET",
        path,
        requestOptions as InternalRequestOptions
      ).then((result) => result.data);
    },
    post(path, requestOptions) {
      return requestInternal<MetabaseSpecResponse<typeof path, "post">>(
        "POST",
        path,
        requestOptions as InternalRequestOptions
      ).then((result) => result.data);
    },
    put(path, requestOptions) {
      return requestInternal<MetabaseSpecResponse<typeof path, "put">>(
        "PUT",
        path,
        requestOptions as InternalRequestOptions
      ).then((result) => result.data);
    },
    delete(path, requestOptions) {
      return requestInternal<MetabaseSpecResponse<typeof path, "delete">>(
        "DELETE",
        path,
        requestOptions as InternalRequestOptions
      ).then((result) => result.data);
    },
    request,
    requestRaw,
    session: {
      properties(requestOptions) {
        return requestAny<MetabaseSessionProperties>("GET", "/api/session/properties", requestOptions);
      }
    },
    user: {
      current(requestOptions) {
        return requestAny<MetabaseUser>("GET", "/api/user/current", requestOptions);
      }
    },
    database: {
      list(requestOptions) {
        return requestAny<MetabaseListResponse<MetabaseDatabase>>("GET", "/api/database/", requestOptions);
      },
      get(id, requestOptions) {
        return requestAny<MetabaseDatabase>("GET", "/api/database/{id}", {
          pathParams: { id },
          query: requestOptions?.query as Record<string, unknown> | undefined,
          signal: requestOptions?.signal
        });
      },
      metadata(id, query, requestOptions) {
        return requestAny<MetabaseDatabase>("GET", "/api/database/{id}/metadata", {
          pathParams: { id },
          query: query as Record<string, unknown> | undefined,
          signal: requestOptions?.signal
        });
      }
    },
    table: {
      list(requestOptions) {
        return requestAny<MetabaseTable[]>("GET", "/api/table/", requestOptions);
      },
      get(id, requestOptions) {
        return requestAny<MetabaseTable>("GET", "/api/table/{id}", {
          pathParams: { id },
          signal: requestOptions?.signal
        });
      },
      queryMetadata(id, requestOptions) {
        return requestAny<MetabaseTable>("GET", "/api/table/{id}/query_metadata", {
          pathParams: { id },
          signal: requestOptions?.signal
        });
      },
      fks(id, requestOptions) {
        return requestAny<JsonRecord[]>("GET", "/api/table/{id}/fks", {
          pathParams: { id },
          signal: requestOptions?.signal
        });
      }
    },
    field: {
      get(id, requestOptions) {
        return requestAny<MetabaseField>("GET", "/api/field/{id}", {
          pathParams: { id },
          signal: requestOptions?.signal
        });
      },
      summary(id, requestOptions) {
        return requestAny<MetabaseFieldSummary>("GET", "/api/field/{id}/summary", {
          pathParams: { id },
          signal: requestOptions?.signal
        });
      },
      values(id, requestOptions) {
        return requestAny<MetabaseFieldValues>("GET", "/api/field/{id}/values", {
          pathParams: { id },
          signal: requestOptions?.signal
        });
      }
    },
    search: {
      list(query, requestOptions) {
        return requestAny<MetabaseListResponse<MetabaseSearchItem>>("GET", "/api/search/", {
          query: query as Record<string, unknown> | undefined,
          signal: requestOptions?.signal
        });
      }
    },
    collection: {
      list(requestOptions) {
        return requestAny<MetabaseCollection[]>("GET", "/api/collection/", requestOptions);
      },
      get(id, requestOptions) {
        return requestAny<MetabaseCollection>("GET", "/api/collection/{id}", {
          pathParams: { id },
          signal: requestOptions?.signal
        });
      },
      items(id, query, requestOptions) {
        return requestAny<MetabaseListResponse<MetabaseCollectionItem>>("GET", "/api/collection/{id}/items", {
          pathParams: { id },
          query: query as Record<string, unknown> | undefined,
          signal: requestOptions?.signal
        });
      }
    },
    card: {
      list(requestOptions) {
        return requestAny<MetabaseCard[]>("GET", "/api/card/", requestOptions);
      },
      get(id, requestOptions) {
        return requestAny<MetabaseCard>("GET", "/api/card/{id}", {
          pathParams: { id },
          query: requestOptions?.query as Record<string, unknown> | undefined,
          signal: requestOptions?.signal
        });
      },
      query(id, body = {}, requestOptions) {
        return requestAny<MetabaseQueryResult, MetabaseCardQueryRequest>("POST", "/api/card/{card-id}/query", {
          body: {
            ignore_cache: false,
            ...body
          },
          pathParams: { "card-id": id },
          signal: requestOptions?.signal
        });
      },
      queryJson(id, body = {}, requestOptions) {
        return requestAny<MetabaseJsonRow[], MetabaseCardQueryRequest>("POST", "/api/card/{card-id}/query/json", {
          body: {
            ignore_cache: false,
            ...body
          },
          pathParams: { "card-id": id },
          signal: requestOptions?.signal
        });
      },
      queryExport(id, format, body = {}, requestOptions) {
        return requestAny<MetabaseJsonRow[] | string | Uint8Array | undefined, MetabaseQueryExportRequest>("POST", "/api/card/{card-id}/query/{export-format}", {
          body,
          pathParams: {
            "card-id": id,
            "export-format": format
          },
          signal: requestOptions?.signal
        });
      }
    },
    dashboard: {
      list(requestOptions) {
        return requestAny<MetabaseDashboard[]>("GET", "/api/dashboard/", requestOptions);
      },
      get(id, requestOptions) {
        return requestAny<MetabaseDashboard>("GET", "/api/dashboard/{id}", {
          pathParams: { id },
          signal: requestOptions?.signal
        });
      },
      queryCard(dashboardId, dashcardId, cardId, body = {}, requestOptions) {
        return requestAny<MetabaseQueryResult, MetabaseDashboardCardQueryRequest>(
          "POST",
          "/api/dashboard/{dashboard-id}/dashcard/{dashcard-id}/card/{card-id}/query",
          {
            body,
            pathParams: {
              "card-id": cardId,
              "dashboard-id": dashboardId,
              "dashcard-id": dashcardId
            },
            signal: requestOptions?.signal
          }
        );
      },
      queryCardExport(dashboardId, dashcardId, cardId, format, body = {}, requestOptions) {
        return requestAny<MetabaseJsonRow[] | string | Uint8Array | undefined, MetabaseDashboardCardQueryRequest>(
          "POST",
          "/api/dashboard/{dashboard-id}/dashcard/{dashcard-id}/card/{card-id}/query/{export-format}",
          {
            body,
            pathParams: {
              "card-id": cardId,
              "dashboard-id": dashboardId,
              "dashcard-id": dashcardId,
              "export-format": format
            },
            signal: requestOptions?.signal
          }
        );
      }
    },
    dataset: {
      query(body, requestOptions) {
        return requestAny<MetabaseQueryResult, MetabaseDatasetRequest>("POST", "/api/dataset/", {
          body,
          signal: requestOptions?.signal
        });
      },
      native(body, requestOptions) {
        return requestAny<unknown, MetabaseDatasetRequest>("POST", "/api/dataset/native", {
          body,
          signal: requestOptions?.signal
        });
      },
      queryMetadata(body, requestOptions) {
        return requestAny<JsonRecord, MetabaseDatasetRequest>("POST", "/api/dataset/query_metadata", {
          body,
          signal: requestOptions?.signal
        });
      },
      export(format, body, requestOptions) {
        return requestAny<MetabaseJsonRow[] | string | Uint8Array | undefined, MetabaseDatasetRequest | MetabaseQueryExportRequest>(
          "POST",
          "/api/dataset/{export-format}",
          {
            body,
            pathParams: { "export-format": format },
            signal: requestOptions?.signal
          }
        );
      }
    }
  } as MetabaseClient;

  return client;
}
