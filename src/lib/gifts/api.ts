import type { PublicGift, PublicGiftList, PublicGiftPurchase } from './types';

const API_URL = (import.meta.env.VITE_API_URL ?? 'https://api.simplesmentesim.com').replace(
	/\/$/,
	''
);

type Fetcher = typeof fetch;

type PublicGiftApiResponse = Omit<PublicGift, 'estimatedPrice'> & {
	estimatedPrice: number;
};

type PublicGiftListApiResponse = Omit<PublicGiftList, 'gifts'> & {
	gifts: PublicGiftApiResponse[];
};

export class GiftApiError extends Error {
	constructor(
		public status: number,
		message: string,
		public code?: string
	) {
		super(message);
		this.name = 'GiftApiError';
	}
}

function normalizeGift(gift: PublicGiftApiResponse): PublicGift {
	if (
		typeof gift?.id !== 'string' ||
		typeof gift.name !== 'string' ||
		!Number.isFinite(gift.estimatedPrice)
	) {
		throw new GiftApiError(502, 'A lista de presentes retornou dados incompletos.');
	}

	return {
		...gift,
		estimatedPrice: gift.estimatedPrice / 100,
		available: gift.available === true,
		purchased: gift.purchased === true
	};
}

async function request<T>(fetcher: Fetcher, path: string, options: RequestInit = {}) {
	let response: Response;
	try {
		response = await fetcher(`${API_URL}${path}`, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options.headers
			}
		});
	} catch {
		throw new GiftApiError(0, 'Não foi possível conectar à lista de presentes.');
	}

	if (!response.ok) {
		const body = await response.json().catch(() => null);
		const message = body?.message ?? body?.error ?? body?.detail;
		throw new GiftApiError(
			response.status,
			typeof message === 'string' ? message : `Não foi possível concluir a solicitação.`,
			body?.code
		);
	}

	return response.json() as Promise<T>;
}

export async function getPublicGiftList(slug: string, fetcher: Fetcher = fetch) {
	const response = await request<PublicGiftListApiResponse>(
		fetcher,
		`/api/public/gift-lists/${encodeURIComponent(slug)}`
	);

	if (!response.meta || !Array.isArray(response.gifts)) {
		throw new GiftApiError(502, 'A lista de presentes retornou dados incompletos.');
	}

	return {
		...response,
		gifts: response.gifts.map(normalizeGift)
	};
}

export async function purchasePublicGift(
	slug: string,
	giftId: string,
	purchase: PublicGiftPurchase,
	fetcher: Fetcher = fetch
) {
	const response = await request<PublicGiftApiResponse>(
		fetcher,
		`/api/public/gift-lists/${encodeURIComponent(slug)}/gifts/${encodeURIComponent(giftId)}/purchase`,
		{
			method: 'POST',
			body: JSON.stringify(purchase)
		}
	);
	return normalizeGift(response);
}

export function giftErrorMessage(error: unknown) {
	if (error instanceof GiftApiError) {
		if (error.status === 404) return 'Esta lista de presentes não foi encontrada.';
		if (error.status === 409) return 'Este presente acabou de ser escolhido por outra pessoa.';
		if (error.status === 429) return 'Muitas tentativas em pouco tempo. Aguarde um instante.';
		if (error.status >= 500) return 'A lista está temporariamente indisponível.';
		return error.message;
	}
	return 'Não foi possível carregar a lista de presentes.';
}
