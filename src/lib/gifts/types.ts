export type PixKeyType = 'CPF' | 'EMAIL' | 'PHONE' | 'RANDOM';

export type PublicGift = {
	available: boolean;
	category?: string | null;
	description?: string | null;
	estimatedPrice: number;
	id: string;
	imageUrl?: string | null;
	name: string;
	purchased: boolean;
};

export type PublicGiftListMeta = {
	coupleNames: string;
	message?: string | null;
	pixCity?: string | null;
	pixHolderName?: string | null;
	pixKey?: string | null;
	pixKeyType?: PixKeyType | null;
	slug: string;
};

export type PublicGiftSummary = {
	availableCount: number;
	purchasedCount: number;
	reservedCount: number;
	totalCount: number;
};

export type PublicGiftList = {
	gifts: PublicGift[];
	meta: PublicGiftListMeta;
	summary: PublicGiftSummary;
};

export type PublicGiftPurchase = {
	buyerName: string;
	idempotencyKey: string;
	message?: string;
};
