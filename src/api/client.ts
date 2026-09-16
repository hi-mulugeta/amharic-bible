import type { paths } from "./generated";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export type ApiError = {
  status: number;
  code: string;
  message_am: string;
  message_en: string;
  request_id?: string;
};

export class ApiRequestError extends Error {
  constructor(public details: ApiError) {
    super(details.message_en || details.message_am || "Request failed");
    this.name = "ApiRequestError";
  }
  get status() {
    return this.details.status;
  }
  get messageAm() {
    return this.details.message_am;
  }
  get message_en() {
    return this.details.message_en;
  }
  get code() {
    return this.details.code;
  }
}
type Json = Record<string, unknown>;

let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}
type UnauthorizedHandler = () => Promise<string | null>;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setOnUnauthorized(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}
/**
 * Typed request helper.
 *
 * Usage:
 *   const books = await request<BookListResponse>('/api/bible/books')
 *
 * The response envelope `{ data }` is unwrapped automatically.
 * Errors are thrown as ApiRequestError with bilingual messages.
 */
export async function request<T>(
  path: string,
  init?: RequestInit & {
    query?: Record<string, string | number | boolean | undefined>;
  },
): Promise<T> {
  let url = `${BASE_URL}${path}`;
  if (init?.query) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(init.query)) {
      if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
    }
    const q = qs.toString();
    if (q) url += `?${q}`;
  }

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(init?.body ? { "Content-Type": "application/json" } : {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(init?.headers ?? {}),
  };

  const res = await fetch(url, { ...init, headers });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!res.ok) {
    // 401 → try to refresh once, then retry the original request
    if (res.status === 401 && onUnauthorized && !(init as any)?._retried) {
      const newToken = await onUnauthorized();
      if (newToken) {
        // Retry the same request with the new token
        const retryHeaders: HeadersInit = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        };
        return request<T>(path, {
          ...init,
          headers: retryHeaders,
          ...({ _retried: true } as any),
        });
      }
    }

    const errBody = (parsed ?? {}) as Json;
    const err = (errBody.error ?? {}) as Json;
    throw new ApiRequestError({
      status: res.status,
      code: (err.code as string) ?? "http_error",
      message_am: (err.message_am as string) ?? "",
      message_en: (err.message_en as string) ?? res.statusText,
      request_id: err.request_id as string | undefined,
    });
  }

  // Unwrap the { data: ... } envelope that the backend middleware adds
  // to non-paginated responses.
  //
  // Paginated responses already use `data` as their payload key alongside
  // `meta`. We must NOT unwrap those — otherwise the caller loses `meta`.
  if (
    parsed &&
    typeof parsed === "object" &&
    "data" in parsed &&
    !("meta" in parsed)
  ) {
    return (parsed as { data: T }).data;
  }

  return parsed as T;
}

/** For typed paths from the OpenAPI spec — use this in the queries layer. */
export type ApiPaths = paths;
