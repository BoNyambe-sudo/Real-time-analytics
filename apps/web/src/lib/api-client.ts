const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000"

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SERVER_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const apiClient = {
  metrics: {
    summary: () => request<any>("/api/metrics/summary"),
    timeseries: (range: string) => request<any>(`/api/metrics/timeseries?range=${range}`),
  },
  logs: (params: URLSearchParams) => request<any>(`/api/logs?${params.toString()}`),
  alerts: {
    list: () => request<any[]>("/api/alerts"),
    acknowledge: (id: string) => request<any>(`/api/alerts/${id}/acknowledge`, { method: "PATCH", body: JSON.stringify({ id }) }),
  },
  apiKeys: {
    list: () => request<any[]>("/api/api-keys"),
    create: (data: { name: string; expiresAt?: string }) => request<any>("/api/api-keys", { method: "POST", body: JSON.stringify(data) }),
    revoke: (id: string) => request<any>(`/api/api-keys/${id}`, { method: "DELETE" }),
    regenerate: (id: string) => request<any>(`/api/api-keys/${id}/regenerate`, { method: "PATCH" }),
  },
}