import { env } from '$env/dynamic/public';

import { defaultGiftListMeta } from './defaults';
import type { EditableGift, Gift, GiftListMeta, GiftListSnapshot, PixKeyType } from './types';

type PageResponse<T> = {
	content?: T[];
};

type BackendPixKeyType = 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM';

type BackendGiftListMeta = {
	weddingId?: string;
	coupleNames?: string | null;
	slug?: string | null;
	message?: string | null;
	pixKey?: string | null;
	pixKeyType?: BackendPixKeyType | null;
	pixHolderName?: string | null;
	pixCity?: string | null;
};

type BackendGift = {
	id: string;
	weddingId: string;
	name: string;
	description?: string | null;
	estimatedPrice?: number | null;
	category?: string | null;
	imageUrl?: string | null;
	reservedBy?: string | null;
	reserved?: boolean | null;
	purchased?: boolean | null;
	purchasedBy?: string | null;
	purchaseMessage?: string | null;
	purchasedAt?: string | null;
};

type BackendPublicGiftList = {
	meta: Omit<BackendGiftListMeta, 'weddingId'>;
	gifts: BackendPublicGift[];
};

type BackendPublicGift = Pick<
	BackendGift,
	'id' | 'name' | 'description' | 'estimatedPrice' | 'category' | 'imageUrl' | 'purchased'
> & { available: boolean };

const backendPixToWeb: Record<BackendPixKeyType, PixKeyType> = {
	CPF: 'cpf',
	EMAIL: 'email',
	PHONE: 'phone',
	RANDOM: 'random'
};

const webPixToBackend: Record<PixKeyType, BackendPixKeyType> = {
	cpf: 'CPF',
	email: 'EMAIL',
	phone: 'PHONE',
	random: 'RANDOM'
};

function apiBaseUrl() {
	const baseUrl = env.PUBLIC_BASE_API_URL ?? env.PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

	return baseUrl.replace(/\/+$/, '');
}

async function apiRequest<T>(
	path: string,
	init: RequestInit = {},
	token?: string | null
): Promise<T> {
	const normalizedPath = path.replace(/^\/+/, '');
	const headers = new Headers(init.headers);

	if (!headers.has('Content-Type') && init.body) {
		headers.set('Content-Type', 'application/json');
	}

	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	const response = await fetch(`${apiBaseUrl()}/api/${normalizedPath}`, {
		...init,
		headers
	});

	if (!response.ok) {
		let message = `Request failed with status ${response.status} on ${normalizedPath}`;

		try {
			const errorData = (await response.json()) as { message?: string; error?: string };

			if (errorData.message && errorData.message !== 'No message available') {
				message = errorData.message;
			} else if (errorData.error) {
				message = errorData.error;
			}
		} catch {
			// Keep fallback when the backend returns an empty or non-JSON body.
		}

		throw new Error(message);
	}

	if (response.status === 204) {
		return null as T;
	}

	return response.json() as Promise<T>;
}

function fromCents(value?: number | null) {
	return typeof value === 'number' ? value / 100 : 0;
}

function toCents(value: number) {
	return Math.round(value * 100);
}

function defaultSlug(value: string) {
	return (
		value
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '') || defaultGiftListMeta.slug
	);
}

function mapGift(gift: BackendGift): Gift {
	const buyerName = gift.purchasedBy ?? gift.reservedBy ?? undefined;

	return {
		id: gift.id,
		name: gift.name,
		description: gift.description ?? undefined,
		price: fromCents(gift.estimatedPrice),
		category: gift.category ?? undefined,
		imageUrl: gift.imageUrl ?? undefined,
		unavailable: Boolean(gift.purchased || gift.reserved),
		reservation:
			!gift.purchased && gift.reserved
				? {
						buyerName: gift.reservedBy ?? undefined,
						message: gift.purchaseMessage ?? undefined
					}
				: undefined,
		purchase: gift.purchased
			? {
					buyerName,
					message: gift.purchaseMessage ?? undefined,
					purchasedAt: gift.purchasedAt ?? undefined
				}
			: undefined
	};
}

function mapPublicGift(gift: BackendPublicGift): Gift {
	return {
		id: gift.id,
		name: gift.name,
		description: gift.description ?? undefined,
		price: fromCents(gift.estimatedPrice),
		category: gift.category ?? undefined,
		imageUrl: gift.imageUrl ?? undefined,
		unavailable: !gift.available,
		purchase: gift.purchased ? {} : undefined
	};
}

