import { adminApi, ApiError } from './api';
import type { AuthResponse } from './types';

export type AdminSessionState =
	| 'checking'
	| 'anonymous'
	| 'authenticated'
	| 'temporary_error'
	| 'signing_out';

let currentSession: AuthResponse | null = null;
let state: AdminSessionState = 'checking';
let generation = 0;
let refreshPromise: Promise<AuthResponse | null> | null = null;
const listeners = new Set<(value: AdminSessionState) => void>();
const channel =
	typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('admin-session') : null;

function setState(next: AdminSessionState) {
	state = next;
	listeners.forEach((listener) => listener(next));
}

channel?.addEventListener('message', (event) => {
	if (event.data?.type === 'logout') clearAdminSession(false);
});

export function getAdminSession() {
	return currentSession;
}
export function getAdminSessionState() {
	return state;
}
export function subscribeAdminSession(listener: (value: AdminSessionState) => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export async function restoreAdminSession(force = false): Promise<AuthResponse | null> {
	if (currentSession && !force) {
		setState('authenticated');
		return currentSession;
	}
	if (refreshPromise) return refreshPromise;
	const requestGeneration = generation;
	setState('checking');
	refreshPromise = adminApi
		.refresh()
		.then((session) => {
			if (requestGeneration !== generation) return null;
			if (session.role !== 'ADMIN') {
				currentSession = null;
				setState('anonymous');
				return null;
			}
			currentSession = session;
			setState('authenticated');
			return session;
		})
		.catch((cause) => {
			if (requestGeneration !== generation) return null;
			if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) {
				currentSession = null;
				setState('anonymous');
			} else setState('temporary_error');
			return null;
		})
		.finally(() => {
			refreshPromise = null;
		});
	return refreshPromise;
}

export async function loginAdmin(email: string, password: string, rememberMe: boolean) {
	const requestGeneration = ++generation;
	const session = await adminApi.login(email, password, rememberMe);
	if (requestGeneration !== generation)
		throw new ApiError(409, 'Login descartado por uma operação mais recente.');
	if (session.role !== 'ADMIN')
		throw new ApiError(403, 'Esta conta não possui acesso administrativo.');
	currentSession = session;
	setState('authenticated');
	return session;
}

export async function withAdminSession<T>(operation: (token: string) => Promise<T>): Promise<T> {
	let session = currentSession ?? (await restoreAdminSession());
	if (!session) throw new ApiError(401, 'Sessão administrativa expirada.');
	const tokenUsed = session.token;
	try {
		return await operation(tokenUsed);
	} catch (cause) {
		if (!(cause instanceof ApiError) || cause.status !== 401) throw cause;
		if (currentSession && currentSession.token !== tokenUsed)
			return operation(currentSession.token);
		const refreshed = await restoreAdminSession(true);
		if (!refreshed) throw cause;
		return operation(refreshed.token);
	}
}

export async function logoutAdmin() {
	const requestGeneration = ++generation;
	const sessionBeforeLogout = currentSession;
	currentSession = null;
	setState('signing_out');
	try {
		await adminApi.logout();
		if (requestGeneration === generation) {
			setState('anonymous');
			channel?.postMessage({ type: 'logout' });
		}
		return true;
	} catch {
		if (requestGeneration === generation) {
			currentSession = sessionBeforeLogout;
			setState('temporary_error');
		}
		return false;
	}
}

export function clearAdminSession(broadcast = true) {
	++generation;
	currentSession = null;
	setState('anonymous');
	if (broadcast) channel?.postMessage({ type: 'logout' });
}
