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
    return arrayBuffer.byteLength > 0 ? new Uint8Array(arrayBuffer) : undefined;
}
export function createMetabaseClient(options) {
    const baseUrl = normalizeBaseUrl(options.baseUrl);
    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (!fetchImpl) {
        throw new Error("No fetch implementation available. Pass one explicitly in createMetabaseClient({ fetch }).");
    }
    async function requestRaw(method, path, requestOptions = {}) {
        const url = new URL(`${baseUrl}${buildPath(path, requestOptions.pathParams)}`);
        appendQuery(url, requestOptions.query);
        const headers = new Headers(requestOptions.headers);
        headers.set("x-api-key", options.apiKey);
        headers.set("accept", headers.get("accept") ?? "application/json, text/plain;q=0.9, */*;q=0.8");
        if (options.userAgent) {
            headers.set("user-agent", options.userAgent);
        }
        const body = encodeBody(requestOptions.body, headers, requestOptions.contentType);
        const init = {
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
            data: data,
            headers: response.headers,
            response,
            status: response.status,
            url: url.toString()
        };
    }
    async function request(method, path, requestOptions = {}) {
        const response = await requestRaw(method, path, requestOptions);
        return response.data;
    }
    const client = {
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
