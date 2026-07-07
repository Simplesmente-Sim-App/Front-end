<script lang="ts">
	import { Check, Copy, LoaderCircle, X } from '@lucide/svelte';

	import { formatCurrency } from '$lib/gifts/currency';
	import type { Gift, GiftListMeta } from '$lib/gifts/types';

	let { gift, meta, pixPayload, submitting, copying, onClose, onCopy, onInvalid, onConfirm } =
		$props<{
			gift: Gift;
			meta: GiftListMeta;
			pixPayload: string;
			submitting: boolean;
			copying: boolean;
			onClose: () => void;
			onCopy: (value: string) => void | Promise<void>;
			onInvalid: (message: string) => void;
			onConfirm: (buyerName: string, message?: string) => void | Promise<void>;
		}>();

	let buyerName = $state('');
	let message = $state('');

	$effect(() => {
		gift.id;
		buyerName = '';
		message = '';
	});

	function closeOnBackdrop(event: MouseEvent) {
		if (event.target === event.currentTarget) onClose();
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();

		const normalizedBuyerName = buyerName.trim();

		if (!normalizedBuyerName) {
			onInvalid('Informe seu nome para registrar o presente.');
			return;
		}

		void onConfirm(normalizedBuyerName, message.trim() || undefined);
	}
</script>

<div class="gift-modal-backdrop" role="presentation" onclick={closeOnBackdrop}>
	<div
		class="gift-modal gift-modal--payment"
		role="dialog"
		aria-modal="true"
		aria-labelledby="gift-payment-title"
	>
		<div class="gift-modal-header">
			<div>
				<p class="gift-eyebrow">Presente escolhido</p>
				<h2 id="gift-payment-title">{gift.name}</h2>
			</div>
			<button
				class="gift-icon-button"
				type="button"
				onclick={onClose}
				title="Fechar"
				aria-label="Fechar"
			>
				<X size={18} />
			</button>
		</div>

		<div class="gift-payment-summary">
			<span>Valor</span>
			<strong>{formatCurrency(gift.price)}</strong>
		</div>

		<div class="gift-pix-box">
			<div>
				<span>Chave PIX</span>
				<strong>{meta.pixKey || 'Indisponivel'}</strong>
			</div>
			<button
				class="gift-icon-button"
				type="button"
				onclick={() => void onCopy(meta.pixKey)}
				disabled={!meta.pixKey || copying}
				title="Copiar chave PIX"
				aria-label="Copiar chave PIX"
			>
				<Copy size={16} />
			</button>
		</div>

		{#if pixPayload}
			<label class="gift-field">
				<span>PIX copia e cola</span>
				<textarea readonly value={pixPayload}></textarea>
			</label>
			<button
				class="gift-button gift-button--secondary gift-button--full"
				type="button"
				onclick={() => void onCopy(pixPayload)}
				disabled={copying}
			>
				<Copy size={16} />
				Copiar PIX
			</button>
		{/if}

		<form class="gift-purchase-form" onsubmit={submit}>
			<label class="gift-field">
				<span>Seu nome</span>
				<input required maxlength="120" bind:value={buyerName} />
			</label>

			<label class="gift-field">
				<span>Mensagem</span>
				<textarea maxlength="255" bind:value={message}></textarea>
			</label>

			<div class="gift-modal-actions">
				<button
					class="gift-button gift-button--secondary"
					type="button"
					onclick={onClose}
					disabled={submitting}
				>
					Cancelar
				</button>
				<button class="gift-button gift-button--primary" type="submit" disabled={submitting}>
					{#if submitting}
						<LoaderCircle class="gift-spin" size={18} />
					{:else}
						<Check size={18} />
					{/if}
					Confirmar presente
				</button>
			</div>
		</form>
	</div>
</div>
