export type PixKeyType = 'cpf' | 'email' | 'phone' | 'random';

export type GiftPurchase = {
	buyerName?: string;
	message?: string;
	purchasedAt?: string;
};

export type GiftReservation = {
	buyerName?: string;
	message?: string;
};

export type Gift = {
	id: string;
	name: string;
	description?: string;
	price: number;
	imageUrl?: string;
	category?: string;
	unavailable: boolean;
	reservation?: GiftReservation;
	purchase?: GiftPurchase;
};

export type GiftListMeta = {
	coupleNames: string;
	slug: string;
	message: string;
	pixKey: string;
	pixKeyType: PixKeyType;
	pixHolderName: string;
	pixCity: string;
};

export type EditableGift = Omit<Gift, 'id' | 'unavailable' | 'reservation' | 'purchase'>;

export type GiftListSnapshot = {
	weddingId: string;
	meta: GiftListMeta;
	gifts: Gift[];
	configured: boolean;
};
