import { adminApi, ApiError } from './api';
import type { AuthResponse } from './types';

let currentSession: AuthResponse | null = null;
let refreshPromise: Promise<AuthResponse | null> | null = null;

export function getAdminSession() {
	return currentSession;
}

export async function restoreAdminSession(force = false): Promise<AuthResponse | null> {
	if (currentSession && !force) return currentSession;
	if (!refreshPromise) {
		refreshPromise = adminApi
			.refresh()
			.then((session) => (session.role === 'ADMIN' ? (currentSession = session) : null))
			.catch(() => null)
			.finally(() => {
				refreshPromise = null;
			});
	}
	return refreshPromise;
}

export async function loginAdmin(email: string, password: string, rememberMe: boolean) {
	const session = await adminApi.login(email, password, rememberMe);
	if (session.role !== 'ADMIN')
		throw new ApiError(403, 'Esta conta não possui acesso administrativo.');
	currentSession = session;
	return session;
}

export async function withAdminSession<T>(operation: (token: string) => Promise<T>): Promise<T> {
	let session = currentSession ?? (await restoreAdminSession());
	if (!session) throw new ApiError(401, 'Sessão administrativa expirada.');
	try {
		return await operation(session.token);
	} catch (cause) {
		if (!(cause instanceof ApiError) || cause.status !== 401) throw cause;
		session = await restoreAdminSession(true);
		if (!session) {
			currentSession = null;
			throw cause;
		}
		return operation(session.token);
	}
}

export async function logoutAdmin() {
	try {
		await adminApi.logout();
		currentSession = null;
		return true;
	} catch {
		return false;
	}
}

export function clearAdminSession() {
	currentSession = null;
}
