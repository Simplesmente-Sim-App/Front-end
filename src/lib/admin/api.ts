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

function objectResponse(value: unknown, label: string): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value))
		throw new ApiError(502, `Resposta inválida recebida em ${label}.`);
	return value as Record<string, unknown>;
}

function validateAuth(value: unknown): AuthResponse {
	const body = objectResponse(value, 'autenticação');
	if (
		typeof body.token !== 'string' ||
		typeof body.userId !== 'string' ||
		typeof body.role !== 'string'
	)
		throw new ApiError(502, 'A resposta de autenticação está incompleta.');
	return value as AuthResponse;
}

function validateSummary(value: unknown): AdminUserSummary {
	const body = objectResponse(value, 'resumo de usuários');
	if (
		!['totalUsers', 'activeUsers', 'blockedUsers', 'deactivatedUsers'].every(
			(key) => typeof body[key] === 'number'
		)
	)
		throw new ApiError(502, 'O resumo de usuários não corresponde ao contrato atual.');
	return value as AdminUserSummary;
}

function validateOverview(value: unknown): OperationOverview {
	const body = objectResponse(value, 'visão geral');
	if (
		typeof body.totalEvents !== 'number' ||
		typeof body.last24HoursEvents !== 'number' ||
		typeof body.last24HoursFailures !== 'number'
	)
		throw new ApiError(502, 'A resposta da visão geral está incompleta.');
	return value as OperationOverview;
}

export const adminApi = {
	login: (email: string, password: string, rememberMe: boolean) =>
		request<unknown>('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password, rememberMe })
		}).then(validateAuth),
	refresh: () => request<unknown>('/api/auth/refresh', { method: 'POST' }).then(validateAuth),
	logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
	me: (token: string) => request<UserProfile>('/api/auth/me', {}, token),
	overview: (token: string) =>
		request<unknown>('/api/operations/overview', {}, token).then(validateOverview),
	userSummary: (token: string) =>
		request<unknown>('/api/admin/users/summary', {}, token).then(validateSummary),
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
	userDetails: (token: string, userId: string) =>
		request<import('./types').AdminUserDetails>(`/api/admin/users/${userId}`, {}, token),
	updateUserProfile: (token: string, userId: string, body: { name: string; email: string }) =>
		request<import('./types').AdminUserDetails>(
			`/api/admin/users/${userId}/profile`,
			{ method: 'PATCH', body: JSON.stringify(body) },
			token
		),
	updateUserRole: (token: string, userId: string, role: 'USER' | 'ADMIN') =>
		request<import('./types').AdminUserDetails>(
			`/api/admin/users/${userId}/role`,
			{ method: 'PATCH', body: JSON.stringify({ role }) },
			token
		),
	updateUserPlan: (
		token: string,
		userId: string,
		body: { weddingId: string; planCode: string | null }
	) =>
		request<import('./types').AdminUserDetails>(
			`/api/admin/users/${userId}/plan`,
			{ method: 'PATCH', body: JSON.stringify(body) },
			token
		),
	updateUserStatus: (token: string, userId: string, status: 'ACTIVE' | 'BLOCKED' | 'DEACTIVATED') =>
		request<import('./types').AdminUserDetails>(
			`/api/admin/users/${userId}/status`,
			{ method: 'PATCH', body: JSON.stringify({ status }) },
			token
		),
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
