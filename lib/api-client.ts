import { ApiError } from "@/lib/api-error";

const BASE_URL = "/api/v1";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const body = await res.json();

  if (!body.success) {
    throw new ApiError(body.error.code, body.error.message, res.status);
  }

  return body.data as T;
}

export function apiGet<T>(path: string) {
  return apiFetch<T>(path);
}

export function apiPost<T>(path: string, data?: unknown) {
  return apiFetch<T>(path, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiPut<T>(path: string, data?: unknown) {
  return apiFetch<T>(path, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiPatch<T>(path: string, data?: unknown) {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiDelete<T>(path: string) {
  return apiFetch<T>(path, { method: "DELETE" });
}
