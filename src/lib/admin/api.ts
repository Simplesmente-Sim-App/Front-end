import type { AuthResponse, OperationOverview, Page, Supplier, SupplierCategory, SupplierStatus, UserProfile } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'https://api.simplesmentesim.com';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.message ?? `Erro ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const adminApi = {
  login: (email: string, password: string) => request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: (token: string) => request<UserProfile>('/api/auth/me', {}, token),
  overview: (token: string) => request<OperationOverview>('/api/operations/overview', {}, token),
  suppliers: (token: string, params: { query?: string; category?: SupplierCategory; status?: SupplierStatus; page?: number; size?: number } = {}) => {
    const search = new URLSearchParams({ page: String(params.page ?? 0), size: String(params.size ?? 8) });
    if (params.query) search.set('query', params.query);
    if (params.category) search.set('category', params.category);
    if (params.status) search.set('status', params.status);
    return request<Page<Supplier>>(`/api/admin/suppliers?${search}`, {}, token);
  }
};
