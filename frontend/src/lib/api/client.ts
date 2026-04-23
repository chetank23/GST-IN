const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

async function extractError(response: Response): Promise<string> {
  try {
    const json = await response.json();
    return json?.error?.message ?? `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(await extractError(response));
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T, B = unknown>(
  path: string,
  body: B,
  idempotencyKey?: string,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await extractError(response));
  }
  return response.json() as Promise<T>;
}

export async function apiPatch<T, B = unknown>(path: string, body: B): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await extractError(response));
  }
  return response.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(await extractError(response));
  }
  return response.json() as Promise<T>;
}

/** Upload a file and receive JSON response */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    body: formData, // no Content-Type header — browser sets multipart boundary
  });
  if (!response.ok) {
    throw new Error(await extractError(response));
  }
  return response.json() as Promise<T>;
}

