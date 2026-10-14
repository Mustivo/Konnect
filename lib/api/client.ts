const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

if (!configuredApiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_URL must be set in the environment.");
}

export const apiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");

type ApiRequestOptions = RequestInit & { auth?: boolean };

export async function apiRequest(path: string, options: ApiRequestOptions = {}) {
  const { auth = true, headers: requestHeaders, ...requestOptions } = options;
  const headers = new Headers(requestHeaders);
  headers.set("Accept", "application/json");
  if (requestOptions.body && !(requestOptions.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const url = `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const send = () => fetch(url, { ...requestOptions, headers, credentials: "include" });

  if (!auth || typeof window === "undefined") return send();

  const accessToken = window.localStorage.getItem("konnect-access-token");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await send();
  if (response.status !== 401 || path.includes("/auth/token/refresh/") || path.includes("/auth/login/")) return response;

  const refresh = window.localStorage.getItem("konnect-refresh-token");
  if (!refresh) return response;

  try {
    const refreshResponse = await fetch(`${apiBaseUrl}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
      credentials: "include",
    });
    const tokens = await refreshResponse.json().catch(() => null) as { access?: string; refresh?: string } | null;
    if (!refreshResponse.ok || !tokens?.access) {
      window.localStorage.removeItem("konnect-access-token");
      window.localStorage.removeItem("konnect-refresh-token");
      window.dispatchEvent(new Event("konnect-auth-expired"));
      return response;
    }

    window.localStorage.setItem("konnect-access-token", tokens.access);
    if (tokens.refresh) window.localStorage.setItem("konnect-refresh-token", tokens.refresh);
    headers.set("Authorization", `Bearer ${tokens.access}`);
    return send();
  } catch {
    return response;
  }
}

export async function apiJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(apiErrorMessage(data, `Request failed (${response.status})`), response.status, data);
  return data as T;
}

export function apiErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (!payload || typeof payload !== "object") return fallback;
  const body = payload as Record<string, unknown>;
  const detail = body.detail ?? Object.values(body)[0];
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(String).join(" ");
  if (detail && typeof detail === "object") return Object.entries(detail as Record<string, unknown>).map(([field, value]) => `${field}: ${Array.isArray(value) ? value.map(String).join(" ") : String(value)}`).join(" ");
  return fallback;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly payload: unknown) {
    super(message);
    this.name = "ApiError";
  }
}