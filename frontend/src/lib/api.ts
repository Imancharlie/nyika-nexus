const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "/api";
const TOKEN_KEY = "agrimika_tokens";

type Tokens = { access: string; refresh: string };

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(status: number, data: Record<string, unknown>) {
    super(extractMessage(data) || `HTTP ${status}`);
    this.status = status;
    this.data = data;
  }

  /** First error message for a given field, if the server returned one. */
  field(name: string): string | undefined {
    const value = this.data?.[name];
    if (Array.isArray(value)) return String(value[0]);
    if (typeof value === "string") return value;
    return undefined;
  }
}

function extractMessage(data: Record<string, unknown>): string {
  if (!data) return "";
  if (typeof data.detail === "string") return data.detail;
  for (const value of Object.values(data)) {
    if (Array.isArray(value) && value.length) {
      const first = value[0];
      if (typeof first === "string") return first;
      if (first && typeof first === "object") return extractMessage(first as Record<string, unknown>);
    }
    if (typeof value === "string") return value;
  }
  return "";
}

export const tokens = {
  get(): Tokens | null {
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      return raw ? (JSON.parse(raw) as Tokens) : null;
    } catch {
      return null;
    }
  },
  set(value: Tokens | null) {
    if (value) localStorage.setItem(TOKEN_KEY, JSON.stringify(value));
    else localStorage.removeItem(TOKEN_KEY);
  },
};

let refreshing: Promise<boolean> | null = null;
let onAuthLost: (() => void) | null = null;

export const setAuthLostHandler = (handler: () => void) => {
  onAuthLost = handler;
};

async function refreshTokens(): Promise<boolean> {
  const current = tokens.get();
  if (!current?.refresh) return false;
  refreshing ??= fetch(`${BASE}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: current.refresh }),
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const data = await res.json();
      tokens.set({ access: data.access, refresh: data.refresh ?? current.refresh });
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

type Options = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  params?: Record<string, string | number | boolean | undefined | null>;
};

export async function request<T = unknown>(path: string, opts: Options = {}, retry = true): Promise<T> {
  const { method = "GET", body, auth = true, params } = opts;
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null && v !== "")
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  const headers: Record<string, string> = {};
  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  const access = tokens.get()?.access;
  if (auth && access) headers.Authorization = `Bearer ${access}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}${query}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, { detail: "network" });
  }

  if (res.status === 401 && auth && retry && tokens.get()?.refresh) {
    if (await refreshTokens()) return request<T>(path, opts, false);
    tokens.set(null);
    onAuthLost?.();
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text.slice(0, 200) };
  }
  if (!res.ok) throw new ApiError(res.status, data as Record<string, unknown>);
  return data as T;
}

export const api = {
  get: <T>(path: string, params?: Options["params"]) => request<T>(path, { params }),
  post: <T>(path: string, body?: unknown, auth = true) => request<T>(path, { method: "POST", body, auth }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/** DRF returns either a plain list or {results: [...]} when paginated. */
export const asList = <T>(data: T[] | { results: T[] }): T[] => (Array.isArray(data) ? data : data.results);

export const formatTsh = (amount: number) => `TSh ${Math.round(amount).toLocaleString("en-US")}`;

export const normalizePhone = (value: string): string | null => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("255")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return /^[67]\d{8}$/.test(digits) ? `+255${digits}` : null;
};

export const prettyPhone = (phone: string) => {
  const local = phone.replace(/^\+255/, "");
  return `+255 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
};
