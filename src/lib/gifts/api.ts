import type { PublicGift, PublicGiftList, PublicGiftPurchase, PublicGiftSummary } from './types';

const API_URL = (import.meta.env.VITE_API_URL ?? 'https://api.simplesmentesim.com').replace(
	/\/$/,
	''
);

type Fetcher = typeof fetch;

type PublicGiftApiResponse = Omit<PublicGift, 'estimatedPrice'> & {
	estimatedPrice: number;
};

type PublicGiftListApiResponse = Omit<PublicGiftList, 'gifts' | 'summary'> & {
	gifts: PublicGiftApiResponse[];
	summary?: PublicGiftSummary;
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

export function giftSummaryFromGifts(gifts: PublicGift[]): PublicGiftSummary {
	const availableCount = gifts.filter((gift) => gift.available).length;
	const purchasedCount = gifts.filter((gift) => gift.purchased).length;
	return {
		totalCount: gifts.length,
		availableCount,
		reservedCount: Math.max(0, gifts.length - availableCount - purchasedCount),
		purchasedCount
	};
}

function normalizeSummary(
	summary: PublicGiftSummary | undefined,
	gifts: PublicGift[]
): PublicGiftSummary {
	const derivedSummary = giftSummaryFromGifts(gifts);
	if (!summary) return derivedSummary;

	const counts = [
		summary.totalCount,
		summary.availableCount,
		summary.reservedCount,
		summary.purchasedCount
	];
	if (
		counts.some((count) => !Number.isSafeInteger(count) || count < 0) ||
		summary.availableCount + summary.reservedCount + summary.purchasedCount !==
			summary.totalCount ||
		Object.entries(derivedSummary).some(
			([key, count]) => summary[key as keyof PublicGiftSummary] !== count
		)
	) {
		throw new GiftApiError(502, 'A lista de presentes retornou um resumo inválido.');
	}

	return summary;
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

	const gifts = response.gifts.map(normalizeGift);
	return {
		...response,
		gifts,
		summary: normalizeSummary(response.summary, gifts)
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
