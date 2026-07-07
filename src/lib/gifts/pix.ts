type PixPayloadInput = {
	pixKey: string;
	amount: number;
	merchantName: string;
	merchantCity: string;
	txid?: string;
};

const tag = (id: string, value: string) =>
	`${id}${value.length.toString().padStart(2, '0')}${value}`;

const sanitize = (value: string) =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^\w\s@.+-]/g, '')
		.trim();

function crc16(payload: string) {
	let crc = 0xffff;

	for (let i = 0; i < payload.length; i += 1) {
		crc ^= payload.charCodeAt(i) << 8;

		for (let j = 0; j < 8; j += 1) {
			crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
			crc &= 0xffff;
		}
	}

	return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildPixPayload({
	pixKey,
	amount,
	merchantName,
	merchantCity,
	txid = '***'
}: PixPayloadInput) {
	const gui = tag('00', 'br.gov.bcb.pix');
	const key = tag('01', pixKey.trim());
	const merchantAccountInfo = tag('26', gui + key);
	const cleanTxid =
		sanitize(txid)
			.replace(/[^A-Za-z0-9]/g, '')
			.slice(0, 25) || 'PRESENTE';

	const payload =
		tag('00', '01') +
		merchantAccountInfo +
		tag('52', '0000') +
		tag('53', '986') +
		tag('54', amount.toFixed(2)) +
		tag('58', 'BR') +
		tag('59', sanitize(merchantName).slice(0, 25) || 'RECEBEDOR') +
		tag('60', sanitize(merchantCity).toUpperCase().slice(0, 15) || 'BRASIL') +
		tag('62', tag('05', cleanTxid));

	const payloadWithCrcTag = `${payload}6304`;

	return `${payloadWithCrcTag}${crc16(payloadWithCrcTag)}`;
}