function mapMeta(meta: BackendGiftListMeta): GiftListMeta {
	const coupleNames = meta.coupleNames ?? defaultGiftListMeta.coupleNames;

	return {
		coupleNames,
		slug: meta.slug ?? defaultSlug(coupleNames),
		message: meta.message ?? defaultGiftListMeta.message,
		pixKey: meta.pixKey ?? '',
		pixKeyType: meta.pixKeyType ? backendPixToWeb[meta.pixKeyType] : defaultGiftListMeta.pixKeyType,
		pixHolderName: meta.pixHolderName ?? coupleNames,
		pixCity: meta.pixCity ?? ''
	};
}

function giftPayload(gift: EditableGift) {
	return {
		name: gift.name,
		description: gift.description ?? null,
		estimatedPrice: toCents(gift.price),
		category: gift.category ?? null,
		imageUrl: gift.imageUrl ?? null,
		linkUrl: null,
		pix: null
	};
}

export function normalizeGiftListSlug(value: string) {
	return defaultSlug(value);
}

export async function fetchPrivateGiftList(
	weddingId: string,
	token: string
): Promise<GiftListSnapshot> {
	const [meta, giftsPage] = await Promise.all([
		apiRequest<BackendGiftListMeta>(`weddings/${weddingId}/gift-list`, undefined, token),
		apiRequest<PageResponse<BackendGift>>(`weddings/${weddingId}/gifts?size=100`, undefined, token)
	]);

	return {
		weddingId,
		meta: mapMeta(meta),
		gifts: (giftsPage.content ?? []).map(mapGift),
		configured: Boolean(
			meta.slug?.trim() &&
			meta.pixKey?.trim() &&
			meta.pixKeyType &&
			meta.pixHolderName?.trim() &&
			meta.pixCity?.trim()
		)
	};
}

export async function saveGiftListSettings(weddingId: string, meta: GiftListMeta, token: string) {
	const response = await apiRequest<BackendGiftListMeta>(
		`weddings/${weddingId}/gift-list`,
		{
			method: 'PUT',
			body: JSON.stringify({
				slug: normalizeGiftListSlug(meta.slug),
				message: meta.message,
				pixKey: meta.pixKey,
				pixKeyType: webPixToBackend[meta.pixKeyType],
				pixHolderName: meta.pixHolderName,
				pixCity: meta.pixCity.toUpperCase()
			})
		},
		token
	);

	return mapMeta(response);
}

export async function createGift(weddingId: string, gift: EditableGift, token: string) {
	const response = await apiRequest<BackendGift>(
		`weddings/${weddingId}/gifts`,
		{
			method: 'POST',
			body: JSON.stringify(giftPayload(gift))
		},
		token
	);

	return mapGift(response);
}

export async function updateGift(id: string, gift: EditableGift, token: string) {
	const response = await apiRequest<BackendGift>(
		`gifts/${id}`,
		{
			method: 'PUT',
			body: JSON.stringify(giftPayload(gift))
		},
		token
	);

	return mapGift(response);
}

export async function updateGiftPurchased(
	id: string,
	purchased: boolean,
	token: string,
	purchasedBy = 'Casal',
	purchaseMessage?: string
) {
	const response = await apiRequest<BackendGift>(
		`gifts/${id}/purchased`,
		{
			method: 'PATCH',
			body: JSON.stringify({
				purchased,
				purchasedBy: purchased ? purchasedBy : null,
				purchaseMessage: purchased ? (purchaseMessage ?? null) : null
			})
		},
		token
	);

	return mapGift(response);
}

export async function releaseGiftReservation(id: string, token: string) {
	await apiRequest(`gifts/${id}/reservation`, { method: 'DELETE' }, token);
}

export async function deleteGift(id: string, token: string) {
	await apiRequest(`gifts/${id}`, { method: 'DELETE' }, token);
}

export async function fetchPublicGiftList(slug: string) {
	const response = await apiRequest<BackendPublicGiftList>(`public/gift-lists/${slug}`);

	return {
		meta: mapMeta(response.meta),
		gifts: response.gifts.map(mapPublicGift)
	};
}

export async function purchasePublicGift(
	slug: string,
	giftId: string,
	buyerName: string,
	idempotencyKey: string,
	message?: string
) {
	const response = await apiRequest<BackendPublicGift>(
		`public/gift-lists/${slug}/gifts/${giftId}/purchase`,
		{
			method: 'POST',
			body: JSON.stringify({
				buyerName,
				message: message ?? null,
				idempotencyKey
			})
		}
	);

	return mapPublicGift(response);
}
