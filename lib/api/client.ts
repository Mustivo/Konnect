const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "https://konnect-k0x2.onrender.com";

function normalizeApiBaseUrl(rawUrl: string) {
  const parsed = new URL(rawUrl);
  const sanitizedPath = parsed.pathname
    .replace(/\/(swagger|api\/docs|docs|api)\/?.*$/i, "")
    .replace(/\/+$/, "");
  parsed.pathname = sanitizedPath || "/";
  parsed.search = "";
  parsed.hash = "";
  return `${parsed.origin}${parsed.pathname === "/" ? "" : parsed.pathname}`;
}

export const apiBaseUrl = normalizeApiBaseUrl(configuredApiBaseUrl);

type ApiRequestOptions = RequestInit & { auth?: boolean; fallbackPaths?: string[] };

export async function apiRequest(path: string, options: ApiRequestOptions = {}) {
  const { auth = true, headers: requestHeaders, fallbackPaths = [], ...requestOptions } = options;
  const candidatePaths = Array.from(new Set([path, ...fallbackPaths.filter((candidatePath) => candidatePath && candidatePath !== path)]));
  let lastResponse: Response | null = null;

  for (const candidatePath of candidatePaths) {
    const headers = new Headers(requestHeaders);
    headers.set("Accept", "application/json");
    if (requestOptions.body && !(requestOptions.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const url = typeof window !== "undefined"
      ? (candidatePath.startsWith("/") ? candidatePath : `/${candidatePath}`)
      : `${apiBaseUrl}${candidatePath.startsWith("/") ? candidatePath : `/${candidatePath}`}`;
    const send = () => fetch(url, { ...requestOptions, headers, credentials: "include" });

    if (!auth || typeof window === "undefined") {
      const response = await send();
      if (response.status !== 404 && response.status !== 405) return response;
      lastResponse = response;
      continue;
    }

    if (window.sessionStorage.getItem("konnect-auth-session-invalidated") === "1") {
      return new Response(JSON.stringify({ detail: "This browser tab was signed out because another account became active." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const accessToken = window.localStorage.getItem("konnect-access-token");
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    const response = await send();
    if (response.status === 404 || response.status === 405) {
      lastResponse = response;
      continue;
    }
    if (response.status !== 404 && response.status !== 405) {
      if (response.status !== 401 || candidatePath.includes("/auth/token/refresh/") || candidatePath.includes("/auth/token/") || candidatePath.includes("/auth/login/") || candidatePath.includes("/api/token/") || candidatePath.includes("/api/token/refresh/")) {
        return response;
      }
      lastResponse = response;
    } else {
      lastResponse = response;
    }

    const refresh = window.localStorage.getItem("konnect-refresh-token");
    if (!refresh) return response;

    try {
      const refreshUrl = typeof window !== "undefined"
        ? "/api/auth/token/refresh/"
        : `${apiBaseUrl}/api/auth/token/refresh/`;
      let refreshResponse = await fetch(refreshUrl, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
        credentials: "include",
      });
      if (refreshResponse.status === 404) {
        const fallbackRefreshUrl = typeof window !== "undefined"
          ? "/api/token/refresh/"
          : `${apiBaseUrl}/api/token/refresh/`;
        refreshResponse = await fetch(fallbackRefreshUrl, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
          credentials: "include",
        });
      }
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

  return lastResponse ?? new Response(null, { status: 500 });
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
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail)) return body.detail.map(String).join(" ");

  const messages: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (key === "detail") continue;
    const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    if (Array.isArray(value)) {
      messages.push(`${label}: ${value.map(String).join(" ")}`);
    } else if (typeof value === "string") {
      messages.push(`${label}: ${value}`);
    } else if (value && typeof value === "object") {
      messages.push(`${label}: ${JSON.stringify(value)}`);
    }
  }
  if (messages.length > 0) return messages.join(" · ");
  return fallback;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly payload: unknown) {
    super(message);
    this.name = "ApiError";
  }
}
