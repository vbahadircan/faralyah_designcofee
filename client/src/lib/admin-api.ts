/** Error from the admin API; `code` is the server's `error` field (e.g. "category_not_empty"). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(`Admin API ${status} ${code}`);
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  json?: unknown;
  form?: FormData;
  csrf?: string;
  signal?: AbortSignal;
};

/** Calls /api/admin/<path> with the session cookie. Throws ApiError on any non-2xx answer. */
export async function adminRequest(
  path: string,
  { method = 'GET', json, form, csrf, signal }: RequestOptions = {},
): Promise<unknown> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (json !== undefined) headers['Content-Type'] = 'application/json';
  if (csrf) headers['X-CSRF-Token'] = csrf;
  const response = await fetch(`/api/admin${path}`, {
    method,
    headers,
    body: form ?? (json === undefined ? undefined : JSON.stringify(json)),
    credentials: 'same-origin',
    signal,
  });
  const text = await response.text();
  const body: unknown = text ? JSON.parse(text) : undefined;
  if (!response.ok) {
    const code =
      body && typeof body === 'object' && 'error' in body ? String(body.error) : 'unknown';
    throw new ApiError(response.status, code);
  }
  return body;
}
