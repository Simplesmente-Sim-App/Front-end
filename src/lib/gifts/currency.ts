export const MAX_GIFT_PRICE = 9_999_999_999.99;

export function formatCurrency(value: number) {
	return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function parseCurrencyInput(value: string) {
	const normalized = value
		.replace(/[^\d,.-]/g, '')
		.replace(/\./g, '')
		.replace(',', '.');
	const parsed = Number(normalized);

	return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrencyInput(value: number) {
	if (!value) return '';

	return value.toLocaleString('pt-BR', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}
