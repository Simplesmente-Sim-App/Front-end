import { describe, expect, it, vi } from 'vitest';

import { getPublicGiftList, GiftApiError, giftErrorMessage, purchasePublicGift } from './api';

function jsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

describe('gift API', () => {
	it('normalizes gift prices from cents and encodes the public slug', async () => {
		const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
			jsonResponse({
				meta: { coupleNames: 'Ana & Ian', slug: 'ana-ian' },
				summary: { totalCount: 1, availableCount: 1, reservedCount: 0, purchasedCount: 0 },
				gifts: [
					{
						id: 'gift-1',
						name: 'Jogo de jantar',
						estimatedPrice: 25990,
						available: true,
						purchased: false
					}
				]
			})
		);

		const result = await getPublicGiftList('ana & ian', fetcher as unknown as typeof fetch);

		expect(result.gifts[0]?.estimatedPrice).toBe(259.9);
		expect(result.summary).toEqual({
			totalCount: 1,
			availableCount: 1,
			reservedCount: 0,
			purchasedCount: 0
		});
		expect(fetcher).toHaveBeenCalledOnce();
		expect(fetcher.mock.calls[0]?.[0]).toMatch(/\/api\/public\/gift-lists\/ana%20%26%20ian$/);
	});

	it('sends the purchase idempotency key and normalizes the returned gift', async () => {
		const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
			jsonResponse({
				id: 'gift-1',
				name: 'Jogo de jantar',
				estimatedPrice: 25990,
				available: false,
				purchased: true
			})
		);

		const result = await purchasePublicGift(
			'ana-ian',
			'gift-1',
			{
				buyerName: 'Convidado',
				message: 'Com carinho',
				idempotencyKey: 'purchase-12345678'
			},
			fetcher as unknown as typeof fetch
		);

		expect(result).toMatchObject({ estimatedPrice: 259.9, available: false, purchased: true });
		expect(fetcher).toHaveBeenCalledWith(
			expect.stringMatching(/\/api\/public\/gift-lists\/ana-ian\/gifts\/gift-1\/purchase$/),
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({
					buyerName: 'Convidado',
					message: 'Com carinho',
					idempotencyKey: 'purchase-12345678'
				})
			})
		);
	});

	it('derives the summary while an older backend is still being replaced', async () => {
		const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
			jsonResponse({
				meta: { coupleNames: 'Ana & Ian', slug: 'ana-ian' },
				gifts: [
					{
						id: 'gift-1',
						name: 'Jogo de jantar',
						estimatedPrice: 25990,
						available: false,
						purchased: false
					}
				]
			})
		);

		const result = await getPublicGiftList('ana-ian', fetcher as unknown as typeof fetch);

		expect(result.summary).toEqual({
			totalCount: 1,
			availableCount: 0,
			reservedCount: 1,
			purchasedCount: 0
		});
	});

	it('turns backend failures into typed, friendly errors', async () => {
		const fetcher = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
			jsonResponse({ message: 'Gift already purchased' }, 409)
		);

		const request = purchasePublicGift(
			'ana-ian',
			'gift-1',
			{ buyerName: 'Convidado', idempotencyKey: 'purchase-12345678' },
			fetcher as unknown as typeof fetch
		);

		await expect(request).rejects.toMatchObject({ status: 409 });
		expect(giftErrorMessage(new GiftApiError(409, 'Conflict'))).toBe(
			'Este presente acabou de ser escolhido por outra pessoa.'
		);
	});
});
