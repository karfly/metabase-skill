// This file is generated from dist/client.js for self-contained local skill installs.
export class MetabaseApiError extends Error {
    data;
    headers;
    method;
    status;
    statusText;
    url;
    constructor(message, options) {
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
function isBinaryBody(value) {
    return value instanceof ArrayBuffer ||
        ArrayBuffer.isView(value) ||
        value instanceof Blob ||
        value instanceof FormData ||
        value instanceof URLSearchParams;
}
function normalizeBaseUrl(baseUrl) {
    const trimmed = baseUrl.trim().replace(/\/+$/, "");
    if (!trimmed) {
        throw new Error("Metabase baseUrl must not be empty.");
    }
    return trimmed;
}
function buildPath(pathTemplate, pathParams) {
    return pathTemplate.replace(/\{([^}]+)\}/g, (_, key) => {
        const value = pathParams?.[key];
        if (value === undefined || value === null) {
            throw new Error(`Missing required path param "${key}" for ${pathTemplate}.`);
        }
        return encodeURIComponent(String(value));
    });
}
function appendQuery(url, query) {
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
function serializeQueryValue(value) {
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
        return String(value);
    }
    return JSON.stringify(value);
}
function encodeBody(body, headers, contentType) {
    if (body === undefined) {
        return undefined;
    }
    if (isBinaryBody(body)) {
        if (contentType) {
            headers.set("content-type", contentType);
        }
        return body;
    }
    if (typeof body === "string") {
        headers.set("content-type", contentType ?? "text/plain; charset=utf-8");
        return body;
    }
    headers.set("content-type", contentType ?? "application/json");
    return JSON.stringify(body);
}
async function parseResponseBody(response) {
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
export function createMetabaseClient(options) {
    const baseUrl = normalizeBaseUrl(options.baseUrl);
    const fetchImpl = options.fetch ?? globalThis.fetch;
    const apiKey = options.apiKey;
    const userAgent = options.userAgent;
    if (!fetchImpl) {
        throw new Error("No fetch implementation available. Pass one explicitly in createMetabaseClient({ fetch }).");
    }
    async function requestInternal(method, path, requestOptions = {}) {
        const url = new URL(`${baseUrl}${buildPath(path, requestOptions.pathParams)}`);
        appendQuery(url, requestOptions.query);
        const headers = new Headers(requestOptions.headers);
        headers.set("x-api-key", apiKey);
        headers.set("accept", headers.get("accept") ?? "application/json, text/plain;q=0.9, */*;q=0.8");
        if (userAgent) {
            headers.set("user-agent", userAgent);
        }
        const body = encodeBody(requestOptions.body, headers, requestOptions.contentType);
        const init = {
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
            data: data,
            headers: response.headers,
            response,
            status: response.status,
            url: url.toString()
        };
    }
    async function request(method, path, options = {}) {
        const result = await requestInternal(method.toUpperCase(), path, options);
        return result.data;
    }
    async function requestRaw(method, path, options = {}) {
        return requestInternal(method.toUpperCase(), path, options);
    }
    async function requestAny(method, path, options = {}) {
        const result = await requestInternal(method, path, options);
        return result.data;
    }
    const client = {
        apiKey: options.apiKey,
        baseUrl,
        get(path, requestOptions) {
            return requestInternal("GET", path, requestOptions).then((result) => result.data);
        },
        post(path, requestOptions) {
            return requestInternal("POST", path, requestOptions).then((result) => result.data);
        },
        put(path, requestOptions) {
            return requestInternal("PUT", path, requestOptions).then((result) => result.data);
        },
        delete(path, requestOptions) {
            return requestInternal("DELETE", path, requestOptions).then((result) => result.data);
        },
        request,
        requestRaw,
        session: {
            properties(requestOptions) {
                return requestAny("GET", "/api/session/properties", requestOptions);
            }
        },
        user: {
            current(requestOptions) {
                return requestAny("GET", "/api/user/current", requestOptions);
            }
        },
        database: {
            list(requestOptions) {
                return requestAny("GET", "/api/database/", requestOptions);
            },
            get(id, requestOptions) {
                return requestAny("GET", "/api/database/{id}", {
                    pathParams: { id },
                    query: requestOptions?.query,
                    signal: requestOptions?.signal
                });
            },
            metadata(id, query, requestOptions) {
                return requestAny("GET", "/api/database/{id}/metadata", {
                    pathParams: { id },
                    query: query,
                    signal: requestOptions?.signal
                });
            }
        },
        table: {
            list(requestOptions) {
                return requestAny("GET", "/api/table/", requestOptions);
            },
            get(id, requestOptions) {
                return requestAny("GET", "/api/table/{id}", {
                    pathParams: { id },
                    signal: requestOptions?.signal
                });
            },
            queryMetadata(id, requestOptions) {
                return requestAny("GET", "/api/table/{id}/query_metadata", {
                    pathParams: { id },
                    signal: requestOptions?.signal
                });
            },
            fks(id, requestOptions) {
                return requestAny("GET", "/api/table/{id}/fks", {
                    pathParams: { id },
                    signal: requestOptions?.signal
                });
            }
        },
        field: {
            get(id, requestOptions) {
                return requestAny("GET", "/api/field/{id}", {
                    pathParams: { id },
                    signal: requestOptions?.signal
                });
            },
            summary(id, requestOptions) {
                return requestAny("GET", "/api/field/{id}/summary", {
                    pathParams: { id },
                    signal: requestOptions?.signal
                });
            },
            values(id, requestOptions) {
                return requestAny("GET", "/api/field/{id}/values", {
                    pathParams: { id },
                    signal: requestOptions?.signal
                });
            }
        },
        search: {
            list(query, requestOptions) {
                return requestAny("GET", "/api/search/", {
                    query: query,
                    signal: requestOptions?.signal
                });
            }
        },
        collection: {
            list(requestOptions) {
                return requestAny("GET", "/api/collection/", requestOptions);
            },
            get(id, requestOptions) {
                return requestAny("GET", "/api/collection/{id}", {
                    pathParams: { id },
                    signal: requestOptions?.signal
                });
            },
            items(id, query, requestOptions) {
                return requestAny("GET", "/api/collection/{id}/items", {
                    pathParams: { id },
                    query: query,
                    signal: requestOptions?.signal
                });
            }
        },
        card: {
            list(requestOptions) {
                return requestAny("GET", "/api/card/", requestOptions);
            },
            get(id, requestOptions) {
                return requestAny("GET", "/api/card/{id}", {
                    pathParams: { id },
                    query: requestOptions?.query,
                    signal: requestOptions?.signal
                });
            },
            query(id, body = {}, requestOptions) {
                return requestAny("POST", "/api/card/{card-id}/query", {
                    body: {
                        ignore_cache: false,
                        ...body
                    },
                    pathParams: { "card-id": id },
                    signal: requestOptions?.signal
                });
            },
            queryJson(id, body = {}, requestOptions) {
                return requestAny("POST", "/api/card/{card-id}/query/json", {
                    body: {
                        ignore_cache: false,
                        ...body
                    },
                    pathParams: { "card-id": id },
                    signal: requestOptions?.signal
                });
            },
            queryExport(id, format, body = {}, requestOptions) {
                return requestAny("POST", "/api/card/{card-id}/query/{export-format}", {
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
                return requestAny("GET", "/api/dashboard/", requestOptions);
            },
            get(id, requestOptions) {
                return requestAny("GET", "/api/dashboard/{id}", {
                    pathParams: { id },
                    signal: requestOptions?.signal
                });
            },
            queryCard(dashboardId, dashcardId, cardId, body = {}, requestOptions) {
                return requestAny("POST", "/api/dashboard/{dashboard-id}/dashcard/{dashcard-id}/card/{card-id}/query", {
                    body,
                    pathParams: {
                        "card-id": cardId,
                        "dashboard-id": dashboardId,
                        "dashcard-id": dashcardId
                    },
                    signal: requestOptions?.signal
                });
            },
            queryCardExport(dashboardId, dashcardId, cardId, format, body = {}, requestOptions) {
                return requestAny("POST", "/api/dashboard/{dashboard-id}/dashcard/{dashcard-id}/card/{card-id}/query/{export-format}", {
                    body,
                    pathParams: {
                        "card-id": cardId,
                        "dashboard-id": dashboardId,
                        "dashcard-id": dashcardId,
                        "export-format": format
                    },
                    signal: requestOptions?.signal
                });
            }
        },
        dataset: {
            query(body, requestOptions) {
                return requestAny("POST", "/api/dataset/", {
                    body,
                    signal: requestOptions?.signal
                });
            },
            native(body, requestOptions) {
                return requestAny("POST", "/api/dataset/native", {
                    body,
                    signal: requestOptions?.signal
                });
            },
            queryMetadata(body, requestOptions) {
                return requestAny("POST", "/api/dataset/query_metadata", {
                    body,
                    signal: requestOptions?.signal
                });
            },
            export(format, body, requestOptions) {
                return requestAny("POST", "/api/dataset/{export-format}", {
                    body,
                    pathParams: { "export-format": format },
                    signal: requestOptions?.signal
                });
            }
        }
    };
    return client;
}
