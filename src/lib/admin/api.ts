import type {
	AdminUser,
	AdminUserSummary,
	AuthResponse,
	OperationOverview,
	Page,
	Supplier,
	SupplierCategory,
	SupplierStatus,
	UserProfile
} from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'https://api.simplesmentesim.com';

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
		public code?: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
	const response = await fetch(`${API_URL}${path}`, {
		...options,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...options.headers
		}
	});
	if (!response.ok) {
		const body = await response.json().catch(() => null);
		const message = body?.message ?? body?.error ?? body?.detail;
		throw new ApiError(
			response.status,
			typeof message === 'string' ? message : `Erro ${response.status}`,
			body?.code
		);
	}
	if (response.status === 204) return undefined as T;
	return response.json() as Promise<T>;
}

export const adminApi = {
	login: (email: string, password: string, rememberMe: boolean) =>
		request<AuthResponse>('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password, rememberMe })
		}),
	refresh: () => request<AuthResponse>('/api/auth/refresh', { method: 'POST' }),
	logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
	me: (token: string) => request<UserProfile>('/api/auth/me', {}, token),
	overview: (token: string) => request<OperationOverview>('/api/operations/overview', {}, token),
	userSummary: (token: string) => request<AdminUserSummary>('/api/admin/users/summary', {}, token),
	users: (
		token: string,
		params: {
			query?: string;
			role?: 'USER' | 'ADMIN';
			planCode?: string;
			page?: number;
			size?: number;
		} = {}
	) => {
		const search = new URLSearchParams({
			page: String(params.page ?? 0),
			size: String(params.size ?? 8),
			sort: 'createdAt,desc'
		});
		if (params.query) search.set('query', params.query);
		if (params.role) search.set('role', params.role);
		if (params.planCode) search.set('planCode', params.planCode);
		return request<Page<AdminUser>>(`/api/admin/users?${search}`, {}, token);
	},
	suppliers: (
		token: string,
		params: {
			query?: string;
			category?: SupplierCategory;
			status?: SupplierStatus;
			page?: number;
			size?: number;
		} = {}
	) => {
		const search = new URLSearchParams({
			page: String(params.page ?? 0),
			size: String(params.size ?? 8)
		});
		if (params.query) search.set('query', params.query);
		if (params.category) search.set('category', params.category);
		if (params.status) search.set('status', params.status);
		return request<Page<Supplier>>(`/api/admin/suppliers?${search}`, {}, token);
	}
};
